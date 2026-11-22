'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const grid = corpus.pages.filter(page => page.page <= 2).flatMap(page => page.indices);
const T = corpus.translit;
assert.equal(grid.length, 729);

const at = cell => grid[(cell[0] - 1) * 27 + cell[1] - 1];
const inBounds = cell =>
  cell[0] >= 1 && cell[0] <= 27 && cell[1] >= 1 && cell[1] <= 27;
const mod = value => ((value % 29) + 29) % 29;
const n0 = cell => 27 * (cell[0] - 1) + cell[1];
const n1 = cell => 27 * (cell[1] - 1) + 28 - cell[0];
const n2 = cell => 730 - n0(cell);
const n3 = cell => 730 - n1(cell);

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

/** @param {number} a @param {number} b @returns {number} */
function gcd2(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

const axes = [[1, 0], [0, 1], [1, 1], [1, -1]];
const triples = [];

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
        triples.push({
          first,
          center,
          second,
          axis,
          radius,
          raw: [at(first), at(center), at(second)],
        });
      }
    }
  }
}

const runes = values => values.map(value => T[value]);
const straightMatches = raw => triples.filter(node =>
  node.raw[0] === raw[0] &&
  node.raw[1] === raw[1] &&
  node.raw[2] === raw[2]
);

// Frozen MAY source/ciphertext.
const may = {
  source: {
    raw: [16, 22, 25],
    center: [14, 13],
    first: [11, 13],
    second: [17, 13],
    radius: 3,
    axis: [1, 0],
  },
  cells: [[18, 11], [18, 12], [18, 13]],
  readDirection: [0, 1],
};

assert.deepEqual(runes(may.source.raw), ['T', 'OE', 'AE']);
assert.deepEqual(runes(may.cells.map(at)), ['G', 'C', 'OE']);

// Source-selected BE raw values and physical anchor.
const beFirst = may.source.raw[0] - may.source.radius;
const beCenter = beFirst + phi(may.source.radius);
const beThird = at(may.cells[1]);
const beRaw = [beFirst, beCenter, beThird];

assert.deepEqual(runes(beRaw), ['P', 'S', 'C']);

const beRawMatches = straightMatches(beRaw);
assert.equal(beRawMatches.length, 2);

const expectedBeFirstCell = [
  may.source.center[0],
  may.source.center[1] + phi(may.source.radius),
];
const beMatches = beRawMatches.filter(node =>
  (node.first[0] === expectedBeFirstCell[0] &&
   node.first[1] === expectedBeFirstCell[1]) ||
  (node.second[0] === expectedBeFirstCell[0] &&
   node.second[1] === expectedBeFirstCell[1])
);
assert.equal(beMatches.length, 1);
const beNode = beMatches[0];

assert.deepEqual(beNode.first, [14, 15]);
assert.deepEqual(beNode.center, [20, 9]);
assert.deepEqual(beNode.second, [26, 3]);
assert.equal(beNode.radius, 6);
assert.deepEqual(beNode.axis, [1, -1]);

// BE ciphertext geometry.
const beStart = [
  may.source.second[0] + phi(may.source.raw[0]),
  may.cells[1][1],
];
const beRead = [
  Math.sign(may.source.axis[0] - may.readDirection[0]),
  Math.sign(may.source.axis[1] - may.readDirection[1]),
];
const beLength = phi(beNode.radius);
const beCells = Array.from({ length: beLength }, (_, index) => [
  beStart[0] + beRead[0] * index,
  beStart[1] + beRead[1] * index,
]);

assert.deepEqual(beStart, [25, 12]);
assert.deepEqual(beRead, [1, -1]);
assert.equal(beLength, 2);
assert.deepEqual(beCells, [[25, 12], [26, 11]]);
assert.deepEqual(runes(beCells.map(at)), ['U', 'R']);

// BE operation gate. Candidate center handling predicts the next raw source.
const beDirect = [...beNode.raw];
const beCenterPhi = [beNode.raw[0], phi(beNode.raw[1]), beNode.raw[2]];

/** @param {number[]} key @returns {number[]} */
function predictAfterBe(key) {
  const sumOuter = key[0] + key[2];
  return [
    mod(key[1] + beNode.radius),
    mod(sumOuter + beNode.radius),
    mod(sumOuter - beNode.radius),
  ];
}

const directTheRaw = predictAfterBe(beDirect);
const transformedTheRaw = predictAfterBe(beCenterPhi);

assert.deepEqual(runes(directTheRaw), ['NG', 'A', 'EO']);
assert.deepEqual(runes(transformedTheRaw), ['X', 'A', 'EO']);

const directTheMatches = straightMatches(directTheRaw);
const transformedTheMatches = straightMatches(transformedTheRaw);
assert.equal(directTheMatches.length, 1);
assert.equal(transformedTheMatches.length, 0);

const theNode = directTheMatches[0];
assert.deepEqual(theNode.first, [6, 24]);
assert.deepEqual(theNode.center, [10, 20]);
assert.deepEqual(theNode.second, [14, 16]);
assert.equal(theNode.radius, 4);
assert.deepEqual(theNode.axis, [1, -1]);

// BE direct is therefore selected before BE plaintext inspection.
const beKey = beDirect;
const bePlaintext = beCells.map(
  (cell, index) => mod(at(cell) - beKey[index % beKey.length])
);
assert.deepEqual(runes(bePlaintext), ['B', 'E']);

// THE start uses the selected BE center scalar as the vertical jump from the
// frozen BE endpoint.
const theStart = [
  beCells.at(-1)[0] - beKey[1],
  beCells.at(-1)[1],
];
assert.deepEqual(theStart, [11, 11]);
assert.equal(T[at(theStart)], 'D');

// Reuse the frozen Reports 02/03 geometry forecast from the BE state.
const axisScore =
  mu(n2(beCells[0]) + n0(beNode.center)) +
  mu(gcd2(n1(beCells.at(-1)), n2(beCells.at(-1))));
assert.equal(axisScore, 0); // horizontal

const tau = mod(mu(n3(beCells.at(-1))) + phi(beNode.raw[1])) % 2;
assert.equal(tau, 1); // leftmost = beginning

const theRead = [0, 1];
const theLength = phi(theNode.radius);
const theCells = Array.from({ length: theLength }, (_, index) => [
  theStart[0],
  theStart[1] + index,
]);

assert.equal(theLength, 2);
assert.deepEqual(theCells, [[11, 11], [11, 12]]);
assert.deepEqual(runes(theCells.map(at)), ['D', 'P']);

// Prospective THE operation gate. Let t=phi(radius). The candidate derived
// center determines the third component of the next source.
const t = phi(theNode.radius);
const nextRadius = theNode.radius + t;
assert.equal(t, 2);
assert.equal(nextRadius, 6);

const theDirect = [...theNode.raw];
const theCenterPhi = [
  theNode.raw[0],
  phi(theNode.raw[1]),
  theNode.raw[2],
];

/** @param {number[]} key @returns {number[]} */
function predictAfterThe(key) {
  return [
    mod(theNode.radius - t),
    mod(theNode.radius + t),
    mod(key[1] - t),
  ];
}

const directDeathRaw = predictAfterThe(theDirect);
const transformedDeathRaw = predictAfterThe(theCenterPhi);

assert.deepEqual(runes(directDeathRaw), ['TH', 'G', 'OE']);
assert.deepEqual(runes(transformedDeathRaw), ['TH', 'G', 'G']);

const directDeathMatches = straightMatches(directDeathRaw);
const transformedDeathMatches = straightMatches(transformedDeathRaw);
assert.equal(directDeathMatches.length, 1);
assert.equal(transformedDeathMatches.length, 0);
assert.equal(directDeathMatches[0].radius, nextRadius);

const deathNode = directDeathMatches[0];
assert.deepEqual(deathNode.first, [14, 1]);
assert.deepEqual(deathNode.center, [14, 7]);
assert.deepEqual(deathNode.second, [14, 13]);
assert.deepEqual(deathNode.axis, [0, 1]);
assert.equal(deathNode.radius, 6);

// THE direct is selected before plaintext inspection.
const theKey = theDirect;
const thePlaintext = theCells.map(
  (cell, index) => mod(at(cell) - theKey[index % theKey.length])
);
assert.deepEqual(runes(thePlaintext), ['TH', 'E']);

console.log(JSON.stringify({
  status: 'PASS',
  be: {
    source: runes(beNode.raw),
    globalRawMatches: beRawMatches.length,
    anchoredMatches: beMatches.length,
    cells: beCells,
    ciphertext: runes(beCells.map(at)),
    operationGate: {
      directPrediction: runes(directTheRaw),
      directMatches: directTheMatches.length,
      centerPhiPrediction: runes(transformedTheRaw),
      centerPhiMatches: transformedTheMatches.length,
      selected: 'direct',
    },
    plaintextAfterSelection: runes(bePlaintext),
  },
  the: {
    source: runes(theNode.raw),
    sourceCoordinates: {
      first: theNode.first,
      center: theNode.center,
      second: theNode.second,
      radius: theNode.radius,
      axis: theNode.axis,
    },
    start: theStart,
    forecast: { axisScore, tau, readDirection: theRead },
    lengthFromPhiRadius: theLength,
    cells: theCells,
    ciphertext: runes(theCells.map(at)),
    operationGate: {
      directPrediction: runes(directDeathRaw),
      directMatches: directDeathMatches.length,
      centerPhiPrediction: runes(transformedDeathRaw),
      centerPhiMatches: transformedDeathMatches.length,
      selectedNextRadius: nextRadius,
      selected: 'direct',
    },
    plaintextAfterSelection: runes(thePlaintext),
  },
  nextSource: {
    runes: runes(deathNode.raw),
    first: deathNode.first,
    center: deathNode.center,
    second: deathNode.second,
    radius: deathNode.radius,
    axis: deathNode.axis,
  },
  decision:
    'MAY geometry fixes BE; next-source existence selects direct BE and the unique NG-A-EO source. BE geometry fixes D,P; a second next-source existence gate selects direct THE and the unique TH-G-OE radius-6 source before either plaintext is scored.',
}, null, 2));
