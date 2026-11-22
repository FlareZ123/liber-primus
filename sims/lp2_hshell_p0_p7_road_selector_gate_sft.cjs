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

const p0 = pages.get(0);
const p7 = pages.get(7);
assert.deepStrictEqual(p0.lineLengths, [20, 23, 19, 22, 24, 21, 21, 23, 23, 20, 23, 23]);
assert.deepStrictEqual(p7.lineLengths, [20, 21, 21, 22, 22, 23, 21, 23, 21, 14]);

const p0Annotation = annotations.pages.find((entry) => entry.page === 0);
assert(p0Annotation.large_punctuation.some((entry) =>
  entry[0] === 13 && entry[1] === 13 && entry[2] === 'red'));
assert(p0Annotation.red_spans.some((entry) => entry.start === 0 && entry.length === 13));

const p18Annotation = annotations.pages.find((entry) => entry.page === 18);
assert.strictEqual(p18Annotation, undefined, 'p18 unexpectedly has a marker annotation');

const p0Selected = hShell(p0.lineLengths.slice(0, 3));
const p7Selected = hShell(p7.lineLengths.slice(5, 10));
assert.deepStrictEqual(p0Selected, [1, 10, 23]);
assert.deepStrictEqual(p7Selected, [9, 8, 0, 13, 23]);

const width3Rows = allRows(3);
const width5Rows = allRows(5);
assert.strictEqual(width3Rows.length, 153);
assert.strictEqual(width5Rows.length, 7);
assert.strictEqual(hitsFor(p0Selected, 3).length, 1);
assert.strictEqual(hitsFor(p7Selected, 5).length, 1);

const signedWords = [
  'hello', 'the', 'path', 'lies', 'empty', 'epiphany', 'seeks', 'the', 'devoted',
  'liber', 'primus', 'is', 'the', 'way', 'its', 'words', 'are', 'the', 'map',
  'their', 'meaning', 'is', 'the', 'road', 'and', 'their', 'numbers', 'are',
  'the', 'direction', 'seek', 'and', 'you', 'will', 'be', 'found', 'good',
  'luck', '3301', 'beware', 'false', 'paths', 'verify', 'openpgp', '7a35090f'
];
assert.strictEqual(signedWords[p0Selected[2]], 'road');
assert.strictEqual(signedWords[p7Selected[4]], 'road');

console.log(JSON.stringify({
  operation: 'H-shell of original printed-line rune counts, mod 29',
  selectors: {
    p0: {
      image: 'resources/liber-primus/17.jpg',
      cue: 'red 13-dot, three-column mark at offset 13 after the red 13-rune span; width 3, top row 1',
      lineLengths: p0.lineLengths,
      output: p0Selected
    },
    p7: {
      image: 'resources/liber-primus/24.jpg',
      cue: 'five black dots beneath ten printed lines; width 5, bottom row 2',
      lineLengths: p7.lineLengths,
      output: p7Selected
    }
  },
  signed2016Index: { index: 23, word: signedWords[23] },
  familyControls: {
    compatibleWidth3Rows: width3Rows.length,
    compatibleWidth5Rows: width5Rows.length,
    p0SelectedVectorHits: hitsFor(p0Selected, 3).length,
    p7SelectedVectorHits: hitsFor(p7Selected, 5).length
  },
  excludedControls: {
    p18HasNoMarkerAnnotation: p18Annotation === undefined,
    p18RowNotSelected: true,
    p0Row4EchoNotUsed: true,
    index23ToPhysicalPage23NotAuthenticated: true
  },
  interpretation: 'source-word index convergence only; physical p23 handoff not established'
}, null, 2));
