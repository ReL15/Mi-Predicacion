---
name: Serene Ministry
colors:
  surface: '#f7f9ff'
  surface-dim: '#d0dbea'
  surface-bright: '#f7f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#edf4ff'
  surface-container: '#e3effe'
  surface-container-high: '#dee9f8'
  surface-container-highest: '#d8e4f2'
  on-surface: '#111d27'
  on-surface-variant: '#41474e'
  inverse-surface: '#26313d'
  inverse-on-surface: '#e8f2ff'
  outline: '#72787f'
  outline-variant: '#c1c7cf'
  surface-tint: '#2d628d'
  primary: '#00436b'
  on-primary: '#ffffff'
  primary-container: '#245b85'
  on-primary-container: '#a4d2ff'
  inverse-primary: '#9acbfb'
  secondary: '#16648f'
  on-secondary: '#ffffff'
  secondary-container: '#8ecdfe'
  on-secondary-container: '#005881'
  tertiary: '#004b0f'
  on-tertiary: '#ffffff'
  tertiary-container: '#10651d'
  on-tertiary-container: '#8ee088'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cee5ff'
  primary-fixed-dim: '#9acbfb'
  on-primary-fixed: '#001d32'
  on-primary-fixed-variant: '#094a73'
  secondary-fixed: '#cae6ff'
  secondary-fixed-dim: '#8ecdfe'
  on-secondary-fixed: '#001e30'
  on-secondary-fixed-variant: '#004b70'
  tertiary-fixed: '#a3f69c'
  tertiary-fixed-dim: '#88d982'
  on-tertiary-fixed: '#002204'
  on-tertiary-fixed-variant: '#005312'
  background: '#f7f9ff'
  on-background: '#111d27'
  surface-variant: '#d8e4f2'
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
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  stat-display:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.03em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The design system is crafted for a focused, personal activity-tracking mobile experience that conveys discipline, peace of mind, and clarity. It balances functional productivity with a reflective, calm atmosphere, avoiding aggressive notifications or gamified clutter. 

The aesthetic is grounded in **Minimalism** with subtle **Modern Corporate/Native HIG** influences:
- **Tone:** Serene, orderly, dignified, and purposeful.
- **Visual Weight:** Generous negative space, light neutral surfaces, precise 1px hairline structural dividers, and purposeful contrast.
- **Experience:** Low cognitive load, high accessibility under bright outdoor light, seamless single-hand ergonomics for on-the-go data entry.

## Colors

The palette establishes an ordered, trustworthy visual hierarchy using deep ocean hues balanced by crisp light surfaces.

### Semantic Mapping
- **Primary (`#245B85`):** Primary interactive elements, key metric highlights, active navigation icons, and prominent action buttons.
- **Secondary (`#397DAA`):** Tonal badge fills, secondary actions, chart accents, and progress indicators.
- **Tertiary / Success (`#2E7D32`):** Positive goals reached, completed monthly milestones, and affirmative confirmations.
- **Neutral Dark / On-Surface (`#202B36`):** Primary headlines, readable numerical tallies, and critical labels.
- **Neutral Muted (`#7A8794`):** Secondary descriptions, measurement units (e.g., "hrs", "revs"), placeholder text, and inactive tab icons.
- **Canvas / Background (`#F5F7FA`):** Outer app viewport background, screen scaffolding, and grouping canvas.
- **Surface (`#FFFFFF`):** Cards, modal sheets, popovers, and sticky app bars.
- **Outline / Divider (`#E5EAF0`):** 1px structural container borders and list item separators.
- **Destructive / Alert (`#D9534F`):** Destructive actions, delete confirmations, and overdue follow-up alerts.

## Typography

Typography relies on **Inter** (falling back gracefully to SF Pro on iOS and Roboto on Android) to provide optimal legibility, tabular balance, and neutral authority.

- **Hierarchy:** Reserve `headline-xl` solely for top-level screen titles (e.g., "Mi Predicación", "Historial").
- **Metrics Display:** Numerical performance indicators and monthly service hours use `stat-display` with font variant numeric settings set to `tabular-nums` for rock-solid visual alignment.
- **Legibility Rules:** `label-sm` must be rendered in uppercase or medium weight with positive letter spacing (`0.04em`) when used in meta badges or section headers.

## Layout & Spacing

Layout adheres to an 8pt base grid with a 4pt sub-grid for fine alignment (micro-icons and badge padding).

### Breakpoints & Layout Architecture
- **Mobile Handheld (360px - 430px):** Single-column layout with fixed outer screen margins of `1rem` (16px). Form inputs and card groups span 100% of the interior width.
- **Tablet / Large Mobile Foldable (600px+):** Constrain main content containers to a centered maximum width of 640px, or introduce a split-view (master list on left, entry inspector on right) with a `1.5rem` (24px) gutter.

### Layout Rules
- **Stack Gaps:** Standard card gap is `0.75rem` (12px) to keep linked items tight yet visually separated.
- **Touch Targets:** Interactive areas (steppers, list item rows, bottom nav bars) maintain an absolute minimum height of 48px to allow effortless outdoor finger interaction.

## Elevation & Depth

Visual hierarchy uses **tonal surface separation coupled with low-contrast structural outlines**, avoiding muddy or heavy dropshadows.

### Elevation Levels
1. **Level 0 (Canvas Base):** Background color `#F5F7FA`. No shadow.
2. **Level 1 (Card & Content Surface):** Solid `#FFFFFF`, bordered by 1px solid `#E5EAF0`. Shadow: `0px 2px 8px rgba(32, 43, 54, 0.04)`.
3. **Level 2 (Dropdowns, Floating Badges, Navigation Bar):** Solid `#FFFFFF`, bordered by 1px solid `#E5EAF0`. Shadow: `0px 4px 16px rgba(32, 43, 54, 0.08)`.
4. **Level 3 (Modal Bottom Sheets & Dialogs):** Solid `#FFFFFF`. Shadow: `0px -8px 24px rgba(32, 43, 54, 0.12)`. Accompanied by a 30% `#202B36` scrim backdrop.
5. **Elevated Floating Action (Registrar Core Action):** High-tint primary shadow: `0px 6px 16px rgba(36, 91, 133, 0.28)`.

## Shapes

The design system uses a balanced geometric shape language centered on modern softened rects.

- **Cards & Data Modules:** `12px` to `16px` border radius (`rounded-lg`), delivering a welcoming, human tactile finish.
- **Input Fields & Steppers:** Consistent `12px` border radius (`rounded-lg`).
- **Pills & Status Chips:** Full pill radius (`9999px`) for high legibility and quick categorization.
- **Modals & Bottom Sheets:** `20px` border radius applied strictly to the top-left and top-right corners.
- **Primary Center Nav Button:** Circular (`9999px`) to create an immediate focal anchor in the lower viewport.

## Components

### 1. Cards
- **Base Style:** Background `#FFFFFF`, 1px solid `#E5EAF0`, border radius 14px, padding `1rem` (16px).
- **Metric Cards (Resumen del Mes):** Contain a muted uppercase label (`#7A8794`), a prominent large value (`#202B36`), and an optional secondary comparison metric or subtext.

### 2. Buttons
- **Primary Button:** Filled with `#245B85`, text `#FFFFFF`, font `label-lg`, radius 12px, minimum height 48px. Pressed state darkens to `#1B4463`.
- **Secondary Button:** Surface `#FFFFFF`, 1px border `#397DAA`, text `#397DAA`, font `label-lg`.
- **Ghost / Destructive Button:** Text `#D9534F`, transparent background, 44px min height.

### 3. Bottom Navigation Bar (5 Tabs)
- **Bar Scaffolding:** Fixed to bottom, background `#FFFFFF`, border-top 1px solid `#E5EAF0`, height 64px (excluding safe-area inset).
- **Standard Tabs (Inicio, Historial, Estadísticas, Perfil):** 
  - Inactive: Icon & text in `#7A8794`, font `label-sm`.
  - Active: Icon & text in `#245B85`.
- **Central Action Tab ("Registrar"):**
  - Elevated floating circle (52px × 52px) positioned in the horizontal center, extending slightly above the navigation bar top line.
  - Background `#245B85`, icon `#FFFFFF` (plus or edit icon), elevated by `0px 6px 16px rgba(36, 91, 133, 0.3)`.

### 4. Numeric Inputs & Steppers
- Designed for speed and accuracy during field service.
- Features a centered numeric display with flanking `+` and `-` tactile buttons (44px × 44px) encased in a rounded 12px shell with a `#E5EAF0` outline.

### 5. Input Fields & Selectors
- **Container:** Height 52px, background `#FFFFFF`, border 1px solid `#E5EAF0`, border radius 12px, horizontal padding 14px.
- **States:** Focus replaces border with 1.5px solid `#245B85`. Error state uses `#D9534F`.

### 6. Empty States
- Strictly avoid mock/fake entries. Use clean visual iconography (48px line-based icons using `#7A8794` with 20% opacity circular background `#E5EAF0`).
- Content pairs a short, encouraging headline (`headline-sm`) with a supportive hint (`body-md`, `#7A8794`) and a single call-to-action button when relevant.