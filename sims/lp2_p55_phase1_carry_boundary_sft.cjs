'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const raw = fs.readFileSync(
  path.join(root, 'resources', 'lp2-transcription.txt'), 'utf8');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runePattern = /[\u16A0-\u16FF]/u;
const segments = raw.split('%').slice(0, 55);
const stream = segments.join('%');

/** @typedef {{rune:string,page:number}} RuneSite */
/** @type {RuneSite[][]} */
const words = [];
/** @type {RuneSite[]} */
let current = [];
let page = 0;

function finish() {
  if (!current.length) return;
  words.push(current);
  current = [];
}

for (const character of stream) {
  if (runePattern.test(character)) {
    current.push({ rune: character, page });
  } else if (character === '%') {
    page += 1;
  } else if (character === '/' || /\s/u.test(character)) {
    // Printed wrapping does not delimit a word.
  } else {
    finish();
  }
}
finish();

/** @param {number} runePage @returns {number} */
function physicalPage(runePage) {
  return runePage >= 50 ? runePage + 1 : runePage;
}

/** @param {RuneSite[]} word @returns {string} */
function translit(word) {
  return word.map(({ rune }) => corpus.translit[runeIndex.get(rune)]).join('');
}

const pageStarts = [];
for (let p = 1; p < segments.length; p += 1) {
  const crossing = words.find((word) =>
    word[0].page < p && word.some((site) => site.page === p));
  const carryRunes = crossing
    ? crossing.filter((site) => site.page === p).length
    : 0;
  pageStarts.push({
    runePage: p,
    physicalPage: physicalPage(p),
    carryRunes,
    word: crossing ? translit(crossing) : null,
    fromPhysicalPage: crossing ? physicalPage(crossing[0].page) : null,
  });
}

const histogram = {};
for (const start of pageStarts) {
  histogram[start.carryRunes] = (histogram[start.carryRunes] || 0) + 1;
}
assert.deepEqual(histogram, {
  0: 22, 1: 9, 2: 12, 3: 3, 4: 2, 5: 4, 6: 1, 7: 1,
});

const crossPageWords = words.filter(
  (word) => word[0].page !== word[word.length - 1].page);
assert.equal(crossPageWords.length, 32);

const p55 = pageStarts.find((start) => start.physicalPage === 55);
assert.deepEqual(p55, {
  runePage: 54,
  physicalPage: 55,
  carryRunes: 1,
  word: 'GOTTHXEEARGYNG',
  fromPhysicalPage: 54,
});

let p55LocalOffset = 0;
const p55Entries = [];
for (const word of words) {
  const onPage = word.filter((site) => site.page === 54);
  if (!onPage.length) continue;
  const entry = {
    localStart: p55LocalOffset,
    localLength: onPage.length,
    completeOnP55: word[0].page === 54 && word[word.length - 1].page === 54,
    translit: translit(word),
  };
  p55Entries.push(entry);
  p55LocalOffset += onPage.length;
}
assert.equal(p55LocalOffset, 76);
assert.deepEqual(p55Entries[0], {
  localStart: 0,
  localLength: 1,
  completeOnP55: false,
  translit: 'GOTTHXEEARGYNG',
});
assert.deepEqual(p55Entries[1], {
  localStart: 1,
  localLength: 4,
  completeOnP55: true,
  translit: 'AEMIW',
});

const oneRuneCarryPages = pageStarts
  .filter((start) => start.carryRunes === 1)
  .map((start) => start.physicalPage);
assert.deepEqual(oneRuneCarryPages, [10,20,26,32,42,45,49,52,55]);

console.log(JSON.stringify({
  runeBearingPageStarts: pageStarts.length,
  crossPageWordCount: crossPageWords.length,
  carryLengthHistogram: histogram,
  oneRuneCarryPages,
  p55,
  p55RuneCount: p55LocalOffset,
  firstWhollyP55Word: p55Entries[1],
  packetFrozenStartLocalRune: 1,
  exactBoundaryAlignment: p55Entries[1].localStart === 1,
  oneRuneCarryRateAllPageStarts: oneRuneCarryPages.length / pageStarts.length,
  oneRuneCarryRateAmongCrossPageStarts:
    oneRuneCarryPages.length / crossPageWords.length,
  decision:
    'p55 phase1 exactly equals the first wholly p55-local word start after one carried rune, but one-rune carries occur at 9/54 page starts and are not unique.',
}, null, 2));
