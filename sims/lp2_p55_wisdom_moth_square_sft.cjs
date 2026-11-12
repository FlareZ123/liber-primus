#!/usr/bin/env node
'use strict';

/** SUPERSEDED INPUT ALIGNMENT: this older 3x25 run retains p55's incoming p54 NG and skips the actual p55 body F at page-local25; it is not a physical p55-body test. */
/**
 * Direct original LP2 p55 test of the source-selected LP1 p5 5x5 Wisdom square.
 * Run: node sims/lp2_p55_wisdom_moth_square_sft.cjs
 *
 * Frozen:
 *  - Original moth copy links LP1 p5 to LP2 p55.
 *  - LP1 p5 square read printed row-major (25 values), phi(cell) % 29 key.
 *  - LP2 p55 original contains 76 runes, with literal F at zero-based 25:
 *    skip that one F without consuming a key position => 3 * 25 positions.
 *  - P = C - phi(cell) (mod 29), the sign of solved LP2 p56.
 * No start phase, direction, skip pattern or key transformations are fitted.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

const text = fs.readFileSync(path.join(root,
  'resources/cicada2014-openpuff-magic-squares.txt'), 'utf8');
const matrices = text.trim().split(/\r?\n[ \t]*\r?\n/)
  .map(chunk => chunk.trim().split(/\r?\n/)
    .map(row => row.trim().split(/\s+/).map(Number)));
const source = matrices[2].flat();
assert.equal(source.length, 25);
assert.equal(source[0], 272);
assert.equal(source[24], 272);

const corpus = JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const p55 = corpus.pages.find(p => p.page === 55).indices;
const p57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(p55.length, 76);
assert.equal(p55[25], 0); // source-observable GP29 F, between 25-step cycles

/** Euler's phi for an integer from the printed 5x5 square. @param {number} n */
function phi(n) {
  let result = n;
  let remaining = n;
  for (let prime = 2; prime * prime <= remaining; prime++) {
    if (remaining % prime === 0) {
      while (remaining % prime === 0) remaining /= prime;
      result = result / prime * (prime - 1);
    }
  }
  if (remaining > 1) result = result / remaining * (remaining - 1);
  return result;
}
const key = source.map(n => phi(n) % 29);
assert.deepEqual(key, [12,15,10,14,5,4,24,19,12,6,25,23,14,23,25,6,12,19,24,4,5,14,10,15,12]);

/**
 * Invert the exact frozen source-motivated cipher clock.
 * @param {number[]} input ciphertext GP29 indices including one literal F
 * @param {number} sign -1 decrypt, +1 synthesize positive plant
 * @returns {number[]}
 */
function apply(input, sign) {
  assert.equal(input.length, 76);
  const out = [];
  let j = 0;
  for (let i = 0; i < input.length; i++) {
    if (i === 25) {
      assert.equal(input[i], 0);
      out.push(0);
    } else {
      out.push((input[i] + sign * key[j % 25] + 29) % 29);
      j++;
    }
  }
  assert.equal(j, 75);
  return out;
}
/** @param {number[]} a */
function indexOfCoincidence(a) {
  const freq = Array(29).fill(0);
  for (const rune of a) freq[rune]++;
  return freq.reduce((sum, n) => sum + n * (n - 1), 0) / (a.length * (a.length - 1));
}
const decoded = apply(p55, -1);
// Control: encode and recover the first 75 real solved-page runes, with the
// fixed explicit F at position25; no trained language model is involved.
const planted = [...p57.slice(0,25), 0, ...p57.slice(25,75)];
assert.equal(planted.length, 76);
const recovered = apply(apply(planted, +1), -1);
assert.deepEqual(recovered, planted);
const gp = decoded.map(n => corpus.translit[n]).join('');
console.log(JSON.stringify({
  source: { LP1_page: 5, LP2_page: 55, direct_moth_match: true },
  original_square_25_values: source,
  frozen_totient_mod29_key: key,
  punctuation_free_76_GP_transliteration: gp,
  raw_LP2_p55_IoC: indexOfCoincidence(p55),
  reconstructed_p55_IoC: indexOfCoincidence(decoded),
  solved_LP2_p57_IoC_reference: indexOfCoincidence(p57),
  held_25_step_F_skip_at_index: 25,
  processed_key_steps: 75,
  source_native_positive_plant_recovered: true,
  result: 'No intelligible p55 text under this exact source-selected operation.',
}, null, 2));
