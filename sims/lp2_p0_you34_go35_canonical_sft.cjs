'use strict';

/**
 * SFT: canonical source-state YOU -> GO after rejecting the external row29 node.
 *
 * Frozen canonical YOU:
 * - source H-R-H radius5 horizontal at center(21,22)
 * - ciphertext EA(6,11),J(6,12),N(6,13), plaintext YOU
 *
 * Next key source:
 * - phi(raw center R4)=2
 * - outer = R4 + 2 = G6
 * - center = current radius5 - 2 = O3
 * -> G-O-G
 * G-O-G occurs exactly once in the canonical mirror graph:
 * center O(21,21), radius3 vertical.
 *
 * GO geometry:
 * - endpoint = selected source center minus [r,r] = N(18,18)
 * - step = r - phi(O3) = 1
 * - start = endpoint + [-step,+step] = EO(17,19)
 * - read down-left
 * - length = phi(O3)=2
 *
 * Standard mirror transform gives G-TH-G, phase2, aligned G-G-TH.
 * EO,N decrypt to G,O.
 *
 * Control: external reported source center(26,18), radius3 would place its
 * second outer at row29, outside the artifact, and is rejected.
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

/** @param {number[]} key @returns {number[]} */
function align(key) {
  const p = mod3(key.reduce((sum, value) => sum + mu(phi(value)), 0));
  return key.slice(p).concat(key.slice(0, p));
}

/** @param {{raw:number[]}} node @returns {string[]} */
function nodeRunes(node) {
  return node.raw.map(value => corpus.translit[value]);
}

const axes = [[1, 0], [0, 1], [1, 1], [1, -1]];
const mirrors = [];
for (let row = 1; row <= 27; row += 1) {
  for (let col = 1; col <= 27; col += 1) {
    for (const axis of axes) {
      for (let radius = 1; radius <= 13; radius += 1) {
        const first = [row - axis[0] * radius, col - axis[1] * radius];
        const second = [row + axis[0] * radius, col + axis[1] * radius];
        if (!inBounds(first) || !inBounds(second)) break;
        const center = [row, col];
        const raw = [at(first), at(center), at(second)];
        if (raw[0] === raw[2] && raw[1] !== 0) {
          mirrors.push({ first, center, second, radius, axis, raw });
        }
      }
    }
  }
}
assert.equal(mirrors.length, 479);

// Frozen canonical YOU source.
const youNode = mirrors.find(node =>
  nodeRunes(node).join('-') === 'H-R-H' &&
  same(node.center, [21, 22]) &&
  node.radius === 5
);
assert.ok(youNode);
const youCells = [[6, 11], [6, 12], [6, 13]];
assert.deepEqual(
  youCells.map(cell => corpus.translit[at(cell)]),
  ['EA', 'J', 'N']
);

// Source-generate G-O-G.
const centerPhi = phi(youNode.raw[1]);
assert.equal(centerPhi, 2);

const goOuter = youNode.raw[1] + centerPhi;
const goCenter = youNode.radius - centerPhi;
assert.equal(goOuter, 6);
assert.equal(corpus.translit[goOuter], 'G');
assert.equal(goCenter, 3);
assert.equal(corpus.translit[goCenter], 'O');

const goCandidates = mirrors.filter(node =>
  node.raw[0] === goOuter &&
  node.raw[1] === goCenter &&
  node.raw[2] === goOuter
);
assert.equal(goCandidates.length, 1);
const goNode = goCandidates[0];

assert.deepEqual(nodeRunes(goNode), ['G', 'O', 'G']);
assert.deepEqual(goNode.first, [18, 21]);
assert.deepEqual(goNode.center, [21, 21]);
assert.deepEqual(goNode.second, [24, 21]);
assert.equal(goNode.radius, 3);
assert.deepEqual(goNode.axis, [1, 0]);

// Canonical GO geometry.
const goEndpoint = [
  goNode.center[0] - goNode.radius,
  goNode.center[1] - goNode.radius,
];
assert.deepEqual(goEndpoint, [18, 18]);
assert.equal(corpus.translit[at(goEndpoint)], 'N');

const step = goNode.radius - phi(goNode.raw[1]);
assert.equal(step, 1);

const goStart = [goEndpoint[0] - step, goEndpoint[1] + step];
assert.deepEqual(goStart, [17, 19]);
assert.equal(corpus.translit[at(goStart)], 'EO');

const goRead = [1, -1];
const goLength = phi(goNode.raw[1]);
assert.equal(goLength, 2);

const goCells = Array.from({ length: goLength }, (_, index) => [
  goStart[0] + goRead[0] * index,
  goStart[1] + goRead[1] * index,
]);
assert.deepEqual(goCells, [[17, 19], [18, 18]]);
assert.deepEqual(
  goCells.map(cell => corpus.translit[at(cell)]),
  ['EO', 'N']
);

const goKey = align([
  goNode.raw[0],
  phi(goNode.raw[1]),
  goNode.raw[2],
]);
assert.deepEqual(
  goKey.map(value => corpus.translit[value]),
  ['G', 'G', 'TH']
);

const goCiphertext = goCells.map(at);
const goPlaintext = goCiphertext.map((value, index) =>
  mod29(value - goKey[index % goKey.length])
);
assert.deepEqual(
  goPlaintext.map(value => corpus.translit[value]),
  ['G', 'O']
);

// Count adjacent EO,N occurrences as a control.
const target = goCiphertext;
const directions = [
  [-1, 0], [1, 0], [0, -1], [0, 1],
  [-1, -1], [-1, 1], [1, -1], [1, 1],
];
const globalHits = [];
for (let row = 1; row <= 27; row += 1) {
  for (let col = 1; col <= 27; col += 1) {
    for (const direction of directions) {
      const cells = target.map((_, index) => [
        row + direction[0] * index,
        col + direction[1] * index,
      ]);
      if (!cells.every(inBounds)) continue;
      if (cells.every((cell, index) => at(cell) === target[index])) {
        globalHits.push({ start: [row, col], direction, cells });
      }
    }
  }
}
assert.equal(globalHits.length, 5);
assert.ok(globalHits.some(hit =>
  hit.cells.length === goCells.length &&
  hit.cells.every((cell, index) => same(cell, goCells[index]))
));

// External source geometry control.
const externalCenter = [26, 18];
const externalRadius = 3;
const externalSecondOuter = [
  externalCenter[0] + externalRadius,
  externalCenter[1] - externalRadius,
];
assert.deepEqual(externalSecondOuter, [29, 15]);
assert.equal(inBounds(externalSecondOuter), false);

console.log(JSON.stringify({
  status: 'PASS',
  source: 'canonical resources/liber-primus/lp2-corpus.json',
  frozenYouState: {
    source: nodeRunes(youNode),
    sourceCoordinates: {
      first: youNode.first,
      center: youNode.center,
      second: youNode.second,
      radius: youNode.radius,
    },
    ciphertextCells: youCells,
  },
  goSourceSelection: {
    phiYouCenter: centerPhi,
    raw: [goOuter, goCenter, goOuter].map(value => corpus.translit[value]),
    globalMirrorMatches: goCandidates.length,
    node: nodeRunes(goNode),
    coordinates: {
      first: goNode.first,
      center: goNode.center,
      second: goNode.second,
      radius: goNode.radius,
      axis: goNode.axis,
    },
  },
  canonicalGo: {
    endpoint: goEndpoint,
    step,
    start: goStart,
    readDirection: goRead,
    length: goLength,
    cells: goCells,
    ciphertextRunes: goCells.map(cell => corpus.translit[at(cell)]),
    alignedKey: goKey.map(value => corpus.translit[value]),
    plaintext: goPlaintext.map(value => corpus.translit[value]),
    globalAdjacentCiphertextOccurrences: globalHits.length,
  },
  externalSourceControl: {
    claimedCenter: externalCenter,
    claimedRadius: externalRadius,
    impliedSecondOuter: externalSecondOuter,
    inBounds: false,
    decision: 'reject external GO source placement',
  },
  decision:
    'Canonical YOU state source-generates a globally unique valid G-O-G mirror at (21,21). Its own geometry fixes EO,N at (17,19)->(18,18), selecting one of five adjacent EO,N occurrences without plaintext scoring; G-G-TH decrypts them to G,O. The external row29 source placement is impossible and rejected.',
}, null, 2));
