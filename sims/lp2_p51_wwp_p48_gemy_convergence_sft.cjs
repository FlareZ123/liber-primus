/**
 * LP2 p48 GEMY and p51 first complete word W-W-P: independent source-defined
 * entries toward the table's provisional GEM cycle.
 *
 * Conditional navigational clue only. No unencrypted LP2 text is claimed.
 * Node 22, CommonJS, Windows-compatible, read-only, no dependencies.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
/** @param {string} p */
function read(p) {
  return fs.readFileSync(path.resolve(__dirname, '..', 'resources', 'liber-primus', p), 'utf8');
}
const c = JSON.parse(read('lp2-corpus.json'));
const tableSource = JSON.parse(read('lp2-grid-256.json'));
const table = tableSource.pages.flatMap(p => p.bytes);
const transcript = read('lp2-transcription.txt');
const idx = new Map(c.runes.map((v, k) => [v, k]));
const key = Object.fromEntries(c.translit.map((v, k) => [v, k]));
assert.equal(table.length, 256);
assert.equal(c.pages.slice(0, 56).flatMap(p => p.indices).length, 12956);

/** @returns {number[][]} */
function wholeWords() {
  const tape = c.pages.slice(0, 56).flatMap(p => p.indices);
  const observed = [], words = [];
  let word = [];
  for (const ch of transcript) {
    if (observed.length === tape.length) break;
    if (idx.has(ch)) {
      const v = idx.get(ch);
      observed.push(v);
      word.push(v);
    } else if ((ch === '-' || ch === '.') && word.length) {
      words.push(word);
      word = [];
    }
  }
  if (word.length) words.push(word);
  assert.deepEqual(observed, tape);
  assert.equal(words.length, 2896);
  return words;
}
const words = wholeWords();
const before = c.pages[48].indices.slice(138, 146);
const after = c.pages[51].indices.slice(0, 3);
assert.deepEqual(before.map(i => c.translit[i]), ['M','G','E','M','Y','IA','I','D']);
assert.deepEqual(after.map(i => c.translit[i]), ['W','W','P']);
assert.deepEqual(c.pages[49].indices.slice(-6).map(i => c.translit[i]), ['OE','EO','W','J','P','D']);

/** @param {number[]} word */
function primeSum(word) {
  return word.reduce((sum, k) => sum + c.prime[k], 0);
}
const lastBeforeTable = c.pages[49].indices.slice(-6);
const lastBeforeTablePrimeSum = primeSum(lastBeforeTable);
assert.equal(lastBeforeTablePrimeSum, 312); // 3 numeric pages × 104 cells on p50
assert.deepEqual(tableSource.pages.map(p => p.tokens.length), [80,104,72]);
assert.equal(tableSource.pages[1].tokens.length * 3, lastBeforeTablePrimeSum);
const originalSixRuneWords = words.filter(w => w.length === 6);
assert.equal(originalSixRuneWords.length, 256);
const beforeSumMatches = originalSixRuneWords.filter(w => primeSum(w) === 312);
assert.equal(beforeSumMatches.length, 1);
assert.deepEqual(beforeSumMatches[0], lastBeforeTable);
const pageInitialDoublets = c.pages.filter(p => p.page <= 55 && p.indices.length >= 2 && p.indices[0] === p.indices[1]).map(p => p.page);
assert.deepEqual(pageInitialDoublets, [51]);
const wordStartDoublets = words.filter(w => w.length >= 2 && w[0] === w[1]);
const threeRuneStartDoublets = words.filter(w => w.length === 3 && w[0] === w[1]);
assert.equal(wordStartDoublets.length, 12);
assert.equal(threeRuneStartDoublets.length, 3);
assert.deepEqual(threeRuneStartDoublets.map(w => w.map(i => c.translit[i])),
  [['S','S','EA'],['E','E','W'],['W','W','P']]);
const firstAfterTable = primeSum(after);
assert.equal(firstAfterTable, 81);
assert.equal(table[firstAfterTable - 1], 142);
assert.equal(Math.floor(table[80] / 29), 4);
assert.equal(table[80] % 29, key.Y);
assert.equal(c.prime[key.Y], 103);

const directions = [
  [1,-1],[1,0],[1,1],[0,-1],[0,0],[0,1],[-1,-1],[-1,0],[-1,1],
];
/** @param {number} oneBased */
function next(oneBased) {
  const i = oneBased - 1, v = table[i];
  const [dr, dc] = directions[Math.floor(v / 29)];
  const row = Math.floor(i / 8) + dr, col = i % 8 + dc;
  return row >= 0 && row < 32 && col >= 0 && col < 8 ? row * 8 + col + 1 : null;
}
/** @param {number} cell */
function cycle(cell) {
  const visited = new Map(), path = [];
  while (cell !== null && !visited.has(cell)) {
    visited.set(cell, path.length);
    path.push(cell);
    cell = next(cell);
  }
  return { path, cycle: cell === null ? [] : path.slice(visited.get(cell)) };
}
assert.equal(next(81), 81); // quotient 4 means a stationary keypad move
const yRoute = cycle(c.prime[key.Y]);
assert.deepEqual(yRoute.path, [103,111,119,127,128]);
assert.deepEqual(yRoute.cycle, [119,127,128]);
assert.deepEqual(yRoute.path.map(i => c.translit[table[i - 1] % 29]),
  ['O','O','G','E','M']);
assert.deepEqual(yRoute.cycle.map(i => c.translit[table[i - 1] % 29]),
  ['G','E','M']);

// The preceding source word already contains G-E-M followed by the Y pointer.
assert.deepEqual(before.slice(1, 5).map(i => c.translit[i]), ['G','E','M','Y']);
const sourceRemainders = c.pages.slice(0, 56)
  .filter(page => page.indices.length)
  .flatMap(page => {
    const matches = [];
    for (let i = 0; i + 4 <= page.indices.length; i++) {
      const seen = page.indices.slice(i, i + 4);
      if (seen.every((x, j) => x === before[j + 1])) {
        matches.push({page: page.page, offset: i});
      }
    }
    return matches;
  });
assert.deepEqual(sourceRemainders, [{page:48,offset:139}]);

// Conditional descriptive baseline: if the target Y were fixed from the
// preceding p48 clue, how many source three-rune words address a table cell
// whose byte is exactly 142 (=29*4+26, fixed-point Y)?
const yCells = table.map((v, i) => v === 142 ? i + 1 : null).filter(v => v !== null);
assert.deepEqual(yCells, [81,217]);
const len3 = words.filter(w => w.length === 3);
const len3Hits = len3.filter(w => yCells.includes(primeSum(w)));
assert.equal(len3.length, 720);
assert.equal(len3Hits.length, 16);
assert.equal(len3Hits.filter(w => w.every((x,i) => x === after[i])).length, 1);
let randomHits = 0;
for (let a = 0; a < 29; a++) {
  for (let b = 0; b < 29; b++) {
    for (let d = 0; d < 29; d++) {
      if (yCells.includes(c.prime[a] + c.prime[b] + c.prime[d])) randomHits++;
    }
  }
}
assert.equal(randomHits, 336);
console.log(JSON.stringify({
  title: 'Conditional p48 GEMY and p51 WWP convergence into p50 GEM',
  firstPostGridWord: after.map(i => c.translit[i]),
  primeSum: firstAfterTable,
  rareBoundary: {onlyPageInitialDoublet: pageInitialDoublets, wordStartDoublets:wordStartDoublets.length, threeRuneDoublets:threeRuneStartDoublets.map(w => w.map(i => c.translit[i]))},
  preTable: {word:lastBeforeTable.map(i => c.translit[i]), sum:lastBeforeTablePrimeSum, centerPageCells:104, numericPageCount:3, originalSixRuneWords:originalSixRuneWords.length, uniqueSum312Words:beforeSumMatches.length},
  tableCell81: {byte: table[80], q:4, rune:'Y', prime:103, stationary:true},
  routeFrom103: yRoute.path.map(i => ({cell:i, rune:c.translit[table[i - 1] % 29]})),
  gemCycle: [119,127,128],
  p48Source: {page:48, offset:139, word:before.map(i => c.translit[i]), exactGEMY:sourceRemainders},
  base: {allOriginalThreeRuneWords:len3.length, yStationaryCellStarts:yCells,
    wordsAddressingSuchCell:len3Hits.length, possibleGP3triplets:29**3,
    GP3tripletsAddressingSuchCell:randomHits},
  warning: 'Words-as-table-address and q/keypad are investigator-selected hypotheses; convergence is no plaintext or authenticated key.',
}, null, 2));
