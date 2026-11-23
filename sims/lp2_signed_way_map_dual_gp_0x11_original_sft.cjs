'use strict';
/**
 * Check an independent, source-typed candidate in the signed 2016
 * WAY / MAP follower pair:
 *   GP0 indices WAY=57, MAP=56: horizontal neighbors in 8 columns.
 *   GP-prime sums WAY=219, MAP=211: vertical neighbors in 8 columns.
 *   Grid tokens 219='0x' and 211='11' form hex 0x11 =17.
 * The exact physical p55 page has 17 printed page-local fragments.
 *
 * No key or value-changing GP29 receiver is asserted or recovered.
 * SFT: node sims/lp2_signed_way_map_dual_gp_0x11_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} p @returns {any} */
function loadJSON(p) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', p), 'utf8'));
}
const corpus = loadJSON('resources/liber-primus/lp2-corpus.json');
const grid = loadJSON('resources/liber-primus/base60-grid.json');
const transcript = fs.readFileSync(path.join(__dirname, '..',
  'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const tokens = grid.rows.flat();
assert.equal(tokens.length, 256);

/** @param {number[]} ix @returns {{index: number, prime: number}} */
function values(ix) {
  return {
    index: ix.reduce((s, i) => s + i, 0),
    prime: ix.reduce((s, i) => s + corpus.prime[i], 0)
  };
}
/** @param {number} index @returns {{row: number, column: number}} */
function cell(index) {
  return { row: Math.floor(index / 8), column: index % 8 };
}
/** @param {string} text @returns {string} */
function onlyRunes(text) {
  return Array.from(text).filter(c => /\p{Script=Runic}/u.test(c)).join('');
}
const wordIndices = {
  WAY: [7, 24, 26],
  MAP: [19, 24, 13],
};
for (const [name, indices] of Object.entries(wordIndices)) {
  assert.equal(indices.map(i => corpus.translit[i]).join(''), name);
}
const way = values(wordIndices.WAY);
const map = values(wordIndices.MAP);
assert.deepEqual(way, {index: 57, prime: 219});
assert.deepEqual(map, {index: 56, prime: 211});
assert.deepEqual(cell(way.index), {row: 7, column: 1});
assert.deepEqual(cell(map.index), {row: 7, column: 0});
assert.deepEqual(cell(way.prime), {row: 27, column: 3});
assert.deepEqual(cell(map.prime), {row: 26, column: 3});
assert.equal(tokens[way.index], '1w');
assert.equal(tokens[map.index], '4E');
assert.equal(tokens[way.prime], '0x');
assert.equal(tokens[map.prime], '11');
assert.equal(Number.parseInt(tokens[map.prime], 16), 17);

const targetRunes = corpus.pages[55].indices.map(i => corpus.runes[i]).join('');
const physicalPages = transcript.split(/\n%\n/);
const matchingPages = physicalPages.filter(p => onlyRunes(p) === targetRunes);
assert.equal(matchingPages.length, 1);
const fragments = matchingPages[0].replace(/[\s/&$]/g, '').split(/[-.]/)
  .filter(Boolean);
const lengths = fragments.map(x => Array.from(x).length);
assert.deepEqual(lengths, [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);
assert.equal(lengths.reduce((s, x) => s + x, 0), 76);

const result = {
  source: 'Authentic 2016 signed THE-follower pair WAY, MAP; original LP2 p50 and p55',
  GP0: {WAY: way.index, MAP: map.index,
    cells: [cell(way.index), cell(map.index)],
    tokens: [tokens[way.index], tokens[map.index]]},
  GPprime: {WAY: way.prime, MAP: map.prime,
    cells: [cell(way.prime), cell(map.prime)],
    tokens: [tokens[way.prime], tokens[map.prime]]},
  candidateTypedReadout: tokens[way.prime] + tokens[map.prime],
  candidateHexDecimal: 17,
  originalP55PageLocalPrintedFragments: fragments.length,
  originalP55Runes: targetRunes.length,
  originalP55FragmentLengths: lengths,
  missing: 'No source-selected north/hex composition, p55 recipient or cipher update is established',
  unknownPlaintextRecovered: false
};
console.log(JSON.stringify(result, null, 2));
