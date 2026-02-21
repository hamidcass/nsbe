"use client";

import { useState } from "react";

export default function Home() {
  const [target, setTarget] = useState("src");
  const [scanType, setScanType] = useState<"code" | "browser" | "full">("code");
  const [baseUrl, setBaseUrl] = useState("http://localhost:3000");
  const [jobId, setJobId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [product, setProduct] = useState<"scan" | "report" | "remediation_credit">("scan");
  const [quote, setQuote] = useState<{ amountDisplay: string; amountDrops: string; network: string } | null>(null);
  const [intent, setIntent] = useState<{ id: string; destinationAddress: string; amountDrops: string } | null>(null);

  async function handleScan() {
    setLoading(true);
    setError(null);
    try {
      const body: Record<string, unknown> = { type: scanType };
      if (scanType === "code" || scanType === "full") body.target = target;
      if (scanType === "browser" || scanType === "full") body.baseUrl = baseUrl;
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Scan failed");
      setJobId(data.jobId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGetQuote() {
    setError(null);
    try {
      const res = await fetch(`/api/payment/quote?product=${product}&network=testnet`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setQuote(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }

  async function handleCreateIntent() {
    setError(null);
    try {
      const res = await fetch("/api/payment/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, network: "testnet" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setIntent({ id: data.id, destinationAddress: data.destinationAddress, amountDrops: data.amountDrops ?? data.quote?.amountDrops });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <main className="page">
      <header className="hero">
        <h1>NSBE — AI Accessibility Remediation</h1>
        <p>Scan for UI/accessibility issues, get AI fix suggestions, open PRs with evidence. AODA/WCAG. Human-in-the-loop.</p>
      </header>

      {error && (
        <div className="error-banner" role="alert">{error}</div>
      )}

      <section className="card">
        <h2>Run scan</h2>
        <div className="form-row">
          <label className="field">
            <span className="label">Type</span>
            <select
              value={scanType}
              onChange={(e) => setScanType(e.target.value as "code" | "browser" | "full")}
            >
              <option value="code">Code</option>
              <option value="browser">Browser</option>
              <option value="full">Full (code + browser)</option>
            </select>
          </label>
          {(scanType === "code" || scanType === "full") && (
            <label className="field">
              <span className="label">Target path</span>
              <input
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="src or ./my-app"
              />
            </label>
          )}
          {(scanType === "browser" || scanType === "full") && (
            <label className="field">
              <span className="label">Base URL</span>
              <input
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="http://localhost:3000"
              />
            </label>
          )}
          <button
            onClick={handleScan}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? "Scanning…" : "Scan"}
          </button>
        </div>

        {jobId && (
          <div className="result-box">
            <p><strong>Job:</strong> {jobId}</p>
            <div className="links">
              <a href={`/api/report?jobId=${jobId}&format=html`} target="_blank" rel="noopener noreferrer">View HTML report</a>
              <a href={`/api/report?jobId=${jobId}&format=json`} target="_blank" rel="noopener noreferrer">JSON report</a>
            </div>
          </div>
        )}
      </section>

      <section className="card">
        <h2>XRPL payment (testnet)</h2>
        <div className="form-row">
          <label className="field">
            <span className="label">Product</span>
            <select
              value={product}
              onChange={(e) => setProduct(e.target.value as "scan" | "report" | "remediation_credit")}
            >
              <option value="scan">Scan</option>
              <option value="report">Report</option>
              <option value="remediation_credit">Remediation credit</option>
            </select>
          </label>
          <button onClick={handleGetQuote} className="btn btn-secondary">Get quote</button>
          {quote && <span className="quote">{quote.amountDisplay} ({quote.network})</span>}
        </div>
        <div className="form-row">
          <button onClick={handleCreateIntent} className="btn btn-primary">Create payment intent</button>
        </div>
        {intent && (
          <div className="result-box">
            <p>Send <strong>{intent.amountDrops}</strong> drops to:</p>
            <code className="address">{intent.destinationAddress}</code>
            <p className="hint">Use POST /api/payment/verify to verify payment.</p>
          </div>
        )}
      </section>

      <section className="api-section">
        <h2>API</h2>
        <ul>
          <li>POST /api/scan — Start scan</li>
          <li>GET /api/report?jobId=…&format=json|html</li>
          <li>POST /api/suggest — AI fix suggestions</li>
          <li>POST /api/pr — Create remediation PR</li>
          <li>GET /api/payment/quote — Payment quote</li>
          <li>POST /api/payment/intent — Create intent</li>
          <li>POST /api/payment/verify — Verify payment</li>
        </ul>
      </section>
    </main>
  );
}
