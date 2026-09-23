# Scoring Schema (Shared Contract)

This document defines the schema for competency scores produced by Person 1's
scoring engine. All downstream branches **must not** change these field names or
structures without agreeing on this contract first.

## `scored_output.json`

A JSON object with a top-level `employees` array.

### Employee

| Field        | Type   | Description                                      |
| ------------ | ------ | ------------------------------------------------ |
| `employee_id` | string | Unique employee identifier                       |
| `name`        | string | Full name                                      |
| `department`  | string | Department (e.g. "Engineering", "Sales")        |
| `scores`      | object | Map of competency → list of monthly score entries |

### Score Entry (inside `scores.<competency>`)

| Field      | Type   | Description                                   |
| ---------- | ------ | --------------------------------------------- |
| `month`    | string | ISO month (e.g. "2026-01")                   |
| `score`    | number | Score 0–100                                   |
| `evidence` | array  | List of evidence items (see below)            |

### Evidence Item

| Field     | Type   | Description                            |
| --------- | ------ | -------------------------------------- |
| `type`    | string | Evidence type (review, project, peer) |
| `source`  | string | Source identifier                      |
| `date`    | string | ISO date                               |
| `value`   | number | Raw value contributing to score        |

## `trajectory_output.json`

A JSON object with a top-level `employees` array. Each employee has:

| Field            | Type   | Description                                  |
| ---------------- | ------ | -------------------------------------------- |
| `employee_id`    | string | Mirrors scoring schema                     |
| `name`           | string | Full name                                  |
| `department`     | string | Department                                 |
| `competencies`   | array  | Per-competency trajectory assessments      |

### Competency Trajectory

| Field            | Type   | Description                                  |
| ---------------- | ------ | -------------------------------------------- |
| `competency`     | string | Competency name                            |
| `latest_score`   | number | Most recent score                          |
| `previous_score` | number | Score before latest (or null)              |
| `trend`          | string | "improving" \| "declining" \| "stagnant" \| "insufficient_evidence" |
| `confidence`     | number | 0–1 confidence in the trend assessment      |
| `evidence_count` | number | Number of evidence points considered       |

## Trajectory Determination Rules

- **improving**: latest > previous and confidence ≥ threshold
- **declining**: latest < previous and confidence ≥ threshold
- **stagnant**: latest ≈ previous (within ±5) and confidence ≥ threshold
- **insufficient_evidence**: fewer than 2 data points OR confidence below threshold

## Confidence Threshold

Default threshold is **0.6**. Configurable via `TRAJECTORY_CONFIDENCE_THRESHOLD` env var.
