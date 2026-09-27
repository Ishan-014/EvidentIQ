import unittest
from copy import deepcopy
from unittest.mock import patch

from backend_api import analyze_what_if, run_what_if_simulation


class TestWhatIfSimulation(unittest.TestCase):
    def setUp(self):
        self.raw_data = {
            "company": "Test Company",
            "employees": [{
                "employee_id": "EMP001",
                "name": "Test Employee",
                "department": "Engineering",
                "role": "Engineer",
                "scores": {
                    "technical_depth": [
                        {
                            "month": "2026-01",
                            "evidence": [{
                                "type": "review",
                                "source": "review-jan",
                                "value": 60,
                            }],
                        },
                        {
                            "month": "2026-02",
                            "evidence": [{
                                "type": "peer",
                                "source": "peer-feb",
                                "value": 70,
                            }],
                        },
                    ],
                },
            }],
        }

    def test_scenario_uses_python_pipeline_without_mutating_source_data(self):
        original_data = deepcopy(self.raw_data)
        signals = [{
            "id": "scenario-project",
            "source": "jira",
            "type": "project",
            "value": 100,
            "description": "Completed a hypothetical architecture deliverable",
        }]

        result = run_what_if_simulation(
            self.raw_data,
            "EMP001",
            "technical_depth",
            signals,
        )

        self.assertEqual(result["baseline"]["latest_score"], 70)
        self.assertEqual(result["scenario"]["latest_score"], 100)
        self.assertEqual(result["scenario"]["cycles"][-1]["cycle"], "2026-03")
        self.assertEqual(self.raw_data, original_data)

    @patch("backend_api.generate_what_if_analysis", return_value={
        "summary": "Scenario analyzed.",
        "recommendations": ["Continue development."],
        "evidence_ids": ["review-jan"],
        "generation_source": "ai",
        "model": "test-model",
    })
    @patch("backend_api.read_json")
    def test_api_returns_pipeline_result_and_openai_analysis(self, mock_read_json, mock_analysis):
        mock_read_json.return_value = self.raw_data
        response = analyze_what_if({
            "employee_id": "EMP001",
            "competency": "technical_depth",
            "signals": [{
                "id": "scenario-project",
                "source": "jira",
                "type": "project",
                "value": 100,
                "description": "Hypothetical architecture deliverable",
            }],
        })

        self.assertEqual(response["baseline"]["latest_score"], 70)
        self.assertEqual(response["scenario"]["latest_score"], 100)
        self.assertEqual(response["analysis"]["generation_source"], "ai")
        mock_analysis.assert_called_once()


if __name__ == "__main__":
    unittest.main()
