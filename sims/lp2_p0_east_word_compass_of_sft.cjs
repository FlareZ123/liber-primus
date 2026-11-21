'use strict';

/**
 * SFT: conditionally use the already decoded 27x27 word EAST as a compass
 * instruction to choose the following OF block, without selecting that
 * block's cells by plaintext. Original source and arithmetic only.
 *
 * Windows Node.js 22:
 * node sims/lp2_p0_east_word_compass_of_sft.cjs
 *
 * Caveat: the preceding EAST reading and the compass interpretation are
 * hypotheses, and this test does not authenticate them.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = JSON.parse(fs.readFileSync(path.resolve(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'
), 'utf8'));
const pages = source.pages.filter(page => page.page <= 2);
assert.deepEqual(pages.map(page => page.indices.length), [262, 266, 201]);
const tape = pages.flatMap(page => page.indices);
assert.equal(tape.length, 729);

const mod = number => ((number % 29) + 29) % 29;
const inBounds = ([row, column]) =>
  row >= 1 && row <= 27 && column >= 1 && column <= 27;
const at = ([row, column]) => {
  assert.ok(inBounds([row, column]));
  return tape[(row - 1) * 27 + column - 1];
};
const word = values => values.map(value => source.translit[value]).join('');
const same = (left, right) => left[0] === right[0] && left[1] === right[1];

/** @param {number} n @returns {number} */
function phi(n) {
  let result = n;
  let remainder = n;
  for (let divisor = 2; divisor * divisor <= remainder; divisor += 1) {
    if (remainder % divisor !== 0) continue;
    result -= result / divisor;
    do { remainder /= divisor; } while (remainder % divisor === 0);
  }
  if (remainder > 1) result -= result / remainder;
  return result;
}

/** @param {number} n @returns {number} */
function mu(n) {
  let result = 1;
  let remainder = n;
  for (let divisor = 2; divisor * divisor <= remainder; divisor += 1) {
    if (remainder % divisor !== 0) continue;
    remainder /= divisor;
    result = -result;
    if (remainder % divisor === 0) return 0;
    while (remainder % divisor === 0) remainder /= divisor;
  }
  return remainder > 1 ? -result : result;
}

const axes = [[1, 0], [0, 1], [1, 1], [1, -1]];
const mirrorNodes = [];
for (let row = 1; row <= 27; row += 1) {
  for (let column = 1; column <= 27; column += 1) {
    for (const [dr, dc] of axes) {
      for (let radius = 1; radius <= 13; radius += 1) {
        const first = [row - radius * dr, column - radius * dc];
        const second = [row + radius * dr, column + radius * dc];
        if (!inBounds(first) || !inBounds(second)) break;
        const values = [at(first), at([row, column]), at(second)];
        if (values[0] === values[2] && values[1] !== 0) {
          mirrorNodes.push({
            first, center: [row, column], second,
            radius, axis: [dr, dc], values
          });
        }
      }
    }
  }
}
assert.equal(mirrorNodes.length, 479);

// Import and recheck the frozen upstream EAST state on original rune cells.
const eastNode = [[6, 10], [13, 17], [20, 24]];
const eastRawKey = eastNode.map(at);
assert.deepEqual(eastRawKey, [18, 3, 23]); // E-O-D
const eastPhase = mod(eastRawKey.reduce((sum, v) => sum + mu(phi(v)), 0)) % 3;
assert.equal(eastPhase, 1);
const eastKey = eastRawKey.slice(eastPhase).concat(eastRawKey.slice(0, eastPhase));
const eastCells = [[14, 24], [15, 23], [16, 22]];
const eastCipher = eastCells.map(at);
const eastPlain = eastCipher.map((v, i) => mod(v - eastKey[i]));
assert.equal(word(eastPlain), 'EAST');
assert.deepEqual(eastPlain.map((v, i) => mod(v + eastKey[i])), eastCipher);

// Import the already source-selected following unit mirror near (20,25).
// Its central totient produces the previous work's H-H-H fixed key.
const unitMirrorsAt = cell => mirrorNodes.filter(node =>
  node.radius === 1 &&
  (same(node.first, cell) || same(node.second, cell))
);
const westAdjacent = unitMirrorsAt([20, 23]);
const eastAdjacent = unitMirrorsAt([20, 25]);
assert.equal(westAdjacent.length, 0);
assert.equal(eastAdjacent.length, 1);
const nextNode = eastAdjacent[0];
assert.deepEqual([nextNode.first, nextNode.center, nextNode.second],
  [[18, 27], [19, 26], [20, 25]]);
assert.deepEqual(nextNode.values, [8, 16, 8]); // H-T-H
const nextRawKey = [nextNode.values[0], phi(nextNode.values[1]), nextNode.values[2]];
assert.deepEqual(nextRawKey, [8, 8, 8]);
const nextPhase = mod(nextRawKey.reduce((sum, v) => sum + mu(phi(v)), 0)) % 3;
const nextKey = nextRawKey.slice(nextPhase).concat(nextRawKey.slice(0, nextPhase));
assert.deepEqual(nextKey, [8, 8, 8]);

// Freeze both source-visible operands before choosing a compass direction:
// first outer of E-O-D (a literal E) and phi(center rune O=3)=2 cells.
// Interpret the already decoded EAST as a direction. A northward alternative
// was the unresolved competing start in the earlier source-only gate.
const outer = eastNode[0];
const step = phi(eastRawKey[1]);
assert.equal(step, 2);
const compass = {
  north: [-1, 0], east: [0, 1], south: [1, 0], west: [0, -1]
};
const stopNodes = mirrorNodes.filter(node =>
  node.radius === 7 && same(node.axis, [1, 1])
);
assert.equal(stopNodes.length, 4);

/**
 * @param {string} direction
 * @returns {{direction:string,start:number[],cells:number[][],plain:string,
 *   foundStop:boolean,stopCenters:number[][],reencryption:boolean}}
 */
function follow(direction) {
  const [dr, dc] = compass[direction];
  const start = [outer[0] + step * dr, outer[1] + step * dc];
  const cells = [];
  let foundStop = false;
  let stopCenters = [];
  for (let row = start[0], column = start[1];
    inBounds([row, column]); row += 1, column += 1) {
    const cell = [row, column];
    cells.push(cell);
    const matches = stopNodes.filter(node =>
      same(node.first, cell) || same(node.second, cell)
    );
    if (cells.length > 1 && matches.length) {
      foundStop = true;
      stopCenters = matches.map(node => node.center);
      break;
    }
  }
  const cipher = cells.map(at);
  const decoded = cipher.map((value, i) => mod(value - nextKey[i % 3]));
  const reencryption = cipher.every((value, i) =>
    mod(decoded[i] + nextKey[i % 3]) === value
  );
  assert.equal(reencryption, true);
  return {
    direction, start, cells, plain: word(decoded),
    foundStop, stopCenters, reencryption
  };
}

const controls = Object.keys(compass).map(follow);
const byName = Object.fromEntries(controls.map(row => [row.direction, row]));
assert.deepEqual(byName.north.start, [4, 10]);
assert.deepEqual(byName.east.start, [6, 12]);
assert.equal(byName.north.plain, 'EDOF');
assert.equal(byName.east.plain, 'OF');
assert.deepEqual(byName.east.cells, [[6, 12], [7, 13]]);
assert.equal(byName.east.foundStop, true);
assert.deepEqual(byName.east.stopCenters, [[14, 20]]);
assert.equal(byName.south.foundStop, false);
assert.equal(byName.west.foundStop, false);
assert.equal(controls.filter(row => row.plain === 'OF').length, 1);

console.log(JSON.stringify({
  status: 'PASS',
  original: 'LP2 p0-p2 729 original GP29 runes',
  previousConditionalPlaintext: word(eastPlain),
  EAST: {
    keyNode: eastNode, source: eastRawKey,
    ciphertextCells: eastCells, ciphertext: eastCipher,
    key: eastKey, plaintext: eastPlain
  },
  followingMirror: {
    cells: [nextNode.first, nextNode.center, nextNode.second],
    source: nextNode.values, key: nextKey, radius: nextNode.radius
  },
  compass: {
    origin: outer, step, meaning: 'EAST selects rightward',
    stop: 'first later [1,1]-axis radius7 mirror outer'
  },
  originalDirectionControls: controls,
  classification: 'Conditional self-directed continuation; selection grammar ' +
    'and previous EAST reading are post-discovery, not creator-authenticated'
}, null, 2));
