import React, { useState } from 'react';
import { Check, ArrowRight, ShieldCheck, Sparkles, TrendingUp, BarChart3, Users, Zap } from 'lucide-react';

export default function UseCases({ onOpenWorkspace }) {
  const [activeTab, setActiveTab] = useState('leadership');

  const useCases = {
    leadership: {
      title: 'Command every capability in one place',
      items: [
        {
          name: 'Daily capability briefing',
          desc: 'Always know the highest leverage talents and velocity trends delivered daily.'
        },
        {
          name: 'Risk & stagnation detection',
          desc: 'Detect capability plateaus and declining competencies months before annual reviews.'
        },
        {
          name: 'Promotion-readiness audit',
          desc: 'Run cross-system trajectory analysis for auditable, bias-free promotion packets.'
        },
        {
          name: 'Evidence-grounded coaching',
          desc: 'Produce personalized development roadmaps referencing specific project deliverables.'
        }
      ],
      preview: {
        role: 'Executive Briefing',
        metric: '+14% Org Velocity',
        badge: 'Board-Ready',
        dialogue: {
          user: 'Ashley (VP of Eng)',
          prompt: 'Prepare a 12-slide review of engineering staff readiness for the Q4 board meeting.',
          response: 'Generated complete audit covering 4 lead architects, including trajectory deltas, evidence completeness scores, and promotion recommendations.'
        }
      }
    },
    engineering: {
      title: 'Accelerate engineering craft & architecture',
      items: [
        {
          name: 'PR & RFC longitudinal velocity',
          desc: 'Track technical depth from merged architecture PRs, RFC reviews, and bug resolution rates.'
        },
        {
          name: 'Systemic bottleneck diagnosis',
          desc: 'Pinpoint teams with high technical output but stagnating communication.'
        },
        {
          name: 'Staff+ engineer mentoring loops',
          desc: 'Pair junior engineers with mentors who have proven longitudinal ownership scores.'
        }
      ],
      preview: {
        role: 'Engineering Review',
        metric: '95/100 Tech Depth',
        badge: 'David Okonkwo · Staff+',
        dialogue: {
          user: 'Marcus (Engineering Manager)',
          prompt: 'Audit David Okonkwo’s trajectory for Principal Engineer role.',
          response: 'Technical Depth is 95/100 (+7 over 4 cycles). However, Leadership shows -4 decline. Recommended action: assign formal mentee on infra roadmap.'
        }
      }
    },
    product: {
      title: 'Harmonize cross-functional execution',
      items: [
        {
          name: 'Cross-functional 360 correlation',
          desc: 'Combine design feedback, Jira ticket closure rates, and user NPS into a unified trajectory.'
        },
        {
          name: 'Sprint delivery vs capability delta',
          desc: 'Understand how challenging projects accelerate individual competency growth.'
        },
        {
          name: 'Objective peer review synthesis',
          desc: 'Filter out subjective noise with deterministic evidence weighting.'
        }
      ],
      preview: {
        role: 'Product & Design Matrix',
        metric: '88/100 Communication',
        badge: 'Carol Singh · Lead',
        dialogue: {
          user: 'Elena (Head of Product)',
          prompt: 'Evaluate Carol Singh’s cross-functional collaboration on the design sprint.',
          response: 'Communication score stable at 77-79 with high evidence density. Technical competency needs stretch assignment to break 65 baseline.'
        }
      }
    },
    sales: {
      title: 'Elevate quota attainment & deal leadership',
      items: [
        {
          name: 'Client pitch mastery tracking',
          desc: 'Measure client presentation growth from win/loss logs and pitch recording audits.'
        },
        {
          name: 'Deal cycle velocity vs technical depth',
          desc: 'Ensure enterprise AEs develop sufficient technical product knowledge.'
        },
        {
          name: 'Intervention triggers for declining scores',
          desc: 'Trigger automatic technical enablement when product competency scores trend downward.'
        }
      ],
      preview: {
        role: 'Sales & Enablement',
        metric: '88 Comm / 48 Tech',
        badge: 'Bob Martinez · AE',
        dialogue: {
          user: 'Sarah (CRO)',
          prompt: 'Check Bob Martinez’s enterprise technical certification progress.',
          response: 'Communication is top-tier (88). Technical depth has declined from 58 to 48. Recommended: pair with Solutions Engineer for live deal enablement.'
        }
      }
    }
  };

  const current = useCases[activeTab];

  return (
    <section id="use-cases" className="py-24 md:py-32 bg-white border-t border-neutral-200/60">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="text-[12px] font-semibold tracking-widest text-neutral-400 uppercase mb-3">
            Use Cases
          </div>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-neutral-950 leading-[1.12]">
            Make your company 10x faster. <br />
            <span className="text-neutral-400 font-normal">Across every team.</span>
          </h2>
        </div>

        {/* Tab Pills */}
        <div className="flex flex-wrap gap-2 mb-12">
          {[
            { id: 'leadership', label: '👑 Leadership' },
            { id: 'engineering', label: '⚡ Engineering' },
            { id: 'product', label: '🎯 Product & Design' },
            { id: 'sales', label: '💼 Sales & Ops' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-neutral-950 text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70 hover:text-neutral-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Card Container */}
        <div className="rounded-3xl bg-neutral-50/80 border border-neutral-200/90 p-8 sm:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Feature List */}
          <div className="lg:col-span-6 space-y-6">
            <h3 className="text-2xl sm:text-3xl font-semibold text-neutral-950 tracking-tight">
              {current.title}
            </h3>

            <div className="space-y-4 pt-2">
              {current.items.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 text-sm">{item.name}</h4>
                    <p className="text-neutral-500 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <button
                onClick={() => onOpenWorkspace()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-900 text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer shadow-sm"
              >
                <span>Launch {activeTab.toUpperCase()} Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: Dynamic Preview Window */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl bg-white border border-neutral-200/90 p-6 shadow-md">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-semibold text-xs text-neutral-800">{current.preview.role}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700">
                  {current.preview.badge}
                </span>
              </div>

              {/* Chat Interaction Simulation */}
              <div className="space-y-3 text-xs mb-4">
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-neutral-800">
                  <span className="font-semibold text-neutral-900 block mb-1">{current.preview.dialogue.user}</span>
                  {current.preview.dialogue.prompt}
                </div>
                <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100/80 text-neutral-800">
                  <div className="flex items-center gap-1.5 text-indigo-700 font-semibold mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>EvidentIQ Trajectory Report</span>
                  </div>
                  {current.preview.dialogue.response}
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="text-neutral-400 font-mono text-[11px]">Audit Engine: Verified 100%</span>
                <span className="font-bold text-neutral-900 font-mono">{current.preview.metric}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
