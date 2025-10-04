// page.tsx
"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import SocketStatus from "./SocketStatus";
import StatCard from "./components/StatCard";
import TotalSummaryCard from "./components/TotalSummaryCard";
import PaymentChart from "./components/PaymentChart";
import { PaymentEvent, DashboardStats } from "../lib/types";
import { processPaymentEvent } from "../lib/utils";

export default function Page() {
  return (
    <main style={{ maxWidth: 1200, margin: "24px auto", padding: 16 }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 8, fontSize: 28, color: '#1F2937' }}>
          Utility Payments Dashboard
        </h1>
        <p style={{ marginTop: 0, opacity: 0.8, fontSize: 16 }}>
          Live monitoring of payment transactions across all channels. 
          Run <code>node publish.mjs</code> to simulate payment events.
        </p>
      </header>
      
      <SocketStatus />
      <LiveDashboard />
    </main>
  );
}

function LiveDashboard() {
  const [events, setEvents] = useState<PaymentEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalPayments: 0,
    totalAmount: 0,
    averageAmount: 0,
    channels: {}
  });

  useEffect(() => {
    // Process events whenever they change
    setStats(processPaymentEvent(events));
  }, [events]);

  useEffect(() => {
    // touch the API to ensure server spins up IO
    fetch("/api/socket").catch(() => {});

    const socket: Socket = io({ path: "/api/socket" });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("event", (evt: PaymentEvent) => {
      setEvents((prev) => [evt, ...prev].slice(0, 500)); // Keep more events for better stats
    });

    return () => {
      socket.off("event");
      socket.disconnect();
    };
  }, []);

  const channels = Object.values(stats.channels);

  return (
    <div style={{ marginTop: 24 }}>
      {/* Connection Status */}
      <div style={{
        padding: 12,
        background: connected ? '#DCFCE7' : '#FEE2E2',
        border: `1px solid ${connected ? '#16A34A' : '#DC2626'}20`,
        borderRadius: 8,
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        <div style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: connected ? '#16A34A' : '#DC2626'
        }} />
        <span style={{ fontWeight: 600, color: connected ? '#166534' : '#991B1B' }}>
          {connected ? 'Connected to live feed' : 'Disconnected'}
        </span>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, marginBottom: 24 }}>
        <TotalSummaryCard stats={stats} />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {channels.map(channel => (
            <StatCard key={channel.name} channel={channel} compact={true} />
          ))}
        </div>
      </div>

      {/* Detailed Channel Cards */}
      {channels.length > 0 && (
        <>
          <h3 style={{ margin: '32px 0 16px 0', fontSize: 20 }}>Payment Channels</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: 20,
            marginBottom: 32 
          }}>
            {channels.map(channel => (
              <StatCard key={channel.name} channel={channel} />
            ))}
          </div>
        </>
      )}

      {/* Chart */}
      {channels.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <PaymentChart stats={stats} />
        </div>
      )}

      {/* Live Events Feed */}
      <section style={{ 
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 16,
        padding: 24,
        background: 'white'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: 18 }}>
          Live Events Feed {connected ? "•" : "○"}
        </h3>
        
        {events.length === 0 ? (
          <div style={{ 
            opacity: 0.7, 
            textAlign: 'center', 
            padding: 40,
            background: 'rgba(0,0,0,0.02)',
            borderRadius: 8
          }}>
            No payment events yet — try <code>node publish.mjs</code> to simulate transactions.
          </div>
        ) : null}

        <div style={{ display: 'grid', gap: 12, maxHeight: 400, overflowY: 'auto' }}>
          {events.map((e, idx) => (
            <article
              key={idx}
              style={{
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 12,
                padding: 16,
                background: 'rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    background: '#3B82F6', 
                    color: 'white', 
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    {e.routingKey}
                  </span>
                  <span style={{ 
                    padding: '4px 8px', 
                    background: '#10B981', 
                    color: 'white', 
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    ${e.payload.amount?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  {e.ts ? new Date(e.ts).toLocaleTimeString() : ''}
                </div>
              </div>
              
              <pre
                style={{
                  margin: 0,
                  fontSize: 12,
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  background: 'rgba(0,0,0,0.02)',
                  padding: 12,
                  borderRadius: 6,
                  border: '1px solid rgba(0,0,0,0.05)'
                }}
              >
                {JSON.stringify(e.payload, null, 2)}
              </pre>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}