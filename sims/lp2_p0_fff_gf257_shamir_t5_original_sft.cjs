'use strict';

/**
 * Issue #2136: historical five-share interpolation gate on original 256-token
 * LP2 p50 table under the p0 FFF-derived GF257/primitive-38 hypothesis.
 *
 * All polynomial degrees, seeds and held-out x/y cells are predetermined:
 * 2013 Cicada's SSSS threshold 5 implies a degree-at-most-4 polynomial.
 * Test two declared source clocks without output-driven key/phase fitting.
 *
 * SFT: node sims/lp2_p0_fff_gf257_shamir_t5_original_sft.cjs
 * Node.js 22, CJS, read-only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const table = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const source = table.bytes;
const tokens = table.pages.flatMap((page) => page.tokens);
const prime = 257;
const primitive = 38;
const phase = 48;
const threshold = 5;
assert.equal(source.length, 256);
assert.equal(tokens.length, 256);
assert.ok(source.every((n) => Number.isInteger(n) && n >= 0 && n < 256));

/** @param {number} a @param {number} b */
function mod(a, b = prime) {
  return ((a % b) + b) % b;
}
/** @param {number} base @param {number} exponent */
function power(base, exponent) {
  let x = mod(base);
  let y = 1;
  let n = exponent;
  while (n > 0) {
    if (n % 2) y = mod(y * x);
    x = mod(x * x);
    n = Math.floor(n / 2);
  }
  return y;
}
/** @param {number} value */
function inverse(value) {
  assert.notEqual(mod(value), 0);
  return power(value, prime - 2);
}

/**
 * Evaluate Lagrange interpolation from t distinct source shares.
 * @param {Array<{x:number, y:number}>} shares
 * @param {number} x
 */
function recover(shares, x) {
  let y = 0;
  for (let i = 0; i < shares.length; i++) {
    let weight = 1;
    for (let j = 0; j < shares.length; j++) {
      if (i === j) continue;
      assert.notEqual(shares[i].x, shares[j].x);
      weight = mod(weight * mod(x - shares[j].x) * inverse(mod(shares[i].x - shares[j].x)));
    }
    y = mod(y + weight * shares[i].y);
  }
  return y;
}

/**
 * Source-fixed input encodings.
 * In the known 2013 shares, x indices are ordinal share numbers 1..N;
 * FFF-derived hypothesis additionally supplies primitive root38, phase48.
 */
const clocks = {
  'historical-ordinal-x': Array.from({length:256}, (_, i) => i + 1),
  'fff-primitive38-phase48-x': Array.from({length:256}, (_, i) => power(primitive, i + phase)),
};

assert.equal(new Set(clocks['historical-ordinal-x']).size, 256);
assert.equal(new Set(clocks['fff-primitive38-phase48-x']).size, 256);
assert.equal(power(38, 128), 256);
assert.equal(power(38, 256), 1);

// Original source: exact three F-headed p0 words, original symbol shapes
// and native prime sums; independent claim input, never fitted by this SFT.
const p0 = corpus.pages[0].indices;
const originals = [p0.slice(177, 183), p0.slice(183, 189), p0.slice(189, 192)];
assert.deepEqual(originals.map((word) => word.length), [6, 6, 3]);
assert.deepEqual(originals.map((word) => word[0]), [0, 0, 0]);
assert.deepEqual(originals.map((word) => word.reduce((sum, idx) => sum + corpus.prime[idx], 0)), [257, 295, 48]);
assert.equal(table.bytes[189], 192);
assert.equal(tokens[192], '00');

/** @param {number[]} xs @param {number[]} ys */
function audit(xs, ys) {
  const shares = xs.slice(0, threshold).map((x, i) => ({x, y: ys[i]}));
  const failures = [];
  const matches = [];
  let predicted256 = 0;
  for (let i = threshold; i < 256; i++) {
    const predicted = recover(shares, xs[i]);
    if (predicted === 256) predicted256++;
    if (predicted === ys[i]) matches.push(i);
    else failures.push({position:i, expected:ys[i], predicted});
  }
  return {matched:matches.length, failed:failures.length,
    matches:matches.slice(0, 20), firstFiveHoldout:failures.slice(0, 5),
    lastHoldout:failures.find((v) => v.position === 255),
    predicted256};
}

/** @param {number[]} coefficients @param {number} x */
function polynomial(coefficients, x) {
  let y = 0;
  for (let i = coefficients.length - 1; i >= 0; i--) y = mod(y * x + coefficients[i]);
  return y;
}

const output = {};
for (const [clock, xs] of Object.entries(clocks)) {
  const result = audit(xs, source);
  assert.equal(result.matched + result.failed, 251);
  assert.ok(result.failed > 0, 'a true codeword should match every withheld point');
  // Synthetic positive with an exact degree-four source-shaped polynomial.
  const coefficients = [0, 38, 48, 14, 23];
  const planted = xs.map((x) => polynomial(coefficients, x));
  const positive = audit(xs, planted);
  assert.equal(positive.matched, 251, clock + ': all planted shares predicted');
  assert.equal(positive.failed, 0);
  const seeds = xs.slice(0, 5).map((x, i) => ({x, y:source[i]}));
  for (let i = 0; i < 5; i++) assert.equal(recover(seeds, xs[i]), source[i]);
  output[clock] = {
    frozenInputShares: seeds,
    original: result,
    independentlyPlantedPolynomialCoefficients: coefficients,
    plant: {matched:positive.matched, failed:positive.failed},
  };
  console.log(clock, JSON.stringify(output[clock]));
}
console.log('PASS: original GF257 five-share holdout gate and 256/256-degree4 positive controls');
