'use strict';

/**
 * SFT: source-state continuation from E-A-S-T to O-F on the original p0-p2
 * 27x27 equal-outer mirror graph.
 *
 * Frozen current state:
 * - direct non-mirror key E-O-D, radius 7, ordered axis down-right
 * - ciphertext TH(14,24) -> N(15,23) -> C(16,22), read down-left
 *
 * Source selection before plaintext inspection:
 * 1. Let r=7. Build the next symmetric raw key as
 *      [r+1, 2(r+1), r+1] = [8,16,8] = H-T-H.
 *    H-T-H occurs exactly once in the equal-outer graph.
 * 2. Move from current endpoint C(16,22) opposite the E-O-D ordered axis by
 *    current raw center O=3 plus r=7, total 10 -> J(6,12).
 * 3. Reverse that jump and read forward on the current key axis [1,1].
 * 4. Stop at the first post-start cell that is an outer of a mirror on that
 *    same axis whose radius equals r=7. H(7,13) is the first such cell,
 *    through H-G-H radius 7.
 *
 * Only after all cells are fixed, transform H-T-H to H-H-H and decrypt.
 *
 * Run:
 *   node sims/lp2_p0_east25_of26_source_state_sft.cjs
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

/** @param {{raw:number[]}} node @returns {string[]} */
function nodeRunes(node) {
  return node.raw.map(value => corpus.translit[value]);
}

/** @param {object} node @param {number[]} cell @returns {boolean} */
function isOuter(node, cell) {
  return same(node.first, cell) || same(node.second, cell);
}

/** @param {{raw:number[]}} node @returns {number[]} */
function deriveMirrorKey(node) {
  const derived = [node.raw[0], phi(node.raw[1]), node.raw[2]];
  const phase = mod(
    derived.reduce((sum, value) => sum + mu(phi(value)), 0)
  ) % 3;
  return derived.slice(phase).concat(derived.slice(0, phase));
}

const axes = [[1, 0], [0, 1], [1, 1], [1, -1]];
const mirrors = [];
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
        const raw = [at(first), at(center), at(second)];
        const triple = { first, center, second, radius, axis, raw };
        triples.push(triple);
        if (raw[0] === raw[2] && raw[1] !== 0) mirrors.push(triple);
      }
    }
  }
}
assert.equal(mirrors.length, 479);

/** @param {number[]} cell @returns {object[]} */
function touchingMirrors(cell) {
  return mirrors.filter(node =>
    same(cell, node.first) ||
    same(cell, node.center) ||
    same(cell, node.second)
  );
}

// Frozen EAST state.
const currentKeyNode = triples.find(node =>
  nodeRunes(node).join('-') === 'E-O-D' &&
  same(node.center, [13, 17]) &&
  node.radius === 7
);
assert.ok(currentKeyNode);
assert.deepEqual(currentKeyNode.axis, [1, 1]);
assert.equal(currentKeyNode.raw[1], 3);

const currentCells = [[14, 24], [15, 23], [16, 22]];
assert.deepEqual(
  currentCells.map(cell => corpus.translit[at(cell)]),
  ['TH', 'N', 'C']
);
const currentEndpoint = currentCells.at(-1);
const currentReadDirection = [1, -1];

const r = currentKeyNode.radius;
assert.equal(r, 7);

// Next symmetric raw key from current radius.
const nextOuter = r + 1;
const nextCenter = 2 * (r + 1);

assert.equal(nextOuter, 8);
assert.equal(corpus.translit[nextOuter], 'H');
assert.equal(nextCenter, 16);
assert.equal(corpus.translit[nextCenter], 'T');

const keyCandidates = mirrors.filter(node =>
  node.raw[0] === nextOuter &&
  node.raw[1] === nextCenter &&
  node.raw[2] === nextOuter
);
assert.equal(keyCandidates.length, 1);
const nextKeyNode = keyCandidates[0];

assert.deepEqual(nodeRunes(nextKeyNode), ['H', 'T', 'H']);
assert.deepEqual(nextKeyNode.first, [18, 27]);
assert.deepEqual(nextKeyNode.center, [19, 26]);
assert.deepEqual(nextKeyNode.second, [20, 25]);
assert.equal(nextKeyNode.radius, 1);
assert.deepEqual(nextKeyNode.axis, [1, -1]);

// Reverse current ordered key axis and jump by O + r = 3 + 7 = 10.
const reverseCurrentKeyAxis = [
  -currentKeyNode.axis[0],
  -currentKeyNode.axis[1],
];
assert.deepEqual(reverseCurrentKeyAxis, [-1, -1]);

const jumpDistance = currentKeyNode.raw[1] + r;
assert.equal(jumpDistance, 10);

const nextStart = [
  currentEndpoint[0] + reverseCurrentKeyAxis[0] * jumpDistance,
  currentEndpoint[1] + reverseCurrentKeyAxis[1] * jumpDistance,
];
assert.deepEqual(nextStart, [6, 12]);
assert.equal(corpus.translit[at(nextStart)], 'J');

// Reverse the jump for the ciphertext read.
const nextReadDirection = [...currentKeyNode.axis];
assert.deepEqual(nextReadDirection, [1, 1]);

// Stop at first post-start cell that is an outer of a same-axis mirror with
// radius equal to the current key radius r.
const ciphertextCells = [nextStart];
const stopCensus = [];
let stopMatches = [];

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
  const matches = touchingMirrors(cell).filter(node =>
    isOuter(node, cell) &&
    node.axis[0] === currentKeyNode.axis[0] &&
    node.axis[1] === currentKeyNode.axis[1] &&
    node.radius === r
  );

  stopCensus.push({
    cell: [...cell],
    rune: corpus.translit[at(cell)],
    matchingOuterCount: matches.length,
  });
  ciphertextCells.push([...cell]);

  if (matches.length > 0) {
    stopMatches = matches;
    break;
  }
}

assert.deepEqual(ciphertextCells, [[6, 12], [7, 13]]);
assert.deepEqual(stopCensus, [
  { cell: [7, 13], rune: 'H', matchingOuterCount: 1 },
]);
assert.equal(stopMatches.length, 1);
assert.deepEqual(nodeRunes(stopMatches[0]), ['H', 'G', 'H']);
assert.equal(stopMatches[0].radius, 7);
assert.deepEqual(stopMatches[0].axis, [1, 1]);

// Only now derive and decrypt.
const key = deriveMirrorKey(nextKeyNode);
assert.deepEqual(key.map(value => corpus.translit[value]), ['H', 'H', 'H']);

const ciphertext = ciphertextCells.map(at);
const plaintext = ciphertext.map((value, index) =>
  mod(value - key[index % key.length])
);

assert.deepEqual(
  plaintext.map(value => corpus.translit[value]),
  ['O', 'F']
);
assert.deepEqual(
  plaintext.map((value, index) => mod(value + key[index % key.length])),
  ciphertext
);

console.log(JSON.stringify({
  status: 'PASS',
  source: 'original LP2 p0-p2 27x27 grid',
  frozenCurrentState: {
    keyNode: nodeRunes(currentKeyNode),
    keyRadius: r,
    keyAxis: currentKeyNode.axis,
    ciphertextCells: currentCells,
    readDirection: currentReadDirection,
  },
  nextKeySelection: {
    rule: '[r+1, 2(r+1), r+1]',
    raw: [nextOuter, nextCenter, nextOuter],
    runes: [nextOuter, nextCenter, nextOuter].map(
      value => corpus.translit[value]
    ),
    globalMatches: keyCandidates.length,
    selectedCoordinates: {
      first: nextKeyNode.first,
      center: nextKeyNode.center,
      second: nextKeyNode.second,
      radius: nextKeyNode.radius,
      axis: nextKeyNode.axis,
    },
    derivedKey: key.map(value => corpus.translit[value]),
  },
  nextCiphertextSelection: {
    reverseCurrentKeyAxis,
    jumpDistance,
    start: nextStart,
    startRune: corpus.translit[at(nextStart)],
    readDirection: nextReadDirection,
    stopCensus,
    stopMirror: nodeRunes(stopMatches[0]),
    cells: ciphertextCells,
  },
  decryptedOnlyAfterSelection: plaintext.map(value => corpus.translit[value]),
  decision:
    'The EAST source state fixes the globally unique H-T-H node, J(6,12), and a two-cell down-right block by a same-axis radius-7 stop; H-H-H then yields O,F. The route remains conditional on the upstream source-state grammar.',
}, null, 2));
