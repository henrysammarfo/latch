const COUNT = 20;

export function CurvedLines() {
  return (
    <div className="lx-lines">
      {Array.from({ length: COUNT }).map((_, i) => (
        <div
          key={`l-${i}`}
          className="lx-line lx-line-l"
          style={{
            top: "-10%",
            height: "120%",
            width: 60 + i * 10,
            animationDelay: `${i * 0.25}s`,
          }}
        />
      ))}
      {Array.from({ length: COUNT }).map((_, i) => (
        <div
          key={`r-${i}`}
          className="lx-line lx-line-r"
          style={{
            top: "-10%",
            height: "120%",
            width: 60 + i * 10,
            animationDelay: `${i * 0.25}s`,
          }}
        />
      ))}
    </div>
  );
}
