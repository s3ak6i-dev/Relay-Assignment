import { useState, useEffect, useRef } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/shared/Navbar';
import { Sidebar, type Page } from './components/shared/Sidebar';
import { ToastContainer } from './components/shared/Toast';
import { NewTicketForm } from './components/employee/NewTicketForm';
import { MyTickets } from './components/employee/MyTickets';
import { DepartmentQueue } from './components/agent/DepartmentQueue';
import { TicketDetailPage } from './components/agent/TicketDetailPage';
import { AnalyticsDashboard } from './components/admin/AnalyticsDashboard';
import { AllTickets } from './components/admin/AllTickets';
import type { Role, Ticket } from './types';

const DEFAULT_PAGE: Record<Role, Page> = {
  employee: 'new-ticket',
  agent: 'queue',
  admin: 'dashboard',
};

function AppShell() {
  const { currentRole } = useApp();
  const prevRole = useRef<Role>(currentRole);

  const [page, setPage] = useState<Page>(DEFAULT_PAGE[currentRole]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // When role changes, reset to that role's default page
  useEffect(() => {
    if (currentRole !== prevRole.current) {
      prevRole.current = currentRole;
      setPage(DEFAULT_PAGE[currentRole]);
      setSelectedTicket(null);
    }
  }, [currentRole]);

  function handleNavigate(p: Page) {
    setPage(p);
    setSelectedTicket(null);
  }

  function renderContent() {
    if (currentRole === 'employee') {
      if (page === 'new-ticket') return <NewTicketForm onNavigate={handleNavigate} />;
      return <MyTickets onNavigate={handleNavigate} />;
    }
    if (currentRole === 'agent') {
      if (selectedTicket) {
        return <TicketDetailPage ticket={selectedTicket} onBack={() => setSelectedTicket(null)} />;
      }
      return <DepartmentQueue onSelectTicket={t => setSelectedTicket(t)} />;
    }
    if (page === 'all-tickets') return <AllTickets />;
    return <AnalyticsDashboard />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar page={page} onNavigate={handleNavigate} />
        <main style={{ flex: 1, overflowY: 'auto', padding: 24, maxWidth: 1040 }}>
          {renderContent()}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
