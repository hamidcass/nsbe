/**
 * Create a pull request with remediation changes and before/after evidence.
 */

import type { AccessibilityIssue } from "../../types";
import type { FixSuggestion } from "../ai/suggest-fixes";

export interface RemediationPRParams {
  /** Repo in form owner/repo or full URL */
  repo: string;
  /** Branch to create (e.g. a11y/remediation-2024-01) */
  branch: string;
  /** Base branch (e.g. main) */
  baseBranch: string;
  title: string;
  body: string;
  /** Files to patch: path -> new content */
  changes: Array<{
    path: string;
    content: string;
    /** Optional before screenshot path for evidence */
    evidenceBefore?: string;
    evidenceAfter?: string;
  }>;
  issues: AccessibilityIssue[];
  suggestions: FixSuggestion[];
}

export interface RemediationPRResult {
  prUrl: string;
  branch: string;
  commitSha?: string;
}

/**
 * Create a PR with remediation patches and evidence in the description.
 * MVP: stub; implement with Octokit (GitHub) or GitLab API.
 */
export async function createRemediationPR(
  params: RemediationPRParams
): Promise<RemediationPRResult> {
  // TODO: clone repo, apply changes, push branch, open PR with body containing
  // before/after screenshots (e.g. uploaded to storage or inline links)
  throw new Error(
    "createRemediationPR not implemented. Wire to GitHub/GitLab API and apply changes."
  );
}
