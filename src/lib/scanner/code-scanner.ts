/**
 * Code scanner: analyzes codebase for accessibility issues.
 * Uses eslint-plugin-jsx-a11y for static analysis of JSX/TSX.
 */

import path from "path";
import fs from "fs";
import { ESLint } from "eslint";
import type { AccessibilityIssue, ScanContext } from "../../types";
import type { CodeScanResult } from "../../types/scan";

export interface CodeScannerOptions {
  target: string;
  ref?: string;
  context: ScanContext;
  include?: string[];
  exclude?: string[];
}

/** Map ESLint severity to our impact levels. */
function severityToImpact(
  severity: number
): "critical" | "serious" | "moderate" | "minor" {
  if (severity === 2) return "serious"; // error
  return "moderate"; // warning
}

/** Map jsx-a11y rule IDs to WCAG criterion where known. */
const RULE_TO_CRITERION: Record<string, string> = {
  "alt-text": "1.1.1",
  "anchor-has-content": "2.4.4",
  "aria-activedescendant-has-tabindex": "2.1.1",
  "aria-role": "4.1.2",
  "button-has-type": "3.2.2",
  "heading-has-content": "1.3.1",
  "html-has-lang": "3.1.1",
  "iframe-has-title": "2.4.1",
  "img-redundant-alt": "1.1.1",
  "label-has-associated-control": "3.3.2",
  "media-has-caption": "1.2.2",
  "no-autofocus": "2.1.1",
  "no-redundant-roles": "4.1.2",
  "role-has-required-aria-props": "4.1.2",
  "tabindex-no-positive": "2.1.1",
};

export async function runCodeScan(
  jobId: string,
  options: CodeScannerOptions
): Promise<CodeScanResult> {
  const { target, context } = options;

  // Resolve target path (must be local for code scan)
  const isUrl =
    target.startsWith("http://") ||
    target.startsWith("https://") ||
    target.startsWith("git@") ||
    target.startsWith("git://");
  if (isUrl) {
    return {
      jobId,
      issues: [],
      filesScanned: [],
      summary: { total: 0, critical: 0, serious: 0, moderate: 0, minor: 0 },
    };
  }

  const resolvedPath = path.resolve(process.cwd(), target);
  if (!fs.existsSync(resolvedPath)) {
    return {
      jobId,
      issues: [],
      filesScanned: [],
      summary: { total: 0, critical: 0, serious: 0, moderate: 0, minor: 0 },
    };
  }

  const stat = fs.statSync(resolvedPath);
  const scanDir = stat.isDirectory() ? resolvedPath : path.dirname(resolvedPath);
  const pattern = stat.isFile()
    ? resolvedPath
    : `${scanDir}/**/*.{tsx,jsx,ts,js}`;

  const configPath = path.resolve(process.cwd(), "eslint.scanner.config.js");
  const eslint = new ESLint({
    overrideConfigFile: configPath,
  });

  const results = await eslint.lintFiles([pattern]);
  const issues: AccessibilityIssue[] = [];
  const filesScanned: string[] = [];

  for (const result of results) {
    if (result.filePath) {
      const relPath = path.relative(process.cwd(), result.filePath);
      if (!filesScanned.includes(relPath)) filesScanned.push(relPath);
    }
    for (const msg of result.messages) {
      if (msg.ruleId?.startsWith("jsx-a11y/")) {
        const impact = severityToImpact(msg.severity);
        const criterionId = RULE_TO_CRITERION[msg.ruleId.replace("jsx-a11y/", "")];
        issues.push({
          id: `issue_${jobId}_${issues.length}_${Math.random().toString(36).slice(2, 9)}`,
          criterionId,
          title: msg.ruleId ?? "Accessibility issue",
          description: msg.message,
          impact,
          filePath: result.filePath
            ? path.relative(process.cwd(), result.filePath)
            : undefined,
          line: msg.line,
          column: msg.column,
          suggestedFix: msg.fix
            ? "See ESLint auto-fix or apply suggested change"
            : undefined,
          helpUrl: "https://github.com/jsx-eslint/eslint-plugin-jsx-a11y",
        });
      }
    }
  }

  const summary = summarizeIssues(issues);
  return {
    jobId,
    issues,
    filesScanned,
    summary,
  };
}

export function summarizeIssues(
  issues: AccessibilityIssue[]
): CodeScanResult["summary"] {
  return {
    total: issues.length,
    critical: issues.filter((i) => i.impact === "critical").length,
    serious: issues.filter((i) => i.impact === "serious").length,
    moderate: issues.filter((i) => i.impact === "moderate").length,
    minor: issues.filter((i) => i.impact === "minor").length,
  };
}
