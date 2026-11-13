"use strict";
/**
 * Exact terminal ciphertext two-word recurrence in the original LP2 register.
 *
 * Reproduction: node sims/lp2_terminal_bigram_crosslink_sft.cjs
 * Node.js 22, CommonJS, no external dependencies, read-only.
 *
 * Observed coincidence is independent of any proposed plaintext/key.
 * Null expectations are conditional models, not an authorial cipher proof.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus, physicalLP2Page} = require("./lp2_word_pages.cjs");
const ROOT = path.join(__dirname, "..");
/** @param {string} name */
const read = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const parsed = parseSharedCorpus();
const words = parsed.words.map(w => w.runes);
assert.equal(words.length, 2896);
assert.equal(parsed.runeCount, 12956);
const pages = gp.pages.filter(p => p.page < 56 && p.indices.length);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((sum, p) => sum + p.indices.length, 0), 12956);

const byRune = new Map(gp.runes.map((r, i) => [r, i]));
for (const word of words) assert([...word].every(r => byRune.has(r)));
const runeStarts = [];
let cursor = 0;
for (const word of words) {
  runeStarts.push(cursor);
  cursor += [...word].length;
}
assert.equal(cursor, 12956);

/** @param {string[]} tape */
function duplicatedWordPairs(tape) {
  const seen = new Map(), pairs = [];
  for (let i = 0; i + 1 < tape.length; i++) {
    const key = tape[i] + "-" + tape[i + 1];
    const matches = seen.get(key);
    if (matches) {
      for (const previous of matches) pairs.push([previous, i]);
      matches.push(i);
    } else seen.set(key, [i]);
  }
  return pairs;
}
const repeats = duplicatedWordPairs(words);
assert.deepEqual(repeats, [[1462, 2894]]);
const [earlier, terminal] = repeats[0];
const target = words[earlier] + "-" + words[earlier + 1];
assert.equal(target, "ᛞᛄᚢ-ᛒᛖᛁ");
assert.equal(target, words[terminal] + "-" + words[terminal + 1]);

/** @param {number} runePosition */
function locate(runePosition) {
  let offset = 0;
  for (const p of pages) {
    if (runePosition < offset + p.indices.length)
      return {page: p.page, localRuneOffset: runePosition - offset,
        globalRuneOffset: runePosition};
    offset += p.indices.length;
  }
  throw new RangeError("Outside original unsolved pages");
}
const occurrences = [earlier, terminal].map(wordIndex => {
  const loc = locate(runeStarts[wordIndex]);
  assert.equal(physicalLP2Page(parsed.words[wordIndex].startPage), loc.page);
  return {wordIndex, ...loc, wordLengths: [
    [...words[wordIndex]].length, [...words[wordIndex + 1]].length
  ]};
});
assert.deepEqual(occurrences.map(o =>
  [o.wordIndex, o.page, o.localRuneOffset, o.globalRuneOffset]),
  [[1462, 27, 28, 6555], [2894, 55, 70, 12950]]);
assert.equal(terminal, words.length - 2);
const repeatedRuneWordCounts = words.reduce((tally, word) => {
  tally.set(word, (tally.get(word) || 0) + 1);
  return tally;
}, new Map());
assert.equal(repeatedRuneWordCounts.get(words[earlier]), 2);
assert.equal(repeatedRuneWordCounts.get(words[earlier + 1]), 2);

/** Within-one-page identical n-grams, tested with exact original rune order.
 * @param {number} n
 */
function ciphertextCollisions(n) {
  const seen = new Map(), collisions = [];
  let offset = 0;
  for (const p of pages) {
    const seq = p.indices;
    for (let j = 0; j + n <= seq.length; j++) {
      const key = seq.slice(j, j + n).join(",");
      const prev = seen.get(key);
      if (prev) {
        for (const other of prev) {
          if (other.page !== p.page || j - other.local >= n)
            collisions.push({first: other, second: {page: p.page, local: j}});
        }
        prev.push({page: p.page, local: j});
      } else seen.set(key, [{page: p.page, local: j}]);
    }
    offset += seq.length;
  }
  return collisions;
}
const six = ciphertextCollisions(6);
const seven = ciphertextCollisions(7);
assert.deepEqual(six, [{
  first: {page: 27, local: 28},
  second: {page: 55, local: 70}
}]);
assert.equal(seven.length, 0);

/** @param {number} n @param {number} k */
function falling(n, k) {
  let result = 1;
  for (let i = 0; i < k; i++) result *= n - i;
  return result;
}
const classes = new Map();
for (const w of words) {
  const length = [...w].length;
  if (!classes.has(length)) classes.set(length, new Map());
  const counter = classes.get(length);
  counter.set(w, (counter.get(w) || 0) + 1);
}
/** @param {number} length @param {2|3|4} order */
function moment(length, order) {
  const counts = [...classes.get(length).values()];
  const total = counts.reduce((a, b) => a + b, 0);
  return counts.reduce((sum, n) => sum + falling(n, order), 0)
    / falling(total, order);
}
/** Chance that two ordered, nonoverlapping 2-word windows in the
 * same length class have exactly equal token types, under a shuffle
 * preserving each individual word type's inventory.
 * @param {number} length
 */
function sameLengthNonoverlap(length) {
  const f = [...classes.get(length).values()];
  const N = f.reduce((a, b) => a + b, 0);
  const F2 = f.reduce((sum, n) => sum + falling(n, 2), 0);
  const F2squared = f.reduce((sum, n) => sum + falling(n, 2) ** 2, 0);
  const F4 = f.reduce((sum, n) => sum + falling(n, 4), 0);
  return (F2 * F2 - F2squared + F4) / falling(N, 4);
}
const byShape = new Map();
for (let i = 0; i + 1 < words.length; i++) {
  const x = [...words[i]].length, y = [...words[i + 1]].length;
  const key = x + "," + y;
  if (!byShape.has(key)) byShape.set(key, []);
  byShape.get(key).push(i);
}
// Each source word is uniformly placed among the fixed slots of its
// corresponding word length. Slot counts and complete word inventory stay fixed.
let shuffledMeanAll = 0, shuffledMeanSixOrLonger = 0;
let iidMeanAll = 0, iidMeanSixOrLonger = 0;
let terminalUnconditionedBound = 0;
let threeThree = null;
for (const [shape, sites] of byShape) {
  const [a, b] = shape.split(",").map(Number);
  const n = sites.length;
  const totalPairs = n * (n - 1) / 2;
  const overlaps = a === b
    ? sites.filter((site, k) => k > 0 && sites[k - 1] === site - 1).length
    : 0;
  const pNon = a === b
    ? sameLengthNonoverlap(a)
    : moment(a, 2) * moment(b, 2);
  const pOver = a === b ? moment(a, 3) : 0;
  const mean = (totalPairs - overlaps) * pNon + overlaps * pOver;
  const iidMean = totalPairs / 29 ** (a + b);
  shuffledMeanAll += mean;
  iidMeanAll += iidMean;
  if (a + b >= 6) {
    shuffledMeanSixOrLonger += mean;
    iidMeanSixOrLonger += iidMean;
  }
  if (a === 3 && b === 3) {
    threeThree = {sites: n, overlappingWindows: overlaps,
      pNonoverlapTwoWindowsSame: pNon, meanPairs: mean};
    terminalUnconditionedBound = (n - 1) * pNon;
  }
}
assert.equal(threeThree.sites, 184);
assert.equal(threeThree.overlappingWindows, 36);
assert.ok(Math.abs(shuffledMeanSixOrLonger - 0.0000676538434737498) < 1e-12);
assert.ok(Math.abs(iidMeanSixOrLonger - 0.00003761000852900826) < 1e-12);
assert.ok(Math.abs(shuffledMeanAll - 0.012119600863420055) < 1e-12);

// Test the strongest literal reuse-key premise: 6 equal symbols are a fixed
// period in the original stream. Exclude those 6 fitted positions before
// examining all other possible aligned rune pairs.
const original = pages.flatMap(p => p.indices);
const lag = occurrences[1].globalRuneOffset - occurrences[0].globalRuneOffset;
assert.equal(lag, 6395);
let matching = 0, heldoutMatching = 0;
for (let i = 0; i + lag < original.length; i++) {
  const eq = original[i] === original[i + lag];
  if (eq) matching++;
  if ((i < 6555 || i >= 6561) && eq) heldoutMatching++;
}
assert.equal(matching, 199);
assert.equal(heldoutMatching, 193);
assert.equal(original.length - lag - 6, 6555);

// Detector positive: copy a distinct adjacent pair elsewhere and guarantee
// the same code discovers the new pair without knowing its rune values.
const plant = words.slice();
plant[2000] = words[1998];
plant[2001] = words[1999];
assert(duplicatedWordPairs(plant).some(([a, b]) =>
  a === 1998 && b === 2000));

console.log(JSON.stringify({
  classification: "Original-cipher structural cross-page anchor, no unknown plaintext",
  corpus: {pagesWithRunes: 55, runes: 12956, words: words.length,
    adjacentWordPairs: words.length - 1},
  exact: {runes: target, gp29Indices: [23, 11, 1, 17, 18, 10],
    transliteration: "DJU-BEI", occurrences,
    distinctExactTwoWordCollisions: repeats.length,
    withinPageSixRuneCollisions: six,
    withinPageSevenRuneCollisionCount: seven.length},
  fixedWordLengthsIIDGP29: {
    expectedExactTwoWordCollisions: iidMeanAll,
    expectedAtLeastSixRunes: iidMeanSixOrLonger,
    upperBoundProbabilityAnyAtLeastSix: iidMeanSixOrLonger
  },
  exactWordInventoryLengthSlotShuffle: {
    expectedExactTwoWordCollisions: shuffledMeanAll,
    expectedAtLeastSixRunes: shuffledMeanSixOrLonger,
    upperBoundProbabilityAnyAtLeastSix: shuffledMeanSixOrLonger,
    threeThree, terminalMatchUnionBound: terminalUnconditionedBound
  },
  reusedClockLag: {
    lag, matchedAll: matching, pairCount: original.length - lag,
    knownMatchedExcluded: 6, matchedHeldout: heldoutMatching,
    pairsHeldout: 6555, heldoutAgreement: heldoutMatching / 6555,
    uniformChanceAgreement: 1 / 29
  },
  positiveControl: "Independent transplanted 2-word phrase detected",
  interpretation: "Single exact terminal callback is a candidate source-selected crib anchor. No evidence for a book-wide fixed-lag copied key state."
}, null, 2));
