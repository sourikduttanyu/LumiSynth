/**
 * Canvas overlay drawing: bounding boxes, labels, handles, connection lines.
 */

const STROKE_COLOR = 'rgba(255,255,255,0.95)';
const STROKE_WIDTH = 1;
const NUM_FONT = '11px SF Mono, Fira Code, monospace';
const LABEL_FONT = '11px SF Mono, Fira Code, monospace';

/**
 * Draw all overlays for one frame.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} blobs
 * @param {'basic'|'label'|'frame'} regionStyle
 * @param {'rect'|'circle'|'rounded'|'diamond'} shape
 * @param {number} connectionRate  0-1
 */
export function drawOverlays(ctx, blobs, regionStyle, shape, connectionRate) {
  if (blobs.length === 0) return;

  // Draw connection lines first (behind boxes)
  drawConnectionLines(ctx, blobs, connectionRate);

  // Draw bounding shapes + decorations
  for (const blob of blobs) {
    drawBlobShape(ctx, blob, regionStyle, shape);
  }
}

// ---- Connection lines ----

function drawConnectionLines(ctx, blobs, connectionRate) {
  if (connectionRate <= 0 || blobs.length < 2) return;

  // Generate all pairs sorted by distance
  const pairs = [];
  for (let i = 0; i < blobs.length; i++) {
    for (let j = i + 1; j < blobs.length; j++) {
      const dx = blobs[i].cx - blobs[j].cx;
      const dy = blobs[i].cy - blobs[j].cy;
      pairs.push({ i, j, dist: Math.sqrt(dx * dx + dy * dy) });
    }
  }
  pairs.sort((a, b) => a.dist - b.dist);

  const drawCount = Math.round(pairs.length * connectionRate);

  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 0.8;

  for (let p = 0; p < drawCount; p++) {
    const { i, j } = pairs[p];
    ctx.beginPath();
    ctx.moveTo(blobs[i].cx, blobs[i].cy);
    ctx.lineTo(blobs[j].cx, blobs[j].cy);
    ctx.stroke();
  }

  ctx.restore();
}

// ---- Blob shape drawing ----

function drawBlobShape(ctx, blob, regionStyle, shape) {
  const { x, y, w, h, cx, cy, score, index } = blob;

  ctx.save();
  ctx.strokeStyle = STROKE_COLOR;
  ctx.lineWidth = STROKE_WIDTH;

  // Draw the shape outline
  switch (shape) {
    case 'rect':
      drawRect(ctx, x, y, w, h);
      break;
    case 'circle':
      drawCircle(ctx, cx, cy, w, h);
      break;
    case 'rounded':
      drawRoundedRect(ctx, x, y, w, h, 6);
      break;
    case 'diamond':
      drawDiamond(ctx, cx, cy, w, h);
      break;
    default:
      drawRect(ctx, x, y, w, h);
  }

  // Region-style decorations
  if (regionStyle === 'basic') {
    drawBasicDecorations(ctx, blob);
  } else if (regionStyle === 'label') {
    drawLabelDecorations(ctx, blob);
  } else if (regionStyle === 'frame') {
    drawFrameDecorations(ctx, blob);
  }

  ctx.restore();
}

// ---- Shape helpers ----

function drawRect(ctx, x, y, w, h) {
  ctx.strokeRect(x, y, w, h);
}

function drawCircle(ctx, cx, cy, w, h) {
  const rx = w / 2;
  const ry = h / 2;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
  ctx.stroke();
}

function drawDiamond(ctx, cx, cy, w, h) {
  const hw = w / 2;
  const hh = h / 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - hh);
  ctx.lineTo(cx + hw, cy);
  ctx.lineTo(cx, cy + hh);
  ctx.lineTo(cx - hw, cy);
  ctx.closePath();
  ctx.stroke();
}

// ---- Decoration helpers ----

function drawBasicDecorations(ctx, { x, y, score }) {
  // Score number at top-left corner of bounding box
  ctx.fillStyle = STROKE_COLOR;
  ctx.font = NUM_FONT;
  ctx.textBaseline = 'bottom';
  ctx.fillText(score.toFixed(4), x + 2, y - 2);
}

function drawLabelDecorations(ctx, { x, y, w, score, index }) {
  const label = `Object ${index + 1}`;
  ctx.font = LABEL_FONT;
  ctx.textBaseline = 'top';
  const metrics = ctx.measureText(label);
  const padX = 4, padY = 2;
  const rectW = metrics.width + padX * 2;
  const rectH = 14;

  // White filled tab
  ctx.fillStyle = STROKE_COLOR;
  ctx.fillRect(x, y - rectH, rectW, rectH);

  // Black text
  ctx.fillStyle = '#000000';
  ctx.fillText(label, x + padX, y - rectH + padY);
}

function drawFrameDecorations(ctx, { x, y, w, h, score }) {
  // 8 handle squares: 5x5 white filled
  const hs = 5;
  const hHalf = hs / 2;
  const handles = [
    [x, y],
    [x + w, y],
    [x, y + h],
    [x + w, y + h],
    [x + w / 2, y],
    [x + w / 2, y + h],
    [x, y + h / 2],
    [x + w, y + h / 2],
  ];

  ctx.fillStyle = STROKE_COLOR;
  for (const [hx, hy] of handles) {
    ctx.fillRect(hx - hHalf, hy - hHalf, hs, hs);
  }

  // Score number
  ctx.font = NUM_FONT;
  ctx.textBaseline = 'bottom';
  ctx.fillText(score.toFixed(4), x + 2, y - 2);
}
