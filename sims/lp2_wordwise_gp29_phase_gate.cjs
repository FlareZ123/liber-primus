"use strict";
/**
 * Direct GP29 period-local permutation exclusion on all original LP2 words.
 *
 * Assumption: for each printed word w, ciphertext at position j obeys
 * C[w,j] = S[w,j % period](P[w,j]), where each S is an entirely arbitrary
 * unknown 29-way bijection (different per word and per period phase).
 *
 * Same-phase ciphertext equality must equal plaintext equality, without
 * knowing any of the factorially many S-boxes.
 *
 * Exact-length, four-author GP-English controls and full positive plants.
 * Manual-only CI target: node sims/lp2_wordwise_gp29_phase_gate.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} file */
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const MAX_PERIOD = 8;
const sourcePaths = [
  ["LP1 solved", "resources/liber-primus/lp1-plaintext-reference.txt"],
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
];
/** @param {string} raw */
function canonicalWords(raw) {
  const stream = raw.split("%").slice(0, 55).join("%");
  const words = [];
  let word = [];
  function finish() {
    if (word.length) words.push(word);
    word = [];
  }
  for (const ch of stream) {
    if (/[\u16A0-\u16FF]/u.test(ch)) {
      const id = corpus.runes.indexOf(ch);
      assert.ok(id >= 0);
      word.push(id);
    } else if (ch !== "%" && ch !== "/" && !/\s/u.test(ch)) {
      finish();
    }
  }
  finish();
  return words;
}
const TOKENS = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} text */
function referenceWords(text) {
  return (text.toUpperCase().match(/[A-Z]+/g) || []).map(word => {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S");
    const runes = [];
    for (let i = 0; i < word.length;) {
      const token = TOKENS.find(x => word.startsWith(x.s, i));
      assert.ok(token, "Missing native GP rune for " + word.slice(i));
      runes.push(token.i);
      i += token.s.length;
    }
    return runes;
  });
}
/**
 * For periods 1..8, sum identical-rune unordered pairs constrained to
 * positions (i,j) with (j-i) divisible by the period. Each value is
 * invariant under arbitrary word+phase-local S29 substitutions.
 * @param {number[]} word
 * @returns {number[]}
 */
function phasePairs(word) {
  const counts = Array(MAX_PERIOD).fill(0);
  for (let i = 0; i < word.length; i++) {
    for (let j = i + 1; j < word.length; j++) {
      if (word[i] !== word[j]) continue;
      const delta = j - i;
      for (let m = 1; m <= MAX_PERIOD; m++)
        if (delta % m === 0) counts[m - 1]++;
    }
  }
  return counts;
}
/** @param {number} seed */
function random(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}
/** @param {() => number} rng */
function permutation(rng) {
  const p = Array.from({length: 29}, (_, i) => i);
  for (let i = 28; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  return p;
}
/** @param {number[][]} words */
function totalPairs(words) {
  const counts = Array(MAX_PERIOD).fill(0);
  for (const word of words) {
    const f = phasePairs(word);
    for (let i = 0; i < MAX_PERIOD; i++) counts[i] += f[i];
  }
  return counts;
}
const original = canonicalWords(read("resources/lp2-transcription.txt"));
assert.equal(original.length, 2896);
assert.equal(original.reduce((sum, word) => sum + word.length, 0), 12956);
const observed = totalPairs(original);
assert.deepEqual(observed, [811, 427, 218, 141, 106, 32, 30, 10]);

const hist = new Map();
for (const word of original)
  hist.set(word.length, (hist.get(word.length) || 0) + 1);
const summaries = [];
const REPLICATES = 2000;
for (let sourceIndex = 0; sourceIndex < sourcePaths.length; sourceIndex++) {
  const [label, filename] = sourcePaths[sourceIndex];
  const native = referenceWords(read(filename));
  const poolByLen = new Map();
  for (const word of native) {
    const group = poolByLen.get(word.length) || [];
    group.push({word, features: phasePairs(word)});
    poolByLen.set(word.length, group);
  }
  for (const length of hist.keys())
    assert.ok(poolByLen.has(length), label + " missing length " + length);

  const mean = Array(MAX_PERIOD).fill(0);
  const variance = Array(MAX_PERIOD).fill(0);
  for (const [length, count] of hist) {
    const entries = poolByLen.get(length);
    for (let period = 0; period < MAX_PERIOD; period++) {
      const avg = entries.reduce((s, e) => s + e.features[period], 0) /
        entries.length;
      const varPerWord = entries.reduce((s, e) =>
        s + (e.features[period] - avg) ** 2, 0) / entries.length;
      mean[period] += count * avg;
      variance[period] += count * varPerWord;
    }
  }
  const sd = variance.map(Math.sqrt);
  const z = observed.map((n, i) => (n - mean[i]) / sd[i]);
  const bestZ = Math.max(...z);
  const bestPeriod = z.indexOf(bestZ) + 1;

  // Whole-family selection correction: every simulated manuscript chooses
  // its own most favorable phase period across all eight models.
  const rng = random(0x1429a00b + sourceIndex * 0x10001);
  let asLowAsOriginal = 0;
  let minScan = Infinity;
  for (let k = 0; k < REPLICATES; k++) {
    const scores = Array(MAX_PERIOD).fill(0);
    for (const printedWord of original) {
      const pool = poolByLen.get(printedWord.length);
      const feature = pool[Math.floor(rng() * pool.length)].features;
      for (let m = 0; m < MAX_PERIOD; m++) scores[m] += feature[m];
    }
    const best = Math.max(...scores.map((n, i) => (n - mean[i]) / sd[i]));
    if (best <= bestZ) asLowAsOriginal++;
    minScan = Math.min(minScan, best);
  }

  const plantRng = random(0x1429b00b + sourceIndex * 0x10001);
  let plantRoundtrip = 0;
  const plantPhasePairs = Array(MAX_PERIOD).fill(null);
  for (let m = 1; m <= MAX_PERIOD; m++) {
    const plantCipherWords = [];
    const plantPlainWords = [];
    for (const printedWord of original) {
      const pool = poolByLen.get(printedWord.length);
      const plain = pool[Math.floor(plantRng() * pool.length)].word;
      const keys = Array.from({length: m}, () => permutation(plantRng));
      const inverse = keys.map(p => {
        const inv = Array(29);
        for (let i = 0; i < 29; i++) inv[p[i]] = i;
        return inv;
      });
      const cipher = plain.map((r, i) => keys[i % m][r]);
      const decoded = cipher.map((r, i) => inverse[i % m][r]);
      assert.deepEqual(decoded, plain);
      const actual = phasePairs(cipher)[m - 1];
      const expected = phasePairs(plain)[m - 1];
      assert.equal(actual, expected, "Phase-local equality was not preserved");
      plantCipherWords.push(cipher);
      plantPlainWords.push(plain);
      plantRoundtrip += decoded.length;
    }
    plantPhasePairs[m - 1] = {
      ciphertext: totalPairs(plantCipherWords)[m - 1],
      plaintext: totalPairs(plantPlainWords)[m - 1]
    };
    assert.equal(plantPhasePairs[m - 1].ciphertext,
      plantPhasePairs[m - 1].plaintext);
  }
  assert.equal(plantRoundtrip, 12956 * MAX_PERIOD);
  summaries.push({
    reference: label,
    lengthMatchedReferenceWords: native.length,
    expected: mean.map(x => +x.toFixed(5)),
    sd: sd.map(x => +x.toFixed(5)),
    z: z.map(x => +x.toFixed(5)),
    bestPeriod,
    bestZ: +bestZ.toFixed(5),
    nullScansAtLeastAsLow: asLowAsOriginal,
    nullScans: REPLICATES,
    nullBestMinimum: +minScan.toFixed(5),
    plantedFullLengthInverseRoughRNG: true,
    positiveRuns: MAX_PERIOD,
    plantRecoveredRunes: plantRoundtrip,
    positivePhasePairEquality: plantPhasePairs.every(x =>
      x.ciphertext === x.plaintext)
  });
}
console.log(JSON.stringify({
  model: "per-word independent arbitrary GP29 bijection at each phase",
  periods: Array.from({length: MAX_PERIOD}, (_, i) => i + 1),
  originalWordCount: original.length,
  originalRuneCount: 12956,
  originalSamePhaseEqualPairs: observed,
  summary: summaries,
  conclusion: "source-conditional negative; no original plaintext recovered"
}, null, 2));
