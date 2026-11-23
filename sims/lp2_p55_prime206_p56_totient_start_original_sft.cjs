'use strict';
/**
 * Original-input test: conditional p55 interior prime P becomes the first
 * prime of the authenticated p56 successive-prime/totient GP29 cipher.
 * Read-only Windows Node22 CommonJS; this is an unconfirmed transfer.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const page = (n) => corpus.pages.find((p) => p.page === n).indices;
const p55 = page(55);
const lengths = [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
assert.equal(p55.length, 76);
const inner = [];
let position = 1; // First p55 rune completes a word begun on p54.
for (const length of lengths) {
  const word = p55.slice(position, position + length);
  assert.equal(word.length, length);
  inner.push(...word.slice(1, -1));
  position += length;
}
assert.equal(position, 76);
assert.equal(inner.length, 43);
const P = 63755441409934721069036418908763882578170591536653256311514221n;
assert.equal(inner.reduce((s, x) => 29n * s + BigInt(x), 0n), 8n * P);
const small = [];
for (let n = 2n; n <= 997n; n++) if (!small.some((p) => n % p === 0n)) small.push(n);
function modpow(base, exponent, modulus) {
  let out = 1n, x = base % modulus, e = exponent;
  while (e > 0n) {
    if (e & 1n) out = out * x % modulus;
    x = x * x % modulus;
    e >>= 1n;
  }
  return out;
}
function probablePrime(n) {
  for (const p of small) {
    if (n === p) return true;
    if (n % p === 0n) return false;
  }
  let odd = n - 1n, twos = 0;
  while ((odd & 1n) === 0n) { odd >>= 1n; twos++; }
  for (const a of [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n]) {
    let x = modpow(a, odd, n);
    if (x === 1n || x === n - 1n) continue;
    let passed = false;
    for (let i = 1; i < twos; i++) {
      x = x * x % n;
      if (x === n - 1n) { passed = true; break; }
    }
    if (!passed) return false;
  }
  return true;
}
const primes = [P];
let current = P;
while (primes.length < 280) {
  current += 2n;
  if (probablePrime(current)) primes.push(current);
}
assert.equal(primes[279], 63755441409934721069036418908763882578170591536653256311556029n);
const primeDigest = createHash('sha256').update(primes.map(String).join('\n')).digest('hex');
assert.equal(primeDigest, '2c2c5116d2232b365adf6355532c47acf23352d020dfe105139b8d7c437e5a75');
const key = primes.map((q) => Number((q - 1n) % 29n));
assert.equal(createHash('sha256').update(Buffer.from(key)).digest('hex'), '41db5dab873f0bb8420dd644f2156bf8c2476d7b87e5b979753c376e823f62f0');
// This exact 280-prime sequence was independently computed with SymPy 1.14.
function inverse(ciphertext, transparentF) {
  let clock = 0;
  const plain = [], mask = [];
  for (const c of ciphertext) {
    const literal = transparentF && c === 0;
    mask.push(literal);
    plain.push(literal ? 0 : (c - key[clock++] + 29) % 29);
  }
  return { plain, mask, clock };
}
function forward(plain, mask) {
  let clock = 0;
  return plain.map((p, i) => {
    if (mask[i]) { assert.equal(p, 0); return 0; }
    return (p + key[clock++]) % 29;
  });
}
function ioc(stream) {
  const counts = Array(29).fill(0);
  for (const v of stream) counts[v]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (stream.length * (stream.length - 1));
}
const expected = {
  0: { true: 0.03916235266590623, false: 0.03574039952034161 },
  55: { true: 0.037192982456140354, false: 0.035789473684210524 },
};
for (const pg of [0, 55]) {
  for (const skip of [true, false]) {
    const cipher = page(pg);
    const decoded = inverse(cipher, skip);
    assert.deepEqual(forward(decoded.plain, decoded.mask), cipher);
    const measured = ioc(decoded.plain);
    assert(Math.abs(measured - expected[pg][skip]) < 1e-12);
    console.log({ page: pg, transparentF: skip, consumedPrimes: decoded.clock, IoC: Number(measured.toFixed(8)), preview: decoded.plain.slice(0, 40).map((v) => corpus.translit[v]).join('') });
  }
}
const knownNative = Array.from({ length: 262 }, (_, i) => page(57)[i % page(57).length]);
const noLiteral = Array(knownNative.length).fill(false);
assert.deepEqual(inverse(forward(knownNative, noLiteral), false).plain, knownNative);
console.log('PASS original source p55 prime as p56 totient-prime start; 280 independently confirmed 206-bit primes, four exact original receiver inverses and native-GP plant.');
