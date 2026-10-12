export interface FleetAircraft {
  id: string;
  name: string;
  type: string;
  role: string;
  specifications: Record<string, string>;
  image?: string;
  href: string;
}

export const fleet: FleetAircraft[] = [
  {
    id: "f1",
    name: "PRIMARY TRAINER",
    type: "Single-Engine",
    role: "Initial Flight Training",
    specifications: {
      "Engine": "[Placeholder]",
      "Cruise Speed": "[Placeholder]",
      "Range": "[Placeholder]"
    },
    image: "/images/primary-trainer.jpg",
    href: "/fleet/primary"
  },
  {
    id: "f2",
    name: "ADVANCED TRAINER",
    type: "Multi-Engine",
    role: "Commercial & Instrument",
    specifications: {
      "Engine": "[Placeholder]",
      "Cruise Speed": "[Placeholder]",
      "Range": "[Placeholder]"
    },
    image: "/images/advanced-trainer.jpg",
    href: "/fleet/advanced"
  }
];
