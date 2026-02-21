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

| Feature              | Status   | Notes                                      |
|----------------------|----------|--------------------------------------------|
| Code scan            | Scaffold | `src/lib/scanner/code-scanner.ts`          |
| Browser screenshot   | Scaffold | `src/lib/browser/browser-runner.ts`        |
| AI fix suggestions   | Scaffold | `src/lib/ai/suggest-fixes.ts`              |
| PR creation          | Scaffold | `src/lib/pr/create-remediation-pr.ts`     |
| Report generation    | Done     | JSON + HTML with disclaimer                 |
| XRPL payment flow    | Done     | Quote + intent (testnet); verify stub       |

## API

- **POST /api/scan** — Start a scan (body: `{ target, ref?, type?: "code"|"browser"|"full" }`).
- **GET /api/report?jobId=…&format=json|html** — Get accessibility report.
- **GET /api/payment/quote?product=scan|report|remediation_credit&network=testnet|mainnet** — Get payment quote.
- **POST /api/payment/intent** — Create payment intent (body: `{ product, destinationAddress, destinationTag?, network? }`).

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
