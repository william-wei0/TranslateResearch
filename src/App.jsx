import { useState, useEffect } from "react";
import InputPanel from "./components/InputPanel.jsx";
import SummaryCard from "./components/SummaryCard.jsx";
import TranslationPanel from "./components/TranslationPanel.jsx";
import Settings from "./components/Settings.jsx";
import ErrorBanner from "./components/APIErrorBanner.jsx";
import KnowledgeBaseEditor from "./components/KnowledgeBaseEditor.jsx";
import { retrieve, retrieveByKeyword } from "./lib/rag.js";
import {
  claudeComplete,
  parseJSON,
  SUMMARIZE_SYSTEM,
  buildSummarizePrompt,
  detectDomain,
} from "./lib/anthropic.js";

export default function App() {
  const [apiKey, setApiKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [error, setError] = useState("");
  const [domainContext, setDomainContext] = useState(null);
  const [history, setHistory] = useState([]);
  const [leftTabStatus, setLeftTabStatus] = useState("new");
  const [followup, setFollowup] = useState("");
  const [followupAnswer, setFollowupAnswer] = useState("");
  const [askingFollowup, setAskingFollowup] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (window.desktop) {
      window.desktop.loadKeys().then(({ anthropic, openai }) => {
        if (anthropic) setApiKey(anthropic);
        if (openai) setOpenaiKey(openai);
      });
      window.desktop.loadHistory().then(setHistory);
    }
  }, []);

  useEffect(() => {
    if (window.desktop && (apiKey || openaiKey)) {
      window.desktop.saveKeys(apiKey, openaiKey);
    }
  }, [apiKey, openaiKey]);

  async function askFollowupQuestion() {
    if (!followup.trim() || !summary) return;
    setAskingFollowup(true);
    setError("");
    try {
      const raw = await claudeComplete(
        `You are answering questions about a previously summarized research paper.
         Answer clearly and precisely. If the answer is uncertain, say so.`,
        `Research summary:\n${JSON.stringify(summary, null, 2)}\n\nUser question:\n${followup}`,
      );
      setFollowupAnswer(raw);
    } catch (err) {
      setError(err.message);
    } finally {
      setAskingFollowup(false);
    }
  }

  async function handleSubmit({ text, audience }) {
    if (!apiKey.trim()) {
      setError("Please enter your Anthropic API key in Settings.");
      return;
    }
    if (!text.trim()) {
      setError("Please provide some text to summarize.");
      return;
    }

    setLoading(true);
    setError("");
    setSummary(null);
    setDomainContext(null);
    setFollowup("");
    setFollowupAnswer("");

    try {
      setLoadingStage("Detecting domain...");
      const domain = await detectDomain(text);
      setDomainContext(domain);

      setLoadingStage(
        openaiKey
          ? "Retrieving domain knowledge (semantic search)..."
          : "Retrieving domain knowledge (keyword search)...",
      );

      const query = `${domain.domain} ${domain.methodology} ${domain.study_type}`;
      const chunks = openaiKey
        ? await retrieve(query, 3)
        : retrieveByKeyword(query, domain.domain, 3);

      setLoadingStage("Summarizing...");
      const raw = await claudeComplete(
        SUMMARIZE_SYSTEM,
        buildSummarizePrompt(text, audience, chunks),
      );
      const parsed = parseJSON(raw);

      const finalSummary = {
        ...parsed,
        retrievedChunks: chunks,
        domainContext: domain,
      };
      setSummary(finalSummary);

      if (window.desktop) {
        await window.desktop.saveHistory({
          headline: parsed.headline,
          domain: domain.domain,
          summary: finalSummary,
        });
        setHistory(await window.desktop.loadHistory());
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingStage("");
    }
  }

  const s = {
    layout: {
      minHeight: "100vh",
      display: "grid",
      gridTemplateColumns: "460px 1fr",
      gridTemplateRows: "auto 1fr",
    },
    topbar: {
      background: "var(--bg-nav)",
      gridColumn: "1 / -1",
      borderBottom: "1px solid var(--border)",
      padding: "0 1.5rem",
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      height: "56px",
    },
    logo: {
      fontFamily: "var(--font-display)",
      fontSize: "20px",
      fontWeight: 300,
      color: "var(--text-primary)",
      letterSpacing: "-0.01em",
    },
    logoAccent: { color: "var(--accent)" },
    tagline: {
      fontSize: "12px",
      color: "var(--text-muted)",
      borderLeft: "1px solid var(--border)",
      paddingLeft: "1rem",
    },
    topbarRight: {
      marginLeft: "auto",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    gearBtn: {
      background: "var(--bg-gearBtn)",
      border: "1px solid var(--border-very-hi)",
      borderRadius: "8px",
      color: "var(--text-muted)",
      cursor: "pointer",
      padding: "6px 9px",
      fontSize: "16px",
      lineHeight: 1,
      transition: "all 0.15s",
      display: "flex",
      alignItems: "center",
    },
    leftCol: {
      borderRight: "1px solid var(--border)",
      padding: "1.75rem",
      overflowY: "auto",
      background: "var(--bg-left)",
    },
    rightCol: {
      padding: "1.75rem",
      overflowY: "auto",
      background: "var(--bg)",
    },
    sectionLabel: {
      fontSize: "10px",
      fontFamily: "var(--font-mono)",
      color: "var(--text-muted)",
      letterSpacing: "0.1em",
      marginBottom: "1rem",
    },
    domainBadgeRow: {
      display: "flex",
      gap: "6px",
      flexWrap: "wrap",
      marginBottom: "1rem",
    },
    domainBadge: {
      fontSize: "11px",
      fontFamily: "var(--font-mono)",
      background: "var(--accent-dim)",
      color: "var(--accent)",
      border: "1px solid var(--accent-border)",
      padding: "3px 10px",
      borderRadius: "99px",
    },
    empty: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      gap: "12px",
      color: "var(--text-muted)",
    },
    emptyIcon: { fontSize: "48px", opacity: 0.3 },
    emptyText: {
      fontFamily: "var(--font-display)",
      fontSize: "18px",
      fontWeight: 300,
    },
    emptySubtext: {
      fontSize: "13px",
      maxWidth: "300px",
      textAlign: "center",
      lineHeight: "1.6",
    },
    loadingCard: {
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      padding: "2rem",
      textAlign: "center",
    },
    loadingStage: {
      color: "var(--text-muted)",
      fontSize: "13px",
      fontFamily: "var(--font-mono)",
      marginTop: "1rem",
    },
    pulse: {
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      border: "2px solid var(--border)",
      borderTopColor: "var(--accent)",
      animation: "spin 0.8s linear infinite",
      margin: "0 auto",
    },
    tabRow: { display: "flex", gap: "8px", marginBottom: "1.25rem" },
    tabButton: (active) => ({
      padding: "8px 12px",
      borderRadius: "10px",
      border: "1px solid var(--border)",
      background: active ? "var(--accent-dim)" : "var(--bg-card)",
      color: active ? "var(--accent)" : "var(--text-muted)",
      cursor: "pointer",
      fontSize: "13px",
    }),
    noKeyBanner: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "12px 14px",
      borderRadius: "var(--radius)",
      border: "1px solid var(--accent-border)",
      background: "var(--accent-dim)",
      marginBottom: "1.25rem",
      fontSize: "13px",
      color: "var(--text-secondary)",
    },
    noKeyBtn: {
      marginLeft: "auto",
      padding: "5px 12px",
      borderRadius: "6px",
      border: "1px solid var(--accent-border)",
      background: "none",
      color: "var(--accent)",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: 500,
      whiteSpace: "nowrap",
    },
  };

  return (
    <div style={s.layout}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <Settings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        openaiKey={openaiKey}
        onOpenaiKeyChange={setOpenaiKey}
        theme={theme}
        onThemeChange={setTheme}
      />

      {/* TOP BAR */}
      <div style={s.topbar}>
        <div style={s.logo}>
          Translate<span style={s.logoAccent}>Research</span>
        </div>
        <div style={s.topbarRight}>
          <button
            style={s.gearBtn}
            onClick={() => setSettingsOpen(true)}
            title="Settings"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--border-hi)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7.02 7.02 0 0 0-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.74 8.87a.47.47 0 0 0 .12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.47.47 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.37 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.47.47 0 0 0-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
            </svg>
          </button>
        </div>
      </div>

      {/* LEFT COLUMN */}
      <div style={s.leftCol}>
        <div style={s.tabRow}>
          <button
            style={s.tabButton(leftTabStatus === "new")}
            onClick={() => setLeftTabStatus("new")}
          >
            New Summary
          </button>
          <button
            style={s.tabButton(leftTabStatus === "history")}
            onClick={() => setLeftTabStatus("history")}
          >
            History {history.length ? `(${history.length})` : ""}
          </button>
          <button
            style={s.tabButton(leftTabStatus === "knowledge")}
            onClick={() => setLeftTabStatus("knowledge")}
          >
            Knowledge Base
          </button>
        </div>

        {leftTabStatus === "new" ? (
          <>
            {/* Nudge to open settings if no API key set */}
            {!apiKey && (
              <div style={s.noKeyBanner}>
                <span>Add your Anthropic API key to get started.</span>
                <button
                  style={s.noKeyBtn}
                  onClick={() => setSettingsOpen(true)}
                >
                  Open Settings
                </button>
              </div>
            )}

            <div style={s.sectionLabel}>INPUT</div>
            <InputPanel onSubmit={handleSubmit} loading={loading} />
          </>
        ) : leftTabStatus === "history" ? (
          <>
            <div style={s.sectionLabel}>PREVIOUS SUMMARIES</div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {history.length === 0 ? (
                <div style={s.emptySubtext}>No saved summaries yet.</div>
              ) : (
                history.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSummary(item.summary);
                      setLeftTabStatus("new");
                    }}
                    style={{
                      textAlign: "left",
                      padding: "12px",
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                      background: "var(--bg-card)",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 500,
                        marginBottom: "6px",
                        color: "var(--text-primary)",
                      }}
                    >
                      {item.headline}
                    </div>
                    <div
                      style={{ fontSize: "12px", color: "var(--text-muted)" }}
                    >
                      {item.domain}
                    </div>
                    {item.savedAt && (
                      <div
                        style={{
                          fontSize: "11px",
                          marginTop: "8px",
                          color: "var(--text-muted)",
                          opacity: 0.7,
                        }}
                      >
                        {new Date(item.savedAt).toLocaleString()}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </>
        ) : (
          <KnowledgeBaseEditor />
        )}

        <ErrorBanner error={error} onDismiss={() => setError("")} />
      </div>

      {/* RIGHT COLUMN */}
      <div style={s.rightCol}>
        {loading ? (
          <div style={s.loadingCard}>
            <div style={s.pulse} />
            <div style={s.loadingStage}>{loadingStage}</div>
          </div>
        ) : summary ? (
          <>
            {summary.domainContext && (
              <>
                <div style={s.sectionLabel}>DOMAIN</div>
                <div style={s.domainBadgeRow}>
                  <span style={s.domainBadge}>
                    {summary.domainContext.domain}
                  </span>
                  <span style={s.domainBadge}>
                    {summary.domainContext.study_type}
                  </span>
                  <span style={s.domainBadge}>
                    {summary.domainContext.methodology}
                  </span>
                </div>
              </>
            )}

            <div style={s.sectionLabel}>SUMMARY — ENGLISH</div>
            <SummaryCard summary={summary} />
            <TranslationPanel originalSummary={summary} />

            <div
              style={{
                marginTop: "2rem",
                borderTop: "1px solid var(--border)",
                paddingTop: "1.5rem",
              }}
            >
              <div style={s.sectionLabel}>FOLLOW-UP QUESTIONS</div>
              <textarea
                value={followup}
                onChange={(e) => setFollowup(e.target.value)}
                placeholder="Ask deeper questions about this paper..."
                style={{
                  width: "100%",
                  minHeight: "100px",
                  boxSizing: "border-box",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  padding: "12px",
                  color: "var(--text-primary)",
                  resize: "vertical",
                  fontFamily: "var(--font-body)",
                  fontSize: "14px",
                }}
              />
              <button
                onClick={askFollowupQuestion}
                disabled={askingFollowup}
                style={{
                  marginTop: "12px",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border: "none",
                  background: "var(--accent)",
                  color: "#0f0f0d",
                  cursor: askingFollowup ? "not-allowed" : "pointer",
                  fontWeight: 500,
                  fontSize: "13px",
                  opacity: askingFollowup ? 0.6 : 1,
                }}
              >
                {askingFollowup ? "Thinking..." : "Ask"}
              </button>

              {followupAnswer && (
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "1rem",
                    borderRadius: "12px",
                    border: "1px solid var(--border)",
                    background: "var(--bg-card)",
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                    fontSize: "14px",
                    color: "var(--text-secondary)",
                  }}
                >
                  {followupAnswer}
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={s.empty}>
            <div style={s.emptyText}>Nothing here yet</div>
            <div style={s.emptySubtext}>
              Paste a research abstract or upload a PDF on the left to generate
              a structured summary
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
