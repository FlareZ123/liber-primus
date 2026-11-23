#!/usr/bin/env node
'use strict';

// Test whether the original p49-p51 32x8 numeric table is itself the
// combinatorial rank sidecar for LP2's 86 adjacent-repeat positions.
//
// Run from the repository root:
//   node sims/lp2_p49p51_raw_repeat_rank_sidecar_sft.cjs
//
// This is a bounded raw-readout test. It does not try arbitrary encryption,
// hashes, PRNGs, or fitted transformations. It tests both the conventional
// base60 byte interpretation and the historically proposed f-deleted base59
// interpretation.

const fs = require('node:fs');
const assert = require('node:assert/strict');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const base60 = JSON.parse(fs.readFileSync('resources/liber-primus/base60-grid.json', 'utf8'));
const grid256 = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-grid-256.json', 'utf8'));

const pages = corpus.pages.filter(page => page.page <= 55 && page.runic_count > 0);
const runes = pages.flatMap(page => page.indices);
assert.equal(runes.length, 12956);

const repeatPositions = [];
for (let i = 1; i < runes.length; i++) {
  if (runes[i] === runes[i - 1]) repeatPositions.push(i - 1);
}

const transitionCount = runes.length - 1;
const repeatCount = repeatPositions.length;
assert.equal(transitionCount, 12955);
assert.equal(repeatCount, 86);

function choose(n, r) {
  if (r < 0 || r > n) return 0n;
  r = Math.min(r, n - r);
  let value = 1n;
  for (let i = 1; i <= r; i++) {
    value = value * BigInt(n - r + i) / BigInt(i);
  }
  return value;
}

function colexRank(positions) {
  return positions.reduce((sum, position, j) => sum + choose(position, j + 1), 0n);
}

function lexRank(positions, n) {
  let rank = 0n;
  let previous = -1;
  for (let j = 0; j < positions.length; j++) {
    for (let candidate = previous + 1; candidate < positions[j]; candidate++) {
      rank += choose(n - candidate - 1, positions.length - j - 1);
    }
    previous = positions[j];
  }
  return rank;
}

function bytesToBigInt(bytes, littleEndian) {
  const ordered = littleEndian ? bytes.slice().reverse() : bytes;
  const hex = ordered.map(byte => byte.toString(16).padStart(2, '0')).join('');
  return BigInt('0x' + hex);
}

const combinations = choose(transitionCount, repeatCount);
const ranks = [
  { name: 'colex', value: colexRank(repeatPositions) },
  { name: 'lex', value: lexRank(repeatPositions, transitionCount) }
];
const rankBits = (combinations - 1n).toString(2).length;
assert.equal(rankBits, 742);
assert.ok(ranks.every(rank => rank.value.toString(2).length === 742));

const base60Bytes = base60.byte_rows.flat();
assert.equal(base60Bytes.length, 256);
assert.deepEqual(base60Bytes, grid256.bytes);

const base59Alphabet = base60.alphabet.replace('f', '');
assert.equal(base60.alphabet.length, 60);
assert.equal(base59Alphabet.length, 59);
const tokens = base60.rows.flat();
assert.equal(tokens.length, 256);
assert.equal(tokens.filter(token => token.includes('f')).length, 0);
const base59Bytes = tokens.map(token =>
  base59Alphabet.indexOf(token[0]) * 59 + base59Alphabet.indexOf(token[1])
);
assert.equal(base59Bytes.length, 256);
assert.ok(base59Bytes.every(value => value >= 0 && value <= 255));

const streams = [
  { name: 'base60', bytes: base60Bytes },
  { name: 'f-deleted-base59', bytes: base59Bytes }
];
for (const stream of streams) assert.equal(new Set(stream.bytes).size, 161);

const chunksFor = bytes => [
  { name: 'full256', bytes },
  { name: 'first128', bytes: bytes.slice(0, 128) },
  { name: 'last128', bytes: bytes.slice(128) }
];

const mask742 = (1n << 742n) - 1n;
const matches = [];
let testedRepresentations = 0;

for (const stream of streams) {
  for (const chunk of chunksFor(stream.bytes)) {
    for (const endian of ['big', 'little']) {
      const value = bytesToBigInt(chunk.bytes, endian === 'little');
      const bitLength = BigInt(chunk.bytes.length * 8);
      const forms = [
        { name: 'mod-combination-count', value: value % combinations, complementBase: combinations - 1n },
        { name: 'low-742-bits', value: value & mask742, complementBase: mask742 },
        { name: 'high-742-bits', value: value >> (bitLength - 742n), complementBase: mask742 }
      ];

      for (const form of forms) {
        for (const rank of ranks) {
          testedRepresentations += 2;
          if (form.value === rank.value) {
            matches.push({ stream: stream.name, chunk: chunk.name, endian, form: form.name, rank: rank.name, kind: 'direct' });
          }
          if (form.value === form.complementBase - rank.value) {
            matches.push({ stream: stream.name, chunk: chunk.name, endian, form: form.name, rank: rank.name, kind: 'complement' });
          }
        }
      }
    }
  }
}

assert.equal(testedRepresentations, 144);
assert.deepEqual(matches, []);

console.log(JSON.stringify({
  source: {
    tablePages: base60.lp2_pages,
    rowCounts: base60.page_row_counts,
    rows: base60.rows.length,
    columns: base60.rows[0].length,
    entriesPerRadix: 256,
    base60Range: [Math.min(...base60Bytes), Math.max(...base60Bytes)],
    base59Range: [Math.min(...base59Bytes), Math.max(...base59Bytes)],
    distinctValuesPerRadix: 161
  },
  repeatMask: {
    transitions: transitionCount,
    repeats: repeatCount,
    combinations: combinations.toString(),
    rankBits,
    colexRankHex: ranks[0].value.toString(16),
    lexRankHex: ranks[1].value.toString(16)
  },
  tested: {
    radices: streams.map(stream => stream.name),
    chunks: ['full256', 'first128', 'last128'],
    byteOrders: ['big', 'little'],
    representations: ['mod-combination-count', 'low-742-bits', 'high-742-bits'],
    ranks: ['colex', 'lex'],
    directAndComplement: true,
    count: testedRepresentations,
    matches
  }
}, null, 2));

console.log('\nPASS: neither base60 nor f-deleted base59 raw table readout equals the repeat-mask rank or its complement.');
