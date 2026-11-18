'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const transcription = fs.readFileSync(
  path.join(ROOT, 'resources', 'liber-primus', 'lp2-transcription.txt'),
  'utf8'
);
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const grid = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources', 'liber-primus', 'base60-grid.json'),
  'utf8'
));

const p57End = transcription.lastIndexOf('§');
const p57Start = transcription.lastIndexOf('%', p57End);
assert.ok(p57Start >= 0 && p57End > p57Start);
const p57Raw = transcription.slice(p57Start + 1, p57End).trim();

const joined = p57Raw.replace(/[\/\r\n]/g, '');
const words = joined.split(/[.\-]/).filter(Boolean);
const wordLengths = words.map((word) => Array.from(word).length);
const expectedLengths = [7,4,2,6,7,2,2,7,2,4,4,3,3,14,4,2,8,5,3,6];
assert.deepEqual(wordLengths, expectedLengths);
assert.equal(words.length, 20);
assert.equal(wordLengths.reduce((a, b) => a + b, 0), 95);
assert.equal(corpus.pages.find((page) => page.page === 57).indices.length, 95);

const bodyWords = words.slice(1);
assert.equal(bodyWords.length, 19);
const periodCount = Array.from(joined).filter((ch) => ch === '.').length;
assert.equal(periodCount, 4);
assert.equal(periodCount * bodyWords.length, 76);
assert.equal(corpus.pages.find((page) => page.page === 55).indices.length, 76);

const periodRuneOffsets = [];
let runesSeen = 0;
for (const ch of Array.from(joined)) {
  if (ch === '.' || ch === '-') {
    if (ch === '.') periodRuneOffsets.push(runesSeen);
  } else {
    runesSeen += 1;
  }
}
assert.deepEqual(periodRuneOffsets, [7, 37, 67, 95]);
assert.equal(/\d/.test(joined), false);

const contiguous76 = [];
for (let start = 0; start < wordLengths.length; start += 1) {
  let total = 0;
  for (let end = start; end < wordLengths.length; end += 1) {
    total += wordLengths[end];
    if (total === 76) contiguous76.push([start + 1, end + 1]);
    if (total > 76) break;
  }
}
assert.deepEqual(contiguous76, [[4, 19], [5, 20]]);

function dropEdge(word, first) {
  const runes = Array.from(word);
  return first ? runes.slice(1) : runes.slice(0, -1);
}

const heading = Array.from(words[0]);
const bodyDropFirst = heading.concat(...bodyWords.map((word) => dropEdge(word, true)));
const bodyDropLast = heading.concat(...bodyWords.map((word) => dropEdge(word, false)));
assert.equal(bodyDropFirst.length, 76);
assert.equal(bodyDropLast.length, 76);
assert.notDeepEqual(bodyDropFirst, bodyDropLast);

assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every((row) => row.length === 8));
const outerCount = 2 * 32 + 2 * 8 - 4;
assert.equal(outerCount, 76);

const gpPrimeWeights = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
const translit = corpus.translit;
const runeToIndex = new Map(translit.map((token, index) => [token, index]));

// Source rune words are already GP glyphs. Use corpus.runes to map them to indices.
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
function gpIndices(word) {
  return Array.from(word, (rune) => {
    const value = runeIndex.get(rune);
    assert.notEqual(value, undefined);
    return value;
  });
}
function schedule(offsets) {
  assert.equal(offsets.length, 19);
  const out = [];
  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 19; column += 1) {
      out.push((((row + offsets[column]) % 4) * 19) + column);
    }
  }
  assert.equal(new Set(out).size, 76);
  return out;
}

const lengthOffsets = bodyWords.map((word) => Array.from(word).length % 4);
const indexOffsets = bodyWords.map((word) => gpIndices(word).reduce((a, b) => a + b, 0) % 4);
const primeOffsets = bodyWords.map((word) => gpIndices(word).reduce((sum, index) => sum + gpPrimeWeights[index], 0) % 4);
const schedules = {
  wordLength: schedule(lengthOffsets),
  gpIndexSum: schedule(indexOffsets),
  gpPrimeSum: schedule(primeOffsets)
};
assert.notDeepEqual(schedules.wordLength, schedules.gpIndexSum);
assert.notDeepEqual(schedules.wordLength, schedules.gpPrimeSum);
assert.notDeepEqual(schedules.gpIndexSum, schedules.gpPrimeSum);

console.log(JSON.stringify({
  p57Runes: 95,
  printedWords: words.length,
  bodyWords: bodyWords.length,
  periods: periodCount,
  periodRuneOffsets,
  product: periodCount * bodyWords.length,
  p55Runes: 76,
  p50OuterCells: outerCount,
  contiguousWholeWord76Windows: contiguous76,
  headingPlusBodyDropFirstLength: bodyDropFirst.length,
  headingPlusBodyDropLastLength: bodyDropLast.length,
  explicitDecimalNumbersOnP57: false,
  sourceNaturalNumberRulesMod4: {
    wordLength: lengthOffsets,
    gpIndexSum: indexOffsets,
    gpPrimeSum: primeOffsets
  },
  distinctSchedules: 3,
  decision: 'p57 supplies a new 4x19 cardinality, but does not uniquely select a 76-step numeric update or a unique 76-rune source window.'
}, null, 2));
