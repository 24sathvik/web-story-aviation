"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useCameraProgress } from "@/hooks/useCameraProgress";
import { STORY_SCENES } from "@/lib/story-scenes";

// Development toggle for mandatory A/B testing
const WEBGL_ENABLED = true;

// Helper to extract bounds
function getSceneBounds(id: string) {
  const scene = STORY_SCENES.find(s => s.id === id);
  if (!scene) return { enter: 0, holdStart: 0, holdEnd: 0, exit: 0 };
  return scene.choreography;
}

const bounds03 = getSceneBounds("scene_03_entrance");
const bounds06 = getSceneBounds("scene_06_simulator");
const bounds09 = getSceneBounds("scene_09_finale");
const bounds10 = getSceneBounds("scene_10_aerial");

export function CinematicWebGLLayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { subscribe } = useCameraProgress();

  useEffect(() => {
    if (!WEBGL_ENABLED || !canvasRef.current || !containerRef.current) return;

    // 1. Setup Architecture
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: false, // keep it lightweight
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 0;

    // 2. Geometry Creation
    // Create reusable particle systems
    const createParticleSystem = (count: number, color: number, size: number, zRange: number, spread: number) => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const randoms = new Float32Array(count); // For individual subtle motion

      for (let i = 0; i < count; i++) {
        // Random spread inside a tube
        const angle = Math.random() * Math.PI * 2;
        const radius = (Math.random() * 0.8 + 0.2) * spread; // hollow center
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = Math.sin(angle) * radius;
        positions[i * 3 + 2] = -Math.random() * zRange; // spread from 0 to -zRange
        randoms[i] = Math.random();
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

      const material = new THREE.PointsMaterial({
        color,
        size: isMobile ? size * 0.8 : size,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const points = new THREE.Points(geometry, material);
      points.visible = false; // Hide by default
      scene.add(points);
      
      return { points, material, geometry, positions, count };
    };

    // SCENE 03: Entrance - Architectural Dust (Very subtle, wide spread)
    const count03 = isMobile ? 50 : 150;
    const sys03 = createParticleSystem(count03, 0xffffff, 1.2, 500, 300);

    // SCENE 06: Simulator - Deep Spatial Tunnel
    const count06 = isMobile ? 120 : 300;
    const sys06 = createParticleSystem(count06, 0xaaccff, 1.5, 1000, 400);

    // 3. Resize handler
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // 4. State tracking
    let globalProgress = 0;
    let currentFrame = 1;
    let lastProgress = 0;
    
    const unsubscribe = subscribe((p) => {
      globalProgress = p;
      currentFrame = p * 239 + 1;
    });

    // Normalization helper
    const normalize = (val: number, min: number, max: number) => {
      return Math.max(0, Math.min(1, (val - min) / Math.max(1, max - min)));
    };

    // 5. Render Loop
    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.01;
      const deltaProgress = globalProgress - lastProgress;
      lastProgress = globalProgress;

      // Ensure we don't render crazy velocities if user scrolls too fast
      const velocity = Math.max(-0.02, Math.min(0.02, deltaProgress));

      // --------------------------------------------------
      // SCENE 03: ENTRANCE (Frames 71 - 95)
      // --------------------------------------------------
      if (currentFrame >= bounds03.enter - 5 && currentFrame <= bounds03.exit + 5) {
        sys03.points.visible = true;
        
        let localP = 0;
        let opacity = 0;
        if (currentFrame < bounds03.holdStart) {
          localP = normalize(currentFrame, bounds03.enter, bounds03.holdStart);
          opacity = localP * 0.15; // Max 15% opacity
        } else if (currentFrame <= bounds03.holdEnd) {
          localP = normalize(currentFrame, bounds03.holdStart, bounds03.holdEnd);
          opacity = 0.15;
        } else {
          localP = normalize(currentFrame, bounds03.holdEnd, bounds03.exit);
          opacity = 0.15 * (1 - localP);
        }

        if (reducedMotion) {
          sys03.material.opacity = opacity * 0.5;
          sys03.points.position.z = 0;
        } else {
          sys03.material.opacity = opacity;
          // Move particles forward as we enter
          const totalTravel = 200;
          const currentZ = normalize(currentFrame, bounds03.enter, bounds03.exit) * totalTravel;
          sys03.points.position.z = currentZ;
          // Subtle ambient drift
          sys03.points.rotation.y = time * 0.02;
        }
      } else {
        sys03.points.visible = false;
      }

      // --------------------------------------------------
      // SCENE 06: SIMULATOR (Frames 146 - 175)
      // --------------------------------------------------
      if (currentFrame >= bounds06.enter - 10 && currentFrame <= bounds06.exit + 10) {
        sys06.points.visible = true;
        
        let localP = 0;
        let opacity = 0;
        if (currentFrame < bounds06.holdStart) {
          localP = normalize(currentFrame, bounds06.enter, bounds06.holdStart);
          opacity = localP * 0.35; // Max 35% opacity for simulator
        } else if (currentFrame <= bounds06.holdEnd) {
          localP = normalize(currentFrame, bounds06.holdStart, bounds06.holdEnd);
          opacity = 0.35;
        } else {
          localP = normalize(currentFrame, bounds06.holdEnd, bounds06.exit);
          opacity = 0.35 * (1 - Math.pow(localP, 2)); // fade out fast as we pass through
        }

        if (reducedMotion) {
          sys06.material.opacity = opacity * 0.5;
          sys06.points.position.z = 0;
        } else {
          sys06.material.opacity = opacity;
          
          let currentZ = 0;
          if (currentFrame < bounds06.holdStart) {
             const enterP = normalize(currentFrame, bounds06.enter, bounds06.holdStart);
             currentZ = enterP * -200; // compress backwards slightly as camera approaches
          } else if (currentFrame > bounds06.holdEnd) {
             const exitP = normalize(currentFrame, bounds06.holdEnd, bounds06.exit);
             currentZ = -200 + (exitP * 1400); // rush past viewer
          } else {
             currentZ = -200; // hold compressed state
          }
          sys06.points.position.z = currentZ;
          sys06.points.rotation.z = time * 0.05;
        }
      } else {
        sys06.points.visible = false;
      }

      // Only render WebGL if particles are currently active in Scene 03 or Scene 06
      if (sys03.points.visible || sys06.points.visible) {
        renderer.render(scene, camera);
      } else {
        renderer.clear();
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // 6. Cleanup
    return () => {
      unsubscribe();
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      
      sys03.geometry.dispose();
      sys03.material.dispose();
      sys06.geometry.dispose();
      sys06.material.dispose();
      
      renderer.dispose();
    };
  }, [subscribe]);

  if (!WEBGL_ENABLED) return null;

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full z-20 pointer-events-none">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full pointer-events-none"
        style={{ display: "block" }}
      />
    </div>
  );
}
