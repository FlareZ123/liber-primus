'use strict';
/**
 * LP2 p23–26: historical SSSS whole-field share-format gate.
 * Run: node sims/lp2_p23_26_ssss201_field_gate_sft.cjs
 * Node 22, CommonJS, no third-party dependencies.
 *
 * The archived 2013 SSSS has decimal identifiers, fixed-length hex Y,
 * a monic degree-5 polynomial over GF(2^(8*n)) for five-of-ten, and
 * XTEA diffusion of coefficient zero. Authentic 2013 shares test the
 * polynomial layer here; the LP2 test requires no fitted secret.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const c = JSON.parse(fs.readFileSync(path.join(__dirname,
  '../resources/liber-primus/lp2-corpus.json'), 'utf8'));
const pages = c.pages.filter(p => p.page >= 23 && p.page <= 26);
assert.deepEqual(pages.map(p => p.indices.length), [213, 270, 273, 265]);
const all = pages.flatMap(p => p.indices);
assert.deepEqual(all.slice(0, 16),
  [1,24,7,21,6,14,23,6,10,17,10,12,16,17,10,26]);
const body = all.slice(16);
assert.equal(body.length, 1005);
// Optional tested 976-bit field, not ssss 0.5's historical maximum (1024 bits).
const MAX = 1n << 976n;
const HISTORICALLY_SUPPORTED_984 = 1n << 984n;
const capacityBits = 201 * Math.log2(29);
assert.ok(29n ** 201n > MAX && 29n ** 201n < HISTORICALLY_SUPPORTED_984);

/** @param {number[]} digits @returns {bigint} */
function parse29(digits) {
  assert.equal(digits.length, 201);
  return digits.reduce((v, d) => {
    assert.ok(Number.isInteger(d) && d >= 0 && d < 29);
    return 29n * v + BigInt(d);
  }, 0n);
}
/** @param {bigint} value @returns {number[]} */
function print29(value) {
  assert.ok(value >= 0n && value < MAX);
  const out = Array(201).fill(0);
  for (let i = 200; i >= 0; i--) {
    out[i] = Number(value % 29n);
    value /= 29n;
  }
  assert.equal(value, 0n);
  return out;
}
/**
 * Historical ssss.c uses x^degree+x^a+x^b+x^c+1.
 * @param {number} degree
 * @param {number[]} taps
 */
function gf(degree, taps) {
  const top = 1n << BigInt(degree);
  const polynomial = taps.reduce((p, n) =>
    p | (1n << BigInt(n)), top | 1n);
  /** @param {bigint} x @param {bigint} y @returns {bigint} */
  function mul(x, y) {
    let z = 0n;
    while (y) {
      if (y & 1n) z ^= x;
      y >>= 1n;
      x <<= 1n;
      if (x & top) x ^= polynomial;
    }
    return z;
  }
  /** @param {bigint} value @returns {bigint} */
  function inv(value) {
    assert.notEqual(value, 0n);
    let u = value, v = polynomial, a = 1n, b = 0n;
    while (u !== 1n) {
      assert.notEqual(u, 0n);
      let shift = u.toString(2).length - v.toString(2).length;
      if (shift < 0) {
        [u, v] = [v, u]; [a, b] = [b, a]; shift = -shift;
      }
      u ^= v << BigInt(shift);
      a ^= b << BigInt(shift);
    }
    while (a >= top) {
      a ^= polynomial << BigInt(a.toString(2).length - degree - 1);
    }
    return a;
  }
  /** @param {bigint} x @param {number} n @returns {bigint} */
  function pow(x, n) {
    let r = 1n;
    for (let i = 0; i < n; i++) r = mul(r, x);
    return r;
  }
  /**
   * Recover SSSS encoded constant: y=x^5+c4*x^4+...+c0.
   * @param {bigint[]} ids @param {bigint[]} ys @returns {bigint}
   */
  function restore(ids, ys) {
    assert.equal(ids.length, 5);
    assert.equal(new Set(ids.map(String)).size, 5);
    let result = 0n;
    for (let i = 0; i < 5; i++) {
      let basis = 1n;
      for (let j = 0; j < 5; j++) {
        if (i === j) continue;
        basis = mul(basis, mul(ids[j], inv(ids[i] ^ ids[j])));
      }
      result ^= mul(ys[i] ^ pow(ids[i], 5), basis);
    }
    return result;
  }
  /** @param {bigint[]} coeff @param {bigint} x @returns {bigint} */
  function split(coeff, x) {
    let y = x;
    // ssss.c horner(n): x starts the monic term; multiply after c4..c1,
    // then XOR c0 without another multiplication (true degree five).
    for (let i = 4; i >= 1; i--) y = mul(y ^ coeff[i], x);
    return y ^ coeff[0];
  }
  return { mul, inv, restore, split };
}
const h = gf(176, [11,3,2]);
const historical = [
  [2n, 0x41cc481a51fe77f91600f593c1db2ce9babd2626ea6en],
  [3n, 0x7678a5f6b72042d839151b34b02ffe161cf997fed484n],
  [5n, 0xfcd82965b6632ea25d80edc3e58baafb4b2938895cbdn],
  [7n, 0xf3adb3aacb0b4336fa28178bc1e5edce940c16ce5caan],
  [8n, 0xb970e507dbc4ac115a273126f62671654c480fce32e5n]
];
assert.equal(h.mul(0x7afn, h.inv(0x7afn)), 1n);
assert.equal(h.restore(historical.map(p => p[0]), historical.map(p => p[1])),
  0x65b9c4065cc47a4a48e01d17de166a94252dfbb44e69n);
const g = gf(976, [17,10,6]);
assert.equal(g.mul(0x7afn, g.inv(0x7afn)), 1n);
/** @param {number} id @returns {bigint} */
function coefficient(id) {
  const hex = [0, 1].map(i => crypto.createHash('sha512')
    .update('LP2 historical SSSS field SFT ' + id + '/' + i)
    .digest('hex')).join('').slice(0, 244);
  return BigInt('0x' + hex);
}
const coeff = Array.from({length:5}, (_, i) => coefficient(i));
const ids = [1n,2n,3n,4n,5n];
const y = ids.map(id => g.split(coeff, id));
assert.deepEqual(y.map(a => parse29(print29(a))), y);
assert.equal(g.restore(ids, y), coeff[0]);

const layouts = {
  interleavedColumns: Array.from({length:5}, (_,k) =>
    body.filter((_,j) => j%5===k)),
  consecutiveBlocks: Array.from({length:5}, (_,k) =>
    body.slice(k*201,(k+1)*201))
};
const checks = {};
for (const [layout, lanes] of Object.entries(layouts)) {
  checks[layout] = {};
  for (const [reading, reverse] of [['original',false],['reverseEachLane',true]]) {
    const vs = lanes.map(d => parse29(reverse ? [...d].reverse() : d));
    assert.ok(vs.every(v => v < HISTORICALLY_SUPPORTED_984));
    const invalid = vs.flatMap((v,i) => v >= MAX ? [i] : []);
    assert.ok(invalid.length >= 2);
    checks[layout][reading] = {
      bitLengths: vs.map(v => v.toString(2).length),
      invalidLaneIndices: invalid
    };
  }
}
assert.deepEqual(checks.interleavedColumns.original.invalidLaneIndices,[0,3]);
assert.deepEqual(checks.consecutiveBlocks.original.invalidLaneIndices,[0,2]);
console.log(JSON.stringify({
  pages:[23,24,25,26], headingRunes:16, bodyRunes:body.length,
  field:'historical ssss 0.5, GF(2^degree), monic degree-five',
  historical176BitControl:'reproduces original encoded coefficient zero',
  synthetic976BitControl:'5 lossless shares reconstructed exactly',
  base29CapacityBits:capacityBits, testedFieldBytes:122,
  historicalSupportedLosslessFieldBytes:123,
  minimumDigitsFor123Bytes:Math.ceil(984/Math.log2(29)),
  results:checks,
  decision:'Four layouts fail only optional 976-bit field. Every original value fits historical-program-supported 984-bit field; no selected key/plaintext.',
},null,2));
