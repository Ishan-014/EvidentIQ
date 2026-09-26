# Architecture Documentation — EvidentIQ

EvidentIQ transforms longitudinal multi-source employee evidence into verifiable competency trajectories, confidence scores, and auditable AI coaching recommendations.

```
+-----------------------------------------------------------------------------+
|                          EVIDENTIQ ARCHITECTURE                             |
+-----------------------------------------------------------------------------+

   [Multi-Source Evidence]
   (Reviews, Projects, Peer 360, Training Certs, KPIs)
                           │
                           ▼
             ┌───────────────────────────┐
             │         MODULE 1          │
             │   Scoring & Validation    │
             │  (scoring/score_engine.py)│
             └─────────────┬─────────────┘
                           │ scored_output.json
                           ▼
             ┌───────────────────────────┐
             │         MODULE 2          │
             │   Trajectory & Confidence │
             │(trajectory/trajectory_eng)│
             └─────────────┬─────────────┘
                           │ trajectory_output.json
                           ▼
             ┌───────────────────────────┐
             │         MODULE 3          │
             │    AI Recommendation      │
             │ (OpenRouter/Claude + FB)  │
             └─────────────┬─────────────┘
                           │ recommendations.json
                           ▼
             ┌───────────────────────────┐
             │      FRONTEND WORKSPACE   │
             │  (React 19 + Tailwind v4  │
             │  + 3D Spline Polyhedra)   │
             └───────────────────────────┘
```

## Core Pipeline Principles

1. **Deterministic Before LLM**: Scores, cycles, trends, and confidence are computed entirely through deterministic Python algorithms before any LLM is queried.
2. **Zero-Hallucination Contract**: AI coaching recommendations cite only ground-truth evidence identifiers verified by the scoring engine.
3. **Explicit Uncertainty**: If evidence count is below threshold (<2 items) or confidence is low (<0.60), the system explicitly flags `insufficient_evidence: true` instead of guessing.
4. **Interactive What-If Simulation**: Hypothetical deliverable injections dynamically recalculate confidence, velocity deltas, and trajectory classifications in real time.
