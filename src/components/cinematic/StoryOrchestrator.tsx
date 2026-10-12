"use client";

import { useRef } from "react";
import { useCameraProgress } from "@/hooks/useCameraProgress";
import { STORY_SCENES } from "@/lib/story-scenes";
import { StoryContentLayer } from "./StoryContentLayer";
import { gsap, useGSAP } from "@/lib/gsap";
import { getCameraAwareTransform } from "@/lib/typography-utils";

export function StoryOrchestrator() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none">
      <StoryContentLayer />
    </div>
  );
}
