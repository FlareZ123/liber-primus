'use strict';
/**
 * Original LP2 p0 red-title -> row27 -> phi(151) closed-loop candidate.
 * SFT: node sims/lp2_p0_red331_row27_totient_sft.cjs
 *
 * This is a source-linked hypothesis audit, not a decipherment.
 * Requires only canonical repository resources; no external packages.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const lp1 = read('resources/liber-primus/lp1-plaintext-reference.txt');
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const mod = (x, m) => ((x % m) + m) % m;

/** @param {number} n @returns {number} */
function totient(n) {
  let remaining = n;
  let result = n;
  for (let p = 2; p * p <= remaining; p++) {
    if (remaining % p === 0) {
      while (remaining % p === 0) remaining /= p;
      result = result / p * (p - 1);
    }
  }
  if (remaining > 1) result = result / remaining * (remaining - 1);
  return result;
}

/** @returns {{indices:number[],primeSum:number,start:number}[]} */
function parseWords() {
  // Exactly as the canonical word parser: '%' is a physical page
  // boundary, '/' is a line wrap. Both may occur inside a printed word.
  const text = transcript.split('%').slice(0, 55).join('%');
  /** @type {{indices:number[],primeSum:number,start:number}[]} */
  const words = [];
  /** @type {number[]} */
  let current = [];
  let global = 0;
  const flush = () => {
    if (current.length) {
      words.push({
        indices: current,
        primeSum: current.reduce((sum, i) => sum + corpus.prime[i], 0),
        start: global - current.length
      });
      current = [];
    }
  };
  for (const char of text) {
    const index = runeIndex.get(char);
    if (index !== undefined) {
      current.push(index);
      global++;
    } else if (char === '/' || char === '%' || /\s/u.test(char)) {
      // Visual wraps and page carries do not divide printed words.
    } else {
      flush();
    }
  }
  flush();
  assert.equal(global, 12956);
  assert.equal(words.length, 2896);
  assert.deepEqual(
    words.flatMap(w => w.indices),
    corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices)
  );
  return words;
}

/** @param {number[]} symbols @returns {number} */
function indexOfCoincidence(symbols) {
  const histogram = Array(29).fill(0);
  for (const symbol of symbols) histogram[symbol]++;
  return histogram.reduce((s, n) => s + n * (n - 1), 0) /
    (symbols.length * (symbols.length - 1));
}

const words = parseWords();
const page0 = corpus.pages.find(p => p.page === 0);
assert.equal(page0.indices.length, 262);
assert.deepEqual(words[0].indices, [15, 8, 18, 3, 6, 19, 27, 0]);
assert.deepEqual(words[1].indices, [15, 26, 18, 21, 5]);
assert.equal(words[0].start, 0);
assert.equal(words[1].start, 8);
assert.equal(ink.pages.find(p => p.page === 0).red_spans[0].length, 13);
assert.deepEqual(ink.pages.find(p => p.page === 0).large_punctuation[0],
  [13, 13, 'red']);
const a = words[0].primeSum;
const b = words[1].primeSum;
assert.deepEqual([a, b], [347, 315]);
assert.equal(a - b, 32);
assert.equal((a + b) / 2, 331);
assert.equal(grid.bytes.length, 256);
const row = a % 32;
assert.equal(row, b % 32);
assert.equal(row, 27);
const rowBytes = grid.bytes.slice(row * 8, row * 8 + 8);
assert.deepEqual(rowBytes, [142, 219, 148, 59, 58, 52, 51, 151]);
assert.equal(rowBytes[7], 151);
assert.equal(grid.bytes.filter(x => x === 151).length, 1);
assert.match(lp1, /151\s+131\s+341\s+138\s+272/u);
assert.equal(totient(rowBytes[7]), 150);
assert.equal(a + b, 2 * grid.bytes.length + totient(rowBytes[7]));

/** @typedef {{position:number,a:number,b:number,row:number,last:number,phi:number,lengths:number[]}} Match */
const matches = [];
let matchingLengths = 0;
for (let i = 0; i < words.length - 1; i++) {
  const left = words[i], right = words[i + 1];
  if (left.indices.length === 8 && right.indices.length === 5) matchingLengths++;
  const candidateRow = left.primeSum % 32;
  const last = grid.bytes[8 * candidateRow + 7];
  if (left.primeSum - right.primeSum === 32 &&
      left.primeSum + right.primeSum === 2 * grid.bytes.length + totient(last)) {
    matches.push({
      position: i,
      a: left.primeSum,
      b: right.primeSum,
      row: candidateRow,
      last,
      phi: totient(last),
      lengths: [left.indices.length, right.indices.length]
    });
  }
}
assert.equal(matchingLengths, 19);
assert.deepEqual(matches, [{
  position: 0, a: 347, b: 315, row: 27, last: 151,
  phi: 150, lengths: [8, 5]
}]);

// The minimal source-selected decoder is a direct repeating additive GP29
// key from the selected row, aligned after the 13 red heading runes.
// Both historical signs are checked. They fail a basic language screen.
const body = page0.indices.slice(13);
const reading = [];
for (const sign of [-1, 1]) {
  const decoded = body.map((c, i) => mod(c + sign * rowBytes[i % 8], 29));
  const encrypted = decoded.map((p, i) => mod(p - sign * rowBytes[i % 8], 29));
  assert.deepEqual(encrypted, body);
  reading.push({
    sign,
    ioc: indexOfCoincidence(decoded),
    head: decoded.slice(0, 70).map(i => corpus.translit[i]).join(' ')
  });
}
assert(Math.max(...reading.map(x => x.ioc)) < 0.04);
console.log(JSON.stringify({
  status: 'cross-artifact candidate; no recovered plaintext',
  redTitleWordPrimeSums: [a, b],
  signedDifference: a - b,
  sourceMean331: (a + b) / 2,
  sharedTableRow: row,
  selectedRowBytes: rowBytes,
  unique151Count: 1,
  terminalByteTotient: totient(rowBytes[7]),
  exactIdentity: '347+315=2*256+phi(151)=662',
  adjacentPairsTested: words.length - 1,
  length8Then5Pairs: matchingLengths,
  exactMatches: matches,
  blackBodyDirectDecoder: reading
}, null, 2));
