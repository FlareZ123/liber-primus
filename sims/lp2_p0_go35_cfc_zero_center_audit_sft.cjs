'use strict';

/**
 * SFT: audit the proposed canonical GO -> C-F-C zero-center frontier.
 *
 * The canonical YOU -> GO state selects G-O-G at center (21,21), radius 3.
 * Its published next-value arithmetic proposes C-F-C:
 *   step = radius - phi(O) = 1
 *   outer = G - step = C
 *   center = O - radius = F
 *
 * This test enumerates every equally spaced three-cell source on the original
 * 27x27 p0-p2 grid, including zero-valued centers. It checks whether carrying
 * the current radius 3 selects a physical C-F-C node.
 *
 * Run:
 *   node sims/lp2_p0_go35_cfc_zero_center_audit_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const grid = corpus.pages
  .filter(page => page.page <= 2)
  .flatMap(page => page.indices);
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

/** @param {number} n @returns {number} */
function phi(n) {
  assert.ok(n > 0);
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

const axes = [
  [1, 0],
  [0, 1],
  [1, 1],
  [1, -1],
];

// Frozen canonical GO source from the prior verified SFT.
const go = {
  first: [18, 21],
  center: [21, 21],
  second: [24, 21],
  radius: 3,
  raw: [6, 3, 6],
};
assert.deepEqual(go.raw.map(value => T[value]), ['G', 'O', 'G']);
assert.deepEqual(
  [go.first, go.center, go.second].map(cell => T[at(cell)]),
  ['G', 'O', 'G']
);

// Reproduce only the value arithmetic of the proposed successor.
const step = go.radius - phi(go.raw[1]);
const targetOuter = go.raw[0] - step;
const targetCenter = go.raw[1] - go.radius;
assert.equal(step, 1);
assert.equal(targetOuter, 5);
assert.equal(targetCenter, 0);
assert.deepEqual(
  [targetOuter, targetCenter, targetOuter].map(value => T[value]),
  ['C', 'F', 'C']
);

// Enumerate every physically valid equally spaced source triple, including F=0
// centers that the ordinary nonzero mirror graph intentionally omits.
const matches = [];
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
        if (
          raw[0] === targetOuter &&
          raw[1] === targetCenter &&
          raw[2] === targetOuter
        ) {
          matches.push({ first, center, second, axis, radius, raw });
        }
      }
    }
  }
}

assert.equal(matches.length, 3);
assert.deepEqual(
  matches.map(node => ({
    center: node.center,
    radius: node.radius,
    axis: node.axis,
    first: node.first,
    second: node.second,
  })),
  [
    {
      center: [13, 22],
      radius: 1,
      axis: [0, 1],
      first: [13, 21],
      second: [13, 23],
    },
    {
      center: [15, 21],
      radius: 2,
      axis: [1, -1],
      first: [13, 23],
      second: [17, 19],
    },
    {
      center: [16, 15],
      radius: 7,
      axis: [0, 1],
      first: [16, 8],
      second: [16, 22],
    },
  ]
);

const carriedRadiusMatches = matches.filter(node => node.radius === go.radius);
assert.equal(carriedRadiusMatches.length, 0);

// Explicitly guard the previously reported coordinates.
const rejected = [[4, 7], [4, 10], [4, 13]];
assert.deepEqual(
  rejected.map(cell => T[at(cell)]),
  ['TH', 'Y', 'C']
);

console.log(JSON.stringify({
  status: 'PASS',
  canonicalGo: {
    source: go.raw.map(value => T[value]),
    center: go.center,
    radius: go.radius,
  },
  proposedSuccessorValues: {
    step,
    raw: [targetOuter, targetCenter, targetOuter].map(value => T[value]),
  },
  physicalCfcMatches: matches.map(node => ({
    center: node.center,
    radius: node.radius,
    axis: node.axis,
    first: node.first,
    second: node.second,
  })),
  carriedRadiusMatches: carriedRadiusMatches.length,
  rejectedClaim: {
    cells: rejected,
    canonicalRunes: rejected.map(cell => T[at(cell)]),
  },
  decision:
    'The C-F-C value formula is reproducible, but the canonical grid contains no radius-3 C-F-C node. Carrying the GO radius therefore selects zero physical sources, so the source-state chain stops at canonical GO.',
}, null, 2));
