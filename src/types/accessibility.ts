/**
 * Accessibility types for WCAG 2.x and AODA/IASR (Ontario) context.
 * Human-in-the-loop: these support remediation guidance, not legal certification.
 */

export type ConformanceLevel = "A" | "AA" | "AAA";

/** WCAG 2.1 principle (POUR) */
export type Principle = "perceivable" | "operable" | "understandable" | "robust";

/** Common WCAG success criterion ID (e.g. 1.1.1, 2.1.1) */
export interface WCAGCriterion {
  id: string;
  level: ConformanceLevel;
  principle: Principle;
  title: string;
  description?: string;
}

/** AODA IASR references WCAG 2.0 Level AA; we track for Ontario context */
export const AODA_DEFAULT_LEVEL: ConformanceLevel = "AA";

export interface AccessibilityIssue {
  id: string;
  /** WCAG criterion ID when applicable */
  criterionId?: string;
  principle?: Principle;
  level?: ConformanceLevel;
  /** Short label for the issue */
  title: string;
  description: string;
  /** Impact: critical, serious, moderate, minor */
  impact: "critical" | "serious" | "moderate" | "minor";
  /** Selector or location in code/page */
  selector?: string;
  /** Snippet of source or DOM */
  snippet?: string;
  /** Path in repo if from code scan */
  filePath?: string;
  line?: number;
  column?: number;
  /** Suggested fix (from AI or rules) */
  suggestedFix?: string;
  /** Help URL (e.g. W3C, AODA) */
  helpUrl?: string;
  /** Evidence: screenshot path, diff, etc. */
  evidence?: IssueEvidence;
}

export interface IssueEvidence {
  screenshotBefore?: string;
  screenshotAfter?: string;
  diff?: string;
  codeSnippet?: string;
}

export interface ScanContext {
  /** Target conformance (AODA typically AA) */
  conformanceLevel: ConformanceLevel;
  /** Ontario/AODA-specific checks when true */
  aodaContext?: boolean;
  /** WCAG version (e.g. 2.1) */
  wcagVersion?: string;
}
