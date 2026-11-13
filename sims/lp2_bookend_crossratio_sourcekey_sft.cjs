'use strict';

/**
 * SFT: test whether the 81x81 first LP2 ciphertext square can supply a
 * 6395-symbol GP29 one-time-pad-like key to the terminal ciphertext.
 *
 * Source hypothesis: the exact two-word DJU BEI repeat closes the first
 * 6561 runes (81^2). Its 6400 adjacent 2x2 windows yield exactly five
 * 0/0 projective cross-ratios; omitting them supplies exactly 6395
 * defined ratios, the length of the terminal ciphertext.
 *
 * No hidden key, language-fitted phase, symbol reordering, guessed
 * plaintext, extra offset, or source mutation. This is a bounded test
 * of an inferred cipher operation, not an assertion about author intent.
 *
 * Run: node sims/lp2_bookend_crossratio_sourcekey_sft.cjs
 *
 * @typedef {number[]} Runes
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, '../resources/liber-primus/lp2-corpus.json'), 'utf8'));
const all = source.pages.filter((p) => p.page <= 55)
  .flatMap((p) => p.indices);
assert.equal(all.length, 12956);
const first = all.slice(0, 6561);
const second = all.slice(6561);
assert.equal(first.length, 81 * 81);
assert.equal(second.length, 80 * 80 - 5);

const inverse = Array(29).fill(0);
for (let a = 1; a < 29; a++) {
  for (let b = 1; b < 29; b++) {
    if ((a * b) % 29 === 1) {
      inverse[a] = b;
      break;
    }
  }
}
assert(inverse.slice(1).every((x) => x > 0));

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/**
 * @param {number} a Top-left rune
 * @param {number} b Top-right rune
 * @param {number} c Bottom-left rune
 * @param {number} d Bottom-right rune
 * @returns {number|null} 0..28 finite, 29 infinity, null 0/0
 */
function crossRatio(a, b, c, d) {
  const num = mod29((a - b) * (c - d));
  const den = mod29((a - d) * (c - b));
  return den === 0 ? (num === 0 ? null : 29) :
    mod29(num * inverse[den]);
}

/**
 * @param {number} orientation 3-bit D4 orientation
 * @returns {{values:Runes, undefinedCells:Runes, infinite:number, finite:number}}
 */
function makeKey(orientation) {
  /** @type {Runes} */
  const values = [];
  /** @type {Runes} */
  const undefinedCells = [];
  let infinite = 0;
  let finite = 0;
  /** @param {number} row @param {number} col @returns {number} */
  function get(row, col) {
    let y = row;
    let x = col;
    if (orientation & 1) y = 80 - y;
    if (orientation & 2) x = 80 - x;
    if (orientation & 4) [y, x] = [x, y];
    return first[81 * y + x];
  }
  for (let row = 0; row < 80; row++) {
    for (let col = 0; col < 80; col++) {
      const value = crossRatio(
        get(row, col), get(row, col + 1),
        get(row + 1, col), get(row + 1, col + 1));
      if (value === null) {
        undefinedCells.push(row * 80 + col);
        continue;
      }
      values.push(value);
      if (value === 29) infinite++;
      else finite++;
    }
  }
  assert.equal(undefinedCells.length, 5);
  assert.equal(infinite, 398);
  assert.equal(finite, 5997);
  assert.equal(values.length, second.length);
  return {values, undefinedCells, infinite, finite};
}

/**
 * A source-conditional GP29 pad value, with fixed 0 or 28 for infinity.
 * Both choices are reported because an infinity -> GP rune convention
 * is not supplied by Cicada's 2014/2016 original clues.
 *
 * @param {Runes} input
 * @param {Runes} key
 * @param {number} infinity
 * @param {number} sign
 * @returns {Runes}
 */
function applyPad(input, key, infinity, sign) {
  return input.map((x, i) =>
    mod29(x + sign * (key[i] === 29 ? infinity : key[i])));
}

/** @param {Runes} runes @returns {number} */
function ioc(runes) {
  const counts = Array(29).fill(0);
  for (const x of runes) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (runes.length * (runes.length - 1));
}

const control = source.pages.find((p) => p.page === 57).indices;
assert.equal(control.length, 95);
assert.equal(ioc(control) > 0.055, true);

const records = [];
for (let orientation = 0; orientation < 8; orientation++) {
  const key = makeKey(orientation);
  if (orientation === 0) {
    assert.deepEqual(key.undefinedCells, [564, 945, 2706, 5683, 6147]);
  }
  for (const infinity of [0, 28]) {
    for (const sign of [-1, 1]) {
      const proposed = applyPad(second, key.values, infinity, sign);
      const result = {
        orientation, infinity, sign, ioc: ioc(proposed),
      };
      records.push(result);
      assert.deepEqual(
        applyPad(proposed, key.values, infinity, -sign),
        second,
        'The entire authentic terminal ciphertext must re-encrypt.');

      // A separately solved p57 plaintext is deliberately planted as
      // plaintext; only this plant has a known expected recovered text.
      const plant = Array.from(
        {length: second.length}, (_, i) => control[i % control.length]);
      const ciphertext = applyPad(plant, key.values, infinity, -sign);
      assert.deepEqual(
        applyPad(ciphertext, key.values, infinity, sign),
        plant,
        'Source-key plant must recover every original solved rune.');
    }
  }
}
assert.equal(records.length, 32);
records.sort((a, b) => b.ioc - a.ioc);
const maximum = records[0];
const minimum = records[records.length - 1];
assert.deepEqual(
  [maximum.orientation, maximum.infinity, maximum.sign],
  [1, 0, 1]);
assert(Math.abs(maximum.ioc - 0.034534917532880585) < 1e-12);
assert(Math.abs(minimum.ioc - 0.03441552295777683) < 1e-12);
assert(Math.abs(ioc(second) - 0.034451571217445597) < 1e-12);
console.log('LP2 source: 12956 runes; first 81x81=6561; terminal=6395.');
console.log('Each D4 source orientation: 5997 finite ratios, 398 infinity, five 0/0 omissions.');
console.log('Source-selected natural D4 identity omissions:', makeKey(0).undefinedCells);
console.log('Original terminal GP29 IoC:', ioc(second));
console.log('32 source-key direct additive inverses, best:', maximum);
console.log('32 source-key direct additive inverses, lowest:', minimum);
console.log('All original ciphertext and 32 solved-PARABLE plants replayed exactly.');
console.log('Decision: no GP-native plaintext or authentic LP2 key recovered.');
