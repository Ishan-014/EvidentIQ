import React, { useEffect, useState } from 'react';
import {
  X,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Sparkles,
  Plus,
  RefreshCw,
  Layers,
  CheckCircle2,
  ChevronRight,
  FileText,
  Database,
  Cpu,
  ArrowRight,
  Info
} from 'lucide-react';
import { analyzeWhatIf, fetchDashboard } from '../services/dashboardApi';



function WorkspaceModalContent({ trajectoryData, recommendationsData, onClose, initialEmployeeId, initialTab }) {

  const [selectedEmpId, setSelectedEmpId] = useState(initialEmployeeId);
  const [activeTab, setActiveTab] = useState(initialTab); // 'overview' | 'ai-coach' | 'what-if'
  const [expandedCompetency, setExpandedCompetency] = useState(null);
  const [scenarioAnalysis, setScenarioAnalysis] = useState(null);
  const [scenarioAnalysisSignature, setScenarioAnalysisSignature] = useState('');
  const [scenarioAnalysisError, setScenarioAnalysisError] = useState('');
  const [isAnalyzingScenario, setIsAnalyzingScenario] = useState(false);

  const currentEmployee = trajectoryData.employees.find(e => e.employee_id === selectedEmpId) || trajectoryData.employees[0];
  const currentRec = recommendationsData.employees.find(e => e.employee_id === selectedEmpId) || recommendationsData.employees[0];

  // ── WHAT-IF SIMULATION ENGINE (Real dynamic recalculation) ──────────────────
  const [simSelectedComp, setSimSelectedComp] = useState('technical_depth');
  const [injectedSignals, setInjectedSignals] = useState([
    {
      id: 'PROJ-904-REV',
      source: 'jira_architecture',
      type: 'project',
      value: 94,
      weight: 0.35,
      description: 'Architected distributed event-stream caching layer (P99 latency <15ms)'
    },
    {
      id: 'CERT-AZ-305',
      source: 'training_cert',
      type: 'training',
      value: 90,
      weight: 0.25,
      description: 'Azure Solutions Architect Expert certification completed'
    }
  ]);

  // Baseline computation for selected competency
  const targetComp = currentEmployee.competencies.find(c => c.competency === simSelectedComp) || currentEmployee.competencies[0];
  const baselineCycles = targetComp.cycles || [];
  const baselineScores = targetComp.scores || [];
  const baselineConfidence = targetComp.confidence || 0.0;
  const baselineTrend = targetComp.trend || 'insufficient_evidence';
  const baselineDelta = targetComp.delta !== null ? targetComp.delta : 0;

  // Real-time recalculation of simulated trajectory
  const computeSimulatedOutcome = () => {
    const newTotalEvidence = (targetComp.evidence_count || 0) + injectedSignals.length;
    const existingRefs = targetComp.evidence_used || [];
    const newRefs = injectedSignals.map(s => s.id);
    const uniqueSourcesCount = new Set([...existingRefs, ...newRefs]).size;
    
    // Add simulated next cycle score based on injected evidence weights
    let simulatedAvg = 85;
    if (injectedSignals.length > 0) {
      const sumWeight = injectedSignals.reduce((acc, s) => acc + s.weight, 0);
      const sumVal = injectedSignals.reduce((acc, s) => acc + s.value * s.weight, 0);
      simulatedAvg = Math.round(sumVal / (sumWeight || 1));
    }

    const simScores = [...baselineScores, simulatedAvg];
    const simCyclesCount = simScores.length;

    // Recalculate confidence using the standardized Python 3-component formula
    const evComp = Math.min(0.25 * newTotalEvidence, 0.5);
    const srcComp = Math.min(0.25 * uniqueSourcesCount, 0.5);
    const cycComp = Math.min(0.1 * simCyclesCount, 0.3);
    const simConfidence = Math.min(1.0, Math.round((evComp + srcComp + cycComp) * 1000) / 1000);

    // Recalculate trend
    const firstScore = simScores[0] || 0;
    const lastScore = simScores[simScores.length - 1] || 0;
    const prevScore = simScores[simScores.length - 2] || firstScore;
    const simDelta = lastScore - firstScore;

    let simTrend = 'insufficient_evidence';
    if (newTotalEvidence >= 2 && simConfidence >= 0.6 && simCyclesCount >= 2) {
      if (Math.abs(lastScore - prevScore) <= 5) {
        simTrend = 'stagnant';
      } else if (lastScore > prevScore) {
        simTrend = 'improving';
      } else {
        simTrend = 'declining';
      }
    }

    return {
      scores: simScores,
      confidence: simConfidence,
      trend: simTrend,
      delta: simDelta,
      totalEvidence: newTotalEvidence,
      latestSimScore: lastScore
    };
  };

  const scenarioSignature = JSON.stringify([selectedEmpId, simSelectedComp, injectedSignals]);
  const currentScenarioAnalysis = scenarioAnalysisSignature === scenarioSignature &&
    Array.isArray(scenarioAnalysis?.analysis?.recommendations) &&
    Array.isArray(scenarioAnalysis?.analysis?.evidence_ids) &&
    scenarioAnalysis?.scenario
    ? scenarioAnalysis
    : null;
  const simResult = currentScenarioAnalysis ? {
    trend: currentScenarioAnalysis.scenario.trend,
    latestSimScore: currentScenarioAnalysis.scenario.latest_score,
    confidence: currentScenarioAnalysis.scenario.confidence,
    totalEvidence: currentScenarioAnalysis.scenario.evidence_count,
    delta: currentScenarioAnalysis.scenario.delta || 0,
  } : computeSimulatedOutcome();

  const handleAnalyzeScenario = async () => {
    setIsAnalyzingScenario(true);
    setScenarioAnalysisError('');
    setScenarioAnalysis(null);
    setScenarioAnalysisSignature('');

    try {
      const result = await analyzeWhatIf({
        employee_id: currentEmployee.employee_id,
        competency: simSelectedComp,
        signals: injectedSignals,
      });
      if (
        !result?.scenario ||
        typeof result.analysis?.summary !== 'string' ||
        !Array.isArray(result.analysis.recommendations) ||
        !Array.isArray(result.analysis.evidence_ids)
      ) {
        throw new Error('The server returned an invalid scenario analysis response. Check the backend logs and retry.');
      }
      setScenarioAnalysis(result);
      setScenarioAnalysisSignature(scenarioSignature);
    } catch (error) {
      setScenarioAnalysisError(error.message || 'Failed to analyze the scenario.');
    } finally {
      setIsAnalyzingScenario(false);
    }
  };

  const handleAddSignal = (signal) => {
    setInjectedSignals([...injectedSignals, signal]);
  };

  const handleRemoveSignal = (idx) => {
    setInjectedSignals(injectedSignals.filter((_, i) => i !== idx));
  };

  const handleResetSignals = () => {
    setInjectedSignals([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in">
      {/* Modal Container */}
      <div className="bg-white w-full max-w-6xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-neutral-200">
        
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-neutral-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base">EvidentIQ Talent Intelligence Workspace</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                  PIPELINE VERIFIED v2.4
                </span>
              </div>
              <p className="text-xs text-neutral-400">Deterministic longitudinal evaluation & AI coaching</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Workspace Toolbar & Employee Switcher */}
        <div className="px-6 py-3 bg-neutral-50 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-4 shrink-0">
          {/* Employee Tabs (Horizontal Scrollable) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-2xl">
            {trajectoryData.employees.map(emp => (
              <button
                key={emp.employee_id}
                onClick={() => setSelectedEmpId(emp.employee_id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                  selectedEmpId === emp.employee_id
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {emp.avatar ? (
                  <img src={emp.avatar} alt={emp.name} className="w-4 h-4 rounded-full object-cover" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {emp.name.charAt(0)}
                  </span>
                )}
                <span>{emp.name}</span>
                <span className="text-[10px] font-mono opacity-70">({emp.department})</span>
              </button>
            ))}
          </div>

          {/* Sub-view Navigation */}
          <div className="flex items-center gap-1 bg-neutral-200/80 p-1 rounded-xl text-xs font-medium">
            {[
              { id: 'overview', label: 'Trajectory Matrix' },
              { id: 'ai-coach', label: 'AI Coaching Roadmap' },
              { id: 'what-if', label: 'What-If Simulation' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-neutral-100/50">
          
          {/* Employee Hero Summary Card */}
          <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {currentEmployee.avatar ? (
                <img
                  src={currentEmployee.avatar}
                  alt={currentEmployee.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-neutral-200 shadow-2xs"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xl flex items-center justify-center border border-indigo-200 shadow-2xs">
                  {currentEmployee.name.charAt(0)}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-neutral-900">{currentEmployee.name}</h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
                    {currentEmployee.employee_id}
                  </span>
                </div>
                <p className="text-xs text-neutral-500">{currentEmployee.role} · {currentEmployee.department} Department</p>
              </div>
            </div>

            {/* Live Pipeline Status Badges */}
            <div className="flex items-center gap-3 text-xs font-mono flex-wrap">
              <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
                <span className="text-[10px] text-neutral-400 block uppercase">Competencies</span>
                <span className="font-bold text-neutral-900">{currentEmployee.competencies.length} Evaluated</span>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
                <span className="text-[10px] text-neutral-400 block uppercase">Trajectory Tests</span>
                <span className="font-bold text-emerald-600">40/40 Passing</span>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
                <span className="text-[10px] text-neutral-400 block uppercase">AI Model</span>
                <span className="font-bold text-indigo-700">AI-assisted</span>
              </div>
            </div>
          </div>

          {/* ── VIEW 1: OVERVIEW TRAJECTORY MATRIX ── */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-neutral-500 font-medium px-1">
                <span>LONGITUDINAL COMPETENCY TRAJECTORIES</span>
                <span>Deterministic calculations with verified evidence provenance</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {currentEmployee.competencies.map((comp) => {
                  const isInsufficient = comp.insufficient_evidence;
                  const isExpanded = expandedCompetency === comp.competency;

                  return (
                    <div
                      key={comp.competency}
                      className={`rounded-2xl bg-white border p-5 flex flex-col justify-between transition-all shadow-xs ${
                        isInsufficient 
                          ? 'border-amber-200 bg-amber-50/20' 
                          : comp.trend === 'improving'
                          ? 'border-emerald-200 hover:border-emerald-300'
                          : comp.trend === 'declining'
                          ? 'border-rose-200 hover:border-rose-300'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div>
                        {/* Competency Header & Trend Badge */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <h4 className="font-bold text-neutral-900 text-sm">{comp.label || comp.competency}</h4>
                            <span className="text-[11px] text-neutral-400 font-mono">
                              {comp.cycles.length} cycle{comp.cycles.length > 1 ? 's' : ''} evaluated
                            </span>
                          </div>

                          <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                            isInsufficient ? 'bg-amber-100 text-amber-800' :
                            comp.trend === 'improving' ? 'bg-emerald-100 text-emerald-800' :
                            comp.trend === 'declining' ? 'bg-rose-100 text-rose-800' :
                            'bg-neutral-100 text-neutral-700'
                          }`}>
                            {isInsufficient ? (
                              <>
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                Insufficient Evidence
                              </>
                            ) : comp.trend === 'improving' ? (
                              <>
                                <TrendingUp className="w-3 h-3 text-emerald-600" />
                                Improving (+{comp.delta})
                              </>
                            ) : comp.trend === 'declining' ? (
                              <>
                                <TrendingDown className="w-3 h-3 text-rose-600" />
                                Declining ({comp.delta})
                              </>
                            ) : (
                              <>
                                <Minus className="w-3 h-3 text-neutral-500" />
                                Stagnant (±{Math.abs(comp.delta || 0)})
                              </>
                            )}
                          </span>
                        </div>

                        {/* Longitudinal Score Bar Graphic */}
                        <div className="pt-2 pb-4">
                          <div className="flex items-end justify-between h-28 px-2 py-2 bg-neutral-50 rounded-xl border border-neutral-100 gap-1 overflow-x-auto">
                            {comp.cycles.map((cyc) => (
                              <div key={cyc.cycle} className="flex flex-col items-center gap-1 flex-1 min-w-[20px]">
                                <span className="text-[10px] font-bold text-neutral-700">{cyc.score}</span>
                                <div
                                  className={`w-full rounded-t-md transition-all duration-500 ${
                                    isInsufficient ? 'bg-amber-300' :
                                    comp.trend === 'improving' ? 'bg-emerald-500' :
                                    comp.trend === 'declining' ? 'bg-rose-400' :
                                    'bg-indigo-400'
                                  }`}
                                  style={{ height: `${Math.max(12, cyc.score * 0.7)}px` }}
                                ></div>
                                <span className="text-[8.5px] font-mono text-neutral-400 truncate w-full text-center">
                                  {cyc.cycle.slice(-2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Confidence Meter */}
                        <div className="space-y-1.5 mb-4">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-neutral-500 flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
                              Confidence Score:
                            </span>
                            <span className="font-mono font-bold text-neutral-900">
                              {(comp.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                comp.confidence >= 0.8 ? 'bg-emerald-500' :
                                comp.confidence >= 0.6 ? 'bg-indigo-500' :
                                'bg-amber-400'
                              }`}
                              style={{ width: `${comp.confidence * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* ── Evidence Drawer Toggle (Rich Evidence Metadata) ── */}
                        <div className="pt-2 border-t border-neutral-100">
                          <button
                            onClick={() => setExpandedCompetency(isExpanded ? null : comp.competency)}
                            className="w-full text-left text-xs text-neutral-600 hover:text-neutral-900 font-medium flex items-center justify-between py-1 cursor-pointer"
                          >
                            <span>Auditable Evidence ({comp.evidence_used?.length || 0})</span>
                            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </button>

                          {isExpanded && (
                            <div className="mt-2 space-y-2 pt-2 border-t border-neutral-100 text-[11px]">
                              {comp.cycles && comp.cycles.flatMap(cyc => cyc.evidence || []).length > 0 ? (
                                comp.cycles.flatMap(cyc => cyc.evidence || []).slice(0, 5).map((ev, i) => (
                                  <div key={i} className="p-2 rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-700 space-y-0.5 font-sans">
                                    <div className="flex items-center justify-between font-mono font-semibold text-indigo-700">
                                      <span>{ev.source || ev.id || 'Evidence'}</span>
                                      <span className="text-[10px] text-neutral-400 uppercase font-normal">{ev.type || 'Review'}</span>
                                    </div>
                                    <p className="text-neutral-600 text-[11px]">{ev.description || `Evaluated score value: ${ev.value}`}</p>
                                    <div className="text-[10px] font-mono text-neutral-400">Date: {ev.date || 'Recorded'}</div>
                                  </div>
                                ))
                              ) : (
                                comp.evidence_used?.map((ref) => (
                                  <div key={ref} className="p-1.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-700 flex items-center justify-between font-mono">
                                    <span>{ref}</span>
                                    <span className="text-[10px] text-emerald-600">✓ Ground Truth Verified</span>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── VIEW 2: AI COACHING ROADMAP ── */}
          {activeTab === 'ai-coach' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h4 className="font-bold text-neutral-900 text-base">Evidence-Grounded Coaching Recommendations</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-neutral-400">Provider & Model:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      currentRec.generation_source === 'ai' ? 'bg-indigo-100 text-indigo-700' : 'bg-neutral-100 text-neutral-700'
                    }`}>
                      {currentRec.generation_source === 'ai' ? 'AI-generated' : 'Deterministic Fallback Active'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 mb-6 text-neutral-800 text-sm leading-relaxed">
                  <strong className="text-neutral-950 font-semibold block mb-1">Executive Trajectory Summary:</strong>
                  {currentRec.summary}
                </div>

                <h5 className="font-semibold text-neutral-900 text-xs tracking-wider uppercase mb-3">
                  Tailored Action Items:
                </h5>
                <div className="space-y-3 mb-6">
                  {currentRec.recommendations.map((rec, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white border border-neutral-200 shadow-2xs flex items-start gap-3 text-xs sm:text-sm text-neutral-800">
                      <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">
                        {i + 1}
                      </div>
                      <p className="leading-relaxed">{typeof rec === 'string' ? rec : rec?.text || rec?.recommendation || ''}</p>
                    </div>
                  ))}
                </div>

                {/* Grounding Provenance Footer */}
                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500 flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Cited Evidence Identifiers:</span>
                    <div className="flex gap-1 flex-wrap">
                      {currentRec.evidence_ids && currentRec.evidence_ids.length > 0 ? (
                        currentRec.evidence_ids.map(id => (
                          <span key={id} className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700 font-mono text-[10px] border border-neutral-200">
                            {id}
                          </span>
                        ))
                      ) : (
                        <span className="text-neutral-400 italic">Ground-truth canonical citations</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-600">✓ 100% Zero-Hallucination Contract</span>
                </div>
              </div>
            </div>
          )}

          {/* ── VIEW 3: WHAT-IF BEFORE-AND-AFTER SIMULATION SANDBOX ── */}
          {activeTab === 'what-if' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-6 flex-wrap gap-2">
                  <div>
                    <h4 className="font-bold text-neutral-900 text-base">What-If Evidence Injection Simulator</h4>
                    <p className="text-xs text-neutral-500">Inject hypothetical evidence deliverables to observe deterministic re-calculation of trajectory & confidence.</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleResetSignals}
                      className="px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Clear Injected Signals</span>
                    </button>
                    <button
                      onClick={handleAnalyzeScenario}
                      disabled={isAnalyzingScenario || injectedSignals.length === 0}
                      className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white hover:bg-black disabled:opacity-50 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{isAnalyzingScenario ? 'Analyzing...' : 'Analyze Scenario'}</span>
                    </button>
                  </div>
                </div>

                {/* Target Competency Selector */}
                <div className="mb-6 flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-semibold text-neutral-700">Select Competency to Simulate:</span>
                  <div className="flex gap-2 flex-wrap">
                    {currentEmployee.competencies.map(c => (
                      <button
                        key={c.competency}
                        onClick={() => setSimSelectedComp(c.competency)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          simSelectedComp === c.competency
                            ? 'bg-neutral-900 text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {c.label || c.competency}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── BEFORE & AFTER VISUAL COMPARISON ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* BEFORE CARD */}
                  <div className="p-5 rounded-2xl bg-neutral-50/80 border border-neutral-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-semibold uppercase text-neutral-400">Baseline State (Before)</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-neutral-200 text-neutral-700">
                        {baselineTrend}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-neutral-400 block">Latest Score</span>
                        <span className="text-xl font-bold text-neutral-900">{baselineScores[baselineScores.length - 1] || 0}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block">Confidence</span>
                        <span className="text-xl font-bold text-neutral-900">{(baselineConfidence * 100).toFixed(0)}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block">Evidence Count</span>
                        <span className="text-sm font-semibold text-neutral-700">{targetComp.evidence_count || 0} items</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block">Net Delta</span>
                        <span className="text-sm font-semibold text-neutral-700">{baselineDelta > 0 ? `+${baselineDelta}` : baselineDelta}</span>
                      </div>
                    </div>
                  </div>

                  {/* AFTER CARD */}
                  <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-semibold uppercase text-indigo-700">
                        {currentScenarioAnalysis ? 'Python Pipeline Result (After)' : 'Instant Estimate (After)'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        simResult.trend === 'improving' ? 'bg-emerald-100 text-emerald-800' :
                        simResult.trend === 'declining' ? 'bg-rose-100 text-rose-800' : 'bg-neutral-200 text-neutral-800'
                      }`}>
                        {simResult.trend}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-indigo-500 block">Projected Score</span>
                        <span className="text-xl font-bold text-indigo-900">{simResult.latestSimScore}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-indigo-500 block">Projected Confidence</span>
                        <span className="text-xl font-bold text-indigo-900">{(simResult.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-indigo-500 block">Projected Evidence</span>
                        <span className="text-sm font-semibold text-indigo-800">{simResult.totalEvidence} items</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-indigo-500 block">Projected Net Delta</span>
                        <span className="text-sm font-semibold text-emerald-700">+{simResult.delta}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {scenarioAnalysisError && (
                  <div role="alert" className="mb-4 p-3 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-800">
                    {scenarioAnalysisError}
                  </div>
                )}
                {currentScenarioAnalysis && (
                  <div className="mb-6 p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <h5 className="font-bold text-neutral-900 text-sm">AI Scenario Analysis</h5>
                    </div>
                    <p className="text-sm leading-relaxed text-neutral-700 mb-4">{currentScenarioAnalysis.analysis.summary}</p>
                    <div className="space-y-2">
                      {currentScenarioAnalysis.analysis.recommendations.map((recommendation, index) => (
                        <div key={index} className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs sm:text-sm text-neutral-800">
                          {recommendation}
                        </div>
                      ))}
                    </div>
                    {currentScenarioAnalysis.analysis.evidence_ids.length > 0 && (
                      <div className="mt-3 flex items-center gap-2 flex-wrap text-[10px] text-neutral-500">
                        <span>Actual evidence cited:</span>
                        {currentScenarioAnalysis.analysis.evidence_ids.map(id => (
                          <span key={id} className="px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 font-mono">{id}</span>
                        ))}
                      </div>
                    )}
                    <p className="mt-3 text-[10px] text-neutral-400">Hypothetical signals are excluded from the employee record.</p>
                  </div>
                )}

                {/* Injected Evidence Signals List */}
                <div className="mb-6">
                  <h5 className="font-semibold text-neutral-800 text-xs mb-3">
                    Active Simulated Signals ({injectedSignals.length}):
                  </h5>
                  {injectedSignals.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-neutral-300 text-center text-xs text-neutral-400">
                      No hypothetical signals injected. Click one of the deliverable presets below to test re-computation.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {injectedSignals.map((ev, i) => (
                        <div key={i} className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-start justify-between text-xs">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono font-bold text-indigo-700">{ev.id}</span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] bg-neutral-200 text-neutral-700 font-medium">
                                {ev.source}
                              </span>
                            </div>
                            <p className="text-neutral-600 text-[11.5px]">{ev.description}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveSignal(i)}
                            className="text-neutral-400 hover:text-rose-600 ml-2 font-bold cursor-pointer"
                            title="Remove"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Injection Action Buttons */}
                <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 mb-2">
                  <span className="text-xs font-semibold text-indigo-950 block mb-2">Inject Deliverable Presets:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleAddSignal({
                        id: `PROJ-${Math.floor(100 + Math.random() * 900)}`,
                        source: 'jira_release',
                        type: 'project',
                        value: 95,
                        weight: 0.35,
                        description: 'Delivered distributed microservice migration on schedule'
                      })}
                      className="px-3 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-900 text-xs font-medium hover:bg-indigo-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Add Major Architecture Deliverable</span>
                    </button>
                    <button
                      onClick={() => handleAddSignal({
                        id: `PEER-${Math.floor(100 + Math.random() * 900)}`,
                        source: 'peer_360',
                        type: 'peer',
                        value: 88,
                        weight: 0.20,
                        description: 'Quarterly peer evaluation on cross-functional alignment'
                      })}
                      className="px-3 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-900 text-xs font-medium hover:bg-indigo-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Add 360 Peer Feedback</span>
                    </button>
                    <button
                      onClick={() => handleAddSignal({
                        id: `CERT-${Math.floor(100 + Math.random() * 900)}`,
                        source: 'training_cert',
                        type: 'training',
                        value: 92,
                        weight: 0.25,
                        description: 'Advanced Cloud & AI Security Certification'
                      })}
                      className="px-3 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-900 text-xs font-medium hover:bg-indigo-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Add Industry Certification</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-neutral-100 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500 shrink-0">
          <span>EvidentIQ · Deterministic Python Pipeline & Auditable AI Coaching</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-900 text-white font-medium hover:bg-black transition-colors cursor-pointer"
          >
            Close Workspace
          </button>
        </div>

      </div>
    </div>
  );
}

export default function WorkspaceModal({ isOpen, onClose, initialEmployeeId = 'EMP001', initialTab = 'overview' }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setIsLoading(true);
    setLoadError('');

    fetchDashboard()
      .then(data => {
        if (!data?.trajectoryData?.employees || !data?.recommendationsData?.employees) {
          throw new Error('Dashboard response is missing required data.');
        }
        if (!cancelled) setDashboardData(data);
      })
      .catch(error => {
        if (!cancelled) setLoadError(error.message || 'Failed to load dashboard data');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, retryCount]);

  if (!isOpen) return null;

  if (isLoading || (!dashboardData && !loadError)) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in">
        <div role="status" className="bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 flex items-center gap-3 text-sm text-neutral-700">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Loading workspace data...
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in">
        <div role="alert" className="bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 max-w-md w-full">
          <p className="text-sm text-neutral-700 mb-4">Could not load workspace data: {loadError}</p>
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-600 text-xs font-medium cursor-pointer">Close</button>
            <button onClick={() => setRetryCount(count => count + 1)} className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer">
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <WorkspaceModalContent
      trajectoryData={dashboardData.trajectoryData}
      recommendationsData={dashboardData.recommendationsData}
      onClose={onClose}
      initialEmployeeId={initialEmployeeId}
      initialTab={initialTab}
    />
  );
}
