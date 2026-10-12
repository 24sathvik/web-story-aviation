import React from "react";

export function SectionHeading({ eyebrow, heading, supporting }: { eyebrow: string, heading: string, supporting?: string }) {
  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      <span className="font-mono text-[10px] tracking-[0.2em] text-white/50">{eyebrow}</span>
      <h2 className="font-sans text-3xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white leading-[1.1] whitespace-pre-line">
        {heading}
      </h2>
      {supporting && (
        <p className="mt-4 font-sans text-sm md:text-lg text-white/70 max-w-2xl leading-relaxed">
          {supporting}
        </p>
      )}
    </div>
  );
}
