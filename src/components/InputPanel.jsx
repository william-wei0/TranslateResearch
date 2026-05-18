// components/InputPanel.jsx
import { useState, useRef } from 'react'
import { extractTextFromPDF } from '../lib/pdfExtract.js'

const AUDIENCES = [
  { id: 'scientist',     label: 'Technical Summary',      desc: 'Technical language, field-specific terms' },
  { id: 'nonscientist',  label: 'Non-Technical Summary',  desc: 'Plain language' },
]

export default function InputPanel({ onSubmit, loading }) {
  const [tab, setTab] = useState('text')
  const [text, setText] = useState('')
  const [pdfText, setPdfText] = useState('')
  const [pdfName, setPdfName] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)
  const [audience, setAudience] = useState('scientist')
  const fileRef = useRef()

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setPdfLoading(true)
    setPdfName(file.name)
    try {
      const extracted = await extractTextFromPDF(file)
      setPdfText(extracted)
    } catch (err) {
      setPdfName(`Error: ${err.message}`)
    } finally {
      setPdfLoading(false)
    }
  }

  function handleSubmit() {
    const content = tab === 'text' ? text : pdfText
    onSubmit({ text: content, audience })
  }

  const canSubmit = !loading && !pdfLoading && (
    (tab === 'text' && text.trim().length > 50) ||
    (tab === 'pdf' && pdfText.length > 50)
  )

  const s = {
    tabs: { display: 'flex', gap: '0', marginBottom: '1rem', borderBottom: '1px solid var(--border)' },
    tab: (active) => ({
      padding: '8px 18px',
      fontSize: '13px',
      background: 'none',
      border: 'none',
      borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
      color: active ? 'var(--accent)' : 'var(--text-secondary)',
      cursor: 'pointer',
      fontFamily: 'var(--font-body)',
      fontWeight: active ? 500 : 400,
      transition: 'all 0.15s',
      marginBottom: '-1px',
    }),
    textarea: {
      width: '100%',
      height: '200px',
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      color: 'var(--text-primary)',
      padding: '14px',
      fontSize: '14px',
      lineHeight: '1.65',
      resize: 'vertical',
      outline: 'none',
      transition: 'border-color 0.15s',
    },
    dropzone: {
      border: '1px dashed var(--border-mid)',
      borderRadius: 'var(--radius)',
      padding: '3rem 1rem',
      textAlign: 'center',
      cursor: 'pointer',
      background: 'var(--bg-card)',
      transition: 'all 0.15s',
    },
    audienceGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '8px',
      margin: '1.25rem 0',
    },
    audienceCard: (active) => ({
      padding: '10px 12px',
      background: active ? 'var(--accent-dim)' : 'var(--bg-card)',
      border: `1px solid ${active ? 'var(--accent-border)' : 'var(--border)'}`,
      borderRadius: 'var(--radius)',
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'all 0.15s',
    }),
    audienceLabel: (active) => ({
      display: 'block',
      fontSize: '13px',
      fontWeight: 500,
      color: active ? 'var(--accent)' : 'var(--text-primary)',
      marginBottom: '3px',
    }),
    audienceDesc: {
      display: 'block',
      fontSize: '11px',
      color: 'var(--text-muted)',
      lineHeight: '1.4',
    },
    btn: {
      width: '100%',
      padding: '13px',
      fontSize: '14px',
      fontWeight: 500,
      background: canSubmit ? 'var(--accent)' : 'var(--bg-raised)',
      color: canSubmit ? '#0f0f0d' : 'var(--text-muted)',
      border: 'none',
      borderRadius: 'var(--radius)',
      cursor: canSubmit ? 'pointer' : 'not-allowed',
      transition: 'all 0.2s',
      letterSpacing: '0.02em',
    },
    charCount: {
      textAlign: 'right',
      fontSize: '12px',
      color: 'var(--text-muted)',
      marginTop: '6px',
      fontFamily: 'var(--font-mono)',
    },
  }

  return (
    <div>
      <div style={s.tabs}>
        <button style={s.tab(tab === 'text')} onClick={() => setTab('text')}>Paste text</button>
        <button style={s.tab(tab === 'pdf')} onClick={() => setTab('pdf')}>Upload PDF</button>
      </div>

      {tab === 'text' ? (
        <>
          <textarea
            style={s.textarea}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste a research abstract or full paper text here..."
            onFocus={e => e.target.style.borderColor = 'var(--border-hi)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <div style={s.charCount}>{text.length.toLocaleString()} chars</div>
        </>
      ) : (
        <div
          style={s.dropzone}
          onClick={() => fileRef.current.click()}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hi)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-mid)'}
        >
          <input ref={fileRef} type="file" accept=".pdf" onChange={handleFile} style={{ display: 'none' }} />
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>📄</div>
          {pdfLoading ? (
            <p style={{ color: 'var(--accent)', fontSize: '14px' }}>Extracting text...</p>
          ) : pdfName ? (
            <>
              <p style={{ color: 'var(--green)', fontSize: '14px', marginBottom: '4px' }}>{pdfName}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{pdfText.length.toLocaleString()} characters extracted</p>
            </>
          ) : (
            <>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>Click to upload a PDF</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Text is extracted from up to 15 pages</p>
            </>
          )}
        </div>
      )}

      <div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1.25rem', marginBottom: '8px', letterSpacing: '0.07em', fontFamily: 'var(--font-mono)' }}>AUDIENCE</p>
        <div style={s.audienceGrid}>
          {AUDIENCES.map(a => (
            <button key={a.id} style={s.audienceCard(audience === a.id)} onClick={() => setAudience(a.id)}>
              <span style={s.audienceLabel(audience === a.id)}>{a.label}</span>
              <span style={s.audienceDesc}>{a.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <button style={s.btn} onClick={handleSubmit} disabled={!canSubmit}>
        {loading ? 'Summarizing...' : 'Summarize paper →'}
      </button>
    </div>
  )
}
