import {
  IconTicket, IconPlus, IconChartBar, IconInbox, IconBuildingStore,
} from '@tabler/icons-react';
import { useApp } from '../../context/AppContext';
import type { Department } from '../../types';

type EmployeePage = 'new-ticket' | 'my-tickets';
type AgentPage = 'queue';
type AdminPage = 'dashboard' | 'all-tickets';
export type Page = EmployeePage | AgentPage | AdminPage;

interface SidebarProps {
  page: Page;
  onNavigate: (page: Page) => void;
}

const deptLabels: Department[] = ['IT', 'HR', 'Finance', 'Admin'];

export function Sidebar({ page, onNavigate }: SidebarProps) {
  const { currentRole, tickets, agentDepartment, setAgentDept, currentUser } = useApp();

  const queueCount = tickets.filter(
    t => t.category === agentDepartment && (t.status === 'Open' || t.status === 'In Progress')
  ).length;

  const myTicketCount = tickets.filter(
    t => t.raisedBy === currentUser && (t.status === 'Open' || t.status === 'In Progress')
  ).length;

  return (
    <aside style={{
      width: 208,
      background: 'var(--bg-raised)',
      borderRight: '1px solid var(--border-default)',
      display: 'flex',
      flexDirection: 'column',
      padding: '12px 0 16px',
      flexShrink: 0,
      overflowY: 'auto',
    }}>
      {currentRole === 'employee' && (
        <section>
          <SectionLabel>Menu</SectionLabel>
          <NavItem
            icon={<IconPlus size={14} />}
            label="Raise a ticket"
            active={page === 'new-ticket'}
            onClick={() => onNavigate('new-ticket')}
          />
          <NavItem
            icon={<IconTicket size={14} />}
            label="My tickets"
            active={page === 'my-tickets'}
            onClick={() => onNavigate('my-tickets')}
            count={myTicketCount}
          />
        </section>
      )}

      {currentRole === 'agent' && (
        <section>
          <SectionLabel>Department</SectionLabel>
          {deptLabels.map(d => (
            <NavItem
              key={d}
              icon={<IconBuildingStore size={14} />}
              label={d}
              active={agentDepartment === d}
              onClick={() => { setAgentDept(d); onNavigate('queue'); }}
              count={d === agentDepartment ? queueCount : undefined}
            />
          ))}
        </section>
      )}

      {currentRole === 'admin' && (
        <section>
          <SectionLabel>Overview</SectionLabel>
          <NavItem
            icon={<IconChartBar size={14} />}
            label="Dashboard"
            active={page === 'dashboard'}
            onClick={() => onNavigate('dashboard')}
          />
          <NavItem
            icon={<IconInbox size={14} />}
            label="All tickets"
            active={page === 'all-tickets'}
            onClick={() => onNavigate('all-tickets')}
            count={tickets.length}
          />
        </section>
      )}
    </aside>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: '2px 16px 8px',
      fontSize: 10,
      fontWeight: 600,
      color: 'var(--text-muted)',
      textTransform: 'uppercase',
      letterSpacing: '0.9px',
    }}>
      {children}
    </div>
  );
}

function NavItem({
  icon, label, active, onClick, count,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '8px 16px',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        fontSize: 13,
        background: active
          ? 'linear-gradient(90deg, rgba(255,107,53,0.12) 0%, rgba(255,107,53,0.04) 100%)'
          : 'transparent',
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        borderRight: active ? '2px solid var(--accent)' : '2px solid transparent',
        transition: 'background 120ms ease, color 120ms ease, border-color 120ms ease',
        marginBottom: 1,
      }}
      onMouseEnter={e => {
        if (!active) e.currentTarget.style.background = 'var(--bg-hover)';
        if (!active) e.currentTarget.style.color = 'var(--text-primary)';
      }}
      onMouseLeave={e => {
        if (!active) e.currentTarget.style.background = 'transparent';
        if (!active) e.currentTarget.style.color = 'var(--text-secondary)';
      }}
    >
      <span style={{
        color: active ? 'var(--accent)' : 'var(--text-muted)',
        display: 'flex',
        transition: 'color 120ms ease',
      }}>
        {icon}
      </span>
      <span style={{ flex: 1, fontWeight: active ? 500 : 400 }}>{label}</span>
      {count !== undefined && count > 0 && (
        <span style={{
          background: active ? 'var(--accent)' : 'var(--bg-hover)',
          color: active ? '#fff' : 'var(--text-secondary)',
          border: active ? 'none' : '1px solid var(--border-default)',
          fontSize: 10,
          fontWeight: 600,
          borderRadius: 10,
          padding: '1px 6px',
          minWidth: 18,
          textAlign: 'center',
          transition: 'all 120ms ease',
        }}>
          {count}
        </span>
      )}
    </button>
  );
}
