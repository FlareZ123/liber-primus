'use strict';

/**
 * SFT: test one source-frozen nonic (degree-nine) recurrence on both LP2 chapters
 * beginning with an independently marked nine-rune red heading.
 *
 * Run: node sims/lp2_nonic_two_red9_chapters_sft.cjs
 * Inputs: canonical LP2 corpus in resources/liber-primus/lp2-corpus.json.
 * No parameter fitting, key search, external dependencies or network calls.
 */
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const corpus = JSON.parse(
  readFileSync(join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8')
);

// Constant term through the X^8 term in the independently established monic
// irreducible factor X^9 + 12X^8 + 20X^7 + 10X^6 + 5X^5
//                     + X^4 + 9X^3 + 15X + 11 of the table polynomial.
const NONIC = [11, 15, 9, 0, 1, 5, 10, 20, 12];
const mod = (value) => ((value % 29) + 29) % 29;

/**
 * Compute the unique monic order-nine homogeneous recurrence from the printed
 * first nine red runes, with zero added phase or independently selected pad.
 * @param {number[]} seed Initial nine GP29 symbols.
 * @param {number} count Required output sequence length, including the seed.
 * @returns {number[]}
 */
function recurrence(seed, count) {
  assert.equal(seed.length, 9);
  const state = seed.slice();
  while (state.length < count) {
    let sum = 0;
    for (let j = 0; j < 9; j++) {
      sum += NONIC[j] * state[state.length - 9 + j];
    }
    state.push(mod(-sum));
  }
  return state;
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const index of values) counts[index]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

/** @param {number} first @param {number} last @returns {number[]} */
function chapter(first, last) {
  return corpus.pages
    .filter((page) => page.page >= first && page.page <= last)
    .flatMap((page) => page.indices);
}

assert.equal(corpus.runes.length, 29);
assert.equal(corpus.translit.length, 29);
const nativeP57 = chapter(57, 57);
assert.equal(nativeP57.length, 95);

const cases = [
  { first: 15, last: 22, length: 1903,
    seed: [0, 1, 20, 19, 24, 28, 26, 22, 24],
    expectedRaw: 0.034494896163322776,
    expectedSub: 0.034567413652588794 },
  { first: 54, last: 55, length: 308,
    seed: [24, 19, 21, 23, 27, 2, 14, 10, 19],
    expectedRaw: 0.033489708424053334,
    expectedSub: 0.03535274180153083 }
];

for (const test of cases) {
  const original = chapter(test.first, test.last);
  assert.equal(original.length, test.length);
  assert.deepEqual(original.slice(0, 9), test.seed);
  const key = recurrence(test.seed, original.length).slice(9);
  const cipher = original.slice(9);
  const decodedMinus = cipher.map((value, i) => mod(value - key[i]));
  const decodedPlus = cipher.map((value, i) => mod(value + key[i]));
  assert.deepEqual(decodedMinus.map((value, i) => mod(value + key[i])), cipher);
  assert.deepEqual(decodedPlus.map((value, i) => mod(value - key[i])), cipher);
  assert.ok(Math.abs(ioc(cipher) - test.expectedRaw) < 1e-12);
  assert.ok(Math.abs(ioc(decodedMinus) - test.expectedSub) < 1e-12);

  // Nontrivial, independently native plaintext plant with original source seed.
  const plantedKey = recurrence(test.seed, 9 + nativeP57.length).slice(9);
  const plantedCipher = nativeP57.map((value, i) => mod(value + plantedKey[i]));
  const recovered = plantedCipher.map((value, i) => mod(value - plantedKey[i]));
  assert.deepEqual(recovered, nativeP57);
  assert.ok(plantedCipher.some((value, i) => value !== nativeP57[i]));

  const output = {
    physicalPages: [test.first, test.last],
    exactRuneCount: original.length,
    keySource: 'first nine visually red runes; polynomial source pp49-51',
    coveredRuneCount: cipher.length,
    rawIoC: ioc(cipher),
    minusIoC: ioc(decodedMinus),
    plusIoC: ioc(decodedPlus),
    solvedP57PositiveControlIoC: ioc(nativeP57),
    solvedP57PlantExact: true,
    decodedMinusFirst80: decodedMinus.slice(0, 80)
      .map((symbol) => corpus.translit[symbol]).join(' ')
  };
  console.log(JSON.stringify(output, null, 2));
}

console.log('PASS: original source-invariants, two exact original inverses, two native positive plants.');
