# Scoring Engine

Generates `scored_output.json` from raw employee data.

## Usage

```bash
python scoring/score_engine.py
```

## Output

- `data/raw_dataset.json` — raw employee evidence data (input to scoring)
- `scored_output.json` — deterministic competency scores per employee per competency per month

## Algorithm

For each employee, each competency, and each monthly period:
1. Aggregate all evidence items for that period.
2. Compute the weighted average of evidence values (reviews weight 0.5, projects 0.3, peers 0.2).
3. Clamp to [0, 100].

## Reproducibility

The engine is fully deterministic — no randomness, no external API calls.
Same input always produces same output.
