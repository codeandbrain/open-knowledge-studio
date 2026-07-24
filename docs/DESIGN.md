# Design System — Open Knowledge Studio v2

## Color Palette

### Dark Theme (Default)
| Token | Color | Usage |
|-------|-------|-------|
| `studio.dark` | `#0f0f1a` | App background |
| `studio.panel` | `#1a1a2e` | Panels, cards, modals |
| `studio.border` | `#2a2a3e` | Borders, dividers |
| `studio.accent` | `#4f46e5` | Primary actions, links |
| `studio.success` | `#10b981` | Success states |
| `studio.warning` | `#f59e0b` | Warning states |
| `studio.danger` | `#ef4444` | Error states |
| Text primary | `#e2e2e2` | Body text |
| Text secondary | `#888888` | Labels, metadata |
| Text muted | `#555555` | Placeholders |

### Light Theme
| Token | Color | Usage |
|-------|-------|-------|
| Background | `#ffffff` | App background |
| Panel | `#f8f9fa` | Panels, cards, modals |
| Border | `#e5e7eb` | Borders, dividers |
| Accent | `#4f46e5` | Primary actions, links |
| Text primary | `#1a1a1a` | Body text |
| Text secondary | `#6b7280` | Labels, metadata |
| Text muted | `#9ca3af` | Placeholders |

## Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| App title | System sans-serif | 14px | 600 |
| Headings | System sans-serif | 18-24px | 700 |
| Body text | System sans-serif | 14px | 400 |
| Code | Monospace | 13px | 400 |
| Labels | System sans-serif | 11px | 400 |
| Status bar | System sans-serif | 10px | 400 |

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon padding |
| sm | 8px | Compact spacing |
| md | 16px | Standard spacing |
| lg | 24px | Section spacing |
| xl | 32px | Page margins |

## Component Specifications

### Buttons
- Border radius: 8px
- Padding: 8px 16px
- Font size: 12px
- Hover: slight opacity change or background shift
- Disabled: 50% opacity, no pointer events

### Input Fields
- Background: `#1a1a2e` (dark) / `#f8f9fa` (light)
- Border: 1px solid `#2a2a3e`
- Focus border: `#4f46e5` with 50% opacity
- Border radius: 8px
- Padding: 8px 12px
- Font size: 12px

### Cards
- Background: `#1a1a2e`
- Border: 1px solid `#2a2a3e`
- Border radius: 8px
- Padding: 16px

### Modals
- Background: `#1a1a2e`
- Overlay: `rgba(0,0,0,0.6)`
- Border radius: 12px
- Max width: 512px
- Max height: 80vh

## Layout

### Three-Column Layout (Default)
```
┌───┬──────────────────────┬───┐
│   │                      │   │
│KB │   Main Content       │GW │
│   │                      │   │
│288│       flex-1         │320│
│px │                      │px │
│   │                      │   │
└───┴──────────────────────┴───┘
```

### Two-Column Layout (Sidebar collapsed)
```
┌────────────────────────────┐
│        Main Content        │
│           flex-1           │
└────────────────────────────┘
```

### Split-Pane Editor
```
┌─────┬──────────┬──────────┐
│ TOC │  Editor  │ Preview  │
│ 192 │  flex-1  │  flex-1  │
│  px │   px     │    px    │
└─────┴──────────┴──────────┘
```

## Responsive Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | < 768px | Single column, sidebar overlays |
| Tablet | 768-1024px | Two columns, sidebar fixed |
| Desktop | > 1024px | Three columns |

## Animations

| Transition | Duration | Easing |
|------------|----------|--------|
| Theme switch | 200ms | ease-out |
| Panel toggle | 200ms | ease-out |
| Hover effects | 150ms | ease-in-out |
| Voice recording pulse | 1.2s | infinite |

## Accessibility

- All interactive elements have visible focus states
- Color contrast meets WCAG AA (4.5:1 for text)
- Icons have `title` attributes for tooltips
- Form inputs have descriptive placeholders
- Keyboard navigation: Tab order follows visual order
- Escape closes modals and panels
