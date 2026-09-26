import React, { useState } from 'react';
import { ShieldCheck, Lock, CheckCircle, Database, GitPullRequest, MessageSquare, Layers, Sparkles } from 'lucide-react';
import SplineScene from './SplineScene';

export default function OrbitalIntegrations() {
  const [activeCategory, setActiveCategory] = useState('hris');

  const categories = [
    { id: 'warehouse', label: 'Data warehouse & SQL', description: 'Snowflake, BigQuery, Postgres' },
    { id: 'hris', label: 'HRIS & Performance Management', description: 'Workday, Lattice, Culture Amp, BambooHR' },
    { id: 'projects', label: 'Project & Code Repositories', description: 'Jira, Linear, GitHub, GitLab' },
    { id: 'comms', label: 'Communication & 360 Feedback', description: 'Slack, Microsoft Teams, Asana' },
    { id: 'lms', label: 'Learning & Skill Accreditations', description: 'Coursera, Udemy, Internal LMS' },
  ];

  return (
    <section id="integrations" className="py-24 md:py-32 bg-neutral-950 text-white relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/15 via-purple-600/15 to-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading & Data Connectors List */}
          <div className="lg:col-span-5 space-y-6 z-10">
            <div className="text-[12px] font-semibold tracking-widest text-neutral-400 uppercase">
              Integrations
            </div>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white leading-[1.12]">
              Context from everywhere. <br />
              <span className="text-neutral-400 font-normal">Connected in one place.</span>
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
              EvidentIQ connects to everything your company runs on and turns it into one shared capability graph. Your data stays private — never used to train public models, with 100% deterministic traceability.
            </p>

            {/* Category Switcher List */}
            <div className="space-y-2 pt-4">
              {categories.map(cat => (
                <div
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`p-3.5 rounded-xl transition-all cursor-pointer border ${
                    activeCategory === cat.id
                      ? 'bg-neutral-900 border-neutral-700 shadow-md text-white'
                      : 'bg-neutral-900/30 border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>{cat.label}</span>
                    <span className="text-[10px] font-mono text-neutral-500">{cat.description}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center gap-6 text-xs text-neutral-500">
              <span className="flex items-center gap-1.5 text-neutral-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> SOC2 Type II Certified
              </span>
              <span className="flex items-center gap-1.5 text-neutral-400">
                <Lock className="w-4 h-4 text-indigo-400" /> Zero Data Retention
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Orbital Radar Graphic with Spline 3D Core */}
          <div className="lg:col-span-7 flex items-center justify-center relative">
            <div className="relative w-full max-w-[540px] aspect-square flex items-center justify-center">
              
              {/* Concentric Orbital Rings */}
              <div className="absolute inset-0 rounded-full border border-neutral-800/80 animate-pulse pointer-events-none" />
              <div className="absolute inset-10 rounded-full border border-neutral-800/60 pointer-events-none" />
              <div className="absolute inset-24 rounded-full border border-neutral-700/40 pointer-events-none" />
              <div className="absolute inset-38 rounded-full border border-neutral-600/30 pointer-events-none" />

              {/* Central Glowing Spline 3D Scene / Geometric Prism Canvas */}
              <div className="w-56 h-56 rounded-full relative z-20 flex items-center justify-center">
                <SplineScene
                  variant="orbital"
                  className="w-full h-full"
                  title="Orbital 3D Core"
                />
              </div>

              {/* Orbiting Satellite Tool Badges */}
              {/* Top Node */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-700/80 shadow-lg text-xs flex items-center gap-2 z-30 hover:scale-110 transition-transform">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="font-semibold text-neutral-200">Slack</span>
              </div>

              {/* Top Right Node */}
              <div className="absolute top-20 right-8 p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-700/80 shadow-lg text-xs flex items-center gap-2 z-30 hover:scale-110 transition-transform">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                <span className="font-semibold text-neutral-200">GitHub PRs</span>
              </div>

              {/* Bottom Right Node */}
              <div className="absolute bottom-16 right-10 p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-700/80 shadow-lg text-xs flex items-center gap-2 z-30 hover:scale-110 transition-transform">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="font-semibold text-neutral-200">Jira</span>
              </div>

              {/* Bottom Node */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-700/80 shadow-lg text-xs flex items-center gap-2 z-30 hover:scale-110 transition-transform">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                <span className="font-semibold text-neutral-200">Lattice & 360</span>
              </div>

              {/* Bottom Left Node */}
              <div className="absolute bottom-18 left-8 p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-700/80 shadow-lg text-xs flex items-center gap-2 z-30 hover:scale-110 transition-transform">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                <span className="font-semibold text-neutral-200">Workday</span>
              </div>

              {/* Top Left Node */}
              <div className="absolute top-16 left-10 p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-700/80 shadow-lg text-xs flex items-center gap-2 z-30 hover:scale-110 transition-transform">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span className="font-semibold text-neutral-200">Notion Docs</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
