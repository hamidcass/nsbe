/**
 * XRPL micro-payments: quotes, payment intents, and balance (credits).
 * Testnet supported for MVP.
 */

import type {
  PaymentProduct,
  PaymentQuote,
  PaymentIntent,
  CreditBalance,
} from "../../types/payment";

const TESTNET_WS = "wss://s.altnet.rippletest.net:51233";
const MAINNET_WS = "wss://xrplcluster.com";

/** Price per product in drops (1 XRP = 1_000_000 drops). MVP: fixed testnet-friendly amounts. */
const PRICE_DROPS: Record<PaymentProduct, string> = {
  scan: "10000",           // 0.01 XRP
  report: "10000",         // 0.01 XRP
  remediation_credit: "50000", // 0.05 XRP
};

/**
 * Get a payment quote for a product. Testnet OK.
 */
export function getQuote(
  product: PaymentProduct,
  network: "testnet" | "mainnet" = "testnet"
): PaymentQuote {
  const amountDrops = PRICE_DROPS[product];
  const amountXRP = Number(amountDrops) / 1_000_000;

  return {
    product,
    amountDrops,
    amountDisplay: `${amountXRP} XRP`,
    currency: "XRP",
    network,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  };
}

/**
 * Create a payment intent (destination = our wallet). Client pays this amount to get credit.
 */
export function createPaymentIntent(
  product: PaymentProduct,
  destinationAddress: string,
  destinationTag?: number,
  network: "testnet" | "mainnet" = "testnet"
): PaymentIntent {
  const quote = getQuote(product, network);

  return {
    id: `pi_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    quote,
    status: "pending",
    destinationAddress,
    destinationTag,
    amountDrops: quote.amountDrops,
  };
}

/**
 * Verify payment on XRPL (check if destination received amount). MVP: stub.
 */
export async function verifyPayment(
  intentId: string,
  destinationAddress: string,
  amountDrops: string,
  network: "testnet" | "mainnet" = "testnet"
): Promise<{ verified: boolean; txHash?: string }> {
  // TODO: use xrpl.js to connect to network, look up account transactions
  // or use WebSocket to listen for Payment transactions to destinationAddress
  return { verified: false };
}

/**
 * Get credit balance for a customer (stub: would come from DB keyed by customerId/destinationTag).
 */
export function getCreditBalance(customerId: string): CreditBalance {
  return {
    customerId,
    scansRemaining: 0,
    reportsRemaining: 0,
    remediationCreditsRemaining: 0,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Consume one credit for a product. MVP: stub; persist in DB and decrement.
 */
export function consumeCredit(
  customerId: string,
  product: PaymentProduct
): { success: boolean; remaining?: number } {
  return { success: false };
}
