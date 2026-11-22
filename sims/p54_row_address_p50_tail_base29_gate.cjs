#!/usr/bin/env node
"use strict";

// Source-constrained p54 -> p50 table-address test.
// p54 has 232 runes; skipping 24 p50 cells leaves a 29x8 table.
// The eight red heading runes rank the eight columns. Each p54 rune index
// selects a table row; its position mod 8 selects the ranked column.
// Convert each selected 0..59 table value with the authenticated BASE29 rule.

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");

const MOD = 29;
const mod = n => ((n % MOD) + MOD) % MOD;
const ioc = values => {
  const counts = Array(MOD).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0)
    / (values.length * (values.length - 1));
};
const transliterate = values => values.map(value => corpus.translit[value]).join("");

assert.equal(grid.bytes.length, 256);
const gridSha256 = crypto.createHash("sha256")
  .update(Buffer.from(grid.bytes)).digest("hex");
assert.equal(gridSha256,
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

const p54 = corpus.pages.find(page => page.page === 54).indices;
const p55 = corpus.pages.find(page => page.page === 55).indices;
const p57 = corpus.pages.find(page => page.page === 57).indices;
assert.equal(p54.length, 232);
assert.equal(p54[0], 24);
assert.equal(p55.length, 76);
assert.equal(p57.length, 95);

const heading = p54.slice(1, 9);
assert.deepEqual(heading, [19, 21, 23, 27, 2, 14, 10, 19]);
const columnOrder = heading.map((value, index) => ({ value, index }))
  .sort((a, b) => a.value - b.value || a.index - b.index)
  .map(item => item.index);
assert.deepEqual(columnOrder, [4, 6, 5, 0, 7, 1, 2, 3]);

const tableTail = grid.bytes.slice(24);
assert.equal(tableTail.length, 232);
const table = Array.from({ length: 29 }, (_, row) =>
  tableTail.slice(row * 8, (row + 1) * 8));
assert.ok(table.every(row => row.length === 8));

// Page 54 is section 53 because the transcription omits the rune-free p50
// numeric table; section 54 is p55. Confirm exact rune-by-rune alignment.
const sections = transcription.split("%");
const p54Text = sections[53];
const p55Text = sections[54];
const runeToIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

function mapRunesPreservingDelimiters(text, mapper, expected) {
  let position = 0;
  let output = "";
  for (const character of text) {
    if (runeToIndex.has(character)) {
      const index = runeToIndex.get(character);
      assert.equal(index, expected[position]);
      output += mapper(position, index);
      position++;
    } else {
      output += character;
    }
  }
  assert.equal(position, expected.length);
  return output;
}

const selectedValues = p54.map((row, position) =>
  table[row][columnOrder[position % 8]]);
assert.equal(selectedValues.length, 232);

function base29(value) {
  assert.ok(Number.isInteger(value) && value >= 0 && value < 60);
  if (value === 0) return [0];
  const digits = [];
  while (value > 0) {
    digits.unshift(value % MOD);
    value = Math.floor(value / MOD);
  }
  return digits;
}

const digitsByRune = selectedValues.map(base29);
const key = digitsByRune.flat();
assert.equal(key.length, 443);

const readoutText = mapRunesPreservingDelimiters(
  p54Text,
  position => transliterate(digitsByRune[position]),
  p54
);
const signResults = [];
for (const sign of [-1, 1]) {
  // sign -1 is the standard additive-stream inverse P=C-K.
  const decoded = p55.map((cipherRune, i) => mod(cipherRune + sign * key[i]));
  const decodedText = mapRunesPreservingDelimiters(
    p55Text,
    position => corpus.translit[decoded[position]],
    p55
  );
  const plantedCipher = p57.map((plainRune, i) => mod(plainRune - sign * key[i]));
  const recovered = plantedCipher.map((cipherRune, i) => mod(cipherRune + sign * key[i]));
  assert.deepEqual(recovered, p57);
  signResults.push({
    sign,
    p55IoC: ioc(decoded),
    p55Text: decodedText,
    p57PositiveControlRecovered: recovered.length
  });
}

console.log(JSON.stringify({
  sourceGridSha256: gridSha256,
  p54RuneCount: p54.length,
  p54FirstRune: p54[0],
  p54RedHeading: heading,
  stableColumnOrder: columnOrder,
  skippedGridCells: 24,
  tableTailDimensions: [29, 8],
  selectedCellCount: selectedValues.length,
  selectedCellValues: selectedValues,
  base29OutputLength: key.length,
  readoutIoC: ioc(key),
  readoutText,
  p55CipherIoC: ioc(p55),
  signResults,
  uniform29Baseline: 1 / 29,
  conclusion: "This fixed p54 row-address readout is not plaintext and its first 76 BASE29 symbols do not decrypt p55."
}, null, 2));
