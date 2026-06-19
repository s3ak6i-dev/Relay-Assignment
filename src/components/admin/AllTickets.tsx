import { useState } from 'react';
import { IconSearch } from '@tabler/icons-react';
import { useApp } from '../../context/AppContext';
import { StatusPill } from '../shared/StatusPill';
import { UrgencyBadge } from '../shared/UrgencyBadge';
import { AIBadge } from '../shared/AIBadge';
import { timeAgo } from '../../utils/time';
import type { Department, TicketStatus, UrgencyLevel } from '../../types';

const ALL = 'All';

const urgencyColors: Record<UrgencyLevel, string> = {
  Critical: '#FF6B35', High: '#F59E0B', Medium: '#3B82F6', Low: '#4B5563',
};

export function AllTickets() {
  const { tickets } = useApp();

  const [statusFilter, setStatusFilter] = useState<TicketStatus | typeof ALL>(ALL);
  const [deptFilter, setDeptFilter] = useState<Department | typeof ALL>(ALL);
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyLevel | typeof ALL>(ALL);
  const [search, setSearch] = useState('');

  const filtered = tickets
    .filter(t => statusFilter === ALL || t.status === statusFilter)
    .filter(t => deptFilter === ALL || t.category === deptFilter)
    .filter(t => urgencyFilter === ALL || t.urgency === urgencyFilter)
    .filter(t =>
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.raisedBy.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const selectStyle: React.CSSProperties = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    borderRadius: 8,
    padding: '7px 10px',
    color: 'var(--text-primary)',
    fontSize: 12,
    cursor: 'pointer',
  };

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.3px' }}>All tickets</h1>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
            {filtered.length} of {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
            {filtered.length < tickets.length && (
              <span style={{ color: 'var(--text-muted)' }}> · filtered</span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <IconSearch
            size={13}
            style={{
              position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-muted)', pointerEvents: 'none',
            }}
          />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, ID, or name…"
            style={{
              ...selectStyle,
              paddingLeft: 30,
              width: '100%',
            }}
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as TicketStatus | typeof ALL)} style={selectStyle}>
          <option value={ALL}>All statuses</option>
          {(['Open', 'In Progress', 'Resolved', 'Closed'] as TicketStatus[]).map(s =>
            <option key={s} value={s}>{s}</option>
          )}
        </select>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value as Department | typeof ALL)} style={selectStyle}>
          <option value={ALL}>All departments</option>
          {(['IT', 'HR', 'Finance', 'Admin'] as Department[]).map(d =>
            <option key={d} value={d}>{d}</option>
          )}
        </select>
        <select value={urgencyFilter} onChange={e => setUrgencyFilter(e.target.value as UrgencyLevel | typeof ALL)} style={selectStyle}>
          <option value={ALL}>All urgency</option>
          {(['Critical', 'High', 'Medium', 'Low'] as UrgencyLevel[]).map(u =>
            <option key={u} value={u}>{u}</option>
          )}
        </select>
      </div>

      {/* Table */}
      <div style={{
        background: 'var(--bg-surface)',
        borderRadius: 12,
        border: '1px solid var(--border-default)',
        overflow: 'hidden',
      }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            <div style={{ fontSize: 24, marginBottom: 10 }}>◎</div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 2 }}>No tickets match your filters.</p>
            <p style={{ fontSize: 11 }}>Try adjusting your search or filters above.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                <th style={{ width: 3, padding: 0 }} />
                {['ID', 'Title', 'Raised by', 'Dept', 'Status', 'Urgency', 'Updated'].map(h => (
                  <th key={h} style={{
                    padding: '10px 14px',
                    textAlign: 'left',
                    fontSize: 10, fontWeight: 600,
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
              {filtered.map((t, i) => (
                <tr
                  key={t.id}
                  style={{
                    borderTop: i > 0 ? '1px solid var(--border-subtle)' : undefined,
                    transition: 'background 100ms',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ width: 3, padding: 0, background: urgencyColors[t.urgency] }} />
                  <td style={{ padding: '13px 14px' }}>
                    <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>{t.id}</span>
                  </td>
                  <td style={{ padding: '13px 14px', maxWidth: 260 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{
                        fontSize: 13, fontWeight: 500,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {t.title}
                      </span>
                      {t.aiRouted && <AIBadge label="AI" />}
                    </div>
                  </td>
                  <td style={{ padding: '13px 14px', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {t.raisedBy}
                  </td>
                  <td style={{ padding: '13px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{t.category}</td>
                  <td style={{ padding: '13px 14px' }}><StatusPill status={t.status} /></td>
                  <td style={{ padding: '13px 14px' }}><UrgencyBadge urgency={t.urgency} /></td>
                  <td style={{ padding: '13px 14px' }}>
                    <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      {timeAgo(t.updatedAt)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
