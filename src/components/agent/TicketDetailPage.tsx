import { useState } from 'react';
import { IconArrowLeft, IconRefresh } from '@tabler/icons-react';
import { useApp } from '../../context/AppContext';
import { useGroq } from '../../hooks/useGroq';
import { UrgencyBadge } from '../shared/UrgencyBadge';
import { AIBadge } from '../shared/AIBadge';
import { timeAgo } from '../../utils/time';
import type { Ticket, TicketStatus } from '../../types';

const statuses: TicketStatus[] = ['Open', 'In Progress', 'Resolved', 'Closed'];

interface Props { ticket: Ticket; onBack: () => void; }

export function TicketDetailPage({ ticket: initialTicket, onBack }: Props) {
  const { tickets, updateTicketStatus, saveAgentNote, showToast, currentUser } = useApp();
  const { draftResponse, hasKey } = useGroq();

  // Always read from live store so updates reflect immediately
  const ticket = tickets.find(t => t.id === initialTicket.id) ?? initialTicket;

  const [pendingStatus, setPendingStatus] = useState<TicketStatus | null>(null);
  const [notes, setNotes] = useState(ticket.agentNotes ?? '');
  const [draft, setDraft] = useState(ticket.aiDraftResponse ?? '');
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftOpen, setDraftOpen] = useState(false);

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
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 13, padding: 0,
          }}
        >
          <IconArrowLeft size={16} /> Back to queue
        </button>
        <span style={{ color: 'var(--border-default)' }}>·</span>
        <span className="font-mono" style={{ fontSize: 13, color: 'var(--text-muted)' }}>{ticket.id}</span>
        <UrgencyBadge urgency={ticket.urgency} />
        {ticket.aiRouted && <AIBadge />}
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 500, lineHeight: 1.4, marginBottom: 8 }}>{ticket.title}</h1>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{ticket.raisedBy}</span>
              <span style={{ color: 'var(--text-muted)' }}>·</span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Raised {timeAgo(ticket.raisedAt)}</span>
            </div>
          </div>

          <Divider />

          <div>
            <SectionLabel>Description</SectionLabel>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{ticket.description}</p>
          </div>

          <Divider />

          {/* Agent notes */}
          <div>
            <SectionLabel>Agent notes</SectionLabel>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Internal — not shown to the employee.</p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
              placeholder="Add your notes here…"
              style={{
                width: '100%', background: 'var(--bg-input)',
                border: '1px solid var(--border-default)', borderRadius: 8,
                padding: '10px 12px', color: 'var(--text-primary)', fontSize: 13,
                resize: 'vertical',
              }}
            />
            <button
              onClick={saveNote}
              style={{
                marginTop: 8, background: 'none',
                border: '1px solid var(--border-default)',
                borderRadius: 8, padding: '7px 14px',
                color: 'var(--text-primary)', cursor: 'pointer', fontSize: 13,
              }}
            >
              Save note
            </button>
          </div>

          <Divider />

          {/* Activity */}
          <div>
            <SectionLabel>Activity</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ticket.activity.map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ color: 'var(--text-muted)', marginTop: 1 }}>·</span>
                  <div>
                    <span style={{ fontSize: 13 }}>{a.action}</span>
                    <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>
                      {a.actor} · {timeAgo(a.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Status */}
          <Panel>
            <SectionLabel>Status</SectionLabel>
            {pendingStatus ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ fontSize: 13 }}>Mark as <strong>{pendingStatus}</strong>?</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => confirmStatus(pendingStatus)} style={actionBtn('#FF6B35', '#fff')}>Confirm</button>
                  <button onClick={() => setPendingStatus(null)} style={actionBtn('transparent', 'var(--text-secondary)', 'var(--border-default)')}>Cancel</button>
                </div>
              </div>
            ) : (
              <select
                value={ticket.status}
                onChange={e => setPendingStatus(e.target.value as TicketStatus)}
                style={{
                  background: 'var(--bg-input)', border: '1px solid var(--border-default)',
                  borderRadius: 8, padding: '8px 10px', color: 'var(--text-primary)', fontSize: 13, width: '100%',
                }}
              >
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
          </Panel>

          <Panel>
            <SectionLabel>Department</SectionLabel>
            <span style={{ fontSize: 13 }}>{ticket.category}</span>
          </Panel>

          <Panel>
            <SectionLabel>Urgency</SectionLabel>
            <UrgencyBadge urgency={ticket.urgency} />
          </Panel>

          <Panel>
            <SectionLabel>Raised by</SectionLabel>
            <span style={{ fontSize: 13 }}>{ticket.raisedBy}</span>
          </Panel>

          <Divider />

          {/* AI Draft */}
          <div>
            <SectionLabel>AI draft response</SectionLabel>
            {!draftOpen ? (
              <button
                onClick={generateDraft}
                style={{
                  width: '100%', background: 'var(--accent-dim)',
                  border: '1px solid var(--accent-border)', borderRadius: 8,
                  padding: '9px 14px', color: 'var(--accent)', cursor: 'pointer',
                  fontSize: 13, fontWeight: 500,
                }}
              >
                ✦ Draft response
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {draftLoading ? (
                  <div className="shimmer" style={{ height: 100, borderRadius: 8 }} />
                ) : (
                  <textarea
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    rows={6}
                    style={{
                      width: '100%', background: 'var(--bg-input)',
                      border: '1px solid var(--border-default)', borderRadius: 8,
                      padding: '10px 12px', color: 'var(--text-primary)', fontSize: 12,
                      resize: 'vertical', lineHeight: 1.6,
                    }}
                  />
                )}
                <button onClick={useDraft} style={actionBtn('var(--accent)', '#fff')}>Use this response</button>
                <button
                  onClick={generateDraft}
                  disabled={draftLoading}
                  style={{
                    ...actionBtn('transparent', 'var(--text-secondary)', 'var(--border-default)'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <IconRefresh size={13} /> Regenerate
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 500, color: 'var(--text-muted)',
      textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8,
    }}>
      {children}
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--bg-surface)', borderRadius: 8,
      border: '1px solid var(--border-default)',
      padding: '12px 14px',
    }}>
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--border-subtle)' }} />;
}

function actionBtn(bg: string, color: string, borderColor?: string): React.CSSProperties {
  return {
    background: bg, color, border: `1px solid ${borderColor ?? bg}`,
    borderRadius: 8, padding: '8px 14px', cursor: 'pointer',
    fontSize: 13, fontWeight: 500, width: '100%',
  };
}
