"use strict";
/**
 * Source-fixed 2012 MIDI wordlist versus 2014 Onion7 7x7 square identity gate.
 *
 * Run: node sims/cicada2012_midi_onion7_valueword_gate.cjs
 * Inputs: pinned historical words.txt (Git blob 4351148626eaaed6854713b0c037fc3cdedff6f1),
 *         original 2014 OpenPuff magic-squares text, middle seven-by-seven square.
 * Checks one transparent, literal model only: a numeric cell value selects
 * the same word at every occurrence. It is NOT a generic cipher inversion.
 *
 * @module cicada2012_midi_onion7_valueword_gate
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} local */
function read(local) {
  return fs.readFileSync(path.join(root, local), "utf8");
}

const words = read("resources/historical/cicada2012-midi-49-words.txt")
  .trim().split(/\s+/u);
const squares = read("resources/cicada2014-openpuff-magic-squares.txt")
  .trim().split(/\r?\n\s*\r?\n/u)
  .map((block) => block.trim().split(/\r?\n/u)
    .map((line) => line.trim().split(/\s+/u).map(Number)));
assert.deepEqual(squares.map((sq) => [sq.length, sq[0].length]),
  [[5, 5], [7, 7], [5, 5]]);
const middle = squares[1];
assert.ok(middle.every((row) => row.length === 7 &&
  row.every((value) => Number.isInteger(value) && value > 0)));
assert.equal(words.length, 49);
assert.equal(new Set(words).size, 47);
assert.deepEqual(
  [...new Set(words.filter((word, i) => words.indexOf(word) !== i))].sort(),
  ["box", "tray"]
);

const flat = middle.flat();
assert.equal(flat.length, 49);
assert.equal(new Set(flat).size, 24);
assert.equal(middle[3][3], 331);
for (let i = 0; i < 7; i++) {
  assert.equal(middle[i].reduce((sum, v) => sum + v, 0), 1033);
  assert.equal(middle.reduce((sum, row) => sum + row[i], 0), 1033);
}
for (let r = 0; r < 7; r++) {
  for (let c = 0; c < 7; c++) {
    assert.equal(middle[r][c], middle[6-r][6-c],
      "source square must be centrosymmetric");
  }
}

/**
 * Minimum positions requiring alteration to make the literal dictionary
 * cell-number -> one fixed word compatible with an aligned 49-word list.
 * All equal-number cells must have the same assigned word.
 * @param {number[]} values
 * @param {string[]} labels
 * @returns {number}
 */
function necessaryChanges(values, labels) {
  assert.equal(values.length, labels.length);
  const table = new Map();
  for (let i = 0; i < values.length; i++) {
    let group = table.get(values[i]);
    if (!group) {
      group = new Map();
      table.set(values[i], group);
    }
    group.set(labels[i], (group.get(labels[i]) || 0) + 1);
  }
  let maximumKeep = 0;
  for (const group of table.values()) {
    maximumKeep += Math.max(...group.values());
  }
  return labels.length - maximumKeep;
}

/** @param {number[][]} sq @returns {number[][]} */
function rotate(sq) {
  return sq[0].map((_, c) => sq.slice().reverse().map((row) => row[c]));
}
/** @param {number[][]} sq @returns {number[][]} */
function reflect(sq) {
  return sq.map((row) => row.slice().reverse());
}

const control = [];
for (const mirrored of [false, true]) {
  let oriented = mirrored ? reflect(middle) : middle.map((row) => row.slice());
  for (let turns = 0; turns < 4; turns++) {
    const printedValues = oriented.flat();
    const changes = necessaryChanges(printedValues, words);
    control.push({mirrored, clockwiseQuarterTurns: turns, changes});
    assert.equal(changes, 25);
    oriented = rotate(oriented);
  }
}
assert.equal(control.length, 8);

// Exact planted positives: one uniquely assigned word for each of the 24
// distinct numeric cell values gives a perfect deterministic value -> word
// register, including all centrally paired repetitions.
const plantedWords = flat.map((value) => "WORD" + value);
assert.equal(necessaryChanges(flat, plantedWords), 0);
const mutated = plantedWords.slice();
mutated[0] = "CORRUPTED";
assert.equal(necessaryChanges(flat, mutated), 1);

const oppositePairsDiffer = Array.from({length: 24}, (_, i) =>
  words[i] !== words[48-i]).filter(Boolean).length;
assert.equal(oppositePairsDiffer, 24);

console.log(JSON.stringify({
  classification: "necessary-value-consistency gate; no original LP2 decryption",
  source2012: {
    wordCount: words.length, uniqueWords: new Set(words).size,
    repeatedWords: ["box", "tray"],
    instruction: "2012 MIDI explicitly instructs encrypt/sign/email wordlist"
  },
  source2014: {
    squareOrder: 7, cells: flat.length,
    distinctNumericValues: new Set(flat).size,
    center: middle[3][3], magicSum: 1033,
    hasCentralPointSymmetry: true
  },
  originalOppositePairsDiffer: oppositePairsDiffer,
  d4Orientations: control,
  minValueWordConflictsAcrossOrientations: 25,
  positivePlantedNumericValueCodebookChanges: 0,
  oneCorruptionDetectedChanges: 1,
  authenticCrossRound49to49InstructionFound: false,
  limitations: "Excludes a direct, stationary value->word lookup under the eight D4 alignments. Does not exclude a secret position-dependent rule, permutation, different corpus, or an unknown external instruction."
}, null, 2));
