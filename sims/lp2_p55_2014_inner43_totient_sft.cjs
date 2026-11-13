#!/usr/bin/env node
"use strict";

/**
 * Source-locked direct Euler-totient key test:
 * the original 3x3/5x5/3x3 interiors of the historical 2014 5/7/5
 * magic squares, in source row-major order, supply K_i = phi(n_i) mod 29
 * for the 43 strict printed-word interiors of original LP2 physical p55.
 *
 * Test only P=C-K and P=C+K. No phase, rotation, permutation, key fitting,
 * reset, or alternate word boundary is searched. This is a bounded negative,
 * not plaintext recovery.
 *
 * From repository root:
 *   node sims/lp2_p55_2014_inner43_totient_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const squareText = read("resources/cicada2014-openpuff-magic-squares.txt");

const words = transcription.split("%")[54].replace(/\/\s*/g, "")
  .match(/[\u16A0-\u16FF]+/gu) || [];
const wordLengths = words.map(word => [...word].length);
assert.deepEqual(wordLengths, [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);

const cipher = words.flatMap(word => [...word].slice(1, -1))
  .map(rune => corpus.runes.indexOf(rune));
assert.equal(words.length, 17);
assert.equal(cipher.length, 43);
assert.ok(cipher.every(value => value >= 0 && value < 29));

const squares = squareText.trim().split(/\r?\n\s*\r?\n/).map(block =>
  block.trim().split(/\r?\n/).map(line =>
    line.trim().split(/\s+/).map(Number)
  )
);
assert.deepEqual(squares.map(square => square.length), [5,7,5]);
for (const square of squares) {
  assert.ok(square.every(row => row.length === square.length));
}
const innerValues = squares.map(square =>
  square.slice(1, -1).map(row => row.slice(1, -1))
).flat(2);
assert.equal(innerValues.length, 43);

function phi(n) {
  let remaining = n;
  let result = n;
  for (let p = 2; p * p <= remaining; p++) {
    if (remaining % p === 0) {
      while (remaining % p === 0) remaining /= p;
      result -= result / p;
    }
  }
  if (remaining > 1) result -= result / remaining;
  return result;
}
const mod = n => ((n % 29) + 29) % 29;
const key = innerValues.map(value => phi(value) % 29);
assert.deepEqual(key, [
  17,2,9,8,25,8,9,2,17,19,6,17,2,13,25,23,7,24,22,19,14,
  11,14,19,22,24,7,23,25,13,2,17,6,19,24,19,12,23,14,23,12,19,24
]);

const outputs = {
  minus: cipher.map((value, i) => mod(value - key[i])),
  plus: cipher.map((value, i) => mod(value + key[i]))
};
function forwardReplay(plaintext, sign) {
  return plaintext.map((value, i) => mod(value - sign * key[i]));
}
assert.deepEqual(forwardReplay(outputs.minus, -1), cipher);
assert.deepEqual(forwardReplay(outputs.plus, 1), cipher);

function ioc(data) {
  const counts = new Uint32Array(29);
  for (const value of data) counts[value]++;
  return Array.from(counts).reduce((sum, n) => sum + n * (n - 1), 0)
    / (data.length * (data.length - 1));
}
const gp = data => data.map(index => corpus.translit[index]).join(".");
const innerLengths = wordLengths.map(length => Math.max(0, length - 2));
assert.equal(innerLengths.reduce((sum, n) => sum + n, 0), 43);
assert.equal(innerLengths.reduce((sum, n) => sum + Math.max(0, n - 1), 0), 32);

const runeTokens = corpus.translit.map((token, index) => ({
  token: token.toUpperCase(), index
})).sort((a, b) => b.token.length - a.token.length);
function encodeWord(word) {
  const text = word.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S").replace(/Q/g, "C");
  const result = [];
  for (let at = 0; at < text.length;) {
    const match = runeTokens.find(item => text.startsWith(item.token, at));
    if (!match) return null;
    result.push(match.index);
    at += match.token.length;
  }
  return result;
}

const sourceFiles = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
];
const sources = sourceFiles.map(([name, file]) => ({
  name,
  words: (read(file).match(/[A-Za-z]+/g) || [])
    .map(encodeWord).filter(Boolean)
}));
const pairs = Array.from({length:29}, () => new Uint32Array(29));
const starts = new Uint32Array(29);
for (const word of sources[0].words) {
  for (let i = 1; i < word.length; i++) {
    pairs[word[i - 1]][word[i]]++;
    starts[word[i - 1]]++;
  }
}
const logProb = pairs.map((row, i) => Array.from(row, count =>
  Math.log((count + 0.25) / (starts[i] + 29 * 0.25))
));
function score(data) {
  assert.equal(data.length, 43);
  let offset = 0;
  let sum = 0;
  let count = 0;
  for (const length of wordLengths) {
    const size = Math.max(0, length - 2);
    const fragment = data.slice(offset, offset + size);
    offset += size;
    for (let i = 1; i < fragment.length; i++) {
      sum += logProb[fragment[i - 1]][fragment[i]];
      count++;
    }
  }
  assert.equal(offset, 43);
  assert.equal(count, 32);
  return sum / count;
}
const originalScore = score(cipher);
const decodedScores = {
  minus: score(outputs.minus),
  plus: score(outputs.plus)
};
assert.ok(Math.abs(ioc(cipher) - 62 / 1806) < 1e-12);
assert.ok(Math.abs(ioc(outputs.minus) - 66 / 1806) < 1e-12);
assert.ok(Math.abs(ioc(outputs.plus) - 60 / 1806) < 1e-12);
assert.ok(Math.abs(originalScore - (-6.341504871710818)) < 1e-10);
assert.ok(Math.abs(decodedScores.minus - (-7.003346352151339)) < 1e-10);
assert.ok(Math.abs(decodedScores.plus - (-6.252420775889551)) < 1e-10);

let seed = 0x45001114;
function random32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const controls = [];
let positivePlants = 0;
for (const source of sources) {
  const buckets = Array.from({length:32}, () => []);
  for (const word of source.words) {
    if (word.length < 32) buckets[word.length].push(word);
  }
  for (const length of wordLengths) {
    assert.ok(buckets[length].length > 0, source.name + " word-length bucket " + length);
  }
  let min = Infinity;
  let max = -Infinity;
  let total = 0;
  let atOrBelowMinus = 0;
  let atOrBelowPlus = 0;
  const trials = 20000;
  for (let trial = 0; trial < trials; trial++) {
    const plant = [];
    for (const length of wordLengths) {
      const bucket = buckets[length];
      plant.push(...bucket[random32() % bucket.length].slice(1, -1));
    }
    assert.equal(plant.length, 43);
    const value = score(plant);
    min = Math.min(min, value);
    max = Math.max(max, value);
    total += value;
    if (value <= decodedScores.minus) atOrBelowMinus++;
    if (value <= decodedScores.plus) atOrBelowPlus++;
    if (trial === 0) {
      for (const sign of [-1, 1]) {
        const encrypted = plant.map((plain, i) => mod(plain - sign * key[i]));
        const recovered = encrypted.map((cipherValue, i) =>
          mod(cipherValue + sign * key[i])
        );
        assert.deepEqual(recovered, plant);
        positivePlants++;
      }
    }
  }
  controls.push({
    source: source.name, trials, min, max, mean: total / trials,
    atOrBelowMinus, atOrBelowPlus
  });
}
assert.deepEqual(controls.map(row =>
  [row.atOrBelowMinus, row.atOrBelowPlus]
), [[0,0],[0,0],[0,0]]);
assert.ok(controls.every(row => row.min > -3.6));
assert.ok(decodedScores.minus < Math.min(...controls.map(row => row.min)));
assert.ok(decodedScores.plus < Math.min(...controls.map(row => row.min)));
assert.equal(positivePlants, 6);

console.log(JSON.stringify({
  status: "bounded original-source negative; no p55 plaintext recovered",
  source: {
    historicalSquareOrders: [5,7,5],
    innerOrders: [3,5,3],
    originalP55PrintedWordLengths: wordLengths,
    strictInteriorRunes: 43,
    withinOriginalWordBigramPairs: 32,
    keyDefinition: "K[i] = phi(original inner-square value[i]) mod 29",
    key
  },
  original: { ioc: ioc(cipher), intraWordBigramLog: originalScore },
  minus: {
    plaintextGP: gp(outputs.minus),
    ioc: ioc(outputs.minus),
    intraWordBigramLog: decodedScores.minus,
    exactForwardReplay: 43
  },
  plus: {
    plaintextGP: gp(outputs.plus),
    ioc: ioc(outputs.plus),
    intraWordBigramLog: decodedScores.plus,
    exactForwardReplay: 43
  },
  languageControls: controls,
  sourceNativePositivePlants: positivePlants + "/6 exact",
  scope: "Only the fixed original-order 3x3/5x5/3x3 square-core totient pad on p55's 43 strict word interiors, both additive signs. No phase, rotation, permutation, or reset search."
}, null, 2));
console.log("SFT PASS: exact original replay, source-native positive plants, and matched-word controls.");
