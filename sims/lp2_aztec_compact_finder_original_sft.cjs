'use strict';

/**
 * Aztec Code 2008 compact finder / Aztec Rune 11x11 source-exact gate.
 * Execute: node sims/lp2_aztec_compact_finder_original_sft.cjs
 *
 * The direct model assigns one fixed binary module value to each of the
 * 29 GP rune identities. It allows every possible secret 29-to-2 mapping,
 * both module polarities, and all square rotations/reflections.
 *
 * No language model or candidate key is fitted.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));

/** @param {number} size @returns {Array<{index:number, bit:number}>} */
function finder(size) {
  const center = (size - 1) / 2;
  const cells = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const radius = Math.max(Math.abs(x - center), Math.abs(y - center));
      if (radius <= 4) {
        cells.push({index: y * size + x, bit: radius % 2 === 0 ? 1 : 0});
      }
    }
  }
  assert.equal(cells.length, 81);
  return cells;
}

/**
 * Exact minimum number of finder modules to change to satisfy an unknown,
 * completely arbitrary, stationary binary assignment of every GP rune.
 * Independent per-rune majority assignments achieve the lower bound.
 *
 * @param {number[]} symbols
 * @param {number} size
 * @returns {{minimumChanges:number, conflictingSymbols:number, usedSymbols:number, counts:number[][]}}
 */
function measure(symbols, size) {
  assert.equal(symbols.length, size * size);
  const counts = Array.from({length: 29}, () => [0, 0]);
  for (const {index, bit} of finder(size)) {
    assert.ok(Number.isInteger(symbols[index]));
    assert.ok(symbols[index] >= 0 && symbols[index] < 29);
    counts[symbols[index]][bit]++;
  }
  return {
    minimumChanges: counts.reduce((s, [light, dark]) => s + Math.min(light, dark), 0),
    conflictingSymbols: counts.filter(([light, dark]) => light > 0 && dark > 0).length,
    usedSymbols: counts.filter(([light, dark]) => light + dark > 0).length,
    counts
  };
}

/**
 * A genuine finder whose independent binary module values are encoded as
 * two GP rune identities must yield zero error under the same unknown-key
 * inference. Only the 81 fixed finder cells are planted.
 *
 * @param {number[]} symbols
 * @param {number} size
 * @returns {number[]}
 */
function plant(symbols, size) {
  const generated = symbols.slice();
  for (const {index, bit} of finder(size)) generated[index] = bit ? 3 : 19;
  return generated;
}

const opening = corpus.pages.filter(p => p.page >= 0 && p.page <= 2)
  .flatMap(p => p.indices);
const tree = corpus.pages.find(p => p.page === 32).indices;

assert.equal(opening.length, 729);
assert.equal(tree.length, 121);
assert.equal(corpus.runes.length, 29);

const inputs = [
  {name: 'LP2 original pp0-2, 27x27 compact Aztec', symbols: opening, size: 27,
    expected: {minimumChanges: 24, conflictingSymbols: 20, usedSymbols: 27}},
  {name: 'LP2 original p32, 11x11 Aztec Rune', symbols: tree, size: 11,
    expected: {minimumChanges: 19, conflictingSymbols: 16, usedSymbols: 28}}
];

for (const {name, symbols, size, expected} of inputs) {
  const original = measure(symbols, size);
  for (const key of Object.keys(expected)) assert.equal(original[key], expected[key], name + ' ' + key);
  const positive = measure(plant(symbols, size), size);
  assert.equal(positive.minimumChanges, 0, name + ' planted finder');
  assert.equal(positive.conflictingSymbols, 0, name + ' planted finder');
  console.log(JSON.stringify({name, side: size, templateCells: 81,
    minimumNecessaryModuleChanges: original.minimumChanges,
    conflictingRuneIdentities: original.conflictingSymbols,
    runeIdentitiesInFinder: original.usedSymbols,
    plantedPositiveMinimumChanges: positive.minimumChanges}));
}

console.log('PASS: direct stationary rune-to-binary compact Aztec / Rune finder incompatible with both original layouts');
