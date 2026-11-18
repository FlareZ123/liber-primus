'use strict';

/**
 * Standalone original-source test of the field-exponent interpretation of
 * the two numbers visible in the archived 2014 LP2 delivery HTML:
 * <title>133</title> and <div id="331">.
 *
 * Hypothesis (unproven): modulus 331, exponent 133, ordinary base60 original
 * 256-byte table as the receiver. The inverse exponent is 67 mod phi(331)=330.
 *
 * Usage in a Windows Node 22 project checkout: run this file directly.
 * The test is read-only and has no network or additional dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/**
 * Modular exponentiation on small exact integer operands.
 * @param {number} base
 * @param {number} exponent
 * @param {number} modulus
 * @returns {number}
 */
function powMod(base, exponent, modulus) {
  let result = 1;
  let square = base % modulus;
  let remaining = exponent;
  while (remaining > 0) {
    if (remaining % 2 === 1) {
      result = (result * square) % modulus;
    }
    square = (square * square) % modulus;
    remaining = Math.floor(remaining / 2);
  }
  return result;
}

const tablePath = path.resolve(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json'
);
const source = JSON.parse(fs.readFileSync(tablePath, 'utf8'));
const original = source.pages.flatMap((page) => page.bytes);

assert.equal(original.length, 256);
assert.equal(source.byte_rule, 'value = 60*digit(first) + digit(second)');
assert(original.every((value) => Number.isInteger(value) && value >= 0 && value < 256));
assert.equal((133 * 67) % 330, 1);

for (const [exponent, inverseExponent, expectedOverflow, expectedPrintable] of [
  [133, 67, 49, 83],
  [67, 133, 56, 78]
]) {
  const decoded = original.map((value) => powMod(value, exponent, 331));
  const reencryption = decoded.map((value) => powMod(value, inverseExponent, 331));
  assert.deepEqual(reencryption, original, 'lossless field inverse on original input');

  const overflow = decoded.filter((value) => value > 255).length;
  const printable = decoded.filter((value) => value >= 32 && value <= 126).length;
  assert.equal(overflow, expectedOverflow);
  assert.equal(printable, expectedPrintable);

  const planted = [0, 1, 2, 29, 133, 330];
  const enc = planted.map((value) => powMod(value, exponent, 331));
  assert.deepEqual(enc.map((value) => powMod(value, inverseExponent, 331)), planted);

  console.log(JSON.stringify({
    source: 'LP2 p49-p51 original transcription, 256 base60 bytes',
    modulus: 331,
    exponent,
    inverseExponent,
    fullOriginalRoundtrip: true,
    emittedAboveByteRange: overflow,
    printableASCII: printable,
    tested: decoded.length,
    firstEightValues: decoded.slice(0, 8)
  }));
}

console.log('PASS: Neither field direction produces a 256-byte payload from the original table.');
