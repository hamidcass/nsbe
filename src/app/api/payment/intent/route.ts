import { NextResponse } from "next/server";
import { createPaymentIntent } from "../../../../lib/xrpl/payment";
import type { PaymentProduct } from "../../../../types/payment";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      product,
      destinationAddress,
      destinationTag,
      network = "testnet",
    } = body as {
      product?: PaymentProduct;
      destinationAddress?: string;
      destinationTag?: number;
      network?: "testnet" | "mainnet";
    };

    const validProducts: PaymentProduct[] = ["scan", "report", "remediation_credit"];
    if (!product || !validProducts.includes(product)) {
      return NextResponse.json(
        { error: "Invalid or missing product" },
        { status: 400 }
      );
    }

    if (!destinationAddress || typeof destinationAddress !== "string") {
      return NextResponse.json(
        { error: "Missing destinationAddress" },
        { status: 400 }
      );
    }

    const intent = createPaymentIntent(
      product,
      destinationAddress,
      destinationTag,
      network
    );

    return NextResponse.json(intent);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create intent" },
      { status: 500 }
    );
  }
}
