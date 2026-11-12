#!/usr/bin/env node
'use strict';

// Reproduce the source-constrained 9x11 red-dot mask hypothesis.
// Inputs are the repository's LP2 transcription and normalized corpus.
// The dot-row patterns are transcribed from the original p55/p57 JPEGs;
// see communications/broadcast/20261112T215329Z_agent32_red-dot-geometry.md.

const fs = require('node:fs');
const path = require('node:path');

const read = (p) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const parts = transcription.split('%');

function runeRuns(s) {
  return s.replace(/\/\s*/g, '').match(/[\u16A0-\u16FF]+/gu) || [];
}
function mod29(x) { return ((x % 29) + 29) % 29; }
function translit(indices) {
  return indices.map((i) => corpus.translit[i]).join('');
}

const p55Words = runeRuns(parts[54]);
const p55Inner = p55Words
  .flatMap((w) => [...w].slice(1, -1))
  .map((r) => corpus.runes.indexOf(r));
const p57TitleRun = runeRuns(parts[56])[0];
const p57Title = [...p57TitleRun.slice(0, 7)]
  .map((r) => corpus.runes.indexOf(r));
const data = [...p55Inner, ...p57Title];

const p32 = corpus.pages.find((p) => p.page === 32).indices;
if (p32.length !== 121) throw new Error(`Expected 121 p32 runes; got ${p32.length}`);
if (p55Inner.length !== 43) throw new Error(`Expected 43 p55 interiors; got ${p55Inner.length}`);
if (p57Title.length !== 7) throw new Error(`Expected 7 p57 title runes; got ${p57Title.length}`);

// Nine-row dot patterns: 13-dot band, 23-dot band, repeated 13-dot band.
// The order 13/23/13 is the historical 5/7/5 square order; obtaining it
// from page order wraps the p57 early 13-dot mark to the end ("end is
// only the beginning").
const p13 = ['010','101','010','101','010','101','010','101','010']
  .map((s) => [...s].map(Number));
const p23 = ['01110','10001','01110','10001','01110','10001','01110','10001','01110']
  .map((s) => [...s].map(Number));
const mask = p13.map((row, r) => [...row, ...p23[r], ...row]);
const dotCount = mask.flat().reduce((a, b) => a + b, 0);
const blankCount = mask.flat().reduce((a, b) => a + (b === 0), 0);
if (mask.length !== 9 || mask.some((r) => r.length !== 11)) throw new Error('Mask is not 9x11');
if (dotCount !== 49 || blankCount !== 50) throw new Error(`Unexpected mask counts ${dotCount}/${blankCount}`);

const rowKey = [];
const colKey = [];
for (let r = 0; r < 9; r++) {
  for (let c = 0; c < 11; c++) {
    if (mask[r][c] === 0) {
      // Drop the first and last p32 rows: "shed the circumference".
      rowKey.push(p32[(r + 1) * 11 + c]);
      // Transposed alternative: drop the first and last p32 columns.
      colKey.push(p32[c * 11 + (r + 1)]);
    }
  }
}
if (rowKey.length !== 50 || colKey.length !== 50) throw new Error('Selected key length mismatch');

function combine(a, b, sign) {
  return translit(a.map((x, i) => mod29(x + sign * b[i])));
}

const output = {
  construction: {
    dotBandCounts: [13, 23, 13],
    bandWidths: [3, 5, 3],
    maskShape: [9, 11],
    dotCount,
    blankCount,
    p55WordCount: p55Words.length,
    p55InteriorCount: p55Inner.length,
    p57Title: translit(p57Title),
    dataCount: data.length,
    historicalSquareOrders: [5, 7, 5],
    squareInteriorOrders: [3, 5, 3],
  },
  maskRows: mask.map((r) => r.map((x) => x ? '1' : '0').join('')),
  data: translit(data),
  p32MiddleRowsKey: translit(rowKey),
  p32MiddleColumnsKey: translit(colKey),
  rowMajor: {
    subtract: combine(data, rowKey, -1),
    add: combine(data, rowKey, 1),
  },
  transposed: {
    subtract: combine(data, colKey, -1),
    add: combine(data, colKey, 1),
  },
};

process.stdout.write(JSON.stringify(output, null, 2) + '\n');
