"use strict";

/**
 * All-offset original p32/p55 shared-tree additive-pad obstruction.
 * Run from the repository root with Node.js 22:
 * node sims/lp2_p32_p55_shared_tree_pad_lexicon_sft.cjs
 *
 * Uses exact original LP2 ciphertext and a pinned 29,154-entry native-GP
 * English lexicon; writes no files and requires no third-party packages.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcript = read("resources/liber-primus/lp2-transcription.txt");
const lexicon = read("resources/control/english_wordfreq_textblob.txt");
const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
const gpTokens = corpus.translit.map((token, i) => ({token, i}))
  .sort((a, b) => b.token.length - a.token.length);
/** @param {number} n @returns {number} */
const mod = n => ((n % 29) + 29) % 29;

/** Source-native English-to-GP29, including historical ING and IO spellings.
 * @param {string} input @returns {number[] | null}
 */
function encode(input) {
  const text = input.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S")
    .replace(/ING/g, "NG").replace(/IO/g, "IA");
  const output = [];
  for (let i = 0; i < text.length;) {
    const token = gpTokens.find(entry => text.startsWith(entry.token, i));
    if (!token) return null;
    output.push(token.i);
    i += token.token.length;
  }
  return output;
}

const wordsByLength = new Map();
for (const line of lexicon.match(/^[a-z]+\s+\d+$/gm) || []) {
  const word = encode(line.split(/\s+/u)[0]);
  if (!word) continue;
  if (!wordsByLength.has(word.length)) wordsByLength.set(word.length, []);
  wordsByLength.get(word.length).push(word);
}

/** LP2 p55 is transcript section54 because runeless physical p50 is omitted.
 * The slash marks a printed line wrap and does not split words.
 * @param {number} section @returns {number[][]}
 */
function readWords(section) {
  const text = transcript.split("%")[section].replace(/\/\s*/gu, "");
  return (text.match(/[\u16A0-\u16FF]+/gu) || [])
    .map(word => [...word].map(rune => runeIndex.get(rune)));
}

const wordsA = readWords(32);
const wordsB = readWords(54);
const cipherA = wordsA.flat();
const cipherB = wordsB.flat();
assert.deepEqual(cipherA, corpus.pages[32].indices);
assert.deepEqual(cipherB, corpus.pages[55].indices);
assert.equal(cipherA.length, 121);
assert.equal(cipherB.length, 76);
assert.equal(wordsA.length, 22);
assert.equal(wordsB.length, 17);
assert.equal([...wordsByLength.values()].reduce((n, a) => n + a.length, 0), 29154);

/** @param {number[][]} words @returns {{i:number,start:number,end:number,length:number}[]} */
function spans(words) {
  let start = 0;
  return words.map((word, i) => {
    const span = {i, start, end: start + word.length, length: word.length};
    start += word.length;
    return span;
  });
}
const spansA = spans(wordsA);
const spansB = spans(wordsB);
const rightCache = new Map();

/** @param {number} length @param {number} offset @param {number} count
 * @returns {Set<string>}
 */
function rightSubstrings(length, offset, count) {
  const key = [length, offset, count].join(":");
  if (!rightCache.has(key)) {
    rightCache.set(key, new Set((wordsByLength.get(length) || [])
      .map(word => word.slice(offset, offset + count).join(","))));
  }
  return rightCache.get(key);
}

/**
 * A[offset + i - skip] and B[i] share a pad. B's first rune can be
 * treated either as a carried p54 fragment (skip=1) or included (skip=0).
 * Model: C_A=P_A+K+s_A and C_B=P_B+K+s_B mod29, with arbitrary K[i].
 * The same unknown relative page shift must fit all word overlaps.
 * @param {number[]} a
 * @param {number[]} b
 * @param {number} offset
 * @param {0 | 1} skip
 * @returns {{offset:number,skip:number,overlaps:number,checked:number,survivors:number[],contradiction:object|null}}
 */
function evaluate(a, b, offset, skip) {
  const pairs = [];
  for (const x of spansA) {
    for (const y of spansB) {
      const lo = Math.max(x.start, offset + y.start - skip, 0);
      const hi = Math.min(x.end, offset + y.end - skip, offset + b.length - skip);
      const n = hi - lo;
      if (n < 3) continue;
      const difference = Array.from({length: n}, (_, j) =>
        mod(a[lo + j] - b[lo + j - offset + skip]));
      pairs.push({x, y, lo, n, difference});
    }
  }
  pairs.sort((x, y) => y.n - x.n);
  let shifts = Array.from({length: 29}, (_, i) => i);
  let contradiction = null;
  let checked = 0;
  for (const pair of pairs) {
    const {x, y, lo, n, difference} = pair;
    const rights = rightSubstrings(y.length, lo - offset + skip - y.start, n);
    const leftWords = wordsByLength.get(x.length) || [];
    const allowed = [];
    for (const shift of shifts) {
      const hasPair = leftWords.some(word => {
        const needed = Array.from({length: n}, (_, j) =>
          mod(word[lo - x.start + j] - difference[j] + shift));
        return rights.has(needed.join(","));
      });
      if (hasPair) allowed.push(shift);
    }
    checked++;
    if (allowed.length === 0) {
      contradiction = {wordA: x.i, wordB: y.i, atA: lo,
        overlapRunes: n, shiftsBefore: shifts};
      shifts = [];
      break;
    }
    shifts = allowed;
  }
  return {offset, skip, overlaps: pairs.length, checked,
    survivors: shifts, contradiction};
}

const alignments = [];
for (const skip of [0, 1]) {
  for (let offset = 0; offset <= cipherA.length - (cipherB.length - skip); offset++) {
    alignments.push({offset, skip});
  }
}
assert.equal(alignments.length, 93);
const original = alignments.map(({offset, skip}) => evaluate(cipherA, cipherB, offset, skip));
assert.ok(original.every(entry => entry.survivors.length === 0));
assert.deepEqual(original.filter(item => item.offset === 19).map(item =>
  [item.skip, item.contradiction.atA, item.contradiction.overlapRunes]),
  [[0, 34, 6], [1, 44, 6]]);

/** @param {number[][]} words @returns {number[]} */
function plantWords(words) {
  return words.flatMap(word => {
    const candidates = wordsByLength.get(word.length) || [];
    assert.ok(candidates.length > 0);
    return candidates[0];
  });
}
const plainA = plantWords(wordsA);
const plainB = plantWords(wordsB);
const trueShift = mod(13 - 21);
let passedPlants = 0;
for (const {offset, skip} of alignments) {
  const a = plainA.slice();
  const b = plainB.slice();
  for (let j = skip; j < b.length; j++) {
    const i = offset + j - skip;
    const pad = mod(7 * i * i + 11 * i + 3);
    a[i] = mod(plainA[i] + pad + 13);
    b[j] = mod(plainB[j] + pad + 21);
  }
  const candidate = evaluate(a, b, offset, skip);
  assert.ok(candidate.survivors.includes(trueShift));
  for (let j = skip; j < b.length; j++) {
    const i = offset + j - skip;
    const pad = mod(7 * i * i + 11 * i + 3);
    assert.equal(mod(a[i] - pad - 13), plainA[i]);
    assert.equal(mod(b[j] - pad - 21), plainB[j]);
  }
  passedPlants++;
}
assert.equal(passedPlants, 93);
const failureLengths = {};
for (const result of original) {
  const length = String(result.contradiction.overlapRunes);
  failureLengths[length] = (failureLengths[length] || 0) + 1;
}
assert.deepEqual(failureLengths, {
  4: 2, 5: 6, 6: 17, 7: 24, 8: 20, 9: 14, 10: 4, 11: 6
});
console.log(JSON.stringify({
  source: {page32Runes: cipherA.length, page55Runes: cipherB.length,
    sourceWords: [wordsA.length, wordsB.length], dictionarySize: 29154},
  original: {alignments: original.length, sourceStart: original.filter(x => x.offset === 0),
    artLinkedOffset19: original.filter(x => x.offset === 19),
    survivingAlignments: original.filter(x => x.survivors.length > 0),
    earliestContradictionOverlapLengths: failureLengths},
  positives: {plantedAlignments: passedPlants, shift: trueShift,
    allRecoveredExactly: true},
  interpretation: "All 93 original contiguous same-pad placements fail source-native complete-word consistency; no unknown plaintext or key is recovered."
}, null, 2));
