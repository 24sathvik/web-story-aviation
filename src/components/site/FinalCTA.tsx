export function FinalCTA() {
  return (
    <section className="w-full relative z-10 bg-[var(--background)] px-6 md:px-12 lg:px-24 py-32 md:py-48 flex flex-col items-center justify-center border-t border-white/5 text-center">
      <span className="font-mono text-[10px] tracking-[0.2em] text-white/50 mb-8">READY FOR THE NEXT ALTITUDE?</span>
      
      <button 
        data-magnetic
        data-cursor-text="START"
        className="group flex flex-col items-center cursor-none"
      >
        <h2 className="font-sans text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight text-white leading-[1.1]">
          BEGIN YOUR JOURNEY
        </h2>
        <div className="w-full max-w-[300px] h-px bg-white/30 my-8 group-hover:bg-white/80 transition-colors duration-500" />
        <span className="font-mono text-xs tracking-[0.2em] text-white/60 group-hover:text-white transition-colors duration-500">
          EXPLORE THE ACADEMY &rarr;
        </span>
      </button>
    </section>
  );
}
