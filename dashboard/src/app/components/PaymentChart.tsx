import { DashboardStats } from '../../lib/types';
import { formatCurrency } from '../../lib/utils';

interface PaymentChartProps {
  stats: DashboardStats;
}

export default function PaymentChart({ stats }: PaymentChartProps) {
  const channels = Object.values(stats.channels);
  const maxAmount = Math.max(...channels.map(ch => ch.total), 1);
  
  return (
    <div
      style={{
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 16,
        padding: 24,
        background: 'white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      }}
    >
      <h3 style={{ margin: '0 0 20px 0', fontSize: 18 }}>Payment Distribution by Channel</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {channels.map(channel => {
          const percentage = (channel.total / maxAmount) * 100;
          
          return (
            <div key={channel.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 80, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>{channel.icon}</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{channel.displayName}</span>
              </div>
              
              <div style={{ flex: 1, height: 24, background: 'rgba(0,0,0,0.1)', borderRadius: 12, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${percentage}%`,
                    height: '100%',
                    background: channel.color,
                    borderRadius: 12,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              
              <div style={{ width: 100, textAlign: 'right', fontWeight: 600, fontSize: 14 }}>
                {formatCurrency(channel.total)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}