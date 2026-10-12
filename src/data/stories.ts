export interface Story {
  id: string;
  studentName?: string;
  role?: string;
  quote?: string;
  story?: string;
  image?: string;
  metadata?: {
    program?: string;
    year?: string;
  };
  verified?: boolean;
}

export const stories: Story[] = []; // Intentionally empty. No fabricated content.
