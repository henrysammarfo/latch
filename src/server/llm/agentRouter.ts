import { socksDispatcher } from "fetch-socks";
import { ProxyAgent, fetch as undiciFetch, type Dispatcher, type RequestInit as UndiciInit } from "undici";

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

function buildDispatcher(): Dispatcher | undefined {
  const p = proxyUrl();
  if (!p) return undefined;
  if (p.startsWith("socks")) {
    // socks5h://127.0.0.1:9050
    const u = new URL(p);
    const type = p.startsWith("socks5") ? 5 : 4;
    return socksDispatcher({
      type: type as 4 | 5,
      host: u.hostname,
      port: Number(u.port || 9050),
    }) as unknown as Dispatcher;
  }
  return new ProxyAgent(p);
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

async function agentFetch(path: string, init?: UndiciInit): Promise<Response> {
  const key = apiKey();
  const url = `${agentRouterBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await undiciFetch(url, {
    ...init,
    headers: { ...wireHeaders(key), ...(init?.headers as Record<string, string> | undefined) },
    dispatcher: buildDispatcher() as never,
  });
  return res as unknown as Response;
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
    const res = await agentFetch("/chat/completions", {
      method: "POST",
      body: JSON.stringify({
        model,
        max_tokens: 64,
        messages: [{ role: "user", content: 'Reply with exactly: {"pong":true}' }],
      }),
    });
    const text = await res.text();
    if (!res.ok) {
      return {
        ok: false,
        triage: triage(res.status, text),
        status: res.status,
        message: `HTTP ${res.status}`,
      };
    }
    if (text.includes("aliyun_waf") || text.trim().startsWith("<!doctype")) {
      return { ok: false, triage: "A", status: res.status, message: "WAF HTML" };
    }
    try {
      JSON.parse(text);
    } catch {
      return { ok: false, triage: "E", status: res.status, message: "Non-JSON" };
    }
    return { ok: true, model, status: res.status };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const t: SmokeFail["triage"] =
      msg.includes("9050") || msg.toLowerCase().includes("socks") || msg.includes("ECONNREFUSED")
        ? "B"
        : "UNKNOWN";
    return { ok: false, triage: t, message: msg };
  }
}

export async function draftRiskReason(input: {
  accountName: string;
  arrAtRiskUsd: number;
  signalSummary: string;
}): Promise<string> {
  const model = modelName();
  const res = await agentFetch("/chat/completions", {
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
  const text = await res.text();
  if (!res.ok) throw new Error(`LATCH_LLM_FAIL triage=${triage(res.status, text)} status=${res.status}`);
  if (text.includes("aliyun_waf") || text.trim().startsWith("<!doctype")) {
    throw new Error("LATCH_LLM_FAIL triage=A — start Tor SOCKS");
  }
  const parsed = JSON.parse(text) as { choices?: Array<{ message?: { content?: string } }> };
  const content = parsed.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("LATCH_LLM_FAIL triage=E empty");
  return content;
}
