'use strict';

/**
 * SFT: source-state geometry for the seven-rune block after the second TH-E.
 *
 * This test freezes node and ciphertext selection before key-operation choice.
 * It deliberately records an unresolved direct-vs-center-phi ambiguity.
 *
 * Frozen current state:
 * - raw J-G-U radius1 vertical, selected with center-phi for prior TH-E
 * - ciphertext P(20,12) -> L(20,13), read right
 *
 * Source geometry:
 * 1. With r=1, build ordered raw values
 *      [P-r, P+r, J-r] = [12,14,10] = EO-X-I.
 *    Two straight EO-X-I placements exist; radius=r selects the vertical one
 *    centered X(16,9).
 * 2. Move from prior start P one step opposite both the new key axis and prior
 *    read direction -> R(19,11).
 * 3. Read along (-keyAxis + priorRead) = up-right.
 * 4. Length is prior raw center G=6 plus selected radius1 = 7 cells.
 *
 * Operation gate:
 * - direct EO-X-I has phase1; center-phi EO-G-I has phase2. The prior phase0
 *   does not select either, so one-block phase preservation fails here.
 * - Use each candidate aligned key to prospectively generate the next raw
 *   source from the frozen endpoint O=3:
 *     [k0+phi(O), k1+k2, k1+k2+O].
 * - Direct predicts T-OE-AE. At radius O=3 there are two placements, and
 *   exactly one is physically linked to the frozen seven-cell ciphertext at
 *   AE(17,13).
 * - Center-phi predicts EO-E-NG, which does not occur anywhere as an equally
 *   spaced straight triple.
 * This next-source existence/link gate selects direct before plaintext scoring.
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
const same = (a, b) => a[0] === b[0] && a[1] === b[1];
const inBounds = cell =>
  cell[0] >= 1 && cell[0] <= 27 && cell[1] >= 1 && cell[1] <= 27;
const mod29 = value => ((value % 29) + 29) % 29;
const mod3 = value => ((value % 3) + 3) % 3;

/** @param {number} n @returns {number} */
function phi(n) {
  let result = n;
  let x = n;
  for (let p = 2; p * p <= x; p += 1) {
    if (x % p !== 0) continue;
    result -= result / p;
    while (x % p === 0) x /= p;
  }
  if (x > 1) result -= result / x;
  return result;
}

/** @param {number} n @returns {number} */
function mu(n) {
  let sign = 1;
  let x = n;
  for (let p = 2; p * p <= x; p += 1) {
    if (x % p !== 0) continue;
    x /= p;
    sign = -sign;
    if (x % p === 0) return 0;
    while (x % p === 0) x /= p;
  }
  return x > 1 ? -sign : sign;
}

/** @param {number[]} key @returns {number} */
function phase(key) {
  return mod3(key.reduce((sum, value) => sum + mu(phi(value)), 0));
}

/** @param {number[]} key @returns {number[]} */
function align(key) {
  const p = phase(key);
  return key.slice(p).concat(key.slice(0, p));
}

/** @param {{raw:number[]}} node @returns {string[]} */
function nodeRunes(node) {
  return node.raw.map(value => corpus.translit[value]);
}

const axes = [[1, 0], [0, 1], [1, 1], [1, -1]];
const triples = [];

for (let row = 1; row <= 27; row += 1) {
  for (let col = 1; col <= 27; col += 1) {
    for (const axis of axes) {
      for (let radius = 1; radius <= 13; radius += 1) {
        const first = [row - axis[0] * radius, col - axis[1] * radius];
        const second = [row + axis[0] * radius, col + axis[1] * radius];
        if (!inBounds(first) || !inBounds(second)) break;
        triples.push({
          first,
          center: [row, col],
          second,
          radius,
          axis,
          raw: [at(first), at([row, col]), at(second)],
        });
      }
    }
  }
}

// Frozen preceding state.
const priorNode = triples.find(node =>
  nodeRunes(node).join('-') === 'J-G-U' &&
  same(node.center, [24, 1]) &&
  node.radius === 1
);
assert.ok(priorNode);
const priorRawCenter = priorNode.raw[1];
assert.equal(priorRawCenter, 6);

const priorStart = [20, 12];
const priorEndpoint = [20, 13];
const priorRead = [0, 1];
assert.equal(corpus.translit[at(priorStart)], 'P');
assert.equal(corpus.translit[at(priorEndpoint)], 'L');

const priorTransformedKey = [
  priorNode.raw[0],
  phi(priorNode.raw[1]),
  priorNode.raw[2],
];
const priorPhase = phase(priorTransformedKey);
assert.equal(priorPhase, 0);

const r = priorNode.radius;
assert.equal(r, 1);

// Raw next-node values.
const rawFirst = at(priorStart) - r;
const rawCenter = at(priorStart) + r;
const rawSecond = priorNode.raw[0] - r;

assert.equal(rawFirst, 12);
assert.equal(corpus.translit[rawFirst], 'EO');
assert.equal(rawCenter, 14);
assert.equal(corpus.translit[rawCenter], 'X');
assert.equal(rawSecond, 10);
assert.equal(corpus.translit[rawSecond], 'I');

const candidates = triples.filter(node =>
  node.raw[0] === rawFirst &&
  node.raw[1] === rawCenter &&
  node.raw[2] === rawSecond
);
assert.equal(candidates.length, 2);
assert.deepEqual(
  candidates.map(node => ({
    center: node.center,
    radius: node.radius,
    axis: node.axis,
  })),
  [
    { center: [15, 13], radius: 11, axis: [1, -1] },
    { center: [16, 9], radius: 1, axis: [1, 0] },
  ]
);

const radiusMatches = candidates.filter(node => node.radius === r);
assert.equal(radiusMatches.length, 1);
const nextNode = radiusMatches[0];

assert.deepEqual(nodeRunes(nextNode), ['EO', 'X', 'I']);
assert.deepEqual(nextNode.first, [15, 9]);
assert.deepEqual(nextNode.center, [16, 9]);
assert.deepEqual(nextNode.second, [17, 9]);
assert.equal(nextNode.radius, 1);
assert.deepEqual(nextNode.axis, [1, 0]);

// Start is one step opposite both vertical key axis and prior rightward read.
const startShift = [
  -nextNode.axis[0] * r,
  -priorRead[1] * r,
];
assert.deepEqual(startShift, [-1, -1]);

const nextStart = [
  priorStart[0] + startShift[0],
  priorStart[1] + startShift[1],
];
assert.deepEqual(nextStart, [19, 11]);
assert.equal(corpus.translit[at(nextStart)], 'R');

// Read up-right, combining negative key-axis row with positive prior-read col.
const nextRead = [
  -nextNode.axis[0],
  priorRead[1],
];
assert.deepEqual(nextRead, [-1, 1]);

const length = priorRawCenter + nextNode.radius;
assert.equal(length, 7);

const ciphertextCells = Array.from({ length }, (_, index) => [
  nextStart[0] + nextRead[0] * index,
  nextStart[1] + nextRead[1] * index,
]);
assert.ok(ciphertextCells.every(inBounds));
assert.deepEqual(ciphertextCells, [
  [19, 11],
  [18, 12],
  [17, 13],
  [16, 14],
  [15, 15],
  [14, 16],
  [13, 17],
]);
assert.deepEqual(
  ciphertextCells.map(cell => corpus.translit[at(cell)]),
  ['R', 'C', 'AE', 'C', 'L', 'EO', 'O']
);

// Bounded operation candidates.
const directRaw = [...nextNode.raw];
const transformedRaw = [
  nextNode.raw[0],
  phi(nextNode.raw[1]),
  nextNode.raw[2],
];

const direct = {
  name: 'direct',
  raw: directRaw,
  phase: phase(directRaw),
  aligned: align(directRaw),
};
const transformed = {
  name: 'center-phi',
  raw: transformedRaw,
  phase: phase(transformedRaw),
  aligned: align(transformedRaw),
};

assert.equal(direct.phase, 1);
assert.equal(transformed.phase, 2);
assert.equal(priorPhase, 0);
assert.notEqual(direct.phase, priorPhase);
assert.notEqual(transformed.phase, priorPhase);

const ciphertext = ciphertextCells.map(at);

/** @param {number[]} key @returns {number[]} */
function decrypt(key) {
  return ciphertext.map((value, index) =>
    mod29(value - key[index % key.length])
  );
}

const directPlaintext = decrypt(direct.aligned);
const transformedPlaintext = decrypt(transformed.aligned);

// Prospective next-source gate. The endpoint is frozen O=3.
const endpointValue = at(ciphertextCells.at(-1));
assert.equal(endpointValue, 3);
assert.equal(corpus.translit[endpointValue], 'O');

/** @param {number[]} alignedKey @returns {number[]} */
function nextRawFromAlignedKey(alignedKey) {
  const center = mod29(alignedKey[1] + alignedKey[2]);
  return [
    mod29(alignedKey[0] + phi(endpointValue)),
    center,
    mod29(center + endpointValue),
  ];
}

/** @param {number[]} raw @returns {object[]} */
function straightMatches(raw) {
  return triples.filter(node =>
    node.raw[0] === raw[0] &&
    node.raw[1] === raw[1] &&
    node.raw[2] === raw[2]
  );
}

const directNextRaw = nextRawFromAlignedKey(direct.aligned);
const transformedNextRaw = nextRawFromAlignedKey(transformed.aligned);

assert.deepEqual(
  directNextRaw.map(value => corpus.translit[value]),
  ['T', 'OE', 'AE']
);
assert.deepEqual(
  transformedNextRaw.map(value => corpus.translit[value]),
  ['EO', 'E', 'NG']
);

const directNextMatches = straightMatches(directNextRaw);
const transformedNextMatches = straightMatches(transformedNextRaw);
assert.equal(directNextMatches.length, 3);
assert.equal(transformedNextMatches.length, 0);

const directRadiusMatches = directNextMatches.filter(
  node => node.radius === endpointValue
);
assert.equal(directRadiusMatches.length, 2);

const directLinkedRadiusMatches = directRadiusMatches.filter(node =>
  ciphertextCells.some(cell =>
    same(cell, node.first) ||
    same(cell, node.center) ||
    same(cell, node.second)
  )
);
assert.equal(directLinkedRadiusMatches.length, 1);

const nextSource = directLinkedRadiusMatches[0];
assert.deepEqual(nodeRunes(nextSource), ['T', 'OE', 'AE']);
assert.deepEqual(nextSource.first, [11, 13]);
assert.deepEqual(nextSource.center, [14, 13]);
assert.deepEqual(nextSource.second, [17, 13]);
assert.equal(nextSource.radius, 3);
assert.deepEqual(nextSource.axis, [1, 0]);
assert.ok(ciphertextCells.some(cell => same(cell, nextSource.second)));

assert.deepEqual(
  direct.aligned.map(value => corpus.translit[value]),
  ['X', 'I', 'EO']
);
assert.deepEqual(
  directPlaintext.map(value => corpus.translit[value]),
  ['M', 'A', 'P', 'L', 'I', 'F', 'E']
);
assert.deepEqual(
  directPlaintext.map((value, index) =>
    mod29(value + direct.aligned[index % direct.aligned.length])
  ),
  ciphertext
);

console.log(JSON.stringify({
  status: 'PASS',
  source: 'original LP2 p0-p2 27x27 grid',
  frozenPriorState: {
    rawNode: nodeRunes(priorNode),
    selectedOperation: 'center-phi',
    phase: priorPhase,
    ciphertextCells: [priorStart, priorEndpoint],
    readDirection: priorRead,
  },
  sourceGeometry: {
    rawNextNode: [rawFirst, rawCenter, rawSecond].map(
      value => corpus.translit[value]
    ),
    straightTripleMatches: candidates.map(node => ({
      first: node.first,
      center: node.center,
      second: node.second,
      radius: node.radius,
      axis: node.axis,
    })),
    radiusSelector: r,
    selectedNode: nodeRunes(nextNode),
    startShift,
    start: nextStart,
    readDirection: nextRead,
    sourceLength: {
      priorRawCenter,
      selectedRadius: nextNode.radius,
      total: length,
    },
    ciphertextCells,
  },
  operationGate: {
    priorPhase,
    candidates: [
      {
        name: direct.name,
        raw: direct.raw.map(value => corpus.translit[value]),
        phase: direct.phase,
        aligned: direct.aligned.map(value => corpus.translit[value]),
        plaintextAfterGeometryFreeze: directPlaintext.map(
          value => corpus.translit[value]
        ),
      },
      {
        name: transformed.name,
        raw: transformed.raw.map(value => corpus.translit[value]),
        phase: transformed.phase,
        aligned: transformed.aligned.map(value => corpus.translit[value]),
        plaintextAfterGeometryFreeze: transformedPlaintext.map(
          value => corpus.translit[value]
        ),
      },
    ],
    phasePreservationTransfers: false,
    prospectiveNextSourceGate: {
      endpointValue,
      directPrediction: directNextRaw.map(value => corpus.translit[value]),
      directStraightMatches: directNextMatches.length,
      directRadiusMatches: directRadiusMatches.length,
      directLinkedRadiusMatches: directLinkedRadiusMatches.length,
      selectedNextSource: nodeRunes(nextSource),
      selectedNextSourceCoordinates: {
        first: nextSource.first,
        center: nextSource.center,
        second: nextSource.second,
        radius: nextSource.radius,
      },
      transformedPrediction: transformedNextRaw.map(
        value => corpus.translit[value]
      ),
      transformedStraightMatches: transformedNextMatches.length,
      selectedOperation: 'direct',
    },
  },
  decision:
    'The source state fixes EO-X-I, its radius-1 placement, and a seven-cell up-right ciphertext. The immediately following source provides an independent operation gate: direct predicts the uniquely linked radius-3 T-OE-AE node, while center-phi predicts a nonexistent EO-E-NG triple. Direct EO-X-I is therefore source-selected before plaintext scoring and decrypts the frozen seven cells to MAPLIFE. The earlier phase-preservation selector is explicitly rejected as non-transferable.',
}, null, 2));
