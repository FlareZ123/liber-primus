'use strict';

/**
 * Source-selected 2013 telnet missing-prime block versus 2014 p50 32x8
 * table inner ring. Full finite numerical test; no direct plaintext claim.
 * Windows Node.js 22, CommonJS, read-only, no dependencies.
 * Reproduction: node sims/lp2_2013_telnet_180gap_p50_interior_source_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
assert.equal(grid.bytes.length, 256);
assert.equal(grid.shape, '32 rows by 8 columns across LP2 pages 49, 50, 51');

/** @param {number} n @returns {boolean} */
function prime(n) {
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return n >= 2;
}
const primes = [];
for (let i = 2; i <= 1229; i++) if (prime(i)) primes.push(i);
const missing = primes.filter(p => p > 71 && p < 1229);
assert.equal(primes.length, 201);
assert.equal(primes.indexOf(71), 19);
assert.equal(primes.at(-1), 1229);
assert.equal(missing.length, 180);
assert.equal(missing[0], 73);
assert.equal(missing.at(-1), 1223);

// 2014 printed 32x8 grid. A one-cell-wide rim has 76 table slots.
const rim = [];
const inner = [];
for (let row = 0; row < 32; row++) {
  for (let col = 0; col < 8; col++) {
    const value = grid.bytes[row * 8 + col];
    assert.ok(Number.isInteger(value) && value >= 0 && value <= 255);
    if (row === 0 || row === 31 || col === 0 || col === 7) rim.push(value);
    else inner.push(value);
  }
}
assert.equal(inner.length, 180);
assert.equal(rim.length, 76);
assert.equal(inner.length + rim.length, 256);

/** @param {number[]} seq @returns {{count:number,rate:number}} */
function printable(seq) {
  const count = seq.filter(x => x >= 32 && x <= 126 || x === 9 || x === 10 || x === 13).length;
  return { count, rate: count / seq.length };
}
const lowPrime = missing.map(p => p & 255);
const minus = inner.map((n, i) => ((n - missing[i]) % 256 + 256) % 256);
const xor = inner.map((n, i) => n ^ lowPrime[i]);
const plus = inner.map((n, i) => (n + missing[i]) % 256);

/** @param {number[]} seq @returns {{hits:number,pairs:number,rate:number}} */
function gp29Ioc(seq) {
  const hist = Array(29).fill(0);
  for (const x of seq) hist[x % 29]++;
  const hits = hist.reduce((s, n) => s + n * (n - 1) / 2, 0);
  const pairs = seq.length * (seq.length - 1) / 2;
  return { hits, pairs, rate: hits / pairs };
}
assert.deepEqual(printable(inner), { count: 73, rate: 73 / 180 });
assert.deepEqual(printable(minus), { count: 70, rate: 70 / 180 });
assert.deepEqual(printable(xor), { count: 56, rate: 56 / 180 });
assert.deepEqual(printable(plus), { count: 70, rate: 70 / 180 });

// Independent generated-plaintext control: any source-like 180-byte ASCII
// message can be encrypted exactly under either key interpretation.
const text = 'LOSTPRIMESSUPPLYTHEKEY'.repeat(9).slice(0, 180);
const plain = [...Buffer.from(text, 'ascii')];
assert.equal(plain.length, 180);
const testAdd = plain.map((x, i) => (x + lowPrime[i]) % 256);
const testXor = plain.map((x, i) => x ^ lowPrime[i]);
assert.deepEqual(testAdd.map((x, i) => (x - lowPrime[i] + 256) % 256), plain);
assert.deepEqual(testXor.map((x, i) => x ^ lowPrime[i]), plain);
assert.equal(printable(plain).count, 180);

// One fixed source-order, source-modulus bridge has not found plaintext.
// This does not exclude another prime ordering, transposition, key schedule,
// byte/rune encoding, or the significance of the exact count coincidence.
console.log(JSON.stringify({
  periodSource: '2013 telnet primes documented as 71, then 1229',
  primaryCaveat: '2013 participant transcript; no surviving Cicada-signed prime-list command',
  missingPrimeRanksOneBased: [21, 200],
  missingPrimeCount: missing.length,
  missingPrimeBounds: [missing[0], missing.at(-1)],
  p50TableSize: grid.bytes.length,
  p50InteriorCount: inner.length,
  p50RimCount: rim.length,
  fixedTableOrder: '32x8 row-major, omit first/last rows and first/last columns',
  fixedPrimeOrder: 'increasing numerical order',
  bytes: {
    originalInner: printable(inner),
    subtractPrimeLowByte: printable(minus),
    xorPrimeLowByte: printable(xor),
    addPrimeLowByte: printable(plus)
  },
  GP29LowResidueIoc: {
    inner: gp29Ioc(inner), subtract: gp29Ioc(minus),
    xor: gp29Ioc(xor)
  },
  recoverablePositiveControl: { plaintextBytes: plain.length, byteExact: true },
  result: 'integer count match only; no direct printable textual payload'
}, null, 2));
