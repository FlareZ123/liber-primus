'use strict';

/**
 * SFT: an original 2015 two-difference observation followed by the *actual*
 * p56 prime-totient, transparent-F inverse on both historical registers.
 * No fitted key or English score.
 * Run with Node.js 22 from any working directory.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const mod = (n) => ((n % 29) + 29) % 29;
const countEqual = (xs) =>
  xs.reduce((n, x, i) => n + (i > 0 && x === xs[i - 1] ? 1 : 0), 0);

/** Return the requested number of successive natural primes. */
function getPrimes(count) {
  const found = [];
  for (let n = 2; found.length < count; n++) {
    let prime = true;
    for (const p of found) {
      if (p * p > n) break;
      if (n % p === 0) {
        prime = false;
        break;
      }
    }
    if (prime) found.push(n);
  }
  return found;
}

/**
 * Exact 2015 witness: imagine F at index -1, spend prime 2 on it,
 * subtract prime 3 onwards from physical p0-2, differentiate twice.
 */
function twiceDelta(cipher, primes) {
  let previousShift = mod(-2);
  let previousDelta = 0;
  const first = [], second = [];
  for (let i = 0; i < cipher.length; i++) {
    const shifted = mod(cipher[i] - primes[i + 1]);
    const delta = mod(shifted - previousShift);
    first.push(delta);
    second.push(mod(delta - previousDelta));
    previousShift = shifted;
    previousDelta = delta;
  }
  return { first, second };
}

/**
 * Dynamic program over *every legal* consumed-prime clock. For ciphertext
 * F=0, either use transparent plaintext F without a prime, or consume a
 * prime if the resulting plaintext is non-F. Non-F ciphertext must consume
 * exactly one prime and cannot decode to plaintext F.
 */
function fBypassStates(cipher, primes, start) {
  let states = new Set([0]);
  let maxStates = 1;
  for (let i = 0; i < cipher.length; i++) {
    const next = new Set();
    for (const k of states) {
      const key = mod(primes[start + k] - 1);
      if (cipher[i] === 0) {
        next.add(k);
        if (key !== 0) next.add(k + 1);
      } else if (cipher[i] !== key) {
        next.add(k + 1);
      }
    }
    states = next;
    maxStates = Math.max(maxStates, states.size);
    if (!states.size) return { failure: i, states, maxStates };
  }
  return { failure: null, states, maxStates };
}

/** Encrypt actual solved p57 GP letters by the tested native-F rule. */
function encodePlant(plain, primes, start) {
  let clock = 0;
  const out = [];
  for (const letter of plain) {
    if (letter === 0) {
      out.push(0);
    } else {
      out.push(mod(letter + primes[start + clock] - 1));
      clock++;
    }
  }
  return { out, clock };
}

assert.deepEqual(corpus.pages.slice(0, 3).map((p) => p.page), [0, 1, 2]);
const cipher = corpus.pages.slice(0, 3).flatMap((p) => p.indices);
assert.equal(cipher.length, 729);
assert.deepEqual(cipher.slice(0, 8), [15, 8, 18, 3, 6, 19, 27, 0]);
const primes = getPrimes(1500);
const { first, second } = twiceDelta(cipher, primes);
assert.deepEqual(first.slice(0, 5), [14, 20, 8, 10, 1]);
assert.equal(countEqual(first), 40);
assert.equal(second.filter((x) => x === 0).length, 40);
assert.equal(countEqual(second), 21);
console.log('2015 729-rune double difference: 40 neighboring first-pass equals, 40 second-pass F zeros.');

// Real source-shaped starts: p56 key begins prime2 (index0); the 2015
// imagined opening F has just used prime2, so prime3 (index1) is the rival.
for (const start of [0, 1]) {
  const firstGot = fBypassStates(first, primes, start);
  assert.equal(firstGot.failure, start === 0 ? 12 : 3);
  assert.equal(firstGot.maxStates, 1);
  console.log('Original first delta: prime start', start,
    'all legal F-bypass paths impossible at original rune', firstGot.failure);

  const got = fBypassStates(second, primes, start);
  assert.equal(got.failure, 48);
  assert.equal(got.maxStates, 2);
  for (let initial = 0; initial < 29; initial++) {
    const alternative = second.slice();
    alternative[0] = initial;
    const seeded = fBypassStates(alternative, primes, start);
    assert.equal(seeded.failure,
      initial === start + 1 ? 0 : 48);
  }
  console.log('Original p0-2: prime start', start,
    'all 29 possible second-difference initial symbols extinct by rune48');
  console.log('Original p0-2: prime start', start,
    'all legal F-bypass paths impossible at zero-based rune', got.failure);

  const solved = corpus.pages.find((p) => p.page === 57).indices;
  const nativePlain = Array.from({ length: 729 }, (_, i) => solved[i % solved.length]);
  const plant = encodePlant(nativePlain, primes, start);
  const positive = fBypassStates(plant.out, primes, start);
  assert.equal(positive.failure, null);
  assert.ok(positive.states.has(plant.clock));
  console.log('Solved-p57 native-GP 729-rune plant survives with clock', plant.clock);
}

console.log('PASS: both original historical registers and both frozen clock origins rejected; native control accepted.');
