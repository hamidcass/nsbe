import { NextResponse } from "next/server";
import { createRemediationPR } from "../../../lib/pr/create-remediation-pr";
import { getJobResult } from "../../../lib/storage/job-store";
import { suggestFixes } from "../../../lib/ai/suggest-fixes";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { jobId, repo, baseBranch = "main", changes } = body as {
      jobId?: string;
      repo?: string;
      baseBranch?: string;
      changes?: Array<{ path: string; content: string }>;
    };

    if (!jobId || !repo) {
      return NextResponse.json(
        { error: "Missing jobId or repo (owner/repo)" },
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

    const suggestions = await suggestFixes({ issues: result.issues });
    const branch = `a11y/remediation-${jobId.replace(/[^a-z0-9]/gi, "-")}`;

    const bodyText = [
      `## Accessibility Remediation`,
      `Job ID: ${jobId}`,
      ``,
      `### Summary`,
      `- **Total issues**: ${result.summary.total}`,
      `- Critical: ${result.summary.critical}, Serious: ${result.summary.serious}, Moderate: ${result.summary.moderate}, Minor: ${result.summary.minor}`,
      ``,
      `### Disclaimer`,
      `Human-in-the-loop. This PR provides suggested fixes for WCAG 2.1 / AODA context. Review before merging. Not legal compliance certification.`,
    ].join("\n");

    const prResult = await createRemediationPR({
      repo,
      branch,
      baseBranch,
      title: `[a11y] Remediation for scan ${jobId}`,
      body: bodyText,
      changes: changes ?? [],
      issues: result.issues,
      suggestions,
    });

    return NextResponse.json(prResult);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "PR creation failed" },
      { status: 500 }
    );
  }
}
