const s = {
  card: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
    marginBottom: "1rem",
  },
  headline: {
    padding: "1.25rem 1.5rem",
    borderBottom: "1px solid var(--border)",
    background: "var(--bg-raised)",
  },
  headlineLabel: {
    fontSize: "10px",
    fontFamily: "var(--font-mono)",
    color: "var(--accent)",
    letterSpacing: "0.1em",
    marginBottom: "8px",
  },
  headlineText: {
    fontFamily: "var(--font-display)",
    fontSize: "20px",
    fontWeight: 300,
    lineHeight: "1.4",
    color: "var(--text-primary)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    borderBottom: "1px solid var(--border)",
  },
  gridCell: {
    padding: "1.1rem 1.25rem",
    borderRight: "1px solid var(--border)",
  },
  gridCellLast: {
    padding: "1.1rem 1.25rem",
  },
  sectionLabel: {
    fontSize: "10px",
    fontFamily: "var(--font-mono)",
    color: "var(--text-muted)",
    letterSpacing: "0.1em",
    marginBottom: "8px",
  },
  sectionText: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    lineHeight: "1.65",
  },
  findings: {
    padding: "1.1rem 1.25rem",
    borderBottom: "1px solid var(--border)",
  },
  findingItem: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
    marginBottom: "8px",
  },
  findingBullet: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    background: "var(--accent)",
    marginTop: "7px",
    flexShrink: 0,
  },
  findingText: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    lineHeight: "1.6",
  },
  figureCard: {
    padding: "1.1rem 1.25rem",
    borderLeft: "2px solid var(--accent-border)",
    margin: "1rem 1.25rem",
    background: "var(--accent-dim)",
    borderRadius: "0 var(--radius) var(--radius) 0",
  },
};

export default function SummaryCard({ summary, rtl }) {
  if (!summary) return null;
  const statusColor = {
    supported: "var(--green)",
    unsupported: "#e07070",
    extrapolated: "var(--accent)",
  };

  return (
    <div style={s.card} dir={rtl ? "rtl" : "ltr"} className="fade-up">
      <div style={s.headline}>
        <div style={s.headlineLabel}>HEADLINE FINDING</div>
        <div style={s.headlineText}>{summary.headline}</div>
      </div>

      <div style={s.findings}>
        <div style={s.sectionLabel}>KEY FINDINGS</div>
        {(summary.key_findings || []).map((f, i) => {
          const check = summary.verification?.findings_check?.[i];
          return (
            <div key={i} style={s.findingItem}>
              <div style={s.findingBullet} />
              <span style={s.findingText}>{f}</span>
              {check && (
                <span
                  style={{
                    fontSize: "10px",
                    fontFamily: "var(--font-mono)",
                    color: statusColor[check.status],
                    whiteSpace: "nowrap",
                    marginLeft: "8px",
                  }}
                >
                  {check.status}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div style={s.grid}>
        <div style={s.gridCell}>
          <div style={s.sectionLabel}>METHODS</div>
          <div style={s.sectionText}>{summary.methods}</div>
        </div>
        <div style={s.gridCellLast}>
          <div style={s.sectionLabel}>LIMITATIONS</div>
          <div style={s.sectionText}>{summary.limitations}</div>
        </div>
      </div>

      <div
        style={{
          padding: "1.1rem 1.25rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={s.sectionLabel}>SIGNIFICANCE</div>
        <div style={s.sectionText}>{summary.significance}</div>
      </div>

      {summary.figure_suggestion && (
        <div style={{ padding: "0 0 0.5rem" }}>
          <div style={s.figureCard}>
            <div style={{ ...s.sectionLabel, color: "var(--accent)" }}>
              SUGGESTED FIGURE
            </div>
            <div style={s.sectionText}>{summary.figure_suggestion}</div>
          </div>
        </div>
      )}
    </div>
  );
}
