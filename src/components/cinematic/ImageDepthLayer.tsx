"use client";

import { useEffect, useState } from "react";
import { STORY_SCENES } from "@/lib/story-scenes";
import { StoryDepthImage } from "./StoryDepthImage";
import { useCameraProgress } from "@/hooks/useCameraProgress";

export function ImageDepthLayer() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full z-10 pointer-events-none transform-gpu perspective-[1000px]">
      {STORY_SCENES.filter(s => s.image).map((scene) => (
        <StoryDepthImage 
          key={scene.id} 
          scene={scene} 
          reducedMotion={reducedMotion}
        />
      ))}
    </div>
  );
}
