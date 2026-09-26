"""Tests for trajectory engine."""

import json
import os
import sys
import unittest
from unittest.mock import patch

# Ensure repo root is importable when tests are run from trajectory/tests/
sys.path.insert(0, str(os.path.join(os.path.dirname(__file__), "..", "..")))
sys.path.insert(0, os.path.dirname(__file__))

from trajectory.trajectory_engine import (
    assess_competency,
    classify_trend,
    compute_trajectory,
    _compute_confidence,
    _compute_cycle_delta,
    _build_cycles_array,
    _extract_evidence_refs,
    load_scored_data,
)

# Use the mock scored_output.json committed alongside the engine
TEST_INPUT = os.path.join(os.path.dirname(__file__), "..", "..", "scored_output.json")


class TestComputeConfidence(unittest.TestCase):
    """Confidence is based on evidence quantity, source diversity, and cycle count.
    Magnitude (score delta) plays NO role."""

    def test_more_evidence_higher_confidence(self):
        c1 = _compute_confidence(total_evidence=4, unique_sources=2, num_cycles=2)
        c2 = _compute_confidence(total_evidence=1, unique_sources=2, num_cycles=2)
        self.assertGreater(c1, c2)

    def test_more_sources_higher_confidence(self):
        c1 = _compute_confidence(total_evidence=2, unique_sources=3, num_cycles=2)
        c2 = _compute_confidence(total_evidence=2, unique_sources=1, num_cycles=2)
        self.assertGreater(c1, c2)

    def test_more_cycles_higher_confidence(self):
        # Use low evidence/sources so cycle count moves the needle without hitting the cap
        c1 = _compute_confidence(total_evidence=0, unique_sources=0, num_cycles=4)
        c2 = _compute_confidence(total_evidence=0, unique_sources=0, num_cycles=1)
        self.assertGreater(c1, c2)

    def test_capped_at_one(self):
        c = _compute_confidence(total_evidence=20, unique_sources=20, num_cycles=20)
        self.assertLessEqual(c, 1.0)

    def test_zero_for_no_evidence_no_sources_no_cycles(self):
        c = _compute_confidence(total_evidence=0, unique_sources=0, num_cycles=0)
        self.assertEqual(c, 0.0)

    def test_magnitude_irrelevant(self):
        """Same evidence/sources/cycles → same confidence regardless of score delta."""
        c_large_delta = _compute_confidence(total_evidence=2, unique_sources=2, num_cycles=2)
        c_small_delta = _compute_confidence(total_evidence=2, unique_sources=2, num_cycles=2)
        self.assertEqual(c_large_delta, c_small_delta)


class TestClassifyTrend(unittest.TestCase):
    def test_improving(self):
        self.assertEqual(classify_trend(70, 80, 0.8, 0.6), "improving")

    def test_declining(self):
        self.assertEqual(classify_trend(80, 60, 0.8, 0.6), "declining")

    def test_stagnant(self):
        self.assertEqual(classify_trend(70, 74, 0.8, 0.6), "stagnant")
        self.assertEqual(classify_trend(70, 66, 0.8, 0.6), "stagnant")

    def test_insufficient_evidence_below_threshold(self):
        self.assertEqual(classify_trend(70, 80, 0.5, 0.6), "insufficient_evidence")

    def test_insufficient_evidence_zero_confidence(self):
        self.assertEqual(classify_trend(70, 90, 0.0, 0.6), "insufficient_evidence")


class TestComputeCycleDelta(unittest.TestCase):
    def test_empty_list(self):
        self.assertEqual(_compute_cycle_delta([]), [])

    def test_single_cycle(self):
        cycles = [{"cycle": "2026-01", "score": 70}]
        self.assertEqual(_compute_cycle_delta(cycles), [])

    def test_two_cycles(self):
        cycles = [{"cycle": "2026-01", "score": 70}, {"cycle": "2026-02", "score": 80}]
        result = _compute_cycle_delta(cycles)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["delta"], 10)
        self.assertEqual(result[0]["from_cycle"], "2026-01")
        self.assertEqual(result[0]["to_cycle"], "2026-02")

    def test_declining_delta(self):
        cycles = [
            {"cycle": "2026-01", "score": 80},
            {"cycle": "2026-02", "score": 70},
            {"cycle": "2026-03", "score": 60},
        ]
        result = _compute_cycle_delta(cycles)
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]["delta"], -10)
        self.assertEqual(result[1]["delta"], -10)


class TestBuildCyclesArray(unittest.TestCase):
    def test_empty(self):
        self.assertEqual(_build_cycles_array([]), [])

    def test_builds_correctly(self):
        entries = [
            {"month": "2026-01", "score": 70, "evidence": [{"source": "manager_q1"}]},
            {"month": "2026-02", "score": 75, "evidence": []},
        ]
        result = _build_cycles_array(entries)
        self.assertEqual(result, [
            {"cycle": "2026-01", "score": 70, "evidence": [{"source": "manager_q1"}]},
            {"cycle": "2026-02", "score": 75, "evidence": []},
        ])


class TestExtractEvidenceRefs(unittest.TestCase):
    def test_deduplicates_sources(self):
        entries = [
            {"month": "2026-01", "evidence": [{"source": "manager_q1"}, {"source": "peer_360"}]},
            {"month": "2026-02", "evidence": [{"source": "manager_q1"}]},
        ]
        refs = _extract_evidence_refs(entries)
        self.assertIn("manager_q1", refs)
        self.assertIn("peer_360", refs)
        self.assertEqual(refs.count("manager_q1"), 1)

    def test_empty_evidence(self):
        entries = [{"month": "2026-01", "evidence": []}]
        self.assertEqual(_extract_evidence_refs(entries), [])


class TestAssessCompetency(unittest.TestCase):
    def test_insufficient_evidence_single_entry(self):
        result = assess_competency("technical", [{"month": "2026-01", "score": 75, "evidence": []}])
        self.assertEqual(result["trend"], "insufficient_evidence")
        self.assertTrue(result["insufficient_evidence"])
        self.assertIsNone(result["previous_score"])
        self.assertEqual(result["latest_score"], 75)
        self.assertEqual(result["scores"], [75])
        self.assertEqual(result["cycle_deltas"], [])

    def test_improving_trend(self):
        entries = [
            {"month": "2026-01", "score": 70, "evidence": [{"type": "review", "source": "manager_q1", "date": "d", "value": 70}]},
            {"month": "2026-02", "score": 80, "evidence": [{"type": "review", "source": "manager_q2", "date": "d", "value": 80}]},
        ]
        result = assess_competency("technical", entries)
        self.assertEqual(result["trend"], "improving")
        self.assertEqual(result["previous_score"], 70)
        self.assertEqual(result["latest_score"], 80)
        self.assertEqual(result["competency"], "technical")
        self.assertEqual(result["scores"], [70, 80])
        self.assertEqual(result["delta"], 10)
        self.assertEqual(len(result["cycle_deltas"]), 1)
        self.assertEqual(result["cycle_deltas"][0]["delta"], 10)

    def test_declining_trend(self):
        entries = [
            {"month": "2026-01", "score": 80, "evidence": [{"type": "review", "source": "manager_q1", "date": "d", "value": 80}]},
            {"month": "2026-02", "score": 60, "evidence": [{"type": "review", "source": "manager_q2", "date": "d", "value": 60}]},
        ]
        result = assess_competency("technical", entries)
        self.assertEqual(result["trend"], "declining")
        self.assertEqual(result["delta"], -20)

    def test_stagnant_trend(self):
        entries = [
            {"month": "2026-01", "score": 70, "evidence": [{"type": "review", "source": "manager_q1", "date": "d", "value": 70}]},
            {"month": "2026-02", "score": 73, "evidence": [{"type": "review", "source": "manager_q2", "date": "d", "value": 73}]},
            {"month": "2026-03", "score": 72, "evidence": [{"type": "peer", "source": "peer_360", "date": "d", "value": 72}]},
            {"month": "2026-04", "score": 71, "evidence": [{"type": "peer", "source": "peer_360b", "date": "d", "value": 71}]},
        ]
        result = assess_competency("technical", entries)
        self.assertEqual(result["trend"], "stagnant")

    def test_months_sorted_correctly(self):
        """Out-of-order months are sorted before analysis."""
        entries = [
            {"month": "2026-03", "score": 90, "evidence": [{"type": "review", "source": "s3", "date": "d", "value": 90}]},
            {"month": "2026-01", "score": 70, "evidence": [{"type": "review", "source": "s1", "date": "d", "value": 70}]},
            {"month": "2026-02", "score": 80, "evidence": [{"type": "review", "source": "s2", "date": "d", "value": 80}]},
        ]
        result = assess_competency("technical", entries)
        self.assertEqual(result["previous_score"], 80)
        self.assertEqual(result["latest_score"], 90)
        self.assertEqual(result["trend"], "improving")
        self.assertEqual(result["scores"], [70, 80, 90])

    def test_output_contract_fields(self):
        """Every required field from the output contract is present."""
        entries = [
            {"month": "2026-01", "score": 70, "evidence": [{"type": "review", "source": "manager_q1", "date": "d", "value": 70}]},
            {"month": "2026-02", "score": 80, "evidence": [{"type": "project", "source": "PROJ-001", "date": "d", "value": 80}]},
        ]
        result = assess_competency("technical", entries)
        required_fields = [
            "competency", "latest_score", "previous_score", "trend",
            "confidence", "evidence_count", "cycles", "cycle_deltas",
            "delta", "insufficient_evidence", "evidence_used", "scores",
        ]
        for field in required_fields:
            self.assertIn(field, result, f"Missing field: {field}")

    def test_evidence_used_contains_source_refs(self):
        entries = [
            {"month": "2026-01", "score": 70, "evidence": [{"type": "review", "source": "PROJ-001", "date": "d", "value": 70}]},
            {"month": "2026-02", "score": 80, "evidence": [{"type": "project", "source": "PROJ-002", "date": "d", "value": 80}]},
        ]
        result = assess_competency("technical", entries)
        self.assertIn("PROJ-001", result["evidence_used"])
        self.assertIn("PROJ-002", result["evidence_used"])

    def test_insufficient_evidence_false_when_sufficient(self):
        entries = [
            {"month": "2026-01", "score": 70, "evidence": [{"type": "review", "source": "s1", "date": "d", "value": 70}]},
            {"month": "2026-02", "score": 80, "evidence": [{"type": "review", "source": "s2", "date": "d", "value": 80}]},
        ]
        result = assess_competency("technical", entries)
        # With 2 evidence items and 2 unique sources, should not be insufficient
        self.assertFalse(result["insufficient_evidence"])

    def test_cycles_array_matches_months(self):
        entries = [
            {"month": "2026-01", "score": 70, "evidence": []},
            {"month": "2026-02", "score": 75, "evidence": []},
            {"month": "2026-03", "score": 80, "evidence": []},
        ]
        result = assess_competency("technical", entries)
        self.assertEqual(len(result["cycles"]), 3)
        self.assertEqual(result["cycles"][0]["cycle"], "2026-01")
        self.assertEqual(result["cycles"][2]["cycle"], "2026-03")


class TestComputeTrajectory(unittest.TestCase):
    def test_full_computation(self):
        with open(TEST_INPUT, "r") as f:
            data = json.load(f)
        result = compute_trajectory(data)

        self.assertIn("employees", result)
        self.assertEqual(len(result["employees"]), len(data["employees"]))

        for emp in result["employees"]:
            self.assertIn("employee_id", emp)
            self.assertIn("name", emp)
            self.assertIn("department", emp)
            self.assertIn("competencies", emp)
            for comp in emp["competencies"]:
                self.assertIn("competency", comp)
                self.assertIn("trend", comp)
                self.assertIn("confidence", comp)
                self.assertIn("evidence_count", comp)
                self.assertIn("latest_score", comp)
                self.assertIn("previous_score", comp)
                # New fields from updated contract
                self.assertIn("cycles", comp)
                self.assertIn("cycle_deltas", comp)
                self.assertIn("delta", comp)
                self.assertIn("insufficient_evidence", comp)
                self.assertIn("evidence_used", comp)
                self.assertIn("scores", comp)

    def test_valid_trends(self):
        valid = {"improving", "declining", "stagnant", "insufficient_evidence"}
        with open(TEST_INPUT, "r") as f:
            data = json.load(f)
        result = compute_trajectory(data)
        for emp in result["employees"]:
            for comp in emp["competencies"]:
                self.assertIn(comp["trend"], valid, f"Invalid trend: {comp['trend']}")

    def test_confidence_range(self):
        with open(TEST_INPUT, "r") as f:
            data = json.load(f)
        result = compute_trajectory(data)
        for emp in result["employees"]:
            for comp in emp["competencies"]:
                self.assertGreaterEqual(comp["confidence"], 0.0)
                self.assertLessEqual(comp["confidence"], 1.0)

    def test_threshold_override(self):
        """A higher threshold should produce more insufficient_evidence results."""
        with open(TEST_INPUT, "r") as f:
            data = json.load(f)
        normal = compute_trajectory(data, threshold=0.6)
        strict = compute_trajectory(data, threshold=0.99)

        normal_insufficient = sum(
            1 for emp in normal["employees"] for c in emp["competencies"] if c["trend"] == "insufficient_evidence"
        )
        strict_insufficient = sum(
            1 for emp in strict["employees"] for c in emp["competencies"] if c["trend"] == "insufficient_evidence"
        )
        self.assertGreaterEqual(strict_insufficient, normal_insufficient)

    def test_scores_array_length_matches_cycles(self):
        with open(TEST_INPUT, "r") as f:
            data = json.load(f)
        result = compute_trajectory(data)
        for emp in result["employees"]:
            for comp in emp["competencies"]:
                self.assertEqual(len(comp["scores"]), len(comp["cycles"]))


class TestLoadScoredData(unittest.TestCase):
    def test_loads_valid_json(self):
        with patch("trajectory.trajectory_engine._resolve_path", return_value=TEST_INPUT):
            data = load_scored_data(TEST_INPUT)
        self.assertIn("employees", data)
        self.assertGreater(len(data["employees"]), 0)

    def test_missing_file_raises(self):
        with self.assertRaises(FileNotFoundError):
            load_scored_data("/nonexistent/path.json")


class TestEdgeCasesAndEvidenceThresholds(unittest.TestCase):
    def test_insufficient_cycles_always_insufficient(self):
        """Single cycle cannot establish a trend."""
        single_entry = [{"month": "2026-01", "score": 85, "evidence": [{"source": "mgr_1"}, {"source": "mgr_2"}]}]
        res = assess_competency("leadership", single_entry)
        self.assertEqual(res["trend"], "insufficient_evidence")
        self.assertTrue(res["insufficient_evidence"])
        self.assertIsNone(res["delta"])

    def test_low_evidence_count_forces_insufficient(self):
        """Even with 2 cycles, 1 total evidence point is below MIN_EVIDENCE_FOR_TREND."""
        entries = [
            {"month": "2026-01", "score": 70, "evidence": [{"source": "mgr_1"}]},
            {"month": "2026-02", "score": 85, "evidence": []},
        ]
        res = assess_competency("ownership", entries)
        self.assertEqual(res["trend"], "insufficient_evidence")
        self.assertTrue(res["insufficient_evidence"])

    def test_unordered_cycles_sorted_chronologically(self):
        """Cycles out of order must be sorted before evaluating deltas."""
        unordered = [
            {"month": "2026-03", "score": 88, "evidence": [{"source": "mgr_3"}, {"source": "peer_3"}]},
            {"month": "2026-01", "score": 60, "evidence": [{"source": "mgr_1"}, {"source": "peer_1"}]},
            {"month": "2026-02", "score": 74, "evidence": [{"source": "mgr_2"}]},
        ]
        res = assess_competency("technical_depth", unordered)
        self.assertEqual(res["trend"], "improving")
        self.assertEqual(res["delta"], 28)
        self.assertEqual([c["cycle"] for c in res["cycles"]], ["2026-01", "2026-02", "2026-03"])

    def test_stagnant_boundary_condition(self):
        """Score difference within STAGNANT_THRESHOLD (+-5) should classify as stagnant."""
        entries = [
            {"month": "2026-01", "score": 70, "evidence": [{"source": "mgr_1"}, {"source": "peer_1"}]},
            {"month": "2026-02", "score": 74, "evidence": [{"source": "mgr_2"}, {"source": "proj_1"}]},
        ]
        res = assess_competency("collaboration", entries)
        self.assertEqual(res["trend"], "stagnant")
        self.assertEqual(res["delta"], 4)
        self.assertFalse(res["insufficient_evidence"])

    def test_declining_boundary_condition(self):
        """Score drop exceeding STAGNANT_THRESHOLD should classify as declining."""
        entries = [
            {"month": "2026-01", "score": 80, "evidence": [{"source": "mgr_1"}, {"source": "peer_1"}]},
            {"month": "2026-02", "score": 72, "evidence": [{"source": "mgr_2"}, {"source": "proj_1"}]},
        ]
        res = assess_competency("communication", entries)
        self.assertEqual(res["trend"], "declining")
        self.assertEqual(res["delta"], -8)
        self.assertFalse(res["insufficient_evidence"])


if __name__ == "__main__":
    unittest.main()
