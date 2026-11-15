"use strict";

/**
 * Original p32/p55 shared-tree, reused GP29 pad word-overlap obstruction.
 * Execute from the repository root: node sims/lp2_p32_p55_shared_tree_pad_lexicon_sft.cjs
 * Requires Node.js 22 and only checked-in project resources.
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
const runeNumber = new Map(corpus.runes.map((rune, i) => [rune, i]));
const gpTokens = corpus.translit.map((token, i) => ({token, i}))
  .sort((a, b) => b.token.length - a.token.length);
const mod = value => ((value % 29) + 29) % 29;

/**
 * Source-native GP spelling, including attested ING and IO contractions.
 * @param {string} input
 * @returns {number[] | null}
 */
function encode(input) {
  const normalized = input.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S")
    .replace(/ING/g, "NG").replace(/IO/g, "IA");
  const result = [];
  for (let i = 0; i < normalized.length;) {
    const token = gpTokens.find(entry => normalized.startsWith(entry.token, i));
    if (!token) return null;
    result.push(token.i);
    i += token.token.length;
  }
  return result;
}

const wordsByLength = new Map();
for (const line of lexicon.match(/^[a-z]+\s+\d+$/gm) || []) {
  const [word] = line.split(/\s+/u);
  const runes = encode(word);
  if (!runes) continue;
  if (!wordsByLength.has(runes.length)) wordsByLength.set(runes.length, []);
  wordsByLength.get(runes.length).push(runes);
}

/**
 * The transcription uses '%' delimiters, with runeless p50 omitted.
 * Thus physical p32 is section32, and physical p55 is section54.
 * Line-break '/' continues the same printed word.
 * @param {number} section
 * @returns {number[][]}
 */
function readWords(section) {
  const text = transcript.split("%")[section].replace(/\/\s*/gu, "");
  return (text.match(/[\u16A0-\u16FF]+/gu) || [])
    .map(word => [...word].map(rune => runeNumber.get(rune)));
}

const wordsA = readWords(32);
const wordsB = readWords(54);
const sourceA = wordsA.flat();
const sourceB = wordsB.flat();
assert.deepEqual(sourceA, corpus.pages[32].indices);
assert.deepEqual(sourceB, corpus.pages[55].indices);
assert.equal(sourceA.length, 121);
assert.equal(sourceB.length, 76);
assert.equal(wordsA.length, 22);
assert.equal(wordsB.length, 17);
assert.equal([...wordsByLength.values()].reduce((sum, words) => sum + words.length, 0), 29154);

/**
 * @param {number[][]} words
 * @param {number} skip
 * @returns {{start:number,end:number,len:number}[]}
 */
function spans(words, skip) {
  let current = -skip;
  return words.map(word => {
    const entry = {start: current, end: current + word.length, len: word.length};
    current += word.length;
    return entry;
  });
}

/**
 * For C_A=P_A+K+s_A and C_B=P_B+K+s_B mod29, the key cancels.
 * Each overlap must admit complete dictionary words from both pages,
 * allowing an arbitrary but SINGLE unknown constant s_A-s_B.
 * @param {number[]} cipherA
 * @param {number[]} cipherB
 * @param {number} skip 0=physical page starts, 1=p55 carried-rune bypass
 */
function evaluate(cipherA, cipherB, skip) {
  const aa = spans(wordsA, 0);
  const bb = spans(wordsB, skip);
  const rows = [];
  for (let ai = 0; ai < aa.length; ai++) {
    for (let bi = 0; bi < bb.length; bi++) {
      const lo = Math.max(aa[ai].start, bb[bi].start);
      const hi = Math.min(aa[ai].end, bb[bi].end);
      const length = hi - lo;
      if (length < 3 || lo < 0 || hi > Math.min(cipherA.length, cipherB.length - skip)) continue;
      const offsetA = lo - aa[ai].start;
      const offsetB = lo - bb[bi].start;
      const difference = cipherA.slice(lo, hi)
        .map((n, j) => mod(n - cipherB[lo + j + skip]));
      const wordsRight = wordsByLength.get(bb[bi].len) || [];
      const rightSubstrings = new Set(wordsRight
        .map(word => word.slice(offsetB, offsetB + length).join(",")));
      const allowed = [];
      for (let shift = 0; shift < 29; shift++) {
        const wordsLeft = wordsByLength.get(aa[ai].len) || [];
        const fits = wordsLeft.some(word => {
          const required = word.slice(offsetA, offsetA + length)
            .map((n, j) => mod(n - difference[j] + shift));
          return rightSubstrings.has(required.join(","));
        });
        if (fits) allowed.push(shift);
      }
      rows.push({ai, bi, offset: lo, length, allowed});
    }
  }
  rows.sort((a, b) => b.length - a.length);
  const allShifts = Array.from({length: 29}, (_, i) => i);
  const survivors = allShifts.filter(shift => rows.every(row => row.allowed.includes(shift)));
  return {skip, examined: rows.length, survivors,
    witnesses: rows.filter(row => row.length >= 6 && row.allowed.length === 0),
    sixRune: rows.filter(row => row.length >= 6)
      .map(({ai, bi, offset, allowed}) => ({ai, bi, offset, allowed}))};
}

const originals = [evaluate(sourceA, sourceB, 0), evaluate(sourceA, sourceB, 1)];
assert.deepEqual(originals.map(item => item.survivors), [[], []]);
assert.deepEqual(originals.map(item => item.witnesses.length), [2, 2]);
assert.deepEqual(originals.map(item => item.examined), [12, 14]);

/** @param {number[][]} words @returns {number[]} */
function plantWords(words) {
  return words.flatMap(word => {
    const candidates = wordsByLength.get(word.length) || [];
    assert.ok(candidates.length > 0);
    return candidates[0];
  });
}

const plaintextA = plantWords(wordsA);
const plaintextB = plantWords(wordsB);
const trueShift = mod(13 - 21);
const positives = [];
for (const skip of [0, 1]) {
  const ca = plaintextA.slice();
  const cb = plaintextB.slice();
  for (let i = 0; i < cb.length - skip; i++) {
    const key = mod(7 * i * i + 11 * i + 3);
    ca[i] = mod(plaintextA[i] + key + 13);
    cb[i + skip] = mod(plaintextB[i + skip] + key + 21);
  }
  const result = evaluate(ca, cb, skip);
  assert.ok(result.survivors.includes(trueShift));
  assert.equal(result.witnesses.length, 0);
  for (let i = 0; i < cb.length - skip; i++) {
    const key = mod(7 * i * i + 11 * i + 3);
    assert.equal(mod(ca[i] - key - 13), plaintextA[i]);
    assert.equal(mod(cb[i + skip] - key - 21), plaintextB[i + skip]);
  }
  positives.push({skip, trueShiftRecovered: result.survivors.includes(trueShift),
    feasibleShifts: result.survivors.length});
}

console.log(JSON.stringify({
  source: {page32: 121, page55: 76, wordCounts: [22, 17],
    dictionaryEntries: 29154},
  original: originals, planted: positives,
  conclusion: "Source-aligned same-pad additive GP29 with one constant page shift fails native-GP full-word lexicon gate for both source-natural alignments; no LP2 plaintext recovered."
}, null, 2));
