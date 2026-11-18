'use strict';

/**
 * SFT: source-state continuation from the source-selected I-S block to the
 * next two-rune block on the original p0-p2 27x27 equal-outer mirror graph.
 *
 * Frozen current state:
 * - current key source W-I-W, raw center I=10
 * - ciphertext X(18,7) -> OE(19,6), read down-left
 * - current endpoint OE(19,6) centers X-OE-X, radius 3
 *
 * Source selection before plaintext inspection:
 * 1. Reverse the current read direction and move from OE by raw center I=10
 *    -> U(9,16).
 * 2. At the current endpoint, preserve X from centered X-OE-X and subtract its
 *    radius from center rune OE=22: 22-3=19=M. This yields raw X-M-X.
 *    X-M-X occurs exactly once in the 479-node graph.
 * 3. Continue from U in the reversed direction (up-right).
 * 4. Stop at the first cell whose centered mirror contains the selected
 *    X-M-X center cell as an outer. NG(8,17) satisfies this through M-NG-M,
 *    whose outer M(8,25) is exactly the selected key center.
 *
 * Only after all source cells are fixed, derive X-E-X and decrypt.
 *
 * Run:
 *   node sims/lp2_p0_is_to_source_state_sft.cjs
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

// Frozen I-S state.
const currentKeyCandidates = mirrors.filter(node =>
  node.raw.map(value => corpus.translit[value]).join('-') === 'W-I-W'
);
assert.equal(currentKeyCandidates.length, 1);
const currentKeyNode = currentKeyCandidates[0];
assert.equal(currentKeyNode.raw[1], 10);
assert.equal(corpus.translit[currentKeyNode.raw[1]], 'I');

const currentStart = [18, 7];
const currentEndpoint = [19, 6];
const currentReadDirection = [1, -1];
assert.equal(corpus.translit[at(currentStart)], 'X');
assert.equal(corpus.translit[at(currentEndpoint)], 'OE');

// Endpoint OE centers a unique mirror X-OE-X with radius 3.
const endpointCentered = centered(currentEndpoint);
assert.equal(endpointCentered.length, 1);
const endpointNode = endpointCentered[0];
assert.deepEqual(
  endpointNode.raw.map(value => corpus.translit[value]),
  ['X', 'OE', 'X']
);
assert.equal(endpointNode.radius, 3);
assert.deepEqual(endpointNode.axis, [1, -1]);

// Reverse the old read and move by the raw center I=10.
const reverseDirection = [
  -currentReadDirection[0],
  -currentReadDirection[1],
];
assert.deepEqual(reverseDirection, [-1, 1]);

const currentRawCenter = currentKeyNode.raw[1];
const nextStart = [
  currentEndpoint[0] + reverseDirection[0] * currentRawCenter,
  currentEndpoint[1] + reverseDirection[1] * currentRawCenter,
];
assert.deepEqual(nextStart, [9, 16]);
assert.equal(corpus.translit[at(nextStart)], 'U');

// Derive the raw next-key values from the centered endpoint mirror.
const nextOuter = endpointNode.raw[0];
const nextCenter = endpointNode.raw[1] - endpointNode.radius;

assert.equal(nextOuter, 14);
assert.equal(corpus.translit[nextOuter], 'X');
assert.equal(nextCenter, 19);
assert.equal(corpus.translit[nextCenter], 'M');

const nextKeyCandidates = mirrors.filter(node =>
  node.raw[0] === nextOuter &&
  node.raw[1] === nextCenter &&
  node.raw[2] === nextOuter
);
assert.equal(nextKeyCandidates.length, 1);

const nextKeyNode = nextKeyCandidates[0];
assert.deepEqual(
  nextKeyNode.raw.map(value => corpus.translit[value]),
  ['X', 'M', 'X']
);
assert.deepEqual(nextKeyNode.center, [8, 25]);
assert.deepEqual(nextKeyNode.first, [5, 25]);
assert.deepEqual(nextKeyNode.second, [11, 25]);
assert.equal(nextKeyNode.radius, 3);
assert.deepEqual(nextKeyNode.axis, [1, 0]);

// Continue up-right. Stop at the first cell whose centered mirror has the
// selected key center as one of its outer cells.
const ciphertextCells = [nextStart];
const stopCensus = [];
let stopLink = null;

for (
  let cell = [
    nextStart[0] + reverseDirection[0],
    nextStart[1] + reverseDirection[1],
  ];
  inBounds(cell);
  cell = [
    cell[0] + reverseDirection[0],
    cell[1] + reverseDirection[1],
  ]
) {
  const centeredNodes = centered(cell);
  const links = centeredNodes.filter(node =>
    isOuter(node, nextKeyNode.center)
  );

  stopCensus.push({
    cell: [...cell],
    rune: corpus.translit[at(cell)],
    centeredCount: centeredNodes.length,
    keyCenterLinkCount: links.length,
  });
  ciphertextCells.push([...cell]);

  if (links.length > 0) {
    assert.equal(links.length, 1);
    stopLink = links[0];
    break;
  }
}

assert.deepEqual(ciphertextCells, [[9, 16], [8, 17]]);
assert.deepEqual(stopCensus, [
  {
    cell: [8, 17],
    rune: 'NG',
    centeredCount: 2,
    keyCenterLinkCount: 1,
  },
]);
assert.ok(stopLink);
assert.deepEqual(
  stopLink.raw.map(value => corpus.translit[value]),
  ['M', 'NG', 'M']
);
assert.equal(stopLink.radius, 8);
assert.deepEqual(stopLink.axis, [0, 1]);
assert.ok(isOuter(stopLink, nextKeyNode.center));

// Only now derive and decrypt.
const key = deriveKey(nextKeyNode);
assert.deepEqual(key.map(value => corpus.translit[value]), ['X', 'E', 'X']);

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
    keyNode: currentKeyNode.raw.map(value => corpus.translit[value]),
    rawCenter: currentRawCenter,
    ciphertextCells: [currentStart, currentEndpoint],
    readDirection: currentReadDirection,
    endpointCenteredNode: endpointNode.raw.map(value => corpus.translit[value]),
    endpointNodeRadius: endpointNode.radius,
  },
  nextStartSelection: {
    reversedDirection: reverseDirection,
    distance: currentRawCenter,
    start: nextStart,
    startRune: corpus.translit[at(nextStart)],
  },
  nextKeySelection: {
    outerFromEndpointNode: nextOuter,
    outerRune: corpus.translit[nextOuter],
    centerFromEndpointCenterMinusRadius: nextCenter,
    centerRune: corpus.translit[nextCenter],
    globalMatches: nextKeyCandidates.length,
    node: nextKeyNode.raw.map(value => corpus.translit[value]),
    coordinates: {
      first: nextKeyNode.first,
      center: nextKeyNode.center,
      second: nextKeyNode.second,
      radius: nextKeyNode.radius,
    },
    derivedKey: key.map(value => corpus.translit[value]),
  },
  nextCiphertextSelection: {
    readDirection: reverseDirection,
    stopCensus,
    stopLink: stopLink.raw.map(value => corpus.translit[value]),
    cells: ciphertextCells,
  },
  decryptedOnlyAfterSelection: plaintext.map(value => corpus.translit[value]),
  decision:
    'Current I-S source state fixes U(9,16), uniquely selects X-M-X, and stops at NG(8,17) through a direct mirror link to the selected key center; X-E-X then yields T,O. The route remains conditional on the upstream post-hoc grammar.',
}, null, 2));
