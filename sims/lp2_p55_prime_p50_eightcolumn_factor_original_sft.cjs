'use strict';

/**
 * Source-selected conditional bridge: the original LP2 32x8 numeric panel
 * as eight separate 256-bit RSA-style composites, with the p55 43-interior
 * factor P (a certified 206-bit prime) as one putative divisor.
 *
 * The 8-column reading is separately observable in original p49--51 imagery;
 * the factor and word-shed interpretation remain hypothetical. This tests
 * direct factor reuse, with no search over passwords, offsets or transforms.
 *
 * Node.js 22 / Windows 11: node sims/lp2_p55_prime_p50_eightcolumn_factor_original_sft.cjs
 */
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const table = require('../resources/liber-primus/lp2-grid-256.json');

const cipher55 = corpus.pages.find(p => p.page === 55).indices;
const lengths = [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
assert.equal(cipher55.length, 76);
assert.equal(lengths.reduce((a, n) => a + n, 0), 76);
const interior = [];
let at = 0;
for (let j = 0; j < lengths.length; j += 1) {
  const word = cipher55.slice(at, at + lengths[j]);
  if (j !== 0) interior.push(...word.slice(1, -1));
  at += lengths[j];
}
assert.equal(interior.length, 43);
const n43 = interior.reduce((n, i) => n * 29n + BigInt(i), 0n);
assert.equal(n43 % 8n, 0n);
const P = n43 / 8n;
assert.equal(P, 63755441409934721069036418908763882578170591536653256311514221n);
assert.equal(P.toString(2).length, 206);
assert.equal(table.shape, '32 rows by 8 columns across LP2 pages 49, 50, 51');
const tokens = table.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);

/** @param {number[]} bytes @returns {bigint} */
function bigEndian(bytes) {
  return bytes.reduce((v, b) => 256n * v + BigInt(b), 0n);
}
/** @param {bigint} n @returns {number[]} */
function unpack32(n) {
  assert(n >= 0n && n < (1n << 256n));
  const bytes = Array(32).fill(0);
  for (let i = 31; i >= 0; i -= 1) {
    bytes[i] = Number(n & 255n);
    n >>= 8n;
  }
  assert.equal(n, 0n);
  return bytes;
}
/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a, b) {
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

// A planted 255-bit direct composite is exactly detected in the same
// column-packing format, with a 49-bit cofactor and this original P.
const composite = P * ((1n << 48n) + 37n);
assert(composite < (1n << 256n));
assert.equal(bigEndian(unpack32(composite)), composite);
assert.equal(gcd(composite, P), P);

const cases = [];
for (const radix of [59, 60]) {
  const alphabet = radix === 59 ? table.alphabet.replace('f', '') : table.alphabet;
  assert.equal(alphabet.length, radix);
  const bytes = tokens.map(token => {
    const hi = alphabet.indexOf(token[0]), lo = alphabet.indexOf(token[1]);
    assert(hi >= 0 && lo >= 0);
    const b = radix * hi + lo;
    assert(b >= 0 && b <= 255);
    return b;
  });
  if (radix === 60) assert.deepEqual(bytes, table.bytes);
  for (let col = 0; col < 8; col += 1) {
    const column = Array.from({length: 32}, (_, row) => bytes[row * 8 + col]);
    for (const endianness of ['big', 'little']) {
      const selected = endianness === 'big' ? column : column.slice().reverse();
      const N = bigEndian(selected);
      assert.deepEqual(unpack32(N), selected);
      cases.push({
        radix, column: col + 1, endianness, bits: N.toString(2).length,
        remainder: (N % P).toString(), gcd: gcd(N, P).toString(),
      });
    }
  }
}
assert.equal(cases.length, 32);
assert(cases.every(row => row.gcd === '1' && row.remainder !== '0'));
console.log(JSON.stringify({
  original_inner43_base29: n43.toString(),
  candidate_factor: P.toString(),
  source_table: '8 columns x 32 original base59/base60 byte values',
  direct_factor_cases: cases,
  planted_positive: true,
  conclusion: 'All 32 direct column-factor receivers excluded; no plaintext or key.',
}, null, 2));
console.log('PASS');
