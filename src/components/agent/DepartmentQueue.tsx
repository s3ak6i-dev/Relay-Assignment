import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusPill } from '../shared/StatusPill';
import { UrgencyBadge } from '../shared/UrgencyBadge';
import { AIBadge } from '../shared/AIBadge';
import { timeAgo } from '../../utils/time';
import type { Ticket, TicketStatus, UrgencyLevel } from '../../types';

const urgencyOrder: Record<UrgencyLevel, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
const filterOptions: (TicketStatus | 'All')[] = ['All', 'Open', 'In Progress'];

interface Props { onSelectTicket: (ticket: Ticket) => void; }

export function DepartmentQueue({ onSelectTicket }: Props) {
  const { tickets, agentDepartment } = useApp();
  const [filter, setFilter] = useState<TicketStatus | 'All'>('All');
  const [sort, setSort] = useState<'urgency' | 'newest' | 'oldest'>('urgency');

  let queue = tickets.filter(t =>
    t.category === agentDepartment &&
    (t.status === 'Open' || t.status === 'In Progress')
  );

  if (filter !== 'All') queue = queue.filter(t => t.status === filter);

  queue = [...queue].sort((a, b) => {
    if (sort === 'urgency') {
      const diff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      if (diff !== 0) return diff;
      return new Date(a.raisedAt).getTime() - new Date(b.raisedAt).getTime();
    }
    if (sort === 'newest') return new Date(b.raisedAt).getTime() - new Date(a.raisedAt).getTime();
    return new Date(a.raisedAt).getTime() - new Date(b.raisedAt).getTime();
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500 }}>{agentDepartment} queue</h1>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            {queue.length} open ticket{queue.length !== 1 ? 's' : ''}
          </p>
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value as typeof sort)}
          style={{
            background: 'var(--bg-input)', border: '1px solid var(--border-default)',
            borderRadius: 8, padding: '6px 10px', color: 'var(--text-primary)', fontSize: 12,
          }}
        >
          <option value="urgency">Sort: Urgency</option>
          <option value="newest">Sort: Newest</option>
          <option value="oldest">Sort: Oldest</option>
        </select>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {filterOptions.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
              border: '1px solid',
              borderColor: filter === f ? 'var(--accent)' : 'var(--border-default)',
              background: filter === f ? 'var(--accent-dim)' : 'transparent',
              color: filter === f ? 'var(--accent)' : 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {queue.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--text-secondary)' }}>
          No open tickets in your queue.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {queue.map(t => (
            <TicketCard key={t.id} ticket={t} onClick={() => onSelectTicket(t)} />
          ))}
        </div>
      )}
    </div>
  );
}

function TicketCard({ ticket, onClick }: { ticket: Ticket; onClick: () => void }) {
  const urgencyColors: Record<UrgencyLevel, string> = {
    Critical: '#FF6B35',
    High: '#F59E0B',
    Medium: '#3B82F6',
    Low: '#6B7280',
  };
  const isCritical = ticket.urgency === 'Critical';

  return (
    <div
      onClick={onClick}
      className={isCritical ? 'animate-urgency-pulse' : ''}
      style={{
        background: 'var(--bg-surface)',
        borderRadius: 8,
        borderLeft: `3px solid ${urgencyColors[ticket.urgency]}`,
        borderTop: '1px solid var(--border-default)',
        borderRight: '1px solid var(--border-default)',
        borderBottom: '1px solid var(--border-default)',
        padding: '14px 16px',
        cursor: 'pointer',
        transition: 'border-color 150ms',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget;
        el.style.borderTopColor = '#3A3A3A';
        el.style.borderRightColor = '#3A3A3A';
        el.style.borderBottomColor = '#3A3A3A';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget;
        el.style.borderTopColor = 'var(--border-default)';
        el.style.borderRightColor = 'var(--border-default)';
        el.style.borderBottomColor = 'var(--border-default)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <UrgencyBadge urgency={ticket.urgency} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>{ticket.title}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ticket.id}</span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{ticket.raisedBy}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(ticket.raisedAt)}</span>
            {ticket.aiRouted && <AIBadge />}
          </div>
        </div>
        <StatusPill status={ticket.status} />
      </div>
    </div>
  );
}
