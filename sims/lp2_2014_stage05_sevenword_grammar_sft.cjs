"use strict";
/**
 * One-file, source-first GP29 word-packet test of the exact historical 2014
 * Stage05 seven-position inverse. Requires Node.js 22 and the pinned repo.
 *
 * The source's authentic seven-slot operator applies to characters. Applying
 * it to complete LP2 words here is an explicit, separate hypothesis.
 * No plaintext or key is fitted to these outputs.
 *
 * @returns {void}
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} name @returns {string} */
function read(name) {
  return fs.readFileSync(path.join(root, name), "utf8");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runes = new Set(corpus.runes);
const source = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%");
const words = [];
let page = 0;
let startPage = 0;
let len = 0;
let runeCount = 0;
/** @param {string} c @returns {void} */
function finish(c = "") {
  if (!len) return;
  words.push({len, page: startPage, punct: c === "."});
  len = 0;
}
for (const c of source) {
  if (runes.has(c)) {
    if (!len) startPage = page;
    len++;
    runeCount++;
  } else if (c === "%") {
    page++;
  } else if ("-.$&§0123456789".includes(c)) {
    finish(c);
  }
}
finish();
assert.equal(page, 54);
assert.equal(runeCount, 12956);
assert.equal(words.length, 2896);
assert.equal(words.filter((w) => w.punct).length, 175);

const bounds = [0, 3, 8, 15, 23, 27, 33, 40, 54, 56];
/** @param {number} p @returns {number} */
const physical = (p) => p >= 50 ? p + 1 : p;
const chapters = words.map((w) =>
  bounds.findIndex((v, i) => i < 9 &&
    physical(w.page) >= v && physical(w.page) < bounds[i + 1]));
assert.equal(new Set(chapters).size, 9);
const sizeByChapter = Array.from({length: 9}, (_, i) =>
  chapters.filter((x) => x === i).length);
assert.deepEqual(sizeByChapter, [158, 255, 383, 437, 224, 326, 378, 669, 66]);

// The actual Stage05 source operator is [0,6,2,5,1,4,3] on
// each seven-character input block (2014-Stage05 regression in the repo).
const inverse = [0, 6, 2, 5, 1, 4, 3];
const forward = [0, 4, 2, 6, 5, 3, 1];
assert.deepEqual(inverse.map((x) => forward[x]), [0, 1, 2, 3, 4, 5, 6]);
/**
 * Seven printed complete-word packets, within each original visual chapter,
 * keep their trailing punctuation attached. Unfilled trailing groups remain.
 * @template T
 * @param {T[]} input
 * @param {number[]} parts
 * @param {number[]} order
 * @returns {T[]}
 */
function reorder(input, parts, order) {
  const out = input.slice();
  for (let begin = 0; begin < input.length;) {
    let end = begin + 1;
    while (end < input.length && parts[end] === parts[begin]) end++;
    for (let i = begin; i + 7 <= end; i += 7) {
      for (let j = 0; j < 7; j++) out[i + j] = input[i + order[j]];
    }
    begin = end;
  }
  return out;
}
/** @param {number} n @returns {number} */
const cap = (n) => Math.min(n, 9);
/**
 * Plug-in mutual information of adjacent word lengths, excluding joins
 * across original printed visual chapters, in natural logarithmic units.
 * @param {Array<{len:number}>} tokens
 * @param {number[]} parts
 * @returns {number}
 */
function adjacentMI(tokens, parts) {
  const tab = Array.from({length: 10}, () => Array(10).fill(0));
  let n = 0;
  for (let i = 1; i < tokens.length; i++) {
    if (parts[i] !== parts[i - 1]) continue;
    tab[cap(tokens[i - 1].len)][cap(tokens[i].len)]++;
    n++;
  }
  const row = tab.map((r) => r.reduce((s, x) => s + x, 0));
  const col = Array.from({length: 10}, (_, c) =>
    tab.reduce((s, r) => s + r[c], 0));
  let score = 0;
  for (let i = 0; i < 10; i++) for (let k = 0; k < 10; k++) {
    const v = tab[i][k];
    if (v) score += v / n * Math.log(v * n / (row[i] * col[k]));
  }
  return score;
}
/**
 * MI between word length and sentence role: start, end, interior.
 * Sentence-ending periods travel with their words during the hypothesis.
 * @param {Array<{len:number,punct:boolean}>} tokens
 * @param {number[]} parts
 * @returns {number}
 */
function sentenceMI(tokens, parts) {
  const tab = Array.from({length: 3}, () => Array(10).fill(0));
  const n = tokens.length;
  for (let i = 0; i < n; i++) {
    const role = !i || parts[i] !== parts[i - 1] ||
      tokens[i - 1].punct ? 0 : tokens[i].punct ? 1 : 2;
    tab[role][cap(tokens[i].len)]++;
  }
  const row = tab.map((r) => r.reduce((s, x) => s + x, 0));
  const col = Array.from({length: 10}, (_, c) =>
    tab.reduce((s, r) => s + r[c], 0));
  let score = 0;
  for (let i = 0; i < 3; i++) for (let k = 0; k < 10; k++) {
    const v = tab[i][k];
    if (v) score += v / n * Math.log(v * n / (row[i] * col[k]));
  }
  return score;
}
const original = {
  adjacent: adjacentMI(words, chapters),
  sentence: sentenceMI(words, chapters)
};
const decoding = reorder(words, chapters, inverse);
const opposite = reorder(words, chapters, forward);
const result = {
  original,
  historicalInverse: {
    adjacent: adjacentMI(decoding, chapters),
    sentence: sentenceMI(decoding, chapters)
  },
  opposite: {
    adjacent: adjacentMI(opposite, chapters),
    sentence: sentenceMI(opposite, chapters)
  }
};
// Assert all unchanged original-source measurements, independently checked
// against the repository's previously published word-grammar parser.
assert.ok(Math.abs(original.adjacent - 0.0121561009729390) < 1e-11);
assert.ok(Math.abs(original.sentence - 0.0014681942672824) < 1e-11);
assert.ok(Math.abs(result.historicalInverse.adjacent - 0.0104881549985767) < 1e-11);
assert.ok(Math.abs(result.opposite.adjacent - 0.0138194112062879) < 1e-11);
assert.deepEqual(reorder(decoding, chapters, forward), words);

/** @param {number} n @param {number} seed @returns {number[]} */
function shuffles(n, seed) {
  let state = seed >>> 0;
  const a = [...Array(n).keys()];
  function random() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  }
  for (let begin = 0; begin < n;) {
    let end = begin + 1;
    while (end < n && chapters[end] === chapters[begin]) end++;
    for (let i = end - 1; i > begin; i--) {
      const j = begin + Math.floor(random() * (i - begin + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    begin = end;
  }
  return a;
}
const trials = 800;
let seed = 0x12345678;
const sums = [0, 0, 0], squares = [0, 0, 0], high = [0, 0, 0];
const observations = [
  original.adjacent,
  result.historicalInverse.adjacent,
  result.opposite.adjacent
];
for (let t = 0; t < trials; t++) {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  const indices = shuffles(words.length, seed);
  const shuffled = indices.map((i) => words[i]);
  const versions = [
    shuffled,
    reorder(shuffled, chapters, inverse),
    reorder(shuffled, chapters, forward)
  ];
  for (let m = 0; m < versions.length; m++) {
    const score = adjacentMI(versions[m], chapters);
    sums[m] += score;
    squares[m] += score * score;
    if (score >= observations[m]) high[m]++;
  }
}
const nullResults = ["original", "historicalInverse", "opposite"].map((name, i) => {
  const mean = sums[i] / trials;
  const variance = squares[i] / trials - mean * mean;
  return {
    name,
    mean,
    z: (observations[i] - mean) / Math.sqrt(variance),
    upperTail: (high[i] + 1) / (trials + 1)
  };
});
// The exact historical inverse must not become an apparent native-prose
// signal under identical chapter-length histogram permutations.
assert.ok(nullResults[1].upperTail > 0.10);
assert.ok(nullResults[2].upperTail > 0.10);

// GP-native positive words from a source already used for the repository's
// original word-grammar controls; no text is fetched or inferred remotely.
const labels = ["ING", ...corpus.translit]
  .sort((a, b) => b.length - a.length);
/** @param {string} word @returns {number} */
function gpLength(word) {
  const normalized = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
  let result = 0;
  for (let i = 0; i < normalized.length;) {
    const symbol = labels.find((s) => normalized.startsWith(s, i));
    assert.ok(symbol, "Unmapped source letter at " + i);
    i += symbol.length;
    result++;
  }
  return result;
}
const sourceEnglish = read("resources/control/gibran_prophet_58585.txt")
  .match(/[A-Za-z]+/g).slice(0, words.length)
  .map((raw) => ({len: gpLength(raw), punct: false}));
assert.equal(sourceEnglish.length, words.length);
const plantedCipher = reorder(sourceEnglish, chapters, forward);
const recovered = reorder(plantedCipher, chapters, inverse);
assert.deepEqual(recovered, sourceEnglish);
const plant = {
  originalEnglishMI: adjacentMI(sourceEnglish, chapters),
  afterSevenWordEncodingMI: adjacentMI(plantedCipher, chapters),
  restoredEnglishMI: adjacentMI(recovered, chapters)
};
assert.ok(plant.originalEnglishMI > 0.03);
assert.ok(plant.restoredEnglishMI > result.historicalInverse.adjacent * 2);
console.log(JSON.stringify({
  source: {runes:runeCount, words:words.length, periods:175,
    visualChapterWordCounts:sizeByChapter},
  historicalSevenSlotInverse:inverse,
  blockRule:"complete printed words in seven-word blocks within each visual chapter; last shorter block unchanged",
  result,
  nullTrials:trials,
  nullResults,
  positiveControl:plant,
  verdict:"No original native-prose word-grammar restoration; no recovered plaintext or key"
}, null, 2));
