"use client";

import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { gsap } from "@/lib/gsap";

export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null);
  const [lenisStatus, setLenisStatus] = useState("INACTIVE");

  useEffect(() => {
    // Check reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setTimeout(() => setLenisStatus("REDUCED_MOTION"), 0);
      return;
    }

    const lenis = new Lenis({
      lerp: 0.08, // Replaces duration/easing with responsive lerp
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      orientation: "vertical",
      gestureOrientation: "vertical",
    });
    lenisRef.current = lenis;
    setTimeout(() => setLenisStatus("ACTIVE"), 0);

    // Sync Lenis with GSAP's Ticker
    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
      if (process.env.NODE_ENV === "development") {
        (window as any).__DEBUG_LENIS_VELOCITY = lenis.velocity;
      }
    };

    gsap.ticker.add(updateLenis);

    // Make GSAP ticker run independently of its internal lag smoothing
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
      lenisRef.current = null;
      setTimeout(() => setLenisStatus("DESTROYED"), 0);
    };
  }, []);

  return { lenisRef, lenisStatus };
}

