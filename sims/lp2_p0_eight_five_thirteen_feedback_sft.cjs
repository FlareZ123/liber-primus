'use strict';

/**
 * Frozen source-cued opening experiment:
 * - Original physical LP2 p0 red heading: 8 + 5 = 13 runes.
 * - Entire p0-p2 chapter: 729 original GP29 runes.
 * - Three explicitly stated mod-29 feedback inverses; no tuned key.
 *
 * Run on Windows or any Node.js 22 runtime.
 * No dependencies beyond Node.js built-ins.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8')
);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/**
 * @param {number[]} encoded
 * @param {'five-eight' | 'cipher-autokey-13' | 'plain-autokey-13'} mode
 * @returns {number[]}
 */
function decode(encoded, mode) {
  const recovered = encoded.slice(0, 13);
  for (let i = 13; i < encoded.length; i += 1) {
    const value = mode === 'five-eight'
      ? mod29(encoded[i] - encoded[i - 5] - encoded[i - 8])
      : mode === 'cipher-autokey-13'
        ? mod29(encoded[i] - encoded[i - 13])
        : mod29(encoded[i] - recovered[i - 13]);
    recovered.push(value);
  }
  return recovered;
}

/**
 * @param {number[]} seed
 * @param {number[]} plaintextBody
 * @param {'five-eight' | 'cipher-autokey-13' | 'plain-autokey-13'} mode
 * @returns {number[]}
 */
function encode(seed, plaintextBody, mode) {
  assert.equal(seed.length, 13);
  const encoded = [...seed];
  const knownPlain = [...seed];
  for (const value of plaintextBody) {
    const i = encoded.length;
    const cipher = mode === 'five-eight'
      ? mod29(value + encoded[i - 5] + encoded[i - 8])
      : mode === 'cipher-autokey-13'
        ? mod29(value + encoded[i - 13])
        : mod29(value + knownPlain[i - 13]);
    encoded.push(cipher);
    knownPlain.push(value);
  }
  return encoded;
}

/** @param {number[]} sequence @returns {number} */
function ioc(sequence) {
  const hist = Array(29).fill(0);
  for (const rune of sequence) hist[rune] += 1;
  return hist.reduce((sum, n) => sum + n * (n - 1), 0)
    / (sequence.length * (sequence.length - 1));
}

/** @param {number[]} values @returns {string} */
function roman(values) {
  return values.map((i) => corpus.translit[i]).join(' ');
}

const original = [0, 1, 2].flatMap((page) => corpus.pages[page].indices);
const solved = corpus.pages[57].indices;
const prefix = original.slice(0, 13);
assert.equal(original.length, 729);
assert.equal(solved.length, 95);
assert.equal(prefix.length, 13);

console.log('Original opening physical p0-p2: 729 GP29 runes');
console.log('Original red p0 heading: 8+5=13 runes,', roman(prefix));
console.log('Original black/carry continuation: 716 runes');
console.log('Unmodified continuation IoC:', ioc(original.slice(13)).toFixed(9));
console.log('Source-clear p57 IoC:', ioc(solved).toFixed(9));

for (const mode of /** @type {const} */ (
  ['five-eight', 'cipher-autokey-13', 'plain-autokey-13']
)) {
  // Positive control: exact synthetic reversible 95-rune known Cicada prose.
  const planted = encode(prefix, solved.slice(13), mode);
  assert.deepEqual(decode(planted, mode).slice(13), solved.slice(13));

  // Original-only candidate: inverse is fixed before reading its output.
  const recovered = decode(original, mode);
  assert.deepEqual(encode(prefix, recovered.slice(13), mode), original);
  console.log('\nMode:', mode);
  console.log('Original plaintext-candidate IoC:', ioc(recovered.slice(13)).toFixed(9));
  console.log('First 48 putative plaintext runes:', roman(recovered.slice(13, 61)));
}
