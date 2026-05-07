/**
 * Pixel filters applied to blob bounding box regions.
 */

// Thermal lookup table: 256 entries, each [R, G, B]
export const THERMAL_LUT = (() => {
  const lut = new Array(256);
  const stops = [
    [0,   [0,   0,   0]],
    [50,  [0,   102, 0]],
    [100, [0,   0,   255]],
    [150, [204, 0,   204]],
    [200, [255, 0,   102]],
    [255, [255, 255, 255]],
  ];
  function lerp(a, b, t) { return Math.round(a + (b - a) * t); }
  for (let v = 0; v < 256; v++) {
    let lo = stops[0], hi = stops[stops.length - 1];
    for (let s = 0; s < stops.length - 1; s++) {
      if (v >= stops[s][0] && v <= stops[s + 1][0]) { lo = stops[s]; hi = stops[s + 1]; break; }
    }
    const t = lo[0] === hi[0] ? 0 : (v - lo[0]) / (hi[0] - lo[0]);
    lut[v] = [lerp(lo[1][0], hi[1][0], t), lerp(lo[1][1], hi[1][1], t), lerp(lo[1][2], hi[1][2], t)];
  }
  return lut;
})();

/**
 * Apply filter in-place to an entire ImageData buffer (a pre-extracted sub-region).
 * Caller is responsible for extracting and writing back with getImageData/putImageData.
 */
export function applyFilterToRegion(data, filter) {
  if (filter === 'none') return;
  const total = data.length / 4;
  for (let i = 0; i < total; i++) {
    const off = i * 4;
    const r = data[off], g = data[off + 1], b = data[off + 2];
    if (filter === 'inv') {
      data[off]     = 255 - r;
      data[off + 1] = 255 - g;
      data[off + 2] = 255 - b;
    } else if (filter === 'thermal') {
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      const [tr, tg, tb] = THERMAL_LUT[gray];
      data[off] = tr; data[off + 1] = tg; data[off + 2] = tb;
    }
  }
}
