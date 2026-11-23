'use strict';

/**
 * Reproduction of the source-typed 1033-rune key-bank hypothesis for the
 * five numbered LP2 cuneiform passages (Issue #2243, 23 November 2026).
 *
 * All original input is read from the committed canonical LP2 corpus.
 * Ciphertext, rune order, five printed unit boundaries, and red triplet
 * boundaries remain unchanged. This script is read-only.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8',
));

/** @type {Map<number, number[]>} */
const pages = new Map(corpus.pages.map((page) => [page.page, page.indices]));
const page = (n) => {
  const values = pages.get(n);
  assert.ok(values, `Missing original physical page ${n}`);
  return values;
};

const header = [
  ...page(33).slice(91), ...page(34), ...page(35), ...page(36),
  ...page(37), ...page(38), ...page(39),
];

const units = [
  page(36).slice(99, 238),
  page(37).slice(0, 91),
  page(37).slice(91, 189),
  [...page(37).slice(189), ...page(38).slice(0, 57)],
  page(38).slice(57, 186),
];

const ciphertext = units.flat();
const keyBank = [
  ...header.slice(0, 754),
  ...header.slice(1307, 1468),
  ...header.slice(1471),
];

assert.equal(header.length, 1589);
assert.deepEqual(units.map((v) => v.length), [139, 91, 98, 96, 129]);
assert.equal(ciphertext.length, 553);
assert.deepEqual(ciphertext, header.slice(754, 1307));
assert.equal(keyBank.length, 1033);
assert.deepEqual(header.slice(1468, 1471), [27, 5, 15]);

const MODULUS = 29;
const BANK_SIZE = 1033;

/** @param {number[]} values */
function ioc(values) {
  const freq = new Array(MODULUS).fill(0);
  for (const value of values) freq[value]++;
  return freq.reduce((total, count) => total + count * (count - 1), 0)
    / (values.length * (values.length - 1));
}

/** @param {number[]} source @param {number} phase @param {number} stride @param {-1|1} sign */
function decode(source, phase, stride, sign) {
  return source.map((value, j) =>
    (value + sign * keyBank[(phase + stride * j) % BANK_SIZE] + MODULUS) % MODULUS);
}

/** @param {number[]} source @param {number} phase @param {number} stride @param {-1|1} sign */
function encode(source, phase, stride, sign) {
  return decode(source, phase, stride, /** @type {-1|1} */ (-sign));
}

/**
 * The printed numbers give the candidate bank length 1033 and stride
 * 3301 mod 1033 = 202. Adjacent forward/reverse bank order are controls.
 * Rotating phase is exhaustively permitted; no phase is fit then extended.
 */
const strides = [1, 202, 1032];
const signs = /** @type {const} */ ([-1, 1]);
const solved = page(57);
assert.equal(solved.length, 95);
const plantedPlain = Array.from({ length: 553 }, (_, j) => solved[j % solved.length]);
const controls = [];

for (const stride of strides) {
  for (const sign of signs) {
    let best = { phase: -1, value: -Infinity };
    let worst = { phase: -1, value: Infinity };
    let exceeding = 0;

    for (let phase = 0; phase < BANK_SIZE; phase++) {
      const candidate = decode(ciphertext, phase, stride, sign);
      assert.deepEqual(encode(candidate, phase, stride, sign), ciphertext);
      const value = ioc(candidate);
      if (value > best.value) best = { phase, value };
      if (value < worst.value) worst = { phase, value };
      if (value >= 0.045) exceeding++;
    }

    const plantedCipher = encode(plantedPlain, 0, stride, sign);
    const recovered = decode(plantedCipher, 0, stride, sign);
    const wrong = decode(plantedCipher, 1, stride, sign);
    assert.deepEqual(recovered, plantedPlain);
    assert.deepEqual(encode(recovered, 0, stride, sign), plantedCipher);
    assert.ok(ioc(recovered) > 0.06);
    assert.ok(ioc(wrong) < 0.045);
    assert.equal(exceeding, 0);

    controls.push({
      stride, sign, best_phase: best.phase,
      best_ioc: Number(best.value.toFixed(12)),
      worst_ioc: Number(worst.value.toFixed(12)),
      phase_zero_ioc: Number(ioc(decode(ciphertext, 0, stride, sign)).toFixed(12)),
      phase_count_ge_0045: exceeding,
      planted_original_plain_ioc: Number(ioc(plantedPlain).toFixed(12)),
      planted_wrong_phase_ioc: Number(ioc(wrong).toFixed(12)),
    });
  }
}

const winners = {
  '1,-1': [336, 0.03665775611290196],
  '1,1': [203, 0.03709018004560107],
  '202,-1': [843, 0.03649395916869775],
  '202,1': [178, 0.03640223287994339],
  '1032,-1': [916, 0.03598946458054879],
  '1032,1': [1002, 0.03637602536887072],
};

for (const row of controls) {
  const [phase, score] = winners[`${row.stride},${row.sign}`];
  assert.equal(row.best_phase, phase);
  assert.ok(Math.abs(row.best_ioc - score) < 1e-11);
}

console.log('Original cuneiform source typed register PASS');
console.log('Exact partition: header 1589; original numbered 553; ordinary unnumbered 1033; marked red3 excluded');
console.log(`Original 553 GP29 IoC ${ioc(ciphertext).toFixed(12)}; authentic solved p57 GP29 IoC ${ioc(solved).toFixed(12)}`);
for (const row of controls) console.log(JSON.stringify(row));
console.log('All six complete 1033-phase families reject direct native-GP output (no IoC >= 0.045); reversible source-native positives PASS.');
