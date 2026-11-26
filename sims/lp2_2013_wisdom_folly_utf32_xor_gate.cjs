#!/usr/bin/env node
'use strict';

// Test the literal one-32-bit-word-per-original-rune XOR interpretation of
// the 2013 Cicada OS wisdom/folly binary against LP2 physical pages 51–55.
// This is a bounded UTF-32/codepoint XOR gate, not a generic key search.

const fs = require('node:fs');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const bytes = Buffer.from(
  fs.readFileSync('resources/historical/cicada2013-wisdom-folly.b64', 'utf8').replace(/\s+/g, ''),
  'base64'
);
const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const sourceSha256 = crypto.createHash('sha256').update(bytes).digest('hex');
const pages = corpus.pages.filter(p => p.page >= 51 && p.page <= 55);
const indices = pages.flatMap(p => p.indices);
const codepoints = indices.map(i => corpus.runes[i].codePointAt(0));
const runeSet = new Set(corpus.runes);

assert.equal(sourceSha256, '7e5ec097728197f5c0dba0729980565658fba486965809ffa25e3910a31c385a');
assert.equal(bytes.length, 3368);
assert.deepEqual(pages.map(p => p.runic_count), [92, 263, 179, 232, 76]);
assert.equal(indices.length, 842);
assert.equal(codepoints.length * 4, bytes.length);

function analyze(endian) {
  let validUnicode = 0;
  let gpRunes = 0;
  let ascii = 0;
  let printableAscii = 0;
  const validExamples = [];

  for (let i = 0; i < codepoints.length; i++) {
    const offset = i * 4;
    const word = endian === 'BE' ? bytes.readUInt32BE(offset) : bytes.readUInt32LE(offset);
    const decoded = (word ^ codepoints[i]) >>> 0;
    const scalar = decoded <= 0x10ffff && !(decoded >= 0xd800 && decoded <= 0xdfff);

    if (scalar) {
      validUnicode++;
      const ch = String.fromCodePoint(decoded);
      if (runeSet.has(ch)) gpRunes++;
      if (decoded < 0x80) {
        ascii++;
        if (decoded >= 0x20 && decoded <= 0x7e) printableAscii++;
      }
      if (validExamples.length < 8) {
        validExamples.push({
          position: i + 1,
          sourceRuneIndex: indices[i],
          ciphertextCodepoint: `U+${codepoints[i].toString(16).toUpperCase()}`,
          sourceWord: `0x${word.toString(16).padStart(8, '0')}`,
          xorCodepoint: `U+${decoded.toString(16).toUpperCase()}`,
        });
      }
    }
  }

  return {
    endian,
    validUnicodeScalars: validUnicode,
    gpRuneOutputs: gpRunes,
    asciiOutputs: ascii,
    printableAsciiOutputs: printableAscii,
    invalidOrSurrogate: codepoints.length - validUnicode,
    validExamples,
  };
}

const bigEndian = analyze('BE');
const littleEndian = analyze('LE');

assert.equal(bigEndian.validUnicodeScalars, 2);
assert.equal(bigEndian.gpRuneOutputs, 0);
assert.equal(bigEndian.asciiOutputs, 0);
assert.equal(littleEndian.validUnicodeScalars, 0);
assert.equal(littleEndian.gpRuneOutputs, 0);
assert.equal(littleEndian.asciiOutputs, 0);

console.log(JSON.stringify({
  sourceSha256,
  sourceBytes: bytes.length,
  receiverPages: pages.map(p => ({ page: p.page, runes: p.runic_count })),
  receiverRunes: indices.length,
  bytesPerRune: bytes.length / indices.length,
  bigEndian,
  littleEndian,
  decision: 'Direct one-DWORD-per-rune XOR to Unicode scalars is rejected in both natural byte orders.',
}, null, 2));
