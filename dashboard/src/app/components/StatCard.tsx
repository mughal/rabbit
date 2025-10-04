import { PaymentChannel } from '../../lib/types';
import { formatCurrency, formatNumber } from '../../lib/utils';

interface StatCardProps {
  channel: PaymentChannel;
  compact?: boolean;
}

export default function StatCard({ channel, compact = false }: StatCardProps) {
  if (compact) {
    return (
      <div
        style={{
          border: `1px solid ${channel.color}20`,
          borderRadius: 12,
          padding: 16,
          background: `${channel.color}08`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div style={{ fontSize: 24 }}>{channel.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{channel.displayName}</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            {formatNumber(channel.count)} payments
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: channel.color }}>
            {formatCurrency(channel.total)}
          </div>
          <div style={{ fontSize: 10, opacity: 0.7 }}>
            avg {formatCurrency(channel.average)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        border: `2px solid ${channel.color}30`,
        borderRadius: 16,
        padding: 20,
        background: `${channel.color}08`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 32 }}>{channel.icon}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{channel.displayName}</div>
          <div style={{ fontSize: 14, opacity: 0.8 }}>Payment Channel</div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Total Payments</div>
          <div style={{ fontWeight: 700, fontSize: 20, color: channel.color }}>
            {formatNumber(channel.count)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Average Amount</div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>
            {formatCurrency(channel.average)}
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: 12, opacity: 0.7 }}>Total Amount</div>
        <div style={{ fontWeight: 800, fontSize: 24, color: channel.color }}>
          {formatCurrency(channel.total)}
        </div>
      </div>
    </div>
  );
}