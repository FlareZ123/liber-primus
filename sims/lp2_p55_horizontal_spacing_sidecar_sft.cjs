'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');

const COORD_PATH = 'resources/liber-primus/lp2-p55-source-glyph-coordinates.json';
const EXPECTED_SOURCE_SHA256 = 'a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba';

/** @param {number[]} values @returns {number} */
function median(values) {
  const sorted = values.slice().sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

/** @param {number[]} values @returns {Record<string, number>} */
function histogram(values) {
  /** @type {Record<string, number>} */
  const out = {};
  for (const value of values) out[String(value)] = (out[String(value)] || 0) + 1;
  return Object.fromEntries(
    Object.entries(out).sort((a, b) => Number(a[0]) - Number(b[0]))
  );
}

const source = JSON.parse(fs.readFileSync(COORD_PATH, 'utf8'));
assert.equal(source.schema, 'LP2 p55 original-image geometry v1');
assert.equal(source.sha256, EXPECTED_SOURCE_SHA256);
assert.equal(source.original_image, 'resources/liber-primus/72.jpg');

const imageBytes = fs.readFileSync(source.original_image);
const imageSha256 = crypto.createHash('sha256').update(imageBytes).digest('hex');
assert.equal(imageSha256, EXPECTED_SOURCE_SHA256);

assert.equal(source.glyphs.length, 76);
assert.equal(source.interword_dots.length, 16);

const lineCounts = [1, 2, 3, 4].map(
  (line) => source.glyphs.filter((glyph) => glyph.line === line).length
);
assert.deepEqual(lineCounts, [24, 22, 22, 8]);

/** @type {Array<{line:number,currentOrdinal:number,nextOrdinal:number,gp29:number,gap:number,startDelta:number,hasDot:boolean}>} */
const transitions = [];
for (const line of [1, 2, 3, 4]) {
  const glyphs = source.glyphs
    .filter((glyph) => glyph.line === line)
    .slice()
    .sort((a, b) => a.rect[0] - b.rect[0]);

  for (let index = 0; index < glyphs.length - 1; index += 1) {
    const current = glyphs[index];
    const next = glyphs[index + 1];
    const hasDot = source.interword_dots.some(
      (dot) =>
        dot.line === line &&
        dot.rect[0] > current.rect[2] &&
        dot.rect[2] < next.rect[0]
    );

    transitions.push({
      line,
      currentOrdinal: current.ordinal,
      nextOrdinal: next.ordinal,
      gp29: current.gp29_index,
      gap: next.rect[0] - current.rect[2] - 1,
      startDelta: next.rect[0] - current.rect[0],
      hasDot,
    });
  }
}

assert.equal(transitions.length, 72);
const plain = transitions.filter((transition) => !transition.hasDot);
const dotted = transitions.filter((transition) => transition.hasDot);
assert.equal(plain.length, 57);
assert.equal(dotted.length, 15);

const plainGaps = plain.map((transition) => transition.gap);
const dottedGaps = dotted.map((transition) => transition.gap);
assert.deepEqual(histogram(plainGaps), {
  1: 1, 2: 8, 3: 5, 4: 5, 5: 17, 6: 12, 7: 6, 8: 3,
});
assert.deepEqual(histogram(dottedGaps), {
  19: 1, 20: 4, 21: 7, 22: 2, 23: 1,
});
assert.ok(Math.max(...plainGaps) < Math.min(...dottedGaps));

/**
 * Fit a simple typesetting model:
 * next_x - current_x = A[current GP29 rune] + c*[separator dot] + residual.
 *
 * For each candidate global dot increment c, choose each rune's base advance as
 * the median of its adjusted observations. Then lexicographically minimize
 * max absolute residual, SSE, and total absolute error.
 */
let best = null;
for (let dotIncrement = 0; dotIncrement <= 30; dotIncrement += 1) {
  /** @type {Map<number, number[]>} */
  const adjustedByRune = new Map();
  for (const transition of transitions) {
    const adjusted =
      transition.startDelta - (transition.hasDot ? dotIncrement : 0);
    const values = adjustedByRune.get(transition.gp29) || [];
    values.push(adjusted);
    adjustedByRune.set(transition.gp29, values);
  }

  /** @type {Map<number, number>} */
  const baseAdvance = new Map();
  for (const [gp29, values] of adjustedByRune.entries()) {
    baseAdvance.set(gp29, median(values));
  }

  const residuals = transitions.map(
    (transition) =>
      transition.startDelta -
      (baseAdvance.get(transition.gp29) +
        (transition.hasDot ? dotIncrement : 0))
  );

  const maxAbs = Math.max(...residuals.map((value) => Math.abs(value)));
  const sse = residuals.reduce((sum, value) => sum + value * value, 0);
  const absoluteError = residuals.reduce(
    (sum, value) => sum + Math.abs(value),
    0
  );

  const candidate = {
    dotIncrement,
    baseAdvance,
    residuals,
    maxAbs,
    sse,
    absoluteError,
  };

  if (
    best === null ||
    candidate.maxAbs < best.maxAbs ||
    (candidate.maxAbs === best.maxAbs && candidate.sse < best.sse) ||
    (candidate.maxAbs === best.maxAbs &&
      candidate.sse === best.sse &&
      candidate.absoluteError < best.absoluteError)
  ) {
    best = candidate;
  }
}

assert.ok(best);
assert.equal(best.dotIncrement, 16);
assert.equal(best.maxAbs, 2);
assert.equal(best.sse, 23);
assert.equal(best.absoluteError, 21);
assert.deepEqual(histogram(best.residuals), {
  '-1': 11,
  0: 52,
  1: 8,
  2: 1,
});

/** @type {Record<string, number>} */
const lineBaseY = {};
for (const glyph of source.glyphs) {
  const key = String(glyph.line);
  lineBaseY[key] =
    lineBaseY[key] === undefined
      ? glyph.rect[1]
      : Math.min(lineBaseY[key], glyph.rect[1]);
}

const verticalOffsets = source.glyphs.map(
  (glyph) => glyph.rect[1] - lineBaseY[String(glyph.line)]
);
assert.ok(verticalOffsets.every((value) => value === 0 || value === 1));
assert.deepEqual(lineBaseY, { 1: 673, 2: 861, 3: 1050, 4: 1238 });

const lineStartX = [1, 2, 3, 4].map((line) =>
  Math.min(
    ...source.glyphs
      .filter((glyph) => glyph.line === line)
      .map((glyph) => glyph.rect[0])
  )
);
assert.deepEqual(lineStartX, [601, 601, 601, 600]);

// Conservative information ceiling if every observed +/-2 pixel residual state
// were freely writable and independent, rather than normal raster/layout noise.
const horizontalResidualStateCount = 5;
const withinLineCapacityBits =
  transitions.length * Math.log2(horizontalResidualStateCount);
const withFourLineStartsCapacityBits =
  (transitions.length + 4) * Math.log2(horizontalResidualStateCount);
assert.ok(Math.abs(withinLineCapacityBits - 167.17882283189007) < 1e-12);
assert.ok(Math.abs(withFourLineStartsCapacityBits - 176.46653521143952) < 1e-12);

console.log(JSON.stringify({
  status: 'PASS',
  source: {
    path: source.original_image,
    sha256: imageSha256,
    glyphCount: source.glyphs.length,
    lineCounts,
    interwordDotCount: source.interword_dots.length,
  },
  horizontalGeometry: {
    withinLineTransitions: transitions.length,
    plainTransitionCount: plain.length,
    dottedTransitionCount: dotted.length,
    plainGapHistogram: histogram(plainGaps),
    dottedGapHistogram: histogram(dottedGaps),
    fittedDotIncrementPx: best.dotIncrement,
    fittedResidualHistogramPx: histogram(best.residuals),
    exactTransitions: best.residuals.filter((value) => value === 0).length,
    maxAbsResidualPx: best.maxAbs,
    ssePx2: best.sse,
    totalAbsResidualPx: best.absoluteError,
    fittedBaseAdvancesPx: Object.fromEntries(
      [...best.baseAdvance.entries()].sort((a, b) => a[0] - b[0])
    ),
  },
  verticalGeometry: {
    lineBaseY,
    lineStartX,
    yOffsetHistogramPx: histogram(verticalOffsets),
  },
  deliberatelyOverchargedResidualCapacity: {
    stateAlphabet: 'five freely writable states {-2,-1,0,+1,+2} per slot',
    withinLineSlots: transitions.length,
    withinLineBits: withinLineCapacityBits,
    plusFourLineStartSlots: transitions.length + 4,
    plusFourLineStartBits: withFourLineStartsCapacityBits,
  },
}, null, 2));
