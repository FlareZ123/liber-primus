#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const sources = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(sources, 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(sources, 'lp2-p0-physical-ink-override.json'), 'utf8'));
const gp = corpus.translit;

/** @typedef {[number, number]} Coordinate */

/** @param {string[][]} rows @param {Coordinate} coordinate */
function decode(rows, [group, position]) {
  return rows[group - 1][position - 1];
}

/** @param {string[][]} rows @param {Coordinate[]} coordinates */
function read(rows, coordinates) {
  return coordinates.map((coordinate) => decode(rows, coordinate)).join('');
}

/** @param {string[][]} rows @param {string} rune @returns {Coordinate} */
function locate(rows, rune) {
  const group = rows.findIndex((row) => row.includes(rune));
  assert.notEqual(group, -1, rune);
  return [group + 1, rows[group].indexOf(rune) + 1];
}

/** @param {number[]} values @returns {number[][]} */
function permutations(values) {
  if (values.length === 0) return [[]];
  return values.flatMap((value, i) => permutations(values.toSpliced(i, 1))
    .map((rest) => [value, ...rest]));
}

/** @param {string[]} letters @param {number[]} lengths */
function partition(letters, lengths) {
  let start = 0;
  const rows = lengths.map((length) => {
    const row = letters.slice(start, start + length);
    start += length;
    return row;
  });
  assert.equal(start, letters.length);
  return rows;
}

const salzburg = [
  ['F', 'U', 'TH', 'O', 'R', 'C', 'G', 'W'],
  ['H', 'N', 'I', 'J', 'EO', 'P', 'X', 'S'],
  ['T', 'B', 'E', 'M', 'L', 'NG', 'OE', 'D'],
  ['A', 'AE', 'Y', 'EA'],
];
/** @type {Coordinate} */
const openingStave = [3, 3];
/** @type {Coordinate[]} */
const racco = [[1, 5], [4, 1], [1, 6], [1, 6], [1, 4]];
/** @type {Coordinate[]} */
const racro = [[1, 5], [4, 1], [1, 6], [1, 5], [1, 4]];
assert.equal(read(salzburg, racco), 'RACCO');
assert.equal(read(salzburg, racro), 'RACRO');

// Domitian f. 11v, first hand. Plate I, Figure 5, and Derolez pp. 7–15.
// Scribe A gives IO the name Ior; use the initial values for M and D.
// The two and three dots anchor H as 2/1 and T as 3/1. Row 4 is unmarked.
const domitian = [
  ...salzburg[0], ...salzburg[1],
  'T', 'B', 'E', 'M', 'L', 'NG', 'D', 'OE', 'A', 'AE', 'Y', 'EA',
  'IO', 'Q', 'K', 'ST', 'GAR',
];
const domitianExamples = [
  [8, 8, 17],
  [8, 8, 12, 5],
  [8, 8, 8, 9],
].map((lengths) => {
  const rows = partition(domitian, lengths);
  assert.equal(decode(rows, [2, 1]), 'H');
  assert.equal(decode(rows, [3, 1]), 'T');
  assert.equal(decode(rows, openingStave), 'E');
  return { lengths, opening_3_3: decode(rows, openingStave), ior: locate(rows, 'IO') };
});
assert.deepEqual(domitianExamples.map((model) => model.ior), [[3, 13], [4, 1], [4, 5]]);

// Sermon Figure 5 and Table 4. Q is Cweorth in the conventional rune labels.
const hackness = [...salzburg.slice(0, 3), ['A', 'AE', 'Y', 'EA', 'IO', 'K', 'GAR', 'Q']];
/** @type {Coordinate[]} */
const legible = [[4, 8], [4, 2], [2, 4], [3, 8], [1, 1], [3, 5], [2, 4], [3, 2]];
const perm19 = [4, 1, 2, 3];
const preferred = perm19.map((row) => hackness[row - 1]);
const preferredGP = legible.map((coordinate) => decode(preferred, coordinate));
assert.deepEqual(preferredGP, ['D', 'B', 'O', 'S', 'A', 'EO', 'O', 'N']);
const preferredSermon = preferredGP.map((rune) => rune === 'EO' ? 'E' : rune);
assert.equal(preferredSermon.join(''), 'DBOSAEON');

const enumeration = permutations([1, 2, 3, 4]).map((map) => {
  const rows = map.map((row) => hackness[row - 1]);
  return {
    map,
    opening_3_3: decode(rows, openingStave),
    ior: locate(rows, 'IO'),
    worked_io: legible.some((coordinate) => decode(rows, coordinate) === 'IO'),
  };
});
assert.equal(enumeration.length, 24);
assert.equal(enumeration.filter((model) => model.worked_io).length, 6);
const lateFirst = enumeration.filter((model) => model.map[0] === 4);
assert.equal(lateFirst.length, 6);
assert(lateFirst.every((model) => !model.worked_io));
const iorEarSwapped = preferred.map((row) => row.map((rune) => ({ IO: 'EA', EA: 'IO' })[rune] ?? rune));
assert.equal(read(iorEarSwapped, legible), read(preferred, legible));
assert.notDeepEqual(locate(iorEarSwapped, 'IO'), locate(preferred, 'IO'));

const p0 = corpus.pages.find((page) => page.page === ink.physical_page);
const inkMap = ink.physical_zero_based;
const firstBlack = inkMap.black_following_runes[0];
assert.deepEqual(p0.indices.slice(firstBlack.start, firstBlack.start + firstBlack.length), firstBlack.gp_indices);
const headingThird = inkMap.red_words.map((word) => {
  assert.deepEqual(p0.indices.slice(word.start, word.start + word.length), word.gp_indices);
  return gp[p0.indices[word.start + 2]];
});
assert.deepEqual(headingThird, ['E', 'E']);
const missedGP = (letters) => gp.filter((rune) => !letters.includes(rune === 'IA' ? 'IO' : rune));
assert.deepEqual(missedGP(domitian), []);
assert.deepEqual(missedGP(hackness.flat()), []);
assert.deepEqual(missedGP(salzburg.flat()), ['IA']);

console.log(JSON.stringify({
  salzburg_fixed28: {
    partition: [8, 8, 8, 4],
    gp_missing: missedGP(salzburg.flat()),
    three_worked_devices: read(salzburg, racco),
    branch_rune_device: read(salzburg, racro),
    opening_3_3: decode(salzburg, openingStave),
  },
  domitian_dot_anchors: { H: [2, 1], T: [3, 1], gp_missing: missedGP(domitian), examples: domitianExamples },
  hackness_full32: {
    gp_missing: missedGP(hackness.flat()),
    preferred_permutation: perm19,
    preferred_output_sermon: preferredSermon,
    preferred_output_gp_labels: preferredGP,
    preferred_ior: locate(preferred, 'IO'),
    swapped_ior: locate(iorEarSwapped, 'IO'),
    opening_3_3: decode(preferred, openingStave),
    possible_opening_values: [...new Set(enumeration.map((entry) => entry.opening_3_3))],
    tested_permutations: enumeration.length,
    late_first_permutations: lateFirst.length,
    late_first_worked_io: lateFirst.filter((model) => model.worked_io).length,
  },
  p0: { first_black: gp[p0.indices[firstBlack.start]], red_heading_word_third_runes: headingThird },
}, null, 2));
