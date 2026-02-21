/**
 * Job storage for scan results. MVP: in-memory + optional file backup.
 * Swap for Redis/DB in production.
 */

import type { FullScanResult } from "../../types/scan";

const store = new Map<string, FullScanResult>();

/** TTL in ms (1 hour). Stale entries can be purged. */
const TTL_MS = 60 * 60 * 1000;
const timestamps = new Map<string, number>();

export function saveJobResult(result: FullScanResult): void {
  store.set(result.jobId, result);
  timestamps.set(result.jobId, Date.now());
}

export function getJobResult(jobId: string): FullScanResult | null {
  const result = store.get(jobId);
  if (!result) return null;

  const ts = timestamps.get(jobId);
  if (ts && Date.now() - ts > TTL_MS) {
    store.delete(jobId);
    timestamps.delete(jobId);
    return null;
  }

  return result;
}

export function hasJob(jobId: string): boolean {
  return getJobResult(jobId) !== null;
}
