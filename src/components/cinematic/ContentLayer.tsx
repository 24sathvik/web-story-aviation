"use client";

import { CinematicSceneConfig } from "@/lib/scene-types";

interface ContentLayerProps {
  config: CinematicSceneConfig;
}

export function ContentLayer({ config }: ContentLayerProps) {
  const renderSceneContent = () => {
    switch (config.id) {
      case "scene_01_aircraft":
        return (
          <div className="flex flex-col items-center mt-32 text-center">
            <p className="scene-eyebrow text-[var(--color-grey-cool)] text-xs md:text-sm tracking-[0.15em] font-medium mb-4 uppercase">The Journey Begins</p>
            <h1 className="scene-heading text-[var(--color-white-warm)] text-4xl md:text-7xl lg:text-8xl font-bold tracking-tight uppercase leading-none">
              Learn<br/>To Fly.
            </h1>
          </div>
        );
      case "scene_02_campus":
        return (
          <div className="flex flex-col items-center mt-24 text-center">
            <p className="scene-eyebrow text-[var(--color-grey-cool)] text-xs md:text-sm tracking-[0.15em] font-medium mb-4 uppercase">From Above</p>
            <h2 className="scene-heading text-[var(--color-white-warm)] text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight uppercase leading-none">
              Where<br/>Pilots<br/>Are Made.
            </h2>
          </div>
        );
      case "scene_03_entrance":
        return (
          <div className="flex flex-col items-center justify-center h-full text-center door-text-container">
            <p className="scene-eyebrow text-[var(--color-grey-cool)] text-xs md:text-sm tracking-[0.15em] font-medium mb-4 uppercase">Welcome</p>
            <h2 className="scene-heading text-[var(--color-white-warm)] text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight uppercase leading-none">
              Step Inside.
            </h2>
          </div>
        );
      case "scene_04_interior":
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="scene-eyebrow text-[var(--color-grey-cool)] text-xs md:text-sm tracking-[0.15em] font-medium mb-4 uppercase">The Facility</p>
            <h2 className="scene-heading text-[var(--color-white-warm)] text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight uppercase leading-none">
              World-Class<br/>Training.
            </h2>
          </div>
        );
      case "scene_05_training":
        return (
          <div className="flex flex-col items-start justify-center h-full ml-[10%] lg:ml-[15%]">
            <p className="scene-eyebrow text-[var(--color-grey-cool)] text-xs md:text-sm tracking-[0.15em] font-medium mb-4 uppercase">Ground School</p>
            <h2 className="scene-heading text-[var(--color-white-warm)] text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight uppercase leading-none mb-12">
              Knowledge<br/>First.
            </h2>
            <div className="flex flex-col gap-3 font-mono text-[var(--color-grey-cool)] text-sm md:text-base tracking-widest uppercase">
              <span className="metadata-item">Navigation</span>
              <span className="metadata-item">Meteorology</span>
              <span className="metadata-item">Air Regulations</span>
              <span className="metadata-item">Flight Theory</span>
            </div>
          </div>
        );
      case "scene_06_simulator":
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="scene-eyebrow text-[var(--color-grey-cool)] text-xs md:text-sm tracking-[0.15em] font-medium mb-4 uppercase">Simulation</p>
            <h2 className="scene-heading text-[var(--color-white-warm)] text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight uppercase leading-none">
              Train Before<br/>You Fly.
            </h2>
          </div>
        );
      case "scene_07_cockpit":
        return (
          <div className="absolute inset-0 w-full h-full">
            <h2 className="scene-heading absolute top-1/4 left-1/2 -translate-x-1/2 text-[var(--color-white-warm)] text-3xl md:text-5xl font-bold tracking-tight uppercase">
              Master The Cockpit.
            </h2>
            <div className="instrument-label absolute top-[45%] left-[25%] font-mono text-[var(--color-amber-gold)] text-xs md:text-sm tracking-widest uppercase">
              Primary Flight Display
            </div>
            <div className="instrument-label absolute top-[45%] right-[25%] font-mono text-[var(--color-amber-gold)] text-xs md:text-sm tracking-widest uppercase">
              Navigation
            </div>
            <div className="instrument-label absolute bottom-[25%] left-[40%] font-mono text-[var(--color-amber-gold)] text-xs md:text-sm tracking-widest uppercase">
              Engine Parameters
            </div>
          </div>
        );
      case "scene_08_return":
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="scene-eyebrow text-[var(--color-grey-cool)] text-xs md:text-sm tracking-[0.15em] font-medium mb-4 uppercase">The Horizon Awaits</p>
            <h2 className="scene-heading text-[var(--color-white-warm)] text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight uppercase leading-none">
              From Ground<br/>To Sky.
            </h2>
          </div>
        );
      case "scene_09_finale":
        return (
          <div className="flex flex-col items-center mt-32 text-center">
            <h2 className="scene-heading text-[var(--color-white-warm)] text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight uppercase leading-none">
              Your Flight<br/>Starts Here.
            </h2>
          </div>
        );
      case "scene_10_cta":
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <button className="cta-button px-8 py-4 bg-[var(--color-aviation-blue)] text-white font-bold tracking-[0.15em] text-sm md:text-base uppercase rounded-sm hover:bg-blue-600 transition-colors">
              Begin Your Journey
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full z-20 pointer-events-none flex flex-col pt-[15vh]">
      {renderSceneContent()}
    </div>
  );
}
