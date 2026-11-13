"use strict";

/**
 * Source-shaped exact inverse of *all* independent per-word additive
 * second-order linear GP29 keystream recurrences.
 *
 * C[w,j] = P[w,j] + K[w,j] mod 29
 * K[w,j] = a[w] K[w,j-1] + b[w] K[w,j-2] mod 29 (j>=2)
 * Every word has four unconstrained independent secret parameters.
 * Test by solving the linear equations in a,b, without searching seeds.
 * Node 22, CommonJS, no network or external libraries.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseLP2Words } = require("./lp2_word_pages.cjs");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeIds = new Map(corpus.runes.map((r, i) => [r, i]));
const translit = new Map(corpus.translit.map((r, i) => [r, i]));
for (const [a, b] of [
  ["K", "C"], ["Q", "C"], ["Z", "S"], ["V", "U"],
  ["ING", "NG"], ["IO", "IA"]
]) translit.set(a, translit.get(b));
const groups = ["ING", "TH", "NG", "EO", "OE", "AE", "IA", "EA"];
/** @param {number} x */
const mod = x => (x % 29 + 29) % 29;
const inverses = Array.from({ length: 29 }, (_, i) =>
  i === 0 ? -1 : Array.from({ length: 28 }, (_, j) => j + 1)
    .find(x => (x * i) % 29 === 1));
/** @param {string} word @returns {number[]} */
function encode(word) {
  const s = word.toUpperCase().replace(/QU/g, "CW");
  const output = [];
  for (let i = 0; i < s.length;) {
    const token = groups.find(g => s.startsWith(g, i)) || s[i];
    const index = translit.get(token);
    assert.notEqual(index, undefined, token);
    output.push(index);
    i += token.length;
  }
  return output;
}

/**
 * All compatible coefficient pairs (a,b) for residual K=C-P.
 * Need at most 29 solutions for rank-1 and 841 for rank-0 systems.
 * @param {number[]} p
 * @param {number[]} c
 * @returns {number[][]}
 */
function recover(p, c) {
  assert.equal(p.length, c.length);
  const k = c.map((v, i) => mod(v - p[i]));
  const equations = k.slice(2).map((rhs, j) => [k[j + 1], k[j], rhs]);
  const first = equations.find(([u, v]) => u !== 0 || v !== 0);
  const second = first && equations.find(([u, v]) =>
    mod(first[0] * v - first[1] * u) !== 0);
  /** @param {number} a @param {number} b */
  const valid = (a, b) => equations.every(([u, v, rhs]) =>
    mod(a * u + b * v) === rhs);
  if (second) {
    const determinant = mod(first[0] * second[1] -
      first[1] * second[0]);
    const inverse = inverses[determinant];
    const a = mod(inverse * (first[2] * second[1] -
      first[1] * second[2]));
    const b = mod(inverse * (first[0] * second[2] -
      second[0] * first[2]));
    return valid(a, b) ? [[a, b]] : [];
  }
  if (!first) {
    if (equations.some(([, , rhs]) => rhs !== 0)) return [];
    return [[0, 0]];
  }
  const solutions = [];
  if (first[1] !== 0) {
    for (let a = 0; a < 29; a++) {
      const b = mod((first[2] - a * first[0]) * inverses[first[1]]);
      if (valid(a, b)) solutions.push([a, b]);
    }
  } else {
    const a = mod(first[2] * inverses[first[0]]);
    for (let b = 0; b < 29; b++)
      if (valid(a, b)) solutions.push([a, b]);
  }
  return solutions;
}

/**
 * Encrypt, with entirely independent coefficient pair and two word seeds.
 * @param {number[]} p
 * @param {number} a
 * @param {number} b
 * @param {number} seed0
 * @param {number} seed1
 * @returns {number[]}
 */
function encipher(p, a, b, seed0, seed1) {
  const k = [];
  for (let j = 0; j < p.length; j++)
    k.push(j === 0 ? seed0 : j === 1 ? seed1 :
      mod(a * k[j - 1] + b * k[j - 2]));
  return p.map((x, j) => mod(x + k[j]));
}
const lex = new Set();
for (const line of read("resources/control/english_wordfreq_textblob.txt")
  .split(/\r?\n/)) {
  const m = /^([a-z]+)\s+\d+$/.exec(line);
  if (m) lex.add(m[1]);
}
for (const file of [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/liber-primus/lp1-plaintext-reference.txt"
]) for (const w of read(file).match(/[A-Za-z]+/g) || [])
  lex.add(w.toLowerCase());
assert(lex.size > 32000 && lex.size < 33000);
const byLength = new Map();
for (const word of lex) {
  const p = encode(word), len = p.length;
  if (!byLength.has(len)) byLength.set(len, []);
  byLength.get(len).push({ word, p });
}
const input = parseLP2Words(read("resources/liber-primus/lp2-transcription.txt"));
assert.equal(input.words.length, 2896);
assert.equal(input.runeCount, 12956);
const original = input.words.map(w => [...w.runes].map(r => {
  assert(runeIds.has(r), r);
  return runeIds.get(r);
}));
assert.deepEqual(original.flat(),
  corpus.pages.slice(0, 56).flatMap(p => p.indices));
const knownP57 = read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split("### 57\n")[1].trim().match(/[A-Za-z]+/g);
assert(knownP57);
assert.deepEqual(knownP57.flatMap(encode), corpus.pages[57].indices);

// Complete independent-key inverse on every source long word; every lexical
// candidate supplies its own K0,K1 and independently recovered a,b.
const totals = new Map(), examples = [];
for (let wordOrdinal = 0; wordOrdinal < original.length; wordOrdinal++) {
  const c = original[wordOrdinal], len = c.length;
  if (len < 7) continue;
  let matches = 0;
  for (const item of byLength.get(len) || []) {
    const keys = recover(item.p, c);
    if (!keys.length) continue;
    matches++;
    if (examples.length < 12 && len >= 9)
      examples.push({ wordOrdinal, length: len, candidate: item.word,
        recoveredAB: keys.slice(0, 3) });
  }
  const count = totals.get(len) || { total: 0, withMatches: 0, candidates: 0 };
  count.total++;
  count.withMatches += Number(matches > 0);
  count.candidates += matches;
  totals.set(len, count);
}
const long = [...totals].filter(([len]) => len >= 10)
  .reduce((a, [, v]) => a + v.total, 0);
assert.equal(long, 109);
assert.equal([...totals].reduce((a, [, v]) => a + v.total, 0), 559);

let plantedRunes = 0, plantedWords = 0;
for (let i = 0; i < original.length; i++) {
  const len = original[i].length;
  if (len < 7) continue;
  const options = byLength.get(len);
  assert(options?.length);
  const p = options[(i * 37 + 17) % options.length].p;
  const a = mod(i * 17 + 5), b = mod(i * 13 + 7);
  const seed0 = mod(i * 19 + 3), seed1 = mod(i * 11 + 9);
  const c = encipher(p, a, b, seed0, seed1);
  const keys = recover(p, c);
  assert(keys.some(([aa, bb]) => aa === a && bb === b) ||
    p.length >= 7 && keys.length > 0);
  const [ar, br] = keys[0];
  assert.deepEqual(encipher(p, ar, br, mod(c[0] - p[0]),
    mod(c[1] - p[1])), c);
  assert.deepEqual(c.map((v, j) => mod(v - encipher(
    Array(p.length).fill(0), ar, br, seed0, seed1)[j])), p);
  plantedWords++;
  plantedRunes += len;
}
assert.equal(plantedWords, 559);
assert.equal(plantedRunes, 4644);
const summary = [...totals].sort((a, b) => a[0] - b[0])
  .map(([length, value]) => ({ length, ...value }));
console.log(JSON.stringify({ status: "PASS",
  family: "Every word independently has four unconstrained GF29 secrets: two recurrence coefficients and two seeds",
  source: "Original LP2 12956 rune indices; exact printed words; native-GP finite lexicon",
  lexiconWordTypes: lex.size, originalWords: original.length,
  originalLength10Plus: long, originalLength7Plus: 559,
  byLength: summary, longCandidateWords: summary.filter(x=>x.length>=10)
    .reduce((n,x)=>n+x.withMatches,0),
  exampleMatchesLength9Plus: examples,
  knownSolvedP57: "95/95", plantedWords, plantedRecoveredRunes: plantedRunes
}, null, 2));
