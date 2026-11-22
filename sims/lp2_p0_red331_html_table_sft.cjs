'use strict';

/**
 * Original LP2 p0 red-heading prime-sum / 2014 distributor / 32x8
 * numerical-table crosslink. This checks a candidate clue, NOT a cipher.
 * Run as a single file from the repository root on Node.js 22.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.resolve(__dirname, '..', name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const table = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const originalText = read('resources/liber-primus/lp2-transcription.txt');
const originalHtml = read('resources/historical/stage11-2014-index.html');
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));

/** @param {number[]} indices @returns {number} */
const primeSum = indices => indices.reduce((sum, i) => sum + corpus.prime[i], 0);

/**
 * Join physical-page carries, then split solely on real printed delimiters.
 * The transcription's rune-free table page50 has no '%' chunk.
 * @returns {{indices:number[],page:number}[]}
 */
function originalWords() {
  const sourcePages = originalText.split('%');
  assert.equal(sourcePages.length, 57);
  const words = [];
  let current = [];
  let beginning = -1;

  /** Close a full printed word. */
  function finish() {
    if (!current.length) return;
    words.push({indices: current, page: beginning});
    current = [];
    beginning = -1;
  }

  for (let section = 0; section < 55; section += 1) {
    const physicalPage = section < 50 ? section : section + 1;
    for (const ch of sourcePages[section]) {
      const i = runeIndex.get(ch);
      if (i !== undefined) {
        if (!current.length) beginning = physicalPage;
        current.push(i);
      } else if ('-.$&§'.includes(ch)) {
        finish();
      }
    }
  }
  finish();
  return words;
}

const words = originalWords();
assert.equal(words.length, 2896);
assert.equal(words.reduce((n, w) => n + w.indices.length, 0), 12956);
assert.deepEqual(words[0].indices, corpus.pages[0].indices.slice(0, 8));
assert.deepEqual(words[1].indices, corpus.pages[0].indices.slice(8, 13));
assert.equal(words[0].page, 0);
assert.equal(words[1].page, 0);

const first = primeSum(words[0].indices);
const second = primeSum(words[1].indices);
assert.deepEqual([first, second], [347, 315]);
assert.equal((first + second) / 2, 331);
assert.equal(first - second, 32);

assert.match(originalHtml, /<title>133<\/title>/);
assert.match(originalHtml, /<div id="331">/);
assert.equal(table.bytes.length, 256);
assert.equal(table.pages.reduce((n, p) => n + p.rows, 0), 32);
assert.ok(table.pages.every(p => p.cols === 8));

const candidatePairs = [];
const sum662Pairs = [];
for (let i = 0; i < words.length - 1; i += 1) {
  const w1 = words[i], w2 = words[i + 1];
  const total = primeSum(w1.indices) + primeSum(w2.indices);
  if (w1.indices.length === 8 && w2.indices.length === 5) {
    candidatePairs.push({index:i, page:w1.page, total});
  }
  if (total === 662) {
    sum662Pairs.push({
      index:i, page:w1.page, lengths:[w1.indices.length,w2.indices.length],
      sums:[primeSum(w1.indices), primeSum(w2.indices)]
    });
  }
}
assert.equal(candidatePairs.length, 19);
assert.deepEqual(candidatePairs.filter(x => x.total === 662).map(x => x.index), [0]);
assert.equal(sum662Pairs.length, 2);
assert.equal(sum662Pairs[1].page, 43);
assert.deepEqual(sum662Pairs[1].sums, [498, 164]);

// Conditional fixed-title-multiset shuffle: all 8-of-13 allocations.
const title = corpus.pages[0].indices.slice(0, 13);
let all = 0, targetFirst347 = 0, targetFirst315 = 0;
for (let mask = 0; mask < (1 << 13); mask += 1) {
  let n = 0, sum = 0;
  for (let i = 0; i < 13; i += 1) {
    if (((mask >>> i) & 1) !== 0) {
      n += 1;
      sum += corpus.prime[title[i]];
    }
  }
  if (n !== 8) continue;
  all += 1;
  if (sum === 347) targetFirst347 += 1;
  if (sum === 315) targetFirst315 += 1;
}
assert.equal(all, 1287);
assert.deepEqual([targetFirst347, targetFirst315], [10, 11]);

console.log(JSON.stringify({
  source: 'original LP2 p0 transcript, 2014 Stage11 index, printed p49-51 grid',
  firstRedRunes: 8,
  secondRedRunes: 5,
  primeSums: [first, second],
  sum: first + second,
  mean: (first + second) / 2,
  difference: first - second,
  HTMLTitle: 133,
  HTMLDivId: 331,
  printedTable: '32 rows x 8 columns',
  originalWords: words.length,
  eightFivePairs: candidatePairs.length,
  eightFiveWithCombined662: candidatePairs.filter(x => x.total === 662).length,
  allAdjacentWithCombined662: sum662Pairs,
  conditionalTitleMultiset: {
    allocations: all, first347: targetFirst347, first315: targetFirst315,
    twoSidedDifference32: (targetFirst347 + targetFirst315) / all
  },
  verdict: 'Verified numerical crosslink only: no author-specified key, inverse or plaintext'
}, null, 2));
