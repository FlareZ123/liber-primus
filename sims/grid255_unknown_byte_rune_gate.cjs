'use strict';
/**
 * Exact direct-table test for the original 255-rune moth-page pair.
 * No key guessing: allow an arbitrary deterministic byte -> GP rune map.
 * All byte-label coincidences must match the published glyph labels.
 * Node.js 22, CommonJS, no dependencies beyond the repository.
 */
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const table = require('../resources/liber-primus/lp2-grid-256.json');

const SIZE = 256;
const RUNES = 29;

/** @param {number[]} source */
function readingOrders(source) {
  assert.equal(source.length, SIZE);
  const specs = [
    ['row-major', i => i],
    ['column-major', i => (i % 32) * 8 + Math.floor(i / 32)],
    ['row-serpentine', i => Math.floor(i / 8) * 8 +
      (Math.floor(i / 8) % 2 ? 7 - i % 8 : i % 8)],
    ['column-serpentine', i => (Math.floor(i / 32) % 2 ? 31 - i % 32 : i % 32) * 8 +
      Math.floor(i / 32)]
  ];
  return specs.flatMap(([name, lookup]) => {
    const forward = Array.from({length: SIZE}, (_, i) => source[lookup(i)]);
    return [
      {name, direction: 'forward', values: forward},
      {name, direction: 'reverse', values: forward.slice().reverse()}
    ];
  });
}

/**
 * The optimal arbitrary byte -> rune table is the per-byte modal glyph.
 * Every remaining contradictory observation must be altered or discarded.
 * @param {number[]} glyphs 255 observed rune indices
 * @param {number[]} bytes 256 source bytes in one traversal
 * @param {number} gap Which single grid cell is omitted, 0..255
 */
function exactOneGap(glyphs, bytes, gap) {
  const counts = new Uint16Array(SIZE * RUNES);
  const seen = new Uint8Array(SIZE);
  for (let i = 0; i < SIZE - 1; i++) {
    const value = bytes[i + (i >= gap ? 1 : 0)];
    counts[value * RUNES + glyphs[i]]++;
    seen[value] = 1;
  }
  let correct = 0, distinct = 0, conflicts = 0;
  for (let byte = 0; byte < SIZE; byte++) {
    if (!seen[byte]) continue;
    distinct++;
    let total = 0, best = 0;
    for (let rune = 0; rune < RUNES; rune++) {
      const n = counts[byte * RUNES + rune];
      total += n;
      if (n > best) best = n;
    }
    correct += best;
    if (total !== best) conflicts++;
  }
  return {errors: glyphs.length - correct,
    distinctBytes: distinct,
    repeatedByteConstraints: glyphs.length - distinct,
    conflictingByteClasses: conflicts};
}

/**
 * Exhaust natural printed-grid traversals and every missing cell.
 * The finite minimization is exact, including an arbitrary secret lookup.
 * @param {number[]} glyphs
 * @param {number[]} bytes
 */
function search(glyphs, bytes) {
  assert.equal(glyphs.length, SIZE - 1);
  assert.equal(bytes.length, SIZE);
  assert(glyphs.every(v => Number.isInteger(v) && v >= 0 && v < RUNES));
  assert(bytes.every(v => Number.isInteger(v) && v >= 0 && v < SIZE));

  const trials = [];
  for (const order of readingOrders(bytes)) {
    for (const glyphDir of ['forward', 'reverse']) {
      const input = glyphDir === 'forward' ? glyphs : glyphs.slice().reverse();
      let best = {errors: Infinity};
      for (let gap = 0; gap < SIZE; gap++) {
        const result = exactOneGap(input, order.values, gap);
        if (result.errors < best.errors) best = {gap, ...result};
      }
      trials.push({order: order.name, byteDirection: order.direction,
        glyphDirection: glyphDir, ...best});
    }
  }
  trials.sort((a, b) => a.errors - b.errors);
  return {models: trials.length * SIZE, best: trials[0], families: trials};
}

/** Deterministic source-native plant with a hidden, arbitrary byte-to-rune table. */
function positiveControl(bytes) {
  let seed = 0x53305529;
  function next() {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return seed >>> 0;
  }
  const secret = Array.from({length: SIZE}, () => next() % RUNES);
  const trueOrder = readingOrders(bytes)
    .find(x => x.name === 'column-serpentine' && x.direction === 'reverse');
  assert(trueOrder);
  const gap = 73;
  const encoded = Array.from({length: SIZE - 1},
    (_, i) => secret[trueOrder.values[i + (i >= gap ? 1 : 0)]]);
  const result = search(encoded.slice().reverse(), bytes);
  assert.equal(result.best.errors, 0);
  // For a fixed true reading, the secret lookup exactly reproduces the plant.
  for (let i = 0; i < SIZE - 1; i++) {
    const b = trueOrder.values[i + (i >= gap ? 1 : 0)];
    assert.equal(encoded[i], secret[b]);
  }
  return {secretMapUnknownToSearch: true, plantedGap: gap,
    plantedReading: trueOrder.name, exactRecoveredGlyphs: SIZE - 1,
    bestErrors: result.best.errors};
}

function main() {
  const p53 = corpus.pages.find(p => p.page === 53);
  const p55 = corpus.pages.find(p => p.page === 55);
  assert.equal(p53.indices.length, 179);
  assert.equal(p55.indices.length, 76);
  assert.equal(table.bytes.length, SIZE);
  const glyphs = [...p53.indices, ...p55.indices];
  const original = search(glyphs, table.bytes);
  const plant = positiveControl(table.bytes);
  assert.equal(original.models, 4096);
  assert.equal(original.best.errors, 83);
  assert.equal(original.best.repeatedByteConstraints, 94);
  return {hypothesis: 'one skipped 256-byte grid cell and a single arbitrary fixed byte-to-rune map',
    original, plant,
    interpretation: 'Exact finite contradiction for the named direct encoding, not an LP2 decryption or a general exclusion of keyed stateful transforms.'};
}

if (require.main === module)
  process.stdout.write(JSON.stringify(main(), null, 2) + '\n');

module.exports = {readingOrders, exactOneGap, search, positiveControl, main};
