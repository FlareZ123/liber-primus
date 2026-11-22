'use strict';

/**
 * Source-frozen Parable/2013-audio Blum-Blum-Shub original LP2 inverse.
 * Windows 11 / Node.js 22 CommonJS SFT. Only local committed inputs are read.
 *
 * The three independently recovered 2013-audio factors are 1259, 1031,
 * and 1229, identical to the solved p57 PARABLE clause GP-prime sums.
 * The unique two factors congruent to 3 mod 4 define the standard BBS
 * modulus; the third independently selects its coprime seed.
 * This mathematical observation does not establish authorial cipher intent.
 */
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');

const P = 1259;
const Q = 1031;
const SEED = 1229;
const MOD = P * Q;
const CHAPTERS = new Set([0, 3, 8, 15, 23, 27, 33, 40, 54]);
const pages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length);
const solved = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(pages.length, 55);
assert.equal(pages.reduce((n, p) => n + p.indices.length, 0), 12956);
assert.deepEqual([P % 4, Q % 4, SEED % 4], [3, 3, 1]);
assert.equal(P * Q * SEED, 1595277641);
assert.equal((SEED * SEED) % MOD, 212412);

/**
 * @param {number} n
 * @returns {boolean}
 */
function isPrime(n) {
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return n >= 2;
}
assert.ok([P, Q, SEED].every(isPrime));

/**
 * Yield field residues of the exact seeded BBS sequence.
 * @param {'mod'|'scaled'|'bits'} reducer
 * @param {28|29} base
 * @returns {() => number}
 */
function bbs(reducer, base) {
  let x = (SEED * SEED) % MOD;
  function advance() {
    x = (x * x) % MOD;
    return x;
  }
  return () => {
    if (reducer === 'mod') return advance() % base;
    if (reducer === 'scaled') return Math.floor((advance() * base) / MOD);
    // Conventional BBS parity-bit extraction, grouped MSB first in five-bit
    // units, rejecting the 32-base excess without input-dependent phase fits.
    while (true) {
      let v = 0;
      for (let i = 0; i < 5; i++) v = 2 * v + (advance() % 2);
      if (v < base) return v;
    }
  };
}

function exactStatePeriod() {
  let x = (SEED * SEED) % MOD;
  const first = x;
  for (let i = 1; i <= MOD; i++) {
    x = (x * x) % MOD;
    if (x === first) return i;
  }
  throw new Error('BBS cycle not found');
}
assert.equal(exactStatePeriod(), 612);

/** @param {number[]} a @returns {number} */
function ioc(a) {
  const f = new Array(29).fill(0);
  for (const v of a) f[v]++;
  return f.reduce((s, v) => s + v * (v - 1), 0) / (a.length * (a.length - 1));
}

const pow15 = [];
const log15 = new Array(29).fill(-1);
let power = 1;
for (let i = 0; i < 28; i++) {
  pow15.push(power);
  log15[power] = i;
  power = (15 * power) % 29;
}
assert.equal(power, 1);
assert.equal(new Set(pow15).size, 28);

/**
 * @param {number[]} text
 * @param {() => number} next
 * @param {boolean} encrypt
 * @returns {number[]}
 */
function direct29(text, next, encrypt) {
  return text.map((v) => (v + (encrypt ? next() : 29 - next())) % 29);
}

/**
 * @param {number[]} text
 * @param {() => number} next
 * @param {'cyclic'|'sorted'|'power15'} rank
 * @param {0|28} marker
 * @param {boolean} encrypt
 * @returns {number[]}
 */
function rank28(text, next, rank, marker, encrypt) {
  const out = [text[0]];
  for (let i = 1; i < text.length; i++) {
    const prev = encrypt ? out[i - 1] : text[i - 1];
    const v = text[i];
    if (encrypt && v === marker) {
      out.push(prev);
      continue;
    }
    if (!encrypt && v === prev) {
      out.push(marker);
      continue;
    }
    if (encrypt) {
      const inputRank = v < marker ? v : v - 1;
      const cipherRank = (inputRank + next()) % 28;
      if (rank === 'cyclic') out.push((prev + cipherRank + 1) % 29);
      else if (rank === 'sorted') out.push(cipherRank < prev ? cipherRank : cipherRank + 1);
      else out.push((prev + pow15[cipherRank]) % 29);
      continue;
    }
    const diff = (v - prev + 29) % 29;
    const cipherRank = rank === 'cyclic'
      ? diff - 1
      : rank === 'sorted' ? (v < prev ? v : v - 1) : log15[diff];
    assert.ok(cipherRank >= 0 && cipherRank < 28);
    const inputRank = (cipherRank - next() + 28) % 28;
    out.push(inputRank < marker ? inputRank : inputRank + 1);
  }
  return out;
}

/** @param {string} scope @param {number} page */
function shouldReset(scope, page) {
  return scope === 'page' || (scope === 'chapter' && CHAPTERS.has(page));
}

/**
 * @param {'book'|'chapter'|'page'} scope
 * @param {'mod'|'scaled'|'bits'} reducer
 * @param {'direct29'|'rank28'} family
 * @param {'cyclic'|'sorted'|'power15'} rank
 * @param {0|28} marker
 * @returns {number[]}
 */
function original(scope, reducer, family, rank, marker) {
  const base = family === 'direct29' ? 29 : 28;
  let next = bbs(reducer, base);
  const output = [];
  for (const page of pages) {
    if (shouldReset(scope, page.page)) next = bbs(reducer, base);
    const a = page.indices;
    const decoded = family === 'direct29'
      ? direct29(a, next, false)
      : rank28(a, next, rank, marker, false);
    output.push(...decoded);
  }
  return output;
}

// Test the exact inversion with independent, already solved native-GP words.
// In the chain model the initial symbol is an externally transmitted IV.
for (const reducer of ['mod', 'scaled', 'bits']) {
  const originalDirect = direct29(solved, bbs(reducer, 29), true);
  assert.deepEqual(direct29(originalDirect, bbs(reducer, 29), false), solved);
  for (const rank of ['cyclic', 'sorted', 'power15']) for (const marker of [0, 28]) {
    const plant = rank28(solved, bbs(reducer, 28), rank, marker, true);
    const recovered = rank28(plant, bbs(reducer, 28), rank, marker, false);
    assert.deepEqual(recovered.slice(1), solved.slice(1));
    assert.deepEqual(rank28(recovered, bbs(reducer, 28), rank, marker, true), plant);
  }
}

const results = [];
for (const scope of ['book', 'chapter', 'page']) for (const reducer of ['mod', 'scaled', 'bits']) {
  results.push({
    scope, reducer, family: 'direct29',
    ioc: ioc(original(scope, reducer, 'direct29', 'cyclic', 0))
  });
  for (const rank of ['cyclic', 'sorted', 'power15']) for (const marker of [0, 28]) {
    results.push({
      scope, reducer, family: 'rank28', rank, marker,
      ioc: ioc(original(scope, reducer, 'rank28', rank, marker))
    });
  }
}
assert.equal(results.length, 63);
results.sort((a, b) => b.ioc - a.ioc);
const all = pages.flatMap((p) => p.indices);
assert.ok(Math.abs(ioc(all) - 0.03447839786450569) < 1e-12);
assert.ok(Math.abs(ioc(solved) - 0.06270996640537514) < 1e-12);
assert.ok(Math.abs(results[0].ioc - 0.03529534216632514) < 1e-12);
assert.ok(Math.abs(results[results.length - 1].ioc - 0.034455686431610885) < 1e-12);
assert.ok(results[0].ioc < 0.04);

console.log(JSON.stringify({
  source: '2013 AUDIO/761.MP3 ID3 factorization and solved LP2 p57 PARABLE',
  factorPrimes: [1259, 1031, 1229],
  BBS: {p: P, q: Q, seed: SEED, modulus: MOD, firstState: 212412, exactPeriod: 612},
  pages: pages.length, symbols: all.length, tested: results.length,
  originalIoC: ioc(all), solvedP57IoC: ioc(solved),
  maxCandidate: results[0], minCandidate: results[results.length - 1],
  fullResults: results,
  establishedPlaintextRecovered: false,
  interpretation: 'This exact BBS seed plus finite BBS-to-GP28/29 inverses does not decode native-GP text.'
}, null, 2));
