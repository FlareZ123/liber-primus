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
const same = (a, b) => a[0] === b[0] && a[1] === b[1];
const inBounds = cell =>
  cell[0] >= 1 && cell[0] <= 27 && cell[1] >= 1 && cell[1] <= 27;
const mod = value => ((value % 29) + 29) % 29;
const n0 = cell => 27 * (cell[0] - 1) + cell[1];

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

/** @param {number[]} values @returns {number} */
function phase(values) {
  return mod(values.reduce((sum, value) => sum + mu(phi(value)), 0)) % 3;
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

// Frozen MAPLIFE state.
const current = {
  node: {
    raw: [12, 14, 10],
    center: [16, 9],
    radius: 1,
    axis: [1, 0],
  },
  start: [19, 11],
  endpoint: [13, 17],
  readDirection: [-1, 1],
  cells: [
    [19, 11],
    [18, 12],
    [17, 13],
    [16, 14],
    [15, 15],
    [14, 16],
    [13, 17],
  ],
};

assert.deepEqual(runes(current.node.raw), ['EO', 'X', 'I']);
assert.deepEqual(runes(current.cells.map(at)), ['R', 'C', 'AE', 'C', 'L', 'EO', 'O']);

const r = current.node.radius;

// Source-generate the next ordered raw triple.
const nextRaw = [
  current.node.raw[1] + 2 * r,
  current.node.raw[0] + current.node.raw[2],
  current.node.raw[0] + current.node.raw[1] - r,
];

assert.deepEqual(runes(nextRaw), ['T', 'OE', 'AE']);

const rawMatches = triples.filter(node =>
  node.raw[0] === nextRaw[0] &&
  node.raw[1] === nextRaw[1] &&
  node.raw[2] === nextRaw[2]
);
assert.equal(rawMatches.length, 3);

// The MAP word-end is an already selected cell in the current seven-cell block.
const mapWordEnd = current.cells[2];
assert.deepEqual(mapWordEnd, [17, 13]);

const linkedMatches = rawMatches.filter(node =>
  same(node.first, mapWordEnd) || same(node.second, mapWordEnd)
);
assert.equal(linkedMatches.length, 1);
const nextNode = linkedMatches[0];

assert.deepEqual(nextNode.first, [11, 13]);
assert.deepEqual(nextNode.center, [14, 13]);
assert.deepEqual(nextNode.second, [17, 13]);
assert.deepEqual(nextNode.axis, [1, 0]);
assert.equal(nextNode.radius, 3);

// Current-ciphertext phase recurrence predicts phase zero.
const predictedPhase = mod(
  current.cells.reduce((sum, cell) => sum + mu(n0(cell)), 0)
) % 3;
assert.equal(predictedPhase, 0);

const directKey = [...nextNode.raw];
const centerPhiKey = [
  nextNode.raw[0],
  phi(nextNode.raw[1]),
  nextNode.raw[2],
];
const operationCandidates = [
  { name: 'direct', key: directKey, phase: phase(directKey) },
  { name: 'center-phi', key: centerPhiKey, phase: phase(centerPhiKey) },
];

assert.deepEqual(
  operationCandidates.map(candidate => [candidate.name, candidate.phase]),
  [['direct', 1], ['center-phi', 0]]
);

const operationSurvivors = operationCandidates.filter(
  candidate => candidate.phase === predictedPhase
);
assert.equal(operationSurvivors.length, 1);
const selectedOperation = operationSurvivors[0];
assert.equal(selectedOperation.name, 'center-phi');
assert.deepEqual(runes(selectedOperation.key), ['T', 'I', 'AE']);

// Move one current-radius step opposite the current vertical source axis.
const nextStart = [
  current.start[0] - current.node.axis[0] * r,
  current.start[1] - current.node.axis[1] * r,
];
assert.deepEqual(nextStart, [18, 11]);
assert.equal(T[at(nextStart)], 'G');

// Add current read and source-axis vectors. Their row components cancel,
// leaving a rightward horizontal read.
const nextReadDirection = [
  Math.sign(current.readDirection[0] + current.node.axis[0]),
  Math.sign(current.readDirection[1] + current.node.axis[1]),
];
assert.deepEqual(nextReadDirection, [0, 1]);

// The selected next-source radius supplies the ciphertext length.
const ciphertextCells = [];
for (let index = 0; index < nextNode.radius; index += 1) {
  const cell = [
    nextStart[0] + nextReadDirection[0] * index,
    nextStart[1] + nextReadDirection[1] * index,
  ];
  assert.ok(inBounds(cell));
  ciphertextCells.push(cell);
}

assert.deepEqual(ciphertextCells, [[18, 11], [18, 12], [18, 13]]);
assert.ok(same(ciphertextCells[1], current.cells[1]));

const key = selectedOperation.key;
const ciphertext = ciphertextCells.map(at);
const plaintext = ciphertext.map(
  (value, index) => mod(value - key[index % key.length])
);

assert.deepEqual(runes(ciphertext), ['G', 'C', 'OE']);
assert.deepEqual(runes(plaintext), ['M', 'A', 'Y']);
assert.deepEqual(
  plaintext.map((value, index) => mod(value + key[index % key.length])),
  ciphertext
);

console.log(JSON.stringify({
  status: 'PASS',
  frozenCurrentState: {
    source: runes(current.node.raw),
    center: current.node.center,
    radius: r,
    sourceAxis: current.node.axis,
    ciphertextCells: current.cells,
    readDirection: current.readDirection,
  },
  nextKeySelection: {
    formula: '[center+2r, first+third, first+center-r]',
    raw: nextRaw,
    runes: runes(nextRaw),
    globalStraightTripleMatches: rawMatches.length,
    priorMapWordEnd: mapWordEnd,
    outerLinkSurvivors: linkedMatches.length,
    selected: {
      first: nextNode.first,
      center: nextNode.center,
      second: nextNode.second,
      radius: nextNode.radius,
      axis: nextNode.axis,
    },
    predictedPhase,
    operationCandidates: operationCandidates.map(candidate => ({
      name: candidate.name,
      phase: candidate.phase,
      key: runes(candidate.key),
    })),
    selectedOperation: selectedOperation.name,
  },
  nextCiphertextSelection: {
    start: nextStart,
    startRune: T[at(nextStart)],
    readDirection: nextReadDirection,
    lengthFromNextRadius: nextNode.radius,
    cells: ciphertextCells,
    sharedCurrentCell: current.cells[1],
  },
  decryptedOnlyAfterSelection: runes(plaintext),
  decision:
    'MAPLIFE source values generate three T-OE-AE occurrences; requiring an outer at the already selected MAP word-end leaves one. The phase rule selects center-phi, and current vector geometry plus the new radius fixes G,C,OE before decryption to M,A,Y.',
  caveat:
    'The raw-value recurrence and radius-as-length rule remain conditional candidates because the public route was available when they were recognized.',
}, null, 2));
