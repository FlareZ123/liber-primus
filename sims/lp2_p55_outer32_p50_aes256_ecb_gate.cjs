#!/usr/bin/env node
'use strict';

// Single size-matched control: the 32 page-local p55 word-boundary runes
// (excluding the one-rune p54 carry) as a raw AES-256 key for the 256-byte
// p50 table. No KDF, IV, normalization, padding, or mode search is performed.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const p55 = corpus.pages.find((p) => p.page === 55).indices;
const printedWordLengths = [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
let offset = 0;
const exterior = [];
for (const length of printedWordLengths) {
  const word = p55.slice(offset, offset + length);
  assert.equal(word.length, length);
  offset += length;
  if (length === 1) exterior.push(word[0]);
  else exterior.push(word[0], word[length - 1]);
}
assert.equal(offset, 76);
assert.equal(exterior.length, 33);
const keyBytes = Buffer.from(exterior.slice(1)); // exclude the p54 carry
assert.equal(keyBytes.length, 32);
assert(keyBytes.every((b) => b <= 28));
const ciphertext = Buffer.from(grid.bytes);
assert.equal(ciphertext.length, 256);

const decipher = crypto.createDecipheriv('aes-256-ecb', keyBytes, null);
decipher.setAutoPadding(false);
const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
assert.equal(plaintext.length, 256);
const printable = [...plaintext].filter((b) => b >= 32 && b <= 126).length / plaintext.length;
const alphabetic = [...plaintext].filter((b) =>
  (b >= 65 && b <= 90) || (b >= 97 && b <= 122)
).length / plaintext.length;

console.log(JSON.stringify({
  keySource: 'p55 page-local exterior word endpoints; exclude one-rune p54 carry',
  keyGP: exterior.slice(1).map((i) => corpus.translit[i]).join(''),
  keyBytes: [...keyBytes],
  ciphertextSource: 'resources/liber-primus/lp2-grid-256.json',
  ciphertextBytes: ciphertext.length,
  receiver: 'AES-256-ECB raw decrypt, no padding',
  plaintextBytes: plaintext.length,
  sha256: crypto.createHash('sha256').update(plaintext).digest('hex'),
  printableFraction: printable,
  alphabeticFraction: alphabetic,
  first128Ascii: [...plaintext.slice(0, 128)].map((b) =>
    b >= 32 && b <= 126 ? String.fromCharCode(b) : '.'
  ).join('')
}, null, 2));
