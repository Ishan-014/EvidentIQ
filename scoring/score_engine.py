"""Scoring engine: turns raw evidence into deterministic competency scores with strict validation.

Reads data/raw_dataset.json and writes scored_output.json.

Usage:
    python scoring/score_engine.py
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Any, Optional

# Evidence type weights
EVIDENCE_WEIGHTS = {
    "review": 0.5,
    "project": 0.3,
    "peer": 0.2,
    "training": 0.25,
    "kpi": 0.35,
}

# Score bounds
SCORE_MIN = 0.0
SCORE_MAX = 100.0


class ScoringValidationError(ValueError):
    """Raised when employee data, competency structure, or evidence input is malformed."""
    pass


def validate_evidence_item(item: Any, idx: int) -> None:
    """Validate a single evidence item dictionary."""
    if not isinstance(item, dict):
        raise ScoringValidationError(f"Evidence item at index {idx} must be a dict, got {type(item).__name__}")
    if "value" not in item:
        raise ScoringValidationError(f"Evidence item at index {idx} missing required 'value' field: {item}")
    try:
        val = float(item["value"])
    except (ValueError, TypeError):
        raise ScoringValidationError(f"Evidence item value must be numeric, got {item.get('value')}")
    if val < SCORE_MIN or val > SCORE_MAX:
        raise ScoringValidationError(f"Evidence item value {val} out of bounds [{SCORE_MIN}, {SCORE_MAX}]")


def validate_monthly_entry(entry: Any, competency_name: str) -> None:
    """Validate a monthly score entry."""
    if not isinstance(entry, dict):
        raise ScoringValidationError(f"Monthly entry for '{competency_name}' must be a dict, got {type(entry).__name__}")
    if "month" not in entry or not isinstance(entry["month"], str) or not entry["month"].strip():
        raise ScoringValidationError(f"Monthly entry for '{competency_name}' missing or invalid 'month' field: {entry}")
    
    evidence = entry.get("evidence", [])
    if evidence is not None and not isinstance(evidence, list):
        raise ScoringValidationError(f"Evidence in entry {entry['month']} for '{competency_name}' must be a list if provided")
    
    for idx, ev in enumerate(evidence or []):
        validate_evidence_item(ev, idx)


def validate_employee(employee: Any) -> None:
    """Validate an employee object structure."""
    if not isinstance(employee, dict):
        raise ScoringValidationError(f"Employee record must be a dict, got {type(employee).__name__}")
    for req_field in ["employee_id", "name", "department"]:
        if req_field not in employee or not str(employee[req_field]).strip():
            raise ScoringValidationError(f"Employee record missing required string field '{req_field}': {employee}")
    if "scores" not in employee or not isinstance(employee["scores"], dict):
        raise ScoringValidationError(f"Employee {employee.get('employee_id')} missing 'scores' dict")
    
    for comp_name, monthly_list in employee["scores"].items():
        if not isinstance(monthly_list, list):
            raise ScoringValidationError(f"Competency '{comp_name}' for employee {employee['employee_id']} must be a list of monthly entries")
        for entry in monthly_list:
            validate_monthly_entry(entry, comp_name)


def validate_raw_data(data: Any) -> None:
    """Validate top-level raw dataset format."""
    if not isinstance(data, dict):
        raise ScoringValidationError(f"Raw data root must be a dict, got {type(data).__name__}")
    if "employees" not in data or not isinstance(data["employees"], list):
        raise ScoringValidationError("Raw data root missing required 'employees' list")
    for emp in data["employees"]:
        validate_employee(emp)


def _weighted_score(evidence_items: list) -> float:
    """Compute a weighted average from evidence items.

    Clamped to [0, 100] and rounded to 1 decimal place.
    """
    if not evidence_items:
        return 0.0
    total_weight = 0.0
    weighted_sum = 0.0
    for item in evidence_items:
        w = EVIDENCE_WEIGHTS.get(item.get("type", ""), 0.3)
        weighted_sum += float(item["value"]) * w
        total_weight += w
    if total_weight == 0:
        return 0.0
    raw = weighted_sum / total_weight
    return round(min(max(raw, SCORE_MIN), SCORE_MAX), 1)


def score_monthly_entry(entry: dict, competency_name: str = "") -> dict:
    """Score a single month's evidence entry for one competency with deterministic fallback."""
    validate_monthly_entry(entry, competency_name)
    evidence = entry.get("evidence", [])
    if evidence:
        calculated_score = _weighted_score(evidence)
    else:
        # Fallback to existing recorded score if no new evidence items
        raw_score = entry.get("score", 0.0)
        calculated_score = round(min(max(float(raw_score), SCORE_MIN), SCORE_MAX), 1)

    return {
        "month": entry["month"],
        "score": calculated_score,
        "evidence": evidence or [],
    }


def score_employee(employee: dict) -> dict:
    """Score all competencies for a single validated employee."""
    validate_employee(employee)
    scored_competencies: dict = {}
    for competency, monthly_entries in employee.get("scores", {}).items():
        scored_competencies[competency] = [
            score_monthly_entry(entry, competency) for entry in monthly_entries
        ]
    out = {
        "employee_id": employee["employee_id"],
        "name": employee["name"],
        "department": employee["department"],
        "scores": scored_competencies,
    }
    if "role" in employee:
        out["role"] = employee["role"]
    if "company" in employee:
        out["company"] = employee["company"]
    return out


def score_all(raw_data: dict) -> dict:
    """Score every employee in the dataset after full validation."""
    validate_raw_data(raw_data)
    result: dict = {
        "employees": [score_employee(emp) for emp in raw_data.get("employees", [])]
    }
    if "company" in raw_data:
        result["company"] = raw_data["company"]
    return result


def _resolve_input(path: str) -> str:
    """Locate the raw dataset from common execution directories."""
    p = Path(path)
    if (p.is_absolute() or path.startswith("/") or path.startswith("\\")) and not p.exists():
        raise FileNotFoundError(f"Input file not found: {path}")
    candidates = [
        path,
        Path("data") / "raw_dataset.json",
        Path("..") / "data" / "raw_dataset.json",
        Path("..") / path,
    ]
    for c in candidates:
        if Path(c).exists():
            return str(c)
    raise FileNotFoundError(f"Could not find raw dataset at any of: {candidates}")


def load_raw_data(path: str = "data/raw_dataset.json") -> dict:
    """Load raw dataset JSON from disk."""
    resolved = _resolve_input(path)
    with open(resolved, "r", encoding="utf-8") as f:
        return json.load(f)


def run(
    input_path: str = "data/raw_dataset.json",
    output_path: str = "scored_output.json",
) -> dict:
    """Full pipeline: load raw data -> validate -> score -> write scored_output.json."""
    raw = load_raw_data(input_path)
    result = score_all(raw)

    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)

    return result


if __name__ == "__main__":
    result = run()
    count = len(result["employees"])
    total = sum(
        len(months)
        for emp in result["employees"]
        for months in emp["scores"].values()
    )
    print(f"Scored {count} employees, {total} monthly entries -> scored_output.json")
