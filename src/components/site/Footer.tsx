"use client";

import Image from "next/image";

export function Footer() {
  const links = [
    {
      title: "ACADEMY",
      items: [
        { label: "Introduction", href: "#academy" },
        { label: "Why Choose Us", href: "#why-choose-us" },
        { label: "Stories", href: "#stories" }
      ]
    },
    {
      title: "PROGRAMS",
      items: [
        { label: "Training Programs", href: "#programs" },
        { label: "Training Journey", href: "#journey" },
        { label: "Fleet", href: "#fleet" }
      ]
    },
    {
      title: "ADMISSIONS",
      items: [
        { label: "Enquiry", href: "#admissions" },
        { label: "Facilities", href: "#facilities" },
        { label: "FAQ", href: "#faq" }
      ]
    },
  ];

  const handleNavClick = (href: string) => {
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer id="site-footer" className="w-full relative z-20 bg-[#02050e] px-6 md:px-12 lg:px-24 pt-20 pb-12 overflow-hidden border-t border-white/10 pointer-events-auto">
      <div className="absolute inset-0 pointer-events-none transform-gpu z-0">
        <Image 
          src="/images/entrance/glass-entrance.jpg" 
          alt="Academy Background"
          fill
          className="object-cover object-bottom opacity-10 mix-blend-screen scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-[var(--background)]/90 to-[var(--background)]" />
      </div>
      
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between gap-16 mb-20 relative z-20">
        <div className="flex flex-col md:w-1/3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-7 h-7 flex items-center justify-center text-white/90">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-current">
                <path d="M12 2L2 9L12 13L22 9L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 15L12 19L22 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex items-center">
              <span className="font-sans font-bold tracking-[0.25em] text-white text-base">
                AVIATION
              </span>
              <span className="font-mono text-[9px] tracking-[0.25em] text-white/60 uppercase ml-2.5 pl-2.5 border-l border-white/20">
                ACADEMY
              </span>
            </div>
          </div>
          <p className="font-sans text-sm text-white/60 max-w-sm leading-relaxed mb-2 mt-4">
            Flight Training Academy, Runway 27L Terminal Campus, Sky Harbor Airfield.
          </p>
          <span className="font-mono text-xs text-white/40">admissions@aviation-academy.com | +1 (800) 555-0199</span>
        </div>

        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-12">
          {links.map((section) => (
            <div key={section.title} className="flex flex-col">
              <span className="font-mono text-[10px] tracking-[0.2em] text-white/30 mb-6">{section.title}</span>
              <div className="flex flex-col gap-4">
                {section.items.map((item) => (
                  <a 
                    key={item.label} 
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(item.href);
                    }}
                    className="font-sans text-sm text-white/60 hover:text-white transition-colors cursor-pointer"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="max-w-[1600px] mx-auto border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 relative z-20">
        <span className="font-sans text-xs text-white/40">
          &copy; {new Date().getFullYear()} Aviation Academy. All rights reserved.
        </span>
        <div className="flex gap-6">
          <a href="#" className="font-sans text-xs text-white/40 hover:text-white transition-colors">PRIVACY POLICY</a>
          <a href="#" className="font-sans text-xs text-white/40 hover:text-white transition-colors">TERMS OF SERVICE</a>
        </div>
      </div>
    </footer>
  );
}
