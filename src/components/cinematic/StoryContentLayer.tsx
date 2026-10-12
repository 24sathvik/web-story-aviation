"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { STORY_SCENES } from "@/lib/story-scenes";
import { StoryScene } from "@/lib/story-types";
import { useCameraProgress } from "@/hooks/useCameraProgress";
import { revealLines, applyClipPathReveal, subtleScaleAndFade } from "@/lib/motion/typography";
import { EASE_LUXURY } from "@/lib/motion/easing";

export function StoryContentLayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { subscribe } = useCameraProgress();

  useEffect(() => {
    if (!containerRef.current) return;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Pre-cache DOM element references to avoid repetitive DOM queries on every scroll tick
    const sceneElements = new Map<string, {
      sceneEl: HTMLElement;
      headingLines: HTMLElement[];
      eyebrow: HTMLElement | null;
      metaElements: HTMLElement[];
      maskContainer: HTMLElement | null;
    }>();

    STORY_SCENES.forEach((scene) => {
      const sceneEl = document.getElementById(`scene-${scene.id}`);
      if (sceneEl) {
        sceneElements.set(scene.id, {
          sceneEl,
          headingLines: Array.from(sceneEl.querySelectorAll<HTMLElement>('.cinematic-line')),
          eyebrow: sceneEl.querySelector('.cinematic-eyebrow') as HTMLElement | null,
          metaElements: Array.from(sceneEl.querySelectorAll<HTMLElement>('.cinematic-meta')),
          maskContainer: sceneEl.querySelector('.cinematic-mask') as HTMLElement | null,
        });
      }
    });

    const unsubscribe = subscribe((globalProgress) => {
      const currentFrame = globalProgress * 239 + 1;

      STORY_SCENES.forEach((scene) => {
        const cached = sceneElements.get(scene.id);
        if (!cached) return;
        const { sceneEl, headingLines, eyebrow, metaElements, maskContainer } = cached;

        const { enter, holdStart, holdEnd, exit } = scene.choreography;

        if (currentFrame < enter || currentFrame > exit) {
          gsap.set(sceneEl, { opacity: 0, pointerEvents: "none" });
          return;
        }

        gsap.set(sceneEl, { pointerEvents: "auto" });

        // Calculate normalized progress within the scene
        let progress = 0;
        let opacity = 1;

        if (currentFrame >= enter && currentFrame <= holdStart) {
          progress = (currentFrame - enter) / Math.max(1, holdStart - enter);
          opacity = progress;
        } else if (currentFrame > holdStart && currentFrame < holdEnd) {
          progress = 1;
          opacity = 1;
        } else if (currentFrame >= holdEnd && currentFrame <= exit) {
          progress = 1;
          opacity = 1 - ((currentFrame - holdEnd) / Math.max(1, exit - holdEnd));
        }

        // Apply base opacity to the scene container
        gsap.set(sceneEl, { opacity: reducedMotion ? opacity : 1 });

        if (!reducedMotion) {
          if (headingLines.length > 0) {
            revealLines(headingLines, opacity);
          }

          if (eyebrow) {
            subtleScaleAndFade(eyebrow, opacity, 0.98);
          }

          if (metaElements.length > 0) {
            metaElements.forEach(el => subtleScaleAndFade(el, opacity, 0.98));
          }

          if (scene.id === "scene_03_entrance" && maskContainer) {
            applyClipPathReveal(maskContainer, opacity);
          }
          
          // Camera-synchronized typography during the HOLD phase
          const sceneDuration = Math.max(1, exit - enter);
          const sceneP = gsap.utils.clamp(0, 1, (currentFrame - enter) / sceneDuration);

          let camScale = 1;
          let camY = 0;
          let camX = 0;

          switch (scene.id) {
             case "scene_01_aircraft":
               camY = sceneP * 8; // Counter-shift down as camera flies over water
               break;
             case "scene_02_campus":
               camScale = 1 + (sceneP * 0.04);
               break;
             case "scene_03_entrance":
               camScale = 1 + (sceneP * 0.03);
               camY = sceneP * -4; // drift up slightly
               break;
             case "scene_04_interior":
               camX = sceneP * -10; // Pan counter-shift
               break;
             case "scene_05_training":
               camScale = 1 + (sceneP * 0.03);
               break;
             case "scene_06_simulator":
               camScale = 1 + (sceneP * 0.05); // Hard push in
               break;
             case "scene_07_cockpit":
               camY = sceneP * -8;
               camX = sceneP * -6;
               break;
             case "scene_08_return":
               camScale = 1 - (sceneP * 0.04);
               break;
             case "scene_09_finale":
               camScale = 1 - (sceneP * 0.03);
               break;
             case "scene_10_aerial":
               camScale = 1 + (sceneP * 0.01);
               break;
          }

          const container = sceneEl.querySelector('.cinematic-group') as HTMLElement;
          if (container) {
             gsap.set(container, {
                scale: camScale,
                x: camX,
                y: camY,
             });
          }
        }
      });
    });

    return unsubscribe;
  }, [subscribe]);

  // Magnetic button logic
  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isMobile || reducedMotion) return;

    const btns = document.querySelectorAll('[data-magnetic]');
    btns.forEach(btn => {
      const el = btn as HTMLElement;
      
      const onMouseMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        
        // max 10px move
        const moveX = gsap.utils.clamp(-10, 10, deltaX * 0.1);
        const moveY = gsap.utils.clamp(-10, 10, deltaY * 0.1);

        gsap.to(el, { x: moveX, y: moveY, scale: 1.03, duration: 0.3, ease: EASE_LUXURY });
      };
      
      const onMouseLeave = () => {
        gsap.to(el, { x: 0, y: 0, scale: 1, duration: 0.5, ease: "elastic.out(1, 0.3)" });
      };

      el.addEventListener('mousemove', onMouseMove);
      el.addEventListener('mouseleave', onMouseLeave);

      return () => {
        el.removeEventListener('mousemove', onMouseMove);
        el.removeEventListener('mouseleave', onMouseLeave);
      };
    });
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full z-30 pointer-events-none">
      {STORY_SCENES.map((scene) => (
        <SceneContent key={scene.id} scene={scene} />
      ))}
    </div>
  );
}

function SceneContent({ scene }: { scene: StoryScene }) {
  const getSafeZoneClass = () => {
    switch (scene.safeZone) {
      case "left": return "items-start text-left pl-[5vw] lg:pl-[10vw]";
      case "lower-left": return "items-start text-left pl-[5vw] lg:pl-[10vw] pt-[20vh]";
      case "right": return "items-end text-right pr-[5vw] lg:pr-[10vw]";
      case "center": return "items-center text-center";
      default: return "items-center text-center";
    }
  };

  const isEntrance = scene.id === "scene_03_entrance";
  const isTechnical = scene.layout === "technical";

  return (
    <div 
      id={`scene-${scene.id}`} 
      className={`absolute inset-0 w-full h-full flex flex-col justify-center opacity-0 ${getSafeZoneClass()}`}
    >
      <div className={`cinematic-group flex flex-col gap-4 max-w-4xl ${isEntrance ? 'cinematic-mask' : ''}`}>
        
        {scene.content.eyebrow && (
          <div className="cinematic-eyebrow text-xs md:text-sm font-mono tracking-[0.2em] text-[var(--color-grey-cool)]">
            {scene.content.eyebrow}
          </div>
        )}

        <h2 className="font-sans text-[clamp(40px,8vw,80px)] leading-[1] font-medium tracking-tight text-white whitespace-pre-line">
          {scene.content.heading.split('\n').map((line, i) => (
            <div key={i} className="overflow-hidden">
              <div className="cinematic-line inline-block opacity-0 translate-y-5">
                {line}
              </div>
            </div>
          ))}
        </h2>

        {scene.content.supporting && (
          <div className="cinematic-line mt-4 text-sm md:text-lg text-white/70 max-w-lg leading-relaxed whitespace-pre-line">
            {scene.content.supporting}
          </div>
        )}

        {scene.content.metadata && (
          <div className={`cinematic-meta flex gap-6 mt-8 ${scene.safeZone === 'right' ? 'justify-end' : ''}`}>
            {scene.content.metadata.map((meta, i) => (
              <div key={i} className={`flex flex-col ${isTechnical ? 'font-mono text-[10px] text-white/50 tracking-[0.1em]' : 'font-sans text-xs text-white/60 tracking-wider'}`}>
                {isTechnical && <div className="h-px w-4 bg-white/20 mb-1" />}
                {meta}
              </div>
            ))}
          </div>
        )}

        {scene.content.cta && (
          <div className="cinematic-line mt-12 flex justify-center w-full">
            <button 
              data-magnetic
              data-cursor-text="EXPLORE"
              className="group flex flex-col items-center pointer-events-auto cursor-none"
            >
              <span className="text-white font-sans text-xl md:text-2xl tracking-wider font-light">{scene.content.cta}</span>
              <div className="w-full max-w-[200px] h-px bg-white/30 my-4 group-hover:bg-white/80 transition-colors duration-500" />
              <span className="font-mono text-[10px] md:text-xs tracking-[0.25em] text-white/60 group-hover:text-white transition-colors duration-500">
                EXPLORE THE ACADEMY &rarr;
              </span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
