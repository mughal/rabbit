import { DynamicEvent, DynamicCardData } from '../../lib/dynamic-types';
import { processDynamicEvent } from '../../lib/dynamic-utils';
import DynamicEventCard from './DynamicEventCard';

interface DynamicDashboardProps {
  events: DynamicEvent[];
  connected: boolean;
}

export default function DynamicDashboard({ events, connected }: DynamicDashboardProps) {
  const dashboard = processDynamicEvent(events);
  const cards: DynamicCardData[] = Object.values(dashboard.cards);
  
  // Sort cards by count (descending)
  cards.sort((a, b) => b.count - a.count);

  return (
    <div style={{ marginTop: 24 }}>
      {/* Dashboard Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 24,
        padding: 16,
        background: 'white',
        borderRadius: 12,
        border: '1px solid rgba(0,0,0,0.08)'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Dynamic Event Dashboard</h2>
          <p style={{ margin: 0, opacity: 0.7, fontSize: 14 }}>
            Auto-discovering events from RabbitMQ topics
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Total Events</div>
            <div style={{ fontWeight: 700, fontSize: 20 }}>{dashboard.totalEvents.toLocaleString()}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Unique Streams</div>
            <div style={{ fontWeight: 700, fontSize: 20 }}>{cards.length}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Domains</div>
            <div style={{ fontWeight: 700, fontSize: 20 }}>{dashboard.uniqueDomains.length}</div>
          </div>
        </div>
      </div>

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
          background: connected ? '#16A34A' : '#DC2626',
          animation: connected ? 'pulse 2s infinite' : 'none'
        }} />
        <span style={{ fontWeight: 600, color: connected ? '#166534' : '#991B1B' }}>
          {connected ? 'Connected - Listening for new event streams' : 'Disconnected'}
        </span>
      </div>

      {/* Dynamic Cards Grid */}
      {cards.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 60,
          background: 'rgba(0,0,0,0.02)',
          borderRadius: 12,
          border: '2px dashed rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 18 }}>No Event Streams Discovered Yet</h3>
          <p style={{ margin: 0, opacity: 0.7 }}>
            Send events with domain.entity.action routing keys to see dynamic cards appear here
          </p>
          <div style={{ 
            marginTop: 16, 
            padding: 12, 
            background: 'rgba(0,0,0,0.03)', 
            borderRadius: 8,
            fontFamily: 'monospace',
            fontSize: 12
          }}>
            Try: <code>node publish.mjs auth.user.created</code>
          </div>
        </div>
      ) : (
        <>
          {/* Domain Filters */}
          <div style={{ 
            display: 'flex', 
            gap: 8, 
            marginBottom: 20,
            flexWrap: 'wrap'
          }}>
            <span style={{
              padding: '6px 12px',
              background: '#3B82F6',
              color: 'white',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600
            }}>
              All ({cards.length})
            </span>
            {dashboard.uniqueDomains.map(domain => (
              <span 
                key={domain}
                style={{
                  padding: '6px 12px',
                  background: 'rgba(0,0,0,0.08)',
                  color: 'rgba(0,0,0,0.8)',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {domain} ({cards.filter(c => c.domain === domain).length})
              </span>
            ))}
          </div>

          {/* Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 20
          }}>
            {cards.map(card => (
              <DynamicEventCard key={card.routingKey} card={card} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}