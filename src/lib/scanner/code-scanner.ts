/**
 * Code scanner: analyzes codebase for accessibility issues.
 * MVP: interface + placeholder; integrate axe-core, eslint-plugin-jsx-a11y, or custom rules.
 */

import type { AccessibilityIssue, ScanContext } from "../../types";
import type { CodeScanResult } from "../../types/scan";

export interface CodeScannerOptions {
  target: string;
  ref?: string;
  context: ScanContext;
  include?: string[];
  exclude?: string[];
}

export async function runCodeScan(
  jobId: string,
  options: CodeScannerOptions
): Promise<CodeScanResult> {
  const issues: AccessibilityIssue[] = [];
  const filesScanned: string[] = [];

  return {
    jobId,
    issues,
    filesScanned,
    summary: {
      total: 0,
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0,
    },
  };
}

export function summarizeIssues(issues: AccessibilityIssue[]): CodeScanResult["summary"] {
  return {
    total: issues.length,
    critical: issues.filter((i) => i.impact === "critical").length,
    serious: issues.filter((i) => i.impact === "serious").length,
    moderate: issues.filter((i) => i.impact === "moderate").length,
    minor: issues.filter((i) => i.impact === "minor").length,
  };
}
