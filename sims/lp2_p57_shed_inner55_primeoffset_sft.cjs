'use strict';

/**
 * Source-locked, directly reversible 55-page prime-totient decoder.
 *
 * The solved LP2 physical p57 has exactly 20 printed words and 95 runes.
 * Removing the first and last rune of each original word yields 55 runes,
 * one for every rune-bearing unsolved physical LP2 page p0..p55.
 * This tests each word-interior rune as a zero-based prime-sequence offset
 * for its corresponding unknown page. The prime-totient operation is
 * independently demonstrated on solved p56. No phases or keys are fitted.
 *
 * Run: node sims/lp2_p57_shed_inner55_primeoffset_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(ROOT, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const trans = read('resources/liber-primus/lp2-transcription.txt');
const runeId = new Map(corpus.runes.map((rune, i) => [rune, i]));
const solved57 = corpus.pages.find((p) => p.page === 57);
const unknown = corpus.pages.filter((p) => p.page <= 55 && p.indices.length > 0);

assert.equal(unknown.length, 55);
assert.equal(unknown.reduce((n, page) => n + page.indices.length, 0), 12956);
assert.equal(corpus.pages.find((p) => p.page === 50).indices.length, 0);

const finalSection = trans.split('\n$\n%\n').at(-1).split('\n§')[0]
  .replaceAll('/\n', '').replaceAll('\n', '');
const words = finalSection.split(/[.-]/)
  .map((word) => [...word].filter((rune) => runeId.has(rune)).map((rune) => runeId.get(rune)))
  .filter((word) => word.length > 0);

assert.equal(words.length, 20);
assert.equal(words.flat().length, 95);
assert.deepEqual(words.flat(), solved57.indices);
const keys = words.flatMap((word) => word.slice(1, -1));
assert.equal(keys.length, 55);
assert.equal(keys.reduce((sum, value) => sum + value, 0), 573);
assert.deepEqual(words.map((word) => word.length),
  [7, 4, 2, 6, 7, 2, 2, 7, 2, 4, 4, 3, 3, 14, 4, 2, 8, 5, 3, 6]);

/** @param {number} count */
function firstPrimes(count) {
  /** @type {number[]} */
  const result = [];
  for (let n = 2; result.length < count; n++) {
    let prime = true;
    for (let factor = 2; factor * factor <= n; factor++) {
      if (n % factor === 0) { prime = false; break; }
    }
    if (prime) result.push(n);
  }
  return result;
}

const maxPageLength = Math.max(...unknown.map((p) => p.indices.length));
const primes = firstPrimes(maxPageLength + 29);

/**
 * Decode one page under the exact source-keyed GP29 totient scheme.
 * sign -1 subtracts the totient from ciphertext; +1 adds it.
 * @param {number[]} ciphertext
 * @param {number} offset
 * @param {-1 | 1} sign
 * @returns {number[]}
 */
function decode(ciphertext, offset, sign) {
  return ciphertext.map((c, i) =>
    (c + 29 + sign * ((primes[offset + i] - 1) % 29)) % 29);
}

/**
 * Exact inverse of decode for the same source key and local clock.
 * @param {number[]} plaintext
 * @param {number} offset
 * @param {-1 | 1} sign
 * @returns {number[]}
 */
function encode(plaintext, offset, sign) {
  return plaintext.map((p, i) =>
    (p + 29 - sign * ((primes[offset + i] - 1) % 29)) % 29);
}

/** @param {number[]} runes */
function ioc(runes) {
  const counts = Array(29).fill(0);
  for (const rune of runes) counts[rune]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (runes.length * (runes.length - 1));
}

const original = unknown.flatMap((p) => p.indices);
console.log('Original source pages:', unknown.length);
console.log('Total unsolved rune count:', original.length);
console.log('Solved p57 words and interior key count:', words.length, keys.length);
console.log('Original IoC:', ioc(original).toFixed(12));
console.log('Solved original p57 GP IoC:', ioc(solved57.indices).toFixed(12));

for (const sign of /** @type {(-1 | 1)[]} */ ([-1, 1])) {
  const decoded = [];
  for (let i = 0; i < unknown.length; i++) {
    const page = unknown[i];
    const candidate = decode(page.indices, keys[i], sign);
    assert.deepEqual(encode(candidate, keys[i], sign), page.indices,
      'Exact original-cipher forward reconstruction failed at p' + page.page);
    const plant = Array.from({ length: page.indices.length },
      (_, j) => solved57.indices[j % solved57.indices.length]);
    assert.deepEqual(decode(encode(plant, keys[i], sign), keys[i], sign), plant,
      'Solved-p57 planted plaintext did not recover at p' + page.page);
    decoded.push(...candidate);
  }
  const score = ioc(decoded);
  const expected = sign === -1 ? 0.03447388179259219 : 0.034473143015656474;
  assert.ok(Math.abs(score - expected) < 1e-12, 'Original decoding score drift');
  const preview = decoded.slice(0, 80).map((rune) => corpus.translit[rune]).join(' ');
  console.log('Sign:', sign, 'decoded IoC:', score.toFixed(12),
    'sample 80 GP runes:', preview);
}
console.log('PASS: exact source input, source-key decoding, 55 page plants, forward inverses.');
