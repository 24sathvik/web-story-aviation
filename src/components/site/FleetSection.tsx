"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { fleet } from "@/data/fleet";
import Image from "next/image";

export function FleetSection() {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>('.fleet-item');
      
      items.forEach((item) => {
        const title = item.querySelector('.fleet-title');
        const meta = item.querySelector('.fleet-meta');
        const imgContainer = item.querySelector('.fleet-img-container');
        const img = item.querySelector('.fleet-img-inner');
        const rule = item.querySelector('.fleet-rule');

        // Text reveal is fine as a trigger, but let's make it slightly more drawn out
        if (rule) {
          gsap.fromTo(rule, { scaleX: 0 }, {
            scaleX: 1, duration: 1.5, ease: "power4.out",
            scrollTrigger: { trigger: item, start: "top 80%" }
          });
        }
        
        if (title) {
          gsap.fromTo(title, { opacity: 0, y: 30 }, {
            opacity: 1, y: 0, duration: 1.2, ease: "power3.out",
            scrollTrigger: { trigger: item, start: "top 75%" }
          });
        }

        if (meta) {
          gsap.fromTo(meta, { opacity: 0, y: 20 }, {
            opacity: 1, y: 0, duration: 1, ease: "power3.out",
            scrollTrigger: { trigger: item, start: "top 70%" }
          });
        }

        // Image Architectural Reveal & Parallax (Deep 3D)
        if (imgContainer && img) {
          gsap.set(item, { perspective: 1800, transformStyle: "preserve-3d" });
          
          gsap.set(imgContainer, { 
            clipPath: 'inset(20% 10% 20% 10%)',
            z: -500,
            rotationX: 10,
            rotationY: -5,
            opacity: 0,
            transformStyle: "preserve-3d"
          });
          gsap.set(img, { scale: 1.3, yPercent: 20 });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: item,
              start: "top 95%",
              end: "bottom 40%",
              scrub: 1
            }
          });

          // Expand the mask and push image forward in 3D space
          tl.to(imgContainer, {
            clipPath: 'inset(0% 0% 0% 0%)',
            z: 0,
            rotationX: 0,
            rotationY: 0,
            opacity: 1,
            ease: "power2.out",
            duration: 1
          }, 0);

          // Deep internal parallax
          tl.to(img, {
            yPercent: -15,
            scale: 1,
            ease: "none",
            duration: 1.5
          }, 0);
        }
      });

      // Deep parallax on the environment background
      const bgImage = container.querySelector('.fleet-bg');
      if (bgImage) {
        gsap.fromTo(bgImage, 
          { scale: 1.2, yPercent: 0, opacity: 0.1 }, 
          {
            scale: 1.05, yPercent: 15, opacity: 0.25,
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
      className="w-full relative z-10 bg-[var(--background)] px-6 md:px-12 lg:px-24 pt-32 md:pt-48 pb-32 md:pb-64 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none transform-gpu z-0">
        <Image 
          src="/images/primary-trainer.jpg" 
          alt="Fleet Background"
          fill
          className="fleet-bg object-cover object-center will-change-transform mix-blend-screen opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)] via-[var(--background)]/70 to-[var(--background)]" />
      </div>
      <div className="max-w-[1600px] mx-auto w-full mb-32 md:mb-48 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="col-span-1 md:col-span-8 flex flex-col gap-6">
            <span className="font-mono text-[10px] tracking-[0.2em] text-white/50">
              THE FLEET
            </span>
            <h2 className="font-sans text-4xl md:text-5xl lg:text-7xl font-medium tracking-tight text-white leading-[1.05] max-w-[800px]">
              AIRCRAFT BUILT<br />
              FOR TRAINING.
            </h2>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto w-full flex flex-col gap-24 md:gap-36 relative z-20">
        {fleet.map((aircraft, index) => {
          const num = (index + 1).toString().padStart(2, '0');
          const total = fleet.length.toString().padStart(2, '0');
          return (
            <article key={aircraft.id} className="fleet-item flex flex-col group">
              <div className="flex items-center gap-6 mb-6 md:mb-8">
                <span className="font-mono text-[10px] tracking-[0.2em] text-white/40">
                  {num} / {total}
                </span>
                <div className="fleet-rule h-px bg-white/20 origin-left flex-1" />
              </div>
              
              <h3 className="fleet-title font-sans text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white tracking-tight mb-6 md:mb-10">
                {aircraft.name}
              </h3>

              {aircraft.image ? (
                <div className="fleet-img-container w-full h-[52vh] md:h-[65vh] mb-6 md:mb-8 overflow-hidden relative rounded-2xl border border-white/10 bg-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] will-change-transform">
                  <Image 
                    src={aircraft.image} 
                    alt={aircraft.name}
                    fill
                    className="fleet-img-inner object-cover object-center will-change-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#02040a]/60 via-transparent to-transparent pointer-events-none" />
                </div>
              ) : (
                <div className="fleet-img-container w-full h-[52vh] md:h-[65vh] mb-6 md:mb-8 border border-white/10 rounded-2xl bg-white/[0.02] flex items-center justify-center will-change-transform">
                  <div className="fleet-img-inner w-full h-full flex items-center justify-center">
                    <span className="font-mono text-[10px] tracking-[0.2em] text-white/30 uppercase">[ AIRCRAFT IMAGE PENDING ]</span>
                  </div>
                </div>
              )}

              <div className="fleet-meta bg-[#030611]/75 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
                <div className="flex flex-col gap-2">
                  <span className="font-mono text-[9px] tracking-widest text-white/40 uppercase">MODEL</span>
                  <span className="font-sans text-sm md:text-base text-white/90">{aircraft.name}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-mono text-[9px] tracking-widest text-white/40 uppercase">TYPE</span>
                  <span className="font-sans text-sm md:text-base text-white/90">{aircraft.type}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-mono text-[9px] tracking-widest text-white/40 uppercase">ROLE</span>
                  <span className="font-sans text-sm md:text-base text-white/90">{aircraft.role}</span>
                </div>
                <div className="flex flex-col justify-end items-start md:items-end md:text-right">
                  <a href={aircraft.href} className="inline-flex items-center gap-4 group/btn cursor-none pointer-events-auto">
                    <span className="font-mono text-[10px] tracking-[0.2em] text-white/60 group-hover/btn:text-white transition-colors duration-300">EXPLORE</span>
                    <span className="text-white/60 group-hover/btn:text-white group-hover/btn:translate-x-2 transition-all duration-500">&rarr;</span>
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
