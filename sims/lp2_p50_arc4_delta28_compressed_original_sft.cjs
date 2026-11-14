#!/usr/bin/env node
'use strict';

/**
 * One source-frozen LP2 transport: original GP29 nonzero increments -> base28
 * integer bytes -> OutGuess-era ARC4 with full original p49–51 table as key.
 *
 * Original motivation: Cicada used OutGuess 0.2, whose arc.c states that its
 * arc4 generator serves encryption and PRNG; 256-byte p50 table and sparse
 * zero-GP-differences select the key and raw digit candidate. The composition
 * is HYPOTHETICAL. One complete book-wide, uninterrupted source-order clock,
 * no additional phase, no key search. A positive synthetic full-length
 * reversibility check does not validate the cipher on unknown LP2.
 *
 * SFT: node sims/lp2_p50_arc4_delta28_compressed_original_sft.cjs
 *
 * @typedef {{first:number,digits:number[],repeatSuccessors:number[]}} Ranked
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');

const root = path.resolve(__dirname, '..');
const input = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const corpus = input('resources/liber-primus/lp2-corpus.json');
const source = input('resources/liber-primus/base60-grid.json');
const unknown = corpus.pages.filter((p) => p.page >= 0 && p.page <= 55)
  .flatMap((p) => p.indices);
const key = source.byte_rows.flat();
assert.equal(source.byte_rows.length, 32);
assert.ok(source.byte_rows.every((row) => row.length === 8));
assert.equal(key.length, 256);
assert.ok(key.every((b) => Number.isInteger(b) && b >= 0 && b < 256));
assert.equal(unknown.length, 12956);
assert.equal(corpus.runes.length, 29);

/** @param {readonly number[]} c @returns {Ranked} */
function rank(c) {
  const digits = [];
  const repeatSuccessors = [];
  for (let i = 1; i < c.length; i++) {
    const delta = (c[i] - c[i - 1] + 29) % 29;
    if (delta === 0) repeatSuccessors.push(i);
    else digits.push(delta - 1);
  }
  return { first: c[0], digits, repeatSuccessors };
}

/** @param {readonly number[]} digits @returns {Buffer} */
function base28ToBytes(digits) {
  let value = 0n;
  for (const d of digits) {
    assert.ok(Number.isInteger(d) && d >= 0 && d < 28);
    value = 28n * value + BigInt(d);
  }
  const octets = [];
  while (value) {
    octets.unshift(Number(value % 256n));
    value /= 256n;
  }
  return Buffer.from(octets);
}

/** @param {Buffer} bytes @param {number} width @returns {number[]} */
function bytesToBase28(bytes, width) {
  let value = 0n;
  for (const b of bytes) value = 256n * value + BigInt(b);
  const digits = [];
  while (value) {
    digits.unshift(Number(value % 28n));
    value /= 28n;
  }
  assert.ok(digits.length <= width);
  return Array(width - digits.length).fill(0).concat(digits);
}

/** @param {Ranked} r @param {number} n @returns {number[]} */
function unrank(r, n) {
  const repeated = new Set(r.repeatSuccessors);
  const result = [r.first];
  let digitAt = 0;
  for (let i = 1; i < n; i++) {
    result.push(repeated.has(i) ?
      result[i - 1] : (result[i - 1] + r.digits[digitAt++] + 1) % 29);
  }
  assert.equal(digitAt, r.digits.length);
  return result;
}

/** @param {readonly number[]} keyBytes @param {number} length @returns {Buffer} */
function rc4(keyBytes, length) {
  assert.ok(keyBytes.length >= 1 && keyBytes.length <= 256);
  const S = Array.from({length: 256}, (_, i) => i);
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + S[i] + keyBytes[i % keyBytes.length]) & 255;
    [S[i], S[j]] = [S[j], S[i]];
  }
  const output = Buffer.alloc(length);
  let i = 0;
  j = 0;
  for (let k = 0; k < length; k++) {
    i = (i + 1) & 255;
    j = (j + S[i]) & 255;
    [S[i], S[j]] = [S[j], S[i]];
    output[k] = S[(S[i] + S[j]) & 255];
  }
  return output;
}

/** @param {Buffer} a @param {Buffer} b @returns {Buffer} */
function xor(a, b) {
  assert.equal(a.length, b.length);
  return Buffer.from(a.map((v, i) => v ^ b[i]));
}

assert.equal(rc4(Array.from(Buffer.from('Key','ascii')),9).toString('hex'),
  'eb9f7781b734ca72a7');

const ranked = rank(unknown);
assert.equal(ranked.repeatSuccessors.length, 86);
assert.equal(ranked.digits.length, 12869);
assert.deepEqual(unrank(ranked, unknown.length), unknown);
const serialized = base28ToBytes(ranked.digits);
assert.equal(serialized.length, 7734);
assert.deepEqual(bytesToBase28(serialized, ranked.digits.length), ranked.digits);

const decrypted = xor(serialized, rc4(key, serialized.length));
const first = decrypted.subarray(0, 24).toString('hex');
const gzip = decrypted.subarray(0, 3).equals(Buffer.from('1f8b08','hex'));
const bzip2 = /^425a683[1-9]/i.test(decrypted.subarray(0, 4).toString('hex'));
const zlibHeader = decrypted[0] === 0x78 && [0x01,0x5e,0x9c,0xda].includes(decrypted[1]);
const printable = Array.from(decrypted).filter(x=>x>=32&&x<=126).length;
const originalOutguessMd5 = crypto.createHash('md5').update('EncryptionKey').digest('hex');
assert.equal(originalOutguessMd5, '387414bcd0862806df84e831b3b6c613');
// OutGuess 0.2 original arc.c arc4_initkey: MD5(type || key),
// with type literal "Encryption" (confirmed outguess.c do_embed/do_retrieve),
// then arc4_addrandom(digest16) = ordinary 16-byte RC4 KSA.
const originalOutguessKey = crypto.createHash('md5')
  .update(Buffer.from('Encryption', 'ascii')).update(Buffer.from(key)).digest();
const outguessBytes = xor(serialized, rc4(Array.from(originalOutguessKey), serialized.length));
const outguessGzip = outguessBytes.subarray(0, 3).equals(Buffer.from('1f8b08', 'hex'));
const outguessBzip2 = /^425a683[1-9]/i.test(outguessBytes.subarray(0,4).toString('hex'));
const outguessZlib = outguessBytes[0] === 0x78 &&
  [0x01, 0x5e, 0x9c, 0xda].includes(outguessBytes[1]);
const outguessPrintable = Array.from(outguessBytes).filter(x=>x>=32&&x<=126).length;
assert.equal(outguessGzip, false);
assert.equal(outguessBzip2, false);
assert.equal(outguessZlib, false);
assert.equal(gzip, false);
assert.equal(bzip2, false);
assert.equal(zlibHeader, false);

// An actual 7,683-byte gzip payload; source-shaped, length-complete plant
// through all 12,956 GP29 positions and all 86 observed repeated-run sites.
// The random content has a deterministic fixed seed and no external sources.
let state = 0x3301c4ca;
const synthetic = Buffer.alloc(7660);
for (let i = 0; i < synthetic.length; i++) {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  synthetic[i] = state & 255;
}
const compressed = zlib.gzipSync(synthetic, {level:0,mtime:0});
assert.ok(compressed.length > 7660 && compressed.length < serialized.length);
const encryptedBytes = xor(compressed, rc4(key, compressed.length));
const plantedDigits = bytesToBase28(encryptedBytes, ranked.digits.length);
const planted = unrank({
  first: ranked.first, digits: plantedDigits,
  repeatSuccessors: ranked.repeatSuccessors
}, unknown.length);
assert.equal(planted.length, unknown.length);
const plantExtracted = base28ToBytes(rank(planted).digits);
assert.deepEqual(plantExtracted, encryptedBytes);
const plainExtracted = xor(plantExtracted, rc4(key, plantExtracted.length));
assert.deepEqual(plainExtracted, compressed);
assert.deepEqual(zlib.gunzipSync(plainExtracted), synthetic);
assert.deepEqual(rank(planted).repeatSuccessors, ranked.repeatSuccessors);
// Independent original-OutGuess-MD5-then-ARC4 positive on the identical
// source geometry, all 86 zero sites and the *same* real gzip plant.
const plantedOutguessBytes = xor(compressed,
  rc4(Array.from(originalOutguessKey), compressed.length));
const plantedOutguess = unrank({
  first: ranked.first,
  digits: bytesToBase28(plantedOutguessBytes, ranked.digits.length),
  repeatSuccessors: ranked.repeatSuccessors
},unknown.length);
assert.deepEqual(rank(plantedOutguess).repeatSuccessors,ranked.repeatSuccessors);
const rereadOutguess = base28ToBytes(rank(plantedOutguess).digits);
assert.deepEqual(rereadOutguess,plantedOutguessBytes);
assert.deepEqual(zlib.gunzipSync(xor(rereadOutguess,
  rc4(Array.from(originalOutguessKey), rereadOutguess.length))),synthetic);

console.log('ARC4_DELTA28_GATE', JSON.stringify({
  source: 'Original LP2 pp0–55 + source p49–51 table, original printed-order all pages',
  assumption: 'GP29 positive predecessor differences (repeat sites skipped) -> single base28 integer -> ARC4 XOR with full 256-byte table key',
  originalRunes: unknown.length,
  originalRepetitions: ranked.repeatSuccessors.length,
  originalDigits: ranked.digits.length,
  originalBytes: serialized.length,
  keyBytes: key.length,
  originalBytesSha256: crypto.createHash('sha256').update(serialized).digest('hex'),
  encryptedBytesPrefix: serialized.subarray(0,24).toString('hex'),
  decryptedBytesPrefix: first,
  decodedGzipHeader: gzip,
  decodedBzip2Header: bzip2,
  decodedZlibHeader: zlibHeader,
  printableAscii: printable,
  printableFraction: Number((printable/decrypted.length).toFixed(6)),
  sourceNativeOutguessKdf: 'MD5(ASCII Encryption || row-major 256 table bytes)',
  sourceNativeOutguessMd5Hex: originalOutguessKey.toString('hex'),
  sourceNativeOutguessPrefix: outguessBytes.subarray(0,24).toString('hex'),
  sourceNativeOutguessGzipHeader: outguessGzip,
  sourceNativeOutguessBzip2Header: outguessBzip2,
  sourceNativeOutguessZlibHeader: outguessZlib,
  sourceNativeOutguessPrintable: outguessPrintable,
  sourceNativeOutguessPrintableFraction:
    Number((outguessPrintable/outguessBytes.length).toFixed(6)),
  plantSourceNativeOutguessPass: true,
  plantGzipLength: compressed.length,
  plantSameLengthAndAll86RepeatSites: true,
  plantReversibleAndGunzip: true,
  recoveredUnknownPlaintext: false
}, null, 2));
