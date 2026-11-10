'use strict';

/**
 * Exact competing byte readings of the source-printed 32-by-8 grid.
 * The project fixture records the observed two-character tokens; only
 * the interpretation of the digit alphabet varies here.
 *
 * Run with Node.js 22: node sims/base60_base59_source_ambiguity.cjs
 */
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const source = require('../resources/liber-primus/base60-grid.json');

const base60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const base59 = base60.replace('f', '');
const tokens = source.rows.flat();
const canonical = source.byte_rows.flat();

function encode(value, alphabet) {
  assert(Number.isInteger(value) && value >= 0 && value <= 255);
  const radix = alphabet.length;
  return alphabet[Math.floor(value / radix)] + alphabet[value % radix];
}

/** @param {string} token @param {string} alphabet */
function decode(token, alphabet) {
  assert.equal(token.length, 2);
  const a = alphabet.indexOf(token[0]);
  const b = alphabet.indexOf(token[1]);
  assert(a >= 0 && b >= 0);
  return a * alphabet.length + b;
}

function bytesFor(alphabet) {
  const byteValues = tokens.map((token) => decode(token, alphabet));
  assert(byteValues.every((value) => value <= 255));
  for (let i = 0; i < tokens.length; i++) {
    assert.equal(encode(byteValues[i], alphabet), tokens[i]);
  }
  return byteValues;
}

function sha256(byteValues) {
  return createHash('sha256').update(Buffer.from(byteValues)).digest('hex');
}

assert.equal(source.alphabet, base60);
assert.equal(tokens.length, 256);
assert.equal(source.rows.length, 32);
assert(source.rows.every((row) => row.length === 8));
assert.equal(base59.length, 59);
assert.equal(tokens.some((token) => token.includes('f')), false);

const bytes60 = bytesFor(base60);
const bytes59 = bytesFor(base59);
assert.deepEqual(bytes60, canonical);

const support60 = new Set(Array.from({ length: 256 }, (_, i) => encode(i, base60)));
const support59 = new Set(Array.from({ length: 256 }, (_, i) => encode(i, base59)));
const intersection = new Set([...support60].filter((token) => support59.has(token)));
assert.equal(intersection.size, 252);
assert(tokens.every((token) => intersection.has(token)));

const frequencies = Array.from({ length: 5 }, (_, digit) =>
  tokens.filter((token) => token[0] === String(digit)).length
);
const differenceHistogram = {};
for (let i = 0; i < 256; i++) {
  const difference = bytes60[i] - bytes59[i];
  assert.equal(difference, base60.indexOf(tokens[i][0]) + Number(base60.indexOf(tokens[i][1]) > 41));
  differenceHistogram[difference] = (differenceHistogram[difference] || 0) + 1;
}

const summary = {
  sampleSize: 256,
  validUnderBothRadices: true,
  base60ByteSha256: sha256(bytes60),
  base59ByteSha256: sha256(bytes59),
  prefixDigitFrequencies: frequencies,
  base60UniqueValues: new Set(bytes60).size,
  base59UniqueValues: new Set(bytes59).size,
  base60Maximum: Math.max(...bytes60),
  base59Maximum: Math.max(...bytes59),
  byteDifferenceHistogram: differenceHistogram,
  differingBytes: bytes60.filter((value, i) => value !== bytes59[i]).length,
  supportedTokenOverlap: intersection.size,
  tokenSupportSizeForEach: 256,
  exactProbabilityAllSamplesInOverlapUnderUniformIidBytes:
    Math.pow(intersection.size / 256, tokens.length),
  examples: ['3N', '3p', '4F', '0g'].map((token) => ({
    token,
    base60: decode(token, base60),
    base59: decode(token, base59),
  })),
  conclusion: 'The exact observed token string has equal likelihood under the two iid-uniform 256-byte codecs. No LP2 plaintext or authentic key is recovered.',
};
console.log(JSON.stringify(summary, null, 2));
