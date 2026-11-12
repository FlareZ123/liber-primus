"use strict";

/**
 * Frozen original LP2 p40–p53 whole-word eight-column inverse.
 *
 * In contrast to the earlier rune-column test, this cipher hypothesis moves
 * entire hyphen-delimited rune words. The eight red p40 heading runes select
 * a stable alphabet-rank column order. The remaining 3,000 runes comprise
 * 667 complete printed words after the two heading words.
 *
 * Reproduce: node sims/lp2_p40_red8_word_columnar_sft.cjs
 * Reads only pinned repository sources. Does not modify files.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeSet = new Set(corpus.runes);
const tokens = corpus.translit.slice().sort((a, b) => b.length - a.length);

/**
 * Source parser preserves words across physical lines and page boundaries.
 * Here rune-bearing page indexes 50..52 correspond to physical p51..53.
 * @returns {{page: number, runes: string, length: number}[]}
 */
function parseWords() {
  const stream = read("resources/liber-primus/lp2-transcription.txt")
    .split("%").slice(0, 55).join("%");
  const words = [];
  let page = 0;
  let current = "";
  let firstPage = 0;
  const finish = () => {
    if (current) {
      words.push({page: firstPage, runes: current, length: current.length});
      current = "";
    }
  };
  for (const c of stream) {
    if (runeSet.has(c)) {
      if (!current) firstPage = page;
      current += c;
    } else if (c === "%") {
      page++;
    } else if (c === "/" || /\s/u.test(c)) {
      // No word boundary at a physical print wrap.
    } else {
      finish();
    }
  }
  finish();
  assert.equal(words.length, 2896);
  assert.equal(words.reduce((n, w) => n + w.length, 0), 12956);
  return words;
}

/**
 * GP transliteration is identical to the repository's word-length controls.
 * @param {string} text
 * @returns {number[]}
 */
function gpLengths(text) {
  return (text.toUpperCase().match(/[A-Z]+/g) || []).map(raw => {
    const word = raw.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/[KQ]/g, "C").replace(/Z/g, "S")
      .replace(/ING/g, "NG");
    let length = 0;
    for (let at = 0; at < word.length;) {
      const token = tokens.find(t => word.startsWith(t, at));
      assert(token, "GP token missing in " + word);
      at += token.length;
      length++;
    }
    return length;
  });
}

/** @param {number} n */
const category = n => n <= 4 ? n - 1 : n <= 6 ? 4 : n <= 8 ? 5 : 6;

/** @param {number[]} values @returns {number[][]} */
function model(values) {
  const counts = Array.from({length: 7}, () => Array(7).fill(1));
  const rows = Array(7).fill(7);
  const cols = Array(7).fill(7);
  let total = 49;
  for (let i = 1; i < values.length; i++) {
    const x = category(values[i - 1]);
    const y = category(values[i]);
    counts[x][y]++;
    rows[x]++;
    cols[y]++;
    total++;
  }
  return counts.map((row, x) => row.map((n, y) =>
    Math.log2((n / rows[x]) / (cols[y] / total))));
}

/** @param {number[]} values @param {number[][]} m */
function score(values, m) {
  let sum = 0;
  for (let i = 1; i < values.length; i++)
    sum += m[category(values[i - 1])][category(values[i])];
  return sum / (values.length - 1);
}

const words = parseWords();
const chapter = words.filter(w => w.page >= 40 && w.page <= 52);
const header = chapter.slice(0, 2);
const body = chapter.slice(2);
const headingIndices = header.flatMap(w =>
  [...w.runes].map(r => corpus.runes.indexOf(r)));
const sourceHeading = corpus.pages[40].indices.slice(0, 8);
assert.deepEqual(header.map(w => w.length), [3, 5]);
assert.deepEqual(headingIndices, sourceHeading);
assert.deepEqual(headingIndices, [0, 9, 19, 26, 6, 23, 25, 8]);
assert.equal(chapter.length, 669);
assert.equal(body.length, 667);
assert.equal(body.reduce((n, w) => n + w.length, 0), 3000);

// Ascending GP-index rank of the eight original distinct heading symbols.
const order = headingIndices.map((_, i) => i)
  .sort((a, b) => headingIndices[a] - headingIndices[b]);
assert.deepEqual(order, [0, 4, 7, 1, 2, 5, 6, 3]);

/**
 * Historical-style encryption: fill width-8 rows of whole words, then read
 * key-sorted columns consecutively, including the three extra top cells.
 * @template T
 * @param {T[]} plaintext
 * @returns {T[]}
 */
function encode(plaintext) {
  const cols = Array.from({length: 8}, () => []);
  plaintext.forEach((w, i) => cols[i % 8].push(w));
  return order.flatMap(c => cols[c]);
}

/**
 * Frozen inverse: split source ciphertext into column groups of 84/83
 * whole words, assign them by red-rune key order, then read rows.
 * @template T
 * @param {T[]} ciphertext
 * @returns {T[]}
 */
function decode(ciphertext) {
  const sizes = Array.from({length: 8}, (_, c) =>
    Math.floor(ciphertext.length / 8) + (c < ciphertext.length % 8 ? 1 : 0));
  let at = 0;
  const cols = Array(8);
  for (const c of order) {
    cols[c] = ciphertext.slice(at, at + sizes[c]);
    at += sizes[c];
  }
  assert.equal(at, ciphertext.length);
  const plaintext = [];
  for (let row = 0; row < Math.ceil(ciphertext.length / 8); row++)
    for (let c = 0; c < 8; c++)
      if (row < cols[c].length) plaintext.push(cols[c][row]);
  return plaintext;
}

const candidate = decode(body);
assert.deepEqual(encode(candidate), body);
const sourceLengths = body.map(w => w.length);
const candidateLengths = candidate.map(w => w.length);
const controls = {
  LP1: gpLengths(read("resources/liber-primus/lp1-plaintext-reference.txt")),
  Gibran: gpLengths(read("resources/control/gibran_prophet_58585.txt")),
  Emerson: gpLengths(read("resources/control/emerson_essays_2944.txt"))
};
assert.deepEqual(Object.fromEntries(Object.entries(controls)
  .map(([name, vals]) => [name, vals.length])),
{LP1: 904, Gibran: 15733, Emerson: 77932});

let seed = 0x7e570000;
/** @param {number} n */
function randomIndex(n) {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) % n;
}

/** @param {number[]} lengths @param {number[][]} m */
function shuffleSummary(lengths, m) {
  const samples = [];
  for (let trial = 0; trial < 2000; trial++) {
    const shuffled = lengths.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = randomIndex(i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    samples.push(score(shuffled, m));
  }
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  const sd = Math.sqrt(samples.reduce((a, b) =>
    a + (b - mean) ** 2, 0) / samples.length);
  const original = score(sourceLengths, m);
  const decoded = score(candidateLengths, m);
  return {
    original, decoded, shuffleMean: mean, shuffleSD: sd,
    zOriginal: (original - mean) / sd,
    zDecoded: (decoded - mean) / sd,
    decodedUpperTail: (1 + samples.filter(x => x >= decoded).length) /
      (1 + samples.length)
  };
}

const originalScore = {};
for (const [name, sample] of Object.entries(controls)) {
  const m = model(sample);
  const test = sample.slice(0, body.length);
  assert.deepEqual(decode(encode(test)), test);
  const check = shuffleSummary(sourceLengths, m);
  Object.assign(check, {
    sourceNativeControl: score(test, m),
    sourceNativeScrambled: score(encode(test), m),
    exactNativeRecovery: true
  });
  originalScore[name] = check;
}

assert(originalScore.LP1.zDecoded < 2);
assert(originalScore.Gibran.zDecoded < 2);
assert(originalScore.Emerson.zDecoded < 2);
console.log(JSON.stringify({
  source: "LP2 physical pp40–53, original words excluding first red 3+5",
  headingIndices, order, chapterWords: chapter.length,
  bodyWords: body.length, originalBodyRunes: 3000,
  columnLengths: [84,84,84,83,83,83,83,83],
  scores: originalScore,
  result: "No statistically detectable GP-native English word-length adjacency restored"
}, null, 2));
