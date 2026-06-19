import type { UrgencyLevel } from '../../types';

const config: Record<UrgencyLevel, { color: string; bg: string }> = {
  'Critical': { color: '#FF6B35', bg: '#FF6B3520' },
  'High':     { color: '#F59E0B', bg: '#F59E0B20' },
  'Medium':   { color: '#3B82F6', bg: '#3B82F620' },
  'Low':      { color: '#6B7280', bg: '#6B728020' },
};

export function UrgencyBadge({ urgency }: { urgency: UrgencyLevel }) {
  const c = config[urgency];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 6px', borderRadius: 4,
      background: c.bg, color: c.color,
      fontSize: 10, fontWeight: 500, letterSpacing: '0.04em',
      textTransform: 'uppercase',
    }}>
      {urgency}
    </span>
  );
}
