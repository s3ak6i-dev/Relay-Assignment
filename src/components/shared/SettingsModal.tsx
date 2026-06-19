import { useState } from 'react';
import { Modal } from './Modal';
import { useApp } from '../../context/AppContext';
import { IconEye, IconEyeOff } from '@tabler/icons-react';

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { groqApiKey, setGroqKey, clearGroqKey } = useApp();
  const [value, setValue] = useState(groqApiKey);
  const [show, setShow] = useState(false);

  function save() {
    if (value.trim()) setGroqKey(value.trim());
    onClose();
  }

  return (
    <Modal title="Settings" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Groq API Key
          </label>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
            Paste your Groq API key to enable AI features — auto-categorization, similar ticket detection, and draft responses.
          </p>
          <div style={{ position: 'relative' }}>
            <input
              type={show ? 'text' : 'password'}
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="gsk_..."
              style={{
                width: '100%', background: 'var(--bg-input)',
                border: '1px solid var(--border-default)', borderRadius: 8,
                padding: '10px 40px 10px 12px', color: 'var(--text-primary)',
                fontSize: 13,
              }}
            />
            <button
              onClick={() => setShow(s => !s)}
              aria-label={show ? 'Hide key' : 'Show key'}
              style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-secondary)', display: 'flex',
              }}
            >
              {show ? <IconEyeOff size={16} /> : <IconEye size={16} />}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {groqApiKey && (
            <button
              onClick={() => { clearGroqKey(); setValue(''); }}
              style={{
                background: 'none', border: '1px solid var(--border-default)',
                borderRadius: 8, padding: '8px 14px',
                color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13,
              }}
            >
              Remove key
            </button>
          )}
          <button
            onClick={save}
            style={{
              background: 'var(--accent)', border: 'none',
              borderRadius: 8, padding: '8px 18px',
              color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500,
            }}
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}
