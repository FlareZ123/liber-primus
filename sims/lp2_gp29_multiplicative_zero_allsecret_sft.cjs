"use strict";

/**
 * Key-independent obstruction to any GP29 nonzero multiplicative pad,
 * including an unknown stationary output alphabet permutation.
 * Reproduce: node sims/lp2_gp29_multiplicative_zero_allsecret_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const {encode} = require("./affine_echo_literary_control.cjs");

const ROOT = path.resolve(__dirname, "..");
const CORPUS = JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const ORIGINAL_WORDS = parseSharedCorpus().words;
const RUNE_INDEX = new Map(CORPUS.runes.map((r, i) => [r, i]));
const ORIGINAL = ORIGINAL_WORDS.flatMap(w => [...w.runes].map(r => RUNE_INDEX.get(r)));
assert.equal(ORIGINAL_WORDS.length, 2896);
assert.equal(ORIGINAL.length, 12956);
const HIST = Array(29).fill(0);
ORIGINAL.forEach(v => HIST[v]++);
const MIN_SYMBOL = Math.min(...HIST);
assert.equal(MIN_SYMBOL, 399);
assert.equal(HIST[0], 458);
assert.equal(Math.max(...HIST), 492);
const LENGTHS = ORIGINAL_WORDS.map(w => w.length);
const SOURCES = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt", 241.73188162389553, 15.47977991573952],
  ["Gibran", "resources/control/gibran_prophet_58585.txt", 293.29056369329925, 16.626358163646934],
  ["Emerson", "resources/control/emerson_essays_2944.txt", 296.5878735865449, 16.949621175827577]
];
const TRIALS = 3000;
let seed = 0x3301f729;
/** @returns {number} Uniform pseudorandom fraction for reproducible control draws. */
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 4294967296;
}
/** @param {number} a */
const mod = a => (a % 29 + 29) % 29;
/** @param {number} a */
function inverse(a) {
  for (let i = 1; i < 29; i++) if (mod(a * i) === 1) return i;
  throw Error("Expected nonzero field unit");
}

const RESULTS = [];
for (const [name, file, expected, expectedSd] of SOURCES) {
  const raw = fs.readFileSync(path.join(ROOT, file), "utf8");
  const words = (raw.match(/[A-Za-z]+/g) || []).map(encode);
  const byLength = Array.from({length: 15}, () => []);
  for (const word of words) if (word.length < 15) byLength[word.length].push(word);
  let mean = 0;
  let variance = 0;
  for (const length of LENGTHS) {
    const pool = byLength[length];
    assert(pool.length > 0, "Missing length-matched source words");
    const counts = pool.map(w => w.filter(x => x === 0).length);
    const e = counts.reduce((a, b) => a + b, 0) / counts.length;
    const sq = counts.reduce((a, b) => a + b * b, 0) / counts.length;
    mean += e;
    variance += sq - e * e;
  }
  const sd = Math.sqrt(variance);
  assert(Math.abs(mean - expected) < 1e-7);
  assert(Math.abs(sd - expectedSd) < 1e-7);
  // A freely unknown output alphabet may choose ANY one of the 29 glyphs
  // as sigma(0); every one occurs >=399 times in the actual ciphertext.
  let exceed = 0, maximum = 0, sum = 0;
  for (let trial = 0; trial < TRIALS; trial++) {
    let fCount = 0;
    for (const length of LENGTHS) {
      const pool = byLength[length];
      const plain = pool[Math.floor(random() * pool.length)];
      for (const p of plain) if (p === 0) fCount++;
    }
    if (fCount >= MIN_SYMBOL) exceed++;
    maximum = Math.max(maximum, fCount);
    sum += fCount;
  }
  assert.equal(exceed, 0, "Unexpected GP-English null reaches minimum original cipher glyph");
  const plant = LENGTHS.flatMap(length => {
    const pool = byLength[length];
    return pool[Math.floor(random() * pool.length)];
  });
  assert.equal(plant.length, ORIGINAL.length);
  const encrypted = [];
  const restored = [];
  const specialCipher = mod(11 * 0 + 7);
  for (const p of plant) {
    const k = 1 + Math.floor(random() * 28);
    const c = mod(11 * mod(p * k) + 7);
    encrypted.push(c);
    restored.push(mod(mod((c - 7) * inverse(11)) * inverse(k)));
    assert.equal(c === specialCipher, p === 0);
  }
  assert.deepEqual(restored, plant);
  const plantedZeros = plant.filter(x => x === 0).length;
  assert.equal(encrypted.filter(x => x === specialCipher).length, plantedZeros);
  RESULTS.push({
    source: name, file, referenceWords: words.length,
    layoutMatchedExpectedF: mean, layoutMatchedSd: sd,
    leastExceptionalCipherGlyphCount: MIN_SYMBOL,
    allSecretOutputAlphabetMinimumZ: (MIN_SYMBOL - mean) / sd,
    originalLiteralFCount: HIST[0],
    monteCarlo: {trials: TRIALS, simulatedMeanF: sum / TRIALS,
      maximumF: maximum, countAtOrAbove399: exceed, plusOneUpperTail: (exceed + 1) / (TRIALS + 1)},
    originalLengthPlant: {runes: plant.length, recovered: restored.length,
      exactOutputZeroMarker: true, outputMarker: specialCipher, Fcount: plantedZeros}
  });
}
console.log(JSON.stringify({
  source: "original 12,956 LP2 ciphertext runes and 2,896 exact whole-word lengths",
  zeroInvariant: "C=sigma(P*K mod29), K in 1..28, sigma arbitrary fixed bijection: C=sigma(0) iff P=F",
  sourceGlyphRange: {minimum: MIN_SYMBOL, maximum: Math.max(...HIST), literalF: HIST[0]},
  sourceControls: RESULTS,
  result: "Every original cipher glyph occurs more often than GP-English F in all 3 length-matched controls; an unknown 29-symbol output permutation cannot rescue a nonzero multiplicative GP29 pad. No plaintext or authentic cipher key recovered."
}, null, 2));
