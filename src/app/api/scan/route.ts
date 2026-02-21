import { NextResponse } from "next/server";
import { runCodeScan } from "../../../lib/scanner/code-scanner";
import { runBrowserFlow } from "../../../lib/browser/browser-runner";
import { saveJobResult } from "../../../lib/storage/job-store";
import type { ScanType, ScanContext } from "../../../types";
import type { FullScanResult } from "../../../types/scan";

export const dynamic = "force-dynamic";

const defaultContext: ScanContext = {
  conformanceLevel: "AA",
  aodaContext: true,
  wcagVersion: "2.1",
};

function mergeSummaries(
  a: { total: number; critical: number; serious: number; moderate: number; minor: number },
  b: { total: number; critical: number; serious: number; moderate: number; minor: number }
) {
  return {
    total: a.total + b.total,
    critical: a.critical + b.critical,
    serious: a.serious + b.serious,
    moderate: a.moderate + b.moderate,
    minor: a.minor + b.minor,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { target, ref, type = "code", baseUrl, steps = [] } = body as {
      target?: string;
      ref?: string;
      type?: ScanType;
      baseUrl?: string;
      steps?: Array<{ name: string; url?: string; action?: string; selector?: string; value?: string }>;
    };

    if (!target && !baseUrl) {
      return NextResponse.json(
        { error: "Missing target (path/URL) or baseUrl for browser scan" },
        { status: 400 }
      );
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    if (type === "browser") {
      const url = baseUrl ?? target;
      if (!url || !url.startsWith("http")) {
        return NextResponse.json(
          { error: "Browser scan requires baseUrl (e.g. http://localhost:3000)" },
          { status: 400 }
        );
      }
      const browserConfig = {
        baseUrl: url,
        steps: steps.length > 0
          ? steps.map((s) => ({ ...s, action: (s.action ?? "navigate") as "navigate" | "click" | "type" | "wait" }))
          : [{ name: "Home", action: "navigate" as const }],
        context: defaultContext,
      };
      const browserResult = await runBrowserFlow(jobId, browserConfig);
      const fullResult: FullScanResult = {
        jobId,
        codeScan: { jobId, issues: [], filesScanned: [], summary: { total: 0, critical: 0, serious: 0, moderate: 0, minor: 0 } },
        browserScan: browserResult,
        issues: browserResult.issues,
        summary: browserResult.summary,
      };
      saveJobResult(fullResult);
      return NextResponse.json({ jobId, status: "completed", type: "browser", result: browserResult });
    }

    if (type === "code" || type === "full") {
      const codeResult = target
        ? await runCodeScan(jobId, { target, ref, context: defaultContext })
        : { jobId, issues: [], filesScanned: [], summary: { total: 0, critical: 0, serious: 0, moderate: 0, minor: 0 } };

      let browserResult;
      if (type === "full" && baseUrl && baseUrl.startsWith("http")) {
        const browserConfig = {
          baseUrl,
          steps: steps.length > 0
            ? steps.map((s) => ({ ...s, action: (s.action ?? "navigate") as "navigate" | "click" | "type" | "wait" }))
            : [{ name: "Home", action: "navigate" as const }],
          context: defaultContext,
        };
        browserResult = await runBrowserFlow(jobId, browserConfig);
      }

      const allIssues = [...codeResult.issues, ...(browserResult?.issues ?? [])];
      const summary = browserResult
        ? mergeSummaries(codeResult.summary, browserResult.summary)
        : codeResult.summary;

      const fullResult: FullScanResult = {
        jobId,
        codeScan: codeResult,
        browserScan: browserResult,
        issues: allIssues,
        summary,
      };
      saveJobResult(fullResult);

      return NextResponse.json({
        jobId,
        status: "completed",
        type,
        result: fullResult,
      });
    }

    return NextResponse.json({ error: "Invalid type", jobId }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Scan failed" },
      { status: 500 }
    );
  }
}
