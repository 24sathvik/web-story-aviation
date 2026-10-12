"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import {
  calculateCameraState,
  calculatePanelTransform,
  ORBITAL_PANELS_DATA,
} from "./HelixChoreography";
import { HelixArchitecturalCore } from "./HelixArchitecturalCore";
import { OrbitalPanelMesh } from "./OrbitalPanelMesh";
import { HelixAircraftSupport } from "./HelixAircraftSupport";
import { HelixEnvironment } from "./HelixEnvironment";

interface HelixPreviewSceneProps {
  singlePanelMode?: boolean;
  debugMode?: boolean;
}

export function HelixPreviewScene({
  singlePanelMode = false,
  debugMode = false,
}: HelixPreviewSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);

  // Debug HUD is hidden by default in normal presentation
  const [showHUD, setShowHUD] = useState(debugMode);
  const [manualScrub, setManualScrub] = useState<number | null>(null);

  // Telemetry state for optional debug readout
  const [telemetry, setTelemetry] = useState({
    progress: 0,
    camX: 0,
    camY: 0,
    camZ: 0,
    activeChapter: "STAGE A: OVERVIEW",
    panel1AngleDeg: 0,
    panel1Distance: 0,
    fps: 60,
    webglStatus: "ACTIVE",
  });

  // Toggle HUD with 'd' keypress for dev QA
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "d" || e.key === "D") {
        setShowHUD((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current || !scrollTrackRef.current) return;

    let animationFrameId: number;
    let isDisposed = false;
    let frameCount = 0;
    let lastFpsUpdate = performance.now();

    // 1. Three.js Scene Setup
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      600
    );

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // 2. Build World Subsystems
    const environment = new HelixEnvironment(scene);
    const architecturalCore = new HelixArchitecturalCore();
    scene.add(architecturalCore.group);

    const aircraftSupport = new HelixAircraftSupport();
    scene.add(aircraftSupport.group);

    // Build Orbital Content Panels
    const panelsToCreate = singlePanelMode
      ? [ORBITAL_PANELS_DATA[0]]
      : ORBITAL_PANELS_DATA;

    const panelMeshes: OrbitalPanelMesh[] = panelsToCreate.map((pData, idx) => {
      const pMesh = new OrbitalPanelMesh(pData, idx);
      scene.add(pMesh.group);
      return pMesh;
    });

    // 3. ScrollTrigger Setup
    let currentScrollProgress = 0;

    const trigger = ScrollTrigger.create({
      trigger: scrollTrackRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: 1.0,
      onUpdate: (self) => {
        currentScrollProgress = self.progress;
      },
    });

    // 4. Handle Window Resize
    const handleResize = () => {
      if (!canvasRef.current || isDisposed) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", handleResize);

    // 5. Main Render Loop
    const render = (timeMs: number) => {
      if (isDisposed) return;

      const timeSec = timeMs * 0.001;
      frameCount++;

      // Effective Progress (scrub override or scroll)
      const effectiveProgress = manualScrub !== null ? manualScrub : currentScrollProgress;

      // Update Camera Choreography
      const camState = calculateCameraState(effectiveProgress);
      camera.position.copy(camState.position);
      camera.fov = camState.fov;
      camera.lookAt(camState.target);
      camera.updateProjectionMatrix();

      // Update Panels Circulation
      panelMeshes.forEach((pMesh) => {
        const transform = calculatePanelTransform(
          pMesh.data,
          pMesh.index,
          effectiveProgress,
          camera.position
        );
        pMesh.update(transform, camera.position);
      });

      // Update Architectural Core, Aircraft, Environment
      architecturalCore.update(effectiveProgress, timeSec);
      aircraftSupport.update(effectiveProgress, timeSec);
      environment.update(timeSec);

      // Render Scene
      renderer.render(scene, camera);

      // Periodically update telemetry for HUD
      if (timeMs - lastFpsUpdate > 400) {
        const measuredFps = Math.round((frameCount * 1000) / (timeMs - lastFpsUpdate));
        frameCount = 0;
        lastFpsUpdate = timeMs;

        let activeChap = "STAGE A: OVERVIEW";
        if (effectiveProgress < 0.15) activeChap = "STAGE A: OVERVIEW";
        else if (effectiveProgress < 0.38) activeChap = "STAGE B: GROUND SCHOOL";
        else if (effectiveProgress < 0.62) activeChap = "STAGE C: SIMULATOR LABS";
        else if (effectiveProgress < 0.85) activeChap = "STAGE D: FLIGHT TRAINING";
        else if (effectiveProgress < 0.95) activeChap = "STAGE E: ADVANCED OPS";
        else activeChap = "STAGE F: FINALE";

        const p1 = panelMeshes[0];
        const p1Dist = p1 ? p1.group.position.distanceTo(camera.position) : 0;
        const p1Angle = p1
          ? (Math.atan2(p1.group.position.x, p1.group.position.z) * 180) / Math.PI
          : 0;

        setTelemetry({
          progress: effectiveProgress,
          camX: camera.position.x,
          camY: camera.position.y,
          camZ: camera.position.z,
          activeChapter: activeChap,
          panel1AngleDeg: Math.round(p1Angle),
          panel1Distance: Math.round(p1Dist * 10) / 10,
          fps: measuredFps,
          webglStatus: "ACTIVE (60FPS)",
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    // Expose debug helpers globally for automated tests
    (window as any).__HELIX_PROGRESS = () => currentScrollProgress;
    (window as any).__HELIX_SET_PROGRESS = (val: number) => {
      currentScrollProgress = val;
      setManualScrub(val);
    };

    // 6. Cleanup & Disposal
    return () => {
      isDisposed = true;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);

      trigger.kill();

      panelMeshes.forEach((pMesh) => pMesh.dispose());
      architecturalCore.dispose();
      aircraftSupport.dispose();
      environment.dispose();
      renderer.dispose();

      delete (window as any).__HELIX_PROGRESS;
      delete (window as any).__HELIX_SET_PROGRESS;
    };
  }, [singlePanelMode, manualScrub]);

  return (
    <div ref={containerRef} className="relative w-full bg-[#050a14] text-white overflow-hidden">
      {/* Pinned Viewport Container */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Floating HUD Telemetry Overlay (Only visible when explicitly toggled on) */}
      {showHUD && (
        <div className="fixed bottom-6 left-6 z-40 bg-slate-950/85 backdrop-blur-md border border-sky-500/30 rounded-xl p-4 text-xs font-mono text-slate-300 shadow-2xl max-w-sm pointer-events-auto">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span className="text-sky-400 font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              HELIX ORBITAL TELEMETRY
            </span>
            <button
              onClick={() => setShowHUD(false)}
              className="text-slate-500 hover:text-white px-1.5 py-0.5 rounded text-[10px] bg-slate-800"
            >
              CLOSE
            </button>
          </div>

          <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
            <div>
              <span className="text-slate-500">SCROLL PROGRESS:</span>{" "}
              <span className="text-amber-300 font-bold">
                {(telemetry.progress * 100).toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-slate-500">RENDER FPS:</span>{" "}
              <span className="text-emerald-400 font-bold">{telemetry.fps}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500">ACTIVE STAGE:</span>{" "}
              <span className="text-sky-300 font-semibold">{telemetry.activeChapter}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500">CAMERA POS:</span>{" "}
              <span className="text-slate-200">
                [{telemetry.camX.toFixed(1)}, {telemetry.camY.toFixed(1)}, {telemetry.camZ.toFixed(1)}]
              </span>
            </div>
            <div>
              <span className="text-slate-500">PANEL 1 ORBIT:</span>{" "}
              <span className="text-amber-400">{telemetry.panel1AngleDeg}°</span>
            </div>
            <div>
              <span className="text-slate-500">DISTANCE:</span>{" "}
              <span className="text-slate-200">{telemetry.panel1Distance}m</span>
            </div>
          </div>

          {/* Quick Scrub Controls for Development Testing */}
          <div className="mt-3 pt-2 border-t border-slate-800 flex gap-1">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                setManualScrub(null);
              }}
              className="px-2 py-1 bg-slate-800 hover:bg-sky-600 rounded text-[10px] transition-colors"
            >
              0%
            </button>
            <button
              onClick={() => {
                const max = document.documentElement.scrollHeight - window.innerHeight;
                window.scrollTo({ top: max * 0.22, behavior: "smooth" });
                setManualScrub(null);
              }}
              className="px-2 py-1 bg-slate-800 hover:bg-sky-600 rounded text-[10px] transition-colors"
            >
              Ch. 1 (22%)
            </button>
            <button
              onClick={() => {
                const max = document.documentElement.scrollHeight - window.innerHeight;
                window.scrollTo({ top: max * 0.48, behavior: "smooth" });
                setManualScrub(null);
              }}
              className="px-2 py-1 bg-slate-800 hover:bg-sky-600 rounded text-[10px] transition-colors"
            >
              Ch. 2 (48%)
            </button>
            <button
              onClick={() => {
                const max = document.documentElement.scrollHeight - window.innerHeight;
                window.scrollTo({ top: max * 0.74, behavior: "smooth" });
                setManualScrub(null);
              }}
              className="px-2 py-1 bg-slate-800 hover:bg-sky-600 rounded text-[10px] transition-colors"
            >
              Ch. 3 (74%)
            </button>
            <button
              onClick={() => {
                const max = document.documentElement.scrollHeight - window.innerHeight;
                window.scrollTo({ top: max * 0.92, behavior: "smooth" });
                setManualScrub(null);
              }}
              className="px-2 py-1 bg-slate-800 hover:bg-sky-600 rounded text-[10px] transition-colors"
            >
              Ch. 4 (92%)
            </button>
            <button
              onClick={() => {
                const max = document.documentElement.scrollHeight - window.innerHeight;
                window.scrollTo({ top: max, behavior: "smooth" });
                setManualScrub(null);
              }}
              className="px-2 py-1 bg-slate-800 hover:bg-sky-600 rounded text-[10px] transition-colors"
            >
              100%
            </button>
          </div>
        </div>
      )}

      {/* 500vh Scroll Track driving GSAP ScrollTrigger */}
      <div ref={scrollTrackRef} className="relative w-full h-[500vh] pointer-events-none" />
    </div>
  );
}
