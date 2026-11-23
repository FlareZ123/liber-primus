"use strict";

/**
 * Original LP2 no-repeat-with-fixed-escape test.
 *
 * Key-independent invariant: for any full-alphabet, reversible predecessor
 * exclusion cipher with one fixed plaintext escape rune E,
 * C[i] === C[i-1] iff P[i] === E. A 29th alphabet symbol is encoded by
 * the repeated ciphertext transition; the other 28 use a 28-way choice.
 *
 * Read-only, no external dependencies. Run using Node.js 22.
 * Input: original LP2 transcription plus three exact-word-length-matched
 * GP29 English references already in this repository.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
/** @param {string} file */
function read(file) { return fs.readFileSync(path.join(root, file), "utf8"); }

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const originalRaw = read("resources/transcriptions/lp2-image-corrected.txt")
  .split("%").slice(0, 55).join("%");

/**
 * Printed word separators end words; original page and line separators do not.
 * @param {string} text
 * @returns {number[][]}
 */
function originalWords(text) {
  /** @type {number[][]} */
  const words = [];
  let word = [];
  for (const ch of text) {
    if (runeIndex.has(ch)) word.push(runeIndex.get(ch));
    else if (ch === "%" || ch === "/" || /\s/u.test(ch)) {}
    else if (word.length) { words.push(word); word = []; }
  }
  if (word.length) words.push(word);
  return words;
}
const original = originalWords(originalRaw);
const lengths = original.map(w => w.length);
assert.equal(original.length, 2896);
assert.equal(original.flat().length, 12956);
assert.deepEqual(original.flat(), corpus.pages
  .filter(p => p.page <= 55).flatMap(p => p.indices));

/** Count equal adjacent runes, including across original printed words. */
function doubletLocations(words) {
  let prior = null, doublets = 0, atStart = 0, inside = 0;
  for (const word of words) {
    word.forEach((value, j) => {
      if (value === prior) {
        doublets++;
        if (j === 0) atStart++; else inside++;
      }
      prior = value;
    });
  }
  return { doublets, atStart, inside };
}
const observed = doubletLocations(original);
assert.deepEqual(observed, {doublets:86, atStart:23, inside:63});

const gpAlphabet = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/** @param {string} raw */
function gpWord(raw) {
  const text = raw.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C")
    .replace(/Z/g, "S").replace(/ING/g, "NG");
  /** @type {number[]} */
  const result = [];
  for (let i = 0; i < text.length;) {
    const match = gpAlphabet.find(x => text.startsWith(x.s, i));
    if (!match) return null;
    result.push(match.i);
    i += match.s.length;
  }
  return result;
}
/** @param {string} raw */
function nativeWords(raw) {
  return (raw.match(/[A-Z]+/gi) || []).map(gpWord)
    .filter(w => w !== null && w.length > 0);
}

/**
 * Full GP29 positive. All 29 symbols, including escape, can be losslessly
 * encoded using only one preceding-ciphertext carry. No hidden bit sidecar.
 * @param {number[]} plaintext
 * @param {number} escape
 */
function encode(plaintext, escape) {
  let prev = 0;
  return plaintext.map(p => {
    if (p === escape) return prev;
    const rank = p < escape ? p : p - 1;
    const cipher = rank < prev ? rank : rank + 1;
    prev = cipher;
    return cipher;
  });
}
/** @param {number[]} ciphertext @param {number} escape */
function decode(ciphertext, escape) {
  let prev = 0;
  return ciphertext.map(c => {
    const plain = c === prev ? escape : c - (c > prev ? 1 : 0);
    const p = plain === escape ? plain : plain >= escape ? plain + 1 : plain;
    prev = c;
    return p;
  });
}

/**
 * Exact Poisson-binomial tail, conditioned on original word lengths.
 * A reference word is independently sampled WITH replacement from words
 * of the exact matching GP29 rune length.
 * @param {number[]} ps
 * @param {number} target
 */
function startTail(ps, target) {
  const dp = new Float64Array(target + 1);
  dp[0] = 1;
  for (const p of ps) {
    for (let n = target; n >= 0; n--)
      dp[n] = dp[n] * (1-p) + (n ? dp[n-1] * p : 0);
  }
  const expected = ps.reduce((s, x) => s+x, 0);
  const cumulative = dp.reduce((s, x) => s+x, 0);
  const tail = expected >= target ? cumulative :
    1 - (cumulative - dp[target]);
  return {expected, tail:Math.max(0, Math.min(1, tail))};
}

/**
 * Independent-word Poisson-binomial convolution extended to 0..L copies of
 * a rune per source word. Returns a one-sided exact tail containing 86.
 * @param {Map<number,number[]>} probabilityByLength
 * @param {number} expected
 * @param {number} target
 */
function totalTail(probabilityByLength, expected, target) {
  let dp = new Float64Array(target + 1);
  dp[0] = 1;
  let maximum = 0;
  for (const length of lengths) {
    const pmf = probabilityByLength.get(length);
    const next = new Float64Array(target + 1);
    for (let n = 0; n <= Math.min(maximum, target); n++) {
      const v = dp[n];
      if (!v) continue;
      for (let k = 0; k < pmf.length && n+k <= target; k++)
        next[n+k] += v * pmf[k];
    }
    dp = next;
    maximum += length;
  }
  const cumulative = dp.reduce((s, x) => s+x, 0);
  const tail = expected >= target ? cumulative :
    1 - (cumulative - dp[target]);
  return Math.max(0, Math.min(1, tail));
}

/** @param {number[][]} controls */
function evaluate(controls) {
  /** @type {Map<number,number[][]>} */
  const byLength = new Map();
  for (const word of controls) {
    if (!byLength.has(word.length)) byLength.set(word.length, []);
    byLength.get(word.length).push(word);
  }
  for (const length of new Set(lengths))
    assert.ok(byLength.has(length), "Missing native length " + length);

  /** @type {Array<{rune:string,startMean:number,startTail:number,totalMean:number,totalTail:number|null,jointUpper:number}>} */
  const candidates = [];
  for (let letter = 0; letter < 29; letter++) {
    const first = new Map();
    const countPmf = new Map();
    const means = new Map();
    for (const length of new Set(lengths)) {
      const pool = byLength.get(length);
      const frequency = Array(length + 1).fill(0);
      let starts = 0, sum = 0;
      for (const word of pool) {
        if (word[0] === letter) starts++;
        let count = 0;
        for (const symbol of word) if (symbol === letter) count++;
        frequency[count]++;
        sum += count;
      }
      first.set(length, starts / pool.length);
      means.set(length, sum / pool.length);
      countPmf.set(length, frequency.map(n => n/pool.length));
    }
    const start = startTail(lengths.map(length => first.get(length)), 23);
    const totalMean = lengths.reduce((s, l) => s + means.get(l), 0);
    // The start-tail bound already suffices below this conservative cutoff;
    // skipping the costlier compound distribution never weakens the bound.
    const tot = start.tail > 1e-11 ?
      totalTail(countPmf, totalMean, 86) : null;
    candidates.push({rune:corpus.translit[letter],
      startMean:start.expected, startTail:start.tail,
      totalMean, totalTail:tot,
      jointUpper:tot === null ? start.tail : Math.min(start.tail, tot)});
  }
  candidates.sort((a, b) => b.jointUpper - a.jointUpper);
  return {referenceWords:controls.length,
    top:candidates.slice(0, 4),
    anyFixedRuneUnionUpper:candidates.reduce((s, c) => s+c.jointUpper, 0)};
}

function main() {
  const references = [
    ["Gibran", "resources/control/gibran_prophet_58585.txt"],
    ["Emerson", "resources/control/emerson_essays_2944.txt"],
    ["Shakespeare", "resources/control/shakespeare_first300k.txt"]
  ];
  for (const [name, file] of references) {
    const control = nativeWords(read(file));
    // Positive: every native plaintext rune, including all rare escapes,
    // round-trips with exact no-repeat rank semantics.
    const originalPlain = control.slice(0, 500).flat();
    for (const escape of [0, 7, 28]) {
      const cipher = encode(originalPlain, escape);
      assert.deepEqual(decode(cipher, escape), originalPlain);
      assert.equal(cipher.length, originalPlain.length);
      assert.equal(cipher.slice(1).filter((x, i) => x === cipher[i]).length,
        originalPlain.slice(1).filter(x => x === escape).length);
    }
    const result = evaluate(control);
    console.log(JSON.stringify({name, ...result}));
    assert.ok(result.anyFixedRuneUnionUpper < 0.001,
      "Fixed escape morphology no longer excluded in " + name);
  }
  console.log("PASS", JSON.stringify({sourceWords:original.length,
    sourceRunes:original.flat().length, observed}));
}
if (require.main === module) main();
module.exports = {originalWords, doubletLocations, gpWord, nativeWords,
  encode, decode, startTail, totalTail, evaluate, main};
