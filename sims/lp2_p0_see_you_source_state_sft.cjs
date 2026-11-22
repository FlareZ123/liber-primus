'use strict';

/**
 * SFT: source-state SEE -> YOU transition on the original p0-p2 27x27 square.
 *
 * Frozen input from the preceding source-selected SEE block:
 *   previous key mirror EA-J-EA, raw center J=11, derived center I=10
 *   SEE start X(25,16), endpoint B(27,14), read direction down-left
 *
 * Selection before plaintext inspection:
 * 1. At the bottom boundary, reverse the incoming tangential component and move
 *    phi^2(derived-center I=10)=2 cells along the edge -> P(27,16).
 * 2. P touches two mirrors. Select the one whose radius equals the previous raw
 *    key-center index J=11 -> unique P-R-P radius 11.
 * 3. Derive its normal key TH-P-P.
 * 4. Advance on the same edge by phi(new raw center R=4)=2 -> EA(27,18).
 * 5. Read diagonally from that start toward the known preceding block start
 *    X(25,16), stopping when that source-state cell is reached.
 * 6. Decrypt only after all cells are fixed.
 *
 * Run:
 *   node sims/lp2_p0_see_you_source_state_sft.cjs
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
const same = (first, second) => first[0] === second[0] && first[1] === second[1];
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
    same(cell, node.center) || same(cell, node.first) || same(cell, node.second)
  );
}

/** @param {{raw:number[]}} node @returns {number[]} */
function deriveKey(node) {
  const derived = [node.raw[0], phi(node.raw[1]), node.raw[2]];
  const rotation = mod(
    derived.reduce((sum, value) => sum + mu(phi(value)), 0)
  ) % 3;
  return derived.slice(rotation).concat(derived.slice(0, rotation));
}

// Frozen preceding state.
const seeKeyMirror = mirrors.find(node =>
  node.radius === 4 &&
  same(node.center, [25, 6]) &&
  same(node.first, [25, 2]) &&
  same(node.second, [25, 10])
);
assert.ok(seeKeyMirror);
assert.deepEqual(
  seeKeyMirror.raw.map(value => corpus.translit[value]),
  ['EA', 'J', 'EA']
);
const seeKey = deriveKey(seeKeyMirror);
assert.deepEqual(seeKey.map(value => corpus.translit[value]), ['EA', 'I', 'EA']);

const previousRawCenter = seeKeyMirror.raw[1];
const previousDerivedCenter = phi(previousRawCenter);
assert.equal(previousRawCenter, 11);
assert.equal(previousDerivedCenter, 10);

const seeStart = [25, 16];
const seeEndpoint = [27, 14];
const seeReadDirection = [1, -1];
assert.equal(corpus.translit[at(seeStart)], 'X');
assert.equal(corpus.translit[at(seeEndpoint)], 'B');
assert.equal(touching(seeEndpoint).length, 0);

// Bottom-edge bounce: reverse the incoming tangential component. The row
// component is blocked by the boundary, and the column component -1 becomes +1.
assert.equal(seeEndpoint[0], 27);
const edgeDirection = [0, -seeReadDirection[1]];
assert.deepEqual(edgeDirection, [0, 1]);

const firstDistance = phi(previousDerivedCenter);
assert.equal(firstDistance, 4);
const secondDistance = phi(firstDistance);
assert.equal(secondDistance, 2);

const anchor = [
  seeEndpoint[0] + edgeDirection[0] * secondDistance,
  seeEndpoint[1] + edgeDirection[1] * secondDistance,
];
assert.deepEqual(anchor, [27, 16]);
assert.equal(corpus.translit[at(anchor)], 'P');

// P has two source mirror incidences. The previous raw center index J=11
// selects the unique radius-11 mirror.
const anchorMirrors = touching(anchor).filter(node =>
  same(anchor, node.first) || same(anchor, node.second)
);
assert.equal(anchorMirrors.length, 2);
assert.deepEqual(
  anchorMirrors.map(node => ({
    runes: node.raw.map(value => corpus.translit[value]),
    radius: node.radius,
  })).sort((a, b) => a.radius - b.radius),
  [
    { runes: ['P', 'D', 'P'], radius: 4 },
    { runes: ['P', 'R', 'P'], radius: 11 },
  ]
);
const selectedMirrors = anchorMirrors.filter(node => node.radius === previousRawCenter);
assert.equal(selectedMirrors.length, 1);
const selected = selectedMirrors[0];
assert.deepEqual(
  selected.raw.map(value => corpus.translit[value]),
  ['P', 'R', 'P']
);
assert.equal(selected.radius, 11);

const key = deriveKey(selected);
assert.deepEqual(key.map(value => corpus.translit[value]), ['TH', 'P', 'P']);

// The transformed new raw center R=4 gives TH=2. Advance that many edge cells.
const nextDistance = phi(selected.raw[1]);
assert.equal(selected.raw[1], 4);
assert.equal(nextDistance, 2);
const start = [
  anchor[0] + edgeDirection[0] * nextDistance,
  anchor[1] + edgeDirection[1] * nextDistance,
];
assert.deepEqual(start, [27, 18]);
assert.equal(corpus.translit[at(start)], 'EA');

// The preceding SEE start is retained in source state. Read on the diagonal
// quadrant from the new start toward that cell and stop exactly on intersection.
const readDirection = signVector([
  seeStart[0] - start[0],
  seeStart[1] - start[1],
]);
assert.deepEqual(readDirection, [-1, -1]);

const ciphertextCells = [];
let reachedPreviousStart = false;
for (
  let cell = [...start];
  inBounds(cell);
  cell = [cell[0] + readDirection[0], cell[1] + readDirection[1]]
) {
  ciphertextCells.push([...cell]);
  if (same(cell, seeStart)) {
    reachedPreviousStart = true;
    break;
  }
}
assert.equal(reachedPreviousStart, true);
assert.deepEqual(ciphertextCells, [[27, 18], [26, 17], [25, 16]]);

const ciphertext = ciphertextCells.map(at);
const plaintext = ciphertext.map((value, index) =>
  mod(value - key[index % key.length])
);
assert.deepEqual(
  plaintext.map(value => corpus.translit[value]),
  ['Y', 'O', 'U']
);
assert.deepEqual(
  plaintext.map((value, index) => mod(value + key[index % key.length])),
  ciphertext
);

console.log(JSON.stringify({
  status: 'PASS',
  source: 'original LP2 p0-p2 27x27 grid',
  frozenSeeState: {
    keyNode: seeKeyMirror.raw.map(value => corpus.translit[value]),
    key: seeKey.map(value => corpus.translit[value]),
    rawCenter: previousRawCenter,
    derivedCenter: previousDerivedCenter,
    start: seeStart,
    endpoint: seeEndpoint,
    readDirection: seeReadDirection,
  },
  edgeBounce: {
    direction: edgeDirection,
    phi2DerivedCenterDistance: secondDistance,
    anchor,
    anchorRune: corpus.translit[at(anchor)],
    incidentMirrors: anchorMirrors.map(node => ({
      runes: node.raw.map(value => corpus.translit[value]),
      radius: node.radius,
    })),
    radiusSelector: previousRawCenter,
    selectedNode: selected.raw.map(value => corpus.translit[value]),
  },
  nextBlock: {
    key: key.map(value => corpus.translit[value]),
    newCenterTotientDistance: nextDistance,
    start,
    readDirection,
    stopCell: seeStart,
    ciphertextCells,
    plaintextInspectedAfterSelection: plaintext.map(value => corpus.translit[value]),
  },
  decision:
    'The frozen SEE state deterministically selects the P-R-P radius-11 key node and a three-cell source-state intersection that decrypts to YOU. The transition is still a post-hoc candidate until a later untouched state or source clue validates the edge-bounce and radius-carry semantics.',
}, null, 2));
