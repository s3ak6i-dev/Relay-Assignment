import { IconCheck, IconAlertCircle, IconInfoCircle } from '@tabler/icons-react';
import { useApp } from '../../context/AppContext';

export function ToastContainer() {
  const { toasts } = useApp();
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 8,
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
    success: <IconCheck size={14} />,
    error: <IconAlertCircle size={14} />,
    info: <IconInfoCircle size={14} />,
  };
  const colors: Record<ToastType, string> = {
    success: '#22C55E',
    error: '#EF4444',
    info: '#3B82F6',
  };
  const safeType: ToastType = ['success', 'error', 'info'].includes(type) ? type : 'success';
  const color = colors[safeType];

  return (
    <div className="animate-toast-in" style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
      borderLeft: `3px solid ${color}`,
      borderRadius: 8, padding: '10px 14px',
      fontSize: 13, color: 'var(--text-primary)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      maxWidth: 340,
    }}>
      <span style={{ color, flexShrink: 0 }}>{icons[safeType]}</span>
      <span style={{ flex: 1 }}>{message}</span>
    </div>
  );
}
