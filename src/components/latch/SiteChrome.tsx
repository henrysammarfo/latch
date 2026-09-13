import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { ArrowUpRight, ChevronUp, X } from "lucide-react";
import { LatchMark, LatchWordmark } from "./LatchLogo";
import { NAV } from "@/lib/latch-data";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <>
      <header className="lx-navbar">
        <div className="lx-navbar-inner">
          <LatchWordmark size={24} />
          <nav className="lx-navlinks">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="lx-navlink"
                data-active={path === item.to}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Link to="/login" className="lx-navlink" data-active={path === "/login"}>
              Sign in
            </Link>
            <Link to="/register" className="lx-pill">
              Start free
              <ArrowUpRight size={16} />
            </Link>
            <button className="lx-pill lx-menu-btn" onClick={() => setOpen(true)} type="button">
              Menu
              <ChevronUp size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="lx-drawer" data-open={open}>
        <div className="lx-navbar-inner">
          <LatchWordmark size={24} />
          <button className="lx-pill" onClick={() => setOpen(false)}>
            Close
            <X size={16} />
          </button>
        </div>
        <div className="lx-drawer-links">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="lx-drawer-link"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link to="/login" className="lx-drawer-link" onClick={() => setOpen(false)}>
            Sign in
          </Link>
          <Link to="/register" className="lx-drawer-link" onClick={() => setOpen(false)}>
            Start free
          </Link>
          <Link to="/app" className="lx-drawer-link" onClick={() => setOpen(false)}>
            Open app
          </Link>
        </div>
        <div className="lx-shell" style={{ paddingBottom: 28 }}>
          <p className="lx-small">© 2026 Latch — churn-save agents for every team.</p>
        </div>
      </div>
    </>
  );
}

export function Footer() {
  return (
    <footer className="lx-footer">
      <div className="lx-shell">
        <div className="lx-footer-grid">
          <div>
            <LatchWordmark size={24} />
            <p className="lx-small" style={{ maxWidth: 280, marginTop: 12 }}>
              Create agents that catch churn risk, take the next steps, and keep a clear
              record of what happened — for your workspace and every teammate on it.
            </p>
          </div>
          <div>
            <p className="lx-eyebrow">Product</p>
            <Link to="/how-it-works" className="lx-footer-link">How it works</Link>
            <Link to="/plans" className="lx-footer-link">Pricing</Link>
            <Link to="/reliability" className="lx-footer-link">Reliability</Link>
          </div>
          <div>
            <p className="lx-eyebrow">Build</p>
            <Link to="/docs" className="lx-footer-link">Docs</Link>
            <Link to="/register" className="lx-footer-link">Create workspace</Link>
            <Link to="/app" className="lx-footer-link">App</Link>
          </div>
          <div>
            <p className="lx-eyebrow">Company</p>
            <Link to="/contact" className="lx-footer-link">Contact</Link>
            <Link to="/privacy" className="lx-footer-link">Privacy</Link>
            <Link to="/terms" className="lx-footer-link">Terms</Link>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            marginTop: 40,
            flexWrap: "wrap",
          }}
        >
          <p className="lx-small">© 2026 Latch. Built in Accra by Henry Sam Marfo.</p>
          <p className="lx-small">Human owns every customer-facing send.</p>
        </div>
      </div>
    </footer>
  );
}

export function SitePage({ children }: { children: ReactNode }) {
  return (
    <div>
      <Navbar />
      <main style={{ paddingTop: 68 }}>{children}</main>
      <Footer />
    </div>
  );
}

export function PageHead({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: ReactNode;
  sub: string;
}) {
  return (
    <section className="lx-shell" style={{ paddingTop: 72, paddingBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <LatchMark size={20} />
        <p className="lx-eyebrow">{eyebrow}</p>
      </div>
      <h1 className="lx-h2" style={{ maxWidth: 760, marginTop: 18 }}>
        {title}
      </h1>
      <p className="lx-body" style={{ maxWidth: 620, marginTop: 16 }}>
        {sub}
      </p>
    </section>
  );
}
