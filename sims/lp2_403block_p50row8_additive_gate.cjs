#!/usr/bin/env node
'use strict';

// Bounded test: p50 32x8 rows as period-8 additive GP29 keys,
// one row per 403-rune block. The 60-rune tail is deliberately excluded.

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

const keys = table.rows.map(row => row.map(token => {
  if (typeof token !== 'string' || token.length !== 2) {
    throw new Error('Expected two-character base60 token');
  }
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  if (hi < 0 || lo < 0) throw new Error('Invalid base60 token: ' + token);
  return ((hi * 60) + lo) % 29;
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

function score(sign) {
  const decoded = prefix.map((value, index) => {
    const block = Math.floor(index / blockSize);
    const offset = index % blockSize;
    const shift = keys[block][offset % 8];
    return (value + (sign * shift) + 29) % 29;
  });
  const value = ioc(decoded);
  return {
    operation: sign < 0 ? 'subtract-row-key' : 'add-row-key',
    runes_scored: decoded.length,
    ioc: value,
    normalized_ioc_29x: value * 29
  };
}

const original = ioc(prefix);
const output = {
  model: 'one p50 table row per 403-rune block; repeat its 8 values modulo 29',
  block_size: blockSize,
  full_blocks: fullBlocks,
  total_unknown_runes: cipher.length,
  scored_runes: prefix.length,
  untested_tail_runes: cipher.length - prefix.length,
  key_shape: '32x8',
  key_mapping: 'base60 token -> byte -> modulo 29',
  key_clock: 'offset modulo 8, reset at each 403-rune block',
  original_prefix_ioc: original,
  original_prefix_normalized_ioc_29x: original * 29,
  results: [score(-1), score(1)]
};

console.log(JSON.stringify(output, null, 2));
