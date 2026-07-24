# Dependency Removal Notes

This document records every npm dependency removed from Open Knowledge Studio and the first-party replacement that replaced it. The goal: reduce the dependency tree from 300+ packages to exactly 2 runtime packages (`react`, `react-dom`).

## Removed Dependencies

### Firebase (Auth + Firestore)
- **Why removed**: Vendor lock-in, 4MB+ bundle, requires Google Cloud project provisioning
- **Replacement**: `services/googleAuthService.ts` — Google Identity Services (GIS) loaded from CDN + Drive REST API `appDataFolder` for per-user JSON backup
- **Benefits**: No Firebase project needed, data in user's own Drive, no Firestore rules to maintain

### @google/genai (Gemini SDK)
- **Why removed**: 2MB+ bundle, version coupling to Google's SDK releases
- **Replacement**: `services/geminiService.ts` — Direct REST calls to `generativelanguage.googleapis.com/v1beta` via `fetch()`
- **Benefits**: No SDK version pinning, works with any Gemini model immediately

### recharts
- **Why removed**: 80KB+ bundle, D3 dependency chain
- **Replacement**: `components/charts/SimpleCharts.tsx` — Pure SVG bar/line/area charts
- **Benefits**: Zero dependencies, fully customizable, tiny bundle

### marked
- **Why removed**: 30KB+ bundle, CommonMark compliance issues with custom extensions
- **Replacement**: `utils/markdown.ts` — Custom CommonMark-subset parser with KaTeX/Mermaid integration
- **Benefits**: Full control over rendering, seamless KaTeX/Mermaid routing

### highlight.js
- **Why removed**: 50KB+ bundle (with themes), CDN dependency
- **Replacement**: `utils/highlight.ts` — Regex-based highlighter for 9+ languages
- **Benefits**: No CDN request, instant highlighting, bundled styles

### lucide-react
- **Why removed**: 100KB+ bundle for 40 icons
- **Replacement**: `components/icons/lucide-shim.tsx` — Inline SVG icons with same API
- **Benefits**: Zero runtime cost, no CDN, tree-shakeable by design

## Version Updates

| Package | v1 | v2 | Reason |
|---------|----|----|--------|
| react | ^19.1.0 | ^19.2.7 | Bug fixes, performance |
| react-dom | ^19.1.0 | ^19.2.7 | Matching react version |
| vite | ^6.2.0 | ^8.1.3 | Rolldown bundler (Rust-based, 10x faster) |
| @vitejs/plugin-react | ^5.0.0 | ^6.0.3 | Required for Vite 8 |
| typescript | ~5.8.2 | ~6.0.3 | Stricter type checking |
| @types/node | ^22.x | ^26.x | Updated type definitions |

## KaTeX and Mermaid (CDN)

These remain as CDN scripts (not npm packages) because:
1. KaTeX: 200KB+ CSS/JS — better served from CDN with caching
2. Mermaid: 400KB+ JS — better served from CDN with caching
3. Both are pinned to specific stable versions (0.17.0 and 11.16.0)
4. Service Worker caches them after first load
