"use client";

export function CinematicStage({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-[var(--background)]">
      {children}
    </div>
  );
}
