# AI Recommendation Engine Documentation

EvidentIQ uses **Claude via OpenRouter** (with direct Anthropic SDK fallback) to generate evidence-grounded talent development roadmaps from longitudinal competency trajectories.

## Workflow Overview

```
trajectory_output.json
          │
          ▼
build_user_prompt() ──► Extracts valid evidence IDs pool
          │
          ▼
_call_openrouter_or_anthropic() (Structured JSON mode)
          │
          ▼
validate_and_filter_evidence_ids() ──► Filters out any unverified IDs
          │
          ▼
recommendations.json (100% Traceable & Auditable)
```

## API Configuration & Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `OPENROUTER_API_KEY` | OpenRouter API Key for Claude model access | None (triggers fallback) |
| `OPENROUTER_BASE_URL`| Base URL for OpenRouter API | `https://openrouter.ai/api/v1` |
| `ANTHROPIC_API_KEY`  | Direct Anthropic API Key (alternative) | None |
| `AI_MODEL`           | Model identifier | `anthropic/claude-3.5-sonnet` |

## Graceful Fallback & Zero-Hallucination Guarantees

1. **Deterministic Fallback**: If no API key is set or the network times out, the system generates transparent rule-based coaching actions and marks `generation_source: "fallback"`.
2. **Evidence ID Filtering**: If the model mentions an unverified ID, `validate_and_filter_evidence_ids()` strips it automatically before saving recommendations.
