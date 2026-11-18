"use strict";

/**
 * Original-source p39 quadratic feedback: all GF29 word-offset keys.
 * Tests nonlinear, invertible ciphertext-history taps motivated by the
 * original p39 red triad and observed word-internal fifth-back echoes.
 * Node.js 22 CommonJS, Windows 11 compatible. Read-only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const root = path.resolve(__dirname, "..");
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const physical = gp.pages.filter(p => p.page <= 55);
const source = physical.flatMap(p => p.indices);
const runeMap = new Map(gp.runes.map((r, i) => [r, i]));
const parsed = parseSharedCorpus();
assert.equal(source.length, 12956);
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.crossPageWords, 32);
const words = [];
let offset = 0;
for (const item of parsed.words) {
  const values = [...item.runes].map(r => runeMap.get(r));
  assert(values.every(Number.isInteger));
  assert.equal(values.length, item.length);
  words.push({start: offset, length: values.length});
  offset += values.length;
}
assert.equal(offset, source.length);
const flatWords = words.flatMap(w => source.slice(w.start, w.start + w.length));
assert.deepEqual(flatWords, source);
const red = gp.pages.find(p => p.page === 39).indices.slice(119, 122);
assert.deepEqual(red, [27, 5, 15]);
/** @param {number} x @returns {number} */
const mod = x => ((x % 29) + 29) % 29;
/** @param {number} x @returns {number} */
function quadratic(x) {
  const polynomial = mod(red[0] + red[1] * x + red[2] * x * x);
  assert.equal(polynomial, mod(15 * (x - 24) * (x - 24)));
  return polynomial;
}
const lex = Array.from({length: 30}, () => new Set());
const forms = Array.from({length: 30}, () => []);
const tokens = gp.translit.map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);
/** @param {string} word @returns {number[]} */
function encode(word) {
  const s = word.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith("ING", i)) {
      out.push(21); i += 3;
    } else if (s.startsWith("IO", i)) {
      out.push(27); i += 2;
    } else {
      const match = tokens.find(t => s.startsWith(t.symbol, i));
      if (!match) return [];
      out.push(match.value); i += match.symbol.length;
    }
  }
  return out;
}
/** @param {number[]} runes @returns {string} */
function signature(runes) {
  return runes.slice(1).map(v => String.fromCharCode(
    65 + mod(v - runes[0]))).join("");
}
for (const line of read("resources/control/english_wordfreq_textblob.txt")
  .split(/\r?\n/)) {
  const match = /^([a-z]+)\s+(\d+)$/.exec(line);
  if (!match || Number(match[2]) <= 0) continue;
  const values = encode(match[1]);
  if (!values.length || values.length >= 30) continue;
  lex[values.length].add(signature(values));
  forms[values.length].push(values);
}

/**
 * Canonical word shape modulo an arbitrary nonzero GF29 multiplier and
 * arbitrary GF29 offset. Both completely vanish from this representation.
 * @param {number[]} runes @returns {string}
 */
function affineSignature(runes) {
  const first = runes[0];
  const second = runes.findIndex(v => v !== first);
  if (second < 0) return "C";
  const delta = mod(runes[second] - first);
  const inverse = Array.from({length: 29}, (_, i) => i)
    .find(i => mod(i * delta) === 1);
  return runes.map(v => String.fromCharCode(
    65 + mod((v - first) * inverse))).join("");
}
const affineLex = forms.map(items => new Set(items.map(affineSignature)));
const longWords = words.filter(w => w.length >= 5);
assert.equal(longWords.length, 1132);
for (const w of words) assert(forms[w.length].length > 0);

/**
 * Applies the inverse with an arbitrary independent additive word key.
 * Causal ciphertext taps make encryption uniquely invertible.
 * @param {number[]} cipher
 * @param {number} a
 * @param {number} b
 * @param {"word5"|"global5"} fifth
 * @param {(word: number) => number} wordKey
 * @returns {number[]}
 */
function decode(cipher, a, b, fifth, wordKey) {
  const out = new Array(cipher.length);
  for (let wi = 0; wi < words.length; wi++) {
    const w = words[wi];
    const key = wordKey(wi);
    for (let j = 0; j < w.length; j++) {
      const i = w.start + j;
      const predecessor = i ? cipher[i - 1] : 0;
      const delayed = i >= 5 && (fifth === "global5" || j >= 5)
        ? cipher[i - 5] : 0;
      out[i] = mod(cipher[i] - a * quadratic(predecessor)
        - b * quadratic(delayed) - key);
    }
  }
  return out;
}
/**
 * Forward encoder, with exactly the same emitted-ciphertext history.
 * @param {number[]} plain
 * @param {number} a
 * @param {number} b
 * @param {"word5"|"global5"} fifth
 * @param {(word: number) => number} wordKey
 * @returns {number[]}
 */
function encodeCipher(plain, a, b, fifth, wordKey) {
  const out = new Array(plain.length);
  for (let wi = 0; wi < words.length; wi++) {
    const w = words[wi];
    const key = wordKey(wi);
    for (let j = 0; j < w.length; j++) {
      const i = w.start + j;
      const predecessor = i ? out[i - 1] : 0;
      const delayed = i >= 5 && (fifth === "global5" || j >= 5)
        ? out[i - 5] : 0;
      out[i] = mod(plain[i] + a * quadratic(predecessor)
        + b * quadratic(delayed) + key);
    }
  }
  return out;
}
/**
 * A constant unknown per-word key disappears when first letter is subtracted.
 * @param {number[]} cipher
 * @param {number} a
 * @param {number} b
 * @param {"word5"|"global5"} fifth
 * @returns {{total:number,firstChapter:number,lastChapter:number}}
 */
function countAllSecret(cipher, a, b, fifth) {
  const unshifted = decode(cipher, a, b, fifth, () => 0);
  let total = 0;
  let firstChapter = 0;
  let lastChapter = 0;
  for (const w of longWords) {
    const sig = signature(unshifted.slice(w.start, w.start + w.length));
    if (!lex[w.length].has(sig)) continue;
    total++;
    if (w.start < 729) firstChapter++;
    if (w.start >= 9640 && w.start < 12648) lastChapter++;
  }
  return {total, firstChapter, lastChapter};
}

/**
 * More permissive variant: every printed word has an arbitrary nonzero
 * multiplicative key and arbitrary additive key, eliminated by affine shape.
 * @param {number[]} cipher
 * @param {number} a
 * @param {number} b
 * @param {"word5"|"global5"} fifth
 * @param {Set<number>=} matches
 * @returns {number}
 */
function countAllSecretAffine(cipher, a, b, fifth, matches) {
  const unshifted = decode(cipher, a, b, fifth, () => 0);
  let total = 0;
  for (const w of longWords) {
    const shape = affineSignature(unshifted.slice(w.start, w.start+w.length));
    if (affineLex[w.length].has(shape)) {
      total++;
      if (matches) matches.add(w.start);
    }
  }
  return total;
}
let best = -1;
const top = [];
const affineTop = [];
const allWordCoefficientMatches = new Set();
let bestAffine = -1;
let models = 0;
for (const fifth of ["global5", "word5"]) {
  for (let a = 0; a < 29; a++) {
    for (let b = 0; b < 29; b++) {
      const result = countAllSecret(source, a, b, fifth);
      const affine = countAllSecretAffine(source, a, b, fifth,
        allWordCoefficientMatches);
      if (affine > bestAffine) bestAffine = affine;
      if (affineTop.length < 5 || affine > affineTop[affineTop.length - 1].hits) {
        affineTop.push({fifth, a, b, hits: affine});
        affineTop.sort((x, y) => y.hits - x.hits || x.a - y.a);
        affineTop.length = Math.min(affineTop.length, 5);
      }
      models++;
      if (result.total > best) best = result.total;
      if (top.length < 5 || result.total > top[top.length - 1].total) {
        top.push({fifth, a, b, ...result});
        top.sort((x, y) => y.total - x.total || x.a - y.a || x.b - y.b);
        top.length = Math.min(top.length, 5);
      }
    }
  }
}
assert.equal(models, 1682);
assert.equal(best, 7);
assert.equal(bestAffine, 68);
assert.equal(countAllSecretAffine(source, 0, 0, "global5"), 44);
assert.equal(allWordCoefficientMatches.size, 644);
const lengthCounts = {};
for (const w of longWords) {
  const item = lengthCounts[w.length] || {total: 0, canMatch: 0};
  item.total++;
  if (allWordCoefficientMatches.has(w.start)) item.canMatch++;
  lengthCounts[w.length] = item;
}
assert.equal(longWords.filter(w => w.length >= 9).length, 187);
assert.equal(longWords.filter(w => w.length >= 9
  && allWordCoefficientMatches.has(w.start)).length, 0);
assert.equal(longWords.length - allWordCoefficientMatches.size, 488);
const noCipherFLong = longWords.filter(w => w.length >= 9
  && !source.slice(w.start, w.start + w.length).includes(0)).length;
assert.equal(noCipherFLong, 128);
const originalKey = wi => mod(7 * wi + 13);
const originalDirect = decode(source, 1, 1, "word5", originalKey);
assert.deepEqual(encodeCipher(originalDirect, 1, 1, "word5", originalKey), source);
const knownPlain = [];
for (let wi = 0; wi < words.length; wi++) {
  const candidates = forms[words[wi].length];
  knownPlain.push(...candidates[(wi * 19 + 7) % candidates.length]);
}
assert.equal(knownPlain.length, source.length);
const plantedCipher = encodeCipher(knownPlain, 5, 13, "word5", originalKey);
const recovered = decode(plantedCipher, 5, 13, "word5", originalKey);
assert.deepEqual(recovered, knownPlain);
assert.deepEqual(encodeCipher(recovered, 5, 13, "word5", originalKey),
  plantedCipher);
const positive = countAllSecret(plantedCipher, 5, 13, "word5");
assert.equal(positive.total, 1132);

/** @param {number} x @returns {number} */
function inverse29(x) {
  const value = Array.from({length: 29}, (_, i) => i)
    .find(i => mod(i * x) === 1);
  assert(Number.isInteger(value));
  return value;
}
/**
 * Encrypt authentic GP words under distinct wordwise multiplicative and
 * additive secrets with source-derived ciphertext-state feedback.
 * @param {number[]} plain
 * @param {number} a
 * @param {number} b
 * @param {"word5"|"global5"} fifth
 * @returns {number[]}
 */
function affineEncrypt(plain, a, b, fifth) {
  const out = new Array(plain.length);
  for (let wi = 0; wi < words.length; wi++) {
    const w = words[wi];
    const multiplier = 1 + wi % 28;
    const offset = mod(7 * wi + 13);
    const inverse = inverse29(multiplier);
    for (let j = 0; j < w.length; j++) {
      const i = w.start + j;
      const predecessor = i ? out[i - 1] : 0;
      const delayed = i >= 5 && (fifth === "global5" || j >= 5)
        ? out[i - 5] : 0;
      out[i] = mod(inverse * (plain[i] - offset)
        + a * quadratic(predecessor) + b * quadratic(delayed));
    }
  }
  return out;
}
/**
 * @param {number[]} cipher
 * @param {number} a
 * @param {number} b
 * @param {"word5"|"global5"} fifth
 * @returns {number[]}
 */
function affineDecrypt(cipher, a, b, fifth) {
  const stateRemoved = decode(cipher, a, b, fifth, () => 0);
  const out = new Array(cipher.length);
  for (let wi = 0; wi < words.length; wi++) {
    const w = words[wi];
    const multiplier = 1 + wi % 28;
    const offset = mod(7 * wi + 13);
    for (let j = 0; j < w.length; j++) {
      const i = w.start + j;
      out[i] = mod(multiplier * stateRemoved[i] + offset);
    }
  }
  return out;
}
const plantedAffine = affineEncrypt(knownPlain, 5, 13, "word5");
const recoveredAffine = affineDecrypt(plantedAffine, 5, 13, "word5");
assert.deepEqual(recoveredAffine, knownPlain);
assert.deepEqual(affineEncrypt(recoveredAffine, 5, 13, "word5"),
  plantedAffine);
const affinePositive = countAllSecretAffine(plantedAffine, 5, 13, "word5");
assert.equal(affinePositive, 1132);

console.log(JSON.stringify({
  status: "ORIGINAL GP29 nonlinear quadratic-feedback all-secret word-key gate",
  source: {runes: source.length, printedWords: words.length,
    longWords: longWords.length, redQuadratic: red},
  model: "P_i=C_i-a Q(Cprev)-b Q(C5)-Kword (mod29)",
  original: {models, maximumLongwordMatches: best, bestCandidates: top,
    exactForwardInverse: originalDirect.length,
    arbitraryPerWordAffine: {secretMultipliers: "28^2896", 
      secretOffsets: "29^2896", bestOriginalMatches: bestAffine,
      bestModels: affineTop, baselineMatches: 44,
      completelyFreeCoefficientsPerWord: {
        wordsWithAnyFit: allWordCoefficientMatches.size,
        wordsWithNoFit: longWords.length - allWordCoefficientMatches.size,
        allLongWordsNineOrMore: 187,
        nineOrMoreWithAnyFit: 0,
        nineOrMoreWithNoVisibleCipherF: noCipherFLong,
        byExactWordLength: lengthCounts}}},
  planted: {cipherRunes: recovered.length,
    dictionaryMatches: positive.total, forwardInverse: true,
    fullSecretAffine: {dictionaryMatches: affinePositive,
      exactForwardInverseRunes: recoveredAffine.length}},
  conclusion: "No original plaintext/key; scoped negative for intact GP-English"
}, null, 2));
