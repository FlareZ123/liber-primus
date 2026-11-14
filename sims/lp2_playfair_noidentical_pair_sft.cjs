'use strict';
/**
 * Single-file, source-exact negative control for standard Playfair-like
 * digraph encipherment of the 56 unsolved LP2 physical pages.
 * Run from the repository root: node sims/lp2_playfair_noidentical_pair_sft.cjs
 * No external packages; no English model; no fitted key.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcript = fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const pages = source.pages.filter(p => p.page <= 55 && p.indices.length > 0);
assert.equal(pages.length, 55);
const flat = pages.flatMap(p => p.indices);
assert.equal(flat.length, 12956);

function duplicatesByPairPhase(indices) {
  const count = [0, 0]; // count[1] is a pair with endpoints (0,1), (2,3), ...
  for (let i = 1; i < indices.length; i++) {
    if (indices[i] === indices[i - 1]) count[i & 1]++;
  }
  return count;
}
const global = duplicatesByPairPhase(flat);
assert.deepEqual(global, [49, 37]);
const pageCounts = pages.map(p => ({ page: p.page, pairs: duplicatesByPairPhase(p.indices) }));
const pageReset = pageCounts.reduce((sum, p) => sum.map((v, i) => v + p.pairs[i]), [0, 0]);
assert.deepEqual(pageReset, [51, 35]);
const impossiblePages = pageCounts.filter(p => p.pairs[0] > 0 && p.pairs[1] > 0);
const compulsoryPageViolations = impossiblePages.reduce((n, p) => n + Math.min(...p.pairs), 0);
assert.equal(impossiblePages.length, 14);
assert.equal(compulsoryPageViolations, 17);

// Slash, newline and bare page turns are visual wraps, not word boundaries.
// Stop after exactly 12,956 original unsolved runes before the solved p56.
const alphabet = new Map(source.runes.map((r, i) => [r, i]));
const words = [];
let word = [];
let consumed = 0;
for (const glyph of transcript) {
  if (consumed === flat.length) break;
  if (alphabet.has(glyph)) {
    word.push(alphabet.get(glyph));
    consumed++;
  } else if ('-.$&§'.includes(glyph) && word.length) {
    words.push(word);
    word = [];
  }
}
if (word.length) words.push(word);
assert.equal(consumed, flat.length);
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), flat);
const wordReset = words.reduce((s, w) => {
  const counts = duplicatesByPairPhase(w);
  return s.map((x, i) => x + counts[i]);
}, [0, 0]);
assert.deepEqual(wordReset, [36, 27]);

// Exhaustive positive control: in ordinary 7x7 Playfair, distinct input
// letters always yield distinct output letters, for EVERY legal key square.
function playfairPair(a, b, side) {
  const ar = Math.floor(a / side), ac = a % side;
  const br = Math.floor(b / side), bc = b % side;
  if (ar === br) return [ar * side + (ac + 1) % side, br * side + (bc + 1) % side];
  if (ac === bc) return [((ar + 1) % side) * side + ac, ((br + 1) % side) * side + bc];
  return [ar * side + bc, br * side + ac];
}
for (const side of [5, 7]) {
  for (let a = 0; a < side * side; a++) {
    for (let b = 0; b < side * side; b++) {
      if (a === b) continue; // standard plaintext digraph preprocessing inserts a filler
      const [x, y] = playfairPair(a, b, side);
      assert.notEqual(x, y, 'Playfair output digraph must have different symbols');
    }
  }
}
console.log(JSON.stringify({
  source: 'original LP2 physical p0..p55; p50 is runeless',
  runes: flat.length,
  words: words.length,
  sameRuneAdjacent: global[0] + global[1],
  violationsIfGlobalPhaseEvenOrOdd: [global[1], global[0]],
  violationsIfEveryPageResetEvenOrOdd: [pageReset[1], pageReset[0]],
  pagesImpossibleEvenWithIndividualUnknownPairPhase: impossiblePages.map(x => x.page),
  forcedViolationsAllowingIndependentPagePhases: compulsoryPageViolations,
  violationsIfEveryPrintedWordResetEvenOrOdd: [wordReset[1], wordReset[0]],
  control: 'all distinct input digraphs on 5x5 and 7x7 standard Playfair maps pass'
}, null, 2));
