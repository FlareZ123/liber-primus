'use strict';

/**
 * Source-frozen test of the independently solved LP2 p56 consecutive
 * prime-totient GP29 key transferred to the Fibonacci-page lag-eight
 * 29-category predecessor-step transducer. No secret key or plaintext fit.
 *
 * Node.js 22: node sims/lp2_fibonacci_lag8_prime_totient_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  encodeSourceGP, labels, plantCipher
} = require('./lp2_fibonacci_lag8_allsecret_pagewise_capacity_sft.cjs');

const root = path.join(__dirname, '..');
const gp = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const FIB = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55];
const pages = FIB.map(page => gp.pages[page].indices);
const primes = [];
for (let n = 2; primes.length <= 2256; n += 1) {
  let prime = true;
  for (let d = 2; d * d <= n; d += 1) {
    if (n % d === 0) { prime = false; break; }
  }
  if (prime) primes.push(n);
}
assert.deepEqual(primes.slice(0, 12),
  [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]);
const mod = n => ((n % 29) + 29) % 29;

/**
 * @param {number[]} list
 */
function coincidence(list) {
  const counts = Array(29).fill(0);
  list.forEach(x => { counts[x] += 1; });
  return counts.reduce((s, count) => s + count * (count - 1), 0)
    / (list.length * (list.length - 1));
}

/**
 * Three original-source clock conventions, with all initials treated as
 * IV and no assumed key-consuming plaintext for the page's first9 runes.
 * @param {number[]} labelsSource
 * @param {'decoded-page-reset'|'physical-page-continuity'|'fibonacci-book-continuity'} clock
 */
function decode(labelsSource, clock) {
  const out = [];
  let start = 0;
  for (const p of pages) {
    const n = p.length - 9;
    for (let j = 0; j < n; j += 1) {
      const index = clock === 'decoded-page-reset' ? j
        : clock === 'physical-page-continuity' ? j + 9
        : start + j;
      out.push(mod(labelsSource[start + j] - (primes[index] - 1)));
    }
    start += n;
  }
  assert.equal(start, 2256);
  return out;
}

/** @param {number[]} plain @param {string} clock */
function forwardPrimeTotient(plain, clock) {
  const out = [];
  let start = 0;
  for (const p of pages) {
    const n = p.length - 9;
    for (let j = 0; j < n; j += 1) {
      const index = clock === 'decoded-page-reset' ? j
        : clock === 'physical-page-continuity' ? j + 9
        : start + j;
      out.push(mod(plain[start + j] + (primes[index] - 1)));
    }
    start += n;
  }
  return out;
}

/** Original and planted source-native GP29 inverse checks. */
function run() {
  const c = pages.flatMap(labels);
  assert.equal(c.length, 2256);
  assert.ok(Math.abs(coincidence(c) - 0.035465710556525296) < 1e-13);

  const source = fs.readFileSync(
    path.join(root, 'resources/control/shakespeare_first300k.txt'), 'utf8');
  const plantedPlain = encodeSourceGP(source).slice(0, 2256);
  const output = {};
  const clocks = ['decoded-page-reset', 'physical-page-continuity',
    'fibonacci-book-continuity'];
  const expected = {
    'decoded-page-reset': 0.03439794939535469,
    'physical-page-continuity': 0.034673145570914124,
    'fibonacci-book-continuity': 0.03457132298595713
  };
  for (const clock of clocks) {
    const candidate = decode(c, clock);
    output[clock] = coincidence(candidate);
    assert.ok(Math.abs(output[clock] - expected[clock]) < 1e-13);
    assert.deepEqual(forwardPrimeTotient(candidate, clock), c);
    const encodedLabels = forwardPrimeTotient(plantedPlain, clock);
    const encodedPages = plantCipher(encodedLabels, pages);
    const recoverLabels = encodedPages.flatMap(labels);
    assert.deepEqual(recoverLabels, encodedLabels);
    assert.deepEqual(decode(recoverLabels, clock), plantedPlain);
  }
  const result = {
    originalPages: FIB,
    fullOriginalRunes: gp.pages.slice(0, 56)
      .reduce((s, p) => s + p.indices.length, 0),
    sourceValues: 'D_i rank29 with step0, exact lag8 echo and 27 sorted remainder',
    historicalKey: 'phi(prime(j)) modulo29, source-authenticated only on p56',
    clockConventions: clocks,
    originalRankIoC: coincidence(c),
    originalDecodedIoCs: output,
    nativeGPSourcePlant: {recovered: 2256, total: 2256,
      exactOriginalSourceRoundtrip: true, everyClock: true},
    verdict: 'All three source-frozen clocks are nonlinguistic; no unknown LP2 plaintext, authentic key or original decoder.'
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}

if (require.main === module) run();
module.exports = {coincidence, decode, forwardPrimeTotient, run};
