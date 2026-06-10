---
name: bigbrain-mode
description: Adds TouchDesigner-derived WebGL effects to LumiSynth. Use when the user says "use BigBrain mode" in any casing, or provides TouchDesigner GLSL/code and asks to add a COLOR, STRUCTURE, or FX (feedback) effect to this repo.
disable-model-invocation: true
---

# BigBrain Mode

## Trigger

When the user says `use BigBrain mode` in any casing, enter this workflow before modifying code.

## Purpose

Help developers convert real TouchDesigner GLSL/code into LumiSynth WebGL2 effects and wire them into the app as one of:

- `COLOR (MAPS)`: a pure per-pixel color map in the COLOR stage's MAPS tab — ramps, grades, palette swaps; the shader looks at one pixel only. Stateless single-frame pass. (v8 retired the color rack; one color is selected at a time and looks are layered via timeline segments.)
- `COLOR (UNIQUE)`: an effect in the COLOR stage's UNIQUE tab — it BUILDS something: samples neighbors, adds elements (stars, halos, streaks), displaces, glows. Stateless single-frame pass, organized into labeled categories (Atmosphere / Light / Dimension / new ones as needed).
- `STRUCTURE`: the single geometry/pattern stage that feeds the COLOR stage. Stateless single-frame pass.
- `FX`: a rack slot effect in the FX RACK, which runs AFTER COLOR + GRADE. Two kinds: stateless signal/texture passes (bloom, CRT, grain — single-frame, shaders in glFilters.js), and feedback passes (`feedback: true` in the schema, shaders in glFx.js) where each slot keeps a persistent feedback texture between frames (`u_feedback`) — the right target for TouchDesigner networks built around a Feedback TOP (trails, decay, recursive warps).

The goal is a complete repo integration, not just a shader paste. A finished change should compile, appear in the UI, persist correctly, and respect the existing render pipeline.

Routing rule: if the supplied TouchDesigner code samples a feedback input (e.g. `sTD2DInputs[1]` fed by a Feedback TOP) or otherwise depends on its own previous-frame output, it belongs in `FX`. Do not flatten it into a stateless COLOR approximation unless the user explicitly asks for that (see `decayflow` vs `flowfield` for the difference).

## First Moves

1. Read `CLAUDE.md`.
2. Read `WEBGL_REFERENCE.md` in this skill directory.
3. Inspect the current implementation before editing:
   - `src/schemas.js`
   - `src/glFilters.js`
   - `src/glFx.js` if the effect is FX (feedback/temporal)
   - `src/main.js`
   - `index.html`
   - `src/glContext.js` if the change touches GL orchestration.
4. Work on a branch that is not `main`:
   - Run `git status --short` and `git branch --show-current`.
   - If the current branch is `main`, create a new branch named `bigbrain/<effect-slug>` before edits.
   - Preserve unrelated dirty work. Do not reset, checkout, or overwrite user changes.

## Input Discipline

- Do not guess what a TouchDesigner uniform, texture input, channel, or parameter means. If the provided code is incomplete, say: `I don't know based on the provided information.` Then ask for the missing code or parameter mapping.
- Do not invent mock shaders, placeholder palettes, or sample parameter values. Use values from the supplied code or ask the user to choose.
- If the user does not say whether the effect is COLOR, STRUCTURE, or FX, ask before editing — except when the code clearly depends on a feedback input, which routes to FX (see routing rule above).
- Require real source material: TouchDesigner GLSL/code, intended effect name, COLOR vs STRUCTURE vs FX target, and parameter mapping for each exposed knob/toggle.
- If the TouchDesigner code depends on time, multiple non-feedback TOP inputs, external textures, or more than four user parameters, identify that dependency before coding. Single-feedback-input dependency is supported via the FX RACK.

## Developer Prompt Shape

Ask developers to provide:

```text
use BigBrain mode

Add this as a COLOR effect named <effect-slug>.
Here is the TouchDesigner GLSL/code:
<real code>

Parameter mapping:
uParams.x = ...
uParams.y = ...
uParams.z = ...
uParams.w = ...
```

For STRUCTURE, the prompt should say `Add this as a STRUCTURE effect` and include the desired output behavior for `mono`, `source`, and `ink`.

For FX, the prompt should say `Add this as an FX effect` and identify which TouchDesigner input is the feedback (`sTD2DInputs[1]` etc.).

## Integration Rules

- Keep the app vanilla JS + Vite + raw WebGL2. Do not add TypeScript, frameworks, component libraries, Tailwind, three.js, or transpilation.
- Prefer stateless single-pass WebGL2 effects in `src/glFilters.js`. Feedback/temporal effects go in `src/glFx.js` as FX RACK effects.
- Match the existing shader interface: `in vec2 vUV`, `uniform sampler2D u_video`, `uniform vec4 uParams`, `out vec4 fragColor`. FX shaders add `uniform sampler2D u_feedback` (previous frame's own output).
- Always call `gl.bindAttribLocation(prog, 0, 'a_pos')` before linking if creating a new program.
- Do not upload video or composite inside effect modules. `renderFrame` owns `ensureContext`, `uploadVideoFrame`, GL dispatch, and `compositeToCanvas2D`.
- Never read and write the same FBO texture in one draw. FX effects satisfy this with a per-slot ping-pong feedback pair (read one side, write the other, swap after the copy pass).
- FX feedback state must reset to black on source change, timeline segment change, slot swap/clear/disable, and resize — and must NOT reset on knob tweaks. `glFx.js` exports `resetFxFeedback(key?)`; slot mutations and `resetAllState` in `main.js` already call it.
- Copy FX output to the chain via a passthrough draw, never `gl.blitFramebuffer` (the default framebuffer may be antialiased; single→multisample blits are INVALID_OPERATION in WebGL2).

## COLOR Effect Checklist (MAPS and UNIQUE)

Add the effect to the COLOR stage's library. Do NOT touch the tab/panel
mechanics in `main.js` — the grids and knob panels build themselves from the
data below. The ONLY difference between a MAPS add and a UNIQUE add is step 3.

1. `src/glFilters.js`: add a `FRAG_<NAME>` shader and register it in `FRAGS`.
2. `src/schemas.js`: add `COLOR_PARAM_SCHEMAS[slug]` with knobs/toggles and an `order` array matching `uParams.xyzw`.
3. `src/schemas.js`: route by behavior —
   - Pure per-pixel mapping (no neighbor samples, no added elements): add the slug to `COLOR_MAP_SECTIONS`.
   - Builds something (neighbor sampling, added elements, displacement): add the slug to an existing category's `effects` array in `COLOR_UNIQUE_SECTIONS`, or add a new `{ key, label, effects }` category row if none fits.
   - Never edit `COLOR_SECTIONS` directly — it derives from both lists.
4. `src/schemas.js`: add the slug to `BLEND_MODES` (normally `source-over`).
5. `src/main.js`: add `COLOR_SWATCH_GRADIENTS[slug]`, `COLOR_LABEL[slug]`, and `COLOR_MAP_TIPS[slug]` entries. No index.html edits — both grids are built from these at startup.
6. Verify: the effect appears in its tab (with its category header if UNIQUE), clicking it selects it and renders its knobs, knob tweaks persist per effect (switch away and back — values held), and the GRADE knobs re-tint it.

## FX Effect Checklist

Add the effect as a per-slot FX RACK stage (runs after the COLOR stage + GRADE).
First decide which kind it is:

**Stateless signal/texture effect** (single-frame — bloom/CRT/grain family):

1. `src/glFilters.js`: add a `FRAG_<NAME>` shader and register it in `FRAGS` (NOT glFx.js — that module is feedback-only).
2. `src/schemas.js`: add `FX_PARAM_SCHEMAS[slug]` (no `feedback` flag) with knobs and an `order` array matching `uParams.xyzw`.
3. `src/schemas.js`: add the slug to `FX_SECTIONS` and `BLEND_MODES`.
4. `src/main.js`: add `FX_SWATCH_GRADIENTS`, `FX_LABEL`, and `FX_CHIP_TIP` entries. No index.html edits — the picker popover builds itself from `FX_SECTIONS`.
5. Verify it works in any rack slot, chained before/after other FX, and persists.

**Feedback effect** (TouchDesigner Feedback TOP networks):

1. `src/glFx.js`: add a `FRAG_<NAME>` shader (with `u_video` + `u_feedback`) and register it in `FX_FRAGS`. The shared `applyFxEffect` already handles the feedback ping-pong, the copy pass, and per-slot buffer keying — a new effect normally only needs the fragment shader and registry entry.
2. `src/schemas.js`: add `FX_PARAM_SCHEMAS[slug]` WITH `feedback: true` (this is what routes dispatch to glFx.js) and an `order` array matching `uParams.xyzw`.
3. `src/schemas.js`: add the slug to `FX_SECTIONS` and `BLEND_MODES`.
4. `src/main.js`: add `FX_SWATCH_GRADIENTS`, `FX_LABEL`, and `FX_CHIP_TIP` entries. No index.html edits.
5. Verify the effect works in any rack slot, that trails accumulate over time, that knob tweaks do NOT reset trails, and that slot swap/clear/disable + source change DO reset them.

## STRUCTURE Effect Checklist

Add the effect as the single STRUCTURE stage:

1. `src/schemas.js`: add default state keys for the structure knobs.
2. `src/schemas.js`: add the slug to `STRUCTURE_SECTIONS` and `BLEND_MODES`.
3. `src/glFilters.js`: add a `FRAG_<NAME>` shader and register it in `FRAGS`, unless it needs a dedicated module like `src/ascii.js`.
4. `src/main.js`: add `runEffect` dispatch with the correct state-to-`uParams` order.
5. `index.html`: add the structure picker button and a matching `<section id="<slug>-controls">`.
6. If persisted state shape changes, bump `STORAGE_KEY` and explain why.
7. Verify output modes `mono`, `source`, and `ink` if the shader emits a structure mask.

## Verification

Run `npm run build`. If browser behavior changed, also run or manually verify with `npm run dev` because this repo has no required linter and visual correctness matters.

Before finishing, report:

- Branch name used.
- Files changed.
- Whether the effect was added as COLOR, STRUCTURE, or FX.
- Verification command results.
