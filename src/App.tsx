import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/shared/Navbar';
import { Sidebar, type Page } from './components/shared/Sidebar';
import { ToastContainer } from './components/shared/Toast';
import { NewTicketForm } from './components/employee/NewTicketForm';
import { MyTickets } from './components/employee/MyTickets';
import { DepartmentQueue } from './components/agent/DepartmentQueue';
import { TicketDetailPage } from './components/agent/TicketDetailPage';
import { AnalyticsDashboard } from './components/admin/AnalyticsDashboard';
import type { Ticket } from './types';

function AppShell() {
  const { currentRole } = useApp();

  const defaultPage = (): Page => {
    if (currentRole === 'agent') return 'queue';
    if (currentRole === 'admin') return 'dashboard';
    return 'new-ticket';
  };

  const [page, setPage] = useState<Page>(defaultPage);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

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
    return <AnalyticsDashboard />;
  }

  // Reset page when role changes
  const effectivePage = currentRole === 'employee'
    ? (page === 'queue' || page === 'dashboard' ? 'my-tickets' : page)
    : currentRole === 'agent'
    ? (page === 'new-ticket' || page === 'my-tickets' || page === 'dashboard' ? 'queue' : page)
    : 'dashboard';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar page={effectivePage} onNavigate={handleNavigate} />
        <main style={{
          flex: 1, overflowY: 'auto', padding: 24,
          maxWidth: 1040,
        }}>
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
