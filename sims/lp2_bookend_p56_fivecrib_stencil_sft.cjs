"use strict";

/**
 * LP2 81x81 -> 80x80 square-completion inverse, using the five solved
 * AN END heading glyphs as the final five cells of the smaller square.
 * Original-input, deterministic, Windows Node.js 22 SFT.
 *
 * Run from the repository root:
 * node sims/lp2_bookend_p56_fivecrib_stencil_sft.cjs
 *
 * Scope:
 * - 2D mixed finite difference selected by the known MOBIUS clue;
 * - 2x2 affine GP29 stencil with five coefficients reconstructed only
 *   from the known p56 plaintext/ciphertext heading;
 * - independently test whether the duplicated p55 ending and the
 *   first five p56 ciphertext glyphs follow a shared affine 2x2
 *   transformation from the 81x81 source.
 * No coefficients are fitted on any unknown plaintext position.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(
  root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const unknown = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const p56 = corpus.pages.find(p => p.page === 56).indices;
const first = unknown.slice(0, 81 * 81);
const remaining = unknown.slice(81 * 81);
const second = remaining.concat(p56.slice(0, 5));
const heading = [24, 9, 18, 9, 23]; // independently solved GP plaintext ANEND

assert.equal(unknown.length, 12956);
assert.equal(first.length, 6561);
assert.equal(remaining.length, 6395);
assert.equal(second.length, 6400);
assert.deepEqual(p56.slice(0, 5), [25, 11, 22, 15, 4]);
assert.deepEqual(p56.slice(0, 5).map((v, i) => mod(v - heading[i])),
  [1, 2, 4, 6, 10]); // totients of the first five primes
assert.deepEqual(first.slice(-6), [23, 11, 1, 17, 18, 10]);
assert.deepEqual(remaining.slice(-6), first.slice(-6));

/** @param {number} n @returns {number} */
function mod(n) { return ((n % 29) + 29) % 29; }
/** @param {number} x @returns {number} */
function inverse(x) {
  for (let i = 1; i < 29; i++) if (mod(x * i) === 1) return i;
  throw new Error("Noninvertible residue in GF(29)");
}

/**
 * @param {number} index - 80x80 source coordinate in row-major order
 * @param {number} orientation - three dihedral reflection/transposition bits
 * @returns {number[]} - 4 adjacent GP29 glyphs and the intercept 1
 */
function feature(index, orientation) {
  let x = index % 80;
  let y = Math.floor(index / 80);
  if (orientation & 1) x = 79 - x;
  if (orientation & 2) y = 79 - y;
  if (orientation & 4) [x, y] = [y, x];
  const i = y * 81 + x;
  return [first[i], first[i + 1], first[i + 81], first[i + 82], 1];
}

/**
 * Exact five-equation, five-unknown Gaussian elimination in GF29.
 * Returns null for an underdetermined original source window.
 * @param {number[][]} matrix
 * @param {number[]} rhs
 * @returns {number[]|null}
 */
function solve(matrix, rhs) {
  const rows = matrix.map((row, i) => [...row, mod(rhs[i])]);
  for (let pivot = 0; pivot < 5; pivot++) {
    const pick = rows.findIndex((row, i) => i >= pivot && row[pivot] !== 0);
    if (pick < 0) return null;
    [rows[pivot], rows[pick]] = [rows[pick], rows[pivot]];
    const scale = inverse(rows[pivot][pivot]);
    for (let col = pivot; col <= 5; col++)
      rows[pivot][col] = mod(rows[pivot][col] * scale);
    for (let i = 0; i < 5; i++) {
      if (i === pivot) continue;
      const k = rows[i][pivot];
      for (let col = pivot; col <= 5; col++)
        rows[i][col] = mod(rows[i][col] - k * rows[pivot][col]);
    }
  }
  return rows.map(row => row[5]);
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const v of values) counts[v]++;
  const n = values.length;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (n * (n - 1));
}

/** @param {number[]} coefficients @param {number} i @param {number} d */
function dot(coefficients, i, d) {
  return mod(feature(i, d).reduce((s, x, j) => s + x * coefficients[j], 0));
}

/**
 * GP transliteration, matching known solved-Cicada rune conventions.
 * @param {string} text
 * @returns {number[]}
 */
function encode(text) {
  const symbols = new Map(corpus.translit.map((v, i) => [v, i]));
  const out = [];
  for (const token of text.toUpperCase().match(/[A-Z]+/g) || []) {
    const word = token.replace(/QU/g, "CW").replace(/K/g, "C")
      .replace(/V/g, "U").replace(/Z/g, "S").replace(/Q/g, "C");
    for (let i = 0; i < word.length;) {
      let len = 3;
      while (len > 1 && !symbols.has(word.slice(i, i + len))) len--;
      const key = word.slice(i, i + len);
      assert(symbols.has(key));
      out.push(symbols.get(key));
      i += len;
    }
  }
  return out;
}

const shakespeare = encode(fs.readFileSync(path.join(
  root, "resources/control/shakespeare_first300k.txt"), "utf8"));
assert(shakespeare.length >= 100000);
const native = shakespeare.slice(20000, 20000 + 6395);
const holdout = [];
for (let i = 0; i + 6395 <= shakespeare.length; i += 6395)
  holdout.push(ioc(shakespeare.slice(i, i + 6395)));
const nativeMinimum = Math.min(...holdout);
assert(nativeMinimum > 0.045);

// Literal 2D Mobius inversion of the larger array, with no fitted key.
const mixed = [];
for (let d = 0; d < 8; d++) {
  const difference = Array.from({length: 6395}, (_, i) => {
    const f = feature(i, d);
    return mod(f[0] - f[1] - f[2] + f[3]);
  });
  for (const sign of [-1, 1]) {
    const plain = remaining.map((v, i) => mod(v + sign * difference[i]));
    mixed.push({orientation: d, sign, ioc: ioc(plain)});
  }
}
assert.equal(mixed.length, 16);

// Solve the five source-selected stencil coefficients from known p56,
// then freeze the complete 6400-cell pad and decrypt unseen 6395 runes.
// The two operations are C=P+K and C=K-P; the latter gives K=C+P.
const recovered = [];
let rankDeficient = 0;
let nativePlants = 0;
for (let d = 0; d < 8; d++) {
  const matrix = Array.from({length: 5}, (_, k) => feature(6395 + k, d));
  for (const operation of ["C=P+K", "C=K-P"]) {
    const rhs = p56.slice(0, 5).map((c, i) =>
      mod(c + (operation === "C=P+K" ? -heading[i] : heading[i])));
    const coefficients = solve(matrix, rhs);
    if (!coefficients) {
      rankDeficient++;
      continue;
    }
    const plain = remaining.map((c, i) => operation === "C=P+K"
      ? mod(c - dot(coefficients, i, d))
      : mod(dot(coefficients, i, d) - c));
    assert.deepEqual(p56.slice(0, 5).map((c, k) =>
      operation === "C=P+K"
        ? mod(c - dot(coefficients, 6395 + k, d))
        : mod(dot(coefficients, 6395 + k, d) - c)), heading);
    const top12 = Array(29).fill(0);
    for (const v of plain) top12[v]++;
    top12.sort((a, b) => b - a);
    recovered.push({
      orientation: d, operation, coefficients,
      ioc: ioc(plain), largest12: top12.slice(0, 12).reduce((s, n) => s + n, 0)
    });

    // Independently planted native GP29 prose + the authentic solved heading.
    // Original source fixes the feature geometry; secret coefficients are
    // distinct from any original-cipher fit and stay frozen across all cells.
    const secret = [17, 8, 4, 22, 11];
    const plantedPlain = native.concat(heading);
    const plantedCipher = plantedPlain.map((v, i) => operation === "C=P+K"
      ? mod(v + dot(secret, i, d))
      : mod(dot(secret, i, d) - v));
    const plantedRhs = plantedCipher.slice(-5).map((v, i) =>
      mod(v + (operation === "C=P+K" ? -heading[i] : heading[i])));
    const fitted = solve(matrix, plantedRhs);
    assert.deepEqual(fitted, secret);
    const restored = plantedCipher.map((v, i) => operation === "C=P+K"
      ? mod(v - dot(fitted, i, d))
      : mod(dot(fitted, i, d) - v));
    assert.deepEqual(restored, plantedPlain);
    nativePlants++;
  }
}
assert.equal(recovered.length, 14);
assert.equal(rankDeficient, 2);
assert.equal(nativePlants, 14);
assert(recovered.every(x => x.ioc < nativeMinimum));
assert(mixed.every(x => x.ioc < nativeMinimum));

// Independent ciphertext-only test: derive the 5 affine coefficients from
// the first five runes of the duplicated terminal phrase, then predict
// the sixth phrase rune and all five p56 ciphertext runes without refitting.
const direct = [];
for (let d = 0; d < 8; d++) {
  const prefixMatrix = Array.from({length: 5}, (_, i) => feature(6389 + i, d));
  const coefficients = solve(prefixMatrix, second.slice(6389, 6394));
  assert(coefficients !== null);
  const predicted = Array.from({length: 6}, (_, i) =>
    dot(coefficients, 6394 + i, d));
  const actual = second.slice(6394, 6400);
  const hits = predicted.filter((x, i) => x === actual[i]).length;
  direct.push({orientation: d, hits, predicted});
}
assert(direct.every(x => x.hits <= 1));

const bestCrib = recovered.slice().sort((a, b) => b.ioc - a.ioc)[0];
const bestMixed = mixed.slice().sort((a, b) => b.ioc - a.ioc)[0];
console.log(JSON.stringify({
  classification: "original-data scoped negative; zero recovered LP2 plaintext",
  original: {
    unknownRunes: 12956, sourceSquare: [81, 81],
    followingSquare: [80, 80], firstHalfRunes: 6561,
    secondHalfUnknown: 6395, solvedAddedRunes: 5,
    solvedP56Cipher: p56.slice(0, 5), solvedPlain: heading,
    primeTotientDifference: [1, 2, 4, 6, 10]
  },
  nativeReference: {
    runes: shakespeare.length, originalShapedWindows: holdout.length,
    minimumIoC: nativeMinimum, plantedGpIoC: ioc(native)
  },
  mixedMobius: {variants: 16, best: bestMixed},
  fiveKnownRuneInverse: {
    fullRankModels: recovered.length, rankDeficient, nativePlants,
    best: bestCrib, all: recovered
  },
  originalTerminalHeldout: direct,
  result: "Neither mixed 2D difference nor the p56-five-crib fitted affine stencil recovers readable GP text. An affine relation trained on five repeated-tail ciphertext runes predicts at most one of the six withheld symbols."
}, null, 2));
