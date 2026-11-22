'use strict';

/**
 * Original-source, key-independent floral-stencil line-column test.
 * Run from the repository root with Node.js 22:
 *   node sims/lp2_floral_stencil_line_column_key_sft.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const src = path.join(root, 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(src, 'lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(src, 'lp2-transcription.txt'), 'utf8');
const pageTexts = transcription.split(/\n%\s*\n/);
const indexOf = new Map(corpus.runes.map((r, i) => [r, i]));

/** @param {string} s @returns {number[]} */
function runeIndices(s) {
  return Array.from(s).filter(c => indexOf.has(c)).map(c => indexOf.get(c));
}

/** @param {number[]} xs @returns {{n:number,orderedPairs:number,collisions:number,ioc:number}} */
function collisions(xs) {
  const h = Array(29).fill(0);
  for (const x of xs) h[x]++;
  const n = xs.length;
  const orderedPairs = n * (n - 1);
  const matching = h.reduce((s, v) => s + v * (v - 1), 0);
  return { n, orderedPairs, collisions: matching, ioc: orderedPairs ? matching / orderedPairs : 0 };
}

const pages = [];
for (let n = 41; n <= 48; n++) {
  const lines = pageTexts[n].split('\n').map(runeIndices).filter(x => x.length);
  const tape = lines.flat();
  assert.equal(lines.length, 12, 'Same-stencil pages have twelve printed rune lines');
  assert.deepEqual(tape, corpus.pages[n].indices, 'Source lines match canonical rune order');
  pages.push({ page: n, lines });
}

// The original stencil and 12-line layout specify the coordinate BEFORE seeing
// ciphertext. Pool the first 20 rune columns: every line has at least 20 runes.
// A secret alphabet permutation and a secret per-column additive shift both
// preserve each column's equality count.
let numerator = 0;
let denominator = 0;
const columns = [];
for (let c = 0; c < 20; c++) {
  const xs = pages.flatMap(p => p.lines.map(line => line[c]));
  assert.equal(xs.length, 96);
  const stat = collisions(xs);
  numerator += stat.collisions;
  denominator += stat.orderedPairs;
  columns.push({ column: c, ioc: Number(stat.ioc.toFixed(9)) });
}
const columnIoC = numerator / denominator;

// Stronger (more secret keys) independent positionwise mapping per printed line
// and rune column. Equality across pages is still invariant under shared keys.
// Compare exactly corresponding [line, rune-column] slots among the eight pages.
let paired = 0;
let identical = 0;
const pairResults = [];
for (let i = 0; i < pages.length; i++) {
  for (let j = i + 1; j < pages.length; j++) {
    let n = 0;
    let equal = 0;
    for (let line = 0; line < 12; line++) {
      const x = pages[i].lines[line];
      const y = pages[j].lines[line];
      for (let k = 0; k < Math.min(x.length, y.length); k++) {
        n++;
        if (x[k] === y[k]) equal++;
      }
    }
    paired += n;
    identical += equal;
    pairResults.push({ pages: [pages[i].page, pages[j].page], pairs: n, identical: equal });
  }
}

const solvedP57IoC = collisions(corpus.pages[57].indices).ioc;
assert.equal(numerator, 6406);
assert.equal(denominator, 182400);
assert.equal(paired, 7343);
assert.equal(identical, 291);
assert.ok(Math.abs(solvedP57IoC - 0.06270996640537514) < 1e-12);
const mostSimilar = pairResults.reduce((a, b) => b.identical / b.pairs > a.identical / a.pairs ? b : a);

console.log(JSON.stringify({
  source: 'original LP2 physical p41–p48, first 20 rune columns, all 12 lines per page',
  pages: pages.map(p => p.page),
  columns: 20,
  observationsPerColumn: 96,
  orderedPairs: denominator,
  identicalOrdered: numerator,
  columnIoC,
  pagePairPositions: paired,
  identicalPagePairPositions: identical,
  positionwisePagePairRate: identical / paired,
  mostSimilarPair: mostSimilar,
  knownClearP57IoC: solvedP57IoC,
  result: 'No native-language stationary monoalphabetic or additive repeated line-column key on the selected original receiver',
  columnsIoC: columns
}, null, 2));
