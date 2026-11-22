"use strict";
/**
 * Literal physical word-navigation gate for the signature-valid 2016 wording.
 * Demonstrates why an unmodified modular word-prime-sum successor is not a
 * reversible permutation of the nine original LP2 visual chapters.
 *
 * Run: node sims/lp2_2016_physical_word_navigation_sft.cjs
 * Read-only CommonJS / Node 22 / standard library; actual ciphertext inputs.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const source = read("resources/liber-primus/lp2-transcription.txt");
const alphabet = new Map(corpus.runes.map((rune, index) => [rune, index]));
const sourcePages = source.split("%");
const unbroken = sourcePages.slice(0, 55).join("%");
const words = [];
let fragment = [];
let page = 0;
let startPage = -1;
let endPage = -1;
let originalRuneCount = 0;

/** Flush a real printed word. Page breaks never flush. */
function finish() {
  if (!fragment.length) return;
  words.push({indices: fragment, startPage, endPage, length: fragment.length});
  fragment = [];
}
for (const char of unbroken) {
  if (alphabet.has(char)) {
    if (!fragment.length) startPage = page;
    fragment.push(alphabet.get(char));
    endPage = page;
    originalRuneCount++;
  } else if (char === "%") {
    page++;
  } else if (char === "/" || /\s/u.test(char)) {
    // Printed line/page wrapping is not a word delimiter.
  } else {
    finish();
  }
}
finish();
assert.equal(originalRuneCount, 12956);
assert.equal(words.length, 2896);
assert.equal(words.filter(w => w.startPage !== w.endPage).length, 32);
const physical = page => page >= 50 ? page + 1 : page;
const chapterRanges = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const chapters = chapterRanges.map(([first, last]) =>
  words.filter(word => physical(word.startPage) >= first &&
    physical(word.startPage) <= last));
assert.deepEqual(chapters.map(c => c.length),
  [158, 255, 383, 437, 224, 326, 378, 669, 66]);
assert.deepEqual(chapters.map(c => c.reduce((n, w) => n + w.length, 0)),
  [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]);

const mod = (n, k) => (n % k + k) % k;
const wordPrimeSum = word => word.indices.reduce(
  (sum, rune) => sum + corpus.prime[rune], 0);

/**
 * @param {{indices:number[],length:number}[]} chapter
 * @param {-1|1} sign
 */
function evaluate(chapter, sign) {
  const n = chapter.length;
  const next = chapter.map((word, i) => mod(
    i + sign * wordPrimeSum(word), n));
  const distinctTargets = new Set(next).size;
  const indegree = Array(n).fill(0);
  for (const address of next) indegree[address]++;
  /** @param {number} origin */
  function walk(origin) {
    let at = origin;
    const encountered = new Set();
    let runeCount = 0;
    while (!encountered.has(at)) {
      encountered.add(at);
      runeCount += chapter[at].length;
      at = next[at];
    }
    return {nodes: encountered.size, runes: runeCount};
  }
  const first = walk(0);
  let maximum = {nodes: 0, runes: 0};
  for (let i = 0; i < n; i++) {
    const candidate = walk(i);
    if (candidate.runes > maximum.runes) maximum = candidate;
  }
  return {
    distinctTargets,
    collisions: n - distinctTargets,
    maxIndegree: Math.max(...indegree),
    first,
    maximum
  };
}
const outcome = chapters.map((chapter, i) => ({
  chapter: i + 1, words: chapter.length,
  minus: evaluate(chapter, -1),
  plus: evaluate(chapter, 1)
}));
assert.deepEqual(outcome.map(x => [x.minus.collisions, x.plus.collisions]), [
  [65,62],[98,84],[147,140],[158,159],[86,83],
  [122,117],[137,138],[245,237],[25,22]
]);
assert.deepEqual(
  [outcome[8].minus.maximum.runes, outcome[8].plus.maximum.runes],
  [85,132]);
assert.ok(outcome.every(x => x.minus.collisions && x.plus.collisions));
assert.ok(outcome[8].minus.maximum.runes < 150);
assert.ok(outcome[8].plus.maximum.runes < 150);

// A genuine source-print positive for the parsing and address convention:
// p57's intact 19-word PARABLE body, including actual GP prime sums.
const p57 = sourcePages[56];
let p57Current = [];
const solvedWords = [];
function finishSolved() {
  if (p57Current.length) solvedWords.push(p57Current);
  p57Current = [];
}
for (const char of p57) {
  if (alphabet.has(char)) p57Current.push(alphabet.get(char));
  else if (char !== "/" && !/\s/u.test(char)) finishSolved();
}
finishSolved();
assert.equal(solvedWords.length, 20);
assert.deepEqual(solvedWords.flat(), corpus.pages[57].indices);
assert.equal(solvedWords[0].map(i => corpus.translit[i]).join(""), "PARABLE");
const clearBody = solvedWords.slice(1).map(w => ({indices: w, length:w.length}));
assert.equal(clearBody.length, 19);
assert.deepEqual(clearBody.map(wordPrimeSum), [
  184, 72, 280, 339, 66, 72, 246, 86, 186, 232,
  21, 55, 451, 151, 72, 376, 115, 215, 300
]);
const clearPlus = evaluate(clearBody, +1);
const clearMinus = evaluate(clearBody, -1);
assert.equal(clearPlus.distinctTargets < 19, true);
assert.equal(clearMinus.distinctTargets < 19, true);

// Positive algorithmic control: a real cycle is reversible by construction.
const fixture = Array.from({length:66}, (_,i) => ({indices:[i%29],length:1}));
const bijective = Array.from({length:66}, (_,i) => (i+1)%66);
assert.equal(new Set(bijective).size, fixture.length);
let step = 0;
const visited = new Set();
while (!visited.has(step)) {
  visited.add(step);
  step = bijective[step];
}
assert.equal(visited.size, fixture.length);

process.stdout.write(JSON.stringify({
  source:"original LP2 GP29 printed words; physical chapter cuts",
  signedCue:"2016 words / meaning / numbers",
  hypothesis:"next word = (current word index +/- prime-sum) mod chapter word count",
  pageCarries:32,
  chapters:outcome,
  solvedPARABLE:{bodyWords:19,plus:clearPlus,minus:clearMinus},
  verdict:"No 9-chapter candidate is bijective; chapter 9 cannot emit 150 unique runes."
},null,2)+"\n");
