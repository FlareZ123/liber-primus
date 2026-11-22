'use strict';

/**
 * SFT: source-state continuation from post-GO T-O to the next non-mirror
 * two-rune block on the original p0-p2 27x27 grid.
 *
 * Frozen current state:
 * - key source D-N-D, radius 6
 * - ciphertext OE(12,23) -> Y(12,22), read left
 *
 * Source selection before plaintext inspection:
 * 1. Half the current key radius: h=3.
 * 2. Move from endpoint Y by h cells up-left along the reverse D-N-D axis
 *    -> T(9,19).
 * 3. Build ordered raw non-mirror values entirely from current source state:
 *      first = OE22 - phi(6)=2 -> L20
 *      center = Y26 - 2*6 -> X14
 *      second = N9 + 6 -> S15
 *    Ordered L-X-S occurs twice as an equally spaced straight triple.
 * 4. Select the occurrence whose geometric radius equals h=3. This uniquely
 *    chooses vertical L(11,4)-X(14,4)-S(17,4).
 * 5. Preserve the current horizontal leftward read from T(9,19).
 * 6. Stop at the first post-start cell that is a mirror center -> R(9,18).
 *
 * This selected node is non-mirror; its direct raw indices are rotated by its
 * Möbius phase, matching the already proposed non-mirror handling.
 *
 * Run:
 *   node sims/lp2_p0_to23_the24_source_state_sft.cjs
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
        const triple = { center, first, second, radius, axis, raw };
        triples.push(triple);

        if (raw[0] === raw[2] && raw[1] !== 0) mirrors.push(triple);
      }
    }
  }
}

assert.equal(mirrors.length, 479);

/** @param {number[]} cell @returns {object[]} */
function centeredMirrors(cell) {
  return mirrors.filter(node => same(cell, node.center));
}

/** @param {{raw:number[]}} node @returns {string[]} */
function nodeRunes(node) {
  return node.raw.map(value => corpus.translit[value]);
}

/**
 * Direct non-mirror key: no center totient. Rotate raw triple left by
 * sum(mu(phi(value))) mod 3.
 *
 * @param {{raw:number[]}} node
 * @returns {number[]}
 */
function deriveDirectNonMirrorKey(node) {
  const phase = mod(
    node.raw.reduce((sum, value) => sum + mu(phi(value)), 0)
  ) % 3;

  return node.raw.slice(phase).concat(node.raw.slice(0, phase));
}

// Frozen current state.
const currentKeyCandidates = mirrors.filter(node =>
  nodeRunes(node).join('-') === 'D-N-D' &&
  same(node.center, [17, 17])
);
assert.equal(currentKeyCandidates.length, 1);
const currentKeyNode = currentKeyCandidates[0];
assert.equal(currentKeyNode.radius, 6);
assert.deepEqual(currentKeyNode.axis, [1, 1]);

const currentStart = [12, 23];
const currentEndpoint = [12, 22];
const currentReadDirection = [0, -1];

assert.equal(corpus.translit[at(currentStart)], 'OE');
assert.equal(corpus.translit[at(currentEndpoint)], 'Y');

// Half-radius source scalar.
assert.equal(currentKeyNode.radius % 2, 0);
const halfRadius = currentKeyNode.radius / 2;
assert.equal(halfRadius, 3);

// Move from current endpoint up-left along reverse key axis by half-radius.
const reverseKeyAxis = [
  -currentKeyNode.axis[0],
  -currentKeyNode.axis[1],
];
assert.deepEqual(reverseKeyAxis, [-1, -1]);

const nextStart = [
  currentEndpoint[0] + reverseKeyAxis[0] * halfRadius,
  currentEndpoint[1] + reverseKeyAxis[1] * halfRadius,
];
assert.deepEqual(nextStart, [9, 19]);
assert.equal(corpus.translit[at(nextStart)], 'T');

// Source-derived ordered raw non-mirror values.
const rawFirst = at(currentStart) - phi(currentKeyNode.radius);
const rawCenter = at(currentEndpoint) - 2 * currentKeyNode.radius;
const rawSecond = currentKeyNode.raw[1] + currentKeyNode.radius;

assert.equal(rawFirst, 20);
assert.equal(corpus.translit[rawFirst], 'L');
assert.equal(rawCenter, 14);
assert.equal(corpus.translit[rawCenter], 'X');
assert.equal(rawSecond, 15);
assert.equal(corpus.translit[rawSecond], 'S');

const rawTriples = triples.filter(node =>
  node.raw[0] === rawFirst &&
  node.raw[1] === rawCenter &&
  node.raw[2] === rawSecond
);
assert.equal(rawTriples.length, 2);
assert.deepEqual(
  rawTriples.map(node => ({
    center: node.center,
    radius: node.radius,
    axis: node.axis,
  })),
  [
    { center: [14, 4], radius: 3, axis: [1, 0] },
    { center: [19, 19], radius: 1, axis: [0, 1] },
  ]
);

// Same half-radius scalar selects exactly one placement.
const selectedTriples = rawTriples.filter(node =>
  node.radius === halfRadius
);
assert.equal(selectedTriples.length, 1);
const nextKeyNode = selectedTriples[0];

assert.deepEqual(nodeRunes(nextKeyNode), ['L', 'X', 'S']);
assert.deepEqual(nextKeyNode.first, [11, 4]);
assert.deepEqual(nextKeyNode.center, [14, 4]);
assert.deepEqual(nextKeyNode.second, [17, 4]);
assert.equal(nextKeyNode.radius, 3);
assert.deepEqual(nextKeyNode.axis, [1, 0]);
assert.notEqual(nextKeyNode.raw[0], nextKeyNode.raw[2]);

// Preserve current horizontal leftward read.
const nextReadDirection = [...currentReadDirection];
assert.deepEqual(nextReadDirection, [0, -1]);

// Stop at first subsequent mirror-center cell.
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
  const centered = centeredMirrors(cell);
  stopCensus.push({
    cell: [...cell],
    rune: corpus.translit[at(cell)],
    centeredCount: centered.length,
  });
  ciphertextCells.push([...cell]);

  if (centered.length > 0) break;
}

assert.deepEqual(ciphertextCells, [[9, 19], [9, 18]]);
assert.deepEqual(stopCensus, [
  { cell: [9, 18], rune: 'R', centeredCount: 3 },
]);

// Direct non-mirror key handling.
const key = deriveDirectNonMirrorKey(nextKeyNode);
assert.deepEqual(key.map(value => corpus.translit[value]), ['X', 'S', 'L']);

const ciphertext = ciphertextCells.map(at);
const plaintext = ciphertext.map((value, index) =>
  mod(value - key[index % key.length])
);

assert.deepEqual(
  plaintext.map(value => corpus.translit[value]),
  ['TH', 'E']
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
    keyRadius: currentKeyNode.radius,
    ciphertextCells: [currentStart, currentEndpoint],
    readDirection: currentReadDirection,
  },
  nextStartSelection: {
    halfRadius,
    reverseKeyAxis,
    start: nextStart,
    startRune: corpus.translit[at(nextStart)],
  },
  nextKeySelection: {
    raw: [rawFirst, rawCenter, rawSecond],
    rawRunes: [rawFirst, rawCenter, rawSecond].map(
      value => corpus.translit[value]
    ),
    orderedStraightTripleMatches: rawTriples.length,
    candidateGeometry: rawTriples.map(node => ({
      first: node.first,
      center: node.center,
      second: node.second,
      radius: node.radius,
      axis: node.axis,
    })),
    radiusSelector: halfRadius,
    selectedNode: nodeRunes(nextKeyNode),
    selectedCoordinates: {
      first: nextKeyNode.first,
      center: nextKeyNode.center,
      second: nextKeyNode.second,
      radius: nextKeyNode.radius,
    },
    directAlignedKey: key.map(value => corpus.translit[value]),
  },
  nextCiphertextSelection: {
    readDirection: nextReadDirection,
    stopCensus,
    cells: ciphertextCells,
  },
  decryptedOnlyAfterSelection: plaintext.map(value => corpus.translit[value]),
  decision:
    'The preceding T-O source state fixes T(9,19), source-generates ordered L-X-S, selects its radius-3 placement, and stops at R(9,18) before decryption; the direct non-mirror key X-S-L yields TH,E. The route remains conditional on the evolving source grammar.',
}, null, 2));
