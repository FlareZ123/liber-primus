#!/usr/bin/env node
'use strict';

// Frozen direct-byte hypothesis:
// The p50 32x8 base-60 table is eight 32-byte AES-256 keys, one per
// left-to-right $-terminated LP2 section. GP29 indices are packed MSB-first
// as fixed-width 5-bit symbols and decrypted with AES-256-CTR, zero counter.
// No alternate mode, IV, key orientation, section permutation, or radix is searched.

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const grid = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');

const alphabet = [...grid.alphabet];
const digit = new Map(alphabet.map((ch, i) => [ch, i]));
const byteValue = token => {
  assert.equal(token.length, 2, 'bad p50 token: ' + token);
  const a = digit.get(token[0]), b = digit.get(token[1]);
  assert.notEqual(a, undefined); assert.notEqual(b, undefined);
  const v = 60 * a + b;
  assert(v >= 0 && v <= 255);
  return v;
};
assert.equal(grid.rows.length, 32);
assert(grid.rows.every(row => row.length === 8));
const keys = Array.from({ length: 8 }, (_, col) =>
  Buffer.from(grid.rows.map(row => byteValue(row[col])))
);
assert(keys.every(key => key.length === 32));

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const sections = transcription.split('$').slice(0, 8).map(section =>
  [...section].filter(ch => runeIndex.has(ch)).map(ch => runeIndex.get(ch))
);
const expectedLengths = [729, 1145, 1738, 1894, 1021, 1433, 1680, 3316];
assert.deepEqual(sections.map(s => s.length), expectedLengths);
const canonicalUnknown = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.deepEqual(sections.flat(), canonicalUnknown);
assert.equal(canonicalUnknown.length, 12956);

function pack5(values) {
  const out = [];
  let acc = 0, bits = 0;
  for (const v of values) {
    assert(Number.isInteger(v) && v >= 0 && v < 29);
    acc = (acc << 5) | v;
    bits += 5;
    while (bits >= 8) {
      bits -= 8;
      out.push((acc >>> bits) & 255);
      acc &= (1 << bits) - 1;
    }
  }
  if (bits > 0) out.push((acc << (8 - bits)) & 255);
  return Buffer.from(out);
}

function unpack5(bytes, count) {
  const out = [];
  let acc = 0, bits = 0, at = 0;
  while (out.length < count) {
    while (bits < 5) {
      assert(at < bytes.length, 'short decrypted bitstream');
      acc = (acc << 8) | bytes[at++];
      bits += 8;
    }
    bits -= 5;
    out.push((acc >>> bits) & 31);
    acc &= (1 << bits) - 1;
  }
  return out;
}

function cryptCtr(bytes, key) {
  const d = crypto.createDecipheriv('aes-256-ctr', key, Buffer.alloc(16, 0));
  return Buffer.concat([d.update(bytes), d.final()]);
}

// Positive control: fixed-width 5-bit pack/unpack and AES-CTR round-trip.
let seed = 0x3301;
function random29() {
  seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
  return (seed >>> 0) % 29;
}
for (let col = 0; col < 8; col++) {
  const plant = Array.from({ length: 513 }, random29);
  const packed = pack5(plant);
  const enc = crypto.createCipheriv('aes-256-ctr', keys[col], Buffer.alloc(16, 0));
  const encrypted = Buffer.concat([enc.update(packed), enc.final()]);
  assert.deepEqual(unpack5(cryptCtr(encrypted, keys[col]), plant.length), plant);
}

const results = sections.map((cipher, col) => {
  const packed = pack5(cipher);
  const decodedBytes = cryptCtr(packed, keys[col]);
  const values = unpack5(decodedBytes, cipher.length);
  const invalid = values.filter(v => v >= 29).length;
  return {
    section: col + 1,
    rune_count: cipher.length,
    packed_bytes: packed.length,
    invalid_5bit_symbols: invalid,
    prefix_5bit: values.slice(0, 96),
    prefix_translit: values.slice(0, 96).map(v => v < 29 ? corpus.translit[v] : '[' + v + ']').join(''),
    key_sha256: crypto.createHash('sha256').update(keys[col]).digest('hex'),
    values
  };
});
const invalidTotal = results.reduce((s, r) => s + r.invalid_5bit_symbols, 0);
const all = results.flatMap(r => r.values);
const counts = Array(32).fill(0);
for (const v of all) counts[v]++;
console.log(JSON.stringify({
  hypothesis: 'direct AES-256-CTR decryption of 5-bit GP29 sections using p50 columns as keys',
  parameters: {
    table: 'base60-grid.json; 32 rows x 8 columns; columns read top-to-bottom',
    section_lengths: expectedLengths,
    section_to_key: 'left-to-right, no permutation',
    mode: 'AES-256-CTR',
    initial_counter_hex: '00'.repeat(16),
    symbol_packing: 'MSB-first, 5 bits per GP29 index; zero-pad only the final partial byte of each section',
    first_symbol: 'encrypted as ordinary data',
    alternative_modes_or_IVs_searched: false
  },
  controls: { eight_513_symbol_plants_roundtrip: true },
  decoded_symbols: all.length,
  invalid_symbols_29_to_31: invalidTotal,
  counts_0_to_31: counts,
  sections: results.map(({ values, ...r }) => r)
}, null, 2));
