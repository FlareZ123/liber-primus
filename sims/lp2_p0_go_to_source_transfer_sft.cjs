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

/** @param {[number, number]} cell @returns {number} */
function at(cell) {
  return grid[(cell[0] - 1) * 27 + cell[1] - 1];
}

/** @param {[number, number]} cell @returns {boolean} */
function inBounds(cell) {
  return cell[0] >= 1 && cell[0] <= 27 && cell[1] >= 1 && cell[1] <= 27;
}

/** @param {number} value @returns {number} */
function mod(value) {
  return ((value % 29) + 29) % 29;
}

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

/**
 * @param {[number, number]} center
 * @param {[number, number]} axis
 * @param {number} radius
 * @returns {null | {
 *   center:[number,number],
 *   axis:[number,number],
 *   radius:number,
 *   first:[number,number],
 *   second:[number,number],
 *   raw:number[],
 *   derived:number[],
 *   signature:number[],
 *   phase:number,
 *   key:number[],
 *   equalOuter:boolean
 * }}
 */
function makeNode(center, axis, radius) {
  const first = [
    center[0] - axis[0] * radius,
    center[1] - axis[1] * radius,
  ];
  const second = [
    center[0] + axis[0] * radius,
    center[1] + axis[1] * radius,
  ];

  if (!inBounds(first) || !inBounds(second)) return null;

  const raw = [at(first), at(center), at(second)];
  const derived = [raw[0], phi(raw[1]), raw[2]];
  const signature = derived.map(value => mu(phi(value)));
  const phase = mod(signature.reduce((sum, value) => sum + value, 0)) % 3;
  const key = derived.slice(phase).concat(derived.slice(0, phase));

  return {
    center,
    axis,
    radius,
    first,
    second,
    raw,
    derived,
    signature,
    phase,
    key,
    equalOuter: raw[0] === raw[2] && raw[1] !== 0,
  };
}

/** @param {number[]} values @returns {string[]} */
function runes(values) {
  return values.map(value => T[value]);
}

/** @param {[number,number]} first @param {[number,number]} second @returns {number} */
function chebyshev(first, second) {
  return Math.max(
    Math.abs(first[0] - second[0]),
    Math.abs(first[1] - second[1])
  );
}

const axes = [[1, 0], [0, 1], [1, 1], [1, -1]];

// Frozen block-22 GO source state, already source-selected upstream.
const current = {
  keyCenter: [12, 14],
  keyRadius: 7,
  start: [9, 20],
  endpoint: [9, 21],
  ciphertextLength: 2,
};

assert.equal(T[at(current.start)], 'H');
assert.equal(T[at(current.endpoint)], 'C');

// Reuse the earlier half/full placement family with source-derived scales.
// The row scale comes from twice phi(current key-center row).
// The next radius has two independent source derivations:
// phi(current key-center column) == phi(current key radius) == 6.
const placementScale = 2 * phi(current.keyCenter[0]);
const nextRadiusFromColumn = phi(current.keyCenter[1]);
const nextRadiusFromRadius = phi(current.keyRadius);

assert.equal(placementScale, 8);
assert.equal(nextRadiusFromColumn, 6);
assert.equal(nextRadiusFromRadius, 6);
assert.equal(nextRadiusFromColumn, nextRadiusFromRadius);

const nextRadius = nextRadiusFromColumn;
const keyCandidates = [];

for (const shape of ['row-full', 'column-full']) {
  for (const rowSign of [-1, 1]) {
    for (const columnSign of [-1, 1]) {
      const center = shape === 'row-full'
        ? [
            current.endpoint[0] + rowSign * placementScale,
            current.endpoint[1] + columnSign * placementScale / 2,
          ]
        : [
            current.endpoint[0] + rowSign * placementScale / 2,
            current.endpoint[1] + columnSign * placementScale,
          ];

      if (!inBounds(center)) continue;

      for (const axis of axes) {
        const node = makeNode(center, axis, nextRadius);
        if (node) keyCandidates.push({shape, rowSign, columnSign, node});
      }
    }
  }
}

assert.equal(keyCandidates.length, 11);

const mirrorCandidates = keyCandidates.filter(candidate => candidate.node.equalOuter);
assert.equal(mirrorCandidates.length, 1);

const selected = mirrorCandidates[0];
assert.equal(selected.shape, 'row-full');
assert.equal(selected.rowSign, 1);
assert.equal(selected.columnSign, -1);
assert.deepEqual(selected.node.center, [17, 17]);
assert.deepEqual(selected.node.axis, [1, 1]);
assert.deepEqual(selected.node.first, [11, 11]);
assert.deepEqual(selected.node.second, [23, 23]);
assert.deepEqual(runes(selected.node.raw), ['D', 'N', 'D']);
assert.deepEqual(runes(selected.node.derived), ['D', 'G', 'D']);
assert.deepEqual(selected.node.signature, [1, -1, 1]);
assert.equal(selected.node.phase, 1);
assert.deepEqual(runes(selected.node.key), ['G', 'D', 'D']);

// The source-selected mirror also matches the already-frozen GO forecast:
// phase 1, (+1,-1,+1), odd/odd center.
assert.equal(selected.node.center[0] % 2, 1);
assert.equal(selected.node.center[1] % 2, 1);

// Select the next ciphertext start without inspecting plaintext.
// Half of the new radius is 3. Exhaust all eight radius/2 moves from the
// current GO start and require the new start to be exactly one new-radius
// Chebyshev step from the selected key center.
assert.equal(nextRadius % 2, 0);
const startStep = nextRadius / 2;
const directions = [];

for (let row = -1; row <= 1; row += 1) {
  for (let column = -1; column <= 1; column += 1) {
    if (row !== 0 || column !== 0) directions.push([row, column]);
  }
}

const startCandidates = directions
  .map(direction => ({
    direction,
    start: [
      current.start[0] + direction[0] * startStep,
      current.start[1] + direction[1] * startStep,
    ],
  }))
  .filter(candidate => inBounds(candidate.start))
  .map(candidate => ({
    ...candidate,
    centerDistance: chebyshev(candidate.start, selected.node.center),
  }));

assert.equal(startCandidates.length, 8);

const startSurvivors = startCandidates.filter(
  candidate => candidate.centerDistance === nextRadius
);
assert.equal(startSurvivors.length, 1);

const nextStart = startSurvivors[0].start;
assert.deepEqual(startSurvivors[0].direction, [1, 1]);
assert.deepEqual(nextStart, [12, 23]);
assert.equal(T[at(nextStart)], 'OE');

// Carry the current two-rune length. The already-frozen GO forecast fixes a
// horizontal axis with END as leftmost, hence a leftward read.
const readDirection = [0, -1];
const ciphertextCells = [];

for (let index = 0; index < current.ciphertextLength; index += 1) {
  const cell = [
    nextStart[0] + readDirection[0] * index,
    nextStart[1] + readDirection[1] * index,
  ];
  assert.ok(inBounds(cell));
  ciphertextCells.push(cell);
}

assert.deepEqual(ciphertextCells, [[12, 23], [12, 22]]);
assert.deepEqual(ciphertextCells.map(cell => T[at(cell)]), ['OE', 'Y']);

// Only now decrypt.
const plaintext = ciphertextCells.map(
  (cell, index) => mod(at(cell) - selected.node.key[index % 3])
);

assert.deepEqual(runes(plaintext), ['T', 'O']);
assert.deepEqual(
  plaintext.map((value, index) => mod(value + selected.node.key[index % 3])),
  ciphertextCells.map(at)
);

console.log(JSON.stringify({
  status: 'PASS',
  frozenCurrentState: {
    word: 'GO',
    keyCenter: current.keyCenter,
    keyRadius: current.keyRadius,
    ciphertext: current.start + ' -> ' + current.endpoint,
    ciphertextRunes: [current.start, current.endpoint].map(cell => T[at(cell)]),
  },
  sourceScales: {
    placementScale: {
      formula: '2*phi(current key-center row)',
      value: placementScale,
    },
    nextRadius: {
      fromKeyCenterColumn: nextRadiusFromColumn,
      fromCurrentRadius: nextRadiusFromRadius,
    },
  },
  keySelection: {
    inBoundsGeometries: keyCandidates.length,
    equalOuterSurvivors: mirrorCandidates.length,
    selected: {
      center: selected.node.center,
      axis: selected.node.axis,
      radius: selected.node.radius,
      node: runes(selected.node.raw),
      derived: runes(selected.node.derived),
      signature: selected.node.signature,
      phase: selected.node.phase,
      alignedKey: runes(selected.node.key),
    },
  },
  ciphertextSelection: {
    radiusHalfMoves: startCandidates.length,
    distanceSurvivors: startSurvivors.length,
    start: nextStart,
    startRune: T[at(nextStart)],
    readDirection,
    cells: ciphertextCells,
    ciphertextRunes: ciphertextCells.map(cell => T[at(cell)]),
  },
  decryptedOnlyAfterSelection: runes(plaintext),
  decision:
    'The frozen GO state selects one D-N-D mirror from 11 in-bounds half/full geometries and one ciphertext start from eight radius/2 moves. Carrying the two-rune length and frozen leftward forecast decrypts OE,Y with G,D,D to T,O.',
  caveat:
    'The half/full/totient transfer remains a conditional mechanism candidate until its placement formulas are independently authenticated by an original clue or another prospective transition.',
}, null, 2));
