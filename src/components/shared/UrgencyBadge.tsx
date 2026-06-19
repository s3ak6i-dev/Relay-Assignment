import type { UrgencyLevel } from '../../types';

const config: Record<UrgencyLevel, { color: string; bg: string; border: string }> = {
  'Critical': { color: '#FF6B35', bg: 'rgba(255,107,53,0.10)', border: 'rgba(255,107,53,0.25)' },
  'High':     { color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.25)' },
  'Medium':   { color: '#3B82F6', bg: 'rgba(59,130,246,0.10)', border: 'rgba(59,130,246,0.22)' },
  'Low':      { color: '#6B7280', bg: 'rgba(107,114,128,0.10)', border: 'rgba(107,114,128,0.20)' },
};

export function UrgencyBadge({ urgency }: { urgency: UrgencyLevel }) {
  const c = config[urgency];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 7px',
      borderRadius: 4,
      border: `1px solid ${c.border}`,
      background: c.bg,
      color: c.color,
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>
      {urgency}
    </span>
  );
}
