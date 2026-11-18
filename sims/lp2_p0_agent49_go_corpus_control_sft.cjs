'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const grid = corpus.pages.filter(page => page.page <= 2).flatMap(page => page.indices);
const T = corpus.translit;

assert.equal(grid.length, 729);

/** @param {[number, number]} cell @returns {number} */
function at(cell) {
  return grid[(cell[0] - 1) * 27 + cell[1] - 1];
}

/** @param {[number, number]} cell @returns {boolean} */
function inBounds(cell) {
  return cell[0] >= 1 && cell[0] <= 27 && cell[1] >= 1 && cell[1] <= 27;
}

/** @param {Array<[number, number]>} cells @returns {string[]} */
function runes(cells) {
  return cells.map(cell => T[at(cell)]);
}

const claimedGoSource = [[18, 21], [21, 21], [24, 21]];
const claimedGoCiphertext = [[17, 19], [18, 18]];

assert.deepEqual(runes(claimedGoSource), ['P', 'I', 'H']);
assert.deepEqual(runes(claimedGoCiphertext), ['C', 'IA']);

assert.notDeepEqual(runes(claimedGoSource), ['G', 'O', 'G']);
assert.notDeepEqual(runes(claimedGoCiphertext), ['EO', 'N']);

const axes = [[1, 0], [0, 1], [1, 1], [1, -1]];
const gogHits = [];

for (let row = 1; row <= 27; row += 1) {
  for (let column = 1; column <= 27; column += 1) {
    for (const axis of axes) {
      for (let radius = 1; radius <= 13; radius += 1) {
        const first = [
          row - axis[0] * radius,
          column - axis[1] * radius,
        ];
        const second = [
          row + axis[0] * radius,
          column + axis[1] * radius,
        ];
        if (!inBounds(first) || !inBounds(second)) break;

        const center = [row, column];
        const raw = [at(first), at(center), at(second)];

        if (raw[0] === 6 && raw[1] === 3 && raw[2] === 6) {
          gogHits.push({ first, center, second, axis, radius });
        }
      }
    }
  }
}

assert.equal(gogHits.length, 0);

// Current public GO placement is internally consistent with the canonical grid.
const publicGoSource = [[3, 16], [7, 20], [11, 24]];
const publicGoCiphertext = [[7, 2], [8, 1]];

assert.deepEqual(runes(publicGoSource), ['Y', 'G', 'Y']);
assert.deepEqual(runes(publicGoCiphertext), ['O', 'F']);

console.log(JSON.stringify({
  status: 'PASS',
  source: 'resources/liber-primus/lp2-corpus.json',
  rejectedCommit: '6f3fb89e414c2e6c62f91e4faf7ccf3080833075',
  rejectedScript: 'sims/lp2_p0_you34_go35_canonical_sft.cjs',
  claimedGoSource: {
    cells: claimedGoSource,
    actualRunes: runes(claimedGoSource),
    claimedRunes: ['G', 'O', 'G'],
  },
  claimedGoCiphertext: {
    cells: claimedGoCiphertext,
    actualRunes: runes(claimedGoCiphertext),
    claimedRunes: ['EO', 'N'],
  },
  globalGOGStraightNodes: gogHits.length,
  publicGoControl: {
    sourceCells: publicGoSource,
    sourceRunes: runes(publicGoSource),
    ciphertextCells: publicGoCiphertext,
    ciphertextRunes: runes(publicGoCiphertext),
  },
  decision:
    'Reject the claimed canonical G-O-G / EO,N GO state. Its coordinates do not carry those runes in the canonical corpus, G-O-G has zero straight-node occurrences, and the current public Y-G-Y / O,F coordinates do match the corpus.',
}, null, 2));
