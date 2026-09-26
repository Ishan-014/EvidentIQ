import React, { useState } from 'react';
import { ArrowRight, Play, CheckCircle2, ShieldCheck, Sparkles, TrendingUp, BarChart3, MessageSquare, Terminal, Eye } from 'lucide-react';
import SplineScene from './SplineScene';

export default function Hero({ onOpenWorkspace, onSelectEmployee }) {
  const [activeTab, setActiveTab] = useState('slack'); // 'slack' | 'webapp' | '3d'
  const [activeEmployeeId, setActiveEmployeeId] = useState('EMP001');

  const demoEmployees = [
    { id: 'EMP001', name: 'Aryan Sharma', role: 'Staff Eng', score: 100, delta: '+35', trend: 'improving', tag: 'Strong Improver' },
    { id: 'EMP002', name: 'Priya Nair', role: 'Sr Software Eng', score: 92, delta: '+25', trend: 'improving', tag: 'Mixed Profile' },
    { id: 'EMP005', name: 'Aditya Kulkarni', role: 'Tech Lead', score: 48, delta: '-28', trend: 'declining', tag: 'Urgent Coaching' },
  ];

  return (
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden bg-gradient-to-b from-neutral-50 via-white to-neutral-50/50">
      {/* Background Soft Glow Halos */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[450px] bg-gradient-to-tr from-indigo-200/35 via-purple-100/30 to-amber-100/25 blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Main Hero Typography & Call to Action */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 text-[12.5px] font-medium mb-6 shadow-2xs hover:bg-neutral-200/70 transition-colors cursor-default">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-neutral-900">EvidentIQ 2.0</span>
            <span className="text-neutral-400">·</span>
            <span>Longitudinal Talent Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-semibold tracking-[-0.035em] text-neutral-950 leading-[1.08] mb-6">
            The AI native way <br />
            <span className="text-neutral-900">to understand capability</span>
          </h1>

          <p className="text-lg sm:text-[19px] text-neutral-600 leading-relaxed max-w-2xl mx-auto font-normal mb-8">
            EvidentIQ is the company brain: one shared context layer for every employee and every agent that answers capability questions, tracks longitudinal trajectories, and proves growth with auditable evidence.
          </p>

          {/* Primary Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <button
              onClick={() => onOpenWorkspace()}
              className="px-6 py-3.5 rounded-full bg-neutral-900 text-white font-medium text-[15px] hover:bg-black transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Launch Live Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onOpenWorkspace('what-if')}
              className="px-6 py-3.5 rounded-full bg-white border border-neutral-300 text-neutral-800 font-medium text-[15px] hover:bg-neutral-50 transition-all duration-200 shadow-2xs hover:border-neutral-400 flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-neutral-700 text-neutral-700" />
              <span>What-If Sandbox Simulator</span>
            </button>
          </div>

          <div className="flex items-center justify-center flex-wrap gap-6 text-[13px] text-neutral-600 font-medium">
            <span className="flex items-center gap-1.5 bg-neutral-100/80 px-3 py-1 rounded-full border border-neutral-200/60">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              100% Deterministic Aggregation
            </span>
            <span className="flex items-center gap-1.5 bg-neutral-100/80 px-3 py-1 rounded-full border border-neutral-200/60">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              Zero-Hallucination Evidence Traceability
            </span>
            <span className="flex items-center gap-1.5 bg-neutral-100/80 px-3 py-1 rounded-full border border-neutral-200/60">
              <Eye className="w-4 h-4 text-amber-600" />
              Explicit Insufficient-Evidence Safeguard
            </span>
          </div>
        </div>

        {/* HERO INTERACTIVE SHOWCASE (Matching Screenshot 1 Layout) */}
        <div className="relative max-w-5xl mx-auto">
          {/* Ambient Blurred Aura Behind Device */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 via-rose-400/20 to-indigo-500/20 rounded-3xl blur-3xl -z-10 transform scale-102 opacity-80" />

          <div className="rounded-2xl bg-neutral-900/95 p-3 sm:p-4 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] border border-neutral-800">
            {/* Window Container */}
            <div className="rounded-xl bg-white overflow-hidden shadow-inner flex flex-col min-h-[540px]">
              
              {/* Window Titlebar & Mode Switcher */}
              <div className="bg-neutral-100/90 border-b border-neutral-200 px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400 border border-rose-500/30"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500/30"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400 border border-emerald-500/30"></div>
                </div>

                {/* Switcher: Slack vs EvidentIQ Web App vs 3D Scene */}
                <div className="flex items-center gap-1 bg-neutral-200/80 p-1 rounded-lg text-[12px] font-medium">
                  <button
                    onClick={() => setActiveTab('slack')}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'slack' ? 'bg-white text-neutral-900 shadow-2xs font-semibold' : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#4A154B]" />
                    <span>Slack</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('webapp')}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'webapp' ? 'bg-white text-neutral-900 shadow-2xs font-semibold' : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Web App</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('3d')}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === '3d' ? 'bg-white text-neutral-900 shadow-2xs font-semibold' : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Spline 3D Scene</span>
                  </button>
                </div>

                <div className="text-[12px] font-mono text-neutral-400 hidden sm:block">
                  evidentiq.internal/org-graph
                </div>
              </div>

              {/* Main Content Area */}
              {activeTab === 'slack' && (
                <div className="flex-1 grid grid-cols-12 bg-white">
                  {/* Slack Sidebar */}
                  <div className="col-span-4 sm:col-span-3 bg-neutral-50/80 border-r border-neutral-200 p-3.5 flex flex-col justify-between text-[13px]">
                    <div>
                      <div className="flex items-center justify-between font-semibold text-neutral-800 pb-3 border-b border-neutral-200 mb-3">
                        <span className="truncate">Acme Corp</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      </div>

                      <div className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase mb-2">Channels</div>
                      <div className="space-y-1 text-neutral-600">
                        <div className="px-2.5 py-1.5 rounded-md bg-indigo-50 text-indigo-900 font-medium flex items-center gap-2 cursor-pointer">
                          <span>#</span> marketing
                        </div>
                        <div className="px-2.5 py-1.5 rounded-md hover:bg-neutral-100 flex items-center gap-2 cursor-pointer">
                          <span>#</span> engineering-reviews
                        </div>
                        <div className="px-2.5 py-1.5 rounded-md hover:bg-neutral-100 flex items-center gap-2 cursor-pointer">
                          <span>#</span> leadership-sync
                        </div>
                        <div className="px-2.5 py-1.5 rounded-md hover:bg-neutral-100 flex items-center gap-2 cursor-pointer">
                          <span>#</span> gtm-ops
                        </div>
                      </div>

                      <div className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase mt-5 mb-2">Direct Messages</div>
                      <div className="px-2.5 py-1.5 rounded-md bg-neutral-200/70 font-medium text-neutral-900 flex items-center gap-2 cursor-pointer">
                        <div className="w-4 h-4 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[9px] font-bold">E</div>
                        <span>EvidentIQ Bot</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-neutral-200 text-[11px] text-neutral-400">
                      Longitudinal Agent v2.4
                    </div>
                  </div>

                  {/* Slack Chat Feed */}
                  <div className="col-span-8 sm:col-span-9 p-4 sm:p-6 flex flex-col justify-between bg-white">
                    <div className="space-y-4">
                      {/* User Prompt */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                          R
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-neutral-900 text-sm">Rohan (VP Eng)</span>
                            <span className="text-[11px] text-neutral-400">9:16 AM</span>
                          </div>
                          <p className="text-neutral-700 text-[13.5px] mt-1">
                            <span className="text-indigo-600 font-medium">@EvidentIQ</span> show me Aryan Sharma's longitudinal competency trajectory over the last 9 months and verify if his Technical Depth growth is backed by sufficient evidence.
                          </p>
                        </div>
                      </div>

                      {/* Bot Response with Live Chart Card */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-900 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                          <Sparkles className="w-4 h-4 text-amber-300" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-neutral-900 text-sm">EvidentIQ</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800">APP</span>
                            <span className="text-[11px] text-neutral-400">9:17 AM</span>
                          </div>
                          <p className="text-neutral-700 text-[13px] mt-1 mb-3">
                            Here is Aryan Sharma's verified longitudinal capability report from Nexora Systems. Trajectory calculated deterministically via Python engine across 9 cycles.
                          </p>

                          {/* Embedded Capability Trajectory Card */}
                          <div className="p-4 rounded-xl border border-neutral-200/90 bg-neutral-50/70 max-w-lg shadow-2xs">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <span className="font-semibold text-neutral-900 text-[13.5px]">Technical Depth Trajectory</span>
                                <span className="text-[11px] text-neutral-500 block">9 cycles evaluated · 15 evidence signals</span>
                              </div>
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> Improving (+35)
                              </span>
                            </div>

                            {/* Mini Longitudinal Bar Chart (9 Cycles) */}
                            <div className="grid grid-cols-9 gap-1 items-end h-24 pt-4 px-1 pb-1 border-b border-neutral-200">
                              {[
                                { m: '01', s: 65 }, { m: '02', s: 73 }, { m: '03', s: 80 },
                                { m: '04', s: 86 }, { m: '05', s: 92 }, { m: '06', s: 100 },
                                { m: '07', s: 100 }, { m: '08', s: 100 }, { m: '09', s: 100 }
                              ].map((pt, i) => (
                                <div key={i} className="flex flex-col items-center gap-1">
                                  <span className="text-[9px] font-bold text-neutral-600">{pt.s}</span>
                                  <div
                                    className={`w-full rounded-t-xs transition-all duration-500 ${
                                      i >= 5 ? 'bg-indigo-600 shadow-xs' : i >= 3 ? 'bg-indigo-400' : 'bg-indigo-200'
                                    }`}
                                    style={{ height: `${Math.max(10, pt.s * 0.45)}px` }}
                                  ></div>
                                  <span className="text-[8px] font-mono text-neutral-400">M{pt.m}</span>
                                </div>
                              ))}
                            </div>

                            {/* Evidence Grounding Badges */}
                            <div className="pt-2.5 mt-1 flex items-center justify-between text-[11px]">
                              <span className="text-neutral-500 flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                Confidence: <strong className="text-neutral-800">96% (Very High)</strong>
                              </span>
                              <div className="flex gap-1.5">
                                <span className="px-1.5 py-0.5 rounded bg-white border border-neutral-200 text-neutral-600 font-mono text-[10px]">
                                  PROJ-001-02
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-white border border-neutral-200 text-neutral-600 font-mono text-[10px]">
                                  CERT-AWS-SA
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Action Button */}
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => onOpenWorkspace('EMP001')}
                              className="px-3 py-1.5 rounded-md bg-neutral-900 text-white text-[12px] font-medium hover:bg-black transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View Full Audit in EvidentIQ</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Slack Mock Input Bar */}
                    <div className="mt-6 pt-3 border-t border-neutral-200">
                      <div className="rounded-lg border border-neutral-300 p-2.5 flex items-center justify-between text-neutral-400 text-[13px] bg-neutral-50/50">
                        <span>Message #marketing or prompt @EvidentIQ...</span>
                        <div className="w-6 h-6 rounded bg-neutral-200 flex items-center justify-center text-neutral-500">
                          ↵
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Web App View */}
              {activeTab === 'webapp' && (
                <div className="flex-1 p-6 bg-neutral-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-neutral-900 text-lg">Organizational Capability Matrix</h3>
                        <p className="text-neutral-500 text-xs">Deterministic longitudinal competency assessment across employees</p>
                      </div>
                      <button
                        onClick={() => onOpenWorkspace()}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
                      >
                        Open Full Workspace
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      {demoEmployees.map(emp => (
                        <div
                          key={emp.id}
                          onClick={() => { setActiveEmployeeId(emp.id); onSelectEmployee(emp.id); }}
                          className={`p-4 rounded-xl border transition-all cursor-pointer ${
                            activeEmployeeId === emp.id 
                              ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-500/10' 
                              : 'bg-white/80 border-neutral-200 hover:border-neutral-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-neutral-900 text-sm">{emp.name}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              emp.trend === 'improving' ? 'bg-emerald-100 text-emerald-800' :
                              emp.trend === 'declining' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {emp.tag}
                            </span>
                          </div>
                          <div className="text-xs text-neutral-500 mb-3">{emp.role}</div>
                          <div className="flex items-baseline justify-between pt-2 border-t border-neutral-100">
                            <span className="text-xs text-neutral-400">Technical Depth:</span>
                            <span className="font-mono font-bold text-neutral-900 text-sm">
                              {emp.score} <span className={emp.delta.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}>({emp.delta})</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-indigo-900/5 border border-indigo-100 flex items-center justify-between text-xs">
                    <span className="text-indigo-950 font-medium">
                      💡 Click any employee above or launch workspace to inspect complete 35-rule trajectory assessments.
                    </span>
                    <button
                      onClick={() => onOpenWorkspace(activeEmployeeId)}
                      className="font-semibold text-indigo-600 hover:underline cursor-pointer"
                    >
                      Audit {activeEmployeeId} →
                    </button>
                  </div>
                </div>
              )}

              {/* 3D Spline Scene View */}
              {activeTab === '3d' && (
                <div className="flex-1 relative flex flex-col items-center justify-center p-6 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black text-white">
                  <SplineScene
                    variant="hero"
                    className="w-full h-80"
                    title="Interactive Spline 3D Crystal Engine"
                  />
                  <div className="text-center mt-2 z-10">
                    <h4 className="font-semibold text-sm text-neutral-200">Interactive 3D Geometric Capability Core</h4>
                    <p className="text-xs text-neutral-400 max-w-md mx-auto mt-1">
                      Ready for Spline model drop-in. Simply paste your scene URL in <code className="text-amber-400 font-mono">splineConfig.js</code> to load your customized 3D assets seamlessly.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Sub-Hero Transition Kicker (Matching Screenshot 1 Bottom) */}
        <div className="mt-24 max-w-3xl mx-auto text-left sm:text-center">
          <div className="text-[12px] font-semibold tracking-widest text-neutral-400 uppercase mb-3">
            The Company Capability Brain
          </div>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-neutral-950 leading-tight">
            More than search. A brain that <br className="hidden sm:inline" />
            <span className="text-neutral-400 font-normal">knows, calculates trajectory, and acts.</span>
          </h2>
        </div>
      </div>
    </section>
  );
}
