// SocketStatus.tsx
"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export default function SocketStatus() {
  const [connected, setConnected] = useState(false);
  const [hello, setHello] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    // ensure server bootstraps Socket.IO
    fetch("/api/socket").catch(() => {});

    const socket: Socket = io({ path: "/api/socket" });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("hello", (msg: any) => setHello(msg?.ts || "ok"));
    socket.on("event", () => setCount((c) => c + 1));

    return () => {
      socket.off("hello");
      socket.off("event");
      socket.disconnect();
    };
  }, []);

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        padding: 12,
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.08)",
        background: "rgba(0,0,0,0.03)",
        display: "flex",
        gap: 12,
        alignItems: "center",
      }}
    >
      <strong>Socket:</strong>
      <span>{connected ? "Connected •" : "Disconnected ○"}</span>
      {hello && (
        <span style={{ opacity: 0.8 }}>
          · hello:&nbsp;<code>{hello}</code>
        </span>
      )}
      {count > 0 && (
        <span style={{ opacity: 0.8 }}>
          · events:&nbsp;<b>{count}</b>
        </span>
      )}
    </div>
  );
}
