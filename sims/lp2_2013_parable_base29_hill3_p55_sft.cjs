"use strict";

/**
 * Single-file original-input test: 2013 PARABLE factor digits as a GP29 Hill3 key.
 * Run from the repository root with: node sims/lp2_2013_parable_base29_hill3_p55_sft.cjs
 * Reads the canonical unchanged ciphertext and clear p57 control; no fitted key or clock.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const source = fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-transcription.txt"), "utf8");
const MOD = 29;

/** @param {number} n @returns {number} */
function mod(n) { return ((n % MOD) + MOD) % MOD; }

/** @param {number} n @returns {number[]} */
function digits29(n) {
  assert(Number.isSafeInteger(n) && n > 0);
  const result = [];
  while (n > 0) {
    result.unshift(n % MOD);
    n = Math.floor(n / MOD);
  }
  return result;
}

/** @param {number[][]} A @param {number[][]} B @returns {number[][]} */
function matrixProduct(A, B) {
  return A.map(row => B[0].map((_, j) =>
    mod(row.reduce((s, v, i) => s + v * B[i][j], 0))));
}

/**
 * Apply a matrix to complete 3-rune vectors.
 * @param {number[]} src
 * @param {number[][]} key
 * @param {"column"|"row"} convention
 * @returns {number[]}
 */
function transform(src, key, convention) {
  assert.equal(src.length % 3, 0);
  const out = [];
  for (let k = 0; k < src.length; k += 3) {
    const v = src.slice(k, k + 3);
    if (convention === "column") {
      out.push(...key.map(row => mod(row.reduce((s, a, i) => s + a * v[i], 0))));
    } else {
      out.push(...[0, 1, 2].map(j => mod(v.reduce((s, a, i) => s + a * key[i][j], 0))));
    }
  }
  return out;
}

/** @param {number[]} a @returns {number} */
function normalizedIoc(a) {
  const freq = Array(MOD).fill(0);
  for (const v of a) {
    assert(Number.isInteger(v) && v >= 0 && v < MOD);
    freq[v]++;
  }
  return MOD * freq.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
}

const factors = [1259, 1031, 1229]; // 2013 TXXX label, recovered from three clear 2014 p57 clauses
assert.equal(factors.reduce((a, b) => a * b, 1), 1595277641);
const K = factors.map(digits29);
assert.deepEqual(K, [[1, 14, 12], [1, 6, 16], [1, 13, 11]]);
const determinant = K[0][0] * (K[1][1] * K[2][2] - K[1][2] * K[2][1])
  - K[0][1] * (K[1][0] * K[2][2] - K[1][2] * K[2][0])
  + K[0][2] * (K[1][0] * K[2][1] - K[1][1] * K[2][0]);
assert.equal(mod(determinant), 12);
const inverse = [[22, 5, 3], [27, 12, 19], [3, 17, 9]];
const identity = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
assert.deepEqual(matrixProduct(K, inverse), identity);
assert.deepEqual(matrixProduct(inverse, K), identity);

const p55 = corpus.pages.find(p => p.page === 55);
const p57 = corpus.pages.find(p => p.page === 57);
assert(p55 && p57);
assert.equal(p55.indices.length, 76);
const core = p55.indices.slice(1);
assert.equal(core.length, 75);
assert.equal(p57.indices.length, 95);
const positiveClear = p57.indices.slice(0, 75);
const digitSums = K.map(row => row.reduce((a, b) => a + b, 0));
assert.deepEqual(digitSums, [27, 23, 25]);
assert.equal(digitSums.reduce((a, b) => a + b, 0), core.length);

const glyphIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const pages = source.split("%");
const sourceMatch = pages.filter(part => {
  const indices = Array.from(part).filter(ch => glyphIndex.has(ch)).map(ch => glyphIndex.get(ch));
  return indices.length === 76 && indices.every((v, i) => v === p55.indices[i]);
});
assert.equal(sourceMatch.length, 1);
let runeOffset = 0;
const wordEnds = [];
for (const ch of sourceMatch[0]) {
  if (glyphIndex.has(ch)) runeOffset++;
  if (ch === "-") wordEnds.push(runeOffset - 1);
}
assert(!wordEnds.includes(27) && !wordEnds.includes(50));

// Fixed direct-reader rival: source BASE29 product/factors as contiguous GP rune digits.
const literalNeedles = [digits29(1595277641), ...K, K.flat()];
const unknownPages = corpus.pages.filter(p => p.page <= 55 && p.indices.length > 0);
assert.equal(unknownPages.length, 55);
const literalHits = literalNeedles.map(needle => {
  const hits = [];
  for (const pg of unknownPages) {
    for (let start = 0; start + needle.length <= pg.indices.length; start++) {
      if (needle.every((v, j) => pg.indices[start + j] === v)) {
        hits.push({page: pg.page, offset: start});
      }
    }
  }
  return {needle, hits};
});
assert.deepEqual(literalNeedles.map(needle => needle.length), [7, 3, 3, 3, 9]);
assert(literalHits.every(x => x.hits.length === 0));

const checks = [];
for (const convention of ["column", "row"]) {
  const decoded = transform(core, inverse, convention);
  assert.deepEqual(transform(decoded, K, convention), core, "original forward re-encryption");
  const plant = transform(positiveClear, K, convention);
  assert.deepEqual(transform(plant, inverse, convention), positiveClear, "independent known-clear positive control");
  const check = {
    orientation: convention,
    ciphertextRuneCount: core.length,
    exactOriginalReencryption: true,
    positiveP57PlantReconstruction: "75/75",
    normalizedIoc: normalizedIoc(decoded),
    rawGPTransliteration: decoded.map(i => corpus.translit[i]).join("")
  };
  checks.push(check);
  console.log(JSON.stringify(check));
}
assert(Math.abs(checks[0].normalizedIoc - 0.8673873873873874) < 1e-12);
assert(Math.abs(checks[1].normalizedIoc - 0.8778378378378379) < 1e-12);
console.log(JSON.stringify({
  status: "PASS",
  hypotheses: "source-ordered three-prime BASE29 digits as literal GP29 Hill3 key",
  clauseFactors: factors,
  key: K,
  determinantMod29: mod(determinant),
  inverse,
  sourceP55RuneCount: 76,
  carriedOpeningRune: corpus.translit[p55.indices[0]],
  completeCoreRuneCount: 75,
  sumOfPrimeFactorBase29Digits: 75,
  factorDigitRowSums: digitSums,
  sourcePhysicalCoreWordBoundaryCuts: wordEnds,
  directBase29DigitSubstringHits: literalHits,
  predicted27and50AreWordEnds: false,
  rawOriginalCoreIoc: normalizedIoc(core),
  authenticUnknownPlaintextRecovered: false
}, null, 2));
