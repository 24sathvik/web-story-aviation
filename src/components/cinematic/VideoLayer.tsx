"use client";

import { forwardRef } from "react";

interface VideoLayerProps {
  src: string;
}

export const VideoLayer = forwardRef<HTMLVideoElement, VideoLayerProps>(
  ({ src }, ref) => {
    return (
      <div className="absolute inset-0 w-full h-full">
        <video
          ref={ref}
          src={src}
          className="w-full h-full object-cover"
          preload="auto"
          playsInline
          muted
          // No controls, no loop, no autoplay
        />
      </div>
    );
  }
);
VideoLayer.displayName = "VideoLayer";
