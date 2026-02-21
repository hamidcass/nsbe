/**
 * Browser flow runner with screenshots. MVP: interface; use Playwright/Puppeteer + axe/pa11y.
 */

import type { AccessibilityIssue, ScanContext } from "../../types";
import type { BrowserFlowStep, BrowserScanResult } from "../../types/scan";

export interface BrowserFlowConfig {
  baseUrl: string;
  steps: Array<{
    name: string;
    url?: string;
    action?: "navigate" | "click" | "type" | "wait";
    selector?: string;
    value?: string;
  }>;
  context: ScanContext;
}

export async function runBrowserFlow(
  jobId: string,
  config: BrowserFlowConfig
): Promise<BrowserScanResult> {
  const steps: BrowserFlowStep[] = config.steps.map((s) => ({
    name: s.name,
    url: s.url ?? config.baseUrl,
    action: s.action,
    screenshotPath: undefined,
    issues: [],
  }));

  const allIssues: AccessibilityIssue[] = [];

  return {
    jobId,
    steps,
    issues: allIssues,
    summary: {
      total: 0,
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0,
    },
  };
}
