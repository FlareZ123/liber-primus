'use strict';

/**
 * Original p49–51 256-byte table: seed-independent GNU libc random() lag gate.
 * A standard 31-word additive lagged Fibonacci state has x[n] = x[n-3] +
 * x[n-31] modulo 2**32. The public 31-bit output is x[n] >>> 1.
 * Any unchanged eight-bit slice of this output must therefore satisfy
 * (b[n] - b[n-3] - b[n-31]) % 256 in {0,1} at every n >= 31.
 *
 * Read-only SFT. Run with Node.js 22 on Windows 11 or elsewhere.
 */
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const source = JSON.parse(readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json'),
  'utf8'
));
const tokens = source.pages.flatMap((page) => page.tokens);
assert.deepEqual(source.pages.map((page) => page.tokens.length), [80, 104, 72]);
assert.equal(tokens.length, 256);

const digit60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const digit59 = digit60.replace('f', '');

/** @param {number} base @returns {number[]} */
function decode(base) {
  const alphabet = base === 60 ? digit60 : digit59;
  return tokens.map((token) => {
    const high = alphabet.indexOf(token[0]);
    const low = alphabet.indexOf(token[1]);
    assert.ok(high >= 0 && low >= 0);
    const value = high * base + low;
    assert.ok(value >= 0 && value < 256);
    return value;
  });
}

/** @param {number[]} values @returns {number[]} */
function columnMajor(values) {
  return Array.from({ length: 256 }, (_, index) =>
    values[(index % 32) * 8 + Math.floor(index / 32)]);
}

/**
 * Residual 0 or 1 is necessary for EVERY 8-bit output window of glibc random().
 * @param {number[]} bytes
 * @param {number} lagSmall
 * @param {number} lagLarge
 * @returns {{pass:number, zero:number, one:number, firstFailure:number, firstResidual:number}}
 */
function gate(bytes, lagSmall, lagLarge) {
  let zero = 0;
  let one = 0;
  let firstFailure = -1;
  let firstResidual = -1;
  for (let index = lagLarge; index < bytes.length; index++) {
    const residual = (bytes[index]
      - bytes[index - lagSmall]
      - bytes[index - lagLarge] + 512) % 256;
    if (residual === 0) zero++;
    else if (residual === 1) one++;
    else if (firstFailure < 0) {
      firstFailure = index;
      firstResidual = residual;
    }
  }
  return { pass: zero + one, zero, one, firstFailure, firstResidual };
}

const canonical = decode(60);
assert.equal(
  createHash('sha256').update(Buffer.from(canonical)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290'
);
const tests = [
  [60, 'row', canonical, 4, 3, 31, 36],
  [60, 'column', columnMajor(canonical), 2, 2, 31, 98],
  [59, 'row', decode(59), 3, 4, 31, 39],
  [59, 'column', columnMajor(decode(59)), 2, 1, 31, 100]
];
for (const [base, layout, bytes, expected, alternateExpected, failAt, residual] of tests) {
  const actual = gate(bytes, 3, 31);
  const alternate = gate(bytes, 28, 31);
  assert.equal(actual.pass, expected);
  assert.equal(alternate.pass, alternateExpected);
  assert.equal(actual.firstFailure, failAt);
  assert.equal(actual.firstResidual, residual);
  assert.equal(actual.zero + actual.one, expected);
  assert.ok(actual.pass < 225);
  console.log(
    'original radix=' + base + ' layout=' + layout +
    ' glibc(3,31)=' + actual.pass + '/225' +
    ' alt(28,31)=' + alternate.pass + '/225' +
    ' firstFail=' + actual.firstFailure + ' residual=' + actual.firstResidual
  );
}

// Independent complete positive control using a synthetic 32-bit GNU-compatible
// additive state recurrence and four distinct fixed output-bit windows.
const states = Array(400).fill(0);
for (let index = 0; index < 31; index++) {
  states[index] = (3301 + index * 0x9e3779b9) >>> 0;
}
for (let index = 31; index < states.length; index++) {
  states[index] = (states[index - 3] + states[index - 31]) >>> 0;
}
for (const shift of [0, 7, 15, 23]) {
  const plant = states.slice(100, 356).map((value) => (value >>> (shift + 1)) & 255);
  const result = gate(plant, 3, 31);
  assert.equal(result.pass, 225);
  assert.equal(result.firstFailure, -1);
  console.log('planted additive31_3 shift=' + shift + ': 225/225 exact');
}
console.log('PASS: all original exact no-seed exclusions and four full synthetic positives.');
