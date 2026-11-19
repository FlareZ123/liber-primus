'use strict';

const fs = require('fs');
const assert = require('assert');

const transcription = fs.readFileSync('resources/liber-primus/lp2-transcription.txt', 'utf8');
const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const annotations = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-ink-annotations.json', 'utf8'));
const segments = transcription.split(/^\s*%\s*$/m);
assert.strictEqual(segments.length, 57);

const pages = new Map();
for (let i = 0; i < segments.length; i++) {
  const pageNumber = i >= 50 ? i + 1 : i;
  const lines = segments[i].split(/\r?\n/).filter((line) => {
    const t = line.trim();
    return t.length > 0 && t !== '&' && t !== '$';
  });
  const lineLengths = lines.map((line) => (line.match(/[\u16A0-\u16FF]/gu) || []).length);
  const sourcePage = corpus.pages.find((entry) => entry.page === pageNumber);
  assert(sourcePage, 'missing p' + pageNumber);
  assert.strictEqual(lineLengths.reduce((a, b) => a + b, 0), sourcePage.runic_count,
    'line/corpus rune-count mismatch on p' + pageNumber);
  pages.set(pageNumber, { page: pageNumber, lineLengths });
}
assert.strictEqual(pages.size, 57);

function mod29(n) { return ((n % 29) + 29) % 29; }

function hShell(row) {
  const out = [];
  let left = 0;
  let right = row.length - 1;
  while (left < right) {
    out.push(mod29(row[left] - row[right]));
    out.push(mod29(row[left] + row[right]));
    left++;
    right--;
  }
  if (left === right) out.push(mod29(row[left]));
  return out;
}

function rowsFor(pageNumber, width) {
  const lengths = pages.get(pageNumber).lineLengths;
  assert.strictEqual(lengths.length % width, 0);
  return Array.from({ length: lengths.length / width }, (_, i) =>
    hShell(lengths.slice(i * width, (i + 1) * width)));
}

function allRows(width) {
  return Array.from(pages.values())
    .filter((page) => page.lineLengths.length % width === 0)
    .flatMap((page) => Array.from({ length: page.lineLengths.length / width }, (_, i) => ({
      page: page.page,
      row: i + 1,
      output: hShell(page.lineLengths.slice(i * width, (i + 1) * width))
    })));
}

function hitsFor(target, width) {
  return allRows(width).filter((entry) =>
    JSON.stringify(entry.output) === JSON.stringify(target));
}

const p23 = pages.get(23);
const p26 = pages.get(26);
const p17 = pages.get(17);
assert.deepStrictEqual(p23.lineLengths, [20, 17, 17, 23, 23, 23, 22, 22, 25, 21]);
assert.deepStrictEqual(p26.lineLengths, [20, 22, 23, 22, 24, 23, 24, 21, 19, 24, 23, 20]);
assert.deepStrictEqual(p17.lineLengths, [23, 23, 23, 22, 23, 22, 23, 21, 23, 23, 23, 24]);

const p26Annotation = annotations.pages.find((entry) => entry.page === 26);
assert(p26Annotation.large_punctuation.some((entry) =>
  entry[0] === 265 && entry[1] === 13 && entry[2] === 'red'));
assert.strictEqual(p26.lineLengths.reduce((a, b) => a + b, 0), 265);

const p23Rows = rowsFor(23, 5);
const p26Rows = rowsFor(26, 3);
const p17Rows = rowsFor(17, 3);
assert.deepStrictEqual(p23Rows[0], [26, 14, 23, 11, 17]);
assert.deepStrictEqual(p26Rows[3], [4, 15, 23]);
assert.deepStrictEqual(p17Rows, [
  [0, 17, 23],
  [0, 15, 23],
  [0, 17, 21],
  [28, 18, 23]
]);

const width5Rows = allRows(5);
const width3Rows = allRows(3);
assert.strictEqual(width5Rows.length, 7);
assert.strictEqual(width3Rows.length, 153);
assert.strictEqual(hitsFor(p23Rows[0], 5).length, 1);
assert.deepStrictEqual(hitsFor(p26Rows[3], 3), [
  { page: 19, row: 1, output: [4, 15, 23] },
  { page: 26, row: 4, output: [4, 15, 23] },
  { page: 47, row: 3, output: [4, 15, 23] }
]);
assert.strictEqual(width3Rows.filter((entry) => entry.output[2] === 23).length, 55);
assert.strictEqual(p17Rows.filter((row) => row[2] === 23).length, 3);

const signedWords = [
  'hello', 'the', 'path', 'lies', 'empty', 'epiphany', 'seeks', 'the', 'devoted',
  'liber', 'primus', 'is', 'the', 'way', 'its', 'words', 'are', 'the', 'map',
  'their', 'meaning', 'is', 'the', 'road', 'and', 'their', 'numbers', 'are',
  'the', 'direction', 'seek', 'and', 'you', 'will', 'be', 'found', 'good',
  'luck', '3301', 'beware', 'false', 'paths', 'verify', 'openpgp', '7a35090f'
];
assert.strictEqual(signedWords[p23Rows[0][2]], 'road');
assert.strictEqual(signedWords[p26Rows[3][2]], 'road');

console.log(JSON.stringify({
  operation: 'H-shell of original printed-line rune counts, mod 29',
  selectors: {
    p23: {
      image: 'resources/liber-primus/40.jpg',
      visualCue: 'five black dots above text; width 5, top row 1',
      lineLengths: p23.lineLengths,
      selectedOutput: p23Rows[0]
    },
    p26: {
      image: 'resources/liber-primus/43.jpg',
      visualCue: 'red 13-dot, three-column mark at terminal rune offset 265; width 3, bottom row 4',
      lineLengths: p26.lineLengths,
      markerOffset: 265,
      selectedOutput: p26Rows[3]
    }
  },
  p17NegativeControl: {
    rows: p17Rows,
    center23Count: p17Rows.filter((row) => row[2] === 23).length
  },
  familyControls: {
    compatibleWidth5Rows: width5Rows.length,
    compatibleWidth3Rows: width3Rows.length,
    p23Row1ExactHits: hitsFor(p23Rows[0], 5).length,
    p26Row4ExactHits: hitsFor(p26Rows[3], 3).length,
    p26Row4ExactLocations: hitsFor(p26Rows[3], 3).map((entry) => ({ page: entry.page, row: entry.row })),
    width3Center23Rows: width3Rows.filter((entry) => entry.output[2] === 23).length
  },
  interpretation: 'negative for a discriminating p23-p26 page-index loop; no plaintext or cipher'
}, null, 2));
