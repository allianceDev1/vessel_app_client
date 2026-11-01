# Design System Specification

## 1. System Overview & Architecture

This document serves as the absolute, verified source of truth for the visual design language, UI architecture, design tokens, component library, and interaction patterns of this ecosystem. Any AI coding agent or software engineer can read only this specification and build a completely new frontend application that looks, behaves, and responds identically to the original platform.

### 1.1 Technical Stack
* **Framework:** React 19 (Functional components, Hooks, Suspense, Lazy Loading)
* **Styling Solution:** Dart Sass (`sass` + `sass-loader`) utilizing modular `@use` and `@forward` architectures.
* **Token Delivery:** Sass maps are compiled directly into native CSS Custom Properties (`--color-*`, `--text-*`, `--surface-*`, `--border-*`, `--shadow-*`) on `.light` or `.dark` class selectors on `document.documentElement` (`<html>`).
* **Iconography:** `react-icons` with **Tabler Icons (`react-icons/tb`)** as the primary standard, supplemented by Grommet (`react-icons/gr`), FontAwesome 6 (`react-icons/fa6`), and Ionicons 5 (`react-icons/io5`).
* **Component Architecture:** Pure hand-crafted UI primitives (`src/components/UI_Primitives/`) with no external component framework dependencies (e.g. no MUI, AntD, or Chakra).
* **Data Presentation:** `@tanstack/react-table` embedded within customized container cards.
* **Data Visualization:** `recharts` styled with custom design system tooltips and legends.
* **Overlay Management:** Centralized Redux store slice (`miniSystemSlice`) managing toast queues, modal stacks, confirmation dialogs, and dynamic page titles.

---

## 2. Visual Language & Core Philosophy

The visual language balances clean, modern data density with an approachable, tactile user experience:

1. **Soft-Rounded Modernism:** Sharp 90-degree corners are systematically avoided. A tiered radius scale is strictly enforced:
   * `4px` for small indicators (checkboxes, tags)
   * `6px – 10px` for interactive controls (buttons, inputs, dropdown items)
   * `15px` for cards, dialogs, and dropdown menus
   * `25px` for table containers and floating bulk action bars
   * `35px` for modal dialogs and bottom sheets
   * `50px – 100px` (Pills & Circles) for badges, tab tracks, toggle buttons, and avatar circles
2. **Dual-Persona Layout Shells:**
   * **Desktop Operations Shell (`ControllerLayout`):** Tailored for dense data inspection. Features a persistent 220px sidebar, flexible content region (max-width `1600px`), and off-canvas collapse below 950px.
   * **Mobile Field Shell (`TechLayout`):** Tailored for touch devices. Constrained to `max-width: 500px` centered, featuring a fixed 55px top app bar and a fixed 55px 4-column bottom tab bar.
3. **Ambient Tinted Semantic Hierarchy:** Status messaging (success, danger, warning, info) never uses overwhelming, solid saturated blocks. Instead, it pairs crisp, saturated typography and icons with soft, tinted pastel surfaces (`--color-[status]-bg` and `--color-[status]-text`).
4. **Adaptive Floating Form Labels:** Form fields employ floating labels that animate from a centered placeholder position to a compact upper caption upon focus or value entry.
5. **Multi-Sensory Operational Feedback:** High-consequence actions trigger synchronized visual state changes, acoustic confirmation (`success-effect.mp3`), and mobile tactile haptic pulses (`navigator.vibrate([80, 15, 80, 15, 40])`).
6. **Graceful Viewport Degradation:** Desktop tables stack cleanly, floating modals morph into touch-friendly bottom sheets at 560px, and multi-column grids collapse progressively to single columns.

---

## 3. Design Tokens

### 3.1 Neutral Grayscale Palette
The neutral palette establishes the foundation for text, surfaces, borders, and overlays across both light and dark modes.

| Step | HEX | Light Mode Role | Dark Mode Role |
|---|---|---|---|
| **0** | `#FFFFFF` | True White / Canvas Background / Inverted Text | Surface Inverse / Primary Text |
| **25** | `#FBFBFB` | Alternate Background | — |
| **50** | `#F7F7F7` | Surface Base (Default) | Primary Text Alt |
| **75** | `#EBEBEB` | Surface-1 (Headers / Input backgrounds) | — |
| **100** | `#E0E0E0` | Surface-2 / Surface Disabled / Inverse Text Alt | — |
| **150** | `#CFCFCF` | Surface-3 / Light Border Light | — |
| **200** | `#C0C0C0` | Border Default / Border Disabled | Secondary Text |
| **250** | `#B1B1B1` | Intermediate Gray | — |
| **300** | `#A3A3A3` | Text Disabled / Border Medium | Secondary Text Alt |
| **350** | `#969696` | Intermediate Mid-Gray | — |
| **400** | `#8B8B8B` | Text Muted / Border Dark | Tertiary Text |
| **450** | `#838383` | Text Placeholder | — |
| **500** | `#808080` | Mid-Gray Anchor / Utility Neutral | Text Muted |
| **550** | `#747474` | — | Text Placeholder |
| **600** | `#6A6A6A` | Text Secondary Alt | Border Dark / Text Disabled |
| **650** | `#606060` | — | Border Medium |
| **700** | `#565656` | Text Secondary | Border Default / Border Disabled |
| **750** | `#4C4C4C` | — | Border Light / Surface-3 |
| **800** | `#424242` | Text Primary Alt | Surface-2 / Surface Disabled |
| **850** | `#363636` | — | Surface-1 |
| **900** | `#2B2B2B` | Text Primary | Surface Base / Background Alt / Inverted Text Alt |
| **950** | `#1D1D1D` | Surface Inverse | Background Base |
| **1000** | `#000000` | True Black | Text Inverse |

---

### 3.2 Semantic Color Palettes

#### Primary Scale (Action / Brand Blue)
* **Light Base (500):** `#0066FF`
* **Dark Base (500):** `#009CFF`

| Step | Light Mode HEX | Dark Mode HEX | Semantic Role |
|---|---|---|---|
| **50** | `#E5F0FF` | `#E0F2FF` | Light Background Tint (`--color-primary-bg`) |
| **100** | `#CCE0FF` | `#B3E0FF` | Light Background Hover Tint (`--color-primary-bg-hover`) |
| **200** | `#99C2FF` | `#80CDFF` | Light Accent Subtle |
| **300** | `#66A3FF` | `#4DBBFF` | Light Interactive Accent |
| **400** | `#3385FF` | `#26ACFF` | Light Hover Secondary |
| **500** | `#0066FF` | `#009CFF` | Primary Brand Color (`--color-primary`) |
| **600** | `#005ACD` | `#008DEB` | Primary Hover (`--color-primary-hover`) / Light Text (`--color-primary-text`) |
| **700** | `#004D99` | `#007AD5` | Primary Active / Pressed (`--color-primary-active`) |
| **800** | `#003366` | `#0067BF` | Dark Background Hover Tint (`--color-primary-bg-hover`) |
| **900** | `#001A33` | `#0042A6` | Dark Background Tint (`--color-primary-bg`) |

#### Success Scale (Confirmation Green)
* **Base (500):** `#009A46` (Shared Light & Dark)

| Step | HEX | Light Mode Role | Dark Mode Role |
|---|---|---|---|
| **50** | `#E0F5E8` | Background Tint (`--color-success-bg`) | — |
| **100** | `#B3E6C6` | Background Hover Tint (`--color-success-bg-hover`) | — |
| **500** | `#009A46` | Success Color Base (`--color-success`) | Success Color Base / Text (`--color-success-text`) |
| **600** | `#008C3F` | Hover (`--color-success-hover`) / Text (`--color-success-text`) | Hover (`--color-success-hover`) |
| **700** | `#007936` | Active (`--color-success-active`) | Active (`--color-success-active`) |
| **800** | `#00652D` | — | Background Hover Tint (`--color-success-bg-hover`) |
| **900** | `#004B20` | — | Background Tint (`--color-success-bg`) |

#### Danger Scale (Error / Destructive Red)
* **Base (500):** `#D30038` (Shared Light & Dark)

| Step | HEX | Light Mode Role | Dark Mode Role |
|---|---|---|---|
| **50** | `#FEE0E5` | Background Tint (`--color-danger-bg`) | — |
| **100** | `#FFB3C0` | Background Hover Tint (`--color-danger-bg-hover`) | — |
| **500** | `#D30038` | Danger Color Base (`--color-danger`) | Danger Color Base / Text (`--color-danger-text`) |
| **600** | `#BF0032` | Hover (`--color-danger-hover`) / Text (`--color-danger-text`) | Hover (`--color-danger-hover`) |
| **700** | `#A8002B` | Active (`--color-danger-active`) | Active (`--color-danger-active`) |
| **800** | `#920025` | — | Background Hover Tint (`--color-danger-bg-hover`) |
| **900** | `#74001B` | — | Background Tint (`--color-danger-bg`) |

#### Warning Scale (Attention Ochre / Yellow)
* **Base (500):** `#938700` (Shared Light & Dark)

| Step | HEX | Light Mode Role | Dark Mode Role |
|---|---|---|---|
| **50** | `#FFFEE0` | Background Tint (`--color-warning-bg`) | — |
| **100** | `#FFFCB3` | Background Hover Tint (`--color-warning-bg-hover`) | — |
| **500** | `#938700` | Warning Color Base (`--color-warning`) | Warning Color Base / Text (`--color-warning-text`) |
| **600** | `#867B00` | Hover (`--color-warning-hover`) | Hover (`--color-warning-hover`) |
| **700** | `#746800` | Active (`--color-warning-active`) | Active (`--color-warning-active`) |
| **800** | `#615500` | — | Background Hover Tint (`--color-warning-bg-hover`) |
| **900** | `#4B3E00` | Text High-Contrast (`--color-warning-text`) | Background Tint (`--color-warning-bg`) |

#### Info Scale (Informational Azure)
* **Base (500):** `#0085F2` (Shared Light & Dark)

| Step | HEX | Light Mode Role | Dark Mode Role |
|---|---|---|---|
| **50** | `#E0F1FF` | Background Tint (`--color-info-bg`) | — |
| **100** | `#B3DAFF` | Background Hover Tint (`--color-info-bg-hover`) | — |
| **500** | `#0085F2` | Info Color Base (`--color-info`) | Info Color Base / Text (`--color-info-text`) |
| **600** | `#0079DE` | Hover (`--color-info-hover`) | Hover (`--color-info-hover`) |
| **700** | `#0064C7` | Active (`--color-info-active`) | Active (`--color-info-active`) |
| **800** | `#0050B0` | Text High-Contrast (`--color-info-text`) | Background Hover Tint (`--color-info-bg-hover`) |
| **900** | `#00388A` | — | Background Tint (`--color-info-bg`) |

#### Chart Palette (`chartLabelColors`)
Sequential color series for multi-series area and bar charts:
`["#0087CF", "#00B4D8", "#15C659", "#1F6C96", "#08CBF1", "#1C8845", "#2B9FDE", "#2CC2E0", "#38CC71", "#56B1E2", "#5DD1E9", "#65DF94"]`

---

### 3.3 CSS Custom Property Mapping (Light vs Dark)

| CSS Variable | Light Theme Binding | Dark Theme Binding | Description |
|---|---|---|---|
| `--text-primary` | `#2B2B2B` | `#FFFFFF` | Primary text for titles, headings, values |
| `--text-primary-alt` | `#424242` | `#F7F7F7` | Emphasized alternative text |
| `--text-secondary` | `#565656` | `#C0C0C0` | Subtitles, regular body text |
| `--text-secondary-alt` | `#6A6A6A` | `#A3A3A3` | Secondary labels, section headers |
| `--text-tertiary` | `#808080` | `#8B8B8B` | Metadata, item timestamps, card labels |
| `--text-muted` | `#8B8B8B` | `#808080` | Muted descriptions, placeholder fallbacks |
| `--text-disabled` | `#A3A3A3` | `#6A6A6A` | Disabled control text, copyright |
| `--text-placeholder` | `#838383` | `#747474` | Input helper text, unfocused placeholder |
| `--text-inverse` | `#FFFFFF` | `#000000` | Inverted text on dark/colored surfaces |
| `--text-inverse-alt` | `#E0E0E0` | `#2B2B2B` | Inverted subtitle text |
| `--background` | `#FFFFFF` | `#1D1D1D` | Global page canvas background |
| `--background-alt` | `#FBFBFB` | `#2B2B2B` | Sidebar, header, popover background |
| `--surface` | `#F7F7F7` | `#2B2B2B` | Base surface for cards, modals, dialogs |
| `--surface-1` | `#EBEBEB` | `#363636` | Input fields, table headers, hover items |
| `--surface-2` | `#E0E0E0` | `#424242` | Key-value info card background, report box |
| `--surface-3` | `#CFCFCF` | `#4C4C4C` | Disabled inputs, service cards, scrollbar thumb |
| `--surface-disabled` | `#E0E0E0` | `#424242` | Disabled container surface |
| `--surface-inverse` | `#1D1D1D` | `#FFFFFF` | Active tab pill background, inverse badges |
| `--border-light` | `#CFCFCF` | `#4C4C4C` | Subtle table/input/card borders |
| `--border-default` | `#C0C0C0` | `#565656` | Standard structural borders |
| `--border-medium` | `#A3A3A3` | `#606060` | Input hover borders, strong cards |
| `--border-dark` | `#8B8B8B` | `#6A6A6A` | Form separators, active dividers |
| `--border-disabled` | `#C0C0C0` | `#565656` | Disabled control borders |
| `--border-focus` | `#0066FF` | `#009CFF` | Focused input border ring |
| `--shadow-xs` | `rgba(43,43,43,0.05)` | `rgba(0,0,0,0.10)` | Minimal elevation |
| `--shadow-sm` | `rgba(43,43,43,0.10)` | `rgba(0,0,0,0.20)` | Toast, alert, toolbar elevation |
| `--shadow-md` | `rgba(43,43,43,0.15)` | `rgba(0,0,0,0.30)` | Card elevation |
| `--shadow-lg` | `rgba(43,43,43,0.25)` | `rgba(0,0,0,0.40)` | Modal, dialog, dropdown elevation |
| `--overlay-light` | `rgba(255,255,255,0.8)` | `rgba(255,255,255,0.1)` | Subtle frosted glass overlay |
| `--overlay-dark` | `rgba(0,0,0,0.5)` | `rgba(0,0,0,0.6)` | Modal / dialog backdrop scrim |

---

### 3.4 Typography System

* **Font Family:** `'ConfigRounded', 'Montserrat', sans-serif`
* **Global Text Handling:** `overflow-wrap: anywhere; -webkit-tap-highlight-color: transparent;`

#### Typography Hierarchy Scale

| Scale Role | Font Size | Weight | Line Height | Color Token | Typical Application |
|---|---|---|---|---|---|
| **Display / Hero** | 45px | 700 / 600 | 1.1 | Shifter Gradient / Primary | 404 number, prominent landing graphic |
| **Stat Metric** | 35px | 600 | 1.1 | `--text-primary` | Dashboard count card numbers |
| **Brand Head** | 28px | 600 | 1.2 | `--text-primary` | Sidebar brand title |
| **Page Title (H1)** | 23px – 25px | 700 | 1.25 | `--text-primary` | Main page heading |
| **Section Title (H2)** | 19px – 22px | 600 – 700 | 1.3 | `--text-primary` | Card group titles, report titles, modal titles |
| **Subtitle Medium** | 19px | 500 | 1.3 | `--text-muted` | Medium subtitles (`@include subTitleMedium`) |
| **Subtitle Small** | 17px | 500 | 1.3 | `--text-secondary-alt` | Small subtitles (`@include subTitleSmall`) |
| **Action Title / Profile**| 16px | 500 – 600 | 1.4 | `--text-primary` | Action cards, user profile names, dialog body |
| **Body Regular / Input** | 15px | 500 | 1.4 | `--text-primary` | Default text inputs, dropdown items, body |
| **Table Cell / Header** | 14px | 500 / 600 | 1.4 | `--text-primary` | Table content (500), table header (600) |
| **Caption / Card Meta** | 13px | 400 – 500 | 1.3 | `--text-tertiary` | Tooltips, card metadata, dropdown group titles |
| **Micro Helper / Label** | 12px | 400 – 500 | 1.2 | `--text-placeholder` | Active floating labels, input helpers, copyright |
| **Badge Medium** | 0.65rem (10.4px) | 500 | 1.2rem | `--badge-text` | Standard pill badge text |
| **Badge Small** | 0.50rem (8px) | 500 | 1.0rem | `--badge-text` | Compact status badge text |

---

### 3.5 Spacing Scale

Strict incremental spacing tokens used throughout the interface:

| Token | Pixels | Verified Usage in Codebase |
|---|---|---|
| `$space-2xs` | **2px** | Micro-gap, tooltip vertical padding, input helper top margin |
| `$space-xs` | **4px** | Dropdown divider margin, checkbox border padding |
| `$space-s` | **5px** | Pill tab track padding, badge gap, card inner gap |
| `$space-sm` | **8px** | Small button padding, input bottom padding, toast item gap |
| `$space-m` | **10px** | Default flex gap, medium button padding, standard card padding |
| `$space-md` | **12px** | Quick action scroller gap, large button gap, input horizontal padding |
| `$space-l` | **15px** | Modal body padding, standard input horizontal padding, card content padding |
| `$space-xl` | **20px** | Modal header padding, stat card padding, page vertical separation |
| `$space-2xl`| **25px** | Layout body left margin, bulk action padding |
| `$space-3xl`| **35px** | Modal corner radius, icon dimensions |
| `$space-4xl`| **40px** | Page top/bottom outer margins |
| `$space-5xl`| **50px** | Section margins, mobile bottom bar height |
| `$space-6xl`| **55px** | Mobile top app header height, mobile bottom menu height |
| `$space-7xl`| **100px**| Pill border radius, full-page loader line width |

---

### 3.6 Border Radius Scale

| Radius | Verified Components |
|---|---|
| **4px** | Checkbox custom box (`.checkbox-custom`), Table row checkbox box |
| **6px** | Small button (`.btn-size-small`) |
| **7px** | Multi-select options dropdown list |
| **8px** | Default button, Button group corners, Toast, Inline alert message, Tooltips, Chart tooltip |
| **10px** | Input text container, Textarea, Large button, Dropdown items, Stat cards, Skeleton shimmer boxes |
| **12px** | Scrollbar thumb and track (`@mixin scrollBar`) |
| **15px** | Dialog border container, Dropdown menu, Content cards, Report boxes |
| **20px** | Skeleton loader pulse line |
| **24px** | Carousel container |
| **25px** | Table container border, Floating bulk action toolbar |
| **35px** | Modal dialog container (`.modal-border`), Mobile bottom sheet top corners |
| **50px** | Status badges, Grouped rounded buttons, Navigation sidebar items, Card footer pills |
| **100px / Pill / 50%** | Rounded buttons (`.btn-rounded`), Pill tab tracks and items (`.slide-menus`), Circular avatar images |

---

### 3.7 Shadow & Elevation Hierarchy

| Level | Expression | Application |
|---|---|---|
| **Level 1 (Subtle)** | `0 2px 4px var(--shadow-sm)` | Toast notification alerts, Inline message alerts |
| **Level 2 (Toolbar)** | `0 2px 5px var(--shadow-sm)` | Floating bulk action toolbar |
| **Level 3 (Popovers)** | `0 2px 5px var(--shadow-lg)` | Dropdown menus, Confirmation dialog containers |
| **Level 4 (Modal)** | `0 2px 5px var(--shadow-lg)` | Modal dialog container card |
| **Level 5 (Header)** | `var(--shadow-lg) 0 5px 10px -5px` | Mobile top fixed app header bar |
| **Level 6 (Bottom Bar)**| `var(--shadow-lg) 0 -5px 10px -5px` | Mobile bottom fixed navigation menu bar |

---

### 3.8 Z-Index Layering Scale

| Z-Index | Layer / Component | Description |
|---|---|---|
| **100** | `.toaster` | Global toast notification container |
| **80** | `.ui-modal`, `.ui-dialog` | Modal dialog and confirmation dialog scrims and containers |
| **70** | `.dropdown-menu` | Action dropdown menus and popover lists |
| **50** | `.layout-header`, `.layout-menu` | Mobile top app header bar and mobile bottom navigation bar |
| **40** | `.layout-body` (Mobile) | Mobile content container |
| **10** | `.multiselect-options` | Dropdown option picker for multi-selects |
| **5** | `.layout-navbar`, `.nav-icon-section` | Desktop navigation sidebar and floating toggle icon |
| **1 – 2** | `.menu-box` (Sticky tabs), card overlays | Sticky subheaders, internal gradient backdrops |

---

## 4. Layout Construction System

### 4.1 Desktop Operations Shell (`ControllerLayout`)
* **Purpose:** For back-office, administrative, and data-dense dashboards.
* **Page Width Constraint:** Content container `.body-container` capped at `max-width: 1600px; width: 100%;`.
* **Sidebar Navigation (`.layout-navbar`):**
  * Width: Fixed `220px`, full height (`100vh` / `100dvh`).
  * Layout: Grid structure with 3 row tracks: `50px auto 60px` (Brand Header, Menu Items Scroller, User Profile Footer).
  * Surface: `background-color: var(--background-alt); border-right: 1px solid var(--border-light);`.
  * Menu Items: Pill shape (`border-radius: 50px; padding: 10px 15px; gap: 10px; display: flex; align-items: center; cursor: pointer;`).
  * Hover: `background-color: var(--surface-1);`.
  * Active: `background-color: var(--color-primary-bg); color: var(--color-primary-text); font-weight: 500;`.
  * Destructive Item: `color: var(--color-danger-text); &:hover { background-color: var(--color-danger-bg); }`.
* **Main Content Region (`.layout-body`):**
  * Margin: `margin-left: 220px;`.
  * Padding: `0 3% 0 25px;`.
  * Page Header: Contains page title (`23px`, weight 700) and subtitle note (`15px`, weight 500, color `var(--text-tertiary)`).

---

### 4.2 Mobile Field Shell (`TechLayout`)
* **Purpose:** For field operators on smartphones and narrow touchscreens.
* **Layout Structure:**
  * Width Constraint: Single centered column capped at `max-width: 500px; width: 100%;`.
  * Top App Bar (`.layout-header`): Fixed at top (`top: 0; left: 0; width: 100%; height: 55px; z-index: 50; padding: 0 4%; background-color: var(--background-alt); border-bottom: 1px solid var(--border-light); box-shadow: var(--shadow-lg) 0 5px 10px -5px; display: flex; justify-content: space-between; align-items: center;`).
  * Content Stream (`.layout-body`): `margin-top: 50px; padding-bottom: 50px; position: relative; z-index: 40; > div { padding: 0 15px; }`.
  * Bottom Tab Navigation (`.layout-menu`): Fixed at bottom (`bottom: 0; left: 0; width: 100%; height: 55px; z-index: 50; background-color: var(--background-alt); border-top: 1px solid var(--border-light); box-shadow: var(--shadow-lg) 0 -5px 10px -5px; display: flex; justify-content: center; padding: 5px 15px;`).
  * Bottom Tab Grid: 4-column equal grid (`1fr 1fr 1fr 1fr; gap: 10px; align-items: center;`). Each tab has an icon (`28px`) and 12px caption text (`margin-top: -5px; font-weight: 500;`). Active tab switches to `color: var(--color-primary-text);`.

---

## 5. Responsive Behavior & Breakpoints

| Breakpoint | Target Device | Concrete Architectural Adjustments |
|---|---|---|
| **> 1250px** | Large Desktop | 4-column stat card grids, full wide tables with bulk action toolbars, side-by-side forms. |
| **1000px – 1024px** | Tablet Landscape | Stat cards (`.count-card-list`) collapse from 4 columns to 2 columns (`repeat(2, 1fr)`). Quick action button lists collapse to 2 columns. Key-value grids collapse from 3 columns to 2 columns. Page footers stack vertically. |
| **950px** | Sidebar Collapse | Desktop sidebar (`.layout-navbar`) slides offscreen (`left: -230px; transition: all 0.3s ease-in-out;`). Content margin collapses to `0px; padding: 0 3%;`. Floating round menu trigger button (`.nav-icon-section`, 45px circle, `border-radius: 100%`) displays at fixed top-right (20px, 20px). When open (`.show-navbar`), sidebar returns to `left: 0`. |
| **850px** | Tablet Portrait | Top action headers collapse from horizontal row to vertical column. Tab scrollers scroll horizontally with touch-drag. |
| **600px – 650px** | Phablet / Large Mobile | Table top filter bar collapses from 2 columns to 1 column; search box centers. Pagination bottom bar stacks page row selector and prev/next page buttons. |
| **560px** | Modal Morphing | Centered floating modal window (`.ui-modal`) morphs into a touch bottom sheet: `align-items: flex-end; padding: 0;`. Container corners reset: `border-radius: 0; border-top-left-radius: 35px; border-top-right-radius: 35px; width: 100%; padding-bottom: 60px;`. |
| **500px** | Mobile Smartphone | Stat cards and action cards collapse to 1 single column (`repeat(1, 1fr)`). Toaster stretches to full width (`width: 100%; right: 0; padding: 10px;`). Key-value grids collapse to 1 column. |

---

## 6. Component Design System

### 6.1 Buttons (`Button.jsx`)
* **Selector:** `.ui-button`
* **Base Styles:** `display: inline-flex; align-items: center; justify-content: center; gap: 10px; font-weight: 500; cursor: pointer; text-align: center; border: solid 2px var(--btn-color); background-color: var(--btn-color); color: var(--btn-color-alt); border-radius: 8px;`
* **Variants:**
  * **Solid (Default):** Filled with `--btn-color`, border `--btn-color`, text `--btn-color-alt`.
  * **Outlined (`.outlined`):** Background `transparent`, border `solid 2px var(--btn-color)`, text `var(--btn-color)`. Hover fills border/text to `--btn-color-hover`.
  * **Text (`.text`):** Background `transparent`, border `transparent`, text `var(--btn-color)`. Hover shifts to `--btn-color-hover`.
  * **Rounded (`.btn-rounded`):** `border-radius: 100px;` (Pill button).
* **Sizes:**
  * **Small (`.btn-size-small`):** Font size `0.875rem` (14px), padding `8px`, gap `8px`, border-radius `6px`, icon `16px`.
  * **Medium (`.btn-size-medium`):** Font size `1rem` (15px/16px), padding `10px`, gap `10px`, border-radius `8px`, icon `20px`.
  * **Large (`.btn-size-large`):** Font size `1.125rem` (18px), padding `12px`, gap `12px`, border-radius `10px`, icon `24px`.
* **Severities:**
  * `primary`: `--btn-color: var(--color-primary); --btn-color-hover: var(--color-primary-hover); --btn-color-alt: var(--color-white);`
  * `secondary`: `--btn-color: var(--text-primary); --btn-color-hover: var(--text-primary-alt); --btn-color-alt: var(--text-inverse);`
  * `success`: `--btn-color: var(--color-success); --btn-color-hover: var(--color-success-hover); --btn-color-alt: var(--color-white);`
  * `danger`: `--btn-color: var(--color-danger); --btn-color-hover: var(--color-danger-hover); --btn-color-alt: var(--color-white);`
  * `warning`: `--btn-color: var(--color-warning); --btn-color-hover: var(--color-warning-hover); --btn-color-alt: var(--color-white);`
  * `info`: `--btn-color: var(--color-info); --btn-color-hover: var(--color-info-hover); --btn-color-alt: var(--color-white);`
* **Interaction States:**
  * Hover: Background shifts to `--btn-color-hover`; border shifts to `--btn-color-hover`.
  * Disabled: `opacity: 0.5; cursor: not-allowed;`
  * Loading (`.btn-spin-icon`): Replaces leading or trailing icon with `<TbLoader />` rotating via `@keyframes iconLoading 1.5s linear infinite`.

#### Button Groups (`ButtonGroup.jsx`)
* **Selector:** `.btn-group`
* **Behavior:** Horizontal flex row or vertical column (`.btn-group-vertical`). Interior buttons have `border-radius: 0;` and shared interior borders (`border-right: 0px;`). First child maintains left/top radius; last child maintains right/bottom radius. When `.btn-group-rounded` is added, outer ends use `border-radius: 100px`.

---

### 6.2 Form Inputs

#### Text Input (`InputText.jsx`) & Textarea (`TextArea.jsx`)
* **Container:** `.ui-input-text-container` / `.ui-textarea-container` (Relative positioning, 100% width).
* **Input Box:** `width: 100%; font-weight: 500; outline: none; border: 1px solid var(--border-light); border-radius: 10px; background-color: var(--surface-1); color: var(--text-primary); transition: border-color 0.2s ease-in-out;`
* **Textarea Specifics:** `resize: vertical; min-height: 50px;`
* **Floating Label Mechanics:**
  * Default/Unfocused/Empty: `position: absolute; left: 15px; top: 1px; padding: 13px 0; font-size: 16px; font-weight: 500; color: var(--text-secondary); pointer-events: none; transition: all 0.2s ease-in-out;`
  * Active/Focused/Value Present (`label.active`): `top: -9px; left: 15px; font-size: 12px; font-weight: 400; background: none;`
  * Focus State: `border-color: var(--color-primary-border); label { color: var(--color-primary-text); }`
  * Error State (`.error`): `border-color: var(--color-danger-border); label { color: var(--color-danger-text); }`
  * Required Indicator: `.required { color: var(--color-danger-text); margin-left: 2px; font-size: 18px; position: absolute; }`
* **Helper Text:** `font-size: 12px; margin-top: 2px; margin-left: 8px; color: var(--text-placeholder);` (Transitions to `var(--color-danger-text)` on error).
* **Input Sizes:**
  * **Small:** Padding `16px 12px 6px 12px`, font size `14px`. Label 14px -> active `10px` (top `-7px`, left `12px`).
  * **Medium (Default):** Padding `20px 15px 8px 15px`, font size `15px`. Label 16px -> active `12px` (top `-9px`, left `15px`).
  * **Large:** Padding `24px 18px 10px 18px`, font size `16px`. Label 18px -> active `14px` (top `-11px`, left `16px`).
* **Date Placeholder Concealment (`@mixin hide-date-placeholder`):** Native webkit date edit fields render with `color: transparent !important;` until focused or given a value, preventing broken native placeholders from overlapping the floating label.

#### Select Input (`Select.jsx`)
* Uses native `<select>` element styled identically to `InputText`. Option tags inherit `background-color: var(--background-alt); color: var(--text-primary);`.
* **Dynamic Write Mode:** When an option with value `_input_write_` is selected, the component seamlessly morphs into an `InputText` with a right cancel icon (`<GrClose />`).

#### Multi-Select Input (`MultiSelect.jsx`)
* **Selector:** `.ui-multiselect-container`
* **Trigger:** Styled box with label and display count summary (e.g. `"Option 1 & 2 items selected"`). Height 48px, radius 10px, background `--surface-1`.
* **Popover Options List:** `position: absolute; top: 100%; border: 1px solid var(--border-light); border-radius: 7px; background-color: var(--background-alt); max-height: 200px; overflow-y: auto; z-index: 10; margin-top: 4px;`
* **Embedded Search:** Embedded small `InputText` at top of popover filtering options in real-time.
* **Option Items:** Checked with native `Checkbox` component; hover background `--surface-1`.

#### Phone Number Input (`InputPhoneNumber.jsx`)
* **Integration:** Wraps `react-phone-input-2` within the design system container.
* **Control:** Input padding `28px 15px 18px 70px; border-radius: 10px; border: 1px solid var(--border-light); background-color: var(--surface-1); color: var(--text-primary);`
* **Flag Dropdown:** `width: 55px; border-radius: 10px 0 0 10px; background-color: var(--surface-1); border: 1px solid var(--border-light);`
* **Floating Label:** Offset to `left: 70px;` so it floats gracefully above the phone input without colliding with the country flag picker.

#### Color Picker Input (`InputColor.jsx`)
* **Container:** `.ui-input-color-container .border-input` (Border 1px solid `--border-light`, radius 10px, background `--surface-1`, padding `0 10px 8px 15px`).
* **Pre-Set Color Circles:** Palette circles (`width: 28px; height: 28px; border-radius: 50%; border: 3px solid transparent; transition: transform 0.2s ease;`).
* **Active Selection:** `input:checked ~ .color-circle { border-color: var(--color-primary-border); transform: scale(1.2); }`.
* **Rainbow Custom Picker Circle:** Multi-color conic gradient (`conic-gradient(red, yellow, lime, cyan, blue, magenta, red)`).

#### Checkbox (`Checkbox.jsx`) & Radio (`Radio.jsx`)
* **Custom Checkbox (`.checkbox-custom`):** `width: 21px; height: 21px; border: 2px solid var(--border-light); border-radius: 4px; background-color: var(--surface-1); display: flex; align-items: center; justify-content: center;`
  * Checked: `border-color: var(--color-primary-text); background-color: var(--color-primary-bg); svg { display: block; color: var(--color-primary-text); font-size: 12px; }`
* **Custom Radio (`.radio-custom`):** `width: 21px; height: 21px; border: 2px solid var(--border-light); border-radius: 50%; background-color: var(--surface-1); display: flex; align-items: center; justify-content: center;`
  * Checked: `border-color: var(--color-primary-text); background-color: var(--color-primary-bg); svg { display: block; color: var(--color-primary-text); font-size: 12px; }`
* **Sizes Available:** Small (16px, 1px border), Medium (21px, 2px border), Large (25px, 2px border).

---

### 6.3 Badges (`Badge.jsx`)
* **Selector:** `.ui-badge`
* **Appearance:** Pill-shaped status tag (`border-radius: 50px; display: inline-block; font-weight: 500; text-align: center;`).
* **Sizes:**
  * `sm`: font size `0.50rem` (8px), height `1.0rem`, padding `0 0.3rem`.
  * `md`: font size `0.65rem` (10.4px), height `1.2rem`, padding `0 0.4rem`.
  * `lg`: font size `0.95rem` (15px), height `1.5rem`, padding `0 0.5rem`.
  * `xl`: font size `1.5rem` (24px), height `2.4rem`, padding `0.2rem 0.8rem`.
* **Severities:**
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
* **Header Cells (`th`):** `background-color: var(--surface-1); color: var(--text-primary); font-weight: 600; font-size: 14px; padding: 10px 8px 12px; border: 1px solid var(--border-light); text-align: center;`.
* **Body Cells (`td`):** `font-size: 14px; font-weight: 500; height: 40px; min-height: 40px; padding: 5px 8px; border: 1px solid var(--border-light);`.
* **Row Hover:** `tr:hover { background-color: var(--surface-1); }`.
* **Status Row Highlights:**
  * `.danger-row`: Background `--color-danger-bg`, text `--color-danger-text`, hover `--color-danger-bg-hover`.
  * `.warning-row`: Background `--color-warning-bg`, text `--color-warning-text`, hover `--color-warning-bg-hover`.
  * `.info-row`: Background `--color-info-bg`, text `--color-info-text`, hover `--color-info-bg-hover`.
  * `.success-row`: Background `--color-success-bg`, text `--color-success-text`, hover `--color-success-bg-hover`.
* **Selection Column (`.RowCheckBox`):** Fixed width `50px; text-align: center;`. Custom checkbox uses `✔` content checkmark.
* **Bulk Actions Floating Bar (`.bulk-actions`):** Floating pill toolbar (`border-radius: 25px; background: var(--surface); box-shadow: 0 2px 5px var(--shadow-sm); border: 1px solid var(--border-default); padding: 2px 25px; min-height: 45px; display: flex; align-items: center;`). Left section displays selection count with right border divider; right section holds action buttons.

---

### 6.5 Modals, Dialogs, and Overlays

#### Modal Window (`Modal.jsx`)
* **Backdrop:** Fixed full viewport, `z-index: 80; background-color: var(--overlay-dark); backdrop-filter: blur(3px); display: flex; justify-content: center; align-items: center; padding: 15px;`.
* **Container Card (`.modal-border`):** `width: 500px; max-width: 100%; border-radius: 35px; background-color: var(--surface); box-shadow: 0 2px 5px var(--shadow-lg); padding-bottom: 20px;`.
* **Entrance Animation:** Slides smoothly from `translateY(100vh)` to `translateY(0)` in 0.3s ease.
* **Body Scroller:** `max-height: calc(100vh - 150px); overflow: auto; @include scrollBar();`.
* **Close Protection (`freezeClose`):** When active, prevents backdrop clicks and removes the close button.
* **Mobile Transformation (<= 560px):** Automatically transforms into a bottom sheet (`align-items: flex-end; padding: 0; .modal-border { border-radius: 0; border-top-left-radius: 35px; border-top-right-radius: 35px; width: 100%; padding-bottom: 60px; }`).

#### Confirmation Dialog (`Dialog.jsx`)
* **Selector:** `.ui-dialog`
* **Card Container:** Width `400px; max-width: 100%; border-radius: 15px; background: var(--surface); box-shadow: 0 2px 5px var(--shadow-lg); padding: 15px;`.
* **Icon:** Large indicator icon (`font-size: 25px; min-width: fit-content;`). Defaults to `<TbInfoCircle />`.
* **Action Buttons:** Small rounded buttons (`Button rounded size='small'`). Accept is solid primary; reject is outlined secondary.

#### Toast Notifications (`Toast.jsx`, `Toaster.jsx`)
* **Toaster Container:** Fixed top-right (`top: 15px; right: 15px; width: 350px; z-index: 100; display: flex; flex-direction: column; gap: 8px;`). Stretches to `width: 100%; right: 0; padding: 10px;` on mobile <= 500px.
* **Toast Item:** `border-radius: 8px; padding: 15px 13px 15px 18px; box-shadow: 0 2px 4px var(--shadow-sm); overflow: hidden; position: relative;`.
* **Accent Left Line:** Absolute vertical strip (`width: 5px; height: 100%; border-top-left-radius: 8px; border-bottom-left-radius: 8px; background-color: var(--toast-line);`).
* **Severities:**
  * `danger`: Background `--color-danger-bg`, text `--color-danger-text`, line `--color-danger`.
  * `success`: Background `--color-success-bg`, text `--color-success-text`, line `--color-success`.
  * `info`: Background `--color-info-bg`, text `--color-info-text`, line `--color-info`.
  * `warning`: Background `--color-warning-bg`, text `--color-warning-text`, line `--color-warning`.
* **Animations:** Enters via `slideIn` (translateX 100% to 0 in 0.3s ease-out); exits via `slideOut` (translateX 0 to 100% in 0.3s ease-in).

#### Inline Alert / Message Banner (`Message.jsx`)
* **Selector:** `.alert-message`
* **Base Styles:** `border-radius: 8px; padding: 15px 13px 15px 18px; box-shadow: 0 2px 4px var(--shadow-sm); display: flex; gap: 10px;`.
* **Content:** Icon (24px) paired with title (`h4`, 15px, weight 600) and message (`span`, 14px).

---

### 6.6 Dropdown Menus (`Dropdown.jsx`)
* **Selector:** `.dropdown-menu`
* **Menu Card:** `position: absolute; min-width: 220px; max-height: 300px; padding: 8px; border-radius: 15px; background-color: var(--background-alt); box-shadow: 0 2px 5px var(--shadow-lg); z-index: 70; overflow-y: auto; @include scrollBar();`.
* **Dropdown Items:** `padding: 11px 12px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; font-size: 15px; font-weight: 500; transition: background 0.2s ease;`.
* **Selected Indicator Bar (`.selected-icon`):** Absolute left vertical bar (`width: 4px; height: 80%; background-color: var(--color-primary); border-radius: 0 10px 10px 0; left: -8px; top: 50%; transform: translate(0, -50%);`).
* **Variants:** `.info` (text `--color-info-text`, hover `--color-info-bg`), `.danger` (text `--color-danger-text`, hover `--color-danger-bg`), `.disabled` (opacity 0.3, pointer-events none).
* **Dividers & Headings:** Dividers are 1px solid `--border-default` with `margin: 4px 0;`. Headings are 13px, weight 400, color `--text-tertiary`.

---

### 6.7 Navigation Tabs (`slide-menus`)
* **Container (`.menu-box`):** Sticky at top (`position: sticky; top: 0px; z-index: 1; background-color: var(--background);`).
* **Pill Track (`.slide-menus`):** Horizontal flex track (`background-color: var(--surface-1); border-radius: 100px; padding: 5px; display: flex; gap: 10px; overflow-y: auto; @include scrollBar();`).
* **Tab Items (`.menu-item`):** Pill-shaped button (`border-radius: 100px; padding: 10px 15px; font-size: 14px; min-width: fit-content; cursor: pointer; display: flex; align-items: center; gap: 5px;`).
* **Active Tab:** `background-color: var(--surface-inverse); color: var(--surface); font-weight: 500;`. In light mode, this yields an inverted solid dark pill; in dark mode, an inverted solid white pill.
* **Hover Tab:** `background-color: var(--surface-2);`.

---

### 6.8 Carousel Component (`Carousel.jsx`)
* **Container (`.carousel__container`):** `overflow: hidden; border-radius: 24px; position: relative;`.
* **Track (`.carousel__track`):** `display: flex; transition: transform 300ms ease-in-out;`.
* **Floating Arrow Controls:** Circular action buttons (`width: 30px; height: 30px; border-radius: 50%; background-color: var(--surface-1); cursor: pointer;`).
* **Dot Indicators:** Circular indicator dots (`width: 8px; height: 8px; border-radius: 50%; background-color: var(--surface-3); border: none; cursor: pointer;`). Active dot changes to `background-color: var(--color-primary);`.

---

## 7. State Representation & Handling

Every page, data view, and interactive component must explicitly handle the standard state triad:

```text
               ┌──────────────────────────────┐
               │    Data / Component State    │
               └──────────────┬───────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  Loading State   │ │   Empty State    │ │   Error State    │
│  (SkeletonGrid)  │ │   (EmptyState)   │ │   (ErrorState)   │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

### 7.1 Loading States
1. **Content Shimmer Skeletons (`SkeletonGrid.jsx`):**
   * Background gradient:
     ```css
     background: linear-gradient(90deg, var(--surface-1) 25%, var(--surface-2) 50%, var(--surface-1) 75%);
     background-size: 200% 100%;
     animation: shimmer 1.5s infinite;
     border-radius: 10px;
     ```
   * Applied in modular multi-row, multi-column placeholder configurations matching the final rendered grid.
2. **Page-Level Loader (`SkeletonPage.jsx`):**
   * Centered loader line: Width `100px`, height `3px`, border-radius `20px`, background `--surface`.
   * Animated traveling pseudo-element (`&::before`, height 3px, width 40%, background `--surface-2`, animated via `@keyframes lineAnim 1s linear infinite`).

### 7.2 Empty States (`EmptyState.jsx`)
* **Layout:** Centered flex container with icon (`40px – 50px`), heading (`17px – 21px`, weight 600), description paragraph (`13px – 16px`, color `var(--text-secondary)`), and optional action button.
* **Sizes:** `.state-size-sm`, `.state-size-md`, `.state-size-lg`.

### 7.3 Error States (`ErrorState.jsx`)
* **Layout:** Similar to `EmptyState`, but indicator icon color is forced to `color: var(--color-danger);`.
* **Action:** Accompanied by an action button (e.g. "Retry") to re-fetch data.

### 7.4 Interactive Element States
* **Hover:** Light tint shift (surfaces shift to `--surface-1` or `--surface-2`; borders shift to `--border-medium`).
* **Active / Pressed:** Quick scale down (`transform: scale(0.95); transition: transform 0.15s ease;`).
* **Focus:** Explicit border highlight (`border-color: var(--color-primary-border); outline: none;`).
* **Disabled:** `opacity: 0.5; cursor: not-allowed; pointer-events: none;`.

### 7.5 Dynamic Contrast Calculation Formula
To ensure text remains legible on dynamically colored elements (e.g., status cards, user-colored tags), use this verified luminance calculation:
```javascript
export const getContrastText = (hexColor) => {
  if (!hexColor) return '#FFFFFF';
  const cleanHex = hexColor.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155 ? '#000000' : '#FFFFFF';
};
```

---

## 8. Multi-Sensory Feedback & Micro-Interactions

### 8.1 Audio Chime
* **Asset:** `src/assets/audio/success-effect.mp3`
* **Trigger:** Invoked via `playSuccessAudio()` upon completing primary operations (form submissions, status transitions, batch actions).
* **Browser Autoplay Unlock:** Unlocked on the first user interaction via `unlockAudio()`.

### 8.2 Tactile Haptic Vibration
* **Waveform Sequence:** `const vibrateWave = [80, 15, 80, 15, 40];`
* **Trigger:** Fired via `navigator.vibrate?.(vibrateWave)` alongside audio feedback on mobile devices.

### 8.3 Animation Keyframes Reference
```scss
// Toast Slide In
@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

// Toast Slide Out
@keyframes slideOut {
  from { transform: translateX(0); }
  to { transform: translateX(100%); }
}

// Skeleton Shimmer
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

// Full-Page Line Loader
@keyframes lineAnim {
  0% { left: -40%; }
  50% { left: 20%; width: 80%; }
  100% { left: 100%; width: 100%; }
}

// Button Icon Spinner
@keyframes iconLoading {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// Display Title Color Shift
@keyframes colorShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

### 8.4 Custom Scrollbar Mixin (`@mixin scrollBar`)
```scss
@mixin scrollBar($width: 6px, $thumb-color: var(--surface-3), $track-color: transparent, $thumb-hover-color: var(--text-disabled)) {
  &::-webkit-scrollbar {
    width: $width;
    height: $width;
  }
  &::-webkit-scrollbar-track {
    background: $track-color;
    border-radius: 12px;
  }
  &::-webkit-scrollbar-thumb {
    background: $thumb-color;
    border-radius: 12px;
    border: 1px solid transparent;
    background-clip: content-box;
    transition: background 0.3s ease, width 0.3s ease, border-color 0.3s ease;
    &:hover {
      background: $thumb-hover-color;
      width: calc($width + 2px);
      border-color: rgba(0, 0, 0, 0.1);
    }
  }
  &:not(:hover)::-webkit-scrollbar {
    width: calc($width - 2px);
    height: calc($width - 2px);
  }
}
```

---

## 9. Page Design Patterns

### Pattern 1: Operations Management Index Page
```text
Page Container (padding-top: 20px; padding-bottom: 40px;)
 ├── Action Toolbar (display: flex; justify-content: flex-end; gap: 10px;)
 │    ├── Primary Create Button (e.g. + Create Item, size="small", rounded, severity="primary")
 │    └── Filter Toggle Button (size="small", rounded, outlined, severity="secondary")
 │
 └── Main Content Region
      └── TanStack Table Card (.ui-tanstack-table-div)
           ├── Table Filter Top (Search Input on left; actions on right)
           ├── Bulk Actions Bar (Conditional Floating Pill Bar, border-radius: 25px)
           ├── Table Core (.table-filter-content, border-radius: 25px)
           │    └── Table Element (Headers: surface-1; Rows: hover surface-1)
           └── Table Pagination Bottom (Page row count on left; prev/next on right)
```

### Pattern 2: Entity Record Detail View
```text
Detail View Container (margin-bottom: 40px;)
 ├── Top Section (Title + Subtitle + Action Buttons)
 ├── Sticky Pill Tab Navigation (.menu-box -> .slide-menus)
 │    ├── [Overview Tab] (Active: surface-inverse pill)
 │    ├── [Activity History Tab]
 │    └── [Related Items Tab]
 └── Tab Body Content
      ├── Subtitle Medium (@include subTitleMedium)
      └── Key-Value Info Grid (.reg-content .list)
           ├── Standard Field Item (.item, background: surface-2, border-radius: 10px)
           │    ├── Label (13px, color: text-tertiary)
           │    └── Value (14px, weight: 500, color: text-primary)
           └── Spanning Item (.span-item, grid-column: span 2)
```

### Pattern 3: Mobile Field Operations Dashboard
```text
Field Stream Container (margin-top: 20px; max-width: 500px; padding: 0 15px;)
 ├── Work Progress Card (Surface-1, border-radius: 10px, count metrics)
 ├── Horizontal Quick Actions Scroller (.vms-quick-actions__scroller)
 │    └── Action Items (width: 80px; 56px circular icon wrap; 12px label)
 ├── Weekly Metric Chart Card (.vms-performance__card, Area chart, 180px height)
 └── Legal Footer (Centered, 11px text-disabled, bullet-separated links)
```

### Pattern 4: Bottom-Sheet Form Workflow
```text
Modal Scrim (.ui-modal, z-index: 80)
 └── Modal Container (.modal-border, morphs to bottom sheet on screens <= 560px)
      ├── Header (18px H4 title + 30px circular close button)
      ├── Optional Spot Illustration (Centered WebP graphic, e.g. 120px height)
      ├── Explanatory Text (15px H2 heading + 13px description)
      └── Full-Width Action Button (Button rounded, size="medium", severity="primary", width: 100%)
```

---

## 10. AI Implementation Rules

When creating components, views, or styles for a project following this design system, you **must adhere to these 10 invariable rules**:

1. **Zero Hardcoded Colors:** Never write raw hex codes (`#000`, `#FFF`, `#0066FF`) directly in page or component stylesheets. Always reference the corresponding CSS custom properties (`var(--background)`, `var(--surface-1)`, `var(--text-primary)`, `var(--color-primary)`, `var(--border-light)`).
2. **Strict Border Radius Hierarchy:** Match the element type to its assigned radius:
   * Controls / Inputs / Textareas: `10px`
   * Buttons: `8px` (or `100px` when `rounded={true}`)
   * Standard Cards / Dialogs: `15px`
   * Table wrappers / Bulk toolbars: `25px`
   * Modal dialogs: `35px`
   * Badges & Pill Tabs: `50px` or `100px`
   * Never introduce arbitrary values like `3px`, `13px`, or `22px`.
3. **Always Use Established Handcrafted Primitives:** Do not install or import external UI component packages (MUI, Chakra, AntD). Import from `src/components/UI_Primitives/` (`Button`, `InputText`, `Select`, `MultiSelect`, `Badge`, `Message`, `Table`, `Modal`, `Dialog`).
4. **Enforce Floating Label Mechanics:** Never build inputs with static detached labels. Always construct inputs using the container pattern established by `InputText.jsx` with an associated active label state.
5. **Implement the Three Mandatory UI States:** Every view that fetches data must handle:
   * Loading: Render `SkeletonGrid` with matching dimensions.
   * Error: Render `ErrorState` with `<TbExclamationCircle />` and an actionable retry button.
   * Empty: Render `EmptyState` with an icon, description, and call to action.
6. **Honor the Persona Layout Shells:**
   * Desktop operations views must be placed inside `ControllerLayout` (max-width `1600px`).
   * Mobile field views must be placed inside `TechLayout` (max-width `500px`).
7. **Default to Tabler Icons (`react-icons/tb`):** Maintain consistent stroke weights and rounded endpoints across all icons by defaulting to Tabler Icons.
8. **Enforce Responsive Collapse:**
   * 4-column metric grids must collapse to 2 columns at `1000px` and 1 column at `500px`.
   * Floating modals must morph into bottom sheets at `560px`.
   * Tables must provide horizontal scroll with stacked filter bars below `600px`.
9. **Dispatch Global Overlays via Redux:** Do not create ad-hoc modal portals or alert backdrops. Trigger overlays via `miniSystemSlice` (`toast.push`, `modal.push`, `doDialog.alert`, `doDialog.confirm`).
10. **Maintain Typography Consistency:** Always resolve font stacks to `'ConfigRounded', 'Montserrat', sans-serif`. Use font weights `500` for body and labels, `600` for cards and tables, and `700` for page titles.

---

## 11. Do's and Don'ts

### Do's
* **DO** use pill-shaped tab scrollers (`.slide-menus` with `var(--surface-inverse)` active tab) for secondary navigation.
* **DO** tint table rows using semantic classes (`.danger-row`, `.warning-row`, `.success-row`, `.info-row`).
* **DO** use rounded buttons (`rounded={true}`) for dialog actions, filter triggers, and primary CTAs.
* **DO** check contrast with `getContrastText()` whenever displaying text over user-configured background colors.
* **DO** pair icons with text labels across all navigation items and action buttons.
* **DO** apply custom scrollbars via `@include scrollBar()` on scrollable containers.

### Don'ts
* **DON'T** use sharp, unrounded container corners (`border-radius: 0`) except for joined inner button group edges.
* **DON'T** use raw browser `window.alert()` or `window.confirm()`; use Redux `doDialog.alert()` and `doDialog.confirm()`.
* **DON'T** use heavy, opaque saturated fills for alert messages or table rows; always use tinted pastel backgrounds (`--color-*-bg`).
* **DON'T** place desktop fixed sidebars on mobile screens without the off-canvas drawer collapse.
* **DON'T** invent custom font weights; stick to `400`, `500`, `600`, and `700`.
* **DON'T** introduce heavy, dark drop-shadows; keep elevation to subtle tinted shadows (`var(--shadow-sm)` and `var(--shadow-lg)`).

---

## 12. Master Token Quick-Reference Guide

### CSS Variables Reference
```css
/* Core Theme Tokens */
--background:          #FFFFFF (Light) | #1D1D1D (Dark);
--background-alt:      #FBFBFB (Light) | #2B2B2B (Dark);
--surface:             #F7F7F7 (Light) | #2B2B2B (Dark);
--surface-1:           #EBEBEB (Light) | #363636 (Dark);
--surface-2:           #E0E0E0 (Light) | #424242 (Dark);
--surface-3:           #CFCFCF (Light) | #4C4C4C (Dark);
--surface-inverse:     #1D1D1D (Light) | #FFFFFF (Dark);

--text-primary:        #2B2B2B (Light) | #FFFFFF (Dark);
--text-secondary:      #565656 (Light) | #C0C0C0 (Dark);
--text-tertiary:       #808080 (Light) | #8B8B8B (Dark);
--text-muted:          #8B8B8B (Light) | #808080 (Dark);
--text-disabled:       #A3A3A3 (Light) | #6A6A6A (Dark);
--text-placeholder:    #838383 (Light) | #747474 (Dark);
--text-inverse:        #FFFFFF (Light) | #000000 (Dark);

--border-light:        #CFCFCF (Light) | #4C4C4C (Dark);
--border-default:      #C0C0C0 (Light) | #565656 (Dark);
--border-medium:       #A3A3A3 (Light) | #606060 (Dark);
--border-dark:         #8B8B8B (Light) | #6A6A6A (Dark);
--border-focus:        #0066FF (Light) | #009CFF (Dark);

--color-primary:       #0066FF (Light) | #009CFF (Dark);
--color-primary-bg:    #E5F0FF (Light) | #0042A6 (Dark);
--color-primary-text:  #005ACD (Light) | #009CFF (Dark);

--color-success:       #009A46 (Light) | #009A46 (Dark);
--color-success-bg:    #E0F5E8 (Light) | #004B20 (Dark);
--color-success-text:  #008C3F (Light) | #009A46 (Dark);

--color-danger:        #D30038 (Light) | #D30038 (Dark);
--color-danger-bg:     #FEE0E5 (Light) | #74001B (Dark);
--color-danger-text:   #BF0032 (Light) | #D30038 (Dark);

--color-warning:       #938700 (Light) | #938700 (Dark);
--color-warning-bg:    #FFFEE0 (Light) | #4B3E00 (Dark);
--color-warning-text:  #4B3E00 (Light) | #938700 (Dark);

--color-info:          #0085F2 (Light) | #0085F2 (Dark);
--color-info-bg:       #E0F1FF (Light) | #00388A (Dark);
--color-info-text:     #0050B0 (Light) | #0085F2 (Dark);

--shadow-sm:           rgba(43, 43, 43, 0.10) (Light) | rgba(0, 0, 0, 0.20) (Dark);
--shadow-lg:           rgba(43, 43, 43, 0.25) (Light) | rgba(0, 0, 0, 0.40) (Dark);
--overlay-dark:        rgba(0, 0, 0, 0.50)    (Light) | rgba(0, 0, 0, 0.60) (Dark);
```

### Radii & Layout Dimensions Quick Reference
```scss
// Radii
$radius-indicator:     4px;   // Checkboxes, tags
$radius-btn-sm:        6px;   // Small buttons
$radius-popover:       7px;   // Multi-select popovers
$radius-control:       8px;   // Standard buttons, toasts, alerts
$radius-input:         10px;  // Inputs, textareas, stat cards, dropdown items
$radius-card:          15px;  // Content cards, dialogs, dropdown menu cards
$radius-table:         25px;  // Table container card, bulk actions toolbar
$radius-modal:         35px;  // Modal dialog container, bottom sheet top corners
$radius-pill:          50px;  // Badges, sidebar nav items
$radius-circle:        100px; // Rounded buttons, pill tab tracks/items, avatars

// Layout
$width-sidebar:        220px;
$height-mobile-header: 55px;
$height-mobile-menu:   55px;
$max-width-desktop:    1600px;
$max-width-mobile:     500px;
$max-width-modal:      500px;
$max-width-dialog:     400px;
```
