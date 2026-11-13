'use strict';
/**
 * Source-structural gate for the four p40-p53 page-start runes.
 *
 * A carry is still a ciphertext symbol. This program therefore never removes
 * the four leading runes and never executes the historical 14-column order.
 *
 * Run: node sims/lp2_p40_53_page_carry_gate.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const chunks = transcription.split('%');
const runeSet = new Set(corpus.runes);

function pageLines(page) {
  if (page === 50) return [];
  const chunkIndex = page < 50 ? page : page - 1;
  assert.ok(chunks[chunkIndex], 'missing transcription chunk for p' + page);
  return chunks[chunkIndex].split(/\r?\n/)
    .map(s => s.trim())
    .filter(s => s && s !== '&' && s !== '$');
}
function stripLineMark(s) {
  return s.endsWith('/') ? s.slice(0, -1) : s;
}
function countRunes(s) {
  return [...s].filter(ch => runeSet.has(ch)).length;
}
function boundary(from, to) {
  const previous = stripLineMark(pageLines(from).at(-1));
  const next = stripLineMark(pageLines(to)[0]);
  const firstWord = next.split('-')[0];
  return {
    from, to, previousLastLine: previous, nextFirstLine: next,
    previousEndsWithWordSeparator: previous.endsWith('-'),
    previousEndsWithPeriod: previous.endsWith('.'),
    firstWord, firstWordRuneCount: countRunes(firstWord)
  };
}

const targetPairs = [[41, 42], [44, 45], [48, 49], [51, 52]];
const targetBoundaries = targetPairs.map(([a, b]) => boundary(a, b));
for (const b of targetBoundaries) {
  assert.equal(b.previousEndsWithWordSeparator, false);
  assert.equal(b.previousEndsWithPeriod, false);
  assert.equal(b.firstWordRuneCount, 1);
}
const p54p55 = boundary(54, 55);
assert.equal(p54p55.previousEndsWithWordSeparator, false);
assert.equal(p54p55.previousEndsWithPeriod, false);
assert.equal(p54p55.firstWordRuneCount, 1);
const p53p54 = boundary(53, 54);
assert.equal(p53p54.previousEndsWithPeriod, true);

const pages = corpus.pages.filter(p => p.page >= 40 && p.page <= 53);
const bodyLength = pages.reduce((n, p) =>
  n + p.indices.length - (p.page === 40 ? 8 : 0), 0);
assert.equal(bodyLength, 3000);
assert.equal(bodyLength % 14, 4);

const pageStartOffsets = {};
let offset = 0;
for (const p of pages) {
  const skip = p.page === 40 ? 8 : 0; // exclude red p40 heading only
  pageStartOffsets[p.page] = offset + skip;
  offset += p.indices.length - skip;
}
const carryPages = [42, 45, 49, 52];
const carries = carryPages.map(page => {
  const p = corpus.pages.find(x => x.page === page);
  return {
    page,
    bodyOffset: pageStartOffsets[page],
    rune: corpus.runes[p.indices[0]]
  };
});
assert.deepEqual(carries.map(x => x.bodyOffset), [496, 1315, 2400, 2558]);
assert.equal(bodyLength - carries.length, 2996); // deletion is the invalid repair

const report = {
  classification: 'page-boundary word-segmentation correction; no cipher transform',
  targetBoundaries,
  p54p55CarryControl: p54p55,
  p53p54ChapterBoundaryControl: p53p54,
  bodyPages: pages.map(p => ({
    page: p.page,
    sourceRunes: p.indices.length,
    excludedRedHeadingRunes: p.page === 40 ? 8 : 0
  })),
  bodyLength,
  carryRunesRetained: carries,
  invalidDeletionLength: bodyLength - carries.length,
  width14: { rows: 214, remainder: 4 },
  historical14ColumnTransformExecuted: false,
  reason: 'carry runes remain ciphertext; no source-defined four-symbol tail rule or identity-changing second stage'
};
console.log(JSON.stringify(report, null, 2));
