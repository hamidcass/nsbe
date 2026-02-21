/**
 * XRPL micro-payment types for per-scan, per-report, per-PR credits.
 * Testnet supported for MVP.
 */

export type PaymentProduct =
  | "scan"
  | "report"
  | "remediation_credit";

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export interface PaymentQuote {
  product: PaymentProduct;
  /** Amount in drops (1 XRP = 1_000_000 drops) */
  amountDrops: string;
  /** Human-readable amount (e.g. "0.01 XRP") */
  amountDisplay: string;
  currency: "XRP";
  /** Testnet vs mainnet */
  network: "testnet" | "mainnet";
  expiresAt: string;
}

export interface PaymentIntent {
  id: string;
  quote: PaymentQuote;
  status: PaymentStatus;
  /** XRPL destination address (our wallet) */
  destinationAddress: string;
  /** Optional destination tag for crediting the right account */
  destinationTag?: number;
  /** Client should send this amount to destinationAddress */
  amountDrops: string;
  /** When payment was completed (if any) */
  completedAt?: string;
  /** XRPL tx hash when completed */
  txHash?: string;
}

export interface CreditBalance {
  /** Customer identifier */
  customerId: string;
  scansRemaining: number;
  reportsRemaining: number;
  remediationCreditsRemaining: number;
  lastUpdated: string;
}
