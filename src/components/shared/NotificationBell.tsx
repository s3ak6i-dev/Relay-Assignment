import { useState, useEffect, useRef } from 'react';
import { IconBell } from '@tabler/icons-react';
import { useApp } from '../../context/AppContext';
import { loadNotifRead, saveNotifRead } from '../../utils/storage';
import { timeAgo } from '../../utils/time';
import { StatusPill } from './StatusPill';
import type { TicketStatus } from '../../types';

interface Notification {
  ticketId: string;
  ticketTitle: string;
  action: string;
  newStatus: TicketStatus;
  timestamp: string;
}

function getStatusFromAction(action: string): TicketStatus | null {
  const match = action.match(/Status changed to (.+)/);
  if (!match) return null;
  return match[1] as TicketStatus;
}

export function NotificationBell() {
  const { tickets, currentUser } = useApp();
  const [lastRead, setLastRead] = useState(loadNotifRead);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const notifications: Notification[] = tickets
    .filter(t => t.raisedBy === currentUser)
    .flatMap(t =>
      t.activity
        .filter(a => a.action.startsWith('Status changed'))
        .map(a => ({
          ticketId: t.id,
          ticketTitle: t.title,
          action: a.action,
          newStatus: getStatusFromAction(a.action) ?? 'Open',
          timestamp: a.timestamp,
        }))
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const unread = notifications.filter(n => n.timestamp > lastRead).length;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function toggle() {
    if (!open) {
      const now = new Date().toISOString();
      saveNotifRead(now);
      setLastRead(now);
    }
    setOpen(o => !o);
  }

  if (!currentUser) return null;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={toggle}
        aria-label="Notifications"
        style={{
          background: open ? 'var(--bg-hover)' : 'none',
          border: 'none',
          cursor: 'pointer',
          color: open ? 'var(--text-primary)' : 'var(--text-secondary)',
          display: 'flex',
          padding: '5px',
          borderRadius: 6,
          position: 'relative',
          transition: 'all 120ms ease',
        }}
        onMouseEnter={e => {
          if (!open) e.currentTarget.style.background = 'var(--bg-hover)';
        }}
        onMouseLeave={e => {
          if (!open) e.currentTarget.style.background = 'none';
        }}
      >
        <IconBell size={15} />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 1, right: 1,
            width: 13, height: 13, borderRadius: '50%',
            background: 'var(--accent)',
            border: '1.5px solid var(--bg-raised)',
            color: '#fff',
            fontSize: 8, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            lineHeight: 1,
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="animate-scale-in" style={{
          position: 'absolute', top: 'calc(100% + 10px)', right: 0,
          width: 330,
          background: 'var(--bg-raised)',
          border: '1px solid var(--border-default)',
          borderRadius: 12,
          boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
          zIndex: 200,
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Notifications</span>
            {unread === 0 && notifications.length > 0 && (
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>All read</span>
            )}
          </div>

          {notifications.length === 0 ? (
            <div style={{
              padding: '36px 16px', textAlign: 'center',
              color: 'var(--text-muted)', fontSize: 13,
            }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>🔔</div>
              No updates on your tickets yet.
            </div>
          ) : (
            <div style={{ maxHeight: 360, overflowY: 'auto' }}>
              {notifications.map((n, i) => {
                const isUnread = n.timestamp > lastRead;
                return (
                  <div key={`${n.ticketId}-${n.timestamp}`} style={{
                    padding: '12px 16px',
                    borderTop: i > 0 ? '1px solid var(--border-subtle)' : undefined,
                    background: isUnread ? 'rgba(255,107,53,0.05)' : 'transparent',
                    display: 'flex', flexDirection: 'column', gap: 6,
                    position: 'relative',
                  }}>
                    {isUnread && (
                      <div style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0,
                        width: 2, background: 'var(--accent)',
                      }} />
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        {n.ticketId}
                      </span>
                      <StatusPill status={n.newStatus} />
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4, fontWeight: isUnread ? 500 : 400 }}>
                      {n.ticketTitle}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {n.action} · {timeAgo(n.timestamp)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
