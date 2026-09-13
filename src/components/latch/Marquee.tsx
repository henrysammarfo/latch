import type { ReactNode } from "react";

export function Marquee({
  items,
  wide = false,
  render,
}: {
  items: string[];
  wide?: boolean;
  render?: (item: string, index: number) => ReactNode;
}) {
  const group = (key: string) => (
    <div className="lx-marquee-group" key={key} aria-hidden={key !== "g0"}>
      {items.map((item, i) =>
        render ? (
          <span key={`${key}-${item}`}>{render(item, i)}</span>
        ) : (
          <span className="lx-chip" key={`${key}-${item}`}>
            {item}
          </span>
        ),
      )}
    </div>
  );

  return (
    <div className={wide ? "lx-marquee lx-marquee-wide" : "lx-marquee"}>
      <div className="lx-marquee-track">
        {["g0", "g1", "g2", "g3"].map((k) => group(k))}
      </div>
    </div>
  );
}
