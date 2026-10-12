export interface JourneyStage {
  id: string;
  number: string;
  title: string;
  description: string;
  label?: string;
  href?: string;
}

export const journeySteps: JourneyStage[] = [
  { 
    id: "step-1", 
    number: "01", 
    title: "DISCOVER", 
    description: "Explore our professional aviation programs and facility to determine the right path for your career.",
    label: "ACADEMY"
  },
  { 
    id: "step-2", 
    number: "02", 
    title: "ENROLL", 
    description: "Complete formal admissions clearance, aviation medical evaluation, and student flight documentation.",
    label: "ADMISSIONS"
  },
  { 
    id: "step-3", 
    number: "03", 
    title: "GROUND SCHOOL", 
    description: "Build the theoretical foundations required in aerodynamics, meteorology, air law, and navigation.",
    label: "GROUND"
  },
  { 
    id: "step-4", 
    number: "04", 
    title: "SIMULATOR", 
    description: "Master instrument flight procedures and emergency maneuvers inside FAA-qualified Level D flight simulators.",
    label: "SIMULATION"
  },
  { 
    id: "step-5", 
    number: "05", 
    title: "FLIGHT TRAINING", 
    description: "Take the controls with experienced flight instructors across modern glass-cockpit training aircraft.",
    label: "FLIGHT"
  },
  { 
    id: "step-6", 
    number: "06", 
    title: "CHECK RIDE", 
    description: "Demonstrate precision aeronautical decision-making and maneuvers during official flight examination.",
    label: "ASSESSMENT"
  },
  { 
    id: "step-7", 
    number: "07", 
    title: "NEXT ALTITUDE", 
    description: "Graduate into commercial aviation operations, airline cadet placement, or advanced type ratings.",
    label: "CAREER",
    href: "#admissions"
  }
];
