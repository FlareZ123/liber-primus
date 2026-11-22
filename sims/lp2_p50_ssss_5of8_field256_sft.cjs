'use strict';

/**
 * Narrow extension to the existing original-column GF(2^256) SSSS gate:
 * test eight consecutive 32-byte row-major share records instead of
 * eight vertically printed columns. This is a different fixed packing,
 * but has no independent author-supplied share instruction.
 *
 * Shared historical SSSS arithmetic is imported from the already
 * established p50 column test. Node.js 22, CommonJS, built-ins only.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const grid = require('../resources/liber-primus/base60-grid.json');
const {interpolate, evaluate, multiply, inverse} =
  require('./p50_2013_ssss_256bit_column_gate_sft.cjs');

const X = Array.from({length: 8}, (_, i) => BigInt(i + 1));

/** @param {number[]} bytes @returns {bigint} */
function toWord(bytes) {
  assert.equal(bytes.length, 32);
  return BigInt('0x' + bytes.map(v => v.toString(16).padStart(2, '0')).join(''));
}

/** @param {bigint} n @returns {number} */
function popcount(n) {
  return n.toString(2).replaceAll('0', '').length;
}

/** @param {number} radix @returns {bigint[]} */
function originalShares(radix) {
  const alphabet = radix === 60 ? grid.alphabet : grid.alphabet.replace('f', '');
  assert.equal(alphabet.length, radix);
  const values = grid.rows.flat().map(token =>
    radix * alphabet.indexOf(token[0]) + alphabet.indexOf(token[1]));
  assert.equal(values.length, 256);
  assert(values.every(v => v >= 0 && v < 256));
  return Array.from({length: 8}, (_, k) => toWord(values.slice(32*k,32*k+32)));
}

/** @param {bigint[]} shares */
function check(shares) {
  const known = shares.slice(0, 5);
  const heldOut = X.slice(5).map(x => interpolate(x, X.slice(0, 5), known));
  return {
    exact: heldOut.map((prediction, i) => prediction === shares[i+5]),
    differingBits: heldOut.map((prediction, i) => popcount(prediction ^ shares[i+5])),
    predictedHexPrefixes: heldOut.map(x => x.toString(16).padStart(64,'0').slice(0,16)),
    printedHexPrefixes: shares.slice(5).map(x => x.toString(16).padStart(64,'0').slice(0,16))
  };
}

function main() {
  assert.equal(grid.rows.length, 32);
  assert(grid.rows.every(row => row.length === 8));
  assert.equal(multiply(7n, inverse(7n)), 1n);

  const coefficients = Array.from({length:5},(_,i) => BigInt('0x' +
    crypto.createHash('sha256').update('Shamir source-disjoint plant ' + i)
      .digest('hex')));
  const planted = X.map(x => evaluate(coefficients, x));
  assert.deepEqual(check(planted).exact,[true,true,true]);
  assert.equal(interpolate(0n,X.slice(0,5),planted.slice(0,5)),coefficients[0]);
  const flipped = planted.slice();
  flipped[7] ^= 1n;
  assert.deepEqual(check(flipped).exact,[true,true,false]);

  const cases = [60,59].map(radix => ({radix,...check(originalShares(radix))}));
  assert.deepEqual(cases.map(c=>c.differingBits),[
    [121,118,126], [130,127,136]
  ]);
  assert(cases.every(c=>c.exact.every(v=>!v)));

  console.log(JSON.stringify({
    model:'historical ssss 5-of-8 GF(2^256), row-major 4-row blocks',
    source:'original pp49-51 32x8 256-cell table',
    interpretation:'8 consecutive 32-byte shares, x=1..8; four original rows/share',
    priorColumnControl:'sims/p50_2013_ssss_256bit_column_gate_sft.cjs',
    plantedControl:'8 valid shares recover exact constant secret; bitflip detected',
    cases,
    decision:'No degree-four secret-sharing polynomial for either native table radix'
  },null,2));
}

if (require.main === module) main();
module.exports = {originalShares,check,main};
