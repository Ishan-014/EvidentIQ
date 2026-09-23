"""Trajectory engine: turns competency scores into trends and confidence levels."""

import json
import os
from pathlib import Path
from typing import Optional

# Default confidence threshold — can be overridden via env var.
DEFAULT_THRESHOLD = float(os.environ.get("TRAJECTORY_CONFIDENCE_THRESHOLD", "0.6"))
STAGNANT_THRESHOLD = 5  # ±5 points considered "stagnant"


def load_scored_data(path: str = "scored_output.json") -> dict:
    """Load scored_output.json produced by Person 1's scoring engine."""
    resolved = _resolve_path(path)
    with open(resolved, "r") as f:
        return json.load(f)


def _resolve_path(p: str) -> str:
    """Look in common locations so the engine works from either repo root or
    from the trajectory/ directory. Absolute paths that do not exist are
    rejected immediately rather than falling back to other candidates."""
    if Path(p).is_absolute() and not Path(p).exists():
        raise FileNotFoundError(f"Could not find scored data at: {p}")
    candidates = [p, Path("..") / p, Path("data") / "raw_dataset.json", Path("..") / "data" / "raw_dataset.json"]
    for c in candidates:
        if Path(c).exists():
            return str(c)
    raise FileNotFoundError(f"Could not find scored data at any of: {candidates}")


def _count_evidence(monthly_entry: dict) -> int:
    """Count evidence items in a monthly score entry."""
    evidence = monthly_entry.get("evidence", [])
    if isinstance(evidence, list):
        return len(evidence)
    return 0


def _compute_confidence(previous_score: float, latest_score: float, total_evidence: int) -> float:
    """Compute confidence in the trend assessment.

    - Base confidence from evidence volume: more evidence → higher confidence.
      Each piece of evidence contributes up to 0.15, capped at 0.6.
    - Magnitude factor: larger absolute delta between scores → more confidence.
      Adds up to 0.4 for a delta ≥ 10, scaled linearly.
    - Total capped at 1.0.
    """
    evidence_confidence = min(0.15 * total_evidence, 0.6)

    delta = abs(latest_score - previous_score)
    magnitude_confidence = min(delta / 10.0, 1.0) * 0.4

    return min(evidence_confidence + magnitude_confidence, 1.0)


def classify_trend(previous_score: float, latest_score: float, confidence: float, threshold: float) -> str:
    """Classify the trajectory direction given scores and confidence.

    Returns one of: improving, declining, stagnant, insufficient_evidence.
    """
    if confidence < threshold:
        return "insufficient_evidence"

    delta = latest_score - previous_score
    if abs(delta) <= STAGNANT_THRESHOLD:
        return "stagnant"
    elif delta > 0:
        return "improving"
    else:
        return "declining"


def assess_competency(
    competency_name: str,
    monthly_scores: list,
    threshold: float = DEFAULT_THRESHOLD,
) -> dict:
    """Assess a single competency for an employee."""
    if not monthly_scores or len(monthly_scores) < 2:
        total_evidence = sum(_count_evidence(entry) for entry in monthly_scores)
        return {
            "competency": competency_name,
            "latest_score": monthly_scores[0]["score"] if monthly_scores else None,
            "previous_score": None,
            "trend": "insufficient_evidence",
            "confidence": 0.0,
            "evidence_count": total_evidence,
        }

    # Sort by month ascending to ensure correct ordering
    sorted_scores = sorted(monthly_scores, key=lambda e: e["month"])

    previous = sorted_scores[-2]["score"]
    latest = sorted_scores[-1]["score"]

    total_evidence = sum(_count_evidence(entry) for entry in sorted_scores)
    confidence = _compute_confidence(previous, latest, total_evidence)
    trend = classify_trend(previous, latest, confidence, threshold)

    return {
        "competency": competency_name,
        "latest_score": latest,
        "previous_score": previous,
        "trend": trend,
        "confidence": round(confidence, 4),
        "evidence_count": total_evidence,
    }


def compute_trajectory(scored_data: dict, threshold: float = DEFAULT_THRESHOLD) -> dict:
    """Process full scored data and return trajectory output."""
    trajectory_employees = []

    for emp in scored_data.get("employees", []):
        competencies = []
        for competency_name, monthly_scores in emp.get("scores", {}).items():
            competencies.append(assess_competency(competency_name, monthly_scores, threshold))

        trajectory_employees.append({
            "employee_id": emp["employee_id"],
            "name": emp["name"],
            "department": emp["department"],
            "competencies": competencies,
        })

    return {"employees": trajectory_employees}


def run(
    input_path: str = "scored_output.json",
    output_path: str = "trajectory/trajectory_output.json",
    threshold: Optional[float] = None,
) -> dict:
    """Full pipeline: load scored data → compute trajectory → write output."""
    scored_data = load_scored_data(input_path)
    traj_threshold = threshold if threshold is not None else DEFAULT_THRESHOLD
    result = compute_trajectory(scored_data, traj_threshold)

    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    with open(out, "w") as f:
        json.dump(result, f, indent=2)

    return result


if __name__ == "__main__":
    result = run()
    print(f"Trajectory output written with {len(result['employees'])} employees.")
