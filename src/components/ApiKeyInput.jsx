import { useState, useRef } from 'react'

export default function ApiKeyInput({ value, onChange, placeholder = 'sk-...' }) {
  const [draft, setDraft] = useState('')
  const [editing, setEditing] = useState(false)
  const [saved, setSaved]   = useState(false)
  const inputRef = useRef(null)

  const isSet = value && value.length > 10

  function startEditing() {
    setEditing(true)
    setDraft('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function handleSave() {
    if (!draft.trim()) { cancel(); return }
    onChange(draft.trim())
    setDraft('')
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function cancel() {
    setDraft('')
    setEditing(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter')  handleSave()
    if (e.key === 'Escape') cancel()
  }

  function handleClear(e) {
    e.stopPropagation()
    onChange('')
    setDraft('')
    setEditing(false)
  }

  const s = {
    row: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'var(--bg-raised)',
      border: `1px solid ${editing ? 'var(--border-mid)' : 'var(--border)'}`,
      borderRadius: 'var(--radius)',
      padding: '9px 12px',
      cursor: editing ? 'default' : 'pointer',
      transition: 'border-color 0.15s',
      minHeight: '40px',
    },
    dot: {
      width: '7px',
      height: '7px',
      borderRadius: '50%',
      flexShrink: 0,
      background: isSet ? 'var(--green)' : 'var(--text-muted)',
      boxShadow: isSet ? '0 0 5px var(--green)' : 'none',
      transition: 'all 0.3s',
    },
    input: {
      flex: 1,
      background: 'transparent',
      border: 'none',
      outline: 'none',
      color: 'var(--text-primary)',
      fontSize: '13px',
      fontFamily: 'var(--font-mono)',
    },
    statusText: {
      flex: 1,
      fontSize: '12px',
      fontFamily: 'var(--font-mono)',
      color: isSet ? 'var(--text-secondary)' : 'var(--text-muted)',
      letterSpacing: isSet ? '0.12em' : '0',
      userSelect: 'none',
    },
    saveBtn: {
      padding: '4px 12px',
      borderRadius: '6px',
      border: 'none',
      background: draft.trim() ? 'var(--accent)' : 'var(--bg-card)',
      color: draft.trim() ? '#0f0f0d' : 'var(--text-muted)',
      fontWeight: 500,
      fontSize: '12px',
      cursor: draft.trim() ? 'pointer' : 'default',
      transition: 'all 0.15s',
      flexShrink: 0,
    },
    iconBtn: (danger) => ({
      background: 'none',
      border: 'none',
      color: danger ? '#f33737' : 'var(--text-muted)',
      cursor: 'pointer',
      fontSize: '14px',
      padding: '0 2px',
      lineHeight: 1,
      flexShrink: 0,
      opacity: 0.7,
    }),
    savedBadge: {
      fontSize: '11px',
      fontFamily: 'var(--font-mono)',
      color: 'var(--green)',
      flexShrink: 0,
    },
  }

  return (
    <div
      style={s.row}
      onClick={!editing ? startEditing : undefined}
      onMouseEnter={e => { if (!editing) e.currentTarget.style.borderColor = 'var(--border-hi)' }}
      onMouseLeave={e => { if (!editing) e.currentTarget.style.borderColor = 'var(--border)' }}
    >
      <div style={s.dot} />

      {editing ? (
        <>
          <input
            ref={inputRef}
            style={s.input}
            type="password"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            spellCheck={false}
          />
          <button style={s.saveBtn} onClick={handleSave}>Save</button>
          <button style={s.iconBtn(false)} onClick={cancel} title="Cancel">✕</button>
        </>
      ) : (
        <>
          <span style={s.statusText}>
            {saved ? 'Saved' : isSet ? '• • • • • • • • • • • •' : 'Click to add key'}
          </span>
          {isSet && !saved && (
            <button style={s.iconBtn(true)} onClick={handleClear} title="Clear key">✕</button>
          )}
        </>
      )}
    </div>
  )
}