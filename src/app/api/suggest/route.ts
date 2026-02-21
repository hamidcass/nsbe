import { NextResponse } from "next/server";
import { suggestFixes } from "../../../lib/ai/suggest-fixes";
import { getJobResult } from "../../../lib/storage/job-store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { jobId } = body as { jobId?: string };

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

    const suggestions = await suggestFixes({
      issues: result.issues,
      context: { conformanceLevel: "AA", wcagVersion: "2.1" },
    });

    return NextResponse.json({ jobId, suggestions });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Suggest failed" },
      { status: 500 }
    );
  }
}
