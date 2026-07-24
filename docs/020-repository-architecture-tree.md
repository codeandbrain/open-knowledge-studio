# Repository Architecture Tree

## Complete File Tree

```
open-knowledge-studio/
│
├── .env.example              # Environment variable template
├── .gitignore                # Git ignore rules
├── index.html                # HTML entry point with CDN scripts
├── package.json              # Dependencies (react + react-dom only)
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite build configuration
│
├── docs/
│   ├── README.md             # Project overview and quickstart
│   ├── BLUEPRINT.md          # Product blueprint and design principles
│   ├── ARCHITECTURE.md       # System architecture and component tree
│   ├── DESIGN.md             # Design system (colors, typography, spacing)
│   ├── DEVELOPMENT.md        # Developer guide and contribution notes
│   ├── SETUP.md              # Setup instructions and troubleshooting
│   ├── GAP-ANALYSIS.md       # v1→v2 gap analysis and enhancement report
│   ├── 010-dependency-removal-notes.md  # All dependency removal decisions
│   └── 020-repository-architecture-tree.md  # This file
│
├── public/
│   ├── manifest.json         # PWA manifest
│   ├── favicon.svg           # App icon
│   └── sw.js                 # Service Worker (offline caching)
│
└── src/
    ├── App.tsx                # Root component — all state orchestration
    ├── index.tsx              # React entry point
    ├── index.css              # Global styles (themes, scrollbar, prose)
    ├── types.ts               # All TypeScript interfaces and enums
    │
    ├── components/
    │   ├── ChatInterface.tsx          # AI chat with voice input
    │   ├── KnowledgeBaseManager.tsx   # File/folder tree + drag-drop
    │   ├── WorkspaceDocumentEditor.tsx # Split-pane Markdown editor
    │   ├── A2AMetricsDashboard.tsx    # Telemetry dashboard
    │   ├── GoogleWorkspacePanel.tsx   # Google Drive/Sheets/Docs/Gmail
    │   ├── SearchPanel.tsx            # Full-text fuzzy search
    │   ├── ThemeSwitcher.tsx          # Dark/light mode toggle
    │   ├── charts/
    │   │   └── SimpleCharts.tsx       # SVG bar/line/area charts
    │   └── icons/
    │       └── lucide-shim.tsx        # 40+ Lucide-style SVG icons
    │
    ├── services/
    │   ├── geminiService.ts           # Multi-provider LLM router
    │   ├── googleAuthService.ts       # Google OAuth + Drive sync
    │   └── searchService.ts           # Client-side search engine
    │
    ├── db/
    │   └── indexedDB.ts               # IndexedDB service layer
    │
    └── utils/
        ├── markdown.ts                # Markdown parser + TOC generator
        └── highlight.ts               # Syntax highlighter (9+ languages)
```

## File Size Estimates

| File | Est. Lines | Purpose |
|------|-----------|---------|
| `App.tsx` | ~450 | Root component, state orchestration |
| `types.ts` | ~200 | All type definitions |
| `ChatInterface.tsx` | ~180 | AI chat UI |
| `KnowledgeBaseManager.tsx` | ~200 | File/folder management |
| `WorkspaceDocumentEditor.tsx` | ~250 | Split-pane editor |
| `A2AMetricsDashboard.tsx` | ~120 | Telemetry dashboard |
| `GoogleWorkspacePanel.tsx` | ~200 | Google integration |
| `SearchPanel.tsx` | ~100 | Search UI |
| `geminiService.ts` | ~200 | LLM routing |
| `googleAuthService.ts` | ~150 | Auth + sync |
| `searchService.ts` | ~120 | Search engine |
| `indexedDB.ts` | ~180 | Database service |
| `markdown.ts` | ~200 | Markdown parser |
| `highlight.ts` | ~180 | Syntax highlighter |
| `lucide-shim.tsx` | ~400 | Icon components |
| `SimpleCharts.tsx` | ~150 | Chart components |
