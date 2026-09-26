"""
Nexora Systems Pvt. Ltd. — Synthetic Employee Dataset Generator
Pune-based B2B SaaS / FinTech company (~800 employees)

Generates:
  - scored_output.json  (9 months: Jan–Sep 2026, 5 competencies, rich evidence)
  - mockEmployees.js    (pre-computed trajectory + recommendations for the frontend)
"""

import json, math, random

# ── Company & Employee Master ─────────────────────────────────────────────────
COMPANY = "Nexora Systems Pvt. Ltd."

# (id, name, role, dept, story)
# story: "improver" | "strong_improver" | "mixed" | "declining" | "stagnant" | "insufficient"
EMPLOYEES = [
    ("EMP001", "Aryan Sharma",     "Staff Engineer",              "Engineering",       "strong_improver"),
    ("EMP002", "Priya Nair",       "Senior Software Engineer",    "Engineering",       "mixed"),
    ("EMP003", "Rohan Mehta",      "Product Manager",             "Product",           "improver"),
    ("EMP004", "Kavya Reddy",      "Junior Engineer",             "Engineering",       "insufficient"),
    ("EMP005", "Aditya Kulkarni",  "Tech Lead",                   "Engineering",       "declining"),
    ("EMP006", "Sneha Iyer",       "Digital Marketing Lead",      "Marketing",         "strong_improver"),
    ("EMP007", "Vikram Joshi",     "Senior Account Executive",    "Sales",             "mixed"),
    ("EMP008", "Ananya Krishnan",  "UX Design Lead",              "Design",            "stagnant"),
    ("EMP009", "Rahul Gupta",      "Backend Engineer",            "Engineering",       "improver"),
    ("EMP010", "Nisha Patel",      "HR Business Partner",         "Human Resources",   "stagnant"),
    ("EMP011", "Siddharth Rao",    "DevOps Engineer",             "Engineering",       "improver"),
    ("EMP012", "Meera Bhatt",      "Associate Product Manager",   "Product",           "mixed"),
    ("EMP013", "Karan Verma",      "Inside Sales Representative", "Sales",             "declining"),
    ("EMP014", "Divya Shankar",    "ML Engineer",                 "AI & Data",         "strong_improver"),
    ("EMP015", "Ravi Pillai",      "Operations Manager",          "Operations",        "stagnant"),
    ("EMP016", "Pooja Malhotra",   "Frontend Engineer",           "Engineering",       "improver"),
    ("EMP017", "Akash Bansal",     "Finance Analyst",             "Finance",           "insufficient"),
    ("EMP018", "Shreya Desai",     "QA Engineer",                 "Engineering",       "stagnant"),
    ("EMP019", "Nikhil Chandra",   "System Architect",            "Engineering",       "declining"),
    ("EMP020", "Tanvi Agarwal",    "Associate Product Manager",   "Product",           "strong_improver"),
]

MONTHS = ["2026-01","2026-02","2026-03","2026-04","2026-05","2026-06","2026-07","2026-08","2026-09"]

COMPETENCIES = ["technical_depth","communication","leadership","collaboration","ownership"]

EVIDENCE_SOURCES = {
    "manager_review":   {"type": "review",   "weight": 0.5},
    "peer_360":         {"type": "peer",     "weight": 0.2},
    "project_outcome":  {"type": "project",  "weight": 0.3},
    "training_cert":    {"type": "training", "weight": 0.25},
    "kpi_metric":       {"type": "kpi",      "weight": 0.35},
}

# ── Score Trajectory Builders ─────────────────────────────────────────────────

def clamp(v):
    return max(0, min(100, round(v)))

def make_improving(start, step_low=3, step_high=8, months=9):
    scores = [start]
    for _ in range(months - 1):
        scores.append(clamp(scores[-1] + random.randint(step_low, step_high)))
    return scores

def make_strong_improver(start, months=9):
    return make_improving(start, step_low=5, step_high=12, months=months)

def make_declining(start, step_low=3, step_high=7, months=9):
    scores = [start]
    for _ in range(months - 1):
        scores.append(clamp(scores[-1] - random.randint(step_low, step_high)))
    return scores

def make_stagnant(base, months=9):
    return [clamp(base + random.randint(-3, 3)) for _ in range(months)]

def make_insufficient(base, months=2):
    return [clamp(base + random.randint(-2, 2)) for _ in range(months)]

def make_mixed_comp(comp_name, story):
    """Return per-competency trajectory scores for 9 months."""
    rng = lambda lo, hi: random.randint(lo, hi)
    if story == "strong_improver":
        starts = {"technical_depth": rng(55,65), "communication": rng(60,68), "leadership": rng(50,58), "collaboration": rng(62,70), "ownership": rng(55,63)}
        return make_strong_improver(starts[comp_name])
    elif story == "improver":
        starts = {"technical_depth": rng(60,70), "communication": rng(63,72), "leadership": rng(55,65), "collaboration": rng(65,73), "ownership": rng(60,68)}
        return make_improving(starts[comp_name])
    elif story == "declining":
        starts = {"technical_depth": rng(70,82), "communication": rng(60,72), "leadership": rng(65,75), "collaboration": rng(68,78), "ownership": rng(62,72)}
        return make_declining(starts[comp_name])
    elif story == "stagnant":
        bases = {"technical_depth": rng(60,70), "communication": rng(68,76), "leadership": rng(55,65), "collaboration": rng(70,78), "ownership": rng(62,70)}
        return make_stagnant(bases[comp_name])
    elif story == "insufficient":
        bases = {"technical_depth": rng(58,68), "communication": rng(62,70), "leadership": rng(52,60), "collaboration": rng(65,72), "ownership": rng(55,63)}
        return make_insufficient(bases[comp_name], months=2)
    elif story == "mixed":
        # Tech improving, communication declining, rest stagnant
        if comp_name == "technical_depth":
            return make_improving(rng(60,70))
        elif comp_name == "communication":
            return make_declining(rng(78,86))
        elif comp_name == "leadership":
            return make_insufficient(rng(60,68), months=3)
        else:
            return make_stagnant(rng(65,75))
    return make_stagnant(70)

def build_evidence(emp_id, comp_name, month_idx, score, story):
    sources = []
    # Every month has at least a manager review
    sources.append({
        "type": "review",
        "source": f"mgr_{month_idx+1:02d}_{emp_id.lower()}",
        "date": f"{MONTHS[month_idx]}-15",
        "value": score
    })
    # Quarterly peer 360 (Jan, Apr, Jul)
    if month_idx in [0, 3, 6]:
        sources.append({
            "type": "peer",
            "source": f"peer360_{MONTHS[month_idx]}",
            "date": f"{MONTHS[month_idx]}-20",
            "value": clamp(score + random.randint(-5, 5))
        })
    # Project outcomes (Feb, May, Aug)
    if month_idx in [1, 4, 7] and comp_name in ["technical_depth", "ownership", "leadership"]:
        proj_id = f"PROJ-{emp_id[-3:]}-{month_idx+1:02d}"
        sources.append({
            "type": "project",
            "source": proj_id,
            "date": f"{MONTHS[month_idx]}-28",
            "value": clamp(score + random.randint(-4, 6))
        })
    # Training certs (Mar, Jun, Sep)
    if month_idx in [2, 5, 8] and comp_name in ["technical_depth", "communication"]:
        cert_codes = ["AWS-SA", "CKAD", "PMP", "CSPO", "GCP-DE", "AZURE-104", "SCRUM-MASTER", "AI-900"]
        cert = random.choice(cert_codes)
        sources.append({
            "type": "training",
            "source": f"CERT-{cert}-{emp_id[-3:]}",
            "date": f"{MONTHS[month_idx]}-10",
            "value": clamp(score + random.randint(0, 8))
        })
    # KPI (for Sales, HR, Ops)
    if comp_name in ["collaboration", "communication"] and month_idx % 3 == 2:
        sources.append({
            "type": "kpi",
            "source": f"KPI-{comp_name[:3].upper()}-Q{(month_idx//3)+1}",
            "date": f"{MONTHS[month_idx]}-25",
            "value": clamp(score + random.randint(-3, 7))
        })
    return sources

# ── Build scored_output.json ──────────────────────────────────────────────────

random.seed(42)  # deterministic

employees_scored = []
for emp_id, name, role, dept, story in EMPLOYEES:
    scores_dict = {}
    for comp in COMPETENCIES:
        monthly_scores = make_mixed_comp(comp, story)
        entries = []
        for i, score in enumerate(monthly_scores):
            evidence = build_evidence(emp_id, comp, i, score, story)
            entries.append({
                "month": MONTHS[i],
                "score": score,
                "evidence": evidence
            })
        scores_dict[comp] = entries

    employees_scored.append({
        "employee_id": emp_id,
        "name": name,
        "role": role,
        "department": dept,
        "company": COMPANY
    } | {"scores": scores_dict})

scored_output = {"company": COMPANY, "employees": employees_scored}

with open("scored_output.json", "w") as f:
    json.dump(scored_output, f, indent=2)

print(f"[OK] scored_output.json - {len(employees_scored)} employees, {len(COMPETENCIES)} competencies, {len(MONTHS)} months each")

# ── Quick trajectory computation (mirrors trajectory_engine.py logic) ─────────

DEFAULT_THRESHOLD = 0.6
STAGNANT_THRESHOLD = 5

def compute_confidence(entries):
    total_ev = sum(len(e["evidence"]) for e in entries)
    unique_src = len({ev["source"] for e in entries for ev in e["evidence"]})
    num_cycles = len(entries)
    total_score = min(total_ev / 15, 1.0) * 0.45 + min(unique_src / 10, 1.0) * 0.35 + min(num_cycles / 9, 1.0) * 0.20
    return round(total_score, 4)

def compute_trend(scores_array, confidence):
    if len(scores_array) < 2 or confidence < DEFAULT_THRESHOLD:
        return "insufficient_evidence"
    delta = scores_array[-1] - scores_array[0]
    if abs(delta) <= STAGNANT_THRESHOLD:
        return "stagnant"
    return "improving" if delta > 0 else "declining"

def make_ai_recommendation(emp, story):
    name = emp["name"].split()[0]
    comps = emp["competencies"]
    improving = [c for c in comps if c["trend"] == "improving"]
    declining  = [c for c in comps if c["trend"] == "declining"]
    insuff     = [c for c in comps if c["insufficient_evidence"]]

    if story == "strong_improver":
        summary = f"{name} is on an exceptional growth trajectory across all measured competencies. Technical Depth and Ownership are showing the strongest gains. Recommend stretch assignments and cross-functional exposure."
        recs = [
            f"Assign {name} to lead a high-visibility client integration project to leverage their accelerating technical depth trajectory.",
            f"Introduce {name} as a mentor to junior engineers — strong evidence base supports this leadership stretch.",
            f"Schedule quarterly architecture review participation to sustain momentum and add senior leadership evidence."
        ]
        ev_ids = [e for c in improving[:2] for e in c.get("evidence_used", [])[:2]]
    elif story == "declining":
        summary = f"{name} shows a consistent decline across technical and ownership competencies over the last 9 months. Immediate intervention and structured performance support is recommended before the next review cycle."
        recs = [
            f"Initiate a formal Performance Improvement Plan (PIP) with bi-weekly check-ins focused on ownership recovery.",
            f"Pair {name} with a senior technical mentor to diagnose and address root causes of the declining technical competency.",
            f"Reduce project complexity temporarily to rebuild confidence, and reintroduce stretch goals once baseline stability is achieved."
        ]
        ev_ids = [e for c in declining[:2] for e in c.get("evidence_used", [])[:2]]
    elif story == "mixed":
        summary = f"{name} presents a split profile: technical capability is growing while communication shows a concerning decline. Independent per-competency intervention is required."
        recs = [
            f"Enroll {name} in a structured communication and stakeholder management program to address the declining communication trajectory.",
            f"Leverage {name}'s improving technical depth by assigning an architecture documentation task — builds both technical and communication evidence.",
            f"Increase evidence collection frequency for leadership to move out of the insufficient-evidence state."
        ]
        ev_ids = [e for c in comps[:2] for e in c.get("evidence_used", [])[:2]]
    elif story == "insufficient":
        summary = f"{name} is a recent joiner with limited longitudinal evidence. The system explicitly flags insufficient confidence for trajectory assessment. Allow 2 more review cycles before drawing capability conclusions."
        recs = [
            f"Assign {name} to a structured onboarding project with weekly manager check-ins to accelerate evidence accumulation.",
            f"Initiate a formal 30-60-90 day goal framework to create traceable performance evidence across all five competencies.",
            f"Schedule a peer 360 survey in the next review cycle to supplement manager-only evidence currently on record."
        ]
        ev_ids = [e for c in insuff[:1] for e in c.get("evidence_used", [])[:2]]
    elif story == "stagnant":
        summary = f"{name} is performing consistently but without meaningful growth. Scores are stable but below potential for their seniority level. Targeted motivation and challenge is recommended."
        recs = [
            f"Create a personalised growth plan for {name} with explicit 6-month trajectory milestones tied to project outcomes.",
            f"Offer exposure to a new domain or technology stream to break the stagnation pattern across multiple competencies.",
            f"Introduce cross-functional collaboration tasks to increase evidence source diversity and improve confidence scores."
        ]
        ev_ids = [e for c in comps[:2] for e in c.get("evidence_used", [])[:1]]
    else:  # improver
        summary = f"{name} is showing healthy, consistent growth. Scores are improving steadily across most competencies. Sustain current trajectory with targeted leadership development."
        recs = [
            f"Provide {name} with a stretch goal in the next project cycle to accelerate the improving technical depth trajectory.",
            f"Nominate {name} for a cross-department collaboration initiative to build leadership and ownership evidence.",
            f"Introduce quarterly 360 reviews to increase evidence density and confidence for leadership assessment."
        ]
        ev_ids = [e for c in comps[:2] for e in c.get("evidence_used", [])[:2]]

    return {
        "employee_id": emp["employee_id"],
        "name": emp["name"],
        "summary": summary,
        "recommendations": recs,
        "evidence_ids": list(dict.fromkeys(ev_ids))[:4],
        "generation_source": "ai" if story != "insufficient" else "fallback",
        "model": "claude-opus-5-5" if story != "insufficient" else None
    }

# ── Build trajectory + mock JS in one pass ──────────────────────────────────

STORY_MAP = {e[0]: e[4] for e in EMPLOYEES}
ROLE_MAP   = {e[0]: e[2] for e in EMPLOYEES}

COMP_LABELS = {
    "technical_depth": "Technical Depth",
    "communication": "Communication",
    "leadership": "Leadership & Ownership",
    "collaboration": "Collaboration",
    "ownership": "Ownership",
}

trajectory_employees = []
mock_trajectory = []
mock_recommendations = []

for emp_data in scored_output["employees"]:
    emp_id = emp_data["employee_id"]
    story  = STORY_MAP[emp_id]
    competencies = []

    for comp_name, monthly in emp_data["scores"].items():
        monthly_sorted = sorted(monthly, key=lambda x: x["month"])
        scores_arr = [e["score"] for e in monthly_sorted]
        cycles_arr = [{"cycle": e["month"], "score": e["score"]} for e in monthly_sorted]
        deltas     = [{"from_cycle": cycles_arr[i]["cycle"], "to_cycle": cycles_arr[i+1]["cycle"],
                       "delta": cycles_arr[i+1]["score"] - cycles_arr[i]["score"]}
                      for i in range(len(cycles_arr)-1)]

        confidence = compute_confidence(monthly_sorted)
        trend      = compute_trend(scores_arr, confidence)
        insuff     = trend == "insufficient_evidence"
        delta      = (scores_arr[-1] - scores_arr[0]) if len(scores_arr) >= 2 else None
        total_ev   = sum(len(e["evidence"]) for e in monthly_sorted)
        ev_refs    = list(dict.fromkeys(ev["source"] for e in monthly_sorted for ev in e["evidence"]))

        c = {
            "competency": comp_name,
            "label": COMP_LABELS[comp_name],
            "scores": scores_arr,
            "cycles": cycles_arr,
            "cycle_deltas": deltas,
            "delta": delta,
            "trend": trend,
            "confidence": confidence,
            "insufficient_evidence": insuff,
            "evidence_count": total_ev,
            "evidence_used": ev_refs,
            "latest_score": scores_arr[-1],
            "previous_score": scores_arr[-2] if len(scores_arr) >= 2 else None,
        }
        competencies.append(c)

    traj_emp = {
        "employee_id": emp_id,
        "name": emp_data["name"],
        "role": emp_data.get("role", ""),
        "department": emp_data["department"],
        "competencies": competencies,
    }
    trajectory_employees.append(traj_emp)
    mock_trajectory.append(traj_emp)
    mock_recommendations.append(make_ai_recommendation(traj_emp, story))

# ── Write trajectory_output.json ──────────────────────────────────────────────

traj_output = {"company": COMPANY, "employees": trajectory_employees}
with open("trajectory/trajectory_output.json", "w") as f:
    json.dump(traj_output, f, indent=2)
print("[OK] trajectory/trajectory_output.json")

# ── Write recommendations.json ────────────────────────────────────────────────

reco_output = {"company": COMPANY, "employees": mock_recommendations}
with open("recommendation/recommendations.json", "w") as f:
    json.dump(reco_output, f, indent=2)
print("[OK] recommendation/recommendations.json")

# ── Write mockEmployees.js ────────────────────────────────────────────────────

def js_block():
    traj_js   = json.dumps({"employees": mock_trajectory}, indent=2)
    reco_js   = json.dumps({"employees": mock_recommendations}, indent=2)

    out = f"""// Auto-generated by generate_nexora_dataset.py
// Company: {COMPANY}
// Dataset: 20 Indian employees, 5 competencies, 9 months (Jan-Sep 2026)

export const trajectoryData = {traj_js};

export const recommendationsData = {reco_js};
"""
    return out

with open("frontend/src/data/mockEmployees.js", "w") as f:
    f.write(js_block())
print(f"[OK] frontend/src/data/mockEmployees.js - {len(mock_trajectory)} employees")

print("\n[OK] All files generated successfully!")
