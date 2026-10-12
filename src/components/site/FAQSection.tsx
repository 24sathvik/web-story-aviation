"use client";

import { useState, useRef, useEffect } from "react";
import { gsap } from "@/lib/gsap";
import { faqs } from "@/data/faq";
import Image from "next/image";

export function FAQSection() {
  const [openId, setOpenId] = useState<string | null>(null);
  const containerRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    gsap.set(container, { perspective: 1000 });

    const ctx = gsap.context(() => {
      // Headline reveal
      if (headlineRef.current) {
        const chars = headlineRef.current.querySelectorAll('.faq-char');
        gsap.fromTo(chars,
          { opacity: 0, z: -100, y: 30, rotationX: 10 },
          {
            opacity: 1, z: 0, y: 0, rotationX: 0,
            stagger: 0.05,
            scrollTrigger: {
              trigger: headlineRef.current,
              start: "top 85%",
              end: "bottom 60%",
              scrub: 1
            }
          }
        );
      }

      // Rows reveal
      const rows = gsap.utils.toArray<HTMLElement>('.faq-row');
      if (rows.length > 0) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: "top 70%",
            end: "bottom 50%",
            scrub: 1
          }
        });

        rows.forEach((row, index) => {
          gsap.set(row, { opacity: 0.2, y: 40, rotationX: 5 });
          tl.to(row, { opacity: 1, y: 0, rotationX: 0, ease: "power2.out", duration: 1 }, index * 0.15);
        });
      }

      // Deep parallax on the environment background
      const bgImage = container.querySelector('.faq-bg');
      if (bgImage) {
        gsap.fromTo(bgImage, 
          { scale: 1.1, yPercent: 0, opacity: 0.1 }, 
          {
            scale: 1, yPercent: 15, opacity: 0.4,
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

  const toggleOpen = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section 
      ref={containerRef}
      aria-labelledby="faq-heading" 
      className="w-full relative z-10 bg-[var(--background)] px-6 md:px-12 lg:px-24 py-32 md:py-48 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none transform-gpu z-0">
        <Image 
          src="/images/simulator/hero.jpg" 
          alt="Flight Simulator Environment"
          fill
          className="faq-bg object-cover object-center will-change-transform mix-blend-screen opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/80 to-[var(--background)]" />
      </div>
      <div className="max-w-[1600px] mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24 relative z-20">
        <div className="col-span-1 md:col-span-5 lg:col-span-6 flex flex-col gap-6">
          <span className="font-mono text-[10px] tracking-[0.2em] text-white/50 uppercase">
            COMMON QUESTIONS
          </span>
          <h2 id="faq-heading" ref={headlineRef} className="font-sans text-4xl md:text-5xl lg:text-7xl font-medium tracking-tight text-white leading-[1.05] max-w-[600px] flex flex-wrap gap-x-4">
            <span className="faq-char inline-block will-change-transform">CLARITY</span>
            <span className="faq-char inline-block will-change-transform">BEFORE</span>
            <br className="w-full hidden md:block" />
            <span className="faq-char inline-block will-change-transform">TAKEOFF.</span>
          </h2>
        </div>
        
        <div className="col-span-1 md:col-span-7 lg:col-span-6 flex flex-col faq-container">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div 
                key={faq.id} 
                className={`faq-row flex flex-col mb-4 rounded-xl transition-all duration-300 border transform-gpu will-change-transform ${
                  isOpen
                    ? 'bg-[#030611]/60 backdrop-blur-md border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.37),inset_0_1px_0_rgba(255,255,255,0.08)]'
                    : 'bg-white/[0.02] hover:bg-white/[0.04] border-white/5'
                }`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                  onClick={() => toggleOpen(faq.id)}
                  className="flex justify-between items-center w-full py-6 px-6 text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-white/50"
                >
                  <h3 className={`font-sans text-lg md:text-xl tracking-wide pr-8 transition-colors duration-300 ${isOpen ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>
                    {faq.question}
                  </h3>
                  <div className="relative w-4 h-4 flex-shrink-0 flex items-center justify-center">
                    <div className="absolute w-full h-px bg-white/50 transition-transform duration-300" />
                    <div 
                      className="absolute h-full w-px bg-white/50 transition-transform duration-300" 
                      style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
                    />
                  </div>
                </button>
                <div 
                  id={`faq-answer-${faq.id}`}
                  className="grid transition-all duration-300"
                  style={{ 
                    gridTemplateRows: isOpen ? '1fr' : '0fr',
                  }}
                >
                  <div className="overflow-hidden px-6">
                    <p className="font-sans text-sm md:text-base text-white/70 leading-relaxed pb-6 max-w-[560px]">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
