'use strict';

const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');

const grid = corpus.pages
  .filter((page) => page.page <= 2)
  .flatMap((page) => page.indices);
const T = corpus.translit;
assert.equal(grid.length, 729);

/** @param {number[]} cell @returns {number} */
function at(cell) {
  return grid[(cell[0] - 1) * 27 + cell[1] - 1];
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return (value % 29 + 29) % 29;
}

/** @param {number} value @returns {number} */
function phi(value) {
  let result = value;
  let remaining = value;
  for (let factor = 2; factor * factor <= remaining; factor += 1) {
    if (remaining % factor !== 0) continue;
    while (remaining % factor === 0) remaining /= factor;
    result -= result / factor;
  }
  if (remaining > 1) result -= result / remaining;
  return result;
}

/** @param {number} value @returns {number} */
function mu(value) {
  let sign = 1;
  let remaining = value;
  for (let factor = 2; factor * factor <= remaining; factor += 1) {
    if (remaining % factor !== 0) continue;
    remaining /= factor;
    sign = -sign;
    if (remaining % factor === 0) return 0;
  }
  return remaining > 1 ? -sign : sign;
}

/** @param {number[]} a @param {number[]} b @returns {boolean} */
function same(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}

/**
 * @param {{raw:number[]}} mirror
 * @returns {{derived:number[],phase:number,key:number[]}}
 */
function deriveKey(mirror) {
  const derived = [mirror.raw[0], phi(mirror.raw[1]), mirror.raw[2]];
  const phase = mod29(
    derived.reduce((sum, value) => sum + mu(phi(value)), 0)
  ) % 3;
  return {
    derived,
    phase,
    key: derived.slice(phase).concat(derived.slice(0, phase)),
  };
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
        if ([...first, ...second].some((value) => value < 1 || value > 27)) {
          break;
        }
        const center = [row, column];
        if (at(first) === at(second) && at(center) !== 0) {
          mirrors.push({
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
}

// Frozen from the already selected conditional SOON block.
const soonKey = [28, 20, 4]; // EA-L-R
const soonCipherCells = [[25, 16], [25, 17], [25, 18], [25, 19]];
const soonPlain = soonCipherCells.map((cell, index) =>
  mod29(at(cell) - soonKey[index % soonKey.length])
);
assert.deepEqual(soonPlain.map((value) => T[value]), ['S', 'O', 'O', 'N']);

const endpoint = [25, 19];
const readDirection = [0, 1];
assert.equal(T[at(endpoint)], 'H');

// The endpoint coordinates provide the two second-totient distances.
const rowDistance = phi(phi(endpoint[0]));
const columnDistance = phi(phi(endpoint[1]));
assert.equal(rowDistance, 8);
assert.equal(columnDistance, 6);
const nearDistance = Math.min(rowDistance, columnDistance);
const farDistance = Math.max(rowDistance, columnDistance);
assert.equal(nearDistance, 6);
assert.equal(farDistance, 8);

// Continue on the carried SOON ray. The two retained distances delimit the
// next source segment directly.
const segmentCells = [];
for (let distance = nearDistance; distance <= farDistance; distance += 1) {
  segmentCells.push([
    endpoint[0] + readDirection[0] * distance,
    endpoint[1] + readDirection[1] * distance,
  ]);
}
assert.deepEqual(segmentCells, [[25,25],[25,26],[25,27]]);
assert.deepEqual(segmentCells.map((cell) => T[at(cell)]), ['L','T','W']);

// The nearer coordinate distance is even, giving an exact source midpoint.
assert.equal(nearDistance % 2, 0);
const midpoint = [
  endpoint[0] + readDirection[0] * (nearDistance / 2),
  endpoint[1] + readDirection[1] * (nearDistance / 2),
];
assert.deepEqual(midpoint, [25,22]);
assert.equal(T[at(midpoint)], 'IA');

const touchingMidpoint = mirrors.filter((mirror) =>
  same(midpoint, mirror.first) ||
  same(midpoint, mirror.center) ||
  same(midpoint, mirror.second)
);
assert.equal(touchingMidpoint.length, 2);

// Source-only tie break: choose the mirror whose axis is perpendicular to the
// carried horizontal read direction. There is exactly one.
const perpendicular = touchingMidpoint.filter((mirror) =>
  mirror.axis[0] * readDirection[0] +
  mirror.axis[1] * readDirection[1] === 0
);
assert.equal(perpendicular.length, 1);
const selected = perpendicular[0];
assert.deepEqual(selected.raw.map((value) => T[value]), ['IA','IA','IA']);
assert.deepEqual(selected.axis, [1,0]);
assert.equal(selected.radius, 1);

const derived = deriveKey(selected);
assert.deepEqual(derived.derived.map((value) => T[value]), ['IA','E','IA']);
assert.equal(derived.phase, 1);
assert.deepEqual(derived.key.map((value) => T[value]), ['E','IA','IA']);

const cipher = segmentCells.map(at);
const plain = cipher.map((value, index) =>
  mod29(value - derived.key[index % derived.key.length])
);
assert.deepEqual(plain.map((value) => T[value]), ['TH','E','N']);
assert.deepEqual(
  plain.map((value, index) =>
    mod29(value + derived.key[index % derived.key.length])
  ),
  cipher
);

console.log(JSON.stringify({
  status: 'PASS',
  classification: 'conditional deterministic continuation from selected SOON state',
  frozenSoon: {
    key: soonKey.map((value) => T[value]),
    ciphertext: soonCipherCells.map((cell) => T[at(cell)]),
    plaintext: soonPlain.map((value) => T[value]),
    endpoint,
    readDirection,
  },
  endpointState: {
    phi2Row: rowDistance,
    phi2Column: columnDistance,
    nearDistance,
    farDistance,
    segmentCells,
    ciphertext: cipher.map((value) => T[value]),
    midpoint,
    midpointRune: T[at(midpoint)],
  },
  midpointMirrors: touchingMidpoint.map((mirror) => ({
    runes: mirror.raw.map((value) => T[value]),
    axis: mirror.axis,
    radius: mirror.radius,
  })),
  selectedMirror: {
    runes: selected.raw.map((value) => T[value]),
    axis: selected.axis,
    derived: derived.derived.map((value) => T[value]),
    phase: derived.phase,
    key: derived.key.map((value) => T[value]),
  },
  plaintextInspectedAfterSelection: plain.map((value) => T[value]),
  decision:
    'Granted the already selected SOON state and the midpoint/perpendicular-mirror continuation rule, the next block is fixed before decryption and yields THEN. This remains conditional because that continuation rule was reconstructed after the public route was known.',
}, null, 2));
