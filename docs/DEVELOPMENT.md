# Development Guide — Open Knowledge Studio v2

## Quick Reference

| Task | Where to Edit |
|------|---------------|
| Add new LLM provider | `src/services/geminiService.ts` → new branch in `queryLLM()` |
| Add new Google Workspace action | `src/components/GoogleWorkspacePanel.tsx` → new tab + `fetch()` call |
| Add new icon | `src/components/icons/lucide-shim.tsx` → follow `make('Name', <svg>)` pattern |
| Add new chart type | `src/components/charts/SimpleCharts.tsx` |
| Fix/extend markdown rendering | `src/utils/markdown.ts` → `parse()` function |
| Fix/extend syntax highlighting | `src/utils/highlight.ts` → `KEYWORDS`/`ALIASES` maps |
| Change cloud-sync fields | `src/App.tsx` sync effect + `googleAuthService.ts` |
| Add shared type | `src/types.ts` |
| Change build config | `vite.config.ts`, `.env.example`, `tsconfig.json` |
| New architectural decision | New `0NN-*.md` in `docs/` |

## Project Structure

```
open-knowledge-studio/
├── src/
│   ├── App.tsx                  # Root component, all state orchestration
│   ├── index.tsx                # React entry point
│   ├── index.css                # Global styles (themes, scrollbar, prose)
│   ├── types.ts                 # All TypeScript interfaces and enums
│   ├── components/
│   │   ├── ChatInterface.tsx    # AI chat with voice input
│   │   ├── KnowledgeBaseManager.tsx  # File/folder tree
│   │   ├── WorkspaceDocumentEditor.tsx  # Split-pane editor
│   │   ├── A2AMetricsDashboard.tsx  # Telemetry dashboard
│   │   ├── GoogleWorkspacePanel.tsx  # Google Workspace integration
│   │   ├── SearchPanel.tsx      # Full-text search
│   │   ├── ThemeSwitcher.tsx    # Dark/light mode
│   │   ├── charts/
│   │   │   └── SimpleCharts.tsx # SVG bar/line/area charts
│   │   └── icons/
│   │       └── lucide-shim.tsx  # 40+ Lucide SVG icons
│   ├── services/
│   │   ├── geminiService.ts     # Multi-provider LLM router
│   │   ├── googleAuthService.ts # Google OAuth + Drive sync
│   │   └── searchService.ts     # Client-side search engine
│   ├── db/
│   │   └── indexedDB.ts         # IndexedDB service layer
│   └── utils/
│       ├── markdown.ts          # Markdown parser + TOC
│       └── highlight.ts         # Syntax highlighter
├── public/
│   ├── sw.js                    # Service worker
│   ├── manifest.json            # PWA manifest
│   └── favicon.svg              # App icon
├── docs/
│   ├── README.md                # Project overview
│   ├── BLUEPRINT.md             # Product blueprint
│   ├── ARCHITECTURE.md          # System architecture
│   ├── DEVELOPMENT.md           # This file
│   └── SETUP.md                 # Setup instructions
├── index.html                   # HTML entry with CDN scripts
├── package.json                 # Dependencies (react + react-dom only)
├── tsconfig.json                # TypeScript config
└── vite.config.ts               # Vite build config
```

## Adding a New LLM Provider

1. Add the provider name to `LLMProvider` type in `types.ts`
2. Add a new case branch in `queryLLM()` in `services/geminiService.ts`
3. Follow the OpenAI-compatible pattern (most providers use this format)
4. Add the provider option to the Settings UI in `App.tsx`

## Adding a New Icon

```typescript
export const NewIcon = make('new-icon', [
  <path key="1" d="M12 2L2 7l10 5 10-5-10-5z" />,
  <path key="2" d="M2 12l10 5 10-5" />,
]);
```

## Adding a New Chart Type

Add a new function component to `components/charts/SimpleCharts.tsx`:

```typescript
export const PieChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
  // SVG pie chart implementation
};
```

## Extending Markdown Support

In `utils/markdown.ts`:
- **New block type**: Add a new `if` branch in the main `while` loop
- **New inline syntax**: Add to `renderInline()` function
- **New KaTeX support**: Add new delimiter patterns in the math section

## Extending Syntax Highlighting

In `utils/highlight.ts`:
- **New language keywords**: Add to `KEYWORDS` map
- **New language alias**: Add to `ALIASES` map
- **New highlighting function**: Add a new `highlightXXX()` function

## Build Commands

```bash
npm run dev        # Start dev server on port 3000
npm run build      # Type check + production build
npm run preview    # Preview production build
npm run typecheck  # TypeScript type checking only
```

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `GEMINI_API_KEY` | Yes (for Gemini) | Google Gemini API key |
| `VITE_GOOGLE_OAUTH_CLIENT_ID` | No | Google Workspace features |

## Testing

The project uses zero testing framework dependencies. For manual testing:

1. Run `npm run dev` and verify all features in browser
2. Test offline by disabling network — all features should work
3. Test with different LLM providers by changing settings
4. Test voice input in Chrome/Edge (Web Speech API)
5. Test PWA by installing from browser

## Browser Compatibility

| Browser | Version | Notes |
|---------|---------|-------|
| Chrome | 100+ | Full support |
| Firefox | 100+ | Full support (Web Speech may need flag) |
| Safari | 16+ | Full support |
| Edge | 100+ | Full support |

## Performance Guidelines

1. Keep components small and focused
2. Use `useCallback` and `useMemo` for expensive computations
3. Avoid re-rendering the entire chat on every keystroke
4. Debounce auto-save (2 seconds)
5. Lazy-load large content with intersection observer
