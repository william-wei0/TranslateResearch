import { useState, useEffect } from "react";
import { invalidateKBCache } from "../lib/rag.js";
import SystemErrorBanner from "./SystemErrorBanner.jsx";

const DOMAINS = [
  "molecular biology",
  "oncology",
  "neuroscience",
  "cardiology",
  "machine learning",
  "epidemiology",
  "chemistry",
  "ecology",
  "physics",
  "clinical trials",
  "genomics",
  "pharmacology",
];

const EMPTY_ENTRY = { id: "", domain: DOMAINS[0], tags: "", text: "" };

export default function KnowledgeBaseEditor() {
  const [entries, setEntries] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_ENTRY);
  const [saved, setSaved] = useState(false);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const kb = await window.desktop.kbLoad();
      setEntries(kb);
    } catch (err) {
      setError(err.message);
    }
  }

  async function save(updated) {
    await window.desktop.kbSave(updated);
    invalidateKBCache();
    setEntries(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function startNew() {
    setForm({ ...EMPTY_ENTRY, id: `custom-${Date.now()}` });
    setEditing("new");
  }

  function startEdit(i) {
    const e = entries[i];
    setForm({ ...e, tags: e.tags.join(", ") });
    setEditing(i);
  }

  async function submitForm() {
    if (!form.id.trim()) {
      setError("Entry ID is empty. Please add an ID for this entry.");
      return;
    }
    if (!form.text.trim()) {
      setError(
        "Context Text is currently empty. Please add information for this entry.",
      );
      return;
    }

    const entry = {
      ...form,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    let updated;
    if (editing === "new") {
      updated = [...entries, entry];
    } else {
      updated = entries.map((e, i) => (i === editing ? entry : e));
    }
    try {
      await save(updated);
      setEditing(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteEntry(i) {
    if (!confirm("Delete this entry?")) return;
    await save(entries.filter((_, idx) => idx !== i));
  }

  async function reset() {
    if (
      !confirm("Reset to bundled defaults? Your custom entries will be lost.")
    )
      return;
    await window.desktop.kbReset();
    invalidateKBCache();
    await load();
  }

  const visible =
    filter === "all" ? entries : entries.filter((e) => e.domain === filter);

  const s = {
    toolbar: {
      display: "flex",
      gap: "8px",
      alignItems: "center",
      marginBottom: "1rem",
      flexWrap: "wrap",
    },
    select: {
      padding: "6px 10px",
      borderRadius: "8px",
      border: "1px solid var(--border)",
      background: "var(--bg-raised)",
      color: "var(--text-primary)",
      fontSize: "13px",
    },
    btn: (variant = "default") => ({
      padding: "6px 14px",
      borderRadius: "8px",
      fontSize: "13px",
      cursor: "pointer",
      border: "none",
      fontWeight: 500,
      background:
        variant === "accent"
          ? "var(--accent)"
          : variant === "danger"
            ? "rgba(224,112,112,0.12)"
            : "var(--bg-raised)",
      color:
        variant === "accent"
          ? "#0f0f0d"
          : variant === "danger"
            ? "#e07070"
            : "var(--text-secondary)",
    }),
    card: {
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: "10px",
      padding: "12px 14px",
      marginBottom: "8px",
    },
    cardHeader: { display: "flex", alignItems: "flex-start", gap: "10px" },
    cardDomain: {
      fontSize: "10px",
      fontFamily: "var(--font-mono)",
      color: "var(--accent)",
      background: "var(--accent-dim)",
      border: "1px solid var(--accent-border)",
      padding: "2px 8px",
      borderRadius: "99px",
      whiteSpace: "nowrap",
    },
    cardText: {
      fontSize: "13px",
      color: "var(--text-secondary)",
      lineHeight: "1.55",
      marginTop: "6px",
    },
    cardTags: {
      fontSize: "11px",
      color: "var(--text-muted)",
      marginTop: "6px",
      fontFamily: "var(--font-mono)",
    },
    cardActions: { display: "flex", gap: "6px", marginTop: "10px" },
    formBox: {
      background: "var(--bg-card)",
      border: "1px solid var(--accent-border)",
      borderRadius: "12px",
      padding: "1.25rem",
      marginBottom: "1rem",
    },
    label: {
      fontSize: "11px",
      fontFamily: "var(--font-mono)",
      color: "var(--text-muted)",
      letterSpacing: "0.07em",
      display: "block",
      marginBottom: "5px",
    },
    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: "8px 10px",
      fontSize: "13px",
      background: "var(--bg-raised)",
      border: "1px solid var(--border)",
      borderRadius: "8px",
      color: "var(--text-primary)",
      marginBottom: "12px",
    },
    textarea: {
      width: "100%",
      boxSizing: "border-box",
      padding: "8px 10px",
      fontSize: "13px",
      background: "var(--bg-raised)",
      border: "1px solid var(--border)",
      borderRadius: "8px",
      color: "var(--text-primary)",
      minHeight: "100px",
      resize: "vertical",
      marginBottom: "12px",
      fontFamily: "var(--font-body)",
    },
    formActions: { display: "flex", gap: "8px" },
    savedBadge: {
      fontSize: "12px",
      color: "var(--green)",
      fontFamily: "var(--font-mono)",
      padding: "6px 12px",
      background: "var(--green-dim)",
      borderRadius: "99px",
    },
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={s.toolbar}>
        <button style={s.btn("accent")} onClick={startNew}>
          + Add entry
        </button>
        <select
          style={s.select}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All domains</option>
          {DOMAINS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <span
          style={{
            marginLeft: "auto",
            fontSize: "12px",
            color: "var(--text-muted)",
          }}
        >
          {visible.length} entries
        </span>
        <button
          style={s.btn()}
          onClick={() => {
            try {
              window.desktop.kbOpenFile();
            } catch (err) {
              setError(err.message);
            }
          }}
          title="Open JSON file in editor"
        >
          Open file ↗
        </button>
        <button style={s.btn("danger")} onClick={reset}>
          Reset to defaults
        </button>
        {saved && <span style={s.savedBadge}>✓ Saved</span>}
      </div>

      {/* Add / Edit form */}
      {editing !== null && (
        <div style={s.formBox}>
          <label style={s.label}>ID</label>
          <input
            style={s.input}
            value={form.id}
            onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
            placeholder="unique-id"
          />

          <label style={s.label}>DOMAIN</label>
          <select
            style={{ ...s.input, marginBottom: "12px" }}
            value={form.domain}
            onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
          >
            {DOMAINS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <label style={s.label}>TAGS (comma-separated)</label>
          <input
            style={s.input}
            value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            placeholder="RCT, blinding, bias"
          />

          <label style={s.label}>CONTEXT TEXT</label>
          <textarea
            style={s.textarea}
            value={form.text}
            onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
            placeholder="The domain knowledge text that will be injected into the summarization prompt..."
          />

          <div style={s.formActions}>
            <button style={s.btn("accent")} onClick={submitForm}>
              {editing === "new" ? "Add entry" : "Save changes"}
            </button>
            <button style={s.btn()} onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
      <SystemErrorBanner error={error} onDismiss={() => setError("")} />

      {/* Entry list */}
      {visible.map((entry, i) => (
        <div key={entry.id} style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardDomain}>{entry.domain}</span>
            <span
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {entry.id}
            </span>
          </div>
          <div style={s.cardText}>
            {entry.text.slice(0, 160)}
            {entry.text.length > 160 ? "…" : ""}
          </div>
          <div style={s.cardTags}>{entry.tags.join(" · ")}</div>
          <div style={s.cardActions}>
            <button
              style={s.btn()}
              onClick={() => startEdit(entries.indexOf(entry))}
            >
              Edit
            </button>
            <button
              style={s.btn("danger")}
              onClick={() => deleteEntry(entries.indexOf(entry))}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
