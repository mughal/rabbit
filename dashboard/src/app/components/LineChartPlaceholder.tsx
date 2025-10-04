"use client";

type Props = {
  title?: string;
  subtitle?: string;
  width?: number;
  height?: number;
};

export default function LineChartPlaceholder({
  title = "Hourly Trend",
  subtitle = "Last 24h",
  width = 360,
  height = 120,
}: Props) {
  const padding = 28;
  const w = width;
  const h = height;

  // Fake points just to show a trend line (no data yet)
  const points = [
    [0, 70], [40, 65], [80, 60], [120, 75], [160, 50], [200, 55],
    [240, 40], [280, 35], [320, 45], [360, 30],
  ];

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${padding + p[0]} ${h - padding + (p[1] - 60) * 0.8}`)
    .join(" ");

  return (
    <div style={{
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: 12,
      background: "#fff",
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      width: w + padding,
    }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 12, opacity: 0.6 }}>{subtitle}</div>
      </div>

      <svg width={w} height={h} role="img" aria-label="line chart placeholder">
        {/* Axes */}
        <line x1={padding} y1={h - padding} x2={w - 6} y2={h - padding} stroke="#e5e7eb" />
        <line x1={padding} y1={12} x2={padding} y2={h - padding} stroke="#e5e7eb" />
        {/* Grid (light) */}
        {[1, 2, 3].map((i) => (
          <line key={i} x1={padding} x2={w - 6} y1={h - padding - i * 20} y2={h - padding - i * 20} stroke="#f3f4f6" />
        ))}
        {/* Line */}
        <path d={path} fill="none" stroke="#3b82f6" strokeWidth={2} />
        {/* End marker dot */}
        <circle
          cx={padding + points[points.length - 1][0]}
          cy={h - padding + (points[points.length - 1][1] - 60) * 0.8}
          r="3.5"
          fill="#3b82f6"
        />
      </svg>
    </div>
  );
}
