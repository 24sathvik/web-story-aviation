"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { journeySteps } from "@/data/journey";
import Image from "next/image";

export function TrainingJourney() {
  const containerRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const bgLayersRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!containerRef.current || !trackRef.current) return;
    
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    
    const ctx = gsap.context(() => {
      if (isMobile) {
        // Vertical layout for mobile
        const stages = gsap.utils.toArray<HTMLElement>('.journey-panel');
        stages.forEach(stage => {
          gsap.fromTo(stage, 
            { opacity: 0, y: 50 },
            { 
              opacity: 1, y: 0, 
              scrollTrigger: {
                trigger: stage,
                start: "top 80%",
                end: "top 50%",
                scrub: true
              }
            }
          );
        });
        return;
      }

      // Horizontal cinematic sequence for desktop
      const sections = gsap.utils.toArray<HTMLElement>('.journey-panel');
      const totalWidth = trackRef.current!.scrollWidth - window.innerWidth;
      
      // Pin and scroll horizontally
      const scrollTween = gsap.to(sections, {
        x: () => -totalWidth,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,
          scrub: 1,
          end: () => "+=" + totalWidth,
          invalidateOnRefresh: true,
        }
      });

      // Evolve background composition as panels move
      bgLayersRef.current.forEach((layer, index) => {
        if (!layer) return;
        const progressStart = index / bgLayersRef.current.length;
        const progressEnd = (index + 1) / bgLayersRef.current.length;
        
        // Backgrounds fade in and scale gently as their respective chapters appear
        gsap.fromTo(layer, 
          { opacity: index === 0 ? 0.3 : 0, scale: 1.1 },
          {
            opacity: 0.3,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: () => "top top+=" + (progressStart * totalWidth),
              end: () => "top top+=" + (progressEnd * totalWidth),
              scrub: true,
            }
          }
        );

        if (index > 0) {
           // Fade out previous layer slightly
           const prevLayer = bgLayersRef.current[index - 1];
           if (prevLayer) {
             gsap.to(prevLayer, {
               opacity: 0,
               ease: "none",
               scrollTrigger: {
                 trigger: containerRef.current,
                 start: () => "top top+=" + (progressStart * totalWidth),
                 end: () => "top top+=" + (progressEnd * totalWidth),
                 scrub: true,
               }
             });
           }
        }
      });

      // Inner parallax for panel content
      sections.forEach((section) => {
        const textContent = section.querySelector('.journey-content');
        if (textContent) {
          gsap.fromTo(textContent,
            { opacity: 0, z: -100, rotationY: 15 },
            {
              opacity: 1,
              z: 0,
              rotationY: 0,
              duration: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: section,
                containerAnimation: scrollTween,
                start: "left center+=300",
                end: "left center-=100",
                scrub: true,
              }
            }
          );
        }
      });

    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  // Map steps to specific thematic backgrounds to evolve the environment
  const bgImages = [
    "/images/campus/aerial.jpg", // Discover/Enroll
    "/images/training/classroom.jpg", // Ground School
    "/images/simulator/hero.jpg", // Simulator
    "/images/primary-trainer.jpg", // Flight Training
    "/images/cockpit/detail.jpg" // Check Ride / Next Altitude
  ];

  return (
    <section 
      ref={containerRef}
      className="w-full relative z-10 bg-[#020202] overflow-hidden"
    >
      {/* Dynamic Backgrounds Container */}
      <div className="absolute inset-0 pointer-events-none transform-gpu z-0">
        {bgImages.map((src, idx) => (
          <div 
            key={src}
            ref={el => { if(el) bgLayersRef.current[idx] = el; }}
            className="absolute inset-0 w-full h-full opacity-0"
          >
            <Image 
              src={src} 
              alt="Training Environment"
              fill
              className="object-cover object-center will-change-transform mix-blend-screen"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020202] via-[#020202]/50 to-[#020202]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020202] via-transparent to-[#020202]" />
      </div>


      {/* Desktop Pinned Shell / Mobile Vertical Container */}
      <div className="w-full relative z-10 flex flex-col md:h-screen md:justify-between pt-24 md:pt-20 md:pb-12 px-6 md:px-0">
        
        {/* Header Tier (Locked to top without overlapping horizontal carousel) */}
        <div className="w-full max-w-[1600px] mx-auto px-0 md:px-12 lg:px-24 flex-shrink-0 z-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
            <div className="flex flex-col gap-3">
              <span className="font-mono text-[10px] tracking-[0.25em] text-white/50 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400/80 animate-pulse" />
                THE JOURNEY // TRAINING MILESTONES
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white leading-tight">
                FROM FIRST STEP TO FLIGHT DECK.
              </h2>
            </div>
            
            <div className="hidden md:flex items-center gap-6 font-mono text-[10px] tracking-[0.2em] text-white/40">
              <span>PHASED PROGRESSION</span>
              <span className="text-white/20">|</span>
              <span className="text-white/70">5 MILESTONES</span>
            </div>
          </div>
        </div>

        {/* Lower Horizontal Carousel Track (Dedicated bottom tier, zero text collision) */}
        <div className="w-full relative flex-1 flex items-center overflow-hidden py-12 md:py-0">
          <div 
            ref={trackRef}
            className="flex flex-col md:flex-row md:h-full md:items-center md:w-max md:pl-[6vw] md:pr-[12vw] gap-8 md:gap-12"
          >
            {journeySteps.map((step, index) => {
              const isLast = index === journeySteps.length - 1;

              return (
                <div 
                  key={step.id} 
                  className="journey-panel w-full md:w-[480px] lg:w-[520px] flex flex-col justify-center relative md:flex-shrink-0"
                >
                  <div className="journey-content bg-[#030611]/75 backdrop-blur-xl border border-white/10 rounded-2xl p-7 md:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] flex flex-col gap-5 transform-gpu transition-all duration-300 hover:border-white/25">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <span className="font-mono text-[10px] md:text-xs tracking-[0.25em] text-blue-400/90 font-medium">
                        STEP {step.number}
                      </span>
                      {step.label && (
                        <span className="font-mono text-[9px] tracking-widest text-white/50 border border-white/10 px-2.5 py-0.5 uppercase rounded-full bg-white/[0.04]">
                          {step.label}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-sans text-2xl md:text-3xl text-white tracking-tight">
                      {step.title}
                    </h3>

                    {step.description && (
                      <p className="font-sans text-sm md:text-base text-white/70 leading-relaxed">
                        {step.description}
                      </p>
                    )}

                    {isLast && step.href && (
                      <a href={step.href} className="mt-2 group cursor-none pointer-events-auto block w-max">
                        <span className="font-mono text-[10px] tracking-[0.2em] text-white/80 group-hover:text-white transition-colors flex items-center gap-2">
                          EXPLORE ADMISSIONS <span className="group-hover:translate-x-1.5 transition-transform duration-300">&rarr;</span>
                        </span>
                        <div className="w-full h-px bg-white/30 mt-1.5 group-hover:bg-white/80 transition-colors duration-300" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
