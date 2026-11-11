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
const dictionary = new Set();
const nativeReferences = [];
for (const [label, file, expectedWords, expectedWindows,
    offset, hits, pairs, multiplier] of controls) {
  const words = nativeWords(read(file));
  nativeReferences.push({label, words});
  for (const word of words) dictionary.add(word.join(","));
  const result = evaluateNativeControl(words);
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


// Additional independent challenge: adding one to the GP-prime feedback
// can match the RARE-DOUBLET rate, but its full 29-bin step spectrum and
// original word candidates must also match. This is a retrospective
// mechanism comparison, not a newly authenticated author instruction.

/** @param {number[]} word @param {number} a @param {number} initial */
function plusOneEncrypt(word, a, initial) {
  let key = initial;
  return word.map(p => {
    const c = mod(p + key);
    key = mod(key + a * (gp.prime[p] + 1));
    return c;
  });
}

/** @param {number[]} word @param {number} a @param {number} initial */
function plusOneDecrypt(word, a, initial) {
  let key = initial;
  return word.map(c => {
    const p = mod(c - key);
    key = mod(key + a * (gp.prime[p] + 1));
    return p;
  });
}

const longUnknown = original.filter(w => w.length >= 5);
assert.equal(longUnknown.length, 1132);
assert.equal(longUnknown.filter(w => w.length >= 6).length, 815);

const plusOneWordMatches = [];
for (let a = 1; a < N; a++) {
  let matchedAtLeast5 = 0, matchedAtLeast6 = 0, candidateCount = 0;
  for (const word of longUnknown) {
    let matches = 0;
    for (let initial = 0; initial < N; initial++) {
      const plain = plusOneDecrypt(word, a, initial);
      if (dictionary.has(plain.join(","))) matches++;
    }
    if (matches) {
      matchedAtLeast5++;
      if (word.length >= 6) matchedAtLeast6++;
      candidateCount += matches;
    }
  }
  plusOneWordMatches.push({a, matchedAtLeast5, matchedAtLeast6,
    candidateCount});
}
assert.equal(Math.max(...plusOneWordMatches.map(x => x.matchedAtLeast5)), 3);
assert(plusOneWordMatches.every(x => x.matchedAtLeast6 === 0));

// Real solved-LP1 language is an independent positive from the
// Shakespeare/Emerson/Gibran dictionary. This tests recognition, not just
// algebraic reencryption, and varies the seed for each source word.
const lp1Text = read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split(/\r?\n/u).filter(line => {
    const s = line.trim();
    return s && !s.startsWith("#") && !s.startsWith("[") &&
      !/^[0-9a-f]{25,}$/iu.test(s) && !/^\d+[\s\d]+$/.test(s);
  }).join(" ");
const lp1Words = nativeWords(lp1Text);
assert.equal(lp1Words.length, 796);
let positiveEligible = 0, positiveDictionaryCovered = 0,
  positiveCipherCandidates = 0;
for (let i = 0; i < lp1Words.length; i++) {
  const word = lp1Words[i];
  const initial = mod(seed + 17 * i);
  const encoded = plusOneEncrypt(word, 1, initial);
  assert.deepEqual(plusOneDecrypt(encoded, 1, initial), word);
  if (word.length < 5) continue;
  positiveEligible++;
  if (dictionary.has(word.join(","))) positiveDictionaryCovered++;
  let matches = 0;
  for (let key = 0; key < N; key++)
    if (dictionary.has(plusOneDecrypt(encoded, 1, key).join(","))) matches++;
  if (matches) positiveCipherCandidates++;
}
assert.equal(positiveEligible, 249);
assert.equal(positiveDictionaryCovered, 206);
assert.equal(positiveCipherCandidates, 206);

// Key-independent within-word step spectrum:
// delta(C) = delta(P) + a * (GPprime(previous P) + 1).
const originalSteps = new Int32Array(N);
for (const word of original)
  for (let i = 1; i < word.length; i++)
    originalSteps[mod(word[i] - word[i - 1])]++;
assert.deepEqual([...originalSteps].slice(0, 5), [63,356,373,354,338]);

/** @param {number[][]} words @param {number} a */
function plusOnePredictedSteps(words, a) {
  const hist = new Int32Array(N);
  let pairs = 0;
  for (const word of words)
    for (let i = 1; i < word.length; i++) {
      hist[mod(word[i] - word[i - 1] +
        a * (gp.prime[word[i - 1]] + 1))]++;
      pairs++;
    }
  return {hist, pairs};
}

const plusOneSpectra = [];
const wantedChi = [803.711968304214, 998.3770908237242,
  1041.364920967545];
for (let index = 0; index < nativeReferences.length; index++) {
  const {label, words} = nativeReferences[index];
  let best = {a: 0, chiSquare: Infinity};
  for (let a = 1; a < N; a++) {
    const {hist, pairs} = plusOnePredictedSteps(words, a);
    const expected = Array.from(hist, n => originalDoublets.pairs * n / pairs);
    const chiSquare = expected.reduce((s, n, i) =>
      s + (originalSteps[i] - n) ** 2 / (n + 1e-9), 0);
    if (chiSquare < best.chiSquare) {
      const totalVariation = expected.reduce((s, n, i) =>
        s + Math.abs(originalSteps[i] - n), 0) /
          (2 * originalDoublets.pairs);
      best = {a, chiSquare, totalVariation,
        predictedEqualRate: hist[0] / pairs};
    }
  }
  assert.equal(best.a, 1, label + " plus-one spectrum winner");
  assert(Math.abs(best.chiSquare - wantedChi[index]) < 1e-6);
  plusOneSpectra.push({label, ...best});
}

console.log(JSON.stringify({
  source: "LP2 original GP29 words; signed 2016 clue and original GP-prime weights",
  model: "C=P+K mod29; K_next=K+a*GPprime(P) mod29",
  scope: "all a=1..28; arbitrary per-word starting keys; all 140387 native windows",
  original: {words: original.length, runes: total, ...originalDoublets},
  directSeed: seed,
  directA1DecodedIoC: decodedIoC,
  nativeSignedPositive: "28/28 multiplier models reencrypt and recover exactly",
  nativeControls: results,
  retrospectivePlusOne: {
    model: "K_next=K+a*(GPprime(P)+1) mod29; a=1..28",
    sourceDictionaryGPWordTypes: dictionary.size,
    unknownLen5Plus: 1132, unknownLen6Plus: 815,
    maxOriginalDictionaryWordsAmongAllA: 3,
    originalLen6PlusDictionaryHitsAcrossAllA: 0,
    perMultiplierWordCandidateCounts: plusOneWordMatches,
    solvedLP1Positive: {
      totalWords: lp1Words.length,
      eligibleLength5Plus: positiveEligible,
      inIndependentDictionary: positiveDictionaryCovered,
      encryptedWordsWithRecognizedSeedCandidate: positiveCipherCandidates
    },
    fullStepSpectrum: plusOneSpectra
  },
  decision: "conditional negative, no original plaintext or key recovered"
}, null, 2));
