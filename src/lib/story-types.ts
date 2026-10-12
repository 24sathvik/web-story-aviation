import { CameraDirection } from "./typography-utils";

export type MotionIntensity = "L1" | "L2" | "L3";

export interface SceneFrameChoreography {
  enter: number;
  holdStart: number;
  holdEnd: number;
  exit: number;
}

export interface StoryContent {
  eyebrow?: string;
  heading: string;
  supporting?: string | string[];
  metadata?: string[];
  cta?: string;
}

export type SafeZone = "left" | "right" | "center" | "lower-left";
export type LayoutType = "standard" | "technical";

export interface StoryScene {
  id: string; // matches scene_XX_slug
  index: number;
  slug: string;
  title: string;
  intensity: MotionIntensity;
  cameraDirection: CameraDirection;
  image?: string;
  imageAvailable: boolean;
  choreography: SceneFrameChoreography;
  content: StoryContent;
  safeZone: SafeZone;
  layout?: LayoutType;
}
