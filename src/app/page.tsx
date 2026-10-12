"use client";

import { useRef } from "react";
import { CinematicStage } from "@/components/cinematic/CinematicStage";
import { ScrollTrack } from "@/components/cinematic/ScrollTrack";
import { StoryOrchestrator } from "@/components/cinematic/StoryOrchestrator";
import { CustomCursor } from "@/components/cinematic/CustomCursor";
import { CinematicNavigation } from "@/components/cinematic/CinematicNavigation";
import { useLenis } from "@/hooks/useLenis";
import { CinematicFrameRenderer } from "@/components/cinematic/CinematicFrameRenderer";
import { ImageDepthLayer } from "@/components/cinematic/ImageDepthLayer";
import { CinematicWebGLLayer } from "@/components/cinematic/CinematicWebGLLayer";

import { AcademyIntroduction } from "@/components/site/AcademyIntroduction";
import { TrainingPrograms } from "@/components/site/TrainingPrograms";
import { TrainingJourney } from "@/components/site/TrainingJourney";
import { FleetSection } from "@/components/site/FleetSection";
import { FacilitySection } from "@/components/site/FacilitySection";
import { ProofSection } from "@/components/site/ProofSection";
import { StoriesSection } from "@/components/site/StoriesSection";
import { FAQSection } from "@/components/site/FAQSection";
import { AdmissionsTransition } from "@/components/site/AdmissionsTransition";
import { Footer } from "@/components/site/Footer";

export default function CinematicExperience() {
  const { lenisStatus } = useLenis();
  const trackRef = useRef<HTMLDivElement>(null);

  return (
    <main className="relative w-full bg-[var(--background)] cursor-none">
      <CustomCursor />
      <CinematicNavigation />

      <ScrollTrack ref={trackRef}>
        <CinematicStage>
          <CinematicFrameRenderer />
          <ImageDepthLayer />
          <CinematicWebGLLayer />
          <StoryOrchestrator />
        </CinematicStage>
      </ScrollTrack>
      
      <div id="academy"><AcademyIntroduction /></div>
      <div id="programs"><TrainingPrograms /></div>
      <div id="journey"><TrainingJourney /></div>
      <div id="fleet"><FleetSection /></div>
      <div id="facilities"><FacilitySection /></div>
      <div id="why-choose-us"><ProofSection /></div>
      <div id="stories"><StoriesSection /></div>
      <div id="faq"><FAQSection /></div>
      <div id="admissions"><AdmissionsTransition /></div>
      <Footer />
    </main>
  );
}
