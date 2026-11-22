'use strict';

/**
 * Source-motivated seven-column, unknown-row-key original-cipher gate.
 * Original LP2 pp8–14: seven physical pages, 1,729 runes = 7 × 247.
 * Its only isolated Arabic 7 is at physical p10 local rune offset169.
 * Counts all equal-rune pairs in natural row/column organizations,
 * invariant under arbitrary independently secret GP29 bijections in
 * each row and arbitrary permutations of its seven positions.
 *
 * Run from repository root: node sims/lp2_p8_14_sevenrow_allsecret_sft.cjs
 * This excludes only one specified class, not a recovered decoder.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} name @returns {string} */
const read = (name) => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const pages = Array.from({ length: 7 }, (_, index) => index + 8);
const original = [];
for (const page of pages) original.push(...corpus.pages[page].indices);
assert.equal(pages.length, 7);
assert.equal(original.length, 1729);
const printedPages = transcription.split(/^%$/m);
assert.equal(printedPages.length, 57);
const p10 = printedPages[10];
const digitAt = p10.indexOf('7');
assert.ok(digitAt >= 0);
assert.equal((p10.match(/[0-9]/g) || []).length, 1);
const runeBefore = [...p10.slice(0, digitAt)]
  .filter((rune) => corpus.runes.includes(rune)).length;
assert.equal(runeBefore, 169);
assert.equal(original.slice(0, 255 + 268 + runeBefore).length, 692);
assert.match(p10.slice(digitAt), /^7-ᚷ/u);
const ROWS = 247;
const COLS = 7;
assert.equal(ROWS * COLS, original.length);

/**
 * Row blocks are seven consecutive runes; column blocks are seven
 * same-index runes from successive 247-rune source runs. Neither map
 * requires a guessed seven-column permutation.
 * @param {number[]} symbols
 * @param {'row'|'column'} layout
 * @returns {number}
 */
function matchingPairs(symbols, layout) {
  assert.equal(symbols.length, COLS * ROWS);
  let total = 0;
  for (let row = 0; row < ROWS; row++) {
    const counts = new Int32Array(29);
    for (let col = 0; col < COLS; col++) {
      const i = layout === 'row' ? COLS * row + col : ROWS * col + row;
      counts[symbols[i]]++;
    }
    for (let symbol = 0; symbol < 29; symbol++) {
      total += counts[symbol] * (counts[symbol] - 1) / 2;
    }
  }
  return total;
}

/** @param {string} plain @returns {number[]} */
function nativeGp(plain) {
  const tokens = corpus.translit.map((token, index) => ({ token, index }))
    .sort((a, b) => b.token.length - a.token.length);
  const output = [];
  for (const sourceWord of plain.toUpperCase().match(/[A-Z]+/g) || []) {
    const word = sourceWord.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/K/g, 'C').replace(/Z/g, 'S').replace(/ING/g, 'NG')
      .replace(/IO/g, 'IA');
    const encoded = [];
    for (let i = 0; i < word.length;) {
      const candidate = tokens.find(({ token }) => word.startsWith(token, i));
      if (!candidate) throw Error('Unrepresentable GP word: ' + sourceWord);
      encoded.push(candidate.index);
      i += candidate.token.length;
    }
    output.push(...encoded);
  }
  return output;
}

const sourceFiles = [
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/control/shakespeare_first300k.txt'
];
const sourceNames = ['Gibran', 'Emerson', 'Shakespeare'];
const corpora = sourceFiles.map((file) => nativeGp(read(file)));
const layouts = /** @type {const} */ (['row', 'column']);
/** @type {Record<string, number>} */
const observed = {};
/** @type {Array<{source:string,runecount:number,samples:number,layout:string,min:number,max:number,mean:number}>} */
const references = [];
for (const layout of layouts) {
  observed[layout] = matchingPairs(original, layout);
}
assert.deepEqual(observed, { row: 139, column: 179 });
for (let j = 0; j < corpora.length; j++) {
  const native = corpora[j];
  for (const layout of layouts) {
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    let count = 0;
    for (let start = 0; start + original.length <= native.length; start += 83) {
      const pairs = matchingPairs(native.slice(start, start + original.length), layout);
      min = Math.min(min, pairs);
      max = Math.max(max, pairs);
      sum += pairs;
      count++;
    }
    assert.ok(count > 500);
    assert.ok(min > observed[layout],
      'Original should remain below every fixed native sample for ' + layout);
    references.push({ source: sourceNames[j], runecount: native.length,
      samples: count, layout, min, max, mean: Number((sum / count).toFixed(6)) });
  }
}
assert.deepEqual(references.map((x) => x.min), [184, 261, 184, 256, 195, 254]);

// Per-row arbitrary GP29 alphabet permutations: completely secret map, with
// no shared map across rows. Verify exact encryption and decryption of a
// source-native 1,729-rune English plant in both source-native layouts.
let state = 0x33011729;
/** @returns {number} */
function random32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
const plant = corpora[0].slice(0, original.length);
for (const layout of layouts) {
  const encrypted = plant.slice();
  const decrypted = plant.slice();
  for (let row = 0; row < ROWS; row++) {
    const permutation = Array.from({ length: 29 }, (_, symbol) => symbol);
    for (let i = 28; i > 0; i--) {
      const j = random32() % (i + 1);
      [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
    }
    const inverse = new Array(29);
    for (let i = 0; i < 29; i++) inverse[permutation[i]] = i;
    for (let col = 0; col < COLS; col++) {
      const index = layout === 'row' ? COLS * row + col : ROWS * col + row;
      encrypted[index] = permutation[plant[index]];
      decrypted[index] = inverse[encrypted[index]];
    }
  }
  assert.deepEqual(decrypted, plant);
  assert.equal(matchingPairs(plant, layout), matchingPairs(encrypted, layout));
}
console.log(JSON.stringify({
  test: 'LP2 original pp8–14 seven-column unknown-per-row-secret-bijection gate',
  runeLength: original.length, columns: COLS, rows: ROWS,
  isolatedDigit: { page: 10, value: 7, runeOffset: 169, chapterRuneOffset: 692 },
  observedPairs: observed, availablePairs: ROWS * COLS * (COLS - 1) / 2,
  referenceWindows: references,
  positivePlants: '1729/1729 native runes recovered under arbitrary per-row secret bijections in both layouts',
  conclusion: 'Finite source-native exclusion of independent per-row GP29 bijection plus rowwise seven-column reordering; no plaintext or source-selected key'
}, null, 2));
