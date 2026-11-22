'use strict';

/**
 * SFT: a plaintext-blind I ASK -> next-block handoff on the canonical 27x27
 * p0-2 square.
 *
 * Upstream premise:
 * - grant the externally selected route only through the conditionally recovered
 *   four-rune block at (5,17)..(8,17), whose plaintext indices are I-A-S-C/K;
 * - grant the frozen outgoing Reports 00-19 geometry already audited locally.
 *
 * The candidate next plaintext is never used to choose a source, direction,
 * transform, or length. The tie-breaking hypothesis is:
 *
 * 1. next source-center n0 = current source-center n0 + GP(trailing 3 runes);
 * 2. next ciphertext-start n0 = sum(current ciphertext rune indices) + 1;
 * 3. next source radius = current ciphertext block length;
 * 4. next ciphertext length = one three-rune key period;
 * 5. choose the diagonal row sign matching the source-center row displacement;
 * 6. among signature-equivalent center operations, require the original center
 *    rune to self-crib at the first plaintext position.
 *
 * Run:
 *   node sims/lp2_p0_27square_iask_to_next_handoff_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const tape = corpus.pages.filter(page => page.page <= 2).flatMap(page => page.indices);
assert.equal(tape.length, 729);

const PRIME_WEIGHTS = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29,
  31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
  73, 79, 83, 89, 97, 101, 103, 107, 109,
];

const at = (row, column) => tape[(row - 1) * 27 + column - 1];
const n0 = (row, column) => 27 * (row - 1) + column;
const n1 = (row, column) => 27 * (column - 1) + 28 - row;
const n2 = (row, column) => 730 - n0(row, column);
const n3 = (row, column) => 730 - n1(row, column);
const mod = (value, modulus) => ((value % modulus) + modulus) % modulus;
const gp = values => values.reduce((sum, value) => sum + PRIME_WEIGHTS[value], 0);

/** @param {number} a @param {number} b @returns {number} */
function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}

/** @param {number} n @returns {number} */
function phi(n) {
  let value = n;
  let remaining = n;
  for (let factor = 2; factor * factor <= remaining; factor += 1) {
    if (remaining % factor !== 0) continue;
    value -= value / factor;
    while (remaining % factor === 0) remaining /= factor;
  }
  if (remaining > 1) value -= value / remaining;
  return value;
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

/** @param {number} n @returns {number[]} */
function cellFromN0(n) {
  assert.ok(n >= 1 && n <= 729);
  return [Math.floor((n - 1) / 27) + 1, mod(n - 1, 27) + 1];
}

/** @param {number[]} first @param {number[]} second @returns {number} */
function chebyshev(first, second) {
  return Math.max(Math.abs(first[0] - second[0]), Math.abs(first[1] - second[1]));
}

/** @param {number[]} first @param {number[]} second @returns {number} */
function rayDeviation(first, second) {
  const dr = Math.abs(first[0] - second[0]);
  const dc = Math.abs(first[1] - second[1]);
  return Math.min(dr, dc, Math.abs(dr - dc));
}

const current = {
  sourceCenter: [12, 13],
  source: [16, 19, 28],
  cipherCells: [[5, 17], [6, 17], [7, 17], [8, 17]],
  cipher: [26, 14, 14, 21],
  plaintext: [10, 24, 15, 5],
  beginning: [5, 17],
  leftmost: [8, 17],
  upperSourceCell: [11, 13],
};

assert.deepEqual(current.cipherCells.map(cell => at(...cell)), current.cipher);
assert.deepEqual(
  current.cipher.map((value, index) =>
    mod(value - current.source[index % current.source.length], 29)
  ),
  current.plaintext
);

const trailingPeriod = current.plaintext.slice(-3);
assert.deepEqual(trailingPeriod, [24, 15, 5]);
assert.equal(gp(trailingPeriod), 163);

const nextCenterN0 = n0(...current.sourceCenter) + gp(trailingPeriod);
const nextStartN0 = current.cipher.reduce((sum, value) => sum + value, 0) + 1;
const nextCenter = cellFromN0(nextCenterN0);
const nextStart = cellFromN0(nextStartN0);

assert.equal(n0(...current.sourceCenter), 310);
assert.equal(nextCenterN0, 473);
assert.deepEqual(nextCenter, [18, 14]);
assert.equal(current.cipher.reduce((sum, value) => sum + value, 0), 75);
assert.equal(nextStartN0, 76);
assert.deepEqual(nextStart, [3, 22]);

const candidates = [];
for (let radius = 2; radius <= Math.min(nextCenter[1] - 1, 27 - nextCenter[1]); radius += 2) {
  const raw = [
    at(nextCenter[0], nextCenter[1] - radius),
    at(...nextCenter),
    at(nextCenter[0], nextCenter[1] + radius),
  ];
  if (raw.some(value => value === 0) || raw[0] === raw[2]) continue;

  for (const transformCenter of [false, true]) {
    const key = [
      raw[0],
      transformCenter ? phi(raw[1]) : raw[1],
      raw[2],
    ];
    const signature = key.map(value => mu(phi(value)));
    if (!signature.every((value, index) => value === [0, 1, 0][index])) continue;

    const xorValue = 390 ^ nextCenter[1];
    if (xorValue !== 0 && mu(xorValue) > 0) continue;
    const aligned = [key[1], key[2], key[0]];

    for (const rowStep of [-1, 1]) {
      for (let length = 2; length <= 27; length += 1) {
        const endRow = nextStart[0] + rowStep * (length - 1);
        const endColumn = nextStart[1] + length - 1;
        if (endRow < 1 || endRow > 27 || endColumn > 27) break;

        if (nextStart[0] % 2 !== 1 || nextStart[1] % 2 !== 0) continue;
        if (nextStart[1] <= current.beginning[1]) continue;
        if (rayDeviation(current.leftmost, nextStart) !== 0) continue;
        if (mu(n1(...nextStart)) < 0) continue;
        if (endRow % 2 !== 1) continue;
        if (!(Math.abs(endRow - current.upperSourceCell[0])
          < Math.abs(endColumn - current.upperSourceCell[1]))) continue;
        if (mu(n0(endRow, endColumn)) < 0) continue;
        if (chebyshev(nextStart, current.beginning) > 7
          || chebyshev(nextStart, current.leftmost) > 7) continue;

        const gcdValues = [
          gcd(n0(...nextCenter), n0(...nextStart)),
          gcd(n0(...nextCenter), n0(...nextStart)),
          gcd(n1(...nextCenter), n3(endRow, endColumn)),
          gcd(n0(...nextCenter), n2(endRow, endColumn)),
        ];
        if (gcdValues.some(value => mu(value) === 0)) continue;

        const cipher = Array.from(
          { length },
          (_, index) => at(nextStart[0] + rowStep * index, nextStart[1] + index)
        );
        const plaintext = cipher.map(
          (value, index) => mod(value - aligned[index % 3], 29)
        );
        assert.deepEqual(
          plaintext.map((value, index) => mod(value + aligned[index % 3], 29)),
          cipher
        );

        candidates.push({
          radius, raw, transformCenter, key, aligned, rowStep, length,
          end: [endRow, endColumn], cipher, plaintext,
        });
      }
    }
  }
}

assert.equal(candidates.length, 12);

const radiusSelected = candidates.filter(
  item => item.radius === current.cipher.length
);
assert.equal(radiusSelected.length, 6);

const periodSelected = radiusSelected.filter(
  item => item.length === current.source.length
);
assert.equal(periodSelected.length, 4);

const centerRowSign = Math.sign(nextCenter[0] - current.sourceCenter[0]);
assert.equal(centerRowSign, 1);
const directionSelected = periodSelected.filter(
  item => item.rowStep === centerRowSign
);
assert.equal(directionSelected.length, 2);

const selfCribSelected = directionSelected.filter(
  item => item.plaintext[0] === item.raw[1]
);
assert.equal(selfCribSelected.length, 1);

const winner = selfCribSelected[0];
assert.equal(winner.radius, 4);
assert.equal(winner.transformCenter, false);
assert.equal(winner.rowStep, 1);
assert.equal(winner.length, 3);
assert.deepEqual(winner.end, [5, 24]);
assert.deepEqual(winner.raw, [5, 23, 27]);
assert.deepEqual(winner.aligned, [23, 27, 5]);
assert.deepEqual(winner.cipher, [17, 8, 23]);
assert.deepEqual(winner.plaintext, [23, 10, 18]);

console.log(JSON.stringify({
  currentAnchor: {
    sourceCenter: current.sourceCenter,
    sourceCenterN0: n0(...current.sourceCenter),
    trailingPeriod: trailingPeriod.map(value => corpus.translit[value]),
    trailingPeriodGp: gp(trailingPeriod),
    cipherIndexSum: current.cipher.reduce((sum, value) => sum + value, 0),
  },
  arithmeticHandoff: { nextCenterN0, nextCenter, nextStartN0, nextStart },
  frozenReports00to19AfterCenterAndStart: {
    assignments: candidates.length,
    outputs: new Set(candidates.map(item => item.plaintext.join(','))).size,
    radii: [...new Set(candidates.map(item => item.radius))],
    segments: [...new Set(candidates.map(item =>
      JSON.stringify([item.rowStep, item.length, item.end])
    ))],
  },
  tieBreakCounts: {
    radiusFromCurrentBlockLength: radiusSelected.length,
    oneKeyPeriod: periodSelected.length,
    sourceCenterRowSign: directionSelected.length,
    originalCenterSelfCrib: selfCribSelected.length,
  },
  selectedBeforeLanguageScoring: {
    sourceCenter: nextCenter,
    sourceRadius: winner.radius,
    originalSource: winner.raw.map(value => corpus.translit[value]),
    alignedKey: winner.aligned.map(value => corpus.translit[value]),
    ciphertextStart: nextStart,
    ciphertextEnd: winner.end,
    ciphertext: winner.cipher.map(value => corpus.translit[value]),
  },
  decryptedOnlyAfterSelection: winner.plaintext.map(value => corpus.translit[value]),
  decision: 'This post-hoc handoff hypothesis selects one next block without consulting its plaintext. It remains a candidate parser until independently predicted on additional withheld material or otherwise source-authenticated.',
}, null, 2));
