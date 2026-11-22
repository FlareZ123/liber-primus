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
  assert(sourcePage, 'missing corpus page ' + pageNumber);
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

function consecutivePairs(width) {
  return Array.from(pages.values())
    .filter((page) => page.lineLengths.length % width === 0)
    .flatMap((page) => {
      const rows = rowsFor(page.page, width);
      return rows.slice(0, -1).map((first, i) => ({
        page: page.page,
        firstRow: i + 1,
        outputs: [first, rows[i + 1]]
      }));
    });
}

const p56 = pages.get(56);
const p6 = pages.get(6);
const p24 = pages.get(24);
assert.deepStrictEqual(p56.lineLengths, [20, 19, 6, 22, 18]);
assert.deepStrictEqual(p6.lineLengths, [20, 24, 24, 3, 18, 19, 20, 24, 22, 22]);
assert.deepStrictEqual(p24.lineLengths, [22, 24, 21, 24, 23, 21, 22, 23, 23, 22, 22, 23]);

const p6Annotation = annotations.pages.find((entry) => entry.page === 6);
assert(p6Annotation.large_punctuation.some((entry) => entry[0] === 71 && entry[1] === 13 && entry[2] === 'red'));
assert(p6Annotation.large_punctuation.some((entry) => entry[0] === 82 && entry[1] === 13 && entry[2] === 'red'));
assert(p6Annotation.red_spans.some((entry) => entry.start === 71 && entry.length === 11));

const p56Rows = rowsFor(56, 5);
const p6Rows = rowsFor(6, 5);
const p24Rows = rowsFor(24, 3);
assert.strictEqual(p56Rows.length, 1);
assert.deepStrictEqual(p56Rows[0], [2, 9, 26, 12, 6]);
assert.deepStrictEqual(p6Rows[0], [2, 9, 21, 27, 24]);
assert.deepStrictEqual(p6Rows[1], [26, 12, 27, 13, 24]);
assert.deepStrictEqual(p24Rows, [
  [1, 14, 24],
  [3, 16, 23],
  [28, 16, 23],
  [28, 16, 22]
]);

const width5Rows = allRows(5);
const width3Rows = allRows(3);
assert.strictEqual(width5Rows.length, 7);
assert.strictEqual(width3Rows.length, 153);
assert.deepStrictEqual(hitsFor(p56Rows[0], 5), [{ page: 56, row: 1, output: p56Rows[0] }]);
assert.deepStrictEqual(hitsFor(p6Rows[0], 5), [{ page: 6, row: 1, output: p6Rows[0] }]);
assert.deepStrictEqual(hitsFor(p6Rows[1], 5), [{ page: 6, row: 2, output: p6Rows[1] }]);
assert.strictEqual(p6Rows.filter((row) => row[4] === 24).length, 2);

const p24Pair = [p24Rows[1], p24Rows[2]];
const pairs = consecutivePairs(3);
const pairHits = pairs.filter((entry) =>
  JSON.stringify(entry.outputs) === JSON.stringify(p24Pair));
assert.strictEqual(pairs.length, 112);
assert.deepStrictEqual(pairHits, [{ page: 24, firstRow: 2, outputs: p24Pair }]);
assert.strictEqual(hitsFor(p24Rows[1], 3).length, 5);
assert.strictEqual(hitsFor(p24Rows[2], 3).length, 2);
assert.strictEqual(width3Rows.filter((entry) => entry.output[2] === 23).length, 55);

const signedWords = [
  'hello', 'the', 'path', 'lies', 'empty', 'epiphany', 'seeks', 'the', 'devoted',
  'liber', 'primus', 'is', 'the', 'way', 'its', 'words', 'are', 'the', 'map',
  'their', 'meaning', 'is', 'the', 'road', 'and', 'their', 'numbers', 'are',
  'the', 'direction', 'seek', 'and', 'you', 'will', 'be', 'found', 'good',
  'luck', '3301', 'beware', 'false', 'paths', 'verify', 'openpgp', '7a35090f'
];
assert.strictEqual(signedWords[p56Rows[0][4]], 'seeks');
assert.strictEqual(signedWords[p6Rows[0][4]], 'and');
assert.strictEqual(signedWords[p24Pair[0][2]], 'road');
assert.strictEqual(signedWords[p24Pair[1][2]], 'road');

console.log(JSON.stringify({
  operation: 'H-shell of original printed-line rune counts, mod 29',
  selectors: {
    p56: { image: 'resources/liber-primus/73.jpg', width: 5, row: 1, lineLengths: p56.lineLengths, output: p56Rows[0] },
    p6: {
      image: 'resources/liber-primus/23.jpg',
      width: 5,
      selectedRow: 1,
      lineLengths: p6.lineLengths,
      red13Offsets: [71, 82],
      row1: p6Rows[0],
      row2: p6Rows[1],
      bothCentersEqual24: p6Rows.every((row) => row[4] === 24)
    },
    p24: {
      image: 'resources/liber-primus/41.jpg',
      width: 3,
      selectedRows: [2, 3],
      lineLengths: p24.lineLengths,
      outputs: p24Pair
    }
  },
  signed2016Centers: [
    { index: 6, word: signedWords[6] },
    { index: 24, word: signedWords[24] },
    { index: 23, word: signedWords[23] }
  ],
  familyControls: {
    compatibleWidth5Rows: width5Rows.length,
    compatibleWidth3Rows: width3Rows.length,
    p56VectorHits: hitsFor(p56Rows[0], 5).length,
    p6Row1VectorHits: hitsFor(p6Rows[0], 5).length,
    p6Row2VectorHits: hitsFor(p6Rows[1], 5).length,
    p6RowsWithCenter24: p6Rows.filter((row) => row[4] === 24).length,
    p24Row2Hits: hitsFor(p24Rows[1], 3).length,
    p24Row3Hits: hitsFor(p24Rows[2], 3).length,
    p24Center23Rows: width3Rows.filter((entry) => entry.output[2] === 23).length,
    consecutiveWidth3Pairs: pairs.length,
    exactP24PairHits: pairHits.length
  },
  interpretation: 'navigation evidence only; no rune-value decryption or key recovery'
}, null, 2));
