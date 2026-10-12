"use client";

// Maximum frames extracted from the 10-second 24fps video
export const TOTAL_FRAMES = 240;

// Cache limits - expanded for smooth bidirectional scrubbing
const FRAME_CACHE_LIMIT_DESKTOP = 240;
const FRAME_CACHE_LIMIT_MOBILE = 80;

export class FrameLoader {
  private cache = new Map<number, ImageBitmap>();
  private inFlight = new Map<number, { promise: Promise<void>, abortController: AbortController }>();
  
  private queue: number[] = [];
  private failed = new Set<number>();
  
  private currentPriorityFrame = 1;
  private scrollDirection: 'forward' | 'backward' = 'forward';
  private isProcessing = false;
  
  private cacheLimit: number;

  // Debug stats
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0
  };
  
  public onFrameLoaded?: (index: number) => void;

  constructor() {
    this.processQueue = this.processQueue.bind(this);
    // Simple heuristic for mobile vs desktop limit
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    this.cacheLimit = isMobile ? FRAME_CACHE_LIMIT_MOBILE : FRAME_CACHE_LIMIT_DESKTOP;
  }

  public getFrame(index: number): ImageBitmap | undefined {
    return this.cache.get(index);
  }

  public hasFrame(index: number): boolean {
    return this.cache.has(index);
  }

  // Find the nearest cached frame to the requested index (bidirectional search)
  public getNearestCachedFrame(targetIndex: number): { index: number, bitmap: ImageBitmap } | null {
    if (this.cache.has(targetIndex)) {
      return { index: targetIndex, bitmap: this.cache.get(targetIndex)! };
    }

    let offset = 1;
    while (offset <= TOTAL_FRAMES) {
      const down = targetIndex - offset;
      const up = targetIndex + offset;
      
      if (down >= 1 && this.cache.has(down)) {
        return { index: down, bitmap: this.cache.get(down)! };
      }
      if (up <= TOTAL_FRAMES && this.cache.has(up)) {
        return { index: up, bitmap: this.cache.get(up)! };
      }
      
      offset++;
    }
    
    return null;
  }

  // Update priority based on scroll position
  public updatePriority(targetIndex: number) {
    if (this.currentPriorityFrame === targetIndex) return;
    
    if (targetIndex > this.currentPriorityFrame) {
      this.scrollDirection = 'forward';
    } else if (targetIndex < this.currentPriorityFrame) {
      this.scrollDirection = 'backward';
    }
    
    this.currentPriorityFrame = targetIndex;
    
    // Cancel in-flight requests that are too far from the new target (e.g. random jumps)
    for (const [index, data] of this.inFlight.entries()) {
      if (Math.abs(index - targetIndex) > 50) {
        data.abortController.abort();
        this.inFlight.delete(index);
      }
    }
    
    // Rebuild the queue based on the new priority
    this.rebuildQueue();
    
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  // Start the initial load (Stage A + Background)
  public initialize() {
    this.rebuildQueue();
    this.processQueue();
  }

  public getStats() {
    return {
      cached: this.cache.size,
      inFlight: this.inFlight.size,
      queued: this.queue.length,
      limit: this.cacheLimit,
      hits: this.stats.hits,
      misses: this.stats.misses,
      evictions: this.stats.evictions
    };
  }

  // Record a hit or miss (called by renderer)
  public recordHit() { this.stats.hits++; }
  public recordMiss() { this.stats.misses++; }

  private enforceCacheLimit() {
    if (this.cache.size <= this.cacheLimit) return;

    // Evict frames furthest from the current priority frame
    // We never want to evict the exact current frame, or the one right next to it
    const entries = Array.from(this.cache.keys());
    
    // Sort by distance from current priority frame (descending - furthest first)
    entries.sort((a, b) => {
      const distA = Math.abs(a - this.currentPriorityFrame);
      const distB = Math.abs(b - this.currentPriorityFrame);
      return distB - distA;
    });

    // Remove until we are under the limit
    while (this.cache.size > this.cacheLimit && entries.length > 0) {
      const targetToRemove = entries.shift()!;
      // Extra safety: Never evict the exact current frame even if limit is broken
      if (targetToRemove === this.currentPriorityFrame) continue;

      const bitmap = this.cache.get(targetToRemove);
      if (bitmap) {
        bitmap.close(); // Crucial: free GPU/CPU memory immediately
      }
      this.cache.delete(targetToRemove);
      this.stats.evictions++;
    }
  }

  private rebuildQueue() {
    const newQueue: number[] = [];
    const added = new Set<number>();
    
    const needsLoad = (i: number) => !this.cache.has(i) && !this.inFlight.has(i) && !this.failed.has(i);
    
    const add = (i: number) => {
      if (needsLoad(i) && !added.has(i)) {
        newQueue.push(i);
        added.add(i);
      }
    };
    
    const AHEAD_RADIUS = 48;
    const BEHIND_RADIUS = 24;
    
    // 1. Direction-aware priority window
    if (this.scrollDirection === 'forward') {
      for (let offset = 0; offset <= AHEAD_RADIUS; offset++) {
         const idx = this.currentPriorityFrame + offset;
         if (idx <= TOTAL_FRAMES) add(idx);
      }
      for (let offset = 1; offset <= BEHIND_RADIUS; offset++) {
         const idx = this.currentPriorityFrame - offset;
         if (idx >= 1) add(idx);
      }
    } else {
      for (let offset = 0; offset <= AHEAD_RADIUS; offset++) {
         const idx = this.currentPriorityFrame - offset;
         if (idx >= 1) add(idx);
      }
      for (let offset = 1; offset <= BEHIND_RADIUS; offset++) {
         const idx = this.currentPriorityFrame + offset;
         if (idx <= TOTAL_FRAMES) add(idx);
      }
    }

    // 2. Background load everything else ONLY if cacheLimit can hold all frames
    // This strictly prevents the thrashing eviction-refetch loop when cacheLimit < TOTAL_FRAMES
    if (this.cacheLimit >= TOTAL_FRAMES) {
      for (let i = 1; i <= TOTAL_FRAMES; i++) {
        add(i);
      }
    }

    this.queue = newQueue;
  }

  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    // Concurrency up to 6 for faster downloading and decoding
    const CONCURRENCY = 6;

    while (this.queue.length > 0) {
      // Top up the active loading pool
      while (this.inFlight.size < CONCURRENCY && this.queue.length > 0) {
        const frameIndex = this.queue.shift()!;
        
        // Double check it wasn't loaded while waiting in queue
        if (!this.cache.has(frameIndex) && !this.inFlight.has(frameIndex)) {
          const abortController = new AbortController();
          const loadPromise = this.executeLoadFrame(frameIndex, abortController.signal).finally(() => {
            this.inFlight.delete(frameIndex);
            this.enforceCacheLimit();
            
            // Recursively ensure we keep processing if queue has items
            if (!this.isProcessing && this.queue.length > 0) {
               this.processQueue();
            }
          });
          this.inFlight.set(frameIndex, { promise: loadPromise, abortController });
        }
      }
      
      // Wait a tiny bit for the microtask queue / decoders to breathe
      await new Promise(r => setTimeout(r, 10));
    }

    this.isProcessing = false;
  }

  // Deduplicated public load method (if components want to force a load)
  public async loadFrame(index: number): Promise<void> {
    if (this.cache.has(index)) return Promise.resolve();
    if (this.inFlight.has(index)) return this.inFlight.get(index)!.promise;
    
    const abortController = new AbortController();
    const promise = this.executeLoadFrame(index, abortController.signal).finally(() => {
      this.inFlight.delete(index);
      this.enforceCacheLimit();
    });
    this.inFlight.set(index, { promise, abortController });
    return promise;
  }

  private async executeLoadFrame(index: number, signal: AbortSignal): Promise<void> {
    try {
      const padded = index.toString().padStart(4, '0');
      const url = `/cinematic/frames/frame_${padded}.webp`;
      
      const response = await fetch(url, { cache: "force-cache", signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const blob = await response.blob();
      
      const bitmap = await createImageBitmap(blob);
      if (signal.aborted) {
        bitmap.close();
        return;
      }
      
      this.cache.set(index, bitmap);
      
      if (this.onFrameLoaded) {
        this.onFrameLoaded(index);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      console.warn(`Failed to load frame ${index}:`, err);
      this.failed.add(index);
    }
  }

  public destroy() {
    this.queue = [];
    this.inFlight.clear();
    for (const bitmap of this.cache.values()) {
      bitmap.close(); // Free memory
    }
    this.cache.clear();
  }
}

// Guaranteed client singleton
let _singletonInstance: FrameLoader | null = null;

export function getGlobalFrameLoader(): FrameLoader | null {
  if (typeof window === "undefined") return null;
  if (!_singletonInstance) {
    _singletonInstance = new FrameLoader();
  }
  return _singletonInstance;
}

export const globalFrameLoader = typeof window !== "undefined" ? getGlobalFrameLoader() : null;
