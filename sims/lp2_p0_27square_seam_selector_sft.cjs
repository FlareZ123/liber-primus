'use strict';

/**
 * Original-cipher-only seam test for the LP2 p0–p2 729-rune opening.
 * Reads the checked-in canonical transcription and GP29 corpus.
 * Does not fit a cipher, score candidate plaintext or search a key.
 *
 * Run: node sims/lp2_p0_27square_seam_selector_sft.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const sourceText = fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const pages = sourceText.split('%').slice(0, 3);

assert.deepEqual(corpus.pages.slice(0, 3).map(p => p.runic_count), [262, 266, 201]);

const events = {
  word: new Set(),
  line: new Set(),
  period: new Set(),
  page: new Set()
};
let runes = 0;
const pageTotals = [];
for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
  for (const character of pages[pageIndex]) {
    if (/[\u16A0-\u16FF]/u.test(character)) {
      runes++;
      continue;
    }
    if (character === '-' || character === '.') events.word.add(runes);
    if (character === '.') events.period.add(runes);
    if (character === '/') events.line.add(runes);
  }
  pageTotals.push(runes);
  if (pageIndex < 2) events.page.add(runes);
}
assert.equal(runes, 729);
assert.deepEqual(pageTotals, [262, 528, 729]);
assert.deepEqual(Object.fromEntries(Object.entries(events).map(([k, v]) => [k, v.size])),
  { word: 157, line: 32, period: 8, page: 2 });

/**
 * @param {Set<number>} positions original rune positions AFTER the delimiter
 * @param {number} width prospective source-grid row width
 * @returns {{width:number, phase0:number, max:number, maxPhases:number[], rank:number, mean:number}}
 */
function phaseTable(positions, width) {
  const hits = [];
  for (let phase = 0; phase < width; phase++) {
    let count = 0;
    for (let boundary = width + phase; boundary < 729; boundary += width) {
      if (positions.has(boundary)) count++;
    }
    hits.push(count);
  }
  const best = Math.max(...hits);
  return {
    width,
    phase0: hits[0],
    max: best,
    maxPhases: hits.flatMap((n, i) => n === best ? [i] : []),
    rank: 1 + hits.filter(n => n > hits[0]).length,
    mean: hits.reduce((a, b) => a + b, 0) / width
  };
}
const out = Object.fromEntries(Object.entries(events).map(([k, v]) =>
  [k, [9, 27, 81].map(width => phaseTable(v, width))]));
assert.equal(out.word[1].phase0, 9);
assert.equal(out.word[1].max, 12);
assert.deepEqual(out.word[1].maxPhases, [2]);
assert.equal(out.line[1].phase0, 2);
assert.equal(out.line[1].max, 4);
assert.equal(out.page[1].phase0, 0);

// Ternary reading test: 729 = 3^6 is a numeric identity, not by itself a
// de Bruijn registration; a true order-6 ternary cycle has 729 distinct windows.
const indices = corpus.pages.slice(0, 3).flatMap(p => p.indices);
assert.equal(indices.length, 729);
const trits = indices.map(x => x % 3);
const windows = new Set(indices.map((_, i) =>
  Array.from({ length: 6 }, (_, j) => trits[(i + j) % 729]).join('')));
assert.equal(windows.size, 443);

console.log(JSON.stringify({ pageTotals, eventCounts: Object.fromEntries(Object.entries(events).map(([k, v]) => [k, v.size])), phase: out, ternaryOrder6Windows: windows.size }, null, 2));
console.log('PASS: original 27-square delimiter and trit registration checks');
