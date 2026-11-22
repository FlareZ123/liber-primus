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

// Frozen source-selected DEATH state and selected OF source.
const death = {
  node: {
    raw: [2, 6, 22],
    center: [14, 7],
    radius: 6,
    axis: [0, 1],
  },
  cells: [[10, 10], [11, 9], [12, 8]],
  readDirection: [1, -1],
};

const ofNode = {
  raw: [25, 8, 5],
  first: [9, 13],
  center: [9, 17],
  second: [9, 21],
  radius: 4,
  axis: [0, 1],
};

assert.deepEqual(runes(death.node.raw), ['TH', 'G', 'OE']);
assert.deepEqual(runes(death.cells.map(at)), ['F', 'NG', 'R']);
assert.deepEqual(runes(ofNode.raw), ['AE', 'H', 'C']);
assert.deepEqual(ofNode.raw, [
  at(ofNode.first),
  at(ofNode.center),
  at(ofNode.second),
]);

// Start from the DEATH endpoint and move right by phi(OE=22)=10.
const ofStartDistance = phi(death.node.raw[2]);
const ofStart = [
  death.cells.at(-1)[0],
  death.cells.at(-1)[1] + ofStartDistance,
];

assert.equal(ofStartDistance, 10);
assert.deepEqual(ofStart, [12, 18]);
assert.equal(T[at(ofStart)], 'H');

// Reverse the current horizontal source axis.
const ofRead = [-death.node.axis[0], -death.node.axis[1]];
assert.deepEqual(ofRead, [0, -1]);

const ofLength = phi(ofNode.radius);
assert.equal(ofLength, 2);
const ofCells = Array.from({ length: ofLength }, (_, index) => [
  ofStart[0] + ofRead[0] * index,
  ofStart[1] + ofRead[1] * index,
]);

assert.deepEqual(ofCells, [[12, 18], [12, 17]]);
assert.deepEqual(runes(ofCells.map(at)), ['H', 'AE']);

// DEATH ciphertext predicts next phase 2.
const ofPredictedPhase = mod3(
  death.cells.reduce((sum, cell) => sum + mu(n0(cell)), 0)
);
assert.equal(ofPredictedPhase, 2);

const ofDirect = [...ofNode.raw];
const ofCenterPhi = [
  ofNode.raw[0],
  phi(ofNode.raw[1]),
  ofNode.raw[2],
];

assert.deepEqual(
  [
    ['direct', phase(ofDirect)],
    ['center-phi', phase(ofCenterPhi)],
  ],
  [
    ['direct', 0],
    ['center-phi', 2],
  ]
);

assert.notEqual(phase(ofDirect), ofPredictedPhase);
assert.equal(phase(ofCenterPhi), ofPredictedPhase);

const alignedOfKey = ofCenterPhi.slice(2).concat(ofCenterPhi.slice(0, 2));
assert.deepEqual(runes(alignedOfKey), ['C', 'AE', 'R']);

const ofCiphertext = ofCells.map(at);
const ofPlaintext = ofCiphertext.map(
  (value, index) => mod29(value - alignedOfKey[index % alignedOfKey.length])
);

assert.deepEqual(runes(ofPlaintext), ['O', 'F']);
assert.deepEqual(
  ofPlaintext.map(
    (value, index) => mod29(value + alignedOfKey[index % alignedOfKey.length])
  ),
  ofCiphertext
);

// Prospective next source: mirror the original H center around its own totient.
const youRaw = [
  ofNode.raw[1],
  phi(ofNode.raw[1]),
  ofNode.raw[1],
];

assert.deepEqual(runes(youRaw), ['H', 'R', 'H']);

const youMatches = straightMatches(youRaw);
assert.equal(youMatches.length, 1);
const youNode = youMatches[0];

assert.deepEqual(youNode.first, [21, 17]);
assert.deepEqual(youNode.center, [21, 22]);
assert.deepEqual(youNode.second, [21, 27]);
assert.equal(youNode.radius, ofNode.raw[2]);
assert.equal(youNode.radius, 5);
assert.deepEqual(youNode.axis, [0, 1]);

// YOU starts one source-derived 6-step diagonal from the OF leftmost/end:
 // r + phi(r) = 4 + 2 = 6.
const youStartDistance = ofNode.radius + phi(ofNode.radius);
const youStart = [
  ofCells.at(-1)[0] - youStartDistance,
  ofCells.at(-1)[1] - youStartDistance,
];

assert.equal(youStartDistance, 6);
assert.deepEqual(youStart, [6, 11]);
assert.equal(T[at(youStart)], 'EA');

const youRead = [-ofRead[0], -ofRead[1]];
assert.deepEqual(youRead, [0, 1]);

const youLength = phi(youNode.raw[1]) + 1;
assert.equal(youLength, 3);
const youCells = Array.from({ length: youLength }, (_, index) => [
  youStart[0] + youRead[0] * index,
  youStart[1] + youRead[1] * index,
]);

assert.deepEqual(youCells, [[6, 11], [6, 12], [6, 13]]);
assert.deepEqual(runes(youCells.map(at)), ['EA', 'J', 'N']);

// OF ciphertext predicts next phase 1, selecting center-phi H-TH-H.
const youPredictedPhase = mod3(
  ofCells.reduce((sum, cell) => sum + mu(n0(cell)), 0)
);
assert.equal(youPredictedPhase, 1);

const youDirect = [...youNode.raw];
const youCenterPhi = [
  youNode.raw[0],
  phi(youNode.raw[1]),
  youNode.raw[2],
];

assert.deepEqual(
  [
    ['direct', phase(youDirect)],
    ['center-phi', phase(youCenterPhi)],
  ],
  [
    ['direct', 2],
    ['center-phi', 1],
  ]
);
assert.equal(phase(youCenterPhi), youPredictedPhase);

const alignedYouKey = youCenterPhi.slice(1).concat(youCenterPhi.slice(0, 1));
assert.deepEqual(runes(alignedYouKey), ['TH', 'H', 'H']);

const youCiphertext = youCells.map(at);
const youPlaintext = youCiphertext.map(
  (value, index) => mod29(value - alignedYouKey[index % alignedYouKey.length])
);

assert.deepEqual(runes(youPlaintext), ['Y', 'O', 'U']);
assert.deepEqual(
  youPlaintext.map(
    (value, index) => mod29(value + alignedYouKey[index % alignedYouKey.length])
  ),
  youCiphertext
);

console.log(JSON.stringify({
  status: 'PASS',
  of: {
    source: runes(ofNode.raw),
    startDistanceFromDeathEndpoint: ofStartDistance,
    start: ofStart,
    readDirection: ofRead,
    length: ofLength,
    cells: ofCells,
    ciphertext: runes(ofCiphertext),
    predictedPhase: ofPredictedPhase,
    operationCandidates: [
      { name: 'direct', key: runes(ofDirect), phase: phase(ofDirect) },
      { name: 'center-phi', key: runes(ofCenterPhi), phase: phase(ofCenterPhi) },
    ],
    selectedOperation: 'center-phi',
    alignedKey: runes(alignedOfKey),
    plaintextAfterSelection: runes(ofPlaintext),
  },
  youSource: {
    formula: '[center, phi(center), center]',
    raw: runes(youRaw),
    globalMatches: youMatches.length,
    selected: {
      first: youNode.first,
      center: youNode.center,
      second: youNode.second,
      radius: youNode.radius,
      axis: youNode.axis,
    },
  },
  you: {
    startDistance: youStartDistance,
    start: youStart,
    readDirection: youRead,
    lengthFromCenterTotient: youLength,
    cells: youCells,
    ciphertext: runes(youCiphertext),
    predictedPhase: youPredictedPhase,
    operationCandidates: [
      { name: 'direct', key: runes(youDirect), phase: phase(youDirect) },
      { name: 'center-phi', key: runes(youCenterPhi), phase: phase(youCenterPhi) },
    ],
    selectedOperation: 'center-phi',
    alignedKey: runes(alignedYouKey),
    plaintextAfterSelection: runes(youPlaintext),
  },
  decision:
    'DEATH geometry fixes OF. The phase rule selects center-phi AE-R-C before plaintext scoring. Its original H center generates the globally unique H-R-H source; source distances fix EA,J,N, and the next phase selects center-phi H-TH-H before decryption to Y,O,U.',
}, null, 2));
