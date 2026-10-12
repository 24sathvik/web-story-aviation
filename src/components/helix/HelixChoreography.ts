import * as THREE from "three";

export interface PanelData {
  id: string;
  chapter: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  metrics: { label: string; value: string }[];
  imagePath: string;
  focalProgress: number; // scroll progress (0..1) where panel is in prime focus
  frontAngle: number;    // angular position when in prime foreground focus (radians)
  elevationY: number;    // vertical elevation on the spiral
}

export const ORBITAL_PANELS_DATA: PanelData[] = [
  {
    id: "panel-ground-school",
    chapter: "CHAPTER 01",
    badge: "FOUNDATIONAL THEORY",
    title: "Ground School",
    subtitle: "Aeronautical Sciences & Meteorology",
    description:
      "Master high-altitude meteorology, aerodynamics, navigation principles, and FAA regulations before ever entering the flight deck.",
    metrics: [
      { label: "Ground Hours", value: "120 Hrs" },
      { label: "Certifications", value: "FAA Part 141" },
      { label: "Exam Readiness", value: "100% First-Time" },
    ],
    imagePath: "/images/training/classroom.jpg",
    focalProgress: 0.22,
    frontAngle: 0.23, // ~13.2 degrees (front-right foreground)
    elevationY: -13.0,
  },
  {
    id: "panel-simulator-lab",
    chapter: "CHAPTER 02",
    badge: "PRECISION SIMULATION",
    title: "Simulator Labs",
    subtitle: "Level-D Motion Flight Systems",
    description:
      "Encounter severe weather, system emergencies, and complex IFR approaches inside certified full-motion glass cockpit flight simulators.",
    metrics: [
      { label: "Sim Fidelity", value: "Level-D Motion" },
      { label: "Scenarios", value: "300+ Emergent" },
      { label: "Cockpit Type", value: "Garmin G1000 NXi" },
    ],
    imagePath: "/images/simulator/hero.jpg",
    focalProgress: 0.48,
    frontAngle: -0.22, // ~-12.6 degrees (front-left foreground)
    elevationY: -1.5,
  },
  {
    id: "panel-flight-training",
    chapter: "CHAPTER 03",
    badge: "ACTIVE FLIGHT OPERATIONS",
    title: "Flight Training",
    subtitle: "Dual & Solo Aircraft Maneuvers",
    description:
      "Take controls of our modern glass-cockpit fleet. Transition seamlessly from dual-instruction maneuvers to solo cross-country navigation.",
    metrics: [
      { label: "Flight Hours", value: "250+ Total" },
      { label: "Cross-Country", value: "50+ Solo Hrs" },
      { label: "Fleet Readiness", value: "100% Glass Deck" },
    ],
    imagePath: "/images/aircraft/hero.jpg",
    focalProgress: 0.74,
    frontAngle: 0.23, // ~13.2 degrees (front-right foreground)
    elevationY: 10.5,
  },
  {
    id: "panel-advanced-ops",
    chapter: "CHAPTER 04",
    badge: "AIRLINE CAREER TRANSITION",
    title: "Advanced Operations",
    subtitle: "Multi-Engine & Turbine Command",
    description:
      "Complete advanced multi-engine ratings, crew resource management, and turbine transition preparing pilots directly for major airline cockpits.",
    metrics: [
      { label: "Engine Rating", value: "Multi-Engine Commercial" },
      { label: "Type Transition", value: "Turboprop / Jet Bridge" },
      { label: "Placement", value: "Direct Carrier Fast-Track" },
    ],
    imagePath: "/images/cockpit/detail.jpg",
    focalProgress: 0.92,
    frontAngle: -0.22, // ~-12.6 degrees (front-left foreground)
    elevationY: 21.5,
  },
];

export interface CameraState {
  position: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
}

export interface PanelTransformState {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  prominence: number;
  opacity: number;
  inFront: boolean;
  distanceToCamera: number;
}

/**
 * Camera Choreography across Stages A through F
 * Mathematically balanced camera path framing both the substantial content panel
 * and the monumental central spiral structure side-by-side with zero edge clipping.
 */
export function calculateCameraState(progress: number): CameraState {
  const p = Math.max(0, Math.min(1, progress));

  const keyframes: {
    t: number;
    pos: [number, number, number];
    target: [number, number, number];
    fov: number;
  }[] = [
    {
      t: 0.0,
      // Stage A: Establishing Wide - Full spiral & orbiting constellation
      pos: [0, -8, 48],
      target: [0, -3, 0],
      fov: 46,
    },
    {
      t: 0.22,
      // Stage B: Ground School - Camera moves to [1.2, -13.0, 29.5]
      // Framing Panel 1 in front-right foreground (~12.8m away) and spiral on left
      pos: [1.2, -13.0, 29.5],
      target: [1.0, -13.0, 0],
      fov: 43,
    },
    {
      t: 0.48,
      // Stage C: Simulator Labs - Camera banks across to [-1.2, -1.5, 29.5]
      // Framing Panel 2 in front-left foreground (~12.8m away) and spiral on right
      pos: [-1.2, -1.5, 29.5],
      target: [-1.0, -1.5, 0],
      fov: 43,
    },
    {
      t: 0.74,
      // Stage D: Flight Training - Camera climbs to [1.2, 10.5, 29.5]
      // Framing Panel 3 in front-right foreground (~12.8m away) with aircraft crossing midground
      pos: [1.2, 10.5, 29.5],
      target: [1.0, 10.5, 0],
      fov: 43,
    },
    {
      t: 0.92,
      // Stage E: Advanced Ops - Camera climbs to [-1.2, 21.5, 29.5]
      // Framing Panel 4 in front-left foreground (~12.8m away)
      pos: [-1.2, 21.5, 29.5],
      target: [-1.0, 21.5, 0],
      fov: 43,
    },
    {
      t: 1.0,
      // Stage F: Heroic Finale - Elevated overview looking down into the illuminated spiral world
      pos: [14.0, 36.0, 48.0],
      target: [0, 6, 0],
      fov: 48,
    },
  ];

  let i = 0;
  while (i < keyframes.length - 1 && keyframes[i + 1].t < p) {
    i++;
  }

  const k1 = keyframes[i];
  const k2 = keyframes[Math.min(i + 1, keyframes.length - 1)];

  const segRange = k2.t - k1.t;
  const rawRatio = segRange > 0 ? (p - k1.t) / segRange : 0;
  // Smooth cubic ease for fluid cinematic tracking
  const easeRatio = rawRatio * rawRatio * (3 - 2 * rawRatio);

  const pos = new THREE.Vector3(
    k1.pos[0] + (k2.pos[0] - k1.pos[0]) * easeRatio,
    k1.pos[1] + (k2.pos[1] - k1.pos[1]) * easeRatio,
    k1.pos[2] + (k2.pos[2] - k1.pos[2]) * easeRatio
  );

  const target = new THREE.Vector3(
    k1.target[0] + (k2.target[0] - k1.target[0]) * easeRatio,
    k1.target[1] + (k2.target[1] - k1.target[1]) * easeRatio,
    k1.target[2] + (k2.target[2] - k1.target[2]) * easeRatio
  );

  const fov = k1.fov + (k2.fov - k1.fov) * easeRatio;

  return { position: pos, target, fov };
}

/**
 * Calculates physical 3D circulation of panels around the central spiral axis
 */
export function calculatePanelTransform(
  panel: PanelData,
  _index: number,
  progress: number,
  cameraPos: THREE.Vector3
): PanelTransformState {
  const p = Math.max(0, Math.min(1, progress));

  // Angular speed: ~1.5 full orbits across the scroll sequence
  const orbitSpeed = Math.PI * 3.0;

  // Exact front angle matching at focalProgress:
  const currentAngle = panel.frontAngle + (p - panel.focalProgress) * orbitSpeed;

  // Prominence curve: peaks smoothly at focalProgress
  const focalDist = Math.abs(p - panel.focalProgress);
  const rawProminence = Math.max(0, 1.0 - focalDist / 0.16);
  const smoothProminence = rawProminence * rawProminence * (3 - 2 * rawProminence);

  // Orbital Radius: 16.8m base, expands to 17.5m in foreground to clear the 13.5m spiral ribbon
  const baseRadius = 16.8;
  const currentRadius = baseRadius + smoothProminence * 0.7;

  // Vertical position along the spiral
  const currentY = panel.elevationY + (p - panel.focalProgress) * 4.0;

  // Cartesian coordinates around central spiral axis
  const x = Math.sin(currentAngle) * currentRadius;
  const z = Math.cos(currentAngle) * currentRadius;
  const position = new THREE.Vector3(x, currentY, z);

  const inFront = z > -1.0;

  // Orientation: blend between tangent angle and looking directly at camera
  const tangentYaw = -currentAngle + Math.PI;

  const toCamera = new THREE.Vector3().subVectors(cameraPos, position).normalize();
  const directLookYaw = Math.atan2(toCamera.x, toCamera.z);
  const directLookPitch = -Math.asin(Math.max(-1, Math.min(1, toCamera.y)));

  // When active (prominence > 0), panel turns to directly face camera with gentle parallax tilt
  const finalYaw = THREE.MathUtils.lerp(tangentYaw, directLookYaw, Math.max(0.4, smoothProminence * 0.96));
  const finalPitch = THREE.MathUtils.lerp(0, directLookPitch * 0.5, smoothProminence);

  const rotation = new THREE.Euler(finalPitch, finalYaw, 0, "YXZ");

  // Dynamic Scale: 1.08x in active foreground, 0.85x in distant background
  const baseScale = 0.85;
  const focalScale = baseScale + smoothProminence * 0.23;
  const scale = new THREE.Vector3(focalScale, focalScale, focalScale);

  const distanceToCamera = position.distanceTo(cameraPos);

  // Depth factor: crisp in foreground, soft atmospheric depth when far
  const depthFactor = Math.max(0.35, Math.min(1.0, 1.4 - (distanceToCamera - 12.0) / 35.0));
  const opacity = Math.max(0.4, depthFactor * (0.6 + 0.4 * smoothProminence));

  return {
    position,
    rotation,
    scale,
    prominence: smoothProminence,
    opacity,
    inFront,
    distanceToCamera,
  };
}
