'use strict';

/**
 * Original-input single-file test of the p15 3301/7 power automorphism on the
 * 3299-rune, title-stripped floral pp40–55 register. No external packages.
 *
 * Tested hypotheses remain conjectural: neither the position permutation nor
 * the prime-totient additive consumer is an author-authenticated instruction.
 *
 * Usage on Windows 11:
 *   node sims/lp2_p15_floral_3301_power7_position_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const load = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const corpus = load('resources/liber-primus/lp2-corpus.json');
const ink = load('resources/liber-primus/lp2-ink-annotations.json');

/** @param {number} n */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) {
    if (n % d === 0) return false;
  }
  return true;
}

/** @param {number} a @param {number} exp @param {number} mod */
function modularPower(a, exp, mod) {
  let value = 1;
  while (exp) {
    if (exp % 2) value = (value * a) % mod;
    a = (a * a) % mod;
    exp = Math.floor(exp / 2);
  }
  return value;
}

/** @param {number[]} sequence */
function ioc(sequence) {
  const histogram = Array(29).fill(0);
  for (const v of sequence) histogram[v] += 1;
  return histogram.reduce((sum, n) => sum + n * (n - 1), 0) /
    (sequence.length * (sequence.length - 1));
}

/** @param {number[]} sequence */
function mutualInformation(sequence) {
  const n = sequence.length;
  const freq = Array(29).fill(0);
  const pairs = Array(841).fill(0);
  for (let i = 0; i < n; i += 1) {
    freq[sequence[i]] += 1;
    if (i) pairs[29 * sequence[i - 1] + sequence[i]] += 1;
  }
  let information = 0;
  for (let a = 0; a < 29; a += 1) {
    for (let b = 0; b < 29; b += 1) {
      const count = pairs[a * 29 + b];
      if (count) {
        const p = count / (n - 1);
        information += p * Math.log(p * n * n / (freq[a] * freq[b]));
      }
    }
  }
  return information;
}

const title = Array(58).fill(0);
const redPrime = [];
for (const p of ink.pages) {
  const opening = (p.red_spans || []).find((s) => s.start === 0);
  if (opening) title[p.page] = opening.length;
  if (p.page >= 40 && p.page <= 55) {
    for (const span of (p.red_spans || [])) {
      redPrime.push({
        page: p.page,
        len: span.length,
        weight: corpus.pages[p.page].indices
          .slice(span.start, span.start + span.length)
          .reduce((sum, x) => sum + corpus.prime[x], 0),
      });
    }
  }
}
assert.equal(title[40], 8);
assert.equal(title[54], 9);
assert.deepEqual(redPrime.map((p) => [p.page, p.len, p.weight]), [
  [40, 8, 435], [53, 51, 2262], [54, 9, 597],
]);
const totalRedWeight = redPrime.reduce((sum, x) => sum + x.weight, 0);
assert.equal(totalRedWeight, 3294);

const modulus = 3301;
const exponent = modulus - totalRedWeight;
assert.equal(exponent, 7);
assert.ok(isPrime(modulus));
const floral = corpus.pages.slice(40, 56).flatMap((p) => p.indices);
const body = corpus.pages.slice(40, 56).flatMap((p) => p.indices.slice(title[p.page]));
assert.equal(floral.length, 3316);
assert.equal(body.length, modulus - 2);
assert.equal(body.length, 3299);

// GP positions [0,3298] correspond to field units [2,3300].
// Since gcd(7,3300)=1, seventh powers permute every nonzero field unit;
// 1 stays 1 and can be excluded, leaving precisely 3299 positions.
const order = body.map((_, i) => modularPower(i + 2, exponent, modulus) - 2);
assert.equal(new Set(order).size, body.length);
assert.ok(order.every((x) => x >= 0 && x < body.length));
assert.deepEqual(order.slice(0, 10), [126, 2185, 3178, 2200, 2650, 1592, 1015, 3119, 1269, 1366]);
assert.equal(modularPower(exponent, 20, modulus - 1), 1);
for (const d of [1, 2, 4, 5, 10]) {
  assert.notEqual(modularPower(exponent, d, modulus - 1), 1);
}
const inverse = Array(order.length);
order.forEach((position, i) => { inverse[position] = i; });
const shuffled = order.map((i) => body[i]);
const unshuffled = inverse.map((i) => shuffled[i]);
assert.deepEqual(unshuffled, body);

/** @returns {number[]} */
function firstPrimes(count) {
  const primes = [];
  for (let x = 2; primes.length < count; x += 1) {
    if (isPrime(x)) primes.push(x);
  }
  return primes;
}
const phiKeys = firstPrimes(body.length).map((p) => (p - 1) % 29);
const permutations = [
  ['power7', shuffled, order],
  ['inverse', inverse.map((i) => body[i]), inverse],
];

/** @param {number[]} nums */
function gpText(nums) {
  return nums.map((x) => corpus.translit[x]).join('');
}
console.log('Source: floral full=3316, red headings=8+9, body=3299, all-red prime sum=3294');
console.log('Group: modulus=3301, exponent=7, automorphism order=20');
console.log('Original body GP IoC=' + ioc(body).toFixed(12));
console.log('Permutation-only GP IoC=' + ioc(shuffled).toFixed(12));
console.log('Permutation-only digraph MI=' + mutualInformation(shuffled).toFixed(12));

// Exactly four source-numbered inverse models. The p56 authentic operation
// motivates phi(prime) subtraction; transferring it here is hypothetical.
// The first-prime clock starts at prime 2 and never skips or resets.
for (const [name, output, mapping] of permutations) {
  assert.equal(mapping.length, body.length);
  for (const sign of [-1, 1]) {
    const plain = output.map((x, i) => ((x + 29 + sign * phiKeys[i]) % 29));
    const reencrypted = plain.map((x, i) => ((x + 29 - sign * phiKeys[i]) % 29));
    const restored = Array(body.length);
    reencrypted.forEach((x, i) => { restored[mapping[i]] = x; });
    assert.deepEqual(restored, body);
    const control = Array.from(
      { length: body.length },
      (_, i) => corpus.pages[57].indices[i % corpus.pages[57].indices.length],
    );
    const planted = Array(body.length);
    control.forEach((x, i) => { planted[mapping[i]] = (x + 29 - sign * phiKeys[i]) % 29; });
    assert.deepEqual(
      mapping.map((position, i) => (planted[position] + 29 + sign * phiKeys[i]) % 29),
      control,
    );
    console.log(name + ' sign=' + sign + ', GP IoC=' + ioc(plain).toFixed(12) +
      ', digraph MI=' + mutualInformation(plain).toFixed(12) +
      ', first 48 tokens=' + gpText(plain.slice(0, 48)) +
      ', planted native control=3299/3299');
  }
}

// Inventory-matched controls assess whether the unmixed positional read has
// an exceptionally unusual adjacent-rune structure.
let state = 0x07183299;
/** @returns {number} */
function random32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
const observed = mutualInformation(shuffled);
let nullAbove = 0;
let nullSum = 0;
const rounds = 3000;
for (let repeat = 0; repeat < rounds; repeat += 1) {
  const x = body.slice();
  for (let i = x.length - 1; i > 0; i -= 1) {
    const j = random32() % (i + 1);
    const tmp = x[i];
    x[i] = x[j];
    x[j] = tmp;
  }
  const mi = mutualInformation(x);
  nullAbove += mi >= observed ? 1 : 0;
  nullSum += mi;
}
assert.equal(nullAbove, 384);
assert.ok(Math.abs(nullSum / rounds - 0.1270903361514453) < 1e-8);
console.log('Matched-inventory shuffle MI upper tail=' + nullAbove + '/' + rounds +
  ', mean=' + (nullSum / rounds).toFixed(12));
console.log('Result: no authentic unknown LP2 plaintext or selected decoder.');
