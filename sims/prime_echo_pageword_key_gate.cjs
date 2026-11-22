#!/usr/bin/env node
"use strict";

// Bounded source-first test of the 2013 prime_echo 10-column page/word
// hypothesis. Extract p17..p45 first-line fourth words as a 140-rune path,
// then test only the obvious source-linked consumers: the historical 2014
// period-seven inverse, a keyword substitution alphabet, and GP29 Vigenere
// on the prime_echo endpoint page p46.
//
// Run from repository root: node sims/prime_echo_pageword_key_gate.cjs

const fs = require("node:fs");
const assert = require("node:assert/strict");
const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8"));
const printed = fs.readFileSync("resources/lp2-transcription.txt", "utf8").split("%");
assert.equal(corpus.pages.length, 58);
assert.equal(printed.length, 57); // p50 is the numeric table, with no rune text.

function fourthWordOnFirstLine(page) {
  const line = (printed[page] ?? "").replace(/\r/g, "").trimStart().split("\n")[0] ?? "";
  const words = line.split(/[-.&$§,:!?]/u)
    .map(piece => (piece.match(/[ᚠ-᛿]+/gu) || []).join(""))
    .filter(Boolean);
  return words[3] ?? "";
}
const pages = Array.from({ length: 29 }, (_, i) => 17 + i);
const words = pages.map(fourthWordOnFirstLine);
assert.equal(words.length, 29);
assert(words.every(Boolean));
const key = words.flatMap(word => [...word].map(r => corpus.runes.indexOf(r)));
assert(key.every(i => i >= 0 && i < 29));
assert.equal(key.length, 140); // 20 exact seven-symbol blocks.
const wordLengths = words.map(word => [...word].length);
assert.deepEqual(wordLengths, [4,2,4,3,8,6,5,5,5,4,1,5,4,4,5,11,6,4,3,2,4,4,3,4,4,9,8,11,2]);

const endpoint = corpus.pages.find(p => p.page === 46);
assert(endpoint);
const target = endpoint.indices;
assert.equal(target.length, 270);

function mod(n, m) { return ((n % m) + m) % m; }
function decode(indices) { return indices.map(i => corpus.translit[i]).join(""); }
function ioc(indices) {
  const counts = Array(29).fill(0);
  for (const x of indices) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (indices.length * (indices.length - 1));
}
function period7(input, positions) {
  assert.equal(input.length % 7, 0);
  const out = [];
  for (let start = 0; start < input.length; start += 7) {
    for (const pos of positions) out.push(input[start + pos]);
  }
  return out;
}

// Historical 2014 positive control: this exact inverse recovers the archived
// 56-character note and round-trips under the forward permutation.
const oldCipher = "TLBEIEOVUTHTREIDTSEOSTPOSOYRSLBTIIIYT4DGUQIMNU442I15339M";
const oldPlain = "TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133";
const period7Inverse = [0,6,2,5,1,4,3];
const period7Forward = [0,4,2,6,5,3,1];
assert.equal(period7(oldCipher, period7Inverse).join(""), oldPlain);
assert.equal(period7(period7(oldCipher, period7Inverse), period7Forward).join(""), oldCipher);

const inverse7 = period7(key, period7Inverse);
const forward7 = period7(key, period7Forward);

// Standard keyword alphabet: first occurrence of each GP symbol in the
// selected 140-rune path. The path contains all 29 symbols.
const keyedAlphabet = [...new Set(key)];
assert.equal(keyedAlphabet.length, 29);
const monoDecode = target.map(x => keyedAlphabet.indexOf(x));
const monoOpposite = target.map(x => keyedAlphabet[x]);

// Standard repeating-key GP29 additive/Beaufort orientations, with the
// selected 140-rune stream as key and p46 as the endpoint target.
const vigenereMinus = target.map((x, i) => mod(x - key[i % key.length], 29));
const vigenerePlus = target.map((x, i) => mod(x + key[i % key.length], 29));

const result = {
  selection: {
    primeOrdinals: [174,184,194,204,214,224,234,244,254,264,274,284,294,304,314,324,334,344,354,364,374,384,394,404,414,424,434,444,454],
    pages,
    printedWordIndex: 3,
    words: words.map((word, i) => ({ page: pages[i], word })),
    wordLengths,
    keyRuneCount: key.length,
    keyDistinctSymbols: keyedAlphabet.length,
    keyedAlphabet: decode(keyedAlphabet),
    pathIoC: ioc(key)
  },
  2014PositiveControl: { cipher: oldCipher, plaintext: period7(oldCipher, period7Inverse).join(""), exact: true },
  periodSevenOnPath: {
    inversePositions: period7Inverse,
    forwardPositions: period7Forward,
    inversePrefix: decode(inverse7).slice(0, 70),
    forwardPrefix: decode(forward7).slice(0, 70),
    inverseIoC: ioc(inverse7),
    forwardIoC: ioc(forward7)
  },
  p46Endpoint: {
    runeCount: target.length,
    rawIoC: ioc(target),
    keywordSubstitution: {
      inversePrefix: decode(monoDecode).slice(0, 70),
      oppositePrefix: decode(monoOpposite).slice(0, 70),
      inverseIoC: ioc(monoDecode),
      oppositeIoC: ioc(monoOpposite)
    },
    repeatingKey: {
      minusPrefix: decode(vigenereMinus).slice(0, 70),
      plusPrefix: decode(vigenerePlus).slice(0, 70),
      minusIoC: ioc(vigenereMinus),
      plusIoC: ioc(vigenerePlus)
    }
  }
};
console.log(JSON.stringify(result, null, 2));
