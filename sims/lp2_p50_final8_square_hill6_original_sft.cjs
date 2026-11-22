"use strict";
/**
 * SFT: original p51 final eight-by-eight source square, one-corner-seven,
 * and literal six-by-six interior as source-typed Hill8/Hill7/Hill6 GP29 keys.
 * Frozen physical row-major extraction.
 * Both real digit alphabets, two standard matrix-vector directions.
 * Read-only; Node.js 22 CommonJS; no selected plaintext, offset or key fitting.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-grid-256.json"), "utf8"));
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const native = JSON.parse(fs.readFileSync(path.join(root, "resources", "external", "relikd-solved-gp29-native-v1.json"), "utf8"));
const tokens = grid.pages.flatMap((page) => page.tokens);
const base60 = grid.pages.flatMap((page) => page.bytes);
const digits59 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeghijklmnopqrstuvwx";
const base59 = tokens.map((t) => 59 * digits59.indexOf(t[0]) + digits59.indexOf(t[1]));
const mod = (x) => ((x % 29) + 29) % 29;
assert.equal(tokens.length, 256);
assert.equal(base60.length, 256);
assert.deepEqual(tokens.flatMap((t, i) => t === "00" ? [i] : []), [192, 229]);

/** Exact physical six-by-six interior, excluding the outer one-cell 8×8 rim. */
const squareInside = (values) => Array.from({ length: 6 }, (_, r) =>
  Array.from({ length: 6 }, (_, c) => mod(values[192 + (r + 1) * 8 + c + 1])));
const K60 = squareInside(base60);
const K59 = squareInside(base59);
assert.deepEqual(K60, [
  [16, 6, 10, 20, 18, 11],
  [1, 6, 3, 12, 5, 19],
  [16, 3, 1, 0, 23, 22],
  [23, 15, 17, 28, 0, 1],
  [2, 22, 5, 6, 3, 13],
  [25, 13, 11, 22, 27, 24]
]);
assert.deepEqual(K59, [
  [15, 3, 9, 17, 17, 9],
  [27, 6, 2, 11, 3, 15],
  [13, 1, 0, 28, 22, 21],
  [22, 14, 13, 26, 0, 28],
  [27, 19, 3, 2, 3, 11],
  [23, 12, 8, 22, 26, 21]
]);

/**
 * Exact Gaussian elimination over prime field Z29.
 * @param {number[][]} matrix square GP29 matrix
 * @returns {{rank:number,det:number,inverse:number[][]|null}}
 */
function invert29(matrix) {
  const width = matrix.length;
  const A = matrix.map((row, i) => [
    ...row, ...Array.from({ length: width }, (_, j) => Number(i === j))
  ]);
  let rank = 0;
  let det = 1;
  for (let j = 0; j < width; j++) {
    let pivot = -1;
    for (let k = j; k < width; k++) {
      if (A[k][j]) { pivot = k; break; }
    }
    if (pivot < 0) return { rank, det: 0, inverse: null };
    if (pivot !== j) {
      [A[pivot], A[j]] = [A[j], A[pivot]];
      det = mod(-det);
    }
    const v = A[j][j];
    det = mod(det * v);
    let scale = 1;
    while (mod(scale * v) !== 1) scale++;
    A[j] = A[j].map((x) => mod(x * scale));
    for (let row = 0; row < width; row++) {
      if (row === j) continue;
      const factor = A[row][j];
      A[row] = A[row].map((x, k) => mod(x - factor * A[j][k]));
    }
    rank++;
  }
  return { rank, det, inverse: A.map((row) => row.slice(width)) };
}

/** @param {number[][]} a @param {number[][]} b */
const matrixProduct = (a, b) => a.map((row) =>
  Array.from({ length: a.length }, (_, j) =>
    mod(row.reduce((sum, x, k) => sum + x * b[k][j], 0))));
const identity = Array.from({ length: 6 }, (_, i) =>
  Array.from({ length: 6 }, (_, j) => Number(i === j)));
const transpose = (matrix) => matrix[0].map((_, j) => matrix.map((row) => row[j]));
const K60State = invert29(K60);
const K59State = invert29(K59);
assert.equal(K60State.rank, 5);
assert.equal(K60State.inverse, null);
assert.equal(K59State.rank, 6);
assert.equal(K59State.det, 24);
assert.deepEqual(matrixProduct(K59, K59State.inverse), identity);
assert.deepEqual(matrixProduct(K59State.inverse, K59), identity);
const rawLast64 = base60.slice(192);
const trueInner = Array.from({ length: 36 }, (_, j) => {
  const row = 1 + Math.floor(j / 6);
  const col = 1 + j % 6;
  return 192 + row * 8 + col;
});
const zeroBracket = Array.from({ length: 36 }, (_, j) => 193 + j);
assert.equal(rawLast64.length, 64);
assert.equal(trueInner.filter((i) => zeroBracket.includes(i)).length, 22);
assert.deepEqual([192, 229].map((i) => {
  const off = i - 192;
  return [Math.floor(off / 8), off % 8];
}), [[0, 0], [4, 5]]);

/** Encode/decode source-dimension rune blocks; preserve original whole-block cut. */
const transform = (M, input) => {
  const output = [];
  const width = M.length;
  for (let k = 0; k + width <= input.length; k += width) {
    const x = input.slice(k, k + width);
    for (const row of M) output.push(mod(row.reduce((sum, a, j) => sum + a * x[j], 0)));
  }
  return output;
};
const render = (indices) => indices.map((i) => corpus.translit[i]).join(" ");
const ioc = (indices) => {
  const freq = Array(29).fill(0);
  for (const i of indices) freq[i]++;
  const n = indices.length;
  return freq.reduce((sum, x) => sum + x * (x - 1), 0) / (n * (n - 1));
};
const idx = new Map(corpus.runes.map((r, i) => [r, i]));
const p56Native = [...native.sections.find((section) =>
  section.name === "p56_an_end").source_text].filter((r) => idx.has(r)).map((r) => idx.get(r));
assert.equal(p56Native.length, 85);
const positiveInput = p56Native.slice(0, 84);
assert.deepEqual(transform(K59State.inverse, transform(K59, positiveInput)), positiveInput);
assert.deepEqual(transform(transpose(K59State.inverse),
  transform(transpose(K59), positiveInput)), positiveInput);
const candidates = [];
for (const page of [49, 51, 55]) {
  const original = corpus.pages.find((x) => x.page === page).indices;
  const usable = original.slice(0, original.length - original.length % 6);
  for (const [matrixDirection, forward, inverse] of [
    ["column", K59, K59State.inverse],
    ["row", transpose(K59), transpose(K59State.inverse)]
  ]) {
    const decoded = transform(inverse, usable);
    assert.deepEqual(transform(forward, decoded), usable);
    candidates.push({
      page, matrixDirection, nRunes: decoded.length, leftover: original.length - decoded.length,
      inverseIoC: ioc(decoded), decodedGp29: render(decoded)
    });
  }
}
const base60LeftNull6 = [4, 21, 18, 17, 26, 1];
assert.deepEqual(Array.from({ length: 6 }, (_, col) =>
  mod(base60LeftNull6.reduce((sum, coefficient, row) =>
    sum + coefficient * K60[row][col], 0))), Array(6).fill(0));
const base60ParityCodeCheck = [49, 51, 55].map((page) => {
  const original = corpus.pages.find((entry) => entry.page === page).indices;
  const syndromes = [];
  for (let i = 0; i + 6 <= original.length; i += 6) {
    syndromes.push(mod(base60LeftNull6.reduce((sum, coefficient, position) =>
      sum + coefficient * original[i + position], 0)));
  }
  return { page, blocks: syndromes.length,
    satisfyingBlocks: syndromes.filter((s) => s === 0).length,
    firstSixSyndromes: syndromes.slice(0, 6),
    allBlocksRespectParity: syndromes.every((s) => s === 0) };
});
assert.deepEqual(base60ParityCodeCheck.map((x) => [x.blocks, x.satisfyingBlocks]),
  [[11, 2], [15, 1], [12, 0]]);
assert(base60ParityCodeCheck.every((x) => !x.allBlocksRespectParity));
const outerSquareTests = [];
for (const [shape, dimension, inset] of [
  ["whole8x8", 8, 0],
  ["removeZeroCornerRowAndColumn7x7", 7, 1]
]) {
  for (const [radix, values] of [["base60", base60], ["base59-drop-f", base59]]) {
    const key = Array.from({ length: dimension }, (_, row) =>
      Array.from({ length: dimension }, (_, col) =>
        mod(values[192 + 8 * (row + inset) + col + inset])));
    const state = invert29(key);
    const expected = shape === "whole8x8"
      ? (radix === "base60" ? 12 : 7)
      : (radix === "base60" ? 4 : 17);
    assert.equal(state.rank, dimension);
    assert.equal(state.det, expected);
    const unit = Array.from({ length: dimension }, (_, i) =>
      Array.from({ length: dimension }, (_, j) => Number(i === j)));
    assert.deepEqual(matrixProduct(key, state.inverse), unit);
    assert.deepEqual(matrixProduct(state.inverse, key), unit);
    const nativeUnit = p56Native.slice(0, dimension * Math.floor(p56Native.length / dimension));
    assert.deepEqual(transform(state.inverse, transform(key, nativeUnit)), nativeUnit);
    for (const page of [49, 51, 55]) {
      const original = corpus.pages.find((x) => x.page === page).indices;
      for (const [matrixDirection, forward, inverse] of [
        ["column", key, state.inverse],
        ["row", transpose(key), transpose(state.inverse)]
      ]) {
        const decoded = transform(inverse, original);
        assert.deepEqual(transform(forward, decoded), original.slice(0, decoded.length));
        outerSquareTests.push({
          shape, radix, rank: state.rank, det29: state.det,
          page, matrixDirection, nRunes: decoded.length,
          leftover: original.length - decoded.length,
          inverseIoC: ioc(decoded), first44Gp29: render(decoded.slice(0, 44))
        });
      }
    }
  }
}
const intactFlanks = {
  pretable138: [
    ...corpus.pages.find((page) => page.page === 48).indices.slice(-72),
    ...corpus.pages.find((page) => page.page === 49).indices
  ],
  posttable170: [
    ...corpus.pages.find((page) => page.page === 51).indices,
    ...corpus.pages.find((page) => page.page === 52).indices.slice(0, 78)
  ]
};
assert.equal(intactFlanks.pretable138.length, 138);
assert.equal(intactFlanks.posttable170.length, 170);
assert.deepEqual(intactFlanks.pretable138.slice(0, 2), [20, 2]); // L TH
assert.deepEqual(intactFlanks.posttable170.slice(0, 2), [7, 7]); // W W
const intactFlankTwoRuneHeaderHill8 = [];
for (const [radix, values] of [["base60", base60], ["base59-drop-f", base59]]) {
  const key = Array.from({ length: 8 }, (_, row) =>
    Array.from({ length: 8 }, (_, col) => mod(values[192 + row * 8 + col])));
  const state = invert29(key);
  assert.equal(state.rank, 8);
  for (const [flank, original] of Object.entries(intactFlanks)) {
    const body = original.slice(2);
    assert.equal(body.length % 8, 0);
    for (const [direction, forward, inverse] of [
      ["column", key, state.inverse],
      ["row", transpose(key), transpose(state.inverse)]
    ]) {
      const decoded = transform(inverse, body);
      assert.equal(decoded.length, body.length);
      assert.deepEqual(transform(forward, decoded), body);
      intactFlankTwoRuneHeaderHill8.push({
        flank, radix, direction, sourceHeaderGp29: render(original.slice(0, 2)),
        cipherRunes: original.length, decipheredRunes: decoded.length,
        inverseIoC: ioc(decoded), decodedFirst72Gp29: render(decoded.slice(0, 72)),
        decodedLast16Gp29: render(decoded.slice(-16))
      });
    }
  }
}
console.log(JSON.stringify({
  mode: "source-original final 8x8 -> natural nested 7x7 and 6x6 -> frozen HillN mod29",
  rowMajorSquareStart: 192, literalZeroLocations: [192, 229],
  overlapBetweenSourceZeroBracketAndTrueInterior: 22,
  base60: { rank: K60State.rank, det29: 0, recoverable: false,
    fullBlockParityLeftNull6: base60LeftNull6, parityCodeNecessaryCheck: base60ParityCodeCheck },
  base59: { rank: K59State.rank, det29: K59State.det, recoverable: true },
  inverseGp29Tests: candidates,
  originalNestedSquareHill8AndHill7: outerSquareTests,
  intactFlankTwoRuneHeaderHill8,
  positive: "84 authentic p56 plaintext runes roundtrip under both Hill6 orientations",
  verdict: "All source-geometry Hill8/Hill7 inverses are nonprose on three untouched pages, and complete original 138/170 rune flanks remain nonprose after source two-rune header exclusion. Base59 Hill6 nonprose; base60 Hill6 rank5 fails exact full-block parity necessary condition."
}, null, 2));
