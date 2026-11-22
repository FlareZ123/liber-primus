'use strict';

// Source-frozen AES-256-ECB test: 2013 167/761 quiz cookies versus
// physical row-major 256 bytes printed on LP2 pp49-51.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');

const { bytes } = require(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json'));
const ciphertext = Buffer.from(bytes);
assert.equal(ciphertext.length, 256);
assert.equal(crypto.createHash('sha256').update(ciphertext).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const COOKIE_KEYS = Object.freeze({
  167: '6941f707ff39d259ff71657a79cb6b54c184d2f0455810109c1a960860bde0e6',
  761: '7bc1e7805ccfa518920f0d94fc4e8f7dbd83287a03b337b89109cd2287befae5',
});

/** @param {Buffer} input @param {Buffer} key @param {boolean} decrypt @returns {Buffer} */
function transform(input, key, decrypt) {
  const primitive = decrypt
    ? crypto.createDecipheriv('aes-256-ecb', key, null)
    : crypto.createCipheriv('aes-256-ecb', key, null);
  primitive.setAutoPadding(false);
  return Buffer.concat([primitive.update(input), primitive.final()]);
}

/** @param {Buffer} b @returns {number} */
function printable(b) { return [...b].filter(v => v >= 32 && v <= 126).length; }
/** @param {Buffer} b @returns {number} */
function lettersSpaces(b) {
  return [...b].filter(v => (v >= 65 && v <= 90) || (v >= 97 && v <= 122) || v === 32).length;
}

const expectedSha256 = Object.freeze({
  167: '2ee5bd921303001087a964192703dc11b1a27a7463b3a3d7db19da6dc138c9c5',
  761: 'a33b7b653a20fa51ba86fd71e3b1dfbfbc14f7cd5a388a470925278eef52c0d4',
});
const plant = Buffer.from('LIKE THE INSTAR TUNNELING TO THE SURFACE FIND THE DIVINITY WITHIN AND EMERGE '.repeat(4).slice(0, 256), 'ascii');
assert.equal(plant.length, 256);
for (const [cookie, hex] of Object.entries(COOKIE_KEYS)) {
  const key = Buffer.from(hex, 'hex');
  assert.equal(key.length, 32);
  const plaintext = transform(ciphertext, key, true);
  assert.deepEqual(transform(plaintext, key, false), ciphertext);
  const hash = crypto.createHash('sha256').update(plaintext).digest('hex');
  assert.equal(hash, expectedSha256[cookie]);
  assert.deepEqual(transform(transform(plant, key, false), key, true), plant);
  console.log('cookie=' + cookie + ' original_blocks=16 printable=' + printable(plaintext) +
    '/256 letters_or_spaces=' + lettersSpaces(plaintext) + '/256 sha256=' + hash);
  console.log('  plaintext_head_32=' + plaintext.subarray(0, 32).toString('hex'));
  console.log('  control=256/256 exact native-Cicada-message plant');
}
console.log('PASS: both source keys are byte-exact reversible but no literal plaintext/header is exposed.');
