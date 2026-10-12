export type AnimationIntensity = "L1" | "L2" | "L3";

export type ScenePurpose = 
  | "ESTABLISH" 
  | "TRANSITION" 
  | "INFORM" 
  | "IMPRESS" 
  | "IMMERSE" 
  | "RELEASE" 
  | "RESOLVE" 
  | "CONVERT";

export type ImageStrategy = 
  | "VIDEO_TO_IMAGE" 
  | "PARALLAX" 
  | "MASKED_REVEAL" 
  | "DEPTH_LAYER" 
  | "SECONDARY_LAYER" 
  | "VIDEO_TO_IMAGE_HERO" 
  | "VIDEO_TO_IMAGE_PARALLAX" 
  | "VIDEO_PRIMARY" 
  | "SUBTLE_LAYER" 
  | "FINAL_HOLD";

export type CameraBehavior = 
  | "PUSH_FORWARD" 
  | "PULL_BACK" 
  | "DESCEND" 
  | "ASCEND" 
  | "ENTER_STRUCTURE" 
  | "CORRIDOR_FORWARD" 
  | "HERO_PUSH" 
  | "COCKPIT_ENTRY" 
  | "EXTERIOR_RELEASE";

export interface CinematicSceneConfig {
  id: string;
  index: number;
  slug: string;
  label: string;
  
  videoStart: number;
  videoEnd: number;
  
  scrollWeight: number; // Calibration weight out of total
  
  startProgress?: number;
  endProgress?: number;
  
  intensity: AnimationIntensity;
  purpose: ScenePurpose;
  
  imageAvailable?: boolean;
  imageStrategy: ImageStrategy;
  cameraBehavior: CameraBehavior;
  
  // Stubs for future configuration layers
  layout?: Record<string, unknown>;
  transitionStrategy?: Record<string, unknown>;
  contentStrategy?: Record<string, unknown>;
  mobileStrategy?: Record<string, unknown>;
}

export interface ResolvedSceneState {
  globalProgress: number;
  sceneIndex: number;
  sceneId: string;
  sceneProgress: number;
  sceneStartProgress: number;
  sceneEndProgress: number;
  mappedVideoTime: number;
  isEntering: boolean;
  isActive: boolean;
  isLeaving: boolean;
}
