"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const transcription = fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-transcription.txt"), "utf8");
const ink = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-p0-physical-ink-override.json"), "utf8"));

const index = new Map(corpus.runes.map((rune, i) => [rune, i]));
const gpPrime = corpus.prime;
const gpName = corpus.translit;

function parseWords() {
  const text = transcription.split("%").slice(0, 55).join("%");
  const words = [];
  let pos = 0;
  let start = 0;
  let token = [];

  function flush(separator = "") {
    if (!token.length) return;
    words.push({ start, end: pos - 1, indices: token, separator });
    token = [];
  }

  for (const ch of text) {
    if (index.has(ch)) {
      if (!token.length) start = pos;
      token.push(index.get(ch));
      pos++;
    } else if (ch !== "%" && ch !== "/" && !/\s/u.test(ch)) {
      flush(ch);
    }
  }
  flush();
  assert.equal(pos, 12956, "canonical unsolved stream length");
  assert.equal(words.length, 2896, "canonical printed-word count");
  return words;
}

function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}

function primesStartingAt(first, count) {
  const out = [];
  for (let n = first; out.length < count; n++) if (isPrime(n)) out.push(n);
  return out;
}

function powMod(base, exponent, modulus) {
  let result = 1;
  while (exponent > 0) {
    if (exponent & 1) result = (result * base) % modulus;
    base = (base * base) % modulus;
    exponent >>= 1;
  }
  return result;
}

function discreteLog(base, target, modulus) {
  let value = 1;
  for (let exponent = 0; exponent < modulus - 1; exponent++) {
    if (value === target) return exponent;
    value = (value * base) % modulus;
  }
  return null;
}

function render(indices) {
  return indices.map(i => gpName[i]).join(" ");
}

function adjacentEqualities(values) {
  let count = 0;
  for (let i = 1; i < values.length; i++) if (values[i] === values[i - 1]) count++;
  return count;
}

const pages = corpus.pages.slice(0, 3);
const chapter = pages.flatMap(page => page.indices);
assert.deepEqual(pages.map(page => page.runic_count), [262, 266, 201]);
assert.equal(chapter.length, 729);
const body = chapter.slice(13);
assert.equal(body.length, 716);
assert.deepEqual(chapter.slice(0, 13), [
  15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5
]);

// Physical-image assertion: the two red words are separate operands;
// the large marker follows the complete 8+5 heading at offset 13.
const physical = ink.physical_zero_based;
assert.deepEqual(physical.red_words.map(w => [w.start, w.length]), [[0, 8], [8, 5]]);
assert.deepEqual(physical.red_words.map(w => w.gp_indices), [
  [15, 8, 18, 3, 6, 19, 27, 0],
  [15, 26, 18, 21, 5]
]);
assert.deepEqual(physical.small_punctuation.map(p => [p.after_runes, p.kind]), [
  [8, "ordinary word divider"]
]);
assert.deepEqual(physical.large_punctuation.map(p => [p.after_runes, p.dots, p.ink]), [
  [13, 13, "red"]
]);
assert.deepEqual(physical.black_following_runes[0].gp_indices, [2, 11, 6, 25, 0, 11, 22]);
assert.equal(body[0], 2, "first black rune is TH (GP index 2)");

const words = parseWords();
const [wordA, wordB] = words;
assert.deepEqual([wordA.start, wordA.end, wordA.indices.length, wordA.separator], [0, 7, 8, "-"]);
assert.deepEqual([wordB.start, wordB.end, wordB.indices.length, wordB.separator], [8, 12, 5, "."]);

const primeSumA = wordA.indices.reduce((sum, rune) => sum + gpPrime[rune], 0);
const primeSumB = wordB.indices.reduce((sum, rune) => sum + gpPrime[rune], 0);
assert.deepEqual([primeSumA, primeSumB], [347, 315]);

// Hypothesis: treat the two visible red words as two DH public-share operands.
// The 2013 signed protocol independently supplies p=23 and g=5.
const p = 23;
const g = 5;
const A = primeSumA % p;
const B = primeSumB % p;
assert.deepEqual([A, B], [2, 16]);
assert.equal(new Set(Array.from({ length: p - 1 }, (_, i) => powMod(g, i, p))).size, p - 1);
const a = discreteLog(g, A, p);
const b = discreteLog(g, B, p);
assert.deepEqual([a, b], [2, 8]);
const sharedAB = powMod(B, a, p);
const sharedBA = powMod(A, b, p);
assert.equal(sharedAB, 3);
assert.equal(sharedBA, sharedAB);
assert.equal(wordA.indices.length - wordB.indices.length, sharedAB);
// The final rune of the second red word is C=index5; this is a check, not
// an input used to choose g (g=5 comes from the signed 2013 source).
assert.equal(wordB.indices.at(-1), g);

// Finite source-window specificity: all 2,895 adjacent printed-word pairs;
// among the 19 8|5 pairs, only the actual p0 heading yields (2,16).
let pair8x5Count = 0;
const pair8x5Matches = [];
let allPairResidueMatches = 0;
for (let i = 0; i < words.length - 1; i++) {
  const left = words[i];
  const right = words[i + 1];
  const leftResidue = left.indices.reduce((sum, rune) => sum + gpPrime[rune], 0) % p;
  const rightResidue = right.indices.reduce((sum, rune) => sum + gpPrime[rune], 0) % p;
  if (leftResidue === A && rightResidue === B) allPairResidueMatches++;
  if (left.indices.length === 8 && right.indices.length === 5) {
    pair8x5Count++;
    if (leftResidue === A && rightResidue === B) pair8x5Matches.push(i);
  }
}
assert.equal(pair8x5Count, 19);
assert.deepEqual(pair8x5Matches, [0]);
assert.equal(allPairResidueMatches, 8);

const firstBlackSentence = pages[0].indices.slice(13, 154);
assert.equal(firstBlackSentence.length, 141);
const firstBlackWord = pages[0].indices.slice(13, 19);
assert.deepEqual(firstBlackWord, [2, 11, 6, 25, 0, 11]);

// Direct, historically known GP29 consumers of K=3. These are permutations,
// so their unigram/IoC statistics cannot create a language signal.
const directMinus3 = firstBlackWord.map(c => (c - 3 + 29) % 29);
const directPlus3 = firstBlackWord.map(c => (c + 3) % 29);
const atbashThenMinus3 = firstBlackWord.map(c => (28 - c - 3 + 58) % 29);
const atbashThenPlus3 = firstBlackWord.map(c => (28 - c + 3 + 29) % 29);
assert.deepEqual(directMinus3, [28, 8, 3, 22, 26, 8]);
assert.deepEqual(atbashThenMinus3, [23, 14, 19, 0, 25, 14]);

// Natural p56 transfer: seed the solved consecutive-prime φ(p) stream at
// the DH result interpreted as the prime value p=3. Exact F-transparent
// inverse must not consume a key to create plaintext F.
const firstPrime = sharedAB;
assert.equal(firstPrime, 3);
const firstPrimeTotientKey = (firstPrime - 1) % 29;
const firstBodyCipher = body[0];
const firstBodyPlain = (firstBodyCipher - firstPrimeTotientKey + 29) % 29;
assert.deepEqual([firstPrimeTotientKey, firstBodyCipher, firstBodyPlain], [2, 2, 0]);
assert.notEqual(firstBodyCipher, 0);
assert.equal(firstBodyPlain, 0);
const legalFirstInverse = firstBodyCipher === 0 || firstBodyPlain !== 0;
assert.equal(legalFirstInverse, false, "zero legal inverse paths at the first black rune");

// Positive control for the exact p56 plaintext-F bypass semantics under the
// same p=3 prime clock. This validates the implementation, not the hypothesis.
const controlKeys = primesStartingAt(3, 900).map(prime => (prime - 1) % 29);
const literalFPositions = new Set([0, 4, 29, 88, 200, 715]);
const plant = Array.from({ length: 716 }, (_, i) => ((i * 7 + 11) % 28) + 1);
for (const i of literalFPositions) plant[i] = 0;
const encrypted = [];
const literalMask = [];
let keyClock = 0;
for (const rune of plant) {
  if (rune === 0) {
    encrypted.push(0);
    literalMask.push(true);
  } else {
    encrypted.push((rune + controlKeys[keyClock]) % 29);
    literalMask.push(false);
    keyClock++;
  }
}
const recovered = [];
keyClock = 0;
for (let i = 0; i < encrypted.length; i++) {
  if (literalMask[i]) {
    assert.equal(encrypted[i], 0);
    recovered.push(0);
  } else {
    const rune = (encrypted[i] - controlKeys[keyClock] + 29) % 29;
    assert.notEqual(rune, 0);
    recovered.push(rune);
    keyClock++;
  }
}
assert.deepEqual(recovered, plant);

// Reproduce the independently documented 2015 40-adjacent-event alternative
// only as a comparator; it is not composed with the red-only DH candidate.
const primeClock = primesStartingAt(2, chapter.length + 2);
let previousShifted = (0 - primeClock[0] + 29) % 29;
const D = [];
for (let i = 0; i < chapter.length; i++) {
  const shifted = (chapter[i] - primeClock[i + 1] + 29) % 29;
  D.push((shifted - previousShifted + 29) % 29);
  previousShifted = shifted;
}
assert.equal(adjacentEqualities(chapter), 4);
assert.equal(adjacentEqualities(D), 40);

console.log(JSON.stringify({
  classification: "source-constrained candidate; no unknown plaintext recovered",
  redWords: [render(wordA.indices), render(wordB.indices)],
  wordPrimeSums: [primeSumA, primeSumB],
  dh: { p, g, publicShares: [A, B], exponents: [a, b], sharedSecret: sharedAB },
  checks: {
    wordLengthDifference: wordA.indices.length - wordB.indices.length,
    finalRuneOfSecondWord: wordB.indices.at(-1),
    adjacentWords8x5InCorpus: pair8x5Count,
    exactRedDHMatchesAmong8x5Pairs: pair8x5Matches.length,
    allAdjacentPairsWithResidues2_16: allPairResidueMatches
  },
  directConsumers: {
    firstBlackWord: render(firstBlackWord),
    directShiftMinus3: render(directMinus3),
    directShiftPlus3: render(directPlus3),
    atbashThenMinus3: render(atbashThenMinus3),
    atbashThenPlus3: render(atbashThenPlus3),
    firstBlackSentenceRunes: firstBlackSentence.length
  },
  p56PrimeTotientStartAt3: {
    firstKey: firstPrimeTotientKey,
    firstCipher: gpName[firstBodyCipher],
    forcedPlain: gpName[firstBodyPlain],
    legal: legalFirstInverse
  },
  controls: {
    syntheticTransparentFRecovery: recovered.length,
    originalAdjacentEqualities: adjacentEqualities(chapter),
    2015PrimeDifferenceAdjacentEqualities: adjacentEqualities(D)
  }
}, null, 2));
