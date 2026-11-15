#!/usr/bin/env node
'use strict';

/*
 * Source-selected direct byte-XOR gate:
 *   256 conditional base60 table bytes (pp49-51)
 *   255 GP29 runes on p8, including its red initial
 *
 * Only the two natural end alignments are tested:
 *   A. table[0..254] XOR p8[0..254] (leave final table byte unused)
 *   B. table[1..255] XOR p8[0..254] (treat first table byte as a leading IV)
 *
 * No interior offset, reversal, modulo-29 postprocessing, or second cipher.
 * Run from repository root: node sims/lp2_p8_p50_table_byte_xor_gate.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const gridPath = path.join(root, 'resources/liber-primus/base60-grid.json');
const corpusPath = path.join(root, 'resources/liber-primus/lp2-corpus.json');
const gridBytes = fs.readFileSync(gridPath);
const corpusBytes = fs.readFileSync(corpusPath);
const grid = JSON.parse(gridBytes.toString('utf8'));
const corpus = JSON.parse(corpusBytes.toString('utf8'));

const alphabet = grid.alphabet;
assert.equal(alphabet.length, 60, 'conditional base60 alphabet length');
assert.equal(grid.rows.length, 32, '32 printed rows');
assert.ok(grid.rows.every(row => row.length === 8), 'eight tokens per row');

const table = grid.rows.flat().map(token => {
  assert.equal(token.length, 2, 'two-character table token: ' + token);
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0, 'token uses the declared alphabet: ' + token);
  return hi * 60 + lo;
});
assert.equal(table.length, 256, '32x8 source table');
assert.ok(table.every(x => Number.isInteger(x) && x >= 0 && x <= 255));
assert.deepEqual(table, grid.byte_rows.flat(), 'token decoding agrees with stored byte_rows');

const p8 = corpus.pages.find(p => p.page === 8);
assert.ok(p8, 'p8 exists in the canonical corpus');
assert.equal(p8.runic_count, 255);
assert.equal(p8.indices.length, 255);
assert.ok(p8.indices.every(x => Number.isInteger(x) && x >= 0 && x < 29));
assert.equal(p8.indices[0], 14, 'the red initial is included as the first GP29 rune');
const pagesWith255 = corpus.pages.filter(p => p.indices?.length === 255).map(p => p.page);
assert.deepEqual(pagesWith255, [8], 'p8 is the unique 255-rune page');

const signatures = [
  ['PNG', Buffer.from('89504e47', 'hex')],
  ['ZIP', Buffer.from('504b0304', 'hex')],
  ['PDF', Buffer.from('25504446', 'hex')],
  ['GZIP', Buffer.from('1f8b', 'hex')],
  ['ELF', Buffer.from('7f454c46', 'hex')],
  ['GIF', Buffer.from('47494638', 'hex')],
  ['JPEG', Buffer.from('ffd8ff', 'hex')],
];

function stats(bytes) {
  const freq = new Uint32Array(256);
  for (const b of bytes) freq[b]++;
  let entropy = 0;
  for (const n of freq) if (n) {
    const p = n / bytes.length;
    entropy -= p * Math.log2(p);
  }
  let validUtf8 = true;
  try { new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
  catch { validUtf8 = false; }
  const printable = bytes.filter(b => b >= 32 && b <= 126).length;
  return {
    length: bytes.length,
    printable,
    printable_fraction: printable / bytes.length,
    letters: bytes.filter(b => (b >= 65 && b <= 90) || (b >= 97 && b <= 122)).length,
    spaces: bytes.filter(b => b === 32).length,
    controls: bytes.filter(b => b < 32 || b === 127).length,
    high_bytes: bytes.filter(b => b >= 128).length,
    zero_bytes: bytes.filter(b => b === 0).length,
    distinct: new Set(bytes).size,
    entropy_bits_per_byte: entropy,
    valid_utf8: validUtf8,
    signatures: signatures.filter(([name, sig]) => bytes.subarray(0, sig.length).equals(sig)).map(([name]) => name),
    pgp_armor: bytes.toString('latin1').includes('-----BEGIN PGP'),
    first64_hex: bytes.subarray(0, 64).toString('hex'),
    sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
  };
}

const alignments = [
  { name: 'drop-final-table-byte', key: table.slice(0, 255), unused_byte: table[255] },
  { name: 'drop-first-table-byte', key: table.slice(1), unused_byte: table[0] },
];

const plantedText = Buffer.from('LP2-P50-P8-XOR-POSITIVE-CONTROL:');
const plantedPlain = Buffer.alloc(255);
for (let i = 0; i < plantedPlain.length; i++) plantedPlain[i] = plantedText[i % plantedText.length];

const results = alignments.map(({ name, key, unused_byte }) => {
  assert.equal(key.length, p8.indices.length);
  const output = Buffer.from(p8.indices.map((rune, i) => key[i] ^ rune));
  const plantedCipher = Buffer.from(plantedPlain.map((b, i) => b ^ key[i]));
  const recovered = Buffer.from(plantedCipher.map((b, i) => b ^ key[i]));
  assert.deepEqual(recovered, plantedPlain, name + ' positive control');
  return { name, unused_byte, ...stats(output) };
});

assert.equal(results[0].printable, 103);
assert.equal(results[0].spaces, 0);
assert.equal(results[0].controls, 23);
assert.equal(results[0].high_bytes, 129);
assert.equal(results[0].distinct, 156);
assert.equal(results[0].valid_utf8, false);
assert.equal(results[1].printable, 104);
assert.equal(results[1].spaces, 1);
assert.equal(results[1].controls, 23);
assert.equal(results[1].high_bytes, 128);
assert.equal(results[1].distinct, 160);
assert.equal(results[1].valid_utf8, false);

console.log(JSON.stringify({
  source: {
    table_shape: '32x8',
    table_tokens: table.length,
    table_min: Math.min(...table),
    table_max: Math.max(...table),
    table_distinct: new Set(table).size,
    p8_runes: p8.indices.length,
    p8_first_rune_index: p8.indices[0],
    pages_with_255_runes: pagesWith255,
    first_table_byte: table[0],
    final_table_byte: table[255],
    grid_json_sha256: crypto.createHash('sha256').update(gridBytes).digest('hex'),
    corpus_json_sha256: crypto.createHash('sha256').update(corpusBytes).digest('hex'),
  },
  operation: 'output[i] = base60_table_byte[i] XOR GP29_index[i]; output remains raw bytes',
  positive_control: '255-byte ASCII payload round-trips exactly under both alignments',
  results,
}, null, 2));
