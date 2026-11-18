'use strict';

/**
 * Source-frozen p54-p55 prime_echo terminal-line handoff.
 * Read-only SFT. No language scoring and no repository writes.
 *
 * Run from repository root:
 *   node sims/lp2_primeecho_terminal_mapline_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const transcription = fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-ink-annotations.json'), 'utf8'));

/** @param {number} n @returns {boolean} */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) return false;
  }
  return true;
}

/** @returns {number[]} */
function historicalPrimeList() {
  const out = [];
  for (let n = 2; n <= 3301; n++) {
    if (isPrime(n)) out.push(n);
  }
  return out;
}

/**
 * @typedef {{start:number,j:number,skips:number[]}} State
 */

/**
 * Invert the authentic p56 sign+ law over a fixed ciphertext prefix while
 * refusing to invent any prime beyond the historical 2013 list.
 *
 * @param {number[]} cipher
 * @param {number[]} primes
 * @returns {State[]}
 */
function exactHistoricalPaths(cipher, primes) {
  /** @type {State[]} */
  let states = primes.map((unused, start) => ({ start, j: start, skips: [] }));

  for (let i = 0; i < cipher.length; i++) {
    const c = cipher[i];
    /** @type {State[]} */
    const next = [];

    for (const state of states) {
      // Authentic literal plaintext-F branch: C=F and key does not advance.
      if (c === 0) {
        next.push({
          start: state.start,
          j: state.j,
          skips: state.skips.concat(i)
        });
      }

      // Encrypted non-F branch. The finite historical list ends at 3301.
      if (state.j < primes.length) {
        const shift = (primes[state.j] - 1) % 29;
        const plain = (c - shift + 29) % 29;
        if (plain !== 0) {
          next.push({
            start: state.start,
            j: state.j + 1,
            skips: state.skips
          });
        }
      }
    }
    states = next;
  }

  return states.filter((state) => state.j === primes.length);
}

/**
 * @param {string} runes
 * @returns {number}
 */
function primeSum(runes) {
  return [...runes].reduce((sum, rune) => {
    const index = corpus.runes.indexOf(rune);
    assert(index >= 0, `Unknown GP rune ${rune}`);
    return sum + corpus.prime[index];
  }, 0);
}

const primes = historicalPrimeList();
assert.equal(primes.length, 464);
assert.equal(primes[173], 1033);
assert.equal(primes[463], 3301);

const p54 = corpus.pages.find((page) => page.page === 54);
const p55 = corpus.pages.find((page) => page.page === 55);
assert(p54 && p55);
assert.equal(p54.runic_count, 232);
assert.equal(p55.runic_count, 76);

const terminalChapter = p54.indices.concat(p55.indices);
assert.equal(terminalChapter.length, 308);

// The first 300 symbols end at p55 local67, the last rune of printed line 3.
const keyedPrefix = terminalChapter.slice(0, 300);
assert.notEqual(keyedPrefix[299], 0);
const paths = exactHistoricalPaths(keyedPrefix, primes)
  .map((state) => ({
    start: state.start,
    startPrime: primes[state.start],
    j: state.j,
    skips: state.skips
  }));
assert.deepEqual(paths, [
  { start: 167, startPrime: 997, j: 464, skips: [41, 195, 247] },
  { start: 167, startPrime: 997, j: 464, skips: [65, 195, 247] },
  { start: 168, startPrime: 1009, j: 464, skips: [41, 65, 195, 247] }
]);

// Reconstruct strict physical words and lines from the canonical transcription.
const parts = transcription.split(/^%$/m);
assert.equal(parts.length, 57);
const wordFreq = new Map();
const pages = [];

for (let page = 0; page <= 55; page++) {
  if (page === 50) continue;
  const body = parts[page < 50 ? page : page - 1];
  const words = [...body.matchAll(/[ᚠ-ᛡ]+/gu)].map((match) => match[0]);
  pages.push({ page, body, words });
  for (const word of words) {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  }
}

const targetWords = ['ᚳᛉ', 'ᛞᛄᚢ', 'ᛒᛖᛁ']; // CX / DJU / BEI
assert.deepEqual(targetWords.map((word) => wordFreq.get(word)), [2, 2, 2]);

/**
 * @param {number} pageNumber
 * @param {string} target
 * @returns {{page:number,wordIndex0:number,wordIndex1:number,localRune:number,line:number}[]}
 */
function occurrences(pageNumber, target) {
  const page = pages.find((item) => item.page === pageNumber);
  assert(page);
  const matches = [...page.body.matchAll(/[ᚠ-ᛡ]+/gu)];
  const out = [];
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    if (match[0] !== target) continue;
    const before = page.body.slice(0, match.index);
    const localRune = [...before].filter((rune) => corpus.runes.includes(rune)).length;
    const line = 1 + (before.match(/\//g) || []).length;
    out.push({
      page: pageNumber,
      wordIndex0: i,
      wordIndex1: i + 1,
      localRune,
      line
    });
  }
  return out;
}

assert.deepEqual(occurrences(34, targetWords[0]), [
  { page: 34, wordIndex0: 55, wordIndex1: 56, localRune: 200, line: 10 }
]);
assert.deepEqual(occurrences(55, targetWords[0]), [
  { page: 55, wordIndex0: 16, wordIndex1: 17, localRune: 68, line: 4 }
]);
assert.deepEqual(occurrences(27, targetWords[1]), [
  { page: 27, wordIndex0: 6, wordIndex1: 7, localRune: 28, line: 2 }
]);
assert.deepEqual(occurrences(27, targetWords[2]), [
  { page: 27, wordIndex0: 7, wordIndex1: 8, localRune: 31, line: 2 }
]);

const p55Body = pages.find((item) => item.page === 55).body;
const p55Lines = p55Body.split('/\n')
  .map((line) => [...line.matchAll(/[ᚠ-ᛡ]+/gu)].map((match) => match[0]))
  .filter((words) => words.length > 0);
assert.deepEqual(p55Lines.map((line) =>
  line.reduce((sum, word) => sum + [...word].length, 0)), [24, 22, 22, 8]);
assert.deepEqual(p55Lines[3], targetWords);
const p55Ink = ink.find((page) => page.page === 55);
assert(p55Ink);
assert.deepEqual(p55Ink.large_punctuation, [[76, 13, 'red']]);

// Manuscript-wide line inventory: p55 line4 is the only >=2-word physical line
// for which every constituent word type occurs exactly twice in p0-p55.
let physicalLines = 0;
const allTwiceLines = [];
for (const page of pages) {
  const lines = page.body.split('/\n');
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const words = [...lines[lineIndex].matchAll(/[ᚠ-ᛡ]+/gu)]
      .map((match) => match[0]);
    if (words.length === 0) continue;
    physicalLines++;
    if (words.length >= 2 && words.every((word) => wordFreq.get(word) === 2)) {
      allTwiceLines.push({
        page: page.page,
        line: lineIndex + 1,
        words
      });
    }
  }
}
assert.equal(physicalLines, 594);
assert.deepEqual(allTwiceLines, [
  { page: 55, line: 4, words: targetWords }
]);

assert.deepEqual(targetWords.map(primeSum), [60, 129, 159]);
assert.equal(targetWords.map(primeSum).reduce((a, b) => a + b, 0), 348);
assert.equal(348, 6 * 58);

// The untouched line is exactly the last eight original p55 runes.
const targetIndices = targetWords.join('').split('')
  .map((rune) => corpus.runes.indexOf(rune));
assert.deepEqual(p55.indices.slice(68), targetIndices);

console.log('PRIME_ECHO: 464 ordinary primes, p174=1033, p464=3301');
console.log('KEYED PREFIX: p54-p55 runes 0..299; 3 exact historical-list paths');
for (const state of paths) {
  console.log(`  start=${state.start} prime=${state.startPrime} skips=[${state.skips.join(',')}] -> pointer464`);
}
console.log('BOUNDARY: p55 local67 ends printed line3 exactly as prime3301 is consumed');
console.log('UNTOUCHED LINE4: CX / DJU / BEI (8 runes), then red 13-dot mark at offset76');
console.log('WORD COUNTS: CX=2, DJU=2, BEI=2 across p0-p55');
console.log('OTHER COPIES: CX=p34 word56 line10; DJU/BEI=p27 words7/8 line2');
console.log('LINE INVENTORY: 594 physical rune lines; p55 line4 is the sole >=2-word line whose every word occurs exactly twice');
console.log('GP PRIME SUMS: CX=60, DJU=129, BEI=159, total=348=6*58');
console.log('INTERPRETATION: finite navigation handoff candidate only; no plaintext/key claimed');
