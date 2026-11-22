"use strict";

/**
 * Standalone source-constrained original-LP2 gate: GP29 word integer
 * multiplication by a fixed unit modulo 29^wordLength.
 *
 * The lowest-order digit of every word is permuted by the same unit modulo
 * 29, independently of higher-order carries. The global and same-start-page
 * word-edge equality counts are therefore key-independent invariants.
 *
 * Uses only the original transcript, the canonical repository word parser,
 * the GP alphabet, and independently sourced native-English controls.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words} = require("./lp2_word_pages.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ids = new Map(corpus.runes.map((r, i) => [r, i]));
const original = parseLP2Words(read("resources/liber-primus/lp2-transcription.txt"))
  .words.map((w) => ({
    page: w.startPage,
    digits: [...w.runes].map((r) => ids.get(r))
  }));
assert.equal(original.length, 2896);
assert.equal(original.reduce((sum, w) => sum + w.digits.length, 0), 12956);
assert(original.every((w) => w.digits.every((x) => Number.isInteger(x) && x >= 0 && x < 29)));

const sourcePaths = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"],
  ["LP1 solved", "resources/liber-primus/lp1-plaintext-reference.txt"]
];
const tokens = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/** @param {string} text @returns {number[][]} */
function nativeWords(text) {
  return (text.toUpperCase().match(/[A-Z]+/g) || []).map((originalWord) => {
    const word = originalWord.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S");
    const digits = [];
    for (let p = 0; p < word.length;) {
      const token = tokens.find((x) => word.startsWith(x.s, p));
      assert(token, "Missing GP token in " + word);
      digits.push(token.i);
      p += token.s.length;
    }
    return digits;
  });
}

/** @param {number[]} counts @returns {number} */
function matchingPairs(counts) {
  return counts.reduce((sum, n) => sum + n * (n - 1), 0);
}

/**
 * @param {{page:number,digits:number[]}[]} words
 * @returns {{num:number,den:number,rate:number}[]}
 * Four outputs: first/global, first/page, last/global, last/page.
 */
function edgeStats(words) {
  const result = [];
  const pageSizes = Array(55).fill(0);
  for (const w of words) pageSizes[w.page]++;
  const globalDen = words.length * (words.length - 1);
  const pageDen = pageSizes.reduce((sum, n) => sum + n * (n - 1), 0);
  for (const first of [true, false]) {
    const globalCounts = Array(29).fill(0);
    const pageCounts = Array.from({length: 55}, () => Array(29).fill(0));
    for (const w of words) {
      const digit = first ? w.digits[0] : w.digits[w.digits.length - 1];
      globalCounts[digit]++;
      pageCounts[w.page][digit]++;
    }
    const globalNum = matchingPairs(globalCounts);
    const pageNum = pageCounts.reduce((sum, counts) =>
      sum + matchingPairs(counts), 0);
    result.push({num: globalNum, den: globalDen, rate: globalNum / globalDen});
    result.push({num: pageNum, den: pageDen, rate: pageNum / pageDen});
  }
  return result;
}

/**
 * Exact equality invariant even if the multiplier is a different secret unit
 * for each length, or for every (start page, length) pair. The lowest-order
 * digit must still undergo one fixed 29-way permutation within each group.
 * @param {{page:number,digits:number[]}[]} words
 * @param {boolean} byPage
 * @returns {{num:number,den:number,rate:number}[]}
 */
function stratifiedEdgeStats(words, byPage) {
  const output = [];
  for (const first of [true, false]) {
    const groups = new Map();
    for (const w of words) {
      const key = byPage ? w.page + ":" + w.digits.length :
        String(w.digits.length);
      if (!groups.has(key)) groups.set(key, Array(29).fill(0));
      const digit = first ? w.digits[0] : w.digits[w.digits.length - 1];
      groups.get(key)[digit]++;
    }
    let num = 0, den = 0;
    for (const counts of groups.values()) {
      const n = counts.reduce((sum, x) => sum + x, 0);
      num += matchingPairs(counts);
      den += n * (n - 1);
    }
    output.push({num, den, rate: num / den});
  }
  return output;
}

/** @param {number} seed @returns {() => number} */
function rng32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/** @param {bigint} a @param {bigint} modulus @returns {bigint} */
function modInverse(a, modulus) {
  let t = 0n, nextT = 1n, r = modulus, nextR = a % modulus;
  while (nextR !== 0n) {
    const q = r / nextR;
    [t, nextT] = [nextT, t - q * nextT];
    [r, nextR] = [nextR, r - q * nextR];
  }
  assert.equal(r, 1n);
  return (t % modulus + modulus) % modulus;
}

/**
 * @param {number[]} digits
 * @param {bigint} key
 * @param {boolean} divide
 * @param {boolean} leastSignificantFirst
 * @returns {number[]}
 */
function transformWord(digits, key, divide, leastSignificantFirst) {
  const length = digits.length;
  const modulus = 29n ** BigInt(length);
  const factor = divide ? modInverse(key, modulus) : key % modulus;
  let n = 0n;
  for (let i = 0; i < length; i++)
    n = 29n * n + BigInt(digits[leastSignificantFirst ? length - i - 1 : i]);
  n = (n * factor) % modulus;
  const output = Array(length);
  for (let i = 0; i < length; i++) {
    const digit = Number(n % 29n);
    output[leastSignificantFirst ? i : length - i - 1] = digit;
    n /= 29n;
  }
  return output;
}

/** @param {number[][]} words @returns {number} */
function indexOfCoincidence(words) {
  const counts = Array(29).fill(0);
  let n = 0;
  for (const word of words) for (const digit of word) {
    counts[digit]++;
    n++;
  }
  return matchingPairs(counts) / (n * (n - 1));
}

const obs = edgeStats(original);
assert.deepEqual(obs.map((s) => [s.num, s.den]), [
  [288592, 8383920], [5456, 158938],
  [289624, 8383920], [5266, 158938]
]);
const obsStratified = [
  ...stratifiedEdgeStats(original, false),
  ...stratifiedEdgeStats(original, true)
];
assert.deepEqual(obsStratified.map((s) => [s.num, s.den]), [
  [42462, 1233444], [42606, 1233444],
  [788, 23216], [750, 23216]
]);
const samples = 200;
const summaries = [];
for (let si = 0; si < sourcePaths.length; si++) {
  const [name, source] = sourcePaths[si];
  const reference = nativeWords(read(source));
  const pools = new Map();
  for (const digits of reference) {
    if (!pools.has(digits.length)) pools.set(digits.length, []);
    pools.get(digits.length).push(digits);
  }
  for (const w of original) assert(pools.has(w.digits.length));
  const rng = rng32(0x3301a5f0 + si + 2);
  const minimum = Array(4).fill(Infinity);
  const maximum = Array(4).fill(-Infinity);
  const mean = Array(4).fill(0);
  const leOriginal = Array(4).fill(0);
  const stratifiedMinimum = Array(4).fill(Infinity);
  const stratifiedMean = Array(4).fill(0);
  const stratifiedLeOriginal = Array(4).fill(0);
  for (let t = 0; t < samples; t++) {
    const control = original.map((w) => {
      const pool = pools.get(w.digits.length);
      return {page: w.page, digits: pool[Math.floor(rng() * pool.length)]};
    });
    const stats = edgeStats(control);
    const strata = [
      ...stratifiedEdgeStats(control, false),
      ...stratifiedEdgeStats(control, true)
    ];
    for (let k = 0; k < 4; k++) {
      stratifiedMean[k] += strata[k].rate / samples;
      stratifiedMinimum[k] = Math.min(stratifiedMinimum[k], strata[k].rate);
      if (strata[k].rate <= obsStratified[k].rate) stratifiedLeOriginal[k]++;
    }
    for (let k = 0; k < 4; k++) {
      const x = stats[k].rate;
      mean[k] += x / samples;
      minimum[k] = Math.min(minimum[k], x);
      maximum[k] = Math.max(maximum[k], x);
      if (x <= obs[k].rate) leOriginal[k]++;
    }
    if (t === 0) {
      // Complete 12,956-rune encrypt/decrypt positive control.
      for (const reverse of [false, true]) {
        const cipher = control.map((w) => ({
          page: w.page,
          digits: transformWord(w.digits, 3301n, false, reverse)
        }));
        assert.deepEqual(edgeStats(cipher)[reverse ? 0 : 2], stats[reverse ? 0 : 2]);
        assert.deepEqual(edgeStats(cipher)[reverse ? 1 : 3], stats[reverse ? 1 : 3]);
        assert.deepEqual(stratifiedEdgeStats(cipher, false)[reverse ? 0 : 1],
          strata[reverse ? 0 : 1]);
        assert.deepEqual(stratifiedEdgeStats(cipher, true)[reverse ? 0 : 1],
          strata[reverse ? 2 : 3]);
        for (let j = 0; j < control.length; j++) {
          assert.deepEqual(transformWord(cipher[j].digits, 3301n, true, reverse),
            control[j].digits);
        }
      }
    }
  }
  assert(leOriginal.every((n) => n === 0));
  assert(stratifiedLeOriginal.every((n) => n === 0));
  summaries.push({name, referenceWords: reference.length,
    nativeMean: mean, nativeMinimum: minimum, nativeMaximum: maximum,
    leOriginal, stratifiedMean, stratifiedMinimum, stratifiedLeOriginal,
    samples});
}
const raw = indexOfCoincidence(original.map((w) => w.digits));
const direct = [];
for (const reverse of [false, true]) for (const divide of [true, false]) {
  const transformed = original.map((w) =>
    transformWord(w.digits, 3301n, divide, reverse));
  direct.push({leastSignificantFirst: reverse, divide3301: divide,
    indexOfCoincidence: indexOfCoincidence(transformed)});
}
const outcome = {original: obs, originalStratified: obsStratified,
  rawRuneIoC: raw, direct, summaries};
process.stdout.write(JSON.stringify(outcome, null, 2) + "\n");
