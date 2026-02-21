import { NextResponse } from "next/server";
import { verifyPayment } from "../../../../lib/xrpl/payment";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { intentId, destinationAddress, amountDrops, network = "testnet" } = body as {
      intentId?: string;
      destinationAddress?: string;
      amountDrops?: string;
      network?: "testnet" | "mainnet";
    };

    if (!intentId || !destinationAddress || !amountDrops) {
      return NextResponse.json(
        { error: "Missing intentId, destinationAddress, or amountDrops" },
        { status: 400 }
      );
    }

    const result = await verifyPayment(
      intentId,
      destinationAddress,
      amountDrops,
      network
    );

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Verification failed" },
      { status: 500 }
    );
  }
}
