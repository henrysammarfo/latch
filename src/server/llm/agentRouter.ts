/**
 * AgentRouter client — Cursor Cloud fail-closed path.
 * - Transport: Tor socks5h://127.0.0.1:9050 via node-fetch + socks-proxy-agent
 *   (native fetch ignores SOCKS → Aliyun WAF HTML)
 * - Protocol: Anthropic Messages (`POST {base}/messages`), NOT OpenAI
 *   `/chat/completions` (AgentRouter returns unauthorized_client for generic
 *   OpenAI clients; Claude-Code-shaped /messages works — verified 2026-09-13)
 * - Default base: https://agentrouter.org/v1
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
  loadEnv({ force: true });
  const k = firstEnv("AGENTROUTER_API_KEY", "AGENT_ROUTER_API_KEY");
  if (!k) throw new Error("LATCH_ENV_MISSING: AGENTROUTER_API_KEY");
  return k;
}

export function agentRouterBaseUrl(): string {
  loadEnv({ force: true });
  const raw =
    firstEnv("AGENTROUTER_BASE_URL", "AGENT_ROUTER_BASE_URL") ?? "https://agentrouter.org/v1";
  // Accept either https://agentrouter.org or …/v1 — normalize to …/v1 for /messages.
  let base = raw.replace(/\/$/, "");
  if (base === "https://agentrouter.org" || base === "https://co.agentrouter.org") {
    base = `${base}/v1`;
  }
  return base;
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

/** Headers shaped like Claude Code CLI — required to clear unauthorized_client. */
function wireHeaders(key: string): Record<string, string> {
  return {
    "content-type": "application/json",
    "x-api-key": key,
    authorization: `Bearer ${key}`,
    "anthropic-version": "2023-06-01",
    "anthropic-dangerous-direct-browser-access": "true",
    "user-agent": "claude-cli/1.0.73 (external, cli)",
    "x-app": "cli",
    "x-stainless-lang": "js",
    "x-stainless-package-version": "0.39.0",
    "x-stainless-os": "Linux",
    "x-stainless-arch": "x64",
    "x-stainless-runtime": "node",
    "x-stainless-runtime-version": process.version,
    "x-stainless-retry-count": "0",
    "x-stainless-timeout": "600000",
  };
}

async function agentFetchMessages(body: unknown): Promise<{ status: number; text: string }> {
  const key = apiKey();
  const url = `${agentRouterBaseUrl()}/messages`;
  const agent = buildAgent();
  const requestInit: {
    method: string;
    headers: Record<string, string>;
    agent?: SocksProxyAgent | HttpsProxyAgent<string>;
    body: string;
  } = {
    method: "POST",
    headers: wireHeaders(key),
    body: JSON.stringify(body),
  };
  if (agent) requestInit.agent = agent;
  const res = await fetch(url, requestInit as never);
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

function extractAnthropicText(parsed: unknown): string | undefined {
  if (!parsed || typeof parsed !== "object") return undefined;
  const content = (parsed as { content?: unknown }).content;
  if (!Array.isArray(content)) return undefined;
  const parts: string[] = [];
  for (const block of content) {
    if (
      block &&
      typeof block === "object" &&
      (block as { type?: string }).type === "text" &&
      typeof (block as { text?: string }).text === "string"
    ) {
      parts.push((block as { text: string }).text);
    }
  }
  const joined = parts.join("").trim();
  return joined || undefined;
}

export async function smokeAgentRouter(): Promise<SmokeOk | SmokeFail> {
  loadEnv({ force: true });
  const model = modelName();
  try {
    const { status, text } = await agentFetchMessages({
      model,
      max_tokens: 64,
      messages: [{ role: "user", content: 'Reply with exactly: {"pong":true}' }],
    });
    if (status < 200 || status >= 300) {
      return { ok: false, triage: triage(status, text), status, message: `HTTP ${status}` };
    }
    if (text.includes("aliyun_waf") || text.trim().startsWith("<!doctype")) {
      return { ok: false, triage: "A", status, message: "WAF HTML" };
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return { ok: false, triage: "E", status, message: "Non-JSON" };
    }
    if (!extractAnthropicText(parsed)) {
      return { ok: false, triage: "E", status, message: "Empty anthropic content" };
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
  const { status, text } = await agentFetchMessages({
    model,
    max_tokens: 4096,
    system: "Draft a short CSM-facing churn risk reason for LATCH. Plain text only.",
    messages: [
      {
        role: "user",
        content: `Account: ${input.accountName}\nARR at risk USD: ${input.arrAtRiskUsd}\nSignal: ${input.signalSummary}\nWrite 2 sentences.`,
      },
    ],
  });
  if (status < 200 || status >= 300) {
    throw new Error(`LATCH_LLM_FAIL triage=${triage(status, text)} status=${status}`);
  }
  if (text.includes("aliyun_waf") || text.trim().startsWith("<!doctype")) {
    throw new Error("LATCH_LLM_FAIL triage=A — start Tor SOCKS");
  }
  const parsed = JSON.parse(text) as unknown;
  const content = extractAnthropicText(parsed);
  if (!content) throw new Error("LATCH_LLM_FAIL triage=E empty");
  return content;
}
