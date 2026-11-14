'use strict';

/**
 * SFT: Original p29 source-polynomial quotient and the 55 source-word
 * interiors of independently clear LP2 p57, as one five-period GP29 key.
 *
 * Run: node sims/lp2_p29_275_parable55_direct_key_sft.cjs
 * All file reads only; no external modules, APIs or network.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(
  root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcript = fs.readFileSync(path.join(
  root, 'resources/lp2-transcription.txt'), 'utf8');

const mod = n => ((n % 29) + 29) % 29;

/** @param {number} a @returns {number} */
function inv(a) {
  for (let i = 1; i < 29; i++) if (mod(a * i) === 1) return i;
  throw new Error('noninvertible coefficient');
}

/**
 * Quotient of a descending-coefficient GF29 polynomial and a fixed
 * nonzero-leading quadratic.
 * @param {number[]} input
 * @param {number[]} divisor
 * @returns {{quotient:number[],remainder:number[]}}
 */
function divide(input, divisor) {
  const a = input.slice();
  const quotient = [];
  const n = input.length - divisor.length + 1;
  for (let j = 0; j < n; j++) {
    const q = mod(a[j] * inv(divisor[0]));
    quotient.push(q);
    for (let k = 0; k < divisor.length; k++) {
      a[j + k] = mod(a[j + k] - q * divisor[k]);
    }
  }
  return {quotient, remainder: a.slice(n)};
}

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function multiply(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      out[i + j] = mod(out[i + j] + a[i] * b[j]);
    }
  }
  return out;
}

/** @param {number[]} sequence @returns {number} */
function ioc(sequence) {
  const count = Array(29).fill(0);
  for (const x of sequence) count[x]++;
  return count.reduce((s, n) => s + n * (n - 1), 0) /
    (sequence.length * (sequence.length - 1));
}

const alphabet = new Map(corpus.runes.map((rune, i) => [rune, i]));
const originalWords = transcript
  .slice(transcript.lastIndexOf('%') + 1, transcript.lastIndexOf('§'))
  .replace(/[\/\s]/g, '')
  .split(/[.\-]+/).filter(Boolean);
const sourceP57 = originalWords.flatMap(w =>
  Array.from(w).map(rune => {
    const index = alphabet.get(rune);
    assert.notEqual(index, undefined);
    return index;
  }));
const key = originalWords.flatMap(w =>
  Array.from(w).slice(1, -1).map(rune => alphabet.get(rune)));
assert.equal(originalWords.length, 20);
assert.equal(sourceP57.length, 95);
assert.deepEqual(sourceP57, corpus.pages.find(p => p.page === 57).indices);
assert.equal(key.length, 55);

const p29 = corpus.pages.find(p => p.page === 29).indices;
assert.equal(p29.length, 277);
// Original red p39 triad, descending GP-index polynomial.
const G = [15, 5, 27];
const {quotient: Q, remainder} = divide(p29, G);
assert.equal(Q.length, 275);
assert.deepEqual(remainder, [0, 0]);
assert.deepEqual(multiply(Q, G), p29);

const preview = values => values.map(v => corpus.translit[v]).join('');
const decrypt = (cipher, sign) =>
  cipher.map((v, i) => mod(v + sign * key[i % key.length]));
const output = [-1, 1].map(sign => {
  const decoded = decrypt(Q, sign);
  const sourceNativePlant = Array.from(
    {length: Q.length}, (_, i) => sourceP57[i % sourceP57.length]);
  const syntheticCipher = sourceNativePlant.map((v, i) =>
    mod(v - sign * key[i % key.length]));
  assert.deepEqual(decrypt(syntheticCipher, sign), sourceNativePlant);
  assert.deepEqual(multiply(
    decoded.map((v, i) => mod(v - sign * key[i % key.length])), G), p29);
  return {
    sign: sign < 0 ? 'C minus interior' : 'C plus interior',
    ioc: ioc(decoded),
    fullDecrypted: preview(decoded),
    segmentIoC: Array.from({length: 5}, (_, j) =>
      ioc(decoded.slice(55 * j, 55 * (j + 1)))),
    sourceNativePlantRecovered: sourceNativePlant.length,
    originalCoefficientsReconstructed: p29.length
  };
});
assert.ok(Math.abs(ioc(Q) - 0.034054412740544125) < 1e-12);
assert.ok(Math.abs(output[0].ioc - 0.034983410749834104) < 1e-12);
assert.ok(Math.abs(output[1].ioc - 0.034266755142667554) < 1e-12);

console.log(JSON.stringify({
  original: 'LP2 p29 exact 277 rune original, p39 red-triad divisor',
  divisor: G,
  p29Quotient: Q.length,
  remainder,
  p57: {words: 20, runes: 95, literalWordInteriors: key.length},
  keyPasses: 5,
  rawQuotientIoC: ioc(Q),
  results: output,
  authenticUnknownPlaintextRecovered: false
}, null, 2));
