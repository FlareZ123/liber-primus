'use strict';

/**
 * LP2 p24–26 illustrated-margin original-source key gate.
 * Run: node sims/lp2_p23_26_five_margins_60key_sft.cjs
 *
 * Fixed selector: one nearest-edge rune per original printed text line
 * next to each of the five source-image side ornaments. p24 has right,
 * p25 and p26 have left and right. Within a page read lines top-down,
 * with left before right on two-sided lines.
 *
 * The key is derived entirely from source ciphertext outside p23's
 * post-heading 197-rune target. This test makes no claim that Cicada
 * instructed readers to select marginal runes or use GP29 addition.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const source = fs.readFileSync(path.join(root, 'lp2-transcription.txt'), 'utf8');
const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
const pages = new Map(corpus.pages.map((p) => [p.page, p]));

let globalOffset = 0;
/** @type {Map<number, {start:number,end:number}>} */
const bounds = new Map();
for (const p of corpus.pages) {
  bounds.set(p.page, { start: globalOffset, end: globalOffset + p.indices.length });
  globalOffset += p.indices.length;
}

/** @type {Array<{line:number,start:number,end:number,symbols:number[]}>} */
const printed = [];
let textOffset = 0;
for (const [i, raw] of source.split(/\r?\n/u).entries()) {
  const symbols = [...raw].filter((glyph) => runeIndex.has(glyph)).map((glyph) => runeIndex.get(glyph));
  if (symbols.length) {
    printed.push({ line: i + 1, start: textOffset, end: textOffset + symbols.length, symbols });
    textOffset += symbols.length;
  }
}
assert.equal(textOffset, globalOffset, 'Original transcription and canonical corpus must match length');
assert.deepEqual(printed.flatMap((line) => line.symbols), corpus.pages.flatMap((p) => p.indices),
  'Original printed lines must match all canonical source runes in order');

const selectors = { 24: ['R'], 25: ['L', 'R'], 26: ['L', 'R'] };
/** @type {number[]} */
const key = [];
/** @type {string[]} */
const coordinates = [];
for (const pageNo of [24, 25, 26]) {
  const { start, end } = bounds.get(pageNo);
  const rows = printed.filter((row) => row.start >= start && row.end <= end);
  assert.equal(rows.length, 12, 'Each illustrated page must have twelve printed lines');
  for (const row of rows) {
    for (const side of selectors[pageNo]) {
      key.push(side === 'L' ? row.symbols[0] : row.symbols.at(-1));
      coordinates.push('p' + pageNo + ':transcription-line' + row.line + ':' + side);
    }
  }
}
assert.equal(key.length, 60);

/** @param {number[]} seq */
function ioc(seq) {
  const histogram = Array(29).fill(0);
  for (const value of seq) histogram[value] += 1;
  return histogram.reduce((total, count) => total + count * (count - 1), 0)
    / (seq.length * (seq.length - 1));
}

/** @param {number[]} ciphertext */
function subtract(ciphertext) {
  return ciphertext.map((value, i) => (value - key[i % key.length] + 29) % 29);
}

/** @param {number[]} plaintext */
function add(plaintext) {
  return plaintext.map((value, i) => (value + key[i % key.length]) % 29);
}

/** @param {number[]} seq */
function translit(seq) {
  return seq.map((idx) => corpus.translit[idx]).join(' ');
}

// The only original target in this experiment is disjoint from the key-giving
// pages; p27 is an independent out-of-chapter, previously untouched check.
const original = pages.get(23).indices.slice(16);
const target = subtract(original);
const holdOriginal = pages.get(27).indices;
const hold = subtract(holdOriginal);
assert.equal(original.length, 197);
assert.deepEqual(add(target), original, 'Forward check on original p23 body');
assert.deepEqual(add(hold), holdOriginal, 'Forward check on original p27 holdout');

// Planted known-clear control verifies symbol order and period-60 arithmetic.
const known = pages.get(57).indices;
assert.deepEqual(subtract(add(known)), known, 'Exact 95-rune known-clear positive');

const result = {
  sourcePages: [24, 25, 26],
  sourceLineCount: [12, 12, 12],
  marginSequence: 'p24 right; p25 left/right per row; p26 left/right per row',
  selectedSourceRuneCount: key.length,
  printedLineCoordinates: coordinates,
  keyTranslit: translit(key),
  keyIoC: ioc(key),
  originalP23BodyLength: original.length,
  originalP23BodyIoC: ioc(original),
  decodedP23BodyIoC: ioc(target),
  decodedP23First120: translit(target.slice(0, 120)),
  independentP27Length: hold.length,
  decodedP27IoC: ioc(hold),
  decodedP27First100: translit(hold.slice(0, 100)),
  knownClearP57IoC: ioc(known),
  positiveRoundTripSymbols: known.length,
  originalForwardReconstruction: true,
  note: 'No unknown LP2 plaintext or independently authored key-selection rule recovered.'
};
assert.ok(result.decodedP23BodyIoC < 0.04);
assert.ok(result.decodedP27IoC < 0.04);
console.log(JSON.stringify(result, null, 2));
