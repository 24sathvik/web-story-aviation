export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  verified?: boolean;
}

export const faqs: FAQ[] = [
  {
    id: "faq-1",
    question: "What are the eligibility requirements for admission?",
    answer: "Applicants must be at least 17 years of age for private flight training (18 for commercial licensing), possess a high school diploma or equivalent, and demonstrate English proficiency meeting ICAO Level 4 standards.",
  },
  {
    id: "faq-2",
    question: "How long is the typical training duration?",
    answer: "Full-time integrated Commercial Pilot License (CPL) training typically spans 14 to 18 months, covering Ground School, simulator phases, cross-country flight, and multi-engine ratings.",
  },
  {
    id: "faq-3",
    question: "What is the admissions procedure?",
    answer: "The admissions process includes an online application submission, an aeronautical aptitude and cognitive assessment, an in-person or virtual interview with the admissions board, and verification of academic credentials.",
  },
  {
    id: "faq-4",
    question: "Are there any specific medical requirements?",
    answer: "Students must hold an FAA or national regulatory First Class Medical Certificate for commercial flight training, confirming satisfactory cardiovascular health, vision (correctable to 20/20), and hearing.",
  }
];
