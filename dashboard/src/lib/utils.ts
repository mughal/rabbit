import { PaymentEvent, DashboardStats, PaymentChannel } from './types';

export const CHANNEL_CONFIG: Record<string, Omit<PaymentChannel, 'count' | 'total' | 'average'>> = {
  'payment.mobile': {
    name: 'payment.mobile',
    displayName: 'Mobile App',
    icon: '📱',
    color: '#3B82F6'
  },
  'payment.web': {
    name: 'payment.web',
    displayName: 'Web Portal',
    icon: '🌐',
    color: '#10B981'
  },
  'payment.agent': {
    name: 'payment.agent',
    displayName: 'Agent',
    icon: '👨‍💼',
    color: '#F59E0B'
  },
  'payment.bank': {
    name: 'payment.bank',
    displayName: 'Bank Transfer',
    icon: '🏦',
    color: '#8B5CF6'
  },
  'payment.pos': {
    name: 'payment.pos',
    displayName: 'POS Terminal',
    icon: '💳',
    color: '#EF4444'
  }
};

export function processPaymentEvent(events: PaymentEvent[]): DashboardStats {
  const channelData: Record<string, { count: number; total: number }> = {};
  
  // Initialize all channels
  Object.keys(CHANNEL_CONFIG).forEach(channel => {
    channelData[channel] = { count: 0, total: 0 };
  });

  let totalAmount = 0;
  let totalCount = 0;

  events.forEach(event => {
    const channel = event.routingKey;
    const amount = event.payload.amount || 0;
    
    if (channelData[channel]) {
      channelData[channel].count += 1;
      channelData[channel].total += amount;
      totalCount += 1;
      totalAmount += amount;
    }
  });

  const channels: Record<string, PaymentChannel> = {};
  
  Object.entries(channelData).forEach(([channel, data]) => {
    const config = CHANNEL_CONFIG[channel];
    if (config) {
      channels[channel] = {
        ...config,
        count: data.count,
        total: data.total,
        average: data.count > 0 ? data.total / data.count : 0
      };
    }
  });

  return {
    totalPayments: totalCount,
    totalAmount,
    averageAmount: totalCount > 0 ? totalAmount / totalCount : 0,
    channels
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PKR'
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}