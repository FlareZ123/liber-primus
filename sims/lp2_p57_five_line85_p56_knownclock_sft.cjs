'use strict';

/**
 * Test the five-line interior of clear LP2 p57 against the adjacent solved
 * p56's authentic prime-totient clock. No key, offset, or sign is fitted.
 *
 * Read-only single-file test:
 *   node sims/lp2_p57_five_line85_p56_knownclock_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcript = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const translit = (indices) => indices.map((index) => corpus.translit[index]).join('');

const parableSource = transcript.split('%')
  .find((part) => part.includes('ᛈᚪᚱᚪᛒᛚᛖ'));
assert.ok(parableSource, 'Original source must contain clear PARABLE');

const lines = parableSource.split('/').map((part) =>
  [...part].filter((symbol) => corpus.runes.includes(symbol))
    .map((symbol) => corpus.runes.indexOf(symbol)))
  .filter((line) => line.length !== 0);

assert.deepEqual(lines.map((line) => line.length), [20, 17, 17, 18, 23]);
assert.deepEqual(lines.flat(), corpus.pages[57].indices);
const interiors = lines.flatMap((line) => line.slice(1, -1));
assert.equal(interiors.length, 85);
assert.equal(corpus.pages[56].indices.length, 85);

const primes = [];
for (let candidate = 2; primes.length < 84; candidate++) {
  let isPrime = true;
  for (let divisor = 2; divisor * divisor <= candidate; divisor++) {
    if (candidate % divisor === 0) { isPrime = false; break; }
  }
  if (isPrime) primes.push(candidate);
}

/** @type {number[]} */
const actualShifts = [];
/** @type {number[]} */
const knownPlaintext = [];
let primeCursor = 0;
const original56 = corpus.pages[56].indices;
for (let i = 0; i < original56.length; i++) {
  if (i === 56) {
    // The source's independently solved plaintext-F interruption.
    assert.equal(original56[i], 0);
    actualShifts.push(-1);
    knownPlaintext.push(0);
  } else {
    const shift = (primes[primeCursor++] - 1) % 29;
    actualShifts.push(shift);
    knownPlaintext.push((original56[i] + 29 - shift) % 29);
  }
}
assert.equal(primeCursor, 84);
assert.equal(translit(knownPlaintext),
  'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE');


// Stronger, key-independent obstruction: grant a completely unknown fixed
// 29-symbol lookup f(K[i]) for the actual known p56 prime clock. Every
// duplicated key rune must predict the same clock value. The best arbitrary
// (possibly non-injective) f is optimized independently for each key rune.
assert.equal(interiors[0], 24);
assert.equal(interiors[2], 24);
assert.equal(actualShifts[0], 1);
assert.equal(actualShifts[2], 4);
const bucket = Array.from({ length: 29 }, () => new Map());
for (let i = 0; i < interiors.length; i++) {
  if (i === 56) continue;
  const observed = actualShifts[i];
  const counts = bucket[interiors[i]];
  counts.set(observed, (counts.get(observed) || 0) + 1);
}
const bestArbitraryFixedFunction = bucket.reduce((sum, counts) =>
  sum + Math.max(0, ...counts.values()), 0);
assert.equal(bestArbitraryFixedFunction, 25);

const modes = [
  { name: 'ordinal', key: interiors },
  { name: 'GP prime mod29',
    key: interiors.map((index) => corpus.prime[index] % 29) },
  { name: 'GP prime totient mod29',
    key: interiors.map((index) => (corpus.prime[index] - 1) % 29) },
];

/**
 * Source-key arithmetic, with the same known p56 transparent-F position.
 * @param {number[]} text
 * @param {number[]} key
 * @param {1 | -1} sign
 * @returns {number[]}
 */
function transform(text, key, sign) {
  return text.map((value, i) =>
    i === 56 ? 0 : (value + 29 + sign * key[i]) % 29);
}

const report = {
  sourcePage57LineLengths: lines.map((line) => line.length),
  sourcePage57RuneCount: lines.flat().length,
  sourceLineInteriorRuneCount: interiors.length,
  independentlySolvedPage56RuneCount: original56.length,
  knownPrimeConsumingPositions: primeCursor,
  transparentPlaintextFIndex: 56,
  exactKnownP56Plaintext: translit(knownPlaintext),
  variants: [],
};

for (const mode of modes) {
  let clockMatches = 0;
  for (let i = 0; i < mode.key.length; i++) {
    if (actualShifts[i] !== -1 && actualShifts[i] === mode.key[i]) {
      clockMatches++;
    }
  }
  /** @type {{sign: number, exactPlaintextMatches: number, opening: string}[]} */
  const variants = [];
  for (const sign of /** @type {const} */ ([-1, 1])) {
    const decoded = transform(original56, mode.key, sign);
    const matched = decoded.reduce(
      (sum, value, index) => sum + (value === knownPlaintext[index] ? 1 : 0), 0);
    const reencrypted = transform(decoded, mode.key,
      /** @type {1 | -1} */ (-sign));
    assert.deepEqual(reencrypted, original56,
      'The source-key inverse must reproduce every authentic p56 rune');
    const planted = transform(knownPlaintext, mode.key,
      /** @type {1 | -1} */ (-sign));
    assert.deepEqual(transform(planted, mode.key, sign), knownPlaintext,
      'The same inverse must recover a known p56 plaintext plant');
    variants.push({
      sign,
      exactPlaintextMatches: matched,
      opening: translit(decoded.slice(0, 30)),
    });
  }
  report.variants.push({
    name: mode.name,
    knownPrimeClockMatchesOf84: clockMatches,
    directKnownPlaintextMatchesOf85: variants,
  });
}

assert.deepEqual(report.variants.map((row) => row.knownPrimeClockMatchesOf84),
  [5, 2, 3]);
assert.deepEqual(report.variants.map((row) =>
  row.directKnownPlaintextMatchesOf85.map((variant) =>
    variant.exactPlaintextMatches)), [[6, 3], [3, 5], [4, 2]]);

console.log(JSON.stringify(report, null, 2));
