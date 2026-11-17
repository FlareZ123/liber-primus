"use strict";
/**
 * Test layer ordering: an independent whole-word permutation *after*
 * nonrepeating encipherment versus a source-preserving word order.
 * Reproducer: node sims/lp2_postcipher_wholeword_shuffle_source_sft.cjs
 * Original 55 rune-bearing LP2 pages, 32 cross-page words excluded only
 * from page-local whole-token permutations; all other original words kept.
 * Read-only, deterministic Node22 CommonJS, no external dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const raw = fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8");
const runeIndex = new Map(corpus.runes.map((ch, i) => [ch, i]));
const sections = raw.split("%").slice(0, 55);
assert.equal(sections.length, 55);
const pages = Array.from({length: 55}, () => []);
const allWords = [];
let page = 0;
let firstPage = -1;
let lastRunePage = -1;
let current = [];
let runeCount = 0;
/** Complete an actual printed GP29 rune word. */
function flushWord() {
  if (!current.length) return;
  const word = {firstPage, lastRunePage,
    first: current[0], last: current[current.length - 1],
    length: current.length};
  allWords.push(word);
  if (firstPage === lastRunePage) pages[firstPage].push(word);
  current = [];
}
for (const ch of sections.join("%")) {
  if (runeIndex.has(ch)) {
    if (!current.length) firstPage = page;
    current.push(runeIndex.get(ch));
    lastRunePage = page;
    runeCount++;
  } else if (ch === "%") {
    page++;
  } else if (ch === "/" || /\s/u.test(ch)) {
    // Visual wrapping is explicitly not a word boundary.
  } else {
    // Punctuation, printed numerals, and true word separators finish words.
    flushWord();
  }
}
flushWord();
assert.equal(runeCount, 12956);
assert.equal(allWords.length, 2896);
assert.equal(allWords.filter(w => w.firstPage !== w.lastRunePage).length, 32);
assert.equal(pages.reduce((sum, a) => sum + a.length, 0), 2864);
/**
 * Compute exact mean under a uniform random permutation of complete
 * existing words separately on every physical page. In a page of N words,
 * a distinct ordered pair (u,v) is adjacent with probability 1/N.
 * @param {Array<Array<{first:number,last:number}>>} groups
 */
function shuffledMean(groups) {
  let result = 0;
  for (const group of groups) {
    const n = group.length;
    if (n < 2) continue;
    const starts = new Int32Array(29);
    const ends = new Int32Array(29);
    let sameWord = 0;
    for (const w of group) {
      starts[w.first]++;
      ends[w.last]++;
      if (w.first === w.last) sameWord++;
    }
    let unorderedProducts = 0;
    for (let j = 0; j < 29; j++) unorderedProducts += ends[j] * starts[j];
    result += (unorderedProducts - sameWord) / n;
  }
  return result;
}
/**
 * @param {Array<Array<{first:number,last:number}>>} groups
 * @returns {{pairs:number,equal:number}}
 */
function countEdges(groups) {
  let pairs = 0, equal = 0;
  for (const group of groups) {
    for (let i = 1; i < group.length; i++) {
      pairs++;
      if (group[i - 1].last === group[i].first) equal++;
    }
  }
  return {pairs, equal};
}
const actual = countEdges(pages);
const expectation = shuffledMean(pages);
assert.deepEqual(actual, {pairs: 2809, equal: 23});
assert.ok(Math.abs(expectation - 97.48224317886164) < 1e-10);
/** Fixed-seed xorshift32. */
function rng(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}
/** Null reshuffles complete original ciphertext word tokens within pages. */
function simulate(groups, iterations, seed) {
  const next = rng(seed);
  const indices = groups.map(group => group.map((_, i) => i));
  const scores = [];
  for (let round = 0; round < iterations; round++) {
    let equal = 0;
    for (let p = 0; p < groups.length; p++) {
      const group = groups[p];
      const ix = indices[p];
      for (let i = ix.length - 1; i > 0; i--) {
        const j = next() % (i + 1);
        [ix[i], ix[j]] = [ix[j], ix[i]];
      }
      for (let i = 1; i < ix.length; i++) {
        if (group[ix[i - 1]].last === group[ix[i]].first) equal++;
      }
    }
    scores.push(equal);
  }
  return scores.sort((a, b) => a - b);
}
const simulationCount = 20000;
const trials = simulate(pages, simulationCount, 0x33011711);
const simulatedMean = trials.reduce((a, b) => a + b, 0) / simulationCount;
assert.equal(trials[0], 60);
assert.equal(trials.at(-1), 136);
assert.ok(Math.abs(simulatedMean - 97.61035) < 1e-8);
assert.equal(trials.filter(n => n <= actual.equal).length, 0);
// Synthetic source-shaped positive: generate strictly no-repeat 29-rune
// ciphertext across all complete words in each page *before* post-encipher
// token shuffling. It produces zero unshuffled cross-word collisions and
// the shuffled output returns to the random-endpoint baseline.
const plantRng = rng(0x5a170330);
const plant = pages.map(group => {
  let last = plantRng() % 29;
  return group.map(word => {
    let first = -1;
    for (let i = 0; i < word.length; i++) {
      const rank = plantRng() % 28;
      const current = rank + (rank >= last ? 1 : 0);
      if (i === 0) first = current;
      last = current;
    }
    return {first, last};
  });
});
assert.equal(countEdges(plant).pairs, actual.pairs);
assert.equal(countEdges(plant).equal, 0);
const plantExpect = shuffledMean(plant);
assert.ok(plantExpect > 80 && plantExpect < 120);
const permutedPlant = simulate(plant, 400, 0x5a171104);
assert.ok(permutedPlant[200] > 60);
console.log(JSON.stringify({
  original:{runes:runeCount,printedWords:allWords.length,
    crossPageWords:32,wholeWordsUsed:2864,
    pageInternalWholeWordEdges:actual.pairs,
    consecutiveIdenticalAtWordEdges:actual.equal},
  postCipherIndependentWholeWordShuffle:{
    exactConditionalExpectation:expectation,
    iterations:simulationCount,
    seed:"0x33011711",
    mean:simulatedMean,
    min:trials[0],
    percentile01:trials[200],
    median:trials[10000],
    max:trials.at(-1),
    trialsAtOrBelowOriginal:0,
    empiricalTailBound:"p < 1/20001 for observed or lower (+1 correction)"
  },
  independentPositive:{
    strictlyAntiRepeatPlantedUnshuffled:0,
    predictedShuffledEqualEdges:plantExpect,
    shuffledPlantMedian:permutedPlant[200]
  }
}, null, 2));
