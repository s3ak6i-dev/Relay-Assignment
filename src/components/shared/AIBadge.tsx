export function AIBadge({ label = 'AI sorted' }: { label?: string }) {
  return (
    <span
      title="Department suggested by AI based on your description"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '2px 7px',
        borderRadius: 4,
        border: '1px solid rgba(255,107,53,0.28)',
        background: 'rgba(255,107,53,0.10)',
        color: '#FF6B35',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.2px',
        cursor: 'default',
        whiteSpace: 'nowrap',
      }}
    >
      ✦ {label}
    </span>
  );
}
