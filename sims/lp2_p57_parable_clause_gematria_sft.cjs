#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'
));
const transcription = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8'
);

const blocks = transcription.split('%');
// The rune-free physical p50 table is omitted from this transcription, so
// physical p57 is text block 56 (zero-based).
if (blocks.length < 57) throw new Error(`Expected >=57 transcription blocks; got ${blocks.length}`);
const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
const page57 = blocks[56];
const words = [];
let current = [];

for (const ch of page57) {
  if (runeIndex.has(ch)) {
    current.push(runeIndex.get(ch));
  } else if (ch === '/' || /\s/u.test(ch)) {
    // Line slashes and whitespace are layout, not word boundaries.
  } else if (current.length) {
    words.push(current);
    current = [];
  }
}
if (current.length) words.push(current);

const runeCount = words.reduce((n, word) => n + word.length, 0);
if (words.length !== 20 || runeCount !== 95 || words[0].map(i => corpus.translit[i]).join('') !== 'PARABLE') {
  throw new Error(`Unexpected p57 transcription shape: ${words.length} words / ${runeCount} runes`);
}
if (!Array.isArray(corpus.prime) || corpus.prime.length !== 29) {
  throw new Error('Expected the 29-entry GP prime-value array in lp2-corpus.json');
}

const groups = [
  { clause: 1, words: words.slice(1, 8) },
  { clause: 2, words: words.slice(8, 14) },
  { clause: 3, words: words.slice(14, 20) },
];
const isPrime = n => {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
};
const results = groups.map(group => {
  const indices = group.words.flat();
  const sum = indices.reduce((total, index) => total + corpus.prime[index], 0);
  return {
    clause: group.clause,
    words: group.words.map(word => word.map(i => corpus.translit[i]).join('')),
    runeCount: indices.length,
    primeValueSum: sum,
    isPrime: isPrime(sum),
  };
});
const sums = results.map(result => result.primeValueSum);
const product = sums.reduce((a, b) => a * BigInt(b), 1n);
const expectedSums = [1259, 1031, 1229];
const expectedProduct = 1595277641n;

// Negative control: splitting the final NG rune in TUNNELNG into I + NG
// adds the GP prime value of I (31) to clause 1 and breaks the checksum.
const iIndex = corpus.translit.indexOf('I');
if (iIndex < 0 || corpus.prime[iIndex] !== 31) throw new Error('Unexpected GP value for I');
const naiveFirstSum = sums[0] + corpus.prime[iIndex];
const naiveProduct = BigInt(naiveFirstSum) * BigInt(sums[1]) * BigInt(sums[2]);

if (JSON.stringify(sums) !== JSON.stringify(expectedSums) ||
    product !== expectedProduct ||
    !results.every(result => result.isPrime) ||
    naiveFirstSum !== 1290 ||
    naiveProduct === expectedProduct) {
  throw new Error('p57 Parable clause-sum checksum did not reproduce');
}

console.log(JSON.stringify({
  source: 'lp2-transcription.txt block 56 = physical p57; p50 is omitted because it is rune-free',
  title: 'PARABLE (excluded from clause sums)',
  runeCount: runeCount,
  clauses: results,
  product: String(product),
  naiveSplitINGControl: {
    firstClauseSum: naiveFirstSum,
    product: String(naiveProduct),
    matches: naiveProduct === expectedProduct,
  },
  verified: true,
}, null, 2));
