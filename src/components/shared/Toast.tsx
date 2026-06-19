import { IconCheck, IconAlertCircle, IconInfoCircle } from '@tabler/icons-react';
import { useApp } from '../../context/AppContext';

export function ToastContainer() {
  const { toasts } = useApp();
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 8,
      pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <ToastItem key={t.id} message={t.message} type={t.type} />
      ))}
    </div>
  );
}

type ToastType = 'success' | 'error' | 'info';

function ToastItem({ message, type = 'success' }: { message: string; type?: ToastType }) {
  const icons: Record<ToastType, React.ReactNode> = {
    success: <IconCheck size={13} />,
    error:   <IconAlertCircle size={13} />,
    info:    <IconInfoCircle size={13} />,
  };
  const colors: Record<ToastType, string> = {
    success: '#22C55E',
    error:   '#EF4444',
    info:    '#3B82F6',
  };
  const safeType: ToastType = (['success', 'error', 'info'] as ToastType[]).includes(type as ToastType)
    ? (type as ToastType)
    : 'success';
  const color = colors[safeType];

  return (
    <div className="animate-toast-in" style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-strong)',
      borderLeft: `3px solid ${color}`,
      borderRadius: 10,
      padding: '11px 16px',
      fontSize: 13,
      color: 'var(--text-primary)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.65), 0 2px 8px rgba(0,0,0,0.4)',
      maxWidth: 360,
      pointerEvents: 'auto',
      backdropFilter: 'blur(8px)',
    }}>
      <span style={{
        color,
        flexShrink: 0,
        width: 24, height: 24,
        borderRadius: 6,
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icons[safeType]}
      </span>
      <span style={{ flex: 1, lineHeight: 1.4 }}>{message}</span>
    </div>
  );
}
