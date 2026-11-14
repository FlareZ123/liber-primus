"use strict";

/**
 * Bounded length-transform gate for the 2016 "A BEGINNING" conjecture:
 * write source-calibrated GP29 English and insert exactly one extra rune
 * after each doubled GP29 plaintext rune, preserving printed word order.
 *
 * No assumed insertion symbol or actual ciphertext key is needed: the
 * resulting word lengths are determined before choosing either.
 *
 * SFT: node sims/lp2_doubled_plaintext_escape_wordgrammar_sft.cjs
 * Node.js 20+ CommonJS, read-only original inputs.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const originalText = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%");
const runeSet = new Set(corpus.runes);
const original = [];
let localPage = 0;
let startPage = 0;
let length = 0;
let countedRunes = 0;
function finish() {
  if (!length) return;
  original.push({length, page: startPage});
  length = 0;
}
for (const glyph of originalText) {
  if (runeSet.has(glyph)) {
    if (!length) startPage = localPage;
    length++;
    countedRunes++;
  } else if (glyph === "%") localPage++;
  else if ("-.$&§0123456789".includes(glyph)) finish();
}
finish();
assert.equal(original.length, 2896);
assert.equal(countedRunes, 12956);
assert.equal(localPage, 54);
const physical = p => p >= 50 ? p + 1 : p;
const bounds = [0, 3, 8, 15, 23, 27, 33, 40, 54, 56];
const sections = original.map(word => bounds.findIndex((v, i) =>
  i + 1 < bounds.length && physical(word.page) >= v &&
  physical(word.page) < bounds[i + 1]));
assert.equal(new Set(sections).size, 9);
const N = original.length;
const labelMap = [
  {s: "ING", i: 21}, {s: "IO", i: 27},
  ...corpus.translit.map((s, i) => ({s, i}))
].sort((a, b) => b.s.length - a.s.length);

/**
 * Source-LP1-attested orthography: ING and IO are single GP symbols,
 * QU -> CW, V -> U, K/Q -> C, Z -> S.
 * @param {string} word
 * @returns {number[]}
 */
function encode(word) {
  const upper = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const result = [];
  for (let i = 0; i < upper.length;) {
    const t = labelMap.find(x => upper.startsWith(x.s, i));
    assert(t, "Cannot encode GP source word " + word);
    result.push(t.i);
    i += t.s.length;
  }
  return result;
}
/** @param {number[]} source @returns {number} */
function insertedLength(source) {
  return source.length + source.reduce((n, symbol, i) =>
    n + (i > 0 && symbol === source[i - 1] ? 1 : 0), 0);
}
const beginning = encode("BEGINNING");
assert.deepEqual(beginning, [17, 18, 6, 10, 9, 9, 21]);
assert.equal(beginning.length, 7);
assert.equal(insertedLength(beginning), 8);
const p54 = corpus.pages.find(p => p.page === 54);
assert(p54);
assert.deepEqual(p54.indices.slice(0, 9),
  [24, 19, 21, 23, 27, 2, 14, 10, 19]);

/** @param {number[]} lengths @returns {number} */
function adjacencyMI(lengths) {
  const table = Array.from({length: 10}, () => Array(10).fill(0));
  let pairs = 0;
  for (let i = 1; i < lengths.length; i++) {
    if (sections[i] !== sections[i - 1]) continue;
    table[Math.min(lengths[i - 1], 9)][Math.min(lengths[i], 9)]++;
    pairs++;
  }
  const row = table.map(r => r.reduce((a, b) => a + b, 0));
  const col = table[0].map((_, j) =>
    table.reduce((n, r) => n + r[j], 0));
  let mi = 0;
  for (let a = 0; a < 10; a++) {
    for (let b = 0; b < 10; b++) {
      const n = table[a][b];
      if (n) mi += n / pairs * Math.log(n * pairs / (row[a] * col[b]));
    }
  }
  return mi;
}

/**
 * Fixed-seed xorshift Fisher-Yates, separately in each source chapter.
 * @param {number[]} originalLengths
 * @param {number} seed
 * @returns {number[]}
 */
function shuffled(originalLengths, seed) {
  const copy = originalLengths.slice();
  let state = seed >>> 0;
  for (let start = 0; start < copy.length;) {
    let end = start + 1;
    while (end < copy.length && sections[end] === sections[start]) end++;
    for (let i = end - 1; i > start; i--) {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      const j = start + Math.floor((state >>> 0) / 4294967296 *
        (i - start + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    start = end;
  }
  return copy;
}

/**
 * Observed MI compared with the length-marginal-preserving source-chapter
 * permutation control, without estimating an unknowable cipher key.
 * @param {number[]} lengths
 * @param {number} seed
 * @param {number} trials
 * @returns {{mi:number, nullMean:number, z:number, pUpper:number}}
 */
function measure(lengths, seed, trials = 160) {
  assert.equal(lengths.length, N);
  const mi = adjacencyMI(lengths);
  let mean = 0, moment2 = 0, tail = 0;
  for (let i = 1; i <= trials; i++) {
    const value = adjacencyMI(shuffled(lengths,
      (seed ^ Math.imul(i, 0x9e3779b9)) >>> 0));
    mean += value;
    moment2 += value * value;
    if (value >= mi) tail++;
  }
  mean /= trials;
  const sd = Math.sqrt(Math.max(0, moment2 / trials - mean * mean));
  assert(sd > 0);
  return {
    mi: Number(mi.toFixed(8)),
    nullMean: Number(mean.toFixed(8)),
    z: Number(((mi - mean) / sd).toFixed(4)),
    pUpper: Number(((tail + 1) / (trials + 1)).toFixed(6))
  };
}
const originalMeasure = measure(original.map(w => w.length),
  0x4a120033, 360);
assert(Math.abs(originalMeasure.mi - 0.01215610097) < 1e-8);
const sourceFiles = [
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
];
const summaries = [];
for (let corpusId = 0; corpusId < sourceFiles.length; corpusId++) {
  const [name, file] = sourceFiles[corpusId];
  const texts = read(file).match(/[A-Za-z]+/g) || [];
  const candidates = texts.map(encode);
  const windows = [];
  for (let start = 0; start + N <= candidates.length &&
       windows.length < 5; start += N) {
    const block = candidates.slice(start, start + N);
    const plainLengths = block.map(word => word.length);
    const withEscapes = block.map(insertedLength);
    const ordinary = measure(plainLengths,
      0x4a200000 ^ (corpusId << 12) ^ start);
    const escaped = measure(withEscapes,
      0x4a300000 ^ (corpusId << 12) ^ start);
    assert(escaped.z > 3, "Source-ordered language grammar did not survive: " + name);
    windows.push({
      wordStart: start,
      naturalMI: ordinary.mi,
      naturalZ: ordinary.z,
      insertedMI: escaped.mi,
      insertedZ: escaped.z,
      addedRuneWords: withEscapes.filter((n, i) =>
        n > plainLengths[i]).length,
      insertedExtraRunes: withEscapes.reduce((n, l, i) =>
        n + l - plainLengths[i], 0)
    });
  }
  assert.equal(windows.length, 5);
  summaries.push({name, windows});
}
console.log(JSON.stringify({
  classification: "source-conditioned length-insertion negative; no plaintext or key",
  candidateTitle: "A BEGINNING",
  nativeTitleRuneLengths: [1, beginning.length],
  oneDuplicateEscapeTitleRuneLengths: [1, insertedLength(beginning)],
  source: {runes: countedRunes, words: N, chapters: 9},
  original: originalMeasure,
  controls: summaries
}, null, 2));
