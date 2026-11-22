'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @typedef {{page:number, indices:number[]}} Page */
/** @typedef {{runes:string[], pages:Page[]}} Corpus */

const corpusPath = path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json');
/** @type {Corpus} */
const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));
const pages = corpus.pages.filter((p) => p.page >= 0 && p.page <= 55 && p.indices.length > 0);
const counts = new Array(29).fill(0);
const distinctByPage = [];

for (const page of pages) {
  const present = new Set(page.indices);
  for (const index of page.indices) {
    assert(Number.isInteger(index) && index >= 0 && index < 29, 'GP29 index outside 0..28');
    counts[index] += 1;
  }
  distinctByPage.push({ page: page.page, n: page.indices.length, distinct: present.size });
}

const total = counts.reduce((a, b) => a + b, 0);
const histogram = new Map();
for (const p of distinctByPage) histogram.set(p.distinct, (histogram.get(p.distinct) || 0) + 1);

const ternaryTriplets = Array.from({ length: 27 }, (_, n) => n.toString(3).padStart(3, '0'));
assert.equal(new Set(ternaryTriplets).size, 27);
const standardMorseTriplets = ternaryTriplets.filter((s) => s !== '222');
assert.equal(standardMorseTriplets.length, 26);

assert.equal(corpus.runes.length, 29);
assert.equal(pages.length, 55);
assert.equal(total, 12956);
assert.equal(counts.filter((n) => n > 0).length, 29);
assert.deepEqual(Object.fromEntries([...histogram].sort((a, b) => a[0] - b[0])), { 25: 1, 28: 1, 29: 53 });

console.log('Source: resources/liber-primus/lp2-corpus.json');
console.log('Unknown physical pages p0..p55: 55 rune-bearing, 12956 GP29 runes');
console.log('Global distinct runes: 29 of 29; per-page distinct count histogram:', Object.fromEntries(histogram));
console.log('Under a fixed bijective rune-to-three-trit assignment: maximum 27 codes (or 26 when xxx is forbidden).');
console.log('All 54 unknown rune-bearing pages except p55 contain 28 or 29 distinct runes, so this exact cipher architecture cannot produce them.');
console.log('p55 has 25 distinct runes and is not excluded individually. Homophones, escape symbols, more than three trits, and variable-length codes remain outside this gate.');
