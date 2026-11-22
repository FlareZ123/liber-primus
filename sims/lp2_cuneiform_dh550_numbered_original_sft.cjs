'use strict';

/**
 * Source-locked direct DH-orbit test for LP2's five numbered passages.
 * Run with Node.js 22. Reads only the committed canonical numeric corpus.
 * This tests a hypothesis, not a Cicada-authenticated decryption method.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8',
));
const pages = new Map(corpus.pages.map((page) => [page.page, page.indices]));
const passages = [
  pages.get(36).slice(99, 238),
  pages.get(37).slice(0, 91),
  pages.get(37).slice(91, 189),
  pages.get(37).slice(189, 228).concat(pages.get(38).slice(0, 57)),
  pages.get(38).slice(57, 186),
];
assert.deepEqual(passages.map((part) => part.length), [139, 91, 98, 96, 129]);
assert.equal(passages.flat().length, 553);
assert.equal(pages.get(57).length, 95);
assert.equal(pages.get(50).length, 0);

const MODULUS = 3301;
const BASE = 1033;
const orbit = [];
let state = 1;
do {
  assert.ok(!orbit.includes(state), 'unexpected short or noninjective orbit');
  orbit.push(state);
  state = (state * BASE) % MODULUS;
} while (state !== 1);
assert.equal(orbit.length, 550);
assert.equal(orbit[0], 1);
assert.equal(orbit[1], 1033);

const phi = Array.from({ length: MODULUS }, (_, i) => i);
for (let p = 2; p < MODULUS; p++) {
  if (phi[p] === p) {
    for (let m = p; m < MODULUS; m += p) {
      phi[m] -= phi[m] / p;
    }
  }
}

/** @param {number} x @returns {number} */
function mod29(x) {
  return ((x % 29) + 29) % 29;
}

/** @param {number[]} data @returns {number} */
function ioc(data) {
  const counts = Array(29).fill(0);
  for (const rune of data) counts[rune]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0)
    / (data.length * (data.length - 1));
}

/**
 * @typedef {{kind: 'value' | 'totient', first: 0 | 1,
 *   clock: 'continuous' | 'numbered', visibleFSkip: boolean, sign: -1 | 1}} Model
 */

/**
 * Decodes under a fixed direct-orbit candidate.
 * 'visibleFSkip' assumes *every* ciphertext F is a literal plaintext F,
 * which is only a conditional convention, not the full historical p56 rule.
 * @param {number[][]} inputs
 * @param {Model} model
 * @returns {number[]}
 */
function decode(inputs, model) {
  let step = model.first;
  const out = [];
  for (const part of inputs) {
    if (model.clock === 'numbered') step = model.first;
    for (const rune of part) {
      if (model.visibleFSkip && rune === 0) {
        out.push(0);
        continue;
      }
      const value = orbit[step % orbit.length];
      const shift = mod29(model.kind === 'value' ? value : phi[value]);
      out.push(mod29(rune + model.sign * shift));
      step++;
    }
  }
  return out;
}

/**
 * Positive-control encoder. For the all-visible-F heuristic, change only
 * planted letters that would otherwise encrypt to F: such positions would
 * be ambiguous because historical p56 lets encrypted non-F also emit F.
 * Return the exact planted plaintext after these minimal collision repairs.
 * @param {number[][]} plaintextPassages
 * @param {Model} model
 * @returns {{ciphertext: number[][], adjustedPlaintext: number[]}}
 */
function plantEncode(plaintextPassages, model) {
  let step = model.first;
  const ciphertext = [];
  const adjustedPlaintext = [];
  for (const part of plaintextPassages) {
    if (model.clock === 'numbered') step = model.first;
    const outputPart = [];
    for (const originalRune of part) {
      if (model.visibleFSkip && originalRune === 0) {
        outputPart.push(0);
        adjustedPlaintext.push(0);
        continue;
      }
      const value = orbit[step % orbit.length];
      const shift = mod29(model.kind === 'value' ? value : phi[value]);
      let plaintext = originalRune;
      let encoded = mod29(plaintext - model.sign * shift);
      if (model.visibleFSkip) {
        while (plaintext === 0 || encoded === 0) {
          plaintext = (plaintext + 1) % 29;
          encoded = mod29(plaintext - model.sign * shift);
        }
      }
      outputPart.push(encoded);
      adjustedPlaintext.push(plaintext);
      step++;
    }
    ciphertext.push(outputPart);
  }
  return { ciphertext, adjustedPlaintext };
}

const original = passages.flat();
const models = [];
for (const kind of ['value', 'totient']) {
  for (const first of [0, 1]) {
    for (const clock of ['continuous', 'numbered']) {
      for (const visibleFSkip of [false, true]) {
        for (const sign of [-1, 1]) {
          models.push({ kind, first, clock, visibleFSkip, sign });
        }
      }
    }
  }
}
assert.equal(models.length, 32);
const solved = pages.get(57);
const positive = Array.from({ length: original.length }, (_, i) => solved[i % solved.length]);
const positivePassages = [];
let offset = 0;
for (const part of passages) {
  positivePassages.push(positive.slice(offset, offset + part.length));
  offset += part.length;
}
const rows = [];
for (const model of models) {
  const candidate = decode(passages, model);
  const candidateIoc = ioc(candidate);
  const plant = plantEncode(positivePassages, model);
  assert.deepEqual(decode(plant.ciphertext, model), plant.adjustedPlaintext);
  if (!model.visibleFSkip) {
    assert.deepEqual(plant.adjustedPlaintext, positive);
  }
  rows.push({ ...model, ioc: candidateIoc });
}
rows.sort((a, b) => b.ioc - a.ioc);
assert.ok(rows[0].ioc <= 0.03614 && rows[0].ioc >= 0.03613);
assert.equal(rows[0].kind, 'totient');
assert.equal(rows[0].first, 0);
assert.equal(rows[0].clock, 'continuous');
assert.equal(rows[0].visibleFSkip, true);
assert.equal(rows[0].sign, 1);
assert.ok(ioc(positive) > 0.06);
console.log(JSON.stringify({
  source: { length: original.length, passages: passages.map(p => p.length),
    generator: BASE, modulus: MODULUS, order: orbit.length, ioc: ioc(original) },
  models: rows.length,
  best: rows.slice(0, 3),
  worst: rows[rows.length - 1],
  plantedLanguageIoc: ioc(positive),
  status: 'PASS: all 32 original inverses scored; native-p57 positive plants recovered',
}, null, 2));
