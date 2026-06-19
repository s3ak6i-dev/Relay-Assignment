import { Drawer } from '../shared/Drawer';
import { StatusPill } from '../shared/StatusPill';
import { UrgencyBadge } from '../shared/UrgencyBadge';
import { AIBadge } from '../shared/AIBadge';
import { timeAgo } from '../../utils/time';
import type { Ticket } from '../../types';

interface Props { ticket: Ticket; onClose: () => void; }

export function TicketDetailDrawer({ ticket, onClose }: Props) {
  return (
    <Drawer title={ticket.id} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* Title + badges */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
            <StatusPill status={ticket.status} />
            <UrgencyBadge urgency={ticket.urgency} />
            {ticket.aiRouted && <AIBadge />}
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.45, letterSpacing: '-0.2px' }}>
            {ticket.title}
          </h2>
        </div>

        {/* Meta grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 10, padding: '14px 16px',
        }}>
          <MetaItem label="Raised by" value={ticket.raisedBy} />
          <MetaItem label="Department" value={ticket.category} />
          <MetaItem label="Raised" value={timeAgo(ticket.raisedAt)} />
          <MetaItem label="Updated" value={timeAgo(ticket.updatedAt)} />
        </div>

        {/* Description */}
        <div>
          <DrawerLabel>Description</DrawerLabel>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.75 }}>
            {ticket.description}
          </p>
        </div>

        {/* Agent note */}
        {ticket.agentNotes && (
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderLeft: '3px solid var(--accent)',
            borderRadius: 10,
            padding: '14px 16px',
          }}>
            <DrawerLabel>Agent note</DrawerLabel>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.75 }}>
              {ticket.agentNotes}
            </p>
          </div>
        )}

        {/* Activity */}
        <div>
          <DrawerLabel>Activity</DrawerLabel>
          <div style={{ position: 'relative' }}>
            {ticket.activity.length > 1 && (
              <div style={{
                position: 'absolute', left: 5, top: 8, bottom: 4,
                width: 1, background: 'var(--border-default)',
                zIndex: 0,
              }} />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {ticket.activity.map(a => {
                const isAI = a.actor === 'AI';
                return (
                  <div key={a.id} style={{ display: 'flex', gap: 12, position: 'relative', zIndex: 1 }}>
                    <div style={{
                      width: 11, height: 11, borderRadius: '50%', flexShrink: 0,
                      background: isAI ? 'var(--accent)' : 'var(--bg-raised)',
                      border: `2px solid ${isAI ? 'var(--accent)' : 'var(--border-strong)'}`,
                      marginTop: 3,
                    }} />
                    <div>
                      <div style={{ fontSize: 13, lineHeight: 1.4 }}>{a.action}</div>
                      <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
                        {a.actor} · {timeAgo(a.timestamp)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

function DrawerLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 600,
      color: 'var(--text-muted)',
      textTransform: 'uppercase', letterSpacing: '0.7px',
      marginBottom: 8,
    }}>
      {children}
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <DrawerLabel>{label}</DrawerLabel>
      <span style={{ fontSize: 13 }}>{value}</span>
    </div>
  );
}
