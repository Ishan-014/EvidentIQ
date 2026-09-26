"""Trajectory engine: turns competency scores into trends and confidence levels."""

import json
import os
from pathlib import Path
from typing import Optional

# Default confidence threshold — can be overridden via env var.
DEFAULT_THRESHOLD = float(os.environ.get("TRAJECTORY_CONFIDENCE_THRESHOLD", "0.6"))
STAGNANT_THRESHOLD = 5  # ±5 points considered "stagnant"
MIN_EVIDENCE_FOR_TREND = 2  # Minimum evidence items to assess a trend


def load_scored_data(path: str = "scored_output.json") -> dict:
    """Load scored_output.json produced by Person 1's scoring engine."""
    resolved = _resolve_path(path)
    with open(resolved, "r") as f:
        return json.load(f)


def _resolve_path(p: str) -> str:
    """Look in common locations so the engine works from either repo root or
    from the trajectory/ directory. Absolute paths that do not exist are
    rejected immediately rather than falling back to other candidates."""
    p_path = Path(p)
    if (p_path.is_absolute() or p.startswith("/") or p.startswith("\\")) and not p_path.exists():
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


def _extract_evidence_sources(monthly_scores: list) -> list:
    """Extract unique evidence source identifiers from monthly scores."""
    sources = set()
    for entry in monthly_scores:
        for ev in entry.get("evidence", []):
            if "source" in ev:
                sources.add(ev["source"])
    return list(sources)


def _extract_evidence_refs(monthly_scores: list) -> list:
    """Extract evidence source references for output (e.g., 'PROJ-001', 'manager_q1')."""
    refs = []
    for entry in monthly_scores:
        for ev in entry.get("evidence", []):
            if "source" in ev:
                refs.append(ev["source"])
    return list(dict.fromkeys(refs))  # Deduplicate while preserving order


def _compute_confidence(
    total_evidence: int,
    unique_sources: int,
    num_cycles: int,
    threshold: float = DEFAULT_THRESHOLD,
) -> float:
    """Compute confidence in the trend assessment based on evidence quantity,
    source diversity, and longitudinal data.

    Confidence components:
    - Evidence quantity: each evidence item adds up to 0.25, capped at 0.5
    - Source diversity: each unique source type adds up to 0.25, capped at 0.5
    - Cycle count: more cycles = more confidence (up to 3 cycles = full)
    - Total capped at 1.0
    """
    # Evidence quantity component (max 0.5)
    evidence_confidence = min(0.25 * total_evidence, 0.5)

    # Source diversity component (max 0.5) - reward multiple source types
    source_confidence = min(0.25 * unique_sources, 0.5)

    # Cycle count component - more cycles = more confidence in trend
    cycle_confidence = min(0.1 * num_cycles, 0.3)

    total = evidence_confidence + source_confidence + cycle_confidence
    return min(total, 1.0)


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


def _compute_cycle_delta(cycles: list) -> list:
    """Compute score changes between consecutive cycles."""
    if len(cycles) < 2:
        return []

    deltas = []
    for i in range(1, len(cycles)):
        prev_score = cycles[i - 1]["score"]
        curr_score = cycles[i]["score"]
        deltas.append({
            "from_cycle": cycles[i - 1]["cycle"],
            "to_cycle": cycles[i]["cycle"],
            "delta": curr_score - prev_score,
        })
    return deltas


def assess_competency(
    competency_name: str,
    monthly_scores: list,
    threshold: float = DEFAULT_THRESHOLD,
) -> dict:
    """Assess a single competency for an employee with full longitudinal trajectory."""
    if not monthly_scores or len(monthly_scores) < 2:
        total_evidence = sum(_count_evidence(entry) for entry in monthly_scores)
        return {
            "competency": competency_name,
            "latest_score": monthly_scores[0]["score"] if monthly_scores else None,
            "previous_score": None,
            "trend": "insufficient_evidence",
            "confidence": 0.0,
            "evidence_count": total_evidence,
            "cycles": _build_cycles_array(monthly_scores),
            "cycle_deltas": [],
            "delta": None,
            "insufficient_evidence": True,
            "evidence_used": _extract_evidence_refs(monthly_scores),
            "scores": [entry["score"] for entry in monthly_scores] if monthly_scores else [],
        }

    # Sort by month ascending for correct chronological ordering
    sorted_scores = sorted(monthly_scores, key=lambda e: e["month"])

    # Build full longitudinal data
    cycles = _build_cycles_array(sorted_scores)
    cycle_deltas = _compute_cycle_delta(cycles)
    scores_array = [entry["score"] for entry in sorted_scores]

    # Calculate trend from first to last
    first_score = sorted_scores[0]["score"]
    last_score = sorted_scores[-1]["score"]
    delta = last_score - first_score

    previous = sorted_scores[-2]["score"]
    latest = sorted_scores[-1]["score"]

    # Compute confidence based on evidence, sources, and cycles (NOT magnitude)
    total_evidence = sum(_count_evidence(entry) for entry in sorted_scores)
    unique_sources = len(_extract_evidence_sources(sorted_scores))
    num_cycles = len(sorted_scores)

    confidence = _compute_confidence(total_evidence, unique_sources, num_cycles, threshold)
    
    # Enforce evidence threshold before trend classification
    if total_evidence < MIN_EVIDENCE_FOR_TREND or confidence < threshold or num_cycles < 2:
        trend = "insufficient_evidence"
        insufficient = True
    else:
        trend = classify_trend(previous, latest, confidence, threshold)
        insufficient = (trend == "insufficient_evidence")

    return {
        "competency": competency_name,
        "latest_score": latest,
        "previous_score": previous,
        "trend": trend,
        "confidence": round(confidence, 4),
        "evidence_count": total_evidence,
        "cycles": cycles,
        "cycle_deltas": cycle_deltas,
        "delta": delta,
        "insufficient_evidence": insufficient,
        "evidence_used": _extract_evidence_refs(sorted_scores),
        "scores": scores_array,
    }


def _build_cycles_array(monthly_scores: list) -> list:
    """Convert monthly scores to cycle format with month references and preserved detailed evidence."""
    cycles = []
    for entry in monthly_scores:
        cycles.append({
            "cycle": entry.get("month", ""),
            "score": entry.get("score"),
            "evidence": entry.get("evidence", []),
        })
    return cycles


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