"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const Row = ({ label, id, extraClass }: { label: string; id: string; extraClass?: string }) => (
  <div className="flex justify-between">
    <span className="text-[var(--color-grey-cool)]">{label}</span>
    <span data-debug={id} className={extraClass || "text-right max-w-[130px] truncate"}>-</span>
  </div>
);

export function DebugOverlay({ lenisStatus }: { lenisStatus: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const container = containerRef.current;
    if (!container) return;

    let ticks = 0;
    const updateDebug = () => {
      ticks++;
      if (ticks % 3 !== 0) return;

      const win = window as unknown as Record<string, unknown>;

      const set = (id: string, value: string) => {
        const el = container.querySelector(`[data-debug="${id}"]`);
        if (el) el.textContent = value;
      };

      const setClass = (id: string, value: string, className: string) => {
        const el = container.querySelector(`[data-debug="${id}"]`);
        if (el) {
          el.textContent = value;
          el.className = className;
        }
      };

      const progress = (win.__DEBUG_PROGRESS as number) || 0;
      const scrollY = (win.__DEBUG_SCROLL as number) || 0;
      const maxScroll = (win.__DEBUG_MAX_SCROLL as number) || 1;
      
      const frameTarget = (win.__DEBUG_FRAME_TARGET as number) || 0;
      const frameRendered = (win.__DEBUG_FRAME_RENDERED as number) || 0;
      const frameCount = (win.__DEBUG_FRAME_COUNT as number) || 240;
      
      const sceneId = (win.__DEBUG_SCENE_ID as string) || "-";
      const sceneProg = (win.__DEBUG_SCENE_PROGRESS as number) || 0;
      const lenisVelocity = (win.__DEBUG_LENIS_VELOCITY as number) || 0;
      
      const imgActive = (win.__DEBUG_IMG_ACTIVE as string) || "-";
      const imgProg = (win.__DEBUG_IMG_PROG as number) || 0;
      const imgZ = (win.__DEBUG_IMG_Z as number) || 0;
      const imgScale = (win.__DEBUG_IMG_SCALE as number) || 0;
      const imgOp = (win.__DEBUG_IMG_OPACITY as number) || 0;

      set("scroll-y", `${Math.round(scrollY)}`);
      set("max-scroll", `${Math.round(maxScroll)}`);
      set("global", `${progress.toFixed(4)}`);
      
      set("frame-target", `${frameTarget.toString().padStart(3, '0')}`);
      setClass("frame-rendered", 
        `${frameRendered.toString().padStart(3, '0')}`,
        frameTarget === frameRendered ? "text-green-400" : "text-yellow-400"
      );
      set("frame-count", `${frameCount}`);
      
      set("scene-id", sceneId);
      set("scene-prog", `${(sceneProg * 100).toFixed(1)}%`);
      set("lenis-velocity", `${lenisVelocity.toFixed(2)}`);

      set("img-active", imgActive);
      set("img-prog", `${(imgProg * 100).toFixed(1)}%`);
      set("img-z", `${imgZ.toFixed(1)}`);
      set("img-scale", `${imgScale.toFixed(2)}`);
      set("img-op", `${imgOp.toFixed(2)}`);
    };

    gsap.ticker.add(updateDebug);
    return () => gsap.ticker.remove(updateDebug);
  }, []);

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div ref={containerRef} className="fixed top-4 left-4 z-50 bg-black/90 text-green-400 font-mono text-[11px] p-4 rounded-lg backdrop-blur-md border border-green-500/30 flex flex-col gap-1 w-72 shadow-[0_0_20px_rgba(0,255,0,0.1)] pointer-events-none opacity-0">
      <div className="text-white border-b border-white/20 pb-2 mb-2 font-bold tracking-widest">CAMERA DEBUG</div>

      <Row label="SCROLL Y:" id="scroll-y" />
      <Row label="MAX SCROLL:" id="max-scroll" />
      <Row label="SCROLL PROGRESS:" id="global" />
      
      <div className="border-t border-white/10 my-1 pt-1" />

      <Row label="TARGET FRAME:" id="frame-target" />
      <Row label="RENDERED FRAME:" id="frame-rendered" />
      <Row label="FRAME COUNT:" id="frame-count" />

      <div className="border-t border-white/10 my-1 pt-1" />

      <div className="border-t border-white/10 my-1 pt-1" />

      <Row label="SCENE:" id="scene-id" />
      <Row label="SCENE PRG:" id="scene-prog" />
      <Row label="LENIS VELOCITY:" id="lenis-velocity" />
      
      <div className="border-t border-white/10 my-1 pt-1" />
      <div className="text-[var(--color-grey-cool)] font-bold tracking-widest my-1">IMAGE DEPTH</div>
      <Row label="ACTIVE:" id="img-active" />
      <Row label="PROGRESS:" id="img-prog" />
      <Row label="DEPTH (Z):" id="img-z" />
      <Row label="SCALE:" id="img-scale" />
      <Row label="OPACITY:" id="img-op" />
    </div>
  );
}
