"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/** Reduce an integer to the GP29 field. @param {number} n */
function mod29(n) { return (n % 29 + 29) % 29; }

/** Original GP29 row-major 4x4 p15 numerical square, mod 29. */
const M = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820],
].map(row => row.map(mod29));

/**
 * Invert a non-singular square 4x4 matrix over GF(29).
 * @param {number[][]} matrix
 * @returns {number[][]}
 */
function inverse4(matrix) {
  const a = matrix.map((row, i) => row.concat(
    Array.from({ length: 4 }, (_, j) => Number(i === j))));
  for (let j = 0; j < 4; j++) {
    const row = a.findIndex((r, i) => i >= j && r[j] !== 0);
    assert.ok(row >= 0, "Matrix is invertible");
    [a[j], a[row]] = [a[row], a[j]];
    let inv = 1;
    while (mod29(inv * a[j][j]) !== 1) inv++;
    a[j] = a[j].map(v => mod29(v * inv));
    for (let i = 0; i < 4; i++) {
      if (i === j) continue;
      const mul = a[i][j];
      a[i] = a[i].map((v, k) => mod29(v - mul * a[j][k]));
    }
  }
  return a.map(row => row.slice(4));
}

/**
 * Convert a sequence to 829 vectors of four symbols.
 * @param {number[]} stream Exactly 3316 GP indices
 * @param {"rows"|"blocks"} layout
 * @returns {number[][]}
 */
function vectors(stream, layout) {
  assert.equal(stream.length, 3316);
  return Array.from({ length: 829 }, (_, i) => Array.from(
    { length: 4 }, (_, j) => stream[layout === "rows" ? j * 829 + i : 4 * i + j]));
}

/**
 * Every nonzero linear functional of GF(29)^4 is scalar-equivalent to one
 * of these 25,260 vectors. Scalar multiplication only relabels glyphs,
 * preserving the exact coincidence numerator sum f(x)*(f(x)-1).
 * @param {(coefficients: number[]) => void} action
 */
function visitProjectiveDirections(action) {
  for (let pivot = 0; pivot < 4; pivot++) {
    const count = 29 ** (3 - pivot);
    for (let key = 0; key < count; key++) {
      const coeff = [0, 0, 0, 0];
      coeff[pivot] = 1;
      let t = key;
      for (let j = pivot + 1; j < 4; j++) {
        coeff[j] = t % 29;
        t = Math.floor(t / 29);
      }
      action(coeff);
    }
  }
}

/**
 * Exact exhaustive maximum symbol-coincidence numerator over all secret
 * stationary linear rows, with no key, phase, or output language tuning.
 * @param {number[][]} source 829 length-4 ciphertext vectors
 */
function scanAllRows(source) {
  let maxNumerator = -1;
  let bestCoefficient = null;
  let directions = 0;
  let above045 = 0;
  visitProjectiveDirections(coeff => {
    const freq = Array(29).fill(0);
    for (const vec of source) {
      let value = 0;
      for (let j = 0; j < 4; j++) value += coeff[j] * vec[j];
      freq[value % 29]++;
    }
    const numerator = freq.reduce((sum, f) => sum + f * (f - 1), 0);
    if (numerator > maxNumerator) {
      maxNumerator = numerator;
      bestCoefficient = coeff.slice();
    }
    if (numerator > .045 * 829 * 828) above045++;
    directions++;
  });
  assert.equal(directions, 25260);
  return { maxNumerator, ioc: maxNumerator / (829 * 828),
    bestCoefficient, directions, above045 };
}

/** Multiply a 4x4 matrix by a four-element GP vector. @param {number[][]} matrix @param {number[]} vec */
function mul4(matrix, vec) {
  return matrix.map(row => mod29(row.reduce((sum, x, j) => sum + x * vec[j], 0)));
}

const data = JSON.parse(fs.readFileSync(path.join(
  __dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const pages = data.pages.filter(p => p.page >= 40 && p.page <= 55);
assert.equal(pages.length, 16);
assert.deepEqual(pages.map(p => p.indices.length),
  [231, 273, 272, 274, 273, 270, 270, 274, 271, 66, 0, 92, 263, 179, 232, 76]);
const original = pages.flatMap(p => p.indices);
assert.equal(original.length, 3316); // 4 * p15 Fibonacci-indexed prime 829
const inverse = inverse4(M);
for (let j = 0; j < 4; j++) {
  const basis = Array.from({ length: 4 }, (_, k) => Number(j === k));
  assert.deepEqual(mul4(inverse, mul4(M, basis)), basis);
}

const measured = {
  "four consecutive 829-rune rows": scanAllRows(vectors(original, "rows")),
  "829 consecutive four-rune blocks": scanAllRows(vectors(original, "blocks")),
};
assert.equal(measured["four consecutive 829-rune rows"].maxNumerator, 24810);
assert.equal(measured["829 consecutive four-rune blocks"].maxNumerator, 24918);
assert.equal(measured["four consecutive 829-rune rows"].above045, 0);
assert.equal(measured["829 consecutive four-rune blocks"].above045, 0);

// Independent solved-source control: p57 is actually clear GP29. The repeat
// to length 829 preserves its exact source orthography and symbol distribution;
// it is a planted key-recovery control, not a claim of authentic 829-rune prose.
const solved = data.pages.find(p => p.page === 57).indices;
assert.equal(solved.length, 95);
const native = Array.from({ length: 829 }, (_, k) => Array.from(
  { length: 4 }, (_, j) => solved[(7 * k + 17 * j) % 95]));
const encrypted = native.map(vec => mul4(M, vec));
const decoded = encrypted.map(vec => mul4(inverse, vec));
assert.deepEqual(decoded, native);
const planted = scanAllRows(encrypted);
const first = Array(29).fill(0);
for (const vec of native) first[vec[0]]++;
const nativeNumerator = first.reduce((sum, x) => sum + x * (x - 1), 0);
assert.ok(planted.maxNumerator >= nativeNumerator);
assert.ok(nativeNumerator / (829 * 828) > .05);
assert.ok(planted.maxNumerator > measured["829 consecutive four-rune blocks"].maxNumerator);

console.log(JSON.stringify({
  source: "resources/liber-primus/lp2-corpus.json",
  p15MatrixMod29: M,
  sourcePhysicalPages: "40-55 (including runeless p50)",
  originalRunes: original.length,
  sourceP15Prime: 829,
  projectiveLinearDirections: 25260,
  originalScans: measured,
  solvedP57Control: {
    sourceRunes: solved.length,
    repeatedNativeRowIoC: nativeNumerator / (829 * 828),
    recoveredExactly: true,
    bestPlantedLinearIoC: planted.ioc,
  },
  decision: "No stationary 4x4 GF29 linear inverse on either natural 4x829 layout can produce an 829-rune row with source-native GP29 concentration; no unknown plaintext.",
}, null, 2));
