'use strict';

/**
 * SFT: source-state continuation from O-F to the second TH-E block.
 *
 * Frozen current state:
 * - mirror key H-T-H radius1, transformed/aligned key H-H-H, phase0
 * - ciphertext J(6,12) -> H(7,13), read down-right
 *
 * Selection before plaintext inspection:
 * 1. Let r=1. Build ordered raw non-mirror values from current cells:
 *      first = current start J = 11
 *      center = current endpoint H8 - 2r = 6 = G
 *      second = r = 1 = U
 *    Ordered J-G-U occurs exactly once among all straight triples.
 * 2. Two bounded key operations are considered for a non-mirror source:
 *    direct raw indices, or center-only phi. Require the next phase to equal
 *    the current phase0. Direct J-G-U has phase1; center-phi J-TH-U has phase0,
 *    selecting the latter before plaintext inspection.
 * 3. Move from current start along the selected vertical key axis, preserving
 *    current positive row sign, by current raw center T16 - phi(G6)=14
 *    -> P(20,12). Rune cross-check: J11 + phi(G6)=13=P.
 * 4. Read perpendicular to the new vertical key, preserving current positive
 *    column sign -> right.
 * 5. Start P has no equal-outer incidence; stop at first later cell with any
 *    mirror incidence -> L(20,13).
 *
 * Only after selection, decrypt J-TH-U against P-L.
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
const mod = value => ((value % 29) + 29) % 29;

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

/** @param {number[]} values @returns {number} */
function phase(values) {
  return mod(values.reduce((sum, value) => sum + mu(phi(value)), 0)) % 3;
}

/** @param {{raw:number[]}} node @returns {string[]} */
function nodeRunes(node) {
  return node.raw.map(value => corpus.translit[value]);
}

const axes = [[1, 0], [0, 1], [1, 1], [1, -1]];
const mirrors = [];
const triples = [];

for (let row = 1; row <= 27; row += 1) {
  for (let col = 1; col <= 27; col += 1) {
    for (const axis of axes) {
      for (let radius = 1; radius <= 13; radius += 1) {
        const first = [row - axis[0] * radius, col - axis[1] * radius];
        const second = [row + axis[0] * radius, col + axis[1] * radius];
        if (!inBounds(first) || !inBounds(second)) break;

        const center = [row, col];
        const raw = [at(first), at(center), at(second)];
        const node = { first, center, second, radius, axis, raw };
        triples.push(node);
        if (raw[0] === raw[2] && raw[1] !== 0) mirrors.push(node);
      }
    }
  }
}
assert.equal(mirrors.length, 479);

/** @param {number[]} cell @returns {object[]} */
function touching(cell) {
  return mirrors.filter(node =>
    same(cell, node.first) || same(cell, node.center) || same(cell, node.second)
  );
}

// Frozen OF source state.
const currentKey = mirrors.find(node =>
  nodeRunes(node).join('-') === 'H-T-H' &&
  same(node.center, [19, 26])
);
assert.ok(currentKey);
assert.equal(currentKey.radius, 1);

const currentDerived = [currentKey.raw[0], phi(currentKey.raw[1]), currentKey.raw[2]];
const currentPhase = phase(currentDerived);
assert.deepEqual(
  currentDerived.map(value => corpus.translit[value]),
  ['H', 'H', 'H']
);
assert.equal(currentPhase, 0);

const currentStart = [6, 12];
const currentEndpoint = [7, 13];
const currentReadDirection = [1, 1];
assert.equal(corpus.translit[at(currentStart)], 'J');
assert.equal(corpus.translit[at(currentEndpoint)], 'H');

const r = currentKey.radius;
const rawFirst = at(currentStart);
const rawCenter = at(currentEndpoint) - 2 * r;
const rawSecond = r;

assert.equal(rawFirst, 11);
assert.equal(corpus.translit[rawFirst], 'J');
assert.equal(rawCenter, 6);
assert.equal(corpus.translit[rawCenter], 'G');
assert.equal(rawSecond, 1);
assert.equal(corpus.translit[rawSecond], 'U');

const candidates = triples.filter(node =>
  node.raw[0] === rawFirst &&
  node.raw[1] === rawCenter &&
  node.raw[2] === rawSecond
);
assert.equal(candidates.length, 1);
const nextNode = candidates[0];

assert.deepEqual(nodeRunes(nextNode), ['J', 'G', 'U']);
assert.deepEqual(nextNode.first, [23, 1]);
assert.deepEqual(nextNode.center, [24, 1]);
assert.deepEqual(nextNode.second, [25, 1]);
assert.equal(nextNode.radius, 1);
assert.deepEqual(nextNode.axis, [1, 0]);

// Finite operation gate: direct raw versus center-only phi.
const directKey = [...nextNode.raw];
const transformedKey = [nextNode.raw[0], phi(nextNode.raw[1]), nextNode.raw[2]];
const operationCandidates = [
  { name: 'direct', key: directKey, phase: phase(directKey) },
  { name: 'center-phi', key: transformedKey, phase: phase(transformedKey) },
];

assert.deepEqual(
  operationCandidates.map(candidate => [candidate.name, candidate.phase]),
  [['direct', 1], ['center-phi', 0]]
);

const phaseMatches = operationCandidates.filter(
  candidate => candidate.phase === currentPhase
);
assert.equal(phaseMatches.length, 1);
const selectedOperation = phaseMatches[0];
assert.equal(selectedOperation.name, 'center-phi');
assert.deepEqual(
  selectedOperation.key.map(value => corpus.translit[value]),
  ['J', 'TH', 'U']
);

// Start placement.
const newDerivedCenter = phi(nextNode.raw[1]);
assert.equal(newDerivedCenter, 2);
const startDistance = currentKey.raw[1] - newDerivedCenter;
assert.equal(startDistance, 14);

const rowSign = Math.sign(currentReadDirection[0]);
assert.equal(rowSign, 1);

const nextStart = [
  currentStart[0] + nextNode.axis[0] * rowSign * startDistance,
  currentStart[1] + nextNode.axis[1] * rowSign * startDistance,
];
assert.deepEqual(nextStart, [20, 12]);
assert.equal(corpus.translit[at(nextStart)], 'P');

// Independent rune-value cross-check.
assert.equal(at(currentStart) + newDerivedCenter, at(nextStart));
assert.equal(at(nextStart), 13);

// Ciphertext is perpendicular to vertical key, preserving positive column sign.
const nextReadDirection = [0, Math.sign(currentReadDirection[1])];
assert.deepEqual(nextReadDirection, [0, 1]);
assert.equal(touching(nextStart).length, 0);

const ciphertextCells = [nextStart];
const stopCensus = [];
for (
  let cell = [nextStart[0], nextStart[1] + 1];
  inBounds(cell);
  cell = [cell[0], cell[1] + 1]
) {
  const incidences = touching(cell);
  stopCensus.push({
    cell: [...cell],
    rune: corpus.translit[at(cell)],
    incidenceCount: incidences.length,
  });
  ciphertextCells.push([...cell]);
  if (incidences.length > 0) break;
}

assert.deepEqual(ciphertextCells, [[20, 12], [20, 13]]);
assert.deepEqual(stopCensus, [
  { cell: [20, 13], rune: 'L', incidenceCount: 2 },
]);

const key = selectedOperation.key;
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
    keyNode: nodeRunes(currentKey),
    phase: currentPhase,
    ciphertextCells: [currentStart, currentEndpoint],
    readDirection: currentReadDirection,
  },
  nextKeySelection: {
    raw: [rawFirst, rawCenter, rawSecond],
    runes: [rawFirst, rawCenter, rawSecond].map(value => corpus.translit[value]),
    straightTripleMatches: candidates.length,
    coordinates: {
      first: nextNode.first,
      center: nextNode.center,
      second: nextNode.second,
      radius: nextNode.radius,
      axis: nextNode.axis,
    },
    operationCandidates: operationCandidates.map(candidate => ({
      name: candidate.name,
      key: candidate.key.map(value => corpus.translit[value]),
      phase: candidate.phase,
    })),
    statePhaseSelector: currentPhase,
    selectedOperation: selectedOperation.name,
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
    'The OF state uniquely source-generates J-G-U; a bounded phase-state gate selects center-only phi, and source geometry fixes P,L before decryption to TH,E. The phase-preservation gate remains a hypothesis requiring transfer.',
}, null, 2));
