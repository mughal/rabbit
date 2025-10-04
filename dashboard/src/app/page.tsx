// page.tsx
"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import SocketStatus from "./SocketStatus";

type EventWire = {
  routingKey: string;
  payload: any;
  fields?: any;
  properties?: any;
  ts?: string;
};

export default function Page() {
  return (
    <main style={{ maxWidth: 920, margin: "24px auto", padding: 16 }}>
      <h1 style={{ marginBottom: 12 }}>RabbitMQ → Socket.IO → Live Feed</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        Run <code>node publish.mjs</code> to send a test message. You should see it below and in your
        server logs.
      </p>
      <SocketStatus />
      <LiveFeed />
    </main>
  );
}

function LiveFeed() {
  const [events, setEvents] = useState<EventWire[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // touch the API to ensure server spins up IO
    fetch("/api/socket").catch(() => {});

    const socket: Socket = io({ path: "/api/socket" });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("event", (evt: EventWire) => {
      setEvents((prev) => [evt, ...prev].slice(0, 250));
    });

    return () => {
      socket.off("event");
      socket.disconnect();
    };
  }, []);

  return (
    <section style={{ marginTop: 16 }}>
      <h3 style={{ display: "flex", gap: 8, alignItems: "center" }}>
        Live Events {connected ? "•" : "○"}
      </h3>
      {events.length === 0 ? (
        <div style={{ opacity: 0.7 }}>
          No events yet — try <code>node publish.mjs</code>.
        </div>
      ) : null}

      <div style={{ display: "grid", gap: 12 }}>
        {events.map((e, idx) => (
          <article
            key={idx}
            style={{
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 12,
              padding: 12,
              background: "rgba(0,0,0,0.02)",
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              {e.ts ? new Date(e.ts).toLocaleString() : ""}
            </div>
            <div style={{ fontWeight: 700, marginTop: 4 }}>{e.routingKey}</div>
            <pre
              style={{
                margin: 0,
                marginTop: 8,
                fontSize: 12,
                overflowX: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {JSON.stringify(e.payload, null, 2)}
            </pre>
          </article>
        ))}
      </div>
    </section>
  );
}
