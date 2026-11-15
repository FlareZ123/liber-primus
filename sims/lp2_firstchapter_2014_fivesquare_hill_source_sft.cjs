"use strict";
/**
 * A bounded original-input Hill5 inverse for the 729-rune first LP2 chapter.
 * Source: Cicada's 2014 recovered 3301 and 1033 five-by-five magic squares.
 * The prepended F follows a *participant's* February 2015 hypothesis;
 * it is not an authenticated Cicada cipher instruction.
 *
 * Run: node sims/lp2_firstchapter_2014_fivesquare_hill_source_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const source = fs.readFileSync(path.join(ROOT,
  "resources/cicada2014-openpuff-magic-squares.txt"), "utf8");
const sourceSquares = source.trim().split(/\r?\n\s*\r?\n/u).map((section) =>
  section.trim().split(/\r?\n/u).map((line) =>
    line.trim().split(/\s+/u).map(Number)));
assert.deepEqual(sourceSquares.map((s) => s.length), [5, 7, 5]);
const keys = [sourceSquares[0], sourceSquares[2]];
assert.deepEqual(keys.map((K) => K[0]), [
  [434, 1311, 312, 278, 966],
  [272, 138, 341, 131, 151]
]);
const mod = (n) => (n % 29 + 29) % 29;

/** @param {number[][]} matrix */
function invert(matrix) {
  const n = matrix.length;
  const a = matrix.map((row, i) =>
    row.map(mod).concat(Array.from({length: n}, (_, j) => +(i === j))));
  for (let j = 0; j < n; j++) {
    const p = a.findIndex((row, i) => i >= j && row[j] !== 0);
    assert.ok(p >= 0, "Original square must be invertible over GF29");
    [a[j], a[p]] = [a[p], a[j]];
    const inversePivot = Array.from({length: 28}, (_, k) => k + 1)
      .find((v) => mod(v * a[j][j]) === 1);
    assert.ok(inversePivot !== undefined);
    a[j] = a[j].map((v) => mod(v * inversePivot));
    for (let i = 0; i < n; i++) {
      if (i === j) continue;
      const factor = a[i][j];
      a[i] = a[i].map((v, k) => mod(v - factor * a[j][k]));
    }
  }
  return a.map((row) => row.slice(n));
}

/** @param {number[][]} matrix */
function transpose(matrix) {
  return matrix[0].map((_, j) => matrix.map((row) => row[j]));
}

/** @param {number[][]} matrix @param {number[]} input */
function transform(matrix, input) {
  assert.equal(input.length % 5, 0);
  const result = [];
  for (let at = 0; at < input.length; at += 5) {
    const block = input.slice(at, at + 5);
    for (const row of matrix) result.push(mod(row.reduce(
      (sum, value, i) => sum + value * block[i], 0)));
  }
  return result;
}

/** @param {number[]} values */
function ioc(values) {
  const hist = new Array(29).fill(0);
  for (const value of values) hist[value]++;
  return hist.reduce((sum, count) => sum + count * (count - 1), 0)
    / (values.length * (values.length - 1));
}

function run() {
  const firstChapter = corpus.pages.slice(0, 3)
    .flatMap((page) => page.indices);
  const p57 = corpus.pages.find((page) => page.page === 57).indices;
  assert.equal(firstChapter.length, 729);
  assert.equal(p57.length, 95);
  const inputs = [
    {name: "participant-fictitious-initial-F", indices: [0, ...firstChapter],
      drop: 1},
    {name: "complete-first-725-only", indices: firstChapter.slice(0, 725),
      drop: 0}
  ];
  const outcomes = [];
  for (let ki = 0; ki < keys.length; ki++) {
    const K = keys[ki].map((row) => row.map(mod));
    const I = invert(K);
    assert.deepEqual(transform(K, transform(I, [1, 2, 3, 4, 5])),
      [1, 2, 3, 4, 5]);
    for (const rowVector of [false, true]) {
      const key = rowVector ? transpose(K) : K;
      const invKey = rowVector ? transpose(I) : I;
      for (const direction of ["inverse", "forward"]) {
        const decode = direction === "inverse" ? invKey : key;
        const encode = direction === "inverse" ? key : invKey;
        for (const fixture of inputs) {
          const decoded = transform(decode, fixture.indices);
          const reciphered = transform(encode, decoded);
          assert.deepEqual(reciphered, fixture.indices);
          const planted = Array.from({length: fixture.indices.length},
            (_, i) => p57[i % p57.length]);
          assert.deepEqual(transform(decode, transform(encode, planted)),
            planted, "Native GP29 plant must recover without plaintext tuning");
          const visible = decoded.slice(fixture.drop);
          outcomes.push({
            square: ki === 0 ? "2014-first5-3301" : "2014-third5-1033",
            vectorConvention: rowVector ? "row" : "column",
            direction, originalInput: fixture.name,
            transmitted: fixture.indices.length,
            actualDecoded: visible.length, ioc: ioc(visible),
            first40: visible.slice(0, 40),
            exactCipherReencryption: true, exactNativePlant: true
          });
        }
      }
    }
  }
  outcomes.sort((a, b) => b.ioc - a.ioc);
  const report = {
    input: "unchanged original physical LP2 pages 0..2",
    exactOriginalRunes: firstChapter.length,
    originalIoc: ioc(firstChapter),
    source: "2014 authenticated 5x5 3301 and 1033 magic squares",
    register: "modulo-29 5-vector Hill, no user-fitted matrix, phase or rune",
    fullyCoveredCases: outcomes.filter((o) => o.actualDecoded === 729).length,
    examinedCases: outcomes.length,
    best: outcomes[0],
    nativeClearP57Ioc: ioc(p57),
    all: outcomes,
    conclusion: "No full original-case output resembles native GP29 plaintext."
  };
  assert.equal(report.fullyCoveredCases, 8);
  assert.equal(report.examinedCases, 16);
  assert.ok(report.best.ioc < 0.04);
  return report;
}
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {invert, transpose, transform, ioc, run};
