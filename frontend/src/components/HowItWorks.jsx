import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, MessageSquare, Database, Cpu, CheckCircle2, ChevronRight, Sparkles, ShieldCheck, TrendingUp, AlertCircle } from 'lucide-react';

export default function HowItWorks({ onOpenWorkspace }) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      step: '01',
      title: 'Ask & Ingest',
      subtitle: 'Raw evidence aggregation across your stack',
      description: 'Ask anything, the way you are already thinking it, in Slack or in our web app. EvidentIQ continuously ingests reviews, Jira tickets, GitHub PRs, and LMS certificates.',
      icon: MessageSquare,
      visual: (
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-sm flex flex-col justify-between h-56">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 text-xs">
            <span className="font-semibold text-neutral-800">#leadership-reviews</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="flex items-start gap-3 my-auto">
            <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-700 font-bold flex items-center justify-center text-xs">
              T
            </div>
            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-xs text-neutral-800">
              <span className="text-indigo-600 font-semibold">@EvidentIQ</span> why did Bob's technical score drop last quarter?
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
            <span>● 5 sources connected</span>
            <span>● JIRA-402</span>
            <span>● GH-PR-112</span>
          </div>
        </div>
      )
    },
    {
      step: '02',
      title: 'Connect & Score',
      subtitle: 'Deterministic Python aggregation layer',
      description: 'EvidentIQ reaches into every connected tool and pulls the live context that matters. Calculates weighted scores without ML guesswork while preserving exact evidence IDs.',
      icon: Database,
      visual: (
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-sm flex flex-col items-center justify-center h-56 relative overflow-hidden">
          {/* Node graph diagram */}
          <div className="w-12 h-12 rounded-xl bg-neutral-950 text-white flex items-center justify-center shadow-lg mb-3 z-10">
            <Cpu className="w-6 h-6 text-amber-400" />
          </div>
          <div className="text-xs font-semibold text-neutral-900 mb-1">Python Deterministic Engine</div>
          <div className="text-[11px] font-mono text-neutral-500">scored_output.json</div>

          {/* Floating source nodes */}
          <div className="absolute top-4 left-4 px-2 py-1 rounded bg-neutral-100 border border-neutral-200 text-[10px] font-mono text-neutral-600">
            Jira (0.3 wt)
          </div>
          <div className="absolute top-4 right-4 px-2 py-1 rounded bg-neutral-100 border border-neutral-200 text-[10px] font-mono text-neutral-600">
            Manager Q1 (0.5 wt)
          </div>
          <div className="absolute bottom-4 left-6 px-2 py-1 rounded bg-neutral-100 border border-neutral-200 text-[10px] font-mono text-neutral-600">
            Peer 360 (0.2 wt)
          </div>
          <div className="absolute bottom-4 right-6 px-2 py-1 rounded bg-neutral-100 border border-neutral-200 text-[10px] font-mono text-neutral-600">
            LMS Cert
          </div>
        </div>
      )
    },
    {
      step: '03',
      title: 'Reason & Trajectory',
      subtitle: 'Longitudinal velocity and confidence assessment',
      description: 'It reasons over full multi-cycle history, computing velocity and evidence density. Explicitly flags insufficient evidence when observations fall below confidence threshold.',
      icon: TrendingUp,
      visual: (
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-sm flex flex-col justify-between h-56">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-800">Longitudinal Trajectory</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Confidence: 0.88
            </span>
          </div>
          <div className="space-y-2 my-auto">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500 font-mono">Q1 → Q2 → Q3</span>
              <span className="font-bold text-neutral-900">70 → 76 → 88</span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden flex">
              <div className="bg-emerald-500 h-full w-[88%] transition-all duration-500"></div>
            </div>
            <div className="text-[11px] text-neutral-600 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Net Delta: <strong>+18 (Improving)</strong></span>
            </div>
          </div>
          <div className="pt-2 border-t border-neutral-100 text-[10px] text-neutral-400 font-mono">
            35 automated invariant rules verified
          </div>
        </div>
      )
    },
    {
      step: '04',
      title: 'Act & Coach',
      subtitle: 'Actionable guidance backed by cited evidence',
      description: 'EvidentIQ takes action and crafts individualized coaching plans citing proven evidence references, with transparent AI provenance and fallback reliability.',
      icon: CheckCircle2,
      visual: (
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-sm flex flex-col justify-between h-56 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-neutral-900">AI Coaching Roadmap</span>
            <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-mono text-[9px] font-bold">
              AI COACH
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80 text-neutral-700 leading-snug">
            "Assign as Technical Lead on Project Boreas. Citations: <span className="font-mono text-indigo-600 font-semibold">PROJ-001</span>, <span className="font-mono text-indigo-600 font-semibold">TRAIN-004</span>."
          </div>
          <div className="flex items-center justify-between text-[11px] text-neutral-500">
            <span>● 100% Traceable</span>
            <span className="text-emerald-600 font-medium">Ready to deploy</span>
          </div>
        </div>
      )
    }
  ];

  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-white border-t border-neutral-200/60">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="text-[12px] font-semibold tracking-widest text-neutral-400 uppercase mb-3">
            How It Works
          </div>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-neutral-950 leading-[1.15] mb-4">
            It doesn't just answer. It does the work. <br />
            <span className="text-neutral-400 font-normal">In Slack or on the web.</span>
          </h2>
        </div>

        {/* 4-Card Step Grid (Matching Screenshot 2) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            const isSelected = activeStep === idx;
            return (
              <div
                key={item.step}
                onClick={() => setActiveStep(idx)}
                className={`rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between cursor-pointer border ${
                  isSelected 
                    ? 'bg-neutral-50 border-neutral-300 shadow-md ring-1 ring-neutral-400/20' 
                    : 'bg-white border-neutral-200/80 hover:border-neutral-300 hover:bg-neutral-50/50'
                }`}
              >
                {/* Visual Simulation Area */}
                <div className="mb-6">
                  {item.visual}
                </div>

                {/* Step Content */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono font-bold text-neutral-400">{item.step}</span>
                    <h3 className="font-semibold text-neutral-950 text-base">{item.title}</h3>
                  </div>
                  <p className="text-neutral-600 text-xs leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Prev/Next Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setActiveStep((prev) => (prev > 0 ? prev - 1 : steps.length - 1))}
            className="w-9 h-9 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Previous step"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                onClick={() => setActiveStep(i)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  activeStep === i ? 'w-6 bg-neutral-900' : 'w-1.5 bg-neutral-300'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : 0))}
            className="w-9 h-9 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Next step"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
