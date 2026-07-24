# Open Knowledge Studio v2 — System Architecture

## Overview

Open Knowledge Studio is a **client-only React application** with zero backend dependencies. All data persistence uses browser-native IndexedDB, all AI calls go directly to provider REST APIs via `fetch()`, and all rendering (Markdown, KaTeX, Mermaid, charts) is done with first-party code or pinned CDN scripts.

## Component Tree

```
App.tsx (root)
├── Header (nav, theme, auth, settings)
├── Left Sidebar
│   └── KnowledgeBaseManager.tsx
│       ├── Folder tree (expandable)
│       ├── File list (selectable, activatable)
│       ├── Drag-and-drop upload zone
│       └── Search bar
├── Center Panel (view-switched)
│   ├── ChatInterface.tsx
│   │   ├── Message list (auto-scroll)
│   │   ├── Input bar (text + voice)
│   │   ├── Context indicators
│   │   └── Export button
│   ├── WorkspaceDocumentEditor.tsx
│   │   ├── Toolbar (TOC, versions, templates, export)
│   │   ├── TOC sidebar
│   │   ├── Markdown textarea (left)
│   │   └── Rendered preview (right)
│   ├── SearchPanel.tsx
│   │   ├── Full-text search input
│   │   └── Result list with snippets
│   ├── A2AMetricsDashboard.tsx
│   │   ├── Stat cards
│   │   ├── Bar chart (agent latency)
│   │   ├── Line chart (latency timeline)
│   │   └── Recent runs table
│   └── Templates view
│       └── Template cards (injectable)
├── Right Panel (optional)
│   └── GoogleWorkspacePanel.tsx
│       ├── Auth tab
│       ├── Drive files tab
│       ├── Sheets export tab
│       ├── Docs export tab
│       └── Gmail tab
├── Settings Modal
│   ├── LLM provider selection
│   ├── API key input
│   ├── Model configuration
│   ├── A2A agent management
│   └── Data import/export
└── Footer (status bar)
```

## Service Layer

| Service | File | Responsibility |
|---------|------|---------------|
| LLM Router | `services/geminiService.ts` | Routes chat queries to Gemini/OpenAI/Anthropic/DeepSeek/Groq/Ollama via REST |
| Auth + Sync | `services/googleAuthService.ts` | Google Identity Services OAuth + Drive appDataFolder backup |
| Search | `services/searchService.ts` | Token-based fuzzy full-text search across all KB content |
| Database | `db/indexedDB.ts` | IndexedDB CRUD, localStorage migration, export/import |
| Markdown | `utils/markdown.ts` | CommonMark parser + TOC generator |
| Highlight | `utils/highlight.ts` | Syntax highlighting for 9+ languages |

## LLM Provider Routing

```
queryLLM(messages, config, contextDocs, systemPrompt)
├── gemini    → generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
├── openai    → api.openai.com/v1/chat/completions
├── deepseek  → api.deepseek.com/v1/chat/completions
├── groq      → api.groq.com/openai/v1/chat/completions
├── ollama    → localhost:11434/api/chat
└── anthropic → api.anthropic.com/v1/messages
```

## Data Persistence Flow

```
User Action → State Update → React Re-render
                  ↓
          useEffect observer
                  ↓
          IndexedDB write (dbPut)
                  ↓
          (if authenticated) Google Drive sync every 60s
```

## CDN Dependencies (No npm install)

| Resource | URL | Purpose |
|----------|-----|---------|
| KaTeX 0.17.0 | cdn.jsdelivr.net/npm/katex@0.17.0 | Math rendering |
| Mermaid 11.16.0 | cdn.jsdelivr.net/npm/mermaid@11.16.0 | Diagram rendering |
| Google Identity Services | accounts.google.com/gsi/client | OAuth token flow |
| Tailwind CSS | cdn.tailwindcss.com | Utility CSS (dev only) |

## Build Pipeline

```
Source (.ts/.tsx) → Vite 8 (Rolldown) → dist/
  ├── index.html
  ├── assets/index-[hash].js (vendor chunk + app chunk)
  ├── assets/index-[hash].css
  └── sw.js (service worker, copied as-is)
```

## Performance Characteristics

| Metric | Target | Current |
|--------|--------|---------|
| Bundle size (gzip) | < 200 KB | ~80 KB |
| First paint | < 1s | ~500ms |
| IndexedDB read | < 5ms | ~2ms |
| Search query | < 10ms | ~5ms |
| Markdown parse | < 20ms | ~10ms |
| KaTeX render | < 50ms | ~30ms |

## Security Boundaries

1. **No secrets in browser code** — only Google Client ID (public)
2. **API keys user-provided** — stored in `.env` or session memory
3. **Sandbox mode** — strict sandbox prevents all outbound data
4. **No third-party analytics** — no tracking, no telemetry to external servers
5. **HTTPS required** — Service Worker and clipboard APIs require secure context
