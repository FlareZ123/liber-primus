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
const same = (a, b) => a[0] === b[0] && a[1] === b[1];
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

const axes = [[1, 0], [0, 1], [1, 1], [1, -1]];
const triples = [];
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
        const raw = [at(first), at(center), at(second)];
        const node = { first, center, second, axis, radius, raw };
        triples.push(node);
        if (raw[0] === raw[2] && raw[1] !== 0) mirrors.push(node);
      }
    }
  }
}

assert.equal(mirrors.length, 479);

const isOuter = (node, cell) =>
  same(node.first, cell) || same(node.second, cell);
const touchingMirrors = cell => mirrors.filter(node =>
  same(node.center, cell) || isOuter(node, cell)
);
const runes = values => values.map(value => T[value]);

/** @param {{raw:number[]}} node @returns {number[]} */
function deriveCenterPhiKey(node) {
  const derived = [node.raw[0], phi(node.raw[1]), node.raw[2]];
  const phase = mod(
    derived.reduce((sum, value) => sum + mu(phi(value)), 0)
  ) % 3;
  return derived.slice(phase).concat(derived.slice(0, phase));
}

// Frozen OF state.
const current = {
  node: {
    raw: [8, 16, 8],
    center: [19, 26],
    radius: 1,
    axis: [1, -1],
  },
  start: [6, 12],
  endpoint: [7, 13],
  readDirection: [1, 1],
};

assert.deepEqual(runes(current.node.raw), ['H', 'T', 'H']);
assert.equal(T[at(current.start)], 'J');
assert.equal(T[at(current.endpoint)], 'H');

// Source-generate the next ordered raw triple.
const nextRaw = [
  at(current.start),
  current.node.raw[0] - 2 * current.node.radius,
  current.node.radius,
];

assert.deepEqual(runes(nextRaw), ['J', 'G', 'U']);

const keyCandidates = triples.filter(node =>
  node.raw[0] === nextRaw[0] &&
  node.raw[1] === nextRaw[1] &&
  node.raw[2] === nextRaw[2]
);

assert.equal(keyCandidates.length, 1);
const nextNode = keyCandidates[0];

assert.deepEqual(nextNode.first, [23, 1]);
assert.deepEqual(nextNode.center, [24, 1]);
assert.deepEqual(nextNode.second, [25, 1]);
assert.deepEqual(nextNode.axis, [1, 0]);
assert.equal(nextNode.radius, 1);

// Cross the current key's lower-outer row with the current ciphertext start
// column. Since current radius is one, this is center row + radius.
const nextStart = [
  current.node.center[0] + current.node.radius,
  current.start[1],
];

assert.deepEqual(nextStart, [20, 12]);
assert.equal(T[at(nextStart)], 'P');

// The two current diagonals differ only in column sign.
// Their vector difference selects the new horizontal direction.
const nextReadDirection = [
  Math.sign(current.readDirection[0] - current.node.axis[0]),
  Math.sign(current.readDirection[1] - current.node.axis[1]),
];

assert.deepEqual(nextReadDirection, [0, 1]);

// Reuse the outer-role stop grammar from the preceding EAST transition:
// after leaving the start, stop at the first cell that participates as an
// outer of any equal-outer mirror.
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
    rune: T[at(cell)],
    centerCount,
    outerCount,
  });
  ciphertextCells.push([...cell]);

  if (outerCount > 0) break;
}

assert.deepEqual(stopCensus, [
  {
    cell: [20, 13],
    rune: 'L',
    centerCount: 0,
    outerCount: 2,
  },
]);
assert.deepEqual(ciphertextCells, [[20, 12], [20, 13]]);

const key = deriveCenterPhiKey(nextNode);
assert.deepEqual(runes(key), ['J', 'TH', 'U']);

const ciphertext = ciphertextCells.map(at);
const plaintext = ciphertext.map(
  (value, index) => mod(value - key[index % key.length])
);

assert.deepEqual(runes(ciphertext), ['P', 'L']);
assert.deepEqual(runes(plaintext), ['TH', 'E']);
assert.deepEqual(
  plaintext.map((value, index) => mod(value + key[index % key.length])),
  ciphertext
);

console.log(JSON.stringify({
  status: 'PASS',
  frozenCurrentState: {
    source: runes(current.node.raw),
    center: current.node.center,
    radius: current.node.radius,
    axis: current.node.axis,
    ciphertext: [current.start, current.endpoint],
    readDirection: current.readDirection,
  },
  nextKeySelection: {
    formula: '[current-start-rune, current-outer-2r, r]',
    raw: nextRaw,
    runes: runes(nextRaw),
    globalStraightTripleMatches: keyCandidates.length,
    selected: {
      first: nextNode.first,
      center: nextNode.center,
      second: nextNode.second,
      axis: nextNode.axis,
      radius: nextNode.radius,
    },
    alignedKey: runes(key),
  },
  nextCiphertextSelection: {
    startFormula: '[current key center row + r, current ciphertext start col]',
    start: nextStart,
    startRune: T[at(nextStart)],
    directionFormula: 'sign(current ciphertext direction - current key axis)',
    readDirection: nextReadDirection,
    stopRule: 'first subsequent outer-role mirror incidence',
    stopCensus,
    cells: ciphertextCells,
    ciphertextRunes: runes(ciphertext),
  },
  decryptedOnlyAfterSelection: runes(plaintext),
  decision:
    'The OF source state generates a globally unique J-G-U node, fixes P(20,12), and reuses the prior outer-role delimiter to stop at L(20,13). Center-totient key J-TH-U then yields TH,E.',
  caveat:
    'The value and coordinate formulas remain conditional candidates because the public route was available when they were recognized.',
}, null, 2));
