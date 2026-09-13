import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { SitePage } from "@/components/latch/SiteChrome";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Latch" },
      { name: "description", content: "Sign in to your Latch workspace." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Sign in failed");
      toast.success("Welcome back");
      navigate({ to: "/app" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <SitePage>
      <Toaster richColors position="top-right" />
      <section className="lx-shell" style={{ paddingTop: 72, paddingBottom: 96, maxWidth: 480 }}>
        <p className="lx-eyebrow">Sign in</p>
        <h1 className="lx-h2" style={{ marginTop: 12 }}>
          Open your workspace
        </h1>
        <p className="lx-body" style={{ marginTop: 10 }}>
          Email + password. No Google login for accounts.
        </p>
        <form onSubmit={onSubmit} style={{ marginTop: 28, display: "grid", gap: 14 }}>
          <label className="lx-small">
            Email
            <input
              className="lx-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </label>
          <label className="lx-small">
            Password
            <input
              className="lx-input"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </label>
          <button className="lx-btn-primary" type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="lx-small" style={{ marginTop: 18 }}>
          New here? <Link to="/register">Create a workspace</Link>
        </p>
      </section>
    </SitePage>
  );
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 6,
  border: "1px solid color-mix(in oklab, var(--lx-text) 14%, transparent)",
  borderRadius: 10,
  padding: "10px 12px",
  background: "var(--lx-bg)",
  color: "var(--lx-text)",
};
