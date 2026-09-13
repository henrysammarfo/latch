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
            <Link to="/dashboard" className="lx-pill">
              Open console
              <ArrowUpRight size={16} />
            </Link>
            <button className="lx-pill lx-menu-btn" onClick={() => setOpen(true)}>
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
          <Link to="/dashboard" className="lx-drawer-link" onClick={() => setOpen(false)}>
            Console
          </Link>
        </div>
        <div className="lx-shell" style={{ paddingBottom: 28 }}>
          <p className="lx-small">© 2026 Latch — fail-closed churn-save.</p>
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
              The action-and-proof layer for AI customer success. If an app didn't
              move, the board never goes green.
            </p>
          </div>
          <div>
            <p className="lx-eyebrow">Product</p>
            <Link to="/how-it-works" className="lx-footer-link">How it works</Link>
            <Link to="/reliability" className="lx-footer-link">Reliability</Link>
            <Link to="/plans" className="lx-footer-link">Plans</Link>
          </div>
          <div>
            <p className="lx-eyebrow">Build</p>
            <Link to="/docs" className="lx-footer-link">Docs</Link>
            <Link to="/dashboard" className="lx-footer-link">Console</Link>
            <Link to="/dashboard/evals" className="lx-footer-link">Eval board</Link>
          </div>
          <div>
            <p className="lx-eyebrow">Company</p>
            <Link to="/contact" className="lx-footer-link">Contact</Link>
            <a href="https://github.com/henrysammarfo" className="lx-footer-link">GitHub</a>
            <Link to="/merch" className="lx-footer-link">Merch</Link>
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
