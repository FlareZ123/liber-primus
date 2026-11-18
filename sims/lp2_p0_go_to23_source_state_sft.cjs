'use strict';

/**
 * SFT: source-state continuation from the source-selected G-O block to the
 * next two-rune block on the original p0-p2 27x27 equal-outer mirror graph.
 *
 * Frozen current state:
 * - ciphertext H(9,20) -> C(9,21), read right
 * - the endpoint stop condition selected C-D-C radius 2, centered D(11,21)
 *
 * Source selection before plaintext inspection:
 * 1. The stop mirror center supplies outer D=23.
 * 2. Current start H=8 plus phi(stop radius 2)=1 supplies center N=9.
 *    This gives raw D-N-D. Two such mirrors exist globally.
 * 3. From stop-center D(11,21), the only mirror using D as an outer is
 *    D-TH-D; traverse to its far D(11,11). Exactly one D-N-D candidate
 *    contains that D, selecting the diagonal node centered N(17,17).
 * 4. From stop center D(11,21), step [phi(2), +2] in the selected key's
 *    positive diagonal quadrant -> OE(12,23). Rune cross-check:
 *    D=23 - phi(2)=1 -> OE=22.
 * 5. Preserve horizontal axis from the prior block but reverse direction.
 *    At OE, the unique horizontal incidence is OE-H-OE, fixing leftward.
 * 6. Stop at the first post-start cell that is itself a mirror center.
 *
 * Only after all source cells are fixed, derive G-D-D and decrypt.
 *
 * Run:
 *   node sims/lp2_p0_go_to23_source_state_sft.cjs
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

/** @param {{raw:number[]}} node @returns {number[]} */
function deriveKey(node) {
  const derived = [node.raw[0], phi(node.raw[1]), node.raw[2]];
  const rotation = mod(
    derived.reduce((sum, value) => sum + mu(phi(value)), 0)
  ) % 3;

  return derived.slice(rotation).concat(derived.slice(0, rotation));
}

const axes = [[1, 0], [0, 1], [1, 1], [1, -1]];
const mirrors = [];

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
            center,
            first,
            second,
            radius,
            axis,
            raw: [at(first), at(center), at(second)],
          });
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

/** @param {{raw:number[]}} node @returns {string[]} */
function nodeRunes(node) {
  return node.raw.map(value => corpus.translit[value]);
}

// Frozen G-O state.
const currentStart = [9, 20];
const currentEndpoint = [9, 21];
const currentReadDirection = [0, 1];

assert.equal(corpus.translit[at(currentStart)], 'H');
assert.equal(corpus.translit[at(currentEndpoint)], 'C');

// Reproduce the endpoint stop mirror from the prior transition.
const endpointRadius2 = touching(currentEndpoint).filter(node =>
  node.radius === 2
);
assert.equal(endpointRadius2.length, 1);
const stopMirror = endpointRadius2[0];

assert.deepEqual(nodeRunes(stopMirror), ['C', 'D', 'C']);
assert.deepEqual(stopMirror.center, [11, 21]);
assert.equal(stopMirror.raw[1], 23);
assert.equal(corpus.translit[stopMirror.raw[1]], 'D');

const stopRadius = stopMirror.radius;
assert.equal(stopRadius, 2);

// Build the next raw key from source values.
const nextOuter = stopMirror.raw[1];
const nextCenter = at(currentStart) + phi(stopRadius);

assert.equal(at(currentStart), 8);
assert.equal(phi(stopRadius), 1);
assert.equal(nextCenter, 9);
assert.equal(corpus.translit[nextCenter], 'N');

const rawCandidates = mirrors.filter(node =>
  node.raw[0] === nextOuter &&
  node.raw[1] === nextCenter &&
  node.raw[2] === nextOuter
);
assert.equal(rawCandidates.length, 2);
assert.deepEqual(
  rawCandidates.map(node => ({
    center: node.center,
    radius: node.radius,
    axis: node.axis,
  })),
  [
    { center: [6, 13], radius: 9, axis: [0, 1] },
    { center: [17, 17], radius: 6, axis: [1, 1] },
  ]
);

// From D(11,21), only one mirror uses that D as an outer.
const stopCenter = stopMirror.center;
const outerRoleContinuations = touching(stopCenter).filter(node =>
  node !== stopMirror && isOuter(node, stopCenter)
);
assert.equal(outerRoleContinuations.length, 1);

const dThD = outerRoleContinuations[0];
assert.deepEqual(nodeRunes(dThD), ['D', 'TH', 'D']);
assert.equal(dThD.radius, 5);
assert.deepEqual(dThD.axis, [0, 1]);

const farD = oppositeOuter(dThD, stopCenter);
assert.deepEqual(farD, [11, 11]);

// Only one raw D-N-D candidate contains that forced far D.
const selectedCandidates = rawCandidates.filter(node =>
  isOuter(node, farD)
);
assert.equal(selectedCandidates.length, 1);
const nextKeyNode = selectedCandidates[0];

assert.deepEqual(nodeRunes(nextKeyNode), ['D', 'N', 'D']);
assert.deepEqual(nextKeyNode.center, [17, 17]);
assert.deepEqual(nextKeyNode.first, [11, 11]);
assert.deepEqual(nextKeyNode.second, [23, 23]);
assert.equal(nextKeyNode.radius, 6);
assert.deepEqual(nextKeyNode.axis, [1, 1]);

// Place the next start using the stop radius in the selected key's positive
// diagonal quadrant. Horizontal component preserves the current +column sign.
const step = [phi(stopRadius), stopRadius];
assert.deepEqual(step, [1, 2]);

const nextStart = [
  stopCenter[0] + step[0],
  stopCenter[1] + step[1],
];
assert.deepEqual(nextStart, [12, 23]);
assert.equal(corpus.translit[at(nextStart)], 'OE');

// Independent rune-value cross-check: D - phi(2) = OE.
assert.equal(stopMirror.raw[1] - phi(stopRadius), at(nextStart));
assert.equal(at(nextStart), 22);

// Preserve horizontal axis but reverse the previous rightward direction.
const nextReadDirection = [
  0,
  -Math.sign(currentReadDirection[1]),
];
assert.deepEqual(nextReadDirection, [0, -1]);

// At OE, horizontal incidence is unique and agrees with the selected direction.
const startHorizontal = touching(nextStart).filter(node =>
  node.axis[0] === 0 &&
  node.axis[1] === 1
);
assert.equal(startHorizontal.length, 1);
assert.deepEqual(nodeRunes(startHorizontal[0]), ['OE', 'H', 'OE']);
assert.ok(isOuter(startHorizontal[0], nextStart));
assert.ok(startHorizontal[0].center[1] < nextStart[1]);

// Stop at the first subsequent cell that is a mirror center.
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
  const centeredNodes = centered(cell);
  stopCensus.push({
    cell: [...cell],
    rune: corpus.translit[at(cell)],
    centeredCount: centeredNodes.length,
  });
  ciphertextCells.push([...cell]);

  if (centeredNodes.length > 0) break;
}

assert.deepEqual(ciphertextCells, [[12, 23], [12, 22]]);
assert.deepEqual(stopCensus, [
  { cell: [12, 22], rune: 'Y', centeredCount: 1 },
]);
assert.deepEqual(
  nodeRunes(centered(ciphertextCells.at(-1))[0]),
  ['X', 'Y', 'X']
);

// Only now derive and decrypt.
const key = deriveKey(nextKeyNode);
assert.deepEqual(key.map(value => corpus.translit[value]), ['G', 'D', 'D']);

const ciphertext = ciphertextCells.map(at);
const plaintext = ciphertext.map((value, index) =>
  mod(value - key[index % key.length])
);

assert.deepEqual(
  plaintext.map(value => corpus.translit[value]),
  ['T', 'O']
);
assert.deepEqual(
  plaintext.map((value, index) => mod(value + key[index % key.length])),
  ciphertext
);

console.log(JSON.stringify({
  status: 'PASS',
  source: 'original LP2 p0-p2 27x27 equal-outer mirror graph',
  frozenCurrentState: {
    ciphertextCells: [currentStart, currentEndpoint],
    readDirection: currentReadDirection,
    stopMirror: nodeRunes(stopMirror),
    stopMirrorCenter: stopCenter,
    stopMirrorRadius: stopRadius,
  },
  nextKeySelection: {
    rawOuterFromStopCenter: nextOuter,
    rawCenterFromStartPlusPhiRadius: nextCenter,
    rawCandidateCount: rawCandidates.length,
    forcedOuterRoleMirror: nodeRunes(dThD),
    forcedFarD: farD,
    selectedNode: nodeRunes(nextKeyNode),
    coordinates: {
      first: nextKeyNode.first,
      center: nextKeyNode.center,
      second: nextKeyNode.second,
      radius: nextKeyNode.radius,
    },
    derivedKey: key.map(value => corpus.translit[value]),
  },
  nextCiphertextSelection: {
    stepFromStopCenter: step,
    start: nextStart,
    startRune: corpus.translit[at(nextStart)],
    readDirection: nextReadDirection,
    startHorizontalMirror: nodeRunes(startHorizontal[0]),
    stopCensus,
    cells: ciphertextCells,
  },
  decryptedOnlyAfterSelection: plaintext.map(value => corpus.translit[value]),
  decision:
    'The G-O endpoint stop state selects one of two D-N-D mirrors and fixes the leftward two-cell ciphertext OE,Y before decryption; G-D-D then yields T,O. This is the first source-state extension beyond the previously published five-word phrase, still conditional on the upstream grammar.',
}, null, 2));
