"""Unit tests for the scoring engine validation and weighted scoring logic."""

import unittest
from scoring.score_engine import (
    score_all,
    score_employee,
    score_monthly_entry,
    _weighted_score,
    validate_raw_data,
    validate_employee,
    ScoringValidationError,
)


class TestScoringCalculations(unittest.TestCase):
    def test_weighted_score_formula(self):
        # review (0.5), project (0.3), peer (0.2)
        evidence = [
            {"type": "review", "value": 80.0},  # 80 * 0.5 = 40
            {"type": "project", "value": 70.0}, # 70 * 0.3 = 21
            {"type": "peer", "value": 90.0},    # 90 * 0.2 = 18
        ]
        # Total = 79.0 / 1.0 = 79.0
        score = _weighted_score(evidence)
        self.assertEqual(score, 79.0)

    def test_clamping_bounds(self):
        evidence_high = [{"type": "review", "value": 100.0}]
        score_high = _weighted_score(evidence_high)
        self.assertLessEqual(score_high, 100.0)

        evidence_low = [{"type": "review", "value": 0.0}]
        score_low = _weighted_score(evidence_low)
        self.assertGreaterEqual(score_low, 0.0)


class TestScoringValidation(unittest.TestCase):
    def test_missing_required_employee_fields_raises_error(self):
        malformed_emp = {
            "employee_id": "EMP001",
            # missing "name" and "department"
            "scores": {},
        }
        with self.assertRaises(ScoringValidationError):
            validate_employee(malformed_emp)

    def test_invalid_score_value_bounds_raises_error(self):
        malformed_entry = {
            "month": "2026-01",
            "evidence": [{"type": "review", "value": 150.0}],  # out of bounds >100
        }
        with self.assertRaises(ScoringValidationError):
            score_monthly_entry(malformed_entry, "technical")

    def test_valid_raw_dataset_processes_cleanly(self):
        raw_data = {
            "employees": [
                {
                    "employee_id": "EMP001",
                    "name": "Aryan Sharma",
                    "department": "Engineering",
                    "scores": {
                        "technical": [
                            {"month": "2026-01", "score": 75, "evidence": [{"type": "review", "value": 75.0, "source": "mgr_1"}]}
                        ]
                    }
                }
            ]
        }
        result = score_all(raw_data)
        self.assertIn("employees", result)
        self.assertEqual(len(result["employees"]), 1)
        self.assertEqual(result["employees"][0]["scores"]["technical"][0]["score"], 75.0)


if __name__ == "__main__":
    unittest.main()
