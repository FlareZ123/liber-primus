"use strict";

/**
 * P8 original 49 black words as receiver for the source-historical 7x7
 * magic-square matrix, word GP prime/index sum -> GF29 Hill7 by rows.
 * Eight fixed models with exact positive inverses. No unknown plaintext.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = rel => fs.readFileSync(path.join(ROOT, rel), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const lines = read("resources/liber-primus/lp2-transcription.txt").split("%");
const source = read("resources/cicada2014-openpuff-magic-squares.txt");
const matrices = source.trim().split(/\r?\n[ \t]*\r?\n/).filter(Boolean)
  .map(block => block.split(/\r?\n/).map(line => line.trim().split(/\s+/).map(Number)));
assert.deepEqual(matrices.map(m => m.length), [5, 7, 5]);
const matrix = matrices[1].map(row => row.map(v => (v % 29 + 29) % 29));
assert.equal(matrix.length, 7);
assert.ok(matrix.every(row => row.length === 7));
assert.ok(matrices[1].every(row => row.reduce((a, b) => a + b, 0) === 1033));

const index = new Map(gp.runes.map((rune, i) => [rune, i]));
const printed = lines[8].replace(/[\/\r\n&]/g, "")
  .split(/[-.\s§0-9$]+/g)
  .filter(word => [...word].some(glyph => index.has(glyph)));
const words = printed.map(word => [...word].map(glyph => index.get(glyph)));
assert.deepEqual(words.flat(), gp.pages.find(page => page.page === 8).indices);
assert.deepEqual(words.slice(0, 2).map(w => w.length), [4, 8]);
const black = words.slice(2);
assert.equal(black.length, 49);
assert.equal(black.reduce((sum, word) => sum + word.length, 0), 243);
const originalPrimeSum = black.map(w =>
  w.reduce((sum, rune) => sum + gp.prime[rune], 0));
const originalIndexSum = black.map(w =>
  w.reduce((sum, rune) => sum + rune, 0));
const mod = n => (n % 29 + 29) % 29;
const inv = x => {
  for (let j = 1; j < 29; j++) if (mod(j * x) === 1) return j;
  throw Error("not invertible modulo29");
};

function invert(a) {
  const n = a.length;
  const m = a.map((row, i) => row.concat(
    Array.from({length: n}, (_, j) => +(i === j))));
  for (let i = 0; i < n; i++) {
    let pivot = i;
    while (pivot < n && !m[pivot][i]) pivot++;
    if (pivot >= n) throw Error("singular");
    [m[i], m[pivot]] = [m[pivot], m[i]];
    m[i] = m[i].map(x => mod(x * inv(m[i][i])));
    for (let j = 0; j < n; j++) if (j !== i) {
      const coeff = m[j][i];
      m[j] = m[j].map((x, k) => mod(x - coeff * m[i][k]));
    }
  }
  return m.map(row => row.slice(n));
}

const inverse = invert(matrix);
for (let j = 0; j < 7; j++) for (let k = 0; k < 7; k++) {
  const dot = matrix[j].reduce((sum, v, i) => sum + v * inverse[i][k], 0);
  assert.equal(mod(dot), +(j === k));
}

function apply(source, key, asRow) {
  assert.equal(source.length, 49);
  const result = [];
  for (let group = 0; group < 7; group++) {
    const input = source.slice(group * 7, group * 7 + 7);
    for (let col = 0; col < 7; col++) {
      result.push(mod(input.reduce((sum, v, j) =>
        sum + v * (asRow ? key[j][col] : key[col][j]), 0)));
    }
  }
  return result;
}
function ioc(values) {
  const freq = Array(29).fill(0);
  values.forEach(v => freq[v]++);
  return freq.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
const tests = [];
for (const [aggregate, original] of [
  ["historical_prime_sum", originalPrimeSum.map(mod)],
  ["GP_index_sum", originalIndexSum.map(mod)]
]) for (const direction of ["decrypt", "encrypt"])
  for (const orientation of ["row", "column"]) {
    const key = direction === "decrypt" ? inverse : matrix;
    const result = apply(original, key, orientation === "row");
    const reciphered = apply(result,
      direction === "decrypt" ? matrix : inverse, orientation === "row");
    assert.deepEqual(reciphered, original);
    const planted = Array.from({length: 49}, (_, i) => i % 29);
    assert.deepEqual(
      apply(apply(planted, key, orientation === "row"),
        direction === "decrypt" ? matrix : inverse, orientation === "row"),
      planted, "full source-native GP29 symbol plant"
    );
    tests.push({
      aggregate, direction, orientation,
      recoveredIoc: Number(ioc(result).toFixed(9)),
      gpRender: result.map(x => gp.translit[x]).join(" ")
    });
  }
assert.equal(tests.length, 8);
assert.ok(tests.every(x => x.recoveredIoc < 0.045));
console.log(JSON.stringify({
  source: "Original LP2 p8 49 complete black words and historical 2014 7x7 numeric square",
  wordCount: black.length, runeCount: black.flat().length,
  primeSumRowTotals: Array.from({length: 7}, (_, i) =>
    originalPrimeSum.slice(i * 7, i * 7 + 7).reduce((sum, v) => sum + v, 0)),
  magicSum: 1033,
  tests: tests,
  positiveControls: 8,
  result: "Eight complete 7x7 GF29 row/column transforms of original p8 word sums do not reveal GP29 language, though all inverse and planted GP29 controls pass. No authored selector or decoded p8 plaintext."
}, null, 2));
