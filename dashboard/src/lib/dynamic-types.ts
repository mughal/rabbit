export type DynamicEvent = {
  routingKey: string; // format: domain.entity.action
  payload: any;
  ts?: string;
};

export type DynamicCardData = {
  routingKey: string;
  domain: string;
  entity: string;
  action: string;
  displayName: string;
  icon: string;
  color: string;
  count: number;
  lastUpdated: string;
  sampleData?: any;
};

export type DynamicDashboard = {
  cards: Record<string, DynamicCardData>;
  totalEvents: number;
  uniqueDomains: string[];
};