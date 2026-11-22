'use strict';

/**
 * SFT: audit the external post-I-ASK DIE continuation on unchanged LP2 pp0-2.
 *
 * Scope:
 * - fixed external outgoing forecast after block 38 I ASK;
 * - Reports 00-18 reproduced as source/key/cipher geometry gates;
 * - Report 19 applied as the published two-distance start filter;
 * - both direct and center-totient key operations admitted exactly as Report 00;
 * - no dictionary or plaintext scoring enters the census.
 *
 * Run from repository root:
 *   node sims/lp2_p0_27square_after_iask_die_ambiguity_sft.cjs
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

const at = (row, column) => tape[(row - 1) * 27 + column - 1];
const n0 = (row, column) => 27 * (row - 1) + column;
const n1 = (row, column) => 27 * (column - 1) + 28 - row;
const n2 = (row, column) => 730 - n0(row, column);
const n3 = (row, column) => 730 - n1(row, column);
const mod = (value, modulus) => ((value % modulus) + modulus) % modulus;

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

/** @param {number[]} key @returns {number[]} */
function signature(key) {
  return key.map(value => mu(phi(value)));
}

/** @param {number[]} values @returns {number} */
function phase(values) {
  return mod(values.reduce((sum, value) => sum + value, 0), 3);
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

const CURRENT_CENTER = [12, 13];
const CURRENT_UPPER_KEY = [11, 13];
const CURRENT_BEGINNING = [5, 17];
const CURRENT_LEFTMOST = [8, 17];
const REPORT17_ROTATED_CENTER = n3(...CURRENT_CENTER);
assert.equal(REPORT17_ROTATED_CENTER, 390);

/*
 * The published I ASK outgoing forecast fixes:
 * signature (0,+1,0), phase 1; horizontal non-mirror source; even center
 * row/column; even radius; diagonal ciphertext; leftmost = beginning;
 * odd endpoint and leftmost rows; even leftmost column; exact ray offset 0.
 */
const rawSourceAssignments = [];
for (let row = 2; row <= 26; row += 2) {
  for (let column = 2; column <= 26; column += 2) {
    for (let radius = 2; radius <= Math.min(column - 1, 27 - column); radius += 2) {
      const raw = [
        at(row, column - radius),
        at(row, column),
        at(row, column + radius),
      ];
      if (raw.some(value => value === 0) || raw[0] === raw[2]) continue;

      for (const transformCenter of [false, true]) {
        const key = [raw[0], transformCenter ? phi(raw[1]) : raw[1], raw[2]];
        const sig = signature(key);
        if (!sig.every((value, index) => value === [0, 1, 0][index])) continue;
        if (phase(sig) !== 1) continue;

        const xorValue = REPORT17_ROTATED_CENTER ^ column;
        if (xorValue !== 0 && mu(xorValue) > 0) continue;

        const aligned = [key[1], key[2], key[0]];
        rawSourceAssignments.push({
          center: [row, column],
          radius,
          raw,
          transformCenter,
          key,
          aligned,
          cells: [
            [row, column - radius],
            [row, column],
            [row, column + radius],
          ],
        });
      }
    }
  }
}

/*
 * Report 00 allows direct and center-totient operations. If they happen to
 * create the same aligned key on the same physical source, count one key
 * assignment, matching the external definition of an assignment.
 */
const sourceMap = new Map();
for (const source of rawSourceAssignments) {
  const id = JSON.stringify([source.cells, source.aligned]);
  if (!sourceMap.has(id)) sourceMap.set(id, source);
}
const sources = [...sourceMap.values()];
assert.equal(sources.length, 65);
assert.equal(new Set(sources.map(source => source.center.join(','))).size, 39);

/**
 * Enumerate source-independent ciphertext segments already satisfying
 * Reports 02-09, 12, 18, and optionally 19.
 *
 * @param {boolean} applyReport19
 * @returns {Array<object>}
 */
function enumerateSegments(applyReport19) {
  const segments = [];
  for (const rowStep of [-1, 1]) {
    for (let row = 1; row <= 27; row += 1) {
      for (let column = 1; column <= 27; column += 1) {
        const beginning = [row, column];

        if (row % 2 !== 1 || column % 2 !== 0) continue;
        if (column <= CURRENT_BEGINNING[1]) continue;
        if (rayDeviation(CURRENT_LEFTMOST, beginning) !== 0) continue;
        if (mu(n1(row, column)) < 0) continue;

        if (applyReport19
          && (chebyshev(beginning, CURRENT_BEGINNING) > 7
            || chebyshev(beginning, CURRENT_LEFTMOST) > 7)) {
          continue;
        }

        for (let length = 2; length <= 27; length += 1) {
          const endRow = row + rowStep * (length - 1);
          const endColumn = column + length - 1;
          if (endRow < 1 || endRow > 27 || endColumn > 27) break;
          if (endRow % 2 !== 1) continue;

          // Report 18 forecast after I ASK is (vertical-sector, negative-mu, right)=(0,0,1).
          if (!(Math.abs(endRow - CURRENT_UPPER_KEY[0])
            < Math.abs(endColumn - CURRENT_UPPER_KEY[1]))) {
            continue;
          }
          if (mu(n0(endRow, endColumn)) < 0) continue;

          const ciphertext = Array.from(
            { length },
            (_, index) => at(row + rowStep * index, column + index)
          );

          segments.push({
            start: beginning,
            end: [endRow, endColumn],
            length,
            rowStep,
            ciphertext,
          });
        }
      }
    }
  }
  return segments;
}

/** @param {object} source @param {object} segment @returns {boolean} */
function passesReport10(source, segment) {
  const [centerRow, centerColumn] = source.center;
  const [beginRow, beginColumn] = segment.start;
  const [endRow, endColumn] = segment.end;
  const values = [
    gcd(n0(centerRow, centerColumn), n0(beginRow, beginColumn)),
    gcd(n0(centerRow, centerColumn), n0(beginRow, beginColumn)),
    gcd(n1(centerRow, centerColumn), n3(endRow, endColumn)),
    gcd(n0(centerRow, centerColumn), n2(endRow, endColumn)),
  ];
  return values.every(value => mu(value) !== 0);
}

/** @param {boolean} applyReport19 @returns {Array<object>} */
function enumerateAssignments(applyReport19) {
  const assignments = [];
  for (const source of sources) {
    for (const segment of enumerateSegments(applyReport19)) {
      if (!passesReport10(source, segment)) continue;
      const plaintext = segment.ciphertext.map(
        (ciphertext, index) => mod(ciphertext - source.aligned[index % 3], 29)
      );
      assert.deepEqual(
        plaintext.map((plain, index) => mod(plain + source.aligned[index % 3], 29)),
        segment.ciphertext
      );
      assignments.push({
        source,
        segment,
        plaintext,
        text: plaintext.map(value => corpus.translit[value]).join(''),
      });
    }
  }
  return assignments;
}

const report18 = enumerateAssignments(false);
const report19 = enumerateAssignments(true);

const geometryId = assignment => JSON.stringify([
  assignment.source.cells,
  assignment.segment.start,
  assignment.segment.end,
]);
const segmentId = assignment => JSON.stringify([
  assignment.segment.start,
  assignment.segment.end,
]);

assert.equal(new Set(report18.map(geometryId)).size, 1080);
assert.equal(new Set(report18.map(segmentId)).size, 21);
assert.equal(report18.length, 1246);
assert.equal(new Set(report18.map(item => item.text)).size, 1216);

assert.equal(new Set(report19.map(geometryId)).size, 966);
assert.equal(new Set(report19.map(segmentId)).size, 19);
assert.equal(report19.length, 1116);
assert.equal(new Set(report19.map(item => item.text)).size, 1088);
assert.equal(new Set(report19.map(item => item.source.center.join(','))).size, 39);
assert.deepEqual(
  [...new Set(report19.map(item => item.segment.start.join(',')))].sort(),
  ['1,24', '3,22', '5,20', '7,18', '9,18']
);

const die = report19.filter(item => item.text === 'DIE');
assert.equal(die.length, 1);
assert.deepEqual(die[0].segment.start, [3, 22]);
assert.deepEqual(die[0].segment.end, [5, 24]);
assert.deepEqual(die[0].source.center, [18, 14]);
assert.equal(die[0].source.radius, 4);
assert.deepEqual(die[0].source.raw, [5, 23, 27]);
assert.equal(die[0].source.transformCenter, false);
assert.deepEqual(die[0].source.aligned, [23, 27, 5]);

const nearestCurrentCenter = sources
  .map(source => ({
    source,
    distance: chebyshev(source.center, CURRENT_CENTER),
  }))
  .sort((a, b) => a.distance - b.distance)[0];
assert.equal(nearestCurrentCenter.distance, 1);
assert.deepEqual(nearestCurrentCenter.source.center, [12, 14]);
assert.equal(chebyshev(die[0].source.center, CURRENT_CENTER), 6);

console.log(JSON.stringify({
  source: 'unchanged LP2 physical pp0-2, 729 GP29 runes',
  fixedPrefix: 'external candidate through block 38 I ASK',
  report18: {
    keyAssignments: report18.length,
    geometries: new Set(report18.map(geometryId)).size,
    orderedCiphertextSegments: new Set(report18.map(segmentId)).size,
    distinctRuneOutputs: new Set(report18.map(item => item.text)).size,
  },
  report19: {
    keyAssignments: report19.length,
    geometries: new Set(report19.map(geometryId)).size,
    orderedCiphertextSegments: new Set(report19.map(segmentId)).size,
    distinctRuneOutputs: new Set(report19.map(item => item.text)).size,
    sourceCenters: new Set(report19.map(item => item.source.center.join(','))).size,
    starts: [...new Set(report19.map(item => item.segment.start.join(',')))].sort(),
  },
  die: {
    exactLiteralAssignments: die.length,
    sourceCenter: die[0].source.center,
    sourceRadius: die[0].source.radius,
    sourceRunes: die[0].source.raw.map(value => corpus.translit[value]),
    alignedKey: die[0].source.aligned.map(value => corpus.translit[value]),
    ciphertextStart: die[0].segment.start,
    ciphertextEnd: die[0].segment.end,
  },
  nearestAdmissibleSourceCenter: {
    center: nearestCurrentCenter.source.center,
    distanceFromCurrentCenter: nearestCurrentCenter.distance,
    dieDistanceFromCurrentCenter: chebyshev(die[0].source.center, CURRENT_CENTER),
  },
  decision: 'DIE is the unique literal DIE output, but Reports 00-19 leave 966 physical geometries and 1088 distinct rune outputs. No geometry-only selector picks DIE.',
}, null, 2));
