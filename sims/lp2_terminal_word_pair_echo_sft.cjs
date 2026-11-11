"use strict";

/**
 * Source-locked LP2 repeated-word-pair census and word-preserving null.
 * Run from the repository root: node sims/lp2_terminal_word_pair_echo_sft.cjs
 * Uses the immutable transcription and the existing page/word parser.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus, physicalLP2Page} = require("./lp2_word_pages.cjs");

const {words, runeCount, crossPageWords} = parseSharedCorpus();
const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"));

assert.equal(words.length, 2896);
assert.equal(runeCount, 12956);
assert.equal(crossPageWords, 32);

const pairPositions = new Map();
for (let i = 0; i < words.length - 1; i++) {
  const key = words[i].runes + "|" + words[i + 1].runes;
  const hits = pairPositions.get(key) ?? [];
  hits.push(i);
  pairPositions.set(key, hits);
}
const repeated = [...pairPositions.entries()].filter(([, hits]) => hits.length > 1);
const pair = "ᛞᛄᚢ|ᛒᛖᛁ";
assert.equal(repeated.length, 1);
assert.equal(repeated[0][0], pair);
assert.deepEqual(repeated[0][1], [1462, 2894]);

assert.equal(physicalLP2Page(words[1462].startPage), 27);
assert.equal(physicalLP2Page(words[2894].startPage), 55);
assert.equal(words[1462].length, 3);
assert.equal(words[1463].length, 3);
assert.equal(words[2894].length, 3);
assert.equal(words[2895].length, 3);

const target = [23, 11, 1, 17, 18, 10]; // D J U B E I; GP29 indices.
assert.deepEqual(corpus.pages[27].indices.slice(28, 34), target);
assert.deepEqual(corpus.pages[55].indices.slice(70, 76), target);
assert.equal(corpus.pages[55].indices.length, 76);

// Preserve each printed word length and the exact multisets of words per length.
// Scramble only their position among same-length word slots. This null retains
// the language-like token repertoire, all repetitions, and the manuscript's
// word-length clock, without preserving original word-to-word adjacency.
const wordIds = new Map();
const ids = [];
const lengths = [];
for (const word of words) {
  if (!wordIds.has(word.runes)) wordIds.set(word.runes, wordIds.size);
  ids.push(wordIds.get(word.runes));
  lengths.push(word.length);
}
const lengthSlots = new Map();
for (let i = 0; i < ids.length; i++) {
  const length = lengths[i];
  if (!lengthSlots.has(length)) lengthSlots.set(length, []);
  lengthSlots.get(length).push(i);
}
const groups = [...lengthSlots.values()];
const shuffled = Int32Array.from(ids);
const trials = 30000;
let rngState = 0x4e5ea928;

/** @returns {number} Deterministic uniform fraction in [0,1). */
function random() {
  rngState ^= rngState << 13;
  rngState ^= rngState >>> 17;
  rngState ^= rngState << 5;
  return (rngState >>> 0) / 4294967296;
}
const counts = {any: 0, sumLengthAtLeast6: 0, threePlusThree: 0, terminal: 0};
for (let t = 0; t < trials; t++) {
  for (const slots of groups) {
    const pool = slots.map(i => ids[i]);
    for (let j = pool.length - 1; j > 0; j--) {
      const k = Math.floor(random() * (j + 1));
      const old = pool[j];
      pool[j] = pool[k];
      pool[k] = old;
    }
    for (let j = 0; j < slots.length; j++) shuffled[slots[j]] = pool[j];
  }

  const seen = new Set();
  let hasPair = false;
  let hasLong = false;
  let hasThreeThree = false;
  let hasTerminal = false;
  for (let i = 0; i < shuffled.length - 1; i++) {
    const key = shuffled[i] * 4096 + shuffled[i + 1];
    const prior = seen.has(key);
    if (prior) {
      hasPair = true;
      if (lengths[i] + lengths[i + 1] >= 6) hasLong = true;
      if (lengths[i] === 3 && lengths[i + 1] === 3) hasThreeThree = true;
      if (i === shuffled.length - 2) hasTerminal = true;
    }
    seen.add(key);
  }
  counts.any += Number(hasPair);
  counts.sumLengthAtLeast6 += Number(hasLong);
  counts.threePlusThree += Number(hasThreeThree);
  counts.terminal += Number(hasTerminal);
}
assert.deepEqual(counts, {
  any: 412, sumLengthAtLeast6: 5, threePlusThree: 5, terminal: 0
});

console.log(JSON.stringify({
  source: "resources/lp2-transcription.txt",
  runeCount,
  words: words.length,
  adjacentPairs: words.length - 1,
  repeated: [{pair, positions: repeated[0][1], pages: [27, 55],
    pageOffsets: [28, 70], pageGap: 28}],
  null: {type: "length-stratified word-multiset shuffle",
    seed: "0x4e5ea928", trials, counts, seedFinal: rngState >>> 0}
}, null, 2));
