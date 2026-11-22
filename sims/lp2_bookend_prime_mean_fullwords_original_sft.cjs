"use strict";
/**
 * DJU-BEI historical bookend prime-mean channel on every unknown word.
 * SFT for the original GP29 and original printed word boundaries.
 * Node.js 22, CommonJS, read-only; no fitted letter/key or variant search.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} file */
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const fragments = read("resources/liber-primus/lp2-transcription.txt").split("%");
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const primeIndex = new Map(corpus.prime.map((p, i) => [p, i]));
const words = [];
let active = [];
let runeCount = 0;
for (let fragment = 0; fragment < 55; fragment++) {
  const page = fragment < 50 ? fragment : fragment + 1;
  const pageIndices = [];
  for (const char of fragments[fragment]) {
    if (runeIndex.has(char)) {
      const value = runeIndex.get(char);
      active.push({page, value});
      pageIndices.push(value);
      runeCount++;
    } else if ("-.$&".includes(char) && active.length) {
      words.push(active);
      active = [];
    }
  }
  assert.deepEqual(pageIndices, corpus.pages[page].indices);
}
if (active.length) words.push(active);
assert.equal(runeCount, 12956);
assert.equal(words.length, 2896);

/** @typedef {{page:number, rune:number, length:number}} Hit */
/** @type {Hit[]} */
const hits = [];
for (const word of words) {
  const mean = word.reduce((s, x) => s + corpus.prime[x.value], 0) / word.length;
  if (primeIndex.has(mean)) hits.push({
    page: word[0].page, rune: primeIndex.get(mean), length: word.length
  });
}
assert.equal(hits.length, 357);
assert.equal(hits.filter(x => x.length === 1).length, 83);
assert.equal(hits.filter(x => x.length > 1).length, 274);
assert.deepEqual(hits.slice(-2).map(x => corpus.translit[x.rune]), ["P", "S"]);

// Independent GP-English trigram model. Greedy historical digraphs;
// normalize the same way as the repository's source-control GP encoder.
const alphabet = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} word */
function encode(word) {
  const normal = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
  const result = [];
  for (let offset = 0; offset < normal.length;) {
    const rune = alphabet.find(x => normal.startsWith(x.s, offset));
    assert.ok(rune, "Cannot GP encode source word");
    result.push(rune.i);
    offset += rune.s.length;
  }
  return result;
}
const source = (read("resources/control/shakespeare_first300k.txt")
  .match(/[A-Za-z]+/g) || []).flatMap(encode);
assert.equal(source.length, 218800);
const trigram = new Float64Array(29 ** 3).fill(0.001);
for (let i = 2; i < source.length; i++) {
  trigram[(source[i-2] * 29 + source[i-1]) * 29 + source[i]]++;
}
const bigram = new Float64Array(29 * 29);
for (let i = 0; i < trigram.length; i++) bigram[Math.floor(i / 29)] += trigram[i];
/** @param {number[]} symbols */
function score(symbols) {
  let n = 0;
  for (let i = 2; i < symbols.length; i++) {
    const pair = symbols[i-2] * 29 + symbols[i-1];
    n += Math.log(trigram[pair * 29 + symbols[i]] / bigram[pair]);
  }
  return n / (symbols.length - 2);
}
const sourceRows = hits.map(x => x.rune);
const observed = score(sourceRows);
const noSingleton = score(hits.filter(x => x.length > 1).map(x => x.rune));
assert.ok(Math.abs(observed - (-6.845561506264345)) < 1e-10);
assert.ok(Math.abs(noSingleton - (-6.857006898148678)) < 1e-10);
assert.ok(Math.abs(score(corpus.pages[57].indices) - (-2.597515638653576)) < 1e-10);

// Same 357 symbols, same exact per-physical-page inventory. Only the
// selected source-word order is randomized within each physical page.
/** @type {Map<number,number[]>} */
const byPage = new Map();
for (let i = 0; i < hits.length; i++) {
  const page = hits[i].page;
  if (!byPage.has(page)) byPage.set(page, []);
  byPage.get(page).push(i);
}
/** @param {number} seed */
function nullShuffle(seed) {
  let rng = seed >>> 0;
  /** @returns {number} */
  function rand() {rng ^= rng << 13; rng ^= rng >>> 17; rng ^= rng << 5; return rng >>> 0;}
  const out = sourceRows.slice();
  for (const indices of byPage.values()) {
    for (let j = indices.length - 1; j > 0; j--) {
      const k = rand() % (j + 1), a = indices[j], b = indices[k];
      [out[a], out[b]] = [out[b], out[a]];
    }
  }
  return out;
}
let exceed = 0, total = 0, minimum = Infinity, maximum = -Infinity;
for (let trial = 1; trial <= 1000; trial++) {
  const value = score(nullShuffle((0x3301 ^ trial) >>> 0));
  exceed += Number(value >= observed);
  total += value;
  minimum = Math.min(minimum, value);
  maximum = Math.max(maximum, value);
}
assert.equal(exceed, 634);
console.log(JSON.stringify({
  originalWords: words.length, originalRunes: runeCount,
  validGPPrimeMeanWords: hits.length, nonSingletons: hits.length - 83,
  terminalMeanReadout: "PS", directTrigram: observed,
  excludingTrivialSingletons: noSingleton,
  independentSolvedP57: score(corpus.pages[57].indices),
  conditionalWithinPageNull: {
    trials: 1000, seedConvention: "0x3301 ^ trial",
    scoreMean: total / 1000, min: minimum, max: maximum,
    nullsAtLeastOriginal: exceed,
    addOneUpperTail: (exceed + 1) / 1001
  },
  decision: "No native GP-English direct prime-mean channel"
}, null, 2));
