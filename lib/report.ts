export type Provenance = "measured" | "estimated";

export type Metric = {
  label: string;
  value: string;
  delta: string;
  direction: "good" | "bad" | "neutral";
  provenance: Provenance;
};

export const metrics: Metric[] = [
  { label: "P95 latency", value: "184 ms", delta: "+19.2%", direction: "bad", provenance: "measured" },
  { label: "Throughput", value: "38.4 tok/s", delta: "−12.6%", direction: "bad", provenance: "measured" },
  { label: "Peak memory", value: "1.82 GB", delta: "+246 MB", direction: "bad", provenance: "measured" },
  { label: "Energy / 1K tok", value: "8.2 J", delta: "+14.1%", direction: "bad", provenance: "estimated" },
];

export const strategies = [
  { name: "INT4 · llama.cpp", latency: "98 ms", speed: "1.88×", memory: "0.92 GB", quality: "−1.8%", status: "Recommended", provenance: "measured" as Provenance },
  { name: "INT8 · ONNX Runtime", latency: "121 ms", speed: "1.52×", memory: "1.14 GB", quality: "−0.4%", status: "Strong fit", provenance: "measured" as Provenance },
  { name: "FP16 · XNNPACK", latency: "142 ms", speed: "1.30×", memory: "1.51 GB", quality: "0.0%", status: "Low risk", provenance: "measured" as Provenance },
  { name: "Current · PyTorch", latency: "184 ms", speed: "1.00×", memory: "1.82 GB", quality: "0.0%", status: "Baseline", provenance: "measured" as Provenance },
];

export const timeline = [
  { step: "Checkout", time: "00:04", state: "done" },
  { step: "Benchmark baseline", time: "02:16", state: "done" },
  { step: "Profile current branch", time: "03:41", state: "done" },
  { step: "Evaluate strategies", time: "06:08", state: "done" },
  { step: "Generate review", time: "06:21", state: "done" },
];
