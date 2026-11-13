'use strict';

/**
 * Historical 2012 signed decimal postscript -> GP29 -> original LP2 p55.
 *
 * Single source-selected candidate, not a dictionary or arbitrary seed scan.
 * Source:
 * https://github.com/iBotPeaches/cicada_3301/blob/a0a616d85717af59f8b806875b43d51e06e1e874/messages/2012/hello-we-have-now.asc
 *
 * The original three decimal rows (40,45,46 digits) are joined in author
 * order. A big-endian base29 conversion yields exactly 89 GP digits. The
 * original p55 cipher has 76 runes and a visible 13-dot close mark.
 * Test only trimming the first or last 13 key digits, in the two authentic
 * Cicada GP29 additive directions. The exact 13-digit remainder must predict
 * the independently solved beginning of original p56 if carried forward.
 *
 * Neither the p55 trim nor the cross-release key transfer is signed.
 * The 2012 P.S. also had a separate original 3301 visual-rotation use.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'
), 'utf8'));

const ROWS = [
  '1041279065891998535982789873959431895640',
  '442510695567564373922695237268242385295908173',
  '9834390370374475764863415203423499357108713631'
];
const p55 = corpus.pages.find((page) => page.page === 55).indices;
const p56 = corpus.pages.find((page) => page.page === 56).indices;
const clearP57 = corpus.pages.find((page) => page.page === 57).indices;
assert.deepEqual(ROWS.map((line) => line.length), [40, 45, 46]);
assert.equal(ROWS.join('').length, 131);
assert.equal(p55.length, 76);
assert.equal(p56.length, 85);
assert.equal(clearP57.length, 95);

/**
 * @param {string} decimal
 * @returns {number[]}
 */
function decimalToGp29(decimal) {
  let n = BigInt(decimal);
  const values = [];
  do {
    values.push(Number(n % 29n));
    n /= 29n;
  } while (n > 0n);
  return values.reverse();
}
const key = decimalToGp29(ROWS.join(''));
assert.equal(key.length, 89);
assert.equal(key.length - p55.length, 13);

/**
 * @param {readonly number[]} ciphertext
 * @param {readonly number[]} pad
 * @param {number} sign
 * @returns {number[]}
 */
function decode(ciphertext, pad, sign) {
  assert.equal(ciphertext.length, pad.length);
  return ciphertext.map((symbol, i) => (symbol + 29 + sign * pad[i]) % 29);
}

/**
 * @param {readonly number[]} data
 * @returns {number}
 */
function indexOfCoincidence(data) {
  const counts = Array(29).fill(0);
  for (const value of data) counts[value] += 1;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (data.length * (data.length - 1));
}

/**
 * @param {readonly number[]} data
 * @returns {string}
 */
function translit(data) {
  return data.map((symbol) => corpus.translit[symbol]).join('');
}

/** @returns {number[]} */
function firstThirteenTotientKeys() {
  const primes = [];
  for (let candidate = 2; primes.length < 13; candidate += 1) {
    if (primes.every((p) => candidate % p !== 0)) primes.push(candidate);
  }
  return primes.map((p) => (p - 1) % 29);
}
const authenticP56Key13 = firstThirteenTotientKeys();
assert.deepEqual(authenticP56Key13, [1, 2, 4, 6, 10, 12, 16, 18, 22, 28, 1, 7, 11]);
const predictedPlainP56First13 = decode(p56.slice(0, 13), authenticP56Key13, -1);

console.log('SOURCE',
  '2012PS-digits=' + ROWS.join('').length,
  'base29-key=' + key.length,
  'p55-cipher=' + p55.length,
  'remainder=' + (key.length - p55.length));
console.log('SOURCE', '2012PS-rune-prefix=' + translit(key.slice(0, 20)));
console.log('CONTROL',
  'known-p56-first13-plain=' + translit(predictedPlainP56First13),
  'totient-keys=' + authenticP56Key13.join(','));

for (const offset of [0, 13]) {
  const pad = key.slice(offset, offset + p55.length);
  const leftover = offset === 0 ? key.slice(76) : key.slice(0, 13);
  assert.equal(pad.length, 76);
  assert.equal(leftover.length, 13);
  for (const sign of [-1, 1]) {
    const decoded = decode(p55, pad, sign);
    assert.deepEqual(decode(decoded, pad, -sign), p55);
    const plantedCipher = decode(clearP57.slice(0, 76), pad, -sign);
    assert.deepEqual(decode(plantedCipher, pad, sign), clearP57.slice(0, 76));

    const carryPrediction = decode(p56.slice(0, 13), leftover, sign);
    const carryMatches = carryPrediction.filter(
      (value, i) => value === predictedPlainP56First13[i]
    ).length;

    console.log('ORIGINAL',
      'offset=' + offset,
      'sign=' + sign,
      'ioc=' + indexOfCoincidence(decoded).toFixed(9),
      'p55-plain=' + translit(decoded),
      'p56-first13-hits=' + carryMatches + '/13',
      'p56-first13-predicted=' + translit(carryPrediction));
  }
}
console.log('PASS all authentic-original and planted round trips');
