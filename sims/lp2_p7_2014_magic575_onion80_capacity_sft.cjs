'use strict';
/**
 * Original-source 2014 5x7x5 matrix-to-Tor-v2 capacity decision.
 * Reads actual p7 red words and authentic 2014 Stage10 squares.
 * A seven-rune middle register is intentionally left fully arbitrary:
 * this tests all 29^7 possibilities by monotone interval bounds.
 * Every assertion applies only to fixed-order big-endian base29-to-80-bit
 * serialization. It does not authenticate this source-unselected receiver.
 *
 * SFT: Node.js 22 / Windows 11, CommonJS, read-only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} relative @returns {string} */
function source(relative) {
  return fs.readFileSync(path.resolve(root, relative), 'utf8');
}
const db = JSON.parse(source('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(source('resources/liber-primus/lp2-ink-annotations.json'));
const pages = source('resources/lp2-transcription.txt').split('%');
const glyphIndex = new Map(db.runes.map((rune, i) => [rune, i]));
const mod = value => (value % 29 + 29) % 29;
const lines = pages[7].replace(/\/\s*/g, '');
let position = 0;
const words = (lines.match(/[\u16a0-\u16ff]+/gu) || []).map(word => {
  const values = [...word].map(rune => {
    assert(glyphIndex.has(rune), 'unrecognized original rune');
    return glyphIndex.get(rune);
  });
  const record = {start: position, end: position + values.length, values};
  position = record.end;
  return record;
});
const p7 = ink.pages.find(page => page.page === 7);
assert(p7);
const sourceRegisters = p7.red_spans.map(span =>
  words.filter(word => word.start >= span.start && word.end <= span.start + span.length)
    .map(word => word.values.reduce((product, v) => mod(product * v), 1)));
const red = sourceRegisters.find(register => register.length === 5);
assert.deepEqual(red, [11, 26, 8, 15, 2]);
const squares = source('resources/cicada2014-openpuff-magic-squares.txt')
  .trim().split(/\n\s*\n/).map(block =>
    block.trim().split(/\r?\n/).map(line => line.trim().split(/\s+/).map(Number)));
assert.deepEqual(squares.map(square => square.length), [5, 7, 5]);
assert.deepEqual(squares.map(square => square[0].length), [5, 7, 5]);
for (const [i, sum] of [3301, 1033, 1033].entries()) {
  const M = squares[i];
  assert(M.every(row => row.length === M.length &&
    row.reduce((a, b) => a + b, 0) === sum));
}
/** @param {number[][]} A @param {number[][]} B @returns {number[][]} */
function multiply(A, B) {
  return A.map(row => B[0].map((_, col) =>
    mod(row.reduce((sum, v, i) => sum + v * B[i][col], 0))));
}
/** @param {number[][]} M @param {number} exponent @returns {number[][]} */
function power(M, exponent) {
  let acc = M.map((row, i) => row.map((_, j) => Number(i === j)));
  for (let n = 0; n < exponent; n++) acc = multiply(acc, M);
  return acc;
}
/** @param {number[][]} M @param {number[]} v @returns {number[]} */
function transform(M, v) {
  return M.map(row => mod(row.reduce((sum, item, index) => sum + item * v[index], 0)));
}
const A = transform(power(squares[0], 5), red);
const B = transform(power(squares[2], 5), red);
assert.deepEqual(A, [13, 18, 4, 28, 23]);
assert.deepEqual(B, [1, 4, 20, 14, 21]);
assert.equal(A.slice(2).concat(B.slice(0, 3)).map(i => db.translit[i]).join(''), 'READURL');
/** @param {number[]} digits @returns {bigint} */
function asInteger(digits) {
  return digits.reduce((value, digit) => {
    assert(Number.isInteger(digit) && digit >= 0 && digit < 29);
    return value * 29n + BigInt(digit);
  }, 0n);
}
const max80 = (1n << 80n) - 1n;
const zeros = Array(7).fill(0);
const twentyeights = Array(7).fill(28);
const forwardMinimum = asInteger(A.concat(zeros, B));
const forwardMaximum = asInteger(A.concat(twentyeights, B));
const backwardMinimum = asInteger(B.concat(zeros, A));
const backwardMaximum = asInteger(B.concat(twentyeights, A));
assert(forwardMinimum > max80, 'all 29^7 original square-order candidates exceed 80 bits');
assert(forwardMaximum >= forwardMinimum);
assert(backwardMinimum <= backwardMaximum && backwardMaximum <= max80);
assert.equal(max80 / (29n ** 16n), 4n);
const base32 = 'abcdefghijklmnopqrstuvwxyz234567';
/** @param {bigint} value @returns {string} */
function onionV2(value) {
  assert(value >= 0n && value <= max80);
  const result = Array(16);
  for (let i = 15; i >= 0; i--) {
    result[i] = base32[Number(value & 31n)];
    value >>= 5n;
  }
  assert.equal(value, 0n);
  return result.join('');
}
/** @param {string} host @returns {bigint} */
function decodeOnionV2(host) {
  assert(/^[a-z2-7]{16}$/.test(host));
  return [...host].reduce((n, char) => n * 32n + BigInt(base32.indexOf(char)), 0n);
}
const low = onionV2(backwardMinimum);
const high = onionV2(backwardMaximum);
assert.equal(low, 'hwl5stph6ijmt5hc');
assert.equal(high, 'hwl54nxitxdm6zvg');
assert(low.startsWith('hwl5') && high.startsWith('hwl5'));
assert.equal(decodeOnionV2(low), backwardMinimum);
assert.equal(decodeOnionV2(high), backwardMaximum);
const originalSignedStage11 = source('resources/historical/cicada2014-stage11-message.asc');
const stage11Address = /\b([a-z2-7]{16})\.onion\b/u.exec(originalSignedStage11);
assert(stage11Address, 'Authentic signed Stage11 onion host is absent');
const actual = stage11Address[1];
assert.equal(actual, 'ky2khlqdf7qdznac');
assert.equal(onionV2(decodeOnionV2(actual)), actual);
assert(!actual.startsWith('hwl5'));
console.log(JSON.stringify({
  source:'original p7 five red words + source 2014 Stage10 order5/order7/order5 matrices',
  sourceSelectedOpcode:false, missingMiddleGlyphs:7,
  alternativeMiddleRegisters:(29n ** 7n).toString(),
  matrixPowers:{firstFive:A,lastFive:B,centralCommand:'READURL'},
  forwardOrder:{name:'A5 / arbitrary 7 / B5',minimum:forwardMinimum.toString(),
    maximum:forwardMaximum.toString(),maxTorV2:max80.toString(),validV2Count:0},
  reversedOrder:{name:'B5 / arbitrary 7 / A5',
    minimum:backwardMinimum.toString(),maximum:backwardMaximum.toString(),
    minHost:low,maxHost:high,forcedPrefix:'hwl5'},
  originalStage11Onion:{host:actual,matchesReversedSourcePrefix:false},
  result:'No source-selected original-address recovery. Forward big-endian serialization impossible.'
}, null, 2));
