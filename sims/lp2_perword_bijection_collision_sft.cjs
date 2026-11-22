"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const CORPUS = require("../resources/liber-primus/lp2-corpus.json");

const ROOT = path.join(__dirname, "..");
const SOURCES = [
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"],
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"]
];

const runeIndex = new Map(CORPUS.runes.map((rune, index) => [rune, index]));
const gpTokens = CORPUS.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);

/** Encode source English in the solved pages' orthographic GP29 register.
 * @param {string} word
 * @returns {number[] | null}
 */
function encodeNative(word) {
  const normalized = word.toUpperCase().replace(/[VKZQ]/g, character =>
    ({V: "U", K: "C", Z: "S", Q: "C"})[character]);
  const result = [];
  for (let i = 0; i < normalized.length;) {
    const match = gpTokens.find(({token}) => normalized.startsWith(token, i));
    if (!match) return null;
    result.push(match.index);
    i += match.token.length;
  }
  return result;
}

/** @param {string} filename */
function sourceWords(filename) {
  const text = fs.readFileSync(path.join(ROOT, filename), "utf8");
  return (text.match(/[A-Za-z]+/g) || []).map(encodeNative).filter(Boolean);
}

/** Invariant under any single bijection and any permutation inside each word.
 * @param {number[]} word
 */
function wordStats(word) {
  let pairs = 0;
  let adjacent = 0;
  for (let i = 0; i < word.length; i++) {
    for (let j = i + 1; j < word.length; j++) {
      if (word[i] === word[j]) {
        pairs++;
        if (j === i + 1) adjacent++;
      }
    }
  }
  return {pairs, adjacent};
}

/** @param {number[][]} words */
function sumStats(words) {
  let pairs = 0;
  let adjacent = 0;
  let possible = 0;
  for (const word of words) {
    const s = wordStats(word);
    pairs += s.pairs;
    adjacent += s.adjacent;
    possible += word.length * (word.length - 1) / 2;
  }
  return {words: words.length, pairs, adjacent, possible};
}

/** @param {number} seed */
function generator(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/** @param {number[]} values @param {() => number} rnd */
function shuffle(values, rnd) {
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}

/** Independent word-length-conditioned, source-native controls.
 * @param {number[][]} originals
 * @param {number[][]} reference
 * @param {() => number} rnd
 * @param {boolean} noAdjacent
 */
function controls(originals, reference, rnd, noAdjacent) {
  const selected = noAdjacent
    ? originals.filter(word => wordStats(word).adjacent === 0)
    : originals;
  const byLength = new Map();
  for (const word of reference) {
    if (noAdjacent && wordStats(word).adjacent !== 0) continue;
    if (!byLength.has(word.length)) byLength.set(word.length, []);
    byLength.get(word.length).push(word);
  }
  for (const word of selected) {
    assert.ok(byLength.get(word.length)?.length,
      "Missing native GP word-length/adjacency control pool");
  }
  const values = [];
  for (let draw = 0; draw < 1000; draw++) {
    let pairs = 0;
    for (const word of selected) {
      const pool = byLength.get(word.length);
      pairs += wordStats(pool[Math.floor(rnd() * pool.length)]).pairs;
    }
    values.push(pairs);
  }
  const total = values.reduce((a, b) => a + b, 0);
  return {min: Math.min(...values), max: Math.max(...values),
    mean: total / values.length, atOrBelowOriginal: values.filter(value =>
      value <= sumStats(selected).pairs).length, draws: values.length};
}

/** Synthetic positive control: fresh unknown GP29 substitution and arbitrary
 * in-word transposition for EACH word, invert without ambiguity.
 * @param {number[][]} words
 */
function plantedPerWordCipher(words) {
  const rnd = generator(0x3301cafe);
  let plainPairs = 0;
  let cipherPairs = 0;
  let runeCount = 0;
  for (const plain of words) {
    const alphabet = shuffle(Array.from({length: 29}, (_, i) => i), rnd);
    const order = shuffle(Array.from({length: plain.length}, (_, i) => i), rnd);
    const cipher = order.map(position => alphabet[plain[position]]);
    const inverse = new Array(29);
    alphabet.forEach((value, index) => { inverse[value] = index; });
    const recovered = new Array(plain.length);
    order.forEach((position, j) => { recovered[position] = inverse[cipher[j]]; });
    assert.deepEqual(recovered, plain);
    plainPairs += wordStats(plain).pairs;
    cipherPairs += wordStats(cipher).pairs;
    runeCount += plain.length;
  }
  assert.equal(plainPairs, cipherPairs,
    "Per-word secret bijections plus transpositions must preserve all equal pairs");
  return {recoveredRunes: runeCount, preservedEqualPairs: plainPairs,
    distinctSecretAlphabets: words.length};
}

function main() {
  const parsed = parseSharedCorpus();
  const original = parsed.words.map(({runes}) => [...runes].map(rune => {
    const index = runeIndex.get(rune);
    assert.notEqual(index, undefined);
    return index;
  }));
  assert.equal(original.length, 2896);
  assert.equal(parsed.runeCount, 12956);
  const observed = sumStats(original);
  assert.deepEqual(observed, {words: 2896, pairs: 811, adjacent: 63,
    possible: 30281});

  const noAdjacentOriginal = original.filter(word => wordStats(word).adjacent === 0);
  const observedConditional = sumStats(noAdjacentOriginal);
  assert.equal(observedConditional.words, 2834);
  assert.equal(observedConditional.pairs, 731);
  assert.equal(observedConditional.adjacent, 0);

  // A new control absent from the established all-pairs/independent-word gate:
  // match absence of adjacent equal symbols BEFORE testing nonadjacent pairs.
  const conditionalRng = generator(0x42c12577);
  const results = [];
  for (const [name, filename] of SOURCES) {
    const source = sourceWords(filename);
    const noAdjacent = controls(original, source, conditionalRng, true);
    assert.equal(noAdjacent.atOrBelowOriginal, 0,
      name + " no-adjacent-repeat matched-length control");
    results.push({name, nativeWords: source.length, matchedNoAdjacent: noAdjacent});
  }

  const gibran = sourceWords(SOURCES[0][1]);
  const byLength = new Map();
  for (const word of gibran) {
    if (!byLength.has(word.length)) byLength.set(word.length, []);
    byLength.get(word.length).push(word);
  }
  const plantRng = generator(0x2014abcd);
  const plant = original.map(word => {
    const pool = byLength.get(word.length);
    return pool[Math.floor(plantRng() * pool.length)];
  });
  assert.equal(plant.reduce((n, word) => n + word.length, 0), 12956);
  const positive = plantedPerWordCipher(plant);

  console.log(JSON.stringify({observed, observedConditional, results, positive}, null, 2));
  console.log("PASS: 2,834 source words with no adjacent identical GP runes still" +
    " contain only 731 nonadjacent equality pairs, below all 3,000 equally" +
    " conditioned and word-length-matched native GP29 controls.");
}

main();
