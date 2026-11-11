#!/usr/bin/env node
"use strict";

// Source-frozen test of the 2016 signed message and p0 header as a full-book
// 43-period / 7-period key. No key fitting, phase search, or output writing.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/lp2-transcription.txt");
const signedMessage = read("resources/historical/cicada2016-4gq25-outguess.asc");
const shakespeare = read("resources/control/shakespeare_first300k.txt");

const mod = (n, m = 29) => ((n % m) + m) % m;
const prime = corpus.prime;
const translit = corpus.translit;
const tokens = translit
  .map((text, index) => ({ text, index, prime: prime[index] }))
  .sort((a, b) => b.text.length - a.text.length);

function gpEncodeLatin(word) {
  const text = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Z/g, "S");
  const out = [];
  for (let offset = 0; offset < text.length;) {
    const token = tokens.find((candidate) => text.startsWith(candidate.text, offset));
    assert(token, "Unmapped Latin character at " + offset + " in " + word);
    out.push(token.index);
    offset += token.text.length;
  }
  return out;
}

function parseLp2Words(text) {
  // The transcription's first 55 sections are the 55 rune-bearing LP2 pages;
  // physical p50 is the empty numerical-table page.
  const source = text.split("%").slice(0, 55).join("%");
  const words = [];
  let current = [];
  for (const ch of source) {
    const index = corpus.runes.indexOf(ch);
    if (index >= 0) {
      current.push(index);
      continue;
    }
    if (ch === "/" || ch === "%" || /\s/u.test(ch)) continue;
    if (current.length) {
      words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  return words;
}

function parseSignedWords(text) {
  const start = text.indexOf("-----BEGIN PGP SIGNED MESSAGE-----");
  const end = text.indexOf("-----BEGIN PGP SIGNATURE-----");
  assert(start >= 0 && end > start, "Missing clear-signed PGP envelope");
  const body = text.slice(start + "-----BEGIN PGP SIGNED MESSAGE-----".length, end);
  const clear = body.split(/\r?\n/).filter((line) => !/^Hash:/i.test(line)).join(" ");
  const matches = clear.match(/(?<![A-Za-z0-9])[A-Za-z]+(?:-[A-Za-z]+)?(?![A-Za-z0-9])/g) || [];
  return matches.map((word) => word.replace(/-/g, ""));
}

function flatten(words) {
  return words.flat();
}

function indexOfCoincidence(values) {
  const counts = new Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (values.length * (values.length - 1));
}

function transformWords(words, key, sign) {
  let position = 0;
  return words.map((word) => word.map((value) => {
    const output = mod(value + sign * key[position % key.length]);
    position++;
    return output;
  }));
}

function roundTripControl(key, sign, length, solvedPage) {
  const plaintext = Array.from({ length }, (_, i) => solvedPage[i % solvedPage.length]);
  const ciphertext = plaintext.map((value, i) => mod(value - sign * key[i % key.length]));
  const recovered = ciphertext.map((value, i) => mod(value + sign * key[i % key.length]));
  assert.deepEqual(recovered, plaintext);
  return plaintext.length;
}

const words = parseLp2Words(transcription);
const allRunes = flatten(words);
assert.equal(words.length, 2896, "Unexpected LP2 word count");
assert.equal(allRunes.length, 12956, "Unexpected LP2 rune count");
assert.deepEqual(words.slice(0, 4).map((word) => word.length), [8, 5, 4, 3],
  "p0 header must be two red words (8,5) followed by first black line (4,3)");

const redHeader = allRunes.slice(0, 13);
const firstBlackLine = allRunes.slice(13, 20);
const body43 = allRunes.slice(13);
const words43 = words.slice(2);
const body7 = allRunes.slice(20);
const words7 = words.slice(4);
assert.equal(redHeader.length, 13);
assert.deepEqual(firstBlackLine, [2, 11, 6, 25, 0, 11, 22]);
assert.equal(body43.length, 12943);
assert.equal(body43.length, 43 * 301);
assert.equal(body43.length, 7 * 43 * 43);
assert.equal(body7.length, 12936);
assert.equal(body7.length, 7 * 1848);
assert.equal(words43.length, 2894);
assert.equal(words7.length, 2892);

const signedWords = parseSignedWords(signedMessage);
assert.equal(signedWords.length, 43, "Signed message must contain 43 alphabetic words");
assert.equal(signedWords[42], "OpenPGP");
const wordPrimeSums = signedWords.map((word) =>
  gpEncodeLatin(word).reduce((sum, index) => sum + prime[index], 0));
assert.deepEqual(wordPrimeSums, [
  243, 72, 145, 224, 343, 436, 253, 72, 381, 243, 212, 84, 72, 219, 143,
  179, 175, 72, 211, 114, 319, 84, 72, 204, 215, 114, 295, 175, 72, 337,
  200, 215, 113, 196, 128, 130, 120, 102, 322, 292, 198, 217, 249
]);
const key43 = wordPrimeSums.map((sum) => mod(sum));
const ascending = wordPrimeSums.map((sum, index) => ({ sum, index }))
  .sort((a, b) => a.sum - b.sum || a.index - b.index);
const descending = ascending.slice().reverse();
const key43Ascending = ascending.map((entry) => mod(entry.sum));
const key43Descending = descending.map((entry) => mod(entry.sum));
const key7Index = firstBlackLine.slice();
const key7Prime = firstBlackLine.map((index) => prime[index]);
const key7Totient = key7Prime.map((value) => value - 1);
const key43BySevenDirections = wordPrimeSums.map((sum) => firstBlackLine[sum % 7]);

const mod43Residues = wordPrimeSums.map((sum) => sum % 43);
const mod7Residues = wordPrimeSums.map((sum) => sum % 7);
const p55Offset = corpus.pages
  .filter((page) => page.page < 55)
  .reduce((sum, page) => sum + page.indices.length, 0);
assert.equal(p55Offset, 12880);
const p57 = corpus.pages.find((page) => page.page === 57).indices;
assert.equal(p57.length, 95);

const shakespeareWords = (shakespeare.toUpperCase().match(/[A-Z]+/g) || [])
  .map(gpEncodeLatin)
  .filter((word) => word.length >= 3);
const trainingCut = Math.floor(shakespeareWords.length * 0.8);
const training = shakespeareWords.slice(0, trainingCut);
const holdout = shakespeareWords.slice(trainingCut);
const trigramCounts = new Float64Array(29 * 29 * 29);
const contextCounts = new Float64Array(29 * 29);
for (const word of training) {
  for (let i = 2; i < word.length; i++) {
    trigramCounts[(word[i - 2] * 29 + word[i - 1]) * 29 + word[i]]++;
    contextCounts[word[i - 2] * 29 + word[i - 1]]++;
  }
}
function trigramScore(candidateWords) {
  let score = 0;
  let count = 0;
  for (const word of candidateWords) {
    for (let i = 2; i < word.length; i++) {
      const context = word[i - 2] * 29 + word[i - 1];
      const trigram = context * 29 + word[i];
      score += Math.log((trigramCounts[trigram] + 0.1) /
        (contextCounts[context] + 0.1 * 29));
      count++;
    }
  }
  return { mean: score / count, trigrams: count };
}

const raw43 = { ioc: indexOfCoincidence(body43), ...trigramScore(words43) };
const raw7 = { ioc: indexOfCoincidence(body7), ...trigramScore(words7) };
const nativeHoldout = trigramScore(holdout);
const cases = [
  { name: "43-prime-sum/source-order", words: words43, key: key43 },
  { name: "43-prime-sum/ascending-number-order", words: words43, key: key43Ascending },
  { name: "43-prime-sum/descending-number-order", words: words43, key: key43Descending },
  { name: "7-first-black-line/GP-index", words: words7, key: key7Index },
  { name: "7-first-black-line/GP-prime", words: words7, key: key7Prime },
  { name: "7-first-black-line/prime-totient", words: words7, key: key7Totient },
  { name: "43-word-prime-sum-mod7/selects-first-black-rune", words: words43, key: key43BySevenDirections }
];

const results = [];
for (const test of cases) {
  for (const sign of [-1, 1]) {
    const decoded = transformWords(test.words, test.key, sign);
    const flat = flatten(decoded);
    roundTripControl(test.key, sign, flat.length, p57);
    results.push({
      test: test.name,
      direction: sign < 0 ? "C-K" : "C+K",
      ioc: indexOfCoincidence(flat),
      ...trigramScore(decoded),
      firstWords: decoded.slice(0, 12).map((word) => word.map((i) => translit[i]).join(""))
    });
  }
}

assert(nativeHoldout.mean > -2.5, "Language-model positive control is unexpectedly weak");
assert(results.every((result) => result.mean < -3.5),
  "A candidate crossed the predeclared English-register rejection threshold");

const report = {
  sourceCounts: {
    totalRunes: allRunes.length,
    totalWords: words.length,
    p0RedHeaderWords: words.slice(0, 2).map((word) => word.length),
    p0FirstBlackLineWords: words.slice(2, 4).map((word) => word.length),
    p0RedHeaderRunes: redHeader.length,
    p0FirstBlackLine: firstBlackLine,
    postRedHeaderRunes: body43.length,
    postRedHeaderShape: "43*301 = 7*43*43",
    postFirstBlackLineRunes: body7.length,
    postFirstBlackLineShape: "7*1848 = 7*(43*43-1)",
    signedMessageWords: signedWords.length,
    p55GlobalOffset: p55Offset,
    p55Phase43AfterRedHeader: mod(p55Offset - 13, 43),
    p55Phase7AfterFirstBlackLine: mod(p55Offset - 20, 7)
  },
  signedMessage: {
    words: signedWords,
    gpPrimeSums: wordPrimeSums,
    gpPrimeSumsMod29: key43,
    residuesMod43: mod43Residues,
    distinctMod43: new Set(mod43Residues).size,
    missingMod43: Array.from({ length: 43 }, (_, i) => i).filter((i) => !mod43Residues.includes(i)),
    residuesMod7: mod7Residues,
    distinctMod7: new Set(mod7Residues).size,
    missingMod7: Array.from({ length: 7 }, (_, i) => i).filter((i) => !mod7Residues.includes(i))
  },
  languageModel: {
    trainingWords: training.length,
    holdout: nativeHoldout,
    rawAfterRedHeader: raw43,
    rawAfterFirstBlackLine: raw7
  },
  results
};

console.log(JSON.stringify(report, null, 2));
