'use strict';

/**
 * Original LP2 first-order ciphertext-step inverse with a prime-clocked
 * multiplicative key. Windows 11 / Node.js 22 single-file reproducible test.
 *
 * Conditional source operands:
 *   GP29 field; source-visible primitive generators 14 and 19;
 *   solved-p56 consecutive-prime totient clock phi(p_i)=p_i-1;
 *   one-based plaintext ordinal, giving zero step for GP EA;
 *   prior original ciphertext rune, without any F-skip.
 *
 * Decoding: P_i = sign * (C_i - C_(i-1)) / g^(p_i-1) - 1 (mod 29).
 * Forward:  C_i = C_(i-1) + sign * g^(p_i-1) * (P_i+1) (mod 29).
 * Sign is either +1 or -1. C_(-1)=0.
 *
 * Run: node sims/lp2_prime_generator_delta_step_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const sourcePath = path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json');
const corpus = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const pages = corpus.pages.filter((p) => p.page >= 0 && p.page <= 55);
const original = pages.flatMap((p) => p.indices || []);
assert.equal(original.length, 12956);
const primeList = [];

for (let candidate = 2; primeList.length < original.length; candidate++) {
  let isPrime = true;
  for (let d = 2; d * d <= candidate; d++) {
    if (candidate % d === 0) { isPrime = false; break; }
  }
  if (isPrime) primeList.push(candidate);
}

/** @param {number} n @returns {number} */
function mod(n) { return ((n % 29) + 29) % 29; }

/** @param {number} a @param {number} exponent @returns {number} */
function power(a, exponent) {
  let out = 1;
  for (let x = exponent; x > 0; x = Math.floor(x / 2)) {
    if (x % 2 === 1) out = mod(out * a);
    a = mod(a * a);
  }
  return out;
}

/** @param {number} generator @param {number} sign @param {number[]} cipher */
function decode(generator, sign, cipher) {
  let prev = 0;
  return cipher.map((curr, i) => {
    const key = power(generator, (primeList[i] - 1) % 28);
    const plaintext = mod(sign * mod(curr - prev) * power(key, 27) - 1);
    prev = curr;
    return plaintext;
  });
}

/** @param {number} generator @param {number} sign @param {number[]} plain */
function encode(generator, sign, plain) {
  let prev = 0;
  return plain.map((value, i) => {
    const key = power(generator, (primeList[i] - 1) % 28);
    prev = mod(prev + sign * key * (value + 1));
    return prev;
  });
}

/** @param {number[]} xs */
function stats(xs) {
  const counts = Array(29).fill(0);
  for (const x of xs) counts[x]++;
  const topFive = [...counts].sort((a, b) => b - a).slice(0, 5)
    .reduce((a, b) => a + b, 0);
  return {
    n: xs.length,
    ioc: counts.reduce((a, x) => a + x * (x - 1), 0) /
      (xs.length * (xs.length - 1)),
    topFive,
  };
}

const offsets = new Map();
let offset = 0;
for (const page of pages) {
  offsets.set(page.page, offset);
  offset += page.indices.length;
}
const intervals = [
  [0, 2], [16, 21], [40, 53], [54, 55],
];
const expectedTop = {
  14: [2453, 173, 351, 635, 85],
  19: [2422, 157, 354, 600, 69],
};

assert.equal(power(14, 28), 1);
assert.equal(power(19, 28), 1);
for (const g of [14, 19]) {
  for (let exp = 1; exp < 28; exp++) assert.notEqual(power(g, exp), 1);
}

for (const generator of [14, 19]) {
  for (const sign of [1, -1]) {
    const decoded = decode(generator, sign, original);
    assert.deepEqual(encode(generator, sign, decoded), original);
    const intervalStats = intervals.map(([a, b]) => {
      const start = offsets.get(a);
      const end = offsets.get(b) + pages.find((p) => p.page === b).indices.length;
      return { pages: [a, b], ...stats(decoded.slice(start, end)) };
    });
    const whole = stats(decoded);
    assert.deepEqual(
      [whole.topFive, ...intervalStats.map((x) => x.topFive)],
      expectedTop[generator],
    );
    assert.equal(decoded.filter((x) => x === 28).length, 86);
    const incompatibleF = decoded.reduce(
      (sum, p, i) => sum + Number(p === 0 && original[i] !== 0), 0,
    );
    const knownF = original.filter((x) => x === 0).length;
    assert.equal(knownF, 458);

    const plantedPlain = corpus.pages.find((p) => p.page === 57).indices;
    const plantedCipher = encode(generator, sign, plantedPlain);
    assert.deepEqual(decode(generator, sign, plantedCipher), plantedPlain);
    assert.deepEqual(encode(generator, sign, plantedPlain), plantedCipher);

    console.log(JSON.stringify({
      generator, sign, source: 'unchanged physical LP2 p0-p55',
      whole, intervalStats, zeroStepEA: 86,
      nonFOutputDecodesToF: incompatibleF,
      originalCipherF: knownF,
      nativeSolvedP57: stats(plantedPlain),
      plantedRoundTrip: 'PASS',
      originalRoundTrip: 'PASS',
    }));
  }
}

console.log('PASS: all four original inverses and genuine native-plaintext plants');
