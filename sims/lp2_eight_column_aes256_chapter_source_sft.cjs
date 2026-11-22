'use strict';

/**
 * Bounded original-key decryption candidate: the eight vertical 32-byte
 * columns of LP2's original 32x8 base60 table seed one AES-256-CTR
 * 28-symbol chain key per transcript dollar-delimited group (not the nine visually marked chapters).
 *
 * Explicit unsupported premise: the 2014 author chose AES-256-CTR with
 * an all-zero IV and this table-column ordering. This script tries only
 * that frozen candidate, with EA as the zero-step plaintext symbol.
 * No adaptive key search or self-declared plaintext success.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createCipheriv} = require('node:crypto');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/base60-grid.json'), 'utf8'));
const transcript = fs.readFileSync(path.join(root, 'resources/lp2-transcription.txt'), 'utf8');
const alphabet = new Set(corpus.runes);
// The eight transcript '$' groups differ from nine image-atlas visual sections.
const chapterLengths = transcript.split('$').slice(0, 8).map(block => [...block].filter(r => alphabet.has(r)).length);
assert.deepEqual(chapterLengths, [729, 1145, 1738, 1894, 1021, 1433, 1680, 3316]);
assert.equal(grid.byte_rows.length, 32);
for (const row of grid.byte_rows) assert.equal(row.length, 8);
const keys = Array.from({length: 8}, (_, col) => Buffer.from(grid.byte_rows.map(row => row[col])));
for (const key of keys) assert.equal(key.length, 32);

const ciphertext = corpus.pages.slice(0, 56).flatMap(page => page.indices);
assert.equal(ciphertext.length, 12956);
const chapters = [];
let offset = 0;
for (const length of chapterLengths) {
  chapters.push(ciphertext.slice(offset, offset + length));
  offset += length;
}
assert.equal(offset, ciphertext.length);

/** @param {Buffer} key @param {number} length @returns {Buffer} */
function aesKeyStream(key, length) {
  const cipher = createCipheriv('aes-256-ctr', key, Buffer.alloc(16));
  return Buffer.concat([cipher.update(Buffer.alloc(length)), cipher.final()]);
}

/**
 * GP29 step 0 encodes EA (28); steps 1..28 encode other runes
 * after subtracting the AES byte modulo 28.
 * @param {number[]} input
 * @param {Buffer} key
 * @returns {number[]}
 */
function decode(input, key) {
  const keystream = aesKeyStream(key, input.length);
  const plaintext = [];
  let predecessor = 0;
  for (let i = 0; i < input.length; i++) {
    const delta = (input[i] - predecessor + 29) % 29;
    const symbol = delta === 0 ? 28 : (delta - 1 - keystream[i] % 28 + 28) % 28;
    plaintext.push(symbol);
    predecessor = input[i];
  }
  return plaintext;
}

/** @param {number[]} plaintext @param {Buffer} key @returns {number[]} */
function encode(plaintext, key) {
  const keystream = aesKeyStream(key, plaintext.length);
  const ciphertext = [];
  let predecessor = 0;
  for (let i = 0; i < plaintext.length; i++) {
    const delta = plaintext[i] === 28 ? 0 : 1 + ((plaintext[i] + keystream[i] % 28) % 28);
    predecessor = (predecessor + delta) % 29;
    ciphertext.push(predecessor);
  }
  return ciphertext;
}

/** @param {number[]} symbols @returns {number} */
function indexOfCoincidence(symbols) {
  const counts = Array(29).fill(0);
  for (const symbol of symbols) counts[symbol]++;
  return counts.reduce((n, count) => n + count * (count - 1), 0) / (symbols.length * (symbols.length - 1));
}

/** @param {number[]} symbols @returns {string} */
function spell(symbols) {
  return symbols.map(symbol => corpus.translit[symbol]).join('');
}

const authenticPlaintext = corpus.pages[57].indices;
assert.equal(authenticPlaintext.length, 95);
const planted = encode(authenticPlaintext, keys[0]);
assert.deepEqual(decode(planted, keys[0]), authenticPlaintext);

const decoded = chapters.map((cipher, index) => {
  const plain = decode(cipher, keys[index]);
  assert.deepEqual(encode(plain, keys[index]), cipher);
  return plain;
});
const joined = decoded.flat();
const summary = decoded.map((plain, index) => ({
  chapter_index: index,
  runes: plain.length,
  cipher_ioc29: indexOfCoincidence(chapters[index]),
  decoded_ioc29: indexOfCoincidence(plain),
  ea_zero_steps: plain.filter(x => x === 28).length,
  decoded_prefix_120: spell(plain.slice(0, 120))
}));
console.log(JSON.stringify({
  mechanism: 'Eight 32-byte vertical table columns => AES-256-CTR(zero IV) => chain mod29 with zero-step EA',
  column_keys_sha256: keys.map(key => require('node:crypto').createHash('sha256').update(key).digest('hex')),
  control: {source: 'authentic clear LP2 physical p57, 95 GP runes', roundtrip: true, native_ioc29: indexOfCoincidence(authenticPlaintext)},
  original: {runes: joined.length, original_cipher_ioc29: indexOfCoincidence(ciphertext), decoded_ioc29: indexOfCoincidence(joined), ea_zero_steps: joined.filter(x => x === 28).length},
  chapters: summary,
  evidence_limit: 'A correct synthetic roundtrip is necessary but not evidence of original plaintext. Without long coherent actual source plaintext this AES-CTR candidate fails the gate.'
}, null, 2));
