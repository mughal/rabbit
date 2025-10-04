"use client";

import KpiCard from "./KpiCard";
import LineChartPlaceholder from "./LineChartPlaceholder";

export default function KpiRow() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 16, alignItems: "stretch" }}>
      {/* KPIs */}
      <div style={{ gridColumn: "span 3" }}>
        <KpiCard label="Total Events" value={0} hint="session counter" />
      </div>
      <div style={{ gridColumn: "span 3" }}>
        <KpiCard label="Events / sec" value={"—"} hint="rolling 60s (planned)" />
      </div>
      <div style={{ gridColumn: "span 2" }}>
        <KpiCard label="Top Routing Key" value={"—"} hint="last 5 min (planned)" />
      </div>

      {/* Line chart placeholder */}
      <div style={{ gridColumn: "span 4", minWidth: 360 }}>
        <LineChartPlaceholder title="Hourly Line" subtitle="placeholder" />
      </div>
    </div>
  );
}
