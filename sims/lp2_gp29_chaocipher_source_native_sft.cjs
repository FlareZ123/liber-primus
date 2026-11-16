'use strict';

/**
 * Single-file source-native test of a narrowly fixed, speculative GP29 Chaocipher.
 *
 * This is an exploratory inverse, not an authenticated Cicada instruction.
 * Classical 26-letter Chaocipher uses two mutable alphabets; the GP29 adaptation
 * moves the extracted symbol to the median slot (zero-based index 14).
 * Starting disks are the authenticated GP29 order and its exact reversal,
 * matching the known LP1 reversed-alphabet clue without inventing a password.
 *
 * No source currently selects Chaocipher, the modified odd-alphabet nadir,
 * an original-page clock, or this left/right ordering. A negative is therefore
 * specific to this frozen candidate, not a general cryptanalytic exclusion.
 *
 * Run on Windows 11: node sims/lp2_gp29_chaocipher_source_native_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));

/**
 * @template T
 * @param {T[]} alphabet
 * @param {number} count
 */
function rotate(alphabet, count) {
  alphabet.push(...alphabet.splice(0, count));
}

/**
 * @param {number[] | string[]} input
 * @param {number[] | string[]} leftInput Cipher wheel
 * @param {number[] | string[]} rightInput Plain wheel
 * @param {'encode' | 'decode'} mode
 * @returns {Array<number|string>}
 */
function chaocipher(input, leftInput, rightInput, mode) {
  const left = leftInput.slice();
  const right = rightInput.slice();
  const n = left.length;
  const nadir = Math.floor(n / 2);
  assert.equal(n, right.length);
  assert.equal(new Set(left).size, n);
  assert.equal(new Set(right).size, n);
  const result = [];
  for (const item of input) {
    const index = (mode === 'decode' ? left : right).indexOf(item);
    assert.ok(index >= 0, 'Input symbol must be present in the wheel');
    result.push((mode === 'decode' ? right : left)[index]);

    rotate(left, index);
    left.splice(nadir, 0, ...left.splice(1, 1));
    rotate(right, (index + 1) % n);
    right.splice(nadir, 0, ...right.splice(2, 1));
  }
  return result;
}

/** @param {number[]} input */
function coincidence(input) {
  const histogram = Array(29).fill(0);
  for (const v of input) histogram[v] += 1;
  return histogram.reduce((sum, v) => sum + v * (v - 1), 0) /
    (input.length * (input.length - 1));
}

/** @param {number[]} input */
function runePreview(input) {
  return input.slice(0, 70).map(v => corpus.translit[v]).join('-');
}

/** @param {number[]} pages */
function cipherRunes(pages) {
  return corpus.pages.filter(p => pages.includes(p.page)).flatMap(p => p.indices);
}

// Independent 26-symbol published standard example, run before any GP29 input.
const az = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
const originalLeft = [...'HXUCZVAMDSLKPEFJRIGTWOBNYQ'];
const originalRight = [...'PTLNBQDEOYSFAVZKGJRIHWXUMC'];
const text = [...'WELLDONEISBETTERTHANWELLSAID'];
const expected = [...'OAHQHCNYNXTSZJRRHJBYHQKSOUJY'];
assert.deepEqual(chaocipher(text, originalLeft, originalRight, 'encode'), expected);
assert.deepEqual(chaocipher(expected, originalLeft, originalRight, 'decode'), text);
assert.equal(az.length, 26);

const gp = Array.from({length: 29}, (_, i) => i);
const reverse = gp.slice().reverse();
const solved = cipherRunes([57]);
assert.equal(solved.length, 95);
assert.deepEqual(
  chaocipher(chaocipher(solved, gp, reverse, 'encode'), gp, reverse, 'decode'),
  solved
);
console.log('Published Chaocipher 26-letter control: PASS');
console.log('Original p57 GP29 95-symbol plant/recovery: PASS');

for (const [label, pages, length] of [
  ['opening p0-p2', [0, 1, 2], 729],
  ['terminal p54-p55', [54, 55], 308]
]) {
  const source = cipherRunes(pages);
  assert.equal(source.length, length);
  const candidate = /** @type {number[]} */(
    chaocipher(source, gp, reverse, 'decode')
  );
  assert.deepEqual(chaocipher(candidate, gp, reverse, 'encode'), source);
  console.log(label + ': ' + length + ' runes, IoC=' +
    coincidence(candidate).toFixed(9));
  console.log('  First 70 GP rune tokens: ' + runePreview(candidate));
}
console.log('No original unknown-page plaintext or source-selected key was found.');
