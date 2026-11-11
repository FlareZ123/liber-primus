"use strict";

/**
 * All-secret multiplier gate for an original-cipher GP-prime plaintext-feedback model.
 *
 * Source-motivated candidate, not an authenticated Cicada operation:
 *   C[w,j] = P[w,j] + K[w,j] (mod 29)
 *   K[w,j+1] = K[w,j] + a * GPprime(P[w,j]) (mod 29)
 * where a is ANY nonzero residue modulo 29 and the starting state is
 * arbitrary for each word. Other reset policies cannot change within-word
 * doublet events. For j>0:
 *   C[w,j] = C[w,j-1]
 *       iff P[w,j] - P[w,j-1] + a * GPprime(P[w,j-1]) = 0 mod29.
 *
 * The gate checks all 28 secret multipliers without guessing keys and
 * compares complete 2,896-word windows of three source-GP English controls.
 * Native source words are transliterated identically to established LP2 SFTs.
 *
 * Run with Node.js 22, from any working directory:
 *   node sims/lp2_prime_plain_feedback_allmultiplier_sft.cjs
 *
 * This test is conditional on unchanged GP29 word boundaries and English-
 * like plaintext. It is not a language-independent impossibility proof.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(ROOT, relative), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const source = parseSharedCorpus();
const glyphIndex = new Map(gp.runes.map((r, i) => [r, i]));
const tokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
const N = 29, WINDOW_WORDS = 2896;
const mod = x => ((x % N) + N) % N;
const inverse = Array(N).fill(0);
for (let p = 1; p < N; p++)
  for (let q = 1; q < N; q++)
    if (p * q % N === 1) inverse[p] = q;
assert(inverse.slice(1).every(x => x !== 0));

/** @param {string} txt @returns {number[][]} */
function nativeWords(txt) {
  const out = [];
  for (const original of txt.toUpperCase().match(/[A-Z]+/g) || []) {
    const s = original.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/[KQ]/g, "C").replace(/Z/g, "S");
    const runes = [];
    for (let i = 0; i < s.length;) {
      const token = tokens.find(t => s.startsWith(t.s, i));
      assert(token, "unmapped native GP token: " + s.slice(i));
      runes.push(token.i);
      i += token.s.length;
    }
    out.push(runes);
  }
  return out;
}

/** @param {number[]} word @returns {Int16Array} */
function candidateDoublets(word) {
  const counts = new Int16Array(N);
  for (let i = 1; i < word.length; i++) {
    const p = word[i - 1], q = word[i];
    const primeResidue = mod(gp.prime[p]);
    if (primeResidue === 0) {
      if (p === q) for (let a = 1; a < N; a++) counts[a]++;
    } else {
      const a = mod((p - q) * inverse[primeResidue]);
      if (a !== 0) counts[a]++;
    }
  }
  return counts;
}

/** @param {number[]} word @param {number} a @param {number} seed */
function encrypt(word, a, seed) {
  let k = seed;
  return word.map(p => {
    const c = mod(p + k);
    k = mod(k + a * gp.prime[p]);
    return c;
  });
}

/** @param {number[]} word @param {number} a @param {number} seed */
function decrypt(word, a, seed) {
  let k = seed;
  return word.map(c => {
    const p = mod(c - k);
    k = mod(k + a * gp.prime[p]);
    return p;
  });
}

/** @param {number[][]} words */
function doublets(words) {
  let pairs = 0, equal = 0;
  for (const word of words) {
    for (let i = 1; i < word.length; i++) {
      pairs++;
      if (word[i] === word[i - 1]) equal++;
    }
  }
  return {pairs, equal, rate: equal / pairs};
}

/** @param {number[][]} words */
function evaluateNativeControl(words) {
  const deltas = words.map(candidateDoublets);
  const full = new Int32Array(N);
  let fullPairs = 0;
  for (let i = 0; i < words.length; i++) {
    fullPairs += words[i].length - 1;
    for (let a = 1; a < N; a++) full[a] += deltas[i][a];
  }

  const active = new Int32Array(N);
  let pairs = 0;
  const add = (i, scale) => {
    pairs += scale * (words[i].length - 1);
    for (let a = 1; a < N; a++) active[a] += scale * deltas[i][a];
  };
  for (let i = 0; i < WINDOW_WORDS; i++) add(i, 1);

  let lowest = {rate: Infinity, wordOffset: -1, multiplier: 0,
    pairs: 0, hits: 0};
  let windowsAtOrBelowOriginal = 0;
  const scan = wordOffset => {
    let aBest = 0, hitsBest = Infinity;
    for (let a = 1; a < N; a++) {
      if (active[a] < hitsBest) {
        aBest = a;
        hitsBest = active[a];
      }
    }
    const rate = hitsBest / pairs;
    if (rate <= OBSERVED_RATE + 1e-12) windowsAtOrBelowOriginal++;
    if (rate < lowest.rate) {
      lowest = {rate, wordOffset, multiplier: aBest,
        pairs, hits: hitsBest};
    }
  };
  scan(0);
  for (let i = WINDOW_WORDS; i < words.length; i++) {
    add(i - WINDOW_WORDS, -1);
    add(i, 1);
    scan(i - WINDOW_WORDS + 1);
  }
  let fullBest = {multiplier: 0, hits: Infinity};
  for (let a = 1; a < N; a++)
    if (full[a] < fullBest.hits)
      fullBest = {multiplier: a, hits: full[a]};

  return {words: words.length, windows: words.length - WINDOW_WORDS + 1,
    fullBest: {...fullBest, rate: fullBest.hits / fullPairs},
    lowest, windowsAtOrBelowOriginal};
}

const original = source.words.map(w => [...w.runes].map(r => {
  const n = glyphIndex.get(r);
  assert.notEqual(n, undefined);
  return n;
}));
assert.equal(original.length, 2896);
assert.equal(source.runeCount, 12956);
assert.equal(source.crossPageWords, 32);
assert.deepEqual(original.flat(),
  gp.pages.filter(p => p.page < 56).flatMap(p => p.indices));

const originalDoublets = doublets(original);
assert.equal(originalDoublets.pairs, 10060);
assert.equal(originalDoublets.equal, 63);
const OBSERVED_RATE = originalDoublets.rate;

// Positive from Cicada's genuine 2016 signed English, with no tuned key.
const nativeSource = nativeWords(
  "LIBER PRIMUS IS THE WAY ITS WORDS ARE THE MAP " +
  "THEIR MEANING IS THE ROAD AND THEIR NUMBERS ARE THE DIRECTION");
const seed = 3301 % 29;
for (let a = 1; a < N; a++) {
  const predicted = nativeSource.reduce((sum, word) =>
    sum + candidateDoublets(word)[a], 0);
  const encoded = nativeSource.map(w => encrypt(w, a, seed));
  assert.deepEqual(encoded.map(w => decrypt(w, a, seed)), nativeSource);
  assert.equal(doublets(encoded).equal, predicted);
}
const originalDecoded = original.map(w => decrypt(w, 1, seed));
assert.deepEqual(originalDecoded.map(w => encrypt(w, 1, seed)), original);

const counts = Array(N).fill(0);
for (const x of originalDecoded.flat()) counts[x]++;
const total = originalDecoded.reduce((n, w) => n + w.length, 0);
const decodedIoC = counts.reduce((sum, count) =>
  sum + count * (count - 1), 0) / (total * (total - 1));
assert(Math.abs(decodedIoC - 0.034466589349291234) < 1e-12);

const controls = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt",
    55407, 52512, 11365, 72, 8900, 7],
  ["Emerson", "resources/control/emerson_essays_2944.txt",
    77932, 75037, 55337, 86, 9226, 7],
  ["Gibran", "resources/control/gibran_prophet_58585.txt",
    15733, 12838, 1978, 81, 8134, 7]
];
const results = [];
for (const [label, file, expectedWords, expectedWindows,
    offset, hits, pairs, multiplier] of controls) {
  const result = evaluateNativeControl(nativeWords(read(file)));
  assert.equal(result.words, expectedWords, label + " word count");
  assert.equal(result.windows, expectedWindows, label + " windows");
  assert.equal(result.windowsAtOrBelowOriginal, 0, label + " original-rate window");
  assert.equal(result.lowest.wordOffset, offset);
  assert.equal(result.lowest.hits, hits);
  assert.equal(result.lowest.pairs, pairs);
  assert.equal(result.lowest.multiplier, multiplier);
  results.push({label, ...result});
}
assert.equal(results.reduce((s, x) => s + x.windows, 0), 140387);

console.log(JSON.stringify({
  source: "LP2 original GP29 words; signed 2016 clue and original GP-prime weights",
  model: "C=P+K mod29; K_next=K+a*GPprime(P) mod29",
  scope: "all a=1..28; arbitrary per-word starting keys; all 140387 native windows",
  original: {words: original.length, runes: total, ...originalDoublets},
  directSeed: seed,
  directA1DecodedIoC: decodedIoC,
  nativeSignedPositive: "28/28 multiplier models reencrypt and recover exactly",
  nativeControls: results,
  decision: "conditional negative, no original plaintext or key recovered"
}, null, 2));
