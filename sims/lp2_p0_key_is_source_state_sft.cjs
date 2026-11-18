'use strict';

/**
 * SFT: source-state continuation from the source-selected C/K-E-Y block to the
 * next two-rune block on the original p0-p2 27x27 equal-outer mirror graph.
 *
 * Frozen current state:
 * - ciphertext N(21,4), L(20,4), EA(19,4), read upward
 * - current start N(21,4) has exactly one mirror incidence, N-C-N
 * - current endpoint EA(19,4) has exactly one mirror incidence, EA-P-EA r3
 *
 * Source selection before plaintext inspection:
 * 1. Move from the current start toward its unique N-C-N center by the current
 *    endpoint-mirror radius 3 -> X(18,7).
 * 2. Source values cross-check the new start: EA=28 / 2 = X=14.
 * 3. Halve the new start X=14 -> W=7 and the current middle L=20 -> I=10.
 *    The symmetric equal-outer node W-I-W occurs exactly once in the 479-node
 *    graph, selecting the next key source.
 * 4. Reverse the start-to-start move, reading from X back toward the previous
 *    start along the same anti-diagonal.
 * 5. Stop at the first post-start cell that is itself a mirror center.
 *
 * Only after all source cells are fixed, derive R-W-W and decrypt.
 *
 * Run:
 *   node sims/lp2_p0_key_is_source_state_sft.cjs
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

/** @param {{raw:number[]}} node @returns {number[]} */
function deriveKey(node) {
  const derived = [node.raw[0], phi(node.raw[1]), node.raw[2]];
  const rotation = mod(
    derived.reduce((sum, value) => sum + mu(phi(value)), 0)
  ) % 3;

  return derived.slice(rotation).concat(derived.slice(0, rotation));
}

// Frozen current source state.
const currentStart = [21, 4];
const currentMiddle = [20, 4];
const currentEndpoint = [19, 4];

assert.equal(corpus.translit[at(currentStart)], 'N');
assert.equal(corpus.translit[at(currentMiddle)], 'L');
assert.equal(corpus.translit[at(currentEndpoint)], 'EA');

// The current start and endpoint each have one equal-outer incidence.
const startMirrors = touching(currentStart);
const endpointMirrors = touching(currentEndpoint);
assert.equal(startMirrors.length, 1);
assert.equal(endpointMirrors.length, 1);

const startMirror = startMirrors[0];
const endpointMirror = endpointMirrors[0];

assert.ok(isOuter(startMirror, currentStart));
assert.ok(isOuter(endpointMirror, currentEndpoint));
assert.deepEqual(
  startMirror.raw.map(value => corpus.translit[value]),
  ['N', 'C', 'N']
);
assert.deepEqual(startMirror.axis, [1, -1]);
assert.deepEqual(startMirror.center, [11, 14]);

assert.deepEqual(
  endpointMirror.raw.map(value => corpus.translit[value]),
  ['EA', 'P', 'EA']
);
assert.equal(endpointMirror.radius, 3);

// Move from the old start toward the N-C-N center by the endpoint mirror radius.
const towardStartMirrorCenter = signVector([
  startMirror.center[0] - currentStart[0],
  startMirror.center[1] - currentStart[1],
]);
assert.deepEqual(towardStartMirrorCenter, [-1, 1]);

const nextStart = [
  currentStart[0] + towardStartMirrorCenter[0] * endpointMirror.radius,
  currentStart[1] + towardStartMirrorCenter[1] * endpointMirror.radius,
];
assert.deepEqual(nextStart, [18, 7]);
assert.equal(corpus.translit[at(nextStart)], 'X');

// Independent source-value check: old endpoint EA=28 halves to new start X=14.
const currentEndpointValue = at(currentEndpoint);
const nextStartValue = at(nextStart);
assert.equal(currentEndpointValue, 28);
assert.equal(nextStartValue, 14);
assert.equal(currentEndpointValue / 2, nextStartValue);

// Derive a bounded next-key raw family by halving two already selected values.
const outerValue = nextStartValue / 2;
const centerValue = at(currentMiddle) / 2;

assert.equal(nextStartValue % 2, 0);
assert.equal(at(currentMiddle) % 2, 0);
assert.equal(outerValue, 7);
assert.equal(centerValue, 10);
assert.equal(corpus.translit[outerValue], 'W');
assert.equal(corpus.translit[centerValue], 'I');

const keyCandidates = mirrors.filter(node =>
  node.raw[0] === outerValue &&
  node.raw[1] === centerValue &&
  node.raw[2] === outerValue
);
assert.equal(keyCandidates.length, 1);

const keyNode = keyCandidates[0];
assert.deepEqual(
  keyNode.raw.map(value => corpus.translit[value]),
  ['W', 'I', 'W']
);
assert.deepEqual(keyNode.center, [17, 9]);
assert.deepEqual(keyNode.first, [17, 3]);
assert.deepEqual(keyNode.second, [17, 15]);
assert.equal(keyNode.radius, 6);
assert.deepEqual(keyNode.axis, [0, 1]);

// Reverse the start-to-start move, pointing back toward the previous start.
const readDirection = signVector([
  currentStart[0] - nextStart[0],
  currentStart[1] - nextStart[1],
]);
assert.deepEqual(readDirection, [1, -1]);

// Stop at the first subsequent cell that is a mirror center.
const ciphertextCells = [nextStart];
const stopCensus = [];

for (
  let cell = [
    nextStart[0] + readDirection[0],
    nextStart[1] + readDirection[1],
  ];
  inBounds(cell);
  cell = [
    cell[0] + readDirection[0],
    cell[1] + readDirection[1],
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

assert.deepEqual(stopCensus, [
  { cell: [19, 6], rune: 'OE', centeredCount: 1 },
]);
assert.deepEqual(ciphertextCells, [[18, 7], [19, 6]]);

const stopNode = centered(ciphertextCells.at(-1))[0];
assert.deepEqual(
  stopNode.raw.map(value => corpus.translit[value]),
  ['X', 'OE', 'X']
);
assert.equal(stopNode.radius, 3);
assert.deepEqual(stopNode.axis, [1, -1]);

// Only now derive and decrypt.
const key = deriveKey(keyNode);
assert.deepEqual(key.map(value => corpus.translit[value]), ['R', 'W', 'W']);

const ciphertext = ciphertextCells.map(at);
const plaintext = ciphertext.map((value, index) =>
  mod(value - key[index % key.length])
);

assert.deepEqual(
  plaintext.map(value => corpus.translit[value]),
  ['I', 'S']
);
assert.deepEqual(
  plaintext.map((value, index) => mod(value + key[index % key.length])),
  ciphertext
);

console.log(JSON.stringify({
  status: 'PASS',
  source: 'original LP2 p0-p2 27x27 equal-outer mirror graph',
  frozenCurrentState: {
    cells: [currentStart, currentMiddle, currentEndpoint],
    runes: [currentStart, currentMiddle, currentEndpoint].map(
      cell => corpus.translit[at(cell)]
    ),
    startMirror: startMirror.raw.map(value => corpus.translit[value]),
    endpointMirror: endpointMirror.raw.map(value => corpus.translit[value]),
    endpointMirrorRadius: endpointMirror.radius,
  },
  nextStartSelection: {
    directionTowardOldStartMirrorCenter: towardStartMirrorCenter,
    distance: endpointMirror.radius,
    nextStart,
    nextStartRune: corpus.translit[nextStartValue],
    endpointHalfValueCheck: {
      endpointValue: currentEndpointValue,
      half: currentEndpointValue / 2,
      nextStartValue,
    },
  },
  nextKeySelection: {
    outerFromHalfNextStart: outerValue,
    outerRune: corpus.translit[outerValue],
    centerFromHalfOldMiddle: centerValue,
    centerRune: corpus.translit[centerValue],
    globalMatches: keyCandidates.length,
    selectedNode: keyNode.raw.map(value => corpus.translit[value]),
    coordinates: {
      first: keyNode.first,
      center: keyNode.center,
      second: keyNode.second,
      radius: keyNode.radius,
    },
    derivedKey: key.map(value => corpus.translit[value]),
  },
  nextCiphertextSelection: {
    start: nextStart,
    readDirection,
    stopCensus,
    cells: ciphertextCells,
  },
  decryptedOnlyAfterSelection: plaintext.map(value => corpus.translit[value]),
  decision:
    'Current source state fixes X(18,7), the globally unique W-I-W key source, and the two-cell down-left ciphertext X,OE before decryption; R-W-W then yields I,S. The route remains conditional on the upstream post-hoc grammar.',
}, null, 2));
