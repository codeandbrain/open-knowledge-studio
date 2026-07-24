# Open Knowledge Studio
>World-class, free, no-code-friendly knowledge studio for field epidemiologists, researchers, and development teams.

An ultra-sleek, premium, offline-first workspace implementing Google Open Knowledge Format (OKF) architectures combined with Model Context Protocol (MCP) standards and advanced Agent-to-Agent (A2A) collaborative workflows.

## What does it have 
- **Storage:**	IndexedDB (GB-scale)
- **Search:**	Client-side fuzzy full-text search
- **Voice Input:**	Web Speech API dictation
- **Offline:**	Full PWA with Service Worker
- **Document Versions:** Auto-save every 30s + manual snapshots
- **Templates:**	Dynamic template gallery with inject
- **LLM Providers:**	Gemini, OpenAI, Anthropic, DeepSeek, Groq, Ollama
- **Gemini Model:**	3.5-flash (stable)
- **Theme:**	Dark + Light mode
- **File Types:**	Drag-and-drop, 9+ formats
- **Export:**	Markdown, HTML, JSON, bulk export/import
---

## Dependency Footprint

Exactly **two** runtime npm packages: `react` and `react-dom`. Everything else is first-party code.

| What | Implementation |
|------|---------------|
| Markdown rendering | `utils/markdown.ts` — CommonMark subset parser |
| Syntax highlighting | `utils/highlight.ts` — JS/TS/Python/Go/Bash/SQL/JSON/YAML/HTML/CSS |
| Lucide icons | `components/icons/lucide-shim.tsx` — 40+ inline SVG icons |
| Charts | `components/charts/SimpleCharts.tsx` — pure SVG bar/line/area charts |
| Search | `services/searchService.ts` — token-based fuzzy search |
| Auth | `services/googleAuthService.ts` — Google Identity Services + Drive REST |
| LLM | `services/geminiService.ts` — multi-provider REST router |
| Storage | `db/indexedDB.ts` — IndexedDB with migration from localStorage |

**npm install pulls ~70 packages** (React + Vite/TypeScript build tooling), not the 300+ that shipped before.

---

## Key Feature Matrix

### 1. Advanced Live Document Workspace
- **Split-Pane Editor**: Raw Markdown left, live render right
- **KaTeX Math**: Inline `$` and display `$$` LaTeX rendering
- **Mermaid Diagrams**: Flowcharts, sequences, mindmaps from codeblocks
- **Table of Contents**: Auto-generated from headers with smooth scroll
- **Version History**: Auto-save every 30s + manual snapshots with restore
- **Multi-Format Export**: Markdown, HTML, JSON, plaintext
- **Drag-and-Drop**: Drop files directly into knowledge base

### 2. Multi-Provider AI Chat
- **6 LLM Providers**: Gemini 3.5 Flash, OpenAI, Anthropic, DeepSeek, Groq, Ollama
- **Voice Input**: Web Speech API — no API key needed
- **Context Grounding**: Toggle files as active context for AI
- **Thinking Mode**: Gemini extended thinking with configurable budget
- **Web Search**: Google search grounding (Gemini only)
- **Exportable Chats**: Download conversations as Markdown

### 3. A2A Collaborative Debates
- **3 Pre-configured Agents**: Design, Security, QA
- **Debate Synthesis**: Consensus recommendations from multiple perspectives
- **Telemetry Dashboard**: Latency, tokens, success rates in SVG charts

### 4. Google Workspace Integration
- **Sign In**: Google Identity Services (no Firebase)
- **Drive Sync**: Automatic backup to your own Drive appDataFolder
- **Sheets Export**: Convert workspace files to Google Sheets
- **Docs Export**: Convert Markdown to Google Docs
- **Gmail**: Send reports directly (scope required)

### 5. Full-Text Search
- **Zero Backend**: Client-side token scoring
- **Fuzzy Matching**: Prefix and substring matching
- **Snippet Highlighting**: Context-aware result snippets
- **Keyboard Shortcut**: Ctrl/Cmd+K

### 6. PWA & Offline
- **Service Worker**: Cache-first for app shell, network-first for APIs
- **Offline Indicator**: Visual online/offline status
- **IndexedDB**: Persistent storage beyond browser restart

---

## Tech Stack

| Component | Version | Notes |
|-----------|---------|-------|
| React | 19.2.7 | Latest stable |
| Vite | 8.1.3 | Rust-based Rolldown bundler |
| TypeScript | 6.0.3 | Strict mode |
| Plugin React | 6.0.3 | Required for Vite 8 |
| KaTeX | 0.17.0 | Pinned CDN |
| Mermaid | 11.16.0 | Pinned CDN |
| Gemini | 3.5-flash | Stable model (2.0 deprecated) |

---

## Quickstart

```bash
# Clone and open
cd open-knowledge-studio

# Copy env template
cp .env.example .env
# Edit .env: add GEMINI_API_KEY and optionally VITE_GOOGLE_OAUTH_CLIENT_ID

# Install
npm install

# Start dev server (port 3000)
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Target Users

### The Field Researcher (Amina)
Intermittent internet, offline-first report generation, mathematical modeling, WHO template injection.

### The Systems Developer (Rafi)
A2A debates for system specs, telemetry benchmarking, MCP protocol testing.

### The Health Program Manager (Ariful)
Program dashboards, epidemiology templates, collaborative review workflows.

---

## License

SPDX-License-Identifier: Apache-2.0
