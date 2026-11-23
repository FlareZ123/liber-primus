#!/usr/bin/env node
'use strict';

// Exact p15-derived period-16 prime-totient key test on the original
// 1680-rune p33-p39 cuneiform chapter, using the solved-p56 plaintext-F
// transparent bypass. No language model or guessed F mask is used.

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'
));
const pages = corpus.pages.slice(33, 40);
const expectedLengths = [214, 261, 271, 238, 228, 228, 240];
assert.equal(pages.length, 7);
assert.deepEqual(pages.map(p => p.indices.length), expectedLengths);
const ciphertext = pages.flatMap(p => p.indices);
assert.equal(ciphertext.length, 1680);
assert.deepEqual(pages.map(p => p.page), [33, 34, 35, 36, 37, 38, 39]);

// Reconstruct the exact 16 primes selected by the original p15 grid:
// p_(F+1), where F is the distinct Fibonacci sequence 0,1,2,3,5,... .
const fib = [0, 1];
while (fib.length < 16) {
  const next = fib.at(-1) + fib.at(-2);
  if (next !== 1) fib.push(next); // omit the duplicate F1=F2=1
}
const limit = 10000;
const isPrime = new Uint8Array(limit + 1);
isPrime.fill(1);
isPrime[0] = isPrime[1] = 0;
for (let n = 2; n * n <= limit; n++) {
  if (isPrime[n]) for (let m = n * n; m <= limit; m += n) isPrime[m] = 0;
}
const primes = [];
for (let n = 2; n <= limit; n++) if (isPrime[n]) primes.push(n);
const selectedPrimes = fib.map(f => primes[f]); // zero-based array index = one-based prime rank - 1
const expectedPrimes = [2, 3, 5, 7, 13, 23, 43, 79, 149, 263, 463, 829, 1481, 2593, 4507, 7817];
assert.deepEqual(selectedPrimes, expectedPrimes);
// Keep the established spiral order explicit; the last two terms exceed 3301,
// hence the source prints absolute differences.
assert.deepEqual(
  selectedPrimes.map(p => Math.abs(3301 - p)),
  [3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222, 3152, 3038, 2838, 2472, 1820, 708, 1206, 4516]
);
const key = selectedPrimes.map(p => (p - 1) % 29); // phi(p) = p-1, reduced to GP29
assert.deepEqual(key, [1, 2, 4, 6, 12, 22, 13, 20, 3, 1, 27, 16, 1, 11, 11, 15]);

function mod(n, m) { return ((n % m) + m) % m; }

// Invert C=P+s*K with the authentic p56 rule:
// plaintext F/index 0 is emitted as ciphertext F without consuming K.
// A ciphertext F may alternatively be an ordinary encrypted non-F.
function inverseFeasibility(input, sign, start) {
  let mask = 1 << start;
  let maxStates = 1;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    let next = 0;
    for (let phase = 0; phase < 16; phase++) {
      if (!(mask & (1 << phase))) continue;
      if (c === 0) next |= 1 << phase; // literal plaintext-F bypass
      const p = mod(c - sign * key[phase], 29);
      if (p !== 0) next |= 1 << ((phase + 1) & 15);
    }
    mask = next;
    maxStates = Math.max(maxStates, popcount(mask));
    if (mask === 0) return { death: i, finalMask: 0, maxStates };
  }
  return { death: null, finalMask: mask, maxStates };
}
function popcount(n) {
  let c = 0;
  while (n) { n &= n - 1; c++; }
  return c;
}

const results = [];
for (const sign of [1, -1]) {
  for (let start = 0; start < 16; start++) {
    results.push({ sign, start, ...inverseFeasibility(ciphertext, sign, start) });
  }
}
const survivors = results.filter(r => r.death === null);
const deathHistogram = {};
for (const r of results) deathHistogram[r.death] = (deathHistogram[r.death] || 0) + 1;
const maxDeath = Math.max(...results.map(r => r.death));
const fixedClockwisePlus = results.find(r => r.sign === 1 && r.start === 0);
assert.equal(results.length, 32);
assert.equal(survivors.length, 0);
assert.equal(maxDeath, 113);
assert.equal(fixedClockwisePlus.death, 47);

// Positive control: plant a full-length GP29 plaintext with many literal Fs,
// encrypt it under the exact same period-16 key and p56 bypass, then ensure
// the exact inverse retains the true final key phase.
const plant = Array.from({ length: 1680 }, (_, i) => mod(i * 17 + Math.floor(i / 7) + 5, 29));
function forward(input, sign, start) {
  let phase = start, consumed = 0;
  const out = input.map(p => {
    if (p === 0) return 0;
    const c = mod(p + sign * key[phase], 29);
    phase = (phase + 1) & 15;
    consumed++;
    return c;
  });
  return { out, finalPhase: phase, consumed };
}
const plantStart = 5;
const planted = forward(plant, 1, plantStart);
assert.ok(plant.some(x => x === 0));
const plantInverse = inverseFeasibility(planted.out, 1, plantStart);
assert.equal(plantInverse.death, null);
assert.ok(plantInverse.finalMask & (1 << planted.finalPhase));

const summary = {
  test: 'p15 period-16 prime-totient key on original p33-p39 under p56 plaintext-F bypass',
  pageLengths: expectedLengths,
  ciphertextRunes: ciphertext.length,
  cycles: ciphertext.length / 16,
  fibIndices: fib,
  selectedPrimes,
  gp29TotientKey: key,
  testedSignPhasePairs: results.length,
  survivors: survivors.length,
  maxLegalPrefixRunes: maxDeath,
  deathHistogram,
  fixedClockwisePlusDeathOffset: fixedClockwisePlus.death,
  positiveControl: {
    plaintextRunes: plant.length,
    literalFs: plant.filter(x => x === 0).length,
    consumedKeySymbols: planted.consumed,
    finalPhase: planted.finalPhase,
    inverseSurvives: plantInverse.death === null
  }
};
console.log(JSON.stringify(summary, null, 2));
