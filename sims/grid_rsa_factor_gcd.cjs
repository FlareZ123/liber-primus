#!/usr/bin/env node
'use strict';

/**
 * Test two direct interpretations of the LP2 256-byte base-60 grid against
 * Cicada's published 4096-bit RSA moduli:
 *   1. the grid is a direct prime factor of n;
 *   2. the grid is the direct RSA private exponent d.
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
function modPow(a, e, n) {
  let result = 1n;
  a %= n;
  while (e > 0n) {
    if (e & 1n) result = result * a % n;
    a = a * a % n;
    e >>= 1n;
  }
  return result;
}
function bitLength(x) {
  return x === 0n ? 0 : x.toString(2).length;
}

const tests = [];
const privateExponentTests = [];
const bases = [2n, 3n, 5n, 17n, 257n];
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

    const roundTrips = bases.map(m => {
      assert.equal(gcd(m, key.modulus), 1n, 'round-trip base must be coprime');
      return modPow(modPow(m, candidate, key.modulus), key.exponent, key.modulus) === m;
    });
    privateExponentTests.push({
      orientation,
      key: keyIndex === 0 ? 'primary' : 'subkey',
      candidateBits: bitLength(candidate),
      bases: bases.map(String),
      roundTrips
    });
    assert(roundTrips.every(ok => !ok),
      orientation + ' unexpectedly behaves as private exponent for key ' + keyIndex);
  }
}
assert.equal(tests.length, 8);
assert.equal(privateExponentTests.length, 8);

// Synthetic positive controls validate both arithmetic gates.
const witness = asInteger(Buffer.from(rowMajor).reverse());
assert.equal(gcd(witness * 65537n, witness), witness);
const toyN = 3233n, toyE = 17n, toyD = 2753n;
for (const m of bases) assert.equal(modPow(modPow(m, toyD, toyN), toyE, toyN), m);

const report = {
  hypotheses: [
    'The 256-byte p49-p51 base-60 table is a direct RSA prime factor',
    'The 256-byte p49-p51 base-60 table is a direct RSA private exponent'
  ],
  keyFingerprint: keys[0].fingerprint,
  modulusBits: keys.map(key => key.bits),
  exponent: '65537',
  historicalKeyIsByteIdenticalToControl: true,
  byteTraversals: variants.map(([name, bytes]) => ({
    name,
    bits: bitLength(asInteger(bytes)),
    odd: Number(asInteger(bytes) & 1n)
  })),
  factorTests: tests,
  privateExponentTests,
  syntheticGcdPositiveControl: 'passed',
  syntheticRsaPrivateExponentPositiveControl: 'passed',
  verdict: 'All eight GCDs are 1 and all forty RSA private-exponent round trips fail.'
};
console.log(JSON.stringify(report, null, 2));
module.exports = { gcd, asInteger, modPow };
