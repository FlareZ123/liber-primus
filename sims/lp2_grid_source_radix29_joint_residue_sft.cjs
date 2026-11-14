'use strict';
/**
 * Original LP2 table: source-polynomial constraints on positional radix.
 *
 * Uses the complete physically printed 256 two-character table tokens in
 * resources/liber-primus/lp2-grid-256.json. The canonical alphanumeric
 * digit order is held fixed. The 2013 signed BASE29 example 3QO -> 3301
 * gives H(X)=3+26X+24X^2; original p39's red triad gives
 * G(X)=27+5X+15X^2. Test whether both divide the original source
 * polynomial P_b(X) when token (x,y) is converted to b*digit(x)+digit(y)
 * over GF(29), with original 256 coefficients in descending order.
 *
 * Run: node sims/lp2_grid_source_radix29_joint_residue_sft.cjs
 * Node 22, CommonJS built-ins, no writes.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const grid = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json'),
  'utf8'
));
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const tokens = grid.pages.flatMap(page => page.tokens);
assert.equal(tokens.length, 256);
assert.equal(alphabet.length, 60);
assert.equal(grid.alphabet, alphabet);
assert(tokens.every(token => token.length === 2 && [...token].every(c => alphabet.includes(c))));
const digitX = tokens.map(t => alphabet.indexOf(t[0]));
const digitY = tokens.map(t => alphabet.indexOf(t[1]));
assert.equal(Math.max(...digitX, ...digitY), 59);
assert.deepEqual(grid.bytes, tokens.map((_, i) => 60 * digitX[i] + digitY[i]));
assert.equal(
  crypto.createHash('sha256').update(Buffer.from(grid.bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290'
);

/** @param {number} x @returns {number} */
const mod = x => ((x % 29) + 29) % 29;

/**
 * Euclidean remainder of descending source coefficients by ascending GP29
 * polynomial coefficients, with no dropped leading zero.
 * @param {number[]} coefficients
 * @param {number[]} factor
 * @returns {number[]}
 */
function remainder(coefficients, factor) {
  const poly = factor.slice().reverse();
  const r = coefficients.map(mod);
  const inv = Array.from({length: 28}, (_, i) => i + 1)
    .find(x => mod(x * poly[0]) === 1);
  assert.notEqual(inv, undefined);
  for (let i = 0; i + poly.length <= r.length; i++) {
    const q = mod(r[i] * inv);
    for (let j = 0; j < poly.length; j++) r[i + j] = mod(r[i + j] - q * poly[j]);
  }
  return r.slice(-(poly.length - 1));
}

const factors = [
  {source: '2013 signed BASE29 3QO', coefficients: [3, 26, 24],
    leading: [1, 4], trailing: [27, 21]},
  {source: 'original physical p39 red triad', coefficients: [27, 5, 15],
    leading: [24, 13], trailing: [10, 3]}
];
const constraints = factors.map(({source, coefficients, leading, trailing}) => {
  assert.deepEqual(remainder(digitX, coefficients), leading);
  assert.deepEqual(remainder(digitY, coefficients), trailing);
  const rootResidues = Array.from({length: 29}, (_, b) => b)
    .filter(b => leading.every((x, i) => mod(b * x + trailing[i]) === 0));
  assert.deepEqual(rootResidues, [2]);
  assert.deepEqual(remainder(grid.bytes, coefficients), [0, 0]);
  return {source, leadingRemainder: leading, trailingRemainder: trailing,
    admissibleRadixModulo29: rootResidues};
});

// The 59-character alternative deletes absent 'f' and shifts every later
// digit down by one, so it is a distinct digit-order hypothesis.
const alpha59 = alphabet.replace('f', '');
const raw59 = tokens.map(t => 59 * alpha59.indexOf(t[0]) + alpha59.indexOf(t[1]));
assert.deepEqual(remainder(raw59, factors[0].coefficients), [17, 20]);
assert.deepEqual(remainder(raw59, factors[1].coefficients), [12, 22]);

// Source-conditional selection: base60 is the *smallest* base with all
// observed digit symbols and b % 29 == 2; base89 is indistinguishable
// over GF29, so this is no authenticated unique natural-number radix.
const admissibleNaturalBases = Array.from({length: 121}, (_, n) => n)
  .filter(b => b > 59 && b % 29 === 2);
assert.deepEqual(admissibleNaturalBases, [60, 89, 118]);
for (const base of admissibleNaturalBases) {
  const values = digitX.map((x, i) => base * x + digitY[i]);
  for (const factor of factors) assert.deepEqual(remainder(values, factor.coefficients), [0, 0]);
}
for (const base of [61, 88, 90]) {
  const values = digitX.map((x, i) => base * x + digitY[i]);
  assert(factors.every(factor => remainder(values, factor.coefficients).some(x => x !== 0)));
}

// Full original perturbation and positive-controls: change exactly one
// original cell by one GP29 coefficient and both exact divisibilities break.
const corrupted = grid.bytes.slice();
corrupted[0] += 1;
assert(factors.every(factor => remainder(corrupted, factor.coefficients).some(x => x !== 0)));

console.log(JSON.stringify({
  source: '256 unchanged LP2 table cells',
  observations: constraints,
  canonicalAlphabetLength: 60,
  strongestRadixInference: 'b congruent 2 mod 29; minimal admissible b=60',
  excludedAlternative: 'base59 with f omitted',
  unexcludedRadices: admissibleNaturalBases,
  conclusion: 'conditional GF29 divisor constraints; no authenticated numeral codec or recovered plaintext'
}, null, 2));
