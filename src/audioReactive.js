/**
 * Audio-reactivity engine — Phase 1 of REACTIVITY_PLAN.md.
 *
 * Web Audio FFT → a small signal bus { bass, mid, high, level, beat }. This
 * phase ONLY produces signals + feeds a meter; no routing to params yet (the
 * mod matrix / step sequencer come in later phases). The bus is the shared
 * backbone a future MediaPipe VJ source would also fill.
 *
 * Three inputs, all robust:
 *   - mic    — getUserMedia, never connected to the speakers (no feedback)
 *   - file   — a dedicated <audio> element, routed to the speakers so you hear it
 *   - source — the app's shared <video> own audio track (uploaded clips only;
 *              webcam is captured audio:false). createMediaElementSource is
 *              once-only per element, so the node is cached; the video is
 *              unmuted while reacting and restored on stop.
 *
 * Signals are smoothed (fast attack / slow release) and auto-gained so they
 * read the same at any input volume. `beat` is an onset trigger (bass energy
 * vs. its rolling average) that decays each frame.
 */

const FFT_SIZE = 2048;

let ctx = null;
let analyser = null;
let freqData = null;

let inputNode = null;    // the source node currently feeding the analyser
let inputLabel = null;   // 'mic' | 'file' | 'source' | null
let micStream = null;
let fileEl = null;       // dedicated <audio> for file playback
let elSourceNode = null; // cached MediaElementSource for the shared <video>
let videoEl = null;      // shared video ref (to restore mute on stop)
let videoWasMuted = true;

const sig = { bass: 0, mid: 0, high: 0, level: 0, beat: 0 };

// Per-band auto-normalization: each band tracks its OWN recent peak so bass
// (naturally hot) and highs (naturally quiet) each use the full 0–1 range.
// A single global gain can't do this — it pins bass and starves highs.
const peak = { bass: 0.06, mid: 0.06, high: 0.06, level: 0.06 };
const PEAK_DECAY = 0.995;   // ~2s half-life so it adapts down after loud parts
const PEAK_FLOOR = 0.06;    // never divide by ~0 (would amplify silence to noise)
const beatState = { armed: false, last: -1e9, env: 0 };

// User calibration (transient): a Gain trim per band + Beat onset sensitivity.
const cfg = { gainBass: 1, gainMid: 1, gainHigh: 1, gainLevel: 1, beatSens: 0.5 };
export function getConfig() { return { ...cfg }; }
export function setConfig(key, value) { if (key in cfg) cfg[key] = value; }

export function isActive() { return !!inputNode; }
export function currentInput() { return inputLabel; }
export function getSignals() { return sig; }

/** Per-band normalize against a decaying peak. Pure — exported for testing. */
export function normBand(raw, prevPeak) {
  const p = Math.max(prevPeak * PEAK_DECAY, raw, PEAK_FLOOR);
  return { peak: p, value: Math.min(1, raw / p) };
}

/** Onset threshold from the Beat sensitivity knob (0 = hard, 1 = hair-trigger). */
export function beatThreshold(beatSens) { return 0.62 - beatSens * 0.42; }

/**
 * Hysteresis beat detector on the normalized bass. Fires on a rising edge over
 * the threshold after dropping below (threshold − gap), with a refractory gap —
 * robust on sustained basslines where a "vs. rolling average" test never fires.
 * Mutates `s = {armed, last, env}`; returns true on a fresh hit. Pure-ish for
 * testing (no module globals).
 */
export function beatStep(s, normBass, t, beatSens) {
  const thr = beatThreshold(beatSens);
  let fired = false;
  if (!s.armed && normBass > thr && (t - s.last) > 160) {
    s.env = 1; s.last = t; s.armed = true; fired = true;
  }
  if (normBass < thr - 0.12) s.armed = false;
  s.env *= 0.86;
  return fired;
}

function ensureCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    analyser = ctx.createAnalyser();
    analyser.fftSize = FFT_SIZE;
    analyser.smoothingTimeConstant = 0.6;
    freqData = new Uint8Array(analyser.frequencyBinCount);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function resetDynamics() {
  peak.bass = peak.mid = peak.high = peak.level = PEAK_FLOOR;
  beatState.armed = false; beatState.last = -1e9; beatState.env = 0;
}

function detachAll() {
  if (inputNode) { try { inputNode.disconnect(); } catch (_) {} }
  inputNode = null;
  if (analyser) { try { analyser.disconnect(); } catch (_) {} }
  if (micStream) { micStream.getTracks().forEach((t) => t.stop()); micStream = null; }
  if (fileEl) { try { fileEl.pause(); URL.revokeObjectURL(fileEl.src); } catch (_) {} fileEl = null; }
  if (videoEl) { videoEl.muted = videoWasMuted; videoEl = null; }
}

export async function startMic() {
  if (!ensureCtx()) throw new Error('Web Audio not supported');
  detachAll();
  micStream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
  });
  inputNode = ctx.createMediaStreamSource(micStream);
  inputNode.connect(analyser);   // NOT to destination — would feed back
  inputLabel = 'mic';
  resetDynamics();
}

export function startFile(file) {
  if (!ensureCtx()) throw new Error('Web Audio not supported');
  detachAll();
  fileEl = document.createElement('audio');
  fileEl.src = URL.createObjectURL(file);
  fileEl.loop = true;
  fileEl.play().catch(() => {});
  inputNode = ctx.createMediaElementSource(fileEl);
  inputNode.connect(analyser);
  analyser.connect(ctx.destination);   // hear the track
  inputLabel = 'file';
  resetDynamics();
}

export function startElement(v) {
  if (!ensureCtx()) throw new Error('Web Audio not supported');
  detachAll();
  videoEl = v;
  videoWasMuted = v.muted;
  v.muted = false;                      // react to (and hear) the source track
  if (!elSourceNode) elSourceNode = ctx.createMediaElementSource(v);  // once-only
  inputNode = elSourceNode;
  inputNode.connect(analyser);
  analyser.connect(ctx.destination);
  inputLabel = 'source';
  resetDynamics();
}

export function stop() {
  detachAll();
  inputLabel = null;
  sig.bass = sig.mid = sig.high = sig.level = sig.beat = 0;
}

/**
 * Pure band extraction — exported for testing. Sums normalized FFT magnitude
 * over three frequency bands. `binHz` = sampleRate / fftSize.
 */
export function computeBands(freq, binHz) {
  const band = (lo, hi) => {
    const a = Math.max(1, Math.floor(lo / binHz));
    const b = Math.min(freq.length - 1, Math.ceil(hi / binHz));
    let s = 0;
    for (let i = a; i <= b; i++) s += freq[i];
    return (s / (b - a + 1)) / 255;
  };
  const bass = band(20, 150);
  const mid = band(150, 2000);
  const high = band(2000, 9000);
  return { bass, mid, high, level: (bass + mid + high) / 3 };
}

function env(prev, target) {
  return target > prev ? prev + (target - prev) * 0.55   // fast attack
                       : prev + (target - prev) * 0.14;  // slow release
}

/** Read the FFT and update the signal bus. Call once per frame while active. */
export function update(now) {
  if (!inputNode) return sig;
  analyser.getByteFrequencyData(freqData);
  const binHz = ctx.sampleRate / analyser.fftSize;
  const b = computeBands(freqData, binHz);

  // Per-band normalize against each band's own decaying peak, then apply the
  // user Gain trim, a tiny noise floor, and the attack/release envelope.
  const shape = (raw, bandKey, gain) => {
    const n = normBand(raw, peak[bandKey]);
    peak[bandKey] = n.peak;
    let v = n.value * gain;
    if (v < 0.04) v = 0;
    return Math.min(1, v);
  };
  // normalized bass (pre-gain) drives the beat detector, so compute it directly
  const nb = normBand(b.bass, peak.bass);
  peak.bass = nb.peak;
  let vb = nb.value * cfg.gainBass;
  if (vb < 0.04) vb = 0;
  sig.bass = env(sig.bass, Math.min(1, vb));
  sig.mid = env(sig.mid, shape(b.mid, 'mid', cfg.gainMid));
  sig.high = env(sig.high, shape(b.high, 'high', cfg.gainHigh));
  sig.level = env(sig.level, shape(b.level, 'level', cfg.gainLevel));

  const t = now || performance.now();
  beatStep(beatState, nb.value, t, cfg.beatSens);
  sig.beat = beatState.env;
  return sig;
}
