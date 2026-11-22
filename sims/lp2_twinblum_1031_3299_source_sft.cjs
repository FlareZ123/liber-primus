'use strict';

/**
 * Historical 2013 prime_echo lower-twin BBS candidate, source-only gate.
 * Windows 11 / Node.js 22: node sims/lp2_twinblum_1031_3299_source_sft.cjs
 * Reads immutable original corpus/table/historical sources. Makes no file writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const corpus = JSON.parse(source('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(source('resources/liber-primus/base60-grid.json'));
const primeEcho = source('resources/historical/cicada2013-os-original-prime-echo.sh');

const p = 1031;
const q = 3299;
const n = p * q;
const seeds = [3301, 1033, 1229, 761, 2, 449, 1259];

/** @param {number} v @returns {boolean} */
function isPrime(v) {
  if (!Number.isInteger(v) || v < 2) return false;
  for (let d = 2; d * d <= v; d += 1) {
    if (v % d === 0) return false;
  }
  return true;
}
/** @param {number} a @param {number} b @returns {number} */
function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}
/** @param {number} m @returns {number} */
function orderOfTwo(m) {
  let x = 1;
  for (let k = 1; k < m; k += 1) {
    x = (2 * x) % m;
    if (x === 1) return k;
  }
  throw new Error('2 lacks multiplicative order modulo ' + m);
}
/** @param {readonly number[]} a @returns {number} */
function ioc(a) {
  const f = Array(29).fill(0);
  for (const x of a) {
    assert(x >= 0 && x < 29);
    f[x] += 1;
  }
  return f.reduce((s, v) => s + v * (v - 1), 0) / (a.length * (a.length - 1));
}

/**
 * One explicit BBS transport, with no fitting to the original ciphertext.
 * @param {number} seed
 * @param {'state'|'5'|'8'} mode
 * @param {boolean} lsb
 * @param {boolean} after
 * @param {number} length
 * @returns {number[]}
 */
function gpPad(seed, mode, lsb, after, length) {
  let state = (seed * seed) % n;
  const take = () => {
    if (after) state = (state * state) % n;
    const bit = state & 1;
    if (!after) state = (state * state) % n;
    return bit;
  };
  const result = [];
  for (let i = 0; i < length; i += 1) {
    if (mode === 'state') {
      if (after) state = (state * state) % n;
      result.push(state % 29);
      if (!after) state = (state * state) % n;
      continue;
    }
    let val;
    do {
      val = 0;
      const size = mode === '5' ? 5 : 8;
      for (let j = 0; j < size; j += 1) {
        const bit = take();
        val = lsb ? val + (bit << j) : 2 * val + bit;
      }
    } while (mode === '5' && val > 28);
    result.push(val % 29);
  }
  return result;
}
/** @param {number[]} bytes @returns {number} */
function printableCount(bytes) {
  return bytes.filter((v) => (v >= 32 && v <= 126) || v === 9 || v === 10 || v === 13).length;
}

assert(isPrime(p) && isPrime(q), 'Both lower twins are prime');
assert.equal(p % 4, 3);
assert.equal(q % 4, 3);
assert.equal(n, 3401269);
assert(primeEcho.includes('"1033\t"; sleep 2'));
assert(primeEcho.includes('"3301\t"; sleep 2'));
assert(primeEcho.includes('"1031\t"; sleep .05'));
assert(primeEcho.includes('"3299\t"; sleep .05'));
const orderP = orderOfTwo((p - 1) / 2);
const orderQ = orderOfTwo((q - 1) / 2);
assert.deepEqual([orderP, orderQ], [204, 48]);
const universalBitPeriod = orderP * orderQ / gcd(orderP, orderQ);
assert.equal(universalBitPeriod, 816);
const bytePeriod = universalBitPeriod / 8;
assert.equal(bytePeriod, 102);

const p57 = corpus.pages.find((page) => page.page === 57).indices;
const first29Primes = [];
for (let x = 2; first29Primes.length < 29; x += 1) {
  if (isPrime(x)) first29Primes.push(x);
}
const bodySums = [[0, 7], [7, 37], [37, 67], [67, 95]]
  .map(([from, to]) => p57.slice(from, to).reduce((sum, rune) => sum + first29Primes[rune], 0));
assert.deepEqual(bodySums, [449, 1259, 1031, 1229]);

for (const seed of seeds) {
  let state = (seed * seed) % n;
  const start = state;
  for (let i = 1; i < universalBitPeriod; i += 1) {
    state = (state * state) % n;
    assert.notEqual(state, start, 'State orbit unexpectedly short for seed ' + seed);
  }
  assert.equal((state * state) % n, start, 'State must return after 816 squares');
}
const digits59 = grid.alphabet.replace('f', '');
assert.equal(grid.rows.length, 32);
assert.equal(grid.rows.flat().length, 256);
const byte60 = grid.byte_rows.flat();
const byte59 = grid.rows.flat().map((token) =>
  59 * digits59.indexOf(token[0]) + digits59.indexOf(token[1]));
assert(byte59.every((v) => v >= 0 && v <= 255));
assert.equal(byte60.length, 256);
const alternatives = [['base60', byte60], ['base59', byte59]];
for (const [label, bytes] of alternatives) {
  const repeatAt102 = bytes.slice(bytePeriod).filter((v, i) => v === bytes[i]).length;
  assert.equal(repeatAt102, 0, 'Direct 102-byte BBS stream would match all 154 byte pairs');
  const emptyAsciiKeyClasses = Array.from({ length: bytePeriod }, (_, r) => {
    const observed = bytes.filter((_, i) => i % bytePeriod === r);
    return Array.from({ length: 256 }, (_, k) => k)
      .filter((k) => printableCount(observed.map((v) => v ^ k)) === observed.length)
      .length === 0;
  }).filter(Boolean).length;
  assert.equal(emptyAsciiKeyClasses, label === 'base60' ? 60 : 61);
  console.log(label, {
    byteCount: bytes.length,
    exactDirectBbsPeriod102PairMatches: repeatAt102,
    pairComparisons: 154,
    impossibleAsciiXorClassesForAnyPeriod102Key: emptyAsciiKeyClasses
  });
}

const unknownPages = corpus.pages.filter((page) => page.page <= 55 && page.indices.length);
const full = unknownPages.flatMap((page) => page.indices);
const p33to39 = unknownPages.filter((page) => page.page >= 33 && page.page <= 39)
  .flatMap((page) => page.indices);
const sectionStart = unknownPages.filter((page) => page.page < 33)
  .reduce((sum, page) => sum + page.indices.length, 0);
assert.equal(full.length, 12956);
assert.equal(p33to39.length, 1680);
const scores = [];
for (const seed of seeds) {
  for (const mode of ['5', '8', 'state']) {
    for (const lsb of [false, true]) {
      if (mode === 'state' && lsb) continue;
      for (const after of [false, true]) {
        const pad = gpPad(seed, mode, lsb, after, full.length);
        for (const sign of [-1, 1]) {
          const decoded = full.map((v, i) => (v + sign * pad[i] + 29) % 29);
          const section = decoded.slice(sectionStart, sectionStart + p33to39.length);
          scores.push({ seed, mode, lsb, after, sign, book: ioc(decoded), section: ioc(section) });
        }
        const plant = p57.map((v, i) => (v + pad[i]) % 29);
        const recovered = plant.map((v, i) => (v - pad[i] + 29) % 29);
        assert.deepEqual(recovered, p57);
      }
    }
  }
}
assert.equal(scores.length, 140);
const bestBook = scores.reduce((a, b) => a.book > b.book ? a : b);
const bestSection = scores.reduce((a, b) => a.section > b.section ? a : b);
assert(bestBook.book < 0.035 && bestSection.section < 0.035,
  'No original direct transcript may be close to native GP-English IoC');
console.log('originalCipher', { book: ioc(full), section: ioc(p33to39), clearP57: ioc(p57) });
console.log('BBS twin-modulus', { p, q, n, qrOrders: [(p - 1) / 2, (q - 1) / 2],
  twoOrders: [orderP, orderQ], universalBitPeriod, bytePeriod, seedCount: seeds.length });
console.log('fullOriginalCandidates', scores.length, 'bestBook', bestBook, 'bestSection', bestSection);
console.log('PASS: original source values, all-state cycle, all-secret byte period ASCII obstruction, 140 direct original inverses, 70 solved-source plants');
