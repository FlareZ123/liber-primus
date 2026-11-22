'use strict';

/**
 * SFT: source-state BE plus prospective THE gate.
 *
 * Frozen predecessor:
 * - MAY source T-OE-AE radius3
 * - source-selected next BE node P-S-C radius6 diagonal down-left
 *
 * BE geometry:
 * 1. From lower BE source outer C(26,3), move horizontally by phi(S15)=8
 *    toward the source center side -> endpoint R(26,11).
 * 2. Step one cell opposite the BE read axis [1,-1] -> start U(25,12).
 * 3. Read along source axis [1,-1].
 * 4. Length phi(MAY radius3)=2 -> U,R.
 *
 * BE operation gate:
 * - direct P-S-C predicts NG-A-EO;
 * - center-phi P-H-C predicts B-A-EO.
 * Both predicted triples exist once, so existence alone does not decide.
 * - The BE source independently predicts the next ciphertext start:
 *     lower C(26,3) + [-S15, +phi(S15)=8] = D(11,11).
 * - Both next-source candidates share raw center A=24. From next start, use
 *   current BE-start rune U=1 to predict source center
 *     [row-U, col+phi(A)+U] = (10,20).
 *   Only direct BE's NG-A-EO occurs at that center. Center-phi's B-A-EO occurs
 *   at (10,16).
 * This selects direct BE before BE plaintext inspection.
 *
 * The selected next source is diagonal; read perpendicular horizontally toward
 * its center, with length phi(BE radius6)=2 -> D(11,11),P(11,12).
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const grid = corpus.pages.filter(page => page.page <= 2).flatMap(page => page.indices);
assert.equal(grid.length, 729);

const at = cell => grid[(cell[0] - 1) * 27 + cell[1] - 1];
const same = (a, b) => a[0] === b[0] && a[1] === b[1];
const inBounds = cell =>
  cell[0] >= 1 && cell[0] <= 27 && cell[1] >= 1 && cell[1] <= 27;
const mod29 = value => ((value % 29) + 29) % 29;
const mod3 = value => ((value % 3) + 3) % 3;

/** @param {number} n @returns {number} */
function phi(n) {
  let result = n;
  let x = n;
  for (let p = 2; p * p <= x; p += 1) {
    if (x % p !== 0) continue;
    result -= result / p;
    while (x % p === 0) x /= p;
  }
  if (x > 1) result -= result / x;
  return result;
}

/** @param {number} n @returns {number} */
function mu(n) {
  let sign = 1;
  let x = n;
  for (let p = 2; p * p <= x; p += 1) {
    if (x % p !== 0) continue;
    x /= p;
    sign = -sign;
    if (x % p === 0) return 0;
    while (x % p === 0) x /= p;
  }
  return x > 1 ? -sign : sign;
}

/** @param {number[]} key @returns {number[]} */
function align(key) {
  const p = mod3(key.reduce((sum, value) => sum + mu(phi(value)), 0));
  return key.slice(p).concat(key.slice(0, p));
}

/** @param {{raw:number[]}} node @returns {string[]} */
function nodeRunes(node) {
  return node.raw.map(value => corpus.translit[value]);
}

const axes = [[1, 0], [0, 1], [1, 1], [1, -1]];
const triples = [];
for (let row = 1; row <= 27; row += 1) {
  for (let col = 1; col <= 27; col += 1) {
    for (const axis of axes) {
      for (let radius = 1; radius <= 13; radius += 1) {
        const first = [row - axis[0] * radius, col - axis[1] * radius];
        const second = [row + axis[0] * radius, col + axis[1] * radius];
        if (!inBounds(first) || !inBounds(second)) break;
        triples.push({
          first,
          center: [row, col],
          second,
          radius,
          axis,
          raw: [at(first), at([row, col]), at(second)],
        });
      }
    }
  }
}

/** @param {number[]} raw @returns {object[]} */
function straightMatches(raw) {
  return triples.filter(node =>
    node.raw[0] === raw[0] &&
    node.raw[1] === raw[1] &&
    node.raw[2] === raw[2]
  );
}

// Frozen MAY and selected BE sources.
const mayNode = triples.find(node =>
  nodeRunes(node).join('-') === 'T-OE-AE' &&
  same(node.center, [14, 13]) &&
  node.radius === 3
);
assert.ok(mayNode);

const beNode = triples.find(node =>
  nodeRunes(node).join('-') === 'P-S-C' &&
  same(node.center, [20, 9]) &&
  node.radius === 6
);
assert.ok(beNode);
assert.deepEqual(beNode.first, [14, 15]);
assert.deepEqual(beNode.second, [26, 3]);
assert.deepEqual(beNode.axis, [1, -1]);

// BE endpoint from lower outer and phi(raw center).
const lowerOuter = beNode.second;
const centerPhi = phi(beNode.raw[1]);
assert.equal(centerPhi, 8);

const beEndpoint = [lowerOuter[0], lowerOuter[1] + centerPhi];
assert.deepEqual(beEndpoint, [26, 11]);
assert.equal(corpus.translit[at(beEndpoint)], 'R');

// Start one step opposite read axis.
const beStart = [
  beEndpoint[0] - beNode.axis[0],
  beEndpoint[1] - beNode.axis[1],
];
assert.deepEqual(beStart, [25, 12]);
assert.equal(corpus.translit[at(beStart)], 'U');

const beLength = phi(mayNode.radius);
assert.equal(beLength, 2);
const beCells = Array.from({ length: beLength }, (_, index) => [
  beStart[0] + beNode.axis[0] * index,
  beStart[1] + beNode.axis[1] * index,
]);
assert.deepEqual(beCells, [[25, 12], [26, 11]]);
assert.deepEqual(
  beCells.map(cell => corpus.translit[at(cell)]),
  ['U', 'R']
);

// Bounded operation candidates.
const directRaw = [...beNode.raw];
const centerPhiRaw = [beNode.raw[0], phi(beNode.raw[1]), beNode.raw[2]];
const directAligned = align(directRaw);
const centerPhiAligned = align(centerPhiRaw);

assert.deepEqual(
  directAligned.map(value => corpus.translit[value]),
  ['P', 'S', 'C']
);
assert.deepEqual(
  centerPhiAligned.map(value => corpus.translit[value]),
  ['P', 'H', 'C']
);

// Next raw family from each operation.
const cipherSum = mod29(at(beCells[0]) + at(beCells[1]));
const nextCenter = mod29(-cipherSum);
const nextThird = phi(beNode.raw[0]);
assert.equal(nextCenter, 24);
assert.equal(corpus.translit[nextCenter], 'A');
assert.equal(nextThird, 12);
assert.equal(corpus.translit[nextThird], 'EO');

/** @param {number} centerComponent @returns {number[]} */
function nextRaw(centerComponent) {
  return [
    mod29(beNode.raw[0] + phi(centerComponent)),
    nextCenter,
    nextThird,
  ];
}

const directNextRaw = nextRaw(beNode.raw[1]);
const centerPhiNextRaw = nextRaw(phi(beNode.raw[1]));

assert.deepEqual(
  directNextRaw.map(value => corpus.translit[value]),
  ['NG', 'A', 'EO']
);
assert.deepEqual(
  centerPhiNextRaw.map(value => corpus.translit[value]),
  ['B', 'A', 'EO']
);

const directMatches = straightMatches(directNextRaw);
const transformedMatches = straightMatches(centerPhiNextRaw);
assert.equal(directMatches.length, 1);
assert.equal(transformedMatches.length, 1);

// Independently predict next ciphertext start from BE source geometry.
const nextCipherStart = [
  lowerOuter[0] - beNode.raw[1],
  lowerOuter[1] + phi(beNode.raw[1]),
];
assert.deepEqual(nextCipherStart, [11, 11]);
assert.equal(corpus.translit[at(nextCipherStart)], 'D');

// Predict next-source center from frozen start and shared raw center A.
const beStartValue = at(beStart);
assert.equal(beStartValue, 1);
const predictedNextCenter = [
  nextCipherStart[0] - beStartValue,
  nextCipherStart[1] + phi(nextCenter) + beStartValue,
];
assert.deepEqual(predictedNextCenter, [10, 20]);

const directAtPredictedCenter = directMatches.filter(node =>
  same(node.center, predictedNextCenter)
);
const transformedAtPredictedCenter = transformedMatches.filter(node =>
  same(node.center, predictedNextCenter)
);
assert.equal(directAtPredictedCenter.length, 1);
assert.equal(transformedAtPredictedCenter.length, 0);

const nextNode = directAtPredictedCenter[0];
assert.deepEqual(nodeRunes(nextNode), ['NG', 'A', 'EO']);
assert.deepEqual(nextNode.first, [6, 24]);
assert.deepEqual(nextNode.center, [10, 20]);
assert.deepEqual(nextNode.second, [14, 16]);
assert.equal(nextNode.radius, 4);
assert.deepEqual(nextNode.axis, [1, -1]);

// Only after operation/source selection, decrypt BE.
const beCiphertext = beCells.map(at);
const bePlaintext = beCiphertext.map((value, index) =>
  mod29(value - directAligned[index % directAligned.length])
);
assert.deepEqual(
  bePlaintext.map(value => corpus.translit[value]),
  ['B', 'E']
);

// Freeze next THE geometry from selected source.
const nextRead = [0, 1];
const nextLength = phi(beNode.radius);
assert.equal(nextLength, 2);

const nextCells = Array.from({ length: nextLength }, (_, index) => [
  nextCipherStart[0],
  nextCipherStart[1] + index,
]);
assert.deepEqual(nextCells, [[11, 11], [11, 12]]);
assert.deepEqual(
  nextCells.map(cell => corpus.translit[at(cell)]),
  ['D', 'P']
);

console.log(JSON.stringify({
  status: 'PASS',
  source: 'original LP2 p0-p2 27x27 grid',
  beGeometry: {
    node: nodeRunes(beNode),
    lowerOuter,
    centerPhi,
    start: beStart,
    endpoint: beEndpoint,
    readDirection: beNode.axis,
    length: beLength,
    ciphertextCells: beCells,
  },
  operationGate: {
    directPrediction: directNextRaw.map(value => corpus.translit[value]),
    directMatch: {
      center: directMatches[0].center,
      radius: directMatches[0].radius,
      axis: directMatches[0].axis,
    },
    centerPhiPrediction: centerPhiNextRaw.map(value => corpus.translit[value]),
    centerPhiMatch: {
      center: transformedMatches[0].center,
      radius: transformedMatches[0].radius,
      axis: transformedMatches[0].axis,
    },
    predictedNextCipherStart: nextCipherStart,
    predictedNextSourceCenter: predictedNextCenter,
    selectedOperation: 'direct',
    selectedNextSource: nodeRunes(nextNode),
    selectedNextSourceCoordinates: {
      first: nextNode.first,
      center: nextNode.center,
      second: nextNode.second,
      radius: nextNode.radius,
      axis: nextNode.axis,
    },
  },
  decryptedOnlyAfterSelection: bePlaintext.map(
    value => corpus.translit[value]
  ),
  frozenNextGeometry: {
    start: nextCipherStart,
    readDirection: nextRead,
    length: nextLength,
    ciphertextCells: nextCells,
  },
  decision:
    'The MAY-selected P-S-C source fixes BE geometry. A prospective next-source center prediction distinguishes direct BE from center-phi and selects the unique NG-A-EO node at (10,20). Direct P-S-C then decrypts U,R to B,E, while the same source state fixes the following D,P ciphertext geometry.',
}, null, 2));
