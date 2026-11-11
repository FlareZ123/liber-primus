'use strict';
/**
 * Single-file exact source-orientation gate: archived 2014 LP1 7-column
 * OutGuess transposition on source-marked illustrated pp33–39 and exploratory pp8–14.
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
const solvedP56 = corpus.pages.find(page => page.page === 56).indices;
assert.equal(solvedP56.length, 85);
assert.deepEqual(totientFeasible(solvedP56), { possible: true, firstFailure: null });
assert.deepEqual(totientFeasible(original), { possible: false, firstFailure: 30 });
assert.deepEqual(totientFeasible(transformed), { possible: false, firstFailure: 4 });


/** Independent seven-page original-cipher test, source-started at the second
 * heading of physical p33 (local rune offset 91), then physical pp34–39.
 * The historical period-seven inverse consumes whole blocks without padding.
 */
const p33 = corpus.pages.find(page => page.page === 33);
const illustratedPassage = [
  ...p33.indices.slice(91),
  ...corpus.pages.filter(page => page.page >= 34 && page.page <= 39)
    .flatMap(page => page.indices),
];
assert.equal(illustratedPassage.length, 1589);
assert.equal(illustratedPassage.length / 7, 227);
const illustratedInverse = reverseHistoricalColumns(illustratedPassage);
assert.deepEqual(restoreHistoricalColumns(illustratedInverse), illustratedPassage);
assert.equal(adjacent(illustratedPassage), 12);
assert.equal(adjacent(illustratedInverse), 50);

// The original 2014 inverse destroys most of the joint no-repeat signature.
// Its 96 adjacent repeats are close to the median of all 7! row orders.
// The exhaustive comparison is descriptive: the source key was not selected
// from this distribution, and another LP2-dependent cipher could still exist.
/** @param {number[]} values @param {number[]} order @returns {number[]} */
function permuteSeven(values, order) {
  const result = [];
  for (let start = 0; start < values.length; start += 7) {
    for (const position of order) result.push(values[start + position]);
  }
  return result;
}
const historicalJointRepeatCount = adjacent(transformed) + adjacent(illustratedInverse);
assert.equal(historicalJointRepeatCount, 96);
const permutationCounts = [];
const illustratedPermutationCounts = [];
/** @param {number[]} order @param {number} position */
function enumerateOrders(order, position) {
  if (position === 7) {
    permutationCounts.push(
      adjacent(permuteSeven(original, order)) +
      adjacent(permuteSeven(illustratedPassage, order)));
    illustratedPermutationCounts.push(adjacent(permuteSeven(illustratedPassage, order)));
    return;
  }
  for (let next = position; next < 7; next++) {
    [order[position], order[next]] = [order[next], order[position]];
    enumerateOrders(order, position + 1);
    [order[position], order[next]] = [order[next], order[position]];
  }
}
enumerateOrders([0, 1, 2, 3, 4, 5, 6], 0);
permutationCounts.sort((a, b) => a - b);
illustratedPermutationCounts.sort((a, b) => a - b);
assert.equal(permutationCounts.length, 5040);
assert.equal(permutationCounts[0], 21);
assert.equal(permutationCounts[2520], 99);
assert.equal(permutationCounts[5039], 146);
assert.equal(permutationCounts.filter(value => value <= historicalJointRepeatCount).length, 2318);
assert.deepEqual([illustratedPermutationCounts[0], illustratedPermutationCounts[2520],
  illustratedPermutationCounts[5039]], [12, 50, 87]);
assert.equal(illustratedPermutationCounts.filter(value => value <= 50).length, 2607);

// Primary source selector: the seven consecutive illustrated p33–39 physical pages.
// Preserve the two existing section clocks: p33 starts whole, or after its 91-rune interlude.
const illustratedPages = corpus.pages.filter(page => page.page >= 33 && page.page <= 39);
assert.equal(illustratedPages.length, 7);
const illustratedFull = illustratedPages.flatMap(page => page.indices);
const illustratedBody = illustratedPages[0].indices.slice(91)
  .concat(illustratedPages.slice(1).flatMap(page => page.indices));
assert.equal(illustratedFull.length, 1680);
assert.equal(illustratedBody.length, 1589);
const sevenPageWindows = Array.from({ length: 50 }, (_, start) => ({
  start, length: corpus.pages.slice(start, start + 7)
    .reduce((total, page) => total + page.indices.length, 0)
}));
const divisibleWindows = sevenPageWindows.filter(window => window.length % 7 === 0);
assert.deepEqual(divisibleWindows.map(window => window.start),
  [0, 8, 18, 20, 21, 32, 33, 42]);

/** @param {number[]} source @param {number} expectedAfter @param {number} expectedFailure */
function measuredSourceInverse(source, expectedAfter, expectedFailure) {
  const altered = reverseHistoricalColumns(source);
  assert.deepEqual(restoreHistoricalColumns(altered), source);
  assert.equal(adjacent(altered), expectedAfter);
  assert.equal(ioc(altered), ioc(source));
  assert.deepEqual(totientFeasible(altered),
    { possible: false, firstFailure: expectedFailure });
  const digitKey = [source, altered].flatMap((stream, i) =>
    /** @type {const} */ ([1, -1]).map(direction => ({
      source: i === 0 ? 'original' : 'historical-inverse',
      direction, ioc: ioc(directShift(stream, direction))
    }))
  );
  assert(digitKey.every(result => result.ioc < .04));
  return { originalRunes: source.length, rows: 7, columns: source.length / 7,
    originalRepeats: adjacent(source), transformedRepeats: adjacent(altered),
    fixedIoC: ioc(altered), originalTotient: totientFeasible(source),
    transformedTotient: totientFeasible(altered), digitKey };
}
assert.equal(adjacent(illustratedFull), 12);
assert.equal(adjacent(illustratedBody), 12);
const illustratedFullResult = measuredSourceInverse(illustratedFull, 52, 69);
const illustratedBodyResult = measuredSourceInverse(illustratedBody, 50, 128);
assert.deepEqual(illustratedFullResult.originalTotient,
  { possible: false, firstFailure: 58 });
assert.deepEqual(illustratedBodyResult.originalTotient,
  { possible: false, firstFailure: 1 });

console.log(JSON.stringify({
  historicalProof: { input: historicalSource, recovered: historicalRecovered,
    sourceUrl: 'https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_1_(2014)' },
  sourceSelectedLP2: { span: 'p33-39', full: illustratedFullResult,
    bodyStartingAtP33Local91: illustratedBodyResult },
  windowSelectionCaveat: { sevenPageWindows: sevenPageWindows.length,
    divisibleCount: divisibleWindows.length, eligibleStarts: divisibleWindows.map(window => window.start) },
  exploratoryLP2: { pageRange: [8, 14], runes: original.length, rows: 7,
    columns: original.length / 7, adjacentRepeats: adjacent(original),
    gpIoC: ioc(original) },
  sourceInverse: { adjacentRepeats: adjacent(transformed), gpIoC: ioc(transformed),
    originalRestored: true },
  illustratedP33toP39: { redHeadingOffset: 91, runes: illustratedPassage.length,
    originalAdjacentRepeats: adjacent(illustratedPassage),
    historicalInverseAdjacentRepeats: adjacent(illustratedInverse),
    exactlyRestored: true },
  stageOrderDiagnostic: { sourceSelectedInverseJointRepeats: historicalJointRepeatCount,
    originalJointRepeats: adjacent(original) + adjacent(illustratedPassage),
    allSevenFactorialOrders: permutationCounts.length,
    range: [permutationCounts[0], permutationCounts[5039]],
    median: permutationCounts[2520],
    historicalLowerOrEqualRank: 2318,
    illustratedOnlyOrders: {min: 12, median: 50, max: 87,
      historicalSourceInverseRepeats: 50, rankLessOrEqual: 2607},
    note: 'Source inverse does not retain original near-absence of adjacent duplicate runes' },
  directVigenereDigitKey: directKeyScreen,
  directP56PrimeTotientGate: { solvedP56PositiveControl: totientFeasible(solvedP56), raw: totientFeasible(original),
    transposed: totientFeasible(transformed) },
  result: 'Source-period7 inverse is real, exactly reproducible; no LP2 plaintext or direct known-key inversion'
}, null, 2));
