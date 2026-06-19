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
        background: 'rgba(0,0,0,0.5)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="animate-slide-in-right"
        style={{
          position: 'absolute', top: 0, right: 0, bottom: 0,
          width: 360, background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-default)',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {title && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)',
            position: 'sticky', top: 0, background: 'var(--bg-surface)', zIndex: 1,
          }}>
            <span style={{ fontSize: 15, fontWeight: 500 }}>{title}</span>
            <button
              onClick={onClose}
              aria-label="Close drawer"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-secondary)', padding: 4, borderRadius: 4,
                display: 'flex', alignItems: 'center',
              }}
            >
              <IconX size={16} />
            </button>
          </div>
        )}
        <div style={{ flex: 1, padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}
