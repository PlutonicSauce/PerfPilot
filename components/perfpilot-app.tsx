"use client";

import { useMemo, useState } from "react";
import { metrics, strategies, timeline, type Provenance } from "../lib/report";

type Tab = "overview" | "explorer" | "review";

const Icon = ({ name }: { name: "pulse" | "branch" | "chevron" | "arrow" | "spark" | "check" | "code" | "clock" }) => {
  const paths = {
    pulse: <><path d="M3 12h3l2.1-6 3.2 12 2.1-6H21" /></>,
    branch: <><circle cx="6" cy="6" r="2" /><circle cx="18" cy="18" r="2" /><circle cx="6" cy="18" r="2" /><path d="M6 8v8M8 18h8M8 6h5a5 5 0 0 1 5 5v5" /></>,
    chevron: <path d="m8 10 4 4 4-4" />,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    spark: <path d="m12 3 1.55 5.45L19 10l-5.45 1.55L12 17l-1.55-5.45L5 10l5.45-1.55L12 3Z" />,
    check: <path d="m5 12 4.5 4.5L19 7" />,
    code: <><path d="m8 9-3 3 3 3M16 9l3 3-3 3M14 5l-4 14" /></>,
    clock: <><circle cx="12" cy="12" r="8" /><path d="M12 7v5l3 2" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
};

function Badge({ children, type = "plain" }: { children: React.ReactNode; type?: "plain" | "measured" | "estimated" | "critical" | "success" }) {
  return <span className={`badge badge-${type}`}>{children}</span>;
}

function ProvenanceBadge({ value }: { value: Provenance }) {
  return <Badge type={value}>{value === "measured" ? "Measured" : "Estimated"}</Badge>;
}

export function PerfPilotApp() {
  const [active, setActive] = useState<Tab>("overview");
  const [repo, setRepo] = useState("acme/atlas-inference");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState<"all" | "speed" | "memory">("all");

  const ranked = useMemo(() => filter === "all" ? strategies : strategies.filter((_, index) => filter === "speed" ? index < 3 : index !== 2), [filter]);

  const analyze = () => {
    setIsAnalyzing(true); setNotice("");
    window.setTimeout(() => { setIsAnalyzing(false); setNotice(`Analysis queued for ${repo}. Open the local API to run a fresh measured pass.`); }, 700);
  };
  const createPR = () => setNotice("Optimization PR draft prepared with the INT4 benchmark evidence and implementation notes.");

  return <main>
    <header className="topbar">
      <a className="brand" href="#top" aria-label="PerfPilot home"><span className="brand-mark"><Icon name="pulse" /></span><span>PerfPilot</span></a>
      <nav aria-label="Main navigation"><a href="#product">Product</a><a href="#workflow">Workflow</a><a href="https://github.com" target="_blank">GitHub</a></nav>
      <button className="sign-in" onClick={() => setNotice("Connect GitHub to analyze your repositories.")}>Sign in <Icon name="arrow" /></button>
    </header>

    <section id="top" className="hero">
      <div className="eyebrow"><span className="dot" /> Continuous performance review for Arm</div>
      <h1>Ship Faster AI.<br /><em>Not Slower AI.</em></h1>
      <p>PerfPilot detects AI inference regressions, explains bottlenecks, benchmarks optimizations, and helps your team ship faster workloads on Arm.</p>
      <div className="analyze-box" aria-label="Repository analysis form">
        <span className="repo-icon"><Icon name="branch" /></span>
        <input aria-label="Repository name" value={repo} onChange={(event) => setRepo(event.target.value)} />
        <button onClick={analyze} disabled={isAnalyzing}>{isAnalyzing ? "Analyzing…" : "Analyze repository"}<Icon name="arrow" /></button>
      </div>
      <p className="microcopy">Works with GitHub Actions · PyTorch · ONNX Runtime · llama.cpp</p>
      {notice && <div className="notice" role="status">{notice}</div>}
    </section>

    <section id="product" className="workspace" aria-label="PerfPilot analysis report">
      <div className="workspace-head">
        <div><div className="crumb"><span>Repositories</span><span>/</span><strong>atlas-inference</strong><span>/</span><strong>PR #428</strong></div><h2>Performance report</h2></div>
        <div className="report-meta"><Badge type="critical">Regression detected</Badge><span><Icon name="clock" /> 6m 21s</span><button className="ghost-button" onClick={createPR}><Icon name="code" /> Create optimization PR</button></div>
      </div>
      <div className="tabs" role="tablist">
        {(["overview", "explorer", "review"] as Tab[]).map((tab) => <button key={tab} onClick={() => setActive(tab)} className={active === tab ? "active" : ""} role="tab" aria-selected={active === tab}>{tab === "overview" ? "Overview" : tab === "explorer" ? "Optimization explorer" : "AI review"}</button>)}
      </div>

      {active === "overview" && <Overview />}
      {active === "explorer" && <Explorer filter={filter} setFilter={setFilter} ranked={ranked} />}
      {active === "review" && <Review createPR={createPR} />}
    </section>
    <section id="workflow" className="workflow"><p className="eyebrow">Built for the pull request loop</p><h2>Evidence first. Suggestions second.</h2><p>Every recommendation keeps its source, test configuration, and tradeoffs visible—so a speedup is something your team can trust.</p></section>
    <footer><span>© 2026 PerfPilot</span><span>Built for Arm-powered AI infrastructure</span></footer>
  </main>;
}

function Overview() {
  return <div className="report-grid">
    <div className="primary-column">
      <section className="metric-grid" aria-label="Regression summary">{metrics.map((metric) => <article className="metric" key={metric.label}><div><span>{metric.label}</span><ProvenanceBadge value={metric.provenance} /></div><strong>{metric.value}</strong><small className={metric.direction === "bad" ? "negative" : "positive"}>{metric.delta} vs main</small></article>)}</section>
      <section className="panel diagnosis"><div className="panel-head"><div><p className="section-kicker">Root cause analysis</p><h3>Tokenizer work moved onto the request path.</h3></div><Badge type="critical">High confidence</Badge></div><p>The current branch initializes a Python tokenizer per request. On the Arm baseline, this accounts for 41% of end-to-end latency and introduces 3,842 small allocations per generation.</p><div className="cause-row"><div className="bar-label"><span>Tokenizer execution</span><strong>41%</strong></div><div className="bar"><span style={{ width: "41%" }} /></div></div><div className="cause-row"><div className="bar-label"><span>Model forward pass</span><strong>36%</strong></div><div className="bar"><span style={{ width: "36%" }} /></div></div><div className="cause-row"><div className="bar-label"><span>Tensor copies</span><strong>14%</strong></div><div className="bar"><span style={{ width: "14%" }} /></div></div><a href="#review" className="inline-link">See the evidence <Icon name="arrow" /></a></section>
      <section className="panel recommendation"><div className="rec-symbol"><Icon name="spark" /></div><div><p className="section-kicker">Top recommendation</p><h3>Move to INT4 with llama.cpp</h3><p>Quantize the served model and use the Arm-tuned runtime. This is the highest measured speedup in the configured test matrix.</p></div><div className="rec-stats"><div><strong>1.88×</strong><span>faster</span></div><div><strong>−49%</strong><span>memory</span></div><button onClick={() => document.getElementById("explorer")?.click()}>Compare options <Icon name="arrow" /></button></div></section>
    </div>
    <aside className="side-column"><section className="panel run-panel"><p className="section-kicker">Run details</p><dl><div><dt>Commit</dt><dd><code>8c9c2af</code> <span>current</span></dd></div><div><dt>Baseline</dt><dd><code>6a71f10</code> <span>main</span></dd></div><div><dt>Target</dt><dd>Arm Neoverse V2</dd></div><div><dt>Profile</dt><dd>1 × 128 tokens</dd></div></dl><a className="inline-link" href="http://localhost:8000/docs" target="_blank">View benchmark protocol <Icon name="arrow" /></a></section><section className="panel activity"><p className="section-kicker">Analysis timeline</p>{timeline.map((entry) => <div className="activity-item" key={entry.step}><span className="check"><Icon name="check" /></span><div><strong>{entry.step}</strong><small>{entry.time}</small></div></div>)}</section></aside>
  </div>;
}

function Explorer({ filter, setFilter, ranked }: { filter: "all" | "speed" | "memory"; setFilter: (value: "all" | "speed" | "memory") => void; ranked: typeof strategies }) {
  return <section className="panel explorer"><div className="panel-head"><div><p className="section-kicker">Optimization explorer</p><h3>Measured alternatives, ranked by latency.</h3></div><div className="segmented">{(["all", "speed", "memory"] as const).map((option) => <button key={option} onClick={() => setFilter(option)} className={filter === option ? "selected" : ""}>{option === "all" ? "All runs" : option === "speed" ? "Speed" : "Memory"}</button>)}</div></div><p className="explainer">Each run uses the same prompt set, concurrency, warmup, and target configuration. Energy is an estimate unless a power monitor is attached.</p><div className="strategy-table" role="table"><div className="table-head" role="row"><span>Strategy</span><span>Latency</span><span>Speedup</span><span>Memory</span><span>Quality</span><span /></div>{ranked.map((strategy) => <div className="strategy-row" role="row" key={strategy.name}><span><strong>{strategy.name}</strong><ProvenanceBadge value={strategy.provenance} /></span><span>{strategy.latency}</span><span className={strategy.speed !== "1.00×" ? "positive" : "muted"}>{strategy.speed}</span><span>{strategy.memory}</span><span>{strategy.quality}</span><span><Badge type={strategy.status === "Recommended" ? "success" : "plain"}>{strategy.status}</Badge></span></div>)}</div><div className="protocol"><Icon name="pulse" /><span><strong>Benchmark protocol</strong> · 20 warmup iterations, 100 measured iterations, batch 1, context 128, Neoverse V2 target.</span></div></section>;
}

function Review({ createPR }: { createPR: () => void }) {
  return <section className="review-layout"><article className="panel review-card"><div className="review-author"><span className="bot-avatar">P</span><div><strong>PerfPilot</strong><span> reviewed 4 minutes ago</span></div><Badge type="success">Performance review</Badge></div><h3>Latency regressed by 19.2% on the Arm baseline.</h3><p>The regression is concentrated in request-time tokenizer initialization, introduced by the current branch. Model execution remained within normal variance.</p><blockquote><strong>Suggested change</strong><br />Create and retain a fast tokenizer at process startup, then route requests through its native implementation.</blockquote><div className="review-evidence"><div><span>Expected latency recovery</span><strong>11–14%</strong><small>Estimated from an isolated tokenizer benchmark</small></div><div><span>Engineering effort</span><strong>Small</strong><small>1 file, no model change</small></div><div><span>Confidence</span><strong>High</strong><small>Direct profiler attribution</small></div></div><div className="review-actions"><button className="primary-small" onClick={createPR}>Generate optimization PR <Icon name="arrow" /></button><button className="text-button" onClick={() => window.open("http://localhost:8000/docs", "_blank")}>Inspect raw evidence</button></div></article><aside className="panel review-side"><p className="section-kicker">Files to change</p><div className="file-change"><span><Icon name="code" /></span><div><strong>server/tokenizer.py</strong><small>Reuse process-scoped tokenizer</small></div></div><div className="file-change"><span><Icon name="code" /></span><div><strong>benchmarks/config.yaml</strong><small>Record tokenizer runtime</small></div></div><p className="review-note">Generated changes are kept as a draft until you review the measured tradeoffs.</p></aside></section>;
}
