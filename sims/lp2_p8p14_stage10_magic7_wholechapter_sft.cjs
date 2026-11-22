"use strict";
/**
 * 2014 Stage10 7x7 1033-sum magic square as reversible whole-chapter Hill
 * operator on original LP2 physical p8-p14, 7 pages = 7 * 247 = 1729 runes.
 * Frozen 8 orientations/layouts; read-only SFT, Windows Node22 CommonJS.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const load = p => fs.readFileSync(path.resolve(root, p), "utf8");
const corpus = JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const squares = load("resources/cicada2014-openpuff-magic-squares.txt")
  .trim().split(/\n\s*\n/).map(block => block.split(/\r?\n/)
    .filter(s => s.trim()).map(s => s.trim().split(/\s+/).map(Number)));
assert.deepEqual(squares.map(m => m.length), [5, 7, 5]);
const historical = squares[1], modulus = 29, dimension = 7;
assert(historical.every(r => r.length === dimension && r.reduce((a, b) => a + b, 0) === 1033));
const pages = corpus.pages.filter(p => p.page >= 8 && p.page <= 14);
const original = pages.flatMap(p => p.indices);
assert.equal(pages.length, dimension);
assert.deepEqual(pages.map(p => p.indices.length), [255, 268, 263, 273, 261, 272, 137]);
assert.equal(original.length, 1729);
const trackLength = original.length / dimension;
assert.equal(trackLength, 247);
const mod = x => ((x % modulus) + modulus) % modulus;
const identity = () => Array.from({length: dimension}, (_, i) =>
  Array.from({length: dimension}, (_, j) => Number(i === j)));
const multiply = (A, B) => A.map(row => B[0].map((_, j) =>
  mod(row.reduce((s, x, i) => s + x * B[i][j], 0))));
const applyVector = (M, v) => M.map(row =>
  mod(row.reduce((s, x, i) => s + x * v[i], 0)));
const transpose = M => M[0].map((_, j) => M.map(row => row[j]));
function invert(input) {
  const width = input.length, aug = input.map((row, i) => row.map(mod).concat(
    Array.from({length: width}, (_, j) => Number(i === j))));
  for (let col = 0; col < width; col++) {
    let p = col;
    while (p < width && aug[p][col] === 0) p++;
    assert(p < width, "Source square is not invertible over GF(29)");
    [aug[p], aug[col]] = [aug[col], aug[p]];
    let inv = 1;
    while (mod(inv * aug[col][col]) !== 1) inv++;
    assert(inv < modulus);
    aug[col] = aug[col].map(x => mod(x * inv));
    for (let i = 0; i < width; i++) {
      if (i === col) continue;
      const f = aug[i][col];
      aug[i] = aug[i].map((x, j) => mod(x - f * aug[col][j]));
    }
  }
  return aug.map(r => r.slice(width));
}
const inverse = invert(historical);
assert.deepEqual(multiply(historical, inverse), identity());
assert.deepEqual(multiply(inverse, historical), identity());
/** @param {number[]} body @param {number[][]} operator @param {"adjacent"|"tracks"} layout */
function transform(body, operator, layout) {
  assert.equal(body.length, dimension * trackLength);
  const output = Array(body.length);
  if (layout === "adjacent") {
    for (let at = 0; at < body.length; at += dimension) {
      const values = applyVector(operator, body.slice(at, at + dimension));
      values.forEach((value, offset) => { output[at + offset] = value; });
    }
  } else {
    for (let i = 0; i < trackLength; i++) {
      const values = applyVector(operator, Array.from({length: dimension},
        (_, j) => body[i + j * trackLength]));
      values.forEach((value, j) => { output[i + j * trackLength] = value; });
    }
  }
  return output;
}
const ioc = symbols => {
  const counts = Array(modulus).fill(0);
  for (const s of symbols) counts[s]++;
  return counts.reduce((n, count) => n + count * (count - 1), 0) /
    (symbols.length * (symbols.length - 1));
};
const native = corpus.pages.find(p => p.page === 57).indices;
assert(native.length >= 60);
const plant = Array.from({length: original.length},
  (_, i) => native[i % native.length]);
const cases = [
  ["M", historical, inverse],
  ["M^-1", inverse, historical],
  ["transpose(M)", transpose(historical), transpose(inverse)],
  ["transpose(M^-1)", transpose(inverse), transpose(historical)]
];
const outputs = [];
for (const [name, op, opposite] of cases) {
  for (const layout of ["adjacent", "tracks"]) {
    const decoded = transform(original, op, layout);
    assert.deepEqual(transform(decoded, opposite, layout), original);
    const encryptedPlant = transform(plant, opposite, layout);
    assert.deepEqual(transform(encryptedPlant, op, layout), plant);
    const score = Number(ioc(decoded).toFixed(12));
    assert(score < 0.036);
    outputs.push({operator: name, layout, indexOfCoincidence: score,
      recoveredNativePlant: plant.length});
  }
}
assert.deepEqual(outputs.map(x => x.indexOfCoincidence), [
  0.034501317396, 0.035160684832,
  0.034457136431, 0.034557547715,
  0.034413624874, 0.034356725146,
  0.034539473684, 0.034510689116
]);
console.log(JSON.stringify({
  classification: "Eight finite original 7x7 historical square whole-chapter inverses fail",
  input: "Original LP2 physical p8-p14",
  originalPageRuneCounts: pages.map(p => p.indices.length),
  originalRunes: original.length,
  chapterChannels: 7,
  trackLength,
  historicalSquareSum: 1033,
  determinantMod29: 2,
  originalIndexOfCoincidence: Number(ioc(original).toFixed(12)),
  sourceNativeControlPositiveCases: outputs.length,
  sourceNativeControlRunes: plant.length,
  results: outputs,
  limitation: "Excludes these eight direct single-layer original whole-chapter GF29 Hill decoders, not layered ciphers, other encodings, or external keys."
}, null, 2));
