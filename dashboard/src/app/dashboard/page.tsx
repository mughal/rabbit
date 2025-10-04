// src/app/dashboard/page.tsx (updated with "use client" to allow { ssr: false })
"use client";

import dynamic from 'next/dynamic';

// Dynamically import Dash (client-side only, no SSR)
const Dash = dynamic(() => import('../components/Dash'), { ssr: false });

export default function DashboardPage() {
  return (
    <main style={{ padding: 16, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <h1 style={{ marginBottom: 24, fontSize: 28 }}>Payments Received Dashboard</h1>
      <Dash />
    </main>
  );
}