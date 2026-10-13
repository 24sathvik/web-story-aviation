"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export interface TerrainConfig {
  /** Variant preset for distinctive section atmosphere */
  variant?: "programs" | "proof" | "admissions";
  /** Mountain peak elevation amplitude (default: 8.5) */
  elevation?: number;
  /** Primary mountain crest highlight color (hex, e.g. 0x00e5ff for neon cyan) */
  crestColor?: number;
  /** Mid-elevation / slope tone (hex, e.g. 0x2563eb for electric blue) */
  midColor?: number;
  /** Deep valley / base tone (hex, default 0x0f172a or 0x030611) */
  baseColor?: number;
  /** Atmospheric fog color blending with site dark background */
  fogColor?: number;
  /** Camera scroll travel distance along Z (default: 36.0) */
  scrollDistance?: number;
  /** Ambient flyover drift speed (default: 0.28) */
  ambientSpeed?: number;
  /** Overall terrain opacity (default: 0.92) */
  opacity?: number;
  /** Base particle size in pixels (default: 1.6 for tiny starlight pinpoints) */
  pointSize?: number;
  /** Wireframe line opacity on mountain crests (default: 0.32) */
  wireframeOpacity?: number;
  /** Enable mouse pointer hover interactivity (default: true) */
  interactive?: boolean;
  /** Additional container styling classes */
  className?: string;
}

// -------------------------------------------------------------
// GLSL Shaders: Tidecrest Particle & Wireframe Ridgeline Terrain
// -------------------------------------------------------------

const COMMON_DISPLACEMENT_GLSL = `
  // Layered harmonic elevation for Tidecrest: Twin mountain ranges flanking an open wave swell
  float calculateTidecrestHeight(vec2 pos, float scroll) {
    vec2 p = pos * 0.038;
    p.y -= scroll * 2.4 + uTime * 0.08;

    // 1. Bilateral Flank Modulation:
    // Center corridor (|pos.x| near 0) is a low valley / open water swell.
    // Flanks (|pos.x| > 10.0) soar into jagged mountain ridgelines.
    float flank = smoothstep(6.0, 48.0, abs(pos.x));

    // 2. Open Swell in the valley basin (horizontal rolling wave rows)
    float wavePhase = pos.y * 0.22 - uTime * 0.9 - scroll * 3.2;
    float swell = sin(wavePhase) * 1.25 + 
                  cos(pos.y * 0.45 + pos.x * 0.12 - uTime * 0.5) * 0.65 +
                  sin(pos.x * 0.35 + pos.y * 0.15) * 0.4;

    // 3. Jagged Mountain Ridgelines on the flanks (domain warped Tidecrest noise)
    vec2 wp = p * 1.35;
    float warp = sin(wp.x * 1.8 + wp.y * 1.3);
    wp += vec2(warp * 0.38, -warp * 0.28);

    // Sharp folded ridge crests (1.0 - abs(sin))
    float r1 = 1.0 - abs(sin(wp.x * 2.8 + wp.y * 1.9));
    float r2 = 1.0 - abs(cos(wp.x * 1.9 - wp.y * 2.7));
    float r3 = sin(wp.x * 5.2 + wp.y * 4.1) * 0.35;

    float mountain = (pow(r1, 2.4) * 4.6 + pow(r2, 1.9) * 2.8 + r3);

    // 4. Interactive Mouse Pointer Deflection / Ripple
    float mouseWave = 0.0;
    if (uMouseActive > 0.01) {
      vec2 mWorld = uMouse * vec2(38.0, 26.0);
      float mDist = length(pos.xy - mWorld);
      mouseWave = exp(-mDist * 0.09) * sin(mDist * 0.65 - uTime * 4.0) * 2.2 * uMouseActive;
    }

    // Combine swell and mountain ranges
    float totalElevation = (swell * (1.0 - flank * 0.75) + mountain * flank * 2.3) * uElevation + mouseWave;

    // Perimeter boundary falloff to dissolve edges smoothly
    float distFromCenter = length(pos / 78.0);
    float edgeAtten = smoothstep(1.05, 0.25, distFromCenter);

    return totalElevation * edgeAtten;
  }
`;

const POINTS_VERTEX_SHADER = `
  uniform float uTime;
  uniform float uScrollProgress;
  uniform float uElevation;
  uniform float uScrollSpeed;
  uniform vec2 uMouse;
  uniform float uMouseActive;
  uniform float uBasePointSize;
  uniform float uPixelRatio;
  uniform vec3 uBaseColor;
  uniform vec3 uMidColor;
  uniform vec3 uCrestColor;

  varying vec3 vWorldPosition;
  varying float vElevation;
  varying vec3 vColor;
  varying float vAlpha;

  ${COMMON_DISPLACEMENT_GLSL}

  void main() {
    vec3 pos = position;
    float scrollOffset = uScrollProgress * uScrollSpeed;
    float elev = calculateTidecrestHeight(pos.xy, scrollOffset);
    pos.z += elev;

    vElevation = elev;
    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPos.xyz;

    vec4 mvPosition = viewMatrix * worldPos;
    gl_Position = projectionMatrix * mvPosition;

    // Elevation-based color gradation matching Tidecrest aesthetic:
    // Valley / swell = deep electric sapphire
    // Mid slopes = neon cyan
    // High peaks = brilliant white-cyan
    float normElevation = clamp((elev + 2.5) / 13.0, 0.0, 1.0);
    vec3 col = mix(uBaseColor, uMidColor, smoothstep(0.05, 0.45, normElevation));
    col = mix(col, uCrestColor, smoothstep(0.40, 0.88, normElevation));
    
    // Add bright white-hot spark to highest ridge crests
    col = mix(col, vec3(0.95, 0.99, 1.0), smoothstep(0.85, 1.0, normElevation) * 0.7);
    vColor = col;

    // Gentle twinkling particle shimmer
    float twinkle = 0.82 + 0.25 * sin(uTime * 2.6 + pos.x * 2.4 + pos.y * 3.1);

    // TINY STARLIGHT PINPOINT PARTICLES:
    // Base size in pixels: 1.1px in swell up to 2.2px on high ridges
    float baseSize = mix(uBasePointSize * 0.7, uBasePointSize * 1.35, normElevation);
    // Subtle distance scaling ensuring particles remain delicate pinpoints
    float distAtten = clamp(32.0 / -mvPosition.z, 0.7, 1.4);
    gl_PointSize = clamp(baseSize * distAtten * twinkle * uPixelRatio, 1.0, 3.2);

    // Flank points are brighter, swell points have soft shimmer
    float flank = smoothstep(5.0, 42.0, abs(pos.x));
    vAlpha = mix(0.72, 1.0, flank) * twinkle;
  }
`;

const POINTS_FRAGMENT_SHADER = `
  uniform float uOpacity;
  uniform vec3 uFogColor;
  uniform vec3 uCameraPos;

  varying vec3 vWorldPosition;
  varying float vElevation;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Render tiny, glowing circular particles with intense core and soft corona
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;

    // Razor-sharp central hot spark with luminous halo
    float core = smoothstep(0.18, 0.0, dist);
    float halo = smoothstep(0.5, 0.05, dist);

    vec3 finalColor = mix(vColor, vec3(1.0), core * 0.88);

    // Atmospheric distance fog fade
    float camDist = length(vWorldPosition - uCameraPos);
    float fog = clamp((camDist - 25.0) / 120.0, 0.0, 1.0);
    fog = pow(fog, 1.4);

    finalColor = mix(finalColor, uFogColor, fog * 0.8);

    float alpha = (core * 0.95 + halo * 0.45) * vAlpha * (1.0 - fog * 0.65) * uOpacity;
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

const WIREFRAME_VERTEX_SHADER = `
  uniform float uTime;
  uniform float uScrollProgress;
  uniform float uElevation;
  uniform float uScrollSpeed;
  uniform vec2 uMouse;
  uniform float uMouseActive;
  uniform vec3 uMidColor;
  uniform vec3 uCrestColor;

  varying vec3 vWorldPosition;
  varying float vElevation;
  varying vec3 vColor;
  varying float vAlpha;

  ${COMMON_DISPLACEMENT_GLSL}

  void main() {
    vec3 pos = position;
    float scrollOffset = uScrollProgress * uScrollSpeed;
    float elev = calculateTidecrestHeight(pos.xy, scrollOffset);
    pos.z += elev;

    vElevation = elev;
    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPos.xyz;

    // Ridge elevation grading
    float normElevation = clamp((elev + 2.0) / 12.0, 0.0, 1.0);
    vColor = mix(uMidColor, uCrestColor, smoothstep(0.3, 0.85, normElevation));

    // The wireframe grid is only visible on the elevated mountain ridges!
    // In the low valley basin/swell, wireframe fades to 0 so only glowing particles shimmer
    float flank = smoothstep(8.0, 38.0, abs(pos.x));
    float ridgeVisibility = smoothstep(0.24, 0.70, normElevation) * flank;
    vAlpha = ridgeVisibility;

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const WIREFRAME_FRAGMENT_SHADER = `
  uniform float uOpacity;
  uniform float uWireframeOpacity;
  uniform vec3 uFogColor;
  uniform vec3 uCameraPos;

  varying vec3 vWorldPosition;
  varying float vElevation;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    if (vAlpha < 0.01) discard;

    float camDist = length(vWorldPosition - uCameraPos);
    float fog = clamp((camDist - 25.0) / 120.0, 0.0, 1.0);
    vec3 finalColor = mix(vColor, uFogColor, fog * 0.75);

    float alpha = vAlpha * uWireframeOpacity * uOpacity * (1.0 - fog * 0.65);
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export function ScrollTerrainBackground({
  variant = "programs",
  elevation = 8.5,
  crestColor = 0x00e5ff, // Neon cyan / Tidecrest peak color
  midColor = 0x2563eb,   // Electric azure blue
  baseColor = 0x0f172a,  // Deep navy
  fogColor = 0x030611,   // Dark site background blend
  scrollDistance = 36.0,
  ambientSpeed = 0.28,
  opacity = 0.92,
  pointSize = 1.6,       // Delicate starlight pinpoints
  wireframeOpacity = 0.32,
  interactive = true,
  className = "",
}: TerrainConfig) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth < 768;

    // 1. Scene & Low-Altitude Corridor Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(54, 1, 0.1, 350);

    const initialCamX = 0.0;
    const initialCamY = isMobile ? 11.5 : 9.5;
    const initialCamZ = 34.0;
    const initialPitch = -0.28;
    camera.position.set(initialCamX, initialCamY, initialCamZ);
    camera.rotation.x = initialPitch;

    // 2. High-performance WebGL Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: !isMobile,
        powerPreference: "high-performance",
      });
    } catch (e) {
      console.warn("WebGL initialization failed for ScrollTerrainBackground:", e);
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.0 : 1.5);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);

    const handleResize = () => {
      if (!container || !renderer) return;
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // 3. Dual Geometry System: Dense Grid for Points + Mountain Ridgeline Wireframe
    // Higher grid resolution creates dense, continuous starlight field matching the reference
    const gridX = isMobile ? 110 : 180;
    const gridY = isMobile ? 110 : 180;
    const geometry = new THREE.PlaneGeometry(150, 140, gridX, gridY);

    // Pointer / Mouse interaction state
    const targetMouse = new THREE.Vector2(0, 0);
    const currentMouse = new THREE.Vector2(0, 0);
    let targetMouseActive = 0.0;
    let currentMouseActive = 0.0;

    // Shared Shader Uniforms
    const sharedUniforms = {
      uTime: { value: 0.0 },
      uScrollProgress: { value: 0.0 },
      uElevation: { value: elevation },
      uScrollSpeed: { value: 4.8 },
      uMouse: { value: currentMouse },
      uMouseActive: { value: currentMouseActive },
      uBasePointSize: { value: pointSize },
      uPixelRatio: { value: dpr },
      uBaseColor: { value: new THREE.Color(baseColor) },
      uMidColor: { value: new THREE.Color(midColor) },
      uCrestColor: { value: new THREE.Color(crestColor) },
      uFogColor: { value: new THREE.Color(fogColor) },
      uOpacity: { value: opacity },
      uWireframeOpacity: { value: wireframeOpacity },
      uCameraPos: { value: camera.position },
    };

    // 4. Points Mesh (Luminous Particle Swell & Ridge Dots)
    const pointsMaterial = new THREE.ShaderMaterial({
      vertexShader: POINTS_VERTEX_SHADER,
      fragmentShader: POINTS_FRAGMENT_SHADER,
      uniforms: sharedUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const pointsMesh = new THREE.Points(geometry, pointsMaterial);
    pointsMesh.rotation.x = -Math.PI / 2;
    pointsMesh.position.set(0, -2.2, -10.0);
    scene.add(pointsMesh);

    // 5. Wireframe Mesh (Connected Mountain Ridges seen on the peaks in Tidecrest)
    const wireframeMaterial = new THREE.ShaderMaterial({
      vertexShader: WIREFRAME_VERTEX_SHADER,
      fragmentShader: WIREFRAME_FRAGMENT_SHADER,
      uniforms: sharedUniforms,
      wireframe: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial);
    wireframeMesh.rotation.x = -Math.PI / 2;
    wireframeMesh.position.set(0, -2.2, -10.0);
    scene.add(wireframeMesh);

    // 6. Interactive Mouse Pointer Listeners attached to parent section
    // (Container stays pointer-events-none so user can freely scroll and click content)
    const targetParent = container.parentElement || container;
    const handlePointerMove = (e: PointerEvent) => {
      if (!interactive || !targetParent) return;
      const rect = targetParent.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetMouse.x = x;
      targetMouse.y = y;
      targetMouseActive = 1.0;
    };

    const handlePointerLeave = () => {
      targetMouseActive = 0.0;
    };

    if (interactive && targetParent) {
      targetParent.addEventListener("pointermove", handlePointerMove, { passive: true });
      targetParent.addEventListener("pointerleave", handlePointerLeave, { passive: true });
    }

    // 7. Scroll Tracking via Direct Viewport Measuring (No ScrollTrigger conflict!)
    let targetScrollProgress = 0;
    let currentScrollProgress = 0;

    // 8. Render Loop with Culling & Smooth Dampening
    let isVisible = false;
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const render = () => {
      if (isVisible) {
        const delta = clock.getDelta();

        // Direct scroll calculation relative to viewport
        const rect = container.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const totalDistance = windowHeight + rect.height;
        const currentDistance = windowHeight - rect.top;
        targetScrollProgress = Math.max(0, Math.min(1, currentDistance / totalDistance));

        // Ambient continuous flyover wave drift
        if (!prefersReducedMotion) {
          sharedUniforms.uTime.value += delta * ambientSpeed;
        }

        // Smooth scroll damping
        currentScrollProgress += (targetScrollProgress - currentScrollProgress) * 0.12;
        sharedUniforms.uScrollProgress.value = currentScrollProgress;

        // Smooth mouse pointer response
        currentMouse.x += (targetMouse.x - currentMouse.x) * 0.08;
        currentMouse.y += (targetMouse.y - currentMouse.y) * 0.08;
        currentMouseActive += (targetMouseActive - currentMouseActive) * 0.06;
        sharedUniforms.uMouseActive.value = currentMouseActive;

        // 3D Camera Flight Path
        const travel = currentScrollProgress * scrollDistance;
        camera.position.z = initialCamZ - travel;
        camera.position.y = initialCamY - Math.sin(currentScrollProgress * Math.PI) * 1.6;
        
        // Interactive mouse parallax
        camera.position.x = initialCamX + currentMouse.x * 3.2;
        camera.rotation.x = initialPitch + (currentScrollProgress - 0.5) * 0.08 - currentMouse.y * 0.04;
        camera.rotation.y = -currentMouse.x * 0.05;
        camera.rotation.z = Math.sin(currentScrollProgress * Math.PI * 2) * 0.015 + currentMouse.x * 0.02;

        sharedUniforms.uCameraPos.value.copy(camera.position);

        // Boundary edge dissolve fade
        const edgeFade = Math.sin(currentScrollProgress * Math.PI);
        sharedUniforms.uOpacity.value = opacity * Math.min(1.0, edgeFade * 2.4);

        renderer.render(scene, camera);
      }
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    // 9. IntersectionObserver to preserve 60fps across the entire page
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { rootMargin: "300px" }
    );
    observer.observe(container);

    // 10. Memory Cleanup
    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (interactive && targetParent) {
        targetParent.removeEventListener("pointermove", handlePointerMove);
        targetParent.removeEventListener("pointerleave", handlePointerLeave);
      }

      geometry.dispose();
      pointsMaterial.dispose();
      wireframeMaterial.dispose();
      renderer.dispose();
    };
  }, [
    elevation,
    crestColor,
    midColor,
    baseColor,
    fogColor,
    scrollDistance,
    ambientSpeed,
    opacity,
    pointSize,
    wireframeOpacity,
    interactive,
  ]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0 select-none ${className}`}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full pointer-events-none block"
      />
      {/* Soft atmospheric gradient transitions ensuring text readability */}
      <div className="absolute top-0 left-0 w-full h-32 md:h-44 bg-gradient-to-b from-[var(--background)] via-[var(--background)]/70 to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 w-full h-32 md:h-44 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/70 to-transparent pointer-events-none z-10" />
    </div>
  );
}
