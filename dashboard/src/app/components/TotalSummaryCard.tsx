import { DashboardStats } from '../../lib/types';
import { formatCurrency, formatNumber } from '../../lib/utils';

interface TotalSummaryCardProps {
  stats: DashboardStats;
}

export default function TotalSummaryCard({ stats }: TotalSummaryCardProps) {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 20,
        padding: 24,
        color: 'white',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ fontSize: 36 }}>💰</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 20 }}>Total Payments</div>
          <div style={{ fontSize: 14, opacity: 0.9 }}>All Channels Combined</div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <div style={{ fontSize: 14, opacity: 0.9 }}>Total Transactions</div>
          <div style={{ fontWeight: 800, fontSize: 28 }}>
            {formatNumber(stats.totalPayments)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 14, opacity: 0.9 }}>Average Amount</div>
          <div style={{ fontWeight: 800, fontSize: 22 }}>
            {formatCurrency(stats.averageAmount)}
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
        <div style={{ fontSize: 14, opacity: 0.9 }}>Total Revenue</div>
        <div style={{ fontWeight: 900, fontSize: 32 }}>
          {formatCurrency(stats.totalAmount)}
        </div>
      </div>
    </div>
  );
}