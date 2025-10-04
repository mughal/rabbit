export type PaymentEvent = {
  routingKey: string;
  payload: {
    channel: string;
    amount: number;
    timestamp: string;
    customerId?: string;
    paymentMethod?: string;
    status?: 'success' | 'failed' | 'pending';
  };
  ts?: string;
};

export type PaymentChannel = {
  name: string;
  displayName: string;
  icon: string;
  color: string;
  count: number;
  total: number;
  average: number;
};

export type DashboardStats = {
  totalPayments: number;
  totalAmount: number;
  averageAmount: number;
  channels: Record<string, PaymentChannel>;
};