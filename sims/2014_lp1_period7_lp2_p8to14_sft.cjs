'use strict';
/**
 * Single-file exact source-orientation gate: archived 2014 LP1 7-column
 * OutGuess transposition as a potential LP2 physical pages8–14 operation.
 * Node >=18, CommonJS, no third-party dependencies. Agent50 2026-11-11.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '../resources/liber-primus/lp2-corpus.json'), 'utf8'));
const originalHiddenPairs =
  'TL BE IE OV UT HT RE ID TS EO ST PO SO YR ' +
  'SL BT II IY T4 DG UQ IM NU 44 2I 15 33 9M';
const expectedHistoricalMessage =
  'TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133';
const historicalSource = originalHiddenPairs.replace(/\s+/gu, '');
assert.equal(historicalSource.length, 56);
assert.equal(expectedHistoricalMessage.length, 56);

/** 7-row rectangle, column-major both ways; 0-based inverse key 0625143.
 * @template T
 * @param {T[]} source
 * @returns {T[]}
 */
function reverseHistoricalColumns(source) {
  assert.equal(source.length % 7, 0);
  const order = [0, 6, 2, 5, 1, 4, 3];
  const result = [];
  for (let i = 0; i < source.length; i += 7) {
    for (const row of order) result.push(source[i + row]);
  }
  return result;
}
/** @template T @param {T[]} source @returns {T[]} */
function restoreHistoricalColumns(source) {
  assert.equal(source.length % 7, 0);
  const reverse = [0, 4, 2, 6, 5, 3, 1];
  const result = [];
  for (let i = 0; i < source.length; i += 7) {
    for (const row of reverse) result.push(source[i + row]);
  }
  return result;
}
const historicalRecovered = reverseHistoricalColumns([...historicalSource]).join('');
assert.equal(historicalRecovered, expectedHistoricalMessage);
assert.deepEqual(restoreHistoricalColumns([...historicalRecovered]), [...historicalSource]);

const sevenPages = corpus.pages.filter(page => page.page >= 8 && page.page <= 14);
assert.equal(sevenPages.length, 7);
const original = sevenPages.flatMap(page => page.indices);
assert.equal(original.length, 1729);
assert.equal(original.length / 7, 247);
const transformed = reverseHistoricalColumns(original);
assert.deepEqual(restoreHistoricalColumns(transformed), original);
const adjacent = source =>
  source.slice(1).filter((value, i) => value === source[i]).length;
const ioc = source => {
  const hist = new Array(29).fill(0);
  for (const value of source) hist[value]++;
  return hist.reduce((sum, n) => sum + n * (n - 1), 0) /
    (source.length * (source.length - 1));
};
assert.equal(adjacent(original), 9);
assert.equal(adjacent(transformed), 46);
assert.equal(ioc(original), ioc(transformed));
assert(ioc(transformed) < .04);

const key = [1, 7, 3, 6, 2, 5, 4];
/** @param {number[]} input @param {1|-1} sense */
function directShift(input, sense) {
  return input.map((value, i) => (value + sense * key[i % 7] + 29) % 29);
}
const directKeyScreen = [original, transformed].flatMap((input, k) =>
  /** @type {const} */ ([1, -1]).map(sense => ({
    stream: k === 0 ? 'untouched' : 'source-inverse',
    direction: sense > 0 ? 'plus' : 'minus',
    runeIoC: ioc(directShift(input, sense)),
  }))
);
for (const sample of directKeyScreen) assert(sample.runeIoC < .042);

const nextPrimes = count => {
  const primes = [];
  for (let candidate = 2; primes.length < count; candidate++) {
    let ok = true;
    for (const prime of primes) {
      if (prime * prime > candidate) break;
      if (candidate % prime === 0) { ok = false; break; }
    }
    if (ok) primes.push(candidate);
  }
  return primes;
};
const phiPrimes = nextPrimes(1800).map(prime => (prime - 1) % 29);
/** Conservative reachability: allows both literal F skip and normal
 * consumption when cipher F occurs, so rejection is still valid.
 * @param {number[]} ciphertext
 */
function totientFeasible(ciphertext) {
  let states = new Set([0]);
  for (let i = 0; i < ciphertext.length; i++) {
    const next = new Set();
    for (const index of states) {
      if (ciphertext[i] === 0) next.add(index);
      if (ciphertext[i] !== phiPrimes[index]) next.add(index + 1);
    }
    if (!next.size) return { possible: false, firstFailure: i };
    states = next;
  }
  return { possible: true, firstFailure: null };
}
assert.deepEqual(totientFeasible(original), { possible: false, firstFailure: 30 });
assert.deepEqual(totientFeasible(transformed), { possible: false, firstFailure: 4 });

console.log(JSON.stringify({
  historicalProof: { input: historicalSource, recovered: historicalRecovered,
    sourceUrl: 'https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_1_(2014)' },
  originalLP2: { pageRange: [8, 14], runes: original.length, rows: 7,
    columns: original.length / 7, adjacentRepeats: adjacent(original),
    gpIoC: ioc(original) },
  sourceInverse: { adjacentRepeats: adjacent(transformed), gpIoC: ioc(transformed),
    originalRestored: true },
  directVigenereDigitKey: directKeyScreen,
  directP56PrimeTotientGate: { raw: totientFeasible(original),
    transposed: totientFeasible(transformed) },
  result: 'Source-period7 inverse is real, exactly reproducible; no LP2 plaintext or direct known-key inversion'
}, null, 2));
