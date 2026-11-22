'use strict';

/**
 * SFT: source-state transition from THEN through the next block on the original
 * p0-p2 27x27 equal-outer mirror graph.
 *
 * Upstream frozen state:
 * - source-selected next key node N-M-N at center M(20,17)
 * - retained SOON endpoint H(25,19)
 *
 * Placement before plaintext inspection:
 * 1. Of the two N-M-N outers, exactly one participates in a mirror centered on
 *    the retained SOON endpoint: lower N(23,17) in N-H-N.
 * 2. Traverse that N-H-N to far N(27,21). Excluding the incoming mirror, that
 *    N has exactly one remaining mirror: N-D-N.
 * 3. At its D center (16,21), exactly one same-axis mirror uses D as an outer:
 *    D-H-D. Traverse to H(12,21).
 * 4. At H, exactly one other same-axis centered mirror exists: J-H-J.
 * 5. Choose the J outer on the same side of H as the incoming D, giving
 *    J(22,21). That fixes the ciphertext start.
 * 6. At J, excluding J-H-J, exactly one mirror remains: J-C-J. Read away from
 *    its center along its axis, giving up-left.
 * 7. Stop at the first post-start cell with exactly one mirror incidence:
 *    W(21,20).
 *
 * Only after all source cells are fixed, derive N-E-N and decrypt.
 *
 * Run:
 *   node sims/lp2_p0_then_the_source_state_sft.cjs
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
let mirrorId = 0;

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
            id: mirrorId,
            center,
            first,
            second,
            radius,
            axis,
            raw: [at(first), at(center), at(second)],
          });
          mirrorId += 1;
        }
      }
    }
  }
}

assert.equal(mirrors.length, 479);

/** @param {number[]} cell @returns {object[]} */
function touching(cell) {
  return mirrors.filter(node =>
    same(cell, node.center) ||
    same(cell, node.first) ||
    same(cell, node.second)
  );
}

/** @param {number[]} cell @returns {object[]} */
function centered(cell) {
  return mirrors.filter(node => same(cell, node.center));
}

/** @param {object} node @param {number[]} cell @returns {boolean} */
function isOuter(node, cell) {
  return same(node.first, cell) || same(node.second, cell);
}

/** @param {object} node @param {number[]} outer @returns {number[]} */
function oppositeOuter(node, outer) {
  assert.ok(isOuter(node, outer));
  return same(node.first, outer) ? node.second : node.first;
}

/** @param {{raw:number[]}} node @returns {number[]} */
function deriveKey(node) {
  const derived = [node.raw[0], phi(node.raw[1]), node.raw[2]];
  const rotation = mod(
    derived.reduce((sum, value) => sum + mu(phi(value)), 0)
  ) % 3;

  return derived.slice(rotation).concat(derived.slice(0, rotation));
}

// Frozen upstream source state.
const soonEndpoint = [25, 19];
assert.equal(corpus.translit[at(soonEndpoint)], 'H');

const keyNodeCandidates = mirrors.filter(node =>
  node.raw.map(value => corpus.translit[value]).join('-') === 'N-M-N'
);
assert.equal(keyNodeCandidates.length, 1);
const keyNode = keyNodeCandidates[0];
assert.deepEqual(keyNode.center, [20, 17]);
assert.deepEqual(keyNode.first, [17, 17]);
assert.deepEqual(keyNode.second, [23, 17]);
assert.equal(keyNode.radius, 3);
assert.deepEqual(keyNode.axis, [1, 0]);

const used = new Set([keyNode.id]);

// Select which key outer continues by retained source state. Exactly one outer
// participates in an equal-outer mirror centered on the prior SOON endpoint H.
const stateOuterCandidates = [keyNode.first, keyNode.second].flatMap(outer =>
  touching(outer)
    .filter(node =>
      node.id !== keyNode.id &&
      isOuter(node, outer) &&
      same(node.center, soonEndpoint)
    )
    .map(node => ({ outer, node }))
);

assert.equal(stateOuterCandidates.length, 1);
const stateEntry = stateOuterCandidates[0];
assert.deepEqual(stateEntry.outer, [23, 17]);
assert.deepEqual(
  stateEntry.node.raw.map(value => corpus.translit[value]),
  ['N', 'H', 'N']
);
assert.equal(stateEntry.node.radius, 2);
assert.deepEqual(stateEntry.node.center, soonEndpoint);
used.add(stateEntry.node.id);

// Traverse through the retained SOON endpoint to the far N.
const farN = oppositeOuter(stateEntry.node, stateEntry.outer);
assert.deepEqual(farN, [27, 21]);

// At the far N, excluding the incoming N-H-N, exactly one mirror remains.
const farNOptions = touching(farN).filter(node =>
  !used.has(node.id) && isOuter(node, farN)
);
assert.equal(farNOptions.length, 1);
const nDn = farNOptions[0];
assert.deepEqual(nDn.raw.map(value => corpus.translit[value]), ['N', 'D', 'N']);
assert.equal(nDn.radius, 11);
assert.deepEqual(nDn.axis, [1, 0]);
assert.deepEqual(nDn.center, [16, 21]);
used.add(nDn.id);

// At D(16,21), keep the same axis. Exactly one unused mirror uses D as an
// outer on that vertical axis: D-H-D.
const dCenter = nDn.center;
const dSameAxisOuters = touching(dCenter).filter(node =>
  !used.has(node.id) &&
  isOuter(node, dCenter) &&
  node.axis[0] === nDn.axis[0] &&
  node.axis[1] === nDn.axis[1]
);
assert.equal(dSameAxisOuters.length, 1);
const dHd = dSameAxisOuters[0];
assert.deepEqual(dHd.raw.map(value => corpus.translit[value]), ['D', 'H', 'D']);
assert.equal(dHd.radius, 4);
assert.deepEqual(dHd.center, [12, 21]);
used.add(dHd.id);

// At that H center, exactly one other centered mirror on the same axis exists.
const hCenter = dHd.center;
const hSameAxisCentered = centered(hCenter).filter(node =>
  !used.has(node.id) &&
  node.axis[0] === dHd.axis[0] &&
  node.axis[1] === dHd.axis[1]
);
assert.equal(hSameAxisCentered.length, 1);
const jHj = hSameAxisCentered[0];
assert.deepEqual(jHj.raw.map(value => corpus.translit[value]), ['J', 'H', 'J']);
assert.equal(jHj.radius, 10);
used.add(jHj.id);

// The incoming D lies below H. Choose the J outer on that same side of H.
const incomingSide = Math.sign(dCenter[0] - hCenter[0]);
assert.equal(incomingSide, 1);
const sameSideJ = [jHj.first, jHj.second].filter(outer =>
  Math.sign(outer[0] - hCenter[0]) === incomingSide
);
assert.equal(sameSideJ.length, 1);
const ciphertextStart = sameSideJ[0];
assert.deepEqual(ciphertextStart, [22, 21]);
assert.equal(corpus.translit[at(ciphertextStart)], 'J');

// At J, excluding the key-path J-H-J, exactly one mirror incidence remains.
const startOptions = touching(ciphertextStart).filter(node =>
  !used.has(node.id)
);
assert.equal(startOptions.length, 1);
const jCj = startOptions[0];
assert.ok(isOuter(jCj, ciphertextStart));
assert.deepEqual(jCj.raw.map(value => corpus.translit[value]), ['J', 'C', 'J']);
assert.equal(jCj.radius, 2);
assert.deepEqual(jCj.center, [24, 23]);

// Read away from the J-C-J center.
const readDirection = signVector([
  ciphertextStart[0] - jCj.center[0],
  ciphertextStart[1] - jCj.center[1],
]);
assert.deepEqual(readDirection, [-1, -1]);

// Stop at the first post-start cell with exactly one equal-outer incidence.
const ciphertextCells = [ciphertextStart];
const stopCensus = [];

for (
  let cell = [
    ciphertextStart[0] + readDirection[0],
    ciphertextStart[1] + readDirection[1],
  ];
  inBounds(cell);
  cell = [cell[0] + readDirection[0], cell[1] + readDirection[1]]
) {
  const incidences = touching(cell);
  stopCensus.push({
    cell: [...cell],
    rune: corpus.translit[at(cell)],
    incidenceCount: incidences.length,
  });
  ciphertextCells.push([...cell]);

  if (incidences.length === 1) break;
}

assert.deepEqual(ciphertextCells, [[22, 21], [21, 20]]);
assert.deepEqual(stopCensus, [
  { cell: [21, 20], rune: 'W', incidenceCount: 1 },
]);

const endpointMirror = touching(ciphertextCells.at(-1))[0];
assert.deepEqual(
  endpointMirror.raw.map(value => corpus.translit[value]),
  ['W', 'O', 'W']
);

// Only now derive/decrypt.
const key = deriveKey(keyNode);
assert.deepEqual(key.map(value => corpus.translit[value]), ['N', 'E', 'N']);

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
  source: 'original LP2 p0-p2 27x27 equal-outer mirror graph',
  frozenState: {
    soonEndpoint,
    soonEndpointRune: corpus.translit[at(soonEndpoint)],
    keyNode: keyNode.raw.map(value => corpus.translit[value]),
    keyNodeCoordinates: {
      first: keyNode.first,
      center: keyNode.center,
      second: keyNode.second,
      radius: keyNode.radius,
    },
  },
  stateIntersection: {
    selectedOuter: stateEntry.outer,
    retainedStateMirror: stateEntry.node.raw.map(
      value => corpus.translit[value]
    ),
    retainedStateCenter: stateEntry.node.center,
    farN,
  },
  forcedKeyToCipherPath: [
    keyNode.raw.map(value => corpus.translit[value]),
    stateEntry.node.raw.map(value => corpus.translit[value]),
    nDn.raw.map(value => corpus.translit[value]),
    dHd.raw.map(value => corpus.translit[value]),
    jHj.raw.map(value => corpus.translit[value]),
  ],
  ciphertextSelection: {
    start: ciphertextStart,
    startRune: corpus.translit[at(ciphertextStart)],
    unusedStartMirror: jCj.raw.map(value => corpus.translit[value]),
    readDirection,
    stopCensus,
    cells: ciphertextCells,
  },
  key: key.map(value => corpus.translit[value]),
  decryptedOnlyAfterSelection: plaintext.map(value => corpus.translit[value]),
  decision:
    'The source-selected N-M-N node plus retained SOON state forces the next ciphertext cells J(22,21), W(21,20) without the external fitted placement reports; N-E-N then decrypts them to TH,E. This is a stronger source-state continuation through the block after THEN, while the overall route remains conditional on the upstream post-hoc grammar.',
}, null, 2));
