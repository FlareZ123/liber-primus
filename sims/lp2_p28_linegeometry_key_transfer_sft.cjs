'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r/g, '');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const signed = read('resources/historical/cicada2016-4gq25-outguess.asc');
const runeSet = new Set(corpus.runes);
const runeIndex = new Map(corpus.runes.map((rune, value) => [rune, value]));
const parts = transcription.split('%');
const mod = (value) => ((value % 29) + 29) % 29;

/** @param {number} page */
function physicalText(page) {
  if (page === 50) return '';
  return parts[page >= 51 ? page - 1 : page];
}

/** @param {number} page */
function lineGeometry(page) {
  let offset = 0;
  let ordinal = 0;
  const rows = [];
  for (const line of physicalText(page).split('\n')) {
    const length = [...line].filter((ch) => runeSet.has(ch)).length;
    if (!length) continue;
    ordinal += 1;
    rows.push({ ordinal, start: offset, length, end: offset + length - 1 });
    offset += length;
  }
  return rows;
}

/** @param {number} page */
function words(page) {
  const output = [];
  let current = [];
  let start = 0;
  let offset = 0;
  function emit() {
    if (!current.length) return;
    output.push({ start, length: current.length });
    current = [];
  }
  for (const ch of physicalText(page)) {
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

const p28Lines = lineGeometry(28);
assert.deepEqual(
  p28Lines.filter((row) => [1,6,7].includes(row.ordinal)),
  [
    { ordinal: 1, start: 0, length: 23, end: 22 },
    { ordinal: 6, start: 117, length: 23, end: 139 },
    { ordinal: 7, start: 140, length: 22, end: 161 },
  ]
);

const p28Words = words(28);
const lineStartTwoRune = p28Lines.filter((row) => {
  const word = p28Words.find((item) => item.start === row.start);
  return word?.length === 2;
});
assert.deepEqual(
  lineStartTwoRune.map((row) => [row.ordinal, row.start, row.length]),
  [[1,0,23],[6,117,23],[7,140,22]]
);

// Existing local THE candidate: source-derived key equals line geometry.
assert.deepEqual([22, 7], [
  p28Lines.find((row) => row.ordinal === 7).length,
  7,
]);

const tokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {string} word */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C')
    .replace(/Z/g, 'S')
    .replace(/[^A-Z]/g, '');
  const result = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith('ING', offset)) {
      result.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith('IO', offset)) {
      result.push(27);
      offset += 2;
      continue;
    }
    const token = tokens.find((item) => normalized.startsWith(item.symbol, offset));
    assert.ok(token);
    result.push(token.value);
    offset += token.symbol.length;
  }
  return result;
}

const clear = signed
  .split('-----BEGIN PGP SIGNATURE-----')[0]
  .slice(signed.indexOf('Hello.'));
const sourceWords = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((word) => /^[A-Za-z]+$/u.test(word))
  .map((word) => word.toUpperCase())
  .slice(0, 43);

const twoRune = sourceWords
  .map((word, index) => ({ index, word, values: gp(word) }))
  .filter((item) => item.values.length === 2);

const p28 = corpus.pages.find((page) => page.page === 28);
const controls = [
  {
    name: 'line1',
    pretargetCommit: 'f679d5cedd9283f65ae8d664920a0cc4c7b27687',
    start: 0,
    key: [23,1],
    ciphertext: [13,5],
    output: [19,4],
  },
  {
    name: 'line6',
    pretargetCommit: '354a9d705095e4d8e57645f4770c0ee3298ab67f',
    start: 117,
    key: [23,6],
    ciphertext: [23,8],
    output: [0,2],
  },
];

for (const control of controls) {
  const ciphertext = p28.indices.slice(control.start, control.start + 2);
  assert.deepEqual(ciphertext, control.ciphertext);
  const output = ciphertext.map((value, index) => mod(value - control.key[index]));
  assert.deepEqual(output, control.output);
  const exact = twoRune.filter((item) =>
    item.values[0] === output[0] && item.values[1] === output[1]
  );
  assert.equal(exact.length, 0);
  control.transliteration = output.map((value) => corpus.translit[value]).join('');
  control.authenticatedTwoRuneMatches = exact;
}

console.log(JSON.stringify({
  status: 'PASS',
  retrospective: {
    p28THE: {
      receiverOffset: 140,
      lineOrdinal: 7,
      lineLength: 22,
      existingKey: [22,7],
    },
  },
  lineStartTwoRune: lineStartTwoRune.map((row) => ({
    ordinal: row.ordinal,
    start: row.start,
    length: row.length,
  })),
  prospectiveControls: controls,
  decision: 'Retain [22,7] as retrospective convergence; two frozen same-page controls reject a reusable line-geometry key rule.',
}, null, 2));
