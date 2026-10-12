"use client";

import { forwardRef } from "react";
import { SCROLL_DISTANCE_VH } from "@/lib/constants";

export const ScrollTrack = forwardRef<HTMLDivElement, { children: React.ReactNode }>(
  ({ children }, ref) => {
    return (
      <div 
        ref={ref}
        className="relative w-full cinematic-scroll-track"
        style={{ height: `${SCROLL_DISTANCE_VH}vh` }}
      >
        {children}
      </div>
    );
  }
);
ScrollTrack.displayName = "ScrollTrack";
