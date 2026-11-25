'use strict';

/**
 * Reproduce the 1952 Hayhanen/VIC-family worked key schedule and checkerboard
 * from David Kahn's CIA-released "Number One From Moscow", then gate LP2 p15
 * and pp49-51 against the source-defined grammar.
 *
 * This is a source gate, not a key search. The historical system requires a
 * decimal digit stream, a 10x4 (40-cell) Russian checkerboard, and a specific
 * mnemonic key schedule. The LP2 panel is a 32x8 base60 token table.
 *
 * Node 22 CommonJS; no external packages.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p));
const mod10 = n => ((n % 10) + 10) % 10;

function chainAdd(seed, totalLength) {
  const digits = [...seed].map(Number);
  assert(digits.length > 1);
  while (digits.length < totalLength) {
    const i = digits.length;
    digits.push(mod10(digits[i - seed.length] + digits[i - seed.length + 1]));
  }
  return digits.join('');
}

function sequentialLetters(text, alphabet) {
  const entries = [...text].map((char, index) => ({
    char, index, rank: alphabet.indexOf(char)
  }));
  assert(entries.every(entry => entry.rank >= 0));
  entries.sort((a, b) => a.rank - b.rank || a.index - b.index);
  const result = Array(text.length);
  entries.forEach((entry, rank) => {
    result[entry.index] = String((rank + 1) % 10);
  });
  return result.join('');
}

function sequentialDigits(text) {
  const entries = [...text].map((char, index) => ({
    char, index, rank: char === '0' ? 10 : Number(char)
  }));
  assert(entries.every(entry => Number.isInteger(entry.rank)));
  entries.sort((a, b) => a.rank - b.rank || a.index - b.index);
  const result = Array(text.length);
  entries.forEach((entry, rank) => {
    result[entry.index] = String((rank + 1) % 10);
  });
  return result.join('');
}

// Kahn's published 1952 example (date 3/9/1945, keygroup 20818).
const russianAlphabet = 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
const keygroup = '20818';
const date = '39194';
const subtraction = [...keygroup].map((digit, i) =>
  String(mod10(Number(digit) - Number(date[i])))
).join('');
const songPhrase = 'ТОЛЬКОСЛЫШНОНАУЛИЦЕГ';
const phraseA = songPhrase.slice(0, 10);
const phraseB = songPhrase.slice(10);
const letterKeyA = sequentialLetters(phraseA, russianAlphabet);
const letterKeyB = sequentialLetters(phraseB, russianAlphabet);
const chainA = chainAdd(subtraction, 10);
const standardDigits = '1234567890';
const sumA = [...letterKeyA].map((digit, i) =>
  String(mod10(Number(digit) + Number(chainA[i])))
).join('');
const lookupB = [...sumA].map(digit =>
  letterKeyB[standardDigits.indexOf(digit)]
).join('');
const sequentialLookup = sequentialDigits(lookupB);
const chainBlock = chainAdd(lookupB, 60).slice(10);
const linesKP = Array.from({ length: 5 }, (_, i) =>
  chainBlock.slice(i * 10, (i + 1) * 10)
);
const lineP = linesKP[4];
const lineS = sequentialDigits(lineP);
const lastDistinct = [];
for (const digit of [...lineP].reverse()) {
  if (!lastDistinct.includes(digit)) lastDistinct.push(digit);
  if (lastDistinct.length === 2) break;
}
const personalNumber = 13;
const tableauWidths = [
  personalNumber + Number(lastDistinct[1]),
  personalNumber + Number(lastDistinct[0])
];

// Published values are asserted rather than silently trusted.
assert.equal(keygroup, '20818');
assert.equal(date, '39194');
assert.equal(subtraction, '91724');
assert.equal(songPhrase.length, 20);
assert.equal(phraseA, 'ТОЛЬКОСЛЫШ');
assert.equal(phraseB, 'НОНАУЛИЦЕГ');
assert.equal(letterKeyA, '7420156398');
assert.equal(letterKeyB, '6871954032');
assert.equal(chainA, '9172408964');
assert.equal(standardDigits, '1234567890');
assert.equal(sumA, '6592554252');
assert.equal(lookupB, '5938991898');
assert.equal(sequentialLookup, '3724891506');
assert.deepEqual(linesKP, [
  '4217809772',
  '6385896498',
  '9133750377',
  '0460253047',
  '4062783411'
]);
assert.equal(lineS, '5073894612');
assert.deepEqual(tableauWidths, [17, 14]);

// Exact checkerboard grammar: 10 decimal columns, 4 rows, seven keyword
// letters in the top row; the final three digits label the lower rows.
const columnDigits = lineS;
const keyword = 'СНЕГОПА';
const rowLabels = columnDigits.slice(7);
assert.equal(columnDigits.length, 10);
assert.equal(keyword.length, 7);
assert.equal(rowLabels, '612');
const topRowCodes = [...keyword].map((letter, i) => ({
  letter, code: columnDigits[i]
}));
assert.equal(topRowCodes.map(x => x.code).join(''), '5073894');
const lowerCoordinateExample = rowLabels[0] + columnDigits[0];
assert.equal(lowerCoordinateExample, '65');
const checkerboard = {
  rows: 4,
  columns: 10,
  cells: 40,
  topRowLetters: 7,
  topRowBlanks: 3,
  lowerRowLabels: [...rowLabels],
  topRowCodes,
  lowerCoordinateExample
};

// Source-grounded LP2 p15 values from original scan 32.jpg.
const p15Values = [
  3299, 3298, 3296, 3294,
  3288, 3278, 3258, 3222,
  3152, 3038, 2838, 2472,
  1820, 708, 1206, 4516
];
const p15Image = read('resources/liber-primus/32.jpg');
const p15ImageSha256 = crypto.createHash('sha256').update(p15Image).digest('hex');
assert.equal(p15ImageSha256, '5543cfce96493b86eece3195b3f5ea6e779ff41551676600b0c2479fc18c0ec5');
assert.equal(p15Values.length, 16);
assert.equal(p15Values.filter(n => String(n).length === 4).length, 15);
assert.equal(p15Values.filter(n => String(n).length === 3).length, 1);
assert(p15Values.every(n => n < 10000));

// The p49-p51 source token panel and its derived byte view.
const base60 = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const byteGrid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const tokens = base60.rows.flat();
const tokenLetters = tokens.filter(token => /[A-Za-z]/.test(token)).length;
const tokenStats = {
  pages: base60.lp2_pages,
  sourceScans: base60.original_scans,
  pageRowCounts: base60.page_row_counts,
  rows: base60.rows.length,
  columns: base60.rows[0].length,
  cells: tokens.length,
  distinctTokens: new Set(tokens).size,
  tokenLengthSet: [...new Set(tokens.map(token => token.length))],
  alphabet: base60.alphabet,
  alphabetLength: base60.alphabet.length,
  tokensContainingLetters: tokenLetters,
  byteCount: byteGrid.byte_count,
  decodedBytes: byteGrid.bytes.length
};
assert.deepEqual(base60.lp2_pages, [49, 50, 51]);
assert.deepEqual(base60.page_row_counts, [10, 13, 9]);
assert.equal(tokenStats.rows, 32);
assert.equal(tokenStats.columns, 8);
assert.equal(tokenStats.cells, 256);
assert.equal(tokenStats.distinctTokens, 161);
assert.deepEqual(tokenStats.tokenLengthSet, [2]);
assert.equal(tokenStats.alphabetLength, 60);
assert.equal(tokenLetters, 214);
assert.equal(byteGrid.byte_count, 256);
assert.equal(byteGrid.bytes.length, 256);
assert.deepEqual(byteGrid.shape, '32 rows by 8 columns across LP2 pages 49, 50, 51');

// The period cipher emits decimal coordinate digits and then five-digit
// ciphertext groups; it is not a 32x8 base60 byte-token representation.
const output = {
  historicalWorkedExample: {
    source: 'David Kahn, "Number One From Moscow", CIA Reading Room PDF',
    keygroup,
    date,
    subtraction,
    songPhrase,
    phraseKeys: [letterKeyA, letterKeyB],
    chainA,
    standardDigits,
    sumA,
    lookupB,
    sequentialLookup,
    linesKP,
    lineS,
    personalNumber,
    tableauWidths,
    checkerboard,
    ciphertextGrammar: 'decimal digits; one- or two-digit checkerboard codes; two transpositions; five-digit groups'
  },
  lp2SourceGate: {
    p15: {
      originalScan: 'resources/liber-primus/32.jpg',
      sha256: p15ImageSha256,
      values: p15Values,
      threeDigitCount: 1,
      fourDigitCount: 15,
      hasFiveDigitKeygroupOrDate: false,
      suppliesTwentyLetterSongPhrase: false,
      suppliesSevenLetterKeyword: false
    },
    p49to51: tokenStats,
    nativeAlphabet: 'Gematria Primus has 29 runes; the historical worked board is Russian 32-letter alphabet plus punctuation/control cells',
    missingSourceSelectedFields: [
      'five-digit random message keygroup',
      'five-digit date',
      'twenty-letter song phrase',
      'seven-letter checkerboard keyword',
      'decimal digit serialization of the 256 base60 tokens'
    ]
  },
  decision: 'STOP BEFORE KEY SEARCH: the historical VIC digit grammar, 40-cell checkerboard, and mnemonic key schedule are not selected by the original p15 numerals or p49-p51 base60 token panel.'
};

console.log(JSON.stringify(output, null, 2));
