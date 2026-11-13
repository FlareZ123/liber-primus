'use strict';

/**
 * Eight natural 32-byte table columns as ChaCha20-256 keys, one key per
 * historical eight-section LP2 text segmentation. The source does not
 * authenticate this byte codec, key pairing, or zero IV.
 *
 * SFT: node sims/lp2_grid8_chacha20_base29_byte_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
/** @param {string} relative @returns {any} */
function readJson(relative) {
  return JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
}

const db = readJson('resources/liber-primus/lp2-corpus.json');
const grid = readJson('resources/liber-primus/lp2-grid-256.json').bytes;
const sourceRunes = db.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const cuts = [0, 729, 1874, 3612, 5506, 6527, 7960, 9640, 12956];
assert.equal(sourceRunes.length, 12956);
assert.equal(grid.length, 256);
assert.equal(cuts.at(-1), sourceRunes.length);
const keys = Array.from({length: 8}, (_, col) =>
  Buffer.from(Array.from({length: 32}, (_, row) => grid[8 * row + col])));

/**
 * Preserve the announced byte width to retain the original digit framing.
 * @param {number[]} digits 0..28
 * @returns {Buffer}
 */
function encodeBase29Bytes(digits) {
  let n = 0n;
  for (const digit of digits) {
    assert(Number.isInteger(digit) && digit >= 0 && digit < 29);
    n = n * 29n + BigInt(digit);
  }
  const count = Math.ceil(digits.length * Math.log2(29) / 8);
  const bytes = Buffer.alloc(count);
  for (let i = count - 1; i >= 0; --i) {
    bytes[i] = Number(n & 255n);
    n >>= 8n;
  }
  assert.equal(n, 0n);
  return bytes;
}

/**
 * Unpack the original-length base29 integer from its fixed-width byte carrier.
 * @param {Buffer} bytes
 * @param {number} runeLength
 * @returns {number[]}
 */
function decodeBase29Bytes(bytes, runeLength) {
  let n = 0n;
  for (const octet of bytes) n = (n << 8n) | BigInt(octet);
  const digits = Array(runeLength).fill(0);
  for (let i = runeLength - 1; i >= 0; --i) {
    digits[i] = Number(n % 29n);
    n /= 29n;
  }
  assert.equal(n, 0n, 'packed integer must fit original rune count');
  return digits;
}

/** ChaCha20 with RFC original 64-bit block counter and 64-bit nonce, all zero.
 * OpenSSL's 16-byte IV is counter64 || nonce64.
 * @param {Buffer} key
 * @param {number} byteLength
 * @returns {Buffer}
 */
function chachaPad(key, byteLength) {
  const cipher = crypto.createCipheriv('chacha20', key, Buffer.alloc(16));
  return cipher.update(Buffer.alloc(byteLength));
}
/** @param {Buffer} a @param {Buffer} b @returns {Buffer} */
function xor(a, b) {
  assert.equal(a.length, b.length);
  return Buffer.from(a.map((v, i) => v ^ b[i]));
}
/** @param {Buffer} bytes */
function preview(bytes) {
  return [...bytes.subarray(0, 36)].map(c => c >= 32 && c <= 126 ?
    String.fromCharCode(c) : '.').join('');
}
/** @param {Buffer} bytes */
function printable(bytes) {
  let count = 0;
  for (const c of bytes) {
    if ((c >= 32 && c <= 126) || c === 9 || c === 10 || c === 13) count++;
  }
  return count / bytes.length;
}

const zeroVector =
  '76b8e0ada0f13d90405d6ae55386bd28bdd219b8a08ded1aa836efcc8b770dc7da41597c5157488d7724e03fb8d84a376a43b8f41518a11cc387b669b2ee6586';
assert.equal(chachaPad(Buffer.alloc(32), 64).toString('hex'), zeroVector);
const solvedP57 = db.pages.find(p => p.page === 57).indices;
assert.equal(solvedP57.length, 95);
const solvedBytes = encodeBase29Bytes(solvedP57);
assert.deepEqual(decodeBase29Bytes(solvedBytes, 95), solvedP57);
const solvedPad = chachaPad(keys[0], solvedBytes.length);
const planted = xor(solvedBytes, solvedPad);
assert.deepEqual(xor(planted, solvedPad), solvedBytes, 'native solved-p57 plant');
assert.deepEqual(decodeBase29Bytes(xor(planted, solvedPad), 95), solvedP57);

const rows = [];
for (let section = 0; section < 8; ++section) {
  const segment = sourceRunes.slice(cuts[section], cuts[section + 1]);
  const raw = encodeBase29Bytes(segment);
  assert.deepEqual(decodeBase29Bytes(raw, segment.length), segment);
  const pad = chachaPad(keys[section], raw.length);
  const decoded = xor(raw, pad);
  assert.deepEqual(xor(decoded, pad), raw, 'original complete byte inverse');
  rows.push({
    section,
    runeLength: segment.length,
    byteLength: raw.length,
    rawHeader12: raw.subarray(0, 12).toString('hex'),
    decodedHeader12: decoded.subarray(0, 12).toString('hex'),
    rawPrintable: Number(printable(raw).toFixed(6)),
    decodedPrintable: Number(printable(decoded).toFixed(6)),
    decodedPreview: preview(decoded),
  });
}
assert.deepEqual(rows.map(x => x.byteLength), [443,696,1056,1151,620,871,1021,2014]);
assert(rows.every(x => x.decodedPrintable < 0.42));
const results = {
  status: 'PASS',
  classification: 'one original-input direct byte interpretation; no recognizable language or file prefix',
  rule: 'Each historical 8-section GP29 integer -> minimal fixed-width big-endian bytes; ChaCha20 XOR from corresponding 32-byte printed table column, zero counter/nonce',
  keySelection: 'Original 32x8 printed table vertical columns 0..7 in original order',
  source: 'Canonical LP2 pp0..55 12956 GP indices; eight historical text-source cuts',
  chacha20KnownAnswer: true,
  originalBase29PackUnpack: true,
  originalByteXorRoundTrips: 8,
  nativeSolvedP57Plant: true,
  rows,
  limits: 'No alternative mappings, permutations, random IVs or post-decryption compression were fit; no source-authenticated key/codec is identified',
};
if (require.main === module) console.log(JSON.stringify(results, null, 2));
module.exports = {encodeBase29Bytes, decodeBase29Bytes, chachaPad, xor};
