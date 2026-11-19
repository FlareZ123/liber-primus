'use strict';

const fs = require('fs');
const assert = require('assert');

const transcription = fs.readFileSync('resources/liber-primus/lp2-transcription.txt', 'utf8');
const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const annotations = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-ink-annotations.json', 'utf8'));
const segments = transcription.split(/^\s*%\s*$/m);
assert.strictEqual(segments.length, 57, 'expected p0-p49 and p51-p57');

const pages = new Map();
for (let i = 0; i < segments.length; i++) {
  const page = i >= 50 ? i + 1 : i;
  const lines = segments[i].split(/\r?\n/).filter((line) => {
    const t = line.trim();
    return t.length > 0 && t !== '&' && t !== '$';
  });
  const lineLengths = lines.map((line) => (line.match(/[\u16A0-\u16FF]/gu) || []).length);
  const sourcePage = corpus.pages.find((entry) => entry.page === page);
  assert(sourcePage, 'missing corpus page ' + page);
  assert.strictEqual(lineLengths.reduce((a, b) => a + b, 0), sourcePage.runic_count,
    'line/corpus rune-count mismatch on p' + page);
  let offset = 0;
  const runeLines = lineLengths.map((length) => {
    const line = sourcePage.indices.slice(offset, offset + length);
    offset += length;
    return line;
  });
  assert.strictEqual(offset, sourcePage.indices.length, 'line slicing mismatch on p' + page);
  pages.set(page, { page, lines, lineLengths, runeLines, indices: sourcePage.indices });
}
assert.strictEqual(pages.size, 57);

function mod29(n) { return ((n % 29) + 29) % 29; }

// Extend the p28 H(a,b)=(a-b,a+b) mod 29 outside-in over odd-width rows.
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

function mapRows(pageNumber, width) {
  const page = pages.get(pageNumber);
  assert(page, 'missing p' + pageNumber);
  assert.strictEqual(page.lineLengths.length % width, 0,
    'p' + pageNumber + ' line count not divisible by width ' + width);
  return Array.from({ length: page.lineLengths.length / width }, (_, row) =>
    hShell(page.lineLengths.slice(row * width, (row + 1) * width))
  );
}
function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

const targets = [
  { page: 0, width: 3, row: 1, output: [1, 10, 23] },
  { page: 7, width: 5, row: 2, output: [9, 8, 0, 13, 23] },
  { page: 18, width: 3, row: 2, output: [0, 13, 23] },
  { page: 23, width: 5, row: 1, output: [26, 14, 23, 11, 17] },
  { page: 56, width: 5, row: 1, output: [2, 9, 26, 12, 6] }
];

const targetHits = {};
for (const target of targets) {
  const rows = mapRows(target.page, target.width);
  assert(same(rows[target.row - 1], target.output),
    'unexpected selected H-shell row p' + target.page + ' row ' + target.row);
  const hits = [];
  for (const page of pages.values()) {
    if (page.lineLengths.length % target.width !== 0) continue;
    const candidates = mapRows(page.page, target.width);
    for (let i = 0; i < candidates.length; i++) {
      if (same(candidates[i], target.output)) hits.push({ page: page.page, row: i + 1 });
    }
  }
  assert.strictEqual(hits.length, 1, 'target row not unique: ' + JSON.stringify(target.output));
  assert.strictEqual(hits[0].page, target.page);
  assert.strictEqual(hits[0].row, target.row);
  targetHits['p' + target.page + '_row' + target.row] = hits;
}

const p0Rows = mapRows(0, 3);
const p7Rows = mapRows(7, 5);
const p18Rows = mapRows(18, 3);
const p23Rows = mapRows(23, 5);
const p56Rows = mapRows(56, 5);
assert(same(p7Rows[1].slice(2), p18Rows[1]), 'p7 suffix must equal p18 selected row');
assert(same(p0Rows[3], p23Rows[0].slice(0, 3)), 'p0 row4 must equal p23 row1 prefix');

const signedWords = [
  'Hello', 'The', 'path', 'lies', 'empty', 'epiphany', 'seeks', 'the', 'devoted',
  'Liber', 'Primus', 'is', 'the', 'way', 'Its', 'words', 'are', 'the', 'map',
  'their', 'meaning', 'is', 'the', 'road', 'and', 'their', 'numbers', 'are',
  'the', 'direction', 'Seek', 'and', 'you', 'will', 'be', 'found', 'Good',
  'luck', '3301', 'Beware', 'false', 'paths', 'Verify', 'OpenPGP', '7A35090F'
];
const centerExtracts = [
  { page: 56, index: p56Rows[0][4], word: signedWords[p56Rows[0][4]] },
  { page: 23, index: p23Rows[0][4], word: signedWords[p23Rows[0][4]] },
  { page: 18, index: p18Rows[1][2], word: signedWords[p18Rows[1][2]] }
];
assert.deepStrictEqual(centerExtracts.map((entry) => entry.index), [6, 17, 23]);
assert.deepStrictEqual(centerExtracts.map((entry) => entry.word.toLowerCase()), ['seeks', 'the', 'road']);

const p6Rows = mapRows(6, 5);
const p6Annotations = annotations.pages.find((entry) => entry.page === 6);
assert(p6Annotations.large_punctuation.some((entry) => entry[0] === 71 && entry[1] === 13),
  'p6 red 13-dot marker at offset 71 not found');
assert.strictEqual(p6Rows[0][4], 24);
assert.strictEqual(signedWords[24].toLowerCase(), 'and');

const p26Rows = mapRows(26, 3);
const p26Annotations = annotations.pages.find((entry) => entry.page === 26);
assert(p26Annotations.large_punctuation.some((entry) => entry[0] === 265 && entry[1] === 13),
  'p26 red 13-dot marker at offset 265 not found');
assert.strictEqual(p26Rows[3][2], 23);
const p17Rows = mapRows(17, 3);
const p24Rows = mapRows(24, 3);

const p18 = pages.get(18);
const p18WordCounts = p18.lines.map((line) => (line.match(/[\u16A0-\u16FF]+/gu) || []).length);
const p18WordRows = Array.from({ length: p18WordCounts.length / 3 }, (_, row) =>
  hShell(p18WordCounts.slice(row * 3, (row + 1) * 3))
);
assert(!p18WordRows.some((row) => same(row, [0, 13, 23])));

function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
const p18Packet = p18Rows.flat();
const p18Period12 = {
  subtract: ioc(p18.indices.map((value, i) => mod29(value - p18Packet[i % 12]))),
  add: ioc(p18.indices.map((value, i) => mod29(value + p18Packet[i % 12])))
};

// p23-only vertical/half-turn test against the established p56 prime-totient
// stream. Every admissible literal-F bypass clock state is retained.
const chapterPages = [23, 24, 25, 26].map((page) => pages.get(page));
const chapterLength = chapterPages.reduce((sum, page) => sum + page.indices.length, 0);
assert.strictEqual(chapterLength, 1021);
function firstPrimes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { prime = false; break; }
    }
    if (prime) out.push(n);
  }
  return out;
}
const primeStream = firstPrimes(chapterLength).map((prime) => (prime - 1) % 29);
function firstStrictFFailure(cipher, stream) {
  let states = new Set([0]);
  for (let pos = 0; pos < cipher.length; pos++) {
    const c = cipher[pos];
    const next = new Set();
    for (const tick of states) {
      const key = stream[tick];
      if (c === 0) {
        next.add(tick);
        if (key !== 0) next.add(tick + 1);
      } else if (mod29(c - key) !== 0) {
        next.add(tick + 1);
      }
    }
    if (next.size === 0) return pos;
    states = next;
  }
  return null;
}
const p23Lines = chapterPages[0].runeLines;
const unchangedTail = chapterPages.slice(1).flatMap((page) => page.runeLines.flat());
const p23Vertical = p23Lines.slice().reverse().flat().concat(unchangedTail);
const p23Rotation180 = p23Lines.slice().reverse()
  .map((line) => line.slice().reverse()).flat().concat(unchangedTail);
const totientGate = [
  { transform: 'p23 vertical line-order reflection', keyOrder: 'forward',
    firstFailure: firstStrictFFailure(p23Vertical, primeStream) },
  { transform: 'p23 vertical line-order reflection', keyOrder: 'reversed',
    firstFailure: firstStrictFFailure(p23Vertical, primeStream.slice().reverse()) },
  { transform: 'p23 180-degree page rotation', keyOrder: 'forward',
    firstFailure: firstStrictFFailure(p23Rotation180, primeStream) },
  { transform: 'p23 180-degree page rotation', keyOrder: 'reversed',
    firstFailure: firstStrictFFailure(p23Rotation180, primeStream.slice().reverse()) }
];
assert.deepStrictEqual(totientGate.map((entry) => entry.firstFailure), [0, 67, 17, 143]);

const lineCountHistogram = {};
for (const page of pages.values()) {
  lineCountHistogram[page.lineLengths.length] = (lineCountHistogram[page.lineLengths.length] || 0) + 1;
}
const compatibleRowCounts = {};
for (const width of [3, 5]) {
  let rows = 0;
  for (const page of pages.values()) {
    if (page.lineLengths.length % width === 0) rows += page.lineLengths.length / width;
  }
  compatibleRowCounts[width] = rows;
}

console.log(JSON.stringify({
  source: {
    transcription: 'resources/liber-primus/lp2-transcription.txt',
    corpus: 'resources/liber-primus/lp2-corpus.json',
    annotations: 'resources/liber-primus/lp2-ink-annotations.json',
    pageCount: pages.size,
    lineCountHistogram
  },
  operation: 'H-shell on original printed-line rune counts, modulo 29',
  compatibleRowsTested: compatibleRowCounts,
  targetHits,
  selectedMaps: {
    p0_width3: p0Rows,
    p7_width5: p7Rows,
    p18_width3: p18Rows,
    p23_width5: p23Rows,
    p56_width5: p56Rows
  },
  crossPageEchoes: {
    p7SelectedSuffixEqualsP18SelectedRow: p7Rows[1].slice(2),
    p0FourthRowEqualsP23SelectedPrefix: p0Rows[3]
  },
  sourceMessageCenterExtraction: centerExtracts,
  p6Continuation: { rows: p6Rows, selectedRowCenter: p6Rows[0][4], word: signedWords[24] },
  tentativeReciprocalMaps: { p17: p17Rows, p24: p24Rows, p26: p26Rows },
  p18WordCountNegativeControl: p18WordRows,
  p18Period12AdditiveNegativeControlIoC: p18Period12,
  p23PagewisePrimeTotientNegativeGate: totientGate
}, null, 2));
