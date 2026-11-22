'use strict';

/**
 * Source-only census for the p34 <-> p36 prime/totient mutual page pointer.
 *
 * Uses the canonical master transcription and LP2 corpus only. It maps LP2
 * p0..p57 to master image parts by exact rune-count equality, inventories
 * period-delimited units on unsolved p0..p55, and asks whether two units
 * point to one another by word count while their rune counts satisfy the
 * Wisdom operations prime-rank and Euler totient.
 *
 * SFT: node sims/lp2_p34_p36_prime_totient_mutual_pointer_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const master = fs.readFileSync(
  path.join(root, 'resources/transcriptions/liber_primus_master.txt'),
  'utf8'
);
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'),
  'utf8'
));

const parts = master.split('%');
const runeSet = new Set(corpus.runes);

/** @param {string} text */
function countRunes(text) {
  return [...text].filter((ch) => runeSet.has(ch)).length;
}

/** @param {string} text */
function countWords(text) {
  return text
    .split(/[\/\n&$]/)
    .flatMap((part) => part.split('-'))
    .map((part) => [...part].filter((ch) => runeSet.has(ch)))
    .filter((word) => word.length > 0)
    .length;
}

/** @param {number} n */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) return false;
  }
  return true;
}

/** @param {number} n */
function primeRank(n) {
  if (!isPrime(n)) return null;
  let rank = 0;
  for (let value = 2; value <= n; value++) {
    if (isPrime(value)) rank++;
  }
  return rank;
}

/** @param {number} n */
function phi(n) {
  let value = n;
  let x = n;
  for (let p = 2; p * p <= x; p++) {
    if (x % p !== 0) continue;
    while (x % p === 0) x /= p;
    value -= value / p;
  }
  if (x > 1) value -= value / x;
  return Math.round(value);
}

// Establish the LP2 -> master image-part offset from every canonical page.
for (let page = 0; page <= 57; page++) {
  const canonical = corpus.pages.find((row) => row.page === page);
  assert.ok(canonical);
  assert.equal(
    countRunes(parts[page + 16]),
    canonical.indices.length,
    `master part ${page + 16} must equal canonical LP2 p${page}`
  );
}

const units = [];
for (let page = 0; page <= 55; page++) {
  const source = parts[page + 16];
  source.split('.').forEach((body, clause) => {
    const runes = countRunes(body);
    if (!runes) return;
    const words = countWords(body);
    units.push({
      page,
      clause,
      runes,
      words,
      primeRank: primeRank(runes),
      phi: phi(runes),
      beginsNumberedItem: /^[\s/]*\d+-/u.test(body)
    });
  });
}

assert.equal(units.length, 212);

const mutualPairs = [];
for (let i = 0; i < units.length; i++) {
  for (let j = i + 1; j < units.length; j++) {
    const a = units[i];
    const b = units[j];
    if (a.page === b.page) continue;
    if (a.words !== b.page || b.words !== a.page) continue;

    const aPrimeTotient =
      a.primeRank === a.words &&
      a.phi === b.runes;
    const bPrimeTotient =
      b.primeRank === b.words &&
      b.phi === a.runes;

    mutualPairs.push({
      a,
      b,
      primeTotient: aPrimeTotient || bPrimeTotient
    });
  }
}

assert.equal(mutualPairs.length, 8);
const locked = mutualPairs.filter((row) => row.primeTotient);
assert.equal(locked.length, 1);

const pair = locked[0];
const byPage = new Map([[pair.a.page, pair.a], [pair.b.page, pair.b]]);
const p34 = byPage.get(34);
const p36 = byPage.get(36);

assert.ok(p34);
assert.ok(p36);
assert.deepEqual(
  {
    page: p36.page,
    clause: p36.clause,
    runes: p36.runes,
    words: p36.words,
    primeRank: p36.primeRank,
    phi: p36.phi,
    beginsNumberedItem: p36.beginsNumberedItem
  },
  {
    page: 36,
    clause: 1,
    runes: 139,
    words: 34,
    primeRank: 34,
    phi: 138,
    beginsNumberedItem: true
  }
);
assert.deepEqual(
  {
    page: p34.page,
    clause: p34.clause,
    runes: p34.runes,
    words: p34.words
  },
  {
    page: 34,
    clause: 2,
    runes: 138,
    words: 36
  }
);

// The totient result is also an explicit numeric Wisdom-square value.
const wisdom = fs.readFileSync(
  path.join(root, 'resources/external/derived/2014-stage04/05-square.txt'),
  'utf8'
).trim().split(/\s+/).map(Number);
assert.equal(wisdom.length, 25);
const positions138 = wisdom
  .map((value, index) => value === 138 ? index + 1 : null)
  .filter((value) => value !== null);
assert.deepEqual(positions138, [2, 24]);

console.log(JSON.stringify({
  classification:
    'source-only structural pointer; no plaintext or cipher recovered',
  mapping: {
    lp2MasterPartOffset: 16,
    all58PagesRuneCountMatched: true
  },
  census: {
    periodDelimitedUnitsP0toP55: units.length,
    mutualWordCountPagePointerPairs: mutualPairs.length,
    primeTotientPairs: locked.length
  },
  uniquePair: {
    p36: {
      unit: 'numbered item 1 after red 10-square separator at rune offset 99',
      words: p36.words,
      runes: p36.runes,
      relation: '139 is the 34th prime',
      phi139: p36.phi,
      pointsToPage: p36.words
    },
    p34: {
      unit: 'period-delimited clause 3',
      words: p34.words,
      runes: p34.runes,
      relation: '138 = phi(139)',
      pointsToPage: p34.words
    },
    reciprocalPagePointers: 'p36 -> 34 by word count; p34 -> 36 by word count',
    wisdom138Cells: positions138
  },
  allMutualPairs: mutualPairs.map((row) => ({
    pages: [row.a.page, row.b.page],
    a: {words: row.a.words, runes: row.a.runes},
    b: {words: row.b.words, runes: row.b.runes},
    primeTotient: row.primeTotient
  }))
}, null, 2));
