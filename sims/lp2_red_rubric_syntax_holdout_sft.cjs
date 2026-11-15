'use strict';

// Source-frozen syntax gate: red-ink labels versus self-delimited instructions.
// Run from any current directory with Node.js 22 on Windows or elsewhere.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

/** @param {string} basename @returns {any} */
function resource(basename) {
  const p = path.join(__dirname, '..', 'resources', 'liber-primus', basename);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

/**
 * @param {Array<[number, number, string]> | undefined} marks
 * @param {number} offset
 * @param {number} dotCount
 * @returns {boolean}
 */
function hasRedMark(marks, offset, dotCount) {
  return (marks || []).some((m) => m[0] === offset && m[1] === dotCount && m[2] === 'red');
}

/**
 * The grammar is fixed using only p0–p39:
 *  HEADER: red text starts at local rune zero;
 *  ASIDE: noninitial red text has 13-dot marks immediately before and after.
 * Every other form is an out-of-grammar event, even if it looks meaningful.
 *
 * @param {number} page
 * @param {number} start
 * @param {number} length
 * @param {Array<[number,number,string]> | undefined} marks
 * @returns {'HEADER'|'ASIDE'|'UNPARSED'}
 */
function classify(page, start, length, marks) {
  if (start === 0) return 'HEADER';
  if (hasRedMark(marks, start, 13) && hasRedMark(marks, start + length, 13)) {
    return 'ASIDE';
  }
  return 'UNPARSED';
}

function main() {
  const ink = resource('lp2-ink-annotations.json');
  const corpus = resource('lp2-corpus.json');
  const glyphToIndex = new Map(corpus.runes.map((r, i) => [r, i]));
  const corpusPages = new Map(corpus.pages.map((p) => [p.page, p]));
  const counts = {training: {HEADER: 0, ASIDE: 0, UNPARSED: 0},
    holdout: {HEADER: 0, ASIDE: 0, UNPARSED: 0},
    solved: {HEADER: 0, ASIDE: 0, UNPARSED: 0}};
  const unparsed = [];
  let redCount = 0;
  let spanCount = 0;
  let mark10Count = 0;
  let mark13RedCount = 0;
  let mark13BlackCount = 0;
  let mark23Count = 0;
  let redAdjacent10Count = 0;

  for (const p of ink.pages) {
    const sourcePage = corpusPages.get(p.page);
    assert.ok(sourcePage, 'missing source page ' + p.page);
    assert.equal(sourcePage.indices.length, p.rune_count, 'rune count p' + p.page);
    const marks = p.large_punctuation || [];
    for (const m of marks) {
      mark10Count += m[1] === 10 && m[2] === 'red' ? 1 : 0;
      mark13RedCount += m[1] === 13 && m[2] === 'red' ? 1 : 0;
      mark13BlackCount += m[1] === 13 && m[2] === 'black' ? 1 : 0;
      mark23Count += m[1] === 23 && m[2] === 'red' ? 1 : 0;
    }
    for (const s of p.red_spans || []) {
      const glyphs = [...s.runes];
      assert.equal(glyphs.length, s.length, 'span glyph length p' + p.page);
      assert.deepEqual(glyphs.map((g) => glyphToIndex.get(g)),
        sourcePage.indices.slice(s.start, s.start + s.length), 'source runes p' + p.page);
      redCount += s.length;
      spanCount += 1;
      const section = p.page <= 39 ? 'training' : p.page <= 55 ? 'holdout' : 'solved';
      const kind = classify(p.page, s.start, s.length, marks);
      counts[section][kind] += 1;
      if (kind === 'UNPARSED') unparsed.push({page: p.page, start: s.start, length: s.length});
      if (hasRedMark(marks, s.start, 10) ||
          hasRedMark(marks, s.start + s.length, 10)) redAdjacent10Count += 1;
    }
  }

  assert.equal(redCount, 225);
  assert.equal(spanCount, 18);
  assert.equal(mark10Count, 4);
  assert.equal(mark13RedCount, 30);
  assert.equal(mark13BlackCount, 1);
  assert.equal(mark23Count, 1);
  assert.equal(redAdjacent10Count, 0);
  assert.deepEqual(counts.training, {HEADER: 7, ASIDE: 6, UNPARSED: 0});
  assert.deepEqual(counts.holdout, {HEADER: 2, ASIDE: 0, UNPARSED: 1});
  assert.deepEqual(counts.solved, {HEADER: 2, ASIDE: 0, UNPARSED: 0});
  assert.deepEqual(unparsed, [{page: 53, start: 128, length: 51}]);

  const p56 = corpusPages.get(56);
  const p57 = corpusPages.get(57);
  const spell = (p, n) => p.indices.slice(0, n).map((i) => corpus.translit[i]).join('');
  assert.equal(spell(p56, 5), 'AEJOESR');
  assert.equal(spell(p57, 7), 'PARABLE');

  console.log(JSON.stringify({
    status: 'PASS', sourceRedSpans: spanCount, sourceRedRunes: redCount,
    marks: {red10: mark10Count, red13: mark13RedCount,
      black13: mark13BlackCount, red23: mark23Count},
    syntax: counts, unparsed, redAdjacent10Count,
    solvedControls: {p56Printed: spell(p56, 5), p56KnownPlaintext: 'AN END',
      p57PrintedAndPlaintext: spell(p57, 7)}
  }, null, 2));
  console.log('Decision: the p0-p39 two-form syntax fails on p53 red51; neither solved title specifies an opcode/key.');
}

main();
