#!/usr/bin/env node
'use strict';

// Offline integrity check for the derived 180-event LP2 punctuation inventory.
// Run from the repository root: node sims/lp2_punctuation_identity_stream.cjs

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const data = read('resources/liber-primus/lp2-punctuation-identity.json');
const corpus = read('resources/liber-primus/lp2-corpus.json');
const annotations = read('resources/liber-primus/lp2-ink-annotations.json');
const grid = read('resources/liber-primus/lp2-grid-256.json').bytes;
const assert = (ok, message) => { if (!ok) throw new Error(message); };

const counts = data.events.reduce((a, e) => {
  a[e.symbol] = (a[e.symbol] || 0) + 1;
  return a;
}, {});
assert(data.rune_count === 12956, 'wrong unsolved rune count');
assert(data.events.length === 180, 'wrong punctuation event count');
assert(counts['⁘'] === 145 && counts['⁚'] === 4 && counts['⁜'] === 31, 'punctuation class counts differ');

let cursor = 0;
const pageStarts = new Map();
for (const page of corpus.pages) {
  pageStarts.set(page.page, cursor);
  cursor += page.indices.length;
}
const expected = [];
for (const page of annotations.pages.filter(p => p.page <= 55)) {
  for (const mark of (page.large_punctuation || [])) {
    expected.push({
      rune_offset: pageStarts.get(page.page) + mark[0],
      page: page.page,
      local_rune_offset: mark[0],
      dot_count: mark[1],
      color: mark[2]
    });
  }
}
expected.sort((a,b) => a.rune_offset-b.rune_offset || a.page-b.page || a.local_rune_offset-b.local_rune_offset);
const actual = data.events.filter(e => e.symbol === '⁜').map(e => ({
  rune_offset: e.rune_offset,
  page: e.page,
  local_rune_offset: e.local_rune_offset,
  dot_count: e.large_mark.dot_count,
  color: e.large_mark.color
}));
assert(JSON.stringify(actual) === JSON.stringify(expected), 'chapter markers do not exactly match large-punctuation annotations');

const interior = [];
for (let r = 1; r < 31; r++) for (let c = 1; c < 7; c++) interior.push(grid[r*8+c]);
assert(interior.length === 180, '32x8 interior is not 180 cells');
const terminal = corpus.pages.filter(p => p.page === 56 || p.page === 57).reduce((s,p) => s+p.indices.length, 0);
assert(terminal === 180, 'terminal solved pages are not 180 runes');

const primes = [];
for (let n = 2; n <= 1300; n++) {
  let prime = true;
  for (let d = 2; d*d <= n; d++) if (n % d === 0) { prime = false; break; }
  if (prime) primes.push(n);
}
assert(primes.slice(20,200).length === 180, 'p21 through p200 prime count differs');

console.log(JSON.stringify({
  events: data.events.length,
  counts,
  chapter_annotation_records: actual.length,
  unique_chapter_offsets: new Set(actual.map(e => e.rune_offset)).size,
  duplicate_chapter_offsets: [...new Set(actual.map(e => e.rune_offset).filter((x,i,a) => a.indexOf(x) !== i))],
  comma_events: data.comma_events,
  table_interior_cells: interior.length,
  p21_through_p200_prime_count: primes.slice(20,200).length,
  terminal_solved_runes: terminal
}, null, 2));
