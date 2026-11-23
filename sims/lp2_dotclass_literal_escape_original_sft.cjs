"use strict";
/**
 * Issue #2366. One frozen, source-motivated GP29 rank-28 escape rule.
 *
 * The printed 10/13-dot mark sets the literal GP0 rune to be represented by
 * a repeated previous ciphertext rune. All other plaintext runes are encoded
 * by their ascending rank among the 28 non-repeating GP29 ciphertext choices.
 * The first ciphertext rune of each original physical page is copied.
 *
 * This intentionally tests only dot count as direct GP0 index. It does not
 * infer a creator key or claim to solve the original manuscript.
 *
 * Windows 11 / Node.js 22:
 *   node sims/lp2_dotclass_literal_escape_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
/** @param {string} name */
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const native = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
/** @param {string} word */
const indices = word => [...word].map(r => {
  const index = runeIndex.get(r);
  assert.notEqual(index, undefined);
  return index;
});

const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const cipher = pages.flatMap(p => p.indices);
const words = transcription.replace(/[\/\n\r%&$\s]/g, "")
  .split(/[-.]/).filter(w => /[\u16A0-\u16FF]/u.test(w))
  .slice(0, 2896).map(indices);
assert.equal(pages.length, 55);
assert.equal(cipher.length, 12956);
assert.equal(words.length, 2896);
assert.equal(words.reduce((sum, w) => sum + w.length, 0), cipher.length);

const pageStarts = new Set();
const marks = [];
let offset = 0;
for (const page of pages) {
  pageStarts.add(offset);
  const source = ink.pages.find(p => p.page === page.page);
  for (const [local, dots, color] of source.large_punctuation || []) {
    marks.push({offset: offset + local, dots, color, page: page.page});
  }
  offset += page.indices.length;
}
marks.sort((a, b) => a.offset - b.offset);
assert.equal(marks.length, 31);
assert.equal(marks.filter(m => m.dots === 10).length, 3);
assert.equal(marks.filter(m => m.dots === 13).length, 28);
assert.ok(marks.every(m => m.dots === 10 || m.dots === 13));
assert.equal(marks[marks.length - 1].offset, cipher.length);

/**
 * GP0 dot count, changed AFTER every printed large mark. Seed with the
 * first printed count (13) for p0's preceding red heading.
 * @returns {number[]}
 */
function dotStates() {
  const result = [];
  let mark = 0;
  let state = 13;
  for (let i = 0; i < cipher.length; i++) {
    while (mark < marks.length && marks[mark].offset <= i) {
      state = marks[mark].dots;
      mark++;
    }
    result.push(state);
  }
  return result;
}
const state = dotStates();

/** @param {number[]} sourceCipher */
function decode(sourceCipher) {
  const out = [];
  for (let i = 0; i < sourceCipher.length; i++) {
    const previous = pageStarts.has(i) ? null : sourceCipher[i - 1];
    const c = sourceCipher[i];
    if (previous === null) {
      out.push(c);
    } else if (c === previous) {
      out.push(state[i]);
    } else {
      const rank = c > previous ? c - 1 : c;
      out.push(rank >= state[i] ? rank + 1 : rank);
    }
  }
  return out;
}

/** @param {number[]} plaintext */
function encode(plaintext) {
  const out = [];
  for (let i = 0; i < plaintext.length; i++) {
    const previous = pageStarts.has(i) ? null : out[i - 1];
    const p = plaintext[i];
    if (previous === null) {
      out.push(p);
    } else if (p === state[i]) {
      out.push(previous);
    } else {
      const rank = p > state[i] ? p - 1 : p;
      out.push(rank >= previous ? rank + 1 : rank);
    }
  }
  return out;
}

/** @param {number[]} xs */
function coincidence(xs) {
  const hist = Array(29).fill(0);
  for (const x of xs) hist[x]++;
  return hist.reduce((sum, count) => sum + count * (count - 1), 0)
    / (xs.length * (xs.length - 1));
}

const repeat = cipher.map((c, i) => !pageStarts.has(i) && c === cipher[i - 1]);
assert.equal(repeat.filter(Boolean).length, 86);
const originalPlain = decode(cipher);
assert.deepEqual(encode(originalPlain), cipher);

const byClass = {};
for (const k of [10, 13]) {
  const sites = state.map((s, i) => s === k ? i : -1).filter(i => i >= 0);
  byClass[k] = {
    plaintextRune: corpus.translit[k],
    slots: sites.length,
    compulsoryOccurrences: sites.filter(i => repeat[i]).length,
  };
}
assert.deepEqual([byClass[10].slots, byClass[13].slots], [1248, 11708]);
assert.deepEqual([byClass[10].compulsoryOccurrences,
  byClass[13].compulsoryOccurrences], [3, 83]);

const firstRuneWordStarts = new Set();
let wordOffset = 0;
for (const word of words) {
  firstRuneWordStarts.add(wordOffset);
  wordOffset += word.length;
}
assert.equal([...firstRuneWordStarts].filter(i => repeat[i]).length, 23);
const solvedWords = native.sections.flatMap(section =>
  (section.source_text.match(/[\u16A0-\u16FF]+/gu) || []).map(indices));
assert.equal(solvedWords.length, 740);
const solvedTape = solvedWords.flat();
assert.equal(solvedTape.length, 2979);
const pool = new Map();
for (const word of solvedWords) {
  if (!pool.has(word.length)) pool.set(word.length, []);
  pool.get(word.length).push(word);
}
for (const word of words) assert.ok(pool.get(word.length)?.length);

/** Frozen xorshift32, deterministic native source-length-matched controls. */
let rngState = 0x3301a48f;
const random = () => {
  rngState ^= rngState << 13;
  rngState ^= rngState >>> 17;
  rngState ^= rngState << 5;
  return rngState >>> 0;
};

let mismatchMin = Infinity;
let mismatchMax = 0;
let mismatchSum = 0;
let tenImin = Infinity;
let tenImax = 0;
let tenNonrepeatImin = Infinity;
let thirteenWrongRepeatPmin = Infinity;
let firstNative = null;
for (let trial = 0; trial < 1000; trial++) {
  const sample = words.flatMap(word => {
    const choices = pool.get(word.length);
    return choices[random() % choices.length];
  });
  if (trial === 0) firstNative = sample;
  let mismatches = 0;
  let tens = 0;
  let nonrepeatTens = 0;
  let wrongThirteens = 0;
  for (let i = 0; i < sample.length; i++) {
    const isExpected = sample[i] === state[i];
    if (isExpected !== repeat[i]) mismatches++;
    if (state[i] === 10 && sample[i] === 10) {
      tens++;
      if (!repeat[i]) nonrepeatTens++;
    }
    if (state[i] === 13 && repeat[i] && sample[i] !== 13) wrongThirteens++;
  }
  mismatchMin = Math.min(mismatchMin, mismatches);
  mismatchMax = Math.max(mismatchMax, mismatches);
  mismatchSum += mismatches;
  tenImin = Math.min(tenImin, tens);
  tenImax = Math.max(tenImax, tens);
  tenNonrepeatImin = Math.min(tenNonrepeatImin, nonrepeatTens);
  thirteenWrongRepeatPmin = Math.min(thirteenWrongRepeatPmin,
    wrongThirteens);
}

const nativeCipher = encode(firstNative);
assert.deepEqual(decode(nativeCipher), firstNative);
const result = {
  hypothesis: "dot count 10/13 sets direct GP0 escape index",
  originalRunes: cipher.length,
  originalWords: words.length,
  originalPages: pages.length,
  originalMarks: marks.length,
  originalRepeatSites: repeat.filter(Boolean).length,
  originalRepeatAtWordStart: [...firstRuneWordStarts].filter(i => repeat[i]).length,
  sourceClass: byClass,
  originalExactReencryption: encode(originalPlain).length,
  originalIoC: coincidence(cipher),
  modelInverseIoC: coincidence(originalPlain),
  solvedNativeIoC: coincidence(solvedTape),
  solvedNativeI: solvedTape.filter(x => x === 10).length,
  solvedNativeP: solvedTape.filter(x => x === 13).length,
  nativeMatchedSamples: 1000,
  nativeMismatchMin: mismatchMin,
  nativeMismatchMean: mismatchSum / 1000,
  nativeMismatchMax: mismatchMax,
  nativeClass10ICountRange: [tenImin, tenImax],
  nativeClass10IAtForbiddenNonrepeatsMin: tenNonrepeatImin,
  nativeClass13WrongRepeatPMin: thirteenWrongRepeatPmin,
  plantedNativeForwardInverse: nativeCipher.length,
  preview: words.slice(0, 12).map((word, j) => {
    const start = words.slice(0, j).reduce((sum, w) => sum + w.length, 0);
    return originalPlain.slice(start, start + word.length)
      .map(r => corpus.translit[r]).join("");
  }).join(" "),
};
assert.equal(result.originalExactReencryption, 12956);
assert.equal(result.plantedNativeForwardInverse, 12956);
console.log(JSON.stringify(result, null, 2));
