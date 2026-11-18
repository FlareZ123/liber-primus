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

const at = cell => grid[(cell[0] - 1) * 27 + cell[1] - 1];
const inBounds = cell =>
  cell[0] >= 1 && cell[0] <= 27 && cell[1] >= 1 && cell[1] <= 27;
const mod29 = value => ((value % 29) + 29) % 29;
const mod3 = value => ((value % 3) + 3) % 3;
const n0 = cell => 27 * (cell[0] - 1) + cell[1];

/** @param {number} n @returns {number} */
function phi(n) {
  let result = n;
  let remaining = n;
  for (let factor = 2; factor * factor <= remaining; factor += 1) {
    if (remaining % factor !== 0) continue;
    result -= result / factor;
    while (remaining % factor === 0) remaining /= factor;
  }
  if (remaining > 1) result -= result / remaining;
  return result;
}

/** @param {number} n @returns {number} */
function mu(n) {
  let sign = 1;
  let remaining = n;
  for (let factor = 2; factor * factor <= remaining; factor += 1) {
    if (remaining % factor !== 0) continue;
    remaining /= factor;
    sign = -sign;
    if (remaining % factor === 0) return 0;
    while (remaining % factor === 0) remaining /= factor;
  }
  return remaining > 1 ? -sign : sign;
}

/** @param {number[]} values @returns {number} */
function phase(values) {
  return mod3(values.reduce((sum, value) => sum + mu(phi(value)), 0));
}

/** @param {number[]} values @returns {string[]} */
function runes(values) {
  return values.map(value => T[value]);
}

const axes = [[1, 0], [0, 1], [1, 1], [1, -1]];
const triples = [];

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
        triples.push({
          first,
          center,
          second,
          axis,
          radius,
          raw: [at(first), at(center), at(second)],
        });
      }
    }
  }
}

const straightMatches = raw => triples.filter(node =>
  node.raw[0] === raw[0] &&
  node.raw[1] === raw[1] &&
  node.raw[2] === raw[2]
);

// Frozen source-selected THE state and prospectively selected DEATH source.
const current = {
  node: {
    raw: [21, 24, 12],
    center: [10, 20],
    radius: 4,
    axis: [1, -1],
  },
  cells: [[11, 11], [11, 12]],
  readDirection: [0, 1],
};

const deathNode = {
  raw: [2, 6, 22],
  first: [14, 1],
  center: [14, 7],
  second: [14, 13],
  radius: 6,
  axis: [0, 1],
};

assert.deepEqual(runes(current.node.raw), ['NG', 'A', 'EO']);
assert.deepEqual(runes(current.cells.map(at)), ['D', 'P']);
assert.deepEqual(runes(deathNode.raw), ['TH', 'G', 'OE']);
assert.deepEqual(deathNode.raw, [
  at(deathNode.first),
  at(deathNode.center),
  at(deathNode.second),
]);

// Radius growth 4 -> 6 supplies a one-cell half-delta incoming move from the
// current leftmost/start cell along the exact incoming diagonal.
const radiusDelta = deathNode.radius - current.node.radius;
assert.equal(radiusDelta, 2);
const incomingStep = radiusDelta / 2;
const deathStart = [
  current.cells[0][0] - incomingStep,
  current.cells[0][1] - incomingStep,
];

assert.deepEqual(deathStart, [10, 10]);
assert.equal(T[at(deathStart)], 'F');

// Reuse the current source axis as the new ciphertext read direction.
const deathRead = current.node.axis;
assert.deepEqual(deathRead, [1, -1]);

// New source radius supplies the inclusive block length as phi(r)+1.
const deathLength = phi(deathNode.radius) + 1;
assert.equal(deathLength, 3);

const deathCells = Array.from({ length: deathLength }, (_, index) => [
  deathStart[0] + deathRead[0] * index,
  deathStart[1] + deathRead[1] * index,
]);

assert.deepEqual(deathCells, [[10, 10], [11, 9], [12, 8]]);
assert.deepEqual(runes(deathCells.map(at)), ['F', 'NG', 'R']);

// Current ciphertext positions predict phase 1 for the next derived key.
const predictedPhase = mod3(
  current.cells.reduce((sum, cell) => sum + mu(n0(cell)), 0)
);
assert.equal(predictedPhase, 1);

const directKey = [...deathNode.raw];
const centerPhiKey = [
  deathNode.raw[0],
  phi(deathNode.raw[1]),
  deathNode.raw[2],
];

assert.deepEqual(
  [
    ['direct', phase(directKey)],
    ['center-phi', phase(centerPhiKey)],
  ],
  [
    ['direct', 1],
    ['center-phi', 0],
  ]
);

assert.equal(phase(directKey), predictedPhase);
assert.notEqual(phase(centerPhiKey), predictedPhase);

const alignedDeathKey = directKey.slice(1).concat(directKey.slice(0, 1));
assert.deepEqual(runes(alignedDeathKey), ['G', 'OE', 'TH']);

const deathCiphertext = deathCells.map(at);
const deathPlaintext = deathCiphertext.map(
  (value, index) => mod29(value - alignedDeathKey[index % alignedDeathKey.length])
);

assert.deepEqual(runes(deathPlaintext), ['D', 'EA', 'TH']);
assert.deepEqual(
  deathPlaintext.map(
    (value, index) => mod29(value + alignedDeathKey[index % alignedDeathKey.length])
  ),
  deathCiphertext
);

// Prospective next-source gate from the selected direct DEATH source.
assert.equal(deathNode.radius % 2, 0);
const halfRadius = deathNode.radius / 2;
const ofRaw = [
  mod29(deathNode.raw[2] + halfRadius),
  mod29(deathNode.raw[0] + deathNode.radius),
  mod29(deathNode.raw[0] + halfRadius),
];

assert.deepEqual(runes(ofRaw), ['AE', 'H', 'C']);

const ofMatches = straightMatches(ofRaw);
assert.equal(ofMatches.length, 3);

const endpointValue = at(deathCells.at(-1));
assert.equal(endpointValue, 4);
assert.equal(T[endpointValue], 'R');

const ofRadiusMatches = ofMatches.filter(node => node.radius === endpointValue);
assert.equal(ofRadiusMatches.length, 1);
const ofNode = ofRadiusMatches[0];

assert.deepEqual(ofNode.first, [9, 13]);
assert.deepEqual(ofNode.center, [9, 17]);
assert.deepEqual(ofNode.second, [9, 21]);
assert.deepEqual(ofNode.axis, [0, 1]);
assert.equal(ofNode.radius, 4);

console.log(JSON.stringify({
  status: 'PASS',
  death: {
    source: runes(deathNode.raw),
    sourceCoordinates: {
      first: deathNode.first,
      center: deathNode.center,
      second: deathNode.second,
      radius: deathNode.radius,
      axis: deathNode.axis,
    },
    radiusDelta,
    start: deathStart,
    readDirection: deathRead,
    length: deathLength,
    cells: deathCells,
    ciphertext: runes(deathCiphertext),
    predictedPhase,
    operationCandidates: [
      { name: 'direct', key: runes(directKey), phase: phase(directKey) },
      { name: 'center-phi', key: runes(centerPhiKey), phase: phase(centerPhiKey) },
    ],
    selectedOperation: 'direct',
    alignedKey: runes(alignedDeathKey),
    plaintextAfterSelection: runes(deathPlaintext),
  },
  nextSource: {
    formula: '[third+r/2, first+r, first+r/2]',
    raw: runes(ofRaw),
    globalMatches: ofMatches.length,
    radiusFromDeathEndpoint: endpointValue,
    radiusMatches: ofRadiusMatches.length,
    selected: {
      first: ofNode.first,
      center: ofNode.center,
      second: ofNode.second,
      radius: ofNode.radius,
      axis: ofNode.axis,
    },
  },
  decision:
    'The selected THE state plus the fixed TH-G-OE source determines DEATH geometry. The frozen phase recurrence selects direct DEATH before plaintext scoring. Direct DEATH then source-generates AE-H-C, and the endpoint value R=4 uniquely selects its radius-4 placement.',
}, null, 2));
