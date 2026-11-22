'use strict';
/**
 * Reproduce the 2014 Stage5 third-image, historically decoded seven-column
 * *row-wise* transposition using the original key 1736254.
 *
 * Accepted source is the 140-byte, unkeyed OutGuess extraction from the exact
 * reverse-carved third JPEG in the avowy Stage5 archived GZIP object.
 * A standalone invocation without an input path runs on the pinned source
 * message. Supplying the extraction path also verifies its exact SHA256.
 * @module stage5_original_outguess_columnar_sft
 */
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');

const SOURCE_MESSAGE = [
  '',
  'For those who have fallen behind:',
  '',
  'TL BE IE OV UT HT RE ID TS EO ST PO SO YR ',
  'SL BT II IY T4 DG UQ IM NU 44 2I 15 33 9M',
  '',
  'Good luck.',
  '',
  '3301',
  '',
  '',
].join('\n');
const SOURCE_SHA256 = '4767d811f22abdb15bfee53c29bbd2488b123a9c290f63712f4ed12fdbc5963d';
const KEY = '1736254';
const EXPECTED = 'TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133';

/**
 * @param {string} sevenColumnCiphertext
 * @param {string} keyPermutation
 * @returns {string}
 */
function decode(sevenColumnCiphertext, keyPermutation) {
  assert.equal(sevenColumnCiphertext.length % keyPermutation.length, 0);
  assert.deepEqual([...keyPermutation].map(Number).sort((a, b) => a - b),
    Array.from({ length: keyPermutation.length }, (_, i) => i + 1));
  let plaintext = '';
  for (let start = 0; start < sevenColumnCiphertext.length; start += keyPermutation.length) {
    const row = sevenColumnCiphertext.slice(start, start + keyPermutation.length);
    plaintext += [...keyPermutation].map(digit => row[Number(digit) - 1]).join('');
  }
  return plaintext;
}

/**
 * @param {string} sevenColumnPlaintext
 * @param {string} keyPermutation
 * @returns {string}
 */
function encode(sevenColumnPlaintext, keyPermutation) {
  assert.equal(sevenColumnPlaintext.length % keyPermutation.length, 0);
  let ciphertext = '';
  for (let start = 0; start < sevenColumnPlaintext.length; start += keyPermutation.length) {
    const row = sevenColumnPlaintext.slice(start, start + keyPermutation.length);
    const output = new Array(keyPermutation.length);
    for (let i = 0; i < keyPermutation.length; i++) {
      output[Number(keyPermutation[i]) - 1] = row[i];
    }
    ciphertext += output.join('');
  }
  return ciphertext;
}

/**
 * @param {string} originalMessage
 * @returns {string}
 */
function extractGroupedCipher(originalMessage) {
  const sourceLines = originalMessage.split('\n');
  assert.equal(sourceLines[1], 'For those who have fallen behind:');
  assert.equal(sourceLines[6], 'Good luck.');
  assert.equal(sourceLines[8], '3301');
  const lineA = sourceLines[3].replace(/\s/g, '');
  const lineB = sourceLines[4].replace(/\s/g, '');
  assert.equal(lineA.length, 28);
  assert.equal(lineB.length, 28);
  return lineA + lineB;
}

function main() {
  const sourceMessage = process.argv[2] ? readFileSync(process.argv[2], 'utf8') : SOURCE_MESSAGE;
  const digest = createHash('sha256').update(sourceMessage, 'utf8').digest('hex');
  assert.equal(Buffer.byteLength(sourceMessage, 'utf8'), 140);
  assert.equal(digest, SOURCE_SHA256, 'requires the authentic 140-byte OutGuess plaintext');
  const ciphertext = extractGroupedCipher(sourceMessage);
  const recovered = decode(ciphertext, KEY);
  assert.equal(recovered, EXPECTED);
  assert.equal(encode(recovered, KEY), ciphertext);
  assert.equal(recovered.slice(36, 52).toLowerCase() + '.onion', 'q4utgdi2n4m4uim5.onion');
  assert.equal(recovered.slice(52), '9133');
  console.log('PASS original 140-byte Stage5 OutGuess; key 1736254; exact inverse/re-encode');
  console.log('Historical plaintext:', recovered);
  console.log('Recovered continuation:', recovered.slice(36, 52).toLowerCase() + '.onion');
  console.log('Unexplained trailing digits:', recovered.slice(52));
}
if (require.main === module) main();
module.exports = { decode, encode, extractGroupedCipher };
