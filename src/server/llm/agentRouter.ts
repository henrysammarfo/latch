/**
 * AgentRouter client — Cursor Cloud fail-closed path.
 * - Base ONLY https://agentrouter.org/v1 (never co.agentrouter.org)
 * - Force-load .env so stale process env cannot win
 * - Tor socks5h://127.0.0.1:9050 via node-fetch + socks-proxy-agent
 *   (Bun/undici native fetch ignores SOCKS agents → WAF HTML)
 * Never logs API keys.
 */
import fetch from "node-fetch";
import { SocksProxyAgent } from "socks-proxy-agent";
import { HttpsProxyAgent } from "https-proxy-agent";

import { firstEnv, getEnv, loadEnv } from "../env/loadEnv";

export type SmokeOk = { ok: true; model: string; status: number };
export type SmokeFail = {
  ok: false;
  triage: "A" | "B" | "C" | "D" | "E" | "UNKNOWN";
  status?: number;
  message: string;
};

function apiKey(): string {
  // override:true — always re-read gitignored .env so stale process env cannot win
  loadEnv({ force: true });
  const k = firstEnv("AGENTROUTER_API_KEY", "AGENT_ROUTER_API_KEY");
  if (!k) throw new Error("LATCH_ENV_MISSING: AGENTROUTER_API_KEY");
  return k;
}

export function agentRouterBaseUrl(): string {
  loadEnv({ force: true });
  const base =
    firstEnv("AGENTROUTER_BASE_URL", "AGENT_ROUTER_BASE_URL") ?? "https://agentrouter.org/v1";
  if (base.includes("co.agentrouter.org")) {
    throw new Error("LATCH_AGENTROUTER_FORBIDDEN_HOST: use https://agentrouter.org/v1 only");
  }
  return base.replace(/\/$/, "");
}

function modelName(): string {
  return getEnv("AGENTROUTER_MODEL", "deepseek-v4-flash");
}

function proxyUrl(): string | undefined {
  return firstEnv("AGENT_ROUTER_HTTP_PROXY", "AGENTROUTER_HTTP_PROXY", "HTTPS_PROXY");
}

function buildAgent(): SocksProxyAgent | HttpsProxyAgent<string> | undefined {
  const p = proxyUrl();
  if (!p) return undefined;
  if (p.startsWith("socks")) return new SocksProxyAgent(p);
  return new HttpsProxyAgent(p);
}

function wireHeaders(key: string): Record<string, string> {
  return {
    Authorization: `Bearer ${key}`,
    "x-api-key": key,
    "Content-Type": "application/json",
    "User-Agent": "claude-cli/1.0.0 (LATCH; fail-closed)",
    "anthropic-version": "2023-06-01",
    "x-app": "latch-empire",
    "x-stainless-lang": "js",
    "x-stainless-package-version": "1.0.0",
    "x-stainless-os": "Linux",
    "x-stainless-arch": "x64",
    "x-stainless-runtime": "node",
    "x-stainless-runtime-version": process.version,
  };
}

async function agentFetch(path: string, init?: { method?: string; body?: string }): Promise<{
  status: number;
  text: string;
}> {
  const key = apiKey();
  const url = `${agentRouterBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const agent = buildAgent();
  const res = await fetch(url, {
    method: init?.method ?? "GET",
    body: init?.body,
    headers: wireHeaders(key),
    agent: agent as never,
  });
  const text = await res.text();
  return { status: res.status, text };
}

function triage(status: number, body: string): SmokeFail["triage"] {
  const lower = body.toLowerCase();
  if (lower.includes("aliyun_waf") || lower.includes("<!doctype html>")) return "A";
  if (
    lower.includes("unauthorized_client") ||
    lower.includes("unauthorized client") ||
    (status === 401 && lower.includes("discord.gg"))
  ) {
    return "C";
  }
  if (status === 401 || lower.includes("invalid api key") || lower.includes("unauthenticated")) {
    return "D";
  }
  if (status === 0) return "B";
  if (lower.includes("truncated") || body.trim() === "") return "E";
  return "UNKNOWN";
}

export async function smokeAgentRouter(): Promise<SmokeOk | SmokeFail> {
  loadEnv({ force: true });
  const model = modelName();
  try {
    const { status, text } = await agentFetch("/chat/completions", {
      method: "POST",
      body: JSON.stringify({
        model,
        max_tokens: 64,
        messages: [{ role: "user", content: 'Reply with exactly: {"pong":true}' }],
      }),
    });
    if (status < 200 || status >= 300) {
      return { ok: false, triage: triage(status, text), status, message: `HTTP ${status}` };
    }
    if (text.includes("aliyun_waf") || text.trim().startsWith("<!doctype")) {
      return { ok: false, triage: "A", status, message: "WAF HTML" };
    }
    try {
      JSON.parse(text);
    } catch {
      return { ok: false, triage: "E", status, message: "Non-JSON" };
    }
    return { ok: true, model, status };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const t: SmokeFail["triage"] =
      msg.includes("9050") || msg.toLowerCase().includes("socks") || msg.includes("ECONNREFUSED")
        ? "B"
        : "UNKNOWN";
    return { ok: false, triage: t, message: msg };
  }
}

/** Draft-only. Asserts MUST NOT depend on this string. Fail-closed. */
export async function draftRiskReason(input: {
  accountName: string;
  arrAtRiskUsd: number;
  signalSummary: string;
}): Promise<string> {
  const model = modelName();
  const { status, text } = await agentFetch("/chat/completions", {
    method: "POST",
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      messages: [
        {
          role: "system",
          content: "Draft a short CSM-facing churn risk reason for LATCH. Plain text only.",
        },
        {
          role: "user",
          content: `Account: ${input.accountName}\nARR at risk USD: ${input.arrAtRiskUsd}\nSignal: ${input.signalSummary}\nWrite 2 sentences.`,
        },
      ],
    }),
  });
  if (status < 200 || status >= 300) {
    throw new Error(`LATCH_LLM_FAIL triage=${triage(status, text)} status=${status}`);
  }
  if (text.includes("aliyun_waf") || text.trim().startsWith("<!doctype")) {
    throw new Error("LATCH_LLM_FAIL triage=A — start Tor SOCKS");
  }
  const parsed = JSON.parse(text) as { choices?: Array<{ message?: { content?: string } }> };
  const content = parsed.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("LATCH_LLM_FAIL triage=E empty");
  return content;
}
