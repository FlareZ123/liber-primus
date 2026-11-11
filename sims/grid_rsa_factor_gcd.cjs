#!/usr/bin/env node
'use strict';

/**
 * Test the direct interpretation of the LP2 256-byte base-60 grid as one
 * 2048-bit prime factor of Cicada's published 4096-bit RSA modulus.
 *
 * Only four natural traversals are admitted: row-major, reverse row-major,
 * column-major, reverse column-major. The public-key parser and fingerprint
 * check are reused from grid_rsa_pgp_signature.cjs.
 *
 * Node.js 22; no third-party dependencies:
 *   node sims/grid_rsa_factor_gcd.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { dearmor, parseKeys } = require('./grid_rsa_pgp_signature.cjs');

const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/base60-grid.json'), 'utf8'
));
const armor = fs.readFileSync(
  path.join(root, 'resources/control/cicada-3301-public-key.asc'), 'utf8'
);
const historicalArmor = fs.readFileSync(
  path.join(root, 'resources/historical/cicada-3301-2012-public-key.asc'), 'utf8'
);
assert.equal(armor, historicalArmor,
  'Historical 2012 key fixture should be byte-identical to control fixture');
assert.equal(grid.byte_rows.length, 32);
assert(grid.byte_rows.every(row => row.length === 8));

const rowMajor = Buffer.from(grid.byte_rows.flat());
const columnMajor = Buffer.from(
  Array.from({ length: 8 }, (_, c) => grid.byte_rows.map(row => row[c])).flat()
);
assert.equal(rowMajor.length, 256);
const variants = [
  ['row-major', rowMajor],
  ['row-major-reversed', Buffer.from(rowMajor).reverse()],
  ['column-major', columnMajor],
  ['column-major-reversed', Buffer.from(columnMajor).reverse()]
];

const EXPECTED_FINGERPRINT = '6D854CD7933322A601C3286D181F01E57A35090F';
const keys = parseKeys(dearmor(armor));
assert.equal(keys.length, 2);
assert.equal(keys[0].fingerprint, EXPECTED_FINGERPRINT);
assert.deepEqual(keys.map(key => key.bits), [4096, 4096]);
assert(keys.every(key => key.exponent === 65537n));

function asInteger(bytes) {
  return BigInt('0x' + bytes.toString('hex'));
}
function gcd(a, b) {
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}
function bitLength(x) {
  return x === 0n ? 0 : x.toString(2).length;
}

const tests = [];
for (const [orientation, bytes] of variants) {
  const candidate = asInteger(bytes);
  for (const [keyIndex, key] of keys.entries()) {
    const common = gcd(candidate, key.modulus);
    const divides = key.modulus % candidate === 0n;
    tests.push({
      orientation,
      key: keyIndex === 0 ? 'primary' : 'subkey',
      candidateBits: bitLength(candidate),
      candidateOdd: Number(candidate & 1n),
      gcd: common.toString(),
      dividesModulus: divides
    });
    assert.equal(common, 1n, orientation + ' shares a factor with key ' + keyIndex);
    assert.equal(divides, false, orientation + ' divides key ' + keyIndex);
  }
}
assert.equal(tests.length, 8);

// A synthetic positive control proves the exact GCD implementation detects
// a deliberately shared factor without requiring any RSA factorization.
const witness = asInteger(rowMajor.reverse());
assert.equal(gcd(witness * 65537n, witness), witness);

const report = {
  hypothesis: 'The 256-byte p49-p51 base-60 table is a direct RSA prime factor',
  keyFingerprint: keys[0].fingerprint,
  modulusBits: keys.map(key => key.bits),
  exponent: '65537',
  historicalKeyIsByteIdenticalToControl: true,
  byteTraversals: variants.map(([name, bytes]) => ({
    name,
    bits: bitLength(asInteger(bytes)),
    odd: Number(asInteger(bytes) & 1n)
  })),
  tests,
  syntheticPositive: 'gcd(candidate * 65537, candidate) equals candidate',
  verdict: 'All eight natural traversal/modulus comparisons have GCD 1; direct factor interpretation rejected.'
};
console.log(JSON.stringify(report, null, 2));
module.exports = { gcd, asInteger };
