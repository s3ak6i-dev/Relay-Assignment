import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusPill } from '../shared/StatusPill';
import { UrgencyBadge } from '../shared/UrgencyBadge';
import { TicketDetailDrawer } from './TicketDetailDrawer';
import { timeAgo } from '../../utils/time';
import type { Ticket } from '../../types';
import type { Page } from '../shared/Sidebar';

interface Props { onNavigate: (page: Page) => void; }

export function MyTickets({ onNavigate }: Props) {
  const { tickets, currentUser } = useApp();
  const [selected, setSelected] = useState<Ticket | null>(null);

  const mine = tickets
    .filter(t => !currentUser || t.raisedBy === currentUser)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 500 }}>My tickets</h1>
          <button
            onClick={() => onNavigate('new-ticket')}
            style={{
              background: 'var(--accent)', border: 'none', borderRadius: 8,
              padding: '8px 16px', color: '#fff', cursor: 'pointer',
              fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            + Raise a ticket
          </button>
        </div>

        {mine.length === 0 ? (
          <EmptyState onNavigate={onNavigate} />
        ) : (
          <div style={{
            background: 'var(--bg-surface)', borderRadius: 8,
            border: '1px solid var(--border-default)', overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                  {['ID', 'Title', 'Dept', 'Status', 'Urgency', 'Updated'].map(h => (
                    <th key={h} style={{
                      padding: '10px 14px', textAlign: 'left',
                      fontSize: 11, fontWeight: 500, color: 'var(--text-muted)',
                      textTransform: 'uppercase', letterSpacing: '0.6px',
                    }}>{h}</th>
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
                    onMouseEnter={e => (e.currentTarget.style.background = '#1F1F1F')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 14px' }}>
                      <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.id}</span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 13, maxWidth: 260 }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.title}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{t.category}</td>
                    <td style={{ padding: '12px 14px' }}><StatusPill status={t.status} /></td>
                    <td style={{ padding: '12px 14px' }}><UrgencyBadge urgency={t.urgency} /></td>
                    <td style={{ padding: '12px 14px', fontSize: 11, color: 'var(--text-muted)' }} className="font-mono">
                      {timeAgo(t.updatedAt)}
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
  return (
    <div style={{
      textAlign: 'center', padding: '64px 20px',
      color: 'var(--text-secondary)',
    }}>
      <p style={{ fontSize: 15, marginBottom: 12 }}>You haven't raised any tickets yet.</p>
      <button
        onClick={() => onNavigate('new-ticket')}
        style={{
          background: 'none', border: 'none', color: 'var(--accent)',
          cursor: 'pointer', fontSize: 14, fontWeight: 500,
        }}
      >
        Raise your first ticket →
      </button>
    </div>
  );
}
