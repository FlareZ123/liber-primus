'use strict';

/**
 * A clue-fixed 28-point GF29 number-theoretic transform of nine Q252 rows.
 *
 * Each quotient row has 28 coefficients; GP prime-derived field is GF29.
 * The original red p39 coefficient 15 is a primitive root modulo 29.
 * Test both source coefficient directions, forward and inverse NTT;
 * never fit a password, phase or original unknown ciphertext.
 *
 * Node.js 22, read-only original resource inputs.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const read = (p) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', p), 'utf8'));
const source = read('resources/liber-primus/lp2-corpus.json');
const rows = read('resources/liber-primus/base60-grid.json').byte_rows;
const byteValues = rows.flat();
assert.equal(rows.length, 32);
assert(rows.every((r) => r.length === 8));
assert.equal(crypto.createHash('sha256').update(Buffer.from(byteValues)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const mod = (n) => ((n % 29) + 29) % 29;
const factor = [12, 17, 11, 21, 23]; // H*G descending
const rem = byteValues.map((x) => x % 29);
const quotient = [];
for (let i = 0; i < 252; i++) {
  const coefficient = mod(rem[i] * 17); // multiplicative inverse of 12 mod 29
  quotient.push(coefficient);
  for (let t = 0; t < 5; t++) rem[i + t] = mod(rem[i + t] - coefficient * factor[t]);
}
assert.deepEqual(rem.slice(252), [0, 0, 0, 0]);
assert.deepEqual(quotient.slice(0, 16),
  [0, 12, 9, 28, 2, 25, 23, 21, 18, 28, 21, 17, 17, 8, 15, 21]);

/** Primitive root 15 generates all 28 units in the printed GP prime field. */
const omega = Array.from({ length: 28 }, (_, i) => {
  let v = 1;
  for (let k = 0; k < i; k++) v = mod(v * 15);
  return v;
});
assert.equal(new Set(omega).size, 28);
assert.equal(omega[27], 2);
assert.equal(mod(omega[27] * 15), 1);

/** The nonnormalized forward and 1/28-normalized inverse GF29 NTT. */
function ntt(input, inverse) {
  assert.equal(input.length, 28);
  const out = Array(28).fill(0);
  for (let k = 0; k < 28; k++) {
    let sum = 0;
    for (let j = 0; j < 28; j++) {
      const exponent = ((inverse ? -1 : 1) * k * j % 28 + 28) % 28;
      sum += input[j] * omega[exponent];
    }
    out[k] = mod(sum * (inverse ? 28 : 1)); // 28^-1 = 28 (mod29)
  }
  return out;
}
for (let row = 0; row < 9; row++) {
  const r = quotient.slice(row * 28, (row + 1) * 28);
  assert.deepEqual(ntt(ntt(r, false), true), r);
  assert.deepEqual(ntt(ntt(r, true), false), r);
}

/** A native authentic solved-p57 GP token plant of matching 252 length. */
const native = source.pages.find((p) => p.page === 57).indices;
assert.equal(native.length, 95);
const planted = Array.from({ length: 252 }, (_, i) => native[i % native.length]);
for (let start = 0; start < 252; start += 28) {
  const t = planted.slice(start, start + 28);
  assert.deepEqual(ntt(ntt(t, true), false), t);
  assert.deepEqual(ntt(ntt(t, false), true), t);
}

const ioc = (values) => {
  const freq = Array(29).fill(0);
  for (const x of values) freq[x]++;
  return freq.reduce((s, n) => s + n * (n - 1), 0) /
    (values.length * (values.length - 1));
};
const variants = [];
for (const reversed of [false, true]) {
  for (const inverse of [false, true]) {
    const result = [];
    for (let s = 0; s < 9; s++) {
      const row = quotient.slice(s * 28, (s + 1) * 28);
      if (reversed) row.reverse();
      result.push(ntt(row, inverse));
    }
    variants.push({
      coefficientOrder: reversed ? 'reversed' : 'source',
      transform: inverse ? 'inverse' : 'forward',
      ioc: +ioc(result.flat()).toFixed(9),
      nineIoC: result.map((r) => +ioc(r).toFixed(9)),
      firstGP: result[0].map((x) => source.translit[x]).join(' '),
      finalGP: result[8].map((x) => source.translit[x]).join(' ')
    });
  }
}
assert.deepEqual(variants.map((v) => v.ioc),
  [0.035666856, 0.035666856, 0.035160944, 0.035160944]);
assert(variants.every((v) => v.ioc < 0.04));
// A 28-point inverse NTT is output reversal times a field scalar; consequently
// each coefficient orientation has the same equality-collision count either way.
assert.equal(variants[0].ioc, variants[1].ioc);
assert.equal(variants[2].ioc, variants[3].ioc);

console.log(JSON.stringify({
  sourceDigitCount: quotient.length,
  chapterCount: 9,
  sourcePrimitiveRoot: 15,
  GF29UnitOrder: 28,
  genuineSolvedP57PlantRecovered: '252/252 per source transform',
  original: variants
}, null, 2));
