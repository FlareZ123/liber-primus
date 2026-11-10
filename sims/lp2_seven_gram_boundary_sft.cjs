'use strict';

/**
 * SFT: canonical LP2 six-vs-seven-rune repeat boundary regression.
 * Run from the repository root with Node.js: node sims/lp2_seven_gram_boundary_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const byPage = new Map(corpus.pages.map(p => [p.page, p]));
const runeString = indices => indices.map(i => corpus.runes[i]).join('');

function withinPageRepeats(pages, width) {
  const first = new Map();
  const repeated = [];
  for (const page of pages) {
    for (let offset = 0; offset + width <= page.indices.length; offset++) {
      const token = page.indices.slice(offset, offset + width).join(',');
      const old = first.get(token);
      if (old) repeated.push({ first: old, second: { page: page.page, offset }, runes: runeString(page.indices.slice(offset, offset + width)) });
      else first.set(token, { page: page.page, offset });
    }
  }
  return repeated;
}

function continuousRepeats(pages, width) {
  const flat = pages.flatMap(p => p.indices.map((value, offset) => ({ value, page: p.page, offset })));
  const first = new Map();
  const repeated = [];
  for (let i = 0; i + width <= flat.length; i++) {
    const token = flat.slice(i, i + width).map(x => x.value).join(',');
    const old = first.get(token);
    if (old) repeated.push({ first: flat[old], second: flat[i], secondEnd: flat[i + width - 1], runes: runeString(flat.slice(i, i + width).map(x => x.value)) });
    else first.set(token, i);
  }
  return repeated;
}

const unsolved = corpus.pages.filter(p => p.page <= 55);
const runesUnsolved = unsolved.reduce((n, p) => n + p.indices.length, 0);
assert.equal(runesUnsolved, 12956);
assert.equal(byPage.get(50).indices.length, 0);
const p27 = byPage.get(27);
const p55 = byPage.get(55);
const p56 = byPage.get(56);
assert.equal(p55.indices.length, 76);
const six = runeString(p27.indices.slice(28, 34));
assert.equal(six, 'ᛞᛄᚢᛒᛖᛁ');
assert.equal(runeString(p55.indices.slice(70)), six);
const seven = runeString(p27.indices.slice(28, 35));
assert.equal(seven, 'ᛞᛄᚢᛒᛖᛁᚫ');
assert.equal(runeString([...p55.indices.slice(70), p56.indices[0]]), seven);

const within6 = withinPageRepeats(unsolved, 6);
const within7 = withinPageRepeats(unsolved, 7);
const acrossUnsolved7 = continuousRepeats(unsolved, 7);
const acrossEntire7 = continuousRepeats(corpus.pages, 7);
assert.equal(within6.length, 1);
assert.equal(within7.length, 0);
assert.equal(acrossUnsolved7.length, 0);
assert.equal(acrossEntire7.length, 1);
assert.deepEqual(within6[0].first, { page: 27, offset: 28 });
assert.deepEqual(within6[0].second, { page: 55, offset: 70 });
assert.equal(acrossEntire7[0].first.page, 27);
assert.equal(acrossEntire7[0].first.offset, 28);
assert.equal(acrossEntire7[0].second.page, 55);
assert.equal(acrossEntire7[0].second.offset, 70);
assert.equal(acrossEntire7[0].secondEnd.page, 56);
assert.equal(acrossEntire7[0].secondEnd.offset, 0);

console.log('[SFT] Canonical physical pages:', corpus.pages.length);
console.log('[SFT] Unsolved runes:', runesUnsolved, '; rune-free physical page50:', byPage.get(50).indices.length);
console.log('[SFT] Six-rune repeated token:', six, 'p27:28 and p55:70 (last six of page55)');
console.log('[SFT] Seven-rune token in p27:', seven);
console.log('[SFT] Its alleged second copy ends at:', acrossEntire7[0].secondEnd);
console.log('[SFT] Entirely within physical pages, repeated 6-grams:', within6.length, ', repeated 7-grams:', within7.length);
console.log('[SFT] Continuous unsolved text repeated 7-grams:', acrossUnsolved7.length);
console.log('[SFT] Continuous text including solved p56 repeated 7-grams:', acrossEntire7.length);
console.log('[SFT] PASS: no valid seven-rune repeat in the 12,956 unsolved symbols');
