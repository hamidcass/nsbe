/**
 * AI fix suggestions for accessibility issues. Human-in-the-loop.
 */

import type { AccessibilityIssue } from "../../types";

export interface FixSuggestion {
  issueId: string;
  suggestedCode?: string;
  suggestedDescription: string;
  confidence?: number;
  alternatives?: string[];
}

export interface SuggestFixesOptions {
  issues: AccessibilityIssue[];
  context?: Record<string, string>;
}

export async function suggestFixes(
  options: SuggestFixesOptions
): Promise<FixSuggestion[]> {
  const suggestions: FixSuggestion[] = options.issues.map((issue) => ({
    issueId: issue.id,
    suggestedCode: issue.suggestedFix,
    suggestedDescription: issue.suggestedFix
      ? `Apply: ${issue.suggestedFix}`
      : "Review and add alternative text or ARIA as appropriate.",
    confidence: 0.8,
  }));

  return suggestions;
}
