"use client";

import { useState, useRef, useEffect } from "react";
import { gsap } from "@/lib/gsap";
import Image from "next/image";

export function AdmissionsTransition() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({ name: false, email: false });

  const containerRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const formAreaRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    gsap.set(containerRef.current, { perspective: 2500, transformStyle: "preserve-3d" });
    if (bgRef.current) {
      gsap.set(bgRef.current, { z: -1500, scale: 1.5, opacity: 0 });
    }

    const ctx = gsap.context(() => {
      // Background atmosphere pull-in
      if (bgRef.current) {
        gsap.to(bgRef.current, {
          z: 0, scale: 1.1, opacity: 0.6,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom bottom",
            scrub: 1
          }
        });
      }
      // Headline massive spatial zoom
      if (headlineRef.current) {
        gsap.fromTo(headlineRef.current,
          { scale: 0.5, opacity: 0, z: -1000, rotationX: 45, y: 150 },
          {
            scale: 1, opacity: 1, z: 0, rotationX: 0, y: 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 90%",
              end: "center 50%",
              scrub: 1
            }
          }
        );
      }

      // Form/Action area reveal (pushes out from deep space)
      if (formAreaRef.current) {
        gsap.fromTo(formAreaRef.current,
          { opacity: 0, z: -1500, rotationX: -30, y: 300, scale: 0.8 },
          {
            opacity: 1, z: 0, rotationX: 0, y: 0, scale: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 75%",
              end: "bottom 80%",
              scrub: 1
            }
          }
        );
      }
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;
    const newErrors = { name: false, email: false };

    if (!formData.name.trim()) {
      newErrors.name = true;
      hasError = true;
    }
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = true;
      hasError = true;
    }

    setErrors(newErrors);

    if (!hasError) {
      // Simulate submission to backend since no actual endpoint is configured.
      setIsSubmitted(true);
    }
  };

  return (
    <section ref={containerRef} className="w-full relative z-10 bg-[var(--background)] px-6 md:px-12 lg:px-24 py-20 md:py-28 flex flex-col items-center justify-center text-center overflow-hidden min-h-[75vh]">
      
      {/* Deep Spatial Background Image */}
      <div ref={bgRef} className="absolute inset-0 pointer-events-none transform-gpu z-0 will-change-transform opacity-30">
        <Image 
          src="/images/entrance/glass-entrance.jpg" 
          alt="Admissions Atmosphere" 
          fill 
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/70 to-[var(--background)]" />
      </div>

      {/* Background atmospheric runway lighting leading to footer */}
      <div className="absolute inset-0 pointer-events-none transform-gpu z-0">
        <div className="absolute inset-0 bg-blue-900/10 blur-[150px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90vw] h-[50vh] bg-blue-500/5 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <span className="font-mono text-[10px] tracking-[0.25em] text-white/50 mb-6 uppercase relative z-20 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400/80 animate-pulse" />
        ADMISSIONS DESK // NEXT COHORT
      </span>
      
      <h2 ref={headlineRef} className="font-sans text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight text-white leading-[1.08] mb-6 relative z-20 will-change-transform transform-gpu max-w-4xl">
        READY TO TAKE<br className="hidden md:block" /> THE NEXT STEP?
      </h2>
      
      <p className="font-sans text-sm md:text-base text-white/65 max-w-md mb-12 relative z-20">
        Begin your flight training conversation with our admissions team.
      </p>

      <div ref={formAreaRef} className="w-full flex justify-center relative z-20 will-change-transform transform-gpu">
        {!isFormOpen && !isSubmitted && (
          <div className="bg-[#030712]/75 backdrop-blur-xl border border-white/15 hover:border-white/35 rounded-2xl px-10 py-5 shadow-[0_16px_48px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300">
            <button 
              onClick={() => setIsFormOpen(true)}
              className="group flex flex-col items-center cursor-none pointer-events-auto focus:outline-none"
            >
              <span className="font-mono text-[11px] md:text-xs tracking-[0.25em] text-white group-hover:text-white transition-colors duration-300 flex items-center gap-4 font-medium">
                START AN ENQUIRY <span className="group-hover:translate-x-2 transition-transform duration-300">&rarr;</span>
              </span>
              <div className="w-full max-w-[200px] h-px bg-white/20 mt-2.5 group-hover:bg-white/70 transition-colors duration-300" />
            </button>
          </div>
        )}

        {isFormOpen && !isSubmitted && (
          <div className="w-full max-w-[540px] bg-[#030712]/75 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-10 shadow-[0_16px_48px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]">
            <form 
              onSubmit={handleSubmit}
              className="w-full flex flex-col gap-6 text-left cursor-auto pointer-events-auto"
              noValidate
            >
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="font-mono text-[10px] tracking-widest text-white/60 uppercase">
                  Full Name <span className="text-white/40">*</span>
                </label>
                <input 
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full bg-white/[0.03] border ${errors.name ? 'border-red-500/50' : 'border-white/10'} rounded-lg px-4 py-3 text-white font-sans text-sm focus:outline-none focus:border-white/60 transition-colors`}
                  placeholder="e.g. John Doe"
                />
                {errors.name && <span className="text-xs text-red-400 font-sans mt-1">Name is required</span>}
              </div>
              
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="font-mono text-[10px] tracking-widest text-white/60 uppercase">
                  Email Address <span className="text-white/40">*</span>
                </label>
                <input 
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full bg-white/[0.03] border ${errors.email ? 'border-red-500/50' : 'border-white/10'} rounded-lg px-4 py-3 text-white font-sans text-sm focus:outline-none focus:border-white/60 transition-colors`}
                  placeholder="e.g. john@example.com"
                />
                {errors.email && <span className="text-xs text-red-400 font-sans mt-1">Valid email is required</span>}
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="font-mono text-[10px] tracking-widest text-white/60 uppercase">
                  Message (Optional)
                </label>
                <textarea 
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white font-sans text-sm focus:outline-none focus:border-white/60 transition-colors min-h-[90px] resize-y"
                  placeholder="How can we assist your flight training goals?"
                />
              </div>

              <button 
                type="submit"
                className="group mt-4 inline-flex items-center justify-center bg-white text-black py-3.5 rounded-lg font-mono text-xs tracking-[0.2em] font-semibold uppercase hover:bg-zinc-200 transition-colors pointer-events-auto"
              >
                SUBMIT ENQUIRY
              </button>
            </form>
          </div>
        )}

        {isSubmitted && (
          <div className="flex flex-col items-center text-center max-w-md pointer-events-auto p-8 md:p-10 rounded-2xl bg-[#030712]/75 border border-white/10 backdrop-blur-xl shadow-[0_16px_48px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="font-sans text-xl md:text-2xl text-white mb-2 font-medium">Enquiry Validated</span>
            <p className="font-sans text-sm text-zinc-300 leading-relaxed mb-4">
              Thank you, {formData.name || "Cadet"}. Your application information has been received. Our admissions team will contact you shortly.
            </p>
            <span className="font-mono text-[9px] tracking-widest text-zinc-400 uppercase border-t border-white/10 pt-3 w-full">
              Status: Staging Validation Passed (Admissions Desk Active)
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
