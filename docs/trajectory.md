# Trajectory Engine

Reads `scored_output.json` and produces `trajectory_output.json`.

## Usage

```bash
python trajectory/trajectory_engine.py
```

## Input

- `data/raw_dataset.json` — scored competency data (from Person 1)

## Output

- `trajectory/trajectory_output.json` — per-employee, per-competency trajectory assessment

## Algorithm

For each employee, each competency with ≥2 monthly data points:
1. Sort entries by month ascending.
2. Compare latest vs previous score:
   - **improving**: latest > previous (+ confidence ≥ threshold)
   - **declining**: latest < previous (+ confidence ≥ threshold)
   - **stagnant**: latest ≈ previous within ±5 (+ confidence ≥ threshold)
3. If <2 data points or confidence below threshold → **insufficient_evidence**.

## Confidence

Confidence is calculated as a function of:
- Number of evidence points (more = higher confidence)
- Magnitude of score difference (larger delta = higher confidence)
- Capped at 1.0, floored at 0.0

Default threshold: **0.6** (configurable via `TRAJECTORY_CONFIDENCE_THRESHOLD` env var).

## Configuration

| Env Var                          | Default | Description                          |
| -------------------------------- | ------- | ------------------------------------ |
| `TRAJECTORY_CONFIDENCE_THRESHOLD` | 0.6     | Minimum confidence for trend classification |
