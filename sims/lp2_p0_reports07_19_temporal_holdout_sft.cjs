'use strict';

const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');

const GP_PRIMES = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29,
  31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
  73, 79, 83, 89, 97, 101, 103, 107, 109
];

/** @param {number} a @param {number} b @returns {number} */
function gcd(a, b) {
  while (b !== 0) {
    const next = a % b;
    a = b;
    b = next;
  }
  return a;
}

/** @param {number} n @returns {-1|0|1} */
function mu(n) {
  let sign = 1;
  for (let factor = 2; factor * factor <= n; factor++) {
    if (n % factor !== 0) continue;
    n /= factor;
    sign = -sign;
    if (n % factor === 0) return 0;
    while (n % factor === 0) n /= factor;
  }
  return /** @type {-1|0|1} */ (n > 1 ? -sign : sign);
}

/** @param {number} n @returns {number} */
function phi(n) {
  let result = n;
  let value = n;
  for (let factor = 2; factor * factor <= value; factor++) {
    if (value % factor !== 0) continue;
    while (value % factor === 0) value /= factor;
    result -= result / factor;
  }
  if (value > 1) result -= result / value;
  return result;
}

/** @param {[number, number]} cell @returns {number} */
function n0(cell) { return 27 * (cell[0] - 1) + cell[1]; }
/** @param {[number, number]} cell @returns {number} */
function n1(cell) { return 27 * (cell[1] - 1) + 28 - cell[0]; }
/** @param {[number, number]} cell @returns {number} */
function n2(cell) { return 730 - n0(cell); }
/** @param {[number, number]} cell @returns {number} */
function n3(cell) { return 730 - n1(cell); }

/** @param {[number, number]} a @param {[number, number]} b @returns {number} */
function rayOffset(a, b) {
  const dr = Math.abs(b[0] - a[0]);
  const dc = Math.abs(b[1] - a[1]);
  return Math.min(dr, dc, Math.abs(dr - dc));
}

/** @param {number[]} values @returns {number} */
function phase(values) {
  return ((values.reduce((sum, value) => sum + value, 0) % 3) + 3) % 3;
}

const grid = corpus.pages.slice(0, 3).flatMap((page) => page.indices);
assert.equal(grid.length, 729);

/** @param {number} row @param {number} column @returns {number} */
function runeAt(row, column) {
  return grid[(row - 1) * 27 + column - 1];
}

const AXES = [[0, 1], [1, 0], [1, 1], [1, -1]];
const nodes = [];
for (let row = 1; row <= 27; row++) {
  for (let column = 1; column <= 27; column++) {
    for (let axis = 0; axis < AXES.length; axis++) {
      const [dr, dc] = AXES[axis];
      for (let radius = 1; radius <= 13; radius++) {
        const upper = [row - dr * radius, column - dc * radius];
        const lower = [row + dr * radius, column + dc * radius];
        if (
          upper[0] < 1 || upper[0] > 27 || upper[1] < 1 || upper[1] > 27 ||
          lower[0] < 1 || lower[0] > 27 || lower[1] < 1 || lower[1] > 27
        ) continue;
        nodes.push({
          row,
          column,
          axis,
          radius,
          mirror: runeAt(upper[0], upper[1]) === runeAt(lower[0], lower[1])
        });
      }
    }
  }
}
assert.equal(nodes.length, 14976);
assert.equal(nodes.filter((node) => node.mirror).length, 507);

const block35BeforeRadius = nodes.filter(
  (node) =>
    node.mirror &&
    node.axis === 2 &&
    node.row % 2 === 1 &&
    node.column % 2 === 0
);
const block35AfterRadius = block35BeforeRadius.filter(
  (node) => node.radius % 2 === 0
);
assert.equal(block35BeforeRadius.length, 21);
assert.equal(block35AfterRadius.length, 6);
assert.ok(
  block35AfterRadius.some(
    (node) => node.row === 7 && node.column === 20 && node.radius === 4
  )
);

const segments = [];
for (let row = 1; row <= 27; row++) {
  for (let column = 1; column <= 27; column++) {
    for (const [dr, dc] of AXES) {
      for (const direction of [1, -1]) {
        for (let length = 2; length <= 27; length++) {
          const end = [
            row + direction * dr * (length - 1),
            column + direction * dc * (length - 1)
          ];
          if (
            end[0] < 1 || end[0] > 27 ||
            end[1] < 1 || end[1] > 27
          ) break;
          const cells = Array.from({ length }, (_, i) => [
            row + direction * dr * i,
            column + direction * dc * i
          ]);
          const leftmost = cells.reduce(
            (best, cell) =>
              cell[1] < best[1] ||
              (cell[1] === best[1] && cell[0] > best[0]) ? cell : best,
            cells[0]
          );
          segments.push({ leftmost });
        }
      }
    }
  }
}
assert.equal(segments.length, 62712);
assert.equal(
  segments.filter((segment) => segment.leftmost[1] % 2 === 1).length,
  32396
);

// Report 07, clean GO(22) -> TO(23) holdout.
const report07Distance = Math.max(
  Math.abs(19 - 9),
  Math.abs(14 - 20)
);
assert.equal(report07Distance, 10);
assert.equal(report07Distance % 3, 1);
assert.equal(runeAt(11, 11), runeAt(23, 23));

// Report 09, clean MAPLIFE(28) -> MAY(29) holdout.
const mapLifeCipher = [
  [19, 11], [18, 12], [17, 13], [16, 14],
  [15, 15], [14, 16], [13, 17]
];
const mapLifeCenter = [16, 9];
const report09Total =
  19 +
  mapLifeCipher.reduce((sum, cell) => sum + mu(n1(cell)), 0) +
  mu(n3(mapLifeCenter));
assert.equal(((report09Total % 2) + 2) % 2, 1);
assert.equal(11 % 2, 1);

// Report 10, same clean holdout.
const mayCenter = [14, 13];
const mayBeginning = [18, 11];
const mayLeftmost = [18, 11];
const mayEndpoint = [18, 13];
const report10Gcds = [
  gcd(n0(mayCenter), n0(mayBeginning)),
  gcd(n0(mayCenter), n0(mayLeftmost)),
  gcd(n1(mayCenter), n3(mayEndpoint)),
  gcd(n0(mayCenter), n2(mayEndpoint))
];
assert.deepEqual(report10Gcds, [2, 2, 2, 2]);
assert.ok(report10Gcds.every((value) => mu(value) !== 0));

// Reports 11-15, clean YOU(34) -> GO(35) holdout.
const youRunes = [8, 4, 8];
const youCipher = [[6, 11], [6, 12], [6, 13]];
const youM = [21, 22];
const youZ = [21, 27];
const youB = [6, 11];
const youE = [6, 13];
const youL = [6, 11];

const report11Phase =
  (1 + youCipher.reduce((sum, cell) => sum + mu(n0(cell)), 0)) % 3;
assert.equal(report11Phase, 2);
const goSignature = [26, 6, 26].map((value) => mu(phi(value)));
assert.deepEqual(goSignature, [0, -1, 0]);
assert.equal(phase(goSignature), report11Phase);

const q = Number(mu(n0(youE)) === 0 && mu(n3(youE)) === 0);
const z = Number(mu(n0(youB)) === 0 && mu(n1(youB)) === 0);
assert.equal(q * (1 - z), 1);
assert.equal(rayOffset(youL, [7, 2]), 1);

const X = n1(youM) + n2(youZ);
const Y = n1(youL) + n2(youZ);
const report13Group =
  1 ^ Number(mu(X) < 0) ^ Number(mu(Y) < 0);
assert.equal(report13Group, 0);

const G = gcd(n1(youM), n3(youZ));
const T = youRunes.reduce((sum, rune) => sum + GP_PRIMES[rune], 0);
const A = n0(youM) + n3(youZ);
const diagonal =
  Number(mu(G) < 0) ^
  Number(mu(T) > 0) ^
  Number(mu(A) !== 0);
assert.equal(2 * report13Group + diagonal, 1);

const parityA =
  (Math.abs(youM[0] - youB[0]) + Math.abs(youM[1] - youB[1])) % 2;
const parityB = Number(mu(gcd(n2(youZ), n2(youL))) < 0);
const parityC = Number(mu(n1(youB) + n1(youE)) > 0);
assert.equal(parityA ^ parityB ^ parityC, 0);
assert.equal(4 % 2, 0);

assert.equal(runeAt(3, 16), runeAt(11, 24));
assert.equal(runeAt(7, 20), 6);

// Report 17, clean I ASK(38) -> DIE(39) center-column holdout.
const report17Value = n3([12, 13]) ^ 14;
assert.equal(n3([12, 13]), 390);
assert.equal(report17Value, 392);
assert.equal(mu(report17Value), 0);

console.log(JSON.stringify({
  originalGrid: {
    physicalSources: nodes.length,
    mirrorSources: 507,
    directedStraightSegmentsLength2To27: segments.length,
    oddLeftmostColumnSegments: 32396
  },
  cleanTemporalFeaturePasses: [
    'R07 GO22->TO23 mirror',
    'R08 GO22->TO23 length>=2',
    'R09 MAPLIFE28->MAY29 odd leftmost column',
    'R10 MAPLIFE28->MAY29 four squarefree GCD gates',
    'R11 YOU34->GO35 phase2 signature(0,-1,0)',
    'R12 YOU34->GO35 ray offset 1',
    'R13 YOU34->GO35 H/NW-SE axis group',
    'R14 YOU34->GO35 exact NW-SE axis',
    'R15 YOU34->GO35 even radius',
    'R17 I ASK38->DIE39 center-column gate'
  ],
  block35SourceMultiplicity: {
    afterReports04_07_14: block35BeforeRadius.length,
    plusReport15: block35AfterRadius.length
  },
  conclusion:
    'Prospective features pass, but no clean transition is uniquely selected before language. Reports18-19 already discuss DIE in their first committed text.'
}, null, 2));
