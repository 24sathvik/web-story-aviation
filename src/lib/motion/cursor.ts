"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

export function useCustomCursor() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [hoverText, setHoverText] = useState("");
  
  useEffect(() => {
    // Desktop only, disable on reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    
    if (prefersReducedMotion || isMobile) {
      return;
    }

    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    gsap.set([outer, inner], { xPercent: -50, yPercent: -50 });
    
    const xToOuter = gsap.quickTo(outer, "x", { duration: 0.15, ease: "power3" });
    const yToOuter = gsap.quickTo(outer, "y", { duration: 0.15, ease: "power3" });
    const xToInner = gsap.quickTo(inner, "x", { duration: 0.05, ease: "power3" });
    const yToInner = gsap.quickTo(inner, "y", { duration: 0.05, ease: "power3" });

    const moveCursor = (e: MouseEvent) => {
      xToOuter(e.clientX);
      yToOuter(e.clientY);
      xToInner(e.clientX);
      yToInner(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest("button, a, [data-magnetic]");
      
      if (interactive) {
        gsap.to(outer, { scale: 1.5, duration: 0.3, ease: "power2.out" });
        gsap.to(inner, { scale: 0.5, duration: 0.3, ease: "power2.out" });
        
        const actionText = interactive.getAttribute("data-cursor-text");
        if (actionText) {
          setHoverText(actionText);
          gsap.to(textRef.current, { opacity: 1, scale: 1, duration: 0.3 });
        }
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest("button, a, [data-magnetic]");
      
      if (interactive) {
        gsap.to(outer, { scale: 1, duration: 0.3, ease: "power2.out" });
        gsap.to(inner, { scale: 1, duration: 0.3, ease: "power2.out" });
        
        const actionText = interactive.getAttribute("data-cursor-text");
        if (actionText) {
          gsap.to(textRef.current, { opacity: 0, scale: 0.8, duration: 0.2, onComplete: () => setHoverText("") });
        }
      }
    };

    window.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, []);

  return { outerRef, innerRef, textRef, hoverText };
}
