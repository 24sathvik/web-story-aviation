"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { stories } from "@/data/stories";
import Image from "next/image";

export function StoriesSection() {
  const containerRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    gsap.set(container, { perspective: 1000 });

    const ctx = gsap.context(() => {
      // Headline spatial reveal
      if (headlineRef.current) {
        const chars = headlineRef.current.querySelectorAll('.story-char');
        gsap.fromTo(chars, 
          { opacity: 0, z: -200, y: 50, rotationX: 20 },
          { 
            opacity: 1, z: 0, y: 0, rotationX: 0, 
            stagger: 0.05,
            scrollTrigger: { 
              trigger: headlineRef.current, 
              start: "top 85%",
              end: "bottom 55%",
              scrub: 1
            }
          }
        );
      }

      // Empty state reveal
      const emptyState = containerRef.current?.querySelector('.story-empty-state');
      if (emptyState) {
        gsap.fromTo(emptyState,
          { opacity: 0.2, scale: 0.95, y: 40 },
          {
            opacity: 1, scale: 1, y: 0,
            scrollTrigger: {
              trigger: emptyState,
              start: "top 95%",
              end: "bottom 80%",
              scrub: 1
            }
          }
        );
      }

      // Rows reveal (if any exist)
      const rows = gsap.utils.toArray<HTMLElement>('.story-row');
      if (rows.length > 0) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
            end: "bottom 50%",
            scrub: 1
          }
        });

        rows.forEach((row, index) => {
          const num = row.querySelector('.story-num');
          const identity = row.querySelector('.story-identity');
          const quote = row.querySelector('.story-quote');
          const rule = row.querySelector('.story-rule');

          gsap.set(row, { opacity: 0.3, y: 40, rotationX: 5 });
          if (rule) gsap.set(rule, { scaleX: 0 });

          if (rule) {
            tl.to(rule, { scaleX: 1, ease: "none", duration: 0.5 }, index * 0.2);
          }
          
          tl.to(row, {
            opacity: 1, y: 0, rotationX: 0, ease: "power2.out", duration: 1
          }, index * 0.2);
        });
      }

      // Deep parallax on the environment background
      const bgImage = container.querySelector('.stories-bg');
      if (bgImage) {
        gsap.fromTo(bgImage, 
          { scale: 1.2, yPercent: -5, opacity: 0.1 }, 
          {
            scale: 1, yPercent: 10, opacity: 0.3,
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
      className="w-full relative z-10 bg-[var(--background)] px-6 md:px-12 lg:px-24 py-32 md:py-48 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none transform-gpu z-0">
        <Image 
          src="/images/aircraft/hero.jpg" 
          alt="Student Training Environment"
          fill
          className="stories-bg object-cover object-center will-change-transform mix-blend-screen opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)] via-[var(--background)]/80 to-[var(--background)]" />
      </div>
      <div className="max-w-[1600px] mx-auto w-full mb-32 md:mb-48 stories-header-trigger relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="col-span-1 md:col-span-8 flex flex-col gap-6">
            <span className="font-mono text-[10px] tracking-[0.2em] text-white/50">
              STUDENT STORIES
            </span>
            <h2 ref={headlineRef} className="font-sans text-4xl md:text-5xl lg:text-7xl font-medium tracking-tight text-white leading-[1.05] max-w-[800px] flex flex-wrap gap-x-4">
              <span className="story-char inline-block will-change-transform">THE</span>
              <span className="story-char inline-block will-change-transform">PEOPLE</span>
              <span className="story-char inline-block will-change-transform">BEHIND</span>
              <br className="w-full hidden md:block" />
              <span className="story-char inline-block will-change-transform">THE</span>
              <span className="story-char inline-block will-change-transform">JOURNEY.</span>
            </h2>
          </div>
          <div className="col-span-1 md:col-span-4 flex flex-col justify-end pt-4 md:pt-8">
             {/* Supporting text intentionally omitted pending verified copy */}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto w-full flex flex-col">
        {stories.length === 0 ? (
          <div className="story-empty-state w-full py-20 md:py-28 border-y border-white/10 flex flex-col items-center justify-center text-center gap-4 transform-gpu will-change-transform">
            <span className="font-sans text-xl md:text-2xl text-white/80 font-light max-w-xl leading-relaxed">
              Graduate profiles and airline career milestones are published alongside active flight class graduations.
            </span>
            <span className="font-mono text-[10px] tracking-[0.25em] text-white/40 uppercase">
              Aviation Academy Alumni Network & Airline Partner Cadre
            </span>
          </div>
        ) : (
          stories.map((story, index) => {
            const num = (index + 1).toString().padStart(2, '0');
            return (
              <div key={story.id} className="story-row group flex flex-col pt-12 pb-16 transform-gpu will-change-transform">
                <div className="story-rule w-full h-px bg-white/10 origin-left mb-12 md:mb-16 group-hover:bg-white/30 transition-colors duration-500 will-change-transform" />
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
                  <div className="col-span-1 md:col-span-2">
                    <span className="story-num font-mono text-[10px] tracking-[0.2em] text-white/40">
                      {num}
                    </span>
                  </div>
                  <div className="col-span-1 md:col-span-3 flex flex-col gap-2 story-identity group-hover:translate-x-3 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                    <span className="font-sans text-lg text-white tracking-wide">
                      {story.studentName}
                    </span>
                    {(story.metadata?.program || story.metadata?.year) && (
                      <span className="font-mono text-[9px] tracking-widest text-white/40 uppercase">
                        {story.metadata.program} {story.metadata.program && story.metadata.year ? '/' : ''} {story.metadata.year}
                      </span>
                    )}
                  </div>
                  <div className="col-span-1 md:col-span-5 flex flex-col gap-8 story-quote">
                    <p className="font-sans text-2xl md:text-3xl text-white/90 leading-[1.3] group-hover:text-white transition-colors duration-500">
                      "{story.quote}"
                    </p>
                    {story.story && (
                      <span className="inline-flex items-center text-white/40 group-hover:text-white group-hover:translate-x-2 transition-all duration-500 cursor-none pointer-events-auto w-max font-mono text-[10px] tracking-[0.2em]">
                        READ STORY &rarr;
                      </span>
                    )}
                  </div>
                  <div className="col-span-1 md:col-span-2 flex justify-start md:justify-end">
                     {/* Placeholder for future verified image */}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
