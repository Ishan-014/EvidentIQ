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
    load_scored_data,
)

# Use the mock scored_output.json committed alongside the engine
TEST_INPUT = os.path.join(os.path.dirname(__file__), "..", "..", "scored_output.json")


class TestComputeConfidence(unittest.TestCase):
    def test_more_evidence_higher_confidence(self):
        c1 = _compute_confidence(70, 75, 3)  # 3 evidence items
        c2 = _compute_confidence(70, 75, 1)  # 1 evidence item
        self.assertGreater(c1, c2)

    def test_larger_delta_higher_confidence(self):
        c1 = _compute_confidence(70, 90, 3)  # delta 20
        c2 = _compute_confidence(70, 72, 3)  # delta 2
        self.assertGreater(c1, c2)

    def test_capped_at_one(self):
        c = _compute_confidence(0, 100, 20)  # extreme inputs
        self.assertLessEqual(c, 1.0)

    def test_zero_for_no_evidence_and_zero_delta(self):
        # 0 evidence and no delta → low confidence
        c = _compute_confidence(70, 70, 0)
        self.assertEqual(c, 0.0)


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

    def test_insufficient_evidence_no_previous(self):
        # With no previous score, trend is already set before this is called,
        # but verify the boundary: large delta still not enough without confidence
        self.assertEqual(classify_trend(70, 90, 0.0, 0.6), "insufficient_evidence")


class TestAssessCompetency(unittest.TestCase):
    def test_insufficient_evidence_single_entry(self):
        result = assess_competency("technical", [{"month": "2026-01", "score": 75, "evidence": []}])
        self.assertEqual(result["trend"], "insufficient_evidence")
        self.assertEqual(result["previous_score"], None)
        self.assertEqual(result["latest_score"], 75)

    def test_improving_trend(self):
        entries = [
            {"month": "2026-01", "score": 70, "evidence": [{"type": "review", "source": "m", "date": "d", "value": 70}]},
            {"month": "2026-02", "score": 80, "evidence": [{"type": "review", "source": "m", "date": "d", "value": 80}]},
        ]
        result = assess_competency("technical", entries)
        self.assertEqual(result["trend"], "improving")
        self.assertEqual(result["previous_score"], 70)
        self.assertEqual(result["latest_score"], 80)
        self.assertEqual(result["competency"], "technical")

    def test_declining_trend(self):
        entries = [
            {"month": "2026-01", "score": 80, "evidence": [{"type": "review", "source": "m", "date": "d", "value": 80}]},
            {"month": "2026-02", "score": 60, "evidence": [{"type": "review", "source": "m", "date": "d", "value": 60}]},
        ]
        result = assess_competency("technical", entries)
        self.assertEqual(result["trend"], "declining")

    def test_stagnant_trend(self):
        entries = [
            {"month": "2026-01", "score": 70, "evidence": [{"type": "review", "source": "m", "date": "d", "value": 70}]},
            {"month": "2026-02", "score": 73, "evidence": [{"type": "review", "source": "m", "date": "d", "value": 73}]},
            {"month": "2026-03", "score": 72, "evidence": [{"type": "review", "source": "m", "date": "d", "value": 72}]},
            {"month": "2026-04", "score": 71, "evidence": [{"type": "review", "source": "m", "date": "d", "value": 71}]},
        ]
        result = assess_competency("technical", entries)
        self.assertEqual(result["trend"], "stagnant")

    def test_months_sorted(self):
        """Ensure out-of-order months are handled correctly."""
        entries = [
            {"month": "2026-03", "score": 90, "evidence": [{"type": "review", "source": "m", "date": "d", "value": 90}]},
            {"month": "2026-01", "score": 70, "evidence": [{"type": "review", "source": "m", "date": "d", "value": 70}]},
            {"month": "2026-02", "score": 80, "evidence": [{"type": "review", "source": "m", "date": "d", "value": 80}]},
        ]
        result = assess_competency("technical", entries)
        self.assertEqual(result["previous_score"], 80)
        self.assertEqual(result["latest_score"], 90)
        self.assertEqual(result["trend"], "improving")


class TestComputeTrajectory(unittest.TestCase):
    def test_full_computation(self):
        with open(TEST_INPUT, "r") as f:
            data = json.load(f)
        result = compute_trajectory(data)

        self.assertIn("employees", result)
        self.assertEqual(len(result["employees"]), 4)

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


class TestLoadScoredData(unittest.TestCase):
    def test_loads_valid_json(self):
        with patch("trajectory.trajectory_engine._resolve_path", return_value=TEST_INPUT):
            data = load_scored_data(TEST_INPUT)
        self.assertIn("employees", data)
        self.assertGreater(len(data["employees"]), 0)

    def test_missing_file_raises(self):
        with self.assertRaises(FileNotFoundError):
            load_scored_data("/nonexistent/path.json")


if __name__ == "__main__":
    unittest.main()
