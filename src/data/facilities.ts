export interface Facility {
  id: string;
  name: string;
  category: string;
  description: string;
  image?: string;
  href?: string;
}

export const facilities: Facility[] = [
  {
    id: "fac-1",
    name: "CLASSROOMS",
    category: "GROUND SCHOOL",
    description: "Dedicated aeronautical ground theory lecture suites equipped with digital flight planning and airspace charting systems.",
    image: "/images/campus/aerial.jpg"
  },
  {
    id: "fac-2",
    name: "SIMULATOR",
    category: "SIMULATION",
    description: "FAA-qualified Level D flight simulation bays with full wraparound visual projection and motion capabilities.",
    image: "/images/simulator.jpg"
  },
  {
    id: "fac-3",
    name: "BRIEFING ROOMS",
    category: "TRAINING",
    description: "Pre-flight and post-flight mission review stations configured for flight data debriefs and weather analysis.",
    image: "/images/training/classroom.jpg"
  },
  {
    id: "fac-4",
    name: "FLIGHT OPERATIONS",
    category: "OPERATIONS",
    description: "Real-time dispatch, apron coordination, and flight tracking center overseeing all academy aircraft movements.",
    image: "/images/interior/corridor.jpg"
  }
];
