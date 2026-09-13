import { Link } from "@tanstack/react-router";

/**
 * LATCH mark — a closed shackle forming an "L".
 * Single-path, single-colour: works on merch, embroidery and favicons.
 */
export function LatchMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="9.25" fill="currentColor" />
      <path
        d="M11 7.5v13.25a2.25 2.25 0 0 0 2.25 2.25H21"
        stroke="var(--lx-bg)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M17.5 19.5c0-3.6 0-5.4 1.6-6.6 1.6-1.2 3.9-.6 4.6 1.3"
        stroke="var(--lx-bg)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LatchWordmark({ size = 26 }: { size?: number }) {
  return (
    <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <LatchMark size={size + 4} />
      <span style={{ fontSize: size, fontWeight: 600, letterSpacing: "-0.06em" }}>
        Latch<span className="lx-reg">®</span>
      </span>
    </Link>
  );
}
