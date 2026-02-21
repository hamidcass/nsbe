# NSBE — AI Accessibility Remediation Agent (MVP)

**Working name.** An AI accessibility remediation agent for startups and small businesses that:

- Scans a web app/codebase for UI and accessibility issues
- Runs browser-based user flows with screenshots
- Suggests and applies fixes (human-in-the-loop)
- Opens a pull request with before/after evidence
- Supports **Ontario/Canada (AODA/IASR)** and **WCAG**-based compliance workflows

**Monetization:** XRP Ledger (XRPL) micro-payments — pay per scan, per report, or per PR remediation credit. Testnet supported for MVP.

**Disclaimer:** This product is human-in-the-loop and does not claim fully automated legal compliance.

---

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **XRPL** (xrpl.js) for payments (testnet/mainnet)

## Getting started

```bash
npm install
cp .env.example .env
# Edit .env with XRPL wallet (testnet) and any API keys for AI/scan
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## MVP scope

| Feature              | Status | Notes                                              |
|----------------------|--------|----------------------------------------------------|
| Code scan            | Done   | eslint-plugin-jsx-a11y                             |
| Browser screenshot   | Done   | Playwright + axe-core, screenshots per step        |
| AI fix suggestions   | Done   | OpenAI (fallback to rule-based if no API key)      |
| PR creation          | Done   | Octokit (GitHub); requires GITHUB_TOKEN            |
| Report generation    | Done   | JSON + HTML with disclaimer                        |
| XRPL payment flow    | Done   | Quote + intent + verify (testnet)                  |

## API

- **POST /api/scan** — Start a scan (body: `{ target?, baseUrl?, type?: "code"|"browser"|"full", steps? }`). For browser/full, use `baseUrl` (e.g. http://localhost:3000).
- **GET /api/report?jobId=…&format=json|html** — Get accessibility report.
- **POST /api/suggest** — Get AI fix suggestions (body: `{ jobId }`).
- **POST /api/pr** — Create remediation PR (body: `{ jobId, repo, baseBranch?, changes? }`). Requires `GITHUB_TOKEN`.
- **GET /api/payment/quote?product=scan|report|remediation_credit&network=testnet|mainnet** — Get payment quote.
- **POST /api/payment/intent** — Create payment intent (body: `{ product, network? }`). Uses `XRPL_DESTINATION_ADDRESS` from env.
- **POST /api/payment/verify** — Verify payment (body: `{ intentId, destinationAddress, amountDrops, network? }`).

## Project structure

```
src/
  app/              # Next.js App Router (pages + API)
  lib/              # Core logic
    scanner/        # Code scan
    browser/        # Browser flow + screenshots
    ai/             # Fix suggestions
    pr/             # Remediation PR
    report/         # Report generation
    xrpl/           # Payments
  types/            # Shared TypeScript types (WCAG, AODA, scan, report, payment)
```

## AODA / WCAG

- Scans are run with **WCAG 2.1 Level AA** by default, aligned with AODA/IASR expectations.
- Reports include a **disclaimer**: guidance only, not legal advice or certification.

## XRPL (testnet)

- Use [XRPL Testnet Faucet](https://xrpl.org/xrp-testnet-faucet.html) to fund a test wallet.
- Set `XRPL_DESTINATION_ADDRESS` (and optional `XRPL_DESTINATION_TAG`) in `.env` for receiving payments.
