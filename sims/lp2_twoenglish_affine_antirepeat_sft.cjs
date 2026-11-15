"use strict";

/**
 * Original-LP2 finite source-English running-key gate.
 * SFT: node sims/lp2_twoenglish_affine_antirepeat_sft.cjs
 * Node 22 / CommonJS. No external dependencies or output files.
 *
 * The complete 28-member GP29 family C=aP+bK+d, with a,b nonzero,
 * has the same repeat positions as C=P+tK (t=b/a mod 29).
 * For source-native independent P and K registers, compare observed
 * source-page doublets with the minimum repeat count over all 28 t.
 * This is a model-calibrated necessary condition, not a historical-key proof.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} name @returns {string} */
function read(name) {
  return fs.readFileSync(path.join(root, name), "utf8").replace(/\r\n/g, "\n");
}
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const physical = read("resources/liber-primus/lp2-transcription.txt").split("%");
const sources = [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt"
];
const names = corpus.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);
const runeMap = new Map(corpus.runes.map((r, index) => [r, index]));

/** Source-attested ING=NG and IO=IA runes; conventional Q,V,K,Z normalization. 
 * @param {string} raw @returns {number[]}
 */
function encodeGP(raw) {
  const text = raw.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const result = [];
  for (let i = 0; i < text.length;) {
    if (text.startsWith("ING", i)) { result.push(21); i += 3; continue; }
    if (text.startsWith("IO", i)) { result.push(27); i += 2; continue; }
    const item = names.find(x => text.startsWith(x.token, i));
    assert(item, "unrecognized GP letter in " + raw);
    result.push(item.index);
    i += item.token.length;
  }
  return result;
}
assert.deepEqual(encodeGP("THINGS"), [2, 21, 15]);
assert.deepEqual(encodeGP("FUNCTION"), [0, 1, 9, 5, 16, 27, 9]);
assert.deepEqual(encodeGP("FOLLOWING"), [0, 3, 20, 20, 3, 7, 21]);
const originalLP1 = read("resources/transcriptions/lp1_wulfic_canonical.txt");
for (const word of ["THINGS", "FUNCTION", "FOLLOWING"]) {
  assert(originalLP1.includes(encodeGP(word).map(x => corpus.runes[x]).join("")),
    "source-calibrated known-LP1 spelling " + word);
}

const pages = [];
for (let page = 0; page < 56; page++) {
  // The 2014 transcription omitted the rune-free numerical page p50.
  const source = page < 50 ? physical[page] : page === 50 ? "" : physical[page - 1];
  const printedFragments = source.replace(/\/\s*/g, "").replace(/\s+/g, "")
    .split(/[-.]+/).filter(x => [...x].some(c => runeMap.has(c)));
  const parts = printedFragments.map(s =>
    [...s].filter(c => runeMap.has(c)).map(c => runeMap.get(c)));
  const joined = parts.flat();
  assert.deepEqual(joined, corpus.pages[page].indices, "original physical page " + page);
  if (joined.length) pages.push({page, original: joined, lengths: parts.map(w => w.length)});
}
assert.equal(pages.length, 55);
assert.equal(pages.reduce((s, p) => s + p.original.length, 0), 12956);
assert.equal(pages.reduce((s, p) => s + p.original.length - 1, 0), 12901);
// 2,928 fragments include 32 original cross-page word continuations.
assert.equal(pages.reduce((s, p) => s + p.lengths.length, 0), 2928);
const originalDoubles = pages.reduce((sum, page) =>
  sum + page.original.slice(1).reduce((n, x, i) => n + (x === page.original[i]), 0), 0);
assert.equal(originalDoubles, 86);

const vocabulary = new Map();
const keys = [];
for (const filename of sources) {
  const stream = [];
  for (const match of read(filename).matchAll(/[A-Za-z]+/g)) {
    const word = encodeGP(match[0]);
    if (word.length < 1 || word.length > 18) continue;
    stream.push(...word);
    if (!vocabulary.has(word.length)) vocabulary.set(word.length, []);
    vocabulary.get(word.length).push(word); // token-frequency-weighted sampling
  }
  assert(stream.length > 12956, "key text must be longer than original LP2");
  keys.push(stream);
}
for (const page of pages) for (const length of page.lengths)
  assert(vocabulary.has(length), "missing source-English printed word length " + length);

let state = 0x33012955;
/** @returns {number} Unsigned deterministic xorshift32. */
function next() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}

/**
 * One native-English word-register plant plus an independent contiguous
 * English key passage; compute each GP29 nonzero affine ratio in one pass.
 * Original printed page boundaries are kept as cipher resets for counting
 * adjacent equality; the proposed key clock is continuous over pages.
 * @param {number[]} keySource @returns {number[]}
 */
function sample(keySource) {
  const start = next() % (keySource.length - 12956 - 1);
  const matrix = new Uint32Array(29 * 29);
  let position = start;
  let previousP = 0;
  let previousK = 0;
  for (const page of pages) {
    let first = true;
    for (const length of page.lengths) {
      const pool = vocabulary.get(length);
      const word = pool[next() % pool.length];
      for (const symbol of word) {
        const key = keySource[position++];
        if (!first) {
          const dP = (symbol - previousP + 29) % 29;
          const dK = (key - previousK + 29) % 29;
          matrix[dP * 29 + dK]++;
        }
        previousP = symbol;
        previousK = key;
        first = false;
      }
    }
  }
  const totals = [];
  for (let t = 1; t < 29; t++) {
    let count = 0;
    for (let dK = 0; dK < 29; dK++) {
      const dP = (29 - (t * dK) % 29) % 29;
      count += matrix[dP * 29 + dK];
    }
    totals.push(count);
  }
  return totals;
}
/** @param {number[]} v @returns {number[]} */
function quantiles(v) {
  const x = [...v].sort((a, b) => a - b);
  return [x[0], x[Math.floor(0.05 * x.length)], x[Math.floor(0.50 * x.length)],
    x[Math.floor(0.95 * x.length)], x[x.length - 1]];
}
// A planted source-native word and an independently sourced key invert
// and re-encrypt exactly for all 28 affine ratios.
const plantedWord = encodeGP("FOLLOWING");
for (let t = 1; t < 29; t++) {
  const key = keys[0].slice(200, 200 + plantedWord.length);
  const cipher = plantedWord.map((p, i) => (p + t * key[i]) % 29);
  const recovered = cipher.map((c, i) => (c - t * key[i] + 29 * 28) % 29);
  assert.deepEqual(recovered, plantedWord);
  assert.deepEqual(recovered.map((p, i) => (p + t * key[i]) % 29), cipher);
}
const expected = [
  {all: [360, 378, 399, 414, 425], plus: [410, 427, 461, 495, 523],
    minus: [426, 454, 492, 532, 564]},
  {all: [363, 380, 399, 413, 423], plus: [398, 429, 464, 496, 533],
    minus: [429, 458, 496, 533, 557]},
  {all: [351, 379, 399, 414, 425], plus: [390, 425, 463, 499, 522],
    minus: [427, 459, 493, 531, 549]}
];
console.log("Original LP2 pages 0..55: 12956 runes, 12901 page-local adjacencies, 86 equal pairs");
for (let i = 0; i < keys.length; i++) {
  const all = [], plus = [], minus = [];
  for (let n = 0; n < 500; n++) {
    const outcome = sample(keys[i]);
    all.push(Math.min(...outcome));
    plus.push(outcome[0]);
    minus.push(outcome[27]);
  }
  const observed = {all: quantiles(all), plus: quantiles(plus), minus: quantiles(minus)};
  assert.deepEqual(observed, expected[i], "deterministic source control " + sources[i]);
  assert(all.every(n => n > originalDoubles));
  console.log(JSON.stringify({keySource: sources[i], nativePlants: 500,
    minOverAll28: observed.all, plus: observed.plus, minus: observed.minus,
    plantsAtMostOriginal: 0}));
}
console.log("Decision: no source-native independent-English affine running-key plant approaches 86 doublets.");
console.log("This is a calibrated conditional exclusion, not a recovered plaintext or universal key bound.");
