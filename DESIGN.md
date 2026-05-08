---
name: FluxKit
description: Browser-only real-time video instrument. Industrial chassis, dark display surfaces, orange signals.
colors:
  orange-signal:    "#ff5722"
  red-accent:       "#e63946"
  bg-stage:         "#e8e6e2"
  bg-room:          "#d6d3ce"
  surface-card:     "#c2bfba"
  surface-raised:   "#b0ada7"
  surface-hover:    "#9c9893"
  border-hairline:  "#a4a09a"
  display-screen:   "#1a1817"
  display-bezel:    "#262422"
  text-key:         "#1c1a18"
  text-body:        "#3a3631"
  text-muted:       "#5e5852"
  text-faint:       "#8a847c"
  text-on-display:  "#f0ede8"
  state-ok:         "#5e8c5b"
  state-danger:     "#c43a2e"
  state-info:       "#3d6b8e"
  stage-osc:        "#a0793a"
  stage-filter:     "#8e3a4f"
  stage-fx:         "#3a6b7e"
  knob-cap-white:   "#f0ede8"
  knob-cap-black:   "#1c1a18"
typography:
  headline:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.18em"
  title:
    fontFamily: "Inter, sans-serif"
    fontSize: "10px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.16em"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: "0.04em"
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "9px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.14em"
  mono-num:
    fontFamily: "Inter, sans-serif"
    fontSize: "10px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0"
    fontFeature: "'tnum'"
rounded:
  xs:  "2px"
  sm:  "3px"
  md:  "4px"
  lg:  "5px"
  xl:  "6px"
  2xl: "8px"
  3xl: "10px"
spacing:
  2xs: "2px"
  xs:  "4px"
  sm:  "6px"
  md:  "8px"
  lg:  "12px"
  xl:  "16px"
  2xl: "22px"
components:
  button-primary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-key}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "30px"
  button-primary-hover:
    backgroundColor: "{colors.surface-hover}"
    textColor: "{colors.text-key}"
  button-icon:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-key}"
    rounded: "{rounded.sm}"
    padding: "5px 10px"
    height: "26px"
  toggle-inactive:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-body}"
    rounded: "{rounded.md}"
    padding: "6px 8px"
    height: "28px"
  toggle-active:
    backgroundColor: "{colors.orange-signal}"
    textColor: "{colors.knob-cap-white}"
    rounded: "{rounded.md}"
    padding: "6px 8px"
    height: "28px"
  card-effect:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.text-body}"
    rounded: "{rounded.2xl}"
    padding: "12px"
  empty-card:
    backgroundColor: "{colors.bg-room}"
    textColor: "{colors.text-faint}"
    rounded: "{rounded.2xl}"
    padding: "18px 14px"
  toast:
    backgroundColor: "{colors.display-screen}"
    textColor: "{colors.text-on-display}"
    rounded: "{rounded.lg}"
    padding: "10px 14px"
  swatch-btn:
    backgroundColor: "{colors.surface-raised}"
    rounded: "{rounded.sm}"
    padding: "0"
---

# Design System: FluxKit

> New here? See [`OVERVIEW.md`](./OVERVIEW.md) — a friendly, non-technical introduction to FluxKit aimed at PMs, designers, and other non-engineering contributors.

> **Branch note.** This file is the design spec on the `design/te-workbench-palette` branch. It supersedes the dim-purple "Late-Night Patch" identity from `main`. If this branch merges, `PRD_DECISIONS.md` Q1 (Creative North Star) needs updating — and `style.css` needs a full reskin to match. This document is currently aspirational on this branch; the running app still uses the `main` palette until the implementation PR lands.

## 1. Overview

**Creative North Star: "The Studio Workbench"**

FluxKit is built for a workbench in daylight. The chassis is light, restrained industrial grey. The work — the canvas — sits inside a dark display embedded in that chassis, the way a screen sits in a Teenage Engineering K.O. II body. The chassis recedes by being quiet; the canvas asserts itself by being the one dark surface the eye lands on. Orange appears only when something is changing, active, or being touched. Everywhere else, the surface is a neutral warm grey that the eye relaxes into without strain.

The aesthetic family is **browser shader playground crossed with industrial sampler hardware**, with named references in PRODUCT.md to Teenage Engineering K.O. II / K.O. Sidekick (primary), Lumen, Cables.gl, and Ableton Push. FluxKit explicitly rejects three other families it could be mistaken for: generic SaaS dashboard (no soft greys with identical 12-column card grids, no blue-primary CTA, no "modern" in the boring sense), AI tool cliché (no gradient orb hero, no beige-and-violet "soft AI" palette, no chat affordances), and hobbyist demo (no untreated form controls, no raw `<input type="range">`).

Density is high on purpose. Power users need every knob visible at once, newcomers learn the controls by touching them, and there is no tutorial layer to fall back on. The chrome must be tight enough to fit, terse enough to read at a glance, and consistent enough that muscle memory pays off — exactly the discipline a TE device runs on.

**Key Characteristics:**

- One signal color (`orange-signal`), reserved for change, active, or being-touched states.
- One neutral family of warm greys, the chassis. Every step tinted slightly toward warm-yellow (hue 70) so the surface reads as anodized aluminum rather than printer-paper white.
- The canvas is NOT on the chassis. It sits inside a dark embedded display surface, two surface roles down from the chrome.
- Flat surfaces everywhere. No `backdrop-filter: blur`, no ambient `box-shadow` on chrome at rest. The K.O. II isn't blurred either.
- Knob is the signature component — and now, like a TE knob, it has a white or black solid cap with a colored indicator line, not a glowing arc.
- The single saturated chroma in the chrome is orange. Red appears only for danger. Everything else is greyscale.

## 2. Colors: The Workbench Palette

Every neutral is tinted slightly toward warm-yellow (hue 70, low chroma 0.005–0.012) so the surfaces read as anodized industrial grey rather than clinical printer-white. The CSS uses `oklch()` directly; the hex shown is the rendered sRGB approximation for tooling that cannot consume OKLCH.

The single accent is `orange-signal` (TE-style #ff5722). The single rare emphasis color is `red-accent` (the Japanese-text red, ~#e63946), used for danger state and for one or two intentional typographic moments. Everything else in the chrome is greyscale.

### Primary

- **Orange Signal** (`#ff5722`, `oklch(70% 0.21 45)`): The only accent in the chrome at rest. Used on the active toggle button (full background fill), the active filter button border, the value-tooltip border under a knob being touched, the modified-from-default dot on knobs, the focus-visible ring, the scrub thumb, and nothing else. Orange in chrome with no associated state change is a violation. See **The Orange-Is-Signal Rule** below.

### Rare emphasis

- **Red Accent** (`#e63946`, `oklch(60% 0.22 25)`): Reserved for two roles: (1) `state-danger` confirmations (the two-stage Reset button when armed, error toast border), and (2) an optional Japanese-style typographic emphasis on stage labels or the FluxKit wordmark when the design wants a TE-faithful nod. Never used as a fill on an interactive control — that would collide with `orange-signal`'s active-state read.

### Neutral chassis (the workbench ladder, light to dark, OKLCH-canonical at hue 70)

The lightness ladder runs from `Bg Stage` (the lightest, edges of the page) down through the chassis surfaces, to a hard break at `Display Bezel` and `Display Screen` — those two darker surfaces are the "embedded screens" where the canvas and other display content live. The contrast between chassis (light) and display (dark) is the primary depth cue in the system.

- **Bg Stage** (`oklch(91% 0.005 70)`, ≈`#e8e6e2`): The page background visible at the edges, behind everything. The lightest surface in the system. Reads as "ambient room" around the device.
- **Bg Room** (`oklch(85% 0.007 70)`, ≈`#d6d3ce`): Sidebar background and top bar background. The main chassis surface. The thing the buttons and knobs are mounted on.
- **Surface Card** (`oklch(78% 0.008 70)`, ≈`#c2bfba`): Effect-card background and some panel groupings. One step darker than `Bg Room` — reads as a recessed inlay on the chassis, like a sticker label on a TE device.
- **Surface Raised** (`oklch(72% 0.008 70)`, ≈`#b0ada7`): Default button background, toggle inactive background, swatch container. The interactive layer; one step darker than `Surface Card`.
- **Surface Hover** (`oklch(64% 0.008 70)`, ≈`#9c9893`): Hover state for any `Surface Raised` surface. One tonal step darker signals "ready to be pressed" — opposite direction from a dark theme, where hover lightens.
- **Border Hairline** (`oklch(67% 0.005 70)`, ≈`#a4a09a`): All 1px borders in the chrome. Tinted just enough darker than `Surface Raised` to draw a hairline boundary without becoming a divider.

### Display surfaces (the screens embedded in the chassis)

These two colors are reserved for the canvas viewport, the canvas top bar, the help panel modal, and the toast. They are intentionally dark to maintain the "screen embedded in chassis" metaphor — and to keep the canvas reading as the loudest element on the page.

- **Display Bezel** (`oklch(15% 0.005 70)`, ≈`#262422`): The "frame" around the canvas viewport. The canvas top bar lives in this color. The toast surface uses this. Reads as a black plastic bezel.
- **Display Screen** (`oklch(10% 0.005 70)`, ≈`#1a1817`): The actual screen surface where pixel content sits. The canvas backing color. The help-panel modal background. Slightly darker than the bezel so the screen reads as recessed within its frame.

### Text (warm-grey ladder for chassis text; one inverse for display text)

Chassis text is dark on light. Display text is light on dark. Both ladders are tinted toward hue 70 so they harmonize.

- **Text Key** (`oklch(15% 0.008 70)`, ≈`#1c1a18`): Primary text on chassis surfaces. Headlines, knob value tooltip, active button label.
- **Text Body** (`oklch(28% 0.008 70)`, ≈`#3a3631`): Default body color on chassis. Inactive toggle label, card body copy.
- **Text Muted** (`oklch(42% 0.010 70)`, ≈`#5e5852`): Section labels, file status, knob labels.
- **Text Faint** (`oklch(58% 0.012 70)`, ≈`#8a847c`): Empty-state copy, footer, divider sublabels, FPS overlay. The dimmest legible text on chassis. Below WCAG AA on `Bg Room` for body copy — only used for non-essential disambiguation.
- **Text On Display** (`oklch(94% 0.005 70)`, ≈`#f0ede8`): Text rendered on `Display Screen` or `Display Bezel`. Used for the canvas top bar buttons (Snap / FPS / ?), the FPS overlay, the toast body, the help panel body, the empty-state placeholder copy on a black canvas.

### State (semantic, three roles)

Each state color is muted (low chroma) so it never competes with `orange-signal` for attention. Orange owns "active"; state colors own "outcome."

- **State OK** (`oklch(60% 0.10 145)`, ≈`#5e8c5b`): Muted forest green. Toast success border. Reads as confirm/done without being chartreuse.
- **State Danger** (`oklch(50% 0.18 25)`, ≈`#c43a2e`): Grounded red, slightly darker and lower-chroma than `red-accent`. Used on the `Reset` button when in two-stage confirm mode (full background + border + text), and on toast error border. Distinguishable from `orange-signal` by hue (red vs. orange-red) and lightness (danger is darker).
- **State Info** (`oklch(50% 0.10 235)`, ≈`#3d6b8e`): Muted slate blue. Used for **informational status** that is neither active nor destructive. Currently: the modified-from-default dot on knobs (a value differs from default; passive observation, not active change). Reserves `orange-signal` for the act of changing.

### Stage Flow (signal-flow color coding, low-chroma to stay quiet)

The three sidebar stage labels (OSC, FILTER, FX) keep their three different hues to communicate signal direction, but at significantly lower chroma than the previous palette so they recede behind `orange-signal`. Eye still reads warm (input) → cool (output) like an audio chain, but no stage color competes with the orange active-state.

- **Stage OSC** (`oklch(55% 0.09 65)`, ≈`#a0793a`): Muted amber. The input stage. Source video, blob detection, the energy entering the system.
- **Stage Filter** (`oklch(45% 0.13 5)`, ≈`#8e3a4f`): Muted plum. The transformation stage. Effect picker plus per-effect knob grids. Shifted toward red so it harmonizes with the rare `red-accent` instead of fighting it.
- **Stage FX** (`oklch(50% 0.08 220)`, ≈`#3a6b7e`): Muted slate-teal. The output stage. Region style, shape, overlay color, blob size, font, connection rate.

### Knob caps

These are exposed as design tokens because they appear inside the SVG knob and need to match real hardware aesthetics.

- **Knob Cap White** (`#f0ede8`): The "white knob" cap, matching TE's volume knobs. Used as the default knob cap fill.
- **Knob Cap Black** (`#1c1a18`): The "black knob" cap, matching TE's secondary knobs. Used optionally for knobs that should read as secondary in a knob-grid hierarchy. (Future use; current implementation uses white caps only.)

### Named Rules

**The Orange-Is-Signal Rule.** Orange (`#ff5722`) appears only where a value is being changed, an effect is active, or a control is currently being touched. The logo, card titles, dividers, and any decorative element must be a neutral or stage-coded tone. Test: take a screenshot of the app at rest with no interaction. If orange is visible anywhere except the active toggle button, the active filter card's accent edge, and the active scrub thumb, the rule is violated.

**The Industrial-Neutral Rule.** Every chassis neutral must carry chroma 0.005–0.012 toward hue 70 (warm yellow). Pure greys (`oklch(L 0 0)`) are forbidden. `#000` and `#fff` are forbidden everywhere in the chrome. The workbench palette only works because the eye reads the warm tint as anodized industrial finish; without it, the chassis flips to printer-paper or hospital-white. The display-surface neutrals are also tinted toward hue 70, just at lower lightness.

**The Display-Is-The-Canvas Rule.** The canvas viewport sits inside `Display Screen` (the darkest surface in the system). Around it, `Display Bezel` (one step lighter dark) frames it like a real screen bezel. The chrome (chassis surfaces) is light grey. This dark-screen-in-light-chassis contrast is the primary depth cue in the system — it must not be diluted. Anything lit-and-glowing belongs in display surfaces; anything tactile belongs on chassis surfaces.

**The Two-Color Rule.** Orange and red are the only saturated chromas in the chrome. No greens, blues, purples, teals, pinks, or yellows appear as primary surface or accent colors anywhere. Stage labels and state colors are LOW-chroma — they read as tinted greyscale, not as color in the design sense. If you find yourself reaching for a fourth or fifth saturated hue, you are decorating, and FluxKit is not decorated.

**The Signal-Flow Rule.** The three stage dividers are color-coded to signal flow direction: amber (OSC, source) → plum (FILTER, transformation) → slate-teal (FX, output). The eye should be able to scan the sidebar top-to-bottom and feel the input-to-output journey without reading any words. Stage colors appear ONLY on stage-divider labels; using them on any other surface dilutes their meaning. The chroma here is intentionally lower than the previous (purple-palette) implementation so stage colors never compete with `orange-signal` for attention.

## 3. Typography

**Display Font:** none. FluxKit has no hero, no marketing surface, no headline larger than 13px. Just like the K.O. II has no display font — text is small and labels are everywhere.
**Body Font:** Inter (with `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` fallback).
**Label/Mono Font:** Inter with `font-variant-numeric: tabular-nums` for any numeric value (knob value, FPS, timecode).

**Character:** Single-family discipline. Inter only. Weight contrast (500 / 600 / 700) does the hierarchy work. No decorative typeface anywhere. The work feels engineered and labeled, not designed; the typography stays out of the way of the canvas. Letter-spacing is widened by one notch from the previous palette to feel more industrial-stencil — TE labels are spaced loose and uppercase, and that posture suits FluxKit too.

### Hierarchy

- **Headline** (Inter 700, 13px, line-height 1.2, letter-spacing 0.18em uppercase): Help-panel title (`Keyboard & Mouse`). The largest text in the system. Used once per modal context.
- **Title** (Inter 700, 10px, line-height 1.2, letter-spacing 0.16em uppercase): Effect-card title (`Voronoi`, `Cellular`, `ASCII`, etc.). The card name, never decorated. Tighter letter-spacing than headline so the title role stays one notch back.
- **Body** (Inter 500, 12px, line-height 1.45, letter-spacing 0.04em): Default. Action button label, toast body, help-panel list items. Cap line length at 60ch in any prose surface (toast, help panel).
- **Body-Small** (Inter 500, 11px, line-height 1.4, letter-spacing 0.03em): Action-btn (Upload Video, Open Camera). One step down from Body, used when density matters more than weight.
- **Label** (Inter 600, 9px, line-height 1.2, letter-spacing 0.12–0.24em uppercase): Section labels, stage dividers, icon-button text, logo. Letter-spacing widens with importance: 0.12em for icon-btn, 0.16em for section-label, 0.24em for stage-divider.
- **Mono-Num** (Inter 600, 10px, `font-variant-numeric: tabular-nums`): Knob value tooltip, FPS overlay, video timecode, knob `aria-valuetext`. Tabular numerals so the digits don't jitter as values change.

### Named Rules

**The Single-Family Rule.** Inter only. No serif accents, no monospace family, no display face. The Mono-Num role is achieved with `font-variant-numeric: tabular-nums` on Inter, not by switching family. A second typeface in this product would feel decorative, and decoration is what the canvas is for.

**The Letter-Spacing-As-Weight Rule.** Letter-spacing widens with hierarchy importance for uppercase text (0.12em → 0.16em → 0.24em). Use spacing, not size, to differentiate sibling uppercase labels. The wider spacing in this palette versus the previous purple palette is intentional — it's the typographic posture of an industrial label, not a synth-soft-glow header.

## 4. Elevation

**FluxKit is flat by default.** No `backdrop-filter: blur`, no `box-shadow` on chrome at rest. Depth is conveyed by tonal layering on the chassis ladder (`Bg Stage` → `Bg Room` → `Surface Card` → `Surface Raised` → `Surface Hover`, each one OKLCH lightness step lower) and by the hard chassis-vs-display contrast where the canvas sits.

A K.O. II is also flat. The buttons are recessed into the chassis by one tonal step, the screen is recessed by a much larger lightness drop. FluxKit honors the same trick: small tonal steps on the chassis ladder, then a hard break to the display surfaces.

Shadows appear only as state transitions on truly floating surfaces, never as chrome decoration. The single justified ambient shadow is on the help-panel modal and the drop-zone overlay (both transient surfaces that need to clearly float above their context).

### Shadow Vocabulary

- **modal-lift** (`box-shadow: 0 12px 48px rgba(20, 18, 16, 0.35)`): Help panel and drop-zone overlay only. The shadow color is a low-alpha warm-dark to match the workbench palette — the previous purple `rgba(5, 2, 16, 0.6)` is too dark and too purple for a light theme.
- **focus-ring** (`outline: 2px solid #ff5722; outline-offset: 2px`): The focus ring is not a shadow but functions like one. Always orange, always 2px, always with 2px offset. Never use box-shadow as a focus indicator.

### Named Rules

**The Flat-By-Default Rule.** Surfaces at rest have no `box-shadow` and no `backdrop-filter`. Depth is tonal, not blurred. If a designer reaches for a shadow to make a card feel "elevated", they have failed to use the surface ladder. Re-tint the surface one step darker instead (in this light palette, "raised" surfaces are DARKER, not lighter — the opposite of the dim-purple palette's convention).

**The Modal-Only Shadow Rule.** Only modals (help panel, drop-zone overlay, future confirm dialogs) may carry ambient `box-shadow`. Toast, cards, sidebar, and top bar must remain flat. A shadow on a non-modal surface is a violation.

## 5. Spacing

A single spacing scale is the source of truth for every padding, margin, and gap value in the chrome. The scale is exposed as CSS custom properties in `:root` and is used everywhere; raw px values for spacing are forbidden in component rules.

The scale is unchanged from the previous palette — spacing is about rhythm, and the rhythm doesn't change just because the palette did.

### The scale

| Token | Value | Use |
|---|---|---|
| `--space-2xs` | `2px` | Tight chrome only — knob value-tooltip padding-y, file-status padding-top. Not for general layout. |
| `--space-xs`  | `4px` | Smallest gap between sibling controls — toggle group buttons, swatch grid cells, knob modified-dot offset. |
| `--space-sm`  | `6px` | Compact paddings — toggle button padding-y, top bar action gaps, help-panel kbd padding-x, list-item gap. |
| `--space-md`  | `8px` | Default gap and compact padding — control-section padding-y/gap, action-button padding-y, sidebar-header gap, video-controls gap. |
| `--space-lg`  | `12px` | Default surface padding — control-section padding-x, effect-card padding, action-button padding-x, top bar gap, video-controls padding-x. |
| `--space-xl`  | `16px` | Generous surface padding — sidebar-header padding-x, top bar padding-x, stage-divider padding-x, empty-card padding-y, toast bottom offset, sidebar bottom padding. |
| `--space-2xl` | `22px` | The breath token — knob-grid row gap (holds the value-tooltip drop), help-panel padding (modal generosity). |

### Architecture rules for the sidebar

The sidebar is a vertical stack of stage groups. Three stages, color-coded dividers (now low-chroma per The Two-Color Rule), no per-section dividers.

- **Stage divider** owns staging. `padding: var(--space-xl) var(--space-xl) var(--space-sm)` — generous breath above, hairline rule line below the label, then control sections begin tight under it.
- **Control sections within a stage** are quiet. `padding: var(--space-md) var(--space-lg)` and **no `border-bottom`** — sections inside one stage read as a single tonal group, not as eight equally-weighted rows. The stage-divider is the only horizontal seam.
- **Effect cards** are tonal recessions. `margin: var(--space-md) var(--space-lg)`, `padding: var(--space-lg)`, `background: Surface Card`. The card layer is achieved by tonal contrast (Surface Card sits one step darker than Bg Room) plus inset margin, not by elevation. In this light palette, "raised" reads as DARKER, mirroring how a recessed sticker label sits on a TE chassis.

### Named Rules

**The Spacing-Token Rule.** Every `padding`, `margin`, and `gap` value in component CSS must come from a `--space-*` token. Raw px values for spacing are forbidden in chrome rules. Exceptions: borders (always `1px solid`), focus-ring offsets (locked at `2px`), the universal reset (`margin: 0; padding: 0;`), intra-component micro-spacing where the value is part of the component's geometric definition (knob's intra-stack `gap: 3px`, sidebar-header-text's tight `gap: 1px`).

**The Stage-Owns-Staging Rule.** Within a stage (OSC, FILTER, FX), control sections do not draw their own bottom borders. The stage-divider is the only horizontal seam in the sidebar. Adding a `border-bottom` to `.control-section` over-segments the sidebar and dilutes the three-stage architecture; the eye should read three groups, not eight rows.

## 6. Components

For each component: short character line, then shape, color, states, and any distinctive behavior. Where a component changed in this branch, the change is called out inline.

### Buttons

Three button shapes. Each has a clear job. All three lose their previous "hover border becomes pink" affordance — the new behavior is "hover surface darkens one tonal step," matching how a TE button responds to being held down.

#### Action Button (`.action-btn`) — the deliberate one

The "Upload Video" / "Open Camera" surface. Used when the user is committing to a multi-second action.

- **Shape:** rounded 4px (`{rounded.md}`). Tighter corners than the previous palette (was 6px) — TE buttons are crisp, not pillowy.
- **Default:** background `Surface Raised` (`#b0ada7`), text `Text Key`, padding `8px 12px`, min-height 30px, font Body-Small (Inter 500, 11px, 0.04em).
- **Hover:** background `Surface Hover` (`#9c9893`). Text stays `Text Key`. **No border color change** — depth is tonal in this palette.
- **Focus-visible:** 2px Orange Signal outline with 2px offset.
- **Disabled:** opacity 0.4, cursor not-allowed, no hover treatment.

#### Icon Button (`.icon-btn`) — the small one

`Reset` (sidebar header), `Snap` / `?` / `FPS` (canvas top bar). High density, low padding.

- **Shape:** rounded 3px (`{rounded.sm}`). Same crispness logic as Action Button.
- **Default — sidebar (chassis context):** background `Surface Raised`, text `Text Key`, padding `5px 10px`, min-height 26px, font Label (Inter 600, 9px, uppercase, 0.12em).
- **Default — canvas top bar (display context):** background `Display Bezel`, text `Text On Display`, otherwise identical. The icon button changes its surface family depending on whether it sits on chassis or on a display surface — a chassis button on a display surface would visually fight the screen metaphor.
- **Hover (chassis):** background `Surface Hover`. **Hover (display):** background `Display Screen` (one step deeper).
- **Active-pressed (`.confirming`):** background `state-danger` at 0.18 alpha tinted onto the surface, border `State Danger`, text `State Danger`. Used by the two-stage `Reset` button between first and second click.

#### Toggle Button (`.toggle-btn`) — the radio-group one

Used for radio groups: speed, detect mode, region style, shape, blob size, erode mode, false-band. Inside a `.toggle-group` flex row.

- **Shape:** rounded 4px (`{rounded.md}`).
- **Inactive:** background `Surface Raised`, text `Text Body`, padding `6px 8px`, min-height 28px, font Body (Inter 500, 10px).
- **Hover:** background `Surface Hover`, text `Text Key`. No border treatment.
- **Active (`aria-checked="true"`):** background `Orange Signal`, text `Knob Cap White` (which doubles as a near-white text-on-orange color that reads cleanly), font weight 700. The active state is the only place orange appears as a fill on a chrome surface at rest, and it is always exactly one button per group.

### Filter Button (`#filter-group .toggle-btn`) — the signature

The 14 effect choices in the FILTER section. Each button is a **full-bleed gradient swatch** approximating the effect's output palette (thermal: black → purple → red → yellow → white; biolum: dark → cyan → violet; etc.). The label sits over the swatch with text-shadow for legibility.

- **Shape:** rounded 4px (`{rounded.md}`), 33% width (3-up grid), min-height 42px (taller than other toggles to give the swatch room).
- **Per-button background:** linear gradient unique to each filter. The gradient IS the button's identity. With it, the user can recognize ASCII vs. Voronoi vs. Thermo at a glance after one session of use. The gradients are unchanged in this branch — they're a deliberate exception to The Two-Color Rule because they're *previewing the canvas output*, which is creative content and exempt by the same logic that exempts the canvas itself.
- **Inactive:** dark scrim overlay (`linear-gradient(180deg, rgba(0,0,0,0.20), rgba(0,0,0,0.65))`) on top of the swatch so the white label stays readable. Slightly heavier scrim than the previous palette because the chassis around the buttons is light, and the contrast difference would otherwise be too high.
- **Active:** 2px `Orange Signal` border, scrim lightened to (`rgba(0,0,0,0.05) → rgba(0,0,0,0.45)`), font weight 700. **No box-shadow glow.** The orange border is the only signal of active state — color, not glow, in keeping with TE.

### Knob (`.knob`) — the signature instrument component

Custom 40×40 SVG. The most-touched control in the system. **This is the component that changed most in this branch.** Previously a glowing pink-purple-indigo arc. Now a TE-style cap with a colored indicator line, quiet by default and orange when touched.

- **Shape:** circle. Outer track is a 270° arc starting at -135° (south-west) and sweeping to +135° (south-east), 18px radius, 3px stroke. Inner cap is a 14px solid filled circle (slightly larger than before — TE caps are visually dominant against their dial markings). Pointer is a 13px line from cap edge to outer arc.
- **Track:** `Border Hairline` at 0.7 alpha. Hairline-quiet; the eye should read the cap and the pointer, not the track.
- **Arc (filled portion):** linear gradient from `Knob Cap White` (start, low end of value) to `Orange Signal` (end, high end of value). One single saturated color sweep, replacing the previous pink → purple → indigo. **No drop-shadow filter.** When the value is at minimum, the arc is essentially invisible (white fill on light track); when at maximum, the arc reads as a confident orange swoop. This is more reserved than the previous palette and rewards close observation rather than glancing.
- **Pointer:** 2px `Knob Cap Black` stroke (for white-cap knobs) or `Knob Cap White` stroke (for any future black-cap knobs). **No glow filter.** The pointer is the only high-contrast element on the knob and signals the current value.
- **Cap:** `Knob Cap White` fill, 1px `Border Hairline` stroke. The cap reads as a solid plastic / aluminum knob top, the way a TE volume knob reads.
- **Label** (below): Mono-Num, `Text Muted`, max 2 lines, wrap not truncate.
- **Value tooltip** (on hover/focus/drag): Mono-Num, `Text Key`, background `Surface Card`, 1px `Orange Signal` border, padding `2px 7px`, rounded 3px, positioned 16px below the SVG. Only visible during interaction.
- **Modified-from-default indicator:** 4px `State Info` (slate blue) dot, inline after the label, only when current value differs from `data-default`. Slate blue because "this value differs from default" is informational status, not active change. Orange stays reserved for the act of changing.
- **States:** hover background `oklch(70% 0.21 45 / 0.06)` (faint orange wash on the cap), focus-visible 2px `Orange Signal` ring, dragging same as hover plus tooltip held visible.
- **Interactions:** vertical pointer drag, Shift = 10× fine, double-click = reset to default, keyboard (`↑` `↓` `←` `→` step, `PgUp` `PgDn` 10×, `Home` `End` min/max), mouse wheel.

### Effect Card (`.effect-card`)

The container that holds per-effect knob grids. One visible at a time (matched to active filter).

- **Shape:** rounded 8px (`{rounded.2xl}`). Tighter than the previous 10px — TE surfaces are crisper.
- **Background:** `Surface Card`. Solid. No backdrop-filter.
- **Border:** 1px `Border Hairline`.
- **Top accent:** 2px solid `Orange Signal` along the top edge (NOT `border-top-width: 3px+ side-stripe`; this is a 2px full-top accent rendered via `::before`, with `border-radius: 8px 8px 0 0` so it follows the card's rounded corner). Indicates "this card is the active effect's controls".
- **Active state (matches active filter button):** border becomes `Orange Signal` at 0.45 alpha. **No box-shadow glow.**
- **Header:** title (Title role) on the left, per-card reset `×` button (Text Faint, hover Orange Signal) on the right.
- **Internal padding:** 12px (`{spacing.lg}`).
- **Knob grid:** 2-column, gap `22px 6px` (row gap accommodates the value-tooltip drop without colliding with the next row).

### Empty Card (`.empty-card`)

Placeholder shown in the FILTER stack when no effect is selected. Italic, centered, dashed border. Communicates "this slot is intentionally empty" not "something failed to load".

- **Shape:** rounded 8px (`{rounded.2xl}`).
- **Background:** `Bg Room` (one step lighter than `Surface Card` — the empty state recedes into the chassis).
- **Border:** 1px **dashed** `Border Hairline`. The dashed border is the signal of "empty by design".
- **Text:** `Text Faint`, italic, 10px, centered.
- **Padding:** `18px 14px`.

### Toast (`.toast`)

Bottom-center, transient. Stacks vertically (newer at bottom). **Toast moves from chassis to display in this palette** — toasts now sit on a `Display Bezel` surface with light text, treating them as floating status displays rather than chrome popovers. This is more TE-faithful (status appears on a screen, not on the chassis) and gives toasts higher visual presence in the new light theme.

- **Shape:** rounded 5px (`{rounded.lg}`).
- **Background:** `Display Bezel`. Solid. No backdrop-filter.
- **Text:** `Text On Display`.
- **Border:** 1px `Border Hairline`. **Full border, never a side-stripe.** Tone variants are achieved by tinting the entire border, not by adding a thick `border-left`.
- **Tone variants:** info = neutral border. ok = border `State OK`. error = border `State Danger`.
- **Padding:** `10px 14px`.
- **Position:** bottom 18px, horizontally centered, max-width 420px.
- **Motion:** enters with 200ms `translateY(8px) → 0` + opacity, gated behind `prefers-reduced-motion`.

### Help Panel (`.help-panel`)

Modal overlay. The only chrome element allowed `box-shadow: modal-lift` and a backdrop overlay. **Help panel also moves to display surfaces** — it's now a dark "screen" floating above a darkened chassis, matching the toast and the canvas in surface family.

- **Shape:** rounded 10px (`{rounded.3xl}`).
- **Background:** `Display Screen` solid.
- **Text:** `Text On Display`.
- **Border:** 1px `Border Hairline`.
- **Shadow:** `modal-lift` (the only justified ambient shadow in the system).
- **Backdrop:** semi-opaque `Display Screen` at 0.65 alpha. **No `backdrop-filter: blur`.**
- **Title:** Headline role (Inter 700, 13px, 0.18em uppercase), `Text On Display`. Solid color, no gradient.
- **Section heads:** Title role, `Text On Display` at 0.7 alpha (the muted-on-display equivalent of `Text Muted`).
- **`<kbd>`:** Inter 600, 10px, padding 2px 6px, background `Display Bezel` (one step lighter than the panel itself, so kbd elements read as raised within the dark surface), 1px `Border Hairline`, rounded 2px (`{rounded.xs}`).

### Swatch Button (`.swatch-btn`)

Overlay-color palette. 8 swatches in a row, plus native `<input type="color">` as fallback.

- **Shape:** square, aspect-ratio 1:1, rounded 3px (`{rounded.sm}`).
- **Background:** the swatch color itself (this is one of the few places `#000` and `#fff` are allowed, because they are user-selectable canvas overlay colors, not chrome surfaces).
- **Border:** 1px `Border Hairline` default.
- **Hover:** transform scale(1.1), border `Text Key`.
- **Active (selected):** border `Orange Signal`. **No box-shadow glow.**

### Named Rules

**The One-Active-Per-Group Rule.** Orange may appear on at most one button per radio group at a time. Speed = 4 buttons, exactly one orange. Detect Mode = 6 buttons, exactly one orange. The user always knows which one is selected by scanning for the single orange rectangle.

**The Knob-Is-The-Signature Rule.** All other components recede in the design hierarchy. If a new component competes with the knob for visual attention, the new component is wrong. The knob is the only place where chroma + cap + pointer + tooltip all converge.

**The Display-Vs-Chassis Rule.** Components that present *information* (toast, help panel, FPS overlay, canvas top-bar buttons) live on display surfaces (`Display Bezel` / `Display Screen`) with light text. Components that present *controls* (knobs, toggles, action buttons in the sidebar) live on chassis surfaces (`Bg Room` / `Surface Card` / `Surface Raised`) with dark text. The boundary is enforced — a control on a display surface or a status readout on a chassis surface breaks the metaphor.

## 7. Do's and Don'ts

### Do

- **Do** use `Orange Signal` (`#ff5722`) only when something is changing, active, or being touched. Logo, card titles, dividers, and any decorative element must use a neutral.
- **Do** layer chassis surfaces tonally (`Bg Stage` → `Bg Room` → `Surface Card` → `Surface Raised` → `Surface Hover`). Each step is one OKLCH lightness DOWN — in a light palette, "raised" reads as DARKER, the inverse of a dark palette's convention.
- **Do** keep display surfaces (`Display Bezel`, `Display Screen`) reserved for the canvas, toast, help panel, and other information-presenting moments. Use light text on display surfaces; use dark text on chassis surfaces.
- **Do** tint every chassis neutral toward warm-yellow (hue 70, chroma 0.005–0.012). The anodized-industrial read only works with the warm tint.
- **Do** keep the canvas the loudest element on screen. Test by squinting; if your eye lands on a sidebar control before the canvas, the chrome is too loud. The dark-canvas-in-light-chassis contrast is your biggest tool here.
- **Do** use full-bleed gradient swatches on the filter buttons. The gradient IS the identity; this is the one place visual variety serves recognition over decoration. The filter swatches are exempt from The Two-Color Rule by the same logic that exempts the canvas itself.
- **Do** wrap long knob labels to 2 lines instead of truncating. The label is a rare moment of legibility in a knob-dense surface.
- **Do** respect `prefers-reduced-motion` on every transition (toast enter, knob arc transition, card hover).
- **Do** keep the active state of each radio group to exactly one button. The single orange rectangle IS the affordance.
- **Do** use `font-variant-numeric: tabular-nums` on every numeric value (knob value, FPS, timecode). Digits must not jitter.
- **Do** color-code the three stage dividers by signal-flow direction: amber (OSC) → plum (FILTER) → slate-teal (FX). All low-chroma, none competing with `orange-signal`.
- **Do** use `state-info` (slate blue) for informational status (modified-from-default dot). Reserve `orange-signal` for the act of changing.
- **Do** use `--space-*` tokens for every padding, margin, and gap.
- **Do** let the stage-divider own all horizontal staging in the sidebar.

### Don't

- **Don't** use `#000` or `#fff` in the chrome. Even the deepest display surface is `oklch(10% 0.005 70)`, not pure black. Pure black at scale reads as a hole, not a surface; pure white reads as printer paper. (Swatch palette swatches are user-selectable canvas colors and are exempt; `Knob Cap White` and `Knob Cap Black` are also slightly off-true.)
- **Don't** use `border-left` (or any side-stripe `border-*` greater than 1px) as a colored accent on toasts, cards, list items, or callouts. Side-stripe borders are an absolute ban.
- **Don't** use `background-clip: text` to apply a gradient to type. Use a single solid color and let weight or size carry the emphasis. Gradient text is decorative; FluxKit is not decorated.
- **Don't** use `backdrop-filter: blur` on chrome at rest. Replace with solid surfaces from the chassis or display ladders.
- **Don't** apply `filter: drop-shadow` or `box-shadow` ambient glow on chrome at rest. The new knob arc is intentionally crisp on its own; depth is conveyed tonally. Modal-lift is the single justified shadow.
- **Don't** add a SaaS dashboard look. No soft greys with identical 12-column card grids, no blue-primary CTA, no "modern" in the boring sense. FluxKit is not a productivity tool.
- **Don't** add an AI tool look. No gradient orb hero, no beige-and-violet "soft AI" palette, no large sans-serif marketing voice, no emoji status indicators, no chat-shaped affordances.
- **Don't** ship raw form controls. No untreated browser `<input type="range">`, no default `<select>` styling, no Bootstrap-grade defaults.
- **Don't** introduce a second typeface family. Inter only.
- **Don't** put orange on more than one button per radio group at a time. Exactly one orange rectangle per group is the rule.
- **Don't** use a modal for anything except help and future confirm-destructive flows.
- **Don't** use stage colors (amber, plum, slate-teal) on any surface other than the three stage-divider labels. Diluting them onto buttons, cards, or borders kills the signal-flow read.
- **Don't** use `orange-signal` for destructive confirms. That's `state-danger`. The two are intentionally different (danger is darker, redder, lower chroma) so the user can tell active-state apart from about-to-destroy at a glance.
- **Don't** use `orange-signal` for informational status. That's `state-info` (slate blue).
- **Don't** introduce a fourth or fifth saturated color into the chrome. Orange and red are the system; everything else is greyscale (the stage colors and state colors are LOW-chroma greyscale, not "color" in the design sense). Adding a green CTA or a purple toggle violates The Two-Color Rule.
- **Don't** put controls on display surfaces or status readouts on chassis surfaces. The display-vs-chassis split is enforced.
- **Don't** use raw px values for `padding`, `margin`, or `gap` in chrome rules. Pull from the `--space-*` scale.
- **Don't** add `border-bottom` to `.control-section`. The stage-divider is the only horizontal seam in the sidebar.
