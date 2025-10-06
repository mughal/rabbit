// page.tsx
"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import SocketStatus from "./SocketStatus";
import DynamicDashboard from "./components/DynamicDashboard";
import { DynamicEvent } from "../../lib/dynamic-types";

export default function Page() {
  const [activeTab, setActiveTab] = useState<'dynamic' | 'payments'>('dynamic');

  return (
    <main style={{ maxWidth: 1400, margin: "24px auto", padding: 16 }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 8, fontSize: 28, color: '#1F2937' }}>
          RabbitMQ Live Dashboard
        </h1>
        <p style={{ marginTop: 0, opacity: 0.8, fontSize: 16 }}>
          Real-time monitoring of all event streams. Cards automatically appear as new domain.entity.action patterns are discovered.
        </p>
      </header>
      
      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: 8, 
        marginBottom: 24,
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        paddingBottom: 16
      }}>
        <button
          onClick={() => setActiveTab('dynamic')}
          style={{
            padding: '8px 16px',
            background: activeTab === 'dynamic' ? '#3B82F6' : 'transparent',
            color: activeTab === 'dynamic' ? 'white' : '#6B7280',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          🔍 Dynamic Discovery
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          style={{
            padding: '8px 16px',
            background: activeTab === 'payments' ? '#10B981' : 'transparent',
            color: activeTab === 'payments' ? 'white' : '#6B7280',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          💰 Payments Dashboard
        </button>
      </div>

      <SocketStatus />
      
      {activeTab === 'dynamic' ? (
        <LiveDynamicDashboard />
      ) : (
        <div style={{ 
          padding: 40, 
          textAlign: 'center',
          background: 'rgba(0,0,0,0.02)',
          borderRadius: 12
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💰</div>
          <h3 style={{ margin: '0 0 8px 0' }}>Payments Dashboard</h3>
          <p style={{ margin: 0, opacity: 0.7 }}>
            This would be your specialized payments dashboard (from previous implementation)
          </p>
        </div>
      )}
    </main>
  );
}

function LiveDynamicDashboard() {
  const [events, setEvents] = useState<DynamicEvent[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // touch the API to ensure server spins up IO
    fetch("/api/socket").catch(() => {});

    const socket: Socket = io({ path: "/api/socket" });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("event", (evt: DynamicEvent) => {
      setEvents((prev) => [evt, ...prev].slice(0, 1000)); // Keep more events for dynamic discovery
    });

    return () => {
      socket.off("event");
      socket.disconnect();
    };
  }, []);

  return <DynamicDashboard events={events} connected={connected} />;
}