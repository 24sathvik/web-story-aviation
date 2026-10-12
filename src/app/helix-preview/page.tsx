"use client";

import { useState } from "react";
import Link from "next/link";
import { HelixPreviewScene } from "@/components/helix/HelixPreviewScene";

export default function HelixPreviewPage() {
  const [singlePanelMode, setSinglePanelMode] = useState(false);

  return (
    <main className="relative min-h-screen bg-[#050a14] select-none">
      {/* Sleek Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-slate-950/40 backdrop-blur-md border-b border-slate-800/50 pointer-events-auto">
        <div className="flex items-center gap-5">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-mono tracking-wider text-slate-300 hover:text-white transition-colors uppercase px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-600"
          >
            <span>←</span> Back to Main Website
          </Link>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              <h1 className="text-xs sm:text-sm font-semibold tracking-wider text-white uppercase">
                AERO HELIX // ORBITAL STORYTELLING WORLD
              </h1>
            </div>
          </div>
        </div>

        {/* Minimal Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900/80 border border-slate-800 rounded-lg p-1 text-[11px] font-mono">
            <button
              onClick={() => setSinglePanelMode(false)}
              className={`px-2.5 py-1 rounded transition-colors ${
                !singlePanelMode
                  ? "bg-sky-600 text-white font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Full Orbit
            </button>
            <button
              onClick={() => setSinglePanelMode(true)}
              className={`px-2.5 py-1 rounded transition-colors ${
                singlePanelMode
                  ? "bg-amber-600 text-white font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Single Panel (M1)
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[10px] font-mono text-slate-400">
            <span>SCROLL TO CIRCULATE</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500">PRESS &apos;D&apos; FOR TELEMETRY</span>
          </div>
        </div>
      </header>

      {/* 3D Scene Viewport with Pinned ScrollTrack */}
      <HelixPreviewScene singlePanelMode={singlePanelMode} debugMode={false} />
    </main>
  );
}
