'use strict';

/**
 * Original LP2 physical-page chapter boundary single-file test.
 * Run: node sims/lp2_visual_chapter_boundary_sft.cjs
 *
 * Rune offsets are canonical; physical p50 is runeless but remains a page.
 * The red-heading/end-of-page 13-dot observations are source-image audits,
 * not guesses about unknown plaintext or historical cipher key resets.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const load = name => JSON.parse(fs.readFileSync(path.resolve(__dirname, '../resources/liber-primus/' + name), 'utf8'));
const corpus = load('lp2-corpus.json');
const ink = load('lp2-ink-annotations.json');
const annotationByPage = new Map(ink.pages.map(page => [page.page, page]));
const pages = corpus.pages;
assert.equal(pages.length, 58);

const chapterStarts = ink.pages
  .filter(page => (page.red_spans || []).some(span => span.start === 0))
  .map(page => page.page);
assert.deepEqual(chapterStarts, [0, 3, 8, 15, 23, 27, 33, 40, 54, 56, 57]);

for (const page of chapterStarts.slice(1)) {
  const before = annotationByPage.get(page - 1);
  assert.ok(before && before.large_punctuation.some(mark =>
    mark[0] === before.rune_count && mark[1] === 13 && mark[2] === 'red'),
  'missing red terminal before p' + page);
}
const cumulative = new Map([[0, 0]]);
let total = 0;
for (const page of pages) {
  total += page.indices.length;
  cumulative.set(page.page + 1, total);
}
assert.equal(total, 13136);
assert.equal(cumulative.get(56), 12956);

const sections = chapterStarts.map((start, index) => {
  const end = index + 1 < chapterStarts.length ? chapterStarts[index + 1] - 1 : 57;
  return { firstPage: start, lastPage: end, start: cumulative.get(start),
    end: cumulative.get(end + 1), runes: cumulative.get(end + 1) - cumulative.get(start) };
});
assert.deepEqual(sections.slice(0, 9).map(s => s.runes),
  [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]);
assert.deepEqual(sections.slice(9).map(s => s.runes), [85, 95]);

const legacyLengths = [729, 1145, 1729, 9, 1894, 1021, 1524, 1589, 3316];
let k = 0;
const legacyCuts = legacyLengths.map(n => (k += n));
const visibleCuts = sections.slice(0, 9).map(s => s.end);
assert.deepEqual(visibleCuts, [729, 1874, 3603, 5506, 6527, 7960, 9640, 12648, 12956]);
assert.deepEqual(legacyCuts, [729, 1874, 3603, 3612, 5506, 6527, 8051, 9640, 12956]);
const differences = {
  visibleOnly: visibleCuts.filter(x => !legacyCuts.includes(x)),
  legacyOnly: legacyCuts.filter(x => !visibleCuts.includes(x))
};
assert.deepEqual(differences.visibleOnly, [7960, 12648]);
assert.deepEqual(differences.legacyOnly, [3612, 8051]);

console.log(JSON.stringify({
  source: ['lp2-corpus.json', 'lp2-ink-annotations.json'],
  cutRule: 'a red rune heading begins at page-local 0, after previous page ends in red 13-dot mark',
  chapterStarts, sections, derivativeNineSectionCuts: legacyCuts, differences,
  separatelySourceVisibleInternalDivisions: [
    {page:15,afterLocalRune:9,context:'number grid followed by new red heading'},
    {page:33,afterLocalRune:91,context:'red chapter mark, three dots, second red heading'},
  ],
  cryptanalyticStatus:'reading order and candidate section boundaries only, no authenticated key reset'
}, null, 2));
