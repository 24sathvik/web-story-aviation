"use client";

import { useRef, useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { programs } from "@/data/programs";
import Image from "next/image";
import { ScrollTerrainBackground } from "@/components/cinematic/ScrollTerrainBackground";

export function TrainingPrograms() {
  const containerRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current || !stageRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Initial State: Card 0 is centered & visible, subsequent cards are prepared below
      itemsRef.current.forEach((item, i) => {
        if (!item) return;
        gsap.set(item, {
          opacity: i === 0 ? 1 : 0,
          scale: i === 0 ? 1 : 0.92,
          y: i === 0 ? 0 : 80,
          z: i === 0 ? 0 : -80,
          pointerEvents: i === 0 ? "auto" : "none",
          transformStyle: "preserve-3d",
        });
      });

      // 2. Main ScrollTrigger pinned timeline
      const totalSteps = programs.length - 1;
      const tl = gsap.timeline({
        scrollTrigger: {
          id: "programs-pin",
          trigger: containerRef.current,
          start: "top top",
          end: `+=${totalSteps * 450}`, // 450px of smooth scroll per card
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Ambient background glow gentle drift
      tl.to(".ambient-glow", {
        rotation: 40,
        scale: 1.25,
        duration: totalSteps,
        ease: "none",
      }, 0);

      // 3. Smooth Step-by-Step Card Deck Transitions
      for (let i = 0; i < totalSteps; i++) {
        const currentItem = itemsRef.current[i];
        const nextItem = itemsRef.current[i + 1];

        // Current active card glides up and dissolves
        if (currentItem) {
          tl.to(currentItem, {
            opacity: 0,
            scale: 0.94,
            y: -70,
            z: -80,
            pointerEvents: "none",
            duration: 0.75,
            ease: "power2.inOut",
          }, i);
        }

        // Next card glides in smoothly from below to center focal plane
        if (nextItem) {
          tl.to(nextItem, {
            opacity: 1,
            scale: 1,
            y: 0,
            z: 0,
            pointerEvents: "auto",
            duration: 0.75,
            ease: "power2.inOut",
          }, i + 0.25);
        }

        // Synchronize HUD Syllabus Nav Indicator labels
        tl.to(`.program-nav-${i}`, {
          color: "rgba(255, 255, 255, 0.35)",
          duration: 0.4,
          ease: "power1.out",
        }, i);

        tl.to(`.program-nav-${i + 1}`, {
          color: "#ffffff",
          duration: 0.4,
          ease: "power1.out",
        }, i + 0.3);

        // Synchronize pulse dots
        tl.to(`.program-dot-${i}`, {
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          scale: 1,
          boxShadow: "none",
          duration: 0.4,
        }, i);

        tl.to(`.program-dot-${i + 1}`, {
          backgroundColor: "#38bdf8",
          scale: 1.25,
          boxShadow: "0 0 10px rgba(56,189,248,0.8)",
          duration: 0.4,
        }, i + 0.3);
      }
    }, containerRef);

    // Refresh ScrollTrigger to ensure accurate pin start/end measurements
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      clearTimeout(refreshTimer);
      ctx.revert();
    };
  }, []);

  // Jump to specific card on clicking syllabus navigation
  const handleNavClick = (idx: number) => {
    const st = ScrollTrigger.getById("programs-pin");
    if (st) {
      const targetScroll = st.start + (idx / (programs.length - 1)) * (st.end - st.start) + 5;
      window.scrollTo({ top: targetScroll, behavior: "smooth" });
    }
  };

  return (
    <section 
      ref={containerRef}
      className="w-full relative z-10 bg-[var(--background)] min-h-screen flex items-center overflow-hidden border-t border-white/5"
    >
      {/* 3D Scroll-Reactive Tidecrest Particle & Ridgeline Terrain Background */}
      <ScrollTerrainBackground 
        variant="programs"
        elevation={8.6}
        crestColor={0x00e5ff}
        midColor={0x2563eb}
        baseColor={0x0f172a}
        scrollDistance={42.0}
        opacity={0.92}
        pointSize={1.6}
        wireframeOpacity={0.32}
        interactive={true}
      />

      <div className="absolute inset-0 pointer-events-none transform-gpu z-0">
        <div className="ambient-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] bg-cyan-900/10 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      <div className="max-w-[1600px] mx-auto w-full px-6 md:px-12 lg:px-24 grid grid-cols-1 md:grid-cols-12 gap-12 h-full py-20 relative z-20 pointer-events-auto">
        
        {/* Left Editorial Header & Interactive Syllabus Nav */}
        <div className="col-span-1 md:col-span-5 flex flex-col gap-6 justify-center">
          <span className="font-mono text-[10px] tracking-[0.25em] text-white/50 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400/80 animate-pulse" />
            FLIGHT CURRICULUM // PART 141
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white leading-[1.08]">
            A CLEAR PATH TO<br />
            PROFESSIONAL<br />
            AVIATION.
          </h2>

          {/* Dynamic Flight Syllabus Progress Indicator & Clickable Nav */}
          <div className="hidden md:flex flex-col gap-3.5 mt-4 pt-6 border-t border-white/10">
            {programs.map((p, idx) => (
              <button 
                key={p.id} 
                onClick={() => handleNavClick(idx)}
                type="button"
                className={`program-nav-item program-nav-${idx} flex items-center gap-3 font-mono text-[11px] tracking-wider transition-colors duration-300 text-left cursor-pointer group ${idx === 0 ? 'text-white' : 'text-white/35 hover:text-white/70'}`}
              >
                <span className={`program-dot-${idx} w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === 0 ? 'bg-[#38bdf8] shadow-[0_0_10px_rgba(56,189,248,0.8)] scale-125' : 'bg-white/20'}`} />
                <span className="font-semibold">{p.id}</span>
                <span className="truncate">{p.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Stage: Smooth Focal Plane Card Deck */}
        <div className="col-span-1 md:col-span-7 relative h-[65vh] md:h-[75vh] flex items-center justify-center">
          <div 
            ref={stageRef} 
            className="relative w-full h-full max-w-[620px] mx-auto flex items-center justify-center [perspective:1800px]"
          >
            {programs.map((program, index) => (
              <a 
                key={program.id}
                ref={(el) => { itemsRef.current[index] = el; }}
                href={program.href} 
                className="group absolute inset-0 my-auto h-fit w-full max-w-[620px] mx-auto will-change-transform transform-gpu block select-none"
              >
                <div className="relative w-full rounded-2xl overflow-hidden mb-6 transform-gpu border border-white/10 group-hover:border-cyan-400/40 transition-all duration-500 bg-[#040814]/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)] group-hover:shadow-[0_25px_60px_rgba(6,182,212,0.15)]">
                  <div className="relative w-full h-[24vh] md:h-[30vh] overflow-hidden">
                    {program.image && (
                      <Image 
                        src={program.image}
                        alt={program.title}
                        fill
                        className="object-cover object-center opacity-80 group-hover:opacity-100 transition-opacity duration-700 will-change-transform scale-105 group-hover:scale-100"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#040814] via-[#040814]/40 to-transparent" />
                  </div>
                  <div className="p-6 md:p-8 flex flex-col gap-3.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] md:text-xs tracking-[0.25em] text-cyan-400 font-semibold flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        PROGRAM {program.id}
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-white/70 border border-white/15 rounded-full px-3 py-1 bg-white/[0.04] backdrop-blur-sm">
                        {program.duration}
                      </span>
                    </div>
                    <h3 className="font-sans text-2xl md:text-3xl text-white tracking-tight group-hover:text-cyan-200 transition-colors duration-300">
                      {program.title}
                    </h3>
                    <p className="font-sans text-sm md:text-base text-white/65 leading-relaxed">
                      {program.description}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
