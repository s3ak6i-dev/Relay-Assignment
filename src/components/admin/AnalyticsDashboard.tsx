import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis,
  Area, AreaChart,
} from 'recharts';
import {
  IconTicket, IconAlertCircle, IconCircleCheck, IconClock, IconAlertTriangle,
} from '@tabler/icons-react';
import { useApp } from '../../context/AppContext';
import { UrgencyBadge } from '../shared/UrgencyBadge';
import { timeAgo } from '../../utils/time';
import type { TicketStatus } from '../../types';

const STATUS_COLORS: Record<TicketStatus, string> = {
  'Open':        '#3B82F6',
  'In Progress': '#F59E0B',
  'Resolved':    '#22C55E',
  'Closed':      '#525260',
};

const tooltipStyle = {
  background: '#161616',
  border: '1px solid #222',
  borderRadius: 8,
  fontSize: 12,
  color: '#EBEBEB',
  boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
};

export function AnalyticsDashboard() {
  const { tickets } = useApp();

  if (tickets.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: 32, marginBottom: 14, color: 'var(--text-muted)' }}>◎</div>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 6 }}>No tickets yet.</p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Data will appear here once tickets are raised.
        </p>
      </div>
    );
  }

  // Stats
  const total = tickets.length;
  const open = tickets.filter(t => t.status === 'Open').length;
  const inProgress = tickets.filter(t => t.status === 'In Progress').length;
  const today = new Date().toDateString();
  const resolvedToday = tickets.filter(
    t => t.status === 'Resolved' && new Date(t.updatedAt).toDateString() === today
  ).length;
  const resolved = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed');
  const avgResolutionMs = resolved.length > 0
    ? resolved.reduce((s, t) => s + (new Date(t.updatedAt).getTime() - new Date(t.raisedAt).getTime()), 0) / resolved.length
    : 0;
  const avgHours = (avgResolutionMs / 3600000).toFixed(1);

  // Chart data
  const statusData = (['Open', 'In Progress', 'Resolved', 'Closed'] as TicketStatus[])
    .map(s => ({ name: s, value: tickets.filter(t => t.status === s).length }))
    .filter(d => d.value > 0);

  const deptData = ['IT', 'HR', 'Finance', 'Admin'].map(d => ({
    dept: d,
    count: tickets.filter(t => t.category === d).length,
  }));

  // Line chart: last 30 days
  const now = Date.now();
  const dayMs = 86400000;
  const lineData = Array.from({ length: 30 }, (_, i) => {
    const dayStart = new Date(now - (29 - i) * dayMs);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + dayMs);
    return {
      day: dayStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      count: tickets.filter(t => {
        const d = new Date(t.raisedAt).getTime();
        return d >= dayStart.getTime() && d < dayEnd.getTime();
      }).length,
    };
  });

  // Flagged: High/Critical open > 48h
  const cutoff = now - 48 * 3600000;
  const flagged = tickets.filter(
    t => (t.urgency === 'High' || t.urgency === 'Critical') &&
      t.status === 'Open' &&
      new Date(t.raisedAt).getTime() < cutoff
  );

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.3px' }}>Overview</h1>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
            Ticket health across all departments
          </p>
        </div>
        <span style={{
          fontSize: 11, color: 'var(--text-muted)',
          background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
          borderRadius: 6, padding: '4px 10px',
        }}>
          Last 30 days
        </span>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard
          label="Total tickets"
          value={total}
          icon={IconTicket}
          iconColor="var(--accent)"
          topBorder
        />
        <StatCard
          label="Open"
          value={open}
          icon={IconAlertCircle}
          iconColor="var(--status-open)"
          topBorder
          topBorderColor="var(--status-open)"
        />
        <StatCard
          label="In progress"
          value={inProgress}
          icon={IconClock}
          iconColor="var(--status-progress)"
        />
        <StatCard
          label="Resolved today"
          value={resolvedToday}
          icon={IconCircleCheck}
          iconColor="var(--status-resolved)"
        />
      </div>

      {/* Avg resolution — full width strip */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 10,
        padding: '14px 20px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: 'rgba(255,107,53,0.10)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <IconClock size={16} color="var(--accent)" />
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 2 }}>
            Avg. resolution time
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.5px', lineHeight: 1 }}>
            {avgHours}h
            <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-secondary)', marginLeft: 6 }}>
              across {resolved.length} resolved ticket{resolved.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Charts row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <ChartPanel title="Tickets by status">
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%" cy="50%"
                innerRadius={52} outerRadius={82}
                paddingAngle={3}
                strokeWidth={0}
              >
                {statusData.map(d => <Cell key={d.name} fill={STATUS_COLORS[d.name]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 4 }}>
            {statusData.map(d => (
              <span key={d.name} style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS_COLORS[d.name], display: 'inline-block', flexShrink: 0 }} />
                {d.name} <span style={{ color: 'var(--text-muted)' }}>({d.value})</span>
              </span>
            ))}
          </div>
        </ChartPanel>

        <ChartPanel title="Tickets by department">
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={deptData} layout="vertical" margin={{ left: 0, right: 12, top: 4, bottom: 4 }}>
              <XAxis type="number" tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="dept" tick={{ fill: '#717171', fontSize: 11 }} axisLine={false} tickLine={false} width={56} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="count" name="Tickets" fill="#FF6B35" radius={[0, 6, 6, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      {/* Charts row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <ChartPanel title="Volume — last 30 days">
          <ResponsiveContainer width="100%" height={170}>
            <AreaChart data={lineData} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                tick={{ fill: '#555', fontSize: 10 }}
                axisLine={false} tickLine={false}
                interval={Math.floor(lineData.length / 5)}
              />
              <YAxis tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area
                type="monotone" dataKey="count" name="Tickets"
                stroke="#FF6B35" strokeWidth={2}
                fill="url(#areaGrad)" dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Flagged — open > 48h">
          {flagged.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 13 }}>
              <IconCircleCheck size={24} color="var(--status-resolved)" style={{ marginBottom: 8, display: 'block', margin: '0 auto 10px' }} />
              <p style={{ color: 'var(--text-secondary)' }}>No flagged tickets.</p>
              <p style={{ fontSize: 11, marginTop: 2 }}>All critical items are on track.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {flagged.map((t, i) => (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 0',
                  borderBottom: i < flagged.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                }}>
                  <IconAlertTriangle size={13} color={t.urgency === 'Critical' ? 'var(--urgency-critical)' : 'var(--urgency-high)'} style={{ flexShrink: 0 }} />
                  <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>{t.id}</span>
                  <span style={{ fontSize: 12, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                  <UrgencyBadge urgency={t.urgency} />
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }} className="font-mono">
                    {timeAgo(t.raisedAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ChartPanel>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  iconColor: string;
  topBorder?: boolean;
  topBorderColor?: string;
}

function StatCard({ label, value, icon: Icon, iconColor, topBorder, topBorderColor }: StatCardProps) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      borderRadius: 10,
      padding: '18px 20px',
      border: '1px solid var(--border-default)',
      borderTop: topBorder
        ? `2px solid ${topBorderColor ?? 'var(--accent)'}`
        : '1px solid var(--border-default)',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontSize: 10, fontWeight: 500,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.7px',
        }}>
          {label}
        </span>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: `${iconColor}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={14} color={iconColor} />
        </div>
      </div>
      <div style={{
        fontSize: 30,
        fontWeight: 600,
        color: 'var(--text-primary)',
        lineHeight: 1,
        letterSpacing: '-0.5px',
      }}>
        {value}
      </div>
    </div>
  );
}

function ChartPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      borderRadius: 10,
      border: '1px solid var(--border-default)',
      padding: '18px 20px',
    }}>
      <h3 style={{
        fontSize: 12,
        fontWeight: 500,
        color: 'var(--text-secondary)',
        marginBottom: 18,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        {title}
      </h3>
      {children}
    </div>
  );
}
