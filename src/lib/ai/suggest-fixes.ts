/**
 * AI fix suggestions for accessibility issues. Human-in-the-loop.
 * Uses OpenAI when OPENAI_API_KEY is set; otherwise returns rule-based suggestions.
 */

import OpenAI from "openai";
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

function getFallbackSuggestion(issue: AccessibilityIssue): FixSuggestion {
  return {
    issueId: issue.id,
    suggestedCode: issue.suggestedFix,
    suggestedDescription: issue.suggestedFix
      ? `Apply: ${issue.suggestedFix}`
      : "Review and add alternative text or ARIA attributes as appropriate for WCAG 2.1 Level AA.",
    confidence: 0.7,
  };
}

export async function suggestFixes(
  options: SuggestFixesOptions
): Promise<FixSuggestion[]> {
  const { issues, context = {} } = options;
  if (issues.length === 0) return [];

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return issues.map(getFallbackSuggestion);
  }

  try {
    const openai = new OpenAI({ apiKey });
    const suggestions: FixSuggestion[] = [];

    for (const issue of issues) {
      const prompt = `You are an accessibility expert helping fix WCAG 2.1 / AODA compliance issues.

Issue:
- Rule: ${issue.title}
- Description: ${issue.description}
- Impact: ${issue.impact}
${issue.selector ? `- Selector: ${issue.selector}` : ""}
${issue.snippet ? `- Code snippet: ${issue.snippet.substring(0, 500)}` : ""}
${issue.filePath ? `- File: ${issue.filePath}${issue.line ? ` line ${issue.line}` : ""}` : ""}

Provide a concise, actionable fix. Format your response as JSON:
{"description": "1-2 sentence fix instruction", "code": "optional code fix if applicable", "confidence": 0.0-1.0}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
      });

      const content = completion.choices[0]?.message?.content?.trim() ?? "";
      let parsed: { description?: string; code?: string; confidence?: number };
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      } catch {
        parsed = { description: content || "Review and apply accessibility best practices." };
      }

      suggestions.push({
        issueId: issue.id,
        suggestedCode: parsed.code,
        suggestedDescription: parsed.description ?? getFallbackSuggestion(issue).suggestedDescription,
        confidence: parsed.confidence ?? 0.8,
      });
    }

    return suggestions;
  } catch (e) {
    console.error("OpenAI suggestFixes error:", e);
    return issues.map(getFallbackSuggestion);
  }
}
