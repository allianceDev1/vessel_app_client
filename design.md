# Design System Specification

## 1. Overview

This document specifies the complete visual design language, UI architecture, design tokens, component library, and interaction patterns extracted directly from the existing frontend codebase. It provides an exhaustive, production-grade guide enabling an engineer or AI coding agent to implement new pages or build an entirely new application that matches the exact aesthetics, visual hierarchy, responsiveness, and interaction mechanics of the system.

### Technical Foundation
* **Framework:** React 19.2.0 (Functional components, Hooks, Context, Suspense, Lazy Loading)
* **Build Tool:** Create React App (`react-scripts` 5.0.1)
* **Styling Architecture:** Dart Sass (`sass` ^1.93.2, `sass-loader` ^16.0.6) utilizing modern `@use` and `@forward` modules, compiled to native CSS Custom Properties (CSS variables) for dynamic theme switching.
* **Component Paradigm:** Handcrafted, zero-dependency UI primitives (`src/components/UI_Primitives/`) adhering to strict accessibility, scoped class naming (`.ui-*`), and uniform state handling.
* **Data Presentation:** `@tanstack/react-table` (v8.21.3) wrapped in a custom styled card container; `@tanstack/react-query` (v5.90.21) for client-side asynchronous caching and state synchronisation.
* **Data Visualization:** `recharts` (v3.5.0) paired with custom themed tooltips and legends.
* **Iconography:** `react-icons` (v5.5.0) with primary emphasis on Tabler Icons (`react-icons/tb`), supplemented by Grommet (`react-icons/gr`), FontAwesome 6 (`react-icons/fa6`), Ionicons 5 (`react-icons/io5`), and Radix Icons (`react-icons/rx`).
* **State & Overlay Management:** Redux Toolkit (`@reduxjs/toolkit` v2.9.0) with a dedicated `miniSystemSlice` controlling global modals, confirmation dialogs, toast notifications, and dynamic page titles.

---

## 2. Design Philosophy

The application interface is grounded in six defining visual principles:

1. **Soft-Rounded Modernism:** All UI elements feature deliberate, gentle border radii. Interactive primitives use radii from 8px to 15px, data tables and bulk action toolbars use 25px, modal windows use 35px, and badges/toggles/tabs leverage full pill shapes (50px to 100px). Sharp 90-degree corners are systematically avoided.
2. **Dual-Persona Layout Architecture:** 
   * **Desktop Management Shell (`ControllerLayout`):** Tailored for dense data handling, analytics, and record inspection. Features a persistent 220px sidebar, flexible content region capped at 1600px, and responsive collapse to an off-canvas drawer below 950px.
   * **Mobile Field Shell (`TechLayout`):** Tailored for field operators on handheld touch devices. Uses a fixed 55px top app bar, a centered single-column layout capped at 500px, and a fixed 55px bottom icon navigation bar.
3. **Ambient Tinted Hierarchy:** Rather than using heavy, saturated block colors for status indicators, the system employs high-contrast text on pastel, tinted background surfaces (`--color-[status]-bg` and `--color-[status]-text`). This drastically reduces visual fatigue during prolonged usage.
4. **Adaptive Floating Labels:** Form inputs utilize animated floating labels that transition from centered placeholder positions directly into compact caption labels above the input field upon focus or value entry.
5. **Multi-Sensory Action Feedback:** High-consequence operational actions trigger visual feedback (animations and state banners), audible acoustic confirmation (`success-effect.mp3`), and tactile haptic vibration sequences (`navigator.vibrate([80, 15, 80, 15, 40])`) on supporting devices.
6. **Graceful Degradation Across Viewports:** Desktop tables gracefully convert into stacked mobile cards, centered floating modals morph into touch-friendly bottom sheets on narrow screens, and multi-column dashboards scale sequentially down to single-column streams.

---

## 3. Design Tokens

The styling architecture translates modular Sass maps into CSS Custom Properties on either `.light` or `.dark` class scopes applied to `document.documentElement` (`<html>`). When no theme class is explicitly active, media queries (`prefers-color-scheme: light` / `prefers-color-scheme: dark`) provide fallback token binding.

### 3.1 Color Palette

#### Base Grayscale (Neutral Palette)
The neutral palette forms the foundation of all surface elevations, borders, text, and backdrops.

| Token | HEX | Usage / Semantic Role |
|---|---|---|
| `$neutral-palette(0)` | `#FFFFFF` | True White / Light Background / Dark Text Inverse |
| `$neutral-palette(25)` | `#FBFBFB` | Light Background Alt |
| `$neutral-palette(50)` | `#F7F7F7` | Light Surface Base / Dark Text Primary Alt |
| `$neutral-palette(75)` | `#EBEBEB` | Light Surface-1 / Table Headers |
| `$neutral-palette(100)` | `#E0E0E0` | Light Surface-2 / Surface Disabled / Inverse Alt |
| `$neutral-palette(150)` | `#CFCFCF` | Light Surface-3 / Light Border Light |
| `$neutral-palette(200)` | `#C0C0C0` | Light Border Default / Border Disabled |
| `$neutral-palette(250)` | `#B1B1B1` | Intermediate Gray |
| `$neutral-palette(300)` | `#A3A3A3` | Light Text Disabled / Light Border Medium |
| `$neutral-palette(350)` | `#969696` | Intermediate Mid-Gray |
| `$neutral-palette(400)` | `#8B8B8B` | Light Text Muted / Light Border Dark / Dark Text Tertiary |
| `$neutral-palette(450)` | `#838383` | Light Text Placeholder |
| `$neutral-palette(500)` | `#808080` | Mid-Gray Anchor / Utility Neutral / Dark Text Muted |
| `$neutral-palette(550)` | `#747474` | Dark Text Placeholder |
| `$neutral-palette(600)` | `#6A6A6A` | Light Text Secondary Alt / Dark Border Dark / Dark Text Disabled |
| `$neutral-palette(650)` | `#606060` | Dark Border Medium |
| `$neutral-palette(700)` | `#565656` | Light Text Secondary / Dark Border Default |
| `$neutral-palette(750)` | `#4C4C4C` | Dark Border Light / Dark Surface-3 |
| `$neutral-palette(800)` | `#424242` | Light Text Primary Alt / Dark Surface-2 |
| `$neutral-palette(850)` | `#363636` | Dark Surface-1 |
| `$neutral-palette(900)` | `#2B2B2B` | Light Text Primary / Dark Surface Base / Dark Background Alt |
| `$neutral-palette(950)` | `#1D1D1D` | Light Surface Inverse / Dark Background Base |
| `$neutral-palette(1000)` | `#000000` | True Black / Dark Text Inverse |

---

#### Semantic Color Scales

##### Primary Blue Scale
* **Light Base (500):** `#0066FF`
* **Dark Base (500):** `#009CFF`

| Step | Light Mode HEX | Dark Mode HEX | Semantic Role |
|---|---|---|---|
| **50** | `#E5F0FF` | `#E0F2FF` | Light Background Tint (`--color-primary-bg`) |
| **100** | `#CCE0FF` | `#B3E0FF` | Light Hover Background Tint |
| **200** | `#99C2FF` | `#80CDFF` | Light Subtle Accent |
| **300** | `#66A3FF` | `#4DBBFF` | Light Focus Rings / Interactive Muted |
| **400** | `#3385FF` | `#26ACFF` | Light Active Alternative |
| **500** | `#0066FF` | `#009CFF` | Primary Brand Color (`--color-primary`) |
| **600** | `#005ACD` | `#008DEB` | Primary Hover (`--color-primary-hover`) |
| **700** | `#004D99` | `#007AD5` | Primary Active / Pressed (`--color-primary-active`) |
| **800** | `#003366` | `#0067BF` | Dark Mode Hover Tint (`--color-primary-bg-hover`) |
| **900** | `#001A33` | `#0042A6` | Dark Mode Background Tint (`--color-primary-bg`) |

##### Success Green Scale
* **Base (500):** `#009A46` (Light & Dark)

| Step | Light Mode HEX | Dark Mode HEX | Semantic Role |
|---|---|---|---|
| **50** | `#E0F5E8` | `#E0F5E8` | Light Success Background Tint (`--color-success-bg`) |
| **100** | `#B3E6C6` | `#B3E6C6` | Light Success Hover Background Tint |
| **500** | `#009A46` | `#009A46` | Success Base (`--color-success`) |
| **600** | `#008C3F` | `#008C3F` | Success Hover / Light Text (`--color-success-text`) |
| **700** | `#007936` | `#007936` | Success Active / Pressed |
| **800** | `#00652D` | `#00652D` | Dark Success Hover Tint |
| **900** | `#004B20` | `#004B20` | Dark Success Background Tint (`--color-success-bg`) |

##### Danger Red Scale
* **Base (500):** `#D30038` (Light & Dark)

| Step | Light Mode HEX | Dark Mode HEX | Semantic Role |
|---|---|---|---|
| **50** | `#FEE0E5` | `#FEE0E5` | Light Danger Background Tint (`--color-danger-bg`) |
| **100** | `#FFB3C0` | `#FFB3C0` | Light Danger Hover Background Tint |
| **500** | `#D30038` | `#D30038` | Danger Base (`--color-danger`) |
| **600** | `#BF0032` | `#BF0032` | Danger Hover / Light Text (`--color-danger-text`) |
| **700** | `#A8002B` | `#A8002B` | Danger Active / Pressed |
| **800** | `#920025` | `#920025` | Dark Danger Hover Tint |
| **900** | `#74001B` | `#74001B` | Dark Danger Background Tint (`--color-danger-bg`) |

##### Warning Yellow / Ochre Scale
* **Base (500):** `#938700` (Light & Dark)

| Step | Light Mode HEX | Dark Mode HEX | Semantic Role |
|---|---|---|---|
| **50** | `#FFFEE0` | `#FFFEE0` | Light Warning Background Tint (`--color-warning-bg`) |
| **100** | `#FFFCB3` | `#FFFCB3` | Light Warning Hover Background Tint |
| **500** | `#938700` | `#938700` | Warning Base (`--color-warning`) |
| **600** | `#867B00` | `#867B00` | Warning Hover |
| **700** | `#746800` | `#746800` | Warning Active / Pressed |
| **800** | `#615500` | `#615500` | Dark Warning Hover Tint |
| **900** | `#4B3E00` | `#4B3E00` | Warning Light Text (`--color-warning-text`) / Dark Background Tint |

##### Info Azure Scale
* **Base (500):** `#0085F2` (Light & Dark)

| Step | Light Mode HEX | Dark Mode HEX | Semantic Role |
|---|---|---|---|
| **50** | `#E0F1FF` | `#E0F1FF` | Light Info Background Tint (`--color-info-bg`) |
| **100** | `#B3DAFF` | `#B3DAFF` | Light Info Hover Background Tint |
| **500** | `#0085F2` | `#0085F2` | Info Base (`--color-info`) |
| **600** | `#0079DE` | `#0079DE` | Info Hover |
| **700** | `#0064C7` | `#0064C7` | Info Active / Pressed |
| **800** | `#0050B0` | `#0050B0` | Info Light Text (`--color-info-text`) / Dark Hover Tint |
| **900** | `#00388A` | `#00388A` | Dark Info Background Tint (`--color-info-bg`) |

---

### 3.2 Semantic Theme CSS Variables Reference

```css
/* Light Theme Token Mapping */
.light {
  --text-primary: #2B2B2B;        /* $neutral-palette-900 */
  --text-primary-alt: #424242;    /* $neutral-palette-800 */
  --text-secondary: #565656;      /* $neutral-palette-700 */
  --text-secondary-alt: #6A6A6A;  /* $neutral-palette-600 */
  --text-tertiary: #808080;       /* $neutral-palette-500 */
  --text-muted: #8B8B8B;          /* $neutral-palette-400 */
  --text-disabled: #A3A3A3;       /* $neutral-palette-300 */
  --text-placeholder: #838383;    /* $neutral-palette-450 */
  --text-inverse: #FFFFFF;        /* $neutral-palette-0 */
  --text-inverse-alt: #E0E0E0;    /* $neutral-palette-100 */

  --background: #FFFFFF;          /* $neutral-palette-0 */
  --background-alt: #FBFBFB;      /* $neutral-palette-25 */
  --surface: #F7F7F7;             /* $neutral-palette-50 */
  --surface-1: #EBEBEB;           /* $neutral-palette-75 */
  --surface-2: #E0E0E0;           /* $neutral-palette-100 */
  --surface-3: #CFCFCF;           /* $neutral-palette-150 */
  --surface-disabled: #E0E0E0;    /* $neutral-palette-100 */
  --surface-inverse: #1D1D1D;     /* $neutral-palette-950 */

  --border-light: #CFCFCF;        /* $neutral-palette-150 */
  --border-default: #C0C0C0;      /* $neutral-palette-200 */
  --border-medium: #A3A3A3;       /* $neutral-palette-300 */
  --border-dark: #8B8B8B;         /* $neutral-palette-400 */
  --border-disabled: #C0C0C0;     /* $neutral-palette-200 */
  --border-focus: #0066FF;        /* Primary Light 500 */

  --shadow-xs: rgba(43, 43, 43, 0.05);
  --shadow-sm: rgba(43, 43, 43, 0.10);
  --shadow-md: rgba(43, 43, 43, 0.15);
  --shadow-lg: rgba(43, 43, 43, 0.25);

  --overlay-light: color-mix(in srgb, #FFFFFF 80%, transparent);
  --overlay-dark: color-mix(in srgb, #000000 50%, transparent);
}

/* Dark Theme Token Mapping */
.dark {
  --text-primary: #FFFFFF;        /* $neutral-palette-0 */
  --text-primary-alt: #F7F7F7;    /* $neutral-palette-50 */
  --text-secondary: #C0C0C0;      /* $neutral-palette-200 */
  --text-secondary-alt: #A3A3A3;  /* $neutral-palette-300 */
  --text-tertiary: #8B8B8B;       /* $neutral-palette-400 */
  --text-muted: #808080;          /* $neutral-palette-500 */
  --text-disabled: #6A6A6A;       /* $neutral-palette-600 */
  --text-placeholder: #747474;    /* $neutral-palette-550 */
  --text-inverse: #000000;        /* $neutral-palette-1000 */
  --text-inverse-alt: #2B2B2B;    /* $neutral-palette-900 */

  --background: #1D1D1D;          /* $neutral-palette-950 */
  --background-alt: #2B2B2B;      /* $neutral-palette-900 */
  --surface: #2B2B2B;             /* $neutral-palette-900 */
  --surface-1: #363636;           /* $neutral-palette-850 */
  --surface-2: #424242;           /* $neutral-palette-800 */
  --surface-3: #4C4C4C;           /* $neutral-palette-750 */
  --surface-disabled: #424242;    /* $neutral-palette-800 */
  --surface-inverse: #FFFFFF;     /* $neutral-palette-0 */

  --border-light: #4C4C4C;        /* $neutral-palette-750 */
  --border-default: #565656;      /* $neutral-palette-700 */
  --border-medium: #606060;       /* $neutral-palette-650 */
  --border-dark: #6A6A6A;         /* $neutral-palette-600 */
  --border-disabled: #565656;     /* $neutral-palette-700 */
  --border-focus: #009CFF;        /* Primary Dark 500 */

  --shadow-xs: rgba(0, 0, 0, 0.10);
  --shadow-sm: rgba(0, 0, 0, 0.20);
  --shadow-md: rgba(0, 0, 0, 0.30);
  --shadow-lg: rgba(0, 0, 0, 0.40);

  --overlay-light: color-mix(in srgb, #FFFFFF 10%, transparent);
  --overlay-dark: color-mix(in srgb, #000000 60%, transparent);
}
```

---

### 3.3 Typography

#### Font Families
* **Primary Family:** `'ConfigRounded', 'Montserrat', sans-serif`
* **Fallback Stack:** System sans-serif fallbacks (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`)
* **Global Text Reset:** `overflow-wrap: anywhere; -webkit-tap-highlight-color: transparent;`

#### Available Font Weights
* `100` – Thin
* `200` – Extra Light
* `300` – Light
* `400` – Regular
* `500` – Medium (standard UI weight for labels, table cells, buttons)
* `600` – SemiBold (headings, table headers, emphasized stats)
* `700` – Bold (page titles, dialog headers, high-impact numbers)
* `800` – ExtraBold
* `900` – Black

#### Typography Scale Table

| Style Name | Size | Weight | Line Height | Usage Example |
|---|---|---|---|---|
| **Display Title** | 45px | 700 / 600 | 1.1 | 404 error numbers, high-impact landing elements |
| **Stat Metric (Hero)** | 35px | 600 | 1.1 | Dashboard metric card values (`.count-card h2`) |
| **Brand Title** | 28px | 600 | 1.2 | Navigation sidebar header (`.head-text h3`) |
| **Layout Page Title (H1)** | 23px – 25px | 700 | 1.25 | Main page header (`.body-container .header h3`), mobile top title |
| **Section Title (H2)** | 19px – 22px | 600 – 700 | 1.3 | Card sections, report headers, empty/error state titles |
| **Subtitle Medium** | 19px | 500 | 1.3 | Form and card group medium subtitles (`@include subTitleMedium`) |
| **Modal Header (H3)** | 18px | 700 | 1.3 | Modal dialog header titles (`.modal-header h4`) |
| **Subtitle Small** | 17px | 500 | 1.3 | Form subheadings, card titles (`@include subTitleSmall`) |
| **Card Header / Body Large**| 16px | 500 – 600 | 1.4 | Quick action cards, dialog paragraph text, primary list headings |
| **Body Regular / Medium Input** | 15px | 400 – 500 | 1.4 | Standard body paragraphs, text input values, dropdown items |
| **Body Small / Table Cell** | 14px | 500 | 1.4 | Table cells, table headers, error state messages, small inputs |
| **Caption / Compact Label** | 13px | 400 – 500 | 1.3 | Tooltips, card metadata, dropdown group titles, notes |
| **Micro Caption / Helper** | 12px | 400 – 500 | 1.2 | Floating input labels (active), input helper text, footer copyright |
| **Badge Medium** | 0.65rem (10.4px) | 500 | 1.2rem | Default pill badge text |
| **Badge Small** | 0.50rem (8px) | 500 | 1.0rem | Mini badge status text |

---

### 3.4 Spacing Scale

The spacing scale is derived from strict increments documented in components and layout rules:

| Value | Usage |
|---|---|
| **2px** | Micro padding, tooltip vertical padding, subtle borders |
| **4px** | Dropdown divider margins, table checkbox padding |
| **5px** | Pill tab track padding, badge gaps, card inner padding |
| **8px** | Small button padding, input bottom padding, toast item gap |
| **10px** | Standard flex gaps, medium button padding, card padding, modal header gap |
| **12px** | Quick action scroller gap, large button gap, input horizontal padding |
| **15px** | Modal body padding, standard input horizontal padding, card content padding |
| **20px** | Modal header padding, stat card padding, page vertical separation |
| **25px** | Layout body left margin, bulk action padding |
| **35px** | Modal border radius, icon dimensions |
| **40px** | Page top/bottom outer margins |
| **50px** | Dashboard footer margin top, mobile bottom menu height |
| **55px** | Mobile top header height, mobile bottom menu height |
| **100px** | Tech home footer margin top, loader line width, pill border-radius |

---

### 3.5 Border Radius Scale

| Radius | Class / Component | Context & Application |
|---|---|---|
| **4px** | `.checkbox-custom`, `.table-checkbox-input` | Native check indicators, small box tags |
| **6px** | `.btn-size-small` | Small action buttons |
| **7px** | `.multiselect-options` | Multi-select drop-down container |
| **8px** | `.ui-button`, `.toast`, `.alert-message`, `.tooltip` | Default buttons, toast alerts, system notifications |
| **10px** | `.ui-input-text-container`, `textarea`, `.skeleton-box`, `.dropdown-item`, `.count-card` | Inputs, dropdown items, stat containers, skeleton placeholders |
| **12px** | `&::-webkit-scrollbar-thumb`, `track` | Scrollbar thumb and background tracks |
| **15px** | `.ui-dialog .border`, `.dropdown-menu`, `.service-card-item-container` | Modal dialogs, dropdown menus, complex data cards |
| **20px** | `.loader-line` | Skeleton animation line indicator |
| **24px** | `.carousel__container` | Carousel image/slide container |
| **25px** | `.table-filter-content`, `.bulk-actions` | Table container border, floating bulk action toolbar |
| **35px** | `.modal-border` | Modal dialog card container, bottom-sheet top radius |
| **50px** | `.ui-badge`, `.btn-group`, `.card-header` pill | Status badges, grouped pill buttons, nav items |
| **100px / 9999px / 50%** | `.btn-rounded`, `.slide-menus`, `.profile-image`, `.navigate-button` | Circular icon buttons, avatars, pill tab scrollers |

---

### 3.6 Shadows & Elevation Hierarchy

| Level | Token Expression | Usage / Component |
|---|---|---|
| **Level 1 (Subtle)** | `0 2px 4px var(--shadow-sm)` | Toast notification alerts, Inline message alerts |
| **Level 2 (Bar/Toolbar)** | `0 2px 5px var(--shadow-sm)` | Floating bulk actions toolbar |
| **Level 3 (Popovers)** | `0 2px 5px var(--shadow-lg)` | Dropdown menus (`.dropdown-menu`), Confirmation Dialogs (`.ui-dialog`) |
| **Level 4 (Modal)** | `0 2px 5px var(--shadow-lg)` | Modal dialog container (`.modal-border`) |
| **Level 5 (Nav Bars)** | `var(--shadow-lg) 0 5px 10px -5px` | Mobile top header bar |
| **Level 6 (Bottom Bar)**| `var(--shadow-lg) 0 -5px 10px -5px` | Mobile bottom navigation menu bar |

---

### 3.7 Z-Index Layering Architecture

| Z-Index | Component / Layer | Description |
|---|---|---|
| **100** | `.toaster` | Global toast notification container |
| **80** | `.ui-modal`, `.ui-dialog` | Modal and confirmation dialog backdrops and windows |
| **70** | `.dropdown-menu` | Action dropdown menus and popover lists |
| **50** | `.layout-header`, `.layout-menu` (Tech) | Mobile fixed top app header and bottom navigation bar |
| **40** | `.layout-body` (Tech) | Mobile page content container |
| **10** | `.multiselect-options` | Dropdown option picker for multi-selects |
| **5** | `.layout-navbar`, `.nav-icon-section` | Desktop sidebar navigation and floating toggle button |
| **1 – 2** | `.menu-box` (sticky tabs), card overlays | Sticky subheaders, internal gradient backdrops |

---

## 4. Layout System

### 4.1 Desktop Operations Shell (`ControllerLayout`)
* **Target Audience:** Desktop power users, operations managers, and controllers.
* **Page Width Constraint:** Full-width layout with internal `.body-container` capped at `max-width: 1600px`.
* **Sidebar (`.layout-navbar`):**
  * Width: Fixed `220px`, full height (`100vh` / `100dvh`).
  * Layout: Grid structure with 3 row tracks: `50px auto 60px` (Brand Header, Menu Items Scroller, User Profile Footer).
  * Surface: `background-color: var(--background-alt)`, right border `1px solid var(--border-light)`.
  * Menu Items: Pill shape (`border-radius: 50px`), padding `10px 15px`, gap `10px`.
  * Active State: `background-color: var(--color-primary-bg)`, `color: var(--color-primary-text)`.
  * Danger/Exit Item: `color: var(--color-danger-text)`, hover `background-color: var(--color-danger-bg)`.
* **Main Content (`.layout-body`):**
  * Margin: `margin-left: 220px` (offsets sidebar).
  * Padding: `0 3% 0 25px`.
  * Header: Displays page title (`23px`, weight 700) and subtitle note (`15px`, weight 500, color `var(--text-tertiary)`).

```text
Desktop Controller Layout
┌──────────────────┬────────────────────────────────────────────────────────────────────────┐
│ Brand Logo + H3  │ Page Title (23px 700)                                                  │
│ 50px             │ Subtitle Note (15px 500)                                               │
├──────────────────┼────────────────────────────────────────────────────────────────────────┤
│ Nav Items        │                                                                        │
│ (Pill shaped)    │                                                                        │
│                  │ Main Page Content (max-width: 1600px)                                  │
│ Active:          │                                                                        │
│ Primary-BG       │                                                                        │
│ Auto-scroll      │                                                                        │
├──────────────────┤                                                                        │
│ User Profile     │                                                                        │
│ 60px             │                                                                        │
└──────────────────┴────────────────────────────────────────────────────────────────────────┘
```

---

### 4.2 Mobile Field Operations Shell (`TechLayout`)
* **Target Audience:** Field service technicians using mobile smartphones.
* **Layout Structure:**
  * Viewport Constraint: Single-column stream centered horizontally with `max-width: 500px`.
  * Top App Bar (`.layout-header`): Fixed at top (`top: 0`), height `55px`, `padding: 0 4%`, `background-color: var(--background-alt)`, border bottom `1px solid var(--border-light)`. Contains brand icon + title and external launcher icon button.
  * Content Area (`.layout-body`): `margin-top: 50px`, `padding-bottom: 50px`, internal padding `0 15px`.
  * Bottom Tab Bar (`.layout-menu`): Fixed at bottom (`bottom: 0`), height `55px`, `background-color: var(--background-alt)`, border top `1px solid var(--border-light)`, elevation shadow `var(--shadow-lg) 0 -5px 10px -5px`.
  * Bottom Menu Grid: 4-column equal grid (`1fr 1fr 1fr 1fr`). Each item features an icon (`28px`) and 12px caption text. Active tab switches to `var(--color-primary-text)`.

```text
Mobile Technician Layout
┌──────────────────────────────────────────────┐
│ [Logo] Service (25px)           [App Button] │ Fixed Top Bar (55px)
├──────────────────────────────────────────────┤
│ Page Title (22px 700)                        │ Content Stream
│ Subtitle Note (14px 500)                     │ (max-width: 500px)
│                                              │
│ [Card 1: Today's Work]                       │
│ [Card 2: Horizontal Quick Actions]           │
│ [Card 3: Performance Charts / Reports]       │
│                                              │
├──────────────────────────────────────────────┤
│ [Home]     [Services]   [Schedules]  [Done]  │ Fixed Bottom Bar (55px)
└──────────────────────────────────────────────┘
```

---

## 5. Responsive Design & Breakpoints

The responsive system is defined by empirical breakpoints derived directly from the SCSS media queries:

| Breakpoint | Target Category | Architectural Adjustments |
|---|---|---|
| **> 1250px** | Large Desktop | 4-column dashboards, full wide tables, expansive side-by-side forms. |
| **1000px – 1024px** | Desktop / Tablet Landscape | Stat cards (`.count-card-list`) collapse from 4 columns to 2 columns (`repeat(2, 1fr)`). Action button lists collapse to 2 columns. Key-value grids collapse from 3 columns to 2 columns. |
| **950px** | Sidebar Collapse Threshold | Desktop sidebar (`.layout-navbar`) slides offscreen (`left: -230px`). Main content margin collapses to `0px`. Floating round toggle icon (`.nav-icon-section`, 45px circle) appears at fixed top-right (20px, 20px). When opened (`.show-navbar`), sidebar animates back to `left: 0`. |
| **850px** | Tablet Portrait | Top action headers collapse from row to column. Tab filters and item lists adjust column widths. |
| **600px – 650px** | Phablet / Large Mobile | TanStack table filter bar stacks search input and action buttons vertically. Pagination bottom bar stacks page size selector and navigation buttons. |
| **560px** | Modal to Bottom Sheet | Floating modal dialogs (`.ui-modal`) transform into touch bottom sheets: `align-items: flex-end`, border-radius resets with `border-top-left-radius: 35px; border-top-right-radius: 35px`, `width: 100%`, and padding bottom expands to `60px`. |
| **500px** | Standard Mobile Phone | Stat cards and action cards collapse to 1 single column (`repeat(1, 1fr)`). Toaster stretches to full width (`width: 100%; right: 0; padding: 10px;`). Key-value grids collapse to 1 column. Footers stack vertically. |

---

## 6. Component Design System

### 6.1 Buttons (`Button.jsx`)
* **Selector:** `.ui-button`
* **Border Radius:** Default `8px`, Small `6px`, Large `10px`, Rounded `100px` (`.btn-rounded`).
* **Display:** Inline flex, `align-items: center`, `justify-content: center`, `gap: 10px`.
* **Variants:**
  * **Solid (Default):** Background is `--btn-color`, text is `--btn-color-alt`, border is `solid 2px var(--btn-color)`. Hover darkens or shifts to `--btn-color-hover`.
  * **Outlined (`.outlined`):** Background transparent, border `solid 2px var(--btn-color)`, text `var(--btn-color)`. Hover fills border/text to `--btn-color-hover`.
  * **Text (`.text`):** Background transparent, border transparent, text `var(--btn-color)`. Hover shifts to `--btn-color-hover`.
* **Severities:**
  * `primary`: Color `--color-primary`, hover `--color-primary-hover`, text `--color-white`.
  * `secondary`: Color `--text-primary`, hover `--text-primary-alt`, text `--text-inverse`.
  * `success`: Color `--color-success`, hover `--color-success-hover`, text `--color-white`.
  * `danger`: Color `--color-danger`, hover `--color-danger-hover`, text `--color-white`.
  * `warning`: Color `--color-warning`, hover `--color-warning-hover`, text `--color-white`.
  * `info`: Color `--color-info`, hover `--color-info-hover`, text `--color-white`.
* **Sizes:**
  * **Small (`.btn-size-small`):** Font size `0.875rem` (14px), padding `8px`, gap `8px`, icon `16px`.
  * **Medium (`.btn-size-medium`):** Font size `1rem` (15px/16px), padding `10px`, gap `10px`, icon `20px`.
  * **Large (`.btn-size-large`):** Font size `1.125rem` (18px), padding `12px`, gap `12px`, icon `24px`.
* **Loading Spinner (`.btn-spin-icon`):** Replaces icon with `<TbLoader />` animated via `@keyframes iconLoading` (rotate 360deg in 1.5s linear infinite).
* **Disabled State:** `opacity: 0.5; cursor: not-allowed;`

#### Button Groups (`ButtonGroup.jsx`)
* **Selector:** `.btn-group`
* **Behavior:** Glues multiple buttons horizontally or vertically (`.btn-group-vertical`). Internal buttons have `border-radius: 0` and shared borders (`border-right: 0px`). First child maintains left/top radius; last child maintains right/bottom radius.

---

### 6.2 Form Inputs (`InputText.jsx`, `TextArea.jsx`, `Select.jsx`, `MultiSelect.jsx`)

#### Floating Label Mechanics
All standard inputs wrap an `<input>` or `<textarea>` and a floating `<label>` inside a `.ui-input-text-container`:
* **Unfocused & Empty:** Label sits inside the input field (`font-size: 16px; color: var(--text-secondary); top: 1px; padding: 13px 0; pointer-events: none;`).
* **Focused or Value Present (`label.active`):** Label floats up (`top: -9px; left: 15px; font-size: 12px; font-weight: 400; background: none;`).
* **Border & Surface:** `border: 1px solid var(--border-light); border-radius: 10px; background-color: var(--surface-1);`.
* **Focus State:** `border-color: var(--color-primary-border); label { color: var(--color-primary-text); }`.
* **Error State (`.error`):** `border-color: var(--color-danger-border); label { color: var(--color-danger-text); }`. Helper text renders in `--color-danger-text`.
* **Required Indicator:** `.required { color: var(--color-danger-text); margin-left: 2px; font-size: 18px; }`.

#### Select Component (`Select.jsx`)
* Native select styled identically to `InputText` with option elements inheriting `--background-alt`.
* **Inline "Write..." Feature:** When option value `_input_write_` is picked, the select seamlessly transforms into a text input with a clear close icon (`<GrClose />`).

#### Multi-Select Input (`MultiSelect.jsx`)
* **Trigger:** Styled box with label and display count summary (e.g. `"Option 1 & 2 items selected"`).
* **Popover Menu:** `position: absolute; top: 100%; border-radius: 7px; background-color: var(--background-alt); max-height: 200px; z-index: 10; border: 1px solid var(--border-light);`.
* **Embedded Search:** Embedded small `InputText` at top of popover menu filtering choices via regex.

#### Checkbox (`Checkbox.jsx`) & Radio (`Radio.jsx`)
* **Custom Box (`.checkbox-custom`):** `width: 21px; height: 21px; border: 2px solid var(--border-light); border-radius: 4px; background: var(--surface-1);`.
  * Checked: `border-color: var(--color-primary-text); background-color: var(--color-primary-bg); svg { display: block; }`.
* **Custom Radio (`.radio-custom`):** `width: 21px; height: 21px; border-radius: 50%; border: 2px solid var(--border-light);`.
  * Checked: `border-color: var(--color-primary-text); background-color: var(--color-primary-bg);`.
* **Sizes Available:** Small (16px), Medium (21px), Large (25px).

---

### 6.3 Badges (`Badge.jsx`)
* **Selector:** `.ui-badge`
* **Appearance:** Pill-shaped indicator (`border-radius: 50px`).
* **Default Styles:** Font size `0.65rem` (10.4px), height `1.2rem`, padding `0 0.4rem`, font-weight `500`.
* **Sizes:**
  * `sm`: font size `0.50rem` (8px), height `1.0rem`, padding `0 0.3rem`.
  * `md`: font size `0.65rem` (10.4px), height `1.2rem`, padding `0 0.4rem`.
  * `lg`: font size `0.95rem` (15px), height `1.5rem`, padding `0 0.5rem`.
  * `xl`: font size `1.5rem` (24px), height `2.4rem`, padding `0.2rem 0.8rem`.
* **Severities (Tinted Pill Pattern):**
  * `primary`: Background `--color-primary-bg`, text `--color-primary-text`.
  * `secondary`: Background `--text-tertiary`, text `--text-inverse`.
  * `success`: Background `--color-success-bg`, text `--color-success-text`.
  * `danger`: Background `--color-danger-bg`, text `--color-danger-text`.
  * `warning`: Background `--color-warning-bg`, text `--color-warning-text`.
  * `info`: Background `--color-info-bg`, text `--color-info-text`.

---

### 6.4 Data Tables (`Table.jsx`)
* **Outer Container (`.table-filter-content`):** `border: 1px solid var(--border-light); border-radius: 25px; overflow: auto;`.
* **Table Element:** `border-collapse: collapse; width: 100%;`.
* **Header Cells (`th`):** `background-color: var(--surface-1); color: var(--text-primary); font-weight: 600; font-size: 14px; padding: 10px 8px 12px 8px; border: 1px solid var(--border-light);`.
* **Body Cells (`td`):** `font-size: 14px; font-weight: 500; height: 40px; min-height: 40px; padding: 5px 8px; border: 1px solid var(--border-light);`.
* **Row Hover:** `tr:hover { background-color: var(--surface-1); }`.
* **Row Status Variants:**
  * `.danger-row`: Background `--color-danger-bg`, text `--color-danger-text`, hover `--color-danger-bg-hover`.
  * `.warning-row`: Background `--color-warning-bg`, text `--color-warning-text`, hover `--color-warning-bg-hover`.
  * `.info-row`: Background `--color-info-bg`, text `--color-info-text`, hover `--color-info-bg-hover`.
  * `.success-row`: Background `--color-success-bg`, text `--color-success-text`, hover `--color-success-bg-hover`.
* **Bulk Actions Bar (`.bulk-actions`):** Floating pill toolbar (`border-radius: 25px; background: var(--surface); box-shadow: 0 2px 5px var(--shadow-sm); border: 1px solid var(--border-default); padding: 2px 25px; min-height: 45px;`).

---

### 6.5 Modals & Overlays (`Modal.jsx`, `Dialog.jsx`, `Toaster.jsx`)

#### Modal Window (`Modal.jsx`)
* **Backdrop:** Fixed full screen, `z-index: 80`, `background-color: var(--overlay-dark)`, `backdrop-filter: blur(3px)`.
* **Container (`.modal-border`):** `width: 500px; max-width: 100%; border-radius: 35px; background-color: var(--surface); box-shadow: 0 2px 5px var(--shadow-lg); padding-bottom: 20px;`.
* **Entrance Animation:** Slides up from `translateY(100vh)` to `translateY(0)` in 0.3s ease.
* **Mobile Transformation (<= 560px):** Transforms into bottom sheet (`border-radius: 0; border-top-left-radius: 35px; border-top-right-radius: 35px; align-items: flex-end; padding-bottom: 60px;`).

#### Confirmation Dialog (`Dialog.jsx`)
* **Selector:** `.ui-dialog`
* **Container:** Width `400px`, `border-radius: 15px`, `background: var(--surface)`, `box-shadow: 0 2px 5px var(--shadow-lg)`, `padding: 15px`.
* **Icon:** `font-size: 25px` (Defaults to `<TbInfoCircle />`).
* **Action Buttons:** Small rounded buttons (`Button rounded size='small'`). Confirm button is solid primary; cancel button is outlined secondary.

#### Toast Notifications (`Toast.jsx`, `Toaster.jsx`)
* **Toaster Container:** Fixed top-right (`top: 15px; right: 15px; width: 350px; z-index: 100; display: flex; flex-direction: column; gap: 8px;`). Full-width on mobile (<= 500px).
* **Toast Item:** `border-radius: 8px; padding: 15px 13px 15px 18px; box-shadow: 0 2px 4px var(--shadow-sm);`.
* **Accent Line:** Absolute left vertical indicator strip (`width: 5px; height: 100%; border-top-left-radius: 8px; border-bottom-left-radius: 8px; background-color: var(--toast-line);`).
* **Motion:** Enters with `slideIn` (translateX 100% to 0 in 0.3s ease-out), exits with `slideOut` (translateX 0 to 100% in 0.3s ease-in).

---

### 6.6 Navigation Tabs (`slide-menus`)
* **Container (`.menu-box`):** Sticky top (`position: sticky; top: 0px; z-index: 1; background-color: var(--background);`).
* **Track (`.slide-menus`):** Horizontal scroller with pill background (`background-color: var(--surface-1); border-radius: 100px; padding: 5px; display: flex; gap: 10px;`).
* **Tab Items (`.menu-item`):** Full pill (`border-radius: 100px; padding: 10px 15px; font-size: 14px; min-width: fit-content;`).
* **Active Tab:** `background-color: var(--surface-inverse); color: var(--surface); font-weight: 500;`. In light mode, active tab is dark slate/black with white text; in dark mode, it is white with black text.
* **Hover Tab:** `background-color: var(--surface-2);`.

---

### 6.7 Loading & Skeleton States (`SkeletonPage.jsx`, `SkeletonGrid.jsx`)
* **Page-Level Skeleton (`SkeletonPage.jsx`):** Centered minimalist brand loader with animated pulse line (`.loader-line`, width 100px, height 3px, border-radius 20px, animated via `@keyframes lineAnim`).
* **Card & Content Skeleton (`SkeletonGrid.jsx`):** Shimmer boxes utilizing a moving linear gradient:
  ```css
  background: linear-gradient(90deg, var(--surface-1) 25%, var(--surface-2) 50%, var(--surface-1) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 10px;
  ```

---

### 6.8 Empty & Error States (`EmptyState.jsx`, `ErrorState.jsx`)
* **Container (`.ui-state-component`):** Centered flex layout with icon, heading, descriptive paragraph, and optional action buttons.
* **Sizes:**
  * `sm`: Icon `40px`, Title `17px`, Description `13px`.
  * `md`: Icon `45px`, Title `19px`, Description `14px`.
  * `lg`: Icon `50px`, Title `21px`, Description `16px`.
* **Error State Accent:** Icon color is set to `var(--color-danger)`.

---

## 7. Form UX & Layout Standards

1. **Input Heights & Sizing:**
   * Standard inputs do not use fixed pixel heights; height is dictated by vertical padding and floating label offset:
     * Small: Input padding `16px 12px 6px 12px`, font size `14px`.
     * Medium (Default): Input padding `20px 15px 8px 15px`, font size `15px`.
     * Large: Input padding `24px 18px 10px 18px`, font size `16px`.
2. **Form Field Layout:**
   * Forms typically render in vertical flex stacks with `gap: 15px` or `gap: 20px`.
   * Multi-column form groups use CSS Grid: `grid-template-columns: 1fr 1fr; gap: 15px;` (collapsing to `1fr` at <= 500px).
3. **Helper & Error Messages:**
   * Always placed directly beneath the input container with `margin-top: 2px; margin-left: 8px; font-size: 12px;`.
   * Normal text uses `var(--text-placeholder)`; error messages transition to `var(--color-danger-text)`.
4. **Action Button Alignment:**
   * Modal and page form submit buttons are placed at the bottom-right for desktop dialogs (`justify-content: flex-end; gap: 10px;`).
   * Mobile field forms place submit buttons as full-width blocks (`width: 100%;`) pinned at the footer.

---

## 8. Cards, Panels, and Data Display

### 8.1 Metric Count Cards (`.count-card`)
* **Surface:** `background-color: var(--surface-1); border-radius: 10px; padding: 20px 15px 15px 15px;`.
* **Typography:**
  * Metric Value (`h2`): `35px`, weight 600, `margin-top: 9px`.
  * Metric Label (`h4`): `14px`, weight 500, color `var(--text-secondary-alt)`.
  * Micro Note (`p`): `12px`, weight 500, color `var(--text-disabled)`.

### 8.2 Service Cards (`ServiceCard.jsx`)
* **Surface:** `background-color: var(--surface-3); border-radius: 15px; overflow: hidden;`.
* **Header Graphic:** Features an organic SVG wave path (`d="M0,0 L700,0 L700,70 C600,70 500,75 400,90 C300,105 200,155 0,130 Z"`) filled with a dynamic SVG linear gradient originating from the item's brand/category color and fading into black.
* **Header Text:** Uses brightness luminance calculation (`getContrastText()`) to guarantee high-contrast text against any arbitrary category hex code.
* **Footer Strip:** Enclosed pill container (`border-radius: 50px; padding: 5px;`) with tinted background and border.

### 8.3 Key-Value Record Grids (`.reg-content .list`)
* **Layout:** Grid structure with `grid-template-columns: 1fr 1fr 1fr; gap: 10px;`.
* **Item Card:** `background-color: var(--surface-2); padding: 10px 15px; border-radius: 10px;`.
  * Label: `font-size: 13px; color: var(--text-tertiary);`.
  * Value: `font-size: 14px; font-weight: 500; color: var(--text-primary); margin-top: 5px;`.
  * Spanning Item (`.span-item`): `grid-column: span 2;`.

---

## 9. Animation and Motion Philosophy

Motion across the system is snappy, purposeful, and lightweight. It provides spatial awareness without delaying user interaction.

| Animation Name | Duration | Timing Function | Keyframe Behavior | Applied Context |
|---|---|---|---|---|
| `slideIn` | 0.3s | `ease-out` | `from { transform: translateX(100%); } to { transform: translateX(0); }` | Toast entry |
| `slideOut` | 0.3s | `ease-in` | `from { transform: translateX(0); } to { transform: translateX(100%); }` | Toast dismissal |
| `shimmer` | 1.5s | `infinite linear` | `background-position: -200% 0` to `200% 0` | Skeleton placeholders |
| `lineAnim` | 1.0s | `infinite linear` | Pulsing line traveling left-to-right | Full-screen loading line |
| `iconLoading` | 1.5s | `infinite linear` | `rotate(0deg)` to `rotate(360deg)` | Button loading spinners |
| Modal Reveal | 0.3s | `ease` | `transform: translateY(100vh)` to `translateY(0)` | Modal window entrance |
| Sidebar Drawer | 0.3s | `ease-in-out` | `left: -230px` to `left: 0` | Mobile/tablet sidebar |
| Button Tap Scale | 0.15s | `ease` | `transform: scale(0.95)` | Quick action icon press |

---

## 10. Feedback, Audio, and Haptic Systems

For high-consequence operations (e.g. initiating travel, completing a work order, processing a payment), the UI provides synchronized multi-sensory feedback:

1. **Audio Sound Chime:**
   * File: `src/assets/audio/success-effect.mp3`
   * Service: `playSuccessAudio()` in `success_audio_services.js`
   * Trigger: Fired upon successful API transactions and completed workflows.
2. **Tactile Haptic Vibration:**
   * Pattern: Dual vibration pulses with trailing confirmation (`const vibrateWave = [80, 15, 80, 15, 40]`).
   * API: `navigator.vibrate?.(vibrateWave)`.
   * Trigger: Executed alongside success audio on supported mobile touch browsers.

---

## 11. Iconography System

* **Primary Icon Library:** Tabler Icons (`react-icons/tb`). Tabler Icons provide a clean, rounded, 2px stroke aesthetic that perfectly complements the `ConfigRounded` typeface and rounded corners.
* **Supplementary Libraries:**
  * Grommet (`react-icons/gr`): Used for system controls (`GrClose`).
  * FontAwesome 6 (`react-icons/fa6`): Used for solid status confirmations (`FaRegCircleCheck`, `FaRegCircleXmark`).
  * Ionicons 5 (`react-icons/io5`): Used for directional chevrons (`IoChevronBack`).
* **Sizing Rules:**
  * Small inline buttons: `16px`.
  * Standard inputs / buttons / dropdowns: `20px`.
  * Navigation sidebar items: `23px`.
  * Notifications / Dialogs: `24px – 25px`.
  * Mobile bottom bar items: `28px`.
  * Empty & Error state illustrations: `40px – 50px`.

---

## 12. Visual Assets & Image Treatment

* **Brand Logo:** `alliance-logo.png` rendered inside circular borders (`width: 40px; height: 40px; border-radius: 100%; border: 1px solid var(--border-light); overflow: hidden;`).
* **User Profile Avatars:** Dynamically selected from letter-based asset sets (`src/assets/images/profile-tamp/{letter}.png`) based on the user's initial, with fallback to `common.png`. Always styled in full circles (`border-radius: 100%`).
* **Spot Illustrations:** WebP vector/flat illustrations (`running-scooter.webp`, `service-worker.webp`) used inside bottom-sheet modals to explain complex workflow steps.

---

## 13. Reusable Page Patterns

### Pattern A: Standard Management Index Page
```text
Page Container (padding-top: 20px; padding-bottom: 40px;)
 ├── Action Toolbar (flex; justify-content: flex-end; gap: 10px;)
 │    ├── Primary Action Button (e.g. + Add Product, rounded, small)
 │    └── Filter Button (outlined, secondary, rounded, small)
 │
 └── Main Content Region
      └── TanStack Table Card (.ui-tanstack-table-div)
           ├── Table Filter Top (Search Input + Action Slots)
           ├── Bulk Actions Bar (Conditional Floating Pill Toolbar)
           ├── Table Core (.table-filter-content, border-radius: 25px)
           └── Table Pagination Bottom (Page Size Select + Prev/Next Buttons)
```

### Pattern B: Record Detail View with Sticky Pill Tabs
```text
Detail View Container (margin-bottom: 40px;)
 ├── Top Section (Title + Status Badges + Action Buttons)
 ├── Sticky Pill Navigation Bar (.menu-box -> .slide-menus)
 │    ├── [Tab 1: Overview] (Active: surface-inverse pill)
 │    ├── [Tab 2: History]
 │    └── [Tab 3: Spares / Eligibility]
 └── Tab Body Content
      ├── Subtitle Medium (@include subTitleMedium)
      └── Key-Value Info Grid (.reg-content .list, 3 columns -> 2 cols -> 1 col)
```

### Pattern C: Mobile Dashboard Stream
```text
Tech Home Container (margin-top: 20px; max-width: 500px;)
 ├── Hero Work Overview Card (Progress bars, count badges)
 ├── Horizontal Quick Actions Scroller (Circular icon buttons, snap-scroll)
 ├── Metric Report Cards (Recharts weekly area performance)
 └── Legal Footer (Copyright, links with dot separators)
```

---

## 14. Accessibility Standards

1. **Interactive Tap Targets:** On mobile layouts, navigation items, dropdown items, and quick action buttons enforce minimum touch dimensions of `44px` to `56px`.
2. **Dynamic Text Contrast:** All colored badges and card headers utilize luminance evaluation formulas (`getContrastText()`) to calculate whether text should render as `#000000` or `#FFFFFF` over dynamic background colors.
3. **Focus State Indication:** Interactive inputs and buttons specify explicit focus rings (`border-color: var(--color-primary-border); outline: none;`).
4. **Semantic Color Pairing:** Status messages and table rows combine colored backgrounds with bold text, explicit icons, and text descriptions so information is not conveyed by color alone.
5. **Reduced Motion Compatibility:** Critical animations (modal appearance, toasts) use short, non-disorienting durations (<= 0.3s) that do not interfere with screen reading.

---

## 15. AI Implementation Guidelines

When generating new code, components, or screens for this ecosystem, an AI coding agent **must** follow these strict rules:

1. **Do NOT hardcode HEX color values in CSS/SCSS.** Always use CSS Custom Properties (`var(--background)`, `var(--surface-1)`, `var(--text-primary)`, `var(--color-primary)`, `var(--border-light)`).
2. **Follow the established border radius conventions:**
   * Use `8px` for regular buttons, toasts, and alerts.
   * Use `10px` for form inputs, textareas, dropdown items, and stat cards.
   * Use `15px` for confirmation dialogs and standard content cards.
   * Use `25px` for table containers and bulk action bars.
   * Use `35px` for modals (bottom sheet top corners on mobile).
   * Use `50px` or `100px` for badges, rounded buttons, and tab pills.
   * Never introduce arbitrary radii like `3px`, `13px`, or `19px`.
3. **Use the Handcrafted UI Primitives:** Import and use `Button`, `InputText`, `Select`, `MultiSelect`, `Badge`, `Message`, `Table`, `Modal`, and `Dialog` from `src/components/UI_Primitives/`. Do not install or import third-party component libraries (e.g. MUI, Ant Design, Chakra).
4. **Implement Floating Labels on Form Inputs:** When building form fields, utilize the container structure established by `InputText.jsx` with an associated active label state.
5. **Handle Three Fundamental UI States Everywhere:**
   * **Loading State:** Render `SkeletonGrid` with matching dimensions.
   * **Error State:** Render `ErrorState` with `<TbExclamationCircle />` and an actionable retry button.
   * **Empty State:** Render `EmptyState` with an icon, title, and clear action button.
6. **Adhere to the Dual Layout Strategy:**
   * If creating a back-office/management view, mount it inside `ControllerLayout`.
   * If creating a field/technician view, mount it inside `TechLayout` with a max-width of `500px`.
7. **Use Tabler Icons (`react-icons/tb`) by Default:** When adding iconography, default to `react-icons/tb` to maintain a consistent line weight and visual style.
8. **Enforce Responsive Breakdown:**
   * 4-column metric grids must collapse to 2 columns at `1000px` and 1 column at `500px`.
   * Tables must provide horizontal scroll on mobile with stacked filter/pagination controls below `600px`.
9. **Dispatch Global Overlays via Redux:** Trigger modals, toasts, and dialogs by dispatching actions from `miniSystemSlice` (`toast.push`, `modal.push`, `doDialog.confirm`) instead of mounting bespoke local backdrop portals.
10. **Preserve Font Consistency:** Typography must consistently resolve to `'ConfigRounded', 'Montserrat', sans-serif`.

---

## 16. Do's and Don'ts

### Do's
* **DO** use the pill-style tab scroller (`.slide-menus` with `var(--surface-inverse)` active tab) for section switching.
* **DO** tint table rows using the established semantic classes (`.danger-row`, `.warning-row`, `.success-row`, `.info-row`).
* **DO** use rounded buttons (`rounded={true}`) for dialog actions, table filter toggles, and primary call-to-actions.
* **DO** pair icons with text in navigation items and action buttons.
* **DO** check contrast luminance when displaying text over dynamic user-configured colors.
* **DO** apply custom scrollbars via `@include scrollBar()` on scrollable containers.

### Don'ts
* **DON'T** use sharp, unrounded container corners (`border-radius: 0`) except for grouped inner button edges.
* **DON'T** use raw browser `alert()` or `confirm()` dialogs; use Redux `doDialog.alert()` and `doDialog.confirm()`.
* **DON'T** apply high-saturation background fills to status alert banners; use tinted backgrounds with saturated text.
* **DON'T** place desktop fixed sidebars on mobile screens without the collapse drawer mechanism.
* **DON'T** use arbitrary, unstandardized font weights; stick to `400`, `500`, `600`, and `700`.
* **DON'T** introduce heavy drop-shadows; keep elevation to subtle, tinted box-shadows (`var(--shadow-sm)` and `var(--shadow-lg)`).

---

## 17. Master Design Token Quick Reference

### Colors & Surfaces
```scss
// Backgrounds
--background:          #FFFFFF (Light) | #1D1D1D (Dark)
--background-alt:      #FBFBFB (Light) | #2B2B2B (Dark)

// Surfaces
--surface:             #F7F7F7 (Light) | #2B2B2B (Dark)
--surface-1:           #EBEBEB (Light) | #363636 (Dark)
--surface-2:           #E0E0E0 (Light) | #424242 (Dark)
--surface-3:           #CFCFCF (Light) | #4C4C4C (Dark)
--surface-inverse:     #1D1D1D (Light) | #FFFFFF (Dark)

// Text
--text-primary:        #2B2B2B (Light) | #FFFFFF (Dark)
--text-secondary:      #565656 (Light) | #C0C0C0 (Dark)
--text-tertiary:       #808080 (Light) | #8B8B8B (Dark)
--text-muted:          #8B8B8B (Light) | #808080 (Dark)
--text-disabled:       #A3A3A3 (Light) | #6A6A6A (Dark)
--text-placeholder:    #838383 (Light) | #747474 (Dark)
--text-inverse:        #FFFFFF (Light) | #000000 (Dark)

// Borders
--border-light:        #CFCFCF (Light) | #4C4C4C (Dark)
--border-default:      #C0C0C0 (Light) | #565656 (Dark)
--border-medium:       #A3A3A3 (Light) | #606060 (Dark)
--border-dark:         #8B8B8B (Light) | #6A6A6A (Dark)

// Semantic Core
--color-primary:       #0066FF (Light) | #009CFF (Dark)
--color-primary-bg:    #E5F0FF (Light) | #0042A6 (Dark)
--color-primary-text:  #005ACD (Light) | #009CFF (Dark)

--color-success:       #009A46 (Light) | #009A46 (Dark)
--color-success-bg:    #E0F5E8 (Light) | #004B20 (Dark)
--color-success-text:  #008C3F (Light) | #009A46 (Dark)

--color-danger:        #D30038 (Light) | #D30038 (Dark)
--color-danger-bg:     #FEE0E5 (Light) | #74001B (Dark)
--color-danger-text:   #BF0032 (Light) | #D30038 (Dark)

--color-warning:       #938700 (Light) | #938700 (Dark)
--color-warning-bg:    #FFFEE0 (Light) | #4B3E00 (Dark)
--color-warning-text:  #4B3E00 (Light) | #938700 (Dark)

--color-info:          #0085F2 (Light) | #0085F2 (Dark)
--color-info-bg:       #E0F1FF (Light) | #00388A (Dark)
--color-info-text:     #0050B0 (Light) | #0085F2 (Dark)
```

### Radii & Spacing Quick Reference
```scss
// Radii
$radius-check:         4px;
$radius-button-sm:     6px;
$radius-popover:       7px;
$radius-button:        8px;
$radius-toast:         8px;
$radius-input:         10px;
$radius-card:          10px;
$radius-dialog:        15px;
$radius-table:         25px;
$radius-modal:         35px;
$radius-pill:          50px;
$radius-circle:        100px;

// Layout
$width-sidebar:        220px;
$height-mobile-bar:    55px;
$max-width-desktop:    1600px;
$max-width-mobile:     500px;
$max-width-modal:      500px;
$max-width-dialog:     400px;
```

