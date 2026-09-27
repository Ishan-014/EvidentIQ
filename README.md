# EvidentIQ — Longitudinal Talent Intelligence Engine

> **HackMatrix Round 01 Prototype**  
> Problem Statement: Evidence-Driven Talent Intelligence & Capability Trajectory Analysis

---

## 🌟 Overview

EvidentIQ moves beyond subjective, static annual performance scores ("Alice is an 82/100 employee") to build an auditable, evidence-backed longitudinal view of workforce competency development.

The system deterministically evaluates:
- **"How has this employee's competency evolved over multiple cycles?"**
- **"What concrete evidence supports that trajectory?"**
- **"How confident are we in that conclusion?"**
- **"Do we have enough evidence to draw a conclusion, or should we flag uncertainty?"**

---

## 🚀 Key Innovations & Architecture

```
[Raw Multi-Source Evidence] (Reviews, Projects, Peer 360, Training, KPIs)
                     │
                     ▼
       ┌───────────────────────────┐
       │         MODULE 1          │
       │   Scoring & Validation    │ (scoring/score_engine.py)
       └─────────────┬─────────────┘
                     │ scored_output.json
                     ▼
       ┌───────────────────────────┐
       │         MODULE 2          │
       │   Trajectory & Confidence │ (trajectory/trajectory_engine.py)
       └─────────────┬─────────────┘
                     │ trajectory_output.json
                     ▼
       ┌───────────────────────────┐
       │         MODULE 3          │
       │    AI Recommendation      │ (OpenAI API + Fallback)
       └─────────────┬─────────────┘
                     │ recommendations.json
                     ▼
       ┌───────────────────────────┐
       │    FRONTEND WORKSPACE     │ (React 19 + Tailwind v4 + Spline 3D)
       └───────────────────────────┘
```

1. **Deterministic Before LLM**: Trend classifications and confidence calculations are strictly executed in Python before LLM prompting.
2. **Explicit Uncertainty**: Scores with insufficient observations (<2 cycles or <2 evidence items) are marked `insufficient_evidence: true`.
3. **Zero-Hallucination Contract**: AI coaching suggestions only cite verified ground-truth evidence identifiers.
4. **Interactive What-If Simulation**: Hypothetical deliverable injections dynamically recalibrate confidence and trajectory deltas in real-time.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React, Spline 3D Runtime (`@splinetool/runtime`).
- **Backend Pipeline**: Python 3.10+, deterministic JSON data processing, mathematical confidence scoring.
- **AI & LLM**: OpenAI API (configurable model) with structured JSON output enforcement and deterministic fallback.
- **Testing**: Python `unittest` suite (Scoring, Trajectory Engine, AI Validation & Fallback).

---

## 🏁 Quickstart & Demo Workflow

### 1. Run the End-to-End Pipeline
```bash
python run_pipeline.py
```

### 2. Run Automated Test Suites
```bash
# Run Trajectory Engine Tests (40 tests)
python -m unittest discover trajectory/tests

# Run Scoring Engine Tests (5 tests)
python -m unittest discover scoring/tests

# Run Recommendation & Fallback Tests (5 tests)
python -m unittest discover recommendation/tests
```

### 3. Start the Interactive Frontend
```bash
cd frontend
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** to launch the workspace and interact with live employee capability models.
