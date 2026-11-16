'use strict';

/**
 * Source-frozen LP2 p27 -> p55 terminal two-word echo.
 * Read-only CommonJS SFT for original manuscript words and a finite
 * fixed-multiset null. No ciphertext guesses, plaintext fitting or writes.
 * Run in the repository root with: node sims/lp2_p27_p55_terminal_echo_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const transcription = fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const parts = transcription.split(/^%$/m);
assert.equal(parts.length, 57, 'Expected 56 rune-page delimiters');

/** @param {number} n @param {number} k @returns {number} */
function falling(n, k) {
  let result = 1;
  for (let i = 0; i < k; i++) result *= n - i;
  return result;
}

/** @param {number} n @returns {number} */
function choose2(n) {
  return n * (n - 1) / 2;
}

const token3 = [];
const pair3Edges = [];
const printedPairs = new Map();
const runeWordTypes = new Map();
const gpPrimes = new Map(corpus.runes.map((rune, index) => [rune, corpus.prime[index]]));
const sum288Pairs = [];
let totalPrintedPairs = 0;

for (let page = 0; page <= 55; page++) {
  if (page === 50) continue; // numeric-only original image
  // The text transcription omits numeric-only p50, while JSON reserves it.
  const body = parts[page < 50 ? page : page - 1];
  const words = [...body.matchAll(/[ᚠ-ᛡ]+/gu)].map((match) => ({
    text: match[0], offset: match.index, slot3: -1
  }));

  for (const word of words) {
    const byLength = runeWordTypes.get(word.text.length) || new Map();
    byLength.set(word.text, (byLength.get(word.text) || 0) + 1);
    runeWordTypes.set(word.text.length, byLength);
    if (word.text.length === 3) {
      word.slot3 = token3.length;
      token3.push(word.text);
    }
  }

  for (let i = 0; i + 1 < words.length; i++) {
    const a = words[i];
    const b = words[i + 1];
    if (body.slice(a.offset + a.text.length, b.offset) !== '-') continue;
    const pair = a.text + '-' + b.text;
    const hits = printedPairs.get(pair) || [];
    hits.push({ page, byteOffsetInTranscription: a.offset, wordIndex: i });
    printedPairs.set(pair, hits);
    totalPrintedPairs++;
    const gematriaSum = [...a.text + b.text]
      .reduce((total, rune) => total + gpPrimes.get(rune), 0);
    if (gematriaSum === 288) {
      sum288Pairs.push({ page, pair, lengthA: a.text.length, lengthB: b.text.length });
    }
    if (a.slot3 >= 0 && b.slot3 >= 0) {
      pair3Edges.push([a.slot3, b.slot3]);
    }
  }
}

const repeated = [...printedPairs.entries()].filter(([, occurrences]) =>
  occurrences.length > 1);
const phrase = 'ᛞᛄᚢ-ᛒᛖᛁ';
assert.equal(totalPrintedPairs, 2584);
assert.equal(printedPairs.size, 2583);
assert.equal(repeated.length, 1);
assert.equal(repeated[0][0], phrase);
// The signed-2016 base58 map remains a hypothesis: this is an exact
// arithmetic connection to the already solved p56 word DEEP, not a key.
assert.equal([...phrase.replace('-', '')]
  .reduce((total, rune) => total + gpPrimes.get(rune), 0), 288);
assert.equal([...phrase.split('-')[0]]
  .reduce((total, rune) => total + gpPrimes.get(rune), 0), 129);
assert.equal([...phrase.split('-')[1]]
  .reduce((total, rune) => total + gpPrimes.get(rune), 0), 159);
assert.equal(sum288Pairs.length, 9);
assert.equal(sum288Pairs.filter((item) =>
  item.lengthA === 3 && item.lengthB === 3).length, 3);
assert.deepEqual(sum288Pairs.filter((item) => item.pair === phrase)
  .map((item) => item.page), [27, 55]);
assert.equal(288 % 58, 56);
assert.equal(Math.floor(288 / 58), 4);
// On the historically solved page the prime-totient stream has no F skips
// before the fourth word; check its DEEP plaintext from original cipher.
const deepStart = 12;
const deepPlain = corpus.pages[56].indices.slice(deepStart, deepStart + 4)
  .map((cipher, index) =>
    (cipher - (corpus.prime[deepStart + index] - 1) % 29 + 29) % 29);
assert.deepEqual(deepPlain, [23, 18, 18, 13]);
assert.deepEqual(repeated[0][1].map((p) => [p.page, p.wordIndex]),
  [[27, 6], [55, 17]]);

assert.equal(token3.length, 789);
assert.equal(new Set(token3).size, 773);
assert.equal(pair3Edges.length, 164);
const counts3 = [...runeWordTypes.get(3).values()].filter((v) => v > 1);
assert.deepEqual(counts3.slice().sort((a, b) => a - b),
  [...Array(14).fill(2), 3]);
// No printed word of >=4 runes repeats in this source transcription.
for (const [len, types] of runeWordTypes) {
  if (len >= 4) assert([...types.values()].every((n) => n === 1));
}

let sharedPairs = 0;
for (let i = 0; i < pair3Edges.length; i++) {
  for (let j = i + 1; j < pair3Edges.length; j++) {
    const a = pair3Edges[i];
    const b = pair3Edges[j];
    if (a[0] === b[0] || a[0] === b[1] ||
        a[1] === b[0] || a[1] === b[1]) sharedPairs++;
  }
}
assert.equal(sharedPairs, 26);
const n = token3.length;
const A = counts3.reduce((s, m) => s + m * (m - 1), 0);
const B = counts3.reduce((s, m) => s + (m * (m - 1)) ** 2, 0);
const C = counts3.reduce((s, m) => s + m * (m - 1) * (m - 2), 0);
const D = counts3.reduce((s, m) =>
  s + m * (m - 1) * (m - 2) * (m - 3), 0);
const disjointPairs = choose2(pair3Edges.length) - sharedPairs;
const expectedDuplicates = disjointPairs * (A * A - B + D) / falling(n, 4) +
  sharedPairs * C / falling(n, 3);
assert(Math.abs(expectedDuplicates - 3.7224819186949e-5) < 1e-12);

const glyphs = corpus.runes;
const expectedSix = phrase.replace('-', '');
const test = [[27, 28, 6555], [55, 70, 12950]];
for (const [page, offset, global] of test) {
  const source = corpus.pages[page].indices.slice(offset, offset + 6)
    .map((v) => glyphs[v]).join('');
  const before = corpus.pages.slice(0, page)
    .reduce((sum, item) => sum + item.indices.length, 0);
  assert.equal(source, expectedSix);
  assert.equal(before + offset, global);
}

console.log('SOURCE: ᛞᛄᚢ-ᛒᛖᛁ, p27 second line, p55 final two words');
console.log('CORPUS: 2584 literal-dash word pairs, 2583 types, 1 repeat');
console.log('MAP CANDIDATE: DJU(129)+BEI(159)=288 = 58*4+56, p56:w4 DEEP');
console.log('MAP CONTROLS: 9/2584 exact-sum pairs; 3/164 are 3+3 (two are DJU-BEI)');
console.log('GEOMETRY: 789 three-rune word slots; 164 adjacent 3+3 edges; 26 sharing edge pairs');
console.log('SOURCE CONTROLS: original p27 offsets 28..33 -> global 6555..6560');
console.log('SOURCE CONTROLS: original p55 offsets 70..75 -> global 12950..12955');
console.log('CONDITIONAL permutation null: E[duplicated 3+3 pairs] = ' +
  expectedDuplicates.toPrecision(12) +
  '; P(any duplicate) <= expectation (Markov bound)');
console.log('No plaintext, authentic key, or cipher mechanism recovered.');
