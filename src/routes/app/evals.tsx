import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";

export const Route = createFileRoute("/app/evals")({
  head: () => ({ meta: [{ title: "Evals — Latch" }] }),
  component: EvalsPage,
});

type Row = { id: string; name: string; ok: boolean; detail: string };

function EvalsPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    try {
      const res = await fetch("/api/latch/goldens", { method: "POST" });
      const json = await res.json();
      if (!json.results) throw new Error(json.error || "Eval failed");
      setRows(json.results);
      toast.success(json.ok ? "All goldens passed" : "Suite finished with failures");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void run();
  }, []);

  return (
    <AppShell title="Evals" subtitle="Golden jobs that must stay honest — including forced failure paths.">
      <button
        type="button"
        disabled={busy}
        onClick={() => void run()}
        className="mb-4 rounded-xl bg-[oklch(0.28_0.05_145)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {busy ? "Running…" : "Re-run goldens"}
      </button>
      <div className="overflow-x-auto rounded-2xl border border-black/8 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-black/8 bg-black/[0.02] text-xs uppercase tracking-wide text-black/45">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Result</th>
              <th className="px-4 py-3">Detail</th>
            </tr>
          </thead>
          <tbody>
            {(rows || []).map((r) => (
              <tr key={r.id} className="border-b border-black/5">
                <td className="px-4 py-3 font-mono text-xs">{r.id}</td>
                <td className="px-4 py-3">{r.name}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                      r.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
                    }`}
                  >
                    {r.ok ? "PASS" : "FAIL"}
                  </span>
                </td>
                <td className="px-4 py-3 text-black/55">{r.detail}</td>
              </tr>
            ))}
            {!rows ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-black/45">
                  Running suite…
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
