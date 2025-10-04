"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type EventItem = {
  routingKey: string;
  payload: unknown;
  ts: number;
};

export default function LiveFeed() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // ensure server bootstraps socket
    fetch("/api/socket").catch(() => {});

    const socket: Socket = io({ path: "/api/socket" });

    socket.on("event", (msg: any) => {
      setTotal((t) => t + 1);
      setItems((prev) => {
        const next = [{ routingKey: msg.routingKey, payload: msg.payload, ts: Date.now() }, ...prev];
        return next.slice(0, 200); // keep last 200
      });
    });

    return () => {
      socket.off("event");
      socket.disconnect();
    };
  }, []);

  return (
    <div style={{
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: 12,
      background: "#fff",
      minHeight: 280,
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <div style={{ fontWeight: 600 }}>Live Feed</div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>session total: <b>{total}</b></div>
      </div>

      {items.length === 0 ? (
        <div style={{ fontSize: 14, opacity: 0.7 }}>
          No events yet. Publish a test event to the queue to see updates here.
        </div>
      ) : (
        <div style={{ maxHeight: 360, overflow: "auto", borderTop: "1px solid #f3f4f6" }}>
          {items.map((it, i) => (
            <div key={i} style={{ padding: "10px 6px", borderBottom: "1px solid #f3f4f6" }}>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                {new Date(it.ts).toLocaleTimeString()} · <code>{it.routingKey}</code>
              </div>
              <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {typeof it.payload === "string" ? it.payload : JSON.stringify(it.payload, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
