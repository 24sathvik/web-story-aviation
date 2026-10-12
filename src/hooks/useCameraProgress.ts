let currentGlobalProgress = 0;
const listeners = new Set<(progress: number) => void>();

export function subscribeToCameraProgress(callback: (progress: number) => void) {
  listeners.add(callback);
  callback(currentGlobalProgress);
  return () => {
    listeners.delete(callback);
  };
}

export function setCameraProgress(progress: number) {
  currentGlobalProgress = progress;
  listeners.forEach(listener => listener(progress));
  
  if (typeof window !== "undefined") {
    (window as any).__DEBUG_GLOBAL_PROGRESS = progress;
    (window as any).__DEBUG_TARGET_FRAME = Math.max(1, Math.min(240, Math.floor(progress * 239) + 1));
  }
}

export function useCameraProgress() {
  return {
    subscribe: subscribeToCameraProgress,
    get: () => currentGlobalProgress
  };
}
