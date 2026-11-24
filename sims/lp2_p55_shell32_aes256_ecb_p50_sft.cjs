#!/usr/bin/env node
'use strict';

// One frozen source-typed test: p55's 32 boundary runes as a raw GP0
// AES-256 key; the canonical p50 256-byte base60 table as AES-ECB input.
// No mode/IV/KDF/order search. Node built-ins only.

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const transcription = fs.readFileSync(path.join(root, 'resources/lp2-transcription.txt'), 'utf8');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));

const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const pages = transcription.split('%');
const page55 = pages[54];
const rawWords = page55
  .replaceAll('/', '')
  .replaceAll('\n', '')
  .replaceAll('\r', '')
  .split(/[-.&$§,:!?]/u)
  .map(part => (part.match(/[ᚠ-᛿]+/gu) || []).join(''))
  .filter(Boolean);

assert.equal(rawWords.length, 17);
const words = rawWords.slice(1); // exclude the incoming p54 carry
assert.equal(words.length, 16);

const { runes } = corpus;
const shellRunes = words.flatMap(word => {
  const chars = Array.from(word);
  return [chars[0], chars[chars.length - 1]];
});
assert.equal(shellRunes.length, 32);

const key = Buffer.from(shellRunes.map(rune => {
  const ordinal = runes.indexOf(rune);
  assert.notEqual(ordinal, -1);
  return ordinal; // historical GP0 byte representation
}));
assert.equal(key.length, 32);
assert.equal(key.toString('hex'), '19070f110e130f1900010704110c130011050c121c0f120f0216050e1701110a');
assert.equal(sha256(key), '4b7cb66b4e55c66edaec6627070bfe18ae1f9cbb93ec1a674cacfa977570df10');

const ciphertext = Buffer.from(grid.bytes);
assert.equal(grid.shape, '32 rows by 8 columns across LP2 pages 49, 50, 51');
assert.equal(ciphertext.length, 256);
assert.equal(sha256(ciphertext), '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

function aes256EcbEncrypt(input, aesKey) {
  const cipher = crypto.createCipheriv('aes-256-ecb', aesKey, null);
  cipher.setAutoPadding(false);
  return Buffer.concat([cipher.update(input), cipher.final()]);
}
function aes256EcbDecrypt(input, aesKey) {
  const decipher = crypto.createDecipheriv('aes-256-ecb', aesKey, null);
  decipher.setAutoPadding(false);
  return Buffer.concat([decipher.update(input), decipher.final()]);
}

// FIPS-197 AES-256 known-answer control.
const vectorKey = Buffer.from('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f', 'hex');
const vectorPlain = Buffer.from('00112233445566778899aabbccddeeff', 'hex');
assert.equal(aes256EcbEncrypt(vectorPlain, vectorKey).toString('hex'), '8ea2b7ca516745bfeafc49904b496089');

// Full-length positive control under the exact same implementation.
const planted = Buffer.from(Array.from({ length: 256 }, (_, i) => i));
assert.deepEqual(aes256EcbDecrypt(aes256EcbEncrypt(planted, key), key), planted);

// The one and only original receiver.
const plaintext = aes256EcbDecrypt(ciphertext, key);
const frequencies = new Array(256).fill(0);
for (const byte of plaintext) frequencies[byte]++;
const entropy = -frequencies.filter(Boolean).reduce((sum, count) => {
  const p = count / plaintext.length;
  return sum + p * Math.log2(p);
}, 0);
const printable = [...plaintext].filter(byte => byte >= 0x20 && byte <= 0x7e).length;

assert.equal(plaintext.length, 256);
assert.equal(sha256(plaintext), 'b2dffb03fa2f45fc68e78958e46dd72322eb8f5804439b5f33a3747f588f2d21');
assert.equal(printable, 85);
assert.ok(Math.abs(entropy - 7.205378210927494) < 1e-12);

console.log(JSON.stringify({
  source: {
    raw_p55_groups_including_carry: rawWords.length,
    complete_p55_words: words.length,
    shell_runes: shellRunes.length,
    p50_shape: grid.shape,
    p50_bytes: ciphertext.length,
    p50_sha256: sha256(ciphertext)
  },
  receiver: {
    mapping: 'interleaved first/last rune per complete p55 word -> GP0 ordinal byte',
    key_hex: key.toString('hex'),
    key_sha256: sha256(key),
    cipher: 'AES-256-ECB',
    padding: 'none',
    iv: null,
    plaintext_length: plaintext.length,
    plaintext_first_16_hex: plaintext.subarray(0, 16).toString('hex'),
    plaintext_sha256: sha256(plaintext),
    printable_ascii_bytes: printable,
    printable_fraction: printable / plaintext.length,
    shannon_entropy_bits_per_byte: entropy,
    plaintext_hex: plaintext.toString('hex')
  },
  controls: {
    fips_197_aes256_ecb_known_answer: 'PASS',
    256_byte_full_length_round_trip: 'PASS'
  }
}, null, 2));
