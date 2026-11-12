/**
 * Original LP2 p55 printed-word circumference checksum SFT.
 * Run from any cwd with Node.js against the checked-out repository.
 * Pure read-only: no generated artifacts or mutable test fixtures.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const CORPUS = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const TRANSCRIPTION = fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const SYMBOL = new Map(CORPUS.runes.map((glyph, id) => [glyph, id]));

function runeIds(text) {
  return Array.from(text).filter(ch => SYMBOL.has(ch)).map(ch => SYMBOL.get(ch));
}

/**
 * Match a physical source page by its full rune stream. Transcription omits
 * numeric-only page p50, so bare split-array indices are not physical pages.
 * @param {number} page
 * @returns {{words: number[][], ids: number[], raw: string}}
 */
function extractPage(page) {
  const expected = CORPUS.pages[page].indices;
  const matches = TRANSCRIPTION.split('%')
    .map(raw => ({raw, ids: runeIds(raw)}))
    .filter(chunk => chunk.ids.length === expected.length &&
      chunk.ids.every((n, i) => n === expected[i]));
  assert.equal(matches.length, 1, 'ambiguous or absent physical page ' + page);
  const {raw, ids} = matches[0];
  const withoutPrintLineBreaks = raw.replace(/[\/\n&$§]/g, '');
  const words = withoutPrintLineBreaks
    .split(/[-.]/)
    .map(runeIds)
    .filter(word => word.length > 0);
  assert.deepEqual(words.flat(), expected, 'p' + page + ' boundaries alter original source');
  return {words, ids, raw};
}

/**
 * Fixed checksum: first+last on the left; sum(strict interiors) on right.
 * Length-two words have empty interiors and must satisfy first+last=0.
 * @param {number[]} word
 * @param {'index'|'prime'} flavor
 * @returns {number} (first+last - interior) mod29
 */
function residual(word, flavor) {
  assert.ok(word.length >= 2, 'incomplete or length-one words excluded');
  const left = (word[0] + word[word.length - 1]) % 29;
  const sum = word.slice(1, -1).reduce(
    (total, rune) => total + (flavor === 'prime' ? CORPUS.prime[rune] : rune), 0);
  return ((left - sum) % 29 + 29) % 29;
}

function counts(rows, field) {
  const tally = Array(29).fill(0);
  rows.forEach(row => { tally[row[field]]++; });
  return tally;
}

const p55 = extractPage(55), p57 = extractPage(57);
assert.equal(p55.ids.length, 76);
assert.deepEqual(p55.words.map(w => w.length),
  [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);
assert.equal(p55.words.length, 17);
assert.equal(p55.words[0].length, 1, 'p54 carry into p55 is not a whole word');
const whole = p55.words.slice(1);
assert.equal(whole.length, 16);
assert.equal(whole.flat().length, 75);
assert.equal(whole.reduce((n, w) => n + Math.max(0, w.length - 2), 0), 43);
assert.equal(whole.reduce((n, w) => n + Math.min(w.length, 2), 1), 33);
assert.equal(p57.ids.length, 95);

const result = whole.map((word, i) => ({
  number: i+1,
  length: word.length,
  GP: word.map(x => CORPUS.translit[x]).join(' '),
  index: residual(word, 'index'),
  prime: residual(word, 'prime'),
}));
const known = p57.words.filter(w => w.length >= 2).map(word => ({
  index: residual(word, 'index'),
  prime: residual(word, 'prime')
}));

for (const flavor of ['index', 'prime']) {
  assert.equal(result.filter(row => row[flavor] === 0).length, 0);
  assert.ok(Math.max(...counts(result, flavor)) < whole.length,
    'a uniform ' + flavor + ' offset should not fit all complete words');
  // Source-native checksum plants: set one word-end for each given printed shape.
  const plant = whole.map(word => {
    const sum = word.slice(1, -1).reduce((s, id) =>
      s + (flavor === 'prime' ? CORPUS.prime[id] : id), 0);
    const last = ((sum - word[0]) % 29 + 29) % 29;
    return [...word.slice(0, -1), last];
  });
  assert.ok(plant.every(word => residual(word, flavor) === 0), flavor + ' positive plant');
  const invalid = plant.map(word => [...word]);
  invalid[0][invalid[0].length - 1] = (invalid[0].at(-1) + 1) % 29;
  assert.equal(invalid.filter(w => residual(w, flavor) !== 0).length, 1,
    flavor + ' one-rune negative plant');
}
console.log(JSON.stringify({
  source: 'original physical p55, 76 source-verified GP29 runes',
  completeWords: whole.length,
  p55: {indexHits: 0, primeHits: 0,
    maxSameOffsetIndex: Math.max(...counts(result, 'index')),
    maxSameOffsetPrime: Math.max(...counts(result, 'prime'))},
  solvedP57: {words: known.length,
    indexHits: known.filter(r => r.index === 0).length,
    primeHits: known.filter(r => r.prime === 0).length},
  table: result
}, null, 2));
