import { StoryScene } from "./story-types";

export const STORY_SCENES: StoryScene[] = [
  {
    id: "scene_01_aircraft",
    index: 1,
    slug: "aircraft",
    title: "Scene 01",
    intensity: "L3", // Scene 01: L2 -> L3 (using L3 as final)
    cameraDirection: "PUSH_FORWARD",
    imageAvailable: false,
    choreography: { enter: 1, holdStart: 6, holdEnd: 30, exit: 35 },
    content: {
      eyebrow: "THE JOURNEY BEGINS",
      heading: "LEARN\nTO FLY."
    },
    safeZone: "left"
  },
  {
    id: "scene_02_campus",
    index: 2,
    slug: "campus",
    title: "Scene 02",
    intensity: "L1",
    cameraDirection: "ASCEND",
    imageAvailable: false,
    choreography: { enter: 36, holdStart: 41, holdEnd: 65, exit: 70 },
    content: {
      eyebrow: "FROM ABOVE",
      heading: "WHERE PILOTS\nARE MADE."
    },
    safeZone: "lower-left"
  },
  {
    id: "scene_03_entrance",
    index: 3,
    slug: "entrance",
    title: "Scene 03",
    intensity: "L3",
    cameraDirection: "PUSH_FORWARD",
    image: "/images/entrance/glass-entrance.jpg",
    imageAvailable: true,
    choreography: { enter: 71, holdStart: 76, holdEnd: 90, exit: 95 },
    content: {
      eyebrow: "WELCOME",
      heading: "STEP INSIDE."
    },
    safeZone: "center"
  },
  {
    id: "scene_04_interior",
    index: 4,
    slug: "interior",
    title: "Scene 04",
    intensity: "L2", // Scene 04: L1 -> L2
    cameraDirection: "PUSH_FORWARD",
    imageAvailable: false,
    choreography: { enter: 96, holdStart: 101, holdEnd: 115, exit: 120 },
    content: {
      eyebrow: "THE FACILITY",
      heading: "WORLD-CLASS\nTRAINING."
    },
    safeZone: "right"
  },
  {
    id: "scene_05_training",
    index: 5,
    slug: "training",
    title: "Scene 05",
    intensity: "L1",
    cameraDirection: "PUSH_FORWARD",
    imageAvailable: false,
    choreography: { enter: 121, holdStart: 126, holdEnd: 140, exit: 145 },
    content: {
      eyebrow: "GROUND SCHOOL",
      heading: "KNOWLEDGE\nFIRST.",
      metadata: ["CURRICULUM", "DISCIPLINE", "PRECISION"]
    },
    safeZone: "left"
  },
  {
    id: "scene_06_simulator",
    index: 6,
    slug: "simulator",
    title: "Scene 06",
    intensity: "L3",
    cameraDirection: "PUSH_FORWARD",
    image: "/images/simulator/hero.jpg",
    imageAvailable: true,
    choreography: { enter: 146, holdStart: 151, holdEnd: 170, exit: 175 },
    content: {
      eyebrow: "SIMULATION",
      heading: "TRAIN\nBEFORE\nYOU FLY."
    },
    safeZone: "center"
  },
  {
    id: "scene_07_cockpit",
    index: 7,
    slug: "cockpit",
    title: "Scene 07",
    intensity: "L2",
    cameraDirection: "PUSH_FORWARD",
    imageAvailable: false,
    choreography: { enter: 176, holdStart: 180, holdEnd: 191, exit: 195 },
    content: {
      eyebrow: "COCKPIT",
      heading: "MASTER\nTHE COCKPIT.",
      metadata: ["ALTITUDE", "HEADING", "AIRSPEED"]
    },
    safeZone: "right",
    layout: "technical"
  },
  {
    id: "scene_08_return",
    index: 8,
    slug: "return",
    title: "Scene 08",
    intensity: "L2",
    cameraDirection: "PULL_BACKWARD",
    imageAvailable: false,
    choreography: { enter: 196, holdStart: 200, holdEnd: 211, exit: 215 },
    content: {
      eyebrow: "THE HORIZON",
      heading: "FROM GROUND\nTO SKY."
    },
    safeZone: "center"
  },
  {
    id: "scene_09_finale",
    index: 9,
    slug: "finale",
    title: "Scene 09",
    intensity: "L2", // Scene 09: L1 -> L2
    cameraDirection: "PULL_BACKWARD",
    imageAvailable: false,
    choreography: { enter: 216, holdStart: 220, holdEnd: 226, exit: 230 },
    content: {
      eyebrow: "YOUR FLIGHT",
      heading: "YOUR FLIGHT\nSTARTS HERE."
    },
    safeZone: "center"
  },
  {
    id: "scene_10_aerial",
    index: 10,
    slug: "aerial",
    title: "Scene 10",
    intensity: "L1",
    cameraDirection: "DESCEND",
    imageAvailable: false,
    choreography: { enter: 231, holdStart: 233, holdEnd: 238, exit: 240 },
    content: {
      heading: "",
      cta: "BEGIN YOUR JOURNEY"
    },
    safeZone: "center"
  }
];
