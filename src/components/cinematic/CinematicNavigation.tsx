"use client";

import { useState, useEffect } from "react";

export function CinematicNavigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "ACADEMY", href: "#academy" },
    { label: "PROGRAMS", href: "#programs" },
    { label: "FLEET", href: "#fleet" },
    { label: "FACILITIES", href: "#facilities" },
    { label: "ADMISSIONS", href: "#admissions" },
  ];

  useEffect(() => {
    const checkHeroBoundary = () => {
      // The hero boundary is determined by the bottom of .cinematic-scroll-track
      const track = document.querySelector(".cinematic-scroll-track");
      if (track) {
        const rect = track.getBoundingClientRect();
        // While any part of the hero track remains active/visible, rect.bottom > 60px -> transparent
        // Once the entire 240-frame hero sequence has completely scrolled past (rect.bottom <= 60px), glass kicks in
        setIsScrolled(rect.bottom <= 60);
      } else {
        const academyEl = document.getElementById("academy");
        if (academyEl) {
          setIsScrolled(academyEl.getBoundingClientRect().top <= 60);
        } else {
          setIsScrolled(window.scrollY > window.innerHeight * 5.5);
        }
      }
    };

    window.addEventListener("scroll", checkHeroBoundary, { passive: true });
    window.addEventListener("resize", checkHeroBoundary, { passive: true });
    checkHeroBoundary();

    return () => {
      window.removeEventListener("scroll", checkHeroBoundary);
      window.removeEventListener("resize", checkHeroBoundary);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-[background-color,border-color,backdrop-filter,box-shadow,padding] duration-500 ease-out pointer-events-auto ${
          isScrolled
            ? "bg-[#030611]/85 backdrop-blur-md border-b border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.5)] py-3.5 md:py-4"
            : "bg-transparent border-0 border-b-0 border-none shadow-none backdrop-blur-none py-5 md:py-6"
        }`}
        style={!isScrolled ? { backgroundColor: 'transparent', borderBottom: 'none', border: 'none', boxShadow: 'none', backdropFilter: 'none' } : undefined}
      >
        <div className="w-full px-6 sm:px-10 lg:px-16 flex items-center justify-between">
          
          {/* Genuine Logo & Wordmark at far left */}
          <a
            href="#"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-1 focus-visible:ring-white/50 drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]"
            aria-label="Aviation Academy Home"
          >
            {/* Minimalist geometric aircraft delta / wing mark */}
            <div className="w-7 h-7 flex items-center justify-center text-white/95 group-hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-current">
                <path
                  d="M12 2L2 9L12 13L22 9L12 2Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 15L12 19L22 15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            
            <div className="flex items-center">
              <span className="font-sans font-bold tracking-[0.25em] text-white text-sm md:text-base leading-none">
                AVIATION
              </span>
              <span className="font-mono text-[9px] md:text-[10px] tracking-[0.25em] text-white/70 uppercase ml-2.5 pl-2.5 border-l border-white/20">
                ACADEMY
              </span>
            </div>
          </a>

          {/* Navigation Links at far right (Desktop) */}
          <div className="hidden lg:flex items-center gap-8 xl:gap-10 drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">
            <nav className="flex items-center gap-8 xl:gap-10">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.href);
                  }}
                  className="font-mono text-[11px] xl:text-xs tracking-[0.22em] text-white/80 hover:text-white transition-colors duration-200 relative py-1 group font-medium"
                  data-cursor-text="GO"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-full h-px bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200 ease-out" />
                </a>
              ))}
            </nav>

            {/* Restrained, elegant CTA button */}
            <a
              href="#admissions"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick("#admissions");
              }}
              className="inline-flex items-center justify-center font-mono text-[11px] tracking-[0.2em] text-white hover:text-white border border-white/30 hover:border-white/80 px-4 py-1.5 rounded transition-all duration-200 font-medium"
              data-cursor-text="ENQUIRE"
            >
              ENQUIRE
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white/80 hover:text-white p-2 rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-white/50 transition-colors"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-[#02050f]/95 backdrop-blur-2xl flex flex-col justify-center px-8 lg:hidden animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex flex-col gap-6 max-w-sm mx-auto w-full">
            <div className="border-b border-white/10 pb-4 mb-2">
              <span className="font-mono text-[10px] text-white/50 tracking-[0.25em] uppercase">Navigation</span>
            </div>
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.href);
                }}
                className="font-mono text-base tracking-[0.2em] text-white/80 hover:text-white transition-colors py-2 border-b border-white/5"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#admissions"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick("#admissions");
              }}
              className="mt-4 inline-flex items-center justify-center bg-white text-black py-3 rounded font-mono text-xs tracking-[0.2em] font-semibold uppercase transition-all shadow-md"
            >
              ENQUIRE NOW
            </a>
          </div>
        </div>
      )}
    </>
  );
}
