import { useEffect } from 'react';
import { IconX } from '@tabler/icons-react';

interface DrawerProps {
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function Drawer({ title, onClose, children }: DrawerProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 800,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(3px)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="animate-slide-in-right"
        style={{
          position: 'absolute', top: 0, right: 0, bottom: 0,
          width: 380,
          background: 'var(--bg-raised)',
          borderLeft: '1px solid var(--border-default)',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
          boxShadow: '-12px 0 48px rgba(0,0,0,0.7)',
        }}
      >
        {title && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 22px',
            borderBottom: '1px solid var(--border-default)',
            position: 'sticky', top: 0,
            background: 'var(--bg-raised)',
            zIndex: 1,
          }}>
            <span className="font-mono" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {title}
            </span>
            <button
              onClick={onClose}
              aria-label="Close drawer"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-secondary)',
                padding: '4px', borderRadius: 6,
                display: 'flex', alignItems: 'center',
                transition: 'color 100ms, background 100ms',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--bg-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <IconX size={15} />
            </button>
          </div>
        )}
        <div style={{ flex: 1, padding: '22px 22px' }}>{children}</div>
      </div>
    </div>
  );
}
