"use strict";

/**
 * Single runnable grammar-only LP2 experiment, Node.js 22, CommonJS.
 *
 * Compares original printed word boundaries with source-native English,
 * Latin, Old English and chapter-shuffled controls. Rune identities are
 * never scored or inferred. Original page/line wrapping is ignored as a
 * word delimiter, as in the canonical LP2 corpus parser.
 *
 * Run: node sims/lp2_wordlength_grammar_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus, physicalLP2Page} = require("./lp2_word_pages.cjs");

const root = path.resolve(__dirname, "..");
/** @param {string} relative */
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const GP_PAIRS = new Set(["TH", "NG", "EO", "OE", "AE", "IA", "EA"]);

/** @param {string} word */
function gpLength(word) {
  const text = word.toUpperCase().replace(/K/g, "C")
    .replace(/Q/g, "CW").replace(/V/g, "U").replace(/Z/g, "S");
  let length = 0;
  for (let i = 0; i < text.length; i++, length++) {
    if (text.slice(i, i + 3) === "ING") {
      i += 2;
    } else if (GP_PAIRS.has(text.slice(i, i + 2))) {
      i++;
    }
  }
  return length;
}

/** @param {string} source */
function prose(source) {
  const lens = [];
  const stops = [];
  for (const token of source.match(/[A-Za-z]+|[.!?]/g) || []) {
    if (/^[A-Za-z]/.test(token)) {
      lens.push(gpLength(token));
      stops.push(false);
    } else if (stops.length) {
      stops[stops.length - 1] = true;
    }
  }
  return {lens, stops};
}

/** Original '%' and '/' are visual wrapping, not word stops. */
function originalStops(source) {
  const stops = [];
  let active = false;
  for (const char of source.split("%").slice(0, 55).join("%")) {
    if (/[\u16A0-\u16FF]/u.test(char)) {
      active = true;
    } else if (char === "%" || char === "/" || /\s/u.test(char)) {
      // Preserve the physical word across page/line wraps.
    } else if (active) {
      stops.push(".?!".includes(char));
      active = false;
    } else if (".?!".includes(char) && stops.length) {
      stops[stops.length - 1] = true;
    }
  }
  if (active) stops.push(false);
  return stops;
}

/** @param {number[]} values @param {number} first @param {number} n */
function excessShortPairs(values, first = 0, n = values.length) {
  let nShort = 0;
  let nPairs = 0;
  for (let i = first; i < first + n; i++) {
    if (values[i] <= 3) nShort++;
    if (i > first && values[i] <= 3 && values[i - 1] <= 3) nPairs++;
  }
  const rate = nShort / n;
  return nPairs / (n - 1) - rate * rate;
}

/** @param {number[]} values @param {boolean[]} stops */
function punctuationStats(values, stops) {
  let startShort = 0;
  let endShort = 0;
  let nStarts = 0;
  let nStops = 0;
  for (let i = 0; i < stops.length; i++) {
    if (!stops[i]) continue;
    nStops++;
    if (values[i] <= 3) endShort++;
    if (i + 1 < values.length) {
      nStarts++;
      if (values[i + 1] <= 3) startShort++;
    }
  }
  return {stops: nStops, pShortBefore: endShort / nStops,
    pShortAfter: startShort / nStarts};
}

/** Deterministic xorshift32. */
let seed = 0x2f138d29;
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 4294967296;
}

/** @param {number[]} values @param {number} fraction */
function percentile(values, fraction) {
  const sorted = values.slice().sort((a, b) => a - b);
  return sorted[Math.round((sorted.length - 1) * fraction)];
}

function chapter(physicalPage) {
  if (physicalPage <= 2) return 0;
  if (physicalPage <= 7) return 1;
  if (physicalPage <= 14) return 2;
  if (physicalPage <= 22) return 3;
  if (physicalPage <= 26) return 4;
  if (physicalPage <= 32) return 5;
  if (physicalPage <= 39) return 6;
  if (physicalPage <= 53) return 7;
  return 8;
}

/**
 * Source-native Markov length model, 10 bins, Laplace smoothing.
 * Log P(nextLength|priorLength)/P(nextLength) removes the source's
 * marginal-length baseline, making the score a serial-grammar test.
 * @param {number[][]} samples
 */
function transitionModel(samples) {
  const table = Array.from({length: 10}, () => Array(10).fill(0.5));
  const rows = Array(10).fill(5);
  const cols = Array(10).fill(5);
  let total = 50;
  for (const sample of samples) {
    for (let i = 1; i < sample.length; i++) {
      const a = Math.min(sample[i - 1], 10) - 1;
      const b = Math.min(sample[i], 10) - 1;
      table[a][b]++;
      rows[a]++;
      cols[b]++;
      total++;
    }
  }
  return table.map((row, i) => row.map((count, j) =>
    Math.log((count / rows[i]) / (cols[j] / total))));
}

/** @param {number[]} source @param {number[][]} model */
function transitionScore(source, model) {
  let score = 0;
  for (let i = 1; i < source.length; i++) {
    score += model[Math.min(source[i - 1], 10) - 1]
      [Math.min(source[i], 10) - 1];
  }
  return score / (source.length - 1);
}

const original = parseSharedCorpus();
const originalLens = original.words.map(word => word.length);
const originalPunc = originalStops(read("resources/lp2-transcription.txt"));
assert.equal(original.words.length, 2896);
assert.equal(original.runeCount, 12956);
assert.equal(original.crossPageWords, 32);
assert.equal(originalPunc.length, 2896);
assert.equal(originalPunc.filter(Boolean).length, 175);

const native = {
  gibran: prose(read("resources/control/gibran_prophet_58585.txt")),
  emerson: prose(read("resources/control/emerson_essays_2944.txt")),
  shakespeare: prose(read("resources/control/shakespeare_first300k.txt")),
  latin: {lens: read("resources/control/latin-vulgate-gp-wholewords.txt")
    .split(/\r?\n/).filter(line => /^[0-9A-S]+$/.test(line))
    .map(line => line.length), stops: []},
  beowulf: {lens: JSON.parse(
    read("resources/control/beowulf_oe_gp_profile_corrected.json"))
    .allSourceGpWordLengths, stops: []}
};
assert.deepEqual(Object.fromEntries(Object.entries(native)
  .map(([name, value]) => [name, value.lens.length])),
{gibran: 15733, emerson: 77932, shakespeare: 55407,
  latin: 39835, beowulf: 10885});

const cutoff = original.words.filter(word =>
  physicalLP2Page(word.startPage) <= 39).length;
assert.equal(cutoff, 2161);
const groups = [
  {name: "pp0-39", start: 0, n: cutoff},
  {name: "pp40-55", start: cutoff, n: originalLens.length - cutoff},
  {name: "whole", start: 0, n: originalLens.length}
];
const originalGroups = groups.map(group => ({
  name: group.name, words: group.n,
  shortPairExcess: excessShortPairs(originalLens, group.start, group.n)
}));
const originalPunctuation = punctuationStats(originalLens, originalPunc);

const sourceControls = [];
for (const group of groups) {
  const originalExcess = excessShortPairs(originalLens, group.start, group.n);
  for (const [name, data] of Object.entries(native)) {
    const values = [];
    for (let k = 0; k < 900; k++) {
      const first = Math.floor(random() *
        (data.lens.length - group.n + 1));
      values.push(excessShortPairs(data.lens, first, group.n));
    }
    sourceControls.push({group: group.name, name,
      p01: percentile(values, 0.01), median: percentile(values, 0.5),
      p99: percentile(values, 0.99),
      rankAtLeastOriginal: values.filter(v => v >= originalExcess).length,
      samples: values.length});
  }
}
// Document the source exception. Old English Beowulf is positively
// correlated in the short-word feature, unlike the three English texts.
assert(sourceControls.filter(result => result.group === "whole" &&
  result.name !== "beowulf").every(result =>
    result.rankAtLeastOriginal === 0));
assert.equal(sourceControls.find(result => result.group === "whole" &&
  result.name === "beowulf").rankAtLeastOriginal, 900);

// Preserve the nine distinct manuscript chapters when destroying only
// native adjacency, without touching word-length marginals.
const bounds = [0];
let lastChapter = chapter(physicalLP2Page(original.words[0].startPage));
for (let i = 1; i < original.words.length; i++) {
  const id = chapter(physicalLP2Page(original.words[i].startPage));
  if (id !== lastChapter) {
    bounds.push(i);
    lastChapter = id;
  }
}
bounds.push(original.words.length);
assert.equal(bounds.length - 1, 9);
const shuffled = [];
for (let repeat = 0; repeat < 1500; repeat++) {
  const values = originalLens.slice();
  for (let section = 1; section < bounds.length; section++) {
    const begin = bounds[section - 1];
    for (let i = bounds[section] - 1; i > begin; i--) {
      const j = begin + Math.floor(random() * (i - begin + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }
  }
  shuffled.push(groups.map(group =>
    excessShortPairs(values, group.start, group.n)));
}
const shuffledControls = groups.map((group, k) => {
  const values = shuffled.map(v => v[k]);
  const originalExcess = originalGroups[k].shortPairExcess;
  return {group: group.name, median: percentile(values, 0.5),
    p01: percentile(values, 0.01), p99: percentile(values, 0.99),
    rankAtLeastOriginal: values.filter(v => v >= originalExcess).length,
    samples: values.length};
});

const englishModel = transitionModel([
  native.gibran.lens.slice(0, Math.floor(native.gibran.lens.length * 0.7)),
  native.emerson.lens.slice(0, Math.floor(native.emerson.lens.length * 0.7))
]);
const nativeEnglishPositive = {
  gibran: transitionScore(native.gibran.lens.slice(11013), englishModel),
  emerson: transitionScore(native.emerson.lens.slice(54552), englishModel),
  shakespeare: transitionScore(native.shakespeare.lens.slice(10000, 16000),
    englishModel)
};
const originalEnglishScore = transitionScore(originalLens, englishModel);
let grammarNull = [];
for (let repeat = 0; repeat < 2000; repeat++) {
  const sample = originalLens.slice();
  for (let i = sample.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [sample[i], sample[j]] = [sample[j], sample[i]];
  }
  grammarNull.push(transitionScore(sample, englishModel));
}
const englishGrammarComparison = {
  original: originalEnglishScore,
  shuffledMedian: percentile(grammarNull, .5),
  shuffledP01: percentile(grammarNull, .01),
  shuffledP99: percentile(grammarNull, .99),
  rankAtMostOriginal: grammarNull.filter(v =>
    v <= originalEnglishScore).length,
  nullSamples: grammarNull.length,
  heldout: nativeEnglishPositive
};
assert(nativeEnglishPositive.emerson > originalEnglishScore);
assert(nativeEnglishPositive.gibran > originalEnglishScore);

console.log(JSON.stringify({
  purpose: "Original printed-word grammar, not LP2 decryption",
  source: "2,896 complete printed words, 12,956 original runes",
  originalGroups, originalPunctuation, sourceControls,
  nineChapterShuffledControls: shuffledControls,
  englishGrammarComparison,
  decision: "Mismatch to sampled modern English and Latin controls; " +
    "Old English controls demonstrate nonuniversal sign, and the full " +
    "native transition model cannot distinguish original from " +
    "chapter-matched shuffle. No authenticated boundary codec or plaintext."
}, null, 2));
