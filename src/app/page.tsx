export default function Home() {
  return (
    <main style={{ padding: "2rem", maxWidth: "48rem", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 700 }}>
        NSBE — AI Accessibility Remediation
      </h1>
      <p style={{ color: "var(--muted)", marginTop: "0.5rem" }}>
        Scan your web app for UI and accessibility issues, run browser flows with
        screenshots, get AI fix suggestions, and open PRs with before/after
        evidence. AODA/IASR and WCAG. Human-in-the-loop.
      </p>
      <section style={{ marginTop: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem" }}>MVP</h2>
        <ul style={{ paddingLeft: "1.25rem" }}>
          <li>Code scan</li>
          <li>Browser screenshot testing</li>
          <li>AI fix suggestions</li>
          <li>PR creation with evidence</li>
          <li>Report generation</li>
          <li>XRPL micro-payments (testnet OK)</li>
        </ul>
      </section>
      <section style={{ marginTop: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem" }}>API</h2>
        <ul style={{ paddingLeft: "1.25rem" }}>
          <li>POST /api/scan — Start a scan</li>
          <li>GET /api/report?jobId=… — Get report</li>
          <li>GET /api/payment/quote?product=scan — Payment quote</li>
          <li>POST /api/payment/intent — Create payment intent</li>
        </ul>
      </section>
    </main>
  );
}
