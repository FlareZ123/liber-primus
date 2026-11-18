'use strict';

/**
 * SFT: source-state continuation from the source-selected T-O block to the
 * next two-rune block on the original p0-p2 27x27 equal-outer mirror graph.
 *
 * Frozen current state:
 * - current key source X-M-X, radius 3
 * - ciphertext U(9,16) -> NG(8,17), read up-right
 *
 * Source selection before plaintext inspection:
 * 1. Let r=3 be the current key radius. Define the next symmetric raw key as
 *    [phi(r), 2r, phi(r)] = [2,6,2] = TH-G-TH.
 *    TH-G-TH occurs exactly once in the 479-node graph.
 * 2. The selected next key is vertical, so use its perpendicular horizontal
 *    axis and retain the positive column sign of the current read.
 * 3. Move from current start U by raw-center minus raw-outer = 6-2=4 cells
 *    right -> H(9,20).
 *    Independent value check: U=1 + selected node radius 7 = H=8.
 * 4. Continue right and stop at the first post-start cell touching a mirror
 *    whose radius equals the next raw outer index TH=2 -> C(9,21).
 *
 * Only after all source cells are fixed, derive TH-TH-TH and decrypt.
 *
 * Run:
 *   node sims/lp2_p0_to_go_source_state_sft.cjs
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

/** @param {{raw:number[]}} node @returns {string[]} */
function nodeRunes(node) {
  return node.raw.map(value => corpus.translit[value]);
}

// Frozen T-O state.
const currentKeyCandidates = mirrors.filter(node =>
  nodeRunes(node).join('-') === 'X-M-X'
);
assert.equal(currentKeyCandidates.length, 1);
const currentKeyNode = currentKeyCandidates[0];
assert.equal(currentKeyNode.radius, 3);
assert.deepEqual(currentKeyNode.axis, [1, 0]);

const currentStart = [9, 16];
const currentEndpoint = [8, 17];
const currentReadDirection = [-1, 1];
assert.equal(corpus.translit[at(currentStart)], 'U');
assert.equal(corpus.translit[at(currentEndpoint)], 'NG');

// Derive the next raw symmetric key from current radius r.
const r = currentKeyNode.radius;
const nextOuter = phi(r);
const nextCenter = 2 * r;

assert.equal(r, 3);
assert.equal(nextOuter, 2);
assert.equal(corpus.translit[nextOuter], 'TH');
assert.equal(nextCenter, 6);
assert.equal(corpus.translit[nextCenter], 'G');

const nextKeyCandidates = mirrors.filter(node =>
  node.raw[0] === nextOuter &&
  node.raw[1] === nextCenter &&
  node.raw[2] === nextOuter
);
assert.equal(nextKeyCandidates.length, 1);

const nextKeyNode = nextKeyCandidates[0];
assert.deepEqual(nodeRunes(nextKeyNode), ['TH', 'G', 'TH']);
assert.deepEqual(nextKeyNode.center, [12, 14]);
assert.deepEqual(nextKeyNode.first, [5, 14]);
assert.deepEqual(nextKeyNode.second, [19, 14]);
assert.equal(nextKeyNode.radius, 7);
assert.deepEqual(nextKeyNode.axis, [1, 0]);

// Next key axis is vertical, so the source read axis is horizontal. Preserve
// the positive column sign of the current up-right read.
const nextReadDirection = [0, Math.sign(currentReadDirection[1])];
assert.deepEqual(nextReadDirection, [0, 1]);

// Move from current start by raw center minus raw outer.
const startDistance = nextCenter - nextOuter;
assert.equal(startDistance, 4);

const nextStart = [
  currentStart[0] + nextReadDirection[0] * startDistance,
  currentStart[1] + nextReadDirection[1] * startDistance,
];
assert.deepEqual(nextStart, [9, 20]);
assert.equal(corpus.translit[at(nextStart)], 'H');

// Independent value check: old start U=1 plus node radius7 is H=8.
assert.equal(at(currentStart) + nextKeyNode.radius, at(nextStart));
assert.equal(at(currentStart), 1);
assert.equal(at(nextStart), 8);

// Stop at the first subsequent source cell touching a mirror whose radius
// equals the next raw outer index TH=2.
const ciphertextCells = [nextStart];
const stopCensus = [];
let stopMirrors = [];

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
  const radiusMatches = touching(cell).filter(
    node => node.radius === nextOuter
  );

  stopCensus.push({
    cell: [...cell],
    rune: corpus.translit[at(cell)],
    radiusMatchCount: radiusMatches.length,
  });
  ciphertextCells.push([...cell]);

  if (radiusMatches.length > 0) {
    stopMirrors = radiusMatches;
    break;
  }
}

assert.deepEqual(ciphertextCells, [[9, 20], [9, 21]]);
assert.deepEqual(stopCensus, [
  { cell: [9, 21], rune: 'C', radiusMatchCount: 1 },
]);
assert.equal(stopMirrors.length, 1);
assert.deepEqual(nodeRunes(stopMirrors[0]), ['C', 'D', 'C']);
assert.equal(stopMirrors[0].radius, 2);

// Only now derive and decrypt.
const key = deriveKey(nextKeyNode);
assert.deepEqual(key.map(value => corpus.translit[value]), ['TH', 'TH', 'TH']);

const ciphertext = ciphertextCells.map(at);
const plaintext = ciphertext.map((value, index) =>
  mod(value - key[index % key.length])
);

assert.deepEqual(
  plaintext.map(value => corpus.translit[value]),
  ['G', 'O']
);
assert.deepEqual(
  plaintext.map((value, index) => mod(value + key[index % key.length])),
  ciphertext
);

console.log(JSON.stringify({
  status: 'PASS',
  source: 'original LP2 p0-p2 27x27 equal-outer mirror graph',
  frozenCurrentState: {
    keyNode: nodeRunes(currentKeyNode),
    keyRadius: r,
    ciphertextCells: [currentStart, currentEndpoint],
    readDirection: currentReadDirection,
  },
  nextKeySelection: {
    outerFromPhiRadius: nextOuter,
    outerRune: corpus.translit[nextOuter],
    centerFromDoubleRadius: nextCenter,
    centerRune: corpus.translit[nextCenter],
    globalMatches: nextKeyCandidates.length,
    node: nodeRunes(nextKeyNode),
    coordinates: {
      first: nextKeyNode.first,
      center: nextKeyNode.center,
      second: nextKeyNode.second,
      radius: nextKeyNode.radius,
    },
    derivedKey: key.map(value => corpus.translit[value]),
  },
  nextCiphertextSelection: {
    readDirection: nextReadDirection,
    startDistance,
    start: nextStart,
    startRune: corpus.translit[at(nextStart)],
    startValueCrossCheck: {
      previousStart: at(currentStart),
      selectedNodeRadius: nextKeyNode.radius,
      sum: at(currentStart) + nextKeyNode.radius,
      nextStart: at(nextStart),
    },
    stopCensus,
    stopMirror: nodeRunes(stopMirrors[0]),
    cells: ciphertextCells,
  },
  decryptedOnlyAfterSelection: plaintext.map(value => corpus.translit[value]),
  decision:
    'Current T-O source state fixes the globally unique TH-G-TH node and the two-cell rightward ciphertext H,C before decryption; TH-TH-TH then yields G,O. The route remains conditional on the upstream post-hoc grammar.',
}, null, 2));
