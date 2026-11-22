'use strict';

/**
 * SFT: conditional cuneiform bookcode SW exactly echoes the first complete
 * original GP29 word of the section's last physical page (p39).
 * This is a source observation, not a decryption.
 *
 * Windows Node.js 22: node sims/lp2_cuneiform_sw_terminal_word_echo_sft.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
/** @param {string} file */
const get = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(get('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(get('resources/liber-primus/lp2-ink-annotations.json'));
const physical = get('resources/liber-primus/lp2-transcription.txt').split('%');
const index = new Map(corpus.runes.map((r, i) => [r, i]));

/** @type {{page:number,number:number,start:number,end:number,values:number[]}[]} */
const lines = [];
/** @type {{page:number,offset:number,index:number,exactLine:boolean}[]} */
const headings = [];
/** @type {{page:number,values:number[]}[]} */
const words = [];
for (let p = 0; p < 56; p++) {
  if (p === 50) continue;
  const raw = physical[p < 50 ? p : p - 1];
  const rows = [];
  let offset = 0, lineStart = 0;
  /** @type {number[]} */
  let current = [];
  /** @type {number[]} */
  let active = [];
  for (const ch of raw) {
    if (index.has(ch)) {
      const v = index.get(ch);
      current.push(v);
      active.push(v);
      offset++;
    } else {
      if ((ch === '-' || ch === '.') && active.length) {
        words.push({page: p, values: active});
        active = [];
      }
      if (ch === '\n' && current.length) {
        rows.push({page: p, number: rows.length + 1,
          start: lineStart, end: offset, values: current});
        current = [];
        lineStart = offset;
      }
    }
  }
  if (current.length) {
    rows.push({page: p, number: rows.length + 1,
      start: lineStart, end: offset, values: current});
  }
  assert.equal(offset, corpus.pages.find((z) => z.page === p).indices.length);
  const base = lines.length;
  lines.push(...rows);
  const source = ink.pages.find((z) => z.page === p);
  for (const span of source?.red_spans || []) {
    const rowIndex = rows.findIndex((z) => z.start <= span.start && span.start < z.end);
    assert(rowIndex >= 0, 'red heading outside physical lines');
    headings.push({page: p, offset: span.start, index: base + rowIndex,
      exactLine: rows[rowIndex].start === span.start});
  }
  // A printed word may cross physical pages; retain that case separately below.
  if (active.length && p === 55) words.push({page: p, values: active});
}
headings.sort((a, b) => a.index - b.index);
assert.equal(lines.length, 594);
assert.equal(headings.length, 16);
/** @param {number[]} value */
const roman = (value) => value.map((v) => corpus.translit[v]).join('');
/** @param {{values:number[]}[]} source @param {number} row1 @param {number} col1 */
function point(source, row1, col1) {
  const row = source[row1 - 1];
  assert(row && row.values.length >= col1 && col1 > 0, 'bookcode point in range');
  const v = row.values[col1 - 1];
  return {value: v, page: row.page, printedLine: row.number,
    runeOffset: row.start + col1 - 1, roman: corpus.translit[v]};
}
const eligible = [];
for (let i = 0; i < headings.length; i++) {
  const start = headings[i];
  const stop = i + 1 < headings.length ? headings[i + 1].index : lines.length;
  const section = lines.slice(start.index, stop);
  if (section.length < 55 || section[16].values.length < 13) continue;
  const a = point(section, 17, 13);
  const b = point(section, 55, 1);
  const lastPage = section[section.length - 1].page;
  const opening = corpus.pages.find((z) => z.page === lastPage).indices.slice(0, 2);
  const readout = a.roman + b.roman;
  const echo = roman(opening);
  eligible.push({firstRedPage: start.page, lastPage, sourceLines: section.length,
    readout, printedStart: echo, match: readout === echo,
    pointA: a, pointB: b});
}
assert.deepEqual(eligible.map((z) =>
  [z.firstRedPage,z.lastPage,z.sourceLines,z.readout,z.printedStart,z.match]), [
  [8,15,79,'IS','FU',false],
  [15,23,85,'XA','UA',false],
  [27,33,65,'NNG','DEO',false],
  [33,39,69,'SW','SW',true],
  [40,53,131,'RAE','EOAE',false]
]);
const best = eligible.find((z) => z.firstRedPage === 33);
assert(best);
assert.deepEqual(best.pointA, {value: 15, page: 34,
  printedLine: 11, runeOffset: 233, roman: 'S'});
assert.deepEqual(best.pointB, {value: 7, page: 38,
  printedLine: 3, runeOffset: 44, roman: 'W'});
const p39 = physical[39];
assert(p39.includes('\nᛋᚹ-'), 'p39 first complete word is exactly ᛋᚹ');
assert.equal(roman(corpus.pages.find((z) => z.page === 39).indices.slice(0,2)), 'SW');
const twoLetterSW = words.filter((w) => w.values.length === 2 && roman(w.values) === 'SW');
assert.equal(twoLetterSW.length, 1, 'only one complete SW word in original LP2 p0..55');
assert.equal(twoLetterSW[0].page, 39);
console.log(JSON.stringify({SFT: 'original-cuneiform-terminal-word-echo',
  sourcePoints: [best.pointA, best.pointB],
  p39FirstPrintedWord: 'ᛋᚹ = SW',
  eligible, uniqueCompleteSWWordPage: twoLetterSW[0].page,
  recoveredPlaintext: false,
  caveat: 'This is a retrospectively noticed equality; no valid p-value or source-typed cipher operation follows.'}, null, 2));
