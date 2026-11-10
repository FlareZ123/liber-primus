'use strict';

// Genuine Cicada solved page 01: 184 original ciphertext runes against the
// independent known plaintext in resources/liber-primus/lp1-plaintext-reference.txt.
// The source uses editorial English, normalized to Gematria Primus transliteration.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const resource = (name) => fs.readFileSync(
  path.join(__dirname, '..', 'resources', name), 'utf8'
);
const corpus = JSON.parse(resource('liber-primus/lp2-corpus.json'));
const cipherPage = resource('transcriptions/lp1_wulfic_canonical.txt').split('%')[0];
const cipher = [...cipherPage].filter((rune) => corpus.runes.includes(rune))
  .map((rune) => corpus.runes.indexOf(rune));
const reference = resource('liber-primus/lp1-plaintext-reference.txt')
  .split('### 1')[1].split('### 3')[0];
const expected = reference.replace(/[^A-Z]/g, '')
  .replaceAll('V', 'U').replaceAll('K', 'C').replaceAll('ING', 'NG');

assert.equal(cipher.length, 184);
assert.equal(expected.length, 199);

/** @param {number} coefficient @param {number} offset @returns {string} */
function decipher(coefficient, offset) {
  return cipher.map((rune) =>
    corpus.translit[(coefficient * rune + offset) % 29]).join('');
}

/** @type {Array<{coefficient:number,offset:number}>} */
const exactMappings = [];
for (let coefficient = 0; coefficient < 29; coefficient++) {
  for (let offset = 0; offset < 29; offset++) {
    if (decipher(coefficient, offset) === expected) {
      exactMappings.push({ coefficient, offset });
    }
  }
}
assert.deepEqual(exactMappings, [{ coefficient: 28, offset: 28 }]);
assert.equal(decipher(28, 28), expected);
console.log(JSON.stringify({
  regression: 'LP1 page 01 / original JPEG 01',
  cipherRunes: cipher.length,
  normalizedPlainCharacters: expected.length,
  affineMappingsTested: 29 * 29,
  exactMappings,
  status: 'PASS'
}, null, 2));
