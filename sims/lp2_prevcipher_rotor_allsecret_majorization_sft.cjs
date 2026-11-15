"use strict";
/**
 * Exact all-secret majorization bound for the GP29 predecessor-cipher rotor.
 *
 * Candidate inverse: P[w,j] = T_{C[w,j-1]}(C[w,j]), j>=1, where each of
 * 29 independently secret T rows is an arbitrary GP29 permutation.
 * First runes are unrestrained. No word-internal phase/rekeying is permitted.
 *
 * The sorted row histograms are unchanged by all 29!^29 secret choices.
 * This source-only necessary condition avoids a futile key search.
 *
 * Run: node sims/lp2_prevcipher_rotor_allsecret_majorization_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeIndex = new Map(gp.runes.map((v, i) => [v, i]));
const source = parseSharedCorpus();
const cipherWords = source.words.map((w) => [...w.runes].map((r) => runeIndex.get(r)));
assert.equal(source.runeCount, 12956);
assert.equal(cipherWords.length, 2896);
assert.equal(cipherWords.flat().length, 12956);
assert.ok(cipherWords.every((w) => w.length && w.every((c) => Number.isInteger(c) && c >= 0 && c < 29)));

/**
 * @param {number[][]} words
 * @returns {{row:number[][], positions:number}}
 */
function predecessorTable(words) {
  const row = Array.from({length:29}, () => Array(29).fill(0));
  let positions = 0;
  for (const word of words) {
    for (let j = 1; j < word.length; j++) {
      row[word[j - 1]][word[j]]++;
      positions++;
    }
  }
  return {row, positions};
}

/**
 * Exact upper bounds on sum of the k largest possible *plaintext* bins.
 * Independent permutations within each previous-cipher row preserve each
 * row's sorted counts; assigning each row's largest k counts to the same
 * k plaintext glyphs is the optimal assignment.
 * @param {number[][]} rows
 * @returns {number[]}
 */
function majorizationBounds(rows) {
  const sorted = rows.map((r) => r.slice().sort((a, b) => b - a));
  return Array.from({length:29}, (_, j) => {
    const k = j + 1;
    return sorted.reduce((sum, row) =>
      sum + row.slice(0, k).reduce((a, b) => a + b, 0), 0);
  });
}

/** @param {number[][]} words @returns {number[]} */
function interiorCounts(words) {
  const hist = Array(29).fill(0);
  for (const w of words) for (let j = 1; j < w.length; j++) hist[w[j]]++;
  return hist.sort((a, b) => b - a);
}
const sumTop = (array, k) => array.slice(0, k).reduce((a, b) => a + b, 0);
const original = predecessorTable(cipherWords);
const capacities = majorizationBounds(original.row);
assert.equal(original.positions, 10060);
assert.equal(capacities[0], 578);
assert.equal(capacities[4], 2510);
assert.equal(capacities[28], original.positions);

/** Deterministic xorshift32 for reproducible plant/control sampling. */
function makeRandom(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}
const sortedTokens = gp.translit.map((name, index) => ({name, index}))
  .sort((a, b) => b.name.length - a.name.length);
/**
 * Historical source-native GP29 spelling uses ING -> NG and IO -> IA.
 * @param {string} raw
 * @returns {number[]}
 */
function nativeWord(raw) {
  const s = raw.toUpperCase().replace(/QU/gu, "CW")
    .replace(/K/gu, "C").replace(/Q/gu, "C")
    .replace(/V/gu, "U").replace(/Z/gu, "S")
    .replace(/ING/gu, "NG").replace(/IO/gu, "IA");
  const result = [];
  for (let i = 0; i < s.length;) {
    const t = sortedTokens.find((x) => s.startsWith(x.name, i));
    if (!t) return [];
    result.push(t.index);
    i += t.name.length;
  }
  return result;
}

/**
 * Positive control with an independently keyed arbitrary row permutation.
 * The ciphertext previous glyph, not plaintext previous glyph, selects
 * the row. Exactly reconstruct all 12,956 GP29 tokens and verify
 * the source-independent majorization invariant on a genuine plant.
 * @param {number[][]} plaintext
 * @returns {object}
 */
function plantedRotor(plaintext) {
  const rand = makeRandom(0x33014425);
  const forward = Array.from({length:29}, () => {
    const r = Array.from({length:29}, (_, i) => i);
    for (let j = 28; j > 0; j--) {
      const k = rand() % (j + 1);
      [r[j], r[k]] = [r[k], r[j]];
    }
    return r;
  });
  const backward = forward.map((r) => {
    const inv = Array(29);
    r.forEach((c, p) => { inv[c] = p; });
    return inv;
  });
  const cipher = plaintext.map((p) => {
    const c = [p[0]];
    for (let j = 1; j < p.length; j++)
      c.push(forward[c[j - 1]][p[j]]);
    return c;
  });
  const decoded = cipher.map((c) => {
    const p = [c[0]];
    for (let j = 1; j < c.length; j++)
      p.push(backward[c[j - 1]][c[j]]);
    return p;
  });
  assert.deepEqual(decoded, plaintext, "planted GP29 rotor round-trip");
  const caps = majorizationBounds(predecessorTable(cipher).row);
  const hist = interiorCounts(plaintext);
  for (let k = 1; k <= 29; k++)
    assert.ok(sumTop(hist, k) <= caps[k - 1], "planted majorization theorem");
  return {exactReencryption: true, symbols: decoded.flat().length,
    plantedTop1:hist[0], plantedCap1:caps[0]};
}

const controls = [];
const refs = [
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
];
for (let src = 0; src < refs.length; src++) {
  const [name, file] = refs[src];
  const buckets = Array.from({length:15}, () => []);
  for (const text of (read(file).match(/[A-Za-z]+/gu) || [])) {
    const w = nativeWord(text);
    if (w.length && w.length <= 14) buckets[w.length].push(w);
  }
  assert.ok(buckets.slice(1).every((b) => b.length));
  const rand = makeRandom((0x33011234 + 7919 * src) >>> 0);
  const top1 = [], top5 = [];
  let planted = null;
  for (let trial = 0; trial < 100; trial++) {
    const p = cipherWords.map((w) => {
      const b = buckets[w.length];
      return b[rand() % b.length];
    });
    if (trial === 0) planted = plantedRotor(p);
    const bins = interiorCounts(p);
    top1.push(sumTop(bins, 1));
    top5.push(sumTop(bins, 5));
  }
  const item = {
    name, trials:100,
    nativeTop1:{min:Math.min(...top1), max:Math.max(...top1)},
    nativeTop5:{min:Math.min(...top5), max:Math.max(...top5)},
    countsNotExceedingOriginalCap1:top1.filter((x) => x <= capacities[0]).length,
    countsNotExceedingOriginalCap5:top5.filter((x) => x <= capacities[4]).length,
    positive:planted
  };
  assert.equal(item.countsNotExceedingOriginalCap1, 0);
  assert.equal(item.countsNotExceedingOriginalCap5, 0);
  controls.push(item);
}
console.log(JSON.stringify({
  source:"original LP2 p0-p55 GP29, all 2896 authentic whole words",
  original:{words:cipherWords.length, runes:12956,
    wordInternalPositions:original.positions, maxTop1:capacities[0],
    maxTop5:capacities[4], maxTop10:capacities[9]},
  theorem:"Every secret predecessor-ciphertext keyed GP29 permutation row preserves its own sorted input histogram. The aggregate k-largest output count cannot exceed the sum of the rowwise k-largest counts.",
  matchedNativeEnglish:controls,
  conclusion:"No stationary predecessor-ciphertext selected permutation, regardless of its 29 independent secret rows, yields a native-English-like word-internal GP29 register on unchanged LP2 original ciphertext.",
  limits:"No restrictions on first rune of each word. Conditional on direct word-aligned native GP29 prose; altered registers, extra time state, or nonbijective/variable-length encoding are outside this theorem. No unknown plaintext or key recovered."
}, null, 2));
