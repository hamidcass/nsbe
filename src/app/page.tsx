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
    <main style={{ padding: "2rem", maxWidth: "56rem", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 700 }}>
        NSBE — AI Accessibility Remediation
      </h1>
      <p style={{ color: "var(--muted)", marginTop: "0.5rem" }}>
        Scan for UI/accessibility issues, get AI fix suggestions, open PRs with evidence. AODA/WCAG. Human-in-the-loop.
      </p>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.2)", border: "1px solid #ef4444", padding: "0.75rem", borderRadius: 8, marginTop: "1rem" }}>
          {error}
        </div>
      )}

      <section style={{ marginTop: "2rem", background: "var(--surface)", padding: "1.5rem", borderRadius: 12, border: "1px solid var(--border)" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Run scan</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "flex-end" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ color: "var(--muted)", fontSize: "0.875rem" }}>Type</span>
            <select
              value={scanType}
              onChange={(e) => setScanType(e.target.value as "code" | "browser" | "full")}
              style={{ padding: "0.5rem", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, color: "inherit" }}
            >
              <option value="code">Code</option>
              <option value="browser">Browser</option>
              <option value="full">Full (code + browser)</option>
            </select>
          </label>
          {(scanType === "code" || scanType === "full") && (
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ color: "var(--muted)", fontSize: "0.875rem" }}>Target path</span>
              <input
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="src or ./my-app"
                style={{ padding: "0.5rem", minWidth: 180, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, color: "inherit" }}
              />
            </label>
          )}
          {(scanType === "browser" || scanType === "full") && (
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ color: "var(--muted)", fontSize: "0.875rem" }}>Base URL</span>
              <input
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="http://localhost:3000"
                style={{ padding: "0.5rem", minWidth: 220, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, color: "inherit" }}
              />
            </label>
          )}
          <button
            onClick={handleScan}
            disabled={loading}
            style={{ padding: "0.5rem 1rem", background: "var(--accent)", color: "#000", border: "none", borderRadius: 6, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Scanning…" : "Scan"}
          </button>
        </div>

        {jobId && (
          <div style={{ marginTop: "1rem", padding: "1rem", background: "var(--bg)", borderRadius: 8 }}>
            <p style={{ margin: 0, color: "var(--accent)", fontWeight: 600 }}>Job: {jobId}</p>
            <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <a href={`/api/report?jobId=${jobId}&format=html`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>
                View HTML report
              </a>
              <a href={`/api/report?jobId=${jobId}&format=json`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>
                JSON report
              </a>
            </div>
          </div>
        )}
      </section>

      <section style={{ marginTop: "2rem", background: "var(--surface)", padding: "1.5rem", borderRadius: 12, border: "1px solid var(--border)" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>XRPL payment (testnet)</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "flex-end" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ color: "var(--muted)", fontSize: "0.875rem" }}>Product</span>
            <select
              value={product}
              onChange={(e) => setProduct(e.target.value as "scan" | "report" | "remediation_credit")}
              style={{ padding: "0.5rem", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, color: "inherit" }}
            >
              <option value="scan">Scan</option>
              <option value="report">Report</option>
              <option value="remediation_credit">Remediation credit</option>
            </select>
          </label>
          <button
            onClick={handleGetQuote}
            style={{ padding: "0.5rem 1rem", background: "var(--border)", border: "none", borderRadius: 6, color: "inherit", cursor: "pointer" }}
          >
            Get quote
          </button>
          {quote && (
            <span style={{ color: "var(--accent)" }}>{quote.amountDisplay} ({quote.network})</span>
          )}
        </div>
        <div style={{ marginTop: "1rem" }}>
          <button
            onClick={handleCreateIntent}
            style={{ padding: "0.5rem 1rem", background: "var(--accent)", color: "#000", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}
          >
            Create payment intent
          </button>
          {intent && (
            <div style={{ marginTop: "0.75rem", padding: "1rem", background: "var(--bg)", borderRadius: 8 }}>
              <p style={{ margin: 0 }}>Send {intent.amountDrops} drops to: <code style={{ wordBreak: "break-all" }}>{intent.destinationAddress}</code></p>
              <p style={{ margin: "0.5rem 0 0", color: "var(--muted)", fontSize: "0.875rem" }}>Use POST /api/payment/verify with intentId, destinationAddress, amountDrops to verify.</p>
            </div>
          )}
        </div>
      </section>

      <section style={{ marginTop: "2rem", color: "var(--muted)", fontSize: "0.875rem" }}>
        <h2 style={{ fontSize: "1rem", color: "var(--text)" }}>API</h2>
        <ul style={{ paddingLeft: "1.25rem", marginTop: "0.5rem" }}>
          <li>POST /api/scan — Start scan (body: target, type, baseUrl)</li>
          <li>GET /api/report?jobId=…&format=json|html</li>
          <li>POST /api/suggest — Get AI fix suggestions (body: jobId)</li>
          <li>POST /api/pr — Create remediation PR (body: jobId, repo)</li>
          <li>GET /api/payment/quote?product=scan|report|remediation_credit</li>
          <li>POST /api/payment/intent — Create intent</li>
          <li>POST /api/payment/verify — Verify payment</li>
        </ul>
      </section>
    </main>
  );
}
