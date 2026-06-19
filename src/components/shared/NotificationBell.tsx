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

  // Derive notifications: status changes on the current user's tickets
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

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function toggle() {
    if (!open) {
      // Mark all as read when opening
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
          background: 'none', border: 'none', cursor: 'pointer',
          color: open ? 'var(--text-primary)' : 'var(--text-secondary)',
          display: 'flex', padding: 4, borderRadius: 4, position: 'relative',
        }}
      >
        <IconBell size={16} />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 0, right: 0,
            width: 14, height: 14, borderRadius: '50%',
            background: 'var(--accent)', color: '#fff',
            fontSize: 9, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            lineHeight: 1,
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="animate-fade-in" style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: 320, background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          zIndex: 200, overflow: 'hidden',
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            fontSize: 13, fontWeight: 500,
          }}>
            Notifications
          </div>

          {notifications.length === 0 ? (
            <div style={{
              padding: '32px 16px', textAlign: 'center',
              color: 'var(--text-muted)', fontSize: 13,
            }}>
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
                    background: isUnread ? '#FF6B350A' : 'transparent',
                    display: 'flex', flexDirection: 'column', gap: 6,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {n.ticketId}
                      </span>
                      <StatusPill status={n.newStatus} />
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4 }}>
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
