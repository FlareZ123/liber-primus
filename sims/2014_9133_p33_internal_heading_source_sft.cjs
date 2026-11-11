'use strict';
/**
 * Reproduce the exact 2014 trailing-9133 / LP2 p33:91 coordinate match.
 * This is a bounded source association and word-crib rejection, not a decoder.
 * Node.js 22, CommonJS, zero external dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} relativePath */
function readJSON(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}
const annotation = readJSON('resources/liber-primus/lp2-ink-annotations.json');
const corpus = readJSON('resources/liber-primus/lp2-corpus.json');
const raw = fs.readFileSync(path.join(root, 'resources/lp2-transcription.txt'), 'utf8');

const historicalPairs =
  'TL BE IE OV UT HT RE ID TS EO ST PO SO YR ' +
  'SL BT II IY T4 DG UQ IM NU 44 2I 15 33 9M';
const original = historicalPairs.replace(/\s+/gu, '');
const historicalPlain =
  'TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133';
const columnInverse = [0, 6, 2, 5, 1, 4, 3];
assert.equal(original.length, 56);
const decoded = [];
for (let i = 0; i < original.length; i += 7) {
  for (const j of columnInverse) decoded.push(original[i + j]);
}
assert.equal(decoded.join(''), historicalPlain);
assert.equal(historicalPlain.slice(-4), '9133');
assert.equal('TOBELIEVETRUTHISTODESTROYPOSSIBILITY'.length, 36);
assert.equal('Q4UTGDI2N4M4UIM5'.length, 16);
assert.equal(36 + 16 + 4, 56);

const internalRed = annotation.pages
  .filter(p => p.page <= 55)
  .flatMap(p => (p.red_spans || [])
    .filter(span => span.start > 0)
    .map(span => ({
      page: p.page,
      offset: span.start,
      length: span.length,
      locator: `${String(span.start).padStart(2, '0')}${String(p.page).padStart(2, '0')}`,
      preceding13: (p.large_punctuation || []).some(mark =>
        mark[0] === span.start && mark[1] === 13)
    })));
assert.equal(internalRed.length, 7);
const matches = internalRed.filter(span => span.locator === historicalPlain.slice(-4));
assert.equal(matches.length, 1);
assert.deepEqual(matches[0], {
  page: 33, offset: 91, length: 8, locator: '9133', preceding13: true
});

// A different natural split, page 9 / local rune 133, is unmarked.
const otherPage = annotation.pages.find(p => p.page === 9);
assert(otherPage && otherPage.rune_count > 133);
assert(!(otherPage.red_spans || []).some(span => span.start === 133));
assert(!(otherPage.large_punctuation || []).some(mark => mark[0] === 133));

// Inspect the source-visible GP word lengths at this boundary (not a crib fit).
const sourcePage33 = raw.split('%')[33];
const Rune = /[\u16a0-\u16ff]/u;
let pos = 0;
let start = -1;
let pending = '';
/** @type {{start:number,length:number}[]} */
const words = [];
function flush() {
  if (pending) words.push({start, length: [...pending].length});
  pending = '';
  start = -1;
}
for (const character of sourcePage33) {
  if (Rune.test(character)) {
    if (start < 0) start = pos;
    pending += character;
    pos++;
  } else if (character === '/' || /\s/u.test(character)) {
    // Printed line breaks do not delimit GP words.
  } else {
    flush();
  }
}
flush();
assert.equal(pos, 214);
assert.deepEqual(words.filter(w => w.start >= 91 && w.start < 99),
  [{start:91, length:3}, {start:94, length:5}]);
const next = words.find(w => w.start === 99);
assert.deepEqual(next, {start:99, length:6});
const out = {
  historical: {originalLength:56, phraseLength:36, onionLength:16,
    unexplainedSuffix:'9133'},
  internalRedHeadings:internalRed,
  uniqueCoordinateMatch:matches[0],
  markedRedTitleWordLengths:[3, 5],
  nextBodyWordLength:next.length,
  literal2014PhraseFirstWordLengths:[2, 7],
  directWordAlignedHistoricalCrib:false,
  interpretation:'unselected coordinate hypothesis; 4-character transposition padding is a competing explanation'
};
console.log(JSON.stringify(out, null, 2));
console.log('SFT PASS: historic 9133 ↔ p33:91 exact source association only.');
