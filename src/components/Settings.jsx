// components/Settings.jsx
import ApiKeyInput from "./ApiKeyInput.jsx";

export default function Settings({
  open,
  onClose,
  apiKey,
  onApiKeyChange,
  openaiKey,
  onOpenaiKeyChange,
  theme,
  onThemeChange,
}) {
  if (!open) return null;

  const isLight = theme === "light";

  const s = {
    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.55)",
      backdropFilter: "blur(4px)",
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    modal: {
      background: "var(--bg-card)",
      border: "1px solid var(--border-mid)",
      borderRadius: "16px",
      width: "480px",
      maxWidth: "calc(100vw - 2rem)",
      boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
      overflow: "hidden",
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "1.25rem 1.5rem",
      borderBottom: "1px solid var(--border)",
    },
    title: {
      fontFamily: "var(--font-display)",
      fontSize: "18px",
      fontWeight: 300,
      color: "var(--text-primary)",
    },
    closeBtn: {
      background: "none",
      border: "none",
      color: "var(--text-muted)",
      cursor: "pointer",
      fontSize: "20px",
      padding: "2px 6px",
      borderRadius: "6px",
      lineHeight: 1,
      transition: "color 0.15s",
    },
    body: {
      padding: "1.5rem",
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
    },
    section: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    sectionLabel: {
      fontSize: "10px",
      fontFamily: "var(--font-mono)",
      color: "var(--text-muted)",
      letterSpacing: "0.1em",
    },
    sectionHint: {
      fontSize: "12px",
      color: "var(--text-muted)",
      lineHeight: "1.5",
    },
    divider: {
      borderTop: "1px solid var(--border)",
      margin: "0",
    },
    themeRow: {
      display: "flex",
      gap: "8px",
    },
    themeBtn: (active) => ({
      flex: 1,
      padding: "10px",
      borderRadius: "10px",
      border: `1px solid ${active ? "var(--accent-border)" : "var(--border)"}`,
      background: active ? "var(--accent-dim)" : "var(--bg-raised)",
      color: active ? "var(--accent)" : "var(--text-secondary)",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: active ? 500 : 400,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "7px",
      transition: "all 0.15s",
    }),
    ragBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      fontSize: "11px",
      fontFamily: "var(--font-mono)",
      padding: "3px 10px",
      borderRadius: "99px",
      background: openaiKey ? "var(--green-dim)" : "var(--bg-raised)",
      color: openaiKey ? "var(--green)" : "var(--text-muted)",
      border: `1px solid ${openaiKey ? "rgba(107,181,138,0.25)" : "var(--border)"}`,
      alignSelf: "flex-start",
    },
    ragDot: {
      width: "5px",
      height: "5px",
      borderRadius: "50%",
      background: openaiKey ? "var(--green)" : "var(--text-muted)",
    },
    footer: {
      padding: "1rem 1.5rem",
      borderTop: "1px solid var(--border)",
      display: "flex",
      justifyContent: "flex-end",
    },
    doneBtn: {
      padding: "8px 20px",
      borderRadius: "8px",
      border: "none",
      background: "var(--done-accent)",
      color: "#0f0f0d",
      fontWeight: 500,
      fontSize: "13px",
      cursor: "pointer",
    },
  };

  return (
    <div style={s.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={s.modal}>
        <div style={s.header}>
          <span style={s.title}>Settings</span>
          <button style={s.closeBtn} onClick={onClose} title="Close">×</button>
        </div>

        <div style={s.body}>

          {/* Theme */}
          <div style={s.section}>
            <div style={s.sectionLabel}>APPEARANCE</div>
            <div style={s.themeRow}>
              <button style={s.themeBtn(!isLight)} onClick={() => onThemeChange("dark")}>
                <span>🌙</span> Dark
              </button>
              <button style={s.themeBtn(isLight)} onClick={() => onThemeChange("light")}>
                <span>☀️</span> Light
              </button>
            </div>
          </div>

          <div style={s.divider} />

          {/* Anthropic key */}
          <div style={s.section}>
            <div style={s.sectionLabel}>ANTHROPIC API KEY</div>
            <ApiKeyInput value={apiKey} onChange={onApiKeyChange} placeholder="sk-ant-..." />
            <span style={s.sectionHint}>
              Required for summarization and translation.{" "}
              <a href="https://console.anthropic.com" target="_blank" rel="noreferrer"
                style={{ color: "var(--accent)", textDecoration: "none" }}>
                console.anthropic.com
              </a>
            </span>
          </div>

          <div style={s.divider} />

          {/* OpenAI key */}
          <div style={s.section}>
            <div style={s.sectionLabel}>OPENAI API KEY — OPTIONAL</div>
            <ApiKeyInput value={openaiKey} onChange={onOpenaiKeyChange} placeholder="sk-..." />
            <div style={s.ragBadge}>
              <div style={s.ragDot} />
              {openaiKey ? "Semantic RAG enabled" : "Keyword RAG — add key for semantic search"}
            </div>
            <span style={s.sectionHint}>
              Enables embedding-based RAG for more accurate domain context retrieval.{" "}
              <a href="https://platform.openai.com" target="_blank" rel="noreferrer"
                style={{ color: "var(--accent)", textDecoration: "none" }}>
                platform.openai.com
              </a>
            </span>
          </div>

        </div>

        <div style={s.footer}>
          <button style={s.doneBtn} onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}