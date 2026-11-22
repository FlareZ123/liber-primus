"use strict";

/**
 * The signed 2016 EPIPHANY SEEKS p0 8+5 crib and its exact GP-prime
 * key checksum. Independent original-source counting and finite controls.
 *
 * No decrypted unknown-page plaintext or verified key is claimed.
 * Node.js 22 CommonJS; read-only and self-contained.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} file */
function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcript = read("resources/liber-primus/lp2-transcription.txt");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));

const gp = corpus.translit.map((s, i) => [s, i])
  .sort((a, b) => b[0].length - a[0].length);
const glyphIndex = new Map(corpus.runes.map((r, i) => [r, i]));

/**
 * @param {string} word
 * @returns {number[]}
 */
function gpWord(word) {
  let source = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/Q/g, "C")
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Z/g, "S")
    .replace(/ING/g, "NG")
    .replace(/IO/g, "IA")
    .replace(/[^A-Z]/g, "");
  const out = [];
  while (source.length) {
    const token = gp.find(([s]) => source.startsWith(s));
    assert(token, "Cannot GP-encode " + word);
    out.push(token[1]);
    source = source.slice(token[0].length);
  }
  return out;
}

/** @param {number[]} numbers */
function gpPrimeSum(numbers) {
  return numbers.reduce((total, n) => total + corpus.prime[n], 0);
}

/** @param {string} runicText */
function parseWords(runicText) {
  return (runicText.match(/[\u16a0-\u16ff]+/gu) || []).map((word) =>
    [...word].map((r) => {
      const v = glyphIndex.get(r);
      assert(Number.isInteger(v));
      return v;
    }));
}

const firstThree = corpus.pages.filter((p) => p.page <= 2);
assert.deepEqual(firstThree.map((p) => p.indices.length), [262, 266, 201]);
const firstThreeRunes = firstThree.reduce((sum, p) => sum + p.indices.length, 0);
assert.equal(firstThreeRunes, 729);

const p0ink = ink.pages.find((p) => p.page === 0);
const p2ink = ink.pages.find((p) => p.page === 2);
assert(p0ink.large_punctuation.some((p) => p[0] === 13 && p[1] === 13));
assert(p2ink.large_punctuation.some((p) => p[0] === 201 && p[1] === 13));

const signedBody = signed.split("-----BEGIN PGP SIGNATURE-----")[0]
  .split("\n")
  .filter((line) => !line.startsWith("-----") && !line.startsWith("Hash:"))
  .join(" ");
const signedWords = (signedBody.match(/[A-Za-z]+/g) || []).map((x) => x.toUpperCase());
assert.equal(signedWords.length, 45);
const signedEightFive = [];
for (let i = 0; i + 1 < signedWords.length; i++) {
  if (gpWord(signedWords[i]).length === 8 && gpWord(signedWords[i + 1]).length === 5) {
    signedEightFive.push({index: i, first: signedWords[i], second: signedWords[i + 1]});
  }
}
assert.deepEqual(signedEightFive,
  [{index: 5, first: "EPIPHANY", second: "SEEKS"}]);
const phrase = [...gpWord(signedWords[5]), ...gpWord(signedWords[6])];
const title = firstThree[0].indices.slice(0, 13);
assert.equal(phrase.length, title.length);
const key = title.map((v, i) => (v - phrase[i] + 29) % 29);
assert.deepEqual(key, [26,24,8,19,27,24,18,3,0,8,0,16,19]);
assert.equal(gpPrimeSum(key), 729);
assert.deepEqual(title, phrase.map((v, i) => (v + key[i]) % 29));

const originalWords = parseWords(transcript.split("%")
  .slice(0, 55).join("").replace(/\/\s*/gu, ""));
assert.equal(originalWords.length, 2896);
const matchingWindows = [];
for (let i = 0; i < originalWords.length - 1; i++) {
  if (originalWords[i].length === 8 && originalWords[i + 1].length === 5) {
    const candidate = [...originalWords[i], ...originalWords[i + 1]];
    const candidateKey = candidate.map((v, j) => (v - phrase[j] + 29) % 29);
    matchingWindows.push({wordIndex: i, keyPrimeSum: gpPrimeSum(candidateKey)});
  }
}
assert.equal(matchingWindows.length, 19);
assert.deepEqual(matchingWindows.filter((row) => row.keyPrimeSum === 729),
  [{wordIndex: 0, keyPrimeSum: 729}]);

// Exact uniform 29-symbol random-key checksum probability. BigInt counts
// avoid rounding the total 29^13 assignments.
let counts = new Map([[0, 1n]]);
for (let i = 0; i < 13; i++) {
  const next = new Map();
  for (const [sum, multiplicity] of counts) {
    for (const prime of corpus.prime) {
      const s = sum + prime;
      next.set(s, (next.get(s) || 0n) + multiplicity);
    }
  }
  counts = next;
}
const total = 29n ** 13n;
const exact = counts.get(729);
const probability = Number(exact) / Number(total);
assert(Math.abs(probability - 0.0040369883683963) < 1e-15);

const report = {
  source: {p0p2Runes: firstThreeRunes, redDotAtP0Rune: 13,
    redDotAtP2Rune: 201, enclosedBlackRunes: 716},
  signed2016: {alphabeticWords: signedWords.length,
    GP8plus5ConsecutivePairs: signedEightFive},
  hypothesizedTitleCrib: "EPIPHANY SEECS",
  originalTitle: title,
  candidateKey: key,
  candidateKeyPrimes: key.map((n) => corpus.prime[n]),
  keyPrimeSum: gpPrimeSum(key),
  originalShapeControl: {matchingWindows, exact729Matches: 1},
  uniformRandomKeyNull: {
    exactFavorableAssignments: exact.toString(),
    allAssignments: total.toString(), probability
  },
  decision: "A source-conditioned numerical checksum; no authenticated plaintext or body inverse"
};
console.log(JSON.stringify(report, null, 2));
