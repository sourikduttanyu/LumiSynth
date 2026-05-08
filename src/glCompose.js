/**
 * Compose pass — bakes a STRUCTURE stage's blend mode against the original
 * video before COLOR sees it. Lives outside the effect modules so all
 * STRUCTURE effects benefit without per-shader edits.
 *
 * Why this exists:
 *   Voronoi/wave/cellular were designed to screen-blend over the source
 *   video at composite time. In single-effect dispatch the orchestrator
 *   honors that by composite blend mode (BLEND_MODES[name]). In chain
 *   mode (P2b), STRUCTURE writes to an intermediate FBO and COLOR samples
 *   that FBO — so the screen-over-video character is lost unless we
 *   apply it explicitly here, before COLOR runs.
 *
 *   Effects whose blend mode is 'source-over' (ascii, shatter, erode)
 *   need NO compose pass — their output already replaces the video, so
 *   the chain orchestrator skips this call entirely for them. The
 *   per-frame cost is therefore zero for half the STRUCTURE catalog.
 *
 * Pipeline position:
 *   video → STRUCTURE → tex_A
 *                ↓
 *           compose(video, tex_A) → tex_B
 *                                       ↓
 *                                    COLOR → screen
 */

import { ensureContext, getGL, getVideoTex } from './glContext.js';

const VERT = `#version 300 es
in vec2 a_pos;
out vec2 vUV;
void main() {
  vUV = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

// Hardcodes screen blend, the only non-pass-through blend mode any
// current STRUCTURE effect uses (voronoi/wave/cellular). If a future
// STRUCTURE adopts a different blend mode (multiply, overlay, lighten,
// etc.), extend with a u_mode uniform + branch — until then this is
// dead code minimization.
//
// Screen formula: result = 1 - (1 - a) * (1 - b)
// Both inputs are opaque RGBA; output stays opaque. Alpha forced to 1
// because the chain texture must be fully opaque for COLOR's grade to
// behave consistently regardless of intermediate alpha noise.
const FRAG = `#version 300 es
precision highp float;
in vec2 vUV;
uniform sampler2D u_video;
uniform sampler2D u_struct;
out vec4 fragColor;
void main() {
  vec3 v = texture(u_video,  vUV).rgb;
  vec3 s = texture(u_struct, vUV).rgb;
  vec3 r = vec3(1.0) - (vec3(1.0) - v) * (vec3(1.0) - s);
  fragColor = vec4(r, 1.0);
}`;

// ---- Shader compile (mirrors the pattern used by ascii.js / glFilters.js) ----

function compileShader(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error('[compose] shader:', gl.getShaderInfoLog(s));
    return null;
  }
  return s;
}

function createProgram(gl, vSrc, fSrc) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vSrc);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fSrc);
  if (!vs || !fs) return null;
  const p = gl.createProgram();
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.bindAttribLocation(p, 0, 'a_pos');
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.error('[compose] link:', gl.getProgramInfoLog(p));
    return null;
  }
  return p;
}

let M = null;

function init() {
  const gl = getGL();
  if (!gl) return null;
  const prog = createProgram(gl, VERT, FRAG);
  if (!prog) return null;
  return {
    prog,
    u: {
      video:  gl.getUniformLocation(prog, 'u_video'),
      struct: gl.getUniformLocation(prog, 'u_struct'),
    },
  };
}

/**
 * Run the compose pass: screen-blend `structTex` over the shared video tex,
 * write the result into `outputFBO`. Caller must have already called
 * ensureContext + uploadVideoFrame for the current frame; the orchestrator
 * (renderFrame) owns both.
 *
 * @param {number} cw, ch
 * @param {WebGLTexture}     structTex   STRUCTURE stage's output texture
 * @param {WebGLFramebuffer} outputFBO   Where to write the composed result
 *                                       (typically chainFBOs.b.fb)
 */
export function applyCompose(cw, ch, structTex, outputFBO) {
  const S = ensureContext(cw, ch);
  if (!S) return;
  if (!M) {
    M = init();
    if (!M) return;
  }
  const { gl, vao } = S;
  const videoTex = getVideoTex();

  gl.viewport(0, 0, cw, ch);
  gl.bindVertexArray(vao);
  gl.bindFramebuffer(gl.FRAMEBUFFER, outputFBO);

  gl.useProgram(M.prog);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, videoTex);  gl.uniform1i(M.u.video,  0);
  gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, structTex); gl.uniform1i(M.u.struct, 1);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
