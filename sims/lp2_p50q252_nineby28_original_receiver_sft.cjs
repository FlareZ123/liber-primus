"use strict";

/**
 * Source-only 252=9*28 quotient receiver gate.
 *
 * The complete original 256-cell base60 grid is exactly divisible over
 * GF29 by H(2013)*G(p39) and by R(p23)*G(p39), giving two source
 * equivalent 252-GP29 coefficient tapes. Nine original visual chapters,
 * 28 non-F rune values: try fixed 28-entry additive key tapes per
 * chapter in two physically meaningful reversible positions:
 *   (A) phase-28 running Vigenere shifts, chapter-reset;
 *   (B) previous plaintext non-F rune -> chapter key lookup.
 * Also test both additive orientations. No original-specific key fitting,
 * no extra source phases, no private word clock.
 *
 * Planted original-word-shaped English controls roundtrip exactly.
 * Node22 CommonJS, read-only, Windows 11 compatible.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const original = gp.pages.filter(p => p.page <= 55 && p.indices.length)
  .flatMap(p => p.indices);
const CH_ENDS = [729, 1874, 3603, 5506, 6527, 7960, 9640, 12648, 12956];
const gpRune = new Map(gp.runes.map((r, i) => [r, i]));
const MOD = n => (n % 29 + 29) % 29;
assert.equal(original.length, 12956);
assert.equal(grid.bytes.length, 256);

const text = read("resources/liber-primus/lp2-transcription.txt");
const words = [];
let word = [], count = 0;
for (const c of text) {
  if (gpRune.has(c)) {
    word.push({pos:count, rune:gpRune.get(c)});
    count++;
    if (count === 12956) {
      words.push(word);
      break;
    }
  } else if ("-.&".includes(c) && word.length) {
    words.push(word);
    word = [];
  }
}
assert.equal(count, 12956);
assert.equal(words.length, 2896);
assert.deepEqual(words.flat().map(w => w.rune), original);

const multiply = (a, b) => {
  const r = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      r[i + j] = MOD(r[i + j] + a[i] * b[j]);
  return r;
};

/**
 * @param {number[]} divisor Increasing-order GF29 coefficients.
 * @returns {{quotient:number[],remainder:number[]}}
 */
function divide(divisor) {
  const d = divisor.slice().reverse();
  const inv = Array.from({length:29}, (_, i) => i)
    .find(v => MOD(v * d[0]) === 1);
  assert.notEqual(inv, undefined);
  const remain = grid.bytes.map(MOD);
  const quotient = [];
  for (let i = 0; i <= remain.length - d.length; i++) {
    const factor = MOD(remain[i] * inv);
    quotient.push(factor);
    for (let j = 0; j < d.length; j++)
      remain[i + j] = MOD(remain[i + j] - factor * d[j]);
  }
  return {quotient, remainder:remain.slice(-(d.length - 1))};
}

const H = [3,26,24], R = [23,6,10], G = [27,5,15];
const quotients = [
  ["signed-H-G", divide(multiply(H, G))],
  ["p23-R-G", divide(multiply(R, G))]
];
for (const [name, q] of quotients) {
  assert.equal(q.quotient.length, 252, name);
  assert.deepEqual(q.remainder, [0,0,0,0], name);
}
assert.deepEqual(quotients[1][1].quotient.slice(0, 12),
  [0,23,10,15,28,2,3,4,20,15,4,6]);

const uniqueness = quotients[1][1].quotient.reduce(
  (rows, value, i) => {
    const ch = Math.floor(i / 28);
    if (!rows[ch]) rows[ch] = [];
    rows[ch].push(value);
    return rows;
  }, []).map(row => new Set(row).size);
assert.deepEqual(uniqueness, [16,19,21,16,19,16,18,17,22]);
// Therefore these rows are NOT direct alphabet permutations of 28 runes.

const TOKENS = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/** @param {string} word @returns {number[]} */
function nativeWord(word) {
  const result = [];
  for (let i = 0; i < word.length;) {
    if (word.startsWith("ING", i)) {
      result.push(21); i += 3;
    } else if (word.startsWith("IO", i)) {
      result.push(27); i += 2;
    } else {
      const t = TOKENS.find(x => word.startsWith(x.s, i));
      assert(t, word);
      result.push(t.i);
      i += t.s.length;
    }
  }
  return result;
}

const sourceText = [
  read("resources/control/gibran_prophet_58585.txt"),
  read("resources/control/shakespeare_first300k.txt")
];
const dictionary = new Set();
const byLength = new Map();
for (const src of sourceText) {
  const normalized = src.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    const encoded = nativeWord(word);
    if (!byLength.has(encoded.length)) byLength.set(encoded.length, encoded);
    if (encoded.length >= 4) dictionary.add(encoded.join(","));
  }
}
for (let size = 1; size <= 14; size++)
  assert(byLength.has(size), "known-GP word source missing length " + size);

const chapter = new Uint8Array(original.length);
const chapterStart = new Uint32Array(original.length);
let start = 0;
for (let ch = 0; ch < 9; ch++) {
  for (let i = start; i < CH_ENDS[ch]; i++) {
    chapter[i] = ch;
    chapterStart[i] = start;
  }
  start = CH_ENDS[ch];
}

/**
 * Each model is a single explicit reversible additive law:
 *  - period28: P=C+sign*Q[chapter][offsetFromChapterStart % 28]
 *  - prevP28:  P=C+sign*Q[chapter][previousP-1], F->shift0
 * The first rune of every chapter is taken literally for prevP28.
 *
 * @param {number[]} ciphertext
 * @param {number[]} q
 * @param {1|-1} sign
 * @param {"period28"|"prevP28"} mode
 * @returns {number[]}
 */
function decrypt(ciphertext, q, sign, mode) {
  const plain = [];
  for (let i = 0; i < ciphertext.length; i++) {
    const ch = chapter[i], from = chapterStart[i];
    let shift;
    if (mode === "period28") {
      shift = q[28 * ch + (i - from) % 28];
    } else {
      const prev = i === from ? 0 : plain[i - 1];
      shift = prev ? q[28 * ch + prev - 1] : 0;
    }
    plain.push(MOD(ciphertext[i] + sign * shift));
  }
  return plain;
}

/**
 * @param {number[]} plaintext
 * @param {number[]} q
 * @param {1|-1} sign
 * @param {"period28"|"prevP28"} mode
 */
function encrypt(plaintext, q, sign, mode) {
  const cipher = [];
  for (let i = 0; i < plaintext.length; i++) {
    const ch = chapter[i], from = chapterStart[i];
    const prev = i === from ? 0 : plaintext[i - 1];
    const shift = mode === "period28"
      ? q[28 * ch + (i - from) % 28]
      : prev ? q[28 * ch + prev - 1] : 0;
    cipher.push(MOD(plaintext[i] - sign * shift));
  }
  return cipher;
}

/** @param {number[]} p */
function stats(p) {
  const freq = Array(29).fill(0);
  for (const v of p) freq[v]++;
  const ioc = freq.reduce((n, v) => n + v * (v - 1), 0)
    / (p.length * (p.length - 1));
  let hits = 0, eligible = 0;
  for (const w of words) {
    if (w.length < 4) continue;
    eligible++;
    if (dictionary.has(w.map(x => p[x.pos]).join(","))) hits++;
  }
  return {ioc, exactDictionaryWords:hits, eligible};
}

// Independently sourced words chosen to preserve ALL printed word lengths,
// explicitly exercising p50 receiver and real word dictionary on positive data.
const planted = words.flatMap(w => byLength.get(w.length));
assert.equal(planted.length, original.length);
assert.equal(stats(planted).exactDictionaryWords, stats(planted).eligible);

const results = [];
for (const [name, qData] of quotients) {
  const q = qData.quotient;
  for (const sign of [-1, 1]) {
    for (const mode of ["period28", "prevP28"]) {
      const actual = decrypt(original, q, sign, mode);
      const plantedCipher = encrypt(planted, q, sign, mode);
      const recovered = decrypt(plantedCipher, q, sign, mode);
      assert.deepEqual(recovered, planted, name + "/" + sign + "/" + mode);
      const s = stats(actual);
      assert(s.ioc < 0.04 && s.exactDictionaryWords <= 10,
        "Original decoder unexpectedly produces native-language structure");
      results.push({quotient:name, sign, mode, ...s,
        first30GP:actual.slice(0, 30).map(x => gp.translit[x]).join("")});
    }
  }
}

console.log(JSON.stringify({
  source:"original p50 GF29 quotient, nine visual chapters, 28 non-F GP symbols",
  qLength:252,
  uniquePer28:uniqueness,
  original:stats(original),
  sourceShapedPlanted:{runes:planted.length,
    authenticWords:stats(planted).exactDictionaryWords,
    exactRecovered:true},
  results,
  decision:"Nine-by-28 complete alphabet interpretation fails distinctness; literal chapter28 additive or prevP-shift consumers return no source-native plaintext"
}, null, 2));
