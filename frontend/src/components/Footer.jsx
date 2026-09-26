import React from 'react';
import { ArrowUpRight, Sparkles, Shield, Cpu, Layers } from 'lucide-react';

export default function Footer({ onOpenWorkspace }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-neutral-950 text-white border-t border-neutral-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-neutral-800">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div 
              onClick={scrollToTop}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <span className="font-semibold text-lg tracking-tight text-white">
                Evident<span className="text-neutral-400 font-normal">IQ</span>
              </span>
            </div>

            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              The longitudinal talent intelligence engine. Deterministic competency trajectory calculation with evidence grounding and zero hallucinations.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <span className="px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 text-[11px] font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Spline 3D Ready
              </span>
              <span className="px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 text-[11px] font-mono">
                Python Engine v2.4
              </span>
            </div>
          </div>

          {/* Links Column 1: Architecture & Pipeline */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Architecture</h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-1">
                <span>Module 1: Data & Scoring</span>
              </li>
              <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-1">
                <span>Module 2: Trajectory & Confidence</span>
              </li>
              <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-1">
                <span>Module 3: AI Coaching Engine</span>
              </li>
              <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-1">
                <span>35 Invariant Unit Tests</span>
              </li>
            </ul>
          </div>

          {/* Links Column 2: Product & Demo */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Product</h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <button onClick={onOpenWorkspace} className="hover:text-white transition-colors cursor-pointer">
                  Launch Workspace
                </button>
              </li>
              <li>
                <button onClick={() => onOpenWorkspace('what-if')} className="hover:text-white transition-colors cursor-pointer">
                  What-If Sandbox
                </button>
              </li>
              <li>
                <button onClick={() => onOpenWorkspace('ai-coach')} className="hover:text-white transition-colors cursor-pointer">
                  AI Guidance
                </button>
              </li>
              <li>
                <button onClick={scrollToTop} className="hover:text-white transition-colors cursor-pointer">
                  Back to top ↑
                </button>
              </li>
            </ul>
          </div>

          {/* Links Column 3: Spline 3D Integration */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">3D Integration</h4>
            <p className="text-neutral-500 text-[11px] leading-relaxed">
              Drop in any Spline 3D export URL in <code className="text-amber-400 font-mono">src/config/splineConfig.js</code> for instant rendering.
            </p>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            © {new Date().getFullYear()} EvidentIQ. Built for Hackmatrix. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-neutral-300 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-neutral-300 transition-colors cursor-pointer">Security Whitepaper</span>
            <span className="hover:text-neutral-300 transition-colors cursor-pointer">Audit Logs</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
