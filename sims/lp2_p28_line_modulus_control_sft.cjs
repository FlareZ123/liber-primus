'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'
));
const transcription = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8'
).replace(/\r/g, '');
const runeSet = new Set(corpus.runes);
const runeIndex = new Map(corpus.runes.map((rune, value) => [rune, value]));
const parts = transcription.split('%');

/** @param {number} page */
function segment(page) {
  if (page === 50) return '';
  return parts[page >= 51 ? page - 1 : page];
}

/** @param {number} page */
function pageLines(page) {
  let offset = 0;
  let ordinal = 0;
  const output = [];
  for (const line of segment(page).split('\n')) {
    const length = [...line].filter((ch) => runeSet.has(ch)).length;
    if (!length) continue;
    ordinal += 1;
    output.push({
      page,
      ordinal,
      start: offset,
      length,
      end: offset + length - 1,
      sum: ordinal + length,
    });
    offset += length;
  }
  return output;
}

/** @param {number} page */
function pageWords(page) {
  const output = [];
  let current = [];
  let start = 0;
  let offset = 0;
  function emit() {
    if (!current.length) return;
    output.push({ start, length: current.length });
    current = [];
  }
  for (const ch of segment(page)) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if (/[-.&$§,:!?\s]/u.test(ch)) {
      emit();
    }
  }
  emit();
  return output;
}

const lines = [];
for (let page = 0; page <= 57; page += 1) {
  if (page === 50) continue;
  lines.push(...pageLines(page));
}
assert.equal(lines.length, 604);

const sum29 = lines.filter((line) => line.sum === 29);
assert.equal(sum29.length, 49);
assert.equal(new Set(sum29.map((line) => line.page)).size, 32);

const typed = sum29.map((line) => {
  const word = pageWords(line.page).find((item) => item.start === line.start);
  return { ...line, lineStartWordLength: word?.length ?? null };
});
const twoRune = typed.filter((line) => line.lineStartWordLength === 2);
assert.deepEqual(
  twoRune.map((line) => [line.page, line.ordinal, line.start, line.length]),
  [
    [13,7,136,22],
    [15,6,92,23],
    [17,8,159,21],
    [20,7,134,22],
    [23,7,123,22],
    [26,8,158,21],
    [27,8,145,21],
    [28,6,117,23],
    [28,7,140,22],
    [40,6,99,23],
    [40,9,169,20],
  ]
);

const p28 = twoRune.filter((line) => line.page === 28);
assert.deepEqual(
  p28.map((line) => [line.ordinal, line.start, line.length]),
  [[6,117,23],[7,140,22]]
);

console.log(JSON.stringify({
  status: 'PASS',
  totalPrintedRunicLines: lines.length,
  sum29Lines: sum29.length,
  sum29Pages: new Set(sum29.map((line) => line.page)).size,
  sum29TwoRuneLineStarts: twoRune,
  p28Controls: p28,
  decision: 'length+ordinal=29 is non-selective; p28 has adjacent qualifying line6 and line7 two-rune starts.',
}, null, 2));
