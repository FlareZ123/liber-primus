#!/usr/bin/env node
'use strict';

/**
 * Test a single source-motivated p22 -> p50 word-to-row readout.
 * The page-22 corpse image can evoke EAR in the historical Rune Poem,
 * but neither that iconography nor the word-row association is an
 * authenticated LP2 decoding instruction.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const pages = fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8').split('%');
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/base60-grid.json'), 'utf8'));
const runeNumber = new Map(data.runes.map((r, i) => [r, i]));
const gpToken = data.translit.map((name, i) => [name, i]).sort((a, b) => b[0].length - a[0].length);

/** @param {string} page @returns {string[]} */
function visibleFragments(page) {
  const words = [];
  let w = '';
  for (const ch of page) {
    if (runeNumber.has(ch)) w += ch;
    else if (' -\r\n.,:;!?'.includes(ch) && w) {
      words.push(w);
      w = '';
    }
  }
  if (w) words.push(w);
  return words;
}

/** @param {string} word @returns {number[]} */
function gpNumbers(word) {
  let remaining = word;
  const out = [];
  while (remaining.length) {
    const item = gpToken.find(([token]) => remaining.startsWith(token));
    assert.ok(item, 'invalid GP word: ' + word);
    out.push(item[1]);
    remaining = remaining.slice(item[0].length);
  }
  return out;
}

/** @param {string} word @param {'prime'|'ordinal'} arithmetic @returns {number} */
function sumWord(word, arithmetic) {
  return [...word].reduce((s, rune) => {
    const i = runeNumber.get(rune);
    assert.notEqual(i, undefined);
    return s + (arithmetic === 'prime' ? data.prime[i] : i);
  }, 0);
}
assert.equal(data.pages[22].indices.length, 131);
assert.equal(data.pages[32].indices.length, 121);
assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every(row => row.length === 8));
assert.equal(grid.byte_rows.length, 32);
assert.ok(grid.byte_rows.every(row => row.length === 8));
const sourceP22Runes = data.pages[22].indices;
const page22Doublets = sourceP22Runes.flatMap((v,i) =>
  i>0 && v===sourceP22Runes[i-1] ? [{index:i, gp29:v}] : []);
assert.deepEqual(page22Doublets,[{index:101,gp29:28}]);
const completeEarDoublets = data.pages.slice(0,56).flatMap(page =>
  page.indices.flatMap((v,i) =>
    i>0 && v===page.indices[i-1] && v===28 ? [{page:page.page,index:i}] : []));
assert.deepEqual(completeEarDoublets, [
  {page:1,index:194}, {page:22,index:101}, {page:43,index:92}
]);
const words = visibleFragments(pages[22]);
assert.equal(words.length, 32);
assert.deepEqual(pages.slice(0, 58).flatMap((page, i) =>
  visibleFragments(page).length === 32 ? [i] : []), [22]);

// The visually selected unique ᛠᛠ word has an exact cross-original
// numerical link: GP0(ᛟᛠᛠᚪ)=102 and p50's flattened byte[102]=32
// =GP0(EAR)=the 32 local printed p22 fragments and 32 p50 rows.
// This equality alone supplies neither a cipher operation nor a target.
assert.deepEqual([...words[23]].map(ch=>runeNumber.get(ch)),[22,28,28,24]);
const markedWordSum=[...words[23]].reduce((n,ch)=>n+runeNumber.get(ch),0);
assert.equal(markedWordSum,102);
const flattenedTable=grid.byte_rows.flat();
assert.equal(flattenedTable[markedWordSum],32);
assert.deepEqual(flattenedTable.flatMap((value,i)=>value===32?[i]:[]),[102,110,237]);
const localIndexMatches=words.flatMap((w,i)=>{
  const n=[...w].reduce((sum,ch)=>sum+runeNumber.get(ch),0);
  return n<256 && flattenedTable[n]===32 ? [i] : [];
});
assert.deepEqual(localIndexMatches,[23]);
const incoming = visibleFragments(pages[21]).at(-1);
assert.equal([...incoming].length, 8);
assert.equal([...words[0]].length, 2);
const joined = [incoming + words[0], ...words.slice(1)];
assert.deepEqual(gpNumbers('EAR'), [28, 4]);
assert.deepEqual(gpNumbers('EOH'), [12, 8]);
const names = Object.fromEntries(['EAR', 'CEN', 'EOH', 'FEOH'].map(name =>
  [name, gpNumbers(name).reduce((a, b) => a + b, 0)]));
assert.deepEqual(names, { EAR: 32, CEN: 32, EOH: 20, FEOH: 20 });
const results = [];
for (const [carry, segments] of [['visible', words], ['joined', joined]]) {
  for (const arithmetic of ['prime', 'ordinal']) {
    const columns = segments.map(word => sumWord(word, arithmetic) % 8);
    const bytes = columns.map((col, row) => grid.byte_rows[row][col]);
    assert.ok(bytes.every(x => Number.isInteger(x) && x >= 0 && x <= 255));
    const printable = bytes.filter(x => x >= 32 && x <= 126).length;
    const display = bytes.map(x => x >= 32 && x <= 126 ? String.fromCharCode(x) : '.').join('');
    results.push({ carry, arithmetic, columns, bytesHex: Buffer.from(bytes).toString('hex'),
      printableAscii: printable, visibleAscii: display, whollyPrintable: printable === 32 });
  }
}
assert.deepEqual(results.map(r => r.printableAscii), [14, 16, 13, 16]);
assert.ok(results.every(r => !r.whollyPrintable));
console.log(JSON.stringify({
  source: { page22Runes: 131, unique32VisibleFragments: true, page32Runes: 121,
    page22Doublets, completeEarDoublets,
    earMarkedWord: {zeroBasedWordIndex:23, wordGPsum:markedWordSum, p50ByteAtWordSum:flattenedTable[markedWordSum], localIndexMatches},
    p50Rows: 32, p50Columns: 8, namedRuneOrdinalSums: names },
  directOneCellPerRow: results,
  scope: 'Tests 32-byte direct ASCII readouts only. No plaintext, creator-selected key, or cipher established.'
}, null, 2));
