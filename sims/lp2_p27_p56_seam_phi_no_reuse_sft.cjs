'use strict';

/**
 * Source-exact, original-rune check of p56's authenticated prime-totient key
 * against the 85 p27 runes immediately after the unique p55/p56 seam copy.
 * Node 22, CommonJS, no network and no file writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const gp = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));

/** @param {number} value @returns {number} */
function mod(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const result = [];
  for (let value = 2; result.length < count; value++) {
    if (result.every(prime => prime * prime > value || value % prime !== 0)) {
      result.push(value);
    }
  }
  return result;
}

const phi = firstPrimes(100).map(prime => prime - 1);
const p27 = gp.pages.find(page => page.page === 27).indices;
const p55 = gp.pages.find(page => page.page === 55).indices;
const p56 = gp.pages.find(page => page.page === 56).indices;
const p57 = gp.pages.find(page => page.page === 57).indices;
assert.equal(p27.length, 234);
assert.equal(p55.length, 76);
assert.equal(p56.length, 85);
assert.equal(p57.length, 95);
assert.deepEqual(p27.slice(28, 35), p55.slice(-6).concat(p56[0]));

/**
 * The source's solved F-transparency encryptor: P=F emits C=F and does
 * not consume the next prime. Other plaintext runes use C=P+phi(prime).
 * @param {number[]} plaintext
 * @param {number} sign decoding sign: -1 authentic p56, +1 comparator
 * @returns {number[]}
 */
function encrypt(plaintext, sign = -1) {
  let keyIndex = 0;
  return plaintext.map(rune => rune === 0 ? 0 : mod(rune - sign * phi[keyIndex++]));
}

/**
 * Exhaust every plausible F transparency decision at every C=F site.
 * For the actual p56 key, sign=-1; sign=+1 is only a finite alternate.
 * A non-F ciphertext rune cannot decode to plaintext F under this rule.
 * @param {number[]} ciphertext
 * @param {number} sign
 * @returns {Array<{mask:number, plaintext:number[]}>}
 */
function allValidDecodings(ciphertext, sign) {
  const fPositions = ciphertext.flatMap((rune, index) => rune === 0 ? [index] : []);
  const valid = [];
  for (let mask = 0; mask < 2 ** fPositions.length; mask++) {
    const plaintext = [];
    let keyIndex = 0;
    let invalid = false;
    for (let i = 0; i < ciphertext.length; i++) {
      const fBit = fPositions.indexOf(i);
      if (fBit >= 0 && (mask & (1 << fBit)) !== 0) {
        plaintext.push(0);
        continue;
      }
      const plain = mod(ciphertext[i] + sign * phi[keyIndex++]);
      if (plain === 0) {
        invalid = true;
        break;
      }
      plaintext.push(plain);
    }
    if (!invalid) {
      assert.deepEqual(encrypt(plaintext, sign), ciphertext);
      valid.push({mask, plaintext});
    }
  }
  return valid;
}

/** @param {number[]} runes @returns {number} */
function indexOfCoincidence(runes) {
  const counts = Array(29).fill(0);
  for (const rune of runes) counts[rune]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (runes.length * (runes.length - 1));
}

const decoded56 = p56.map((rune, i) => i === 56 ? 0 : mod(rune - phi[i > 56 ? i - 1 : i]));
assert.equal(decoded56.map(i => gp.translit[i]).join(''),
  'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTO' +
  'ITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE');
assert.deepEqual(encrypt(decoded56), p56);
const authentic56 = allValidDecodings(p56, -1);
assert(authentic56.some(candidate => candidate.plaintext.every((rune, i) => rune === decoded56[i])));

const p57NativePlant = p57.slice(0, 85);
const plantedCipher = encrypt(p57NativePlant);
assert(allValidDecodings(plantedCipher, -1)
  .some(candidate => candidate.plaintext.every((rune, i) => rune === p57NativePlant[i])));

const sourceWindow = p27.slice(34, 119);
assert.equal(sourceWindow.length, 85);
const fPositions = sourceWindow.flatMap((rune, i) => rune === 0 ? [i] : []);
assert.deepEqual(fPositions, [1, 20, 27, 34, 77]);
const sourceSign = allValidDecodings(sourceWindow, -1);
const reversedSign = allValidDecodings(sourceWindow, 1);
assert.equal(sourceSign.length, 0);
assert.deepEqual(reversedSign.map(x => x.mask), [8, 24]);
assert.deepEqual(reversedSign.map(x => Number(indexOfCoincidence(x.plaintext).toFixed(10))),
  [0.0361344538, 0.0344537815]);

const first56NoSkip = sourceWindow.slice(0, 56).map((rune, i) => mod(rune - phi[i]));
assert.equal(Number(indexOfCoincidence(first56NoSkip).toFixed(10)), 0.0292207792);
console.log(JSON.stringify({
  source: 'Canonical original LP2 pp27,55,56 and solved p57',
  sourceSeam: 'p55 last 6 + p56 first 1 equals p27 local 28..34',
  originalTest: 'p27 local 34..118, 85 runes',
  FPositions: fPositions,
  masks: 2 ** fPositions.length,
  solvedP56AllRunes: decoded56.length,
  solvedP56Recovered: authentic56.length > 0,
  solvedP57NativePlantRecovered: true,
  sourcePrimeTotientFTransparentValid: sourceSign.length,
  reversedSignValid: reversedSign.map(x => ({mask:x.mask, ioc:indexOfCoincidence(x.plaintext)})),
  first56NoSkipIoC: indexOfCoincidence(first56NoSkip),
  status: 'NO ORIGINAL P27 PLAINTEXT OR RECOVERED KEY',
}, null, 2));
