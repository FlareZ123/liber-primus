/**
 * LP2 p49-p51: exact original-table low-state PRNG eliminator.
 * SFT: node sims/lp2_p50_unwhitened_prng_state_rank_sft.cjs
 * Source: resources/liber-primus/lp2-grid-256.json
 * Read-only; no seed search, file writes or plaintext fitting.
 */
'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const source = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const tokens = source.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);
assert.equal(source.pages.map(p => p.rows).join(','), '10,13,9');
assert.equal(source.alphabet, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx');

/** @param {boolean} omitF */
function decode(omitF) {
  const alphabet = omitF ? source.alphabet.replace('f', '') : source.alphabet;
  const radix = alphabet.length;
  const bytes = tokens.map(t => {
    assert.equal(t.length, 2);
    const hi = alphabet.indexOf(t[0]);
    const lo = alphabet.indexOf(t[1]);
    assert.ok(hi >= 0 && lo >= 0, 'invalid token ' + t);
    const value = hi * radix + lo;
    assert.ok(value >= 0 && value < 256, 'nonbyte ' + t);
    return value;
  });
  if (!omitF) assert.deepEqual(bytes, source.bytes);
  const hash = crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex');
  assert.equal(hash, omitF
    ? '511d4fdb69ffbae4707ef93acf7465421f5480208e28d8e8c598cafa0d33cb79'
    : '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
  return bytes;
}

/** @param {number[]} bytes */
function columnMajor(bytes) {
  assert.equal(bytes.length, 256);
  const out = [];
  for (let col = 0; col < 8; col++) {
    for (let row = 0; row < 32; row++) out.push(bytes[8 * row + col]);
  }
  return out;
}

/**
 * Rank over GF(2) of block Hankel matrix (8 * window) by (N-window+1).
 * Each of the 8 bitplanes supplies one row per delayed vector observation.
 * Any stationary GF(2)-linear n-bit state with fixed byte-linear output
 * makes this rank <= n regardless of unknown state or feedback matrix.
 * @param {number[]} bytes
 * @param {number} window
 */
function blockHankelRank(bytes, window = 29) {
  const cols = bytes.length - window + 1;
  const pivots = new Map();
  for (let lag = 0; lag < window; lag++) {
    for (let bit = 0; bit < 8; bit++) {
      let row = 0n;
      for (let j = 0; j < cols; j++) {
        if ((bytes[lag + j] >>> bit) & 1) row |= 1n << BigInt(j);
      }
      while (row !== 0n) {
        const lowest = row & -row;
        const position = lowest.toString(2).length - 1;
        const known = pivots.get(position);
        if (known === undefined) {
          pivots.set(position, row);
          break;
        }
        row ^= known;
      }
    }
  }
  return pivots.size;
}

/**
 * For any byte slice of an additive 32-bit stream S_i=S_{i-3}+S_{i-31},
 * each observed byte x obeys (x_i-x_{i-3}-x_{i-31}) mod256 in {0,1}.
 * The statement includes glibc random() low byte and its high-byte slice.
 * @param {number[]} bytes
 */
function additive31CarryTest(bytes) {
  let pass = 0;
  let firstFailure = null;
  for (let i = 31; i < bytes.length; i++) {
    const delta = (bytes[i] - bytes[i - 3] - bytes[i - 31]) & 255;
    if (delta === 0 || delta === 1) pass++;
    else if (firstFailure === null) firstFailure = { index: i, delta };
  }
  return { pass, tested: bytes.length - 31, firstFailure };
}

/**
 * All secret affine recurrences x_i=a*x_{i-1}+b mod256.
 * Includes projected low bytes of any 2^k-modulus affine LCG.
 * @param {number[]} bytes
 */
function matchingByteLcgs(bytes) {
  const matches = [];
  for (let a = 0; a < 256; a++) {
    const b = (bytes[1] - a * bytes[0]) & 255;
    if (bytes.every((x, i) => i === 0 || ((a * bytes[i - 1] + b) & 255) === x)) {
      matches.push({ a, b });
    }
  }
  return matches;
}

// Independent forward plants: a complete native low-state GF(2)-linear
// generator, a byte LCG, and the additive 31/3 carry rule.
function xorshift32Plant() {
  let x = 0x9e3779b9;
  const out = [];
  for (let i = 0; i < 256; i++) {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    out.push((x >>> 24) & 255);
  }
  return out;
}
function xorshift128Plant() {
  let x = 123456789, y = 362436069, z = 521288629, w = 88675123;
  const out = [];
  for (let i = 0; i < 256; i++) {
    const t = (x ^ (x << 11)) >>> 0;
    x = y;
    y = z;
    z = w;
    w = (w ^ (w >>> 19) ^ t ^ (t >>> 8)) >>> 0;
    out.push(w >>> 24);
  }
  return out;
}
function additive31Plant() {
  const states = Array.from({ length: 31 }, (_, i) => Math.imul(0x9e3779b9, i + 1) >>> 0);
  for (let i = 31; i < 256; i++) states.push((states[i - 3] + states[i - 31]) >>> 0);
  return states.map(x => (x >>> 1) & 255);
}

assert.ok(blockHankelRank(xorshift32Plant()) <= 32);
assert.ok(blockHankelRank(xorshift128Plant()) <= 128);
const lcgPlant = [203];
for (let i = 1; i < 256; i++) lcgPlant.push((173 * lcgPlant[i - 1] + 57) & 255);
assert.ok(matchingByteLcgs(lcgPlant).some(x => x.a === 173 && x.b === 57));
assert.deepEqual(additive31CarryTest(additive31Plant()), { pass: 225, tested: 225, firstFailure: null });

const expected = [
  { radix: 'base60', order: 'row', rank: 227, carry: 4 },
  { radix: 'base60', order: 'column', rank: 228, carry: 2 },
  { radix: 'base59', order: 'row', rank: 228, carry: 3 },
  { radix: 'base59', order: 'column', rank: 228, carry: 2 },
];
for (const control of expected) {
  const raw = decode(control.radix === 'base59');
  const bytes = control.order === 'column' ? columnMajor(raw) : raw;
  const rank = blockHankelRank(bytes);
  const carry = additive31CarryTest(bytes);
  const lcg = matchingByteLcgs(bytes);
  assert.equal(rank, control.rank);
  assert.equal(carry.pass, control.carry);
  assert.equal(carry.tested, 225);
  assert.equal(carry.firstFailure.index, 31);
  assert.equal(lcg.length, 0);
  console.log(control.radix.padEnd(6) + ' ' + control.order.padEnd(6) +
    ' rank=' + rank + '/228; additive3,31=' + carry.pass + '/225; affine-byte-LCG=' + lcg.length);
}
console.log('PASS: original 256 printed cells, SHA256 both radices, 4 order/radix gates, 3 generator plants');
