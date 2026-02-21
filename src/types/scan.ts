/**
 * Scan job and result types for code + browser flows.
 */

import type { AccessibilityIssue, ScanContext } from "./accessibility";

export type ScanType = "code" | "browser" | "full";

export type ScanStatus = "pending" | "running" | "completed" | "failed";

export interface ScanJob {
  id: string;
  type: ScanType;
  status: ScanStatus;
  /** Repo URL or local path */
  target: string;
  /** Branch or ref to scan */
  ref?: string;
  context: ScanContext;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface CodeScanResult {
  jobId: string;
  issues: AccessibilityIssue[];
  /** Files touched */
  filesScanned: string[];
  /** Summary counts by impact */
  summary: ScanSummary;
}

export interface BrowserFlowStep {
  name: string;
  url: string;
  action?: string;
  screenshotPath?: string;
  issues: AccessibilityIssue[];
}

export interface BrowserScanResult {
  jobId: string;
  steps: BrowserFlowStep[];
  issues: AccessibilityIssue[];
  summary: ScanSummary;
}

export interface ScanSummary {
  total: number;
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
}

export interface FullScanResult {
  jobId: string;
  codeScan: CodeScanResult;
  browserScan?: BrowserScanResult;
  issues: AccessibilityIssue[];
  summary: ScanSummary;
}
