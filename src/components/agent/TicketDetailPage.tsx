import { useState } from 'react';
import { IconArrowLeft, IconRefresh } from '@tabler/icons-react';
import { useApp } from '../../context/AppContext';
import { useGroq } from '../../hooks/useGroq';
import { UrgencyBadge } from '../shared/UrgencyBadge';
import { StatusPill } from '../shared/StatusPill';
import { AIBadge } from '../shared/AIBadge';
import { timeAgo } from '../../utils/time';
import type { Ticket, TicketStatus } from '../../types';

const statuses: TicketStatus[] = ['Open', 'In Progress', 'Resolved', 'Closed'];

interface Props { ticket: Ticket; onBack: () => void; }

export function TicketDetailPage({ ticket: initialTicket, onBack }: Props) {
  const { tickets, updateTicketStatus, saveAgentNote, showToast, currentUser } = useApp();
  const { draftResponse, hasKey } = useGroq();

  const ticket = tickets.find(t => t.id === initialTicket.id) ?? initialTicket;

  const [pendingStatus, setPendingStatus] = useState<TicketStatus | null>(null);
  const [notes, setNotes] = useState(ticket.agentNotes ?? '');
  const [draft, setDraft] = useState(ticket.aiDraftResponse ?? '');
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftOpen, setDraftOpen] = useState(false);
  const [backHovered, setBackHovered] = useState(false);

  const actor = currentUser || 'Agent';

  async function generateDraft() {
    if (!hasKey) { showToast('AI features need a Groq API key. Add one in Settings.', 'info'); return; }
    setDraftOpen(true);
    setDraftLoading(true);
    try {
      const result = await draftResponse(ticket);
      setDraft(result);
    } catch {
      showToast("AI couldn't respond. Try again.", 'error');
    } finally {
      setDraftLoading(false);
    }
  }

  function confirmStatus(status: TicketStatus) {
    updateTicketStatus(ticket.id, status, actor);
    setPendingStatus(null);
    showToast(`Status updated to ${status}`);
  }

  function saveNote() {
    if (!notes.trim()) return;
    saveAgentNote(ticket.id, notes, actor);
    showToast('Note saved');
  }

  function useDraft() {
    setNotes(draft);
    showToast('Draft copied to notes');
  }

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button
          onClick={onBack}
          onMouseEnter={() => setBackHovered(true)}
          onMouseLeave={() => setBackHovered(false)}
          style={{
            background: backHovered ? 'var(--bg-hover)' : 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 8,
            cursor: 'pointer',
            color: backHovered ? 'var(--text-primary)' : 'var(--text-secondary)',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12, padding: '6px 12px',
            transition: 'all 120ms ease',
          }}
        >
          <IconArrowLeft size={13} /> Back to queue
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 4 }}>
          <span className="font-mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ticket.id}</span>
          <UrgencyBadge urgency={ticket.urgency} />
          {ticket.aiRouted && <AIBadge />}
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 284px', gap: 28, alignItems: 'start' }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Title & meta */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 12,
            padding: '22px 24px',
          }}>
            <h1 style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.4, marginBottom: 12, letterSpacing: '-0.2px' }}>
              {ticket.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <Avatar name={ticket.raisedBy} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{ticket.raisedBy}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                  Raised {timeAgo(ticket.raisedAt)}
                </div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <StatusPill status={ticket.status} />
              </div>
            </div>
            <SectionDivider />
            <FieldLabel>Description</FieldLabel>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              {ticket.description}
            </p>
          </div>

          {/* Agent notes */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 12,
            padding: '20px 24px',
          }}>
            <FieldLabel>Agent notes</FieldLabel>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
              Internal — not visible to the employee.
            </p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
              placeholder="Add your notes here…"
              style={{
                width: '100%',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-default)',
                borderRadius: 8,
                padding: '10px 12px',
                color: 'var(--text-primary)',
                fontSize: 13,
                resize: 'vertical',
                lineHeight: 1.7,
              }}
            />
            <button
              onClick={saveNote}
              style={{
                marginTop: 10,
                background: 'none',
                border: '1px solid var(--border-default)',
                borderRadius: 8,
                padding: '7px 16px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                transition: 'border-color 120ms, background 120ms',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--border-strong)';
                e.currentTarget.style.background = 'var(--bg-hover)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.background = 'none';
              }}
            >
              Save note
            </button>
          </div>

          {/* Activity timeline */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 12,
            padding: '20px 24px',
          }}>
            <FieldLabel>Activity</FieldLabel>
            <ActivityTimeline entries={ticket.activity} />
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Status panel */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 12,
            padding: '16px 18px',
          }}>
            <FieldLabel>Status</FieldLabel>
            {pendingStatus ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Mark as <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{pendingStatus}</span>?
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => confirmStatus(pendingStatus)}
                    style={solidBtn('var(--accent)', '#fff')}
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setPendingStatus(null)}
                    style={solidBtn('transparent', 'var(--text-secondary)', 'var(--border-default)')}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <select
                value={ticket.status}
                onChange={e => setPendingStatus(e.target.value as TicketStatus)}
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 8,
                  padding: '8px 10px',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  width: '100%',
                  cursor: 'pointer',
                }}
              >
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
          </div>

          {/* Meta panel — dept + urgency + raised by combined */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 12,
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}>
            <MetaRow label="Department">
              <span style={{ fontSize: 13 }}>{ticket.category}</span>
            </MetaRow>
            <div style={{ height: 1, background: 'var(--border-subtle)' }} />
            <MetaRow label="Urgency">
              <UrgencyBadge urgency={ticket.urgency} />
            </MetaRow>
            <div style={{ height: 1, background: 'var(--border-subtle)' }} />
            <MetaRow label="Raised by">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar name={ticket.raisedBy} size={22} />
                <span style={{ fontSize: 13 }}>{ticket.raisedBy}</span>
              </div>
            </MetaRow>
          </div>

          {/* AI Draft */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 12,
            padding: '16px 18px',
          }}>
            <FieldLabel>AI draft response</FieldLabel>
            {!draftOpen ? (
              <button
                onClick={generateDraft}
                style={{
                  width: '100%',
                  background: 'var(--accent-dim)',
                  border: '1px solid var(--accent-border)',
                  borderRadius: 8,
                  padding: '9px 14px',
                  color: 'var(--accent)',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                  transition: 'all 140ms ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,107,53,0.16)';
                  e.currentTarget.style.borderColor = 'rgba(255,107,53,0.45)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--accent-dim)';
                  e.currentTarget.style.borderColor = 'var(--accent-border)';
                }}
              >
                ✦ Draft response
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {draftLoading ? (
                  <div className="shimmer" style={{ height: 108, borderRadius: 8 }} />
                ) : (
                  <textarea
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    rows={6}
                    style={{
                      width: '100%',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 8,
                      padding: '10px 12px',
                      color: 'var(--text-primary)',
                      fontSize: 12,
                      resize: 'vertical',
                      lineHeight: 1.7,
                    }}
                  />
                )}
                <button
                  onClick={useDraft}
                  style={solidBtn('var(--accent)', '#fff')}
                >
                  Use this response
                </button>
                <button
                  onClick={generateDraft}
                  disabled={draftLoading}
                  style={{
                    ...solidBtn('transparent', 'var(--text-secondary)', 'var(--border-default)'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    opacity: draftLoading ? 0.5 : 1,
                  }}
                >
                  <IconRefresh size={12} /> Regenerate
                </button>
              </div>
            )}
            {!hasKey && (
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                Add your Groq key in Settings to enable this.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityTimeline({ entries }: { entries: Ticket['activity'] }) {
  return (
    <div style={{ position: 'relative', paddingTop: 4 }}>
      {/* Vertical connector */}
      {entries.length > 1 && (
        <div style={{
          position: 'absolute',
          left: 5,
          top: 12,
          bottom: 8,
          width: 1,
          background: 'var(--border-default)',
          zIndex: 0,
        }} />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {entries.map(a => {
          const isAI = a.actor === 'AI';
          const isStatus = a.action.startsWith('Status changed');
          const dotBg = isAI ? 'var(--accent)' : 'var(--bg-surface)';
          const dotBorder = isAI
            ? 'var(--accent)'
            : isStatus
            ? 'var(--status-progress)'
            : 'var(--border-strong)';

          return (
            <div key={a.id} style={{ display: 'flex', gap: 14, position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 11, height: 11,
                borderRadius: '50%',
                background: dotBg,
                border: `2px solid ${dotBorder}`,
                flexShrink: 0,
                marginTop: 3,
              }} />
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {a.action}
                </div>
                <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
                  {a.actor} · {timeAgo(a.timestamp)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Avatar({ name, size = 26 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      background: 'var(--accent-dim)',
      border: '1px solid var(--accent-border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38,
      fontWeight: 600,
      color: 'var(--accent)',
      flexShrink: 0,
      userSelect: 'none',
    }}>
      {initials}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10,
      fontWeight: 600,
      color: 'var(--text-muted)',
      textTransform: 'uppercase',
      letterSpacing: '0.7px',
      marginBottom: 10,
    }}>
      {children}
    </div>
  );
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  );
}

function SectionDivider() {
  return <div style={{ height: 1, background: 'var(--border-subtle)', margin: '16px 0' }} />;
}

function solidBtn(bg: string, color: string, borderColor?: string): React.CSSProperties {
  return {
    background: bg,
    color,
    border: `1px solid ${borderColor ?? bg}`,
    borderRadius: 8,
    padding: '8px 14px',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    width: '100%',
    transition: 'opacity 120ms',
  };
}
