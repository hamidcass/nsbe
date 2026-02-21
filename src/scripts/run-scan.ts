/**
 * CLI entry to run a scan (e.g. for local or CI).
 * Usage: npm run scan -- --target ./my-app [--ref main] [--type code]
 */

import { runCodeScan } from "../lib/scanner/code-scanner";

async function main() {
  const args = process.argv.slice(2);
  const getArg = (name: string) => {
    const eq = args.find((a) => a.startsWith(`${name}=`));
    if (eq) return eq.split("=")[1];
    const i = args.indexOf(name);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const target = getArg("--target");
  const ref = getArg("--ref");
  const type = (getArg("--type") as "code" | "browser" | "full") ?? "code";

  if (!target) {
    console.error("Usage: npm run scan -- --target <path-or-url> [--ref main] [--type code|browser|full]");
    process.exit(1);
  }

  const jobId = `cli_${Date.now()}`;
  const result = await runCodeScan(jobId, {
    target,
    ref,
    context: { conformanceLevel: "AA", aodaContext: true, wcagVersion: "2.1" },
  });

  console.log(JSON.stringify({ jobId, type, result }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
