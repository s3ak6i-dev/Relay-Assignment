import type { TicketStatus } from '../../types';

const config: Record<TicketStatus, { color: string; bg: string; dot: string }> = {
  'Open':        { color: '#3B82F6', bg: '#3B82F620', dot: '#3B82F6' },
  'In Progress': { color: '#F59E0B', bg: '#F59E0B20', dot: '#F59E0B' },
  'Resolved':    { color: '#22C55E', bg: '#22C55E20', dot: '#22C55E' },
  'Closed':      { color: '#6B7280', bg: '#6B728020', dot: '#6B7280' },
};

export function StatusPill({ status }: { status: TicketStatus }) {
  const c = config[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 4,
      background: c.bg, color: c.color,
      fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot }} />
      {status}
    </span>
  );
}
