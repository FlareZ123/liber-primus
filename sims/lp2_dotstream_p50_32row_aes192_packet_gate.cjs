#!/usr/bin/env node
'use strict';

// Bounded source-channel test:
//  - the external 30-symbol 13-dot/10-dot stream is mapped in order to the
//    30 nonempty intervals among 32 p50 rows (empty intervals 8 and 11);
//  - zero bits select three 8-byte rows as a 24-byte AES-192 key;
//  - the two empty rows form a 16-byte IV;
//  - one bits select 27 rows as a 216-byte payload.
// This is a hypothesis test, not an established Cicada instruction.

const fs = require('node:fs');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const readJson = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const grid = readJson('resources/liber-primus/lp2-grid-256.json');
const transcription = fs.readFileSync('resources/lp2-transcription.txt', 'utf8');

const ciphertext = corpus.pages
  .filter(page => page.page <= 55)
  .flatMap(page => page.indices);
const table = grid.bytes;
const runeRE = /[\u16A0-\u16FF]/gu;
const sectionLengths = transcription.split('$')
  .map(section => Array.from(section.matchAll(runeRE)).length)
  .slice(0, 8);

assert.equal(ciphertext.length, 12956);
assert.deepEqual(sectionLengths, [729, 1145, 1738, 1894, 1021, 1433, 1680, 3316]);
assert.equal(sectionLengths.reduce((a, b) => a + b, 0), ciphertext.length);
assert.equal(table.length, 256);

// The 30-bit sequence is transcribed from the 13-dot/10-dot census:
// 13-dot => 1; 10-dot => 0. Positions in this literal are 1-based.
const bits = '111111111111111111111001110111';
const emptyRows = [8, 11]; // 1-based empty intervals from the 31-marker/32-interval audit
const nonemptyRows = Array.from({ length: 32 }, (_, i) => i + 1)
  .filter(row => !emptyRows.includes(row));
const zeroPositions = Array.from(bits, (bit, i) => bit === '0' ? i + 1 : null)
  .filter(x => x !== null);
const keyRows = zeroPositions.map(position => nonemptyRows[position - 1]);
const dataRows = Array.from(bits, (bit, i) => bit === '1' ? nonemptyRows[i] : null)
  .filter(x => x !== null);
const rowBytes = rows => rows.flatMap(row => table.slice((row - 1) * 8, row * 8));

const key = Buffer.from(rowBytes(keyRows));
const ivFromEmptyRows = Buffer.from(rowBytes(emptyRows));
const payload = Buffer.from(rowBytes(dataRows));
const ivFromDotStream = Buffer.from('0000000000000000000000003ffffe77', 'hex');
const zeroIV = Buffer.alloc(16);

assert.deepEqual(zeroPositions, [22, 23, 27]);
assert.deepEqual(keyRows, [24, 25, 29]);
assert.equal(dataRows.length, 27);
assert.equal(key.length, 24);
assert.equal(ivFromEmptyRows.length, 16);
assert.equal(payload.length, 216);

// Validate the host AES-192 primitive against the FIPS-197 AES-192 ECB vector.
const testKey = Buffer.from('8e73b0f7da0e6452c810f32b809079e562f8ead2522c6b7b', 'hex');
const testPlain = Buffer.from('6bc1bee22e409f96e93d7e117393172a', 'hex');
const testCipher = crypto.createCipheriv('aes-192-ecb', testKey, null);
testCipher.setAutoPadding(false);
const testOut = Buffer.concat([testCipher.update(testPlain), testCipher.final()]).toString('hex');
assert.equal(testOut, 'bd334f1d6e45f25ff712a214571fa5cc');

function ioc(values) {
  const f = Array(29).fill(0);
  for (const value of values) f[value]++;
  const n = values.length;
  return f.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}

// Direct per-section Vigenere interpretation: one 32-symbol key per $ section,
// sourced either from vertical table columns or consecutive 32-byte row-major
// blocks. Only orientation, row direction and additive sign are varied.
const layouts = {
  vertical: (section, row) => table[row * 8 + section],
  contiguous: (section, row) => table[section * 32 + row],
};
const vigenere = [];
for (const [layout, at] of Object.entries(layouts)) {
  for (const reverseRows of [false, true]) {
    for (const sign of [-1, 1]) {
      const output = [];
      let offset = 0;
      const perSection = [];
      for (let section = 0; section < 8; section++) {
        const length = sectionLengths[section];
        const key32 = Array.from({ length: 32 }, (_, r) =>
          at(section, reverseRows ? 31 - r : r) % 29);
        const decoded = ciphertext.slice(offset, offset + length).map((value, i) =>
          ((value + sign * key32[i % 32]) % 29 + 29) % 29);
        perSection.push(ioc(decoded));
        output.push(...decoded);
        offset += length;
      }
      vigenere.push({ layout, reverseRows, sign, fullIoc: ioc(output), perSectionIoc: perSection });
    }
  }
}
vigenere.sort((a, b) => b.fullIoc - a.fullIoc);

function decrypt(mode, iv) {
  const decipher = crypto.createDecipheriv(`aes-192-${mode}`, key, iv);
  return Buffer.concat([decipher.update(payload), decipher.final()]);
}
function byteStats(buffer) {
  const counts = Array(256).fill(0);
  let printable = 0;
  for (const byte of buffer) {
    counts[byte]++;
    if (byte >= 32 && byte <= 126) printable++;
  }
  const entropy = -counts.filter(Boolean).reduce((sum, count) => {
    const p = count / buffer.length;
    return sum + p * Math.log2(p);
  }, 0);
  return {
    printable,
    printableRatio: printable / buffer.length,
    entropyBitsPerByte: entropy,
    first32Hex: buffer.subarray(0, 32).toString('hex'),
    first64Ascii: Array.from(buffer.subarray(0, 64), byte =>
      byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.').join(''),
    last16Hex: buffer.subarray(-16).toString('hex'),
  };
}

const aes = [];
for (const [ivName, iv] of [
  ['empty-rows-8-and-11', ivFromEmptyRows],
  ['30-bit-dot-stream-big-endian', ivFromDotStream],
  ['zero', zeroIV],
]) {
  for (const mode of ['ctr', 'ofb', 'cfb']) {
    aes.push({ ivName, mode, ...byteStats(decrypt(mode, iv)) });
  }
}

console.log(JSON.stringify({
  sourceShape: {
    sectionLengths,
    unknownRunes: ciphertext.length,
    p50Shape: '32x8',
    dotBits: bits,
    emptyIntervalRows: emptyRows,
    nonemptyIntervalCount: nonemptyRows.length,
    zeroPositions1Based: zeroPositions,
    keyRows1Based: keyRows,
    dataRowCount: dataRows.length,
  },
  packet: {
    keyHex: key.toString('hex'),
    ivFromEmptyRowsHex: ivFromEmptyRows.toString('hex'),
    payloadBytes: payload.length,
    payloadFirst32Hex: payload.subarray(0, 32).toString('hex'),
    aes192FipsVector: testOut,
  },
  rawCiphertextIoc: ioc(ciphertext),
  bestDirectSectionVigenere: vigenere.slice(0, 4),
  aesModes: aes,
}, null, 2));
