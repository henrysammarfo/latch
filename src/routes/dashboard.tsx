import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { SitePage } from "@/components/latch/SiteChrome";

type Connector = {
  name: string;
  configured: boolean;
  liveReady: boolean;
  detail: string;
};

type PlayRun = {
  id: string;
  state: string;
  draftReason: string;
  greenCount: number;
  assertTotal: number;
  notes: string[];
  steps: Array<{
    name: string;
    status: string;
    externalId: string | null;
    dryRun: boolean;
    ms: number;
    error?: string;
  }>;
  assertResults: Array<{ id: string; label: string; ok: boolean; detail: string }>;
  evidence: { accountName: string; arrAtRiskUsd: number; signalSummary: string };
  policy: { mode: string; idempotencyKey: string };
};

type Health = {
  mode: string;
  killSwitch: boolean;
  connectors: Connector[];
};

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "LATCH Console — live poke board" },
      {
        name: "description",
        content: "Run fixture save-plays, inject Slack failures, and inspect fail-closed traces.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const [health, setHealth] = useState<Health | null>(null);
  const [play, setPlay] = useState<PlayRun | null>(null);
  const [goldens, setGoldens] = useState<Array<{ id: string; name: string; ok: boolean; detail: string }> | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshHealth = useCallback(async () => {
    const res = await fetch("/api/health");
    const json = (await res.json()) as Health & { ok: boolean };
    setHealth(json);
  }, []);

  useEffect(() => {
    void refreshHealth().catch((e) => setError(String(e)));
  }, [refreshHealth]);

  async function runPlay(injectFail: string | null) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/latch/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ injectFail, forceNew: true }),
      });
      const json = (await res.json()) as { ok: boolean; play?: PlayRun; error?: string };
      if (!json.ok || !json.play) throw new Error(json.error ?? "run_failed");
      setPlay(json.play);
      await refreshHealth();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function runGoldens() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/latch/goldens", { method: "POST" });
      const json = (await res.json()) as {
        ok: boolean;
        results?: Array<{ id: string; name: string; ok: boolean; detail: string }>;
        error?: string;
      };
      if (!json.results) throw new Error(json.error ?? "goldens_failed");
      setGoldens(json.results);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <SitePage>
      <section className="lx-shell" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <p className="lx-small">Console</p>
        <h1 className="lx-h1" style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}>
          Live poke board
        </h1>
        <p className="lx-body" style={{ maxWidth: 640 }}>
          Fail-closed save-play runner. Dry-run is the default until Slack / Google / Stripe
          credentials are present. No fake greens — LATCHED requires asserts to pass for the
          active mode.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 28 }}>
          <button className="lx-pill" disabled={busy} onClick={() => void runPlay(null)}>
            Run fixture save-play
          </button>
          <button className="lx-pill" disabled={busy} onClick={() => void runPlay("slack_alert")}>
            Inject Slack fail
          </button>
          <button className="lx-pill" disabled={busy} onClick={() => void runGoldens()}>
            Run goldens G1–G4
          </button>
          <Link to="/reliability" className="lx-pill">
            Reliability brief
          </Link>
        </div>

        {error ? (
          <p className="lx-body" style={{ color: "#b42318", marginTop: 20 }}>
            {error}
          </p>
        ) : null}

        <div style={{ marginTop: 36 }}>
          <h2 className="lx-h2">Mode & connectors</h2>
          {health ? (
            <div className="lx-body">
              <p>
                Mode: <strong>{health.mode}</strong> · Kill switch:{" "}
                <strong>{health.killSwitch ? "ON" : "off"}</strong>
              </p>
              <ul>
                {health.connectors.map((c) => (
                  <li key={c.name}>
                    {c.name}: {c.configured ? "configured" : "missing"} — {c.detail}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="lx-small">Loading health…</p>
          )}
        </div>

        {play ? (
          <div style={{ marginTop: 36 }}>
            <h2 className="lx-h2">
              Last play · {play.state} · {play.greenCount}/{play.assertTotal}
            </h2>
            <p className="lx-body">
              {play.evidence.accountName} · ARR ${play.evidence.arrAtRiskUsd} · {play.policy.mode}
            </p>
            <p className="lx-small">{play.draftReason}</p>
            <table style={{ width: "100%", marginTop: 16, borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th align="left">Step</th>
                  <th align="left">Status</th>
                  <th align="left">External ID</th>
                  <th align="left">ms</th>
                </tr>
              </thead>
              <tbody>
                {play.steps.map((s, i) => (
                  <tr key={`${s.name}-${i}`}>
                    <td>{s.name}</td>
                    <td>
                      {s.status}
                      {s.dryRun ? " (dry_run)" : ""}
                    </td>
                    <td>
                      <code>{s.externalId ?? "—"}</code>
                    </td>
                    <td>{s.ms}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h3 className="lx-h2" style={{ marginTop: 24, fontSize: "1.25rem" }}>
              Asserts
            </h3>
            <ul className="lx-body">
              {play.assertResults.map((a) => (
                <li key={a.id}>
                  {a.ok ? "PASS" : "FAIL"} — {a.label}: {a.detail}
                </li>
              ))}
            </ul>
            {play.notes.length ? (
              <p className="lx-small" style={{ marginTop: 12 }}>
                Notes: {play.notes.join(" · ")}
              </p>
            ) : null}
          </div>
        ) : null}

        {goldens ? (
          <div style={{ marginTop: 36 }}>
            <h2 className="lx-h2">Goldens</h2>
            <ul className="lx-body">
              {goldens.map((g) => (
                <li key={g.id}>
                  {g.ok ? "PASS" : "FAIL"} {g.id} {g.name} — {g.detail}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <p className="lx-small" style={{ marginTop: 40 }}>
          Residual risk remains (token theft, OAuth scope abuse, Tor/WAF ops). LATCH is fail-closed —
          not “unhackable.”
        </p>
      </section>
    </SitePage>
  );
}
