const { app, BrowserWindow, ipcMain, shell } = require("electron");
const Anthropic = require("@anthropic-ai/sdk");
const OpenAI = require("openai");
const keytar = require("keytar");
const Store = require("electron-store").default;
const fs = require("fs");
const path = require("path");
const defaultKnowledgeBase = require("./knowledgeBase.json");

const SERVICE = "TranslateResearch";

let store
let KNOWLEDGE_BASE_PATH;
let EMBED_CACHE_PATH;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  if (process.env.NODE_ENV === "development") {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

function seedKnowledgeBase() {
  if (!fs.existsSync(KNOWLEDGE_BASE_PATH)) {
    fs.writeFileSync(
      KNOWLEDGE_BASE_PATH,
      JSON.stringify(defaultKnowledgeBase, null, 2),
    );
  }
}

function getAppDataPath() {
  const isPortable = fs.existsSync(
    path.join(process.resourcesPath, "portable.flag"),
  ) || process.env.PORTABLE_EXECUTABLE_DIR;

  if (isPortable) {
    return path.join(path.dirname(process.execPath), "data");
  }

  return app.getPath("userData");
}

// ─── Setup ─────────────────────────────────────────────────────────
app.setPath("userData", getAppDataPath());
app.whenReady().then(() => {
  const dataPath = getAppDataPath();
  fs.mkdirSync(dataPath, { recursive: true });
  EMBED_CACHE_PATH = path.join(dataPath, "embeddings-cache.json");
  KNOWLEDGE_BASE_PATH = path.join(dataPath, "knowledge-base.json");

  store = new Store({
    cwd: dataPath,
    encryptionKey: "translate-research-local",
  });

  seedKnowledgeBase();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ─── Key management ───────────────────────────────────────────────────────────

ipcMain.handle("save-keys", async (_, anthropicKey, openaiKey) => {
  await keytar.setPassword(SERVICE, "anthropic", anthropicKey || "");
  await keytar.setPassword(SERVICE, "openai", openaiKey || "");
});

ipcMain.handle("load-keys", async () => {
  const anthropic = (await keytar.getPassword(SERVICE, "anthropic")) || "";
  const openai = (await keytar.getPassword(SERVICE, "openai")) || "";
  return { anthropic, openai };
});

// ─── Anthropic ────────────────────────────────────────────────────────────────

ipcMain.handle("claude-complete", async (_, system, user, maxTokens = 1500) => {
  const apiKey = await keytar.getPassword(SERVICE, "anthropic");
  if (!apiKey)
    throw new Error("Anthropic key not saved — open Settings to add it");

  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });
  return message.content[0].text;
});

// ─── OpenAI embeddings ────────────────────────────────────────────────────────

ipcMain.handle("openai-embed", async (_, text) => {
  const apiKey = await keytar.getPassword(SERVICE, "openai");
  if (!apiKey) return null;

  const client = new OpenAI({ apiKey });
  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
});

// ─── History ──────────────────────────────────────────────────────────────────

ipcMain.handle("save-history", (_, entry) => {
  const history = store.get("history", []);
  history.unshift({ ...entry, savedAt: new Date().toISOString() });
  store.set("history", history.slice(0, 50));
});

ipcMain.handle("load-history", () => store.get("history", []));
ipcMain.handle("clear-history", () => store.delete("history"));

// ─── Knowledge base ───────────────────────────────────────────────────────────

ipcMain.handle("kb-load", () => {
  const raw = fs.readFileSync(KNOWLEDGE_BASE_PATH, "utf8");
  return JSON.parse(raw);
});

ipcMain.handle("kb-save", (_, entries) => {
  fs.writeFileSync(
    KNOWLEDGE_BASE_PATH,
    JSON.stringify(entries, null, 2),
    "utf8",
  );
});

ipcMain.handle("kb-open-file", () => {
  shell.openPath(KNOWLEDGE_BASE_PATH);
});

ipcMain.handle("kb-reset", () => {
  const defaultPath = path.join(__dirname, "../src/lib/knowledgeBase.json");
  fs.copyFileSync(defaultPath, KNOWLEDGE_BASE_PATH);
});

ipcMain.handle("embed-cache-load", () => {
  if (!fs.existsSync(EMBED_CACHE_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(EMBED_CACHE_PATH, "utf8"));
  } catch {
    return null;
  }
});

ipcMain.handle("embed-cache-save", (_, cache) => {
  fs.writeFileSync(EMBED_CACHE_PATH, JSON.stringify(cache), "utf8");
});

// ─── Close ───────────────────────────────────────────────────────────

app.on("window-all-closed", () => {
  app.quit();
});

process.on("unhandledRejection", (reason) => {
  console.error(reason);
  app.quit();
});

process.on("uncaughtException", (err) => {
  console.error(err);
  app.quit();
});
