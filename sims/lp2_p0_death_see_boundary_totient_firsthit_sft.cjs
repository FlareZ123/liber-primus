'use strict';

/**
 * SFT: source-only DEATH -> SEE boundary handoff on the original p0-p2 27x27 square.
 *
 * Starting state is only the already selected stage-13 DEATH ciphertext endpoint
 * E(26,1). The selector never scores candidate plaintext.
 *
 * Boundary rule tested:
 * 1. At a left/right physical boundary, iterate phi on the non-boundary row.
 * 2. At each iterate, enumerate mirror nodes touching the endpoint's in-bounds
 *    8-neighborhood whose radius equals that iterate; stop at the first
 *    nonempty iterate.
 * 3. If exactly one node survives, use the neighboring incidence as anchor.
 * 4. Derive the ordinary center-totient/Mobius-phase key from that node.
 * 5. Move from the anchor along the node axis toward its center by
 *    phi(center)+phi^2(center) cells.
 * 6. Read from that landing cell on the diagonal quadrant pointing toward the
 *    prior endpoint, stopping at the physical matrix boundary.
 *
 * The resulting plaintext is inspected only after all source cells are fixed.
 *
 * Run:
 *   node sims/lp2_p0_death_see_boundary_totient_firsthit_sft.cjs
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

const deathEndpoint = [26, 1];
assert.equal(corpus.translit[at(deathEndpoint)], 'E');

const neighbors = [];
for (let dr = -1; dr <= 1; dr += 1) {
  for (let dc = -1; dc <= 1; dc += 1) {
    if (dr === 0 && dc === 0) continue;
    const cell = [deathEndpoint[0] + dr, deathEndpoint[1] + dc];
    if (inBounds(cell)) neighbors.push(cell);
  }
}

/**
 * @param {number} radius
 * @returns {Array<{node:object, anchor:number[], role:string}>}
 */
function neighboringRadiusHits(radius) {
  const hits = [];
  for (const node of mirrors) {
    if (node.radius !== radius) continue;
    for (const cell of neighbors) {
      let role = null;
      if (same(cell, node.center)) role = 'center';
      else if (same(cell, node.first) || same(cell, node.second)) role = 'outer';
      if (role !== null) hits.push({ node, anchor: cell, role });
    }
  }

  const unique = new Map();
  for (const hit of hits) {
    const key = JSON.stringify([
      hit.node.center,
      hit.node.first,
      hit.node.second,
      hit.anchor,
      hit.role,
    ]);
    if (!unique.has(key)) unique.set(key, hit);
  }
  return [...unique.values()];
}

const firstPhi = phi(deathEndpoint[0]);
const secondPhi = phi(firstPhi);
assert.equal(firstPhi, 12);
assert.equal(secondPhi, 4);

const radius12 = neighboringRadiusHits(firstPhi);
const radius4 = neighboringRadiusHits(secondPhi);
assert.equal(radius12.length, 0);
assert.equal(radius4.length, 1);

const selected = radius4[0];
assert.equal(selected.role, 'outer');
assert.deepEqual(selected.anchor, [25, 2]);
assert.deepEqual(selected.node.center, [25, 6]);
assert.deepEqual(selected.node.first, [25, 2]);
assert.deepEqual(selected.node.second, [25, 10]);
assert.equal(selected.node.radius, 4);
assert.deepEqual(
  selected.node.raw.map(value => corpus.translit[value]),
  ['EA', 'J', 'EA']
);

// Derive the standard route key: transform center by phi, then rotate left by
// the sum of mu(phi(keyRune)) modulo 3.
const derived = [
  selected.node.raw[0],
  phi(selected.node.raw[1]),
  selected.node.raw[2],
];
assert.deepEqual(
  derived.map(value => corpus.translit[value]),
  ['EA', 'I', 'EA']
);
const rotation = mod(
  derived.reduce((sum, value) => sum + mu(phi(value)), 0)
) % 3;
assert.equal(rotation, 0);
const key = derived.slice(rotation).concat(derived.slice(0, rotation));
assert.deepEqual(key, derived);

// The selected neighboring outer determines axis orientation toward the center.
const axisTowardCenter = signVector([
  selected.node.center[0] - selected.anchor[0],
  selected.node.center[1] - selected.anchor[1],
]);
assert.deepEqual(axisTowardCenter, [0, 1]);

const centerIndex = selected.node.raw[1];
const movementDistance = phi(centerIndex) + phi(phi(centerIndex));
assert.equal(centerIndex, 11);
assert.equal(phi(centerIndex), 10);
assert.equal(phi(phi(centerIndex)), 4);
assert.equal(movementDistance, 14);

const start = [
  selected.anchor[0] + axisTowardCenter[0] * movementDistance,
  selected.anchor[1] + axisTowardCenter[1] * movementDistance,
];
assert.deepEqual(start, [25, 16]);
assert.equal(corpus.translit[at(start)], 'X');

// The landing cell has a unique perpendicular mirror-center role, E-X-E.
const startCentered = mirrors.filter(node => same(node.center, start));
assert.equal(startCentered.length, 1);
assert.deepEqual(
  startCentered[0].raw.map(value => corpus.translit[value]),
  ['E', 'X', 'E']
);
assert.equal(startCentered[0].radius, 1);
assert.deepEqual(startCentered[0].axis, [1, 0]);

// Choose the diagonal quadrant pointing from the landing cell toward the prior
// endpoint. Read until the matrix edge; no plaintext length is supplied.
const readDirection = signVector([
  deathEndpoint[0] - start[0],
  deathEndpoint[1] - start[1],
]);
assert.deepEqual(readDirection, [1, -1]);

const ciphertextCells = [];
for (let cell = start; inBounds(cell); cell = [
  cell[0] + readDirection[0],
  cell[1] + readDirection[1],
]) {
  ciphertextCells.push(cell);
}
assert.deepEqual(ciphertextCells, [[25, 16], [26, 15], [27, 14]]);

const ciphertext = ciphertextCells.map(at);
const plaintext = ciphertext.map((value, index) =>
  mod(value - key[index % key.length])
);
assert.deepEqual(
  plaintext.map(value => corpus.translit[value]),
  ['S', 'E', 'E']
);
assert.deepEqual(
  plaintext.map((value, index) => mod(value + key[index % key.length])),
  ciphertext
);

console.log(JSON.stringify({
  status: 'PASS',
  source: 'original LP2 p0-p2 27x27 grid',
  priorState: {
    plaintextLabelUsedOnlyForReporting: 'DEATH',
    endpoint: deathEndpoint,
    endpointRune: corpus.translit[at(deathEndpoint)],
  },
  boundarySelector: {
    phiOrbitFromRow: [deathEndpoint[0], firstPhi, secondPhi],
    radius12NeighborHits: radius12.length,
    radius4NeighborHits: radius4.length,
    selectedAnchor: selected.anchor,
    selectedNode: selected.node.raw.map(value => corpus.translit[value]),
    selectedRadius: selected.node.radius,
  },
  key: key.map(value => corpus.translit[value]),
  movement: {
    centerIndex,
    movementDistance,
    start,
    startRune: corpus.translit[at(start)],
    uniqueStartMirror: startCentered[0].raw.map(value => corpus.translit[value]),
    readDirection,
    ciphertextCells,
  },
  decryptedOnlyAfterSelection: plaintext.map(value => corpus.translit[value]),
  decision:
    'The first matching totient-radius in the boundary neighborhood uniquely selects EA-J-EA and, with the node-derived 14-cell move plus boundary ray toward the prior endpoint, recovers SEE before language scoring. The rule remains a candidate until it transfers to another untouched boundary transition or is independently clued.',
}, null, 2));
