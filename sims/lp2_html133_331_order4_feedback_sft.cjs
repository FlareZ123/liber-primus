'use strict';

/**
 * Source-pinned test of the order-four GF29 residues 133/331 in the 2014
 * Onion7 HTML wrapper. No secret key, external network, or fitted phase.
 * Reproduce with Node.js and the checked-in LP2/Shakespeare sources.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const reference = fs.readFileSync(path.join(root, 'resources/control/shakespeare_first300k.txt'), 'utf8');
const unknownPages = corpus.pages.filter((page) => page.page <= 55);
const original = unknownPages.flatMap((page) => page.indices);
assert.equal(original.length, 12956);
assert.equal(unknownPages.length, 55);
assert.equal(133 % 29, 17);
assert.equal(331 % 29, 12);
assert.equal(17 * 12 % 29, 1);
assert.equal(17 * 17 % 29, 28);
assert.equal(12 * 12 % 29, 28);
assert.equal((17 + 12) % 29, 0);

const residue = (x) => (x % 29 + 29) % 29;
const runeMap = new Map(corpus.translit.map((value, index) => [value, index]));

/** @param {string} text - English-control text; @returns {number[]} GP rune indices */
function normalize(text) {
  const letters = text.toUpperCase().replace(/[KQ]/g, 'C').replace(/V/g, 'U')
    .replace(/Z/g, 'S').replace(/[^A-Z]/g, '');
  const out = [];
  for (let i = 0; i < letters.length;) {
    const digraph = letters.slice(i, i + 2);
    if (runeMap.has(digraph)) {
      out.push(runeMap.get(digraph));
      i += 2;
    } else {
      out.push(runeMap.get(letters[i]));
      i++;
    }
  }
  return out;
}

const english = normalize(reference);
assert.ok(english.length > 200000);
const triple = new Uint32Array(29 ** 3);
const context = new Uint32Array(29 ** 2);
for (let i = 2; i < english.length; i++) {
  const contextId = english[i - 2] * 29 + english[i - 1];
  context[contextId]++;
  triple[contextId * 29 + english[i]]++;
}

/** @param {number[]} symbols - GP rune indices; @returns {number} smoothed trigram nats per rune */
function trigramScore(symbols) {
  let total = 0;
  for (let i = 2; i < symbols.length; i++) {
    const contextId = symbols[i - 2] * 29 + symbols[i - 1];
    total += Math.log((triple[contextId * 29 + symbols[i]] + 0.05) /
      (context[contextId] + 1.45));
  }
  return total / (symbols.length - 2);
}

/** @param {number[]} values - GP rune indices; @returns {number} coincidence probability */
function ioc(values) {
  const counts = new Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((total, count) => total + count * (count - 1), 0) /
    (values.length * (values.length - 1));
}

/**
 * @param {number} z - Inverse-residue parameter.
 * @param {'feedback'|'scaled_difference'} mode - Reversible predecessor operation.
 * @param {'book'|'page'} reset - Original manuscript boundaries.
 * @param {1|-1} sign - Output orientation.
 * @returns {number[]} decoded candidate.
 */
function predecessorDecoder(z, mode, reset, sign) {
  const result = [];
  let prior = 0;
  for (const page of unknownPages) {
    if (reset === 'page') prior = 0;
    for (const cipher of page.indices) {
      const value = mode === 'feedback' ? cipher - z * prior :
        z * (cipher - prior);
      result.push(residue(sign * value));
      prior = cipher;
    }
  }
  return result;
}

/**
 * @param {number} z - Order-four field unit.
 * @param {'multiplicative'|'additive'} mode - Cycle consumer.
 * @param {number} phase - Fixed cycle offset.
 * @param {1|-1} sign - Output orientation.
 * @returns {number[]} decoded candidate.
 */
function fourCycle(z, mode, phase, sign) {
  const power = [1, z, 28, residue(-z)];
  return original.map((cipher, index) => {
    const key = power[(index + phase) % 4];
    return residue(mode === 'multiplicative' ? sign * cipher * key :
      cipher + sign * key);
  });
}

const candidates = [];
for (const z of [12, 17]) {
  for (const mode of ['feedback', 'scaled_difference']) {
    for (const reset of ['book', 'page']) {
      for (const sign of [1, -1]) {
        const plain = predecessorDecoder(z, mode, reset, sign);
        candidates.push({label: `${mode}/${z}/${reset}/${sign}`, plain});
      }
    }
  }
  for (const mode of ['multiplicative', 'additive']) {
    for (let phase = 0; phase < 4; phase++) {
      for (const sign of [1, -1]) {
        const plain = fourCycle(z, mode, phase, sign);
        candidates.push({label: `${mode}/${z}/phase${phase}/${sign}`, plain});
      }
    }
  }
}
assert.equal(candidates.length, 64);

// Reversible planted English control for the principal frozen feedback equation.
const plant = english.slice(-4096);
const encoded = [];
let state = 0;
for (const plain of plant) {
  state = residue(plain + 17 * state);
  encoded.push(state);
}
const restored = encoded.map((cipher, index) =>
  residue(cipher - 17 * (index === 0 ? 0 : encoded[index - 1])));
assert.deepEqual(restored, plant);

const baseline = trigramScore(original);
const native = trigramScore(plant);
const scores = candidates.map(({ label, plain }) => ({
  label, score: trigramScore(plain), ioc: ioc(plain),
  first24: plain.slice(0, 24).map((rune) => corpus.translit[rune]).join(''),
})).sort((a, b) => b.score - a.score);

assert.ok(native > -3.5, `English positive-control score is ${native}`);
assert.ok(scores[0].score < -4.0, 'Possible plaintext requires inspection');
for (const row of scores) assert.ok(Number.isFinite(row.score));
console.log(JSON.stringify({
  source: 'original 2014 Onion7 title 133 and div id 331',
  derived: {residues: [17, 12], product: 1, squared: 28, additiveSum: 0},
  originalRunes: original.length,
  candidates: candidates.length,
  originalScore: baseline,
  englishPlantScore: native,
  plantRecovered: plant.length,
  best: scores.slice(0, 10),
  conclusion: 'No native-GP plaintext recovered by these exact 64 order-four consumers',
}, null, 2));
