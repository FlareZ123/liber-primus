'use strict';

/**
 * Director #1507 correction: reject the three-complete-word terminal map premise
 * using the canonical word parser. Read-only CommonJS / Node 22.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));

const alphabet = new Map(corpus.runes.map((rune, index) => [rune, index]));
const unknown = source.split('%').slice(0, 55).join('%');
const words = [];
let fragment = [];
let rawPage = 0;
let line = 1;
let startPage = -1;
let endPage = -1;
let startLine = -1;
let endLine = -1;

const physicalPage = (page) => page >= 50 ? page + 1 : page;

/** Finish one complete printed word. */
function finishWord() {
  if (!fragment.length) return;
  words.push({
    runes: fragment.map((index) => corpus.runes[index]).join(''),
    translit: fragment.map((index) => corpus.translit[index]).join(''),
    startPage: physicalPage(startPage),
    endPage: physicalPage(endPage),
    startLine,
    endLine
  });
  fragment = [];
}

let runeCount = 0;
for (const char of unknown) {
  if (alphabet.has(char)) {
    if (!fragment.length) {
      startPage = rawPage;
      startLine = line;
    }
    fragment.push(alphabet.get(char));
    endPage = rawPage;
    endLine = line;
    runeCount++;
  } else if (char === '%') {
    rawPage++;
    line = 1;
  } else if (char === '/') {
    line++;
  } else if (/\s/u.test(char)) {
    // Physical wrapping is layout, not a word delimiter.
  } else {
    finishWord();
  }
}
finishWord();

assert.equal(runeCount, 12956);
assert.equal(words.length, 2896);
assert.equal(words.filter((word) => word.startPage !== word.endPage).length, 32);

const frequency = new Map();
for (const word of words) {
  frequency.set(word.runes, (frequency.get(word.runes) || 0) + 1);
}

const CX = 'ᚳᛉ';
const DJU = 'ᛞᛄᚢ';
const BEI = 'ᛒᛖᛁ';

assert.equal(frequency.get(CX) || 0, 0);
assert.deepEqual(words.slice(-3).map((word) => word.translit),
  ['CEAIMCX', 'DJU', 'BEI']);
assert.deepEqual(words.slice(-3).map((word) => frequency.get(word.runes)),
  [1, 2, 2]);

const p34Suffix = words.find((word) =>
  word.startPage === 34 && word.startLine === 9 &&
  word.endLine === 10 && word.runes.endsWith(CX));
assert(p34Suffix);
assert.equal(p34Suffix.translit, 'BGCX');

const dju = words
  .map((word, index) => ({word, index}))
  .filter(({word}) => word.runes === DJU);
const bei = words
  .map((word, index) => ({word, index}))
  .filter(({word}) => word.runes === BEI);
assert.equal(dju.length, 2);
assert.equal(bei.length, 2);
assert.deepEqual(dju.map(({word}) => [word.startPage, word.startLine]),
  [[27, 2], [55, 4]]);
assert.deepEqual(bei.map(({word}) => [word.startPage, word.startLine]),
  [[27, 2], [55, 4]]);
assert.ok(dju.every(({index}, i) => bei[i].index === index + 1));

console.log('CORRECTION: CX complete-word count = 0');
console.log('P55 complete suffix: CEAIMCX / DJU / BEI, frequencies 1 / 2 / 2');
console.log('P34 visible CX is the line-wrapped suffix of BGCX');
console.log('SURVIVES: DJU / BEI is a genuine repeated adjacent complete-word pair');
console.log('DECISION: withdraw the three-word numbers-as-direction experiment');
