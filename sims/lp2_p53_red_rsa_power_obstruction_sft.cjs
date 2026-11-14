'use strict';
/**
 * Source-exact RSA power-residue obstruction for the LP2 p53 red numeral
 * against the full p49-p51 256-byte integer. Windows 11 / Node.js 22:
 *   node sims/lp2_p53_red_rsa_power_obstruction_sft.cjs
 *
 * N is a putative modulus, R the putative ciphertext. The claim concerns
 * C = M^e (mod N) for integer e >= 2, without assuming any chosen e.
 * Neither this role assignment nor RSA is authenticated by Cicada.
 * @module lp2_p53_red_rsa_power_obstruction_sft
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
/** @param {string} filename @returns {unknown} */
const load = filename => JSON.parse(fs.readFileSync(path.join(root, filename), 'utf8'));
const grid = load('resources/liber-primus/base60-grid.json');
const corpus = load('resources/liber-primus/lp2-corpus.json');
const ink = load('resources/liber-primus/lp2-ink-annotations.json');

/** @param {number[]} values @param {number} radix @returns {bigint} */
function numeral(values, radix) {
  return values.reduce((n, v) => n * BigInt(radix) + BigInt(v), 0n);
}
/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a, b) {
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}
/** @param {bigint} base @param {bigint} exponent @param {bigint} modulus @returns {bigint} */
function powmod(base, exponent, modulus) {
  let acc = 1n;
  for (let n = base % modulus, e = exponent; e; e >>= 1n, n = n * n % modulus) {
    if (e & 1n) acc = acc * n % modulus;
  }
  return acc;
}
/** @param {bigint} x @param {bigint} p @returns {number} */
function valuation(x, p) {
  let v = 0;
  while (x !== 0n && x % p === 0n) { x /= p; v++; }
  return v;
}
const bytes = grid.byte_rows.flat();
assert.equal(bytes.length, 256);
assert.equal(grid.byte_rows.length, 32);
assert.ok(grid.byte_rows.every(row => row.length === 8));
assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const N = numeral(bytes, 256);
const sourcePage = corpus.pages.find(p => p.page === 53);
const sourceInk = ink.pages.find(p => p.page === 53);
assert.ok(sourcePage && sourceInk);
assert.equal(sourcePage.indices.length, 179);
assert.equal(sourceInk.rune_count, 179);
assert.equal(sourceInk.red_spans.length, 1);
const [{start, length, runes}] = sourceInk.red_spans;
assert.deepEqual([start, length], [128, 51]);
assert.equal([...runes].length, 51);
const redIndices = sourcePage.indices.slice(start, start + length);
assert.deepEqual(redIndices.map(i => corpus.runes[i]).join(''), runes);
const R = numeral(redIndices, 29);
assert.ok(R < N);

// This is an exact obstruction to every exponent e >= 2, without a key search.
// If N is divisible by p^a and C=M^e mod N, then v_p(C) is either
// 0 or >= min(a,e); valuation exactly one is impossible when a>=2.
assert.equal(valuation(N, 2n), 4);
assert.equal(valuation(N, 179n), 2);
assert.equal(valuation(R, 2n), 1);
assert.equal(valuation(R, 179n), 1);
assert.equal(N % 16n, 0n);
assert.equal(R % 16n, 6n);
assert.equal(N % (179n * 179n), 0n);
assert.equal(R % (179n * 179n), 29535n);
assert.equal(gcd(N, R), 358n);
const notSquareMod16 = new Set([0n, 1n, 4n, 9n]);
assert.equal(notSquareMod16.has(R % 16n), false);

// Source-shaped exponentiations on a known modulus confirm the
// necessary valuation law with coprime/non-coprime planted messages.
for (const exponent of [2n, 3n, 17n, 65537n]) {
  for (const message of [11n, 179n, 2n, 2n * 179n, 11n * 179n]) {
    const c = powmod(message, exponent, N);
    assert.equal(powmod(message, exponent, 16n), c % 16n);
    assert.equal(powmod(message, exponent, 179n * 179n), c % (179n * 179n));
    assert.notEqual(valuation(c % 16n, 2n), 1);
    assert.notEqual(valuation(c % (179n * 179n), 179n), 1);
    assert.notEqual(c, R);
  }
}
console.log(JSON.stringify({
  result: 'PASS', source: 'LP2 physical p49-p51 256 bytes and p53 red 51 runes',
  modulusBits: N.toString(2).length,
  redNumeralBits: R.toString(2).length,
  sourcePageRuneCount: sourcePage.indices.length,
  tests: { gridValuations: {two: 4, p179: 2},
    redValuations: {two: 1, p179: 1},
    redMod16: String(R % 16n), redMod179Squared: String(R % (179n * 179n)),
    gcd: String(gcd(N, R)), positivePowerPlants: 20 },
  conclusion: 'R cannot equal M^e mod N for any integer M and e>=2',
  limit: 'Only this candidate N/R assignment and exact modular-power consumer' }, null, 2));
