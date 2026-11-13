'use strict';
// Reproduce the source-completed 81-square / 80-square hypothesis on unchanged LP2.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} filename */
function load(filename) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', filename), 'utf8'));
}

const corpus = load('lp2-corpus.json');
const marks = load('lp2-ink-annotations.json');
const ciphertext = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const p56 = corpus.pages.find(p => p.page === 56);
const redHeading = marks.pages.find(p => p.page === 56);
assert.equal(ciphertext.length, 12956);
assert.equal(p56.indices.length, 85);
assert.deepEqual(p56.indices.slice(0, 5), [25, 11, 22, 15, 4]);
assert.equal(redHeading.red_spans[0].start, 0);
assert.equal(redHeading.red_spans[0].length, 5);
assert.ok(redHeading.large_punctuation.some(([offset, dots, ink]) => offset === 5 && dots === 13 && ink === 'red'));
assert.deepEqual(ciphertext.slice(6555, 6561), [23, 11, 1, 17, 18, 10]);
assert.deepEqual(ciphertext.slice(12950, 12956), [23, 11, 1, 17, 18, 10]);

const first = ciphertext.slice(0, 6561);
const second = ciphertext.slice(6561).concat(p56.indices.slice(0, 5));
assert.equal(first.length, 81 * 81);
assert.equal(second.length, 80 * 80);

/** @param {number} direction 0..7; source dihedral transform; @returns {Array<[number, number]>} */
function duplicatedCorners(direction) {
  const seen = new Map();
  const pairs = [];
  for (let r = 0; r < 80; r++) {
    for (let c = 0; c < 80; c++) {
      let rr = r, cc = c;
      if (direction & 1) [rr, cc] = [cc, rr];
      if (direction & 2) rr = 79 - rr;
      if (direction & 4) cc = 79 - cc;
      const k = (((first[rr * 81 + cc] * 29 + first[(rr + 1) * 81 + cc]) * 29
        + first[rr * 81 + cc + 1]) * 29 + first[(rr + 1) * 81 + cc + 1]);
      const position = r * 80 + c;
      if (seen.has(k)) {
        pairs.push([seen.get(k), position]);
      } else {
        seen.set(k, position);
      }
    }
  }
  assert.equal(seen.size, 6360);
  assert.equal(pairs.length, 40);
  return pairs;
}

const orientations = Array.from({ length: 8 }, (_, direction) => duplicatedCorners(direction));
const originalMatches = orientations.map(pairs => pairs.reduce(
  (acc, [a, b]) => acc + Number(second[a] === second[b]), 0
));
assert.deepEqual(originalMatches, [5, 2, 0, 1, 1, 0, 1, 0]);

// All 6,400 circular rotations of the exact same observed 6,400 outputs:
// preserves all output symbols and tests the complete eight-orientation choice.
const histogram = new Array(41).fill(0);
for (let shift = 0; shift < 6400; shift++) {
  let best = 0;
  for (const pairs of orientations) {
    let matches = 0;
    for (const [a, b] of pairs) {
      matches += Number(second[(a + shift) % 6400] === second[(b + shift) % 6400]);
    }
    if (matches > best) best = matches;
  }
  histogram[best]++;
}
const originalBest = Math.max(...originalMatches);
const atLeastOriginal = histogram.slice(originalBest).reduce((a, b) => a + b, 0);
assert.equal(atLeastOriginal, 589);

// Positive: a genuinely stationary unknown 29-ary lookup on the same
// source 2x2 neighborhoods must produce identical results on all 40 pairs.
const planted = new Map();
const plantedPairs = orientations[0];
for (let r = 0; r < 80; r++) {
  for (let c = 0; c < 80; c++) {
    const k = (((first[r * 81 + c] * 29 + first[(r + 1) * 81 + c]) * 29
      + first[r * 81 + c + 1]) * 29 + first[(r + 1) * 81 + c + 1]);
    planted.set(r * 80 + c, (k * 17 + 5) % 29);
  }
}
assert.equal(plantedPairs.filter(([a, b]) => planted.get(a) === planted.get(b)).length, 40);

const titlePositions = [6395, 6396, 6397, 6398, 6399];
const inputPairHitsWithTitle = orientations.map(pairs =>
  pairs.filter(([a, b]) => titlePositions.includes(a) || titlePositions.includes(b)).length
);
assert.deepEqual(inputPairHitsWithTitle, [0, 0, 0, 0, 0, 0, 1, 1]);

const output = {
  originalRunes: ciphertext.length,
  titleGlyphs: p56.indices.slice(0, 5),
  closingMark: 'p56 red 13-dot after five title runes',
  firstSquare: '81 x 81 = 6561',
  secondSquare: '80 x 80 = 6395 unresolved + 5 authentic p56',
  identicalBookends: [ciphertext.slice(6555, 6561), ciphertext.slice(12950, 12956)],
  repeatedTwoByTwoInputCount: 40,
  matchingOriginalOutputsByOrientation: originalMatches,
  greatestMatchingOriginal: originalBest,
  circularControlBetterOrEqual: atLeastOriginal,
  circularControlTotal: 6400,
  titlePositionsInRepeatedInputClasses: inputPairHitsWithTitle,
  nullMaxHistogram: histogram.map((count, matches) => ({ matches, count })).filter(row => row.count),
  positiveStationaryLookupMatches: 40,
  conclusion: 'No exact fixed four-corner decoding and no significant cross-square alignment.'
};
console.log(JSON.stringify(output, null, 2));
