/**
 * Generate accessibility report (JSON/HTML) with disclaimer.
 */

import type { AccessibilityReport, ReportFormat } from "../../types";
import type { FullScanResult } from "../../types/scan";
import { DEFAULT_DISCLAIMER } from "../../types/report";

export interface GenerateReportOptions {
  result: FullScanResult;
  format: ReportFormat;
  title?: string;
}

export function generateReport(options: GenerateReportOptions): AccessibilityReport {
  const { result, title = "Accessibility Scan Report" } = options;

  const report: AccessibilityReport = {
    id: `report-${result.jobId}`,
    jobId: result.jobId,
    title,
    scannedAt: new Date().toISOString(),
    context: { conformanceLevel: "AA", aodaContext: true, wcagVersion: "2.1" },
    summary: result.summary,
    issues: result.issues,
    disclaimer: DEFAULT_DISCLAIMER,
  };

  return report;
}

export function reportToJson(report: AccessibilityReport): string {
  return JSON.stringify(report, null, 2);
}

export function reportToHtml(report: AccessibilityReport): string {
  const issuesList = report.issues
    .map(
      (i) =>
        `<li><strong>${i.title}</strong> [${i.impact}] ${i.description}${i.suggestedFix ? ` — Fix: ${i.suggestedFix}` : ""}</li>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><title>${report.title}</title></head>
<body>
  <h1>${report.title}</h1>
  <p>Scanned: ${report.scannedAt}</p>
  <p><strong>Summary:</strong> ${report.summary.total} issues (Critical: ${report.summary.critical}, Serious: ${report.summary.serious}, Moderate: ${report.summary.moderate}, Minor: ${report.summary.minor})</p>
  <p class="disclaimer"><em>${report.disclaimer}</em></p>
  <h2>Issues</h2>
  <ul>${issuesList}</ul>
</body>
</html>`;
}
