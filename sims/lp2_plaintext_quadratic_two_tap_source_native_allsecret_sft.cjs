"use strict";
/**
 * Reproducible all-secret original-cipher test of two-tap PLAINTEXT
 * quadratic finite-field feedback. Unlike the existing two-tap
 * ciphertext-feedback quadratic sweep, this tests the causal
 * plaintext-autokey family on intact 13- and 14-GP words.
 * Node.js 22 CommonJS; Windows-compatible; no third-party imports.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const transcription = fs.readFileSync(path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8");
const { sourceNativeLongwords } = require("./lp2_source_native_longword_lexicon.cjs");
const lexicon = sourceNativeLongwords();
const gpRune = new Map(corpus.runes.map((glyph, index) => [glyph, index]));

/** @param {number} x */
const m29 = x => ((x % 29) + 29) % 29;
/** @param {number} x */
function inv29(x) {
  assert.notEqual(m29(x), 0);
  for (let y = 1; y < 29; y++) if (m29(x * y) === 1) return y;
  throw Error("GF29 nonzero element without inverse");
}
/**
 * Parse actual punctuation. The original bare transcription excludes the
 * rune-free p50; 55 initial '%' groups correspond to unknown physical
 * p0..p49,p51..p55. '%' and physical slash are NOT word separators.
 * @returns {{p:number, n:number, c:number[], globalRuneOffset:number}[]}
 */
function words() {
  const chunks = transcription.split("%").slice(0, 55);
  const out = [];
  let current = [], pos = 0, start = 0, physical = 0;
  function flush() {
    if (current.length) {
      out.push({ p: physical, n: current.length, c: current, globalRuneOffset: start });
      current = [];
    }
  }
  for (let g = 0; g < chunks.length; g++) {
    physical = g < 50 ? g : g + 1;
    for (const glyph of chunks[g]) {
      const index = gpRune.get(glyph);
      if (index !== undefined) {
        if (current.length === 0) start = pos;
        current.push(index); pos++;
      } else if (glyph === "-" || glyph === ".") flush();
    }
  }
  flush();
  assert.equal(pos, 12956, "The canonical 55 rune-bearing pages must contain 12956 runes");
  assert.equal(out.length, 2896, "Printed punctuation must yield 2896 intact words");
  return out;
}
const entire = words();
const targets = entire.filter(w => w.n === 13 || w.n === 14);
assert.equal(targets.filter(w => w.n === 14).length, 3);
assert.equal(targets.filter(w => w.n === 13).length, 4);
assert.equal(lexicon.get(14).length, 175);
assert.equal(lexicon.get(13).length, 426);

/**
 * Exact GF29 linear consistency for 12 or 11 equations in four completely
 * unknown per-word coefficients a,b,c,d, including rank-deficient cases.
 * C[i] = P[i] + a P[i-1] + b P[i-2] + c q(P[i-1],P[i-2]) + d.
 * @param {number[]} P
 * @param {number[]} C
 * @param {"xy"|"xx"|"yy"} quadratic
 * @returns {null|number[]}
 */
function solve(P, C, quadratic) {
  const mat = [];
  for (let i = 2; i < P.length; i++) {
    const x = P[i - 1], y = P[i - 2];
    const q = quadratic === "xy" ? x * y : quadratic === "xx" ? x * x : y * y;
    mat.push([x, y, m29(q), 1, m29(C[i] - P[i])]);
  }
  const pivots = [];
  let row = 0;
  for (let col = 0; col < 4 && row < mat.length; col++) {
    let pivot = row;
    while (pivot < mat.length && mat[pivot][col] === 0) pivot++;
    if (pivot === mat.length) continue;
    [mat[row], mat[pivot]] = [mat[pivot], mat[row]];
    const inverse = inv29(mat[row][col]);
    for (let k = col; k <= 4; k++) mat[row][k] = m29(mat[row][k] * inverse);
    for (let j = 0; j < mat.length; j++) {
      if (j === row) continue;
      const factor = mat[j][col];
      if (!factor) continue;
      for (let k = col; k <= 4; k++) mat[j][k] = m29(mat[j][k] - factor * mat[row][k]);
    }
    pivots.push(col);
    row++;
  }
  for (let j = row; j < mat.length; j++) {
    if (mat[j].slice(0, 4).every(v => v === 0) && mat[j][4] !== 0) return null;
  }
  const coeffs = [0, 0, 0, 0];
  for (let i = 0; i < pivots.length; i++) coeffs[pivots[i]] = mat[i][4];
  return coeffs;
}
/** @param {number[]} P @param {number[]} co @param {"xy"|"xx"|"yy"} q */
function encrypt(P, co, q) {
  const C = P.slice();
  C[0] = 13; C[1] = 23;  // independently chosen arbitrary word-local IV
  for (let i = 2; i < P.length; i++) {
    const x = P[i - 1], y = P[i - 2];
    const z = q === "xy" ? x * y : q === "xx" ? x * x : y * y;
    C[i] = m29(P[i] + co[0] * x + co[1] * y + co[2] * z + co[3]);
  }
  return C;
}
console.log("Original intact long words:", targets.map(w => "p" + w.p + "@" + w.globalRuneOffset + ":" + w.n).join(" "));
for (const q of ["xy", "xx", "yy"]) {
  const stats = [];
  for (const length of [13, 14]) {
    let attempts = 0, matched = 0, planted = 0;
    for (const w of targets.filter(x => x.n === length)) {
      let nMatches = 0;
      for (const item of lexicon.get(length)) {
        attempts++;
        if (solve(item.indices, w.c, q) !== null) nMatches++;
      }
      matched += nMatches;
      stats.push({ page: w.p, globalOffset: w.globalRuneOffset, len: length, matches: nMatches });
    }
    // Real-source native-English synthetic positives, fixed keys independent
    // of the original manuscript. Test every candidate with a recoverable
    // two-tap quadratic word-local encryption.
    for (const item of lexicon.get(length).slice(0, 30)) {
      const co = [4, 11, 16, 7];
      const C = encrypt(item.indices, co, q);
      const recovered = solve(item.indices, C, q);
      assert.ok(recovered !== null, "Source-native positive failed");
      assert.deepEqual(encrypt(item.indices, recovered, q).slice(2), C.slice(2));
      planted++;
    }
    console.log(q + " GP" + length + ": " + JSON.stringify({
      sourceCandidateCount: lexicon.get(length).length,
      originalWordCount: targets.filter(x => x.n === length).length,
      originalComparisons: attempts,
      matches: matched,
      exactSourcePlants: planted
    }));
  }
  console.log(q + " individual original words:", JSON.stringify(stats));
}
console.log("PASS. Exactly tested two-tap quadratic PLAINTEXT feedback with all hidden per-word a,b,c,d. No authentic plaintext claimed.");
