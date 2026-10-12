"use client";

// Maximum frames extracted from the 10-second 24fps video
export const TOTAL_FRAMES = 240;

// Cache limits - desktop retains all frames, mobile keeps active window + keyframes
const FRAME_CACHE_LIMIT_DESKTOP = 240;
const FRAME_CACHE_LIMIT_MOBILE = 90;

// Keyframe step: every 8th frame (31 keyframes total, ~1MB). Loaded first for instant scrub continuity anywhere.
const KEYFRAME_STEP = 8;
export const KEYFRAME_INDICES: number[] = [];
for (let i = 1; i <= TOTAL_FRAMES; i += KEYFRAME_STEP) {
  KEYFRAME_INDICES.push(i);
}
if (KEYFRAME_INDICES[KEYFRAME_INDICES.length - 1] !== TOTAL_FRAMES) {
  KEYFRAME_INDICES.push(TOTAL_FRAMES);
}
const KEYFRAME_SET = new Set(KEYFRAME_INDICES);

export class FrameLoader {
  private cache = new Map<number, ImageBitmap>();
  private inFlight = new Map<number, { promise: Promise<void>; abortController: AbortController }>();
  
  private queue: number[] = [];
  private failed = new Set<number>();
  
  private currentPriorityFrame = 1;
  private lastRebuiltFrame = 1;
  private scrollDirection: 'forward' | 'backward' = 'forward';
  
  private cacheLimit: number;
  private maxConcurrency = 6;

  // Debug stats
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0
  };
  
  public onFrameLoaded?: (index: number) => void;

  constructor() {
    this.pumpQueue = this.pumpQueue.bind(this);
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    this.cacheLimit = isMobile ? FRAME_CACHE_LIMIT_MOBILE : FRAME_CACHE_LIMIT_DESKTOP;
    this.maxConcurrency = isMobile ? 4 : 6;
  }

  public getFrame(index: number): ImageBitmap | undefined {
    return this.cache.get(index);
  }

  public hasFrame(index: number): boolean {
    return this.cache.has(index);
  }

  // Find the nearest cached frame to the requested index (bidirectional search)
  public getNearestCachedFrame(targetIndex: number): { index: number; bitmap: ImageBitmap } | null {
    if (this.cache.has(targetIndex)) {
      return { index: targetIndex, bitmap: this.cache.get(targetIndex)! };
    }

    let offset = 1;
    while (offset <= TOTAL_FRAMES) {
      const down = targetIndex - offset;
      const up = targetIndex + offset;
      
      if (this.scrollDirection === 'forward') {
        if (down >= 1 && this.cache.has(down)) {
          return { index: down, bitmap: this.cache.get(down)! };
        }
        if (up <= TOTAL_FRAMES && this.cache.has(up)) {
          return { index: up, bitmap: this.cache.get(up)! };
        }
      } else {
        if (up <= TOTAL_FRAMES && this.cache.has(up)) {
          return { index: up, bitmap: this.cache.get(up)! };
        }
        if (down >= 1 && this.cache.has(down)) {
          return { index: down, bitmap: this.cache.get(down)! };
        }
      }
      
      offset++;
    }
    
    return null;
  }

  // Update priority based on scroll position (throttled to avoid rebuilding on every 1px micro-scroll)
  public updatePriority(targetIndex: number) {
    const dir = targetIndex >= this.currentPriorityFrame ? 'forward' : 'backward';
    const directionChanged = dir !== this.scrollDirection;
    const distance = Math.abs(targetIndex - this.lastRebuiltFrame);

    this.currentPriorityFrame = targetIndex;
    this.scrollDirection = dir;

    // Only rebuild the queue if we moved by at least 2 frames or flipped direction
    if (!directionChanged && distance < 2) {
      return;
    }

    this.lastRebuiltFrame = targetIndex;

    // Cancel in-flight requests ONLY if they are far away (> 60 frames)
    for (const [index, data] of this.inFlight.entries()) {
      if (Math.abs(index - targetIndex) > 60) {
        data.abortController.abort();
        this.inFlight.delete(index);
      }
    }
    
    this.rebuildQueue();
    this.pumpQueue();
  }

  // Start the initial load: frame 1 first, keyframe grid, then forward window
  public initialize() {
    this.rebuildQueue();
    this.pumpQueue();
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

  public recordHit() { this.stats.hits++; }
  public recordMiss() { this.stats.misses++; }

  private enforceCacheLimit() {
    if (this.cache.size <= this.cacheLimit) return;

    // Evict frames furthest from the current priority frame
    // NEVER evict KEYFRAMES or frames right next to current frame
    const entries = Array.from(this.cache.keys());
    
    entries.sort((a, b) => {
      // Keyframes have infinite distance score (keep them)
      const aIsKey = KEYFRAME_SET.has(a);
      const bIsKey = KEYFRAME_SET.has(b);
      if (aIsKey && !bIsKey) return -1;
      if (!aIsKey && bIsKey) return 1;

      const distA = Math.abs(a - this.currentPriorityFrame);
      const distB = Math.abs(b - this.currentPriorityFrame);
      return distB - distA; // furthest non-keyframe first
    });

    while (this.cache.size > this.cacheLimit && entries.length > 0) {
      const targetToRemove = entries.shift()!;
      // Extra safety: Never evict keyframe or current frame
      if (KEYFRAME_SET.has(targetToRemove) || Math.abs(targetToRemove - this.currentPriorityFrame) <= 2) {
        continue;
      }

      const bitmap = this.cache.get(targetToRemove);
      if (bitmap) {
        bitmap.close();
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
      if (i >= 1 && i <= TOTAL_FRAMES && needsLoad(i) && !added.has(i)) {
        newQueue.push(i);
        added.add(i);
      }
    };

    // Priority 1: Current frame + Immediate Directional Horizon (+/- 20 frames)
    add(this.currentPriorityFrame);
    const LOOKAHEAD = 20;
    const LOOKBEHIND = 8;
    if (this.scrollDirection === 'forward') {
      for (let offset = 1; offset <= LOOKAHEAD; offset++) add(this.currentPriorityFrame + offset);
      for (let offset = 1; offset <= LOOKBEHIND; offset++) add(this.currentPriorityFrame - offset);
    } else {
      for (let offset = 1; offset <= LOOKAHEAD; offset++) add(this.currentPriorityFrame - offset);
      for (let offset = 1; offset <= LOOKBEHIND; offset++) add(this.currentPriorityFrame + offset);
    }

    // Priority 2: Keyframe Grid (covers entire 240-frame timeline so scrubbing never hits blank)
    for (const keyframe of KEYFRAME_INDICES) {
      add(keyframe);
    }

    // Priority 3: Remaining frames outwards from priority position
    for (let offset = LOOKAHEAD + 1; offset <= TOTAL_FRAMES; offset++) {
      if (this.scrollDirection === 'forward') {
        add(this.currentPriorityFrame + offset);
        add(this.currentPriorityFrame - offset);
      } else {
        add(this.currentPriorityFrame - offset);
        add(this.currentPriorityFrame + offset);
      }
    }

    this.queue = newQueue;
  }

  // Event-driven concurrency queue pump (NO busy-wait spin loops!)
  private pumpQueue() {
    while (this.inFlight.size < this.maxConcurrency && this.queue.length > 0) {
      const frameIndex = this.queue.shift()!;
      
      if (!this.cache.has(frameIndex) && !this.inFlight.has(frameIndex) && !this.failed.has(frameIndex)) {
        const abortController = new AbortController();
        const loadPromise = this.executeLoadFrame(frameIndex, abortController.signal).finally(() => {
          this.inFlight.delete(frameIndex);
          this.enforceCacheLimit();
          // Immediately pump next item from queue when a slot frees up
          this.pumpQueue();
        });
        this.inFlight.set(frameIndex, { promise: loadPromise, abortController });
      }
    }
  }

  public async loadFrame(index: number): Promise<void> {
    if (this.cache.has(index)) return Promise.resolve();
    if (this.inFlight.has(index)) return this.inFlight.get(index)!.promise;
    
    const abortController = new AbortController();
    const promise = this.executeLoadFrame(index, abortController.signal).finally(() => {
      this.inFlight.delete(index);
      this.enforceCacheLimit();
      this.pumpQueue();
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
    for (const item of this.inFlight.values()) {
      item.abortController.abort();
    }
    this.inFlight.clear();
    for (const bitmap of this.cache.values()) {
      bitmap.close();
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
