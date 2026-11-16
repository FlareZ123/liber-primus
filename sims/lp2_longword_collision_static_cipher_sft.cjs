"use strict";

/**
 * Original LP2 exact long-word collision test.
 *
 * Tests any fixed, word-local, deterministic encryption E: W -> E(W)
 * that preserves printed word boundaries and runic word length.
 * A repeated plaintext word must yield the same ciphertext word
 * independent of the secret key or algorithm. This gives a keyless
 * necessary condition, with native-GP English length-matched controls.
 *
 * Run from the repository root:
 *   node sims/lp2_longword_collision_static_cipher_sft.cjs
 *
 * @typedef {{page:number,indices:number[]}} Page
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcript = read("resources/lp2-transcription.txt");
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));

/**
 * The canonical transcription omits the runeless physical p50, so its
 * first 55 '%' fields cover the 55 rune-bearing unknown LP2 pages.
 * '/','%' and literal line wraps are transparent to complete words;
 * hyphens and sentence/chapter punctuation are genuine word gaps.
 * @returns {number[][]}
 */
function originalWords() {
  const text = transcript.split("%").slice(0, 55).join("");
  const words = text.split(/[-.:&$]/)
    .map((chunk) => Array.from(chunk).filter((ch) => runeIndex.has(ch))
      .map((ch) => runeIndex.get(ch)))
    .filter((word) => word.length > 0);
  /** @type {Page[]} */
  const sourcePages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length);
  assert.equal(sourcePages.length, 55);
  assert.equal(words.length, 2896);
  const observed = words.flat();
  assert.equal(observed.length, 12956);
  assert.deepEqual(observed, sourcePages.flatMap((p) => p.indices));
  return words;
}
const words = originalWords();
const wordLengths = words.map((w) => w.length);
const sourceCounts = Array(15).fill(0);
for (const n of wordLengths) {
  assert.ok(n >= 1 && n <= 14);
  sourceCounts[n]++;
}
assert.deepEqual(sourceCounts, [
  0, 83, 448, 720, 513, 317, 256, 216, 156, 78,
  52, 32, 18, 4, 3
]);

/** @param {number[][]} nativeWords */
function collisionPairs(nativeWords) {
  const frequencies = new Map();
  let pairs = 0;
  for (const word of nativeWords) {
    if (word.length < 4) continue;
    const key = word.join(",");
    const count = frequencies.get(key) || 0;
    pairs += count;
    frequencies.set(key, count + 1);
  }
  return {pairs, distinct:frequencies.size};
}
const actual = collisionPairs(words);
assert.deepEqual(actual, {pairs: 0, distinct: 1645});

const orderedTokens = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} input */
function nativeGPWordBins(input) {
  const buckets = Array.from({length: 15}, () => []);
  const normalized = input.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    const out = [];
    for (let i = 0; i < word.length;) {
      const t = orderedTokens.find((x) => word.startsWith(x.s, i));
      assert.ok(t, "Unknown GP transliteration in control word");
      out.push(t.i);
      i += t.s.length;
    }
    if (buckets[out.length]) buckets[out.length].push(out);
  }
  return buckets;
}

/** Deterministic xorshift32, using unsigned results. */
let seed = 0x3301c011;
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 0x100000000;
}
/** @param {number[][][]} bins */
function sampleOne(bins) {
  const out = [];
  for (let len = 4; len <= 14; len++) {
    assert.ok(bins[len].length > 0);
    for (let i = 0; i < sourceCounts[len]; i++) {
      out.push(bins[len][Math.floor(random() * bins[len].length)]);
    }
  }
  return collisionPairs(out).pairs;
}
const referenceFiles = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
];

const results = [];
for (const [name, filename] of referenceFiles) {
  const bins = nativeGPWordBins(read(filename));
  for (let n = 1; n <= 14; n++) assert.ok(bins[n].length > 0);
  const samples = Array.from({length: 2000}, () => sampleOne(bins));
  const min = Math.min(...samples);
  const max = Math.max(...samples);
  const mean = samples.reduce((sum, v) => sum + v, 0) / samples.length;
  assert.ok(min > actual.pairs);
  results.push({name, min, max, mean, zeroTrials: samples.filter((n) => n === 0).length});

  if (name === "Shakespeare") {
    // A planted reversible deterministic GP29 Caesar word cipher retains
    // every exact repeated native control word, regardless of its key.
    const counters = Array(15).fill(0);
    const nativePlant = wordLengths.map((len) =>
      bins[len][(counters[len]++) % bins[len].length]);
    const enc = nativePlant.map((w) => w.map((v) => (v + 17) % 29));
    const dec = enc.map((w) => w.map((v) => (v - 17 + 29) % 29));
    assert.deepEqual(dec, nativePlant);
    const before = collisionPairs(nativePlant);
    const after = collisionPairs(enc);
    assert.ok(before.pairs > 2000);
    assert.deepEqual(after, before);
    console.log("Positive: deterministic reversible word cipher retains " +
      before.pairs + " whole-word collision pairs.");
  }
}

// Original visual chapter boundaries all lie between complete source words.
// A different fixed secret dictionary in each of nine chapters remains
// unable to conceal repeated words within that chapter.
const chapterEnds = [729, 1874, 3603, 5506, 6527, 7960, 9640, 12648, 12956];
const chapters = Array.from({length: 9}, () => []);
let chapter = 0;
let runeOffset = 0;
for (const word of words) {
  if (runeOffset === chapterEnds[chapter]) chapter++;
  assert.ok(chapter < chapters.length);
  chapters[chapter].push(word);
  runeOffset += word.length;
}
assert.equal(runeOffset, 12956);
assert.deepEqual(chapters.map((w) => w.length), [
  158, 255, 383, 437, 224, 326, 378, 669, 66
]);
assert.deepEqual(chapters.map((w) => collisionPairs(w).pairs), Array(9).fill(0));
const chapterResults = [];
seed = 0x3301c012;
for (const [name, filename] of referenceFiles) {
  const bins = nativeGPWordBins(read(filename));
  const values = [];
  for (let run = 0; run < 1000; run++) {
    let total = 0;
    for (const section of chapters) {
      const repeated = new Map();
      for (const word of section) {
        if (word.length < 4) continue;
        const candidate = bins[word.length][
          Math.floor(random() * bins[word.length].length)].join(",");
        const previous = repeated.get(candidate) || 0;
        total += previous;
        repeated.set(candidate, previous + 1);
      }
    }
    values.push(total);
  }
  chapterResults.push({
    name,
    min: Math.min(...values),
    max: Math.max(...values),
    mean: values.reduce((a, b) => a + b, 0) / values.length,
    zeroTrials: values.filter((v) => v === 0).length
  });
  assert.ok(chapterResults.at(-1).min > 0);
}

// In an iid GP29 model with no equal adjacent runes inside a word,
// there are 29*28^(length-1) equally likely words of each length.
// Count only same-length pairs; this is a descriptive null expectation.
let nullExpected = 0;
for (let len = 4; len <= 14; len++) {
  const n = sourceCounts[len];
  nullExpected += n * (n - 1) / 2 / (29 * 28 ** (len - 1));
}
assert.ok(Math.abs(nullExpected - 0.209170315133572) < 1e-12);
console.log(JSON.stringify({
  original: {runes: 12956, words: 2896, longWords: 1645, exactPairs: actual.pairs},
  wordLengthCounts: sourceCounts,
  uniformNoDoubletExpectedPairs: nullExpected,
  lengthMatchedNativeGP: results,
  withinNineVisibleChapters: chapterResults
}, null, 2));
console.log("PASS: static occurrence-independent whole-word encodings are " +
  "incompatible with ordinary GP-native repeated-word prose on the unchanged " +
  "source; no plaintext or original encryption key was recovered.");
