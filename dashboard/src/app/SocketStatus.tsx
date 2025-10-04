"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export default function SocketStatus() {
  const [connected, setConnected] = useState<boolean>(false);
  const [hello, setHello] = useState<string | null>(null);

  useEffect(() => {
    // Kick the API route so the server attaches Socket.IO once
    fetch("/api/socket").catch(() => {});

    // Connect to Socket.IO — path must match the server's path
    const socket: Socket = io({ path: "/api/socket" });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    // Proof-of-life message emitted by the server in M1
    socket.on("hello", (payload: any) => {
      try {
        setHello(typeof payload === "string" ? payload : JSON.stringify(payload));
      } catch {
        setHello(String(payload));
      }
    });

    return () => {
      socket.off("hello");
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, []);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 999,
        border: "1px solid rgba(0,0,0,0.1)",
        background: connected ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.08)",
        fontSize: 13,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: connected ? "#10b981" : "#ef4444",
          display: "inline-block",
        }}
      />
      <span style={{ fontWeight: 600 }}>
        {connected ? "Socket: Connected" : "Socket: Disconnected"}
      </span>
      {hello && (
        <span style={{ opacity: 0.7 }}>
          · hello: <code>{hello}</code>
        </span>
      )}
    </div>
  );
}
