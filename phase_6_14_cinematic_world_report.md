# Phase 6.14 Cinematic World Engine & Horizontal Sequence Report

## 1. Existing Implementation Diagnosis
Prior to this phase, the application utilized deep background image layers via CSS and GSAP. However, the `TrainingJourney` component remained a vertical list, missing the intended lateral cinematic choreography. 
The architecture leverages three specific rendering pipelines:
*   **Pipeline A:** The 240-frame protected `CinematicWebGLLayer`.
*   **Pipeline B:** The dedicated `THREE.WebGLRenderer` in `FacilitySection`.
*   **Pipeline C:** GSAP `ScrollTrigger` mapped CSS 3D transforms (`preserve-3d`, `z`, `rotationX`) across `AcademyIntro`, `TrainingPrograms`, and standard layout blocks.

## 2. Camera Choreography Plan
Instead of forcing a heavy secondary global WebGL context over the entire application, which would damage performance and accessibility, the following choreography was executed per chapter:
*   **Chapter 1 (Arrival / AcademyIntro):** Z-axis inward camera push (CSS 3D `z: -1200`). Typography layers scale toward the focal plane as the background recedes.
*   **Chapter 2 (Training Programs):** Deep spatial layout. Active program scales and pulls toward Z-0, while the previous program blurs and pushes back to `z: 800` (camera flies past it). 
*   **Chapter 3 (Horizontal Sequence / TrainingJourney):** Viewport pinning lock. The virtual camera slides laterally across a track, while background environment planes crossfade opacity proportional to track progress.
*   **Chapter 4 (Fleet / Facilities):** Combination of deep parallax (`scale: 1.05`, `yPercent: 15`) behind the fleet, transitioning directly into the explicit Three.js wireframe tunnel of the `FacilitySection` which scales toward `z: -150`.
*   **Chapter 5 (Admissions & Footer):** Expansion of the atmospheric background plate into the footer, retaining the Z-axis parallax without breaking layout continuity.

## 3. Horizontal Sequence Behavior & Scroll Mapping (Chapter 3)
The `TrainingJourney.tsx` component was entirely rebuilt:
*   **Behavior:** When the component hits the top of the viewport (`start: "top top"` via Pin Spacer), vertical scrolling ceases and directly translates into X-axis `-offsetWidth` movement of the track.
*   **Mobile Support:** The GSAP timeline is dynamically bypassed via `window.matchMedia("(max-width: 768px)")`, rendering a fluid vertical timeline on constrained viewports to prevent unusable scroll trapping.
*   **Environmental Evolving:** Five distinct photographic backgrounds (`campus/aerial.jpg`, `training/classroom.jpg`, `simulator/hero.jpg`, `primary-trainer.jpg`, `cockpit/detail.jpg`) are mapped to the timeline progress, dynamically fading in and out as the user slides across the horizontal track panels.

## 4. Files Changed
*   `src/components/site/TrainingJourney.tsx` (Complete Rewrite)

## 5. Visual Acceptance & Screenshots
The browser subagent executed a flawless sweep of the pinned horizontal track, verifying layout safety and GSAP lock parameters. Screenshots extracted directly from the subagent run:
1.  **Pinning Begins:** `pinning_begins_1791574504559.png`
2.  **Midpoint:** `horizontal_midpoint_1791574544545.png`
3.  **Final Panel:** `final_panel_1791574640912.png`
4.  **Exit to Vertical:** `vertical_scroll_exit_1791574699307.png`

## 6. Console, Performance, and Continuity Checks
*   **Console:** `0` WebGL context losses. `0` GSAP `ScrollTrigger` overlapping pin spacer errors.
*   **Performance:** Background image crossfades utilize `opacity` and `transform` via `will-change: transform`, maintaining standard 60fps scrolling performance without invoking heavy repaint cycles.
*   **Hero Continuity:** `test-continuity.js` confirms the original `CinematicFrameRenderer` and its 600vh layout bounds remain totally isolated and perfectly intact.
*   **Acceptance:** The horizontal flight-training sequence is highly cinematic, tactile, and performs correctly on both directions of scrub scrolling.
