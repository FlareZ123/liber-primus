'use strict';

/**
 * Source-selected 2014 community Jordan J_(57-page) model: physical LP2 p54.
 * Run: node sims/lp2_2014_p54_jordan3_prime_source_sft.cjs
 *
 * On prime input p, Jordan's third totient is J3(p) = p^3 - 1.
 * The authentic solved p56 model emits plaintext F literally as ciphertext
 * F without consuming a key. Accordingly, a non-F ciphertext rune must never
 * decrypt to F. Every reported contradiction occurs before p54's first F,
 * making it independent of any later F-skip choices.
 *
 * The Jordan operator is a historical solver conjecture, not Cicada-authored.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const p54 = corpus.pages.find((page) => page.page === 54).indices;
const p56 = corpus.pages.find((page) => page.page === 56).indices;
const p57 = corpus.pages.find((page) => page.page === 57).indices;
assert.equal(p54.length, 232);
assert.equal(p56.length, 85);
assert.equal(p57.length, 95);
const mod29 = (x) => ((x % 29) + 29) % 29;

/**
 * @param {number} n - positive integer
 * @returns {boolean}
 */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}
const primes = [];
for (let n = 2; primes.length < 330; n++) if (isPrime(n)) primes.push(n);
assert.deepEqual(primes.slice(0, 5), [2, 3, 5, 7, 11]);
assert.equal(primes[84], 439);
assert.equal(primes[85], 443);

/**
 * @param {number} prime - ordinary consecutive prime
 * @param {number} degree - Jordan totient exponent
 * @returns {number} J_degree(prime) mod 29
 */
function jordanPrime(prime, degree) {
  let power = 1;
  for (let i = 0; i < degree; i++) power = mod29(power * mod29(prime));
  return mod29(power - 1);
}

/**
 * @param {number[]} cipher - original GP29 rune indices
 * @param {number} firstPrimeIndex - 0, 84 or 85
 * @param {number} sign - +1 or -1, applied in the inverse
 * @param {number} degree - source-proposed Jordan degree
 * @returns {{offset:number,cipher:number,prime:number,jordan:number,decoded:number}}
 */
function firstForcedLiteralFCollision(cipher, firstPrimeIndex, sign, degree) {
  for (let i = 0; i < cipher.length; i++) {
    if (cipher[i] === 0) break;
    const prime = primes[firstPrimeIndex + i];
    const j = jordanPrime(prime, degree);
    const decoded = mod29(cipher[i] + sign * j);
    if (decoded === 0) return { offset: i, cipher: cipher[i], prime, jordan: j, decoded };
  }
  throw new Error('No contradiction before the first ciphertext F');
}

const firstCipherF = p54.indexOf(0);
assert.equal(firstCipherF, 41);
const cases = [
  { firstPrimeIndex: 0, sign: -1, expectedOffset: 3, expectedPrime: 7, expectedRune: 23 },
  { firstPrimeIndex: 0, sign: 1, expectedOffset: 2, expectedPrime: 5, expectedRune: 21 },
  { firstPrimeIndex: 84, sign: -1, expectedOffset: 7, expectedPrime: 479, expectedRune: 10 },
  { firstPrimeIndex: 84, sign: 1, expectedOffset: 0, expectedPrime: 439, expectedRune: 24 },
  { firstPrimeIndex: 85, sign: -1, expectedOffset: 4, expectedPrime: 463, expectedRune: 27 },
  { firstPrimeIndex: 85, sign: 1, expectedOffset: 33, expectedPrime: 653, expectedRune: 19 }
];
const original = [];
for (const { firstPrimeIndex, sign, expectedOffset, expectedPrime, expectedRune } of cases) {
  const failure = firstForcedLiteralFCollision(p54, firstPrimeIndex, sign, 3);
  assert.equal(failure.offset, expectedOffset);
  assert.equal(failure.prime, expectedPrime);
  assert.equal(failure.cipher, expectedRune);
  assert.ok(failure.offset < firstCipherF);
  original.push({ firstPrimeIndex, inverseSign: sign, ...failure });
}

/** Exact GP29 forward encoder with original-p56-style literal F bypass.
 * @param {number[]} plaintext
 * @param {number} firstPrimeIndex
 * @param {number} degree
 * @param {number} encoderSign
 * @returns {{cipher:number[], consumed:boolean[]}}
 */
function encode(plaintext, firstPrimeIndex, degree, encoderSign) {
  const cipher = [];
  const consumed = [];
  let k = firstPrimeIndex;
  for (const x of plaintext) {
    if (x === 0) { cipher.push(0); consumed.push(false); }
    else { cipher.push(mod29(x + encoderSign * jordanPrime(primes[k++], degree))); consumed.push(true); }
  }
  return { cipher, consumed };
}

/**
 * @param {number[]} cipher
 * @param {boolean[]} consumed
 * @param {number} firstPrimeIndex
 * @param {number} degree
 * @param {number} inverseSign
 * @returns {number[]}
 */
function decodeWithKnownBypasses(cipher, consumed, firstPrimeIndex, degree, inverseSign) {
  let k = firstPrimeIndex;
  return cipher.map((x, i) => {
    if (!consumed[i]) { assert.equal(x, 0); return 0; }
    const p = mod29(x + inverseSign * jordanPrime(primes[k++], degree));
    assert.notEqual(p, 0);
    return p;
  });
}

// Native solved-page positive plant: every GP rune preserved, including F.
const native = Array.from({ length: 232 }, (_, i) => p57[i % p57.length]);
for (const start of [0, 84, 85]) {
  const planted = encode(native, start, 3, 1);
  assert.deepEqual(decodeWithKnownBypasses(planted.cipher, planted.consumed, start, 3, -1), native);
  assert.equal(planted.cipher.length, 232);
}

// Genuine p56 control, independently known first heading AN END and key start 0.
// An F interruption is known at local source position 56, irrelevant to the
// first five; the actual p56 recurrence is Euler J1, not conjectured J3.
const p56Head = p56.slice(0, 5).map((x, i) => mod29(x - jordanPrime(primes[i], 1)));
assert.equal(p56Head.map((i) => corpus.translit[i]).join(''), 'ANEND');
console.log(JSON.stringify({
  originalSource: 'LP2 physical p54, 232 GP29 runes; first ciphertext F at 41',
  sourceHypothesis: '2014 participant Jordan J_(57-page) on primes, p54 J3',
  original,
  fact: 'All six original-inverse hypotheses force plaintext F from a non-F ciphertext rune before any F skip can occur.',
  plantedNativeRoutines: 3,
  trueSolvedP56Control: 'ANEND'
}, null, 2));
