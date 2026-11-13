'use strict';

/**
 * LP2 terminal 256-cell GF(2^8) erasure-code gate, with authentic solved-page
 * holdouts. The 32x8 table is treated as byte ciphertext. The 76 perimeter
 * positions belong to unknown p55; the 30x6 row-major interior belongs to
 * independently solved p56 (85 runes) and clear p57 (95 runes).
 *
 * Tests exactly two source-natural byte transports: XOR and addition mod256.
 * Fit a GF(256) polynomial to only p56 and predict all p57 symbols; reverse
 * the roles; then fit all 180 and predict 76 unknown p55 symbols. A genuine
 * byte decoder would have to reproduce held-out p57 and yield all 76 bytes in
 * the original 29-symbol GP alphabet. Source does not prescribe RS coding.
 *
 * Run: node sims/lp2_terminal256_gf256_erasure_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const table = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8')).bytes;

assert.equal(table.length, 256);
const sortedAlphabet = corpus.translit.map((token, index) => ({ token, index }))
  .sort((a, b) => b.token.length - a.token.length);

/** @param {string} text @returns {number[]} */
function toGp(text) {
  const out = [];
  for (const word of text.split(' ')) {
    for (let i = 0; i < word.length;) {
      const match = sortedAlphabet.find(x => word.startsWith(x.token, i));
      assert.ok(match, 'Unknown GP spelling: ' + word.slice(i));
      out.push(match.index);
      i += match.token.length;
    }
  }
  return out;
}

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const primes = [];
  for (let n = 2; primes.length < count; n++) {
    if (primes.every(p => p * p > n || n % p !== 0)) primes.push(n);
  }
  return primes;
}

const solvedP56 = toGp(
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO ' +
  'IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE');
const cipherP56 = corpus.pages.find(p => p.page === 56).indices;
const clearP57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(solvedP56.length, 85);
assert.equal(clearP57.length, 95);
assert.equal(cipherP56.length, 85);
const primes = firstPrimes(110);
let phiCursor = 0;
const independentlyDecoded = cipherP56.map((rune, i) =>
  i === 56 ? 0 : ((rune - (primes[phiCursor++] - 1)) % 29 + 29) % 29);
assert.deepEqual(independentlyDecoded, solvedP56,
  'Authentic page 56 phi(prime) decoder must validate 85/85 symbols');

const known = solvedP56.concat(clearP57);
const perimeter = [];
const interior = [];
for (let x = 0; x < 256; x++) {
  const row = Math.floor(x / 8);
  const col = x % 8;
  (row === 0 || row === 31 || col === 0 || col === 7
    ? perimeter : interior).push(x);
}
assert.equal(perimeter.length, 76);
assert.equal(interior.length, 180);

/** Multiply in GF(2^8) with irreducible AES modulus x^8+x^4+x^3+x+1. */
function multiply(a, b) {
  let result = 0;
  for (let i = 0; i < 8; i++) {
    if (b & 1) result ^= a;
    const high = a & 128;
    a = (a << 1) & 255;
    if (high) a ^= 0x1b;
    b >>>= 1;
  }
  return result;
}

/** @param {number} base @param {number} exponent */
function power(base, exponent) {
  let result = 1;
  for (; exponent > 0; exponent >>>= 1, base = multiply(base, base)) {
    if (exponent & 1) result = multiply(result, base);
  }
  return result;
}

/**
 * Barycentric Lagrange interpolation. Training x coordinates are unique
 * GF(256) field elements and target coordinates are disjoint from training.
 * @param {Array<[number,number]>} points
 * @param {number[]} targets
 * @returns {number[]}
 */
function predict(points, targets) {
  const weights = points.map(([x], i) => {
    let product = 1;
    for (let j = 0; j < points.length; j++) {
      if (j !== i) product = multiply(product, x ^ points[j][0]);
    }
    return power(product, 254);
  });
  return targets.map(z => {
    let outer = 1;
    for (const [x] of points) outer = multiply(outer, z ^ x);
    let sum = 0;
    for (let i = 0; i < points.length; i++) {
      const [x, y] = points[i];
      assert.notEqual(z, x, 'Holdout and training coordinates overlap');
      sum ^= multiply(y, multiply(weights[i], power(z ^ x, 254)));
    }
    return multiply(outer, sum);
  });
}

/** @param {number[]} expected @param {number[]} actual */
function matches(expected, actual) {
  assert.equal(expected.length, actual.length);
  return expected.filter((y, i) => y === actual[i]).length;
}

const modes = [
  {
    label: 'byte-xor-gp-index',
    residual: (byte, gp) => byte ^ gp,
    recover: (byte, key) => byte ^ key
  },
  {
    label: 'byte-addition-mod256',
    residual: (byte, gp) => (byte - gp + 256) & 255,
    recover: (byte, key) => (byte - key + 256) & 255
  }
];
const output = [];
for (const mode of modes) {
  const key = interior.map((cell, i) => mode.residual(table[cell], known[i]));
  const p56Points = interior.slice(0, 85).map((cell, i) => [cell, key[i]]);
  const p57Points = interior.slice(85).map((cell, i) => [cell, key[85 + i]]);
  const predictedP57 = predict(p56Points, interior.slice(85));
  const predictedP56 = predict(p57Points, interior.slice(0, 85));
  const fullPoints = interior.map((cell, i) => [cell, key[i]]);
  const exteriorKey = predict(fullPoints, perimeter);
  const originalCandidate = perimeter.map((cell, i) =>
    mode.recover(table[cell], exteriorKey[i]));
  output.push({
    mode: mode.label,
    p56_predicts_p57_exact: matches(key.slice(85), predictedP57),
    p57_holdout_total: 95,
    p57_predicts_p56_exact: matches(key.slice(0, 85), predictedP56),
    p56_holdout_total: 85,
    p55_gp29_legal: originalCandidate.filter(x => x < 29).length,
    p55_total: 76,
    p55_distinct_output_bytes: new Set(originalCandidate).size,
    p55_first_16_bytes: originalCandidate.slice(0, 16)
  });
}
assert.deepEqual(output.map(r => [
  r.p56_predicts_p57_exact, r.p57_predicts_p56_exact,
  r.p55_gp29_legal, r.p55_distinct_output_bytes
]), [[1, 0, 7, 71], [2, 0, 11, 67]]);

// The source's more direct "shed circumferences" reading winds clockwise
// around three nested original byte rings. The deepest 52-symbol shell starts
// with SHED at p57 local rune43, exactly the verified parable instruction.
const rings = [];
for (let depth = 0; depth < 4; depth++) {
  const top = depth, bottom = 31 - depth, left = depth, right = 7 - depth;
  const ring = [];
  for (let c = left; c <= right; c++) ring.push(8 * top + c);
  for (let r = top + 1; r <= bottom; r++) ring.push(8 * r + right);
  for (let c = right - 1; c >= left; c--) ring.push(8 * bottom + c);
  for (let r = bottom - 1; r > top; r--) ring.push(8 * r + left);
  rings.push(ring);
}
assert.deepEqual(rings.map(r => r.length), [76, 68, 60, 52]);
const ringKnown = rings.slice(1).flat();
const ringOuter = rings[0];
assert.equal(known[68 + 60], clearP57[43]);
const ringOutput = [];
for (const mode of modes) {
  const key = ringKnown.map((cell, i) => mode.residual(table[cell], known[i]));
  const kFrom56 = predict(ringKnown.slice(0, 85)
    .map((cell, i) => [cell, key[i]]), ringKnown.slice(85));
  const kFrom57 = predict(ringKnown.slice(85)
    .map((cell, i) => [cell, key[85 + i]]), ringKnown.slice(0, 85));
  const inferredOuterKey = predict(ringKnown
    .map((cell, i) => [cell, key[i]]), ringOuter);
  const candidates = ringOuter.map((cell, i) =>
    mode.recover(table[cell], inferredOuterKey[i]));
  ringOutput.push({
    mode: mode.label,
    p56_predicts_p57_exact: matches(key.slice(85), kFrom56),
    p57_holdout_total: 95,
    p57_predicts_p56_exact: matches(key.slice(0, 85), kFrom57),
    p56_holdout_total: 85,
    p55_gp29_legal: candidates.filter(x => x < 29).length,
    p55_total: 76,
    p55_distinct_output_bytes: new Set(candidates).size,
    p55_first_16_bytes: candidates.slice(0, 16)
  });
}
assert.deepEqual(ringOutput.map(r => [
  r.p56_predicts_p57_exact, r.p57_predicts_p56_exact,
  r.p55_gp29_legal, r.p55_distinct_output_bytes
]), [[2, 0, 9, 68], [0, 0, 7, 65]]);

// A complete no-secret-tuning positive control in the identical original
// 32x8 geometry: degree-31 GP-byte XOR pad, synthetic original-shape bytes.
const coeff = Array.from({ length: 32 }, (_, i) => (i * 37 + 13) & 255);
/** @param {number} x */
function evalPlant(x) {
  let value = 0;
  for (let j = coeff.length - 1; j >= 0; j--) {
    value = multiply(value, x) ^ coeff[j];
  }
  return value;
}
const nativePlain = interior.map((_, i) => known[i]);
const synthetic = Array(256).fill(0);
for (let i = 0; i < 256; i++) {
  const nativeGp = interior.includes(i)
    ? nativePlain[interior.indexOf(i)]
    : clearP57[perimeter.indexOf(i) % clearP57.length];
  synthetic[i] = nativeGp ^ evalPlant(i);
}
const plantPoints = interior.slice(0, 85).map((x, i) =>
  [x, synthetic[x] ^ known[i]]);
const plantedNext = predict(plantPoints, interior.slice(85));
assert.deepEqual(plantedNext, interior.slice(85).map(evalPlant));
const plantedOuter = predict(plantPoints, perimeter);
assert.deepEqual(plantedOuter, perimeter.map(evalPlant));
assert.deepEqual(perimeter.map((x, i) => synthetic[x] ^ plantedOuter[i]),
  perimeter.map((_, i) => clearP57[i % clearP57.length]));

console.log(JSON.stringify({
  classification: 'source-layout conditional gate; no p55 plaintext',
  originalByteCells: 256, known: 180, originalUnknown: 76,
  sourcePageReading: 'p56 85 then p57 95 in 30x6 row-major interior',
  sourceByteInterpretation: 'hypothetical conventional base60',
  field: 'GF(256) irreducible polynomial 0x11b',
  plant: '31-degree interpolation key, 95/95 heldout and 76/76 perimeter',
  rowMajorInterior: output,
  sourceClockwiseShells: ringOutput
}, null, 2));
