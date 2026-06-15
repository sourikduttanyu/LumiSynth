/**
 * Native high-quality video export via WebCodecs + mp4-muxer.
 *
 * This is a far better path than the MediaRecorder `Rec` button: MediaRecorder
 * gives browser-controlled VBR at a low default bitrate (soft, blocky); here we
 * drive a `VideoEncoder` directly at a high, explicit bitrate and mux clean
 * H.264 into an MP4 that plays natively everywhere.
 *
 * Capture path: each tick we draw the live display canvas into a FIXED-size
 * offscreen capture canvas, then hand that to a `VideoFrame`. Fixing the size
 * means a display resize mid-export can't corrupt the stream, and it lets us
 * offer resolution presets (Source / 1080p / 720p) by scaling on the way in.
 *
 * Real-time capture (length = however long you record, like Rec). A future
 * enhancement is offline-deterministic rendering for clock-driven sources
 * (shaders/images) — frame-perfect and faster than real time — see
 * REACTIVITY_PLAN-style notes; not built here.
 */

import { Muxer, ArrayBufferTarget } from 'mp4-muxer';

export function isSupported() {
  return typeof VideoEncoder !== 'undefined'
    && typeof VideoFrame !== 'undefined'
    && typeof EncodedVideoChunk !== 'undefined';
}

// Pick an H.264 level string that covers width×height×fps so the encoder
// accepts the config. High profile (0x64). Levels: 4.0 / 4.2 / 5.1 / 5.2.
function avcCodecFor(w, h, fps) {
  const mb = Math.ceil(w / 16) * Math.ceil(h / 16);
  const mbps = mb * fps;
  let level;
  if (mb <= 8192 && mbps <= 245760) level = 0x28;        // 4.0  (1080p30)
  else if (mb <= 8704 && mbps <= 522240) level = 0x2a;   // 4.2  (1080p60)
  else if (mb <= 22080 && mbps <= 589824) level = 0x33;  // 5.1  (4K30)
  else level = 0x34;                                      // 5.2  (4K60)
  return `avc1.6400${level.toString(16).padStart(2, '0')}`;
}

async function chooseConfig({ width, height, fps, bitrate }) {
  const candidates = [
    avcCodecFor(width, height, fps),
    'avc1.640028',   // High 4.0
    'avc1.4d4028',   // Main 4.0
    'avc1.42e028',   // Baseline 4.0
  ];
  for (const codec of candidates) {
    const cfg = { codec, width, height, bitrate, framerate: fps, latencyMode: 'quality' };
    try {
      const s = await VideoEncoder.isConfigSupported(cfg);
      if (s && s.supported) return cfg;
    } catch (_) { /* try next */ }
  }
  return null;
}

/** High-quality bitrate for a resolution (≈0.12 bpp High, 0.2 bpp Max). */
export function bitrateFor(width, height, fps, quality) {
  const bpp = quality === 'max' ? 0.20 : 0.12;
  return Math.min(45_000_000, Math.max(2_000_000, Math.round(width * height * fps * bpp)));
}

/**
 * Low-level encode+mux session. `encodeCanvas(srcCanvas, tsMicros)` scales the
 * source into the fixed capture canvas and encodes one frame; `finish()` flushes
 * and returns an MP4 Blob.
 */
export async function createSession({ width, height, fps, bitrate }) {
  if (!isSupported()) throw new Error('WebCodecs not supported in this browser');
  const config = await chooseConfig({ width, height, fps, bitrate });
  if (!config) throw new Error('No supported H.264 encoder config for this size');

  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: 'avc', width, height, frameRate: fps },
    fastStart: 'in-memory',
  });

  let encErr = null;
  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => { encErr = e; },
  });
  encoder.configure(config);

  const cap = document.createElement('canvas');
  cap.width = width;
  cap.height = height;
  const cctx = cap.getContext('2d');

  const gop = Math.max(1, Math.round(fps * 2));   // keyframe every ~2s
  let n = 0;

  return {
    width, height, fps,
    encodeCanvas(srcCanvas, tsMicros) {
      if (encErr) throw encErr;
      // Backpressure: if the encoder is far behind, drop this frame rather than
      // pile up VideoFrames in memory.
      if (encoder.encodeQueueSize > 8) return false;
      cctx.drawImage(srcCanvas, 0, 0, width, height);
      const frame = new VideoFrame(cap, { timestamp: Math.max(0, Math.round(tsMicros)) });
      encoder.encode(frame, { keyFrame: n % gop === 0 });
      frame.close();
      n++;
      return true;
    },
    get frames() { return n; },
    async finish() {
      await encoder.flush();
      muxer.finalize();
      try { encoder.close(); } catch (_) {}
      if (encErr) throw encErr;
      return new Blob([muxer.target.buffer], { type: 'video/mp4' });
    },
    abort() { try { encoder.close(); } catch (_) {} },
  };
}

/**
 * Real-time recorder over a source canvas. Drives its own RAF loop, sampling the
 * canvas at `fps` and timestamping by real elapsed time (so the clip plays at the
 * correct speed even if the render dips below fps). `start()` then `stop()` →
 * MP4 Blob. `onTick({frames, ms})` for UI.
 */
export function createRealtimeRecorder({ sourceCanvas, width, height, fps, bitrate, onTick }) {
  let session = null, raf = 0, startT = 0, lastEmit = -1, stopped = false;
  const interval = 1000 / fps;

  async function start() {
    session = await createSession({ width, height, fps, bitrate });
    startT = performance.now();
    lastEmit = -1;
    stopped = false;
    const loop = (now) => {
      if (stopped) return;
      raf = requestAnimationFrame(loop);
      const elapsed = now - startT;
      if (lastEmit < 0 || (elapsed - lastEmit) >= interval - 0.5) {
        lastEmit = elapsed;
        try { session.encodeCanvas(sourceCanvas, elapsed * 1000); } catch (_) { stopped = true; }
        if (onTick) onTick({ frames: session.frames, ms: elapsed });
      }
    };
    raf = requestAnimationFrame(loop);
  }

  async function stop() {
    stopped = true;
    if (raf) cancelAnimationFrame(raf);
    if (!session) return null;
    return session.finish();
  }

  return { start, stop };
}
