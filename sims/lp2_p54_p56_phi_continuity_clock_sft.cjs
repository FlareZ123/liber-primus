'use strict';

/**
 * Exact original LP2 p54-55 -> solved p56 prime-clock seam obstruction.
 * Uses the historical p56 phi(prime) and plaintext-F pass-through rule.
 * The unknown p54-55 plaintext is not inferred or guessed.
 *
 * Reproduction: node sims/lp2_p54_p56_phi_continuity_clock_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const gp = read('resources/liber-primus/lp2-corpus.json');
const ink = read('resources/liber-primus/lp2-ink-annotations.json');
const page = n => gp.pages.find(p => p.page === n);
const marks = n => ink.pages.find(p => p.page === n);
const unknown = page(54).indices.concat(page(55).indices);
const solved = page(56).indices;
assert.deepEqual([page(54).runic_count, page(55).runic_count, page(56).runic_count], [232, 76, 85]);
assert.equal(unknown.length, 308);
assert.equal(unknown[232], 21); // p55 NG carries the last p54 word.
assert.deepEqual(marks(55).large_punctuation, [[76,13,'red']]);
assert.deepEqual(marks(56).large_punctuation, [[5,13,'red'],[45,10,'red'],[85,13,'red']]);

const possibleTransparentF = unknown.reduce((count, rune) => count + Number(rune === 0), 0);
assert.equal(possibleTransparentF, 6);
const minClock = unknown.length - possibleTransparentF;
const maxClock = unknown.length;
assert.deepEqual([minClock, maxClock], [302,308]);

/** @param {number} n @returns {number[]} First n prime numbers. */
function primes(n) {
  const found = [2];
  for (let k = 3; found.length < n; k += 2) {
    let prime = true;
    for (let div = 3; div * div <= k; div += 2) {
      if (k % div === 0) { prime = false; break; }
    }
    if (prime) found.push(k);
  }
  return found;
}
const shifts = primes(maxClock + 85 + 1).map(p => (p - 1) % 29);
const p56KnownPlain = [24,9,18,9,23,7]; // Authentic AN END W.
assert.deepEqual(solved.slice(0,6), [25,11,22,15,4,19]);
const observedShifts = solved.slice(0,6).map((c,i) => (c - p56KnownPlain[i] + 29) % 29);
assert.deepEqual(observedShifts, [1,2,4,6,10,12]);
assert.deepEqual(shifts.slice(0,6), observedShifts); // Authentic p56 starts at key zero.

const continuations = [];
for (let index = minClock; index <= maxClock; index++) {
  const prefix = shifts.slice(index, index + 6);
  const matches = prefix.filter((value,i) => value === observedShifts[i]).length;
  continuations.push({consumedUnknownPrimes: index, possibleSkips: maxClock-index,
    firstSixPrimeShifts:prefix, matchesOfKnownSix:matches});
  assert.notDeepEqual(prefix, observedShifts);
}
// Even if extra unmarked skips were invented, no positive key offset in the
// actual 308-rune preceding passage yields the necessary 6-rune p56 prefix.
const positiveOffsets = [];
for (let index = 1; index <= maxClock; index++) {
  if (shifts.slice(index,index+6).every((v,i) => v === observedShifts[i])) {
    positiveOffsets.push(index);
  }
}
assert.deepEqual(positiveOffsets, []);
assert.equal(continuations.length, 7);

console.log(JSON.stringify({
  originalPage54Runes:232,
  originalPage55Runes:76,
  originalPage55OpeningCarriedNG:true,
  originalUnknownRunes:unknown.length,
  sourceCiphertextF:possibleTransparentF,
  permittedPreP56PrimeClock:[minClock,maxClock],
  originalP56KnownPlainGP:p56KnownPlain,
  requiredFirstSixPrimeShifts:observedShifts,
  allSevenSourcePermittedContinuations:continuations,
  additionalPositiveMatchesIfAnyUnmarkedSkips:positiveOffsets,
  result:'a fresh phi-prime clock at p56 is necessary if its cipher convention also governed p54-p55; no p55 plaintext recovered'
},null,2));
