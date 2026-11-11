"use strict";

/**
 * All-relative-phase reuse of one additive GP29 keystream across nine titled LP2 bodies.
 *
 * SFT: node sims/lp2_ninebody_anyoffset_keystream_sft.cjs
 *
 * A reused same-value additive key K, with unknown start offset per section,
 * cancels in C_a[i]-C_b[j] at the correct relative phase i-j. The GP29
 * difference distribution must then resemble the difference of two
 * independently sampled authentic-Cicada-English GP29 symbols.
 *
 * Freeze the source sections, 500-rune overlap threshold, trained LP1
 * difference distribution, and split decision before considering the original
 * ciphertext. Search relative shifts on the FIRST half of each overlap and
 * evaluate only the remaining held-out half of that selected alignment.
 * This is a key-reuse gate, never a recovered plaintext/key.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const lengths = [729, 1145, 1738, 1894, 1021, 1433, 91, 1589, 3316];
const starts = [0, 729, 1874, 3612, 5506, 6527, 7960, 8051, 9640];
const minimumOverlap = 500;
const ciphertext = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(ciphertext.length, 12956);
assert.equal(lengths.reduce((s, n) => s + n, 0), ciphertext.length);
const original = lengths.map((n, i) => ciphertext.slice(starts[i], starts[i] + n));

/** @returns {number[]} Authentic solved-LP1 and solved-LP2 native-GP register. */
function authenticEnglish() {
  const text = read("resources/liber-primus/lp1-plaintext-reference.txt");
  const parts = text.split(/^###\s+(\d+)\s*$/m);
  const chapters = new Set(["1", "3", "6", "9", "10", "11", "12", "13", "14", "15", "57"]);
  const alphabet = new Map(corpus.translit.map((letter, i) => [letter, i]));
  const digraphs = ["TH", "NG", "EO", "OE", "AE", "IA", "EA"];
  const result = [];
  for (let part = 1; part < parts.length; part += 2) {
    if (!chapters.has(parts[part])) continue;
    for (const word of parts[part + 1].match(/[A-Z]+/g) || []) {
      if (/[QVKZ]/.test(word)) continue;
      for (let i = 0; i < word.length;) {
        const token = digraphs.find(d => word.startsWith(d, i)) || word[i];
        assert.ok(alphabet.has(token), "Unknown GP token: " + token);
        result.push(alphabet.get(token));
        i += token.length;
      }
    }
  }
  assert.equal(result.length, 2491);
  return result;
}

const english = authenticEnglish();
const p = new Array(29).fill(0);
for (const x of english) p[x]++;
for (let i = 0; i < p.length; i++) p[i] /= english.length;
const gpDifference = Array.from({ length: 29 }, (_, d) =>
  p.reduce((sum, value, i) => sum + value * p[(i - d + 29) % 29], 0));
const logWeight = gpDifference.map(probability => Math.log(29 * probability));
assert.ok(logWeight.every(Number.isFinite));

/**
 * @typedef {{a:number,b:number,shift:number,overlap:number,trainLLR:number,
 * holdoutLLR:number,heldoutZeroRate:number,expectedShift:number,
 * correctShift:boolean}} Pair
 *
 * @param {number[][]} sections
 * @param {number[]} knownOffsets
 * @returns {{pairs:Pair[], tested:number, highestRawZ:object, totalHoldoutLLR:number,
 * positiveHoldouts:number, correctShifts:number}}
 */
function scan(sections, knownOffsets) {
  const pairs = [];
  let tested = 0;
  let highestRawZ = null;

  for (let a = 0; a < sections.length; a++) {
    for (let b = a + 1; b < sections.length; b++) {
      const A = sections[a];
      const B = sections[b];
      if (Math.min(A.length, B.length) < minimumOverlap) continue;
      let best = null;

      for (let shift = -B.length + minimumOverlap; shift <= A.length - minimumOverlap; shift++) {
        const beginA = Math.max(0, shift);
        const beginB = Math.max(0, -shift);
        const n = Math.min(A.length - beginA, B.length - beginB);
        if (n < minimumOverlap) continue;
        tested++;
        const trainEnd = Math.floor(n / 2);
        let trainLLR = 0;
        let equal = 0;

        for (let i = 0; i < n; i++) {
          const delta = (A[beginA + i] - B[beginB + i] + 29) % 29;
          if (i < trainEnd) trainLLR += logWeight[delta];
          if (delta === 0) equal++;
        }
        const z = (equal - n / 29) / Math.sqrt(n * 28 / 841);
        if (highestRawZ === null || z > highestRawZ.z)
          highestRawZ = { a, b, shift, overlap: n, equal, z };

        if (best === null || trainLLR > best.trainLLR)
          best = { a, b, shift, beginA, beginB, overlap: n, trainEnd, trainLLR };
      }
      assert.ok(best);
      let holdoutLLR = 0;
      let heldoutEqual = 0;
      for (let i = best.trainEnd; i < best.overlap; i++) {
        const delta = (A[best.beginA + i] - B[best.beginB + i] + 29) % 29;
        holdoutLLR += logWeight[delta];
        if (delta === 0) heldoutEqual++;
      }
      const expectedShift = knownOffsets[b] - knownOffsets[a];
      pairs.push({
        a, b, shift: best.shift, overlap: best.overlap,
        trainLLR: best.trainLLR, holdoutLLR,
        heldoutZeroRate: heldoutEqual / (best.overlap - best.trainEnd),
        expectedShift, correctShift: best.shift === expectedShift
      });
    }
  }
  return {
    pairs, tested, highestRawZ,
    totalHoldoutLLR: pairs.reduce((s, x) => s + x.holdoutLLR, 0),
    positiveHoldouts: pairs.filter(x => x.holdoutLLR > 0).length,
    correctShifts: pairs.filter(x => x.correctShift).length
  };
}

/** Deterministic source-frequency plant, not an English-text quotation. */
let state = 0x34ab224f;
/** @returns {number} */
function random32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
const plantedOffsets = [317, 0, 13, 111, 271, 98, 177, 39, 409];
const key = Array.from({ length: 4000 }, () => random32() % 29);
const native = lengths.map(n => Array.from({ length: n }, () => english[random32() % english.length]));
const planted = native.map((plain, section) =>
  plain.map((x, i) => (x + key[i + plantedOffsets[section]]) % 29));
assert.deepEqual(planted.map((cipher, section) =>
  cipher.map((x, i) => (x - key[i + plantedOffsets[section]] + 29) % 29)), native);
assert.deepEqual(native.map((plain, section) =>
  plain.map((x, i) => (x + key[i + plantedOffsets[section]]) % 29)), planted);

const controls = scan(planted, plantedOffsets);
const observed = scan(original, new Array(lengths.length).fill(0));
assert.equal(observed.tested, 62083);
assert.equal(observed.pairs.length, 28);
assert.equal(observed.positiveHoldouts, 0);
assert.equal(controls.tested, observed.tested);
assert.equal(controls.correctShifts, 28);
assert.equal(controls.positiveHoldouts, 28);

console.log(JSON.stringify({
  provenance: {
    ciphertext: "resources/liber-primus/lp2-corpus.json",
    sections: "workplace/lp2-section-clock-ambiguity.md",
    englishControl: "resources/liber-primus/lp1-plaintext-reference.txt",
    cipherRegister: "GP29 additive; identical keystream, arbitrary relative phase",
    originalRunes: ciphertext.length,
    sectionLengths: lengths,
    sectionStarts: starts,
    minOverlap: minimumOverlap,
    nativeEnglishRunes: english.length,
    nativeMatchProbability: gpDifference[0],
    plantSeed: "0x34ab224f", plantedOffsets
  },
  observed: {
    candidates: observed.tested, pairs: observed.pairs.length,
    highestRawZ: observed.highestRawZ,
    positiveHoldouts: observed.positiveHoldouts,
    aggregateHoldoutLogLikelihoodRatio: observed.totalHoldoutLLR,
    selectedPairs: observed.pairs
  },
  planted: {
    candidates: controls.tested, pairs: controls.pairs.length,
    correctShiftRecoveries: controls.correctShifts,
    positiveHoldouts: controls.positiveHoldouts,
    aggregateHoldoutLogLikelihoodRatio: controls.totalHoldoutLLR,
    forwardInverseExact: true,
    selectedPairs: controls.pairs
  }
}, null, 2));
