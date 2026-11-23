'use strict';

/**
 * Source-typed p15 16-cell Fibonacci-prime -> following 16 physical pages
 * using the solved p56 prime-totient additive register.
 * Read-only Windows Node22 SFT: node sims/lp2_p15_16prime_pagekey_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
assert.equal(corpus.schema, 1);
assert.equal(corpus.pages.length, 58);
assert.equal(corpus.translit.length, 29);

const spiralNumbers = [
  3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
  3152, 3038, 2838, 2472, 1820, 708, 1206, 4516
];
// Distinct Fibonacci ordinal + 1, converted from 1-based to 0-based prime positions.
const starts = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987];
const primes = [];
for (let n = 2; primes.length < 2000; ++n) {
  if (primes.every((p) => p * p > n || n % p !== 0)) primes.push(n);
}
for (let i = 0; i < 16; ++i) {
  assert.equal(Math.abs(3301 - primes[starts[i]]), spiralNumbers[i], 'p15 source numeric identity');
}
assert.deepEqual(starts.map((i) => primes[i]),
  [2, 3, 5, 7, 13, 23, 43, 79, 149, 263, 463, 829, 1481, 2593, 4507, 7817]);

/** @param {number[]} tape @param {number} start @param {-1 | 1} sign */
function decode(tape, start, sign) {
  return tape.map((c, i) => {
    assert.ok(Number.isInteger(c) && c >= 0 && c < 29);
    return (c + sign * ((primes[start + i] - 1) % 29) + 29) % 29;
  });
}

/** @param {number[]} tape @param {number} start @param {-1 | 1} sign */
function encode(tape, start, sign) {
  return decode(tape, start, sign === -1 ? 1 : -1);
}

/** @param {number[]} tape */
function ioc(tape) {
  const count = Array(29).fill(0);
  for (const x of tape) count[x]++;
  return count.reduce((s, n) => s + n * (n - 1), 0) /
    (tape.length * (tape.length - 1));
}

/** @param {number[]} tape */
function latin(tape) {
  return tape.map((i) => corpus.translit[i]).join('');
}

// Authentic solved-page positive control: the fixed p56 prime/totient
// *direct* stream recovers the first 55 known GP29 runes of p56 exactly.
// The later p56 F-interrupter handling is a separate operation; this finite
// test does NOT rule out source-selected F-transparent variants.
const known = 'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTY';
const actual = latin(decode(corpus.pages[56].indices.slice(0, 55), 0, -1));
assert.equal(actual, known, 'authentic known p56 control');
console.log('PASS known solved p56 direct register, first 55 runes:', actual);

const native = corpus.pages[57].indices;
let allLength = 0;
const score = { '-1': [], '1': [] };
for (let j = 0; j < 16; j++) {
  const page = corpus.pages[16 + j], C = page.indices, start = starts[j];
  assert.equal(page.status, 'unsolved');
  assert.equal(C.length, page.runic_count);
  allLength += C.length;
  const planted = Array.from({ length: C.length }, (_, i) => native[i % native.length]);
  for (const sign of /** @type {Array<-1 | 1>} */ ([-1, 1])) {
    const P = decode(C, start, sign);
    assert.deepEqual(encode(P, start, sign), C, 'exact original round trip');
    const plantCipher = encode(planted, start, sign);
    assert.deepEqual(decode(plantCipher, start, sign), planted, 'native GP solved-page plant');
    const value = ioc(P);
    score[String(sign)].push(value);
    assert.ok(value < 0.04, 'unexpected native-GP language signal; investigate');
  }
  console.log(
    'p' + page.page,
    'len=' + C.length,
    'start_prime=' + primes[start],
    'sub=' + score['-1'].at(-1).toFixed(8),
    'add=' + score['1'].at(-1).toFixed(8)
  );
}
assert.equal(allLength, 4077);
console.log('PASS complete p16..p31 original GP29 4077-rune inversion and re-encryption');
for (const [sign, values] of Object.entries(score)) {
  console.log('SIGN', sign, 'range', Math.min(...values), Math.max(...values));
}
console.log('No original unknown plaintext, no authenticated 16-page selector; direct transfer rejected.');
