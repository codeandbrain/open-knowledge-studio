# Open Knowledge Studio v2 — Product Blueprint

## Vision

A world-class, free, no-code-friendly knowledge studio that empowers field researchers, health program managers, and development teams to collaborate, document, and analyze under the most challenging conditions — intermittent connectivity, resource constraints, and stringent data privacy requirements.

## Design Principles

1. **Zero Dependencies**: Only `react` and `react-dom` as npm packages. Everything else is first-party code.
2. **Offline-First**: Every feature works without internet. IndexedDB for storage, Service Worker for caching.
3. **No Paid Services**: All AI providers have free tiers. All browser APIs are free.
4. **User Data Sovereignty**: Data lives in the user's browser and their own Google Drive — never in a shared third-party database.
5. **No-Code Friendly**: Drag-and-drop, template injection, voice input, visual search — no command line needed.

## Core Architecture Layers

```
┌─────────────────────────────────────────────────────┐
│                   UI Layer (React)                   │
│  ChatInterface │ Editor │ Dashboard │ Search │ Panel │
├─────────────────────────────────────────────────────┤
│              Service Layer (TypeScript)              │
│  LLM Router │ Auth │ Search │ Version │ Export       │
├─────────────────────────────────────────────────────┤
│              Data Layer (IndexedDB + LocalStorage)   │
│  Files │ Folders │ Versions │ Metrics │ Settings      │
├─────────────────────────────────────────────────────┤
│           Browser APIs (Free, No Backend)            │
│  Speech │ Clipboard │ File System │ Geolocation       │
│  Notification │ MediaDevices │ Share │ Cache          │
└─────────────────────────────────────────────────────┘
```

## Data Flow

### Chat Query
```
User Input → ChatInterface → queryLLM() → Gemini/OpenAI/Anthropic/etc.
                ↑                              ↓
         Context Files ← buildSearchIndex()  Response
                ↑
         KnowledgeBaseManager (IndexedDB)
```

### Document Edit
```
File Select → WorkspaceDocumentEditor → parse() → Rendered HTML
       ↓                                    ↑
  Auto-save (30s)                    KaTeX + Mermaid
       ↓
  Version Snapshot → DocumentVersion[] (IndexedDB)
```

### Cloud Sync
```
IndexedDB → updateUserDoc() → Google Drive appDataFolder
       ↑
  Authenticated via Google Identity Services
```

## Feature Modules

| Module | Files | Purpose |
|--------|-------|---------|
| Chat | `ChatInterface.tsx`, `geminiService.ts` | Multi-provider AI chat with voice |
| Editor | `WorkspaceDocumentEditor.tsx`, `markdown.ts` | Split-pane Markdown editor |
| Knowledge Base | `KnowledgeBaseManager.tsx`, `indexedDB.ts` | File/folder management |
| Search | `SearchPanel.tsx`, `searchService.ts` | Full-text fuzzy search |
| A2A | `A2AMetricsDashboard.tsx`, `SimpleCharts.tsx` | Multi-agent debates + telemetry |
| Google | `GoogleWorkspacePanel.tsx`, `googleAuthService.ts` | Drive, Sheets, Docs, Gmail |
| Theme | `ThemeSwitcher.tsx` | Dark/light mode |
| Templates | Built into Editor | Pre-built document templates |

## Storage Architecture

### IndexedDB Schema

| Store | Key | Purpose |
|-------|-----|---------|
| files | `id` | Knowledge base files with content |
| folders | `id` | Folder hierarchy |
| providers | `id` | LLM provider configs |
| urlGroups | `id` | URL context groups |
| prompts | `id` | Saved system prompts |
| a2aAgents | `id` | Agent definitions |
| metrics | `id` | Telemetry data |
| sandbox | `id` | Security settings |
| sessions | `id` | Chat session history |
| versions | `id` | Document version snapshots |
| kanban | `id` | Task board data |
| templates | `id` | Custom document templates |
| tags | `id` | Document tags |
| appState | `key` | Key-value app state |

### Cloud Sync

- **Method**: Google Drive REST API `appDataFolder` space
- **Frequency**: Every 60 seconds when authenticated
- **Format**: Single JSON blob with all app state
- **Privacy**: Only accessible by the authenticated user

## Security Model

1. **API Keys**: Stored in `.env` (never committed) or provider config UI (session-only)
2. **OAuth**: Only Client ID in browser code (no Client Secret)
3. **Data**: All data stays client-side unless user explicitly signs in
4. **Sandbox Mode**: Toggleable strict sandbox prevents any outbound data

## Scalability Path

- **Current**: Single-user, browser-only
- **Future**: Multi-user via Google Drive shared folders
- **Future**: P2P sync via WebRTC for team collaboration
- **Future**: Plugin system via Model Context Protocol (MCP) servers
