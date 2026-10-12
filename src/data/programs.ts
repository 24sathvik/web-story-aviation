export interface Program {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  image?: string;
  href: string;
}

export const programs: Program[] = [
  {
    id: "01",
    title: "COMMERCIAL PILOT TRAINING",
    description: "Launch your career as a professional pilot with our comprehensive commercial training.",
    duration: "18-24 MONTHS",
    image: "/images/cockpit/detail.jpg",
    href: "/programs/commercial"
  },
  {
    id: "02",
    title: "PRIVATE PILOT TRAINING",
    description: "Earn your wings and master the fundamentals of flight.",
    duration: "6-8 MONTHS",
    image: "/images/aircraft/hero.jpg",
    href: "/programs/private"
  },
  {
    id: "03",
    title: "INSTRUMENT RATING",
    description: "Navigate with precision in any weather condition.",
    duration: "3-4 MONTHS",
    image: "/images/simulator/hero.jpg",
    href: "/programs/instrument"
  },
  {
    id: "04",
    title: "MULTI-ENGINE TRAINING",
    description: "Expand your capabilities with complex aircraft operations.",
    duration: "4-6 WEEKS",
    image: "/images/advanced-trainer.jpg",
    href: "/programs/multi-engine"
  },
  {
    id: "05",
    title: "FLIGHT INSTRUCTOR TRAINING",
    description: "Share your passion and build hours by teaching the next generation.",
    duration: "3-4 MONTHS",
    image: "/images/training/classroom.jpg",
    href: "/programs/instructor"
  },
  {
    id: "06",
    title: "GROUND SCHOOL",
    description: "Master the theoretical foundations of modern aviation.",
    duration: "12 WEEKS",
    image: "/images/campus/aerial.jpg",
    href: "/programs/ground-school"
  }
];
