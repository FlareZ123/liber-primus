'use strict';

/**
 * Source-led geometry and core-only original-cipher obstruction for LP2 p54/p55.
 * Windows 11, Node.js 22: run as a single-file test in the repository root.
 *
 * This is a necessary-condition test, not a claimed LP2 decoder.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');
const solved = fs.readFileSync(
  path.join(__dirname, '../resources/liber-primus/lp1-plaintext-reference.txt'), 'utf8'
);
const p54 = corpus.pages.find((p) => p.page === 54).indices;
const p55 = corpus.pages.find((p) => p.page === 55).indices;
const p57 = corpus.pages.find((p) => p.page === 57).indices;
const cipher = [...p54.slice(-10), ...p55];
const lengths = [11, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
assert.equal(cipher.length, 86);
assert.equal(p55.length, 76);
assert.equal(lengths.reduce((a, b) => a + b, 0), 86);
assert.equal(grid.bytes.length, 256);
assert.match(solved, /THE CIRCUMFERENCE PRACTICES THREE BEHAVIORS/);
assert.match(solved, /WE MUST SHED OUR OWN CIRCUMFERENCES/);

const gp = (xs) => xs.map((n) => corpus.translit[n]).join('');
const shells = [];
const cores = [];
const twoRuneWords = [];
const wholeWords = [];
let offset = 0;
for (const [wi, length] of lengths.entries()) {
  const word = cipher.slice(offset, offset + length);
  wholeWords.push(gp(word));
  shells.push(offset, offset + length - 1);
  for (let i = 1; i < length - 1; i++) cores.push(offset + i);
  if (length === 2) twoRuneWords.push({index: wi, word: gp(word)});
  offset += length;
}
assert.equal(offset, 86);
assert.equal(shells.length, 34);
assert.equal(cores.length, 52);
assert.equal(new Set([...shells, ...cores]).size, 86);
assert.deepEqual(twoRuneWords.map((v) => v.word), ['SB', 'XM', 'WR', 'EOE', 'THOE']);
assert.deepEqual(wholeWords.slice(-2), ['DJU', 'BEI']);

const ringLengths = [];
const innerDimensions = [];
for (let layer = 0; layer <= 3; layer++) {
  const height = 32 - 2 * layer;
  const width = 8 - 2 * layer;
  ringLengths.push(2 * (height + width) - 4);
  innerDimensions.push([height, width]);
}
assert.deepEqual(ringLengths, [76, 68, 60, 52]);
assert.deepEqual(innerDimensions[3], [26, 2]);
assert.equal(26 * 2, 52);
assert.equal(256 - 52, 204);
assert.equal(204, 34 * 6);

// An arbitrary reversible change on *every* strict core rune cannot
// change the five two-rune words. An otherwise unrestricted decoder
// acting exclusively on cores has the same fixed-word invariant.
const testPlain = cipher.map((value, index) => cores.includes(index) ? (value + 1) % 29 : value);
const reencrypted = testPlain.map((value, index) => cores.includes(index) ? (value + 28) % 29 : value);
assert.deepEqual(reencrypted, cipher);
offset = 0;
const unchangedTwoRuneWords = [];
for (const [wi, length] of lengths.entries()) {
  if (length === 2) {
    assert.deepEqual(testPlain.slice(offset, offset + length), cipher.slice(offset, offset + length));
    unchangedTwoRuneWords.push(wi);
  }
  offset += length;
}
assert.equal(unchangedTwoRuneWords.length, 5);
assert.equal(p57.length, 95);
console.log(JSON.stringify({
  source: 'LP1 p10 THREE BEHAVIORS; LP2 p57 SHED; original p49-p51 32x8 table; p54-last10+p55',
  originalRunes: cipher.length,
  fullWordLengths: lengths,
  fullWords: wholeWords,
  wordInteriors: cores.length,
  wordExteriors: shells.length,
  twoRuneWords,
  nestedRingPerimeters: ringLengths,
  threePeelDimensions: innerDimensions[3],
  outerThreeLayers: 204,
  originalPage55Runes: p55.length,
  boundaryMismatch: 'p55 76-page tape is not the cross-page 86-complete-word tape',
  coreOnlyImmutableWords: unchangedTwoRuneWords.length,
  originalForwardReplay: '86/86',
  result: 'Any strict core-only value transform leaves five entire ciphertext words fixed. Full native-GP decoding requires changing their endpoints, a separate exterior decoder, or independently justified non-prose shell semantics.'
}, null, 2));
