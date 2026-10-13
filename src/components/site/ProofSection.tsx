"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { trustPillars, metrics } from "@/data/trust";
import Image from "next/image";
import { ScrollTerrainBackground } from "@/components/cinematic/ScrollTerrainBackground";

export function ProofSection() {
  const containerRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Set perspective for spatial 3D effect
    gsap.set(container, { perspective: 1000 });

    const ctx = gsap.context(() => {
      // Headline spatial reveal
      if (headlineRef.current) {
        const chars = headlineRef.current.querySelectorAll('.trust-char');
        gsap.fromTo(chars, 
          { opacity: 0, z: -200, y: 50, rotationX: 20 },
          { 
            opacity: 1, z: 0, y: 0, rotationX: 0, 
            stagger: 0.05,
            scrollTrigger: { 
              trigger: headlineRef.current, 
              start: "top 80%",
              end: "bottom 50%",
              scrub: 1
            }
          }
        );
      }

      // Rows reveal timeline
      const rows = gsap.utils.toArray<HTMLElement>('.trust-row');
      const rowsContainer = containerRef.current?.querySelector('.trust-rows-container');

      if (rowsContainer && rows.length > 0) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: rowsContainer,
            start: "top 90%",
            end: "bottom 70%",
            scrub: 1
          }
        });

        rows.forEach((row, index) => {
          const num = row.querySelector('.trust-num');
          const title = row.querySelector('.trust-title');
          const desc = row.querySelector('.trust-desc');
          const rule = row.querySelector('.trust-rule');

          // Initialize states
          gsap.set(row, { opacity: 0.3, y: 50, rotationX: 10 });
          if (rule) gsap.set(rule, { scaleX: 0 });

          // Animate rule
          if (rule) {
            tl.to(rule, { scaleX: 1, ease: "none", duration: 0.5 }, index * 0.2);
          }
          
          // Animate row content
          tl.to(row, {
            opacity: 1,
            y: 0,
            rotationX: 0,
            ease: "power2.out",
            duration: 1
          }, index * 0.2);
        });
      }

      // Deep parallax on the environment background
      const bgImage = container.querySelector('.proof-bg');
      if (bgImage) {
        gsap.fromTo(bgImage, 
          { scale: 1.1, yPercent: -10, opacity: 0.1 }, 
          {
            scale: 1, yPercent: 10, opacity: 0.2,
            ease: "none",
            scrollTrigger: {
              trigger: container,
              start: "top bottom",
              end: "bottom top",
              scrub: true
            }
          }
        );
      }
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={containerRef}
      className="w-full relative z-10 bg-[var(--background)] px-6 md:px-12 lg:px-24 pt-48 pb-32 md:pb-48 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none transform-gpu z-0 opacity-15">
        <Image 
          src="/images/entrance/glass-entrance.jpg" 
          alt="Academy Entrance"
          fill
          className="proof-bg object-cover object-center will-change-transform mix-blend-screen"
        />
      </div>

      {/* 3D Scroll-Reactive Tidecrest Particle & Ridgeline Terrain Background */}
      <ScrollTerrainBackground 
        variant="proof"
        elevation={7.8}
        crestColor={0x00e5ff}
        midColor={0x1d4ed8}
        baseColor={0x0b132b}
        scrollDistance={32.0}
        opacity={0.88}
        pointSize={3.0}
        wireframeOpacity={0.42}
        interactive={true}
      />
      <div className="max-w-[1600px] mx-auto w-full mb-32 md:mb-48 trust-header-trigger relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="col-span-1 md:col-span-8 flex flex-col gap-6">
            <span className="font-mono text-[10px] tracking-[0.2em] text-white/50">
              WHY TRAIN HERE
            </span>
            <h2 ref={headlineRef} className="font-sans text-4xl md:text-5xl lg:text-7xl font-medium tracking-tight text-white leading-[1.05] max-w-[800px] flex flex-wrap gap-x-4">
              {/* Splitting text manually into blocks for a spatial reveal without external plugins */}
              <span className="trust-char inline-block will-change-transform">WHAT</span>
              <span className="trust-char inline-block will-change-transform">SETS</span>
              <br className="w-full hidden md:block" />
              <span className="trust-char inline-block will-change-transform">THE</span>
              <span className="trust-char inline-block will-change-transform">EXPERIENCE</span>
              <br className="w-full hidden md:block" />
              <span className="trust-char inline-block will-change-transform">APART.</span>
            </h2>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto w-full flex flex-col trust-rows-container">
        {trustPillars.map((pillar) => (
          <div key={pillar.id} className="trust-row group flex flex-col pt-8 pb-12 cursor-none pointer-events-auto transform-gpu will-change-transform">
            <div className="trust-rule w-full h-px bg-white/10 origin-left mb-8 md:mb-12 group-hover:bg-white/30 transition-colors duration-500 will-change-transform" />
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
              <div className="col-span-1 md:col-span-2">
                <span className="trust-num font-mono text-[10px] tracking-[0.2em] text-white/40">
                  {pillar.number}
                </span>
              </div>
              <div className="col-span-1 md:col-span-4">
                <h3 className="trust-title font-sans text-2xl md:text-3xl lg:text-4xl text-white tracking-tight group-hover:translate-x-3 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                  {pillar.title}
                </h3>
              </div>
              <div className="col-span-1 md:col-span-5 flex items-start">
                <p className="trust-desc font-sans text-sm md:text-base text-white/50 leading-relaxed max-w-[400px] group-hover:text-white/70 transition-colors duration-500">
                  {pillar.description}
                </p>
              </div>
              <div className="col-span-1 md:col-span-1 flex justify-start md:justify-end mt-4 md:mt-0">
                 {pillar.href ? (
                   <a href={pillar.href} className="inline-flex items-center text-white/40 group-hover:text-white group-hover:translate-x-2 transition-all duration-500">
                     &rarr;
                   </a>
                 ) : (
                   <span className="inline-flex items-center text-white/20 group-hover:text-white/60 group-hover:translate-x-2 transition-all duration-500">
                     &rarr;
                   </span>
                 )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {metrics.length > 0 && (
        <div className="max-w-[1600px] mx-auto w-full mt-32 bg-[#030611]/50 backdrop-blur-md border border-white/10 rounded-2xl p-8 md:p-12 shadow-[0_12px_36px_rgba(0,0,0,0.37),inset_0_1px_0_rgba(255,255,255,0.08)] grid grid-cols-2 md:grid-cols-4 gap-8">
           {metrics.map((metric) => (
             <div key={metric.id} className="flex flex-col gap-2">
               <span className="font-sans text-3xl md:text-5xl lg:text-6xl text-white tracking-tight">{metric.value}</span>
               <span className="font-mono text-[10px] tracking-[0.2em] text-white/60 uppercase">{metric.label}</span>
             </div>
           ))}
        </div>
      )}
    </section>
  );
}
