#!/usr/bin/env node
'use strict';

// Bounded tests: p50 32x8 rows as keys for 32 consecutive 403-rune blocks.
// Primary score covers only the 32 complete blocks; the 60-rune tail is excluded.

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const table = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/base60-grid.json'), 'utf8'));

const cipher = corpus.pages
  .filter(page => page.page < 56)
  .flatMap(page => page.indices);

const alphabet = table.alphabet;
if (table.kind !== 'base60-byte-table' || !Array.isArray(table.rows) ||
    table.rows.length !== 32 || table.rows.some(row => row.length !== 8)) {
  throw new Error('Expected the canonical 32x8 base60 byte table');
}

const byteRows = table.rows.map(row => row.map(token => {
  if (typeof token !== 'string' || token.length !== 2) {
    throw new Error('Expected two-character base60 token');
  }
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  if (hi < 0 || lo < 0) throw new Error('Invalid base60 token: ' + token);
  return (hi * 60) + lo;
}));

const blockSize = 13 * 31;
const fullBlocks = 32;
const prefixLength = blockSize * fullBlocks;
if (cipher.length !== 12956 || prefixLength > cipher.length) {
  throw new Error('Unexpected LP2 rune count or block coverage');
}
const prefix = cipher.slice(0, prefixLength);

function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  const n = values.length;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}

function score(values, model, operation) {
  const value = ioc(values);
  return {
    model,
    operation,
    runes_scored: values.length,
    ioc: value,
    normalized_ioc_29x: value * 29
  };
}

function rc4(key, length) {
  const state = Array.from({ length: 256 }, (_, index) => index);
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + state[i] + key[i % key.length]) & 255;
    [state[i], state[j]] = [state[j], state[i]];
  }
  const output = [];
  let i = 0;
  j = 0;
  for (let k = 0; k < length; k++) {
    i = (i + 1) & 255;
    j = (j + state[i]) & 255;
    [state[i], state[j]] = [state[j], state[i]];
    output.push(state[(state[i] + state[j]) & 255]);
  }
  return output;
}

const originalIoc = ioc(prefix);
const results = [];

for (const sign of [-1, 1]) {
  const additive = prefix.map((value, index) => {
    const block = Math.floor(index / blockSize);
    const offset = index % blockSize;
    const shift = byteRows[block][offset % 8] % 29;
    return (value + (sign * shift) + 29) % 29;
  });
  results.push(score(
    additive,
    'one p50 row per 403-rune block; repeat its 8 byte values modulo 29',
    sign < 0 ? 'subtract-row-key' : 'add-row-key'
  ));

  const rc4Decoded = [];
  for (let block = 0; block < fullBlocks; block++) {
    const stream = rc4(byteRows[block], blockSize);
    for (let offset = 0; offset < blockSize; offset++) {
      const shift = stream[offset] % 29;
      rc4Decoded.push((prefix[block * blockSize + offset] + (sign * shift) + 29) % 29);
    }
  }
  results.push(score(
    rc4Decoded,
    'one p50 8-byte row as standard RC4 key per 403-rune block; keystream byte modulo 29',
    sign < 0 ? 'subtract-rc4-stream' : 'add-rc4-stream'
  ));
}

const output = {
  block_size: blockSize,
  full_blocks: fullBlocks,
  total_unknown_runes: cipher.length,
  scored_runes: prefix.length,
  untested_tail_runes: cipher.length - prefix.length,
  key_table_shape: '32x8',
  key_mapping: 'base60 token -> byte; additive key uses byte modulo 29; RC4 uses raw 8-byte row',
  original_prefix_ioc: originalIoc,
  original_prefix_normalized_ioc_29x: originalIoc * 29,
  results
};

console.log(JSON.stringify(output, null, 2));
