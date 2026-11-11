'use strict';

/**
 * Full original-LP2 SFT for the primitive-GF(29^2) [127,51] codeword hypothesis.
 * Read-only: node sims/gf841_51x127_primitive_rs_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const P = 29;
const mod = (x) => ((x % P) + P) % P;
const add = (x, y) => mod(x % P + y % P) + P * mod(Math.floor(x / P) + Math.floor(y / P));
const sub = (x, y) => mod(x % P - y % P) + P * mod(Math.floor(x / P) - Math.floor(y / P));
/** u^2 = 3u + 8, from the original LP2 p3 three-rune red polynomial. */
const mul = (x, y) => {
  const a = x % P, b = Math.floor(x / P), c = y % P, d = Math.floor(y / P);
  return mod(a * c + 8 * b * d) + P * mod(a * d + b * c + 3 * b * d);
};
function pow(base, exponent) {
  let value = 1;
  for (let n = exponent; n > 0; n = Math.floor(n / 2)) {
    if (n % 2) value = mul(value, base);
    base = mul(base, base);
  }
  return value;
}
function inverse(x) {
  assert.notEqual(x, 0);
  return pow(x, 839);
}
const u = P;
assert.equal(pow(u, 840), 1);
for (const primeFactor of [2, 3, 5, 7]) assert.notEqual(pow(u, 840 / primeFactor), 1);

const whole = corpus.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices);
assert.equal(whole.length, 12956);
const payload = whole.slice(2);
assert.equal(payload.length, 2 * 51 * 127);

function sourceRows(basis) {
  return Array.from({ length: 51 }, (_, r) => Array.from({ length: 127 }, (_, j) => {
    const offset = 2 * (r * 127 + j), a = payload[offset], b = payload[offset + 1];
    return basis === 'ab' ? a + P * b : b + P * a;
  }));
}
function evaluatePolynomial(coefficients, x) {
  let value = 0;
  for (let i = coefficients.length - 1; i >= 0; i--) value = add(mul(value, x), coefficients[i]);
  return value;
}
/** Source-fixed interpolation through columns 0..50; predict 51..126. */
function interpolationMatrix(points) {
  const weights = Array.from({ length: 51 }, (_, i) => {
    let denominator = 1;
    for (let j = 0; j < 51; j++) {
      if (i !== j) denominator = mul(denominator, sub(points[i], points[j]));
    }
    return inverse(denominator);
  });
  return Array.from({ length: 76 }, (_, k) => {
    const x = points[k + 51];
    let product = 1;
    for (let j = 0; j < 51; j++) product = mul(product, sub(x, points[j]));
    return Array.from({ length: 51 }, (_, i) =>
      mul(mul(product, inverse(sub(x, points[i]))), weights[i]));
  });
}
function predict(row, weights) {
  const output = new Array(76);
  for (let k = 0; k < 76; k++) {
    let value = 0;
    for (let i = 0; i < 51; i++) value = add(value, mul(weights[k][i], row[i]));
    output[k] = value;
  }
  return output;
}

const outcomes = [];
for (const basis of ['ab', 'ba']) {
  const rows = sourceRows(basis);
  for (const step of [1, 839, 29, 811]) {
    const points = Array.from({ length: 127 }, (_, j) => pow(u, (step * j) % 840));
    assert.equal(new Set(points).size, 127);
    const weights = interpolationMatrix(points);
    let originalMatched = 0, syntheticMatched = 0;
    const exactMatches = [];
    let rowBest = 0;
    for (let r = 0; r < 51; r++) {
      const actual = rows[r];
      const guessed = predict(actual, weights);
      let rowMatched = 0;
      for (let k = 0; k < 76; k++) {
        if (guessed[k] === actual[k + 51]) {
          originalMatched++;
          rowMatched++;
          exactMatches.push([r, k + 51]);
        }
      }
      rowBest = Math.max(rowBest, rowMatched);
      const coefficients = Array.from({ length: 51 }, (_, i) =>
        mod(7 * i + 3 * r + 11) + P * mod(i * i + 5 * r + 5));
      const plant = points.map((point) => evaluatePolynomial(coefficients, point));
      const reconstructed = predict(plant, weights);
      for (let k = 0; k < 76; k++) if (reconstructed[k] === plant[k + 51]) syntheticMatched++;
    }
    assert.equal(syntheticMatched, 3876);
    outcomes.push({ basis, step, originalMatched, syntheticMatched, rowBest, exactMatches });
  }
}
assert.deepEqual(outcomes.map((x) => x.originalMatched), [5, 2, 1, 3, 5, 3, 3, 11]);
assert.ok(outcomes.every((x) => x.rowBest <= 1));
console.log(JSON.stringify({
  original: { physicalPages: 56, runes: 12956, twoRuneHeader: true, payloadFieldSymbols: 6477 },
  sourceField: 'GF(29)[u]/(u^2-3u-8), primitive u order 840',
  evaluationNodes: 'u^(step*j), j=0..126, steps 1/839/29/811 (forward, inverse, Frobenius conjugates)',
  sourceShape: '51 independent rows × 127 ordered field symbols',
  originalPredicted: outcomes.map((x) =>
    ({ basis: x.basis, step: x.step, matched: x.originalMatched, total: 3876, rowBest: x.rowBest, exactMatches: x.exactMatches })),
  expectedChanceMatches: 3876 / 841,
  syntheticCodewordPredictionsPerConfiguration: 3876
}, null, 2));
