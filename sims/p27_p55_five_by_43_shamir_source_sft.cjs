"use strict";
/**
 * Source-constrained p27/p55 5x43 Shamir hypothesis.
 * All computations are read-only, exact GP29 arithmetic.
 * Execute from repository root: node sims/p27_p55_five_by_43_shamir_source_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const source = name => JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", name), "utf8"));
const corpus = source("lp2-corpus.json");
const ink = source("lp2-ink-annotations.json");
const unsolved = corpus.pages.filter(p => p.page <= 55);
const p27 = corpus.pages.find(p => p.page === 27);
const p55 = corpus.pages.find(p => p.page === 55);
const page27Ink = ink.pages.find(p => p.page === 27);

const MOD = 29;
/** @param {number} n @returns {number} */
const residue = n => ((n % MOD) + MOD) % MOD;
/** @param {number} a @returns {number} */
function inverse(a) {
  for (let n = 1; n < MOD; n++) if (residue(a * n) === 1) return n;
  throw Error("no F29 inverse of " + a);
}
/** @param {number[]} ys Values at x=[2,3,5] @param {number} x */
function interpolate(ys, x) {
  const xs = [2, 3, 5];
  let result = 0;
  for (let i = 0; i < xs.length; i++) {
    let term = ys[i];
    for (let j = 0; j < xs.length; j++) {
      if (i !== j) term = residue(term * (x - xs[j]) * inverse(residue(xs[i] - xs[j])));
    }
    result = residue(result + term);
  }
  return result;
}
function ioc(a) {
  const counts = Array(MOD).fill(0);
  for (const n of a) counts[n]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (a.length * (a.length - 1));
}
function translit(a) { return a.map(i => corpus.translit[i]).join(""); }

function main() {
  assert.equal(corpus.pages.length, 58);
  assert.equal(unsolved.reduce((sum, p) => sum + p.indices.length, 0), 12956);
  assert.equal(p27.indices.length, 234);
  assert.deepEqual(page27Ink.red_spans.map(p => [p.start, p.length]), [[0, 19]]);
  const body = p27.indices.slice(19);
  assert.equal(body.length, 215);
  assert.equal(body.length, 5 * 43);
  assert.equal(p55.indices.length, 76);
  const divisible = unsolved.filter(p => {
    const marked = ink.pages.find(x => x.page === p.page);
    const red = (marked.red_spans || []).reduce((sum, span) => sum + span.length, 0);
    return p.indices.length > red && (p.indices.length - red) % 43 === 0;
  }).map(p => p.page);
  assert.deepEqual(divisible, [27], "p27 should be the only nonempty 43-multiple black body");

  const book = unsolved.flatMap(p => p.indices);
  const p27Global = unsolved.filter(p => p.page < 27).reduce((n, p) => n + p.indices.length, 0) + 28;
  const p55Global = book.length - 6;
  const motif = p55.indices.slice(70);
  assert.deepEqual(p27.indices.slice(28, 34), motif);
  const duplicates = [];
  const seen = new Map();
  for (let i = 0; i + 6 <= book.length; i++) {
    const key = book.slice(i, i + 6).join(",");
    if (seen.has(key)) duplicates.push([seen.get(key), i]);
    else seen.set(key, i);
  }
  assert.deepEqual(duplicates, [[p27Global, p55Global]]);

  // Word-delimiter and index claims are directly checkable in the fixed source.
  const transcript = fs.readFileSync(path.join(ROOT, "resources", "liber-primus", "lp2-transcription.txt"), "utf8");
  const twoWords = "ᛞᛄᚢ-ᛒᛖᛁ";
  assert.equal(transcript.split(twoWords).length - 1, 2);

  // Original p55 has one carry-over segment and sixteen local complete words.
  // Source-correct printed segment lengths, frozen before any inverse.
  const segments = [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
  const interior = [];
  let offset = 0;
  for (const length of segments) {
    for (let j = 1; j < length - 1; j++) interior.push(offset + j);
    offset += length;
  }
  assert.equal(offset, 76);
  assert.equal(interior.length, 43);
  const target = interior.map(i => p55.indices[i]);

  // Hypothesis: five black-body rows provide 5 F29 polynomial shares per column.
  // The original p55 left dots 01101 specify share positions 2,3,5.
  const nodes = [2, 3, 5];
  const tests = [];
  for (const layout of ["rows-of-43", "five-tuples"]) {
    for (const encoding of ["ordinal", "GP-prime-mod29"]) {
      const convert = n => encoding === "ordinal" ? n : corpus.prime[n] % MOD;
      const sample = (row, col) => convert(body[
        layout === "rows-of-43" ? row * 43 + col : col * 5 + row
      ]);
      const columnDiagnostics = [];
      const secrets = [];
      for (let col = 0; col < 43; col++) {
        const observed = nodes.map(node => sample(node - 1, col));
        const missingActual = [1, 4].map(node => sample(node - 1, col));
        const missingPredicted = [1, 4].map(node => interpolate(observed, node));
        columnDiagnostics.push(missingActual.filter((n, i) => n === missingPredicted[i]).length);
        secrets.push(interpolate(observed, 0));
      }
      assert.equal(columnDiagnostics.filter(n => n === 2).length, 0,
        "a full matching F29 quadratic share column unexpectedly appeared");
      const decodes = [-1, 1].map(sign => {
        const output = target.map((n, i) => residue(n + sign * secrets[i]));
        return {sign, indexOfCoincidence: ioc(output), transliteration: translit(output)};
      });
      tests.push({
        layout, encoding, completeShareColumns: columnDiagnostics.filter(n => n === 2).length,
        oneOfTwoMissingSharesCorrect: columnDiagnostics.filter(n => n === 1).length,
        neitherMissingShareCorrect: columnDiagnostics.filter(n => n === 0).length,
        directAdditiveDecode: decodes
      });
    }
  }

  let syntheticColumns = 0;
  for (let j = 0; j < 43; j++) {
    const y = x => residue((j % 29) + residue(3 * j + 1) * x + residue(7 * j + 2) * x * x);
    const samples = nodes.map(y);
    if ([1, 4].every(x => interpolate(samples, x) === y(x))) syntheticColumns++;
  }
  assert.equal(syntheticColumns, 43, "planted 3-of-5 positive control failed");
  const result = {
    source: {
      p27RedTitle: 19, p27BlackBody: 215, p27Matrix: [5, 43],
      otherNonzero43MultipleBlackPages: [],
      p55CompleteWordInterior: 43, p55LeftDotMask: "01101", nodes,
      repeatedPair: twoWords, motifIndices: motif, at: [{page: 27, rune: 28}, {page: 55, rune: 70}],
      pageDisplacement: 28, totalSixRuneRepeats: duplicates.length
    },
    positiveControlF29Columns: syntheticColumns,
    tests,
    interpretation: "Five-share polynomial mechanism fails every original column. Neither selected 43-symbol additive inverse yields legible plaintext; no LP2 solution."
  };
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
}
if (require.main === module) main();
module.exports = {main, interpolate};
