'use strict';

/**
 * Source-frozen p54-p55 prime_echo line-boundary gate with canonical word correction.
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

// Reconstruct physical line-local rune fragments. A printed line wrap is
// source-visible but is not, by itself, a canonical word delimiter.
const parts = transcription.split(/^%$/m);
assert.equal(parts.length, 57);
const lineFragmentFreq = new Map();
const pages = [];

for (let page = 0; page <= 55; page++) {
  if (page === 50) continue;
  const body = parts[page < 50 ? page : page - 1];
  const fragments = [...body.matchAll(/[ᚠ-ᛡ]+/gu)].map((match) => match[0]);
  pages.push({ page, body, fragments });
  for (const fragment of fragments) {
    lineFragmentFreq.set(fragment, (lineFragmentFreq.get(fragment) || 0) + 1);
  }
}

const targetFragments = ['ᚳᛉ', 'ᛞᛄᚢ', 'ᛒᛖᛁ']; // CX / DJU / BEI
assert.deepEqual(targetFragments.map((fragment) => lineFragmentFreq.get(fragment)), [2, 2, 2]);

/**
 * @param {number} pageNumber
 * @param {string} target
 * @returns {{page:number,fragmentIndex0:number,fragmentIndex1:number,localRune:number,line:number}[]}
 */
function lineFragmentOccurrences(pageNumber, target) {
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
      fragmentIndex0: i,
      fragmentIndex1: i + 1,
      localRune,
      line
    });
  }
  return out;
}

assert.deepEqual(lineFragmentOccurrences(34, targetFragments[0]), [
  { page: 34, fragmentIndex0: 55, fragmentIndex1: 56, localRune: 200, line: 10 }
]);
assert.deepEqual(lineFragmentOccurrences(55, targetFragments[0]), [
  { page: 55, fragmentIndex0: 16, fragmentIndex1: 17, localRune: 68, line: 4 }
]);
assert.deepEqual(lineFragmentOccurrences(27, targetFragments[1]), [
  { page: 27, fragmentIndex0: 6, fragmentIndex1: 7, localRune: 28, line: 2 }
]);
assert.deepEqual(lineFragmentOccurrences(27, targetFragments[2]), [
  { page: 27, fragmentIndex0: 7, fragmentIndex1: 8, localRune: 31, line: 2 }
]);

const p55Body = pages.find((item) => item.page === 55).body;
const p55Lines = p55Body.split(/\/\r?\n/u)
  .map((line) => [...line.matchAll(/[ᚠ-ᛡ]+/gu)].map((match) => match[0]))
  .filter((fragments) => fragments.length > 0);
assert.deepEqual(p55Lines.map((line) =>
  line.reduce((sum, fragment) => sum + [...fragment].length, 0)), [24, 22, 22, 8]);
assert.deepEqual(p55Lines[3], targetFragments);
const p55Ink = ink.pages.find((page) => page.page === 55);
assert(p55Ink);
assert.deepEqual(p55Ink.large_punctuation, [[76, 13, 'red']]);

// The old line-local census remains true only for line fragments.
let physicalLines = 0;
const allTwiceFragmentLines = [];
for (const page of pages) {
  const lines = page.body.split(/\/\r?\n/u);
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const fragments = [...lines[lineIndex].matchAll(/[ᚠ-ᛡ]+/gu)]
      .map((match) => match[0]);
    if (fragments.length === 0) continue;
    physicalLines++;
    if (fragments.length >= 2 &&
        fragments.every((fragment) => lineFragmentFreq.get(fragment) === 2)) {
      allTwiceFragmentLines.push({
        page: page.page,
        line: lineIndex + 1,
        fragments
      });
    }
  }
}
assert.equal(physicalLines, 594);
assert.deepEqual(allTwiceFragmentLines, [
  { page: 55, line: 4, fragments: targetFragments }
]);

// Canonical printed words ignore physical line/page wrapping as a delimiter.
// This is the repository-wide 12,956-rune / 2,896-word convention.
const alphabet = new Map(corpus.runes.map((rune, index) => [rune, index]));
const unknownSource = transcription.split('%').slice(0, 55).join('%');
const canonicalWords = [];
let canonicalFragment = [];
let rawPage = 0;
let currentLine = 1;
let startRawPage = -1;
let endRawPage = -1;
let startLine = -1;
let endLine = -1;
let canonicalRuneCount = 0;
let wordStartRune = -1;
const physicalPage = (page) => page >= 50 ? page + 1 : page;

function finishCanonicalWord() {
  if (!canonicalFragment.length) return;
  canonicalWords.push({
    indices: canonicalFragment,
    runes: canonicalFragment.map((index) => corpus.runes[index]).join(''),
    translit: canonicalFragment.map((index) => corpus.translit[index]).join(''),
    startPage: physicalPage(startRawPage),
    endPage: physicalPage(endRawPage),
    startLine,
    endLine,
    startRune: wordStartRune,
    endRune: canonicalRuneCount
  });
  canonicalFragment = [];
}

for (const char of unknownSource) {
  if (alphabet.has(char)) {
    if (!canonicalFragment.length) {
      startRawPage = rawPage;
      startLine = currentLine;
      wordStartRune = canonicalRuneCount;
    }
    canonicalFragment.push(alphabet.get(char));
    endRawPage = rawPage;
    endLine = currentLine;
    canonicalRuneCount++;
  } else if (char === '%') {
    rawPage++;
    currentLine = 1;
  } else if (char === '/') {
    currentLine++;
  } else if (/\s/u.test(char)) {
    // Printed wrapping/whitespace does not terminate a word.
  } else {
    finishCanonicalWord();
  }
}
finishCanonicalWord();

assert.equal(canonicalRuneCount, 12956);
assert.equal(canonicalWords.length, 2896);
assert.equal(canonicalWords.filter((word) => word.startPage !== word.endPage).length, 32);

const canonicalFreq = new Map();
const canonicalOccurrences = new Map();
for (let i = 0; i < canonicalWords.length; i++) {
  const word = canonicalWords[i];
  canonicalFreq.set(word.runes, (canonicalFreq.get(word.runes) || 0) + 1);
  if (!canonicalOccurrences.has(word.runes)) canonicalOccurrences.set(word.runes, []);
  canonicalOccurrences.get(word.runes).push(i);
}
assert.equal([...canonicalFreq.values()].filter((count) => count === 2).length, 90);

// Critical #1511 correction: CX is a line-start continuation fragment, not a
// complete printed word at either p55 or p34.
assert.equal(canonicalFreq.get(targetFragments[0]) || 0, 0);
const terminalWords = canonicalWords.slice(-3);
assert.deepEqual(terminalWords.map((word) => word.translit), ['CEAIMCX', 'DJU', 'BEI']);
assert.deepEqual(terminalWords.map((word) => canonicalFreq.get(word.runes)), [1, 2, 2]);
assert.deepEqual(
  terminalWords.map((word) => [word.startPage, word.startLine, word.endLine]),
  [[55, 3, 4], [55, 4, 4], [55, 4, 4]]
);

const terminalSpanningWord = terminalWords[0];
assert.equal(terminalSpanningWord.runes, 'ᚳᛠᛁᛗᚳᛉ');
assert.equal(terminalSpanningWord.startRune, 12944);
assert.equal(terminalSpanningWord.endRune, 12950);
const boundaryGlobalRune = canonicalRuneCount - terminalChapter.length + 300;
assert.equal(boundaryGlobalRune, 12948);
assert.equal(boundaryGlobalRune - terminalSpanningWord.startRune, 4);
assert.equal(terminalSpanningWord.endRune - boundaryGlobalRune, 2);

const p34SpanningWord = canonicalWords.find((word) =>
  word.startPage === 34 && word.startLine === 9 && word.endLine === 10 &&
  word.runes.endsWith(targetFragments[0]));
assert(p34SpanningWord);
assert.equal(p34SpanningWord.translit, 'BGCX');

// DJU / BEI remain genuine complete words and form the repeated adjacent pair.
assert.deepEqual(
  canonicalOccurrences.get(targetFragments[1]).map((index) => [
    canonicalWords[index].startPage, canonicalWords[index].startLine
  ]),
  [[27, 2], [55, 4]]
);
assert.deepEqual(
  canonicalOccurrences.get(targetFragments[2]).map((index) => [
    canonicalWords[index].startPage, canonicalWords[index].startLine
  ]),
  [[27, 2], [55, 4]]
);

// Across all complete three-word windows, the only all-frequency-2 window is
// BF / DJU / BEI at p27. The p55 terminal material is not such a window.
const allFreq2Windows = [];
for (let i = 0; i + 2 < canonicalWords.length; i++) {
  const window = canonicalWords.slice(i, i + 3);
  if (window.every((word) => canonicalFreq.get(word.runes) === 2)) {
    allFreq2Windows.push({ index: i, translit: window.map((word) => word.translit) });
  }
}
assert.deepEqual(allFreq2Windows, [
  { index: 1461, translit: ['BF', 'DJU', 'BEI'] }
]);

assert.deepEqual(targetFragments.map(primeSum), [60, 129, 159]);

/**
 * Enumerate the first point at which the finite historical prime list is
 * exhausted. Branches stop at exhaustion so later literal-F ciphertext
 * cannot make an earlier exhaustion look like a later boundary.
 *
 * @param {number[]} cipher
 * @param {number[]} primeList
 * @returns {{start:number,j:number,skips:number[],at1033:number|null,at3301:number|null,boundary:number}[]}
 */
function firstExhaustions(cipher, primeList) {
  let states = primeList.map((unused, start) => ({
    start,
    j: start,
    skips: [],
    at1033: null,
    at3301: null
  }));
  const exhausted = [];

  for (let i = 0; i < cipher.length; i++) {
    const c = cipher[i];
    const next = [];

    for (const state of states) {
      if (c === 0) {
        next.push({
          start: state.start,
          j: state.j,
          skips: state.skips.concat(i),
          at1033: state.at1033,
          at3301: state.at3301
        });
      }

      if (state.j < primeList.length) {
        const shift = (primeList[state.j] - 1) % 29;
        const plain = (c - shift + 29) % 29;
        if (plain !== 0) {
          const advanced = {
            start: state.start,
            j: state.j + 1,
            skips: state.skips,
            at1033: state.j === 173 ? i : state.at1033,
            at3301: state.j === primeList.length - 1 ? i : state.at3301
          };
          if (advanced.j === primeList.length) {
            exhausted.push({ ...advanced, boundary: i + 1 });
          } else {
            next.push(advanced);
          }
        }
      }
    }

    states = next;
  }

  return exhausted;
}

// #1506 source-selectivity gate: enumerate every finite-list exhaustion in
// the complete p54-p55 chapter instead of selecting the p55 line-3 boundary.
const allExhaustions = firstExhaustions(terminalChapter, primes);
assert.equal(allExhaustions.length, 41);
assert.equal(new Set(allExhaustions.map((state) => state.boundary)).size, 36);
assert(allExhaustions.every((state) =>
  state.at3301 === state.boundary - 1
), 'every finite-list exhaustion must consume terminal prime3301 on its final keyed rune');

let terminalOffset = 0;
const terminalLineEnds = [];
for (const pageNumber of [54, 55]) {
  const page = pages.find((item) => item.page === pageNumber);
  assert(page);
  for (const line of page.body.split(/\/\r?\n/u)) {
    const count = [...line].filter((rune) => corpus.runes.includes(rune)).length;
    if (count === 0) continue;
    terminalOffset += count;
    terminalLineEnds.push(terminalOffset);
  }
}
assert.deepEqual(terminalLineEnds, [
  19, 40, 57, 80, 102, 124, 145, 168, 189, 211, 232, 256, 278, 300, 308
]);

const terminalLineEndSet = new Set(terminalLineEnds);
const lineEndExhaustions = allExhaustions
  .filter((state) => terminalLineEndSet.has(state.boundary));
assert.equal(lineEndExhaustions.length, 8);
assert.deepEqual(
  [...new Set(lineEndExhaustions.map((state) => state.boundary))],
  [19, 40, 57, 80, 300]
);
assert.deepEqual(
  lineEndExhaustions.map((state) => ({
    start: state.start,
    startPrime: primes[state.start],
    at3301: state.at3301,
    boundary: state.boundary
  })),
  [
    { start: 445, startPrime: 3137, at3301: 18, boundary: 19 },
    { start: 424, startPrime: 2953, at3301: 39, boundary: 40 },
    { start: 407, startPrime: 2801, at3301: 56, boundary: 57 },
    { start: 385, startPrime: 2663, at3301: 79, boundary: 80 },
    { start: 386, startPrime: 2671, at3301: 79, boundary: 80 },
    { start: 167, startPrime: 997, at3301: 299, boundary: 300 },
    { start: 167, startPrime: 997, at3301: 299, boundary: 300 },
    { start: 168, startPrime: 1009, at3301: 299, boundary: 300 }
  ]
);

const bothPauseExhaustions = allExhaustions.filter((state) => state.at1033 !== null);
assert.deepEqual(
  bothPauseExhaustions.map((state) => ({
    start: state.start,
    boundary: state.boundary,
    at1033: state.at1033,
    at3301: state.at3301
  })),
  [
    { start: 167, boundary: 300, at1033: 6, at3301: 299 },
    { start: 167, boundary: 300, at1033: 6, at3301: 299 },
    { start: 168, boundary: 300, at1033: 5, at3301: 299 }
  ]
);

const p54Ink = ink.pages.find((page) => page.page === 54);
assert(p54Ink);
assert.deepEqual(p54Ink.red_spans.map((span) => [span.start, span.length]), [[0, 9]]);
assert.deepEqual(p54Ink.large_punctuation, [[9, 13, 'red']]);
for (const state of bothPauseExhaustions) {
  assert(state.at1033 !== null);
  assert(state.at1033 >= 0 && state.at1033 < 9);
}

const visualChapters = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];

function finalRuneLineLength(pageNumber) {
  const page = pages.find((item) => item.page === pageNumber);
  assert(page);
  const counts = page.body.split(/\/\r?\n/u)
    .map((line) => [...line].filter((rune) => corpus.runes.includes(rune)).length)
    .filter((count) => count > 0);
  return counts[counts.length - 1];
}

const matchedTerminalPathCounts = [];
for (const [firstPage, lastPage] of visualChapters) {
  let chapter = [];
  for (let pageNumber = firstPage; pageNumber <= lastPage; pageNumber++) {
    const sourcePage = corpus.pages.find((page) => page.page === pageNumber);
    if (sourcePage) chapter = chapter.concat(sourcePage.indices);
  }
  const window = chapter.slice(Math.max(0, chapter.length - 308));
  const finalLineLength = finalRuneLineLength(lastPage);
  const boundary = window.length - finalLineLength;
  const events = firstExhaustions(window.slice(0, boundary), primes)
    .filter((state) => state.boundary === boundary);
  matchedTerminalPathCounts.push(events.length);
}
assert.deepEqual(matchedTerminalPathCounts, [0, 0, 0, 0, 0, 0, 0, 0, 3]);

// The untouched line is exactly the last eight original p55 runes.
const targetIndices = targetFragments.join('').split('')
  .map((rune) => corpus.runes.indexOf(rune));
assert.deepEqual(p55.indices.slice(68), targetIndices);

console.log('PRIME_ECHO: 464 ordinary primes, p174=1033, p464=3301');
console.log('KEYED PREFIX: p54-p55 runes 0..299; 3 exact historical-list paths');
for (const state of paths) {
  console.log(`  start=${state.start} prime=${state.startPrime} skips=[${state.skips.join(',')}] -> pointer464`);
}
console.log('3301 LINE-END CENSUS: 8/41 histories, boundaries 19/40/57/80/300; terminal3301 alone does not select300');
console.log('BOTH PAUSES: only starts167/167/168 consume1033 and3301; all three exhaust at boundary300');
console.log('BOUNDARY: p55 local67 ends printed line3 exactly as prime3301 is consumed');
console.log('UNTOUCHED LINE4 FRAGMENTS: CX / DJU / BEI (8 runes), then red 13-dot mark at offset76');
console.log('CANONICAL WORD BOUNDARY: CX is the final 2 runes of CEAIMCX, spanning p55 lines3-4');
console.log('BOUNDARY300 CUT: after 4/6 runes of CEAIMCX; the untouched suffix does NOT begin at a complete-word boundary');
console.log('P34 MATCH: its line10 CX is likewise the suffix of spanning canonical word BGCX');
console.log('COMPLETE WORDS: CX count=0; DJU/BEI each count=2 and repeat adjacently at p27 line2');
console.log('GRAPH CHECK: only complete all-frequency-2 triple is BF / DJU / BEI at p27');
console.log('VERDICT: finite prime_echo selects a physical line break, but the three-word map interpretation is rejected');
