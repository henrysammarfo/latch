#!/usr/bin/env npx tsx
import { loadEnv } from "../src/server/env/loadEnv";
import { runGoldens } from "../src/server/eval/runner";

async function main() {
  loadEnv({ force: true });
  const results = await runGoldens();
  const ok = results.every((r) => r.ok);
  console.log(JSON.stringify({ ok, results }, null, 2));
  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
