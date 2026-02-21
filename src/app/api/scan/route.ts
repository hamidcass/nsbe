import { NextResponse } from "next/server";
import { runCodeScan } from "../../../lib/scanner/code-scanner";
import { saveJobResult } from "../../../lib/storage/job-store";
import type { ScanType, ScanContext } from "../../../types";
import type { FullScanResult } from "../../../types/scan";

export const dynamic = "force-dynamic";

const defaultContext: ScanContext = {
  conformanceLevel: "AA",
  aodaContext: true,
  wcagVersion: "2.1",
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { target, ref, type = "code" } = body as {
      target?: string;
      ref?: string;
      type?: ScanType;
    };

    if (!target) {
      return NextResponse.json(
        { error: "Missing target (repo URL or path)" },
        { status: 400 }
      );
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    if (type === "code" || type === "full") {
      const codeResult = await runCodeScan(jobId, {
        target,
        ref,
        context: defaultContext,
      });

      const fullResult: FullScanResult = {
        jobId,
        codeScan: codeResult,
        issues: codeResult.issues,
        summary: codeResult.summary,
      };
      saveJobResult(fullResult);

      return NextResponse.json({
        jobId,
        status: "completed",
        type: "code",
        result: codeResult,
      });
    }

    return NextResponse.json({
      jobId,
      status: "pending",
      type,
      message: "Browser/full scan not yet implemented",
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Scan failed" },
      { status: 500 }
    );
  }
}
