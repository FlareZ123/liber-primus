'use strict';

/**
 * Exact 2013-SSSS-style 5-of-8 / GF(2^256) consistency gate for the
 * original LP2 32x8 table. Run in repository root with Node.js.
 *
 * Original SSSS field polynomial from ssss.c irred_coeff, degree 256:
 * x^256 + x^10 + x^5 + x^2 + 1.
 *
 * Only the source-motivated 5-of-8 scheme is tested; all eight source
 * points must lie on one degree-four polynomial. No key is fitted.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const table = JSON.parse(fs.readFileSync(
  path.join(__dirname, '../resources/liber-primus/base60-grid.json'), 'utf8'
));
const FIELD_DEGREE = 256n;
const TOP_BIT = 1n << FIELD_DEGREE;
const FIELD_POLY = TOP_BIT | (1n << 10n) | (1n << 5n) | (1n << 2n) | 1n;
const X = [1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n];

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function multiply(a, b) {
  let result = 0n;
  while (b > 0n) {
    if (b & 1n) result ^= a;
    b >>= 1n;
    a <<= 1n;
    if (a & TOP_BIT) a ^= FIELD_POLY;
  }
  return result;
}

/** @param {bigint} a @returns {bigint} */
function reduce(a) {
  while (a >= TOP_BIT) {
    a ^= FIELD_POLY << BigInt(a.toString(2).length - 257);
  }
  return a;
}

/** Binary polynomial extended Euclid, matching the official ssss.c. */
function inverse(a) {
  assert(a > 0n && a < TOP_BIT, 'inverse requires nonzero field element');
  let u = a;
  let v = FIELD_POLY;
  let g = 1n;
  let h = 0n;
  while (u !== 1n) {
    let shift = u.toString(2).length - v.toString(2).length;
    if (shift < 0) {
      [u, v] = [v, u];
      [g, h] = [h, g];
      shift = -shift;
    }
    u ^= v << BigInt(shift);
    g ^= h << BigInt(shift);
  }
  return reduce(g);
}

/** Lagrange interpolation, using five source shares at x=1..5. */
function interpolate(firstFiveY, at) {
  let output = 0n;
  for (let i = 0; i < 5; i++) {
    let numerator = 1n;
    let denominator = 1n;
    for (let j = 0; j < 5; j++) {
      if (i === j) continue;
      numerator = multiply(numerator, at ^ X[j]);
      denominator = multiply(denominator, X[i] ^ X[j]);
    }
    output ^= multiply(firstFiveY[i], multiply(numerator, inverse(denominator)));
  }
  return output;
}

/** @param {number[]} bytes @returns {bigint} */
function bytesToBigInt(bytes) {
  assert.equal(bytes.length, 32);
  return BigInt('0x' + bytes.map(v => v.toString(16).padStart(2, '0')).join(''));
}

/** @param {bigint} v @returns {string} */
function hex64(v) {
  return v.toString(16).padStart(64, '0');
}

/** @param {bigint} v @returns {number} */
function bits(v) {
  return v.toString(2).replaceAll('0', '').length;
}

function getShareWords(radix, layout) {
  const alphabet = radix === 60 ? table.alphabet : table.alphabet.replace('f', '');
  assert.equal(alphabet.length, radix);
  const rows = table.rows.map(row => row.map(token => (
    alphabet.indexOf(token[0]) * radix + alphabet.indexOf(token[1])
  )));
  assert.equal(rows.length, 32);
  assert(rows.every(row => row.length === 8));
  assert(rows.flat().every(v => Number.isInteger(v) && v >= 0 && v <= 255));
  const bytes = layout === 'columns'
    ? Array.from({length: 8}, (_, c) => rows.map(row => row[c]))
    : Array.from({length: 8}, (_, k) => rows.flat().slice(32 * k, 32 * (k + 1)));
  return bytes.map(bytesToBigInt);
}

function verifyShares(shareWords) {
  const firstFive = shareWords.slice(0, 5);
  const predictions = X.slice(5).map(at => interpolate(firstFive, at));
  const xors = predictions.map((p, i) => p ^ shareWords[i + 5]);
  return {
    exact: xors.map(v => v === 0n),
    differingBits: xors.map(bits),
    predictedPrefixes: predictions.map(v => hex64(v).slice(0, 16)),
    printedPrefixes: shareWords.slice(5).map(v => hex64(v).slice(0, 16))
  };
}

function plantControl() {
  const coeff = Array.from({length: 5}, (_, i) => BigInt('0x' +
    crypto.createHash('sha256').update('LP2 ssss independent control coeff ' + i)
      .digest('hex')));
  const shares = X.map(x => {
    let y = coeff[4];
    for (let i = 3; i >= 0; i--) y = multiply(y, x) ^ coeff[i];
    return y;
  });
  assert.deepEqual(verifyShares(shares).exact, [true, true, true]);
  assert.equal(interpolate(shares.slice(0, 5), 0n), coeff[0]);
  const tampered = shares.slice();
  tampered[7] ^= 1n;
  assert.deepEqual(verifyShares(tampered).exact, [true, true, false]);
  return {shareCount: 8, threshold: 5, secretSha256:
    crypto.createHash('sha256').update(Buffer.from(hex64(coeff[0]), 'hex')).digest('hex')};
}

function main() {
  assert.equal(table.rows.length * table.rows[0].length, 256);
  assert.equal(multiply(7n, inverse(7n)), 1n);
  const planted = plantControl();
  const cases = [];
  for (const radix of [60, 59]) {
    for (const layout of ['columns', 'row-major consecutive 32-byte blocks']) {
      const shareWords = getShareWords(radix, layout === 'columns' ? 'columns' : 'blocks');
      const evidence = verifyShares(shareWords);
      assert(evidence.exact.every(match => !match),
        'Original table matched the frozen 5-of-8 prediction: investigate!');
      cases.push({radix, layout, ...evidence});
    }
  }
  console.log(JSON.stringify({
    model: '2013 ssss 5-of-8 over GF(2^256)',
    fieldPoly: hex64(FIELD_POLY),
    positions: 'x=1..8 in original printed order',
    positiveControl: planted,
    cases,
    decision: 'No source-oriented reading yields 5-of-8 Shamir consistency.'
  }, null, 2));
}

main();
