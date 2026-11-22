// @ts-check
"use strict";
/**
 * Source-native BASE29 wordwise modular-power gate for original LP2.
 * Run: node sims/lp2_signed2013_base29_wordpower_gate_sft.cjs
 * Uses original physical word breaks, with page/line carries preserved.
 * Reads source files only; never rewrites or extends original inputs.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const root = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const words = parseSharedCorpus();
assert.equal(words.words.length, 2896);
assert.equal(words.runeCount, 12956);
assert.equal(words.crossPageWords, 32);
const glyphToIndex = new Map(corpus.runes.map((r, i) => [r, i]));
/** @param {string} runes @returns {number[]} */
function gpValues(runes) {
  return [...runes].map(r => {
    const i = glyphToIndex.get(r);
    assert.notEqual(i, undefined);
    return /** @type {number} */(i);
  });
}
const ciphertextWords = words.words.map(w => gpValues(w.runes));
const original = ciphertextWords.flat();
assert.deepEqual(original, corpus.pages.filter(p => p.page <= 55)
  .flatMap(p => p.indices));

/** @param {bigint} x @param {bigint} e @param {bigint} m @returns {bigint} */
function modPow(x, e, m) {
  let out = 1n;
  x %= m;
  for (; e > 0n; e >>= 1n) {
    if (e & 1n) out = out * x % m;
    x = x * x % m;
  }
  return out;
}
/** @param {bigint} value @param {bigint} modulus @returns {bigint} */
function inverse(value, modulus) {
  let t = 0n, nt = 1n, r = modulus, nr = value % modulus;
  while (nr !== 0n) {
    const q = r / nr;
    [t, nt] = [nt, t - q * nt];
    [r, nr] = [nr, r - q * nr];
  }
  assert.equal(r, 1n, "Exponent must be invertible in the unit group");
  return (t % modulus + modulus) % modulus;
}
/**
 * Reversible word-preserving p-adic power in Z/(29^L).
 * The 29-adic valuation and every positional leading zero are retained.
 * @param {number[]} digits
 * @param {number} exponent
 * @param {"encode"|"decode"} direction
 * @returns {number[]}
 */
function transform(digits, exponent, direction) {
  const L = digits.length, base = 29n, e = BigInt(exponent);
  let n = 0n;
  for (const d of digits) n = n * base + BigInt(d);
  if (n === 0n) return digits.slice();
  let v = 0, u = n;
  while (u % base === 0n) {u /= base; v++;}
  const m = base ** BigInt(L - v);
  const phi = 28n * base ** BigInt(L - v - 1);
  const power = direction === "encode" ? e : inverse(e, phi);
  let y = modPow(u, power, m) * base ** BigInt(v);
  const result = Array(L);
  for (let i = L - 1; i >= 0; i--) {
    result[i] = Number(y % base);
    y /= base;
  }
  assert.equal(y, 0n);
  return result;
}
/** @param {number[]} values @returns {number} */
function coincidence(values) {
  const h = Array(29).fill(0);
  for (const v of values) h[v]++;
  return h.reduce((s, k) => s + k * (k - 1), 0)
    / (values.length * (values.length - 1));
}
/** @param {number[][]} sets @returns {number[]} */
function finalHistogram(sets) {
  const h = Array(29).fill(0);
  for (const s of sets) if (s.length > 1) h[s[s.length - 1]]++;
  return h;
}
/**
 * Raising to any unit exponent, even a different exponent for every word,
 * preserves multiplicative order of the least-significant residue mod29.
 * The three special residues 0, 1, 28 are individually fixed.
 * @param {number} residue @returns {number}
 */
function order29(residue) {
  if (residue === 0) return 0;
  let x = 1;
  for (let order = 1; order <= 28; order++) {
    x = x * residue % 29;
    if (x === 1) return order;
  }
  throw Error("Expected order dividing 28");
}
/** @param {number[][]} wordArrays @returns {Record<number,number>} */
function orderHistogram(wordArrays) {
  const counts = /** @type {Record<number,number>} */ (
    {0:0,1:0,2:0,4:0,7:0,14:0,28:0});
  for (const word of wordArrays) {
    if (word.length > 1) counts[order29(word[word.length - 1])]++;
  }
  return counts;
}
const originalOrders = orderHistogram(ciphertextWords);
assert.deepEqual(originalOrders,
  {0:81,1:95,2:101,4:192,7:601,14:586,28:1157});
const final = finalHistogram(ciphertextWords);
assert.equal(final.reduce((s, x) => s + x, 0), 2813);
assert.equal(Math.min(...final), 75);
assert.equal(Math.max(...final), 117);
const finalIC = final.reduce((s, n) => s + n * (n - 1), 0) / (2813 * 2812);
assert.ok(Math.abs(finalIC - 0.03451234084384682) < 1e-14);

/**
 * A fixed lossless 29-adic 1-Lipschitz map induces a permutation modulo29,
 * so it cannot change the *multiset* of final-rune occurrences.
 * This includes every fixed bijective modular power, for any word length.
 */
const exponents = [5, 15, 19, 23];
const originalOutcomes = [];
const changingExponentCipher = ciphertextWords.map(
  (w,i) => transform(w, exponents[i % exponents.length], "encode"));
assert.deepEqual(orderHistogram(changingExponentCipher), originalOrders);
assert.deepEqual(changingExponentCipher.map((w,i) =>
  transform(w, exponents[i % exponents.length], "decode")),
  ciphertextWords);
for (const e of exponents) for (const direction of ["encode", "decode"]) {
  const out = ciphertextWords.map(w => transform(w, e,
    /** @type {"encode"|"decode"} */ (direction)));
  for (let i = 0; i < out.length; i++) {
    const other = transform(out[i], e, direction === "encode" ? "decode" : "encode");
    assert.deepEqual(other, ciphertextWords[i], "Original word inversion failed");
  }
  const endCounts = finalHistogram(out);
  assert.deepEqual(endCounts.toSorted((a, b) => a - b),
    final.toSorted((a, b) => a - b));
  originalOutcomes.push({
    exponent:e, direction,
    wholeBookIC:coincidence(out.flat()),
    maxFinalRuneCount:Math.max(...endCounts),
    finalRuneIC:finalIC
  });
}

/** @type {Map<string,number>} */
const letter = new Map(corpus.translit.map((s, i) => [s, i]));
const ligatures = ["TH", "EO", "NG", "OE", "AE", "IA", "EA"];
/** @param {string} text @returns {number[]} */
function encodeEnglish(text) {
  const s = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < s.length;) {
    const digraph = ligatures.find(g => s.startsWith(g, i));
    const symbol = digraph || s[i];
    const value = letter.get(symbol);
    assert.notEqual(value, undefined);
    out.push(/** @type {number} */ (value));
    i += symbol.length;
  }
  return out;
}

const lengthCounts = new Map();
for (const w of ciphertextWords) lengthCounts.set(w.length,
  (lengthCounts.get(w.length) || 0) + 1);
const sources = [
  ["Shakespeare", "shakespeare_first300k.txt", 0x1100067],
  ["Gibran", "gibran_prophet_58585.txt", 0x1100068],
  ["Emerson", "emerson_essays_2944.txt", 0x1100069]
];
const sourceOutcomes = [];
for (const [name, filename, seed0] of sources) {
  const raw = fs.readFileSync(path.join(root, "resources/control", filename), "utf8");
  const tokens = (raw.match(/[A-Za-z]+/g) || []).map(encodeEnglish);
  /** @type {Map<number,number[][]>} */
  const pools = new Map();
  for (const token of tokens) {
    if (!pools.has(token.length)) pools.set(token.length, []);
    /** @type {number[][]} */ (pools.get(token.length)).push(token);
  }
  for (const size of lengthCounts.keys()) assert.ok(pools.has(size));

  const expected = Array(29).fill(0);
  for (const [size, n] of lengthCounts) {
    if (size === 1) continue;
    const pool = /** @type {number[][]} */ (pools.get(size));
    for (const token of pool) expected[token[token.length - 1]] += n / pool.length;
  }
  const expectedOrders = /** @type {Record<number,number>} */ (
    {0:0,1:0,2:0,4:0,7:0,14:0,28:0});
  for (const [size, n] of lengthCounts) {
    if (size === 1) continue;
    const pool = /** @type {number[][]} */ (pools.get(size));
    for (const token of pool) {
      expectedOrders[order29(token[token.length - 1])] += n / pool.length;
    }
  }
  let seed = /** @type {number} */ (seed0);
  /** @returns {number} */
  function random() {
    seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  }
  /** @returns {number[][]} */
  function makeControl() {
    return ciphertextWords.map(w => {
      const pool = /** @type {number[][]} */ (pools.get(w.length));
      return pool[Math.floor(random() * pool.length)];
    });
  }
  const nativePlant = makeControl();
  for (const e of exponents) {
    const encrypted = nativePlant.map(w => transform(w, e, "encode"));
    const decoded = encrypted.map(w => transform(w, e, "decode"));
    assert.deepEqual(decoded, nativePlant, "English word-power plant recovery failed");
    assert.deepEqual(finalHistogram(encrypted).toSorted((a,b) => a-b),
      finalHistogram(nativePlant).toSorted((a,b) => a-b));
  }
  const evolvingPlant = nativePlant.map(
    (w,i) => transform(w, exponents[i % exponents.length], "encode"));
  assert.deepEqual(orderHistogram(evolvingPlant), orderHistogram(nativePlant));
  assert.deepEqual(evolvingPlant.map((w,i) =>
    transform(w, exponents[i % exponents.length], "decode")),
    nativePlant);
  let minimumControlMaximum = Infinity, minimumControlIC = Infinity;
  let largestControlOrder2 = 0, smallestControlOrder28 = Infinity;
  let controlsWithOrder2AtLeastOriginal = 0;
  let controlsWithOrder28AtMostOriginal = 0;
  let atOrBelowObservedMaximum = 0, atOrBelowObservedIC = 0;
  const repeats = 2000;
  for (let k = 0; k < repeats; k++) {
    const sample = makeControl();
    const orderCounts = orderHistogram(sample);
    largestControlOrder2 = Math.max(largestControlOrder2, orderCounts[2]);
    smallestControlOrder28 = Math.min(smallestControlOrder28, orderCounts[28]);
    if (orderCounts[2] >= originalOrders[2]) controlsWithOrder2AtLeastOriginal++;
    if (orderCounts[28] <= originalOrders[28]) controlsWithOrder28AtMostOriginal++;
    const h = finalHistogram(sample);
    const max = Math.max(...h);
    const ic = h.reduce((s,n) => s + n*(n-1), 0) / (2813 * 2812);
    minimumControlMaximum = Math.min(minimumControlMaximum, max);
    minimumControlIC = Math.min(minimumControlIC, ic);
    if (max <= 117) atOrBelowObservedMaximum++;
    if (ic <= finalIC) atOrBelowObservedIC++;
  }
  assert.equal(controlsWithOrder2AtLeastOriginal, 0);
  assert.equal(controlsWithOrder28AtMostOriginal, 0);
  assert.equal(atOrBelowObservedMaximum, 0);
  assert.equal(atOrBelowObservedIC, 0);
  sourceOutcomes.push({
    source:name, sourceWordCount:tokens.length,
    mostFrequentExpectedFinalRune:corpus.translit[expected.indexOf(Math.max(...expected))],
    expectedTopFinalCount:Math.max(...expected),
    minimumControlMaximum, minimumControlIC,
    expectedOrder2Endings:expectedOrders[2],
    expectedOrder28Endings:expectedOrders[28],
    largestControlOrder2, smallestControlOrder28,
    controlsWithOrder2AtLeastOriginal, controlsWithOrder28AtMostOriginal,
    controls:repeats, atOrBelowObservedMaximum, atOrBelowObservedIC
  });
}
console.log(JSON.stringify({
  scope:"55 rune-bearing unknown LP2 pages, all exact complete printed words",
  source:"2013 signed BASE29 / DH23 example motivates candidate exponents but does not select the cipher",
  original:{runes:original.length,words:words.words.length,
    carriedWords:words.crossPageWords,eligibleWordEndings:2813,
    finalRuneCountMinimum:Math.min(...final),
    finalRuneCountMaximum:Math.max(...final), finalRuneIC:finalIC,
    multiplicativeOrderCounts:originalOrders},
  variableWordExponentPositiveControl:"passed",originalOutcomes,sourceOutcomes,
  result:"No plaintext. All word-varying unit exponent keys preserve a GP29 order-2 word-end invariant incompatible with native English."
},null,2));
