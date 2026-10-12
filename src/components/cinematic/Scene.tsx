"use client";

import { forwardRef } from "react";
import { CinematicSceneConfig } from "@/lib/scene-types";

interface SceneProps {
  config: CinematicSceneConfig;
  isActive: boolean;
  children: React.ReactNode;
}

export const Scene = forwardRef<HTMLDivElement, SceneProps>(
  ({ config, children }, ref) => {
    return (
      <div 
        ref={ref}
        data-scene-id={config.id}
        data-scene-index={config.index}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-0"
      >
        {children}
      </div>
    );
  }
);
Scene.displayName = "Scene";
