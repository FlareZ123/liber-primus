'use strict';
/**
 * Exact fixed-value lookup gate for the source-visible 256-rune terminal frame.
 * Tests arbitrary byte->GP and GP->byte functions, not just modulo arithmetic.
 * Node.js 22, CommonJS, no dependencies beyond the repository.
 */
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');
const SIZE = 256;
const RUNES = 29;

function readingOrders(source) {
  assert.equal(source.length, SIZE);
  const specs = [
    ['row-major', i => i],
    ['column-major', i => (i % 32) * 8 + Math.floor(i / 32)],
    ['row-serpentine', i => Math.floor(i / 8) * 8 +
      (Math.floor(i / 8) % 2 ? 7 - i % 8 : i % 8)],
    ['column-serpentine', i =>
      (Math.floor(i / 32) % 2 ? 31 - i % 32 : i % 32) * 8 +
      Math.floor(i / 32)]
  ];
  return specs.flatMap(([name, index]) => {
    const values = Array.from({length: SIZE}, (_, i) => source[index(i)]);
    return [
      {name, direction: 'forward', values},
      {name, direction: 'reverse', values: values.slice().reverse()}
    ];
  });
}

/** Exact minimum edits for any deterministic map inputs[i] -> outputs[i]. */
function exactLookup(inputs, outputs) {
  assert.equal(inputs.length, outputs.length);
  const counts = new Map();
  for (let i = 0; i < inputs.length; i++) {
    if (!counts.has(inputs[i])) counts.set(inputs[i], new Map());
    const row = counts.get(inputs[i]);
    row.set(outputs[i], (row.get(outputs[i]) || 0) + 1);
  }
  let agreements = 0;
  let conflictingInputClasses = 0;
  for (const row of counts.values()) {
    const frequencies = [...row.values()];
    agreements += Math.max(...frequencies);
    if (row.size > 1) conflictingInputClasses++;
  }
  return {
    errors: outputs.length - agreements,
    distinctInputs: counts.size,
    repeatedInputConstraints: inputs.length - counts.size,
    conflictingInputClasses
  };
}

function search(glyphs, bytes) {
  assert.equal(glyphs.length, SIZE);
  assert.equal(bytes.length, SIZE);
  assert(glyphs.every(x => Number.isInteger(x) && x >= 0 && x < RUNES));
  assert(bytes.every(x => Number.isInteger(x) && x >= 0 && x < SIZE));
  const trials = [];
  for (const order of readingOrders(bytes)) {
    for (const glyphDirection of ['forward', 'reverse']) {
      const orderedGlyphs = glyphDirection === 'forward' ?
        glyphs : glyphs.slice().reverse();
      trials.push({
        map: 'byte_to_rune', order: order.name,
        byteDirection: order.direction, glyphDirection,
        ...exactLookup(order.values, orderedGlyphs)
      });
      trials.push({
        map: 'rune_to_byte', order: order.name,
        byteDirection: order.direction, glyphDirection,
        ...exactLookup(orderedGlyphs, order.values)
      });
    }
  }
  const bestByMap = {};
  const byOrder = {};
  for (const map of ['byte_to_rune', 'rune_to_byte']) {
    const family = trials.filter(x => x.map === map);
    bestByMap[map] = family.slice().sort((a, b) => a.errors - b.errors)[0];
    byOrder[map] = ['row-major', 'column-major',
      'row-serpentine', 'column-serpentine'].map(order => {
      const best = family.filter(x => x.order === order)
        .sort((a, b) => a.errors - b.errors)[0];
      return {order, errors: best.errors, byteDirection: best.byteDirection,
        glyphDirection: best.glyphDirection,
        distinctInputs: best.distinctInputs,
        repeatedInputConstraints: best.repeatedInputConstraints,
        conflictingInputClasses: best.conflictingInputClasses};
    });
  }
  return {modelCount: trials.length, bestByMap, byOrder};
}

function xorshift(seed) {
  return () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return seed >>> 0;
  };
}

function positiveControls(glyphs, bytes) {
  const nextByteMap = xorshift(0x256A29);
  const byteToRune = Array.from({length: SIZE}, () => nextByteMap() % RUNES);
  const plantedGlyphs = bytes.map(byte => byteToRune[byte]);
  const byteToRuneErrors = exactLookup(bytes, plantedGlyphs).errors;

  const nextRuneMap = xorshift(0x29A256);
  const runeToByte = Array.from({length: RUNES}, () => nextRuneMap() % SIZE);
  const plantedBytes = glyphs.map(rune => runeToByte[rune]);
  const runeToByteErrors = exactLookup(glyphs, plantedBytes).errors;
  assert.equal(byteToRuneErrors, 0);
  assert.equal(runeToByteErrors, 0);
  return {byteToRuneErrors, runeToByteErrors,
    note: 'Both arbitrary fixed-map directions recover a planted source-length sequence exactly.'};
}

function main() {
  const page = number => corpus.pages.find(p => p.page === number).indices;
  const p53 = page(53), p54 = page(54), p55 = page(55);
  assert.equal(p53.length, 179);
  assert.equal(p54.length, 232);
  assert.equal(p54[0], 24); // original oversized red A at p54 offset 0
  assert.equal(p55.length, 76);
  assert.equal(grid.bytes.length, SIZE);
  const glyphs = [...p53, p54[0], ...p55];
  assert.equal(glyphs.length, SIZE);
  const result = search(glyphs, grid.bytes);
  assert.equal(result.modelCount, 32);
  assert.equal(result.bestByMap.byte_to_rune.errors, 90);
  assert.equal(result.bestByMap.rune_to_byte.errors, 222);
  const controls = positiveControls(glyphs, grid.bytes);
  return {
    hypothesis: 'one fixed value-based lookup between all 256 p50 grid bytes and the source-ordered p53 + p54-A + p55 256-rune frame',
    sourceFrame: {p53Runes: p53.length, p54A: p54[0], p55Runes: p55.length,
      compositeRunes: glyphs.length, gridBytes: grid.bytes.length,
      distinctGridBytes: new Set(grid.bytes).size,
      distinctRunes: new Set(glyphs).size},
    result,
    positiveControls: controls,
    interpretation: 'No exact fixed value-based lookup exists in either direction under the 32 natural order/direction models. This does not exclude a position-dependent, stateful or nonlinear operation.'
  };
}

if (require.main === module)
  process.stdout.write(JSON.stringify(main(), null, 2) + '\n');

module.exports = {readingOrders, exactLookup, search, positiveControls, main};
