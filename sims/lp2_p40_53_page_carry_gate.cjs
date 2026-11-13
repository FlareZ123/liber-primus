'use strict';
/**
 * Source-structural gate for p40-p53 cross-page word carries.
 *
 * Uses the repository's canonical continuous parser. A carry is still a
 * ciphertext symbol; this program never deletes carry runes and never runs
 * the historical 14-column permutation.
 *
 * Run: node sims/lp2_p40_53_page_carry_gate.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseLP2Words, physicalLP2Page} = require('./lp2_word_pages.cjs');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const parsed = parseLP2Words(transcription);
assert.equal(parsed.runeCount, 12956);
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.crossPageWords, 32);

const expected = [
  {from: 41, to: 42, runes: 'ᛟᛟᚳᛏᛄᛞ', length: 6, bodyOffset: 496},
  {from: 44, to: 45, runes: 'ᚱᛗᛞᛋᚳ', length: 5, bodyOffset: 1315},
  {from: 48, to: 49, runes: 'ᛇᚠᚢᛞᚣᚪᛚᚠᛡ', length: 9, bodyOffset: 2400},
  {from: 51, to: 52, runes: 'ᛈᛚᚠᛈ', length: 4, bodyOffset: 2558}
];
const actual = expected.map(want => {
  const matches = parsed.words.filter(word =>
    physicalLP2Page(word.startPage) === want.from &&
    physicalLP2Page(word.endPage) === want.to);
  assert.equal(matches.length, 1, 'expected one carried word at p' + want.from);
  const word = matches[0];
  assert.equal(word.runes, want.runes);
  assert.equal(word.length, want.length);
  return {...want, parserStartPage: word.startPage, parserEndPage: word.endPage};
});

const p54p55 = parsed.words.filter(word =>
  physicalLP2Page(word.startPage) === 54 &&
  physicalLP2Page(word.endPage) === 55);
assert.equal(p54p55.length, 1);
assert.equal(p54p55[0].length, 11);
assert.equal(p54p55[0].runes, 'ᚷᚩᛏᚦᛉᛖᛠᚱᚷᚣᛝ');

const pageChunks = transcription.split('%');
const physicalPageChunk = page => page < 50 ? page : page - 1;
const pageLines = page => {
  if (page === 50) return [];
  return pageChunks[physicalPageChunk(page)].split(/\r?\n/)
    .map(s => s.trim()).filter(s => s && s !== '&' && s !== '$');
};
const p53Last = pageLines(53).at(-1).replace(/\/$/, '');
assert.ok(p53Last.endsWith('.'), 'p53->p54 must retain its terminal period');

const bodyPages = corpus.pages.filter(p => p.page >= 40 && p.page <= 53);
const bodyLength = bodyPages.reduce((n, p) =>
  n + p.indices.length - (p.page === 40 ? 8 : 0), 0);
assert.equal(bodyLength, 3000);
assert.equal(bodyLength % 14, 4);
assert.equal(bodyLength - expected.length, 2996); // invalid: deletes real runes

const report = {
  classification: 'four confirmed members of the existing 32 cross-page words; no cipher transform',
  totalUnknownRunes: parsed.runeCount,
  completeWords: parsed.words.length,
  crossPageWords: parsed.crossPageWords,
  p40p53CarryWords: actual,
  p54p55CarryControl: p54p55[0],
  p53p54ChapterBoundaryControl: {lastLine: p53Last, terminalPeriod: true},
  p40p53BodyRunes: bodyLength,
  bodyLengthModulo14: 4,
  invalidDeletionLength: bodyLength - expected.length,
  carryRunesRetained: true,
  historical14ColumnTransformExecuted: false,
  reason: 'word carry changes segmentation, not ciphertext inventory; no source-defined four-symbol tail rule or identity-changing second stage'
};
console.log(JSON.stringify(report, null, 2));
