export interface TrustPillar {
  id: string;
  number: string;
  title: string;
  description: string;
  href?: string;
}

export interface Metric {
  id: string;
  value: string;
  label: string;
  verified: boolean;
}

export const trustPillars: TrustPillar[] = [
  {
    id: "tp-1",
    number: "01",
    title: "TRAINING PHILOSOPHY",
    description: "Competency-based aviation education aligned with international airline transport standards and threat-and-error management.",
  },
  {
    id: "tp-2",
    number: "02",
    title: "INSTRUCTION",
    description: "Senior airline captains and certified flight instructors delivering personalized one-on-one aeronautical mentorship.",
  },
  {
    id: "tp-3",
    number: "03",
    title: "TECHNOLOGY",
    description: "Garmin G1000 glass cockpits and full-motion flight simulators replicating real-world adverse weather conditions.",
  },
  {
    id: "tp-4",
    number: "04",
    title: "ENVIRONMENT",
    description: "Uncompromised safety culture, active tower-controlled airspace exposure, and modern campus facilities.",
  }
];

export const metrics: Metric[] = []; // Intentionally empty. No fabricated statistics.
