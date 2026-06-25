---
name: lumisynth-ui
description: >-
  Frontend look, feel, and motion changes for the LumiSynth / ARTKITv2 repo.
  Covers CSS transitions, hover states, swatch grids, knob panels, timeline,
  toasts, modal overlays, sidebar architecture, and any visual polish or
  fluidity improvement in src/style.css and index.html.
  Use when the user asks to improve the UI, make it more fluid, add
  transitions, polish hover states, fix spacing, redesign a component,
  or change colors / typography — for this specific project.
disable-model-invocation: true
---

# LumiSynth UI Skill

## First reads (always do these before touching CSS or HTML)

1. Read `src/style.css` — it is the single source of truth. All tokens,
   component rules, and named design rules live there.
2. Read `DESIGN.md` — the full design system spec (tokens, rules, anatomy).
3. Read the relevant section of `index.html` for the component being changed.
4. Read `CLAUDE.md` — project-wide constraints (vanilla JS + Vite, no TS/React/
   Tailwind, no framework components, no `#000`/`#fff` raw values in chrome).

## Design system in 60 seconds

**Two surface families (never mix)**

| Family | Tokens | Used for |
|--------|--------|----------|
| Chassis (mid-dark warm graphite) | `--bg-stage` → `--bg-room` → `--surface-card` → `--surface-raised` → `--surface-hover` | Sidebar, buttons, knobs, cards — anything tactile |
| Display (near-black LCD) | `--display-bezel` → `--display-screen` | Canvas area, toast, help panel, FPS overlay |

"Raised reads as LIGHTER" (dark-mode convention). Hover = one step lighter on the chassis ladder; NEVER add `box-shadow` or `backdrop-filter` to chassis controls at rest.

**Signal color rule** — `--orange-signal` (#ff5722) appears ONLY when something is:
- Active / selected (toggle active, active card border, open chip)
- Currently being touched / dragged (knob hover wash, scrub thumb)
- Has a modified-from-default dot (use `--state-info` slate blue instead)

**Motion tokens** — use these, never raw ms values:
```css
--ease-out:       cubic-bezier(0.25, 1, 0.5, 1);
--duration-fast:  120ms;   /* tooltip fade, micro feedback */
--duration-base:  150ms;   /* most transitions: bg, color, border */
--duration-slow:  200ms;   /* toast enter, overlay fade */
```

**Spacing tokens** — use `--space-*` only; no raw px for padding/margin/gap:
`--space-2xs:2px` `--space-xs:4px` `--space-sm:6px` `--space-md:8px`
`--space-lg:12px` `--space-xl:16px` `--space-2xl:22px`

**Typography** — Space Grotesk (`--font-body`) on chassis; Doto (`--font-doto`) on display surfaces only. Never swap families.

**Geometry** — `border-radius` uses tokens: `xs:2px sm:3px md:4px lg:5px xl:6px 2xl:8px 3xl:10px`.

## Color tokens — OKLCH & perceptual uniformity

All chrome color tokens in `:root` are authored in **OKLCH** (`oklch(L% C H)`), never hex/HSL (the two saturated signals `--orange-signal` / `--red-accent` stay hex by design). OKLCH is chosen deliberately because it is **perceptually uniform**: equal numeric steps produce equal *perceived* steps. HSL/HSV/raw-RGB are not — equal numeric steps look uneven (blues go muddy, reds read too intense), so a "uniform" ladder built in them is not visually uniform.

Two consequences, both enforced in the token block:

1. **Ramps must be perceptually equidistant** (Wilhelm Oswald's equal-increment harmony — only valid in a uniform space). Any token ladder steps its `L` by a constant delta, with monotonic `C`, and **constant `H`**:
   - **Chassis ladder** (`--bg-stage` → … → `--border-hairline`): `L` climbs in even **+5** steps (`13 → 18 → 23 → 28 → 33 → 38`); chroma rises monotonically `.008 → .015`; hue fixed at `70`. `--border-strong` (`48`) is a deliberate **+10** emphasis rung (two ladder steps), not a rhythm break.
   - **Text-on-chassis ramp** (`--text-key` → `--text-faint`): `L` descends in even **−16** steps (`95 → 79 → 63 → 47`); chroma climbs in even **+.003** steps (`.005 → .014`); hue fixed at `70`.

2. **"Keep one dimension constant"** — hue is the held dimension on every chassis/text ramp (always `70`, the warm-graphite hue). When editing a ramp, keep hue constant and move `L`/`C` in even increments; don't introduce per-rung hue drift.

When adding or retuning a token ladder: hold hue constant, pick a single `L` step delta, keep chroma monotonic. Do not reach for hex or HSL for chrome.

## Hard rules (violations break the design)

- No `#000` / `#fff` in chrome (canvas overlay swatches are exempt).
- Chrome color tokens are authored in OKLCH, never hex/HSL (only `--orange-signal` / `--red-accent` stay hex). Token ladders step `L` by a constant delta with monotonic `C` and constant `H` — keep ramps perceptually equidistant (see "Color tokens").
- No `backdrop-filter: blur` on chassis chrome at rest.
- No `box-shadow` ambient glow on non-floating chrome.
- No `border-left` side-stripe for accents (full `border-color` change only).
- No `background-clip: text` gradient on type.
- No second typeface.
- No `border-bottom` on `.control-section` (stage-divider is the only seam).
- Orange on at most ONE button per radio group at a time.
- Stage colors (`--stage-osc`, `--stage-filter`, `--stage-fx`) on divider labels only — never on buttons, cards, or borders.
- Floating surfaces (toast, help panel, timeline popover) may carry `box-shadow`; chassis at rest must not.
- `prefers-reduced-motion`: gate every `transition` and `animation` behind the existing `@media (prefers-reduced-motion: reduce)` block at the bottom of `style.css`.

## Knob & slider interaction model (as of June 2026)

All knobs and sliders share a single interaction contract. Both are wired through `initKnob` / `initSliderControl` in `src/main.js`.

### Interaction table

| Action | Result |
|--------|--------|
| Drag up/down | Adjust (150px = full range) |
| Shift+drag | Fine mode — 0.1× sensitivity |
| **Ctrl/Cmd+click** | Reset to default (standard pro-audio convention) |
| **dblclick** | Open inline text entry — type exact value, Enter commits, Esc cancels |
| **Enter or Space** (knob focused) | Same inline text entry |
| Arrow Up/Right | +1 step |
| Arrow Down/Left | −1 step |
| **Shift+Arrow** | ±10× step (coarse nudge) |
| **Ctrl/Cmd+Arrow** | ±0.1× step (ultra-fine nudge) |
| PageUp / PageDown | ±10× step |
| Home / End | Jump to min / max |
| Delete / Backspace | Reset to default |
| Mouse wheel | ±1 step per notch (fine by default) |
| **Shift+wheel** | ±10× step (coarse scroll) |

### Inline text entry popup (`.knob-entry-input`)

Opened by `openKnobTextEntry()` (defined just above `initKnob`). Replaces the `.knob-val` tooltip visually while open. Dismissed by Enter (commit), Esc (cancel), or blur (commit). Only one open at a time (`_activeKnobEntry` singleton). The host knob gets `.entering` class while open (orange outline ring).

CSS tokens used: `--bg-stage` background, `1.5px solid var(--orange-signal)` border, `var(--font-body)` font, positioned `absolute` at `bottom: calc(-1 * var(--space-xl))` — same anchor as `.knob-val`.

### Key constants (`src/main.js`)

```js
const KNOB_DRAG_PX = 150;   // px of vertical drag = full range
const WHEEL_TICK_PX = 40;   // px of deltaY = one logical wheel tick
const KNOB_ARC_LEN = 75;    // SVG pathLength units for the 270° arc
```

### Design reference apps

FabFilter (Pro-Q 3, Saturn 2), Serum 2, Native Instruments Komplete UI, Ableton Push — all converge on the same modifier-key grammar: Shift = fine, Ctrl/Cmd = reset-or-ultra-fine, dblclick = type-in. Arrow keys + PageUp/Down for keyboard accessibility.

## Where fluidity is needed (and what "fluid" means here)

LumiSynth is a hardware-instrument UI. "Fluid" does NOT mean soft animations or
bouncy spring physics — it means **zero perceived lag between intent and response**.
Fluid for this project means:

1. **Hover responses feel immediate** — background color, border-color, and text-color
   transitions should use `--duration-base` (150ms) or shorter with `--ease-out`.
   Any hover that uses `--duration-slow` feels sluggish; push it to `--duration-base`.

2. **Active-state flips are snappy** — toggle `.active` class changes (orange fill)
   should use CSS `transition` only on the properties that actually change
   (`background`, `color`, `border-color`) rather than shorthand `all`. Shorthand
   `all` bleeds into layout properties and can cause jank.

3. **Knob value tooltip appears without delay** — `.knob-val` visibility is controlled
   by JS showing/hiding, but the fade should use `--duration-fast` (120ms) not base.

4. **Effect card show/hide is smooth** — `.effect-card` currently appears/disappears
   via `.hidden` (display:none). This is a hard cut. Adding a height-or-opacity
   collapse animation is NOT recommended (it triggers layout; defeats `contain:
   layout style paint`). Instead, ensure the card already exists in DOM and only
   visibility toggles — which is the current pattern. Accept the cut; it is correct
   for a dense instrument UI.

5. **Toast enters cleanly** — already has `toast-in` keyframe. Verify `--duration-slow`
   is used and `prefers-reduced-motion` is respected.

6. **Sidebar scroll is smooth** — `#sidebar` has `overflow-y: auto`. Add
   `scroll-behavior: smooth` only if the sidebar programmatically scrolls to a section
   (JS `scrollIntoView`). Do NOT add it globally; it can interfere with instant-jump
   scrubbing on the timeline.

7. **Filter swatch hover scrim transition** — `.filter-swatch-group .toggle-btn::before`
   already has `transition: background var(--duration-base) var(--ease-out)`. Verify
   the duration is not longer.

8. **Color rack slot expand/collapse** — `.color-rack-slot-panel` is conditionally
   appended to the DOM (not pre-rendered hidden) by `renderFxSlotPanel()` /
   `renderTrackFxSlotPanel()` / `renderBlobFxSlotPanel()` in main.js. Because the
   element doesn't exist until the chevron is clicked, a CSS `max-height` transition
   cannot fire on entry. To animate this properly you would need to always pre-append
   the panel (with `display:none` or `visibility:hidden`) and toggle class — a JS
   change. Acceptable workaround without JS changes: accept the hard-cut reveal but
   ensure the slot row itself has a hover background transition (implemented in the
   CSS already via `.color-rack-slot:hover > .color-rack-slot-row`).

9. **Toggle group active change has no border-color transition** — `.toggle-btn`
   transition currently omits `border-color`. The orange border appears instantly;
   adding `border-color var(--duration-base) var(--ease-out)` to the transition
   declaration makes the state change feel physically pressed.

10. **Icon button `active` transform** — `.icon-btn:active { transform: translateY(1px); }`
    and `.action-btn:active { transform: translateY(1px); }` already exist, which is
    correct. Ensure no `transition` property fights this (translateY with a long ease
    would feel spongy). The transform should be instant (no `transition: transform`).

## Task: make the UI more fluid

Run through this checklist when the user says "make the UI more fluid":

### CSS changes applied to `src/style.css` (already shipped)

**1. `border-color` added to `.toggle-btn` transition** — active state flip now
   smoothly transitions the orange border rather than popping it in.

**2. `scroll-behavior: smooth` on `#sidebar`** — JS calls `card.scrollIntoView()`
   in `main.js`; now the sidebar scrolls fluidly to the active effect card.

**3. `card-enter` keyframe on `.effect-card`** — a 150ms `opacity 0→1 + translateY(4px→0)`
   entry animation fires every time an effect card becomes visible (when `.hidden` is
   removed). Gated by `prefers-reduced-motion`.

**4. Scale hover on `.filter-swatch-group .toggle-btn`** — 1.03× scale on hover gives
   tactile "key press" feedback; uses `--duration-fast` (120ms) so it's snappy not
   floaty. `z-index:1` prevents clipping by siblings. Gated by `prefers-reduced-motion`.

**5. Slot row hover background** — `.color-rack-slot:hover > .color-rack-slot-row`
   fills to `--surface-hover` with `--duration-fast` transition, giving hover feedback
   to the entire rack row without touching individual child buttons.

### Changes that were already correct (no edit needed)

- `.color-pick` — already has `border-color` in its transition.
- `.effect-card` — already has `border-color` transition for active state.
- Toast — already uses `--duration-slow` with `toast-in` keyframe.
- `.filter-swatch-group .toggle-btn::before` scrim — already transitions at `--duration-base`.
- `#drop-overlay` — already transitions opacity.
- `.help-tooltip` — already uses `--duration-fast` fade.
- `prefers-reduced-motion` block — already present; new entries added to it.

### What NOT to do

- Do not add CSS `transition: all` anywhere.
- Do not add `animation` to sidebar sections appearing/disappearing (mode gating uses
  `display: none !important` and cannot be animated without rearchitecting).
- Do not add spring / bounce easing (`cubic-bezier` with values > 1.0 on the y-axis).
  The TE hardware aesthetic is snappy, not bouncy.
- Do not add `transition: transform` to `.icon-btn` or `.action-btn` — the 1px
  active drop must feel instant (it IS the tactile click response).
- Do not add `transition: height` on `.effect-card` (uses `contain: layout`).
- Do not add `transition: opacity` or `visibility` on `.hidden` elements — `display:none`
  skips rendering and is intentional.

## Adding or changing a component

1. **Look up the component in DESIGN.md** for the intended anatomy.
2. Use tokens (`--space-*`, `--surface-*`, `--text-*`, `--orange-signal`, etc.). No
   raw hex values for chassis surfaces.
3. Match the `border-radius` to the component's size tier (small inline = `3px sm`,
   cards = `8px 2xl`, modals = `10px 3xl`).
4. Add only `background`, `color`, and `border-color` to `transition` — never `all`,
   never `width/height` (causes layout jank), never `transform` unless it's a
   deliberate press-down effect.
5. If a new interactive element can receive focus (button, input, select), it must
   have `:focus-visible` styling matching the existing `outline: 2px solid
   var(--orange-signal); outline-offset: 2px`.
6. Gate new animations behind `prefers-reduced-motion` at the bottom of `style.css`.
7. Do not edit `index.html` for new COLOR effects (the grid builds from JS data).
   Do edit `index.html` for new STRUCTURE effects (picker button + controls section).

## Verification

After any CSS change:
```bash
npm run dev   # visual check in browser at http://localhost:5173
npm run build # confirm no Vite build errors
```

No linter; correctness is verified visually. Test:
- Hover every changed component (background change, border change)
- Tab through (focus-visible ring appears)
- Click toggles (active state instant, no jank)
- Open/close color rack slot panel (smooth max-height collapse if implemented)
- Toast (enter animation plays)
- Reduced motion: add `prefers-reduced-motion: reduce` in browser devtools and confirm
  all transitions are suppressed
