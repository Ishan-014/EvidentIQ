import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, TrendingUp, Sliders, Play, Plus, RefreshCw, BarChart2, Layers } from 'lucide-react';

export default function FeatureGrid({ onOpenWorkspace }) {
  // Interactive mini simulation state
  const [simulatedPoints, setSimulatedPoints] = useState(2);
  const [activeCompetency, setActiveCompetency] = useState('technical');

  const getSimulatedConfidence = () => {
    return Math.min(0.25 * simulatedPoints + 0.25 * 2 + 0.2, 1.0);
  };

  const getSimulatedTrend = () => {
    if (getSimulatedConfidence() < 0.6) return 'insufficient_evidence';
    return simulatedPoints >= 3 ? 'improving (+14)' : 'stagnant (±3)';
  };

  return (
    <section id="trajectory-engine" className="py-24 md:py-32 bg-neutral-50/70 border-t border-neutral-200/60">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="text-[12px] font-semibold tracking-widest text-neutral-400 uppercase mb-3">
            Features
          </div>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-neutral-950 leading-[1.12]">
            Ask. Automate. Build. <br />
            <span className="text-neutral-400 font-normal">Build loops for talent intelligence.</span>
          </h2>
        </div>

        {/* Feature 1: Ask questions across the stack */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-28">
          <div className="lg:col-span-5 space-y-4">
            <div className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
              Ask Your Data
            </div>
            <h3 className="text-2xl sm:text-4xl font-semibold text-neutral-950 tracking-tight leading-tight">
              Ask questions across the stack
            </h3>
            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
              EvidentIQ pulls live data, runs multi-period analysis, and delivers evidence-backed answers across every connected system. No complex dashboards to construct. No SQL to write. Just natural queries grounded in deterministic math.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onOpenWorkspace('EMP001')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                <span>Try interactive query workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Visual: Interactive Chat + Dynamic Performance Graph */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-white p-6 sm:p-8 border border-neutral-200/90 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="font-semibold text-neutral-800 text-xs">Capability Trajectory: Engineering Stack</span>
                </div>
                <span className="text-xs font-mono text-neutral-400">EMP001 · Alice Chen</span>
              </div>

              {/* Dynamic Bar Breakdown */}
              <div className="space-y-4 mb-6">
                <div className="flex items-end justify-between h-40 pt-4 px-4 pb-2 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <div className="flex flex-col items-center gap-2 w-16">
                    <span className="text-xs font-semibold text-neutral-600">70</span>
                    <div className="w-10 bg-indigo-200 rounded-t-lg h-16"></div>
                    <span className="text-[11px] font-mono text-neutral-400">Q1 Actual</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 w-16">
                    <span className="text-xs font-semibold text-neutral-600">76</span>
                    <div className="w-10 bg-indigo-300 rounded-t-lg h-22"></div>
                    <span className="text-[11px] font-mono text-neutral-400">Q2 Actual</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 w-16">
                    <span className="text-xs font-semibold text-indigo-600 font-bold">88</span>
                    <div className="w-10 bg-indigo-600 rounded-t-lg h-28 shadow-sm"></div>
                    <span className="text-[11px] font-mono text-indigo-900 font-semibold">Q3 Actual</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 w-16">
                    <span className="text-xs font-semibold text-neutral-400">82 Target</span>
                    <div className="w-10 bg-amber-400/80 rounded-t-lg h-25 border border-dashed border-amber-500"></div>
                    <span className="text-[11px] font-mono text-amber-900">Q3 Expected</span>
                  </div>
                </div>
              </div>

              {/* Chat Dialogue Simulation */}
              <div className="space-y-3 bg-neutral-50/80 p-4 rounded-2xl border border-neutral-200/70 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-neutral-300 font-bold flex items-center justify-center text-[10px] text-neutral-700">
                    A
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-900">Ashley (VP of Eng):</span>
                    <p className="text-neutral-700 mt-0.5">Prepare a talent review brief summarizing these findings and cite evidence.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 pt-2 border-t border-neutral-200/60">
                  <div className="w-6 h-6 rounded-full bg-neutral-900 text-white font-bold flex items-center justify-center text-[10px]">
                    E
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-900">EvidentIQ:</span>
                    <p className="text-neutral-700 mt-0.5">
                      Done. Alice exceeded Q3 target by +6 points with high confidence (88%). Key signals: <code className="bg-white px-1 py-0.5 rounded border text-[10px] text-indigo-700 font-mono">PROJ-001</code> (Project Boreas architecture) & <code className="bg-white px-1 py-0.5 rounded border text-[10px] text-indigo-700 font-mono">TRAIN-004</code>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Build Apps and Dashboards without a Developer (What-If Simulation) */}
        <div id="evidence-audit" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Visual: What-If Live Simulator Component */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="rounded-3xl bg-white p-6 sm:p-8 border border-neutral-200/90 shadow-lg">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-6">
                <div>
                  <h4 className="font-semibold text-neutral-950 text-base">What-If Evidence Simulator</h4>
                  <p className="text-neutral-500 text-xs">Dynamically inject evidence to observe instant confidence and trajectory recalculation</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Interactive Sandbox
                </span>
              </div>

              {/* Control Panel */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/70 mb-5 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-neutral-700">Simulate Evidence Count:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSimulatedPoints(Math.max(1, simulatedPoints - 1))}
                      className="w-7 h-7 rounded-lg bg-white border border-neutral-300 font-bold hover:bg-neutral-100 cursor-pointer flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-neutral-900 w-6 text-center text-sm">{simulatedPoints}</span>
                    <button
                      onClick={() => setSimulatedPoints(Math.min(6, simulatedPoints + 1))}
                      className="w-7 h-7 rounded-lg bg-white border border-neutral-300 font-bold hover:bg-neutral-100 cursor-pointer flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Evidence items injected */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2 py-1 rounded bg-white border border-neutral-200 text-neutral-700 flex items-center gap-1">
                    ✓ manager_q1 (0.50 wt)
                  </span>
                  {simulatedPoints >= 2 && (
                    <span className="px-2 py-1 rounded bg-white border border-neutral-200 text-neutral-700 flex items-center gap-1">
                      ✓ proj_alpha (0.30 wt)
                    </span>
                  )}
                  {simulatedPoints >= 3 && (
                    <span className="px-2 py-1 rounded bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-1 font-semibold animate-fade-in">
                      + peer_360 (0.20 wt)
                    </span>
                  )}
                  {simulatedPoints >= 4 && (
                    <span className="px-2 py-1 rounded bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-1 font-semibold animate-fade-in">
                      + gh_pr_audit (0.30 wt)
                    </span>
                  )}
                </div>
              </div>

              {/* Engine Output Indicators */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                  <span className="text-neutral-500 block mb-1">Calculated Confidence</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono text-neutral-950">
                      {(getSimulatedConfidence() * 100).toFixed(0)}%
                    </span>
                    <span className={`text-[11px] font-semibold ${
                      getSimulatedConfidence() >= 0.6 ? 'text-emerald-600' : 'text-rose-500'
                    }`}>
                      {getSimulatedConfidence() >= 0.6 ? 'Sufficient' : 'Insufficient (<0.60)'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                  <span className="text-neutral-500 block mb-1">Trajectory Status</span>
                  <div className="text-base font-bold text-neutral-900 mt-1 capitalize">
                    {getSimulatedTrend()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Text */}
          <div className="lg:col-span-5 order-1 lg:order-2 space-y-4">
            <div className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
              Audit & What-If Engine
            </div>
            <h3 className="text-2xl sm:text-4xl font-semibold text-neutral-950 tracking-tight leading-tight">
              Instant capability simulation without manual calculations
            </h3>
            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
              Test hypothetical promotions, what-if project deliveries, and new evidence submissions. Watch the deterministic Python pipeline dynamically recalculate confidence thresholds, longitudinal deltas, and AI recommendations.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onOpenWorkspace('what-if')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-900 text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer"
              >
                <span>Launch Interactive What-If Sandbox</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
