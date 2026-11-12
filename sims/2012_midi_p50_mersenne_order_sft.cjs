#!/usr/bin/env node
"use strict";

/**
 * SFT: a newly observed source-ordered 0,1,3,7 Mersenne-index subset
 * inside the archived 2012 MIDI 49-word list under the already frozen,
 * **unselected** GP-prime-sum/base58 LP2 p50 address hypothesis.
 *
 * Run from repository root:
 *   node sims/2012_midi_p50_mersenne_order_sft.cjs
 *
 * The event was discovered post hoc. Null tails are conditional and
 * cannot authenticate that the 2012 list is an LP2 key.
 */
const fs = require("node:fs");
const assert = require("node:assert/strict");
const read = (path) => fs.readFileSync(path, "utf8");
const words = read("resources/historical/cicada2012-midi-49-words.txt")
  .trim().split(/\s+/u);
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const tokens = corpus.translit
  .map((token, index) => ({token: token.toLowerCase(), index}))
  .sort((a, b) => b.token.length - a.token.length);

/** @param {string} word */
function encode(word) {
  const normalized = word.toLowerCase()
    .replaceAll("q", "cw").replaceAll("v", "u")
    .replaceAll("k", "c").replaceAll("z", "s");
  const indices = [];
  for (let i = 0; i < normalized.length;) {
    const match = tokens.find(({token}) => normalized.startsWith(token, i));
    if (!match) return null;
    indices.push(match.index);
    i += match.token.length;
  }
  return indices;
}

/** @param {number[]} indices @param {number[]} weights */
function gpSum(indices, weights) {
  let result = 0;
  for (const index of indices) result += weights[index];
  return result;
}

assert.equal(words.length, 49);
const wordIndices = words.map((word) => {
  const indices = encode(word);
  assert.ok(indices, "Unmapped GP input: " + word);
  return indices;
});
const sums = wordIndices.map((ids) => gpSum(ids, corpus.prime));
const selected = ["hook", "knot", "boat", "umbrella"];
const selectedLocations = selected.map((word) => {
  const index = words.indexOf(word);
  const sum = sums[index];
  return {word, ordinal: index + 1, sum,
    page: sum % 58, cell: Math.floor(sum / 58)};
});
assert.deepEqual(selectedLocations.map((x) => [x.ordinal, x.sum, x.page, x.cell]), [
  [10, 50, 50, 0], [14, 108, 50, 1],
  [16, 224, 50, 3], [42, 456, 50, 7]
]);
assert.deepEqual(selectedLocations.map((x) => x.sum), [50, 108, 224, 456]);
assert(selectedLocations.slice(1).every((x, i) =>
  x.sum === 2 * selectedLocations[i].sum + 8));
const other = words.map((word, index) => ({word, ordinal: index + 1,
  sum: sums[index], page: sums[index] % 58, cell: Math.floor(sums[index] / 58)}))
  .filter((x) => x.page === 50 && !selected.includes(x.word));
assert.deepEqual(other.map((x) => [x.word, x.ordinal, x.cell]), [["hammer", 8, 5]]);

const page50 = grid.pages.find((p) => p.page === 50);
assert.ok(page50 && page50.tokens.length === 104);
const chain = [0, 1, 3, 7, 15, 31, 63];
assert.deepEqual(chain.map((i) => page50.tokens[i]),
  ["2M", "0w", "3D", "15", "0Z", "1t", "2W"]);
assert.deepEqual(chain.map((i) => page50.bytes[i]),
  [142, 58, 193, 65, 35, 115, 152]);
assert.equal(page50.tokens[127], undefined);
console.log("Original source-ordered chain: " + JSON.stringify(selectedLocations));
console.log("Unfitted following original p50 table values: "
  + JSON.stringify(chain.map((i) => [i, page50.tokens[i], page50.bytes[i]])));

/** @param {number[]} generated */
function pathExists(generated) {
  const progress = new Uint8Array(58);
  const cells = new Uint8Array(58);
  const required = [0, 1, 3, 7];
  for (const sum of generated) {
    const page = sum % 58;
    const cell = Math.floor(sum / 58);
    const bit = required.indexOf(cell);
    if (bit >= 0) cells[page] |= (1 << bit);
    if (progress[page] < 4 && required[progress[page]] === cell) progress[page]++;
  }
  const outcome = {
    orderedPage50: progress[50] === 4,
    unorderedPage50: cells[50] === 15,
    orderedSomePage: false,
    unorderedSomePage: false
  };
  for (let page = 0; page < 58; page++) {
    if (progress[page] === 4) outcome.orderedSomePage = true;
    if (cells[page] === 15) outcome.unorderedSomePage = true;
  }
  return outcome;
}
assert.deepEqual(pathExists(sums), {
  orderedPage50: true, unorderedPage50: true,
  orderedSomePage: true, unorderedSomePage: true
});

/** @param {number} initial */
function random(initial) {
  let seed = initial >>> 0;
  return function next() {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return seed >>> 0;
  };
}
const draw = random(0x20124352);
/** @returns {Record<string,number>} */
function newTotals() {
  return {orderedPage50: 0, unorderedPage50: 0,
    orderedSomePage: 0, unorderedSomePage: 0};
}
/** @param {Record<string,number>} totals @param {ReturnType<typeof pathExists>} result */
function count(totals, result) {
  for (const key of Object.keys(totals)) if (result[key]) totals[key]++;
}
const primeTrials = 400000;
const primeCounts = newTotals();
for (let trial = 0; trial < primeTrials; trial++) {
  const weights = corpus.prime.slice();
  for (let i = weights.length - 1; i > 0; i--) {
    const j = draw() % (i + 1);
    [weights[i], weights[j]] = [weights[j], weights[i]];
  }
  count(primeCounts, pathExists(wordIndices.map((ids) => gpSum(ids, weights))));
}
assert.deepEqual(primeCounts, {
  orderedPage50: 2, unorderedPage50: 5,
  orderedSomePage: 5, unorderedSomePage: 55
});
console.log("400000 randomized prime-label controls: " + JSON.stringify(primeCounts));

// Two finite lexical controls: keep source word lengths or GP-rune lengths,
// preserve duplicate source words and original 49-word order.
const lexicon = read("resources/control/english_wordfreq_textblob.txt").split("\n")
  .filter((line) => /^[a-z]+ [0-9]+$/u.test(line))
  .map((line) => {
    const word = line.split(" ")[0];
    const indices = encode(word);
    return indices ? {letters: word.length, runes: indices.length,
      sum: gpSum(indices, corpus.prime)} : null;
  }).filter(Boolean);
assert.equal(lexicon.length, 29157);
const distinct = [...new Set(words)];
const sourceProfiles = distinct.map((word) => ({
  letters: word.length, runes: encode(word).length
}));
const sourceIndices = words.map((word) => distinct.indexOf(word));
for (const mode of ["letters", "runes"]) {
  const bins = new Map();
  for (const item of lexicon) {
    if (!bins.has(item[mode])) bins.set(item[mode], []);
    bins.get(item[mode]).push(item.sum);
  }
  const trials = 250000;
  const totals = newTotals();
  for (let trial = 0; trial < trials; trial++) {
    const assigned = sourceProfiles.map((profile) => {
      const bin = bins.get(profile[mode]);
      assert.ok(bin);
      return bin[draw() % bin.length];
    });
    count(totals, pathExists(sourceIndices.map((index) => assigned[index])));
  }
  assert.deepEqual(totals, mode === "letters"
    ? {orderedPage50: 1, unorderedPage50: 10,
      orderedSomePage: 1, unorderedSomePage: 50}
    : {orderedPage50: 1, unorderedPage50: 5,
      orderedSomePage: 3, unorderedSomePage: 44});
  console.log("250000 source-" + mode + "-matched lexical controls: "
    + JSON.stringify(totals));
}
console.log("SFT PASS: exact 2012 source-order Mersenne addresses, finite nulls and source cells.");
