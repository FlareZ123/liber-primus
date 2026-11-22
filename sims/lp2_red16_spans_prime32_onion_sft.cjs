'use strict';

/**
 * Original red-ink, GP-prime-sum -> historical Tor-v2 base32 address hypothesis.
 * This is a falsifiable archival selector, not a verified solution.
 * Standard library only; no external host probing or password search.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const atlas = JSON.parse(fs.readFileSync(path.join(root, 'lp2-ink-annotations.json'), 'utf8'));
const alphabet = 'abcdefghijklmnopqrstuvwxyz234567';

/** @type {{page:number,offset:number,count:number,sum:number,residue:number,values:number[]}[]} */
const marks = [];
for (const page of atlas.pages) {
  for (const span of page.red_spans || []) {
    const source = corpus.pages[page.page].indices;
    const values = source.slice(span.start, span.start + span.length);
    assert.equal(values.length, span.length);
    const sum = values.reduce((acc, index) => acc + corpus.prime[index], 0);
    marks.push({
      page: page.page, offset: span.start, count: span.length,
      sum, residue: sum % 32, values
    });
  }
}
assert.equal(marks.length, 18);
const unknown = marks.filter(m => m.page < 56);
assert.equal(unknown.length, 16);
assert.equal(unknown.reduce((sum, m) => sum + m.count, 0), 213);
assert.deepEqual(unknown.map(m => m.sum),
  [662, 742, 137, 661, 766, 446, 638, 430, 786, 1109, 379, 295, 173, 435, 2262, 597]);
const hostname = unknown.map(m => alphabet[m.residue]).join('');
assert.equal(hostname, 'wgjv666osv3hntwv');

/** @param {number[]} a */
function longestEqualRun(a) {
  let n = 1; let best = 1;
  for (let i = 1; i < a.length; ++i) {
    n = a[i] === a[i - 1] ? n + 1 : 1;
    if (n > best) best = n;
  }
  return best;
}

let state = 0x9e3779b9;
/** @returns {number} Deterministic unsigned xorshift32 fraction in [0,1). */
function randomFraction() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return (state >>> 0) / 4294967296;
}

/** @template T @param {T[]} a */
function shuffleInPlace(a) {
  for (let i = a.length - 1; i > 0; --i) {
    const j = Math.floor(randomFraction() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
}

const digits = unknown.map(m => m.residue);
const allRedRunes = unknown.flatMap(m => m.values);
let orderedDigitHits = 0;
let redRuneShuffleHits = 0;
const repetitions = 100000;
for (let t = 0; t < repetitions; ++t) {
  // Conditional test of order, with the 16 observed residue values held fixed.
  const permutedDigits = [...digits];
  shuffleInPlace(permutedDigits);
  if (longestEqualRun(permutedDigits) >= 3) orderedDigitHits++;

  // Conditional test of red-symbol positions, with the full 213-rune
  // red inventory and all 16 original span lengths held fixed.
  const permutedRunes = [...allRedRunes];
  shuffleInPlace(permutedRunes);
  const permutedSums = [];
  let i = 0;
  for (const m of unknown) {
    let sum = 0;
    for (let k = 0; k < m.count; ++k) sum += corpus.prime[permutedRunes[i++]];
    permutedSums.push(sum % 32);
  }
  assert.equal(i, permutedRunes.length);
  if (longestEqualRun(permutedSums) >= 3) redRuneShuffleHits++;
}
assert.equal(longestEqualRun(digits), 3);
assert.equal(orderedDigitHits, 4888);
assert.equal(redRuneShuffleHits, 1044);

// A syntactically valid v2 hostname has no checksum that can certify origin.
// Two GP prime weights can encode *every* base32 symbol modulo 32.
const reachable = new Set();
for (const a of corpus.prime) {
  for (const b of corpus.prime) reachable.add((a + b) % 32);
}
assert.equal(reachable.size, 32);

console.log(JSON.stringify({
  hostname: hostname + '.onion',
  originalSpans: unknown.map(({page, offset, count, sum, residue}) =>
    ({page, offset, count, sum, residue})),
  nullModelSeed: 'xorshift32:0x9e3779b9',
  repetitions, observedLongestEqualRun: 3,
  fixedDigitOrderAtLeastThree: orderedDigitHits,
  redRuneShuffleAtLeastThree: redRuneShuffleHits,
  authentication: 'none; no known historical host or plaintext'
}, null, 2));
