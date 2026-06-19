export function AIBadge({ label = 'AI sorted' }: { label?: string }) {
  return (
    <span
      title="Department suggested by AI based on your description"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '2px 6px', borderRadius: 4,
        background: '#FF6B3520', color: '#FF6B35',
        fontSize: 10, fontWeight: 500,
        cursor: 'default',
      }}
    >
      ✦ {label}
    </span>
  );
}
