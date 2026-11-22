'use strict';

/**
 * One exact question: does the source-derived 240-cell grid quotient become a
 * complete original p39 cipher when composed with the authenticated solved-p56
 * prime-totient stream and transparent PLAINTEXT F (rune index 0)?
 *
 * Both quotient orientations and both signs of both additive terms are tested.
 * No plaintext guess, hidden seed, page-phase fitting, or ciphertext-F shortcut.
 * Node.js 22 CommonJS, source-read-only.
 */
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const load = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const corpus = load('resources/liber-primus/lp2-corpus.json');
const bytes = load('resources/liber-primus/base60-grid.json').byte_rows.flat();
const source = corpus.pages[39].indices;
const p57 = corpus.pages[57].indices;
const mod = x => (x % 29 + 29) % 29;

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function multiply(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      out[i + j] = mod(out[i + j] + a[i] * b[j]);
  return out;
}

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const out = [];
  for (let p = 2; out.length < count; p++) {
    let prime = true;
    for (let i = 2; i * i <= p; i++)
      if (p % i === 0) { prime = false; break; }
    if (prime) out.push(p);
  }
  return out;
}

/**
 * Exact F-transparent ciphertext inversion. State is number of primes consumed.
 * The same clock state can have multiple plaintext histories, but existence of
 * a whole original inverse is decided exactly by reachable states.
 *
 * @param {number[]} cipher
 * @param {number[]} q
 * @param {-1|1} qSign
 * @param {-1|1} primeSign
 * @param {number[]} primes
 * @returns {{complete:boolean,maxPrefix:number,finalStates:number[]}}
 */
function inverseExistence(cipher, q, qSign, primeSign, primes) {
  let states = new Set([0]);
  let maxPrefix = 0;
  for (let i = 0; i < cipher.length; i++) {
    const next = new Set();
    for (const used of states) {
      // Genuine F bypass is a plaintext event. Only ciphertext F can also
      // represent a bypassed plaintext F.
      if (cipher[i] === 0) next.add(used);
      const p = mod(cipher[i] - qSign * q[i] - primeSign * (primes[used] - 1));
      if (p !== 0) next.add(used + 1);
    }
    if (!next.size) return { complete: false, maxPrefix, finalStates: [] };
    states = next;
    maxPrefix = i + 1;
  }
  return { complete: true, maxPrefix, finalStates: [...states].sort((a, b) => a - b) };
}

/**
 * @param {number[]} plain @param {number[]} q
 * @param {-1|1} qSign @param {-1|1} primeSign @param {number[]} primes
 * @returns {number[]}
 */
function encrypt(plain, q, qSign, primeSign, primes) {
  let clock = 0;
  return plain.map((p, i) => {
    if (p === 0) return 0;
    return mod(p + qSign * q[i] + primeSign * (primes[clock++] - 1));
  });
}

assert.equal(bytes.length, 256);
assert.equal(createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.equal(source.length, 240);
assert.deepEqual(source.slice(119, 122), [27, 5, 15]);
assert.equal(p57.length, 95);
const factor = [
  [25, 10, 1],
  [11, 18, 1],
  [24, 16, 14, 1],
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1]
].reduce(multiply, [1]).reverse();
assert.equal(factor.length, 17);

const remaining = bytes.map(mod);
const quotient = [];
for (let i = 0; i < 240; i++) {
  const x = remaining[i];
  quotient.push(x);
  for (let j = 0; j < factor.length; j++)
    remaining[i + j] = mod(remaining[i + j] - x * factor[j]);
}
assert.ok(remaining.every(x => x === 0));
assert.deepEqual(quotient.slice(0, 12),
  [0, 28, 18, 14, 3, 2, 14, 21, 7, 27, 23, 2]);
const primes = firstPrimes(source.length + 1);
const nativePlain = Array.from({ length: 240 }, (_, i) => p57[i % p57.length]);
assert.ok(nativePlain.includes(0));

const tested = [];
for (const [order, q] of [
  ['printed', quotient],
  ['reverse', quotient.slice().reverse()]
]) for (const qSign of [-1, 1]) for (const primeSign of [-1, 1]) {
  const original = inverseExistence(source, q, qSign, primeSign, primes);
  const plantCipher = encrypt(nativePlain, q, qSign, primeSign, primes);
  const positive = inverseExistence(plantCipher, q, qSign, primeSign, primes);
  assert.equal(positive.complete, true);
  assert.equal(positive.maxPrefix, 240);
  assert.equal(original.complete, false);
  assert.ok(original.maxPrefix < 240);
  tested.push({
    quotientOrder: order, qSign, primeSign,
    originalMaxLegalPrefix: original.maxPrefix,
    originalCompleteSolutions: original.finalStates.length,
    nativeSourcePlantComplete: positive.complete
  });
}
assert.equal(tested.length, 8);
console.log(JSON.stringify({
  source: 'p50 all 256 original table bytes, p39 original 240 runes, native p57 source plant',
  exactFactor16: true,
  receiver: 'p39 240-runic original ciphertext',
  bypass: 'actual plaintext F is literal and consumes no prime key',
  models: tested,
  sourceNativeControls: '8/8 exact reversible positive plants',
  originalCompleteInverses: 0,
  recoveredUnknownPlaintext: false,
  status: 'PASS'
}, null, 2));
