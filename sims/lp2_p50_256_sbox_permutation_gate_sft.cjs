'use strict';

/**
 * Source-exact permutation gate for the original LP2 256-cell table.
 * A literal substitution box or RC4 post-KSA state must contain all 256 bytes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const source = JSON.parse(fs.readFileSync('resources/liber-primus/base60-grid.json', 'utf8'));
const alpha60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const alpha59 = alpha60.replace('f', '');
assert.equal(source.alphabet, alpha60);
const tokens = source.rows.flat();
assert.equal(tokens.length, 256);
assert.ok(source.rows.every(row => row.length === 8));

/** @param {string[]} seq @param {string} alphabet */
function decode(seq, alphabet) {
  return seq.map(token => {
    const high = alphabet.indexOf(token[0]);
    const low = alphabet.indexOf(token[1]);
    assert.ok(high >= 0 && low >= 0, 'unrepresentable printed token');
    const byte = high * alphabet.length + low;
    assert.ok(byte >= 0 && byte <= 255, 'source token outside byte domain');
    return byte;
  });
}

/** @param {number[]} bytes */
function characterize(bytes) {
  assert.equal(bytes.length, 256);
  const freq = Array(256).fill(0);
  for (const b of bytes) freq[b]++;
  const distinct = freq.filter(Boolean).length;
  return {
    distinct,
    repeatPairs: freq.reduce((total, n) => total + n * (n - 1) / 2, 0),
    duplicatedValues: freq.filter(n => n >= 2).length,
    minimumPositionsToReplace: 256 - distinct,
    maximumMultiplicity: Math.max(...freq),
    isPermutation: distinct === 256,
  };
}

const base60 = decode(tokens, alpha60);
assert.deepEqual(base60, source.byte_rows.flat());
const base59 = decode(tokens, alpha59);
const original60 = characterize(base60);
const original59 = characterize(base59);

assert.deepEqual(original60, {
  distinct: 161, repeatPairs: 127, duplicatedValues: 69,
  minimumPositionsToReplace: 95, maximumMultiplicity: 4, isPermutation: false,
});
assert.deepEqual(original59, original60);

// Positive control: every odd affine multiplier modulo 256 is a permutation.
const positive = Array.from({length: 256}, (_, i) => (197 * i + 17) & 255);
assert.equal(characterize(positive).isPermutation, true);
assert.equal(characterize(positive).minimumPositionsToReplace, 0);

// A secret global output relabeling plus full reorder preserves all collisions.
const positionPermutation = Array.from(base60).reverse();
const valuePermutation = positionPermutation.map(x => (197 * x + 17) & 255);
assert.equal(characterize(valuePermutation).repeatPairs, original60.repeatPairs);
assert.equal(characterize(valuePermutation).distinct, original60.distinct);

console.log(JSON.stringify({
  sourceRows: source.rows.length,
  sourceColumns: 8,
  conclusion: 'Neither source-compatible reading is a 256-value permutation.',
  base60: original60,
  base59: original59,
  positivePermutation: true,
  allHiddenGlobalReorderAndRelabelKeysRuledOut: true,
}, null, 2));
