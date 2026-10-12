"use client";

import { useRef, useEffect } from "react";
import { gsap } from "@/lib/gsap";
import { academyInfo } from "@/data/academy";
import Image from "next/image";

export function AcademyIntroduction() {
  const containerRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // 3D Layers
  const backgroundLayerRef = useRef<HTMLDivElement>(null);
  const midLayerRef = useRef<HTMLDivElement>(null);
  const textGroupRef = useRef<HTMLDivElement>(null);
  const glassPanelRef = useRef<HTMLDivElement>(null);
  
  // Typography lines
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const line3Ref = useRef<HTMLDivElement>(null);
  const line4Ref = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current || !wrapperRef.current || !stageRef.current) return;
    
    // Create deeply spatial 3D perspective
    gsap.set(stageRef.current, { perspective: 1800 });
    gsap.set(wrapperRef.current, { transformStyle: "preserve-3d" });
    gsap.set(textGroupRef.current, { transformStyle: "preserve-3d" });
    if (glassPanelRef.current) {
      gsap.set(glassPanelRef.current, { transformStyle: "preserve-3d" });
    }
    
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top", 
          end: "bottom bottom", 
          scrub: 1, 
        }
      });

      const lines = [line1Ref.current, line2Ref.current, line3Ref.current, line4Ref.current];

      // Initial 3D camera staging
      gsap.set(backgroundLayerRef.current, { z: -800, scale: 1.15, opacity: 0.35, rotationX: 4, y: 40 });
      gsap.set(midLayerRef.current, { z: -350, scale: 0.9, opacity: 0, rotationY: -6, x: 50 });
      
      gsap.set(lines, { 
        opacity: 0, 
        z: 350,
        rotationX: 25,
        y: 80,
        scale: 1.1
      });

      gsap.set(eyebrowRef.current, { opacity: 0, y: -30, z: 100 });
      if (glassPanelRef.current) {
        gsap.set(glassPanelRef.current, { opacity: 0, z: -150, x: 80, rotationY: 8 });
      }

      // PHASE 1: Camera Flight Entry (0 -> 0.45)
      // Background tracks forward, mid layer rotates into view
      tl.to(backgroundLayerRef.current, {
        opacity: 0.45,
        z: -300,
        scale: 1.3,
        rotationX: 0,
        y: 0,
        ease: "power2.out",
        duration: 2.2
      }, 0);
      
      tl.to(midLayerRef.current, {
        opacity: 0.85,
        z: -100,
        scale: 1,
        rotationY: 0,
        x: 0,
        ease: "power2.out",
        duration: 2.2
      }, 0.2);

      // Headline lines fly into focal plane with staggered depth
      tl.to(lines, {
        opacity: 1,
        z: 0,
        rotationX: 0,
        y: 0,
        scale: 1,
        stagger: 0.12,
        ease: "power3.out",
        duration: 2.2
      }, 0.3);

      tl.to(eyebrowRef.current, {
        opacity: 1,
        y: 0,
        z: 0,
        duration: 1.4,
        ease: "power2.out"
      }, 0.5);

      if (glassPanelRef.current) {
        tl.to(glassPanelRef.current, {
          opacity: 1,
          x: 0,
          z: 0,
          rotationY: 0,
          duration: 2.0,
          ease: "power2.out"
        }, 0.8);
      }

      // PHASE 2: Subtle focal plane hold & camera sweep (0.45 -> 0.75)
      tl.to(wrapperRef.current, {
        rotationY: 2,
        z: 50,
        ease: "sine.inOut",
        duration: 1.5
      }, 2.4);

      // PHASE 3: Camera Travel Fly-Through Exit (0.75 -> 1.0)
      tl.to(lines, {
        y: -120,
        z: 150,
        opacity: 0,
        stagger: 0.05,
        ease: "power2.in",
        duration: 1.5
      }, 4.0);

      if (glassPanelRef.current) {
        tl.to(glassPanelRef.current, {
          y: -100,
          z: 80,
          opacity: 0,
          ease: "power2.in",
          duration: 1.5
        }, 4.1);
      }

      tl.to(midLayerRef.current, {
        z: 100,
        y: -150,
        opacity: 0,
        ease: "power2.in",
        duration: 1.5
      }, 4.0);

      tl.to(backgroundLayerRef.current, {
        z: 0,
        y: -100,
        opacity: 0.1,
        ease: "power2.in",
        duration: 1.5
      }, 4.0);

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={containerRef}
      className="w-full relative z-10 bg-transparent min-h-[220vh] border-t-0"
    >
      {/* Sticky Cinematic Stage locked to viewport during the 220vh travel */}
      <div 
        ref={stageRef}
        className="sticky top-0 left-0 w-full h-screen overflow-hidden flex items-center justify-center transform-gpu"
      >
        {/* Deep Horizon Background Layer - Campus Aerial Runway Perspective */}
        <div 
          ref={backgroundLayerRef}
          className="absolute inset-0 w-full h-full pointer-events-none transform-gpu will-change-transform"
        >
          <Image 
            src="/images/campus/aerial.jpg"
            alt="Aviation Academy Runway and Flight Operations"
            fill
            className="object-cover object-center opacity-45 mix-blend-screen"
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--background)]/50 to-[var(--background)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,var(--background)_85%)]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-40 bg-blue-500/10 blur-[90px] pointer-events-none" />
        </div>

        {/* Mid-Ground Architectural Perspective Frame */}
        <div 
          ref={midLayerRef}
          className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center transform-gpu will-change-transform px-6 md:px-16"
        >
          <div className="w-full max-w-6xl aspect-[21/9] border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent rounded-3xl backdrop-blur-[2px] shadow-[0_20px_60px_rgba(0,0,0,0.6)]" />
        </div>

        {/* Foreground Content Spatial Layer */}
        <div 
          ref={wrapperRef} 
          className="max-w-[1500px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center px-6 md:px-12 lg:px-20 relative transform-gpu z-20 pointer-events-auto"
        >
          {/* Kinetic 3D Headline Block */}
          <div ref={textGroupRef} className="lg:col-span-7 flex flex-col gap-5 md:gap-8 transform-gpu">
            <span 
              ref={eyebrowRef}
              className="font-mono text-[11px] tracking-[0.25em] text-white/60 inline-flex items-center gap-2 uppercase will-change-transform transform-gpu"
            >
              <span className="w-2 h-2 rounded-full bg-blue-400/80 animate-pulse" />
              {academyInfo.introduction.eyebrow} // FLIGHT STANDARDS
            </span>
            <h2 className="font-sans text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold tracking-tight text-white leading-[1.02] flex flex-col transform-gpu">
              <div ref={line1Ref} className="will-change-transform transform-gpu origin-bottom">WHERE</div>
              <div ref={line2Ref} className="will-change-transform transform-gpu origin-bottom">AVIATION</div>
              <div ref={line3Ref} className="will-change-transform transform-gpu origin-bottom">BECOMES A</div>
              <div ref={line4Ref} className="will-change-transform transform-gpu origin-bottom text-white/80">PROFESSION.</div>
            </h2>
          </div>

          {/* Refined Glassmorphism Telemetry & Standards Panel */}
          <div 
            ref={glassPanelRef}
            className="lg:col-span-5 flex flex-col gap-6 transform-gpu z-20"
          >
            <div className="bg-[#030611]/75 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="font-mono text-[10px] tracking-[0.2em] text-white/50 uppercase">Operational Doctrine</span>
                <span className="font-mono text-[10px] tracking-[0.2em] text-blue-400 font-semibold uppercase">FAA PART 141</span>
              </div>
              
              <p className="font-sans text-sm md:text-base text-white/75 leading-relaxed">
                {academyInfo.introduction.supportingText}
              </p>

              {/* Verified Credential Highlights */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3">
                  <div className="font-mono text-xs font-semibold text-white tracking-wider">LEVEL D</div>
                  <div className="font-mono text-[9px] text-white/40 uppercase tracking-widest mt-0.5">Full Flight Sim</div>
                </div>
                <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3">
                  <div className="font-mono text-xs font-semibold text-white tracking-wider">G1000 NXi</div>
                  <div className="font-mono text-[9px] text-white/40 uppercase tracking-widest mt-0.5">Glass Cockpit Standard</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
