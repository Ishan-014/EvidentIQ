"""Unit tests for the standardized AI recommendation engine and fallback logic."""

import unittest
from unittest.mock import patch, MagicMock
from recommendation.recommendation_engine import (
    extract_all_valid_evidence_ids,
    validate_and_filter_evidence_ids,
    parse_structured_recommendation,
    _get_fallback_for_employee,
    _call_openai,
    generate_recommendation,
)


class TestEvidenceValidation(unittest.TestCase):
    def setUp(self):
        self.mock_employee = {
            "employee_id": "EMP001",
            "name": "Aryan Sharma",
            "department": "Engineering",
            "competencies": [
                {
                    "competency": "technical_depth",
                    "evidence_used": ["manager_q1", "PROJ-001"],
                    "cycles": [
                        {"cycle": "2026-01", "evidence": [{"id": "PROJ-001", "source": "project"}]},
                        {"cycle": "2026-02", "evidence": [{"source": "CERT-AWS-SA"}]},
                    ],
                }
            ],
        }

    def test_extracts_all_valid_ids(self):
        valid = extract_all_valid_evidence_ids(self.mock_employee)
        self.assertIn("manager_q1", valid)
        self.assertIn("PROJ-001", valid)
        self.assertIn("CERT-AWS-SA", valid)

    def test_rejects_hallucinated_ids(self):
        valid_pool = {"PROJ-001", "CERT-AWS-SA"}
        raw_ids = ["PROJ-001", "HALLUCINATED-999", "FAKE-SRC", "CERT-AWS-SA"]
        filtered = validate_and_filter_evidence_ids(raw_ids, valid_pool)
        self.assertEqual(filtered, ["PROJ-001", "CERT-AWS-SA"])
        self.assertNotIn("HALLUCINATED-999", filtered)


class TestStructuredRecommendationParsing(unittest.TestCase):
    def test_parses_valid_json_response(self):
        llm_json = """
        {
          "summary": "Aryan shows accelerating growth across all cycles.",
          "recommendations": [
            {
              "text": "Promote to technical lead for project Boreas.",
              "evidence_ids": ["PROJ-001", "CERT-AWS-SA"]
            }
          ]
        }
        """
        valid_pool = {"PROJ-001", "CERT-AWS-SA"}
        summary, recs, ev_ids = parse_structured_recommendation(llm_json, valid_pool)
        self.assertEqual(summary, "Aryan shows accelerating growth across all cycles.")
        self.assertEqual(len(recs), 1)
        self.assertEqual(ev_ids, ["PROJ-001", "CERT-AWS-SA"])

    def test_filters_invalid_ids_during_parsing(self):
        llm_json = """
        {
          "summary": "Growth overview",
          "recommendations": [
            {
              "text": "Action item",
              "evidence_ids": ["PROJ-001", "NONEXISTENT-999"]
            }
          ]
        }
        """
        valid_pool = {"PROJ-001"}
        _, _, ev_ids = parse_structured_recommendation(llm_json, valid_pool)
        self.assertEqual(ev_ids, ["PROJ-001"])



class TestOpenAIClient(unittest.TestCase):
    @patch.dict("os.environ", {"OPENAI_API_KEY": "test-key"})
    @patch("recommendation.recommendation_engine.urllib.request.urlopen")
    def test_sends_openai_chat_completion_request(self, mock_urlopen):
        import json

        response = MagicMock()
        response.read.return_value = json.dumps({
            "choices": [{"message": {"content": '{"summary":"ok","recommendations":[]}'}}]
        }).encode("utf-8")
        mock_urlopen.return_value.__enter__.return_value = response

        result = _call_openai("system", "user")

        self.assertEqual(result, '{"summary":"ok","recommendations":[]}')
        request = mock_urlopen.call_args.args[0]
        self.assertEqual(request.full_url, "https://api.openai.com/v1/chat/completions")
        self.assertEqual(request.get_header("Authorization"), "Bearer test-key")
        body = json.loads(request.data.decode("utf-8"))
        self.assertEqual(body["model"], "gpt-4o-mini")
        self.assertEqual(body["response_format"], {"type": "json_object"})

    @patch.dict("os.environ", {}, clear=True)
    def test_returns_none_without_api_key(self):
        self.assertIsNone(_call_openai("system", "user"))


class TestFallbackAndFailureHandling(unittest.TestCase):
    def test_deterministic_fallback_when_api_missing(self):
        employee = {
            "employee_id": "EMP999",
            "name": "Test Person",
            "department": "Engineering",
            "competencies": [
                {"competency": "technical_depth", "trend": "improving", "confidence": 0.85, "evidence_used": ["PROJ-100"]}
            ],
        }
        with patch("recommendation.recommendation_engine._call_openai", return_value=None):
            result = generate_recommendation(employee, "sys prompt", {"employees": []})
            self.assertEqual(result["generation_source"], "fallback")
            self.assertIsNone(result["model"])
            self.assertGreater(len(result["recommendations"]), 0)


if __name__ == "__main__":
    unittest.main()
