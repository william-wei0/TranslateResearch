const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktop", {
  claudeComplete: (system, user, maxTokens) => ipcRenderer.invoke("claude-complete", system, user, maxTokens),
  openaiEmbed: (text) => ipcRenderer.invoke("openai-embed", text),

  saveKeys: (anthropicKey, openaiKey) =>
    ipcRenderer.invoke("save-keys", anthropicKey, openaiKey),
  loadKeys: () => ipcRenderer.invoke("load-keys"),

  saveHistory: (entry) => ipcRenderer.invoke("save-history", entry),
  loadHistory: () => ipcRenderer.invoke("load-history"),
  clearHistory: () => ipcRenderer.invoke("clear-history"),

  kbLoad: () => ipcRenderer.invoke("kb-load"),
  kbSave: (entries) => ipcRenderer.invoke("kb-save", entries),
  kbOpenFile: () => ipcRenderer.invoke("kb-open-file"),
  kbReset: () => ipcRenderer.invoke("kb-reset"),
  embedCacheLoad: () => ipcRenderer.invoke("embed-cache-load"),
  embedCacheSave: (cache) => ipcRenderer.invoke("embed-cache-save", cache),
});
