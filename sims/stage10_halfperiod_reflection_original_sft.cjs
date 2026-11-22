"use strict";

/**
 * Stage10 three source matrices: exact half-period reflection identities
 * over GF29, and original LP2 p33/paired-page receiver gates.
 * Single Windows 11 / Node22 CommonJS test, no external dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..", "resources");
const source = fs.readFileSync(
  path.join(root, "cicada2014-openpuff-magic-squares.txt"), "utf8");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "liber-primus", "lp2-corpus.json"), "utf8"));
const wordSource = fs.readFileSync(
  path.join(root, "lp2-transcription.txt"), "utf8");
const ink = JSON.parse(fs.readFileSync(
  path.join(root, "liber-primus", "lp2-ink-annotations.json"), "utf8"));

const mod = x => ((x % 29) + 29) % 29;
const multiply = (A, B) => A.map(row => B[0].map((_, col) =>
  mod(row.reduce((s, x, i) => s + x * B[i][col], 0))));
const identity = n => Array.from({ length: n }, (_, i) =>
  Array.from({ length: n }, (_, j) => Number(i === j)));
const flip = n => Array.from({ length: n }, (_, i) =>
  Array.from({ length: n }, (_, j) => Number(i + j === n - 1)));
const all = n => Array.from({ length: n }, () => Array(n).fill(1));

/**
 * @param {number[][]} original
 * @param {number} exponent
 * @returns {number[][]}
 */
function power(original, exponent) {
  let result = identity(original.length);
  let base = original.map(row => row.map(mod));
  let k = exponent;
  while (k > 0) {
    if (k % 2 === 1) result = multiply(result, base);
    base = multiply(base, base);
    k = Math.floor(k / 2);
  }
  return result;
}

const equal = (a, b) => assert.deepEqual(a, b);
const mats = source.trim().split(/\r?\n\s*\r?\n/u).map(s =>
  s.trim().split(/\r?\n/u).map(line =>
    line.trim().split(/\s+/u).map(Number)));
assert.deepEqual(mats.map(m => m.length), [5, 7, 5]);
assert.deepEqual(mats.map(m => m[0].length), [5, 7, 5]);
const [M3301, M1033_7, M1033_5] = mats.map(A => A.map(r => r.map(mod)));
for (let j = 0; j < 3; j++) {
  const value = j === 0 ? 3301 : 1033;
  const m = mats[j];
  for (let r = 0; r < m.length; r++) {
    assert.equal(m[r].reduce((a, b) => a + b), value);
    assert.equal(m.reduce((a, row) => a + row[r], 0), value);
  }
  for (let r = 0; r < m.length; r++)
    for (let c = 0; c < m.length; c++)
      assert.equal(m[r][c], m[m.length - 1 - r][m.length - 1 - c]);
}

const half5a = power(M3301, 28);
const half5b = power(M1033_5, 14);
const half7 = power(M1033_7, 140);
const R5 = flip(5);
const R7 = flip(7);
const T5a = all(5).map((row, i) =>
  row.map((_, j) => mod(12 - R5[i][j])));
const T5b = R5.map(row => row.map(x => mod(-x)));
equal(half5a, T5a); // 3301 M^28 = 12 J - reverse.
equal(half5b, T5b); // 1033 5x5 M^14 = -reverse.
const u = [6, 26, 13, 0, 16, 3, 23];
const v = [1, 8, 26, 0, 3, 21, 28];
const T7 = all(7).map((row, i) =>
  row.map((_, j) => mod(R7[i][j] + u[i] * v[j])));
equal(half7, T7); // 1033 7x7 M^140 = reverse + rank-one.
for (let i = 0; i < 7; i++) {
  assert.equal(mod(u[i] + u[6 - i]), 0);
  assert.equal(mod(v[i] + v[6 - i]), 0);
}
assert.equal(mod(v.reduce((s, x, i) => s + x * u[i], 0)), 2);
for (const [M, period, half] of [
  [M3301, 56, half5a], [M1033_5, 28, half5b], [M1033_7, 280, half7],
]) {
  equal(power(M, period), identity(M.length));
  assert.notDeepEqual(half, identity(M.length));
  equal(multiply(half, half), identity(M.length));
}
const sourceRankOne = half7.map((row, i) =>
  row.map((x, j) => mod(x - R7[i][j])));
equal(sourceRankOne, u.map(x => v.map(y => mod(x * y))));

// p33's source-authenticated red spans leave 196 original black runes;
// their original physical arrangement has one red break between black runs.
const p33 = corpus.pages[33].indices;
const i33 = ink.pages.find(p => p.page === 33);
assert.equal(p33.length, 214);
assert.deepEqual(i33.red_spans.map(x => [x.start, x.length]),
  [[0, 10], [91, 8]]);
const black = p33.slice(10, 91).concat(p33.slice(99));
assert.equal(black.length, 196);
const blocks = Array.from({ length: 4 }, (_, index) => {
  const part = black.slice(49 * index, 49 * (index + 1));
  return Array.from({ length: 7 }, (_, row) =>
    part.slice(7 * row, 7 * row + 7));
});
const transpose = A => A[0].map((_, i) => A.map(row => row[i]));
function apply(blocks, orientation) {
  return blocks.flatMap(B => {
    const product = orientation === "left" ? multiply(T7, B) :
      orientation === "right" ? multiply(B, T7) :
      orientation === "both" ? multiply(multiply(T7, B), T7) : B;
    return product.flat();
  });
}
function indexOfCoincidence(sequence) {
  const f = Array(29).fill(0);
  for (const x of sequence) f[x] += 1;
  return f.reduce((sum, n) => sum + n * (n - 1), 0) /
    (sequence.length * (sequence.length - 1));
}
const receiver = {};
for (const scheme of ["none", "left", "right", "both"]) {
  const converted = apply(blocks, scheme);
  assert.equal(converted.length, 196);
  receiver[scheme] = {
    ioc: Number(indexOfCoincidence(converted).toFixed(10)),
    first20: converted.slice(0, 20),
    first20Text: converted.slice(0, 20).map(x => corpus.translit[x]).join(" "),
  };
}
assert.deepEqual(receiver.none.ioc, 0.0335426478);
assert.deepEqual(receiver.left.ioc, 0.0351125065);
assert.deepEqual(receiver.right.ioc, 0.0349555207);
assert.deepEqual(receiver.both.ioc, 0.0344322344);

// Source-native plant: the clear original p57's first 49 GP29 symbols
// are one 7x7 plaintext matrix, and T7 is a self-inverse emitter.
const native = corpus.pages[57].indices.slice(0, 49);
assert.equal(native.length, 49);
const nativeBlock = Array.from({ length: 7 }, (_, row) =>
  native.slice(7 * row, 7 * row + 7));
const nativeEncrypted = multiply(T7, nativeBlock);
const nativeRecovered = multiply(T7, nativeEncrypted).flat();
equal(nativeRecovered, native);

// Test a **typed** original 28-page gap only, no phase/word permutations.
const pages = corpus.pages.slice(0, 56).map(p => p.indices);
const transcriptionPages = wordSource.split("%");
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const words = Array.from({ length: 56 }, (_, pageNo) => {
  if (pageNo === 50) return [];
  const section = transcriptionPages[pageNo < 50 ? pageNo : pageNo - 1];
  const result = [];
  let runes = [], start = 0, offset = 0;
  const flush = () => {
    if (runes.length) { result.push({ offset: start, runes }); runes = []; }
  };
  for (const ch of section) {
    if (runeIndex.has(ch)) {
      if (!runes.length) start = offset;
      runes.push(runeIndex.get(ch));
      offset++;
    } else if (ch === "/" || /\s/u.test(ch)) {
      // Physical line wraps retain one printed word.
    } else flush();
  }
  flush();
  assert.equal(offset, pages[pageNo].length);
  return result;
});
const transform5 = runes => {
  const total = 12 * runes.reduce((a, b) => a + b, 0);
  return runes.map((_, i) => mod(total - runes[4 - i]));
};
let wordPairs = 0, equalWords = 0, equalSameOffset = 0, sameOffsetWindows = 0;
for (let page = 0; page < 28; page++) {
  const partner = page + 28;
  const wA = words[page].filter(w => w.runes.length === 5);
  const wB = words[partner].filter(w => w.runes.length === 5);
  const bSet = new Set(wB.map(w => w.runes.join(",")));
  wordPairs += wA.length * wB.length;
  for (const word of wA)
    if (bSet.has(transform5(word.runes).join(","))) equalWords++;
  const A = pages[page], B = pages[partner];
  for (let at = 0; at + 5 <= Math.min(A.length, B.length); at++) {
    sameOffsetWindows++;
    if (transform5(A.slice(at, at + 5)).every((x, i) => x === B[at + i]))
      equalSameOffset++;
  }
}
assert.equal(wordPairs, 925);
assert.equal(equalWords, 0);
assert.equal(sameOffsetWindows, 5555);
assert.equal(equalSameOffset, 0);
console.log(JSON.stringify({
  sourceMatrixOrder: [56, 280, 28],
  originalSourceMirror: "LP2 p33 cuneiform displays 1033 / 3301",
  stage10HalfTurn: {
    m3301_5: "M^28 = 12*allones5 - antidiagonal5",
    m1033_5: "M^14 = -antidiagonal5",
    m1033_7: "M^140 = antidiagonal7 + u*v^T",
    u, v, vDotU: 2
  },
  originalP33: { blackCount: black.length, originalIntervals: [[10, 91], [99, 214]],
    orientationResults: receiver },
  originalHalfPagePair: {
    wordComparisons: wordPairs, exactFiveRuneWords: equalWords,
    sameOffsetWindows, exactAlignedWindows: equalSameOffset
  },
  nativeP57PlantRecovered: nativeRecovered.length
}, null, 2));
