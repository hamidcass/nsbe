/**
 * Browser flow runner with Playwright + axe-core.
 * Runs user flows, captures screenshots, and runs accessibility audits.
 */

import path from "path";
import fs from "fs";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import type { AccessibilityIssue, ScanContext } from "../../types";
import type {
  BrowserFlowStep,
  BrowserScanResult,
  ScanSummary,
} from "../../types/scan";
import { summarizeIssues } from "../scanner/code-scanner";

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

function axeImpactToOurs(
  impact: string | null | undefined
): "critical" | "serious" | "moderate" | "minor" {
  switch (impact) {
    case "critical":
      return "critical";
    case "serious":
      return "serious";
    case "moderate":
      return "moderate";
    default:
      return "minor";
  }
}

function axeResultsToIssues(
  results: Awaited<ReturnType<AxeBuilder["analyze"]>>,
  stepUrl: string,
  stepName: string
): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  const violations = results.violations ?? [];
  for (const v of violations) {
    for (const node of v.nodes ?? []) {
      issues.push({
        id: `axe_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        criterionId: (v as { wcag21?: Array<{ id: string }> }).wcag21?.map((w) => w.id).join(", "),
        title: v.id,
        description: v.description,
        impact: axeImpactToOurs(v.impact),
        selector: Array.isArray(node.target) ? (node.target[0] as string) : undefined,
        snippet: node.html,
        suggestedFix: v.help,
        helpUrl: v.helpUrl,
      });
    }
  }
  return issues;
}

export async function runBrowserFlow(
  jobId: string,
  config: BrowserFlowConfig
): Promise<BrowserScanResult> {
  const screenshotsDir = path.join(process.cwd(), "public", "screenshots", jobId);
  fs.mkdirSync(screenshotsDir, { recursive: true });

  const steps: BrowserFlowStep[] = [];
  const allIssues: AccessibilityIssue[] = [];
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    });
    const page = await context.newPage();

    for (let i = 0; i < config.steps.length; i++) {
      const s = config.steps[i];
      const stepUrl = s.url ?? config.baseUrl;
      const stepIssues: AccessibilityIssue[] = [];

      if (s.action === "navigate" || !s.action) {
        await page.goto(stepUrl, { waitUntil: "networkidle", timeout: 15000 });
      } else if (s.action === "click" && s.selector) {
        await page.click(s.selector, { timeout: 5000 });
        await page.waitForTimeout(500);
      } else if (s.action === "type" && s.selector) {
        await page.fill(s.selector, s.value ?? "");
        await page.waitForTimeout(300);
      } else if (s.action === "wait") {
        await page.waitForTimeout(2000);
      }

      const axeBuilder = new AxeBuilder({ page });
      const axeResults = await axeBuilder.analyze();
      const issues = axeResultsToIssues(axeResults, stepUrl, s.name);
      stepIssues.push(...issues);
      allIssues.push(...issues);

      const screenshotPath = path.join(
        screenshotsDir,
        `step_${i + 1}_${s.name.replace(/\W/g, "_")}.png`
      );
      await page.screenshot({ path: screenshotPath });
      const relPath = `/screenshots/${jobId}/${path.basename(screenshotPath)}`;

      steps.push({
        name: s.name,
        url: stepUrl,
        action: s.action,
        screenshotPath: relPath,
        issues: stepIssues,
      });
    }

    await context.close();
  } finally {
    if (browser) await browser.close();
  }

  const summary = summarizeIssues(allIssues);
  return {
    jobId,
    steps,
    issues: allIssues,
    summary,
  };
}
