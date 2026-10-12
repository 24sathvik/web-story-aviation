"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { facilities } from "@/data/facilities";
import Image from "next/image";
import * as THREE from "three";

export function FacilitySection() {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // --- THREE.JS SIMULATOR ENVIRONMENT ---
    let renderer: THREE.WebGLRenderer;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let tunnelGroup: THREE.Group;
    let animationFrameId: number;

    const handleResize = () => {
      if (!canvasRef.current || !camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    if (canvasRef.current) {
      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x05070a, 0.02);

      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 100;

      renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      tunnelGroup = new THREE.Group();
      scene.add(tunnelGroup);

      // Create an avionics flight corridor tunnel structure
      const geometry = new THREE.CylinderGeometry(40, 40, 450, 20, 45, true);
      const material = new THREE.MeshBasicMaterial({ 
        color: 0x60a5fa, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.28 
      });
      const tunnel = new THREE.Mesh(geometry, material);
      tunnel.rotation.x = Math.PI / 2;
      tunnelGroup.add(tunnel);

      // Add concentric flight guidance rings along the corridor
      const ringGeo = new THREE.RingGeometry(24, 25, 32);
      const ringMat = new THREE.MeshBasicMaterial({ 
        color: 0x93c5fd, 
        transparent: true, 
        opacity: 0.35, 
        side: THREE.DoubleSide 
      });
      for (let r = -150; r <= 150; r += 60) {
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.z = r;
        tunnelGroup.add(ring);
      }

      // Add floating data particles
      const particleGeo = new THREE.BufferGeometry();
      const particleCount = 1000;
      const positions = new Float32Array(particleCount * 3);
      for(let i=0; i<particleCount*3; i++) {
        positions[i] = (Math.random() - 0.5) * 100;
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particleMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, transparent: true, opacity: 0.4 });
      const particles = new THREE.Points(particleGeo, particleMat);
      tunnelGroup.add(particles);

      const render = () => {
        renderer.render(scene, camera);
        tunnelGroup.rotation.z += 0.001; // slow constant ambient rotation
        animationFrameId = requestAnimationFrame(render);
      };
      render();

      window.addEventListener('resize', handleResize);

      // Scroll linked camera flight
      gsap.to(camera.position, {
        z: -150,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        }
      });
    }

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>('.facility-item');
      
      items.forEach((item) => {
        // Set individual item perspective
        gsap.set(item, { perspective: 1500, transformStyle: "preserve-3d" });

        const elements = item.querySelectorAll('.fac-reveal');
        const imgContainer = item.querySelector('.fac-img-container');
        const img = item.querySelector('.fac-img');
        const textCol = item.querySelector('.fac-text-col');

        // Initial deep 3D spatial positioning
        gsap.set(elements, { opacity: 0, z: -200, rotationX: 10, y: 50 });
        
        if (imgContainer && img) {
          gsap.set(imgContainer, { 
            clipPath: 'inset(20% 20% 20% 20%)',
            z: -400,
            rotationY: 15,
            rotationX: 10,
            opacity: 0
          });
          gsap.set(img, { scale: 1.3, yPercent: 15 });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: item,
              start: "top 95%",
              end: "center 40%",
              scrub: 1
            }
          });

          // Move the image forward in Z-space and untwist it
          tl.to(imgContainer, {
            clipPath: 'inset(0% 0% 0% 0%)',
            z: 0,
            rotationY: 0,
            rotationX: 0,
            opacity: 1,
            ease: "power2.out",
            duration: 1.5
          }, 0);

          // Deep internal parallax
          tl.to(img, {
            yPercent: -15,
            scale: 1.05,
            ease: "none",
            duration: 2.5
          }, 0);
        }

        if (textCol) {
           gsap.set(textCol, { transformStyle: "preserve-3d" });
           
           // Text pushes forward into focal plane
           gsap.to(elements, {
             opacity: 1, 
             y: 0, 
             z: 0,
             rotationX: 0,
             stagger: 0.1,
             ease: "power2.out",
             scrollTrigger: { 
               trigger: item, 
               start: "top 80%",
               end: "center 40%",
               scrub: 1
             }
           });
        }
      });
    }, containerRef);
    return () => {
      ctx.revert();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer?.dispose();
    };
  }, []);

  return (
    <section 
      ref={containerRef}
      className="w-full relative z-10 bg-[var(--background)] px-6 md:px-12 lg:px-24 py-32 md:py-48 border-t border-white/10 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none z-0">
         <div className="sticky top-0 w-full h-screen">
           <canvas ref={canvasRef} className="w-full h-full absolute inset-0 mix-blend-screen opacity-80" />
           {/* Fallback gradient in case WebGL fails or takes time */}
           <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)] via-transparent to-[var(--background)]" />
         </div>
      </div>
      
      <div className="max-w-[1600px] mx-auto w-full mb-24 md:mb-48 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="col-span-1 md:col-span-8 flex flex-col gap-6">
            <span className="font-mono text-[10px] tracking-[0.2em] text-white/50">
              THE TRAINING ENVIRONMENT
            </span>
            <h2 className="font-sans text-4xl md:text-5xl lg:text-7xl font-medium tracking-tight text-white leading-[1.05] max-w-[800px]">
              DESIGNED AROUND<br />
              THE WAY PILOTS LEARN.
            </h2>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto w-full flex flex-col gap-32 md:gap-48 relative z-20">
        {facilities.map((facility, index) => {
          const isRight = index % 2 !== 0;
          
          return (
            <article key={facility.id} className="facility-item grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-center">
              {/* Image Column */}
              <div className={`col-span-1 md:col-span-7 ${isRight ? 'md:order-2' : 'md:order-1'}`}>
                {facility.image ? (
                  <div className="fac-img-container w-full aspect-[4/3] relative overflow-hidden bg-white/5 will-change-transform">
                    <Image 
                      src={facility.image} 
                      alt={facility.name}
                      fill
                      className="fac-img object-cover object-center will-change-transform"
                    />
                  </div>
                ) : (
                  <div className="fac-img-container w-full aspect-[4/3] flex items-center justify-center border border-white/10 bg-white/[0.02] will-change-transform">
                     <div className="fac-img w-full h-full flex items-center justify-center">
                       <span className="font-mono text-[9px] tracking-widest text-white/30 uppercase">[ FACILITY IMAGE PENDING ]</span>
                     </div>
                  </div>
                )}
              </div>

              {/* Text Column */}
              <div className={`fac-text-col col-span-1 md:col-span-5 flex flex-col justify-center ${isRight ? 'md:order-1 items-start' : 'md:order-2 items-start'} transform-gpu`}>
                <div className="w-full h-px bg-white/10 fac-reveal mb-8" />
                <span className="font-mono text-[9px] tracking-[0.2em] text-white/50 uppercase fac-reveal mb-4">
                  {facility.category}
                </span>
                <h3 className="font-sans text-3xl md:text-4xl lg:text-5xl text-white tracking-tight fac-reveal mb-6">
                  {facility.name}
                </h3>
                <p className="font-sans text-sm md:text-base text-white/60 leading-relaxed max-w-[400px] fac-reveal mb-8">
                  {facility.description}
                </p>
                {facility.href && (
                  <a href={facility.href} className="inline-flex items-center gap-4 group cursor-none pointer-events-auto fac-reveal">
                    <span className="font-mono text-[10px] tracking-[0.2em] text-white/60 group-hover:text-white transition-colors duration-300">EXPLORE</span>
                    <span className="text-white/60 group-hover:text-white group-hover:translate-x-2 transition-all duration-500">&rarr;</span>
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
