"use strict";

/**
 * Test the four source-printed 8x8 p50 table squares as Hill-cipher
 * receivers for exactly those illustrated chapters whose length is
 * one more than a multiple of eight.
 *
 * Windows Node.js 22 single-file read-only source test. No CLI args.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} name @returns {string} */
function load(name) {
  return fs.readFileSync(path.join(root, name), "utf8");
}
const corpus = JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(load("resources/liber-primus/lp2-grid-256.json"));
/** @param {number} value @returns {number} */
const mod = (value) => ((value % 29) + 29) % 29;
/** @param {number[]} stream @returns {number} */
function ioc(stream) {
  const h = new Uint32Array(29);
  for (const symbol of stream) h[symbol] += 1;
  const pairs = h.reduce((sum, count) => sum + count * (count - 1), 0);
  return pairs / (stream.length * (stream.length - 1));
}
/**
 * Invert an n-by-n matrix in GF(29), or return null if singular.
 * @param {number[][]} input
 * @returns {number[][] | null}
 */
function invert(input) {
  const n = input.length;
  const a = input.map((row, i) => row.map(mod)
    .concat(Array.from({ length: n }, (_, j) => Number(i === j))));
  let rank = 0;
  for (let j = 0; j < n; j += 1) {
    let pivot = rank;
    while (pivot < n && a[pivot][j] === 0) pivot += 1;
    if (pivot === n) continue;
    [a[pivot], a[rank]] = [a[rank], a[pivot]];
    const reciprocal = Array.from({ length: 29 }, (_, k) => k)
      .find((k) => mod(k * a[rank][j]) === 1);
    assert.ok(reciprocal !== undefined);
    a[rank] = a[rank].map((v) => mod(v * reciprocal));
    for (let i = 0; i < n; i += 1) {
      if (i === rank) continue;
      const factor = a[i][j];
      a[i] = a[i].map((v, col) => mod(v - factor * a[rank][col]));
    }
    rank += 1;
  }
  return rank === n ? a.map((row) => row.slice(n)) : null;
}
/**
 * @param {number[][]} matrix
 * @param {number[]} vector
 * @returns {number[]}
 */
function multiply(matrix, vector) {
  const n = matrix.length;
  assert.equal(vector.length, n);
  return matrix.map((row) => mod(row.reduce((acc, k, j) =>
    acc + k * vector[j], 0)));
}
/** @param {number[][]} input @returns {number[][]} */
function transpose(input) {
  return input[0].map((_, j) => input.map((row) => row[j]));
}

assert.equal(grid.bytes.length, 256);
assert.equal(grid.pages.reduce((sum, p) => sum + p.rows, 0), 32);
const squares = Array.from({ length: 4 }, (_, block) =>
  Array.from({ length: 8 }, (_, row) =>
    grid.bytes.slice(block * 64 + row * 8, block * 64 + row * 8 + 8)
      .map(mod)));
const chapters = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55],
];
const streams = chapters.map(([first, last]) =>
  corpus.pages.filter((p) => p.page >= first && p.page <= last)
    .flatMap((p) => p.indices));
assert.deepEqual(streams.map((stream) => stream.length),
  [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]);
const targets = streams.map((stream, chapter) => ({ stream, chapter }))
  .filter(({ stream }) => stream.length % 8 === 1);
assert.deepEqual(targets.map(({ chapter }) => chapter), [0, 1, 2, 5]);
const native = corpus.pages.find((page) => page.page === 57).indices;
assert.equal(native.length, 95);
assert.ok(ioc(native) > 0.06);

const outcomes = [];
for (let square = 0; square < 4; square += 1) {
  for (const transposed of [false, true]) {
    const matrix = transposed ? transpose(squares[square]) : squares[square];
    const inverse = invert(matrix);
    assert.ok(inverse, "each printed 8x8 source square has rank eight");

    // Independent authentic GP-native known-text positive: encrypt
    // complete eight-rune blocks under a square then recover exactly.
    for (let start = 0; start + 8 <= native.length; start += 8) {
      const original = native.slice(start, start + 8);
      assert.deepEqual(multiply(inverse, multiply(matrix, original)), original);
      assert.deepEqual(multiply(matrix, multiply(inverse, original)), original);
    }

    for (const reverse of [false, true]) {
      const operator = reverse ? inverse : matrix;
      const encoder = reverse ? matrix : inverse;
      for (const { stream, chapter } of targets) {
        for (const offset of [0, 1]) {
          const complete = 8 * Math.floor((stream.length - offset) / 8);
          const output = [];
          for (let pos = offset; pos < offset + complete; pos += 8) {
            const block = stream.slice(pos, pos + 8);
            const decoded = multiply(operator, block);
            assert.deepEqual(multiply(encoder, decoded), block,
              "source original ciphertext must reencrypt exactly");
            output.push(...decoded);
          }
          outcomes.push({
            square, transposed, reverse, chapter, offset,
            runes: output.length, ioc: ioc(output),
            opening: output.slice(0, 32).map((v) => corpus.translit[v])
              .join(" "),
          });
        }
      }
    }
  }
}

assert.equal(outcomes.length, 128);
const ranked = outcomes.slice().sort((a, b) => b.ioc - a.ioc);
assert.ok(ranked.every((x) => x.ioc < 0.04),
  "no direct matrix reading should reproduce native GP29 prose profile");
assert.ok(Math.abs(ranked[0].ioc - 0.03508700014444718) < 1e-9);
assert.ok(Math.abs(ranked.at(-1).ioc - 0.0330) < 0.005);
process.stdout.write(JSON.stringify({
  source: {
    tableShape: [32, 8], naturalSquares: 4,
    visualChapterRunes: streams.map((stream) => stream.length),
    oneModuloEightChapters: targets.map((x) => x.chapter),
    allSquaresInvertibleOverGF29: true,
  },
  testedOriginalSourceVariants: outcomes.length,
  authenticClearP57Ioc: ioc(native),
  bestOriginalSourceCandidates: ranked.slice(0, 8),
  worstOriginalSourceIoc: ranked.at(-1).ioc,
  decision: "Direct four-square 8x8 Hill readings do not recover native-GP prose.",
}, null, 2) + "\n");
