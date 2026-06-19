import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis,
  LineChart, Line,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { UrgencyBadge } from '../shared/UrgencyBadge';
import { timeAgo } from '../../utils/time';
import type { TicketStatus } from '../../types';

const STATUS_COLORS: Record<TicketStatus, string> = {
  'Open': '#3B82F6',
  'In Progress': '#F59E0B',
  'Resolved': '#22C55E',
  'Closed': '#6B7280',
};

export function AnalyticsDashboard() {
  const { tickets } = useApp();

  if (tickets.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--text-secondary)' }}>
        No tickets yet. Data will appear here once tickets are raised.
      </div>
    );
  }

  // Stat calculations
  const total = tickets.length;
  const open = tickets.filter(t => t.status === 'Open').length;
  const today = new Date().toDateString();
  const resolvedToday = tickets.filter(
    t => t.status === 'Resolved' && new Date(t.updatedAt).toDateString() === today
  ).length;

  const resolved = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed');
  const avgResolutionMs = resolved.length > 0
    ? resolved.reduce((sum, t) => sum + (new Date(t.updatedAt).getTime() - new Date(t.raisedAt).getTime()), 0) / resolved.length
    : 0;
  const avgHours = (avgResolutionMs / 3600000).toFixed(1);

  // Donut data
  const statusData: { name: TicketStatus; value: number }[] = (['Open', 'In Progress', 'Resolved', 'Closed'] as TicketStatus[])
    .map(s => ({ name: s, value: tickets.filter(t => t.status === s).length }))
    .filter(d => d.value > 0);

  // Bar data
  const depts = ['IT', 'HR', 'Finance', 'Admin'] as const;
  const deptData = depts.map(d => ({ dept: d, count: tickets.filter(t => t.category === d).length }));

  // Line chart: last 30 days
  const now = Date.now();
  const dayMs = 86400000;
  const lineData = Array.from({ length: 30 }, (_, i) => {
    const dayStart = new Date(now - (29 - i) * dayMs);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + dayMs);
    const count = tickets.filter(t => {
      const d = new Date(t.raisedAt).getTime();
      return d >= dayStart.getTime() && d < dayEnd.getTime();
    }).length;
    return {
      day: dayStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      count,
    };
  });

  // Flagged: High/Critical open > 48h
  const cutoff = now - 48 * 3600000;
  const flagged = tickets.filter(
    t => (t.urgency === 'High' || t.urgency === 'Critical') &&
      t.status === 'Open' &&
      new Date(t.raisedAt).getTime() < cutoff
  );

  const tooltipStyle = {
    background: '#1A1A1A', border: '1px solid #2A2A2A',
    borderRadius: 8, fontSize: 12, color: '#F5F5F5',
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 500 }}>Overview</h1>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Last 30 days</span>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total tickets', value: total },
          { label: 'Open', value: open },
          { label: 'Resolved today', value: resolvedToday },
          { label: 'Avg. resolution', value: `${avgHours}h` },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--bg-surface)', borderRadius: 8,
            padding: '16px 20px', border: '1px solid var(--border-default)',
          }}>
            <div style={{ fontSize: 24, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <ChartPanel title="Tickets by status">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {statusData.map(d => <Cell key={d.name} fill={STATUS_COLORS[d.name]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {statusData.map(d => (
              <span key={d.name} style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[d.name], display: 'inline-block' }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </ChartPanel>

        <ChartPanel title="Tickets by department">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptData} layout="vertical" margin={{ left: 0, right: 16 }}>
              <XAxis type="number" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="dept" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#2A2A2A' }} />
              <Bar dataKey="count" name="Tickets" fill="#FF6B35" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      {/* Charts row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <ChartPanel title="Weekly volume">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={lineData} margin={{ left: 0, right: 8 }}>
              <XAxis dataKey="day" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false}
                interval={Math.floor(lineData.length / 5)} />
              <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="count" name="Tickets" stroke="#FF6B35" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Flagged — open > 48h">
          {flagged.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)', fontSize: 13 }}>
              No flagged tickets. All clear.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {flagged.map(t => (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 0', borderBottom: '1px solid var(--border-subtle)',
                }}>
                  <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{t.id}</span>
                  <span style={{ fontSize: 13, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                  <UrgencyBadge urgency={t.urgency} />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{timeAgo(t.raisedAt)}</span>
                </div>
              ))}
            </div>
          )}
        </ChartPanel>
      </div>
    </div>
  );
}

function ChartPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--bg-surface)', borderRadius: 8,
      border: '1px solid var(--border-default)',
      padding: '16px 20px',
    }}>
      <h3 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 16 }}>{title}</h3>
      {children}
    </div>
  );
}
