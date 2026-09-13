import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { RunMode } from "../domain/types";

let loadedFrom = "";

function parseEnvFile(contents: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const raw of contents.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

export function loadEnv(options?: { force?: boolean }): void {
  const path = resolve(process.cwd(), ".env");
  if (!options?.force && loadedFrom === path) return;
  if (existsSync(path)) {
    for (const [k, v] of Object.entries(parseEnvFile(readFileSync(path, "utf8")))) {
      process.env[k] = v;
    }
  }
  loadedFrom = path;
}

export function getEnv(name: string, fallback = ""): string {
  loadEnv();
  return process.env[name]?.trim() || fallback;
}

export function requireEnv(name: string): string {
  const v = getEnv(name);
  if (!v) throw new Error(`LATCH_ENV_MISSING: ${name}. See memory/CREDENTIALS_RUNBOOK.md`);
  return v;
}

export function firstEnv(...names: string[]): string | undefined {
  loadEnv();
  for (const n of names) {
    const v = process.env[n]?.trim();
    if (v) return v;
  }
  return undefined;
}

export type RuntimeConfig = {
  mode: RunMode;
  killSwitch: boolean;
  maxArrAuto: number;
  pokeToken: string;
};

export function getRuntimeConfig(): RuntimeConfig {
  loadEnv();
  return {
    mode: getEnv("LATCH_MODE", "dry_run") === "live" ? "live" : "dry_run",
    killSwitch: getEnv("LATCH_KILL_SWITCH", "false") === "true",
    maxArrAuto: Number(getEnv("LATCH_MAX_ARR_AUTO", "50000")) || 50000,
    pokeToken: getEnv("LATCH_PUBLIC_POKE_TOKEN", ""),
  };
}
