import { NextRequest, NextResponse } from "next/server";
import { generateReport, reportToHtml } from "../../../lib/report/generate-report";
import { getJobResult } from "../../../lib/storage/job-store";

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

  const result = getJobResult(jobId);
  if (!result) {
    return NextResponse.json(
      { error: "Job not found or expired", jobId },
      { status: 404 }
    );
  }

  const report = generateReport({
    result,
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
