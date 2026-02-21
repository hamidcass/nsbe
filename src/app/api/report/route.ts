import { NextRequest, NextResponse } from "next/server";
import { generateReport, reportToHtml } from "../../../lib/report/generate-report";
import type { FullScanResult } from "../../../types/scan";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get("jobId");
  const format = (request.nextUrl.searchParams.get("format") ?? "json") as "json" | "html";

  if (!jobId) {
    return NextResponse.json(
      { error: "Missing jobId" },
      { status: 400 }
    );
  }

  const stubResult: FullScanResult = {
    jobId,
    codeScan: {
      jobId,
      issues: [],
      filesScanned: [],
      summary: { total: 0, critical: 0, serious: 0, moderate: 0, minor: 0 },
    },
    issues: [],
    summary: { total: 0, critical: 0, serious: 0, moderate: 0, minor: 0 },
  };

  const report = generateReport({
    result: stubResult,
    format,
    title: "Accessibility Scan Report",
  });

  if (format === "html") {
    return new NextResponse(reportToHtml(report), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  return NextResponse.json(report);
}
