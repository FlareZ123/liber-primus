'use strict';

/**
 * Negative source-falsification SFT for the attempted canonical YOU -> GO
 * continuation. The earlier positive GO assertions are withdrawn.
 *
 * Input: canonical resources/liber-primus/lp2-corpus.json, physical pages 0-2
 * concatenated in the established 27x27 row-major square.
 *
 * This test does not score language. It checks the original rune values and
 * exhaustively enumerates straight equal-outer triples on all four axes.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const grid = corpus.pages
  .filter(page => page.page <= 2)
  .flatMap(page => page.indices);
assert.equal(grid.length, 729);

const at = ([row, col]) => grid[(row - 1) * 27 + col - 1];
const rune = cell => corpus.translit[at(cell)];
const inBounds = ([row, col]) =>
  row >= 1 && row <= 27 && col >= 1 && col <= 27;
const axes = [[1, 0], [0, 1], [1, 1], [1, -1]];

/** @param {string[]} pattern */
function scan(pattern) {
  const hits = [];
  for (let row = 1; row <= 27; row += 1) {
    for (let col = 1; col <= 27; col += 1) {
      for (const axis of axes) {
        for (let radius = 1; radius <= 13; radius += 1) {
          const first = [row - axis[0] * radius, col - axis[1] * radius];
          const second = [row + axis[0] * radius, col + axis[1] * radius];
          if (!inBounds(first) || !inBounds(second)) break;
          const cells = [first, [row, col], second];
          if (cells.every((cell, i) => rune(cell) === pattern[i])) {
            hits.push({ first, center: [row, col], second, radius, axis });
          }
        }
      }
    }
  }
  return hits;
}

// The preceding three-rune YOU candidate's physical ciphertext remains EA,J,N.
const youCells = [[6, 11], [6, 12], [6, 13]];
assert.deepEqual(youCells.map(rune), ['EA', 'J', 'N']);

// Falsify the alleged canonical GO source and ciphertext at their exact cells.
const allegedGoSource = [[18, 21], [21, 21], [24, 21]];
assert.deepEqual(allegedGoSource.map(rune), ['P', 'I', 'H']);
const allegedGoCiphertext = [[17, 19], [18, 18]];
assert.deepEqual(allegedGoCiphertext.map(rune), ['C', 'IA']);
const goNodes = scan(['G', 'O', 'G']);
assert.equal(goNodes.length, 0);

// The source-generated four-way sign family has one raw-source survivor,
// but no ciphertext placement or consumer is selected by this test.
const signFamily = {
  'G-O-G': scan(['G', 'O', 'G']),
  'G-W-G': scan(['G', 'W', 'G']),
  'TH-O-TH': scan(['TH', 'O', 'TH']),
  'TH-W-TH': scan(['TH', 'W', 'TH']),
};
assert.deepEqual(
  Object.fromEntries(Object.entries(signFamily).map(([key, value]) => [key, value.length])),
  { 'G-O-G': 0, 'G-W-G': 0, 'TH-O-TH': 0, 'TH-W-TH': 1 }
);
const thwth = signFamily['TH-W-TH'][0];
assert.deepEqual(thwth.first, [11, 22]);
assert.deepEqual(thwth.center, [15, 18]);
assert.deepEqual(thwth.second, [19, 14]);
assert.equal(thwth.radius, 4);
assert.deepEqual(thwth.axis, [1, -1]);

// The downstream C-F-C proposal is not a radius-3 continuation.
const cfcNodes = scan(['C', 'F', 'C']);
assert.equal(cfcNodes.length, 3);
assert.deepEqual(
  cfcNodes.map(node => node.radius).sort((a, b) => a - b),
  [1, 2, 7]
);
assert.equal(cfcNodes.some(node => node.radius === 3), false);
assert.deepEqual(
  [[4, 7], [4, 10], [4, 13]].map(rune),
  ['TH', 'Y', 'C']
);

console.log(JSON.stringify({
  status: 'PASS',
  decision: 'reject attempted canonical GO and dependent C-F-C continuation',
  canonicalGrid: '27x27 row-major p0-p2',
  youCiphertext: youCells.map(rune),
  allegedGoSource: allegedGoSource.map(rune),
  allegedGoCiphertext: allegedGoCiphertext.map(rune),
  goNodeCount: goNodes.length,
  signFamilyCounts: Object.fromEntries(
    Object.entries(signFamily).map(([key, value]) => [key, value.length])
  ),
  soleTHWTH: thwth,
  cfcCount: cfcNodes.length,
  cfcRadii: cfcNodes.map(node => node.radius).sort((a, b) => a - b),
  oldCfcCells: [[4, 7], [4, 10], [4, 13]].map(rune),
}, null, 2));
