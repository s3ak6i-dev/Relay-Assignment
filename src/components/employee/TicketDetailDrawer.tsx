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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <StatusPill status={ticket.status} />
            <UrgencyBadge urgency={ticket.urgency} />
            {ticket.aiRouted && <AIBadge />}
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.4 }}>{ticket.title}</h2>
        </div>

        <Row label="Raised by" value={ticket.raisedBy} />
        <Row label="Department" value={ticket.category} />
        <Row label="Raised" value={timeAgo(ticket.raisedAt)} />

        <div>
          <Label>Description</Label>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{ticket.description}</p>
        </div>

        {ticket.agentNotes && (
          <div>
            <Label>Agent note</Label>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{ticket.agentNotes}</p>
          </div>
        )}

        <div>
          <Label>Activity</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ticket.activity.map(a => (
              <div key={a.id} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{a.action}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }} className="font-mono">
                  {a.actor} · {timeAgo(a.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 }}>{children}</div>;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <span style={{ fontSize: 13 }}>{value}</span>
    </div>
  );
}
