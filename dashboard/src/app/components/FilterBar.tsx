"use client";

import { useState } from "react";

export default function FilterBar() {
  const [prefix, setPrefix] = useState("");
  const [service, setService] = useState("");
  const [env, setEnv] = useState("");

  const inputStyle: React.CSSProperties = {
    padding: "8px 10px",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    fontSize: 14,
    background: "#fff",
  };

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <input
        style={inputStyle}
        placeholder="routing key prefix e.g., auth.#"
        value={prefix}
        onChange={(e) => setPrefix(e.target.value)}
      />
      <input
        style={inputStyle}
        placeholder="service (header) e.g., api"
        value={service}
        onChange={(e) => setService(e.target.value)}
      />
      <input
        style={inputStyle}
        placeholder="env (header) e.g., dev"
        value={env}
        onChange={(e) => setEnv(e.target.value)}
      />
      <button
        type="button"
        style={{
          padding: "8px 12px",
          borderRadius: 8,
          border: "1px solid #e5e7eb",
          background: "#0ea5e9",
          color: "white",
          fontWeight: 600,
        }}
        onClick={() => alert("Filters are UI-only for now; wiring in final step.")}
      >
        Apply
      </button>
    </div>
  );
}
