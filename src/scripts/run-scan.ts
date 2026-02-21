/**
 * CLI entry to run a scan (e.g. for local or CI).
 * Usage: npm run scan -- --target ./my-app [--ref main] [--type code]
 */

import { runCodeScan } from "../lib/scanner/code-scanner";

async function main() {
  const args = process.argv.slice(2);
  const target = args.find((a) => a.startsWith("--target="))?.split("=")[1] ?? args[args.indexOf("--target") + 1];
  const ref = args.find((a) => a.startsWith("--ref="))?.split("=")[1] ?? args[args.indexOf("--ref") + 1];
  const type = (args.find((a) => a.startsWith("--type="))?.split("=")[1] ?? args[args.indexOf("--type") + 1]) ?? "code";

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
