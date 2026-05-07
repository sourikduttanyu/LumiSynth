/**
 * Blob detection via frame differencing + connected-component labeling.
 * Detects regions of change between frames — works on any video content.
 */

// Previous frame luminance buffer (reused across calls)
let prevLum = null;

// Call this when video source changes to reset frame history
export function resetFrameHistory() {
  prevLum = null;
}

/**
 * @param {ImageData} imageData  current frame
 * @param {number} threshold     luminance change sensitivity 0-100 (lower = more sensitive)
 * @param {number} maxBlobs      maximum blobs to return
 * @returns {Array<{x,y,w,h,cx,cy,area,score,index}>}
 */
export function detectBlobs(imageData, threshold, maxBlobs) {
  const { width, height, data } = imageData;
  const total = width * height;

  // Compute current frame luminance
  const curLum = new Float32Array(total);
  for (let i = 0; i < total; i++) {
    const off = i * 4;
    curLum[i] = 0.299 * data[off] + 0.587 * data[off + 1] + 0.114 * data[off + 2];
  }

  // Build foreground mask from frame difference
  const mask = new Uint8Array(total);
  if (prevLum !== null && prevLum.length === total) {
    for (let i = 0; i < total; i++) {
      mask[i] = Math.abs(curLum[i] - prevLum[i]) > threshold ? 1 : 0;
    }
  }
  // On first frame (no prev): mask stays all zeros → no blobs detected yet

  // Store current as previous for next frame
  prevLum = curLum;

  // Two-pass connected component labeling with union-find
  const labels = new Int32Array(total);
  const parent = new Int32Array(total + 1);
  let nextLabel = 1;

  function find(x) {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  }
  function union(a, b) {
    a = find(a); b = find(b);
    if (a !== b) parent[b] = a;
  }

  for (let i = 0; i <= total; i++) parent[i] = i;

  // First pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (!mask[idx]) continue;

      const top  = y > 0 ? labels[(y - 1) * width + x] : 0;
      const left = x > 0 ? labels[y * width + (x - 1)] : 0;

      if (!top && !left) {
        labels[idx] = nextLabel++;
      } else if (top && !left) {
        labels[idx] = top;
      } else if (!top && left) {
        labels[idx] = left;
      } else {
        const rootTop  = find(top);
        const rootLeft = find(left);
        labels[idx] = Math.min(rootTop, rootLeft);
        union(rootTop, rootLeft);
      }
    }
  }

  // Second pass — collect blob stats
  const blobMap = new Map();
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const lbl = labels[idx];
      if (!lbl) continue;
      const root = find(lbl);
      let b = blobMap.get(root);
      if (!b) {
        b = { minX: x, minY: y, maxX: x, maxY: y, sumX: x, sumY: y, area: 0 };
        blobMap.set(root, b);
      }
      if (x < b.minX) b.minX = x;
      if (y < b.minY) b.minY = y;
      if (x > b.maxX) b.maxX = x;
      if (y > b.maxY) b.maxY = y;
      b.sumX += x;
      b.sumY += y;
      b.area++;
    }
  }

  // Filter by min area, sort by area, take top N
  const MIN_AREA = 300;
  let blobs = [];
  for (const [, b] of blobMap) {
    if (b.area < MIN_AREA) continue;
    blobs.push({
      x: b.minX,
      y: b.minY,
      w: b.maxX - b.minX + 1,
      h: b.maxY - b.minY + 1,
      cx: b.sumX / b.area,
      cy: b.sumY / b.area,
      area: b.area,
      score: 0,
      index: 0,
    });
  }

  blobs.sort((a, b) => b.area - a.area);
  if (blobs.length > maxBlobs) blobs = blobs.slice(0, maxBlobs);

  // Normalized score = area / maxArea (largest blob = 1.0)
  if (blobs.length > 0) {
    const maxArea = blobs[0].area;
    blobs.forEach((b, i) => {
      b.score = maxArea > 0 ? b.area / maxArea : 0;
      b.index = i;
    });
  }

  return blobs;
}
