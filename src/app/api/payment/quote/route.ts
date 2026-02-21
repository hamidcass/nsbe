import { NextRequest, NextResponse } from "next/server";
import { getQuote } from "../../../../lib/xrpl/payment";
import type { PaymentProduct } from "../../../../types/payment";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const product = request.nextUrl.searchParams.get("product") as PaymentProduct | null;
  const network = (request.nextUrl.searchParams.get("network") ?? "testnet") as "testnet" | "mainnet";

  const validProducts: PaymentProduct[] = ["scan", "report", "remediation_credit"];
  if (!product || !validProducts.includes(product)) {
    return NextResponse.json(
      { error: "Invalid or missing product. Use: scan, report, remediation_credit" },
      { status: 400 }
    );
  }

  const quote = getQuote(product, network);
  return NextResponse.json(quote);
}
