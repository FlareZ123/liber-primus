'use strict';

const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');

const pages = corpus.pages.filter((page) => page.page <= 55);
const cipher = pages.flatMap((page) => page.indices);
const tokens = grid.pages.flatMap((page) => page.tokens);
const bytes = grid.bytes;
const highDigit = tokens.map((token) => grid.alphabet.indexOf(token[0]));

assert.equal(cipher.length, 12956);
assert.equal(tokens.length, 256);
assert.equal(highDigit.filter((value) => value === 0).length, 60);
for (let index = 0; index < 256; index++) {
  const token = tokens[index];
  const decoded =
    60 * grid.alphabet.indexOf(token[0]) +
    grid.alphabet.indexOf(token[1]);
  assert.equal(decoded, bytes[index]);
}

/**
 * @param {number[]} symbols
 * @returns {number}
 */
function ioc(symbols) {
  const counts = Array(29).fill(0);
  for (const symbol of symbols) counts[symbol]++;
  const numerator = counts.reduce(
    (sum, count) => sum + count * (count - 1),
    0
  );
  return numerator / (symbols.length * (symbols.length - 1));
}

/**
 * @param {number[]} steps
 * @param {1|-1} sign
 * @param {number[]} input
 * @returns {number[]}
 */
function cumulativeTransform(steps, sign, input) {
  let key = 0;
  return input.map((symbol, index) => {
    const output = (symbol + sign * key + 2900) % 29;
    if (index + 1 < input.length) {
      key = (key + steps[index & 255]) % 29;
    }
    return output;
  });
}

/**
 * Count equal adjacent symbols while excluding cross-page pairs.
 * @param {number[]} stream
 * @returns {number}
 */
function withinPageRepeats(stream) {
  let offset = 0;
  let hits = 0;
  for (const page of pages) {
    for (let index = 0; index + 1 < page.indices.length; index++) {
      hits += Number(stream[offset + index] === stream[offset + index + 1]);
    }
    offset += page.indices.length;
  }
  return hits;
}

const rawByteMinus = cumulativeTransform(bytes, -1, cipher);
const rawBytePlus = cumulativeTransform(bytes, 1, cipher);
const highMinus = cumulativeTransform(highDigit, -1, cipher);
const highPlus = cumulativeTransform(highDigit, 1, cipher);

assert.ok(Math.abs(ioc(cipher) - 0.03447839786450569) < 1e-15);
assert.ok(Math.abs(ioc(rawByteMinus) - 0.03446362232579134) < 1e-15);
assert.ok(Math.abs(ioc(rawBytePlus) - 0.034503266049422505) < 1e-15);
assert.ok(Math.abs(ioc(highMinus) - 0.03448050695349959) < 1e-15);
assert.ok(Math.abs(ioc(highPlus) - 0.03451837522933364) < 1e-15);
assert.equal(withinPageRepeats(cipher), 86);
assert.equal(withinPageRepeats(highMinus), 388);
assert.equal(withinPageRepeats(highPlus), 360);

// Exact implementation control: encrypt clear p57 with the same cumulative
// leading-digit state, then invert it without any fitted phase or offset.
const p57 = corpus.pages.find((page) => page.page === 57);
assert.ok(p57);
const plantedCipher = cumulativeTransform(highDigit, 1, p57.indices);
const recovered = cumulativeTransform(highDigit, -1, plantedCipher);
assert.deepEqual(recovered, p57.indices);
assert.ok(Math.abs(ioc(p57.indices) - 0.06270996640537514) < 1e-15);

console.log(JSON.stringify({
  raw: {
    ioc: ioc(cipher),
    withinPageRepeats: withinPageRepeats(cipher)
  },
  cumulativeRawByte: {
    minusIoc: ioc(rawByteMinus),
    plusIoc: ioc(rawBytePlus)
  },
  cumulativeLeadingDigit: {
    stepHistogram: Array.from({length: 5}, (_, value) =>
      highDigit.filter((digit) => digit === value).length),
    minusIoc: ioc(highMinus),
    plusIoc: ioc(highPlus),
    minusWithinPageRepeats: withinPageRepeats(highMinus),
    plusWithinPageRepeats: withinPageRepeats(highPlus)
  },
  clearP57Control: {
    ioc: ioc(p57.indices),
    exactPlantRecovery: true
  },
  decision:
    'negative: cumulative p50 raw-byte and leading-base60-digit step inverses do not recover plaintext-like symbol frequencies'
}, null, 2));
