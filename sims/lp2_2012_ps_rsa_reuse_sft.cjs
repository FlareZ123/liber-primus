'use strict';

/** Historical 2012 P.S. RSA reuse gate on original LP2 sources (Node.js 22). */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'resources', 'liber-primus');
const grid = JSON.parse(fs.readFileSync(path.join(source, 'base60-grid.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(path.join(source, 'lp2-corpus.json'), 'utf8'));

const n = BigInt('10412790658919985359827898739594318956404425106955675643739226952372682423852959081739834390370374475764863415203423499357108713631');
const p = 99554414790940424414351515490472769096534141749790794321708050837n;
const q = 104593961812606247801193807142122161186583731774511103180935025763n;
const e = 65537n;
assert.equal(p * q, n, 'published 2012 RSA factors must reconstruct the P.S. integer');

/** @param {bigint} a @param {bigint} m @returns {bigint} */
function inverse(a, m) {
  let [r, nr, t, nt] = [m, a, 0n, 1n];
  while (nr !== 0n) {
    const z = r / nr;
    [r, nr] = [nr, r - z * nr];
    [t, nt] = [nt, t - z * nt];
  }
  assert.equal(r, 1n, 'RSA exponent coprimality');
  return (t % m + m) % m;
}

/** @param {bigint} b @param {bigint} exponent @returns {bigint} */
function modpow(b, exponent) {
  let x = 1n;
  while (exponent !== 0n) {
    if (exponent & 1n) x = x * b % n;
    b = b * b % n;
    exponent >>= 1n;
  }
  return x;
}

/** @param {number[]} octets @returns {bigint} */
function fromOctets(octets) {
  return octets.reduce((acc, value) => acc * 256n + BigInt(value), 0n);
}

/** @param {bigint} value @param {number} length @returns {number[]} */
function toOctets(value, length = 54) {
  const out = Array(length).fill(0);
  for (let i = length - 1; i >= 0; i--) {
    out[i] = Number(value & 255n);
    value >>= 8n;
  }
  assert.equal(value, 0n, 'output length');
  return out;
}

/** Strict PKCS #1 v1.5 block-type 1 or 2 framing, ≥8 pad octets. @param {number[]} a @returns {boolean} */
function pkcs1(a) {
  if (a[0] !== 0 || (a[1] !== 1 && a[1] !== 2)) return false;
  const divider = a.indexOf(0, 2);
  if (divider < 10 || divider >= a.length - 1) return false;
  return a[1] === 2 || a.slice(2, divider).every(v => v === 255);
}

const d = inverse(e, (p - 1n) * (q - 1n));
assert.equal(modpow(modpow(42n, e), d), 42n);
const testPad = [0, 2, ...Array(35).fill(1), 0, ...Buffer.from('LP2 PKCS1 test', 'ascii')];
while (testPad.length < 54) testPad.push(65);
assert.equal(testPad.length, 54);
assert.ok(pkcs1(testPad));
assert.deepEqual(toOctets(modpow(modpow(fromOctets(testPad), e), d)), testPad);

assert.equal(grid.byte_rows.length, 32);
const raw = grid.byte_rows.flat();
assert.equal(raw.length, 256);
assert.ok(raw.every(v => Number.isInteger(v) && v >= 0 && v <= 255));
let windows = 0;
let eligible = 0;
let v15 = 0;
let padded = 0;
let unusuallyPrintable = 0;
for (const reversed of [false, true]) {
  for (let offset = 0; offset <= raw.length - 54; offset++) {
    const a = raw.slice(offset, offset + 54);
    if (reversed) a.reverse();
    const cipher = fromOctets(a);
    windows++;
    if (cipher >= n) continue;
    eligible++;
    const plain = toOctets(modpow(cipher, d));
    if (plain[0] === 0 && [1, 2].includes(plain[1])) v15++;
    if (pkcs1(plain)) padded++;
    if (plain.filter(v => v >= 32 && v <= 126).length >= 38) unusuallyPrintable++;
  }
}
assert.equal(windows, 406);
assert.equal(eligible, 377);
assert.equal(v15, 0);
assert.equal(padded, 0);
assert.equal(unusuallyPrintable, 0);

const page = corpus.pages.find(p => p.page === 55);
assert.equal(page.indices.length, 76);
const terminal = [];
for (const reversed of [false, true]) {
  for (const units of ['ordinal', 'prime-remainder']) {
    const indices = reversed ? page.indices.slice().reverse() : page.indices;
    const digits = indices.map(j => units === 'ordinal' ? j : corpus.prime[j] % 29);
    const value = digits.reduce((acc, digit) => acc * 29n + BigInt(digit), 0n);
    assert.ok(value < n);
    for (const method of ['private', 'public']) {
      const output = toOctets(modpow(value, method === 'private' ? d : e));
      const printable = output.filter(v => v >= 32 && v <= 126).length;
      terminal.push({direction: reversed ? 'reverse' : 'printed', units, method, printable, pkcs1: pkcs1(output)});
    }
  }
}
assert.equal(terminal.length, 8);
assert.ok(terminal.every(t => !t.pkcs1 && t.printable <= 28));
console.log(JSON.stringify({
  source: '2012 signed P.S. integer and published two-prime factorization; LP2 printed 32×8 grid and p55 GP29 corpus',
  modulus_bits: n.toString(2).length,
  candidate_block_bytes: 54,
  table: {windows, eligible, blocks_with_PKCS1_header: v15, pkcs1_blocks: padded, blocks_with_38_printable: unusuallyPrintable},
  terminal,
  positive_control: 'synthetic type-2 RSA block exactly recovered',
  conclusion: 'No direct raw-RSA-to-PKCS1-v1.5 source-key reuse found under declared framing; key reuse itself is not source instructed.'
}, null, 2));
