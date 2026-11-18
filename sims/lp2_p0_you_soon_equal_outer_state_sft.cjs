'use strict';

/**
 * SFT: equal-outer source-state YOU -> SOON transition on the original p0-p2
 * 27x27 square.
 *
 * This deliberately avoids the external proposal's unequal-outer L-*-EA key
 * triples. It uses only the repository's 479 equal-outer mirror graph plus
 * retained YOU source state.
 *
 * Frozen input:
 *   YOU start EA(27,18)
 *   YOU endpoint X(25,16)
 *
 * Selection before plaintext inspection:
 * - enter the endpoint's unique centered E-X-E mirror;
 * - choose its outer opposite the current block start;
 * - take the unique shortest unused mirror to hub TH(23,15);
 * - build a key branch using minimum-radius / uniqueness handoffs until the
 *   mirror center rune first equals the retained YOU start rune EA;
 * - use the remaining centered hub mirror for a ciphertext branch, choosing
 *   outer roles by unique continuation and finally a terminal outer with no
 *   unused incidence;
 * - continue from that terminal outer along its mirror axis to the boundary.
 *
 * Only then derive/decrypt with the key.
 *
 * Run:
 *   node sims/lp2_p0_you_soon_equal_outer_state_sft.cjs
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
const chebyshev = (first, second) => Math.max(
  Math.abs(first[0] - second[0]),
  Math.abs(first[1] - second[1])
);

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
    same(cell, node.center) || same(cell, node.first) || same(cell, node.second)
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

/**
 * Unused mirrors in which cell is an outer.
 * @param {number[]} cell
 * @param {Set<number>} used
 * @returns {object[]}
 */
function unusedOuterMirrors(cell, used) {
  return touching(cell).filter(node => !used.has(node.id) && isOuter(node, cell));
}

/**
 * Unused centered mirrors.
 * @param {number[]} cell
 * @param {Set<number>} used
 * @returns {object[]}
 */
function unusedCenteredMirrors(cell, used) {
  return centered(cell).filter(node => !used.has(node.id));
}

/** @param {object[]} nodes @returns {object[]} */
function minimumRadius(nodes) {
  assert.ok(nodes.length > 0);
  const radius = Math.min(...nodes.map(node => node.radius));
  return nodes.filter(node => node.radius === radius);
}

const youStart = [27, 18];
const youEndpoint = [25, 16];
assert.equal(corpus.translit[at(youStart)], 'EA');
assert.equal(corpus.translit[at(youEndpoint)], 'X');

// Endpoint X is the center of exactly one mirror: E-X-E.
const endpointCentered = centered(youEndpoint);
assert.equal(endpointCentered.length, 1);
const endpointMirror = endpointCentered[0];
assert.deepEqual(
  endpointMirror.raw.map(value => corpus.translit[value]),
  ['E', 'X', 'E']
);
assert.equal(endpointMirror.radius, 1);

const used = new Set([endpointMirror.id]);

// Choose the E outer farther from the current block start, i.e. opposite the
// direction from which the YOU block began.
const endpointOuters = [endpointMirror.first, endpointMirror.second];
const distances = endpointOuters.map(cell => chebyshev(cell, youStart));
assert.deepEqual(distances, [3, 2]);
const seedE = endpointOuters[distances[0] > distances[1] ? 0 : 1];
assert.deepEqual(seedE, [24, 16]);

// Excluding E-X-E, the seed E has two unused outer-role mirrors. The unique
// minimum is E-TH-E radius 1.
const seedOptions = unusedOuterMirrors(seedE, used);
assert.deepEqual(
  seedOptions.map(node => ({
    runes: node.raw.map(value => corpus.translit[value]),
    radius: node.radius,
  })).sort((a, b) => a.radius - b.radius),
  [
    { runes: ['E', 'TH', 'E'], radius: 1 },
    { runes: ['E', 'P', 'E'], radius: 6 },
  ]
);
const hubEntryCandidates = minimumRadius(seedOptions);
assert.equal(hubEntryCandidates.length, 1);
const hubEntry = hubEntryCandidates[0];
used.add(hubEntry.id);
const hub = hubEntry.center;
assert.deepEqual(hub, [23, 15]);
assert.equal(corpus.translit[at(hub)], 'TH');

// KEY BRANCH.
// At TH, after excluding E-TH-E, the minimum centered mirror is uniquely
// D-TH-D radius 1. X-TH-X radius 4 remains for the ciphertext branch.
const hubCentered = unusedCenteredMirrors(hub, used);
assert.deepEqual(
  hubCentered.map(node => ({
    runes: node.raw.map(value => corpus.translit[value]),
    radius: node.radius,
  })).sort((a, b) => a.radius - b.radius),
  [
    { runes: ['D', 'TH', 'D'], radius: 1 },
    { runes: ['X', 'TH', 'X'], radius: 4 },
  ]
);
const keyEntryCandidates = minimumRadius(hubCentered);
assert.equal(keyEntryCandidates.length, 1);
const keyEntry = keyEntryCandidates[0];
used.add(keyEntry.id);
assert.deepEqual(
  keyEntry.raw.map(value => corpus.translit[value]),
  ['D', 'TH', 'D']
);

// Compare the two D outers by the radius of their shortest unused outgoing
// outer-role mirror. The upper D has min2; lower D has min7.
const keyEntryOuterProfiles = [keyEntry.first, keyEntry.second].map(cell => {
  const outgoing = unusedOuterMirrors(cell, used);
  const minimum = Math.min(...outgoing.map(node => node.radius));
  return { cell, outgoing, minimum };
});
assert.deepEqual(
  keyEntryOuterProfiles.map(profile => [profile.cell, profile.minimum]),
  [
    [[22, 15], 2],
    [[24, 15], 7],
  ]
);
const firstKeyOuter = keyEntryOuterProfiles
  .slice()
  .sort((first, second) => first.minimum - second.minimum)[0].cell;
assert.deepEqual(firstKeyOuter, [22, 15]);

// Take the unique local minimum D-NG-D radius 2 to its far D.
const dOutgoing = unusedOuterMirrors(firstKeyOuter, used);
const dMinimum = minimumRadius(dOutgoing);
assert.equal(dMinimum.length, 1);
const dNgD = dMinimum[0];
assert.deepEqual(dNgD.raw.map(value => corpus.translit[value]), ['D', 'NG', 'D']);
assert.equal(dNgD.radius, 2);
used.add(dNgD.id);
const farD = oppositeOuter(dNgD, firstKeyOuter);
assert.deepEqual(farD, [22, 19]);

// At far D, the unique minimum centered mirror is IA-D-IA radius 3.
const farDCentered = unusedCenteredMirrors(farD, used);
assert.deepEqual(
  farDCentered.map(node => ({
    runes: node.raw.map(value => corpus.translit[value]),
    radius: node.radius,
  })).sort((a, b) => a.radius - b.radius),
  [
    { runes: ['IA', 'D', 'IA'], radius: 3 },
    { runes: ['I', 'D', 'I'], radius: 6 },
  ]
);
const iaDIaCandidates = minimumRadius(farDCentered);
assert.equal(iaDIaCandidates.length, 1);
const iaDIa = iaDIaCandidates[0];
used.add(iaDIa.id);

// Of the two IA outers, only IA(22,16) has a unique minimum-radius unused
// continuation. IA(22,22) has a tied minimum and is rejected before plaintext.
const iaProfiles = [iaDIa.first, iaDIa.second].map(cell => {
  const outgoing = unusedOuterMirrors(cell, used);
  const minimum = Math.min(...outgoing.map(node => node.radius));
  const minimumNodes = outgoing.filter(node => node.radius === minimum);
  return { cell, outgoing, minimum, minimumCount: minimumNodes.length };
});
assert.deepEqual(
  iaProfiles.map(profile => [profile.cell, profile.minimum, profile.minimumCount]),
  [
    [[22, 16], 3, 1],
    [[22, 22], 2, 2],
  ]
);
const deterministicIaOuters = iaProfiles.filter(profile => profile.minimumCount === 1);
assert.equal(deterministicIaOuters.length, 1);
const keyOuter = deterministicIaOuters[0].cell;
assert.deepEqual(keyOuter, [22, 16]);

// Its unique minimum continuation is IA-EA-IA. The center rune EA equals the
// retained YOU start rune, giving a source-state stop for the key search.
const keyOuterMin = minimumRadius(unusedOuterMirrors(keyOuter, used));
assert.equal(keyOuterMin.length, 1);
const keyMirror = keyOuterMin[0];
assert.deepEqual(
  keyMirror.raw.map(value => corpus.translit[value]),
  ['IA', 'EA', 'IA']
);
assert.equal(keyMirror.radius, 3);
assert.equal(keyMirror.raw[1], at(youStart));
used.add(keyMirror.id);

const key = deriveKey(keyMirror);
assert.deepEqual(key.map(value => corpus.translit[value]), ['IA', 'EO', 'IA']);

// CIPHERTEXT BRANCH.
// Back at TH, after E-TH-E and D-TH-D are consumed, the only unused centered
// mirror is X-TH-X.
const cipherHubOptions = unusedCenteredMirrors(hub, used);
assert.equal(cipherHubOptions.length, 1);
const xThX = cipherHubOptions[0];
assert.deepEqual(xThX.raw.map(value => corpus.translit[value]), ['X', 'TH', 'X']);
assert.equal(xThX.radius, 4);
used.add(xThX.id);

// Select the X outer with exactly one unused centered continuation. X(19,19)
// has two; X(27,11) has one.
const xProfiles = [xThX.first, xThX.second].map(cell => ({
  cell,
  centered: unusedCenteredMirrors(cell, used),
}));
assert.deepEqual(
  xProfiles.map(profile => [profile.cell, profile.centered.length]),
  [
    [[19, 19], 2],
    [[27, 11], 1],
  ]
);
const deterministicX = xProfiles.filter(profile => profile.centered.length === 1);
assert.equal(deterministicX.length, 1);
const cipherX = deterministicX[0].cell;
assert.deepEqual(cipherX, [27, 11]);

const dXD = deterministicX[0].centered[0];
assert.deepEqual(dXD.raw.map(value => corpus.translit[value]), ['D', 'X', 'D']);
assert.equal(dXD.radius, 9);
used.add(dXD.id);

// Of D-X-D's outers, only D(27,20) has exactly one unused centered
// continuation. D(27,2) has none.
const dProfiles = [dXD.first, dXD.second].map(cell => ({
  cell,
  centered: unusedCenteredMirrors(cell, used),
}));
assert.deepEqual(
  dProfiles.map(profile => [profile.cell, profile.centered.length]),
  [
    [[27, 2], 0],
    [[27, 20], 1],
  ]
);
const deterministicD = dProfiles.filter(profile => profile.centered.length === 1);
assert.equal(deterministicD.length, 1);
const cipherD = deterministicD[0].cell;
assert.deepEqual(cipherD, [27, 20]);

const pDP = deterministicD[0].centered[0];
assert.deepEqual(pDP.raw.map(value => corpus.translit[value]), ['P', 'D', 'P']);
assert.equal(pDP.radius, 4);
used.add(pDP.id);

// Choose the P outer with no unused mirror incidence. P(27,16) still belongs
// to P-R-P; P(27,24) is terminal.
const pProfiles = [pDP.first, pDP.second].map(cell => ({
  cell,
  remaining: touching(cell).filter(node => !used.has(node.id)),
}));
assert.deepEqual(
  pProfiles.map(profile => [profile.cell, profile.remaining.length]),
  [
    [[27, 16], 1],
    [[27, 24], 0],
  ]
);
const terminalP = pProfiles.filter(profile => profile.remaining.length === 0);
assert.equal(terminalP.length, 1);
const ciphertextStart = terminalP[0].cell;
assert.deepEqual(ciphertextStart, [27, 24]);

// Continue away from the P-D-P center along its horizontal axis to the matrix
// edge. The physical edge supplies the ciphertext stop.
const rayDirection = signVector([
  ciphertextStart[0] - pDP.center[0],
  ciphertextStart[1] - pDP.center[1],
]);
assert.deepEqual(rayDirection, [0, 1]);

const ciphertextCells = [];
for (
  let cell = [...ciphertextStart];
  inBounds(cell);
  cell = [cell[0] + rayDirection[0], cell[1] + rayDirection[1]]
) {
  ciphertextCells.push([...cell]);
}
assert.deepEqual(ciphertextCells, [[27, 24], [27, 25], [27, 26], [27, 27]]);

const ciphertext = ciphertextCells.map(at);
const plaintext = ciphertext.map((value, index) =>
  mod(value - key[index % key.length])
);
assert.deepEqual(
  plaintext.map(value => corpus.translit[value]),
  ['S', 'O', 'O', 'N']
);
assert.deepEqual(
  plaintext.map((value, index) => mod(value + key[index % key.length])),
  ciphertext
);

console.log(JSON.stringify({
  status: 'PASS',
  source: 'original LP2 p0-p2 27x27 equal-outer mirror graph',
  frozenYouState: {
    start: youStart,
    startRune: corpus.translit[at(youStart)],
    endpoint: youEndpoint,
    endpointRune: corpus.translit[at(youEndpoint)],
  },
  hub: {
    endpointMirror: endpointMirror.raw.map(value => corpus.translit[value]),
    seedE,
    entryMirror: hubEntry.raw.map(value => corpus.translit[value]),
    center: hub,
  },
  keyBranch: {
    entry: keyEntry.raw.map(value => corpus.translit[value]),
    firstOuter: firstKeyOuter,
    dNgD: dNgD.raw.map(value => corpus.translit[value]),
    farD,
    iaDIa: iaDIa.raw.map(value => corpus.translit[value]),
    outerProfiles: iaProfiles.map(profile => ({
      cell: profile.cell,
      minimumRadius: profile.minimum,
      minimumCount: profile.minimumCount,
    })),
    keyOuter,
    keyMirror: keyMirror.raw.map(value => corpus.translit[value]),
    keyCenterMatchesYouStartRune: true,
    key: key.map(value => corpus.translit[value]),
  },
  ciphertextBranch: {
    xThX: xThX.raw.map(value => corpus.translit[value]),
    selectedX: cipherX,
    dXD: dXD.raw.map(value => corpus.translit[value]),
    selectedD: cipherD,
    pDP: pDP.raw.map(value => corpus.translit[value]),
    terminalP: ciphertextStart,
    rayDirection,
    ciphertextCells,
  },
  decryptedOnlyAfterSelection: plaintext.map(value => corpus.translit[value]),
  decision:
    'An equal-outer source-state parser selects the alternative SOON route and key without the external unequal-outer triples or an injected four-rune length. The grammar remains post-hoc and should be tested on the next untouched transition before authentication.',
}, null, 2));
