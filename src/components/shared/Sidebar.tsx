import {
  IconTicket, IconPlus, IconChartBar, IconInbox, IconBuildingStore,
} from '@tabler/icons-react';
import { useApp } from '../../context/AppContext';
import type { Department } from '../../types';

type EmployeePage = 'new-ticket' | 'my-tickets';
type AgentPage = 'queue';
type AdminPage = 'dashboard';
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
      width: 200, background: 'var(--bg-raised)',
      borderRight: '0.5px solid var(--border-default)',
      display: 'flex', flexDirection: 'column',
      padding: '16px 0', flexShrink: 0, overflowY: 'auto',
    }}>
      {currentRole === 'employee' && (
        <section>
          <SectionLabel>Menu</SectionLabel>
          <NavItem icon={<IconPlus size={15} />} label="Raise a ticket" active={page === 'new-ticket'} onClick={() => onNavigate('new-ticket')} />
          <NavItem icon={<IconTicket size={15} />} label="My tickets" active={page === 'my-tickets'} onClick={() => onNavigate('my-tickets')} count={myTicketCount} />
        </section>
      )}

      {currentRole === 'agent' && (
        <>
          <section>
            <SectionLabel>Department</SectionLabel>
            {deptLabels.map(d => (
              <NavItem
                key={d}
                icon={<IconBuildingStore size={15} />}
                label={d}
                active={agentDepartment === d}
                onClick={() => { setAgentDept(d); onNavigate('queue'); }}
                count={d === agentDepartment ? queueCount : undefined}
              />
            ))}
          </section>
        </>
      )}

      {currentRole === 'admin' && (
        <section>
          <SectionLabel>Overview</SectionLabel>
          <NavItem icon={<IconChartBar size={15} />} label="Dashboard" active={page === 'dashboard'} onClick={() => onNavigate('dashboard')} />
          <NavItem icon={<IconInbox size={15} />} label="All tickets" active={false} onClick={() => {}} />
        </section>
      )}
    </aside>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: '0 16px 6px',
      fontSize: 10, fontWeight: 500,
      color: 'var(--text-muted)',
      textTransform: 'uppercase', letterSpacing: '0.8px',
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
        width: '100%', display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 16px', border: 'none', cursor: 'pointer',
        textAlign: 'left', fontSize: 13,
        background: active ? 'var(--accent-dim)' : 'transparent',
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        borderRight: active ? '2px solid var(--accent)' : '2px solid transparent',
        transition: 'background 100ms, color 100ms',
      }}
    >
      <span style={{ color: active ? 'var(--accent)' : 'inherit', display: 'flex' }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {count !== undefined && count > 0 && (
        <span style={{
          background: 'var(--accent)', color: '#fff',
          fontSize: 10, fontWeight: 600,
          borderRadius: 10, padding: '1px 6px', minWidth: 18, textAlign: 'center',
        }}>
          {count}
        </span>
      )}
    </button>
  );
}
