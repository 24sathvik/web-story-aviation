import { gsap } from "@/lib/gsap";
import { EASE_LUXURY } from "./easing";

export function revealLines(
  elements: HTMLElement[] | NodeListOf<HTMLElement>,
  progress: number
) {
  // Driven directly by progress, no stagger since it's scrubbed.
  // Instead, map progress (0-1) to individual line animation.
  // We want lines to stagger their reveal based on global progress window.
  
  elements.forEach((el, index) => {
    // Offset each line's start by 0.1 progress
    const totalLines = elements.length;
    const startP = index * (0.5 / Math.max(1, totalLines - 1));
    const endP = startP + 0.5;
    
    // Normalize progress for this line
    const localP = gsap.utils.clamp(0, 1, (progress - startP) / (endP - startP));
    
    const easedP = gsap.parseEase(EASE_LUXURY)(localP);
    
    const y = 10 * (1 - easedP);
    const opacity = easedP;
    
    // Add subtle tracking (letterSpacing) - starting slightly wide and coming in
    const letterSpacing = `${(1 - easedP) * 0.05}em`;
    
    gsap.set(el, { y, opacity, letterSpacing });
  });
}

export function applyClipPathReveal(
  element: HTMLElement,
  progress: number
) {
  const easedP = gsap.parseEase(EASE_LUXURY)(progress);
  // inset(100% 0 0 0) to inset(0% 0 0 0)
  const topInset = 100 * (1 - easedP);
  gsap.set(element, { clipPath: `inset(${topInset}% 0 0 0)` });
}

export function subtleScaleAndFade(
  element: HTMLElement,
  progress: number,
  baseScale: number = 0.95
) {
  const easedP = gsap.parseEase("power1.out")(progress);
  const scale = baseScale + ((1 - baseScale) * easedP);
  gsap.set(element, { scale, opacity: easedP });
}
