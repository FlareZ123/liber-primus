'use strict';
/**
 * SFT: source-fixed p32 prime-axis sums as addresses of complete LP2 printed words.
 * Tests whether the independently observed first-width/first-height word matches
 * extend to an unambiguous 22-step source-word lookup.
 * Node.js 22 CommonJS; no dependencies or writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const index = new Map(corpus.runes.map((glyph, i) => [glyph, i]));
const segments = transcript.split(/\s*%\s*/).slice(0, 55);
assert.equal(segments.length, 55);
const wordList = segments.flatMap((segment, segmentIndex) => {
  const groups = segment.replace(/\s/g, '').replaceAll('/', '')
    .match(/\p{Script=Runic}+/gu) || [];
  return groups.map((group, wordIndex) => {
    const runes = [...group].map(glyph => {
      assert.ok(index.has(glyph), 'unknown glyph');
      return index.get(glyph);
    });
    return {
      page: segmentIndex < 50 ? segmentIndex : segmentIndex + 1,
      word: wordIndex + 1, runeCount: runes.length,
      primeSum: runes.reduce((sum, rune) => sum + corpus.prime[rune], 0)
    };
  });
});
assert.equal(wordList.length, 2928);
assert.equal(wordList.reduce((sum, w) => sum + w.runeCount, 0), 12956);
const p32 = corpus.pages.find(page => page.page === 32).indices;
assert.equal(p32.length, 121);
const rows = Array.from({ length: 11 }, (_, row) =>
  p32.slice(row * 11, (row + 1) * 11)
    .reduce((sum, rune) => sum + corpus.prime[rune], 0));
const cols = Array.from({ length: 11 }, (_, col) =>
  Array.from({ length: 11 }, (_, row) => p32[row * 11 + col])
    .reduce((sum, rune) => sum + corpus.prime[rune], 0));
assert.deepEqual(rows, [563,617,287,540,743,513,577,579,603,537,486]);
assert.deepEqual(cols, [569,429,641,669,518,611,463,690,378,578,499]);
const lookup = sums => sums.map((sum, i) => ({
  axis: i + 1, sum, matches: wordList
    .filter(word => word.primeSum === sum)
    .map(word => [word.page, word.word, word.runeCount])
}));
const matchedRows = lookup(rows);
const matchedCols = lookup(cols);
assert.deepEqual(matchedRows.map(x => x.matches.length),
  [1,0,5,2,0,1,1,0,1,1,1]);
assert.deepEqual(matchedCols.map(x => x.matches.length),
  [1,3,0,0,2,0,3,1,3,0,2]);
assert.deepEqual(matchedRows[0].matches, [[0,6,11]]);
assert.deepEqual(matchedCols[0].matches, [[1,33,10]]);
const all = [...matchedRows, ...matchedCols];
const counts = {
  noMatch: all.filter(x => x.matches.length === 0).length,
  oneMatch: all.filter(x => x.matches.length === 1).length,
  ambiguous: all.filter(x => x.matches.length > 1).length
};
assert.deepEqual(counts, { noMatch: 7, oneMatch: 8, ambiguous: 7 });
console.log(JSON.stringify({scope:'p32 all 22 axis sums → original LP2 complete printed words',
  rows:matchedRows, columns:matchedCols, counts,
  result:'The first width/height match does not extend to a total unique-word map; no plaintext recovered'}, null, 2));
