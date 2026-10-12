"use client";

import { useEffect, useRef, useState } from "react";
import { setCameraProgress, useCameraProgress } from "@/hooks/useCameraProgress";
import { getGlobalFrameLoader, TOTAL_FRAMES } from "@/lib/frame-loader";
import { resolveSceneProgress } from "@/hooks/useSceneProgress";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export function CinematicFrameRenderer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { subscribe } = useCameraProgress();
  const [isReady, setIsReady] = useState(() => {
    const l = getGlobalFrameLoader();
    return l?.hasFrame(1) || false;
  });
  
  // Track last rendered index to avoid redundant canvas draw calls
  const lastRenderedIndex = useRef<number>(-1);

  // Track current target index for instant frame replacement
  const currentTargetIndex = useRef<number>(1);

  useEffect(() => {
    const activeLoader = getGlobalFrameLoader();
    if (!activeLoader) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true }) || canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas internal resolution to handle DPR
    const updateCanvasSize = () => {
      // Max out DPR at 2 for performance, unless device is lower
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const w = rect.width > 0 ? rect.width : window.innerWidth;
      const h = rect.height > 0 ? rect.height : window.innerHeight;
      
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      
      // Force a redraw when resized
      lastRenderedIndex.current = -1;
    };
    
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    // Ensure loader is running
    activeLoader.initialize();

    // Preload opening frame block (1..15) for instantaneous start
    for (let f = 1; f <= 15; f++) {
      activeLoader.loadFrame(f);
    }

    const drawFrame = (bitmap: ImageBitmap) => {
      // Object-fit: cover logic
      const canvasAspect = canvas.width / canvas.height;
      const imageAspect = bitmap.width / bitmap.height;
      
      let drawWidth = canvas.width;
      let drawHeight = canvas.height;
      let offsetX = 0;
      let offsetY = 0;

      if (imageAspect > canvasAspect) {
        // Image is wider than canvas
        drawWidth = canvas.height * imageAspect;
        offsetX = (canvas.width - drawWidth) / 2;
      } else {
        // Image is taller than canvas
        drawHeight = canvas.width / imageAspect;
        offsetY = (canvas.height - drawHeight) / 2;
      }

      ctx.drawImage(bitmap, offsetX, offsetY, drawWidth, drawHeight);
    };

    // Immediately load frame 1 and draw if already cached
    activeLoader.loadFrame(1).then(() => {
      setIsReady(true);
      const f1 = activeLoader.getNearestCachedFrame(1);
      if (f1 && lastRenderedIndex.current !== 1) {
        drawFrame(f1.bitmap);
        lastRenderedIndex.current = 1;
      }
    });

    // Callback for when any frame finishes loading
    activeLoader.onFrameLoaded = (index: number) => {
      if (index === 1 || activeLoader.hasFrame(1)) {
        setIsReady(true);
      }
      
      // If newly loaded frame is our exact target or closer than what is rendered, redraw immediately!
      const target = currentTargetIndex.current;
      if (index === target || Math.abs(index - target) < Math.abs(lastRenderedIndex.current - target)) {
        const frameData = activeLoader.getNearestCachedFrame(target);
        if (frameData && frameData.index !== lastRenderedIndex.current) {
          drawFrame(frameData.bitmap);
          lastRenderedIndex.current = frameData.index;
        }
      }
    };

    let currentGlobalProgress = 0;
    const unsubscribe = subscribe((progress) => {
      currentGlobalProgress = progress;
    });

    // Create the authoritative camera ScrollTrigger
    const scrollTrigger = ScrollTrigger.create({
      trigger: canvas.closest('.cinematic-scroll-track') || canvas.parentElement,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        setCameraProgress(self.progress);
        
        if (typeof window !== 'undefined') {
          const win = window as unknown as Record<string, unknown>;
          win.__DEBUG_PROGRESS = self.progress;
          win.__DEBUG_SCROLL = window.scrollY;
          win.__DEBUG_MAX_SCROLL = document.documentElement.scrollHeight - window.innerHeight;
          win.__DEBUG_VIEWPORT = window.innerHeight;
          
          const sceneState = resolveSceneProgress(self.progress);
          win.__DEBUG_SCENE_ID = sceneState.sceneId;
          win.__DEBUG_SCENE_PROGRESS = sceneState.sceneProgress;
        }
      }
    });

    // Main render loop tied to GSAP ticker
    const renderTick = () => {
      const targetIndex = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(currentGlobalProgress * (TOTAL_FRAMES - 1)) + 1));
      
      // 1. Tell loader to prioritize this area only when target frame changes
      if (currentTargetIndex.current !== targetIndex) {
        currentTargetIndex.current = targetIndex;
        activeLoader.updatePriority(targetIndex);
      }

      // 2. Resolve frame to draw
      const frameData = activeLoader.getNearestCachedFrame(targetIndex);
      
      if (frameData) {
        // We found *some* frame. But is it the exact target?
        if (frameData.index === targetIndex) {
          activeLoader.recordHit();
        } else {
          activeLoader.recordMiss();
        }

        // Only draw if we haven't already drawn THIS exact frame
        if (lastRenderedIndex.current !== frameData.index) {
          drawFrame(frameData.bitmap);
          lastRenderedIndex.current = frameData.index;
        }
      } else {
        activeLoader.recordMiss();
      }

      // Update Debug Overlay / Global testing stats
      if (typeof window !== "undefined") {
        const win = window as unknown as Record<string, unknown>;
        win.__DEBUG_FRAME_TARGET = targetIndex;
        win.__DEBUG_FRAME_RENDERED = frameData?.index || 0;
        const stats = activeLoader.getStats();
        win.__DEBUG_FRAME_COUNT = TOTAL_FRAMES;
        win.__DEBUG_CACHE_SIZE = stats.cached;
        win.__DEBUG_LOAD_QUEUE = stats.queued;
        win.__DEBUG_IN_FLIGHT = stats.inFlight;
        win.__DEBUG_CACHE_LIMIT = stats.limit;
        win.__DEBUG_HITS = stats.hits;
        win.__DEBUG_MISSES = stats.misses;
        win.__DEBUG_EVICTIONS = stats.evictions;
      }
    };

    gsap.ticker.add(renderTick);

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      gsap.ticker.remove(renderTick);
      unsubscribe();
      scrollTrigger.kill();
    };
  }, [subscribe]);

  return (
    <>
      {/* Loading Overlay */}
      {!isReady && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-[var(--background)] text-[var(--color-white-warm)] transition-opacity duration-1000">
          <span className="font-mono text-sm tracking-widest animate-pulse uppercase">Preparing Cinematic Experience</span>
        </div>
      )}
      
      {/* Canvas Renderer */}
      <div className="absolute inset-0 w-full h-full bg-black">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full"
          style={{ opacity: isReady ? 1 : 0, transition: 'opacity 0.5s ease-in-out' }}
        />
      </div>
    </>
  );
}
