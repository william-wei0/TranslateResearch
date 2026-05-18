const ERROR_HINTS = {
  "insufficient_quota":    "Your Anthropic credit balance is too low. Top up at console.anthropic.com → Plans & Billing.",
  "authentication_error":  "Invalid Anthropic API key. Check the key saved in Settings.",
  "invalid_api_key":       "Invalid Anthropic API key. Check the key saved in Settings.",
  "overloaded_error":      "Anthropic is overloaded right now. Wait a moment and try again.",
  "rate_limit_error":      "Rate limit reached. Wait a few seconds and try again.",
  "insufficient_funds":    "Your OpenAI credit balance is too low. Top up at platform.openai.com → Billing.",
  "model_not_found":       "OpenAI model not found. Check your plan supports text-embedding-3-small.",
  "invalid_request_error": null,
};

function parseApiError(err) {
  const raw = err?.message || String(err);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed  = JSON.parse(jsonMatch[0]);
      const message = parsed?.error?.message || raw;
      const type    = parsed?.error?.type    || null;
      return { message, type, raw };
    } catch{

    }
  }
  return { message: raw, type: null, raw };
}

function friendlyError(parsed) {
  if (parsed.type && ERROR_HINTS[parsed.type] !== undefined) {
    return ERROR_HINTS[parsed.type] || parsed.message;
  }
  const lower = parsed.message.toLowerCase();
  if (lower.includes("credit balance") || lower.includes("billing")) {
    return lower.includes("anthropic")
      ? "Your Anthropic credit balance is too low. Top up at console.anthropic.com → Plans & Billing."
      : "Your OpenAI credit balance is too low. Top up at platform.openai.com → Billing.";
  }
  if (lower.includes("api key") || lower.includes("authentication")) {
    return "Invalid API key. Double-check the key saved in Settings.";
  }
  return parsed.message;
}

export default function ErrorBanner({ error, onDismiss }) {
  if (!error) return null;
  const parsed   = parseApiError({ message: error });
  const friendly = friendlyError(parsed);
  const isCredits = friendly.toLowerCase().includes("credit") || friendly.toLowerCase().includes("billing");
  const isKey     = friendly.toLowerCase().includes("api key") || friendly.toLowerCase().includes("invalid");

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
          <div style={{ fontSize: "13px", color: "#e07070", fontWeight: 500, marginBottom: "3px" }}>
            {isCredits ? "Billing issue" : isKey ? "Authentication error" : "API error"}
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.55" }}>
            {friendly}
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