'use strict';

/**
 * Source-fixed GF(29^238) Frobenius orbit inverse for original LP2 p36.
 * Tests every field automorphism x -> x^(29^k), k=0..237, under the
 * independently printed p50 table's exact degree-238 factor.
 *
 * Reproducer: node sims/lp2_p36_field_frobenius_orbit_sft.cjs
 * Node 22, built-ins only; no fitted key, no hidden samples.
 */

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const MOD = 29;
const DEG = 238;
/** @param {number} value @returns {number} */
const mod = (value) => ((value % MOD) + MOD) % MOD;

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function polyMul(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      out[i + j] = mod(out[i + j] + a[i] * b[j]);
  return out;
}

/** Monic exact GF29 division, low coefficients first.
 * @param {number[]} a @param {number[]} b @returns {number[]}
 */
function polyDivMonic(a, b) {
  assert.equal(b.at(-1), 1);
  const remainder = a.slice();
  const quotient = Array(a.length - b.length + 1).fill(0);
  for (let k = remainder.length - 1; k >= b.length - 1; k--) {
    const value = mod(remainder[k]);
    const offset = k - b.length + 1;
    quotient[offset] = value;
    for (let j = 0; j < b.length; j++)
      remainder[offset + j] = mod(remainder[offset + j] - value * b[j]);
  }
  assert(remainder.slice(0, b.length - 1).every((v) => v === 0));
  while (quotient.at(-1) === 0) quotient.pop();
  return quotient;
}

assert.equal(gp.pages[36].indices.length, DEG);
assert.equal(gp.pages[3].indices.length, 217);
assert.equal(gp.pages[39].indices.length, 240);
assert.equal(grid.byte_rows.length, 32);
assert(grid.byte_rows.every((row) => row.length === 8));
const bytes = grid.byte_rows.flat();
const sha = crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex');
assert.equal(sha, '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const small = [
  [5, 1], [5, 1], [11, 18, 1], [24, 16, 14, 1],
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1],
].reduce((a, b) => polyMul(a, b), [1]);
assert.equal(small.length, 17);
const originalTablePoly = bytes.map((v) => v % MOD).reverse();
const R = polyDivMonic(originalTablePoly, small).map((v) => mod(-v));
assert.equal(R.length, DEG + 1);
assert.equal(R.at(-1), 1);
assert.equal(R[0], 5);
assert.deepEqual(polyMul(small, R).map((v) => mod(-v)), originalTablePoly.slice(0, 255));

/* Linear basis: F[j] contains the coefficients of X^(29j) mod R.
 * This computes the entire Frobenius operation from the original p50 bytes.
 */
const basis = [];
let current = Array(DEG).fill(0);
current[0] = 1;
for (let j = 0; j < DEG; j++) {
  basis.push(current.slice());
  const shifted = Array(DEG + MOD).fill(0);
  for (let i = 0; i < DEG; i++) shifted[i + MOD] = current[i];
  for (let k = shifted.length - 1; k >= DEG; k--) {
    const value = mod(shifted[k]);
    if (value !== 0)
      for (let i = 0; i < DEG; i++)
        shifted[k - DEG + i] -= value * R[i];
  }
  current = shifted.slice(0, DEG).map(mod);
}

/** @param {number[]} input @returns {number[]} */
function frobenius(input) {
  assert.equal(input.length, DEG);
  const out = new Int32Array(DEG);
  for (let i = 0; i < DEG; i++) if (input[i] !== 0) {
    const v = input[i];
    for (let j = 0; j < DEG; j++) out[j] += v * basis[i][j];
  }
  return Array.from(out, mod);
}
/** @param {number[]} input @returns {number} */
function ioc(input) {
  const counts = Array(MOD).fill(0);
  for (const v of input) counts[v]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0)
    / (input.length * (input.length - 1));
}

const targets = [
  ['p36 printed coefficients', gp.pages[36].indices],
  ['p36 reversed coefficients', gp.pages[36].indices.slice().reverse()],
  ['(p39:0..118 + p3:0..118), reversed', [
    ...gp.pages[39].indices.slice(0, 119),
    ...gp.pages[3].indices.slice(0, 119),
  ].reverse()],
];

/** @param {string} label @param {number[]} seed */
function auditOrbit(label, seed) {
  let candidate = seed.slice();
  const records = [];
  for (let k = 0; k < DEG; k++) {
    records.push({ exponent: k, ioc: ioc(candidate) });
    candidate = frobenius(candidate);
  }
  assert.deepEqual(candidate, seed, 'The 238th Frobenius action must be identity');
  const top = records.reduce((best, rec) => rec.ioc > best.ioc ? rec : best);
  const bottom = records.reduce((best, rec) => rec.ioc < best.ioc ? rec : best);
  assert(top.ioc < 0.04);
  return { name: label, count: records.length, top, bottom,
    count_above_0_040: records.filter((v) => v.ioc > 0.04).length };
}
const original = targets.map(([label, seed]) => auditOrbit(label, seed));

const sortedTokens = gp.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);
/** GP29 source-native English spelling. @param {string} word @returns {number[]} */
function native(word) {
  const s = word.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith('ING', i)) { out.push(21); i += 3; }
    else if (s.startsWith('IO', i)) { out.push(27); i += 2; }
    else {
      const token = sortedTokens.find((t) => s.startsWith(t.s, i));
      assert(token, 'Unknown native spelling: ' + s);
      out.push(token.i);
      i += token.s.length;
    }
  }
  return out;
}
const references = [
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/shakespeare_first300k.txt',
].map((file) => {
  const runes = (read(file).match(/[A-Za-z]+/g) || []).flatMap(native);
  let minimum = Infinity;
  let maximum = 0;
  let windows = 0;
  for (let i = 0; i + DEG <= runes.length; i += 29) {
    const value = ioc(runes.slice(i, i + DEG));
    minimum = Math.min(minimum, value);
    maximum = Math.max(maximum, value);
    windows++;
  }
  assert(minimum > 0.048);
  return { file, runes: runes.length, windows, min_ioc: minimum,
    max_ioc: maximum };
});

/* Positive: an independent 238-rune source-native English control encrypted
 * with F^87 and recovered with F^(238-87), exactly.
 */
const plantedRunes = (read('resources/control/gibran_prophet_58585.txt')
  .match(/[A-Za-z]+/g) || []).flatMap(native).slice(400, 638);
assert.equal(plantedRunes.length, DEG);
let encrypted = plantedRunes.slice();
for (let j = 0; j < 87; j++) encrypted = frobenius(encrypted);
assert.notDeepEqual(encrypted, plantedRunes);
for (let j = 0; j < DEG - 87; j++) encrypted = frobenius(encrypted);
assert.deepEqual(encrypted, plantedRunes);
assert(ioc(plantedRunes) > 0.05);

assert.equal(original[0].top.exponent, 103);
assert(Math.abs(original[0].top.ioc - 0.03740736801049534) < 1e-12);
assert.equal(original[1].top.exponent, 103);
assert(Math.abs(original[1].top.ioc - 0.0379746835443038) < 1e-12);
assert.equal(original[2].top.exponent, 160);
assert(Math.abs(original[2].top.ioc - 0.038896571286742544) < 1e-12);
assert.equal(references[0].windows, 2147);
assert.equal(references[1].windows, 7479);

console.log(JSON.stringify({
  source: { field_characteristic: MOD, degree: DEG, page36_runes: DEG,
    original_table_bytes: bytes.length, original_byte_sha256: sha },
  original, references,
  control: { encrypted_exponent: 87, decoded_exponent: 151,
    recovered: DEG, ioc: ioc(plantedRunes) },
  conclusion: 'The entire source-fixed Frobenius family fails the native-English register screen; unknown plaintext is not recovered.',
}, null, 2));
