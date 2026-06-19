import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusPill } from '../shared/StatusPill';
import { UrgencyBadge } from '../shared/UrgencyBadge';
import { AIBadge } from '../shared/AIBadge';
import { timeAgo } from '../../utils/time';
import type { Department, TicketStatus, UrgencyLevel } from '../../types';

const ALL = 'All';

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
    background: 'var(--bg-input)', border: '1px solid var(--border-default)',
    borderRadius: 8, padding: '6px 10px', color: 'var(--text-primary)',
    fontSize: 12, cursor: 'pointer',
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500 }}>All tickets</h1>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            {filtered.length} of {tickets.length} tickets
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by title, ID, or name…"
          style={{
            ...selectStyle, flex: 1, minWidth: 200,
            padding: '6px 12px',
          }}
        />
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
        background: 'var(--bg-surface)', borderRadius: 8,
        border: '1px solid var(--border-default)', overflow: 'hidden',
      }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
            No tickets match your filters.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                {['ID', 'Title', 'Raised by', 'Dept', 'Status', 'Urgency', 'Updated'].map(h => (
                  <th key={h} style={{
                    padding: '10px 14px', textAlign: 'left',
                    fontSize: 11, fontWeight: 500, color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.6px', whiteSpace: 'nowrap',
                  }}>{h}</th>
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
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#1F1F1F')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '12px 14px' }}>
                    <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.id}</span>
                  </td>
                  <td style={{ padding: '12px 14px', maxWidth: 280 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.title}
                      </span>
                      {t.aiRouted && <AIBadge label="AI" />}
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {t.raisedBy}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{t.category}</td>
                  <td style={{ padding: '12px 14px' }}><StatusPill status={t.status} /></td>
                  <td style={{ padding: '12px 14px' }}><UrgencyBadge urgency={t.urgency} /></td>
                  <td style={{ padding: '12px 14px' }}>
                    <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
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
