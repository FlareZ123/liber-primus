"use strict";

/**
 * LP2 original p48-52 sentence-pair additive-key cancellation gate.
 * SFT: node sims/lp2_p49_p51_138_170_sharedpad_original_sft.cjs
 *
 * Uses two complete original sentences on either side of the 32x8 numeric table.
 * Checks the only natural 138-rune alignments: first-to-first and last-to-last.
 * Shared position-wise GP29 key cancels exactly from ciphertext differences.
 * No secret key is enumerated. Separate positive plants use source word layouts.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} file */
function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const sections = read("resources/lp2-transcription.txt").split("%");
const runeId = new Map(gp.runes.map((r, i) => [r, i]));
assert.equal(sections.length, 57, "Source skips the runeless p50 physical page");

/** @param {string} source */
function parse(source) {
  const values = [], ends = [];
  let word = 0;
  for (const ch of source) {
    if (runeId.has(ch)) {
      values.push(runeId.get(ch));
      word++;
    } else if (ch !== "/" && !/\s/u.test(ch) && word) {
      ends.push(values.length);
      word = 0;
    }
  }
  if (word) ends.push(values.length);
  return {values, ends};
}
/** @param {number[]} ends @param {number} first @param {number} last */
function lengths(ends, first, last) {
  let previous = first;
  return ends.filter(end => end > first && end <= last).map(end => {
    const n = end - previous;
    previous = end;
    return n;
  });
}
/** @param {number[]} xs */
function sum(xs) { return xs.reduce((a, b) => a + b, 0); }
/** @param {number} x */
function mod(x) { return (x % 29 + 29) % 29; }

const before = parse(sections[48] + sections[49]);
const after = parse(sections[50] + sections[51]);
assert.deepEqual(before.values, gp.pages[48].indices.concat(gp.pages[49].indices));
assert.deepEqual(after.values, gp.pages[51].indices.concat(gp.pages[52].indices));
const cipherA = before.values.slice(199, 337);
const cipherB = after.values.slice(0, 170);
const lenA = lengths(before.ends, 199, 337);
const lenB = lengths(after.ends, 0, 170);
const lenBStart = lengths(after.ends, 0, 138);
const lenBEnd = lengths(after.ends, 32, 170);
assert.deepEqual([cipherA.length, cipherB.length, lenA.length, lenB.length],
  [138, 170, 33, 40]);
assert.deepEqual([sum(lenA), sum(lenB), sum(lenBStart), sum(lenBEnd)],
  [138, 170, 138, 138]);
assert.equal(sum(lenB.slice(0, 8)), 32);
assert.equal(cipherA.slice(72).length, 66);
assert.equal(cipherB.slice(0, 92).length, 92);

const sourceFiles = [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/english_wordfreq_textblob.txt"
];
const sources = sourceFiles.map(read);
const latinId = new Map(gp.translit.map((s, i) => [s, i]));
const tokens = gp.translit.slice().sort((a, b) => b.length - a.length);
/** @param {string} word @returns {number[] | null} */
function spell(word) {
  const normalized = word.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S").replace(/ING/g, "NG");
  const out = [];
  for (let i = 0; i < normalized.length;) {
    const token = tokens.find(t => normalized.startsWith(t, i));
    if (token === undefined) return null;
    out.push(latinId.get(token));
    i += token.length;
  }
  return out;
}

/** @type {Map<number, Map<string, number[]>>} */
const dictionary = new Map();
for (let sourceId = 0; sourceId < sources.length; sourceId++) {
  const words = sourceId === 3
    ? (sources[sourceId].match(/^[a-z]+\s+\d+$/gm) || []).map(line => line.split(/\s+/)[0])
    : (sources[sourceId].toUpperCase().match(/[A-Z]+/g) || []);
  for (const word of words) {
    const digits = spell(word);
    if (!digits || digits.length > 20) continue;
    if (!dictionary.has(digits.length)) dictionary.set(digits.length, new Map());
    dictionary.get(digits.length).set(digits.join(","), digits);
  }
}
const wordCount = [...dictionary.values()].reduce((n, entries) => n + entries.size, 0);
assert.equal(wordCount, 32081);

/** @type {Map<number, Array<{next:Int32Array, terminal:boolean}>>} */
const tries = new Map();
for (const [length, words] of dictionary) {
  const trie = [{next: new Int32Array(29).fill(-1), terminal: false}];
  for (const word of words.values()) {
    let node = 0;
    for (const digit of word) {
      let child = trie[node].next[digit];
      if (child < 0) {
        child = trie.length;
        trie[node].next[digit] = child;
        trie.push({next: new Int32Array(29).fill(-1), terminal: false});
      }
      node = child;
    }
    trie[node].terminal = true;
  }
  tries.set(length, trie);
}

/**
 * Exact all-secret-key product-trie feasibility test. A hypothetical key
 * K_i cancels because C1_i-C2_i=P1_i-P2_i mod29 at each aligned rune.
 * @param {number[]} first
 * @param {number[]} second
 * @param {number[]} firstLengths
 * @param {number[]} secondLengths
 */
function joint(first, second, firstLengths, secondLengths) {
  assert.equal(first.length, 138);
  assert.equal(second.length, 138);
  assert.equal(sum(firstLengths), 138);
  assert.equal(sum(secondLengths), 138);
  let n = 0;
  const aEnds = firstLengths.map(x => n += x);
  n = 0;
  const bEnds = secondLengths.map(x => n += x);
  let states = new Map([["0,0", [0, 0]]]);
  let maxStates = 1;
  for (let i = 0; i < 138; i++) {
    const aWord = aEnds.findIndex(end => end > i);
    const bWord = bEnds.findIndex(end => end > i);
    const trieA = tries.get(firstLengths[aWord]);
    const trieB = tries.get(secondLengths[bWord]);
    assert.ok(trieA && trieB);
    const endA = aEnds[aWord] === i + 1;
    const endB = bEnds[bWord] === i + 1;
    const delta = mod(first[i] - second[i]);
    const next = new Map();
    for (const [u, v] of states.values()) {
      for (let x = 0; x < 29; x++) {
        const y = mod(x - delta);
        const left = trieA[u].next[x];
        const right = trieB[v].next[y];
        if (left < 0 || right < 0) continue;
        if (endA && !trieA[left].terminal) continue;
        if (endB && !trieB[right].terminal) continue;
        const nextLeft = endA ? 0 : left;
        const nextRight = endB ? 0 : right;
        next.set(nextLeft + "," + nextRight, [nextLeft, nextRight]);
      }
    }
    maxStates = Math.max(maxStates, next.size);
    if (next.size === 0) {
      return {possible: false, firstImpossibleRune: i + 1,
        statesBefore: states.size, peakStates: maxStates};
    }
    states = next;
  }
  return {possible: true, finalStates: states.size, peakStates: maxStates};
}
const originalStart = joint(cipherA, cipherB.slice(0, 138), lenA, lenBStart);
const originalEnd = joint(cipherA, cipherB.slice(32), lenA, lenBEnd);
assert.deepEqual([originalStart.firstImpossibleRune, originalEnd.firstImpossibleRune],
  [14, 5]);

let seed = 0x330119;
/** @returns {number} */
function random() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 0x100000000;
}
/** @param {number[]} wordLengths */
function nativeWords(wordLengths) {
  return wordLengths.flatMap(length => {
    const options = [...dictionary.get(length).values()];
    return options[Math.floor(random() * options.length)];
  });
}
const plainA = nativeWords(lenA), plainB = nativeWords(lenB);
const key = Array.from({length: 138}, (_, i) => mod(i * 7 + 19));
const encA = plainA.map((v, i) => mod(v + key[i]));
const encBStart = plainB.map((v, i) => mod(v + key[i % 138]));
const encBEnd = plainB.map((v, i) => mod(v + key[(i + 106) % 138]));
const plantedStart = joint(encA, encBStart.slice(0, 138), lenA, lenBStart);
const plantedEnd = joint(encA, encBEnd.slice(32), lenA, lenBEnd);
assert.equal(plantedStart.possible, true);
assert.equal(plantedEnd.possible, true);
assert.deepEqual(encBStart.slice(138), plainB.slice(138)
  .map((v, i) => mod(v + key[i])));
assert.deepEqual(encBEnd.slice(32).map((v, i) => mod(v - key[i])),
  plainB.slice(32));

// A separate key-independent statistical diagnostic avoids the dictionary's
// assumption that all plaintext words belong to its finite word list.
const native = [];
for (const source of sources.slice(0, 3)) {
  for (const word of source.toUpperCase().match(/[A-Z]+/g) || []) {
    const digits = spell(word);
    if (digits) for (const digit of digits) native.push(digit);
  }
}
assert.equal(native.length, 603423);
const counts = new Float64Array(29);
for (const digit of native) counts[digit]++;
const freq = Array.from(counts, count => count / native.length);
const differenceProb = Array.from({length: 29},
  (_, d) => freq.reduce((s, p, i) => s + p * freq[mod(i - d)], 0));
const weights = differenceProb.map(p => Math.log(29 * p));
/** @param {number[]} a @param {number[]} b */
function logLR(a, b) {
  let value = 0;
  for (let i = 0; i < 138; i++) value += weights[mod(a[i] - b[i])];
  return value;
}
const scoreStart = logLR(cipherA, cipherB.slice(0, 138));
const scoreEnd = logLR(cipherA, cipherB.slice(32));
assert.ok(Math.abs(scoreStart + 3.70784) < 0.001);
assert.ok(Math.abs(scoreEnd + 5.72753) < 0.001);
seed = 0x330151;
const nTrials = 10000;
let positiveStartBelow = 0, positiveEndBelow = 0;
let independentStartBelow = 0, independentEndBelow = 0;
let positiveTotal = 0, independentTotal = 0;
for (let trial = 0; trial < nTrials; trial++) {
  const i = Math.floor(random() * (native.length - 138));
  const j = Math.floor(random() * (native.length - 138));
  const p = native.slice(i, i + 138);
  const q = native.slice(j, j + 138);
  const nativeScore = logLR(p, q);
  const randomized = q.map(x => mod(x + Math.floor(random() * 29)));
  const independentScore = logLR(p, randomized);
  positiveTotal += nativeScore;
  independentTotal += independentScore;
  if (nativeScore <= scoreStart) positiveStartBelow++;
  if (nativeScore <= scoreEnd) positiveEndBelow++;
  if (independentScore <= scoreStart) independentStartBelow++;
  if (independentScore <= scoreEnd) independentEndBelow++;
}
assert.ok(positiveStartBelow < 100);
assert.ok(positiveEndBelow < 100);
console.log(JSON.stringify({
  source: "LP2 p48 tail72 + p49 all66, and p51 all92 + p52 head78",
  dictionarySize: wordCount, originalSentenceRunes: [138, 170],
  originalPrintedWords: [lenA.length, lenB.length],
  originalBFirst32Words: 8, positiveControl: {start: plantedStart, end: plantedEnd},
  original: {start: originalStart, end: originalEnd},
  frequency: {trainingRunes: native.length, trials: nTrials, seed: "0x330151",
    originalLogLR: {start: scoreStart, end: scoreEnd},
    meanPlant: positiveTotal / nTrials, meanIndependent: independentTotal / nTrials,
    lowerTailNative: {start: positiveStartBelow / nTrials, end: positiveEndBelow / nTrials},
    lowerTailIndependent: {start: independentStartBelow / nTrials,
      end: independentEndBelow / nTrials}},
  recoveredUnknownPlaintext: false
}, null, 2));
