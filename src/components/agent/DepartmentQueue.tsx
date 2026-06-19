import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusPill } from '../shared/StatusPill';
import { UrgencyBadge } from '../shared/UrgencyBadge';
import { AIBadge } from '../shared/AIBadge';
import { timeAgo } from '../../utils/time';
import type { Ticket, TicketStatus, UrgencyLevel } from '../../types';

const urgencyOrder: Record<UrgencyLevel, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
const filterOptions: (TicketStatus | 'All')[] = ['All', 'Open', 'In Progress'];

const urgencyColors: Record<UrgencyLevel, string> = {
  Critical: '#FF6B35',
  High: '#F59E0B',
  Medium: '#3B82F6',
  Low: '#4B5563',
};

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
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.3px' }}>
            {agentDepartment} queue
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
            {queue.length} open ticket{queue.length !== 1 ? 's' : ''}
            {filter !== 'All' && <span style={{ color: 'var(--text-muted)' }}> · filtered</span>}
          </p>
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value as typeof sort)}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 8,
            padding: '6px 10px',
            color: 'var(--text-primary)',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          <option value="urgency">Sort: Urgency</option>
          <option value="newest">Sort: Newest</option>
          <option value="oldest">Sort: Oldest</option>
        </select>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {filterOptions.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '4px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 500,
              border: '1px solid',
              borderColor: filter === f ? 'var(--accent-border)' : 'var(--border-default)',
              background: filter === f ? 'var(--accent-dim)' : 'transparent',
              color: filter === f ? 'var(--accent)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 140ms ease',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {queue.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '72px 20px',
          color: 'var(--text-muted)',
        }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>◎</div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>
            No open tickets in your queue.
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Check back later or switch department.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {queue.map(t => (
            <TicketCard key={t.id} ticket={t} onClick={() => onSelectTicket(t)} />
          ))}
        </div>
      )}
    </div>
  );
}

function TicketCard({ ticket, onClick }: { ticket: Ticket; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const isCritical = ticket.urgency === 'Critical';
  const borderColor = urgencyColors[ticket.urgency];

  const descExcerpt = ticket.description.length > 110
    ? ticket.description.slice(0, 110) + '…'
    : ticket.description;

  const hoverShadow = isCritical
    ? `-3px 0 16px rgba(255,107,53,0.18), 0 8px 28px rgba(0,0,0,0.55)`
    : `0 8px 28px rgba(0,0,0,0.45)`;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={isCritical ? 'animate-urgency-pulse' : ''}
      style={{
        background: 'var(--bg-surface)',
        borderRadius: 10,
        borderTop: `1px solid ${hovered ? 'var(--border-strong)' : 'var(--border-default)'}`,
        borderRight: `1px solid ${hovered ? 'var(--border-strong)' : 'var(--border-default)'}`,
        borderBottom: `1px solid ${hovered ? 'var(--border-strong)' : 'var(--border-default)'}`,
        borderLeft: `3px solid ${borderColor}`,
        padding: '16px 20px',
        cursor: 'pointer',
        transition: 'transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? hoverShadow : 'var(--shadow-sm)',
      }}
    >
      {/* Top row: urgency badge + status pill */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <UrgencyBadge urgency={ticket.urgency} />
        <StatusPill status={ticket.status} />
      </div>

      {/* Title */}
      <div style={{
        fontSize: 14,
        fontWeight: 500,
        lineHeight: 1.45,
        color: 'var(--text-primary)',
        marginBottom: 8,
      }}>
        {ticket.title}
      </div>

      {/* Description excerpt */}
      <div style={{
        fontSize: 12,
        color: 'var(--text-secondary)',
        lineHeight: 1.6,
        marginBottom: 14,
      }}>
        {descExcerpt}
      </div>

      {/* Meta row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
      }}>
        <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
          {ticket.id}
        </span>
        <Dot />
        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{ticket.raisedBy}</span>
        <Dot />
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(ticket.raisedAt)}</span>
        {ticket.aiRouted && (
          <>
            <Dot />
            <AIBadge />
          </>
        )}
      </div>
    </div>
  );
}

function Dot() {
  return <span style={{ color: 'var(--text-muted)', fontSize: 10, lineHeight: 1 }}>·</span>;
}
