import { useState } from 'react';
import { IconSettings, IconBolt } from '@tabler/icons-react';
import { useApp } from '../../context/AppContext';
import { SettingsModal } from './SettingsModal';
import { NotificationBell } from './NotificationBell';
import type { Role } from '../../types';

const roles: { value: Role; label: string }[] = [
  { value: 'employee', label: 'Employee' },
  { value: 'agent', label: 'Agent' },
  { value: 'admin', label: 'Admin' },
];

export function Navbar() {
  const { currentRole, setRole, currentUser } = useApp();
  const [showSettings, setShowSettings] = useState(false);
  const [settingsHovered, setSettingsHovered] = useState(false);

  const initials = currentUser
    ? currentUser.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <>
      <nav style={{
        height: 52,
        background: 'var(--bg-raised)',
        borderBottom: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        paddingInline: 20,
        gap: 16,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexShrink: 0,
      }}>

        {/* Logo mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginRight: 12, flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28,
            borderRadius: 8,
            background: 'var(--gradient-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(255,107,53,0.35)',
            flexShrink: 0,
          }}>
            <IconBolt size={15} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{
            fontSize: 15, fontWeight: 600,
            letterSpacing: '-0.5px',
            color: 'var(--text-primary)',
          }}>
            relay
          </span>
        </div>

        {/* Role switcher */}
        <div style={{
          display: 'flex', gap: 2,
          background: 'var(--bg-input)',
          borderRadius: 10, padding: 3,
          border: '1px solid var(--border-default)',
          maxWidth: 268,
        }}>
          {roles.map(r => {
            const isActive = currentRole === r.value;
            return (
              <button
                key={r.value}
                onClick={() => setRole(r.value)}
                style={{
                  flex: 1,
                  padding: '5px 16px',
                  borderRadius: 8,
                  border: isActive
                    ? '1px solid var(--accent-border)'
                    : '1px solid transparent',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: '0.1px',
                  background: isActive ? 'var(--accent-dim)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  transition: 'all 160ms ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {r.label}
              </button>
            );
          })}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Notifications — employee only */}
        {currentRole === 'employee' && <NotificationBell />}

        {/* Divider */}
        <div style={{ width: 1, height: 18, background: 'var(--border-default)' }} />

        {/* Settings */}
        <button
          onClick={() => setShowSettings(true)}
          onMouseEnter={() => setSettingsHovered(true)}
          onMouseLeave={() => setSettingsHovered(false)}
          aria-label="Settings"
          style={{
            background: settingsHovered ? 'var(--bg-hover)' : 'none',
            border: 'none',
            cursor: 'pointer',
            color: settingsHovered ? 'var(--text-primary)' : 'var(--text-secondary)',
            display: 'flex',
            padding: '5px',
            borderRadius: 6,
            transition: 'all 120ms ease',
          }}
        >
          <IconSettings size={15} />
        </button>

        {/* Avatar */}
        <div
          title={currentUser || 'Unknown user'}
          style={{
            width: 30, height: 30,
            borderRadius: '50%',
            background: 'var(--accent-dim)',
            border: '1.5px solid var(--accent-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 600,
            color: 'var(--accent)',
            cursor: 'default',
            userSelect: 'none',
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
      </nav>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}
