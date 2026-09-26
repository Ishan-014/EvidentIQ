import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Activity, Layers, Cpu } from 'lucide-react';

export default function Navbar({ onOpenWorkspace }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/80 backdrop-blur-xl border-b border-neutral-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)]' 
        : 'bg-transparent border-b border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-200">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <span className="font-semibold text-lg tracking-tight text-neutral-900 flex items-center gap-1.5">
            Evident<span className="text-neutral-500 font-normal">IQ</span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-[14px] text-neutral-600 font-medium">
          <button 
            onClick={() => scrollToSection('how-it-works')} 
            className="hover:text-neutral-900 transition-colors cursor-pointer"
          >
            Product
          </button>
          <button 
            onClick={() => scrollToSection('trajectory-engine')} 
            className="hover:text-neutral-900 transition-colors cursor-pointer"
          >
            Trajectory Engine
          </button>
          <button 
            onClick={() => scrollToSection('evidence-audit')} 
            className="hover:text-neutral-900 transition-colors cursor-pointer"
          >
            Evidence & Audit
          </button>
          <button 
            onClick={() => scrollToSection('integrations')} 
            className="hover:text-neutral-900 transition-colors cursor-pointer"
          >
            Integrations
          </button>
          <button 
            onClick={() => scrollToSection('use-cases')} 
            className="hover:text-neutral-900 transition-colors cursor-pointer"
          >
            Use Cases
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onOpenWorkspace}
            className="text-[14px] font-medium text-neutral-700 hover:text-neutral-950 px-3.5 py-2 transition-colors hidden sm:block cursor-pointer"
          >
            Demo Workspace
          </button>
          <button 
            onClick={onOpenWorkspace}
            className="group relative inline-flex items-center gap-2 px-4.5 py-2 rounded-full text-[13.5px] font-medium bg-neutral-900 text-white hover:bg-black transition-all duration-200 shadow-sm hover:shadow-[0_4px_16px_rgba(0,0,0,0.18)] hover:-translate-y-0.5 cursor-pointer"
          >
            <span>Explore EvidentIQ Live</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </header>
  );
}
