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
const mod = value => ((value % 29) + 29) % 29;
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
  return mod(values.reduce((sum, value) => sum + mu(phi(value)), 0)) % 3;
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

const runes = values => values.map(value => T[value]);

// Frozen second-THE state.
const current = {
  node: {
    raw: [11, 6, 1],
    center: [24, 1],
    radius: 1,
    axis: [1, 0],
  },
  start: [20, 12],
  endpoint: [20, 13],
  readDirection: [0, 1],
};

assert.deepEqual(runes(current.node.raw), ['J', 'G', 'U']);
assert.equal(T[at(current.start)], 'P');
assert.equal(T[at(current.endpoint)], 'L');

const r = current.node.radius;

// Source-generate the next ordered raw triple.
const nextRaw = [
  current.node.raw[0] + r,
  2 * (current.node.raw[1] + r),
  current.node.raw[0] - r,
];

assert.deepEqual(runes(nextRaw), ['EO', 'X', 'I']);

const rawMatches = triples.filter(node =>
  node.raw[0] === nextRaw[0] &&
  node.raw[1] === nextRaw[1] &&
  node.raw[2] === nextRaw[2]
);
assert.equal(rawMatches.length, 2);

// Preserve the current source radius. This leaves the small vertical source
// and rejects the radius-11 diagonal occurrence of the same raw triple.
const radiusMatches = rawMatches.filter(node => node.radius === r);
assert.equal(radiusMatches.length, 1);
const nextNode = radiusMatches[0];

assert.deepEqual(nextNode.first, [15, 9]);
assert.deepEqual(nextNode.center, [16, 9]);
assert.deepEqual(nextNode.second, [17, 9]);
assert.deepEqual(nextNode.axis, [1, 0]);
assert.equal(nextNode.radius, 1);

// Direct versus center-totient is a bounded operation choice. The frozen
// next-phase recurrence from current ciphertext cells predicts phase 1.
const predictedPhase = mod(
  [current.start, current.endpoint].reduce(
    (sum, cell) => sum + mu(n0(cell)),
    0
  )
) % 3;
assert.equal(predictedPhase, 1);

const operationCandidates = [
  {
    name: 'direct',
    key: [...nextNode.raw],
    phase: phase(nextNode.raw),
  },
  {
    name: 'center-phi',
    key: [nextNode.raw[0], phi(nextNode.raw[1]), nextNode.raw[2]],
    phase: phase([nextNode.raw[0], phi(nextNode.raw[1]), nextNode.raw[2]]),
  },
];

assert.deepEqual(
  operationCandidates.map(candidate => [candidate.name, candidate.phase]),
  [['direct', 1], ['center-phi', 2]]
);

const operationSurvivors = operationCandidates.filter(
  candidate => candidate.phase === predictedPhase
);
assert.equal(operationSurvivors.length, 1);
const selectedOperation = operationSurvivors[0];
assert.equal(selectedOperation.name, 'direct');

// The current source axis and ciphertext direction are orthogonal.
// Their negative sum fixes the next start move; their difference fixes the
// next read direction.
const startDirection = [
  -Math.sign(current.node.axis[0] + current.readDirection[0]),
  -Math.sign(current.node.axis[1] + current.readDirection[1]),
];
const nextStart = [
  current.start[0] + startDirection[0] * r,
  current.start[1] + startDirection[1] * r,
];
const nextReadDirection = [
  Math.sign(current.readDirection[0] - current.node.axis[0]),
  Math.sign(current.readDirection[1] - current.node.axis[1]),
];

assert.deepEqual(startDirection, [-1, -1]);
assert.deepEqual(nextStart, [19, 11]);
assert.equal(T[at(nextStart)], 'R');
assert.deepEqual(nextReadDirection, [-1, 1]);

// Totient of the selected source center is a source-derived move distance.
const readSteps = phi(nextNode.raw[1]);
assert.equal(readSteps, 6);

const ciphertextCells = [];
for (let step = 0; step <= readSteps; step += 1) {
  const cell = [
    nextStart[0] + nextReadDirection[0] * step,
    nextStart[1] + nextReadDirection[1] * step,
  ];
  assert.ok(inBounds(cell));
  ciphertextCells.push(cell);
}

assert.deepEqual(ciphertextCells, [
  [19, 11],
  [18, 12],
  [17, 13],
  [16, 14],
  [15, 15],
  [14, 16],
  [13, 17],
]);

// Independent geometry cross-check: the endpoint closes on the already
// source-selected EAST key center.
const earlierEastCenter = [13, 17];
assert.deepEqual(ciphertextCells.at(-1), earlierEastCenter);

const key = selectedOperation.key;
const ciphertext = ciphertextCells.map(at);
const plaintext = ciphertext.map(
  (value, index) => mod(value - key[index % key.length])
);

assert.deepEqual(runes(key), ['X', 'I', 'EO']);
assert.deepEqual(runes(ciphertext), ['R', 'C', 'AE', 'C', 'L', 'EO', 'O']);
assert.deepEqual(runes(plaintext), ['M', 'A', 'P', 'L', 'I', 'F', 'E']);
assert.deepEqual(
  plaintext.map((value, index) => mod(value + key[index % key.length])),
  ciphertext
);

console.log(JSON.stringify({
  status: 'PASS',
  frozenCurrentState: {
    source: runes(current.node.raw),
    center: current.node.center,
    radius: r,
    sourceAxis: current.node.axis,
    ciphertext: [current.start, current.endpoint],
    readDirection: current.readDirection,
  },
  nextKeySelection: {
    formula: '[first+r, 2*(center+r), first-r]',
    raw: nextRaw,
    runes: runes(nextRaw),
    globalStraightTripleMatches: rawMatches.length,
    radiusCarrySurvivors: radiusMatches.length,
    selected: {
      first: nextNode.first,
      center: nextNode.center,
      second: nextNode.second,
      axis: nextNode.axis,
      radius: nextNode.radius,
    },
    predictedPhase,
    operationCandidates: operationCandidates.map(candidate => ({
      name: candidate.name,
      phase: candidate.phase,
      key: runes(candidate.key),
    })),
    selectedOperation: selectedOperation.name,
  },
  nextCiphertextSelection: {
    startDirection,
    start: nextStart,
    startRune: T[at(nextStart)],
    readDirection: nextReadDirection,
    sourceMoveSteps: readSteps,
    length: ciphertextCells.length,
    cells: ciphertextCells,
    endpointLoopback: earlierEastCenter,
  },
  decryptedOnlyAfterSelection: runes(plaintext),
  decision:
    'The second-THE state source-generates EO-X-I, radius carry selects its unique radius-1 occurrence, the phase gate selects the direct key, and orthogonal-vector geometry plus phi(X)=6 fixes all seven ciphertext cells before decryption.',
  caveat:
    'The raw recurrence, radius carry, and vector construction remain conditional mechanism candidates because the public route was known when they were recognized. The endpoint loopback to the earlier EAST key center is an independent geometric cross-check.',
}, null, 2));
