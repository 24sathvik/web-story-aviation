"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { resolveSceneProgress } from "./useSceneProgress";
import { CINEMATIC_SCENES } from "@/lib/scenes";
import { VideoScrubController, VideoScrubDebugState } from "@/lib/video-scrub-controller";

export type VideoStatus = "LOADING" | "READY" | "ERROR";

export function useVideoScrub(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  trackRef: React.RefObject<HTMLElement | null>
) {
  const [status, setStatus] = useState<VideoStatus>("LOADING");
  const controllerRef = useRef<VideoScrubController | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const track = trackRef.current;
    
    if (!video || !track) return;

    let isVideoReady = false;

    const handleReady = () => {
      isVideoReady = true;
      setStatus("READY");

      // Expose duration for debug overlay
      if (typeof window !== 'undefined') {
        (window as unknown as Record<string, number>).__DEBUG_DURATION = video.duration;
      }

      // Create the scrub controller once the video is ready
      if (!controllerRef.current) {
        const controller = new VideoScrubController(video);
        controllerRef.current = controller;

        // Wire debug state to window globals for the overlay
        controller.onDebug((state: VideoScrubDebugState) => {
          if (typeof window !== 'undefined') {
            const win = window as unknown as Record<string, unknown>;
            win.__DEBUG_VIDEO_TARGET = state.targetTime;
            win.__DEBUG_VIDEO_SEEKING = state.isSeeking;
            win.__DEBUG_VIDEO_PENDING = state.hasPendingTarget;
            win.__DEBUG_VIDEO_READY_STATE = state.readyState;
            win.__DEBUG_VIDEO_NETWORK_STATE = state.networkState;
            win.__DEBUG_VIDEO_BUFFERED = state.bufferedRanges;
            win.__DEBUG_VIDEO_FRAMES = state.frameCount;
          }
        });
      }
    };

    const handleError = () => {
      setStatus("ERROR");
    };

    // Wait for the video to be sufficiently loaded
    // readyState >= 2 (HAVE_CURRENT_DATA) means we have at least the current frame
    if (video.readyState >= 2) {
      handleReady();
    } else {
      // Wait for canplay instead of just loadedmetadata — ensures decoder is ready
      video.addEventListener("canplay", handleReady, { once: true });
      video.addEventListener("error", handleError);
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      video.play().catch(() => {});
      return () => {
        video.removeEventListener("canplay", handleReady);
        video.removeEventListener("error", handleError);
        controllerRef.current?.destroy();
        controllerRef.current = null;
      };
    }

    const trigger = ScrollTrigger.create({
      trigger: track,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        const sceneState = resolveSceneProgress(self.progress);
        const activeConfig = CINEMATIC_SCENES.find(s => s.id === sceneState.sceneId);

        // Update debug globals
        if (typeof window !== 'undefined') {
          const win = window as unknown as Record<string, unknown>;
          win.__DEBUG_PROGRESS = self.progress;
          win.__DEBUG_SCROLL = window.scrollY;
          win.__DEBUG_VIEWPORT = window.innerHeight;
          win.__DEBUG_TIME = video.currentTime;
          win.__DEBUG_SCENE_INDEX = sceneState.sceneIndex;
          win.__DEBUG_SCENE_ID = sceneState.sceneId;
          win.__DEBUG_SCENE_PROGRESS = sceneState.sceneProgress;
          win.__DEBUG_SCENE_WEIGHT = activeConfig?.scrollWeight || 0;
          win.__DEBUG_SCENE_IMAGE_MODE = activeConfig?.imageStrategy || "";
          win.__DEBUG_SCENE_IMAGE_AVAIL = activeConfig?.imageAvailable !== false;
        }

        // Route the target time through the controller — NOT directly to video.currentTime
        if (isVideoReady && controllerRef.current) {
          controllerRef.current.setTarget(sceneState.mappedVideoTime);
        }
      }
    });

    return () => {
      trigger.kill();
      video.removeEventListener("canplay", handleReady);
      video.removeEventListener("error", handleError);
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, [videoRef, trackRef]);

  return status;
}
