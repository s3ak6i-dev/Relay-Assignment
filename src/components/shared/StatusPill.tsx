import type { TicketStatus } from '../../types';

const config: Record<TicketStatus, { color: string; bg: string; border: string }> = {
  'Open':        { color: '#3B82F6', bg: 'rgba(59,130,246,0.10)',  border: 'rgba(59,130,246,0.22)' },
  'In Progress': { color: '#F59E0B', bg: 'rgba(245,158,11,0.10)',  border: 'rgba(245,158,11,0.22)' },
  'Resolved':    { color: '#22C55E', bg: 'rgba(34,197,94,0.10)',   border: 'rgba(34,197,94,0.22)' },
  'Closed':      { color: '#717180', bg: 'rgba(113,113,128,0.10)', border: 'rgba(113,113,128,0.20)' },
};

export function StatusPill({ status }: { status: TicketStatus }) {
  const c = config[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 8px',
      borderRadius: 4,
      border: `1px solid ${c.border}`,
      background: c.bg,
      color: c.color,
      fontSize: 11,
      fontWeight: 500,
      whiteSpace: 'nowrap',
      letterSpacing: '0.1px',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
      {status}
    </span>
  );
}
