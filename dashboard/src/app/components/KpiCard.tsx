"use client";

type Props = { label: string; value: string | number; hint?: string };

export default function KpiCard({ label, value, hint }: Props) {
  return (
    <div style={{
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: 12,
      background: "#fff",
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      minWidth: 160
    }}>
      <div style={{ fontSize: 12, opacity: 0.6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}>{value}</div>
      {hint && <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>{hint}</div>}
    </div>
  );
}
