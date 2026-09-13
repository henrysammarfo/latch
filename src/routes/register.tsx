import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { SitePage } from "@/components/latch/SiteChrome";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create workspace — Latch" },
      {
        name: "description",
        content: "Create a Latch workspace with email. Verify later in settings.",
      },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, workspaceName, email, password }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Could not create account");
      toast.success("Workspace ready — verify email later in Settings");
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
      <section className="lx-shell" style={{ paddingTop: 72, paddingBottom: 96, maxWidth: 520 }}>
        <p className="lx-eyebrow">Start free</p>
        <h1 className="lx-h2" style={{ marginTop: 12 }}>
          Create your workspace
        </h1>
        <p className="lx-body" style={{ marginTop: 10 }}>
          Sign up with email. You can verify later in Settings — no Google login, no waiting on
          a mailbox to explore the product.
        </p>
        <form onSubmit={onSubmit} style={{ marginTop: 28, display: "grid", gap: 14 }}>
          <label className="lx-small">
            Your name
            <input required value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
          </label>
          <label className="lx-small">
            Workspace name
            <input
              placeholder="Acme CS"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              style={inputStyle}
            />
          </label>
          <label className="lx-small">
            Work email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </label>
          <label className="lx-small">
            Password (8+ characters)
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </label>
          <button className="lx-btn-primary" type="submit" disabled={busy}>
            {busy ? "Creating…" : "Create workspace"}
          </button>
        </form>
        <p className="lx-small" style={{ marginTop: 18 }}>
          Already have one? <Link to="/login">Sign in</Link>
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
