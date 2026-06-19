import { useState } from 'react';
import { IconSettings } from '@tabler/icons-react';
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

  const initials = currentUser
    ? currentUser.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <>
      <nav style={{
        height: 48, background: 'var(--bg-raised)',
        borderBottom: '0.5px solid var(--border-default)',
        display: 'flex', alignItems: 'center', paddingInline: 20, gap: 16,
        position: 'sticky', top: 0, zIndex: 100, flexShrink: 0,
      }}>
        {/* Logo */}
        <span style={{
          color: 'var(--accent)', fontSize: 15, fontWeight: 500,
          letterSpacing: '-0.3px', marginRight: 8,
        }}>
          relay
        </span>

        {/* Role switcher */}
        <div style={{
          display: 'flex', gap: 4, flex: 1,
          background: 'var(--bg-input)', borderRadius: 8,
          padding: 3, maxWidth: 280,
        }}>
          {roles.map(r => (
            <button
              key={r.value}
              onClick={() => setRole(r.value)}
              style={{
                flex: 1, padding: '4px 10px', borderRadius: 6,
                border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
                background: currentRole === r.value ? 'var(--accent)' : 'transparent',
                color: currentRole === r.value ? '#fff' : 'var(--text-secondary)',
                transition: 'all 100ms',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Notifications — employee only */}
        {currentRole === 'employee' && <NotificationBell />}

        {/* Settings */}
        <button
          onClick={() => setShowSettings(true)}
          aria-label="Settings"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)', display: 'flex', padding: 4, borderRadius: 4,
          }}
        >
          <IconSettings size={16} />
        </button>

        {/* Avatar */}
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'var(--accent-dim)', color: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 600,
        }}>
          {initials}
        </div>
      </nav>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}
