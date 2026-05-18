
export default function SystemErrorBanner({ error, onDismiss }) {
  if (!error) return null;
  return (
    <div style={{
      marginTop: "1rem",
      borderRadius: "var(--radius)",
      border: "1px solid rgba(224,112,112,0.25)",
      background: "rgba(224,112,112,0.06)",
      overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px 14px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.55" }}>
            {error}
          </div>
        </div>
        <button
          onClick={onDismiss}
          style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "18px", padding: "0 2px", flexShrink: 0, lineHeight: 1 }}
          title="Dismiss"
        >×</button>
      </div>
    </div>
  );
}