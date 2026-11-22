"use strict";

const assert = require("node:assert/strict");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const corpus = require("../resources/liber-primus/lp2-corpus.json");

/**
 * Exclude the direct GP29 word-preserving Fibonacci recurrence pad at original
 * source-visible p15–p22, allowing every unknown two-state seed and both signs.
 * The 16-cell p15 grid explains Fibonacci as a source hypothesis but does
 * not assert that the author used this particular decipherment operation.
 */

const CHAPTER_START = 3603;
const CHAPTER_END = 5506;
const GP_A = 24;
const GP_I = 10;
const PRIME = 29;

/** @param {number} x */
function modulo(x) {
  return (x % PRIME + PRIME) % PRIME;
}

/**
 * @param {number} first
 * @param {number} second
 * @param {number} length
 * @returns {number[]}
 */
function fibonacciPad(first, second, length) {
  assert.ok(Number.isInteger(first) && first >= 0 && first < PRIME);
  assert.ok(Number.isInteger(second) && second >= 0 && second < PRIME);
  const stream = Array.from({length}, () => 0);
  stream[0] = first;
  stream[1] = second;
  for (let i = 2; i < length; i++) {
    stream[i] = (stream[i - 1] + stream[i - 2]) % PRIME;
  }
  return stream;
}

/**
 * @param {number[]} ciphertext
 * @param {{position:number, value:number}[]} singletons
 * @param {number} start
 * @param {number} end
 */
function singletonTest(ciphertext, singletons, start, end) {
  const local = singletons.filter(item => item.position >= start && item.position < end);
  let max = 0;
  let maxIncludingO = 0;
  let chosen = null;
  let exact = 0;
  const distribution = new Array(local.length + 1).fill(0);

  for (let a = 0; a < PRIME; a++) {
    for (let b = 0; b < PRIME; b++) {
      const key = fibonacciPad(a, b, end - start);
      for (const sign of [-1, +1]) {
        let matches = 0, matchesWithO = 0;
        for (const singleton of local) {
          const result = modulo(ciphertext[singleton.position] +
            sign * key[singleton.position - start]);
          if (result === GP_A || result === GP_I) matches++;
          if (result === GP_A || result === GP_I || result === 3) matchesWithO++;
        }
        distribution[matches]++;
        if (matches > max) {
          max = matches;
          chosen = {seed: [a, b], sign};
        }
        maxIncludingO = Math.max(maxIncludingO, matchesWithO);
        if (matches === local.length) exact++;
      }
    }
  }
  return {start, end, runes: end - start, singletonCount: local.length,
    maximumAI: max, maximumAIO: maxIncludingO, exactKeys: exact,
    totalKeys: PRIME * PRIME * 2, best: chosen, distribution};
}

function main() {
  const parsed = parseSharedCorpus();
  assert.equal(parsed.words.length, 2896);
  assert.equal(parsed.runeCount, 12956);
  const ciphertext = corpus.pages.filter(page => page.page <= 55)
    .flatMap(page => page.indices);
  assert.equal(ciphertext.length, 12956);
  const singletons = [];
  let offset = 0;
  for (const word of parsed.words) {
    if (word.length === 1) {
      singletons.push({position: offset, value: corpus.runes.indexOf(word.runes)});
    }
    offset += word.length;
  }
  assert.equal(offset, 12956);
  assert.equal(singletons.length, 83);
  for (const {position, value} of singletons) {
    assert.equal(ciphertext[position], value);
  }

  const selected = singletonTest(
    ciphertext, singletons, CHAPTER_START, CHAPTER_END);
  assert.equal(selected.singletonCount, 18);
  assert.equal(selected.maximumAI, 5);
  assert.equal(selected.maximumAIO, 6);
  assert.equal(selected.exactKeys, 0);
  assert.deepEqual(selected.best, {seed: [3, 7], sign: -1});

  const wholeBook = singletonTest(ciphertext, singletons, 0, ciphertext.length);
  assert.equal(wholeBook.maximumAI, 15);
  assert.equal(wholeBook.exactKeys, 0);

  // Synthetic positive control: an actual Fibonacci-keyed GP29 chapter,
  // with the original singleton positions fixed to plaintext A and I,
  // must recover all those singleton tokens under its known inverse.
  const plantPlain = ciphertext.slice(CHAPTER_START, CHAPTER_END);
  const relevant = singletons.filter(x =>
    x.position >= CHAPTER_START && x.position < CHAPTER_END);
  for (let i = 0; i < relevant.length; i++) {
    plantPlain[relevant[i].position - CHAPTER_START] = i % 2 ? GP_I : GP_A;
  }
  const plantedKey = fibonacciPad(3, 7, plantPlain.length);
  const plantCipher = plantPlain.map((x, i) => modulo(x + plantedKey[i]));
  const recovered = plantCipher.map((x, i) => modulo(x - plantedKey[i]));
  assert.deepEqual(recovered, plantPlain);
  assert.equal(relevant.filter(({position}) =>
    [GP_A, GP_I].includes(recovered[position - CHAPTER_START])).length, 18);
  const plantedFull = ciphertext.slice();
  plantedFull.splice(CHAPTER_START, plantCipher.length, ...plantCipher);
  const plantedSingletons = relevant.map(({position}) => ({
    position, value: plantedFull[position]
  }));
  const plantSearch = singletonTest(
    plantedFull, plantedSingletons, CHAPTER_START, CHAPTER_END);
  assert.equal(plantSearch.maximumAI, 18);
  assert.equal(plantSearch.exactKeys, 2,
    "The same key has an equivalent opposite-sign seed pair");

  console.log(JSON.stringify({
    hypothesis: "Direct symbolwise GP29 +/- Fibonacci recurrence pad, " +
      "arbitrary two-symbol initial state and either sign, printed words preserved",
    source: "original p15 4x4 Fibonacci prime-index spiral; p15–22 visible chapter",
    chapter: selected,
    whole_book_control: wholeBook,
    positive_plant: {recoveredRunes: recovered.length,
      recoveredSyntheticSingletons: relevant.length,
      allKeySingletonControl: plantSearch},
    decision: "0 exact keys; direct Fibonacci recurrence fails the A/I singleton " +
      "necessary condition. No original plaintext or key recovered."
  }, null, 2));
}

main();
