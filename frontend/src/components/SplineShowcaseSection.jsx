import React from 'react';
import SplineScene from './SplineScene';
import { Cpu, ShieldCheck, Sparkles, Activity, Layers, Database, ArrowRight } from 'lucide-react';

export default function SplineShowcaseSection({ onOpenWorkspace }) {
  return (
    <section className="py-24 bg-gradient-to-b from-white via-neutral-900 to-neutral-950 text-white relative overflow-hidden border-t border-neutral-200/80">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-amber-500/20 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-800/80 border border-neutral-700/80 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive 3D Engine Visualization</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white leading-[1.12]">
            Visualizing Capability in 3D. <br />
            <span className="text-neutral-400 font-normal">Real-time dynamic polyhedra & graph models.</span>
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed mt-4">
            Experience EvidentIQ's multi-layered competency graph visualizer. Every node represents an evidence source, weighted dynamically by Python before generating AI guidance.
          </p>
        </div>

        {/* 3D Spline Canvas Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Card 1: Interactive 3D Model Viewport */}
          <div className="lg:col-span-7 rounded-3xl bg-neutral-900/90 border border-neutral-800 p-4 sm:p-6 shadow-2xl relative overflow-hidden group">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              </div>
              <span className="text-xs font-mono text-neutral-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Spline 3D Runtime Active
              </span>
            </div>

            {/* 3D Spline Scene Container */}
            <div className="relative rounded-2xl overflow-hidden bg-black/80 h-96">
              <SplineScene
                variant="hero"
                className="w-full h-full"
                title="Spline 3D Polyhedron Core"
              />
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-neutral-400">
              <span className="font-mono text-neutral-300">● 32 Orbiting Evidence Nodes</span>
              <span className="text-amber-400 font-medium">Drag to rotate and explore vector geometry</span>
            </div>
          </div>

          {/* Card 2: Engine Architectural Badges & Direct Launch */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold text-white">Deterministic Computation</h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Scores and trajectories are evaluated strictly via Python rules before LLM prompts are assembled.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold text-white">Evidence Auditability</h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Recommendations cite exact evidence identifiers (<code className="text-emerald-400 font-mono">manager_q1</code>, <code className="text-emerald-400 font-mono">PROJ-001</code>) so guidance is 100% verifiable.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onOpenWorkspace('EMP001')}
                className="w-full py-4 rounded-2xl bg-white text-neutral-950 font-semibold text-sm hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <span>Launch Interactive Demo Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
