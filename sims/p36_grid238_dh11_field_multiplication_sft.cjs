'use strict';

/** Finite source-fixed GF(29^238) p36 key / 2013 DH11 field inverse gate (Node 22). */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, 'resources', 'liber-primus');
const table = JSON.parse(fs.readFileSync(path.join(SOURCE, 'base60-grid.json'), 'utf8')).byte_rows.flat();
const corpus = JSON.parse(fs.readFileSync(path.join(SOURCE, 'lp2-corpus.json'), 'utf8'));
const degree = 238;
const mod = a => (a % 29 + 29) % 29;

/** @param {number[]} a @returns {number[]} */
function trim(a) {
  while (a.length && a[a.length - 1] === 0) a.pop();
  return a;
}

/** @param {number} a @returns {number} */
function scalarInv(a) {
  for (let k = 1; k < 29; k++) if (mod(k * a) === 1) return k;
  throw Error('nonunit coefficient');
}

/** @param {number[]} a @param {number[]} b @param {number} [sign] */
function add(a, b, sign = 1) {
  return trim(Array.from({length: Math.max(a.length, b.length)},
    (_, i) => mod((a[i] || 0) + sign * (b[i] || 0))));
}

/** @param {number[]} a @param {number[]} b */
function multiply(a, b) {
  if (!a.length || !b.length) return [];
  const c = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) if (a[i])
    for (let j = 0; j < b.length; j++)
      c[i + j] = mod(c[i + j] + a[i] * b[j]);
  return trim(c);
}

/** @param {number[]} a @param {number[]} b @returns {[number[], number[]]} */
function divide(a, b) {
  assert.ok(b.length, 'nonzero divisor');
  const r = trim(a.slice());
  const q = Array(Math.max(0, r.length - b.length + 1)).fill(0);
  const inv = scalarInv(b[b.length - 1]);
  while (r.length >= b.length) {
    const offset = r.length - b.length;
    const coefficient = mod(r[r.length - 1] * inv);
    q[offset] = coefficient;
    for (let j = 0; j < b.length; j++)
      r[offset + j] = mod(r[offset + j] - coefficient * b[j]);
    trim(r);
  }
  return [trim(q), r];
}

// The exact source factorization: degree 254 = 2*1 + 2 + 3 + 9 + 238.
// Polynomial arrays are in *ascending* power order.
assert.equal(table.length, 256);
let quotient = trim(table.slice().reverse().map(b => b % 29));
for (const factor of [
  [5, 1], [5, 1],
  [11, 18, 1],
  [24, 16, 14, 1],
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1]
]) {
  const [q, remainder] = divide(quotient, factor);
  assert.equal(remainder.length, 0, 'source factor divides original table exactly');
  quotient = q;
}
const R = quotient.map(x => mod(x * scalarInv(quotient[quotient.length - 1])));
assert.equal(R.length, degree + 1);
assert.equal(R[degree], 1);

const reduce = a => divide(a, R)[1];
const fieldMul = (a, b) => reduce(multiply(a, b));

/** @param {number[]} a */
function fieldInverse(a) {
  let [r0, r1, t0, t1] = [R, trim(a.slice()), [], [1]];
  while (r1.length) {
    const [q, r2] = divide(r0, r1);
    [r0, r1] = [r1, r2];
    [t0, t1] = [t1, add(t0, multiply(q, t1), -1)];
  }
  assert.equal(r0.length, 1, 'p36 seed is invertible in source field');
  return reduce(t0.map(x => mod(x * scalarInv(r0[0]))));
}

/** @param {number[]} a @param {bigint} exponent */
function fieldPow(a, exponent) {
  let result = [1];
  while (exponent > 0n) {
    if (exponent & 1n) result = fieldMul(result, a);
    exponent >>= 1n;
    if (exponent) a = fieldMul(a, a);
  }
  return result;
}

/** @param {bigint} a @param {bigint} m */
function inverseExponent(a, m) {
  let [r, next, t, tn] = [m, a, 0n, 1n];
  while (next !== 0n) {
    const k = r / next;
    [r, next] = [next, r - k * next];
    [t, tn] = [tn, t - k * tn];
  }
  assert.equal(r, 1n);
  return (t % m + m) % m;
}

const as238 = a => Array.from({length: degree}, (_, i) => a[i] || 0);

/** @param {number[]} a */
function ioc(a) {
  const counts = Array(29).fill(0);
  for (const x of a) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (a.length * (a.length - 1));
}

const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length);
const entire = pages.flatMap(p => p.indices);
const p36 = pages.find(p => p.page === 36).indices;
const solved = corpus.pages.find(p => p.page === 57).indices;
const planted = Array.from({length: degree}, (_, i) => solved[i % solved.length]);
const p36offset = pages.filter(p => p.page < 36).reduce((n, p) => n + p.indices.length, 0);
assert.equal(entire.length, 12956);
assert.equal(p36.length, degree);
assert.equal(entire.slice(p36offset, p36offset + degree).join(','), p36.join(','));

const multiplication = [];
const power11 = [];
const dhClassExponent = 11n; // Reconstructed 2013 DH3301 class e ≡ 11 (mod 550).
const exponentInv = inverseExponent(dhClassExponent, 29n ** 238n - 1n);
for (const reverseSeed of [false, true]) {
  const key = trim((reverseSeed ? p36.slice().reverse() : p36.slice()));
  const inverseKey = fieldInverse(key);
  assert.equal(fieldMul(key, inverseKey).join(','), '1');
  assert.deepEqual(as238(fieldMul(fieldMul(planted, key), inverseKey)), planted);

  for (const clock of ['book', 'after-p36']) for (const reverseBlock of [false, true]) {
    const observed = [];
    let offset = clock === 'book' ? 0 : p36offset + degree;
    for (; offset + degree <= entire.length; offset += degree) {
      const original = entire.slice(offset, offset + degree);
      const fieldElement = trim((reverseBlock ? original.reverse() : original));
      observed.push(ioc(as238(fieldMul(fieldElement, inverseKey))));
    }
    assert.equal(observed.length, clock === 'book' ? 54 : 16);
    const record = {
      key: reverseSeed ? 'reversed' : 'printed',
      input: reverseBlock ? 'reversed' : 'printed',
      clock,
      blocks: observed.length,
      mean_ioc: observed.reduce((a, b) => a + b, 0) / observed.length,
      max_ioc: Math.max(...observed)
    };
    assert.ok(record.max_ioc < 0.045, 'no original field-divided block approaches source GP prose');
    multiplication.push(record);
  }

  const decoded = as238(fieldPow(key, exponentInv));
  assert.deepEqual(as238(fieldPow(trim(decoded.slice()), dhClassExponent)), as238(key));
  const encryptedPlant = fieldPow(trim(planted.slice()), dhClassExponent);
  assert.deepEqual(as238(fieldPow(encryptedPlant, exponentInv)), planted);
  const rec = {
    key_order: reverseSeed ? 'reversed' : 'printed',
    original_ioc: ioc(as238(key)),
    decoded_ioc: ioc(decoded),
    first_25: decoded.slice(0, 25).map(i => corpus.translit[i]).join(' ')
  };
  assert.ok(rec.decoded_ioc < 0.045);
  power11.push(rec);
}

console.log(JSON.stringify({
  source: 'original printed LP2 256-byte GF29 factor; original physical p36 238 runes; archived 2013 DH3301 exponent class',
  field: 'GF(29^238)',
  p36_runes: degree,
  untreated_full_stream_ioc: ioc(entire),
  native_gp_plant_ioc: ioc(planted),
  positive_controls: 'all 238 planted GP coefficients recovered for field multiply and power11; full original reencryption',
  block_multiplication: multiplication,
  direct_dh_exponent_11_inverse: power11,
  decision: 'Both literal source-keyed reversible field inverses leave the unknown original rune output ciphertext-like; no plaintext.'
}, null, 2));
