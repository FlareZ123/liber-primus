#!/usr/bin/env node
'use strict';

// Test the 2014 account's twelve Fibonacci primes after applying the exact
// prime-totient and plaintext-F-bypass mechanism established on LP2 p56.
// The target is the immediate post-p15 continuation, physical pp16-22.
//
// Run from the repository root:
//   node sims/lp2_2014_twitter_fibprime_totient_p16_22_sft.cjs

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const corpus = JSON.parse(fs.readFileSync(
  path.join(process.cwd(), 'resources/liber-primus/lp2-corpus.json'), 'utf8'
));
const alphabet = corpus.translit;
const modulus = alphabet.length;
assert.equal(modulus, 29);

const fibonacciPrimes = [
  2n, 3n, 5n, 13n, 89n, 233n, 1597n, 28657n,
  514229n, 433494437n, 2971215073n, 99194853094755497n
];
const key = fibonacciPrimes.map(p => Number((p - 1n) % 29n));
assert.deepEqual(key, [1, 2, 4, 12, 1, 0, 1, 4, 0, 0, 4, 0]);

const targetPages = corpus.pages.filter(page => page.page >= 16 && page.page <= 22);
assert.deepEqual(targetPages.map(page => page.page), [16, 17, 18, 19, 20, 21, 22]);
const ciphertext = targetPages.flatMap(page => page.indices);
assert.equal(ciphertext.length, 1744);

// Exact inverse of the p56 rule. A plaintext F emits ciphertext F without
// consuming the key. If ciphertext is F, it may instead be an ordinary
// encryption of a non-F plaintext, in which case the key is consumed.
function inverseReachability(input, keyValues) {
  let counts = Array(keyValues.length).fill(0n);
  counts[0] = 1n;
  const statesByPosition = [];
  for (let i = 0; i < input.length; i += 1) {
    const c = input[i];
    const next = Array(keyValues.length).fill(0n);
    const transitions = [];
    for (let phase = 0; phase < keyValues.length; phase += 1) {
      if (counts[phase] === 0n) continue;
      if (c === 0) {
        next[phase] += counts[phase];
        transitions.push({ phase, type: 'F-bypass', nextPhase: phase });
      }
      const p = (c - keyValues[phase] + 29) % 29;
      if (p !== 0) {
        const nextPhase = (phase + 1) % keyValues.length;
        next[nextPhase] += counts[phase];
        transitions.push({ phase, type: 'ordinary', key: keyValues[phase], plaintext: p, nextPhase });
      } else {
        transitions.push({
          phase,
          type: 'invalid-ordinary',
          key: keyValues[phase],
          plaintext: 0,
          reason: 'non-F ciphertext cannot decode to plaintext F'
        });
      }
    }
    statesByPosition.push({
      position: i,
      ciphertext: c,
      before: counts.map((n, phase) => n > 0n ? phase : null).filter(x => x !== null),
      transitions,
      after: next.map((n, phase) => n > 0n ? phase : null).filter(x => x !== null)
    });
    counts = next;
    if (counts.every(n => n === 0n)) {
      return {
        survives: false,
        firstFailure: statesByPosition[statesByPosition.length - 1],
        pathCount: '0',
        finalPhases: []
      };
    }
  }
  return {
    survives: true,
    firstFailure: null,
    pathCount: counts.reduce((sum, n) => sum + n, 0n).toString(),
    finalPhases: counts.map((n, phase) => n > 0n ? phase : null).filter(x => x !== null)
  };
}

function encrypt(input, keyValues) {
  let phase = 0;
  return input.map(p => {
    if (p === 0) return 0;
    const c = (p + keyValues[phase]) % 29;
    phase = (phase + 1) % keyValues.length;
    return c;
  });
}

const original = inverseReachability(ciphertext, key);
assert.equal(original.survives, false);
assert.equal(original.firstFailure.position, 28);
assert.equal(original.firstFailure.ciphertext, 1); // GP29 U
assert.deepEqual(original.firstFailure.before, [4]);
assert.equal(original.firstFailure.transitions.length, 1);
assert.equal(original.firstFailure.transitions[0].key, 1);
assert.equal(original.firstFailure.transitions[0].plaintext, 0);
assert.equal(original.firstFailure.transitions[0].type, 'invalid-ordinary');

// Synthetic source-native positive control: the same encoder and inverse
// must recover a legal path for a long p57 plaintext plant.
const p57 = corpus.pages.find(page => page.page === 57).indices;
assert.equal(p57.length, 95);
const plantedPlaintext = Array.from({ length: 19 }, () => p57).flat();
const plantedCiphertext = encrypt(plantedPlaintext, key);
const planted = inverseReachability(plantedCiphertext, key);
assert.equal(planted.survives, true);
assert.equal(planted.pathCount, '1');

console.log(JSON.stringify({
  hypothesis: 'period-12 phi(Fibonacci-prime) key with p56 plaintext-F bypass',
  sourceSequence: fibonacciPrimes.map(String),
  key: key,
  target: {
    pages: 'physical p16-p22',
    runes: ciphertext.length,
    result: 'no legal inverse'
  },
  firstFailure: {
    zeroBasedRuneOffsetOnP16: original.firstFailure.position,
    ciphertextRune: alphabet[original.firstFailure.ciphertext],
    ciphertextIndex: original.firstFailure.ciphertext,
    keyPhase: 4,
    keyValue: 1,
    correspondingFibonacciPrime: '89',
    totient: '88',
    plaintextRequiredByOrdinaryInverse: 'F',
    reason: 'The ciphertext rune is U, not F; the p56 F rule forbids producing plaintext F by consuming the key.'
  },
  positiveControl: {
    source: 'p57 clear plaintext repeated 19 times',
    runes: plantedPlaintext.length,
    legalInverse: planted.survives,
    pathCount: planted.pathCount
  },
  decision: 'Reject this exact Twitter-Fibonacci-prime totient receiver on p16-p22. No unknown plaintext recovered.'
}, null, 2));
