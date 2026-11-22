/**
 * SFT: an unprinted p50 digit selects 179 by prime ordinal before factoring.
 *
 * All inputs are canonical source snapshots already audited from original JPEGs,
 * a p53 rune transcription, and the Cicada PGP-signed 2016 cleartext.
 * This is a numeric navigation candidate, not a plaintext decryption.
 *
 * Run on Windows 11 with Node.js 22: node sims/lp2_p50_missingf_prime41_selector_sft.cjs
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
/** @param {string} p @returns {string} */
function read(p) { return fs.readFileSync(path.join(root, p), 'utf8'); }
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const witness = read('resources/historical/cicada2016-4gq25-outguess.asc');
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const tokens = grid.pages.flatMap(page => page.tokens);
assert.equal(grid.alphabet, alphabet);
assert.equal(tokens.length, 256);
assert.deepEqual(grid.pages.map(page => page.tokens.length), [80, 104, 72]);

const missing = [...alphabet].filter(d => tokens.every(t => t[1] !== d));
assert.deepEqual(missing, ['f']);
const missingDigitIndex = alphabet.indexOf(missing[0]);
assert.equal(missingDigitIndex, 41);

/** @param {number} index @returns {number} */
function nthPrime(index) {
  assert.ok(index >= 1);
  let found = 0;
  for (let x = 2; ; x += 1) {
    let prime = true;
    for (let d = 2; d * d <= x; d += 1) {
      if (x % d === 0) { prime = false; break; }
    }
    if (prime && ++found === index) return x;
  }
}
const selectedPrime = nthPrime(missingDigitIndex);
assert.equal(selectedPrime, 179);
const sourcePage = corpus.pages.find(p => p.page === 53);
assert.ok(sourcePage);
assert.equal(sourcePage.indices.length, selectedPrime);
assert.deepEqual(corpus.pages
  .filter(p => p.page <= 55 && p.indices.length === selectedPrime)
  .map(p => p.page), [53]);

const bytes = tokens.map(t => {
  const hi = alphabet.indexOf(t[0]), lo = alphabet.indexOf(t[1]);
  assert.ok(hi >= 0 && lo >= 0);
  return 60 * hi + lo;
});
assert.deepEqual(bytes, grid.bytes);
assert.ok(bytes.every(v => v >= 0 && v <= 255));

/** @param {readonly number[]} xs @returns {bigint} */
function bigEndian(xs) {
  return xs.reduce((n, b) => n * 256n + BigInt(b), 0n);
}
const N = bigEndian(bytes);
assert.equal(N.toString(2).length, 2048);
const factor = BigInt(selectedPrime);
assert.equal(N % factor ** 2n, 0n);
assert.notEqual(N % factor ** 3n, 0n);
const firstQuotient = N / factor ** 2n;
assert.equal(firstQuotient % factor, 55n);
assert.equal(firstQuotient % 29n, 0n);
assert.notEqual(firstQuotient % (29n ** 2n), 0n);
const secondQuotient = firstQuotient / 29n;
assert.equal(secondQuotient % factor, 113n);
const wordIndex = 30;
assert.equal(nthPrime(wordIndex), 113);

const cleartext = witness
  .split('-----BEGIN PGP SIGNATURE-----')[0]
  .split(/\r?\n\r?\n/).slice(1).join('\n');
const words = cleartext.split(/[^A-Za-z0-9]+/)
  .filter(w => /^[A-Za-z]+$/.test(w))
  .map(w => w.toUpperCase());
assert.equal(words.length, 43);
assert.equal(words[wordIndex - 1], 'DIRECTION');

/**
 * The F omission is fixed throughout each shuffled control, because the byte
 * multiset remains intact. Only original table order is randomized.
 *
 * @param {number[]} input
 * @returns {{trials:number,sq:number,joint:number}}
 */
function shuffledControls(input) {
  const a = input.slice();
  const m179 = selectedPrime * selectedPrime;
  let state = 3301;
  /** @returns {number} */
  function randomUint32() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  }
  let sq = 0, joint = 0;
  const trials = 1000000;
  for (let t = 0; t < trials; t += 1) {
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = randomUint32() % (i + 1);
      const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    let modSq = 0, mod29 = 0;
    for (const b of a) {
      modSq = (modSq * 256 + b) % m179;
      mod29 = (mod29 * 256 + b) % 29;
    }
    if (modSq === 0) {
      sq += 1;
      if (mod29 === 0) joint += 1;
    }
  }
  return {trials, sq, joint};
}
const observed = shuffledControls(bytes);
assert.deepEqual(observed, {trials: 1000000, sq: 30, joint: 5});

console.log(JSON.stringify({
  source: ['Original LP2 p49-p51 printed 256 tokens', 'LP2 p53 179 runes',
    'Cicada PGP-signed 2016 message'],
  missingLowDigit: missing[0],
  digitIndexZeroBased: missingDigitIndex,
  primeOrdinalOneBased: missingDigitIndex,
  selectedPrime,
  selectedOriginalPage: 53,
  tableBitLength: 2048,
  factorValuation: 2,
  quotientMod179: firstQuotient % factor,
  after29QuotientMod179: secondQuotient % factor,
  wordOrdinal: wordIndex,
  signedWord: words[wordIndex - 1],
  shuffledTableConditionedOnMissingDigit: observed,
  criticalLimit: 'Digit-to-prime index and quotient-to-signed-word are proposed typing rules, not first-party instructions; no authentic unknown plaintext recovered.',
}, (k, v) => typeof v === 'bigint' ? v.toString() : v, 2));
