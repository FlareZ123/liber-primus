'use strict';

/**
 * SFT: source-only DEATH -> SEE boundary bridge on the original p0-p2 27x27 square.
 *
 * Upstream frozen state is Agent7's source-derived DEATH block:
 *   current key mirror J-B-J, radius 4
 *   ciphertext endpoint E(26,1), read direction west
 *
 * The selector below never reads candidate plaintext:
 * 1. At the dead-end boundary cell, inspect the in-bounds 8-neighborhood for
 *    mirror incidences whose radius equals the current key-mirror radius.
 * 2. Exactly one survives: EA(25,2), an outer of EA-J-EA radius 4.
 * 3. Derive the normal center-totient/Mobius-phase key from that mirror.
 * 4. Traverse from the neighboring outer through the mirror to its far outer,
 *    then continue on the same axis. Select the first later cell whose sole
 *    mirror incidence is perpendicular to the current axis.
 * 5. From that start, read the diagonal quadrant pointing toward the prior
 *    endpoint until the physical matrix boundary.
 *
 * Only then decrypt. A negative transfer control applies the same radius-
 * neighborhood primitive at the resulting endpoint and records that it selects
 * a different branch, so this is not promoted as a universal boundary law.
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

/** @param {number[]} first @param {number[]} second @returns {number} */
function dot(first, second) {
  return first[0] * second[0] + first[1] * second[1];
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

/**
 * @param {number[]} endpoint
 * @param {number} radius
 * @returns {Array<{node:object, anchor:number[], role:string}>}
 */
function neighboringRadiusHits(endpoint, radius) {
  const neighbors = [];
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (dr === 0 && dc === 0) continue;
      const cell = [endpoint[0] + dr, endpoint[1] + dc];
      if (inBounds(cell)) neighbors.push(cell);
    }
  }

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
  return hits;
}

/** @param {{raw:number[]}} node @returns {number[]} */
function deriveKey(node) {
  const derived = [node.raw[0], phi(node.raw[1]), node.raw[2]];
  const rotation = mod(
    derived.reduce((sum, value) => sum + mu(phi(value)), 0)
  ) % 3;
  return derived.slice(rotation).concat(derived.slice(0, rotation));
}

// Frozen upstream state from the source-derived END/IS/DEATH recurrence.
const deathEndpoint = [26, 1];
const deathReadDirection = [0, -1];
const deathKeyMirror = {
  center: [23, 12],
  first: [19, 16],
  second: [27, 8],
  radius: 4,
};
assert.equal(corpus.translit[at(deathEndpoint)], 'E');
assert.equal(touching(deathEndpoint).length, 0);
assert.deepEqual(deathReadDirection, [0, -1]);

// Carry the already selected key radius across the dead-end boundary. This is
// the same radius-matching primitive already used upstream in Agent7's END
// bridge, now applied only to the endpoint neighborhood.
const radiusHits = neighboringRadiusHits(deathEndpoint, deathKeyMirror.radius);
assert.equal(radiusHits.length, 1);
const selected = radiusHits[0];
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

const key = deriveKey(selected.node);
assert.deepEqual(
  key.map(value => corpus.translit[value]),
  ['EA', 'I', 'EA']
);

// Orient along the selected mirror from the neighboring outer toward its center,
// then traverse through to the far outer.
const forward = signVector([
  selected.node.center[0] - selected.anchor[0],
  selected.node.center[1] - selected.anchor[1],
]);
assert.deepEqual(forward, [0, 1]);
const farOuter = same(selected.anchor, selected.node.first)
  ? selected.node.second
  : selected.node.first;
assert.deepEqual(farOuter, [25, 10]);

// Continue along the same source axis. The first later cell whose complete
// mirror incidence is a singleton and perpendicular to the current axis is X.
// EO(25,14) is an earlier singleton, but its sole mirror is parallel and is
// rejected without consulting plaintext.
const scan = [];
let start = null;
for (
  let cell = [farOuter[0] + forward[0], farOuter[1] + forward[1]];
  inBounds(cell);
  cell = [cell[0] + forward[0], cell[1] + forward[1]]
) {
  const incidences = touching(cell);
  const perpendicularSingleton =
    incidences.length === 1 && dot(incidences[0].axis, selected.node.axis) === 0;
  scan.push({
    cell: [...cell],
    rune: corpus.translit[at(cell)],
    incidenceCount: incidences.length,
    perpendicularSingleton,
  });
  if (perpendicularSingleton) {
    start = [...cell];
    break;
  }
}
assert.deepEqual(start, [25, 16]);
assert.equal(corpus.translit[at(start)], 'X');
assert.deepEqual(
  scan.filter(row => row.incidenceCount === 1).map(row => [
    row.cell,
    row.rune,
    row.perpendicularSingleton,
  ]),
  [
    [[25, 14], 'EO', false],
    [[25, 16], 'X', true],
  ]
);
const startMirror = touching(start)[0];
assert.deepEqual(
  startMirror.raw.map(value => corpus.translit[value]),
  ['E', 'X', 'E']
);
assert.deepEqual(startMirror.axis, [1, 0]);
assert.equal(startMirror.radius, 1);

// Reuse the upstream "toward the prior endpoint" orientation. From the selected
// start this fixes the diagonal quadrant as down-left. The physical bottom edge
// supplies the stop, so no plaintext word length is injected.
const readDirection = signVector([
  deathEndpoint[0] - start[0],
  deathEndpoint[1] - start[1],
]);
assert.deepEqual(readDirection, [1, -1]);

const ciphertextCells = [];
for (
  let cell = [...start];
  inBounds(cell);
  cell = [cell[0] + readDirection[0], cell[1] + readDirection[1]]
) {
  ciphertextCells.push([...cell]);
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

// Immediate transfer control: blindly carrying the same radius-4 neighborhood
// primitive from the new boundary endpoint does have a unique result, but it is
// A-C-A at A(27,13). Therefore the radius-neighborhood step is not a universal
// boundary law and requires an independently motivated state/mode condition
// before reuse.
const seeEndpoint = ciphertextCells.at(-1);
assert.deepEqual(seeEndpoint, [27, 14]);
assert.equal(touching(seeEndpoint).length, 0);
const transferHits = neighboringRadiusHits(seeEndpoint, selected.node.radius);
assert.equal(transferHits.length, 1);
assert.deepEqual(transferHits[0].anchor, [27, 13]);
assert.deepEqual(
  transferHits[0].node.raw.map(value => corpus.translit[value]),
  ['A', 'C', 'A']
);
assert.equal(transferHits[0].node.radius, 4);

console.log(JSON.stringify({
  status: 'PASS',
  source: 'original LP2 p0-p2 27x27 grid',
  frozenPriorState: {
    endpoint: deathEndpoint,
    endpointRune: corpus.translit[at(deathEndpoint)],
    currentKeyRadius: deathKeyMirror.radius,
  },
  sourceSelection: {
    sameRadiusNeighborHits: radiusHits.length,
    selectedAnchor: selected.anchor,
    selectedNode: selected.node.raw.map(value => corpus.translit[value]),
    key: key.map(value => corpus.translit[value]),
    farOuter,
    forwardScan: scan,
    start,
    startMirror: startMirror.raw.map(value => corpus.translit[value]),
    readDirection,
    ciphertextCells,
  },
  decryptedOnlyAfterSelection: plaintext.map(value => corpus.translit[value]),
  immediateTransferControl: {
    endpoint: seeEndpoint,
    sameRadiusNeighborHits: transferHits.length,
    selectedAnchor: transferHits[0].anchor,
    selectedNode: transferHits[0].node.raw.map(value => corpus.translit[value]),
    decision:
      'The same radius-neighborhood rule does not transfer as a universal boundary law.',
  },
  decision:
    'Existing radius matching plus source-incidence and prior-endpoint orientation deterministically extends the frozen DEATH state by one block to SEE without language scoring. The transition remains post-hoc and mode-specific because blind reuse at the next boundary selects another branch.',
}, null, 2));
