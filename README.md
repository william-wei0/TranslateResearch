
# TranslateResearch

A small desktop app for summarizing research papers using Anthropic and OpenAI, with multilingual translation, a light-weight RAG system, and persistent summary history. Built with Electron, React, and the Anthropic and OpenAI APIs. Supports PDF text extraction.

<img width="1909" height="871" alt="TranslateResearch" src="https://github.com/user-attachments/assets/a145f470-93ed-4995-afd5-44bf71e03896" />

---

## Installation

### Download the latest release

1. Go to the [**latest release**](https://github.com/william-wei0/TranslateResearch/releases/latest)
2. Under **Assets**, download the zip:
   - `TranslateResearch.zip` — Windows
3. Extract the zip
4. Run `TranslateResearch.exe`

No installation required — the app runs directly from the extracted folder.

---

## Setup

Open the app and click the gear icon in the top right to open Settings.

### Anthropic API key (required)

Required for summarization, domain detection, translation, and follow-up questions.

1. Go to [console.anthropic.com](https://console.anthropic.com) → API Keys → Create Key
2. In Settings, click the Anthropic key field and paste your key
3. Click **Save**

### OpenAI API key (optional)

Enables semantic RAG search using text embeddings. Without it, the app falls back to keyword-based retrieval.

1. Go to [platform.openai.com](https://platform.openai.com) → API Keys → Create Key
2. In Settings, click the OpenAI key field and paste your key
3. Click **Save**

Keys are stored in your OS keychain ( Windows Credential Manager) and not written to disk as plaintext.

---
 
## Summarizing and translating a paper
 
### Step 1: Generate a summary
 
1. In the left panel, select the **New Summary** tab
2. Choose an input method:
   - **Paste text**: paste an abstract or full paper text into the field
   - **Upload PDF**: click the PDF tab and upload a file (text-based or image-scanned)
3. Select an **audience**: this shapes how technical the summary language is:
   - *Technical Summary*: field-specific terminology, assumes domain knowledge
   - *Non-Technical Summary*: plain language
4. Click **Summarize paper**
The app runs three steps automatically: detects the paper's scientific domain, retrieves relevant context from the knowledge base, then generates a structured summary with headline, key findings, methods, limitations, significance, and a suggested figure.
 
### Step 2: Translate the summary
 
Once the summary appears on the right, scroll down to the **Translate summary** section below it. Click any language to translate the full summary into that language.
 
**Supported languages:** French, Spanish, German, Mandarin Chinese, Japanese, Korean, Portuguese, Arabic, Hindi, Russian, Italian, Dutch, Swedish, Turkish, Polish.
 
Each translation is generated on demand and cached for the current session. Clicking the same language twice does not make a second API call. Scientific terminology, proper nouns, and acronyms are preserved exactly as they appear in the English summary.
 
> **Note:** Translation requires only the Anthropic API key. The OpenAI key is not needed for this step.
 
### Step 3: Ask follow-up questions
 
After the summary is generated, a **Follow-up questions** field appears at the bottom of the right panel. Type any question about the paper and click **Ask** and the app answers using the full summary as context.
 
### Revisiting past summaries
 
All summaries are automatically saved. Click the **History** tab in the left panel to see previous summaries, then click any entry to reload it including its domain context.
 
---

## Knowledge Base (Editable)

The RAG pipeline injects domain-specific context into each summarization prompt. The knowledge base is a collection of text chunks covering clinical trials, machine learning, epidemiology, genomics, and other scientific domains. This is editible so you can add specific research papers or information to improve summarization results.

### Adding a Knowledge Base through the app

Click the **Knowledge Base** tab in the left panel. From there you can:

- **Add** a new entry with a domain, tags, and context text
- **Edit** any existing entry
- **Delete** entries you don't need
- **Reset** to the bundled defaults at any time

### Editing the JSON file directly

For bulk edits, click Open file in the Knowledge Base tab. This opens `knowledge-base.json` in your system's default editor (VS Code, Notepad, etc.).

The file lives in your app data folder:

```
Windows:  TranslateResearch\data\knowledge-base.json
```

Each entry follows this structure:

```json
{
  "id": "unique-entry-id",
  "domain": "machine learning",
  "tags": ["overfitting", "train-test split", "data leakage"],
  "text": "The context text that gets injected into the summarization prompt when this entry is retrieved."
}
```

Valid domains: `molecular biology`, `oncology`, `neuroscience`, `cardiology`, `machine learning`, `epidemiology`, `chemistry`, `ecology`, `physics`, `clinical trials`, `genomics`, `pharmacology`.

Save the file and the app will pick up changes on the next summarization — no restart needed.

### Embedding cache

When semantic RAG is enabled (Needs OpenAI key), each knowledge base chunk is converted to a vector embedding the first time it is used. These embeddings are cached to disk so OpenAI does not need to be called again on subsequent sessions.

```
Windows:  TranslateResearch\embeddings-cache.json
```

**How the cache works:**
- On startup the app compares a fingerprint of the current knowledge base against the cached fingerprint
- If the knowledge base is unchanged, all embeddings are loaded from disk — no OpenAI calls
- If a chunk was added or edited, only that chunk is re-embedded — unchanged chunks are reused
- If a chunk was deleted, its cached embedding is simply ignored

**Clearing the cache:**
Deleting `embeddings-cache.json` forces all chunks to be re-embedded on the next summarization. This will use OpenAI API tokens proportional to the number of chunks in your knowledge base (typically 12 chunks at a few cents with `text-embedding-3-small` pricing).

---

## Building from source

### Prerequisites

- [Node.js](https://nodejs.org)

### Install dependencies

```
git clone https://github.com/yourusername/TranslateResearch.git
cd TranslateResearch
npm install
```

### Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Starts the Vite dev server for the React frontend at `http://localhost:5173` |
| `npm run electron` | Launches Electron pointed at the Vite dev server. Run alongside `npm run dev`. |
| `npm run dev:full` | Starts both Vite and Electron together in one terminal using `concurrently` |
| `npm run build` | Builds the React frontend with Vite, then packages the Electron app with electron-builder |

### Development

```bash
npm run dev:full
```

This starts the Vite dev server and launches Electron once the server is ready. Hot module replacement works for React changes — edit a component and the renderer updates instantly without restarting Electron.

For changes to `electron/main.js` or `electron/preload.js`, you need to quit and re-run `npm run dev:full` since the main process does not hot-reload.

### Production build

```bash
npm run build
```

Outputs a distributable to the `dist/` folder. To target a specific platform:

```bash
npm run build -- --win     # Windows NSIS installer
npm run build -- --mac     # macOS .app
npm run build -- --dir     # Unpacked directory (fastest, useful for testing)
```

### Project structure

```
electron/
  main.js          — Main process: IPC handlers, API calls, keychain, file I/O
  preload.js       — Secure IPC bridge between main and renderer
src/
  App.jsx          — Root layout and state
  components/
    ApiKeyInput.jsx         — Key entry with save/clear, never shows saved value
    ErrorBanner.jsx         — Parsed API error display
    InputPanel.jsx          — Text/PDF input and audience selector
    KnowledgeBaseEditor.jsx — In-app KB management UI
    Settings.jsx            — Theme and API key settings modal
    SummaryCard.jsx         — Structured summary display
    TranslationPanel.jsx    — Language picker and translated summaries
  lib/
    anthropic.js            — Claude API wrapper and all prompts
    knowledgeBase.json      — Bundled default knowledge base (seed data)
    languages.js            — Supported translation languages
    pdfExtract.js           — Client-side PDF text extraction
    rag.js                  — Embedding index, cosine similarity, retrieval
```
