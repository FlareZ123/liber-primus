"use strict";
/**
 * Exact C(=GP prime13) sentineled, word-delimited, 29-to-28 enumerative
 * anti-repeat coding experiment, with at most two adjacent repetitions
 * per emitted word.
 *
 * This is an exploratory source-clue candidate, NOT an authenticated LP2
 * decoder. Its byte-exact original-input negative stops the model.
 *
 * Run: node sims/lp2_c13_wordlength_28radix_enumerative_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const root = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
const parsed = parseSharedCorpus();
const original = parsed.words.map((w) => [...w.runes].map((s) => runeIndex.get(s)));
const MARKER = gp.translit.indexOf("C");
const MAX_REPEATS = 2;
assert.equal(MARKER, 5);
assert.equal(gp.prime[MARKER], 13);
assert.equal(original.length, 2896);
assert.equal(original.flat().length, 12956);

/**
 * @param {number} n
 * @param {number} k
 * @returns {bigint}
 */
function binomial(n, k) {
  if (k < 0 || k > n) return 0n;
  let v = 1n;
  for (let j = 1; j <= k; j++) v = v * BigInt(n - j + 1) / BigInt(j);
  return v;
}

/**
 * Count remaining GP29 successors with at most b adjacent repetitions.
 * At each step there are 28 nonrepeat values and one repeat value.
 * @param {number} rem
 * @param {number} b
 * @returns {bigint}
 */
function ways(rem, b) {
  if (b < 0) return 0n;
  let sum = 0n;
  for (let repeats = 0; repeats <= Math.min(rem, b); repeats++)
    sum += binomial(rem, repeats) * 28n ** BigInt(rem - repeats);
  return sum;
}

/** @param {number} n @returns {bigint} */
function shortCapacity(n) {
  assert(n >= 1);
  return 28n * ways(n - 1, MAX_REPEATS);
}

/** @param {number[]} word @returns {number} */
function adjacentRepeats(word) {
  return word.reduce((sum, x, j) => sum + Number(j > 0 && x === word[j - 1]), 0);
}

/**
 * Lexicographic rank among length-m admissible ciphertext words.
 * In short mode first symbol is any symbol but MARKER; in long mode
 * first symbol is MARKER and only the n successor runes vary.
 * @param {number[]} word
 * @param {boolean} long
 * @returns {bigint}
 */
function rankCipher(word, long) {
  const m = word.length;
  let rank = 0n;
  let budget = MAX_REPEATS;
  if (long) {
    assert.equal(word[0], MARKER);
  } else {
    assert.notEqual(word[0], MARKER);
    for (let first = 0; first < word[0]; first++)
      if (first !== MARKER) rank += ways(m - 1, budget);
  }
  for (let j = 1; j < m; j++) {
    const prev = word[j - 1], current = word[j];
    for (let candidate = 0; candidate < current; candidate++) {
      const remaining = budget - Number(candidate === prev);
      rank += ways(m - j - 1, remaining);
    }
    budget -= Number(current === prev);
    assert(budget >= 0, "admissible codeword cannot exceed two repeats");
  }
  return rank;
}

/**
 * Emit admissible ciphertext by lexicographic unranking. This is the exact
 * inverse of rankCipher and makes no heuristic decisions.
 * @param {number} m
 * @param {bigint} rank
 * @param {boolean} long
 * @returns {number[]}
 */
function unrankCipher(m, rank, long) {
  const word = [];
  let budget = MAX_REPEATS;
  if (long) {
    word.push(MARKER);
  } else {
    for (let first = 0; first < 29; first++) {
      if (first === MARKER) continue;
      const count = ways(m - 1, budget);
      if (rank >= count) rank -= count;
      else { word.push(first); break; }
    }
  }
  assert.equal(word.length, 1);
  for (let j = 1; j < m; j++) {
    const prev = word[j - 1];
    for (let next = 0; next < 29; next++) {
      const nextBudget = budget - Number(next === prev);
      const count = ways(m - j - 1, nextBudget);
      if (rank >= count) rank -= count;
      else {
        assert(nextBudget >= 0);
        word.push(next);
        budget = nextBudget;
        break;
      }
    }
    assert.equal(word.length, j + 1);
  }
  assert.equal(rank, 0n);
  assert(adjacentRepeats(word) <= MAX_REPEATS);
  return word;
}

/**
 * Convert a GP29 source word of n<=14 digits to a word-length-delimited
 * ciphertext in the sparse-repeat set. V<shortCapacity(n) uses n emitted
 * runes with first != C; larger V uses n+1 runes with C first.
 *
 * All possible n<=14 GP29 words fit, hence this is truly injective.
 * @param {number[]} plain
 * @returns {number[]}
 */
function encrypt(plain) {
  const n = plain.length;
  assert(n >= 1 && n <= 14);
  let value = 0n;
  for (const p of plain) {
    assert(Number.isInteger(p) && p >= 0 && p < 29);
    value = value * 29n + BigInt(p);
  }
  const short = shortCapacity(n);
  const extended = ways(n, MAX_REPEATS);
  assert(short + extended >= 29n ** BigInt(n));
  if (value < short) return unrankCipher(n, value, false);
  return unrankCipher(n + 1, value - short, true);
}

/**
 * Returns null if ciphertext is not in this exact reversible code.
 * In short mode plaintext length equals ciphertext length; in marked
 * mode one initial marker is shed and plaintext is one rune shorter.
 * @param {number[]} cipher
 * @returns {number[]|null}
 */
function decrypt(cipher) {
  const marked = cipher[0] === MARKER, n = cipher.length - Number(marked);
  if (n < 1 || n > 14 || adjacentRepeats(cipher) > MAX_REPEATS) return null;
  let value = rankCipher(cipher, marked);
  if (marked) value += shortCapacity(n);
  if (value >= 29n ** BigInt(n)) return null;
  const out = Array(n);
  for (let j = n - 1; j >= 0; j--) {
    out[j] = Number(value % 29n);
    value /= 29n;
  }
  assert.equal(value, 0n);
  return out;
}

const repeated = [0, 0, 0];
const firstCounts = Array(29).fill(0);
const singleton = Array(29).fill(0);
let firstWithMarker = 0, acceptedMarked = 0, rejectedMarked = 0;
const rejectedExamples = [];
const decoded = [];
for (let i = 0; i < original.length; i++) {
  const w = original[i];
  const repeats = adjacentRepeats(w);
  assert(repeats <= MAX_REPEATS);
  repeated[repeats]++;
  firstCounts[w[0]]++;
  if (w.length === 1) singleton[w[0]]++;
  const result = decrypt(w);
  if (w[0] === MARKER) {
    firstWithMarker++;
    if (result) acceptedMarked++;
    else {
      rejectedMarked++;
      if (rejectedExamples.length < 5)
        rejectedExamples.push({wordIndex:i,
          ciphertextGP:w.map((x) => gp.translit[x]).join(" "), length:w.length});
    }
  } else {
    assert(result, "Every short valid source word has a legal rank");
  }
  if (result) {
    assert.deepEqual(encrypt(result), w);
    decoded.push(result);
  }
}
assert.equal(singleton.reduce((x, y) => x + y), 83);
assert.deepEqual(singleton.map((count, i) => count ? null : i).filter((x) => x !== null), [MARKER]);
assert.deepEqual(repeated, [2834, 61, 1]);
assert.equal(firstWithMarker, 95);
assert.equal(acceptedMarked, 2);
assert.equal(rejectedMarked, 93);
assert.equal(decoded.length, 2803);
assert.deepEqual(rejectedExamples[0], {
  wordIndex:61, ciphertextGP:"C R TH IA", length:4
});

/** A full source-native GP29 control uses exactly the real printed 2,896 word lengths. */
const token = gp.translit.map((name, index) => ({name, index}))
  .sort((a, b) => b.name.length - a.name.length);
/** @param {string} raw @returns {number[]} */
function nativeWord(raw) {
  const s = raw.toUpperCase().replace(/QU/gu, "CW")
    .replace(/[KQ]/gu, "C").replace(/V/gu, "U").replace(/Z/gu, "S")
    .replace(/ING/gu, "NG").replace(/IO/gu, "IA");
  const out = [];
  for (let j = 0; j < s.length;) {
    const t = token.find((o) => s.startsWith(o.name, j));
    if (!t) return [];
    out.push(t.index);
    j += t.name.length;
  }
  return out;
}
let seed = 0x33011155;
const random = () => {
  seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
  return seed >>> 0;
};
const buckets = Array.from({length:15}, () => []);
for (const match of (read("resources/control/gibran_prophet_58585.txt").match(/[A-Za-z]+/gu) || [])) {
  const w = nativeWord(match);
  if (w.length && w.length <= 14) buckets[w.length].push(w);
}
assert.ok(buckets.slice(1).every((b) => b.length));
const nativePlant = original.map((w) => {
  const choices = buckets[w.length];
  return choices[random() % choices.length];
});
const nativeCipher = nativePlant.map(encrypt);
const nativeRecovered = nativeCipher.map(decrypt);
assert.deepEqual(nativeRecovered, nativePlant);
assert(nativeCipher.some((w) => w[0] === MARKER));
let positiveSymbols = nativePlant.flat().length, ciphertextSymbols = nativeCipher.flat().length;
assert.equal(positiveSymbols, 12956);
let randomChecks = 0, markedRandom = 0;
for (let n = 1; n <= 14; n++) {
  for (let i = 0; i < 500; i++) {
    const p = Array.from({length:n}, () => random() % 29);
    const c = encrypt(p);
    if (c[0] === MARKER) markedRandom++;
    assert.deepEqual(decrypt(c), p);
    randomChecks++;
  }
}
assert(markedRandom > 0);

const first61 = original.slice(0, 61).map(decrypt).flat();
assert.equal(first61.length, 282);
const first61Histogram = Array(29).fill(0);
for (const x of first61) first61Histogram[x]++;
const first61NormalizedIoC = 29 * first61Histogram.reduce((a, n) => a + n * (n - 1), 0) /
  (first61.length * (first61.length - 1));
assert(Math.abs(first61NormalizedIoC - 0.9990913909290529) < 1e-12);

console.log(JSON.stringify({
  status:"PASS",
  source:{originalWords:2896,originalRunes:12956,
    originalOneRuneWords:83,uniqueSingletonAbsentGlyph:"C",GPPrimeOfMarker:13,
    originalPerWordAdjacentRepeats:repeated,
    originalWordStartsC:firstWithMarker,
    fixedDecoderAcceptedMarked:acceptedMarked,
    fixedDecoderRejectedMarked:rejectedMarked,
    originalTotalWordsDecoderAccepts:decoded.length,
    originalFirst61Runes:282,
    originalFirst61NormalizedIoC:first61NormalizedIoC,
    firstRejectedExamples:rejectedExamples},
  encoder:{alphabet:29,successors:28,sourceWordLengthRange:"1..14",
    shortMode:"first ciphertext rune != C, no extra rune",
    extendedMode:"first ciphertext rune = C, exactly one extra rune",
    maxAdjacentEqualitiesPerCodeword:MAX_REPEATS,
    exactCapacityN14:{source:(29n**14n).toString(),
      short:shortCapacity(14).toString(),
      extended:ways(14,MAX_REPEATS).toString()}},
  fullNativeGPPlant:{plainRunes:positiveSymbols,
    printedWords:2896,encryptedRunes:ciphertextSymbols,
    markers:nativeCipher.filter((w) => w[0] === MARKER).length,
    exactDecryption:positiveSymbols},
  uniformGPPlant:{wordLengths:14,roundTrips:randomChecks,
    extendedMarkers:markedRandom},
  conclusion:"The complete, lossless fixed C/13-marker radix28 word-boundary decoder rejects 93 of the 95 actual C-first ciphertext words; two accepted marked words are insufficient to identify a cipher.",
  limits:"This is one particular source-motivated enumerative grammar. The C/13 clue and 2-repeat allowance do not authenticate an LP2 cipher. Alternate alphabet rotations, variable marker state, plaintext boundaries, long-secret pads and non-GP registers remain outside scope. No unknown LP2 plaintext/key/endpoint recovered."
},null,2));
