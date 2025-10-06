import { DynamicCardData } from '../../lib/dynamic-types';
import { formatCount, getTimeAgo } from '../../lib/dynamic-utils';

interface DynamicEventCardProps {
  card: DynamicCardData;
}

export default function DynamicEventCard({ card }: DynamicEventCardProps) {
  return (
    <div
      style={{
        border: `2px solid ${card.color}30`,
        borderRadius: 16,
        padding: 20,
        background: `linear-gradient(135deg, ${card.color}08, ${card.color}03)`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ 
          fontSize: 24,
          background: `${card.color}20`,
          borderRadius: 8,
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {card.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: card.color }}>
            {card.displayName}
          </div>
          <div style={{ fontSize: 12, opacity: 0.7, fontFamily: 'monospace' }}>
            {card.routingKey}
          </div>
        </div>
      </div>

      {/* Count */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Total Events</div>
        <div style={{ 
          fontWeight: 800, 
          fontSize: 32, 
          color: card.color,
          lineHeight: 1 
        }}>
          {formatCount(card.count)}
        </div>
      </div>

      {/* Domain & Action Badges */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <span
          style={{
            padding: '4px 8px',
            background: `${card.color}20`,
            color: card.color,
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase'
          }}
        >
          {card.domain}
        </span>
        <span
          style={{
            padding: '4px 8px',
            background: `${card.color}15`,
            color: card.color,
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase'
          }}
        >
          {card.action}
        </span>
      </div>

      {/* Footer */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        fontSize: 11,
        opacity: 0.7
      }}>
        <span>Last event</span>
        <span>{getTimeAgo(card.lastUpdated)}</span>
      </div>
    </div>
  );
}