"use strict";
/**
 * LP2 terminal 256: source-shaped GF(256) polynomial-interpolation gate.
 *
 * This checks one HYPOTHETICAL Reed-Solomon-style [256,180] direct
 * codeword/terminal-plaintext model. It is not an author-selected cipher.
 * Inputs are unchanged original LP2 GP indices and the printed base60 bytes.
 * Node.js 22, built-ins only, run from the repository root.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} filename */
function json(filename) {
  return JSON.parse(fs.readFileSync(path.join(root, filename), "utf8"));
}
const db = json("resources/liber-primus/lp2-corpus.json");
const table = json("resources/liber-primus/base60-grid.json");
const bytes = table.byte_rows.flat();
assert.equal(bytes.length, 256);
assert.deepEqual(db.pages.slice(55, 58).map(p => p.indices.length), [76, 85, 95]);

/** GF(2^8) multiplication using the standard RS primitive 0x11d. */
function mul(a, b) {
  let r = 0;
  while (b) {
    if (b & 1) r ^= a;
    b >>>= 1;
    a <<= 1;
    if (a & 256) a ^= 0x11d;
  }
  return r;
}
/** @param {number} a @param {number} n */
function power(a, n) {
  let result = 1;
  while (n) {
    if (n & 1) result = mul(result, a);
    a = mul(a, a);
    n >>>= 1;
  }
  return result;
}
/** @param {number} x */
function inverse(x) {
  assert.notEqual(x, 0);
  return power(x, 254);
}

/**
 * Unique degree < N field polynomial through N distinct (x,y) pairs.
 * Barycentric Lagrange evaluation, characteristic-two subtraction = XOR.
 * @param {number[]} X @param {number[]} Y @param {number[]} targets
 * @returns {number[]}
 */
function interpolate(X, Y, targets) {
  assert.equal(X.length, Y.length);
  assert.equal(new Set(X).size, X.length);
  const weights = X.map((x, i) => {
    let product = 1;
    for (let j = 0; j < X.length; j++)
      if (i !== j) product = mul(product, x ^ X[j]);
    return inverse(product);
  });
  return targets.map(x => {
    assert(!X.includes(x));
    let numerator = 0, denominator = 0;
    for (let i = 0; i < X.length; i++) {
      const term = mul(weights[i], inverse(x ^ X[i]));
      numerator ^= mul(term, Y[i]);
      denominator ^= term;
    }
    return mul(numerator, inverse(denominator));
  });
}

const interior = [], perimeter = [];
for (let row = 0; row < 32; row++)
  for (let col = 0; col < 8; col++)
    (row === 0 || row === 31 || col === 0 || col === 7
      ? perimeter : interior).push(row * 8 + col);
assert.deepEqual([interior.length, perimeter.length], [180, 76]);

const predictedTablePerimeter = interpolate(
  interior, interior.map(i => bytes[i]), perimeter
);
const actualTablePerimeter = perimeter.map(i => bytes[i]);
const tableMatches = predictedTablePerimeter
  .filter((v, i) => v === actualTablePerimeter[i]).length;
assert.equal(tableMatches, 0);

// Two positive controls: ordinary RS bytes, and a constant native-GP symbol.
const polynomial = [7, 11, 23, 5, 15, 19, 3, 9];
/** @param {number} x */
function evalPlant(x) {
  return polynomial.reduceRight((acc, v) => mul(acc, x) ^ v, 0);
}
assert.deepEqual(
  interpolate(interior, interior.map(evalPlant), perimeter),
  perimeter.map(evalPlant)
);
assert.deepEqual(
  interpolate(interior, interior.map(() => 7), perimeter),
  perimeter.map(() => 7)
);

/** @param {number} n */
function primeList(n) {
  const result = [];
  for (let v = 2; result.length < n; v++) {
    if (result.every(p => p * p > v || v % p !== 0)) result.push(v);
  }
  return result;
}
const primes = primeList(100);
let primeIndex = 0;
const original56 = db.pages[56].indices;
const plain56 = original56.map((c, pos) =>
  pos === 56 ? 0 : (c - (primes[primeIndex++] - 1) + 29000) % 29
);
assert.equal(primeIndex, 84);
const known180 = plain56.concat(db.pages[57].indices);
const unknown55 = db.pages[55].indices;
assert.deepEqual([known180.length, unknown55.length], [180, 76]);

const rings = [];
for (let d = 0; d < 4; d++) {
  const ring = [], left = d, right = 7 - d, top = d, bottom = 31 - d;
  for (let x = left; x <= right; x++) ring.push(top * 8 + x);
  for (let y = top + 1; y <= bottom; y++) ring.push(y * 8 + right);
  for (let x = right - 1; x >= left; x--) ring.push(bottom * 8 + x);
  for (let y = bottom - 1; y > top; y--) ring.push(y * 8 + left);
  rings.push(ring);
}
assert.deepEqual(rings.map(r => r.length), [76, 68, 60, 52]);

const corners = [[0, 0], [0, 7], [31, 7], [31, 0]];
const terminal = [];
for (let corner = 0; corner < 4; corner++)
  for (const direction of [1, -1]) {
    const [cy, cx] = corners[corner];
    const route = rings.flatMap((ring, d) => {
      const y = Math.max(d, Math.min(31 - d, cy));
      const x = Math.max(d, Math.min(7 - d, cx));
      const start = ring.indexOf(8 * y + x);
      assert(start >= 0);
      return ring.map((_, i) =>
        ring[(start + direction * i + ring.length * 2) % ring.length]);
    });
    assert.equal(new Set(route).size, 256);
    const output = interpolate(route.slice(76), known180, route.slice(0, 76));
    const gpValid = output.filter(v => v < 29).length;
    const matchesOriginalCipher = output
      .filter((v, i) => v === unknown55[i]).length;
    assert.deepEqual([gpValid, matchesOriginalCipher], [12, 0]);
    terminal.push({
      corner, direction, validGp29OuterSymbols: gpValid,
      matchingOriginalP55CipherSymbols: matchesOriginalCipher,
      first16: output.slice(0, 16)
    });
  }

console.log(JSON.stringify({
  model: "degree <=179 polynomial over GF(256), field modulus 0x11d",
  assumptions: "source 32x8 grid positions, 76 perimeter / 180 interior; " +
    "hypothetical RS evaluation and terminal cross-page mapping",
  table: {knownInterior: 180, predictedOuter: 76,
    directOriginalByteMatches: tableMatches,
    first16Predicted: predictedTablePerimeter.slice(0, 16)},
  terminal, plantedByteAndNativeGpControls: "exact",
  decision: "Both original-codeword hypotheses rejected within this " +
    "source-defined layout. No source selects RS or this field."
}, null, 2));
