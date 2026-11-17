'use strict';
/**
 * Exact original p50 base59/GF(59) subgroup check, Windows Node.js 22 SFT.
 *
 * A source-motivated new candidate is to read the 59 distinct printed
 * second-digit glyphs as GF(59), then identify the 29 GP symbols with the
 * multiplicative subgroup of order 29, as in the 2013 Cicada DH example.
 *
 * This script tests the *direct multiplicative-register encoding*. It does
 * not assume that any Cicada instruction actually selects radix 59.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} relative @returns {unknown} */
const readJson = relative =>
  JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));

const grid = readJson('resources/liber-primus/lp2-grid-256.json');
const corpus = readJson('resources/liber-primus/lp2-corpus.json');
assert.deepEqual(grid.pages.map(p => p.tokens.length), [80, 104, 72]);
assert.deepEqual([corpus.pages[55].indices.length,
  corpus.pages[56].indices.length, corpus.pages[57].indices.length],
  [76, 85, 95]);
assert.equal(corpus.runes.length, 29);

const tokens = grid.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);
const alphabet60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const alphabet59 = alphabet60.replace('f', '');
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);
assert.ok(tokens.every(t => t.length === 2 && !t.includes('f')));
assert.ok(tokens.every(t => alphabet59.includes(t[0]) &&
  alphabet59.includes(t[1])));

/** @param {string} token @param {string} alphabet @returns {number} */
function decode(token, alphabet) {
  return alphabet.length * alphabet.indexOf(token[0]) +
    alphabet.indexOf(token[1]);
}

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function powmod(base, exponent, modulus) {
  let x = 1;
  for (let i = 0; i < exponent; i++) x = x * base % modulus;
  return x;
}
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}
assert.equal(isPrime(59), true);
assert.equal(59 - 1, 2 * corpus.runes.length);
assert.equal(powmod(2, 29, 59), 58);
assert.equal(powmod(2, 58, 59), 1);
assert.equal(powmod(4, 29, 59), 1);
const subgroup = Array.from({length:29}, (_, i) => powmod(4, i, 59));
assert.equal(new Set(subgroup).size, 29);
const inverseSubgroup = new Map(subgroup.map((v, i) => [v, i]));
assert.equal(inverseSubgroup.has(0), false);

const base59 = tokens.map(t => decode(t, alphabet59));
const base60 = tokens.map(t => decode(t, alphabet60));
assert.ok(base59.every(b => b >= 0 && b <= 255));
assert.ok(base60.every(b => b >= 0 && b <= 255));
assert.deepEqual(base60, grid.pages.flatMap(p => p.bytes));

/** @param {number[]} values */
function inspect(values) {
  const zero = [];
  const subgroupIndices = [];
  const other = [];
  for (let i = 0; i < values.length; i++) {
    const r = values[i] % 59;
    if (r === 0) zero.push(i);
    else if (inverseSubgroup.has(r)) subgroupIndices.push(i);
    else other.push(i);
  }
  return {zero, subgroupIndices, other};
}
const original59 = inspect(base59);
const original60 = inspect(base60);
assert.deepEqual(original59.zero, [131, 168, 192, 229, 252]);
assert.deepEqual([original59.subgroupIndices.length,
  original59.other.length, original59.zero.length], [128, 123, 5]);
assert.deepEqual([original60.subgroupIndices.length,
  original60.other.length, original60.zero.length], [122, 126, 8]);

/** @param {number} i @returns {boolean} */
const interior = i => {
  const row = Math.floor(i / 8);
  const col = i % 8;
  return row > 0 && row < 31 && col > 0 && col < 7;
};
assert.equal(Array.from({length:256}, (_, i) => i).filter(interior).length, 180);
assert.deepEqual(original59.zero.filter(interior), [131, 229]);

// This is a known-rune control: the interior has 180 genuine
// original p56/p57 plaintext GP symbols and the complete direct subgroup
// receiver needs all 180 finite-field symbols to be nonzero QR values.
// In fact two of their source-table inputs would have no logarithm.
const sourceInteriorFailure =
  Array.from({length:256}, (_, i) => i).filter(interior)
    .filter(i => !inverseSubgroup.has(base59[i] % 59));
assert.equal(sourceInteriorFailure.length, 0 + 2 +
  original59.other.filter(interior).length);
assert.ok(sourceInteriorFailure.length >= 2);

// Native GP29 positive: the order-29 subgroup itself is an exact
// one-to-one symbol transport. A genuine plant decrypts perfectly.
const plantedPlain = Array.from({length:256}, (_, i) => (i * 7 + 3) % 29);
const plantedField = plantedPlain.map(i => subgroup[i]);
const recovered = plantedField.map(r => inverseSubgroup.get(r));
assert.deepEqual(recovered, plantedPlain);

const summary = {
  sourceTokens: tokens.length,
  GPAlphabet: corpus.runes.length,
  hypothesizedFieldPrime: 59,
  subgroupOrder: 29,
  primitiveRoot: 2,
  subgroupGenerator: 4,
  base59: {
    subgroupCompatible: original59.subgroupIndices.length,
    nonresidues: original59.other.length,
    zeroIndices: original59.zero,
    interiorZeroIndices: original59.zero.filter(interior),
    firstTwentyValues: base59.slice(0, 20)
  },
  base60Control: {
    subgroupCompatible: original60.subgroupIndices.length,
    nonresidues: original60.other.length,
    zeros: original60.zero.length
  },
  syntheticReversibleGPPlant: recovered.length,
  decision: 'Direct printed-cell-to-GP29 subgroup lookup fails on original table, including known terminal interior. No authorial GF59 opcode or unknown plaintext.'
};
console.log(JSON.stringify(summary, null, 2));
