# PerfPilot — Your AI Performance Engineer

[![PerfPilot CI](https://github.com/PlutonicSauce/PerfPilot/actions/workflows/perfpilot.yml/badge.svg)](https://github.com/PlutonicSauce/PerfPilot/actions/workflows/perfpilot.yml)

PerfPilot is continuous performance review for AI inference on Arm. It profiles a workload, detects regressions against a baseline, explains the likely bottleneck, compares runtime and quantization strategies, and produces a review-ready optimization plan.

> **Hackathon track:** Arm Create: AI Optimization Challenge 2026 · Cloud AI

## Project overview

AI teams have CI for correctness, style, and security—but typically not for inference efficiency. A seemingly harmless pull request can add tokenizer work, memory copies, or poor thread configuration that increases Arm cloud cost and latency without a test ever failing.

PerfPilot brings a senior performance engineer into the pull-request loop. It makes optimization work reviewable: benchmark configuration and provenance stay attached to each result, and the product distinguishes **Measured** values from **Estimated** tradeoffs. This is important for developer trust and directly addresses a costly gap in production AI delivery.

## What it does

| Capability | Output |
| --- | --- |
| Regression review | Latency, throughput, memory, and energy-estimate changes compared with a baseline |
| Root-cause analysis | A prioritized explanation of where inference time is spent and why it changed |
| Optimization explorer | A ranked benchmark matrix across INT4, INT8, FP16, runtimes, batch sizes, and thread settings |
| AI performance review | Pull-request-ready recommendation with confidence, engineering effort, tradeoffs, and affected files |
| Reproducible evidence | Raw timing samples, benchmark configuration, method, and metric provenance through the local API and CI artifact |

The browser interface demonstrates the complete developer experience: enter a repository, inspect a regression report, compare alternatives, and generate a scoped optimization PR draft. The current sample report is explicitly a representative UI scenario. Actual benchmark values come only from the benchmark runner and are marked **Measured**.

## Why it is interesting

PerfPilot is not another profiler chart. It bridges the gap between an observed regression and an actionable, defensible change:

1. A developer pushes a change.
2. An Arm64 GitHub Actions runner captures a benchmark artifact.
3. PerfPilot compares the candidate with the baseline and retains the evidence.
4. The dashboard turns that evidence into root cause, alternatives, and a review comment.

This makes Arm optimization a continuous engineering practice instead of a late-stage incident response.

## Architecture

```text
Next.js dashboard ────────> FastAPI benchmark service ────────> evidence JSON
        │                               │
        └──── GitHub Action on Arm64 ───┴──── artifact for baseline/PR comparison
```

- **Frontend:** Next.js, TypeScript, React, accessible dark-mode UI.
- **Service:** FastAPI with a reproducible, dependency-light benchmark runner.
- **CI:** GitHub Actions workflow that targets `ubuntu-24.04-arm` and uploads `perfpilot-evidence.json`.
- **Integration seam:** Replace the deterministic workload adapter with PyTorch Profiler, ONNX Runtime, or llama.cpp while preserving the evidence schema.

## Run on Arm64

PerfPilot is designed to run on an Arm-powered Linux VM or Arm64 development environment, such as an AWS Graviton instance or an Arm64 CI runner.

### 1. Prerequisites

Install the following on the Arm64 host:

- Node.js 20+ and npm
- Python 3.11+
- Git

Verify the target is Arm64:

```bash
uname -m
# expected: aarch64 or arm64
```

### 2. Clone and install

```bash
git clone https://github.com/PlutonicSauce/PerfPilot.git
cd PerfPilot
npm ci

python3 -m venv .venv
. .venv/bin/activate
pip install -r backend/requirements.txt
```

### 3. Start the product

In one terminal, run the benchmark service:

```bash
.venv/bin/uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

In a second terminal, run the dashboard:

```bash
npm run dev
```

Open `http://localhost:3000` and open `http://localhost:8000/docs` to run the local benchmark endpoint interactively.

### 4. Validate measurements

Run a reproducible CPU benchmark on the Arm64 machine:

```bash
curl --request POST http://localhost:8000/v1/benchmarks/run \
  --header 'content-type: application/json' \
  --data '{"iterations":100,"workload_size":4000}'
```

The response contains individual timing samples plus median latency, P95 latency, and throughput. Every returned metric has a `provenance` field and the benchmark configuration and method are recorded alongside it.

Validate the application before submitting:

```bash
npm run lint
npm run build
npm test
python3 -m py_compile backend/main.py
```

## GitHub Actions on Arm

The included workflow at [`.github/workflows/perfpilot.yml`](.github/workflows/perfpilot.yml) runs on `ubuntu-24.04-arm` for pull requests to `main` and manual dispatches. It saves a `perfpilot-evidence` artifact containing the raw JSON benchmark result.

For a production workload, run the same test matrix for the base and pull-request commits, then attach both artifacts to the review. The repository intentionally does not infer workload performance from a repository name or label modeled results as measurements.

## Extending to real models

Replace `deterministic_workload` in [`backend/main.py`](backend/main.py) with a model-specific adapter. Preserve the output contract and include:

- model and tokenizer hashes
- runtime and library versions
- Arm CPU model, OS, and thread settings
- prompt/context/batch configuration
- warmup and measured iteration counts

This lets the dashboard compare equivalent evidence across commits and makes any claimed Arm speedup independently reproducible.

## License

PerfPilot is open source under the [MIT License](LICENSE).
