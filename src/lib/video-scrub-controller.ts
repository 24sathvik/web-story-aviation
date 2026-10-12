/**
 * VideoScrubController
 * 
 * A deterministic video scrubbing engine that prevents seek storms.
 * 
 * Architecture:
 *   ScrollTrigger → resolveSceneProgress → controller.setTarget(time) → seek pipeline
 * 
 * Key behaviors:
 * - Only the LATEST target time matters. Intermediate targets are discarded.
 * - A new seek is NOT started while the browser is still resolving the previous seek.
 * - requestVideoFrameCallback is used (where supported) to know when a frame is actually painted.
 * - An epsilon prevents redundant seeks for sub-frame differences.
 */

export interface VideoScrubDebugState {
  targetTime: number;
  renderedTime: number;
  isSeeking: boolean;
  hasPendingTarget: boolean;
  readyState: number;
  networkState: number;
  bufferedRanges: string;
  frameCount: number;
}

type DebugCallback = (state: VideoScrubDebugState) => void;

export class VideoScrubController {
  private video: HTMLVideoElement;
  private latestTarget: number = 0;
  private lastSeekedTo: number = -1;
  private isSeeking: boolean = false;
  private hasPendingTarget: boolean = false;
  private frameCount: number = 0;
  private destroyed: boolean = false;
  private debugCallback: DebugCallback | null = null;
  private rvfcSupported: boolean = false;

  // Epsilon: ~1 frame at 24fps = 0.0417s. Use half a frame to avoid visible skips.
  private static readonly SEEK_EPSILON = 0.02;

  constructor(video: HTMLVideoElement) {
    this.video = video;
    this.rvfcSupported = 'requestVideoFrameCallback' in video;

    // Bind event listeners
    this.onSeeked = this.onSeeked.bind(this);
    video.addEventListener('seeked', this.onSeeked);
  }

  /**
   * Set the desired video time. Called from the scroll pipeline.
   * Does NOT blindly assign video.currentTime.
   */
  setTarget(time: number): void {
    if (this.destroyed) return;

    // Clamp to valid range
    const duration = this.video.duration;
    if (!isFinite(duration) || duration === 0) return;
    const clamped = Math.max(0, Math.min(time, duration - 0.001));

    this.latestTarget = clamped;

    // If the target is effectively the same as what we last sought to, skip
    if (Math.abs(clamped - this.lastSeekedTo) < VideoScrubController.SEEK_EPSILON) {
      this.hasPendingTarget = false;
      this.emitDebug();
      return;
    }

    // If a seek is already in flight, just mark that we have a newer target
    if (this.isSeeking) {
      this.hasPendingTarget = true;
      this.emitDebug();
      return;
    }

    // Otherwise, initiate a seek now
    this.executeSeek(clamped);
  }

  private executeSeek(time: number): void {
    this.isSeeking = true;
    this.hasPendingTarget = false;
    this.lastSeekedTo = time;
    this.video.currentTime = time;
    this.emitDebug();
  }

  /**
   * Called when the browser has finished seeking and rendered the target frame.
   */
  private onSeeked(): void {
    this.isSeeking = false;
    this.frameCount++;

    // If a newer target arrived while we were seeking, process it now
    if (this.hasPendingTarget) {
      const nextTarget = this.latestTarget;
      if (Math.abs(nextTarget - this.lastSeekedTo) >= VideoScrubController.SEEK_EPSILON) {
        this.executeSeek(nextTarget);
        return;
      }
      this.hasPendingTarget = false;
    }

    // Use requestVideoFrameCallback to confirm frame presentation (non-blocking)
    if (this.rvfcSupported && !this.destroyed) {
      (this.video as HTMLVideoElement & { requestVideoFrameCallback: (cb: () => void) => number })
        .requestVideoFrameCallback(() => {
          this.emitDebug();
        });
    } else {
      this.emitDebug();
    }
  }

  onDebug(callback: DebugCallback): void {
    this.debugCallback = callback;
  }

  private emitDebug(): void {
    if (!this.debugCallback || this.destroyed) return;

    const video = this.video;
    const buffered = video.buffered;
    let bufferedStr = '';
    for (let i = 0; i < buffered.length; i++) {
      bufferedStr += `${buffered.start(i).toFixed(1)}-${buffered.end(i).toFixed(1)}`;
      if (i < buffered.length - 1) bufferedStr += ', ';
    }

    this.debugCallback({
      targetTime: this.latestTarget,
      renderedTime: video.currentTime,
      isSeeking: this.isSeeking || video.seeking,
      hasPendingTarget: this.hasPendingTarget,
      readyState: video.readyState,
      networkState: video.networkState,
      bufferedRanges: bufferedStr,
      frameCount: this.frameCount,
    });
  }

  destroy(): void {
    this.destroyed = true;
    this.debugCallback = null;
    this.video.removeEventListener('seeked', this.onSeeked);
  }
}
