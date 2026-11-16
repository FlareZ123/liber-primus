'use strict';

/**
 * Source-frozen p0 13-red-rune initializer against the dated 2015
 * prime-shift/first-difference register. Order-13 Fibonacci (13-bonacci)
 * uses the sum of the preceding 13 GP29 symbols as the next state.
 *
 * The title, 13-dot boundary and p15 Fibonacci references motivate a
 * finite test, but none authenticates this cipher composition.
 *
 * Node.js 22 CommonJS single-file test, original corpus, no dependencies.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const mod = x => (x % 29 + 29) % 29;

/** @param {number} count @returns {number[]} */
function primes(count) {
  const result = [];
  for (let n = 2; result.length < count; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { prime = false; break; }
    }
    if (prime) result.push(n);
  }
  return result;
}

/** @param {number[]} c @param {number[]} prime @returns {number[]} */
function primeDifference(c, prime) {
  let previous = mod(-prime[0]);
  return c.map((x, i) => {
    const shifted = mod(x - prime[i + 1]);
    const difference = mod(shifted - previous);
    previous = shifted;
    return difference;
  });
}

/** @param {number[]} d @param {number[]} prime @returns {number[]} */
function inversePrimeDifference(d, prime) {
  let previous = mod(-prime[0]);
  return d.map((x, i) => {
    previous = mod(previous + x);
    return mod(previous + prime[i + 1]);
  });
}

/**
 * @param {number[]} red13
 * @param {number} length
 * @returns {number[]}
 */
function thirteenBonacci(red13, length) {
  assert.equal(red13.length, 13);
  const window = red13.slice();
  const output = [];
  let sum = mod(window.reduce((a, b) => a + b, 0));
  for (let i = 0; i < length; i++) {
    output.push(sum);
    const outgoing = window.shift();
    window.push(sum);
    sum = mod(sum + sum - outgoing);
  }
  return output;
}

/** @param {number[]} a @returns {number} */
function ioc(a) {
  const frequency = Array(29).fill(0);
  for (const x of a) frequency[x]++;
  return frequency.reduce((n, f) => n + f * (f - 1), 0) /
    (a.length * (a.length - 1));
}

/** @param {number[]} a @returns {number} */
function adjacentEquals(a) {
  return a.slice(1).filter((x, i) => x === a[i]).length;
}

const original = corpus.pages.slice(0, 3).flatMap(p => p.indices);
assert.deepEqual(corpus.pages.slice(0, 3).map(p => p.indices.length), [262, 266, 201]);
assert.equal(original.length, 729);
const red13 = [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5];
assert.deepEqual(original.slice(0, 13), red13);
const prime = primes(730);
const d = primeDifference(original, prime);
assert.equal(adjacentEquals(d), 40);
assert.deepEqual(inversePrimeDifference(d, prime), original);

const key = thirteenBonacci(red13, 716);
const predicted = d.slice(13).map((x, i) => mod(x - key[i]));
assert.equal(predicted.length, 716);
const reencrypted = inversePrimeDifference(
  d.slice(0, 13).concat(predicted.map((x, i) => mod(x + key[i]))),
  prime
);
assert.deepEqual(reencrypted, original);

// An independent genuine GP29 plaintext register is encoded, decoded,
// and exactly re-encoded through the same 13-rune title layout.
const p57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(p57.length, 95);
const planted = Array.from({ length: 716 }, (_, i) => p57[i % p57.length]);
const plantedCipher = inversePrimeDifference(
  d.slice(0, 13).concat(planted.map((x, i) => mod(x + key[i]))),
  prime
);
assert.deepEqual(plantedCipher.slice(0, 13), red13);
const recoveredD = primeDifference(plantedCipher, prime);
const recovered = recoveredD.slice(13).map((x, i) => mod(x - key[i]));
assert.deepEqual(recovered, planted);
assert.deepEqual(inversePrimeDifference(
  recoveredD.slice(0, 13).concat(recovered.map((x, i) => mod(x + key[i]))),
  prime
), plantedCipher);

// Output is an original-input result, rather than a synthetic success.
const firstBlack = predicted.slice(0, 141).map(x => corpus.translit[x]).join(' ');
console.log(JSON.stringify({
  hypothesis: 'red13 GP29 initial state; key[n] = sum of preceding 13 GP values modulo29',
  titleRuneCount: 13,
  boundaryOffset: 13,
  ciphertextLength: original.length,
  blackLength: predicted.length,
  originalIndicesSha256: crypto.createHash('sha256').update(Buffer.from(original)).digest('hex'),
  firstStageAdjacentEquals: adjacentEquals(d),
  firstStageBodyIoC: ioc(d.slice(13)),
  candidateBlackIoC: ioc(predicted),
  firstBlackSentenceCandidate: firstBlack,
  originalExactForwardReencryption: true,
  nativeP57PlantReversible: true,
  result: 'No readable black sentence; source does not select this order-13 additive state law'
}, null, 2));
