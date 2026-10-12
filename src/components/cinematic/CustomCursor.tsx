"use client";

import { useCustomCursor } from "@/lib/motion/cursor";

export function CustomCursor() {
  const { outerRef, innerRef, textRef, hoverText } = useCustomCursor();

  return (
    <>
      <div 
        ref={outerRef}
        className="fixed top-0 left-0 w-8 h-8 border border-white/30 rounded-full pointer-events-none z-[60] mix-blend-difference hidden md:flex items-center justify-center transition-opacity duration-300"
        style={{ opacity: hoverText ? 1 : 0.6 }}
      >
        <div 
          ref={textRef}
          className="absolute -top-6 text-[9px] font-mono tracking-widest text-white whitespace-nowrap opacity-0"
        >
          {hoverText}
        </div>
      </div>
      <div 
        ref={innerRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[60] mix-blend-difference hidden md:block opacity-80"
      />
    </>
  );
}
