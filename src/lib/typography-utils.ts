export type CameraDirection = 
  | "PUSH_FORWARD" 
  | "PULL_BACKWARD" 
  | "ASCEND" 
  | "DESCEND" 
  | "DRIFT_LEFT" 
  | "DRIFT_RIGHT";

export interface CinematicTextTransform {
  opacity: number;
  scale: number;
  x: number;
  y: number;
  letterSpacing: string;
  filter: string;
}

// Default states
export const TEXT_HIDDEN: CinematicTextTransform = {
  opacity: 0,
  scale: 1,
  x: 0,
  y: 0,
  letterSpacing: "0em",
  filter: "blur(0px)"
};

/**
 * Derives a cinematic text transform based on the camera's apparent motion.
 * CLAMPED for safety to prevent viewport clipping.
 */
export function getCameraAwareTransform(
  phase: "ENTER" | "HOLD" | "EXIT" | "OUT",
  localProgress: number, // 0 to 1 within the current phase
  direction: CameraDirection,
  intensity: "L1" | "L2" | "L3",
  prefersReducedMotion: boolean
): CinematicTextTransform {
  
  if (phase === "OUT") return { ...TEXT_HIDDEN };

  const isL3 = intensity === "L3";
  const isL2 = intensity === "L2";
  
  // Base Opacity
  let opacity = 1;
  if (phase === "ENTER") opacity = localProgress;
  else if (phase === "EXIT") opacity = 1 - localProgress;

  // Reduced motion
  if (prefersReducedMotion) {
    return {
      opacity,
      scale: 1,
      x: 0,
      y: phase === "ENTER" ? 16 * (1 - localProgress) : phase === "EXIT" ? -16 * localProgress : 0,
      letterSpacing: "0em",
      filter: "blur(0px)"
    };
  }

  let scale = 1;
  let x = 0;
  let y = 0;
  let letterSpacing = 0; // in em

  // Maximum scales: L1 = 1.00, L2 = 1.035, L3 = 1.08
  const maxScaleDelta = isL3 ? 0.08 : isL2 ? 0.035 : 0;
  // Maximum translation: L3 = 18px, L2 = 10px, L1 = 4px
  const maxT = isL3 ? 18 : isL2 ? 10 : 4;
  const maxTrack = isL3 ? 0.06 : isL2 ? 0.03 : 0.01;

  // Apply Camera Behavior
  switch (direction) {
    case "PUSH_FORWARD":
      if (phase === "ENTER") {
        scale = 1 - (maxScaleDelta * (1 - localProgress));
        letterSpacing = maxTrack * (1 - localProgress);
        y = maxT * (1 - localProgress);
      } else if (phase === "HOLD") {
        scale = 1 + (maxScaleDelta * 0.5 * localProgress);
      } else if (phase === "EXIT") {
        scale = 1 + (maxScaleDelta * 0.5) + (maxScaleDelta * 1.5 * localProgress);
        y = -maxT * localProgress;
      }
      break;

    case "PULL_BACKWARD":
      if (phase === "ENTER") {
        scale = 1 + (maxScaleDelta * (1 - localProgress));
        letterSpacing = maxTrack * 1.5 * (1 - localProgress);
      } else if (phase === "HOLD") {
        scale = 1 - (maxScaleDelta * 0.5 * localProgress);
      } else if (phase === "EXIT") {
        scale = 1 - (maxScaleDelta * 0.5) - (maxScaleDelta * localProgress);
        letterSpacing = maxTrack * localProgress;
      }
      break;

    case "ASCEND":
      if (phase === "ENTER") {
        y = maxT * 1.5 * (1 - localProgress);
      } else if (phase === "HOLD") {
        y = maxT * -0.2 * localProgress;
      } else if (phase === "EXIT") {
        y = (maxT * -0.2) - (maxT * localProgress);
      }
      break;

    case "DESCEND":
      if (phase === "ENTER") {
        y = -maxT * 1.5 * (1 - localProgress);
      } else if (phase === "HOLD") {
        y = maxT * 0.2 * localProgress;
      } else if (phase === "EXIT") {
        y = (maxT * 0.2) + (maxT * localProgress);
      }
      break;
      
    case "DRIFT_LEFT":
      if (phase === "ENTER") {
        x = maxT * (1 - localProgress);
      } else if (phase === "HOLD") {
        x = -maxT * 0.2 * localProgress;
      } else if (phase === "EXIT") {
        x = (-maxT * 0.2) - (maxT * localProgress);
      }
      break;

    case "DRIFT_RIGHT":
      if (phase === "ENTER") {
        x = -maxT * (1 - localProgress);
      } else if (phase === "HOLD") {
        x = maxT * 0.2 * localProgress;
      } else if (phase === "EXIT") {
        x = (maxT * 0.2) + (maxT * localProgress);
      }
      break;
  }

  // Smooth easing for opacity (cinematic fade instead of linear)
  if (phase === "ENTER") opacity = 1 - Math.pow(1 - localProgress, 3);
  if (phase === "EXIT") opacity = 1 - Math.pow(localProgress, 2);

  // Hard clamp on scale to never exceed 1.1 under any condition
  if (scale > 1.1) scale = 1.1;
  if (scale < 0.9) scale = 0.9;

  return {
    opacity,
    scale,
    x,
    y,
    letterSpacing: `${letterSpacing}em`,
    filter: "none"
  };
}
