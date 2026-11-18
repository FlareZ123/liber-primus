"use strict";

/**
 * LP2 source-word-clocked, invertible GP29 two-ciphertext-history search.
 *
 * This is a bounded plaintext-recovery attempt, not an inferred Cicada opcode.
 * Fit only physical pp0-2; test the leading candidates without refitting on
 * untouched physical pp40-53. All word keys depend on printed ciphertext
 * words; the numerical key streams are not separately fitted.
 *
 * SFT: node sims/lp2_wordlength_twohistory_original_sft.cjs
 * Windows 11, Node.js 22, dependency-free CommonJS.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcript = read("resources/lp2-transcription.txt");
const lexicon = read("resources/control/english_wordfreq_textblob.txt");
const runeOrd = new Map(gp.runes.map((r, i) => [r, i]));
const sourcePages = gp.pages.filter(p => p.page <= 55 && p.indices.length > 0);
const C = sourcePages.flatMap(p => p.indices);
assert.equal(sourcePages.length, 55);
assert.equal(C.length, 12956);

/**
 * @typedef {{
 *  start: number, end: number, len: number, values: number[],
 *  startPage: number, endPage: number
 * }} RuneWord
 */

/**
 * The literal source transcript uses percent as page separator, slash/newline
 * as physical wrapping, and punctuation to terminate actual printed words.
 * @param {number} count Number of rune-bearing source pages.
 * @returns {RuneWord[]}
 */
function parseWords(count) {
  /** @type {RuneWord[]} */
  const words = [];
  /** @type {number[]} */
  let current = [];
  let page = 0;
  let runePos = 0;
  let start = 0;
  let startPage = 0;
  let endPage = 0;
  function finish() {
    if (!current.length) return;
    words.push({start, end: runePos, len: current.length,
      values: current, startPage, endPage});
    current = [];
  }
  for (const ch of transcript.split("%").slice(0, count).join("%")) {
    const value = runeOrd.get(ch);
    if (value !== undefined) {
      if (!current.length) {
        start = runePos;
        startPage = page;
      }
      current.push(value);
      endPage = page;
      runePos++;
    } else if (ch === "%") {
      page++;
    } else if (ch === "/" || /\s/u.test(ch)) {
      // Physical line and page wraps do not terminate printed words.
    } else {
      finish();
    }
  }
  finish();
  return words;
}

const words = parseWords(55);
assert.equal(words.length, 2896);
assert.equal(words.filter(w => w.startPage !== w.endPage).length, 32);
assert.deepEqual(words.flatMap(w => w.values), C);
const offsets = new Map();
let cursor = 0;
for (const page of sourcePages) {
  offsets.set(page.page, cursor);
  cursor += page.indices.length;
}
const TRAIN_END = offsets.get(3);
const TEST_START = offsets.get(40);
const TEST_END = offsets.get(54);
assert.equal(TRAIN_END, 729);
assert.equal(TEST_END - TEST_START, 3008);

const tokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/**
 * Encode the lexicon using the independently established solved-LP1 native
 * GP spelling (ING, IO, QU->CW, V->U, K/Q->C, Z->S).
 * @param {string} text One Latin dictionary word.
 * @returns {string} A through ] representing GP ordinals 0..28.
 */
function nativeCode(text) {
  const w = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  let out = "";
  for (let j = 0; j < w.length;) {
    if (w.startsWith("ING", j)) {
      out += String.fromCharCode(65 + 21);
      j += 3;
    } else if (w.startsWith("IO", j)) {
      out += String.fromCharCode(65 + 27);
      j += 2;
    } else {
      const token = tokens.find(t => w.startsWith(t.s, j));
      if (!token) return "";
      out += String.fromCharCode(65 + token.i);
      j += token.s.length;
    }
  }
  return out;
}

const dict = new Set();
for (const line of lexicon.split(/\r?\n/)) {
  const match = /^([a-z]+)\s+(\d+)$/.exec(line);
  if (match && Number(match[2]) > 0) {
    const coded = nativeCode(match[1]);
    if (coded) dict.add(coded);
  }
}
assert.equal(dict.size, 29060);

/**
 * @param {number} n
 * @returns {number}
 */
function mod(n) {
  return (n % 29 + 29) % 29;
}

/**
 * @param {number[]} cipher
 * @param {RuneWord[]} wordList
 * @returns {{name:string, values:Int16Array}[]}
 */
function keyModes(cipher, wordList) {
  const k = Array.from({length: 9}, () => new Int16Array(cipher.length));
  let prevLength = 0;
  let prevPrimeSum = 0;
  for (let wi = 0; wi < wordList.length; wi++) {
    const word = wordList[wi];
    for (let j = 0; j < word.len; j++) {
      const i = word.start + j;
      const p = prevPrimeSum % 29;
      const vals = [0, prevLength, word.len, word.len - prevLength,
        p, prevLength * (j + 1), word.len * (j + 1), wi,
        (p & 1) ? prevLength : -prevLength];
      for (let m = 0; m < k.length; m++) k[m][i] = mod(vals[m]);
    }
    prevLength = word.len;
    prevPrimeSum = word.values.reduce((sum, value) => sum + gp.prime[value], 0);
  }
  const names = ["zero", "prev_length", "current_length",
    "length_difference", "prev_prime_sum", "prev_length_x_position",
    "current_length_x_position", "word_ordinal",
    "prev_prime_parity_sign"];
  return names.map((name, m) => ({name, values: k[m]}));
}

/**
 * @param {number[]} cipher
 * @param {RuneWord[]} wordList
 * @returns {Int16Array}
 */
function wordFive(cipher, wordList) {
  const t = new Int16Array(cipher.length);
  for (const word of wordList) {
    for (let j = 5; j < word.len; j++) {
      const i = word.start + j;
      t[i] = cipher[i - 5];
    }
  }
  return t;
}

/**
 * @param {ArrayLike<number>} decoded
 * @param {RuneWord[]} wordList
 * @param {number} lo
 * @param {number} hi
 */
function scoreWords(decoded, wordList, lo, hi) {
  let hits = 0;
  let letters = 0;
  let longest = 0;
  let streak = 0;
  for (const word of wordList) {
    if (word.start < lo || word.end > hi) continue;
    let code = "";
    for (let i = word.start; i < word.end; i++) {
      code += String.fromCharCode(65 + decoded[i]);
    }
    if (dict.has(code)) {
      hits++;
      letters += word.len;
      streak++;
      longest = Math.max(streak, longest);
    } else {
      streak = 0;
    }
  }
  return {hits, letters, longest};
}

/**
 * @param {number[]} cipher
 * @param {Int16Array} key
 * @param {Int16Array} lag
 * @param {number} a
 * @param {number} b
 * @param {number} end
 * @returns {Uint8Array}
 */
function decode(cipher, key, lag, a, b, end) {
  const out = new Uint8Array(end);
  for (let i = 0; i < end; i++) {
    out[i] = mod(cipher[i] - a * (i ? cipher[i - 1] : 0)
      - b * lag[i] - key[i]);
  }
  return out;
}

const keys = keyModes(C, words);
const lags = [
  {name: "global5", values: Int16Array.from(C, (_, i) => i >= 5 ? C[i - 5] : 0)},
  {name: "word5", values: wordFive(C, words)}
];

/** @type {Array<{metric:number,clock:string,lag:string,a:number,b:number,train:ReturnType<typeof scoreWords>}>} */
const best = [];
for (const key of keys) {
  for (const lag of lags) {
    for (let a = 0; a < 29; a++) {
      for (let b = 0; b < 29; b++) {
        const P = decode(C, key.values, lag.values, a, b, TRAIN_END);
        const train = scoreWords(P, words, 0, TRAIN_END);
        const metric = train.letters + 1.3 * train.hits + 2 * train.longest;
        if (best.length < 30 || metric > best[best.length - 1].metric) {
          best.push({metric, clock: key.name, lag: lag.name, a, b, train});
          best.sort((x, y) => y.metric - x.metric);
          if (best.length > 30) best.pop();
        }
      }
    }
  }
}
assert.equal(keys.length * lags.length * 29 * 29, 15138);

const ranked = best.slice(0, 12).map(candidate => {
  const key = keys.find(x => x.name === candidate.clock);
  const lag = lags.find(x => x.name === candidate.lag);
  assert(key && lag);
  const P = decode(C, key.values, lag.values, candidate.a, candidate.b, C.length);
  for (let i = 0; i < C.length; i++) {
    assert.equal(mod(P[i] + candidate.a * (i ? C[i - 1] : 0)
      + candidate.b * lag.values[i] + key.values[i]), C[i]);
  }
  return {...candidate,
    test: scoreWords(P, words, TEST_START, TEST_END),
    sample: Array.from(P.slice(0, 24), v => gp.translit[v]).join("-")};
});

/** @type {RuneWord[]} */
const originalP57Words = parseWords(57).filter(w => w.startPage === 56);
const p57 = gp.pages.find(p => p.page === 57).indices;
assert.equal(originalP57Words.length, 20);
const p57Start = originalP57Words[0].start;
const plantWords = originalP57Words.map(w => ({
  ...w, start: w.start - p57Start, end: w.end - p57Start
}));
assert.deepEqual(plantWords.flatMap(w => w.values), p57);
assert.equal(scoreWords(p57, plantWords, 0, p57.length).hits, 16);

// Independent p57 ciphertext plant using an entirely known current-word-length
// clock; forward encryption must read its own evolving ciphertext history.
const plantC = new Array(p57.length).fill(0);
const a = 5;
const b = 13;
for (const word of plantWords) {
  for (let j = 0; j < word.len; j++) {
    const i = word.start + j;
    const prev = i ? plantC[i - 1] : 0;
    const fifth = j >= 5 ? plantC[i - 5] : 0;
    plantC[i] = mod(p57[i] + a * prev + b * fifth + word.len);
  }
}
const plantKey = keyModes(plantC, plantWords)
  .find(x => x.name === "current_length");
assert(plantKey);
const planted = decode(plantC, plantKey.values, wordFive(plantC, plantWords),
  a, b, p57.length);
assert.deepEqual(Array.from(planted), p57);
assert.notDeepEqual(Array.from(decode(plantC, plantKey.values,
  wordFive(plantC, plantWords), a + 1, b, p57.length)), p57);

const report = {
  source: {runecount: C.length, words: words.length,
    acrossPhysicalPages: words.filter(w => w.startPage !== w.endPage).length,
    dictionaryEntries: dict.size},
  test: {family: "GP29 additive two-ciphertext-history, nine ciphertext-word clocks",
    candidates: 15138, trainingPages: "p0-2",
    trainingRunes: TRAIN_END, heldoutPages: "p40-53",
    heldoutRunes: TEST_END - TEST_START,
    originalTrainingBaseline: scoreWords(C, words, 0, TRAIN_END),
    originalHeldoutBaseline: scoreWords(C, words, TEST_START, TEST_END)},
  positive: {solvedPage: "p57", runes: p57.length,
    words: plantWords.length,
    recovered: planted.length,
    recognizedWords: scoreWords(planted, plantWords, 0, p57.length)},
  best: ranked
};
console.log(JSON.stringify(report, null, 2));
