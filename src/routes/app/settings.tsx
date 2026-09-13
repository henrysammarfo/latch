import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Settings — Latch" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [me, setMe] = useState<{
    user: { name: string; email: string; emailVerified: boolean };
    workspace: { name: string; slug: string };
  } | null>(null);
  const [token, setToken] = useState("");
  const [issued, setIssued] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    const json = await res.json();
    if (json.ok) setMe(json);
  }

  useEffect(() => {
    void load();
  }, []);

  async function issue() {
    const res = await fetch("/api/auth/verify-email", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: "{}",
    });
    const json = await res.json();
    if (!json.ok) {
      toast.error(json.error || "Failed");
      return;
    }
    setIssued(json.verifyToken || null);
    toast.message("Token ready — paste below (email delivery comes later)");
  }

  async function verify() {
    const res = await fetch("/api/auth/verify-email", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const json = await res.json();
    if (!json.ok) {
      toast.error(json.error || "Invalid token");
      return;
    }
    toast.success("Email verified");
    setIssued(null);
    setToken("");
    await load();
  }

  return (
    <AppShell title="Settings" subtitle="Profile and email verification. Verify whenever — not required to explore.">
      {!me ? (
        <div className="h-32 animate-pulse rounded-2xl bg-black/5" />
      ) : (
        <div className="grid max-w-xl gap-4">
          <div className="rounded-2xl border border-black/8 bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-black/45">Profile</p>
            <p className="mt-2 font-semibold">{me.user.name}</p>
            <p className="text-sm text-black/55">{me.user.email}</p>
            <p className="mt-3 text-sm">
              Email status:{" "}
              <span className="font-medium">{me.user.emailVerified ? "Verified" : "Not verified yet"}</span>
            </p>
          </div>
          <div className="rounded-2xl border border-black/8 bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-black/45">Workspace</p>
            <p className="mt-2 font-semibold">{me.workspace.name}</p>
            <p className="font-mono text-xs text-black/45">{me.workspace.slug}</p>
          </div>
          {!me.user.emailVerified ? (
            <div className="rounded-2xl border border-black/8 bg-white p-5">
              <p className="font-semibold">Verify email later</p>
              <p className="mt-1 text-sm text-black/55">
                Sign up is email + password only. Generate a token now, paste it here when you are ready.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void issue()}
                  className="rounded-xl border border-black/10 px-3 py-2 text-sm"
                >
                  Generate token
                </button>
              </div>
              {issued ? (
                <p className="mt-3 break-all rounded-lg bg-black/4 p-2 font-mono text-xs">{issued}</p>
              ) : null}
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  className="flex-1 rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
                  placeholder="Paste verify token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => void verify()}
                  className="rounded-xl bg-[oklch(0.28_0.05_145)] px-3 py-2 text-sm font-medium text-white"
                >
                  Verify
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </AppShell>
  );
}
