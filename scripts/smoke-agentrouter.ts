#!/usr/bin/env npx tsx
/** Fail-closed AgentRouter smoke. Never prints API keys. */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

import { getEnv, loadEnv } from "../src/server/env/loadEnv";
import { smokeAgentRouter } from "../src/server/llm/agentRouter";

function ensureTor(): void {
  const proxy = getEnv("AGENT_ROUTER_HTTP_PROXY") || getEnv("AGENTROUTER_HTTP_PROXY");
  if (!proxy.includes("9050")) return;
  try {
    execSync("curl -fsS --max-time 5 -x socks5h://127.0.0.1:9050 https://api.ipify.org", {
      stdio: "ignore",
    });
    return;
  } catch {
    /* start tor */
  }
  if (!existsSync("/usr/bin/tor") && !existsSync("/usr/sbin/tor")) {
    try {
      execSync("sudo apt-get update -qq && sudo apt-get install -y -qq tor", { stdio: "ignore" });
    } catch {
      console.log(JSON.stringify({ ok: false, triage: "B", message: "tor_install_failed" }));
      process.exit(1);
    }
  }
  try {
    execSync("sudo service tor start || true", { stdio: "ignore" });
  } catch {
    /* ignore */
  }
  for (let i = 0; i < 30; i++) {
    try {
      execSync("curl -fsS --max-time 5 -x socks5h://127.0.0.1:9050 https://api.ipify.org", {
        stdio: "ignore",
      });
      return;
    } catch {
      execSync("sleep 1");
    }
  }
  console.log(JSON.stringify({ ok: false, triage: "B", message: "tor_not_bootstrapped" }));
  process.exit(1);
}

async function main() {
  loadEnv({ force: true });
  ensureTor();
  const result = await smokeAgentRouter();
  if (result.ok) {
    console.log(JSON.stringify({ ok: true, model: result.model, status: result.status }));
    process.exit(0);
  }
  console.log(
    JSON.stringify({
      ok: false,
      triage: result.triage,
      status: result.status ?? null,
      message: result.message,
    }),
  );
  process.exit(1);
}

main().catch((err) => {
  console.log(
    JSON.stringify({
      ok: false,
      triage: "UNKNOWN",
      message: err instanceof Error ? err.message : String(err),
    }),
  );
  process.exit(1);
});
