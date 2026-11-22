"use strict";

/**
 * Nine source-titled LP2 bodies: exact-start additive GP29 keystream reuse gate.
 *
 * Run: node sims/lp2_ninebody_samephase_keystream_sft.cjs
 * Original GP29 convention is the corpus's zero-based 29-rune order.
 * No inferred offsets, phases, keys, alphabets, or punctuation-as-rune slots.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const lengths = [729, 1145, 1738, 1894, 1021, 1433, 91, 1589, 3316];
const expectedWords = [158, 255, 385, 435, 224, 326, 23, 355, 735];
const ciphertext = corpus.pages.slice(0, 56).flatMap(page => page.indices);
assert.equal(ciphertext.length, 12956);
assert.deepEqual(corpus.pages.slice(0, 56).map(p => p.indices.length).reduce((a, b) => a + b), 12956);
assert.equal(lengths.reduce((a, b) => a + b, 0), ciphertext.length);

const starts = [];
const units = lengths.map(length => {
  const start = starts.length === 0 ? 0 : starts[starts.length - 1] + lengths[starts.length - 1];
  starts.push(start);
  return ciphertext.slice(start, start + length);
});
assert.deepEqual(starts, [0, 729, 1874, 3612, 5506, 6527, 7960, 8051, 9640]);

/** @param {string} text @returns {number[]} Start rune offsets of printed words. */
function wordStarts(text) {
  const result = [];
  let position = 0;
  let inWord = false;
  for (const char of text.split("%").slice(0, 55).join("%")) {
    if (/[\u16A0-\u16FF]/u.test(char)) {
      if (!inWord) result.push(position);
      position++;
      inWord = true;
    } else if ("-.$&§".includes(char)) {
      inWord = false;
    }
  }
  assert.equal(position, 12956);
  return result;
}
const wordOffsets = wordStarts(read("resources/lp2-transcription.txt"));
assert.equal(wordOffsets.length, 2896);
assert.deepEqual(lengths.map((length, i) =>
  wordOffsets.filter(p => p >= starts[i] && p < starts[i] + length).length), expectedWords);

/** @param {number[]} first @param {number[]} second @param {number} shift
 * @returns {number} Aligned equal rune count at a fixed start or null shift.
 */
function equalAt(first, second, shift) {
  const n = Math.min(first.length, second.length);
  let equal = 0;
  for (let i = 0; i < n; i++)
    if (first[i] === second[(i + shift) % second.length]) equal++;
  return equal;
}

/**
 * Exact one-sided rotation rank, including the unrotated original.
 * @param {number[]} first
 * @param {number[]} second
 * @param {number[]} shifts
 * @returns {{p:number,mean:number,sd:number}}
 */
function rotationRank(first, second, shifts) {
  const observed = equalAt(first, second, 0);
  const counts = shifts.map(s => equalAt(first, second, s));
  const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
  const sd = Math.sqrt(counts.reduce((sum, v) => sum + (v - mean) ** 2, 0) / counts.length);
  return {
    p: counts.filter(v => v >= observed).length / counts.length,
    mean,
    sd
  };
}

/**
 * Reconstruct the native rune labels of a frozen set of solved LP1/LP2
 * English translations. Skip words containing Q,V,K,Z, rather than
 * inventing their GP29 spellings. This is a language control only.
 * @returns {number[]}
 */
function solvedEnglishControl() {
  const text = read("resources/liber-primus/lp1-plaintext-reference.txt");
  const parts = text.split(/^###\s+(\d+)\s*$/m);
  const chapters = new Set(["1", "3", "6", "9", "10", "11", "12", "13", "14", "15", "57"]);
  const alphabet = new Map(corpus.translit.map((letter, i) => [letter, i]));
  const digraphs = ["TH", "NG", "EO", "OE", "AE", "IA", "EA"];
  const output = [];
  for (let i = 1; i < parts.length; i += 2) {
    if (!chapters.has(parts[i])) continue;
    for (const word of (parts[i + 1].match(/[A-Z]+/g) || [])) {
      if (/[QVKZ]/.test(word)) continue;
      const indices = [];
      for (let j = 0; j < word.length;) {
        const token = digraphs.find(d => word.startsWith(d, j)) || word[j];
        assert.ok(alphabet.has(token), "unmapped control token " + token);
        indices.push(alphabet.get(token));
        j += token.length;
      }
      output.push(...indices);
    }
  }
  assert.ok(output.length > 2000);
  return output;
}
const english = solvedEnglishControl();
const frequencies = new Array(29).fill(0);
english.forEach(x => frequencies[x]++);
const eProb = frequencies.map(x => x / english.length);
const pEqual = eProb.reduce((a, x) => a + x * x, 0);
const deltaProbability = Array.from({length: 29}, (_, d) =>
  eProb.reduce((sum, p, x) => sum + p * eProb[(x - d + 29) % 29], 0));

/** @returns {number[]} Reproducible artificial restarted additive key. */
function sharedKey() {
  let state = 0x33013301;
  return Array.from({length: Math.max(...lengths)}, () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) % 29;
  });
}
const key = sharedKey();
const solvedSegments = lengths.map((n, j) =>
  Array.from({length:n}, (_, i) => english[(i + j * 337) % english.length]));
const planted = solvedSegments.map(p =>
  p.map((v, i) => (v + key[i]) % 29));
const decoded = planted.map(p =>
  p.map((v, i) => (v - key[i] + 29) % 29));
assert.deepEqual(decoded, solvedSegments);
assert.deepEqual(planted, decoded.map(p => p.map((v, i) => (v + key[i]) % 29)));

const rows = [];
let observedEqual = 0;
let plantedEqual = 0;
let totalCompared = 0;
for (let i = 0; i < units.length; i++) {
  for (let j = i + 1; j < units.length; j++) {
    const a = units[i], b = units[j];
    const length = Math.min(a.length, b.length);
    const observed = equalAt(a, b, 0);
    const shifted = rotationRank(a, b, Array.from({length:b.length}, (_, t) => t));
    const wordShifts = wordOffsets.filter(p =>
      p >= starts[j] && p < starts[j] + b.length).map(p => p - starts[j]);
    assert.equal(wordShifts[0], 0);
    const byWord = rotationRank(a, b, wordShifts);
    const histogram = new Array(29).fill(0);
    for (let k = 0; k < length; k++) histogram[(a[k] - b[k] + 29) % 29]++;
    const llrEnglishAgainstUniform = histogram.reduce(
      (sum, n, d) => sum + n * Math.log(deltaProbability[d] * 29), 0);
    const plantCount = equalAt(planted[i], planted[j], 0);
    observedEqual += observed;
    plantedEqual += plantCount;
    totalCompared += length;
    rows.push({
      unitA:i + 1, unitB:j + 1, length,
      matched:observed, rate:observed / length,
      runeShiftRankP:shifted.p, runeShiftExpected:shifted.mean,
      wordShiftRankP:byWord.p, wordShiftExpected:byWord.mean,
      englishDeltaLogLikelihoodRatio:llrEnglishAgainstUniform
    });
  }
}
assert.equal(rows.length, 36);
assert.equal(totalCompared, 33551);
assert.equal(observedEqual, 1126);
assert.equal(plantedEqual, 2150);
assert.ok(plantedEqual / totalCompared > 0.06);

const minRune = Math.min(...rows.map(p => p.runeShiftRankP));
const minWord = Math.min(...rows.map(p => p.wordShiftRankP));
console.log(JSON.stringify({
  input:"resources/liber-primus/lp2-corpus.json",
  sourceDelimiter:"workplace/lp2-section-clock-ambiguity.md",
  lengths, starts, expectedWords,
  authenticEnglishControlLength:english.length,
  authenticEnglishIndependentMatchProbability:pEqual,
  sourcePairs:rows.length, comparedPositions:totalCompared,
  sourceMatches:observedEqual,
  sourceMatchRate:observedEqual / totalCompared,
  plantedMatches:plantedEqual,
  plantedMatchRate:plantedEqual / totalCompared,
  plantedForwardInverseExact:true,
  lowestUncorrectedRuneShiftP:minRune,
  lowestUncorrectedWordShiftP:minWord,
  bonferroniRuneShiftP:Math.min(1, 36 * minRune),
  bonferroniWordShiftP:Math.min(1, 36 * minWord),
  highestRatePair:rows.slice().sort((a,b)=>b.rate-a.rate)[0],
  rows
}, null, 2));
