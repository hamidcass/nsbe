/**
 * Create a pull request with remediation changes and before/after evidence.
 * Uses Octokit (GitHub API).
 */

import { Octokit } from "@octokit/rest";
import type { AccessibilityIssue } from "../../types";
import type { FixSuggestion } from "../ai/suggest-fixes";

export interface RemediationPRParams {
  /** Repo in form owner/repo */
  repo: string;
  branch: string;
  baseBranch: string;
  title: string;
  body: string;
  changes: Array<{
    path: string;
    content: string;
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

function parseRepo(repo: string): { owner: string; repo: string } {
  const cleaned = repo.replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "").trim();
  const [owner, rep] = cleaned.split("/");
  return { owner: owner ?? "", repo: rep ?? cleaned };
}

export async function createRemediationPR(
  params: RemediationPRParams
): Promise<RemediationPRResult> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN is required for PR creation. Set it in .env");
  }

  const { owner, repo } = parseRepo(params.repo);
  if (!owner || !repo) {
    throw new Error(`Invalid repo: ${params.repo}. Use owner/repo format.`);
  }

  const octokit = new Octokit({ auth: token });

  const ref = await octokit.rest.git.getRef({
    owner,
    repo,
    ref: `heads/${params.baseBranch}`,
  });
  const baseSha = ref.data.object.sha;

  await octokit.rest.git.createRef({
    owner,
    repo,
    ref: `refs/heads/${params.branch}`,
    sha: baseSha,
  });

  let treeSha = baseSha;
  const tree: { path: string; mode: "100644"; type: "blob"; content: string }[] = [];

  for (const c of params.changes) {
    const blob = await octokit.rest.git.createBlob({
      owner,
      repo,
      content: Buffer.from(c.content, "utf8").toString("base64"),
      encoding: "base64",
    });
    tree.push({ path: c.path, mode: "100644", type: "blob", content: blob.data.sha });
  }

  if (tree.length > 0) {
    const treeRes = await octokit.rest.git.createTree({
      owner,
      repo,
      tree: tree.map((t) => ({ path: t.path, mode: t.mode, type: t.type, sha: t.content })),
      base_tree: baseSha,
    });
    treeSha = treeRes.data.sha;
  }

  const commit = await octokit.rest.git.createCommit({
    owner,
    repo,
    message: params.title,
    tree: treeSha,
    parents: [baseSha],
  });

  await octokit.rest.git.updateRef({
    owner,
    repo,
    ref: `heads/${params.branch}`,
    sha: commit.data.sha,
  });

  const pr = await octokit.rest.pulls.create({
    owner,
    repo,
    title: params.title,
    body: params.body,
    head: params.branch,
    base: params.baseBranch,
  });

  return {
    prUrl: pr.data.html_url ?? "",
    branch: params.branch,
    commitSha: commit.data.sha,
  };
}
