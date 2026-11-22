'use strict';

/**
 * SFT: source-state continuation from the source-selected THE block to the
 * next vertical block on the original p0-p2 27x27 equal-outer mirror graph.
 *
 * Frozen current state:
 * - current key source N-M-N, radius 3
 * - current ciphertext J(22,21) -> W(21,20), read up-left
 * - endpoint W(21,20) has a unique mirror incidence W-O-W, radius 4
 *
 * Source selection before plaintext inspection:
 * 1. W-O-W is the unique endpoint mirror.
 * 2. From its center, move on the perpendicular in the retained upward sign by
 *    the current key outer index N=9 -> H(12,16).
 * 3. Two mirrors are centered there. Both independent source distances equal 1:
 *      endpoint-mirror radius 4 - current-key radius 3 = 1
 *      current ciphertext Chebyshev span = 1
 *    so the unique radius-1 centered mirror TH-H-TH is selected.
 * 4. Traverse W-O-W from the current endpoint to its opposite outer W(21,12),
 *    then continue on that same axis by the new raw center H=8 -> N(21,4).
 * 5. The new key axis is vertical. Preserve the current read's upward component.
 * 6. Stop at the first subsequent cell with exactly one mirror incidence.
 *
 * Only after all cells are fixed, derive R-TH-TH and decrypt.
 *
 * Run:
 *   node sims/lp2_p0_the_key_source_state_sft.cjs
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
const same = (first, second) =>
  first[0] === second[0] && first[1] === second[1];
const inBounds = cell =>
  cell[0] >= 1 && cell[0] <= 27 && cell[1] >= 1 && cell[1] <= 27;
const mod = value => ((value % 29) + 29) % 29;
const chebyshev = (first, second) => Math.max(
  Math.abs(first[0] - second[0]),
  Math.abs(first[1] - second[1])
);

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

/** @param {number[]} vector @returns {number[]} */
function signVector(vector) {
  return [Math.sign(vector[0]), Math.sign(vector[1])];
}

const axes = [[1, 0], [0, 1], [1, 1], [1, -1]];
const mirrors = [];
let mirrorId = 0;

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
        if (at(first) === at(second) && at(center) !== 0) {
          mirrors.push({
            id: mirrorId,
            center,
            first,
            second,
            radius,
            axis,
            raw: [at(first), at(center), at(second)],
          });
          mirrorId += 1;
        }
      }
    }
  }
}

assert.equal(mirrors.length, 479);

/** @param {number[]} cell @returns {object[]} */
function touching(cell) {
  return mirrors.filter(node =>
    same(cell, node.center) ||
    same(cell, node.first) ||
    same(cell, node.second)
  );
}

/** @param {number[]} cell @returns {object[]} */
function centered(cell) {
  return mirrors.filter(node => same(cell, node.center));
}

/** @param {object} node @param {number[]} cell @returns {boolean} */
function isOuter(node, cell) {
  return same(node.first, cell) || same(node.second, cell);
}

/** @param {object} node @param {number[]} outer @returns {number[]} */
function oppositeOuter(node, outer) {
  assert.ok(isOuter(node, outer));
  return same(node.first, outer) ? node.second : node.first;
}

/** @param {{raw:number[]}} node @returns {number[]} */
function deriveKey(node) {
  const derived = [node.raw[0], phi(node.raw[1]), node.raw[2]];
  const rotation = mod(
    derived.reduce((sum, value) => sum + mu(phi(value)), 0)
  ) % 3;

  return derived.slice(rotation).concat(derived.slice(0, rotation));
}

// Frozen THE state.
const currentKeyCandidates = mirrors.filter(node =>
  node.raw.map(value => corpus.translit[value]).join('-') === 'N-M-N'
);
assert.equal(currentKeyCandidates.length, 1);
const currentKeyNode = currentKeyCandidates[0];
assert.equal(currentKeyNode.radius, 3);

const currentStart = [22, 21];
const currentEndpoint = [21, 20];
const currentReadDirection = [-1, -1];
assert.equal(corpus.translit[at(currentStart)], 'J');
assert.equal(corpus.translit[at(currentEndpoint)], 'W');

// Endpoint W has exactly one equal-outer mirror incidence.
const endpointMirrors = touching(currentEndpoint);
assert.equal(endpointMirrors.length, 1);
const endpointMirror = endpointMirrors[0];
assert.ok(isOuter(endpointMirror, currentEndpoint));
assert.deepEqual(
  endpointMirror.raw.map(value => corpus.translit[value]),
  ['W', 'O', 'W']
);
assert.equal(endpointMirror.radius, 4);
assert.deepEqual(endpointMirror.axis, [0, 1]);
assert.deepEqual(endpointMirror.center, [21, 16]);

// The current key outer rune N has index 9. Project the retained upward
// component onto the perpendicular of the horizontal endpoint mirror.
const currentKeyOuter = currentKeyNode.raw[0];
assert.equal(currentKeyOuter, 9);
assert.equal(corpus.translit[currentKeyOuter], 'N');

const perpendicular = [1, 0];
const perpendicularSign = Math.sign(currentReadDirection[0]);
assert.equal(perpendicularSign, -1);

const nextCenter = [
  endpointMirror.center[0] + perpendicular[0] * perpendicularSign * currentKeyOuter,
  endpointMirror.center[1] + perpendicular[1] * perpendicularSign * currentKeyOuter,
];
assert.deepEqual(nextCenter, [12, 16]);
assert.equal(corpus.translit[at(nextCenter)], 'H');

// Two mirrors center there. Both independent source distances select radius 1.
const nextCentered = centered(nextCenter);
assert.deepEqual(
  nextCentered.map(node => ({
    runes: node.raw.map(value => corpus.translit[value]),
    radius: node.radius,
  })).sort((first, second) => first.radius - second.radius),
  [
    { runes: ['TH', 'H', 'TH'], radius: 1 },
    { runes: ['IA', 'H', 'IA'], radius: 10 },
  ]
);

const radiusDifference = endpointMirror.radius - currentKeyNode.radius;
const currentCipherSpan = chebyshev(currentStart, currentEndpoint);
assert.equal(radiusDifference, 1);
assert.equal(currentCipherSpan, 1);

const radiusSelected = nextCentered.filter(node =>
  node.radius === radiusDifference &&
  node.radius === currentCipherSpan
);
assert.equal(radiusSelected.length, 1);
const nextKeyNode = radiusSelected[0];
assert.deepEqual(
  nextKeyNode.raw.map(value => corpus.translit[value]),
  ['TH', 'H', 'TH']
);
assert.equal(nextKeyNode.radius, 1);
assert.deepEqual(nextKeyNode.axis, [1, 0]);

// Traverse the endpoint mirror through its center to the opposite W.
const oppositeW = oppositeOuter(endpointMirror, currentEndpoint);
assert.deepEqual(oppositeW, [21, 12]);

// Continue in the same horizontal direction by the new raw center value H=8.
const horizontalDirection = signVector([
  oppositeW[0] - endpointMirror.center[0],
  oppositeW[1] - endpointMirror.center[1],
]);
assert.deepEqual(horizontalDirection, [0, -1]);

const rawNextCenter = nextKeyNode.raw[1];
assert.equal(rawNextCenter, 8);
assert.equal(corpus.translit[rawNextCenter], 'H');

const nextStart = [
  oppositeW[0] + horizontalDirection[0] * rawNextCenter,
  oppositeW[1] + horizontalDirection[1] * rawNextCenter,
];
assert.deepEqual(nextStart, [21, 4]);
assert.equal(corpus.translit[at(nextStart)], 'N');

// New key axis is vertical. Preserve the current upward component.
const nextReadDirection = [
  Math.sign(currentReadDirection[0]),
  0,
];
assert.deepEqual(nextKeyNode.axis, [1, 0]);
assert.deepEqual(nextReadDirection, [-1, 0]);

// Stop at the first subsequent singleton-incidence source cell.
const ciphertextCells = [nextStart];
const stopCensus = [];

for (
  let cell = [
    nextStart[0] + nextReadDirection[0],
    nextStart[1] + nextReadDirection[1],
  ];
  inBounds(cell);
  cell = [
    cell[0] + nextReadDirection[0],
    cell[1] + nextReadDirection[1],
  ]
) {
  const incidences = touching(cell);
  stopCensus.push({
    cell: [...cell],
    rune: corpus.translit[at(cell)],
    incidenceCount: incidences.length,
  });
  ciphertextCells.push([...cell]);

  if (incidences.length === 1) break;
}

assert.deepEqual(stopCensus, [
  { cell: [20, 4], rune: 'L', incidenceCount: 2 },
  { cell: [19, 4], rune: 'EA', incidenceCount: 1 },
]);
assert.deepEqual(ciphertextCells, [[21, 4], [20, 4], [19, 4]]);

// Only now derive and decrypt.
const key = deriveKey(nextKeyNode);
assert.deepEqual(key.map(value => corpus.translit[value]), ['R', 'TH', 'TH']);

const ciphertext = ciphertextCells.map(at);
const plaintext = ciphertext.map((value, index) =>
  mod(value - key[index % key.length])
);

assert.deepEqual(
  plaintext.map(value => corpus.translit[value]),
  ['C', 'E', 'Y']
);
assert.deepEqual(
  plaintext.map((value, index) => mod(value + key[index % key.length])),
  ciphertext
);

console.log(JSON.stringify({
  status: 'PASS',
  source: 'original LP2 p0-p2 27x27 equal-outer mirror graph',
  frozenCurrentState: {
    keyNode: currentKeyNode.raw.map(value => corpus.translit[value]),
    keyRadius: currentKeyNode.radius,
    ciphertextCells: [currentStart, currentEndpoint],
    readDirection: currentReadDirection,
    endpointMirror: endpointMirror.raw.map(value => corpus.translit[value]),
    endpointMirrorRadius: endpointMirror.radius,
  },
  nextKeySelection: {
    endpointMirrorCenter: endpointMirror.center,
    perpendicularDistanceFromCurrentKeyOuter: currentKeyOuter,
    nextCenter,
    centeredCandidates: nextCentered.map(node => ({
      runes: node.raw.map(value => corpus.translit[value]),
      radius: node.radius,
    })),
    radiusDifference,
    currentCipherSpan,
    selectedNode: nextKeyNode.raw.map(value => corpus.translit[value]),
    derivedKey: key.map(value => corpus.translit[value]),
  },
  nextCiphertextSelection: {
    oppositeEndpointMirrorOuter: oppositeW,
    continuedDistanceFromNewRawCenter: rawNextCenter,
    start: nextStart,
    readDirection: nextReadDirection,
    stopCensus,
    cells: ciphertextCells,
  },
  decryptedOnlyAfterSelection: plaintext.map(value => corpus.translit[value]),
  latinReadingNote:
    'The first GP rune is index 5, conventionally the shared C/K rune; KEY is the proposed Latin reading.',
  decision:
    'Current THE source state selects TH-H-TH, places the next three ciphertext cells N,L,EA, and decrypts them to C/K,E,Y without Reports01-06 or a supplied English word. The result remains conditional on the upstream post-hoc source grammar.',
}, null, 2));
