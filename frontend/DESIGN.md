---
name: CRIS-RES Mission Control & Enterprise Portal
colors:
  surface: '#f8f9ff'
  surface-dim: '#ccdbf3'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d5e3fc'
  on-surface: '#0d1c2e'
  on-surface-variant: '#44474f'
  inverse-surface: '#233144'
  inverse-on-surface: '#eaf1ff'
  outline: '#747780'
  outline-variant: '#c4c6d0'
  surface-tint: '#425e92'
  primary: '#00204c'
  on-primary: '#ffffff'
  primary-container: '#163668'
  on-primary-container: '#84a0d9'
  inverse-primary: '#acc7ff'
  secondary: '#a83900'
  on-secondary: '#ffffff'
  secondary-container: '#fc6018'
  on-secondary-container: '#531800'
  tertiary: '#002723'
  on-tertiary: '#ffffff'
  tertiary-container: '#003f39'
  on-tertiary-container: '#3fb1a5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d7e2ff'
  primary-fixed-dim: '#acc7ff'
  on-primary-fixed: '#001a40'
  on-primary-fixed-variant: '#294679'
  secondary-fixed: '#ffdbcf'
  secondary-fixed-dim: '#ffb59a'
  on-secondary-fixed: '#380d00'
  on-secondary-fixed-variant: '#802a00'
  tertiary-fixed: '#89f5e7'
  tertiary-fixed-dim: '#6bd8cb'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#005049'
  background: '#f8f9ff'
  on-background: '#0d1c2e'
  surface-variant: '#d5e3fc'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
  code-block:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  space-2: 0.125rem
  space-4: 0.25rem
  space-8: 0.5rem
  space-12: 0.75rem
  space-16: 1rem
  space-20: 1.25rem
  space-24: 1.5rem
  space-32: 2rem
  space-48: 3rem
  space-64: 4rem
  gutter: 1rem
  margin-edge: 1.5rem
---

## Brand & Style

The design system establishes an authoritative, high-throughput enterprise interface for mission control operators, divisional railway traffic managers, and API enterprise developers under the Centre for Railway Information Systems (CRIS) and IRCTC.

### Aesthetic Foundation
- **Style Archetype:** Modern Corporate & Mission Control Data Density. The visual signature merges rigorous National Informatics/Government portal utility with modern, low-latency telemetry observability dashboards.
- **Tone & Mood:** Unwavering institutional reliability, operational precision, real-time vigilance, and structural clarity. 
- **Audience:** Senior train controllers, section controllers, logistics managers, enterprise API developers consuming real-time GPS feeds, and administrative personnel navigating millions of passenger records and freight schedules.

### Visual Principles
- **Clarity over Ornamentation:** Zero non-functional decoration. Every border, color shift, and tabular row exists to convey system status, network delay, or schema syntax.
- **Telemetry Precision:** High contrast between status states (On-Time Emerald, Delayed Amber, Diverted/Critical Crimson, Live GPS Pulse Cyan) against clean enterprise slate backgrounds.
- **National Institutional Heritage:** Governed by official Indian Railways Navy, Ashoka Lion emblem framing, and IRCTC saffron call-to-action highlights, maintaining compliance with national accessibility standards (GIGW - Guidelines for Indian Government Websites).

## Colors

The color palette reflects the institutional gravitas of Indian Railways while providing high-contrast accessibility for intensive screen sessions in round-the-clock control rooms.

### Palette Architecture
- **Primary (`#163668` / `#0F2C59`):** Indian Railways deep maritime navy. Governs mastheads, primary headers, sidebars, navigation ribbons, and major active states.
- **Secondary (`#E65100` / `#F97316`):** IRCTC signature saffron-orange. Reserved for high-intent primary operations (e.g., Run Query, Dispatch Feed, Generate Token, API Key Renewal) and attention notices.
- **Tertiary (`#0D9488`):** Deep cyan/teal representing live GPS telemetry, geofence triggers, and active satellite connection signals.
- **Neutral Core:** Functional slate scale (`#F8FAFC` base surface, `#F1F5F9` sub-panel backgrounds, `#E2E8F0` structural borders, `#334155` standard body, `#0F172A` high-contrast ink).

### Telemetry & Operational State Semantic Colors
- **On-Time / Nominal:** `#15803D` text with `#DCFCE7` background.
- **Delayed / Cautionary:** `#B45309` text with `#FEF3C7` background.
- **Diverted / Cancelled / Critical:** `#B91C1C` text with `#FEE2E2` background.
- **Live Signal Pulse:** `#2563EB` and `#0284C7` with dynamic radiating wave overlays.
- **JSON Syntax Theme:** `#0F172A` background container, `#38BDF8` keys, `#FDBA74` strings, `#A7F3D0` numbers/booleans, `#94A3B8` punctuation.

## Typography

The typography strategy leverages **Inter** for all interface chrome, narrative information, and control inputs to guarantee maximum legibility at variable DPI settings, while employing **JetBrains Mono** for train identifiers (e.g., `12002 NDLS-BPL`, `22436 VB`), tabular coordinates, timestamps, latency monitors, and JSON API payloads.

### Hierarchy & Rules
- **Tabular Numerals (`tnum`):** All tabular data, ETA timers, platform markers, and speedometers must enforce monospaced or tabular numerical figures to eliminate layout shift during live refreshes.
- **National Multilingual Support:** High baseline metrics ensure clean co-rendering with Devanagari (Hindi) scripts on regional switcher views without clipping ascenders or matras.
- **Micro-Labels:** Uppercase micro-labels (`label-sm`) with `0.05em` letter tracking are mandated for telemetry tags, operational zones (e.g., `NR`, `WR`, `NCR`), and protocol labels (`REST v2.4`, `WSS: LIVE`).

## Layout & Spacing

The layout is built on a 12-column compact enterprise data grid engineered for desktop control cockpits and widescreen dispatch centers, downscaled for field tablet audits.

### Structure & Density
- **Density Profile:** Compact and information-dense. Table rows maintain a strict `36px` to `44px` height ceiling to display over 20 concurrent train status nodes per viewport without scrolling.
- **Government Global Utility Header:** A fixed 32px top accessibility bar holding live Indian Standard Time (`IST [HH:mm:ss]`), accessibility controls (`A- | A | A+`), and the bilingual switcher (`हिंदी / English`).
- **Primary Operations Header:** 64px bar featuring the CRIS emblem, Ministry of Railways identification, and global fast-search (PNR, Train Number, Station Code).
- **Split-Pane Operations Layout:**
  - **Left Navigation / Feed Selector:** Fixed 260px utility sidebar.
  - **Center Canvas:** Dynamic multi-card telemetry grid or live tabular timetable.
  - **Right Telemetry / Schema Inspector:** 360px collapsible panel displaying real-time GPS telemetry, geofence coordinates, and live JSON feed packets.
- **Breakpoints:**
  - **Desktop Large (>1440px):** Full 12-column operational canvas with dual sidebars.
  - **Standard Desktop (1024px - 1439px):** Right inspector turns into a slide-over drawer; 12-column core grid.
  - **Tablet (768px - 1023px):** Left navigation collapses into a persistent icon rail (64px width); tabular grids trigger horizontal scroll with pinned train IDs.

## Elevation & Depth

This design system uses a utilitarian, low-depth architectural strategy. Deep atmospheric shadows are forbidden; structural separation is driven by crisp borders, tonal surface shifting, and intentional hairline dividers.

### Depth Hierarchy
- **Level 0 (App Shell & Workspace):** Base canvas in `#F1F5F9` (Slate 100) or `#F8FAFC` (Slate 50).
- **Level 1 (Cards, Tabular Panels, Data Blocks):** `#FFFFFF` surface bordered with `1px solid #CBD5E1`. Minimal ambient contact shadow: `0 1px 2px 0 rgba(15, 23, 42, 0.05)`.
- **Level 2 (Active Focus Panels & Telemetry Highlights):** `#FFFFFF` surface with `1px solid #94A3B8` and focus accent border in Railway Navy (`#163668`) or Saffron (`#E65100`), accompanied by `0 4px 6px -1px rgba(15, 23, 42, 0.08)`.
- **Level 3 (Modal Dialogues & Payload Inspectors):** `#FFFFFF` surface framed by `1px solid #64748B` with an elevated backdrop scrim (`rgba(15, 23, 42, 0.6)`) and a structured shadow: `0 10px 15px -3px rgba(15, 23, 42, 0.15)`.

### Dividers & Grid Borders
- Internal table row dividers strictly use `#E2E8F0` at 1px thickness.
- Header bars utilize a 2px anchoring bottom rule in `#0F2C59`.

## Shapes

In keeping with official enterprise tools and industrial railway telemetry, the shape language uses **Soft (Level 1)** geometry. Crisp, direct edges convey mechanical dependability, tabular precision, and institutional governance.

### Radius Specifications
- **Data Grids & Table Containers:** `4px` outer container corner radius; `0px` for interior cells.
- **Buttons & Input Controls:** `4px` border radius (`rounded-sm`).
- **Telemetry Badges & Status Chips:** `3px` to `4px` border radius (pill shapes are strictly avoided for system indicators to preserve an enterprise instrument feel).
- **JSON Terminal Windows:** `6px` radius with an inner inset border.

## Components

### 1. Global Government Utility Bar
- **Dimensions:** 32px height, full-width.
- **Styling:** Surface `#F8FAFC`, bottom border `1px solid #E2E8F0`.
- **Items:**
  - Dynamic IST Clock: `Mon, 05-Sep-2026 [21:26:28 IST]` in `JetBrains Mono` 11px font.
  - Font Size Scaling Controls: `A-`, `A`, `A+` anchored in minimal border boxes.
  - Language Selection: `English | हिंदी` active toggle button.
  - Official links with external indicator icons.

### 2. Primary Action Buttons
- **Primary Action (Saffron Core):** Background `#E65100`, text `#FFFFFF`, border none, hover `#C2410C`, active `#9A3412`. Font `Inter`, 14px SemiBold.
- **Institutional Primary (Navy):** Background `#163668`, text `#FFFFFF`, hover `#0F2C59`. Used for system queries, session controls, and navigation.
- **Secondary Outlined:** Background `transparent`, border `1px solid #CBD5E1`, text `#1E293B`, hover `#F1F5F9`.
- **Destructive:** Background `#DC2626`, text `#FFFFFF`, hover `#B91C1C`.

### 3. Real-Time Status Badges & Live Indicators
- **On-Time:** Surface `#DCFCE7`, text `#15803D`, border `1px solid #86EFAC`.
- **Delayed:** Surface `#FEF3C7`, text `#B45309`, border `1px solid #FCD34D`. Format: `DELAYED +42M`.
- **Diverted / Cancelled:** Surface `#FEE2E2`, text `#B91C1C`, border `1px solid #FCA5A5`.
- **Live Pulsing Indicator:** Cyan dot (`#0284C7`) with a radiating concentric ring animation (`ping` effect at 1.5s intervals), paired with `LIVE GPS` in `JetBrains Mono` 10px uppercase.

### 4. Tabular Data Grids (Time-Table & Train Radar)
- **Header:** Background `#0F2C59`, text `#FFFFFF`, uppercase `JetBrains Mono` 11px font, sticky positioning.
- **Alternating Rows:** Even rows `#FFFFFF`, odd rows `#F8FAFC`. Hover state `#F1F5F9`.
- **Cell Alignment:** Train ID/Name left-aligned; Distance, Scheduled Arrival, Real Arrival, Platform, and Speed columns right-aligned or centered with tabular numbers (`font-variant-numeric: tabular-nums`).

### 5. Telemetry Metric Cards
- **Structure:** Surface `#FFFFFF`, border `1px solid #E2E8F0`, padding 16px.
- **Header:** Label-sm uppercase neutral title accompanied by an operational icon.
- **Stat Metric:** 28px bold tabular numbers with unit sub-labels (e.g., `128.4 km/h`, `98.2% Punctuality`).
- **Footer Delta:** Trend indicator with green/red positive/negative operational variance.

### 6. JSON Code Blocks & API Feeds
- **Container:** Dark terminal background `#0F172A`, border `1px solid #334155`, padding 12px 16px, radius 6px.
- **Header Strip:** File meta badge (`GET /v2/trains/12002/eta`), Copy Payload button, and active streaming WebSocket indicator.
- **Typography:** JetBrains Mono 12px, line height 1.6.
- **Syntax Styling:** Keys `#38BDF8`, String literals `#FDBA74`, Integers `#A7F3D0`, Delimiters `#94A3B8`.

### 7. Form Controls & Search Inputs
- **Input Fields:** 36px height, background `#FFFFFF`, border `1px solid #CBD5E1`, text `#0F172A`. Active focus ring: `2px solid #163668` with `0px` offset.
- **Radio & Checkboxes:** 16px square/circle with `2px` border in `#163668`. Active fill `#163668` with crisp white check/dot.