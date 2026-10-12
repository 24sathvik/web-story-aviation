import { CINEMATIC_SCENES, TOTAL_SCROLL_WEIGHT } from "@/lib/scenes";
import { ResolvedSceneState } from "@/lib/scene-types";

export function resolveSceneProgress(globalProgress: number): ResolvedSceneState {
  let accumulatedWeight = 0;
  let activeScene = CINEMATIC_SCENES[0];
  let localProgress = 0;
  
  let sceneStartProgress = 0;
  let sceneEndProgress = 0;

  for (let i = 0; i < CINEMATIC_SCENES.length; i++) {
    const scene = CINEMATIC_SCENES[i];
    const prevWeight = accumulatedWeight;
    accumulatedWeight += scene.scrollWeight;
    
    const startThreshold = prevWeight / TOTAL_SCROLL_WEIGHT;
    const endThreshold = accumulatedWeight / TOTAL_SCROLL_WEIGHT;
    
    if (globalProgress >= startThreshold && globalProgress <= endThreshold) {
      activeScene = scene;
      localProgress = (globalProgress - startThreshold) / (endThreshold - startThreshold);
      sceneStartProgress = startThreshold;
      sceneEndProgress = endThreshold;
      break;
    }
  }

  if (globalProgress >= 1.0) {
    activeScene = CINEMATIC_SCENES[CINEMATIC_SCENES.length - 1];
    localProgress = 1.0;
    sceneStartProgress = (TOTAL_SCROLL_WEIGHT - activeScene.scrollWeight) / TOTAL_SCROLL_WEIGHT;
    sceneEndProgress = 1.0;
  }

  const mappedVideoTime = activeScene.videoStart + (activeScene.videoEnd - activeScene.videoStart) * localProgress;

  return {
    globalProgress,
    sceneIndex: activeScene.index,
    sceneId: activeScene.id,
    sceneProgress: localProgress,
    sceneStartProgress,
    sceneEndProgress,
    mappedVideoTime,
    isEntering: localProgress < 0.1,
    isActive: localProgress >= 0.1 && localProgress <= 0.9,
    isLeaving: localProgress > 0.9,
  };
}
