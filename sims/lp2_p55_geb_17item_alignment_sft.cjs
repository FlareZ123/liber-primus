#!/usr/bin/env node
'use strict';

// Reproduce the page-local 17-item / 43-interior structural comparison
// between LP2 p55 and the source-authenticated 2014 Fifth-Onion GEB list.
// This is a structural test only: it does not decrypt p55 or establish reuse.

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const transcription = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'),
  'utf8'
);
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'),
  'utf8'
));
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const pages = transcription.split('%');
assert.ok(pages.length > 54, 'expected physical p55 transcription block');

function runeRuns(page) {
  return page.replace(/\/\s*/gu, '').match(/[\u16A0-\u16FF]+/gu) || [];
}
function toIndices(word) {
  return Array.from(word, rune => {
    const i = runeIndex.get(rune);
    assert.notEqual(i, undefined, 'unmapped source rune: ' + rune);
    return i;
  });
}
function boundaryPair(word) {
  return word.length === 1 ? [word[0]] : [word[0], word.at(-1)];
}
function inclusiveBoundaryDistance(pair) {
  assert.equal(pair.length, 2);
  return Math.abs(pair[0] - pair[1]) + 1;
}

// The source order is the 17-item order in the pinned 2014 Fifth-Onion README.
const gebItems = [
  { kind: 'coordinate', label: '3PI', fields: [6, 1, 3] },
  { kind: 'coordinate', label: 'LML', fields: [1, 1, 1] },
  { kind: 'digit', value: 3 },
  { kind: 'coordinate', label: 'ETOATS', fields: [19, 9, 1] },
  { kind: 'coordinate', label: '...AF', fields: [5, 3, 1] },
  { kind: 'coordinate', label: 'AMO', fields: [13, 10, 1] },
  { kind: 'coordinate', label: 'CC', fields: [8, 6, 1] },
  { kind: 'coordinate', label: 'CBIA', fields: [3, 7, 2] },
  { kind: 'coordinate', label: 'CFAF', fields: [5, 23, 6] },
  { kind: 'coordinate', label: 'SPR', fields: [1, 8, 1] },
  { kind: 'digit', value: 7 },
  { kind: 'coordinate', label: 'C[1]', fields: [4, 5, 3] },
  { kind: 'coordinate', label: 'AWDV', fields: [6, 2, 1] },
  { kind: 'coordinate', label: 'C[2]', fields: [2, 17, 5] },
  { kind: 'coordinate', label: 'SC', fields: [3, 17, 1] },
  { kind: 'coordinate', label: 'AOGS', fields: [2, 8, 1] },
  { kind: 'marker', value: 'ONION' }
];

const p54Runs = runeRuns(pages[53]);
const p55Words = runeRuns(pages[54]).map(toIndices);
const p54LastWord = p54Runs.at(-1);
const p54LastIndices = toIndices(p54LastWord);
const fullFirstWord = [...p54LastIndices, ...p55Words[0]];

const wordLengths = p55Words.map(w => w.length);
assert.deepEqual(wordLengths, [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);
assert.equal(p54LastIndices.length, 10);
assert.equal(p55Words[0].length, 1);
assert.equal(fullFirstWord.length, 11);
assert.deepEqual([fullFirstWord[0], fullFirstWord.at(-1)], [6, 21]);

const interiors = p55Words.map(w => w.slice(1, -1));
const allInterior = interiors.flat();
const coordinatePositions = gebItems
  .map((item, i) => item.kind === 'coordinate' ? i : -1)
  .filter(i => i >= 0);
const coordinateInterior = coordinatePositions.flatMap(i => interiors[i]);
const coordinateFields = gebItems
  .filter(item => item.kind === 'coordinate')
  .flatMap(item => item.fields);

assert.equal(p55Words.length, 17);
assert.equal(allInterior.length, 43);
assert.equal(coordinatePositions.length, 14);
assert.equal(coordinateInterior.length, 42);
assert.deepEqual(coordinateInterior, allInterior.slice(0, 42));
assert.equal(interiors[16].length, 1);
assert.equal(interiors[2].length, 0);
assert.equal(interiors[10].length, 0);

const p55BoundaryCount = p55Words.reduce(
  (n, w) => n + (w.length === 1 ? 1 : 2), 0
);
const fullItemBoundaryCount = p55BoundaryCount + 1; // p54 supplies first boundary of item 1
assert.equal(p55BoundaryCount, 33);
assert.equal(fullItemBoundaryCount, 34);
assert.equal(fullItemBoundaryCount, gebItems.length * 2);

function itemBoundaryPair(i) {
  if (i === 0) return [fullFirstWord[0], fullFirstWord.at(-1)];
  return [p55Words[i][0], p55Words[i].at(-1)];
}
const digitChecks = [2, 10].map(i => {
  const pair = itemBoundaryPair(i);
  return {
    item_position: i + 1,
    word_indices: p55Words[i],
    boundary_indices: pair,
    inclusive_distance: inclusiveBoundaryDistance(pair),
    expected_digit: gebItems[i].value
  };
});
assert.deepEqual(digitChecks.map(x => x.inclusive_distance), [3, 7]);
assert.deepEqual(digitChecks.map(x => x.expected_digit), [3, 7]);

const otherTwoRuneCoordinateControls = [3, 6, 13].map(i => {
  const pair = itemBoundaryPair(i);
  const distance = inclusiveBoundaryDistance(pair);
  return {
    item_position: i + 1,
    label: gebItems[i].label,
    boundary_indices: pair,
    inclusive_distance: distance,
    coordinate_fields: gebItems[i].fields,
    distance_is_a_field: gebItems[i].fields.includes(distance)
  };
});
assert.deepEqual(
  otherTwoRuneCoordinateControls.map(x => x.inclusive_distance),
  [6, 4, 21]
);
assert.ok(otherTwoRuneCoordinateControls.every(x => !x.distance_is_a_field));

const markerPair = itemBoundaryPair(16);
const marker = {
  word_indices: p55Words[16],
  boundary_indices: markerPair,
  inclusive_distance: inclusiveBoundaryDistance(markerPair),
  interior_indices: interiors[16]
};
assert.deepEqual(marker.interior_indices, [18]);
assert.equal(marker.inclusive_distance, 8); // no source interpretation established

const directIndexMatches = coordinateInterior.reduce(
  (n, x, i) => n + Number(x === coordinateFields[i]), 0
);
const oneBasedIndexMatches = coordinateInterior.reduce(
  (n, x, i) => n + Number(x + 1 === coordinateFields[i]), 0
);
const substitution = new Map();
coordinateInterior.forEach((x, i) => {
  if (!substitution.has(x)) substitution.set(x, new Set());
  substitution.get(x).add(coordinateFields[i]);
});
const monoalphabeticConflictSymbols = [...substitution.values()]
  .filter(values => values.size > 1).length;
const affineSolutions = [];
for (let a = 1; a < 29; a++) {
  for (let b = 0; b < 29; b++) {
    if (coordinateInterior.every((x, i) => (a * x + b) % 29 === coordinateFields[i])) {
      affineSolutions.push([a, b]);
    }
  }
}
assert.equal(directIndexMatches, 4);
assert.equal(oneBasedIndexMatches, 2);
assert.equal(monoalphabeticConflictSymbols, 13);
assert.equal(affineSolutions.length, 0);

console.log(JSON.stringify({
  status: 'structural alignment only; no p55 plaintext or key recovered',
  geb_item_count: gebItems.length,
  geb_coordinate_count: coordinatePositions.length,
  geb_numeric_field_count: coordinateFields.length,
  p55_page_local_word_lengths: wordLengths,
  p54_to_p55_first_item_carry: {
    p54_last_word: p54LastWord,
    p54_last_word_indices: p54LastIndices,
    p55_first_segment_indices: p55Words[0],
    full_word_indices: fullFirstWord,
    p54_interior_runes_outside_p55_page_stream: p54LastIndices.length - 1,
    full_boundary_indices: [fullFirstWord[0], fullFirstWord.at(-1)]
  },
  p55_page_local_interior_count: allInterior.length,
  coordinate_interior_count: coordinateInterior.length,
  coordinate_item_positions_1_based: coordinatePositions.map(i => i + 1),
  p55_page_local_boundary_count: p55BoundaryCount,
  full_17_item_boundary_count_after_p54_carry: fullItemBoundaryCount,
  digit_boundary_checks: digitChecks,
  other_two_rune_coordinate_controls: otherTwoRuneCoordinateControls,
  onion_marker: marker,
  direct_coordinate_stream_checks: {
    zero_based_matches: directIndexMatches,
    one_based_matches: oneBasedIndexMatches,
    monoalphabetic_conflict_symbols: monoalphabeticConflictSymbols,
    global_affine_gp29_solutions: affineSolutions
  },
  coordinate_interior_indices: coordinateInterior,
  coordinate_fields: coordinateFields
}, null, 2));
