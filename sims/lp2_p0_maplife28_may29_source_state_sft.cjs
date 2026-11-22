'use strict';

/**
 * SFT: source-state MAY geometry plus prospective BE gate.
 *
 * Frozen predecessor:
 * - source-selected direct EO-X-I radius1
 * - ciphertext R(19,11) -> ... -> O(13,17), read up-right
 * - next source T-OE-AE radius3 is already selected by the MAPLIFE
 *   prospective source gate and physically linked at AE(17,13)
 *
 * MAY geometry:
 * 1. Shift prior MAPLIFE start R one row upward by prior radius1 -> G(18,11).
 *    Rune check: R4 + phi(O3)=2 -> G6.
 * 2. T-OE-AE is vertical, so read horizontally with the predecessor's
 *    positive column sign -> right.
 * 3. Use selected source radius3 as length -> G,C,OE.
 *
 * MAY operation gate:
 * - direct center value OE22 predicts next raw
 *      [center+r, middleCipher+center, middleCipher] = AE-IA-C,
 *   which has zero straight-triple occurrences.
 * - center-phi changes OE22 to I10 and predicts P-S-C.
 *   P-S-C occurs at radii1 and6; twice the MAY radius3 uniquely selects
 *   the radius6 diagonal occurrence centered S(20,9).
 * Thus center-phi is selected prospectively before MAY plaintext inspection.
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

/** @param {number[]} raw @returns {object[]} */
function straightMatches(raw) {
  return triples.filter(node =>
    node.raw[0] === raw[0] &&
    node.raw[1] === raw[1] &&
    node.raw[2] === raw[2]
  );
}

// Frozen MAPLIFE state and source-selected MAY node.
const priorNode = triples.find(node =>
  nodeRunes(node).join('-') === 'EO-X-I' &&
  same(node.center, [16, 9]) &&
  node.radius === 1
);
assert.ok(priorNode);

const priorStart = [19, 11];
const priorEndpoint = [13, 17];
const priorRead = [-1, 1];
assert.equal(corpus.translit[at(priorStart)], 'R');
assert.equal(corpus.translit[at(priorEndpoint)], 'O');

const mayNode = triples.find(node =>
  nodeRunes(node).join('-') === 'T-OE-AE' &&
  same(node.center, [14, 13]) &&
  node.radius === 3
);
assert.ok(mayNode);
assert.deepEqual(mayNode.first, [11, 13]);
assert.deepEqual(mayNode.second, [17, 13]);
assert.deepEqual(mayNode.axis, [1, 0]);

// Shift MAPLIFE start one prior radius upward.
const mayStart = [
  priorStart[0] - priorNode.axis[0] * priorNode.radius,
  priorStart[1] - priorNode.axis[1] * priorNode.radius,
];
assert.deepEqual(mayStart, [18, 11]);
assert.equal(corpus.translit[at(mayStart)], 'G');

// Rune-value cross-check.
assert.equal(
  mod29(at(priorStart) + phi(at(priorEndpoint))),
  at(mayStart)
);
assert.equal(at(mayStart), 6);

// Vertical source -> horizontal read, retaining positive prior column sign.
const mayRead = [0, Math.sign(priorRead[1])];
assert.deepEqual(mayRead, [0, 1]);

const mayLength = mayNode.radius;
assert.equal(mayLength, 3);
const mayCells = Array.from({ length: mayLength }, (_, index) => [
  mayStart[0],
  mayStart[1] + index,
]);
assert.deepEqual(mayCells, [[18, 11], [18, 12], [18, 13]]);
assert.deepEqual(
  mayCells.map(cell => corpus.translit[at(cell)]),
  ['G', 'C', 'OE']
);

// Bounded MAY operation candidates.
const directRaw = [...mayNode.raw];
const centerPhiRaw = [
  mayNode.raw[0],
  phi(mayNode.raw[1]),
  mayNode.raw[2],
];
const directAligned = align(directRaw);
const centerPhiAligned = align(centerPhiRaw);

assert.deepEqual(
  centerPhiAligned.map(value => corpus.translit[value]),
  ['T', 'I', 'AE']
);

const middleCipher = at(mayCells[1]);
assert.equal(middleCipher, 5);

/**
 * @param {number} derivedCenter
 * @returns {number[]}
 */
function nextRawFromDerivedCenter(derivedCenter) {
  return [
    mod29(derivedCenter + mayNode.radius),
    mod29(middleCipher + derivedCenter),
    middleCipher,
  ];
}

const directNextRaw = nextRawFromDerivedCenter(mayNode.raw[1]);
const centerPhiNextRaw = nextRawFromDerivedCenter(phi(mayNode.raw[1]));

assert.deepEqual(
  directNextRaw.map(value => corpus.translit[value]),
  ['AE', 'IA', 'C']
);
assert.deepEqual(
  centerPhiNextRaw.map(value => corpus.translit[value]),
  ['P', 'S', 'C']
);

const directNextMatches = straightMatches(directNextRaw);
const centerPhiNextMatches = straightMatches(centerPhiNextRaw);
assert.equal(directNextMatches.length, 0);
assert.equal(centerPhiNextMatches.length, 2);

const doubledRadius = 2 * mayNode.radius;
assert.equal(doubledRadius, 6);
const selectedBeMatches = centerPhiNextMatches.filter(
  node => node.radius === doubledRadius
);
assert.equal(selectedBeMatches.length, 1);
const beNode = selectedBeMatches[0];

assert.deepEqual(nodeRunes(beNode), ['P', 'S', 'C']);
assert.deepEqual(beNode.first, [14, 15]);
assert.deepEqual(beNode.center, [20, 9]);
assert.deepEqual(beNode.second, [26, 3]);
assert.equal(beNode.radius, 6);
assert.deepEqual(beNode.axis, [1, -1]);

// Only after operation/source selection, decrypt MAY.
const ciphertext = mayCells.map(at);
const plaintext = ciphertext.map((value, index) =>
  mod29(value - centerPhiAligned[index % centerPhiAligned.length])
);

assert.deepEqual(
  plaintext.map(value => corpus.translit[value]),
  ['M', 'A', 'Y']
);
assert.deepEqual(
  plaintext.map((value, index) =>
    mod29(value + centerPhiAligned[index % centerPhiAligned.length])
  ),
  ciphertext
);

console.log(JSON.stringify({
  status: 'PASS',
  source: 'original LP2 p0-p2 27x27 grid',
  frozenMaplifeState: {
    node: nodeRunes(priorNode),
    start: priorStart,
    endpoint: priorEndpoint,
    readDirection: priorRead,
  },
  mayGeometry: {
    node: nodeRunes(mayNode),
    coordinates: {
      first: mayNode.first,
      center: mayNode.center,
      second: mayNode.second,
      radius: mayNode.radius,
    },
    start: mayStart,
    readDirection: mayRead,
    length: mayLength,
    ciphertextCells: mayCells,
  },
  operationGate: {
    directPrediction: directNextRaw.map(value => corpus.translit[value]),
    directMatches: directNextMatches.length,
    centerPhiPrediction: centerPhiNextRaw.map(value => corpus.translit[value]),
    centerPhiMatches: centerPhiNextMatches.map(node => ({
      center: node.center,
      radius: node.radius,
      axis: node.axis,
    })),
    doubledRadius,
    selectedNextSource: nodeRunes(beNode),
    selectedNextSourceCoordinates: {
      first: beNode.first,
      center: beNode.center,
      second: beNode.second,
      radius: beNode.radius,
      axis: beNode.axis,
    },
    selectedOperation: 'center-phi',
    alignedKey: centerPhiAligned.map(value => corpus.translit[value]),
  },
  decryptedOnlyAfterSelection: plaintext.map(value => corpus.translit[value]),
  decision:
    'MAPLIFE state fixes MAY geometry. The next-source existence gate rejects direct MAY and selects center-phi because only it predicts an existing P-S-C source; doubling MAY radius selects the radius-6 placement. T-I-AE then decrypts the frozen G,C,OE cells to M,A,Y.',
}, null, 2));
