"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { StoryScene } from "@/lib/story-types";

import { useCameraProgress } from "@/hooks/useCameraProgress";

interface StoryDepthImageProps {
  scene: StoryScene;
  reducedMotion: boolean;
}

export function StoryDepthImage({ scene, reducedMotion }: StoryDepthImageProps) {
  const { subscribe } = useCameraProgress();
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Track if we've successfully preloaded the image
  const [isLoaded, setIsLoaded] = useState(false);
  
  const { enter, holdStart, holdEnd, exit } = scene.choreography;
  // Activate slightly before and after the text sequence for smooth entering
  const activeStart = enter - 5;
  const activeEnd = exit + 10;
  
  useEffect(() => {
    const imageSrc = scene.image;
    if (!imageSrc || isLoaded) return;
    
    const unsubscribe = subscribe((globalProgress) => {
      const currentFrame = globalProgress * 239 + 1;
      const distance = Math.abs(currentFrame - enter);
      if (distance < 20 && !isLoaded) {
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => setIsLoaded(true);
      }
    });
    
    return unsubscribe;
  }, [enter, isLoaded, scene.image, subscribe]);

  const wasActiveRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || !imgRef.current) return;

    const unsubscribe = subscribe((globalProgress) => {
      const currentFrame = globalProgress * 239 + 1;
      const isActive = currentFrame >= activeStart && currentFrame <= activeEnd;

      if (!isActive) {
        if (wasActiveRef.current) {
          wasActiveRef.current = false;
          gsap.set(containerRef.current, { opacity: 0, display: "none" });
        }
        return;
      }
      
      if (!wasActiveRef.current) {
        wasActiveRef.current = true;
        gsap.set(containerRef.current, { display: "flex" });
      }

      // Determine precise phase and normalized local progress (0 to 1) within that phase
      let phase = 'PREPARE';
      let localP = 0;

    if (currentFrame < enter) {
      phase = 'PREPARE';
      localP = 0;
    } else if (currentFrame >= enter && currentFrame < holdStart) {
      phase = 'ENTER';
      localP = gsap.utils.normalize(enter, holdStart, currentFrame);
    } else if (currentFrame >= holdStart && currentFrame < holdEnd) {
      phase = 'HOLD';
      localP = gsap.utils.normalize(holdStart, holdEnd, currentFrame);
    } else if (currentFrame >= holdEnd && currentFrame <= exit) {
      phase = 'EXIT';
      localP = gsap.utils.normalize(holdEnd, exit, currentFrame);
    } else {
      phase = 'DONE';
      localP = 1;
    }

    // Default interpolations based on phases
    let opacity = 0;
    const easeOut = gsap.parseEase("power2.out");
    const easeIn = gsap.parseEase("power2.in");
    const easeInOut = gsap.parseEase("power2.inOut");
    
    if (phase === 'ENTER') opacity = easeOut(localP);
    if (phase === 'HOLD') opacity = 1;
    if (phase === 'EXIT') opacity = 1 - easeIn(localP);

    // Apply reduced motion safely
    if (reducedMotion) {
       gsap.set(containerRef.current, { opacity });
       gsap.set(imgRef.current, { scale: 1, x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, rotationZ: 0, clipPath: 'none' });
       return;
    }

    // Default container spatial identity (editorial photography)
    // We override this per-scene, but establishing baseline
    const container = containerRef.current;
    const img = imgRef.current;
    
    let cZ = 0, cX = '0', cY = '0';
    let iScale = 1, iRotX = 0, iRotY = 0, iRotZ = 0;
    let iClipPath = 'none';
    let iWidth = 'auto', iHeight = 'auto', iMaxWidth = '100%', iMaxHeight = '100%';
    let iBorder = 'none', iShadow = 'none', iRadius = '0px';

    const applyDefaultEditorialFrame = () => {
      iBorder = '1px solid rgba(255,255,255,0.06)';
      iShadow = '0 10px 30px -15px rgba(0,0,0,0.6)';
      iRadius = '2px';
    };

    switch (scene.id) {
      case "scene_03_entrance":
        iWidth = '100vw';
        iHeight = '100vh';
        
        // Starts narrow (10vw width) and expands to wider (50vw width)
        // Starts 55vh height and expands to 80vh height
        const startX = 45; // 45% inset on both sides = 10% visible
        const endX = 25;   // 25% inset on both sides = 50% visible
        const startY = 22.5; // 45% visible
        const endY = 10;     // 80% visible
        
        if (phase === 'PREPARE') {
          iClipPath = `inset(${startY}% ${startX}% ${startY}% ${startX}%)`;
          iScale = 0.88;
          cZ = -250;
          iRotY = 1.5;
          opacity = 0;
        }
        if (phase === 'ENTER') {
          const curX = startX - ((startX - endX) * easeOut(localP));
          const curY = startY - ((startY - endY) * easeOut(localP));
          iClipPath = `inset(${curY}% ${curX}% ${curY}% ${curX}%)`;
          iScale = 0.88 + (0.12 * easeOut(localP)); // 0.88 -> 1.00
          cZ = -250 + (250 * easeOut(localP));
          iRotY = 1.5 - (1.5 * easeOut(localP));
          opacity = 0.55 * easeOut(localP);
        }
        if (phase === 'HOLD') {
          iClipPath = `inset(${endY}% ${endX}% ${endY}% ${endX}%)`;
          iScale = 1.00 + (0.04 * localP); // 1.00 -> 1.04
          cZ = 0 + (20 * localP);
          iRotY = 0;
          opacity = 0.55 + (0.20 * localP); // 0.55 -> 0.75
        }
        if (phase === 'EXIT') {
          const curX = endX * (1 - easeIn(localP));
          const curY = endY * (1 - easeIn(localP));
          iClipPath = `inset(${curY}% ${curX}% ${curY}% ${curX}%)`;
          iScale = 1.04 + (0.05 * localP);
          cZ = 20 + (50 * localP);
          iRotY = 0;
          opacity = 0.75 * (1 - easeIn(localP));
        }
        break;

      case "scene_06_simulator":
        iWidth = '100vw';
        iHeight = '100vh';
        iClipPath = 'polygon(1% 2%, 99% 1%, 98% 99%, 2% 98%)'; // subtle perspective crop/imperfection
        
        if (phase === 'PREPARE') { 
          cZ = -600; 
          iScale = 0.6; 
          iRotY = -2;
          opacity = 0; 
        }
        if (phase === 'ENTER') { 
          cZ = -600 + (480 * easeOut(localP)); // -600 -> -120
          iScale = 0.6 + (0.3 * easeOut(localP)); // 0.6 -> 0.9
          iRotY = -2 + (2 * easeOut(localP));
          opacity = 0.65 * easeOut(localP); // 0 -> 0.65
        }
        if (phase === 'HOLD') { 
          cZ = -120 + (120 * easeInOut(localP)); // -120 -> 0
          iScale = 0.9 + (0.15 * localP); // 0.9 -> 1.05
          iRotY = 0;
          opacity = 0.65 + (0.10 * easeInOut(localP)); // 0.65 -> 0.75
        }
        if (phase === 'EXIT') { 
          cZ = 0 + (400 * easeIn(localP)); // 0 -> +400
          iScale = 1.05 + (0.20 * easeIn(localP)); // 1.05 -> 1.25
          iRotY = 0;
          opacity = 0.75 * (1 - easeIn(localP)); // 0.75 -> 0
        }
        break;

      default:
        break;
    }

    gsap.set(container, { 
      opacity, 
      z: cZ, 
      x: cX, 
      y: cY,
      transformPerspective: 1800
    });
    
    gsap.set(img, { 
      scale: iScale, 
      rotationX: iRotX, 
      rotationY: iRotY, 
      rotationZ: iRotZ, 
      clipPath: iClipPath,
      width: iWidth,
      height: iHeight,
      maxWidth: iMaxWidth,
      maxHeight: iMaxHeight,
      border: iBorder,
      boxShadow: iShadow,
      borderRadius: iRadius
    });

    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      const win = window as unknown as Record<string, unknown>;
      win.__DEBUG_IMG_ACTIVE = scene.title || scene.id;
      win.__DEBUG_IMG_PROG = localP;
      win.__DEBUG_IMG_Z = cZ;
      win.__DEBUG_IMG_SCALE = iScale;
      win.__DEBUG_IMG_OPACITY = opacity;
    }

    });

    return unsubscribe;
  }, [enter, holdStart, holdEnd, exit, scene.id, scene.title, reducedMotion, subscribe, activeStart, activeEnd, isLoaded]);

  if (!scene.image) return null;

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full flex items-center justify-center transform-gpu"
      style={{ display: "none", transformStyle: "preserve-3d" }}
    >
      {/* Fallback styling for images to act as spatial planes */}
      {isLoaded && (
        <img 
          ref={imgRef}
          src={scene.image} 
          alt={scene.title}
          className="w-full h-full object-cover max-w-[100vw] max-h-[100vh] transform-gpu origin-center will-change-transform"
        />
      )}
    </div>
  );
}
