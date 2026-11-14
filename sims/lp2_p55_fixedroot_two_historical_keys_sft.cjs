'use strict';

/**
 * LP2 p55 fixed-point quotient: one exact two-known-historical-operator
 * composition gate. Source-link premise: LP1 p05 wisdom/totient is drawn
 * again on p55; LP2 p22 mirrors the LP1 p14-16 solved koan with key
 * FIRFUMFERENFE. The putative p55 roots 5 and 22 are postselected.
 *
 * Run: node sims/lp2_p55_fixedroot_two_historical_keys_sft.cjs
 * Node.js 22, standalone CommonJS, zero external dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const blocks = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8').split('%');
const glyph = new Map(corpus.runes.map((rune, ordinal) => [rune, ordinal]));
const mod = (n) => (n % 29 + 29) % 29;

/** @param {string} text @returns {number[][]} */
function parseWords(text) {
  const words = [];
  let word = [];
  for (const ch of text) {
    if (glyph.has(ch)) word.push(glyph.get(ch));
    else if ('-.&$§'.includes(ch)) {
      if (word.length) words.push(word);
      word = [];
    }
  }
  if (word.length) words.push(word);
  return words;
}

const words = parseWords(blocks[54]); // runeless p50 shifts transcript indexing
const original = corpus.pages.find((page) => page.page === 55).indices;
assert.deepEqual(words.flat(), original);
assert.equal(original.length, 76);
const inside = words.flatMap((word) => word.slice(1, -1));
assert.equal(inside.length, 43);
const coefficients = [...inside];
coefficients[1] = mod(coefficients[1] - 1);
const factor = [23, 2, 1]; // (X-5)*(X-22) modulo29, ascending
const quotient = Array(41).fill(0);
for (let i = coefficients.length - 1; i >= 2; i--) {
  const a = coefficients[i];
  quotient[i - 2] = a;
  for (let j = 0; j < factor.length; j++) {
    coefficients[i - 2 + j] = mod(coefficients[i - 2 + j] - a * factor[j]);
  }
}
assert.ok(coefficients.every((value) => value === 0));
assert.deepEqual(quotient.slice(0, 10), [21,20,13,26,7,16,2,9,15,25]);

// Historical LP1 p14 solved key in original source GP29 indices.
const koan13 = [0, 10, 4, 0, 1, 19, 0, 18, 4, 18, 9, 0, 18];
assert.equal(koan13.map((value) => corpus.translit[value]).join(''), 'FIRFUMFERENFE');

/** @param {number} count @returns {number[]} */
function primes(count) {
  const result = [];
  for (let candidate = 2; result.length < count; candidate++) {
    let prime = true;
    for (let i = 2; i * i <= candidate; i++) {
      if (candidate % i === 0) { prime = false; break; }
    }
    if (prime) result.push(candidate);
  }
  return result;
}
const primeList = primes(100);

/**
 * Shift under source-known p56 phi-prime or LP1 p14 13-rune key.
 * Historical literal plaintext F carries through and does not advance
 * this operator's clock; an encrypted non-F may accidentally equal F.
 * @param {'phi'|'koan'} kind
 * @param {number} clock
 * @returns {number}
 */
function shift(kind, clock) {
  return kind === 'phi' ? primeList[clock] - 1 : koan13[clock % koan13.length];
}

/** @param {number[]} source @param {'phi'|'koan'} kind @returns {number[]} */
function encrypt(source, kind) {
  let clock = 0;
  return source.map((value) => value === 0 ? 0 : mod(value + shift(kind, clock++)));
}

/**
 * Exhaustive physically possible ciphertext-F branches for this operator.
 * @param {number[]} source
 * @param {'phi'|'koan'} kind
 * @returns {number[][]}
 */
function invert(source, kind) {
  /** @type {{plain:number[],clock:number}[]} */
  let states = [{ plain: [], clock: 0 }];
  for (const cipher of source) {
    /** @type {{plain:number[],clock:number}[]} */
    const next = [];
    for (const state of states) {
      if (cipher === 0) next.push({ plain: [...state.plain, 0], clock: state.clock });
      const clear = mod(cipher - shift(kind, state.clock));
      if (clear !== 0) next.push({
        plain: [...state.plain, clear], clock: state.clock + 1
      });
    }
    states = next;
  }
  return states.map((state) => state.plain);
}

/** @param {number[]} source @returns {number} */
function indexOfCoincidence(source) {
  const counts = Array(29).fill(0);
  for (const value of source) counts[value]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0)
    / (source.length * (source.length - 1));
}
const native = corpus.pages.find((page) => page.page === 57).indices.slice(0, 41);
assert.equal(native.length, 41);
const nativeIoc = indexOfCoincidence(native);
assert.ok(nativeIoc > 0.055);

const orders = [
  ['phi', 'koan'],
  ['koan', 'phi']
];
const summaries = [];
for (const order of orders) {
  // Exact independent native control: encode in reverse decoder order.
  const planted = encrypt(encrypt(native, order[1]), order[0]);
  const plantedCandidates = invert(planted, order[0])
    .flatMap((stage1) => invert(stage1, order[1]));
  assert.ok(plantedCandidates.some((candidate) =>
    candidate.length === native.length
    && candidate.every((value, index) => value === native[index])));

  const candidates = invert(quotient, order[0])
    .flatMap((stage1) => invert(stage1, order[1]));
  assert.ok(candidates.length > 0);
  for (const candidate of candidates) {
    assert.equal(candidate.length, 41);
    assert.deepEqual(encrypt(encrypt(candidate, order[1]), order[0]), quotient);
  }
  summaries.push({
    decodeOrder: order.join(' -> '),
    candidates: candidates.map((candidate) => ({
      ioc: indexOfCoincidence(candidate),
      translit: candidate.map((value) => corpus.translit[value]).join('')
    })),
    nativePlant: 'exact 41/41 recovered'
  });
}

assert.deepEqual(summaries.map((record) => record.candidates.length), [2, 1]);
assert.ok(summaries.every((record) => record.candidates.every((row) =>
  row.ioc < 0.036)));
assert.ok(summaries.flatMap((record) => record.candidates)
  .every((candidate) => candidate.translit.length >= 41));

console.log(JSON.stringify({
  status: 'Bounded direct negative, no new unknown original plaintext',
  page: 55, fullRunes: original.length,
  interiorRunes: inside.length, exactQuotientRunes: quotient.length,
  factor: factor, rootClue: [5, 22],
  historicalKeys: { priorSource:'LP1 p05 prime/totient; LP2 p22 image -> LP1 p14 solved koan',
    operators:['p56 prime-totient phi-prime', 'LP1 p14 FIRFUMFERENFE Vigenere'] },
  nativeP57Ioc: nativeIoc, original: summaries,
  caveat: 'Fixed-root art linkage and two-layer transfer are unverified interpretations. Decoding both historical schemes gives no readable text.'
}, null, 2));
