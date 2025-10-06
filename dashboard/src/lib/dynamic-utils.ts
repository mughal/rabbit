import { DynamicEvent, DynamicCardData, DynamicDashboard } from './dynamic-types';

// Icon and color mappings based on domain/entity/action patterns
const DOMAIN_ICONS: Record<string, string> = {
  auth: '🔐',
  user: '👤',
  payment: '💰',
  order: '📦',
  inventory: '📊',
  notification: '🔔',
  system: '⚙️',
  api: '🌐',
  default: '📄'
};

const DOMAIN_COLORS: Record<string, string> = {
  auth: '#EF4444',
  user: '#3B82F6',
  payment: '#10B981',
  order: '#F59E0B',
  inventory: '#8B5CF6',
  notification: '#EC4899',
  system: '#6B7280',
  api: '#06B6D4',
  default: '#9CA3AF'
};

const ACTION_COLORS: Record<string, string> = {
  created: '#10B981',
  updated: '#F59E0B',
  deleted: '#EF4444',
  processed: '#3B82F6',
  sent: '#8B5CF6',
  received: '#EC4899',
  failed: '#DC2626',
  completed: '#059669'
};

export function parseRoutingKey(routingKey: string): { domain: string; entity: string; action: string } {
  const parts = routingKey.split('.');
  return {
    domain: parts[0] || 'unknown',
    entity: parts[1] || 'unknown',
    action: parts[2] || 'unknown'
  };
}

export function generateDisplayName(domain: string, entity: string, action: string): string {
  const entityFormatted = entity.charAt(0).toUpperCase() + entity.slice(1);
  const actionFormatted = action.charAt(0).toUpperCase() + action.slice(1);
  return `${entityFormatted} ${actionFormatted}`;
}

export function getIconForDomain(domain: string): string {
  return DOMAIN_ICONS[domain] || DOMAIN_ICONS.default;
}

export function getColorForCard(domain: string, action: string): string {
  return ACTION_COLORS[action] || DOMAIN_COLORS[domain] || DOMAIN_COLORS.default;
}

export function processDynamicEvent(events: DynamicEvent[]): DynamicDashboard {
  const cards: Record<string, DynamicCardData> = {};
  let totalEvents = 0;
  const domains = new Set<string>();

  events.forEach(event => {
    totalEvents++;
    const { domain, entity, action } = parseRoutingKey(event.routingKey);
    domains.add(domain);

    const cardKey = event.routingKey;
    
    if (!cards[cardKey]) {
      cards[cardKey] = {
        routingKey: event.routingKey,
        domain,
        entity,
        action,
        displayName: generateDisplayName(domain, entity, action),
        icon: getIconForDomain(domain),
        color: getColorForCard(domain, action),
        count: 0,
        lastUpdated: event.ts || new Date().toISOString(),
        sampleData: event.payload
      };
    }

    cards[cardKey].count++;
    cards[cardKey].lastUpdated = event.ts || new Date().toISOString();
    
    // Keep a sample of the latest payload
    if (Math.random() < 0.1) { // 10% chance to update sample data
      cards[cardKey].sampleData = event.payload;
    }
  });

  return {
    cards,
    totalEvents,
    uniqueDomains: Array.from(domains)
  };
}

export function formatCount(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
}

export function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}