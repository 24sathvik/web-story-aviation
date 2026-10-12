"use client";

import { forwardRef } from "react";
import { CinematicSceneConfig } from "@/lib/scene-types";

interface ImageLayerProps {
  config: CinematicSceneConfig;
  src?: string;
}

export const ImageLayer = forwardRef<HTMLImageElement, ImageLayerProps>(
  ({ config, src }, ref) => {
    // Explicitly check imageAvailable to avoid rendering placeholders like the corridor scene
    if (!src || config.imageAvailable === false) return null;

    return (
      <div className="absolute inset-0 w-full h-full z-10 pointer-events-none overflow-hidden image-layer-container">
        {/* The image tag itself serves as the GSAP target for transforms, scales, and opacity */}
        {/* Use standard img tag instead of next/image since we will be mutating style intensively with GSAP */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={ref}
          src={src}
          alt={`Cinematic shot for ${config.label}`}
          className="w-full h-full object-cover opacity-0 scale-110 cinematic-image"
          style={{ transformOrigin: "center center" }}
        />
      </div>
    );
  }
);
ImageLayer.displayName = "ImageLayer";
