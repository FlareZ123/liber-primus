'use strict';

/**
 * SFT: source-state continuation from post-GO THE to the next three-rune
 * non-mirror block on the original p0-p2 27x27 grid.
 *
 * Frozen current state:
 * - direct non-mirror key L-X-S, radius 3, ordered vertical axis down
 * - ciphertext T(9,19) -> R(9,18), read left
 *
 * Source selection before plaintext inspection:
 * 1. Let r=3. Source-generate ordered raw values
 *      L20 - phi(r)=18 -> E
 *      r=3 -> O
 *      L20 + r=23 -> D
 *    Ordered E-O-D occurs exactly once among all equally spaced straight
 *    triples, fixing center O(13,17), radius7, axis down-right.
 * 2. Move from current start T along that oriented axis by r+phi(r)=5
 *    -> TH(14,24).
 * 3. Read perpendicular to the new down-right axis while retaining the prior
 *    negative column sign -> down-left.
 * 4. After leaving the start, continue through center-only incidence cells and
 *    stop at the first cell that regains an outer-role equal-mirror incidence.
 *
 * Use the direct non-mirror key rule and decrypt only after selection.
 *
 * Run:
 *   node sims/lp2_p0_the24_east25_source_state_sft.cjs
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
function deriveDirectNonMirrorKey(node) {
  const phase = mod(
    node.raw.reduce((sum, value) => sum + mu(phi(value)), 0)
  ) % 3;
  return node.raw.slice(phase).concat(node.raw.slice(0, phase));
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

// Frozen previous state.
const currentKeyNode = triples.find(node =>
  nodeRunes(node).join('-') === 'L-X-S' &&
  same(node.center, [14, 4]) &&
  node.radius === 3
);
assert.ok(currentKeyNode);
assert.equal(currentKeyNode.radius, 3);
assert.deepEqual(currentKeyNode.axis, [1, 0]);

const currentStart = [9, 19];
const currentEndpoint = [9, 18];
const currentReadDirection = [0, -1];
assert.equal(corpus.translit[at(currentStart)], 'T');
assert.equal(corpus.translit[at(currentEndpoint)], 'R');

const r = currentKeyNode.radius;
const nextFirst = currentKeyNode.raw[0] - phi(r);
const nextCenter = r;
const nextSecond = currentKeyNode.raw[0] + r;

assert.equal(nextFirst, 18);
assert.equal(corpus.translit[nextFirst], 'E');
assert.equal(nextCenter, 3);
assert.equal(corpus.translit[nextCenter], 'O');
assert.equal(nextSecond, 23);
assert.equal(corpus.translit[nextSecond], 'D');

const candidates = triples.filter(node =>
  node.raw[0] === nextFirst &&
  node.raw[1] === nextCenter &&
  node.raw[2] === nextSecond
);
assert.equal(candidates.length, 1);
const nextKeyNode = candidates[0];

assert.deepEqual(nodeRunes(nextKeyNode), ['E', 'O', 'D']);
assert.deepEqual(nextKeyNode.first, [6, 10]);
assert.deepEqual(nextKeyNode.center, [13, 17]);
assert.deepEqual(nextKeyNode.second, [20, 24]);
assert.equal(nextKeyNode.radius, 7);
assert.deepEqual(nextKeyNode.axis, [1, 1]);

// Use the ordered non-mirror axis and previous-state scalar r+phi(r).
const startDistance = r + phi(r);
assert.equal(startDistance, 5);

const nextStart = [
  currentStart[0] + nextKeyNode.axis[0] * startDistance,
  currentStart[1] + nextKeyNode.axis[1] * startDistance,
];
assert.deepEqual(nextStart, [14, 24]);
assert.equal(corpus.translit[at(nextStart)], 'TH');

// Perpendicular to [1,1], preserving previous negative column sign.
const nextReadDirection = [1, -1];
assert.equal(Math.sign(nextReadDirection[1]), Math.sign(currentReadDirection[1]));

// Continue until a post-start cell has at least one outer-role mirror incidence.
// The first intermediate N is center-only; C is the first outer-role return.
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
  const incidences = touchingMirrors(cell);
  const outerCount = incidences.filter(node => isOuter(node, cell)).length;
  const centerCount = incidences.filter(node => same(node.center, cell)).length;

  stopCensus.push({
    cell: [...cell],
    rune: corpus.translit[at(cell)],
    incidenceCount: incidences.length,
    centerCount,
    outerCount,
  });
  ciphertextCells.push([...cell]);

  if (outerCount > 0) break;
}

assert.deepEqual(ciphertextCells, [[14, 24], [15, 23], [16, 22]]);
assert.deepEqual(stopCensus, [
  {
    cell: [15, 23],
    rune: 'N',
    incidenceCount: 4,
    centerCount: 4,
    outerCount: 0,
  },
  {
    cell: [16, 22],
    rune: 'C',
    incidenceCount: 3,
    centerCount: 1,
    outerCount: 2,
  },
]);

const key = deriveDirectNonMirrorKey(nextKeyNode);
assert.deepEqual(key.map(value => corpus.translit[value]), ['O', 'D', 'E']);

const ciphertext = ciphertextCells.map(at);
const plaintext = ciphertext.map((value, index) =>
  mod(value - key[index % key.length])
);

assert.deepEqual(
  plaintext.map(value => corpus.translit[value]),
  ['EA', 'S', 'T']
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
    ciphertextCells: [currentStart, currentEndpoint],
    readDirection: currentReadDirection,
  },
  nextKeySelection: {
    raw: [nextFirst, nextCenter, nextSecond],
    runes: [nextFirst, nextCenter, nextSecond].map(
      value => corpus.translit[value]
    ),
    orderedStraightTripleMatches: candidates.length,
    selectedCoordinates: {
      first: nextKeyNode.first,
      center: nextKeyNode.center,
      second: nextKeyNode.second,
      radius: nextKeyNode.radius,
      axis: nextKeyNode.axis,
    },
    directAlignedKey: key.map(value => corpus.translit[value]),
  },
  nextCiphertextSelection: {
    startDistance,
    start: nextStart,
    startRune: corpus.translit[at(nextStart)],
    readDirection: nextReadDirection,
    stopCensus,
    cells: ciphertextCells,
  },
  decryptedOnlyAfterSelection: plaintext.map(value => corpus.translit[value]),
  decision:
    'The preceding THE state source-generates the unique ordered E-O-D node, fixes TH(14,24), and determines a three-cell down-left block by incidence-role stopping; the direct non-mirror key O-D-E then yields EA,S,T. This is a stronger finite source selection than the fitted coordinate reports.',
}, null, 2));
