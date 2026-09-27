"""Recommendation engine: generates evidence-grounded coaching recommendations.

Uses the OpenAI Chat Completions API with strict JSON parsing, evidence-ID
validation against source data, and deterministic fallback when the API is
unavailable or returns unusable output.

Environment variables:
    OPENAI_API_KEY  - OpenAI API key
    OPENAI_BASE_URL - API base URL (default: https://api.openai.com/v1)
    OPENAI_MODEL    - Model identifier (default: gpt-4o-mini)
    TRAJECTORY_INPUT - Path to trajectory_output.json
    RECOMMENDATION_OUT - Path to write recommendations.json
"""

import json
import os
import re
import urllib.request
import urllib.error
from pathlib import Path
from typing import Dict, List, Any, Optional, Set, Tuple

TRAJECTORY_INPUT = os.environ.get("TRAJECTORY_INPUT", "trajectory/trajectory_output.json")
RECOMMENDATION_OUT = os.environ.get("RECOMMENDATION_OUT", "recommendation/recommendations.json")
OPENAI_BASE_URL = os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1")
DEFAULT_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
MAX_TOKENS = 1000
TIMEOUT_SECONDS = 20


def _load_prompt(filename: str) -> str:
    base = Path(__file__).parent / "prompts" / filename
    with open(base, "r", encoding="utf-8") as f:
        return f.read().strip()


def extract_all_valid_evidence_ids(employee: dict) -> Set[str]:
    """Extract all legitimate evidence IDs present in the employee's trajectory data."""
    valid_ids = set()
    for comp in employee.get("competencies", []):
        for ref in comp.get("evidence_used", []):
            if ref:
                valid_ids.add(str(ref).strip())
        for cycle in comp.get("cycles", []):
            for ev in cycle.get("evidence", []):
                for k in ["id", "source", "ref"]:
                    if k in ev and ev[k]:
                        valid_ids.add(str(ev[k]).strip())
    return valid_ids


def _build_evidence_block(competency: dict) -> str:
    """Format actual evidence items with id, source, description."""
    evidence_items = []
    # Collect from cycles or competency root
    for cycle in competency.get("cycles", []):
        for ev in cycle.get("evidence", []):
            evidence_items.append(ev)
    if not evidence_items and competency.get("evidence_used"):
        evidence_items = [{"source": s, "type": "reference"} for s in competency["evidence_used"]]
    
    if not evidence_items:
        return "  (No detailed evidence items recorded for this competency)"
    
    lines = []
    for ev in evidence_items:
        ev_id = ev.get("id", ev.get("source", "unknown"))
        source = ev.get("source", "unknown")
        desc = ev.get("description", ev.get("value", ""))
        lines.append(f"    - id: {ev_id} | source: {source} | details: \"{desc}\"")
    return "\n".join(lines[:6])  # keep prompt concise and focused


def build_user_prompt(employee: dict) -> str:
    """Render the user prompt with actual evidence details and available evidence IDs."""
    lines = [
        f"Employee: {employee.get('name', '')} ({employee.get('department', '')})",
        f"Employee ID: {employee.get('employee_id', '')}",
        f"Role: {employee.get('role', 'Team Member')}",
        "",
        "Longitudinal Competency Trajectories:",
    ]
    for c in employee.get("competencies", []):
        scores = c.get("scores", [])
        score_str = " -> ".join(str(s) for s in scores)
        cycles_str = " | ".join(f"{cy['cycle']}:{cy['score']}" for cy in c.get("cycles", []))
        lines.append(
            f"- {c['competency']}: scores [{score_str}] | cycles [{cycles_str}] | "
            f"trend={c.get('trend')} | confidence={c.get('confidence', 0):.2f} | "
            f"delta={c.get('delta')} | insufficient_evidence={c.get('insufficient_evidence')}"
        )
        lines.append("  Evidence items:")
        lines.append(_build_evidence_block(c))

    valid_ids = sorted(list(extract_all_valid_evidence_ids(employee)))
    lines.append("")
    lines.append(f"AVAILABLE VALID EVIDENCE IDS FOR CITATION: {json.dumps(valid_ids)}")
    lines.append("")
    lines.append("Generate your structured recommendation JSON referencing only valid evidence IDs from above.")

    template = _load_prompt("user_prompt_template.txt")
    user_text = template.format(
        name=employee.get("name", ""),
        department=employee.get("department", ""),
        competency_summary="\n".join(lines),
    )
    return user_text


def _call_openai(system_prompt: str, user_prompt: str) -> Optional[str]:
    """Call OpenAI's Chat Completions API; return None on API/configuration failure."""
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not api_key:
        return None

    try:
        url = f"{OPENAI_BASE_URL.rstrip('/')}/chat/completions"
        payload = {
            "model": DEFAULT_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0.2,
            "max_tokens": MAX_TOKENS,
            "response_format": {"type": "json_object"},
        }
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "User-Agent": "EvidentIQ/1.0",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=TIMEOUT_SECONDS) as response:
            res_data = json.loads(response.read().decode("utf-8"))
        return res_data["choices"][0]["message"]["content"]
    except (urllib.error.URLError, TimeoutError, OSError, KeyError, IndexError, TypeError, ValueError):
        # API failures must not interrupt the deterministic recommendation pipeline.
        return None


def _clean_json_text(text: str) -> str:
    """Strip markdown code fences from response text if present."""
    text = text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip().startswith("```"):
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    return text


def validate_and_filter_evidence_ids(raw_ids: List[Any], valid_pool: Set[str]) -> List[str]:
    """Ensure every cited evidence ID exists in ground-truth source evidence.

    Rejects hallucinated or nonexistent IDs to preserve zero-hallucination guarantee.
    """
    cleaned = []
    for raw in raw_ids:
        s = str(raw).strip()
        if s in valid_pool:
            cleaned.append(s)
    return list(dict.fromkeys(cleaned))


def parse_structured_recommendation(text: str, valid_evidence_pool: Set[str]) -> Tuple[str, List[str], List[str]]:
    """Parse and validate structured JSON response from LLM."""
    clean = _clean_json_text(text)
    try:
        data = json.loads(clean)
    except Exception:
        # Try finding the first JSON block with regex
        match = re.search(r"\{.*\}", clean, re.DOTALL)
        if match:
            try:
                data = json.loads(match.group(0))
            except Exception:
                data = {}
        else:
            data = {}

    summary = data.get("summary", "")
    recs_raw = data.get("recommendations", [])
    
    recommendation_strings: List[str] = []
    collected_evidence_ids: List[str] = []

    if isinstance(recs_raw, list):
        for item in recs_raw:
            if isinstance(item, dict):
                text_item = item.get("text", "")
                if text_item:
                    recommendation_strings.append(text_item)
                item_ev = item.get("evidence_ids", [])
                if isinstance(item_ev, list):
                    collected_evidence_ids.extend(item_ev)
            elif isinstance(item, str) and item.strip():
                recommendation_strings.append(item.strip())

    # Fallback to lines if empty
    if not recommendation_strings:
        for line in clean.splitlines():
            line = line.strip()
            if line.startswith("- ") or line.startswith("• "):
                recommendation_strings.append(line[2:].strip())

    if not summary and recommendation_strings:
        summary = recommendation_strings[0]

    # Validate all evidence IDs against ground truth pool
    validated_ids = validate_and_filter_evidence_ids(collected_evidence_ids, valid_evidence_pool)
    return summary, recommendation_strings, validated_ids


def _load_fallback() -> dict:
    fallback_path = Path(__file__).parent / "fallback.json"
    with open(fallback_path, "r", encoding="utf-8") as f:
        return json.load(f)


def _get_fallback_for_employee(employee: dict, fallback_data: dict) -> dict:
    emp_id = employee.get("employee_id", "")
    for emp in fallback_data.get("employees", []):
        if emp["employee_id"] == emp_id:
            return emp
    # Generate dynamic deterministic fallback based on actual trajectory
    name = employee.get("name", "The employee")
    comps = employee.get("competencies", [])
    improving = [c["competency"] for c in comps if c.get("trend") == "improving"]
    declining = [c["competency"] for c in comps if c.get("trend") == "declining"]
    insuff = [c["competency"] for c in comps if c.get("insufficient_evidence")]

    valid_pool = extract_all_valid_evidence_ids(employee)
    sample_ids = list(valid_pool)[:3]

    recs = []
    if declining:
        recs.append(f"Initiate structured performance review for declining competencies: {', '.join(declining)}.")
    if improving:
        recs.append(f"Assign stretch deliverables to sustain accelerating momentum in: {', '.join(improving)}.")
    if insuff:
        recs.append(f"Establish structured evidence collection for: {', '.join(insuff)} to reach confidence threshold.")
    if not recs:
        recs.append(f"Sustain current development cadence and collect quarterly 360 peer feedback.")

    summary = f"{name} shows active longitudinal performance records. Deterministic guidance generated from verifiable competency trajectory."
    return {
        "summary": summary,
        "recommendations": recs,
        "evidence_ids": sample_ids,
        "generation_source": "fallback",
        "model": None
    }


def generate_recommendation(employee: dict, system_prompt: str, fallback_data: dict) -> dict:
    """Generate structured, evidence-validated recommendation for one employee."""
    valid_evidence_pool = extract_all_valid_evidence_ids(employee)
    user_prompt = build_user_prompt(employee)
    llm_text = _call_openai(system_prompt, user_prompt)

    if llm_text:
        summary, recommendations, validated_evidence_ids = parse_structured_recommendation(llm_text, valid_evidence_pool)
        if recommendations:
            return {
                "employee_id": employee["employee_id"],
                "name": employee["name"],
                "department": employee.get("department", ""),
                "summary": summary or "Evidence-grounded capability coaching roadmap.",
                "recommendations": recommendations,
                "evidence_ids": validated_evidence_ids,
                "generation_source": "ai",
                "model": DEFAULT_MODEL,
            }

    # Deterministic Fallback path
    fb = _get_fallback_for_employee(employee, fallback_data)
    return {
        "employee_id": employee["employee_id"],
        "name": employee["name"],
        "department": employee.get("department", ""),
        "summary": fb.get("summary", ""),
        "recommendations": fb.get("recommendations", []),
        "evidence_ids": validate_and_filter_evidence_ids(fb.get("evidence_ids", []), valid_evidence_pool) or list(valid_evidence_pool)[:3],
        "generation_source": "fallback",
        "model": None,
    }


def run(
    input_path: str = TRAJECTORY_INPUT,
    output_path: str = RECOMMENDATION_OUT,
) -> dict:
    """Full recommendation runner: trajectory -> LLM/Fallback -> validated recommendations.json."""
    with open(input_path, "r", encoding="utf-8") as f:
        trajectory_data = json.load(f)

    system_prompt = _load_prompt("system_prompt.txt")
    fallback_data = _load_fallback()

    results = []
    for employee in trajectory_data.get("employees", []):
        rec = generate_recommendation(employee, system_prompt, fallback_data)
        results.append(rec)

    output = {
        "company": trajectory_data.get("company", "EvidentIQ Talent Intelligence"),
        "employees": results
    }
    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)
    return output


if __name__ == "__main__":
    result = run()
    sources = [e["generation_source"] for e in result["employees"]]
    ai_count = sources.count("ai")
    fb_count = sources.count("fallback")
    print(f"Recommendations generated: {ai_count} via AI, {fb_count} via fallback -> {RECOMMENDATION_OUT}")
    for e in result["employees"][:5]:
        print(f"  {e['employee_id']} ({e['name']}): source={e['generation_source']}, evidence_ids={e.get('evidence_ids', [])}")
