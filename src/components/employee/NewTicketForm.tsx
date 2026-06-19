import { useState, useCallback, useRef, useEffect } from 'react';
import { IconLoader2, IconChevronDown, IconSparkles } from '@tabler/icons-react';
import { useApp } from '../../context/AppContext';
import { useGroq } from '../../hooks/useGroq';
import { AIBadge } from '../shared/AIBadge';
import { StatusPill } from '../shared/StatusPill';
import { timeAgo } from '../../utils/time';
import type { Department, UrgencyLevel, Ticket } from '../../types';
import type { Page } from '../shared/Sidebar';

const urgencies: UrgencyLevel[] = ['Low', 'Medium', 'High', 'Critical'];
const departments: Department[] = ['IT', 'HR', 'Finance', 'Admin'];

const urgencyColors: Record<UrgencyLevel, string> = {
  Low: '#4B5563', Medium: '#3B82F6', High: '#F59E0B', Critical: '#FF6B35',
};

interface Props { onNavigate: (page: Page) => void; }

export function NewTicketForm({ onNavigate }: Props) {
  const { tickets, currentUser, addTicket, showToast, setUser } = useApp();
  const { categorize, findSimilar, hasKey } = useGroq();

  const [name, setName] = useState(currentUser);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('Medium');
  const [deptOverride, setDeptOverride] = useState<Department | null>(null);
  const [showOverride, setShowOverride] = useState(false);

  const [aiDept, setAiDept] = useState<Department | null>(null);
  const [aiConf, setAiConf] = useState<number>(0);
  const [aiReason, setAiReason] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const [similarIds, setSimilarIds] = useState<string[]>([]);
  const [similarOpen, setSimilarOpen] = useState(true);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runAI = useCallback(async (t: string, d: string) => {
    if (!hasKey || d.length < 20) return;
    setAiLoading(true);
    try {
      const result = await categorize(t, d);
      if (result) {
        setAiDept(result.department);
        setAiConf(result.confidence);
        setAiReason(result.reason);
        const resolved = tickets.filter(tk => tk.status === 'Resolved');
        const ids = await findSimilar(t, d, resolved, result.department);
        setSimilarIds(ids);
        setSimilarOpen(ids.length > 0);
      }
    } catch {
      showToast("AI couldn't respond. Try again or pick a department manually.", 'error');
    } finally {
      setAiLoading(false);
    }
  }, [hasKey, categorize, findSimilar, tickets, showToast]);

  function onDescriptionChange(val: string) {
    setDescription(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runAI(title, val), 300);
  }

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  function submit() {
    if (!name.trim() || !title.trim() || !description.trim()) return;
    setUser(name.trim());

    const id = `TKT-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const dept: Department = deptOverride ?? aiDept ?? 'IT';
    const now = new Date().toISOString();
    const ticket: Ticket = {
      id,
      title: title.trim(),
      description: description.trim(),
      category: dept,
      urgency,
      status: 'Open',
      raisedBy: name.trim(),
      raisedAt: now,
      updatedAt: now,
      aiRouted: !!aiDept && !deptOverride,
      aiCategorySuggestion: aiDept ?? undefined,
      aiConfidence: aiConf || undefined,
      aiCategoryReason: aiReason || undefined,
      similarTicketIds: similarIds,
      activity: [
        { id: crypto.randomUUID(), action: 'Ticket raised', actor: name.trim(), timestamp: now },
        ...(aiDept && !deptOverride ? [{ id: crypto.randomUUID(), action: `AI routed to ${dept}`, actor: 'AI', timestamp: now }] : []),
      ],
    };
    addTicket(ticket);
    showToast(`Ticket raised — ${id}`);
    onNavigate('my-tickets');
  }

  const canSubmit = name.trim() && title.trim() && description.trim().length >= 1;
  const finalDept = deptOverride ?? aiDept;
  const confColor = aiConf >= 0.8 ? 'var(--accent)' : aiConf >= 0.5 ? '#F59E0B' : 'var(--text-muted)';
  const similarTickets = tickets.filter(t => similarIds.includes(t.id));

  return (
    <div style={{ maxWidth: 572 }} className="animate-slide-up">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.3px', marginBottom: 4 }}>
          Raise a ticket
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Describe your issue — AI will handle the routing.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Name */}
        <Field label="Your name">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Full name"
            style={inputStyle}
          />
        </Field>

        {/* Title */}
        <Field label={`Title${title.length >= 60 ? ` (${title.length}/80)` : ''}`}>
          <input
            value={title}
            onChange={e => setTitle(e.target.value.slice(0, 80))}
            placeholder="Brief summary of your issue"
            style={inputStyle}
          />
        </Field>

        {/* Description */}
        <Field label="Description">
          <textarea
            value={description}
            onChange={e => onDescriptionChange(e.target.value)}
            placeholder="Describe your issue in detail — the more context, the better."
            rows={5}
            style={{ ...inputStyle, resize: 'vertical', minHeight: 106, lineHeight: 1.7 }}
          />
          {description.length > 0 && description.length < 20 && (
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Write a bit more to enable AI analysis ({20 - description.length} chars to go).
            </p>
          )}
        </Field>

        {/* Urgency */}
        <Field label="Urgency">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {urgencies.map(u => {
              const isSelected = urgency === u;
              return (
                <label
                  key={u}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    cursor: 'pointer', fontSize: 13,
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: `1px solid ${isSelected ? urgencyColors[u] + '66' : 'var(--border-default)'}`,
                    background: isSelected ? urgencyColors[u] + '12' : 'transparent',
                    color: isSelected ? urgencyColors[u] : 'var(--text-secondary)',
                    transition: 'all 140ms ease',
                    userSelect: 'none',
                  }}
                >
                  <input
                    type="radio"
                    name="urgency"
                    value={u}
                    checked={isSelected}
                    onChange={() => setUrgency(u)}
                    style={{ accentColor: urgencyColors[u], width: 12, height: 12 }}
                  />
                  {u}
                </label>
              );
            })}
          </div>
        </Field>

        {/* Department */}
        <Field label="Department">
          <div style={{
            ...inputStyle,
            display: 'flex', alignItems: 'center', gap: 8,
            color: finalDept ? 'var(--text-primary)' : 'var(--text-secondary)',
            cursor: 'default',
          }}>
            {aiLoading ? (
              <>
                <IconLoader2 size={14} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} />
                <span style={{ fontSize: 13 }}>Analysing…</span>
              </>
            ) : (
              <>
                {!finalDept && <span style={{ fontSize: 13 }}>Let AI decide</span>}
                {finalDept && (
                  <span style={{ fontSize: 13, fontWeight: 500 }}>
                    {deptOverride ? '✎ ' : '✦ '}{finalDept}
                  </span>
                )}
              </>
            )}
          </div>

          {/* AI suggestion card */}
          {aiDept && !aiLoading && (
            <div className="animate-fade-in" style={{
              marginTop: 10,
              padding: '14px 16px',
              background: 'var(--accent-dim)',
              border: '1px solid var(--accent-border)',
              borderRadius: 10,
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <AIBadge label="Suggested" />
                <span style={{ fontWeight: 600, color: confColor, fontSize: 13 }}>{aiDept}</span>
                <span style={{ fontSize: 12, color: confColor }}>
                  {Math.round(aiConf * 100)}% confident
                </span>
                <div style={{
                  marginLeft: 'auto',
                  height: 5, width: 60, borderRadius: 3,
                  background: 'var(--border-default)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.round(aiConf * 100)}%`,
                    background: confColor,
                    borderRadius: 3,
                    transition: 'width 300ms ease',
                  }} />
                </div>
              </div>
              {aiConf < 0.5 && (
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Low confidence — consider picking a department manually.
                </p>
              )}
              {aiReason && (
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {aiReason}
                </p>
              )}
              <button
                onClick={() => setShowOverride(o => !o)}
                style={{
                  alignSelf: 'flex-start', background: 'none', border: 'none',
                  color: 'var(--accent)', cursor: 'pointer', fontSize: 12, padding: 0,
                  display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500,
                }}
              >
                Override department
                <IconChevronDown size={12} style={{ transform: showOverride ? 'rotate(180deg)' : 'none', transition: '200ms' }} />
              </button>
              {showOverride && (
                <select
                  value={deptOverride ?? ''}
                  onChange={e => setDeptOverride(e.target.value as Department || null)}
                  style={{ ...inputStyle, marginTop: 2, width: 'auto' }}
                >
                  <option value="">Use AI suggestion ({aiDept})</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              )}
            </div>
          )}

          {!hasKey && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
              Add your Groq key in Settings to enable AI categorization.
            </p>
          )}
        </Field>

        {/* Similar tickets */}
        {similarTickets.length > 0 && (
          <div style={{
            border: '1px solid var(--border-default)',
            borderRadius: 10, overflow: 'hidden',
          }} className="animate-fade-in">
            <button
              onClick={() => setSimilarOpen(o => !o)}
              style={{
                width: '100%', padding: '11px 16px',
                background: 'var(--bg-surface)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                color: 'var(--text-primary)', fontSize: 13,
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconSparkles size={13} color="var(--accent)" />
                <span style={{ fontWeight: 500 }}>
                  {similarTickets.length} similar ticket{similarTickets.length > 1 ? 's' : ''} found
                </span>
              </span>
              <IconChevronDown
                size={14}
                style={{ transform: similarOpen ? 'rotate(180deg)' : 'none', transition: '200ms', color: 'var(--text-muted)' }}
              />
            </button>
            {similarOpen && (
              <div className="animate-fade-in">
                <p style={{ padding: '8px 16px', fontSize: 12, color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)' }}>
                  Check if your issue is already addressed before submitting.
                </p>
                {similarTickets.map(t => (
                  <div key={t.id} style={{
                    padding: '12px 16px', borderTop: '1px solid var(--border-subtle)',
                    display: 'flex', flexDirection: 'column', gap: 5,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>{t.id}</span>
                      <StatusPill status={t.status} />
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                        {t.category} · {timeAgo(t.updatedAt)}
                      </span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{t.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
          <button
            onClick={submit}
            disabled={!canSubmit}
            style={{
              background: canSubmit ? 'var(--gradient-accent)' : 'var(--bg-hover)',
              color: canSubmit ? '#fff' : 'var(--text-muted)',
              border: 'none',
              borderRadius: 9,
              padding: '11px 24px',
              fontSize: 14,
              fontWeight: 600,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              boxShadow: canSubmit ? '0 2px 10px rgba(255,107,53,0.30)' : 'none',
              transition: 'all 140ms ease',
              letterSpacing: '-0.1px',
            }}
            onMouseEnter={e => {
              if (canSubmit) {
                e.currentTarget.style.boxShadow = '0 4px 18px rgba(255,107,53,0.42)';
                e.currentTarget.style.opacity = '0.92';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = canSubmit ? '0 2px 10px rgba(255,107,53,0.30)' : 'none';
              e.currentTarget.style.opacity = '1';
            }}
          >
            Raise ticket →
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: 'var(--bg-input)',
  border: '1px solid var(--border-default)',
  borderRadius: 8,
  padding: '10px 12px',
  color: 'var(--text-primary)',
  fontSize: 13,
  width: '100%',
  transition: 'border-color 120ms',
};
