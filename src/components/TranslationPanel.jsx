// components/TranslationPanel.jsx
import { useState } from 'react'
import { LANGUAGES } from '../lib/languages.js'
import { claudeComplete, parseJSON, TRANSLATE_PROMPT, buildTranslatePrompt } from '../lib/anthropic.js'
import SummaryCard from './SummaryCard.jsx'

export default function TranslationPanel({ apiKey, originalSummary }) {
  const [selected, setSelected] = useState(null)
  const [translated, setTranslated] = useState({})
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState('')

  async function translate(lang) {
    if (translated[lang.code]) {
      setSelected(lang)
      return
    }
    setSelected(lang)
    setLoading(lang.code)
    setError('')
    try {
      const raw = await claudeComplete(
        apiKey,
        TRANSLATE_PROMPT,
        buildTranslatePrompt(originalSummary, lang.name),
        1500
      )
      const parsed = parseJSON(raw)
      setTranslated(prev => ({ ...prev, [lang.code]: parsed }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  const s = {
    wrapper: { marginTop: '2rem' },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '1rem',
    },
    title: {
      fontFamily: 'var(--font-display)',
      fontSize: '18px',
      fontWeight: 300,
      color: 'var(--text-primary)',
    },
    badge: {
      fontSize: '11px',
      fontFamily: 'var(--font-mono)',
      background: 'var(--green-dim)',
      color: 'var(--green)',
      padding: '3px 10px',
      borderRadius: '99px',
      border: '1px solid rgba(107,181,138,0.2)',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
      gap: '6px',
      marginBottom: '1.5rem',
    },
    langBtn: (lang) => {
      const isSelected = selected?.code === lang.code
      const isDone = !!translated[lang.code]
      return {
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        padding: '8px 10px',
        background: isSelected ? 'var(--accent-dim)' : isDone ? 'var(--green-dim)' : 'var(--bg-card)',
        border: `1px solid ${isSelected ? 'var(--accent-border)' : isDone ? 'rgba(107,181,138,0.25)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)',
        cursor: 'pointer',
        transition: 'all 0.15s',
        textAlign: 'left',
      }
    },
    langFlag: { fontSize: '14px' },
    langLabel: (lang) => ({
      fontSize: '12px',
      fontWeight: selected?.code === lang.code ? 500 : 400,
      color: selected?.code === lang.code ? 'var(--accent)' : 'var(--text-secondary)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }),
    spinner: {
      width: '12px',
      height: '12px',
      border: '2px solid var(--border-mid)',
      borderTopColor: 'var(--accent)',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      flexShrink: 0,
    },
    check: {
      fontSize: '11px',
      color: 'var(--green)',
    },
    error: {
      fontSize: '13px',
      color: '#e07070',
      background: 'rgba(224,112,112,0.08)',
      border: '1px solid rgba(224,112,112,0.2)',
      borderRadius: 'var(--radius)',
      padding: '10px 14px',
      marginBottom: '1rem',
    },
    translatedHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '0.75rem',
    },
    translatedFlag: { fontSize: '18px' },
    translatedName: {
      fontFamily: 'var(--font-mono)',
      fontSize: '11px',
      color: 'var(--text-muted)',
      letterSpacing: '0.07em',
    },
  }

  return (
    <div style={s.wrapper}>
      <div style={s.header}>
        <span style={s.title}>Translate summary</span>
        <span style={s.badge}>{LANGUAGES.length} languages</span>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={s.grid}>
        {LANGUAGES.map(lang => (
          <button key={lang.code} style={s.langBtn(lang)} onClick={() => translate(lang)}>
            <span style={s.langFlag}>{lang.flag}</span>
            <span style={s.langLabel(lang)}>{lang.label}</span>
            {loading === lang.code && <div style={s.spinner} />}
            {translated[lang.code] && loading !== lang.code && (
              <span style={s.check}>✓</span>
            )}
          </button>
        ))}
      </div>

      {error && <div style={s.error}>{error}</div>}

      {selected && loading === selected.code && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '14px' }}>
          Translating into {selected.name}...
        </div>
      )}

      {selected && translated[selected.code] && (
        <div className="fade-up">
          <div style={s.translatedHeader}>
            <span style={s.translatedFlag}>{selected.flag}</span>
            <span style={s.translatedName}>{selected.name.toUpperCase()}</span>
          </div>
          <SummaryCard summary={translated[selected.code]} rtl={selected.rtl} />
        </div>
      )}
    </div>
  )
}
