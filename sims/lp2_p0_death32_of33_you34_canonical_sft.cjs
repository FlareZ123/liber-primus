'use strict';

/**
 * SFT: canonical source-state OF -> YOU correction after later DEATH.
 *
 * This test uses only the repository's canonical p0-p2 27x27 corpus.
 * It explicitly rejects the external YOU placement (2,10)..(4,10), whose
 * claimed runes do not match the canonical grid.
 *
 * Frozen DEATH state:
 * - source TH-G-OE radius6 horizontal
 * - ciphertext F(10,10),NG(11,9),R(12,8)
 *
 * OF source:
 * - center = r + phi(r) = 6+2 = H8
 * - right outer = DEATH endpoint R4 + phi(TH2)=1 = C5
 * - left outer = R4 - H8 mod29 = AE25
 * - require radius = endpoint R index4
 * This selects AE-H-C at row9, center(9,17), radius4.
 *
 * OF geometry:
 * - endpoint is OF source center shifted down by DEATH length3 -> AE(12,17)
 * - start is one cell right using phi(TH2)=1 -> H(12,18)
 * - read left, length phi(radius4)=2
 *
 * OF operation:
 * - direct predicts next symmetric source H-H-H with radius C=5: no matches.
 * - center-phi predicts H-R-H with radius5: exactly one match at row21.
 * Thus center-phi is selected before OF decryption.
 *
 * Canonical YOU geometry:
 * - scalar s = OF raw center H8 - phi(radius4)=2 = 6.
 * - shift OF endpoint AE(12,17) up-left by s -> EA(6,11).
 * - read along H-R-H horizontal axis, reversing prior OF leftward sign -> right.
 * - length = next radius5 - phi(OF radius4)=2 = 3.
 * This fixes EA(6,11),J(6,12),N(6,13).
 * Under aligned TH-H-H these decrypt to Y,O,U.
 *
 * Global control:
 * EA,J,N is the only adjacent straight occurrence in all eight directions of
 * the 27x27 grid, so the corrected placement is globally unique once the key
 * and three-rune length are source-selected.
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

// Frozen DEATH source/ciphertext.
const deathNode = triples.find(node =>
  nodeRunes(node).join('-') === 'TH-G-OE' &&
  same(node.center, [14, 7]) &&
  node.radius === 6
);
assert.ok(deathNode);
const deathCells = [[10, 10], [11, 9], [12, 8]];
assert.deepEqual(
  deathCells.map(cell => corpus.translit[at(cell)]),
  ['F', 'NG', 'R']
);

const deathEndpointValue = at(deathCells.at(-1));
assert.equal(deathEndpointValue, 4);
assert.equal(corpus.translit[deathEndpointValue], 'R');

// Source-generate OF raw values.
const ofCenterValue = deathNode.radius + phi(deathNode.radius);
const ofRightValue = mod29(
  deathEndpointValue + phi(deathNode.raw[0])
);
const ofLeftValue = mod29(deathEndpointValue - ofCenterValue);

assert.equal(ofCenterValue, 8);
assert.equal(corpus.translit[ofCenterValue], 'H');
assert.equal(ofRightValue, 5);
assert.equal(corpus.translit[ofRightValue], 'C');
assert.equal(ofLeftValue, 25);
assert.equal(corpus.translit[ofLeftValue], 'AE');

const ofCandidates = matches([ofLeftValue, ofCenterValue, ofRightValue])
  .filter(node => node.radius === deathEndpointValue);
assert.equal(ofCandidates.length, 1);
const ofNode = ofCandidates[0];

assert.deepEqual(nodeRunes(ofNode), ['AE', 'H', 'C']);
assert.deepEqual(ofNode.first, [9, 13]);
assert.deepEqual(ofNode.center, [9, 17]);
assert.deepEqual(ofNode.second, [9, 21]);
assert.equal(ofNode.radius, 4);
assert.deepEqual(ofNode.axis, [0, 1]);

// OF geometry.
const deathLength = deathCells.length;
assert.equal(deathLength, 3);

const ofEndpoint = [
  ofNode.center[0] + deathLength,
  ofNode.center[1],
];
assert.deepEqual(ofEndpoint, [12, 17]);
assert.equal(corpus.translit[at(ofEndpoint)], 'AE');

const oneStep = phi(deathNode.raw[0]);
assert.equal(oneStep, 1);
const ofStart = [ofEndpoint[0], ofEndpoint[1] + oneStep];
assert.deepEqual(ofStart, [12, 18]);
assert.equal(corpus.translit[at(ofStart)], 'H');

const ofRead = [0, -1];
const ofLength = phi(ofNode.radius);
assert.equal(ofLength, 2);
const ofCells = Array.from({ length: ofLength }, (_, index) => [
  ofStart[0],
  ofStart[1] - index,
]);
assert.deepEqual(ofCells, [[12, 18], [12, 17]]);

// OF operation gate into YOU source.
const directOfRaw = [...ofNode.raw];
const centerPhiOfRaw = [ofNode.raw[0], phi(ofNode.raw[1]), ofNode.raw[2]];
const directCenterComponent = directOfRaw[1];
const transformedCenterComponent = centerPhiOfRaw[1];

assert.equal(directCenterComponent, 8);
assert.equal(transformedCenterComponent, 4);

const nextOuter = at(ofStart);
assert.equal(nextOuter, 8);
const requiredRadius = ofNode.raw[2];
assert.equal(requiredRadius, 5);

const directNextMatches = matches([
  nextOuter,
  directCenterComponent,
  nextOuter,
]).filter(node => node.radius === requiredRadius);
const transformedNextMatches = matches([
  nextOuter,
  transformedCenterComponent,
  nextOuter,
]).filter(node => node.radius === requiredRadius);

assert.equal(directNextMatches.length, 0);
assert.equal(transformedNextMatches.length, 1);
const youNode = transformedNextMatches[0];

assert.deepEqual(nodeRunes(youNode), ['H', 'R', 'H']);
assert.deepEqual(youNode.first, [21, 17]);
assert.deepEqual(youNode.center, [21, 22]);
assert.deepEqual(youNode.second, [21, 27]);
assert.equal(youNode.radius, 5);
assert.deepEqual(youNode.axis, [0, 1]);

// Decrypt OF only after next-source selection.
const ofKey = align(centerPhiOfRaw);
assert.deepEqual(
  ofKey.map(value => corpus.translit[value]),
  ['C', 'AE', 'R']
);

const ofCiphertext = ofCells.map(at);
const ofPlaintext = ofCiphertext.map((value, index) =>
  mod29(value - ofKey[index % ofKey.length])
);
assert.deepEqual(
  ofPlaintext.map(value => corpus.translit[value]),
  ['O', 'F']
);

// Canonical YOU geometry.
const youShift = ofNode.raw[1] - phi(ofNode.radius);
assert.equal(youShift, 6);

const youStart = [
  ofEndpoint[0] - youShift,
  ofEndpoint[1] - youShift,
];
assert.deepEqual(youStart, [6, 11]);
assert.equal(corpus.translit[at(youStart)], 'EA');

const youRead = [0, -ofRead[1]];
assert.deepEqual(youRead, [0, 1]);

const youLength = youNode.radius - phi(ofNode.radius);
assert.equal(youLength, 3);
const youCells = Array.from({ length: youLength }, (_, index) => [
  youStart[0],
  youStart[1] + index,
]);
assert.deepEqual(youCells, [[6, 11], [6, 12], [6, 13]]);
assert.deepEqual(
  youCells.map(cell => corpus.translit[at(cell)]),
  ['EA', 'J', 'N']
);

const youKey = align([
  youNode.raw[0],
  phi(youNode.raw[1]),
  youNode.raw[2],
]);
assert.deepEqual(
  youKey.map(value => corpus.translit[value]),
  ['TH', 'H', 'H']
);

const youCiphertext = youCells.map(at);
const youPlaintext = youCiphertext.map((value, index) =>
  mod29(value - youKey[index % youKey.length])
);
assert.deepEqual(
  youPlaintext.map(value => corpus.translit[value]),
  ['Y', 'O', 'U']
);

// Global uniqueness of the selected adjacent EA,J,N ciphertext.
const target = youCiphertext;
const directions = [
  [-1, 0], [1, 0], [0, -1], [0, 1],
  [-1, -1], [-1, 1], [1, -1], [1, 1],
];
const globalHits = [];

for (let row = 1; row <= 27; row += 1) {
  for (let col = 1; col <= 27; col += 1) {
    for (const direction of directions) {
      const cells = target.map((_, index) => [
        row + direction[0] * index,
        col + direction[1] * index,
      ]);
      if (!cells.every(inBounds)) continue;
      if (cells.every((cell, index) => at(cell) === target[index])) {
        globalHits.push({ start: [row, col], direction, cells });
      }
    }
  }
}

assert.equal(globalHits.length, 1);
assert.deepEqual(globalHits[0].cells, youCells);

// External-placement control: canonical runes there are G,P,Y, not D,P,L.
const rejectedExternalCells = [[2, 10], [3, 10], [4, 10]];
assert.deepEqual(
  rejectedExternalCells.map(cell => corpus.translit[at(cell)]),
  ['G', 'P', 'Y']
);

console.log(JSON.stringify({
  status: 'PASS',
  source: 'canonical resources/liber-primus/lp2-corpus.json',
  ofSourceSelection: {
    raw: [ofLeftValue, ofCenterValue, ofRightValue].map(
      value => corpus.translit[value]
    ),
    radiusSelector: deathEndpointValue,
    node: nodeRunes(ofNode),
    coordinates: {
      first: ofNode.first,
      center: ofNode.center,
      second: ofNode.second,
      radius: ofNode.radius,
    },
  },
  ofGeometry: {
    start: ofStart,
    endpoint: ofEndpoint,
    readDirection: ofRead,
    cells: ofCells,
  },
  ofOperationGate: {
    directRadius5Matches: directNextMatches.length,
    centerPhiRadius5Matches: transformedNextMatches.length,
    selectedOperation: 'center-phi',
    selectedNextSource: nodeRunes(youNode),
    selectedNextSourceCoordinates: {
      first: youNode.first,
      center: youNode.center,
      second: youNode.second,
      radius: youNode.radius,
    },
  },
  ofPlaintextAfterSelection: ofPlaintext.map(
    value => corpus.translit[value]
  ),
  canonicalYou: {
    shift: youShift,
    start: youStart,
    readDirection: youRead,
    length: youLength,
    cells: youCells,
    ciphertextRunes: youCells.map(cell => corpus.translit[at(cell)]),
    alignedKey: youKey.map(value => corpus.translit[value]),
    plaintext: youPlaintext.map(value => corpus.translit[value]),
    globalAdjacentCiphertextOccurrences: globalHits.length,
  },
  externalPlacementControl: {
    cells: rejectedExternalCells,
    canonicalRunes: rejectedExternalCells.map(
      cell => corpus.translit[at(cell)]
    ),
    claimedExternalRunes: ['D', 'P', 'L'],
    decision: 'reject external YOU placement on canonical corpus',
  },
  decision:
    'DEATH source state selects AE-H-C and center-phi OF, which selects H-R-H. Canonical source geometry then fixes EA,J,N at row6; TH-H-H decrypts them to Y,O,U. This ciphertext is globally unique as an adjacent straight triple, while the external YOU coordinates are inconsistent with the canonical corpus and are rejected.',
}, null, 2));
