'use strict';

/**
 * Original-cipher, all-secret-alphabet gate for direct RSA residue packets
 * in the seven 1033/3301-headed LP2 pages (p33..p39).
 *
 * Execute from any working directory with Node 22:
 *   node sims/lp2_p33_39_1033_3301_rsa_packet_sft.cjs
 *
 * Uses only the pinned original GP29 corpus; never fits a key to original text.
 */
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');

const BASE = 29;
const FIRST_PAGE = 33;
const LAST_PAGE = 39;
const pages = corpus.pages.filter((p) => p.page >= FIRST_PAGE && p.page <= LAST_PAGE);
assert.equal(pages.length, 7);
const stream = pages.flatMap((p) => p.indices);
assert.equal(stream.length, 1680);
for (const p of pages) assert.equal(p.indices.length, p.runic_count);

/**
 * Count different printed glyph identities at the leading digit of every
 * complete width-symbol packet, for a particular source-visible phase.
 * A secret fixed bijection can rename identities, but cannot reduce their count.
 *
 * @param {number[]} symbols Original rune indices.
 * @param {number} width Packet digit width.
 * @param {number} phase Packet offset.
 * @returns {number}
 */
function distinctLeaders(symbols, width, phase) {
  const leaders = new Set();
  for (let i = phase; i + width <= symbols.length; i += width) {
    leaders.add(symbols[i]);
  }
  return leaders.size;
}

/**
 * @param {number} value Integer in [0, 29^width).
 * @param {number} width Fixed packet size.
 * @returns {number[]}
 */
function digits(value, width) {
  const out = new Array(width).fill(0);
  let x = value;
  for (let i = width - 1; i >= 0; i--) {
    out[i] = x % BASE;
    x = Math.floor(x / BASE);
  }
  assert.equal(x, 0);
  return out;
}

/**
 * @param {number[]} d Base-29 digits.
 * @returns {number}
 */
function integer(d) {
  return d.reduce((x, z) => x * BASE + z, 0);
}

/**
 * @param {bigint} a
 * @param {bigint} b
 * @param {bigint} m
 * @returns {bigint}
 */
function modPow(a, b, m) {
  let value = 1n;
  let base = a % m;
  let exp = b;
  while (exp > 0n) {
    if (exp & 1n) value = (value * base) % m;
    base = (base * base) % m;
    exp >>= 1n;
  }
  return value;
}

/**
 * @param {bigint} a
 * @param {bigint} m
 * @returns {bigint}
 */
function modularInverse(a, m) {
  let [oldR, r] = [a, m];
  let [oldS, s] = [1n, 0n];
  while (r !== 0n) {
    const q = oldR / r;
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
  }
  assert.equal(oldR, 1n);
  return ((oldS % m) + m) % m;
}

// Minimal fixed-length unsigned base-29 representation of each candidate
// modulus's RSA/field residue. 1033 and 3301 are printed repeatedly on these
// seven pages; their arithmetic use as RSA factors remains hypothetical.
const primes = [1033, 3301];
const candidates = [
  { label: '1033', modulus: primes[0], width: 3 },
  { label: '3301', modulus: primes[1], width: 3 },
  { label: '1033*3301', modulus: primes[0] * primes[1], width: 5 },
];

for (const candidate of candidates) {
  const { label, modulus, width } = candidate;
  assert.ok(BASE ** (width - 1) < modulus && modulus <= BASE ** width);
  const allowed = Math.floor((modulus - 1) / BASE ** (width - 1)) + 1;
  const book = Array.from({ length: width }, (_, phase) =>
    distinctLeaders(stream, width, phase));
  const byPage = pages.map((p) => Array.from({ length: width }, (_, phase) =>
    distinctLeaders(p.indices, width, phase)));
  assert.ok(book.every((n) => n > allowed));
  assert.ok(byPage.every((row) => row.every((n) => n > allowed)));
  console.log(JSON.stringify({ label, modulus, width,
    allowable_distinct_leader_symbols: allowed,
    full_chapter_phase_leader_distinct: book,
    per_page_min_and_max_leaders: byPage.map((row, i) => ({
      page: pages[i].page, min: Math.min(...row), max: Math.max(...row)
    })),
    direct_fixed_alphabet_packets_possible: false
  }));
}

// Independent real modular-exponentiation GP-register plant:
// 336 blocks of four input runes are RSA-encrypted into 336 five-rune packets
// with the same 1033*3301 modulus.  The exact modular inverse recovers all
// 1,344 original input runes.  This establishes the shape of a valid source
// packet stream and guards against a false leading-digit exclusion.
const n = BigInt(primes[0] * primes[1]);
const phi = BigInt((primes[0] - 1) * (primes[1] - 1));
const e = 65537n;
const d = modularInverse(e, phi);
const count = stream.length / 5;
const plain = [];
const encoded = [];
for (let i = 0; i < count; i++) {
  const input = (i * 104729 + 17) % (BASE ** 4);
  const inputDigits = digits(input, 4);
  const residue = Number(modPow(BigInt(input), e, n));
  const outputDigits = digits(residue, 5);
  plain.push(...inputDigits);
  encoded.push(...outputDigits);
  assert.equal(integer(outputDigits), residue);
  assert.deepEqual(digits(Number(modPow(BigInt(residue), d, n)), 4), inputDigits);
}
assert.equal(plain.length, 1344);
assert.equal(encoded.length, 1680);
assert.ok(Array.from({ length: 5 }, (_, phase) =>
  distinctLeaders(encoded, 5, phase)).every((v, phase) =>
    phase !== 0 || v <= 5));
console.log('RSA positive plant: 336/336 true 4->5 packets recovered; 1344/1344 GP29 plaintext runes; 1680/1680 source-sized ciphertext runes.');
console.log('PASS: 1033, 3301 and product direct minimal-width base29 residue packets cannot represent original p33..p39 under any one stationary secret rune alphabet, with any packet phase or physical-page reset.');
