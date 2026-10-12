"use client";

import { useRef, useEffect } from "react";
import { gsap } from "@/lib/gsap";
import { programs } from "@/data/programs";
import Image from "next/image";

export function TrainingPrograms() {
  const containerRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current || !wrapperRef.current) return;
    
    // Set perspective for spatial 3D effect
    gsap.set(containerRef.current, { perspective: 2000, transformStyle: "preserve-3d" });

    const ctx = gsap.context(() => {
      // Setup initial states
      itemsRef.current.forEach((item, i) => {
        if (!item) return;
        gsap.set(item, {
          opacity: i === 0 ? 1 : 0.05,
          scale: i === 0 ? 1 : 0.85,
          z: i === 0 ? 0 : -500,
          y: i === 0 ? 0 : 50,
          rotationX: i === 0 ? 0 : 5,
          transformStyle: "preserve-3d"
        });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=1800", // Calibrated cinematic scroll distance for 4 program transitions
          pin: true,
          scrub: 1,
        }
      });

      // Ambient background drift
      tl.to(".ambient-glow", {
        rotation: 30,
        scale: 1.2,
        z: -500,
        duration: programs.length,
        ease: "none"
      }, 0);

      // Animate through each program
      programs.forEach((_, index) => {
        if (index === programs.length - 1) return;

        const currentItem = itemsRef.current[index];
        const nextItem = itemsRef.current[index + 1];
        
        const yShift = -((index + 1) * (100 / programs.length));

        tl.to(wrapperRef.current, {
          yPercent: yShift,
          ease: "none",
          duration: 1
        }, index);

        if (currentItem) {
          // Camera moves INTO the current subject
          tl.to(currentItem, {
            opacity: 0,
            scale: 1.8, 
            z: 800,
            rotationX: -5,
            filter: "blur(20px)",
            ease: "power2.in",
            duration: 1
          }, index);
        }

        if (nextItem) {
          // Next subject pulls forward into the active focal plane
          tl.to(nextItem, {
            opacity: 1,
            scale: 1,
            z: 0,
            y: 0,
            rotationX: 0,
            filter: "blur(0px)",
            ease: "power2.out",
            duration: 1
          }, index);
        }

        // Synchronize HUD Syllabus Nav Indicator
        tl.to(`.program-nav-${index}`, {
          color: "rgba(255, 255, 255, 0.35)",
          duration: 0.5,
          ease: "power1.out"
        }, index);

        tl.to(`.program-nav-${index + 1}`, {
          color: "#ffffff",
          duration: 0.5,
          ease: "power1.out"
        }, index + 0.3);
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={containerRef}
      className="w-full relative z-10 bg-[var(--background)] min-h-screen flex items-center overflow-hidden border-t border-white/5"
    >
      <div className="absolute inset-0 pointer-events-none transform-gpu z-0">
        <div className="ambient-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] bg-blue-900/10 rounded-full blur-[150px] mix-blend-screen" />
      </div>
      <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-[var(--background)] via-[var(--background)]/80 to-transparent z-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/80 to-transparent z-20 pointer-events-none" />

      <div className="max-w-[1600px] mx-auto w-full px-6 md:px-12 lg:px-24 grid grid-cols-1 md:grid-cols-12 gap-12 h-full py-24">
        
        <div className="col-span-1 md:col-span-5 flex flex-col gap-6 justify-center z-20">
          <span className="font-mono text-[10px] tracking-[0.25em] text-white/50 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400/80 animate-pulse" />
            FLIGHT CURRICULUM // PART 141
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white leading-[1.08]">
            A CLEAR PATH TO<br />
            PROFESSIONAL<br />
            AVIATION.
          </h2>

          {/* Dynamic Flight Syllabus Progress Indicator */}
          <div className="hidden md:flex flex-col gap-3.5 mt-4 pt-6 border-t border-white/10">
            {programs.map((p, idx) => (
              <div 
                key={p.id} 
                className={`program-nav-item program-nav-${idx} flex items-center gap-3 font-mono text-[11px] tracking-wider transition-colors duration-300 ${idx === 0 ? 'text-white' : 'text-white/35'}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === 0 ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] scale-125' : 'bg-white/20'}`} />
                <span className="font-semibold">{p.id}</span>
                <span className="truncate">{p.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-1 md:col-span-7 relative h-[65vh] md:h-[75vh] flex items-center z-20">
          {/* Deck Wrapper holding cards smoothly aligned in the focal plane */}
          <div ref={wrapperRef} className="absolute top-0 left-0 w-full flex flex-col gap-10">
            {programs.map((program, index) => (
              <a 
                key={program.id}
                ref={(el) => { itemsRef.current[index] = el; }}
                href={program.href} 
                className="group block relative w-full max-w-[620px] mx-auto will-change-transform"
              >
                <div className="relative w-full rounded-2xl overflow-hidden mb-6 transform-gpu border border-white/10 group-hover:border-white/25 transition-all duration-500 bg-[#040814]/75 backdrop-blur-xl shadow-[0_16px_48px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <div className="relative w-full h-[24vh] md:h-[30vh] overflow-hidden">
                    {program.image && (
                      <Image 
                        src={program.image}
                        alt={program.title}
                        fill
                        className="object-cover object-center opacity-75 group-hover:opacity-100 transition-opacity duration-700 will-change-transform scale-105 group-hover:scale-100"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#040814] via-[#040814]/40 to-transparent" />
                  </div>
                  <div className="p-6 md:p-8 flex flex-col gap-3.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] md:text-xs tracking-[0.25em] text-blue-400 font-semibold">
                        PROGRAM {program.id}
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-white/70 border border-white/15 rounded-full px-3 py-1 bg-white/[0.04] backdrop-blur-sm">
                        {program.duration}
                      </span>
                    </div>
                    <h3 className="font-sans text-2xl md:text-3xl text-white tracking-tight">
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
