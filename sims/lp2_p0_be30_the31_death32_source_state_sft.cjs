'use strict';

/**
 * SFT: source-state THE -> DEATH after BE.
 *
 * Frozen state:
 * - BE gate selected next source NG-A-EO at center (10,20), radius4 diagonal.
 * - BE state fixed THE ciphertext D(11,11),P(11,12), read right.
 * - retained MAY source center is OE(14,13).
 * - retained BE source radius is 6.
 *
 * Prospective THE operation gate:
 * 1. Retain current horizontal ciphertext axis.
 * 2. Use retained MAY center OE(14,13) as the right outer and retained BE
 *    radius6. Extend horizontally left: center G(14,7), left TH(14,1).
 *    This source-selects TH-G-OE before THE decryption.
 * 3. Direct THE center component A=24 divided by current source radius4 gives
 *    6=G, exactly the selected next-source center rune. Center-phi uses H=8
 *    and gives 2=TH. Therefore direct THE is selected.
 *
 * DEATH geometry:
 * 4. Shift THE start one step up-left by phi(TH2)=1 -> F(10,10).
 * 5. Read from that start toward selected next-source center G(14,7):
 *    down-left.
 * 6. Length is next-source radius6 / 2 = 3 -> F,NG,R.
 * 7. Direct TH-G-OE aligns to G-OE-TH and decrypts to D,EA,TH.
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
  const phase = mod3(key.reduce((sum, value) => sum + mu(phi(value)), 0));
  return key.slice(phase).concat(key.slice(0, phase));
}

/** @param {{raw:number[]}} node @returns {string[]} */
function nodeRunes(node) {
  return node.raw.map(value => corpus.translit[value]);
}

/** @param {number[]} vector @returns {number[]} */
function signVector(vector) {
  return [Math.sign(vector[0]), Math.sign(vector[1])];
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
function matches(raw) {
  return triples.filter(node =>
    node.raw[0] === raw[0] &&
    node.raw[1] === raw[1] &&
    node.raw[2] === raw[2]
  );
}

// Frozen selected THE source and geometry.
const theNodeCandidates = matches([21, 24, 12]);
assert.equal(theNodeCandidates.length, 1);
const theNode = theNodeCandidates[0];
assert.deepEqual(nodeRunes(theNode), ['NG', 'A', 'EO']);
assert.deepEqual(theNode.center, [10, 20]);
assert.equal(theNode.radius, 4);
assert.deepEqual(theNode.axis, [1, -1]);

const theCells = [[11, 11], [11, 12]];
const theRead = [0, 1];
assert.deepEqual(
  theCells.map(cell => corpus.translit[at(cell)]),
  ['D', 'P']
);

// Retained source-state anchors.
const retainedMayCenter = [14, 13];
assert.equal(corpus.translit[at(retainedMayCenter)], 'OE');
const retainedBeRadius = 6;

// Build next source horizontally left from retained MAY center.
const nextRightOuter = retainedMayCenter;
const nextCenter = [nextRightOuter[0], nextRightOuter[1] - retainedBeRadius];
const nextLeftOuter = [nextCenter[0], nextCenter[1] - retainedBeRadius];

assert.deepEqual(nextCenter, [14, 7]);
assert.deepEqual(nextLeftOuter, [14, 1]);

const nextRaw = [at(nextLeftOuter), at(nextCenter), at(nextRightOuter)];
assert.deepEqual(
  nextRaw.map(value => corpus.translit[value]),
  ['TH', 'G', 'OE']
);

const nextMatches = matches(nextRaw).filter(node =>
  same(node.first, nextLeftOuter) &&
  same(node.center, nextCenter) &&
  same(node.second, nextRightOuter)
);
assert.equal(nextMatches.length, 1);
const deathNode = nextMatches[0];
assert.equal(deathNode.radius, retainedBeRadius);
assert.deepEqual(deathNode.axis, [0, 1]);

// Operation gate for THE: direct center A24 versus center-phi H8.
const directCenterComponent = theNode.raw[1];
const transformedCenterComponent = phi(theNode.raw[1]);
assert.equal(directCenterComponent, 24);
assert.equal(transformedCenterComponent, 8);

assert.equal(directCenterComponent % theNode.radius, 0);
assert.equal(transformedCenterComponent % theNode.radius, 0);

const directCenterPrediction = directCenterComponent / theNode.radius;
const transformedCenterPrediction = transformedCenterComponent / theNode.radius;

assert.equal(directCenterPrediction, at(nextCenter));
assert.equal(directCenterPrediction, 6);
assert.equal(transformedCenterPrediction, 2);
assert.notEqual(transformedCenterPrediction, at(nextCenter));

// Decrypt THE only after next source selection.
const directTheKey = align([...theNode.raw]);
assert.deepEqual(
  directTheKey.map(value => corpus.translit[value]),
  ['NG', 'A', 'EO']
);

const theCiphertext = theCells.map(at);
const thePlaintext = theCiphertext.map((value, index) =>
  mod29(value - directTheKey[index % directTheKey.length])
);
assert.deepEqual(
  thePlaintext.map(value => corpus.translit[value]),
  ['TH', 'E']
);

// Source-select DEATH ciphertext geometry.
const firstOuterPhi = phi(deathNode.raw[0]);
assert.equal(firstOuterPhi, 1);

const deathStart = [
  theCells[0][0] - firstOuterPhi,
  theCells[0][1] - firstOuterPhi,
];
assert.deepEqual(deathStart, [10, 10]);
assert.equal(corpus.translit[at(deathStart)], 'F');

const deathRead = signVector([
  deathNode.center[0] - deathStart[0],
  deathNode.center[1] - deathStart[1],
]);
assert.deepEqual(deathRead, [1, -1]);

assert.equal(deathNode.radius % 2, 0);
const deathLength = deathNode.radius / 2;
assert.equal(deathLength, 3);

const deathCells = Array.from({ length: deathLength }, (_, index) => [
  deathStart[0] + deathRead[0] * index,
  deathStart[1] + deathRead[1] * index,
]);
assert.deepEqual(deathCells, [[10, 10], [11, 9], [12, 8]]);
assert.deepEqual(
  deathCells.map(cell => corpus.translit[at(cell)]),
  ['F', 'NG', 'R']
);

const deathKey = align([...deathNode.raw]);
assert.deepEqual(
  deathKey.map(value => corpus.translit[value]),
  ['G', 'OE', 'TH']
);

const deathCiphertext = deathCells.map(at);
const deathPlaintext = deathCiphertext.map((value, index) =>
  mod29(value - deathKey[index % deathKey.length])
);
assert.deepEqual(
  deathPlaintext.map(value => corpus.translit[value]),
  ['D', 'EA', 'TH']
);

console.log(JSON.stringify({
  status: 'PASS',
  source: 'original LP2 p0-p2 27x27 grid',
  frozenTheState: {
    source: nodeRunes(theNode),
    coordinates: {
      first: theNode.first,
      center: theNode.center,
      second: theNode.second,
      radius: theNode.radius,
    },
    ciphertextCells: theCells,
    readDirection: theRead,
  },
  prospectiveOperationGate: {
    retainedMayCenter,
    retainedBeRadius,
    sourceSelectedNextNode: nodeRunes(deathNode),
    sourceSelectedNextCoordinates: {
      first: deathNode.first,
      center: deathNode.center,
      second: deathNode.second,
      radius: deathNode.radius,
      axis: deathNode.axis,
    },
    directCenterPrediction,
    transformedCenterPrediction,
    actualNextCenterRune: corpus.translit[at(nextCenter)],
    selectedOperation: 'direct',
  },
  thePlaintextAfterSelection: thePlaintext.map(
    value => corpus.translit[value]
  ),
  deathGeometry: {
    start: deathStart,
    readDirection: deathRead,
    length: deathLength,
    cells: deathCells,
    alignedKey: deathKey.map(value => corpus.translit[value]),
  },
  deathPlaintextAfterSelection: deathPlaintext.map(
    value => corpus.translit[value]
  ),
  decision:
    'Retained MAY and BE source state reconstructs TH-G-OE. Its center rune prospectively selects direct NG-A-EO over center-phi, after which THE decrypts. The selected DEATH source then fixes a three-cell down-left ciphertext and decrypts to D,EA,TH.',
}, null, 2));
