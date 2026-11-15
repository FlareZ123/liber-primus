"use strict";

/**
 * Source-native complete-word GP29 lexical channel at visually defined chapter heads.
 * An exploratory diagnostic, not an unknown LP2 decryption.
 * SFT: node sims/lp2_literal_fourrune_chapter_head_sft.cjs
 * Windows 11, Node.js 22; no network calls, packages or file writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(ROOT, name), "utf8")
  .replace(/\r\n/g, "\n");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/lp2-transcription.txt");
const lexicon = read("resources/control/english_wordfreq_textblob.txt");
const glyph = new Map(gp.runes.map((g, i) => [g, i]));
const tokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
const sourcePages = gp.pages.filter((p) => p.page < 56 && p.indices.length)
  .map((p) => p.indices);
assert.equal(sourcePages.length, 55);

/** Source-solved English orthography, including ING and IO digraph conventions. */
function encode(text) {
  const normalized = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const result = [];
  for (let i = 0; i < normalized.length;) {
    if (normalized.startsWith("ING", i)) {
      result.push(21);
      i += 3;
    } else if (normalized.startsWith("IO", i)) {
      result.push(27);
      i += 2;
    } else {
      const token = tokens.find((t) => normalized.startsWith(t.s, i));
      if (!token) return [];
      result.push(token.i);
      i += token.s.length;
    }
  }
  return result;
}
const dictionary = new Map();
for (const line of lexicon.split("\n")) {
  const matched = /^([a-z]+) (\d+)$/.exec(line);
  if (!matched) continue;
  const encoded = encode(matched[1]);
  if (encoded.length < 4) continue;
  const key = encoded.join(",");
  if (!dictionary.has(key)) dictionary.set(key, []);
  dictionary.get(key).push(matched[1]);
}
assert.equal(dictionary.size, 28093);

const words = [];
const pageWordRanks = Array(55).fill(0);
let current = [];
let startingPage = 0;
let page = 0;
/** Printed page breaks and line wraps preserve the unfinished runic word. */
function finish() {
  if (!current.length) return;
  words.push({slots: current.slice(), page: startingPage,
    rank: pageWordRanks[startingPage]++});
  current = [];
}
for (const segment of transcription.split("%").slice(0, 55)) {
  const actual = [];
  for (const character of segment) {
    if (glyph.has(character)) {
      if (!current.length) startingPage = page;
      current.push([page, actual.length]);
      actual.push(glyph.get(character));
    } else if (character === "/" || /\s/u.test(character)) {
      continue;
    } else {
      finish();
    }
  }
  assert.deepEqual(actual, sourcePages[page], "unaltered source rune page " + page);
  page++;
}
finish();
assert.equal(words.length, 2896);
assert.equal(sourcePages.flat().length, 12956);
const relevantWords = words.filter((w) => w.slots.length >= 4);
assert.equal(relevantWords.length, 1645);

/* The original visible chapter starts, with rune-free physical p50 skipped. */
const chapterStarts = new Set([0, 3, 8, 15, 23, 27, 33, 40, 53]);
const physicalPage = (p) => p < 50 ? p : p + 1;

/** @param {number[][]} pages */
function summarize(pages) {
  const result = {total: 0, early: 0, chapter: 0, matches: []};
  for (const word of relevantWords) {
    const key = word.slots.map(([p, i]) => pages[p][i]).join(",");
    const options = dictionary.get(key);
    if (!options) continue;
    result.total++;
    if (word.rank < 15) {
      result.early++;
      if (chapterStarts.has(word.page)) result.chapter++;
    }
    result.matches.push({page: physicalPage(word.page), rank: word.rank,
      source: word.slots.map(([p, i]) => gp.translit[pages[p][i]]).join(" "),
      dictionary: options.slice(0, 5)});
  }
  return result;
}
const observed = summarize(sourcePages);
assert.deepEqual([observed.total, observed.early, observed.chapter], [5, 4, 3]);
assert.deepEqual(observed.matches.map((m) => [m.page, m.rank, m.dictionary[0]]), [
  [14, 1, "fold"], [19, 32, "rift"], [23, 14, "zest"],
  [40, 6, "make"], [54, 13, "roux"]
]);
console.log("original", JSON.stringify({words: words.length,
  eligible: relevantWords.length, observed}));

/** @param {number} seed */
function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}
const outgoing = sourcePages.map((sequence) => {
  const rows = Array.from({length: 29}, () => []);
  for (let i = 1; i < sequence.length; i++) {
    rows[sequence[i - 1]].push(sequence[i]);
  }
  return rows;
});

/**
 * Hierholzer on a shuffled copy of the *exact* source directed-edge multiset.
 * Preserves every within-page original bigram, 86 self-edges, endpoints and lengths.
 * @param {number[]} original
 * @param {number[][]} edges
 * @param {() => number} random
 * @returns {number[]}
 */
function trail(original, edges, random) {
  const rows = edges.map((x) => x.slice());
  for (const row of rows) {
    for (let i = row.length - 1; i > 0; i--) {
      const j = random() % (i + 1);
      [row[i], row[j]] = [row[j], row[i]];
    }
  }
  const stack = [original[0]];
  const answer = [];
  while (stack.length) {
    const last = stack[stack.length - 1];
    if (rows[last].length) stack.push(rows[last].pop());
    else answer.push(stack.pop());
  }
  answer.reverse();
  assert.equal(answer.length, original.length);
  assert.equal(answer[0], original[0]);
  assert.equal(answer.at(-1), original.at(-1));
  return answer;
}
const repetitions = 1200;
const random = xorshift32(0x33011912);
const values = ["total", "early", "chapter"];
const sums = [0, 0, 0];
const exceed = [0, 0, 0];
for (let sample = 0; sample < repetitions; sample++) {
  const shuffled = sourcePages.map((original, i) =>
    trail(original, outgoing[i], random));
  const result = summarize(shuffled);
  values.forEach((property, k) => {
    sums[k] += result[property];
    if (result[property] >= observed[property]) exceed[k]++;
  });
}
assert.deepEqual(exceed, [23, 4, 0]);
console.log("source-bigram-preserving Eulerian null", JSON.stringify({
  seed: "0x33011912", repetitions,
  mean: sums.map((x) => x / repetitions),
  exceed, addOneTail: exceed.map((x) => (x + 1) / (repetitions + 1))
}));

/** Every within-word rune multiset held fixed, randomize only its order. */
const exact4 = new Map([...dictionary].filter(([key]) => key.split(",").length === 4));
assert.equal(exact4.size, 2123);
const word4 = words.filter((w) => w.slots.length === 4);
const probabilityGroups = [[], [], []];
const hitGroups = [0, 0, 0];
const chapterSamples = [];
for (const word of word4) {
  const values = word.slots.map(([p, i]) => sourcePages[p][i]);
  const permutations = new Set();
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++)
    for (let k = 0; k < 4; k++) for (let l = 0; l < 4; l++) {
      if (new Set([i, j, k, l]).size < 4) continue;
      permutations.add([values[i], values[j], values[k], values[l]].join(","));
    }
  const compatible = [...permutations].filter((key) => exact4.has(key));
  const chance = compatible.length / permutations.size;
  const hit = exact4.has(values.join(","));
  const groupFlags = [true, word.rank < 15,
    chapterStarts.has(word.page) && word.rank < 15];
  groupFlags.forEach((selected, i) => {
    if (selected) {
      probabilityGroups[i].push(chance);
      if (hit) hitGroups[i]++;
    }
  });
  if (groupFlags[2] && compatible.length) {
    chapterSamples.push({page: physicalPage(word.page), rank: word.rank,
      originalHit: hit, anagramChance: chance});
  }
}
assert.deepEqual(probabilityGroups.map((x) => x.length), [513, 134, 22]);
assert.deepEqual(hitGroups, [5, 4, 3]);

/** Exact Poisson-binomial probability of at least k whole-word matches. */
function upperTail(probabilities, k) {
  const below = new Float64Array(k);
  below[0] = 1;
  for (const chance of probabilities) {
    for (let i = k - 1; i > 0; i--) {
      below[i] = below[i] * (1 - chance) + below[i - 1] * chance;
    }
    below[0] *= 1 - chance;
  }
  return 1 - below.reduce((a, b) => a + b, 0);
}
const conditional = probabilityGroups.map((probabilities, i) => ({
  sites: probabilities.length,
  expected: probabilities.reduce((a, b) => a + b, 0),
  observed: hitGroups[i],
  exactUpperTail: upperTail(probabilities, hitGroups[i])
}));
assert(Math.abs(conditional[2].exactUpperTail - 0.0008680555555554692) < 1e-10);
console.log("fixed-word-multiset exact anagram null", JSON.stringify({
  conditional, chapterSamples
}));
console.log("PASS: no plaintext assumed; only source-native literal whole words.");
