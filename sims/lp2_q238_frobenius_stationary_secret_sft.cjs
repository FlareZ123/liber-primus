"use strict";

/**
 * Source-fixed Q238 Frobenius + arbitrary stationary 238-coordinate secret gate.
 * Windows 11 / Node.js 22 single-file test: node sims/lp2_q238_frobenius_stationary_secret_sft.cjs
 * Inputs: original LP2 GP29 corpus, original 256-grid byte table, three native-GP controls.
 * A rejected necessary condition is NOT a recovered cipher or unknown plaintext.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { encodeSourceNativeGP } = require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.resolve(__dirname, "..");
const data = relative => fs.readFileSync(path.join(root, relative), "utf8");
const gp = JSON.parse(data("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(data("resources/liber-primus/lp2-grid-256.json"));
const D = 238;
const mod = n => (n % 29 + 29) % 29;
const inverse = Array.from({ length: 29 }, (_, x) => x === 0 ? 0 :
  Array.from({ length: 28 }, (_, i) => i + 1).find(y => x * y % 29 === 1));

/** Divide polynomials of ascending coefficients over GF29; divisor known exact. */
function exactQuotient(poly, divisor) {
  const remainder = poly.slice();
  while (remainder.length && remainder[remainder.length - 1] === 0) remainder.pop();
  const quotient = Array(Math.max(0, remainder.length - divisor.length + 1)).fill(0);
  while (remainder.length >= divisor.length) {
    const offset = remainder.length - divisor.length;
    const multiplier = mod(remainder[remainder.length - 1] * inverse[divisor[divisor.length - 1]]);
    quotient[offset] = multiplier;
    for (let k = 0; k < divisor.length; k++) {
      remainder[offset + k] = mod(remainder[offset + k] - multiplier * divisor[k]);
    }
    while (remainder.length && remainder[remainder.length - 1] === 0) remainder.pop();
  }
  assert.equal(remainder.length, 0, "original grid factorization changed");
  return quotient;
}

/** Build original monic irreducible degree-238 factor of the unchanged table. */
function originalFieldModulus() {
  const bytes = grid.bytes;
  assert.equal(bytes.length, 256);
  const signature = crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex");
  assert.equal(signature, "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
  let q = bytes.slice().reverse().map(x => x % 29);
  while (q[q.length - 1] === 0) q.pop();
  for (const factor of [
    [5, 1], [5, 1],
    [11, 18, 1],
    [24, 16, 14, 1],
    [11, 15, 0, 9, 1, 5, 10, 20, 12, 1]
  ]) q = exactQuotient(q, factor);
  assert.equal(q.length, D + 1);
  const norm = inverse[q[D]];
  return q.map(x => mod(x * norm));
}

/**
 * Column j of F is X^(29j) mod Q. In characteristic 29 this is exactly
 * Frobenius(y) = y^29, which is GF29-linear for arbitrary 238-vectors.
 */
function frobeniusInverseMatrix(Q) {
  /** Multiply a degree<238 polynomial by X and reduce modulo monic Q. */
  function timesX(input) {
    const output = new Uint8Array(D);
    const top = input[D - 1];
    output[0] = mod(-top * Q[0]);
    for (let i = 1; i < D; i++) output[i] = mod(input[i - 1] - top * Q[i]);
    return output;
  }

  const rows = Array.from({ length: D }, () => new Uint8Array(D));
  let current = new Uint8Array(D);
  current[0] = 1;
  for (let column = 0; column < D; column++) {
    for (let row = 0; row < D; row++) rows[row][column] = current[row];
    for (let step = 0; step < 29; step++) current = timesX(current);
  }

  const augmented = rows.map((r, i) => {
    const v = new Uint8Array(2 * D);
    v.set(r);
    v[D + i] = 1;
    return v;
  });

  for (let column = 0; column < D; column++) {
    let pivot = column;
    while (pivot < D && augmented[pivot][column] === 0) pivot++;
    assert.notEqual(pivot, D, "Frobenius should be invertible over GF29");
    [augmented[column], augmented[pivot]] = [augmented[pivot], augmented[column]];
    const factor = inverse[augmented[column][column]];
    for (let j = column; j < 2 * D; j++) augmented[column][j] = augmented[column][j] * factor % 29;
    for (let i = 0; i < D; i++) {
      if (i === column) continue;
      const coeff = augmented[i][column];
      if (coeff === 0) continue;
      for (let j = column; j < 2 * D; j++) {
        augmented[i][j] = mod(augmented[i][j] - coeff * augmented[column][j]);
      }
    }
  }
  return {
    forward: rows,
    inverse: augmented.map(r => r.slice(D))
  };
}

/** Multiply a GF29 matrix by one 238-coordinate input vector. */
function matrixVector(rows, vector) {
  assert.equal(vector.length, D);
  return rows.map(row => {
    let sum = 0;
    for (let k = 0; k < D; k++) sum += row[k] * vector[k];
    return sum % 29;
  });
}

/**
 * Exact key-invariant rate of equal symbols between distinct 238-symbol
 * blocks at the SAME within-block coordinate. Unknown fixed per-coordinate
 * keys and bijections, and a single unknown coordinate permutation, leave
 * this statistic unchanged.
 */
function sameCoordinateCollisions(stream, blocks) {
  assert.equal(stream.length, D * blocks);
  let equal = 0;
  for (let position = 0; position < D; position++) {
    const counts = new Uint16Array(29);
    for (let block = 0; block < blocks; block++) counts[stream[block * D + position]]++;
    for (const count of counts) equal += count * (count - 1) / 2;
  }
  const pairs = D * blocks * (blocks - 1) / 2;
  return { equal, pairs, rate: equal / pairs };
}

const pages = gp.pages.filter(page => page.page < 56 && page.indices.length);
const original = pages.flatMap(page => page.indices);
const p36Offset = pages.filter(page => page.page < 36).reduce((sum, page) => sum + page.indices.length, 0);
const key = gp.pages.find(page => page.page === 36).indices;
assert.equal(original.length, 12956);
assert.equal(key.length, D);
assert.deepEqual(original.slice(p36Offset, p36Offset + D), key);

const maps = frobeniusInverseMatrix(originalFieldModulus());
const controls = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt", 217106],
  ["Gibran", "resources/control/gibran_prophet_58585.txt", 62492],
  ["Emerson", "resources/control/emerson_essays_2944.txt", 321327]
].map(([label, file, length]) => {
  const stream = encodeSourceNativeGP(data(file));
  assert.equal(stream.length, length, "native GP control length");
  return { label, stream };
});

const expected = [
  ["book", false, 11814, 340578],
  ["book", true, 11920, 340578],
  ["post-p36", false, 998, 28560],
  ["post-p36", true, 1000, 28560]
];
const runs = [];
for (const [clock, reverse, expectedEqual, expectedPairs] of expected) {
  const blocks = clock === "book" ? 54 : 16;
  const start = clock === "book" ? 0 : p36Offset + D;
  const output = [];
  for (let block = 0; block < blocks; block++) {
    const cipher = original.slice(start + block * D, start + (block + 1) * D);
    const decoded = matrixVector(maps.inverse, reverse ? cipher.reverse() : cipher);
    output.push(...(reverse ? decoded.reverse() : decoded));
  }
  const source = sameCoordinateCollisions(output, blocks);
  assert.equal(source.equal, expectedEqual, "source original equality count");
  assert.equal(source.pairs, expectedPairs);
  const references = controls.map(({ label, stream }) => {
    const width = D * blocks;
    const stride = Math.floor(width / 2);
    let windows = 0, min = Infinity, max = 0;
    for (let offset = 0; offset + width <= stream.length; offset += stride) {
      const observed = sameCoordinateCollisions(stream.slice(offset, offset + width), blocks);
      min = Math.min(min, observed.rate);
      max = Math.max(max, observed.rate);
      windows++;
    }
    assert(windows > 0 && min > source.rate, "source-native English equality contrast");
    return { label, windows, min, max };
  });
  runs.push({ clock, reversedOriginalBlock: reverse, blocks, source, references });
}

// Cipher plant: an entirely secret 238-symbol key, applied before
// source-derived Frobenius, with a second hidden nontrivial alphabet scale.
const plaintext = controls[1].stream.slice(0, D * 16);
const hidden = plaintext.map((x, i) => mod(11 * x + key[i % D]));
const enc = [], dec = [];
for (let block = 0; block < 16; block++) {
  const p = hidden.slice(block * D, (block + 1) * D);
  const cipher = matrixVector(maps.forward, p);
  enc.push(...cipher);
  dec.push(...matrixVector(maps.inverse, cipher));
}
assert.deepEqual(dec, hidden, "positive field encryption/inversion");
assert.equal(sameCoordinateCollisions(dec, 16).equal,
  sameCoordinateCollisions(plaintext, 16).equal,
  "unknown stationary affine key and alphabet preserve equalities");

console.log(JSON.stringify({
  classification: "conditional original-cipher family exclusion; no unknown plaintext or key",
  operation: "Frobenius^(-1) in original Q238 plus ANY stationary 238-coordinate key/bijections",
  originalRuneCount: original.length,
  field: "GF(29^238)",
  source: runs,
  nativeGPPositivePlant: {
    runes: plaintext.length,
    exactRecovered: dec.every((x, i) => x === hidden[i]),
    collisionRate: sameCoordinateCollisions(dec, 16).rate
  }
}, null, 2));
