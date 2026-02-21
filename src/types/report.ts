/**
 * Accessibility report and remediation evidence (before/after).
 */

import type { AccessibilityIssue, ScanContext } from "./accessibility";
import type { ScanSummary } from "./scan";

export type ReportFormat = "json" | "html" | "pdf";

export interface AccessibilityReport {
  id: string;
  jobId: string;
  title: string;
  /** When the scan was run */
  scannedAt: string;
  context: ScanContext;
  summary: ScanSummary;
  issues: AccessibilityIssue[];
  /** Disclaimer: human-in-the-loop, not legal compliance */
  disclaimer: string;
  /** Optional before/after evidence for remediations */
  evidence?: ReportEvidence[];
}

export interface ReportEvidence {
  issueId: string;
  beforeScreenshot?: string;
  afterScreenshot?: string;
  diff?: string;
  prUrl?: string;
}

export const DEFAULT_DISCLAIMER =
  "This report is for guidance only. It does not constitute legal advice or certification of AODA/WCAG compliance. Human review and testing are required.";
