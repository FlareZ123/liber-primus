#!/usr/bin/env node
"use strict";
// Frozen p27 5x43 -> p55 43-interior GP-prime-mod-5 row selector.
// Run from repository root: node sims/p27_p55_primeweight_mod5_row_selector_sft.cjs
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const shakespeare = read("resources/control/shakespeare_first300k.txt");

const p27 = corpus.pages.find(p => p.page === 27);
const p55 = corpus.pages.find(p => p.page === 55);
const p27Ink = ink.pages.find(p => p.page === 27);
assert.equal(corpus.pages.length, 58);
assert.equal(p27.indices.length, 234);
assert.equal(p55.indices.length, 76);
assert.deepEqual(p27Ink.red_spans.map(x => x.length), [19]);
const body = p27.indices.slice(19);
assert.equal(body.length, 215);
assert.equal(body.length, 5 * 43);

// Recover the 43 strict interiors from the canonical printed p55 words.
// The one-rune carry fragment has no interior and is therefore excluded.
const p55Source = transcription.split("%")[54];
const printedWords = p55Source.replace(/[\/\r\n]/gu, "")
  .split(/[-.&$§,:!?]/u)
  .map(part => (part.match(/[ᚠ-᛿]+/gu) || []).join(""))
  .filter(Boolean);
assert.equal(printedWords.length, 17);
const runeToIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const interiorWords = printedWords
  .map(word => [...word].slice(1, -1).map(r => runeToIndex.get(r)))
  .filter(word => word.length);
const interior = interiorWords.flat();
const wordLengths = interiorWords.map(word => word.length);
assert.equal(interior.length, 43);
assert.deepEqual(wordLengths, [2, 4, 4, 11, 4, 2, 5, 5, 4, 1, 1]);
let pageOffset = 0;
const interiorPositions = [];
for (const word of printedWords) {
  const length = [...word].length;
  for (let j = 1; j < length - 1; j++) interiorPositions.push(pageOffset + j);
  pageOffset += length;
}
assert.equal(pageOffset, p55.indices.length);
assert.deepEqual(interior, interiorPositions.map(i => p55.indices[i]));

const mod = (n, m) => ((n % m) + m) % m;
const key = interior.map((cipherRune, j) => {
  const row = corpus.prime[cipherRune] % 5; // zero-based row 0..4
  return body[row * 43 + j];              // fixed row-major 5x43 packing
});
const plaintext = interior.map((cipherRune, j) => mod(cipherRune - key[j], 29));
const reencryption = plaintext.map((plainRune, j) => mod(plainRune + key[j], 29));
assert.deepEqual(reencryption, interior, "original-cipher forward reconstruction failed");

const translit = values => values.map(i => corpus.translit[i]).join("");
const formatWords = values => {
  let i = 0;
  return wordLengths.map(n => {
    const word = translit(values.slice(i, i + n));
    i += n;
    return word;
  }).join(" ");
};
const alphabet = corpus.translit
  .map((token, index) => ({ token: token.toLowerCase(), index }))
  .sort((a, b) => b.token.length - a.token.length);
function gpEncode(word) {
  const source = word.toLowerCase().replace(/v/g, "u").replace(/k/g, "c").replace(/z/g, "s");
  const out = [];
  for (let i = 0; i < source.length;) {
    const match = alphabet.find(x => source.startsWith(x.token, i));
    if (!match) return null;
    out.push(match.index);
    i += match.token.length;
  }
  return out;
}
const nativeWords = (shakespeare.match(/[A-Za-z]+/g) || [])
  .map(gpEncode).filter(word => word && word.length >= 2);
const split = values => {
  let i = 0;
  return wordLengths.map(n => {
    const word = values.slice(i, i + n);
    i += n;
    return word;
  });
};
function languageModel(trainingWords) {
  const pair = Array.from({ length: 29 }, () => Array(29).fill(1));
  const tri = Array.from({ length: 29 }, () =>
    Array.from({ length: 29 }, () => Array(29).fill(1)));
  const pairTotal = Array(29).fill(29);
  const triTotal = Array.from({ length: 29 }, () => Array(29).fill(29));
  for (const word of trainingWords) {
    for (let i = 1; i < word.length; i++) {
      pair[word[i - 1]][word[i]]++;
      pairTotal[word[i - 1]]++;
    }
    for (let i = 2; i < word.length; i++) {
      tri[word[i - 2]][word[i - 1]][word[i]]++;
      triTotal[word[i - 2]][word[i - 1]]++;
    }
  }
  return words => {
    let log = 0, count = 0;
    for (const word of words) {
      for (let i = 1; i < word.length; i++) {
        log += Math.log(pair[word[i - 1]][word[i]] / pairTotal[word[i - 1]]);
        count++;
      }
      for (let i = 2; i < word.length; i++) {
        log += Math.log(tri[word[i - 2]][word[i - 1]][word[i]] /
          triTotal[word[i - 2]][word[i - 1]]);
        count++;
      }
    }
    return log / count;
  };
}
const splitAt = Math.floor(nativeWords.length * 0.75);
const score = languageModel(nativeWords.slice(0, splitAt));
const heldout = nativeWords.slice(splitAt).flat();
const nativeScores = [];
for (let i = 0; i + 43 <= heldout.length; i += 5) {
  nativeScores.push(score(split(heldout.slice(i, i + 43))));
}
const mean = nativeScores.reduce((a, b) => a + b, 0) / nativeScores.length;
const sd = Math.sqrt(nativeScores.reduce((s, x) => s + (x - mean) ** 2, 0) /
  (nativeScores.length - 1));
const sorted = nativeScores.slice().sort((a, b) => a - b);
const decodedScore = score(split(plaintext));
const rawScore = score(split(interior));
const candidateZ = (decodedScore - mean) / sd;
const atOrBelow = nativeScores.filter(x => x <= decodedScore).length;

// A single one-row displacement is a wrong-source control, not a row search.
const wrongRowKey = interior.map((cipherRune, j) => {
  const row = (corpus.prime[cipherRune] + 1) % 5;
  return body[row * 43 + j];
});
const wrongRowPlain = interior.map((cipherRune, j) => mod(cipherRune - wrongRowKey[j], 29));

// Source-native positive plant: encrypt/decrypt a withheld 43-rune GP passage.
const plant = heldout.slice(0, 43);
const plantedCipher = plant.map((x, j) => mod(x + key[j], 29));
const recoveredPlant = plantedCipher.map((x, j) => mod(x - key[j], 29));
assert.deepEqual(recoveredPlant, plant, "positive-control plant failed");

// Deterministic matched random-GP control.
let randomState = 0x3301;
function random01() {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  randomState >>>= 0;
  return randomState / 0x100000000;
}
const randomControl = Array.from({ length: 43 }, () => Math.floor(random01() * 29));
const rowCounts = Array.from({ length: 5 }, (_, row) =>
  interior.filter(n => corpus.prime[n] % 5 === row).length);

const result = {
  source: {
    p27Runes: p27.indices.length, p27RedTitleRunes: 19, p27BlackBodyRunes: body.length,
    hypotheticalPacking: "five consecutive rows of 43",
    p55Runes: p55.indices.length, p55PrintedSegments: printedWords.length,
    p55InteriorRunes: interior.length, p55InteriorWordLengths: wordLengths
  },
  frozenRule: {
    row: "GP-prime-weight(p55 interior rune) mod 5 (zero-based)",
    column: "same zero-based p55 interior position",
    key: "p27BlackBody[43 * row + column]",
    operation: "P = (C - K) mod 29",
    rowCounts, keyGP: translit(key)
  },
  original: {
    ciphertextGP: formatWords(interior), plaintextCandidateGP: formatWords(plaintext),
    rawConditionalGPScore: rawScore, candidateConditionalGPScore: decodedScore,
    reencryptionExact: reencryption.every((x, i) => x === interior[i]),
    plaintextRuneHistogram: Array.from({ length: 29 }, (_, i) =>
      plaintext.filter(x => x === i).length)
  },
  controls: {
    heldoutShakespeareWindows: nativeScores.length,
    heldoutMean: mean, heldoutSd: sd, heldoutMin: sorted[0],
    heldoutMedian: sorted[Math.floor(sorted.length / 2)], heldoutMax: sorted[sorted.length - 1],
    candidateZ, controlsAtOrBelowCandidate: atOrBelow,
    gapBelowWorstNativeWindow: sorted[0] - decodedScore,
    wrongRowPlusOneScore: score(split(wrongRowPlain)),
    randomGPScore: score(split(randomControl)),
    plantedNativeGPRecoveredExactly: recoveredPlant.every((x, i) => x === plant[i]),
    plantedRuneCount: recoveredPlant.length
  },
  decision: "Reject this exact prime-weight-mod-5 row selector with direct GP29 subtraction. The 5x43 p27 packing and the 43-rune p55 interior do not thereby become a complete source-authenticated cipher."
};
process.stdout.write(JSON.stringify(result, null, 2) + "\n");
