import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Bot,
  Cable,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { LatchWordmark } from "@/components/latch/LatchLogo";
import { cn } from "@/lib/utils";

type Me = {
  user: { id: string; email: string; name: string; emailVerified: boolean };
  workspace: { id: string; name: string; slug: string };
};

const NAV = [
  { to: "/app", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/app/tour", label: "Tour", icon: Sparkles, exact: true },
  { to: "/app/agents", label: "Agents", icon: Bot },
  { to: "/app/plays", label: "Plays", icon: Activity },
  { to: "/app/connections", label: "Connections", icon: Cable },
  { to: "/app/evals", label: "Evals", icon: FlaskConical },
  { to: "/app/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [me, setMe] = useState<Me | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const json = (await res.json().catch(() => null)) as Me & { ok?: boolean; error?: string } | null;
        if (res.status === 401 || (json && json.ok === false)) {
          navigate({ to: "/login" });
          return;
        }
        if (!res.ok || !json?.user || !json?.workspace) {
          toast.error("Could not load your session. Retrying…");
          return;
        }
        setMe({ user: json.user, workspace: json.workspace });
      } catch {
        toast.error("Network error loading session — stay put and refresh.");
      }
    })();
  }, [navigate]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    toast.success("Signed out");
    navigate({ to: "/login" });
  }

  function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
    return (
      <>
        {NAV.map((item) => {
          const exact = "exact" in item && item.exact;
          const active = exact ? path === item.to : path === item.to || path.startsWith(`${item.to}/`);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                active ? "bg-[oklch(0.28_0.05_145)] text-white" : "text-black/70 hover:bg-black/4",
              )}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[oklch(0.985_0.01_145)] text-[oklch(0.22_0.03_145)]">
      <Toaster richColors position="top-right" />
      <div className="flex min-h-screen">
        <aside className="hidden w-60 shrink-0 border-r border-black/8 bg-white/80 px-3 py-4 backdrop-blur md:flex md:flex-col">
          <div className="px-2 pb-4">
            <Link to="/app">
              <LatchWordmark size={22} />
            </Link>
            <p className="mt-2 text-xs text-black/50">Workspace</p>
            <p className="truncate text-sm font-medium">{me?.workspace.name || "…"}</p>
          </div>
          <nav className="flex flex-1 flex-col gap-1">
            <NavLinks />
          </nav>
          <button
            type="button"
            onClick={() => void logout()}
            className="mt-auto flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-black/60 hover:bg-black/4"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-3 border-b border-black/8 bg-white/70 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex min-w-0 items-start gap-3">
              <button
                type="button"
                className="mt-0.5 rounded-lg border border-black/10 p-2 md:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={16} />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-black/45">
                  <Sparkles size={12} />
                  Latch
                </div>
                <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
                {subtitle ? <p className="text-sm text-black/55">{subtitle}</p> : null}
              </div>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{me?.user.name || "…"}</p>
              <p className="text-xs text-black/45">{me?.user.email}</p>
              {me && !me.user.emailVerified ? (
                <Link to="/app/settings" className="text-xs font-medium text-amber-800">
                  Verify email later →
                </Link>
              ) : null}
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 md:px-6">{children}</main>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <LatchWordmark size={22} />
              <button type="button" className="rounded-lg border border-black/10 p-2" onClick={() => setMobileOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <p className="mb-3 truncate px-2 text-sm font-medium">{me?.workspace.name}</p>
            <nav className="flex flex-col gap-1">
              <NavLinks onNavigate={() => setMobileOpen(false)} />
            </nav>
            <button
              type="button"
              onClick={() => void logout()}
              className="mt-auto flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-black/60 hover:bg-black/4"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
