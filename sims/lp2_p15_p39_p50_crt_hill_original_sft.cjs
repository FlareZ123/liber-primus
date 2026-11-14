"use strict";

/**
 * A single source-assembled, reversible 4×4 extension of the p15/p39/p50
 * rank-two matrix: use the canonical complementary CRT projector on the
 * p15 signed matrix's generalized 24-eigenspace. This is NOT an author
 * instruction, so original-output failure closes only this fixed model.
 * SFT: node sims/lp2_p15_p39_p50_crt_hill_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const corpus = JSON.parse(fs.readFileSync(path.resolve(__dirname,
  "../resources/liber-primus/lp2-corpus.json"), "utf8"));
const mat = [
  [10, 3, 20, 22],
  [1, 22, 21, 25],
  [11, 17, 19, 7],
  [8, 12, 12, 22]
];
const PofM = [
  [2, 9, 3, 25],
  [22, 13, 24, 12],
  [5, 4, 0, 27],
  [14, 21, 22, 27]
];
const F = 29;
/** @param {number} x @returns {number} */
const mod = x => (x % F + F) % F;
const eye = () => Array.from({length: 4}, (_, i) =>
  Array.from({length: 4}, (_, j) => Number(i === j)));
const zero = () => Array.from({length: 4}, () => Array(4).fill(0));
/** @param {number[][]} a @param {number[][]} b */
function mul(a, b) {
  return a.map(row => row.map((_, j) =>
    mod(row.reduce((s, x, k) => s + x * b[k][j], 0))));
}
/** @param {number[][]} a @param {number[][]} b */
function add(a, b) {
  return a.map((row, i) => row.map((x, j) => mod(x + b[i][j])));
}
/** @param {number[][]} a @param {number} k */
function scaled(a, k) {return a.map(row => row.map(x => mod(x * k)));}
/** @param {number[]} coefficients */
function poly(coefficients) {
  let acc = zero();
  for (const c of coefficients)
    acc = add(mul(acc, mat), scaled(eye(), c));
  return acc;
}
/** @param {number[][]} original */
function inverse(original) {
  const m = original.map((row, i) => row.concat(eye()[i]));
  for (let col = 0; col < 4; col++) {
    const pivot = m.findIndex((row, i) => i >= col && row[col] !== 0);
    assert.notEqual(pivot, -1, "CRT extension must be invertible");
    [m[col], m[pivot]] = [m[pivot], m[col]];
    let inv = 1;
    while (m[col][col] * inv % F !== 1) inv++;
    for (let j = col; j < 8; j++) m[col][j] = mod(m[col][j] * inv);
    for (let i = 0; i < 4; i++) if (i !== col) {
      const k = m[i][col];
      for (let j = col; j < 8; j++)
        m[i][j] = mod(m[i][j] - k * m[col][j]);
    }
  }
  return m.map(row => row.slice(4));
}
/**
 * @param {number[][]} matrix @param {number[]} four
 * @param {"column"|"row"} orientation
 * @returns {number[]}
 */
function transform(matrix, four, orientation) {
  if (orientation === "column")
    return matrix.map(row => mod(row.reduce((s, v, i) => s + v * four[i], 0)));
  return matrix[0].map((_, j) =>
    mod(four.reduce((s, x, i) => s + x * matrix[i][j], 0)));
}
/**
 * @param {number[][]} matrix @param {number[]} stream
 * @param {"column"|"row"} orientation
 */
function blockTransform(matrix, stream, orientation) {
  assert.equal(stream.length % 4, 0);
  const result = [];
  for (let i = 0; i < stream.length; i += 4)
    result.push(...transform(matrix, stream.slice(i, i + 4), orientation));
  return result;
}
/** @param {number[]} stream */
function ioc(stream) {
  const counts = Array(29).fill(0);
  for (const x of stream) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (stream.length * (stream.length - 1));
}
/** @param {number[]} stream */
const display = stream => stream.map(n => corpus.translit[n]).join("");

/* The unique CRT projector E24=1 mod(X−24)^2 and 0 mod
 * (X−8)(X−17), expressed with GF29 polynomial coefficients. */
const E24 = poly([4, 14, 14, 18]);
assert.deepEqual(E24, [
  [11, 25, 21, 20],
  [16, 6, 18, 15],
  [24, 26, 21, 0],
  [16, 2, 16, 22]
]);
assert.deepEqual(mul(E24, E24), E24);
assert.deepEqual(mul(E24, PofM), zero());
const K = add(PofM, E24);
assert.deepEqual(K, [
  [13, 5, 24, 16],
  [9, 19, 13, 27],
  [0, 1, 21, 27],
  [1, 23, 9, 20]
]);
const inverseK = inverse(K);
assert.deepEqual(inverseK, [
  [27, 11, 7, 15],
  [14, 26, 15, 19],
  [22, 20, 20, 27],
  [6, 20, 14, 3]
]);
assert.deepEqual(mul(K, inverseK), eye());
assert.deepEqual(mul(inverseK, K), eye());

/* Literal physical intervals: p40's red 8-rune heading is excluded
 * for a 3000-rune black body, and the later p55 has 76 runes including
 * its one source-original p54 carry symbol (NG). No page/word skips. */
const chapter = corpus.pages.slice(40, 54).flatMap(p => p.indices);
const p55 = corpus.pages.find(p => p.page === 55).indices;
const native = corpus.pages.find(p => p.page === 57).indices;
assert.equal(chapter.length, 3008);
assert.equal(chapter.slice(8).length, 3000);
assert.equal(p55.length, 76);
assert.equal(native.length, 95);
const intervals = [
  {name:"p40-53, 3000 post-heading runes", runes:chapter.slice(8)},
  {name:"p55, 76 unaltered runes", runes:p55}
];

/* The same exact K roundtrips 76 genuine SOURCE-plaintext runes under
 * both column and row conventions; a wrong key would roundtrip too, so
 * readability of original unknown pages is the actual decision. */
for (const orientation of ["column", "row"]) {
  const plant = native.slice(0, 76);
  const encrypted = blockTransform(K, plant, orientation);
  assert.deepEqual(blockTransform(inverseK, encrypted, orientation), plant);
  assert.notDeepEqual(encrypted, plant);
}

const output = [];
for (const segment of intervals) {
  const result = {
    interval: segment.name,
    length: segment.runes.length,
    originalIoC: ioc(segment.runes),
    variants: []
  };
  for (const [label, matrix] of [["K", K], ["K-inverse", inverseK]]) {
    for (const orientation of ["column", "row"]) {
      const decoded = blockTransform(matrix, segment.runes, orientation);
      const check = blockTransform(label === "K" ? inverseK : K, decoded,
        orientation);
      assert.deepEqual(check, segment.runes);
      result.variants.push({
        operation: label, orientation, ioc: ioc(decoded),
        first80: display(decoded.slice(0, 80))
      });
    }
  }
  output.push(result);
}
assert.ok(output[0].variants.every(v =>
  v.ioc > 0.033 && v.ioc < 0.036));
assert.ok(output[1].variants.every(v => v.ioc < 0.033));
console.log(JSON.stringify({
  projector: E24,
  sourceAssembledHill4Key: K,
  invertible: true,
  determinant: 28,
  solvedP57SourceControlIoC: ioc(native),
  result: output,
  decision: "All four CRT-Hill4 decoders remain ciphertext-like on both original intervals; no plaintext recovered"
}, null, 2));
