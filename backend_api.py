import json
import math
from copy import deepcopy
from datetime import datetime
from pathlib import Path
from functools import lru_cache

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from scoring.score_engine import EVIDENCE_WEIGHTS, score_all
from trajectory.trajectory_engine import compute_trajectory
from recommendation.recommendation_engine import (
    generate_recommendation,
    generate_what_if_analysis,
)


BASE_DIR = Path(__file__).resolve().parent

RAW_DATA_PATH = BASE_DIR / "data" / "raw_dataset.json"
PROMPT_PATH = (
    BASE_DIR
    / "recommendation"
    / "prompts"
    / "system_prompt.txt"
)
FALLBACK_PATH = BASE_DIR / "recommendation" / "fallback.json"


app = FastAPI(
    title="EvidentIQ API",
    description="Live talent intelligence and coaching API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def read_json(path):
    with open(path, "r", encoding="utf-8-sig") as file:
        return json.load(file)


def get_competency_label(key):
    labels = {
        "technical_depth": "Technical Depth",
        "communication": "Communication",
        "leadership": "Leadership",
        "collaboration": "Collaboration",
        "adaptability": "Adaptability",
    }

    return labels.get(
        key,
        key.replace("_", " ").title()
    )


@lru_cache(maxsize=1)
def build_dashboard_data():
    """
    Build the dashboard data once and cache it.

    The existing scoring and trajectory engines remain
    responsible for all competency calculations.
    """

    raw_data = read_json(RAW_DATA_PATH)

    # Step 1: Calculate competency scores.
    scored_data = score_all(raw_data)

    # Step 2: Calculate employee trajectories.
    trajectory_result = compute_trajectory(scored_data)

    raw_employees = {
        employee["employee_id"]: employee
        for employee in raw_data["employees"]
    }

    trajectory_employees = []

    for employee in trajectory_result["employees"]:
        employee_id = employee["employee_id"]
        raw_employee = raw_employees.get(employee_id, {})

        enriched_employee = {
            **employee,
            "role": raw_employee.get("role", ""),
            "company": raw_employee.get(
                "company",
                raw_data.get("company", "")
            ),
            "competencies": [
                {
                    **competency,
                    "label": get_competency_label(
                        competency["competency"]
                    ),
                }
                for competency in employee.get(
                    "competencies", []
                )
            ],
        }

        trajectory_employees.append(enriched_employee)

    # Step 3: Load the coaching prompt and fallback data.
    with open(
        PROMPT_PATH,
        "r",
        encoding="utf-8-sig"
    ) as file:
        system_prompt = file.read()

    fallback_data = read_json(FALLBACK_PATH)

    recommendation_employees = []

    for employee in trajectory_employees:
        recommendation = generate_recommendation(
            employee,
            system_prompt,
            fallback_data,
        )

        recommendation_employees.append(
            recommendation
        )

    return {
        "trajectoryData": {
            "company": raw_data.get("company", ""),
            "employees": trajectory_employees,
        },
        "recommendationsData": {
            "company": raw_data.get("company", ""),
            "employees": recommendation_employees,
        },
    }


def run_what_if_simulation(raw_data, employee_id, competency, signals):
    """Score a temporary employee copy with one future evidence cycle."""
    source_employee = next(
        (employee for employee in raw_data["employees"]
         if employee["employee_id"] == employee_id),
        None,
    )
    if source_employee is None:
        raise ValueError("Employee was not found.")
    if competency not in source_employee.get("scores", {}):
        raise ValueError("Competency was not found for this employee.")

    baseline_raw = deepcopy(source_employee)
    scenario_raw = deepcopy(source_employee)
    months = [
        entry["month"]
        for entries in source_employee.get("scores", {}).values()
        for entry in entries
        if entry.get("month")
    ]
    latest_month = max(
        (datetime.strptime(month, "%Y-%m") for month in months),
        default=datetime.now(),
    )
    next_month = latest_month.replace(
        year=latest_month.year + (latest_month.month == 12),
        month=latest_month.month % 12 + 1,
    ).strftime("%Y-%m")

    scenario_evidence = [
        {
            "type": signal["type"],
            "source": signal["id"],
            "source_system": signal.get("source", "scenario"),
            "date": f"{next_month}-15",
            "value": signal["value"],
            "description": signal["description"],
        }
        for signal in signals
    ]
    scenario_raw["scores"][competency].append({
        "month": next_month,
        "evidence": scenario_evidence,
    })

    def assess(employee):
        scored = score_all({
            "company": raw_data.get("company", ""),
            "employees": [employee],
        })
        trajectory = compute_trajectory(scored)["employees"][0]
        trajectory["role"] = employee.get("role", "")
        return trajectory

    baseline_employee = assess(baseline_raw)
    scenario_employee = assess(scenario_raw)
    baseline_competency = next(
        item for item in baseline_employee["competencies"]
        if item["competency"] == competency
    )
    scenario_competency = next(
        item for item in scenario_employee["competencies"]
        if item["competency"] == competency
    )

    return {
        "employee": baseline_employee,
        "baseline": baseline_competency,
        "scenario": scenario_competency,
    }


@app.get("/")
def root():
    return {
        "message": "EvidentIQ API is running",
        "docs": "/docs",
    }


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "EvidentIQ API",
    }


@app.get("/api/dashboard")
def dashboard():
    try:
        return build_dashboard_data()

    except Exception as error:
        print(f"Dashboard generation failed: {error}")

        raise HTTPException(
            status_code=500,
            detail="Could not generate dashboard data. "
                   "Check the backend terminal for details.",
        )

@app.post("/api/what-if/analyze")
def analyze_what_if(payload: dict):
    employee_id = payload.get("employee_id")
    competency = payload.get("competency")
    signals = payload.get("signals")
    if not isinstance(employee_id, str) or not employee_id.strip():
        raise HTTPException(status_code=422, detail="A valid employee_id is required.")
    if not isinstance(competency, str) or not competency.strip():
        raise HTTPException(status_code=422, detail="A competency is required.")
    if not isinstance(signals, list) or not signals or len(signals) > 20:
        raise HTTPException(status_code=422, detail="Provide between 1 and 20 hypothetical signals.")

    normalized_signals = []
    for index, signal in enumerate(signals):
        if not isinstance(signal, dict):
            raise HTTPException(status_code=422, detail=f"Signal {index + 1} must be an object.")
        signal_id = signal.get("id")
        signal_type = signal.get("type")
        value = signal.get("value")
        description = signal.get("description")
        if not isinstance(signal_id, str) or not signal_id.strip() or len(signal_id) > 120:
            raise HTTPException(status_code=422, detail=f"Signal {index + 1} needs a valid id.")
        if signal_type not in EVIDENCE_WEIGHTS:
            raise HTTPException(status_code=422, detail=f"Signal {index + 1} has an unsupported evidence type.")
        if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or not 0 <= value <= 100:
            raise HTTPException(status_code=422, detail=f"Signal {index + 1} value must be between 0 and 100.")
        if not isinstance(description, str) or not description.strip() or len(description) > 500:
            raise HTTPException(status_code=422, detail=f"Signal {index + 1} needs a description of at most 500 characters.")
        normalized_signals.append({
            "id": signal_id.strip(),
            "source": str(signal.get("source", "scenario"))[:120],
            "type": signal_type,
            "value": float(value),
            "description": description.strip(),
        })

    raw_data = read_json(RAW_DATA_PATH)
    try:
        simulation = run_what_if_simulation(
            raw_data,
            employee_id.strip(),
            competency.strip(),
            normalized_signals,
        )
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))

    analysis = generate_what_if_analysis(
        simulation["employee"],
        competency.strip(),
        simulation["baseline"],
        simulation["scenario"],
        normalized_signals,
    )
    if analysis is None:
        raise HTTPException(
            status_code=503,
            detail="OpenAI scenario analysis is unavailable. Check backend configuration and connectivity.",
        )

    return {
        "baseline": simulation["baseline"],
        "scenario": simulation["scenario"],
        "analysis": analysis,
    }



@app.post("/api/dashboard/refresh")
def refresh_dashboard():
    """
    Clear the dashboard cache and regenerate
    the employee data and recommendations.
    """

    build_dashboard_data.cache_clear()

    try:
        return build_dashboard_data()

    except Exception as error:
        print(f"Dashboard refresh failed: {error}")

        raise HTTPException(
            status_code=500,
            detail="Could not refresh dashboard data. "
                   "Check the backend terminal for details.",
        )