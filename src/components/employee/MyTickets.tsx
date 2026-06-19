import { useState } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { useApp } from '../../context/AppContext';
import { StatusPill } from '../shared/StatusPill';
import { UrgencyBadge } from '../shared/UrgencyBadge';
import { TicketDetailDrawer } from './TicketDetailDrawer';
import { timeAgo } from '../../utils/time';
import type { Ticket, UrgencyLevel } from '../../types';
import type { Page } from '../shared/Sidebar';

interface Props { onNavigate: (page: Page) => void; }

const urgencyColors: Record<UrgencyLevel, string> = {
  Critical: '#FF6B35',
  High: '#F59E0B',
  Medium: '#3B82F6',
  Low: '#4B5563',
};

export function MyTickets({ onNavigate }: Props) {
  const { tickets, currentUser } = useApp();
  const [selected, setSelected] = useState<Ticket | null>(null);

  const mine = tickets
    .filter(t => !currentUser || t.raisedBy === currentUser)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <>
      <div className="animate-slide-up">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.3px' }}>My tickets</h1>
            {mine.length > 0 && (
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
                {mine.length} ticket{mine.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <button
            onClick={() => onNavigate('new-ticket')}
            style={{
              background: 'var(--gradient-accent)',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 8px rgba(255,107,53,0.30)',
              transition: 'opacity 120ms, box-shadow 120ms',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.opacity = '0.9';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(255,107,53,0.40)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(255,107,53,0.30)';
            }}
          >
            <IconPlus size={14} strokeWidth={2.5} />
            Raise a ticket
          </button>
        </div>

        {mine.length === 0 ? (
          <EmptyState onNavigate={onNavigate} />
        ) : (
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: 12,
            border: '1px solid var(--border-default)',
            overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                  {/* Urgency strip column */}
                  <th style={{ width: 3, padding: 0 }} />
                  {['ID', 'Title', 'Dept', 'Status', 'Urgency', 'Updated'].map(h => (
                    <th key={h} style={{
                      padding: '10px 14px',
                      textAlign: 'left',
                      fontSize: 10,
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.7px',
                      whiteSpace: 'nowrap',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mine.map((t, i) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelected(t)}
                    style={{
                      borderTop: i > 0 ? '1px solid var(--border-subtle)' : undefined,
                      cursor: 'pointer',
                      transition: 'background 100ms',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Urgency color strip */}
                    <td style={{
                      width: 3,
                      padding: 0,
                      background: urgencyColors[t.urgency],
                    }} />
                    <td style={{ padding: '13px 14px' }}>
                      <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>{t.id}</span>
                    </td>
                    <td style={{ padding: '13px 14px', maxWidth: 280 }}>
                      <span style={{
                        fontSize: 13,
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontWeight: 500,
                      }}>
                        {t.title}
                      </span>
                    </td>
                    <td style={{ padding: '13px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>
                      {t.category}
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      <StatusPill status={t.status} />
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      <UrgencyBadge urgency={t.urgency} />
                    </td>
                    <td style={{ padding: '13px 14px' }} className="font-mono">
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        {timeAgo(t.updatedAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && <TicketDetailDrawer ticket={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

function EmptyState({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{
      textAlign: 'center',
      padding: '80px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 16,
        background: 'var(--accent-dim)',
        border: '1px solid var(--accent-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 16, fontSize: 22,
      }}>
        📋
      </div>
      <p style={{ fontSize: 15, color: 'var(--text-primary)', fontWeight: 500, marginBottom: 4 }}>
        No tickets yet
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
        You haven't raised any tickets yet.
      </p>
      <button
        onClick={() => onNavigate('new-ticket')}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? 'var(--accent-dim)' : 'transparent',
          border: `1px solid ${hovered ? 'var(--accent-border)' : 'var(--border-default)'}`,
          borderRadius: 8,
          padding: '8px 18px',
          color: hovered ? 'var(--accent)' : 'var(--text-secondary)',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 6,
          transition: 'all 140ms ease',
        }}
      >
        <IconPlus size={13} /> Raise your first ticket
      </button>
    </div>
  );
}
