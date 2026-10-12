# Phase 7.4 — Comprehensive Visual Audit of Master Homepage

**Date:** October 12, 2026  
**Audited URL:** `http://localhost:3847`  
**Viewport Tested:** 1344 x 723 (Desktop) & 390 x 844 (Mobile)  

---

## 1. Executive Visual Audit Summary

While the website architecture incorporates a 240-frame WebP hero, Lenis smooth scrolling, GSAP ScrollTrigger, and Three.js, visual inspection across the scroll progression reveals several critical defects that disrupt the feeling of a single, continuous, premium aviation brand journey:

1. **Abrupt Hero &rarr; AcademyIntroduction Handoff:**
   - As the 240-frame WebP hero finishes (Frame 240, around scrollY = 3615px), the sticky hero container translates out of the viewport abruptly, leaving a black void (scrollY = 3615 &rarr; 4338px) before the AcademyIntroduction stage takes over.
   - AcademyIntroduction has a harsh `border-t border-white/10` cut line and starts with an unpinned scroll phase, breaking spatial camera immersion.

2. **Severe Content Collision in TrainingJourney (`#journey`):**
   - The large headline `"FROM FIRST STEP TO FLIGHT DECK."` is placed at `top-32` in a sticky/absolute position (`z-20`).
   - The horizontally moving content panels (`.journey-panel`) pass directly behind and collide with the headline text, making both the headline and the active journey panels unreadable during horizontal travel.

3. **Static Staging & Spatial Imbalance in TrainingPrograms (`#programs`):**
   - The left heading `"A CLEAR PATH TO PROFESSIONAL AVIATION."` remains completely static while the right card deck translates vertically.
   - The active card has a high vertical offset, causing cards to clip against the viewport bottom on standard laptop heights, while the upper-left of the viewport remains empty.

4. **Incomplete Architectural Context in FacilitySection (`#facilities`):**
   - The Three.js tunnel background is overly dim and detached from the foreground content cards.
   - Text contains a bracketed staging placeholder (`[ Simulator architectural description pending verified academy copy. ]`) which breaks the premium luxury illusion.

5. **Admissions & Footer Connection:**
   - AdmissionsTransition CTA button sits isolated against a cropped background image immediately above the footer, lacking an atmospheric visual runway leading into the final brand impression.

---

## 2. Section-by-Section Visual Inspection

| Section | Current Camera / Environmental Motion | Spatial Depth Assessment | Synchronization & Layout Issues | Glassmorphism Quality |
| :--- | :--- | :--- | :--- | :--- |
| **Hero (240 Frames)** | Deterministic camera approach to aircraft | High (240-frame WebP sequence) | Clean throughout hero; navbar is 100% transparent and borderless | N/A (Transparent over hero as required) |
| **Hero &rarr; Academy Transition** | Hero translates up off-screen; Academy scrolls in from bottom | Disjointed (physical DOM scroll gap of ~720px) | Black void between 3615px and 4338px; harsh top border divider | Glass navbar triggers at boundary |
| **AcademyIntroduction** | Runway aerial image drifts in Z-space; 3D kinetic typography lines staggered | Moderate 3D depth; good perspective frame | Headline and telemetry panel hold nicely, but exit transition into Programs is a sudden unpin | High: FAA Part 141 glass panel has crisp contrast and border |
| **TrainingPrograms** | Pinned vertical deck (`+=1800` scroll distance); scale/blur z-transitions | Moderate 3D; active card scales to 1.8x and blurs on exit | Left column is totally static; cards cut off near bottom on smaller viewports | High: Translucent card surfaces with clean borders |
| **TrainingJourney** | Pinned horizontal track scrubbed with ScrollTrigger | Horizontal slide with fading background plates | **CRITICAL DEFECT:** Header text directly collides with horizontal moving cards | High: Midnight glass panels (`bg-[#030611]/65`) |
| **FleetSection** | Image container mask expand + inner image Y-parallax | Parallax scale & mask clip-path | Aircraft photography is prominent, but vertical spacing causes excessive dead gaps between aircraft | Clean specification pills and meta card |
| **FacilitySection** | Three.js cylinder wireframe tunnel + particle field | Real-time WebGL depth | Tunnel is very dim; text has placeholder `[ Simulator architectural description pending... ]` | Clean glass borders on facility cards |
| **AdmissionsTransition** | Z-space scale and opacity pull-in | Deep perspective pull-in | Enquiry button is isolated; needs richer atmospheric glow | High: Glass button and expandable contact modal |
| **Footer** | Static document bottom (`relative z-20`) | Clean bottom anchor | Reached naturally without dead scroll void; links fully responsive | High-contrast dark finish |

---

## 3. The 3 Highest-Impact Visual Priorities for Phase 7.4

1. **Priority 1: Fix TrainingJourney Header Collision:** Re-architect the layout so the sticky title and horizontal cards occupy distinct visual zones (e.g., top header bar with horizontal stage beneath), eliminating text-on-text collisions.
2. **Priority 2: Seamless Hero &rarr; AcademyIntroduction Camera Continuity:** Remove the black gap and harsh divider line; synchronize the completion of Frame 240 with the entrance of AcademyIntroduction's spatial runway horizon.
3. **Priority 3: Refine TrainingPrograms Spatial Choreography:** Coordinate the left headline with the active card progress, add camera pan dynamics, and ensure cards are perfectly centered in the viewport.
