"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const parts = transcription.split(/^\s*%\s*$/m);
const runeToValue = new Map(corpus.runes.map((rune, value) => [rune, value]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {string} text @returns {{words:{start:number,end:number,values:number[]}[],total:number}} */
function parseCanonicalWords(text) {
  const words = [];
  let runes = 0;
  let start = 0;
  let current = [];
  function flush() {
    if (current.length === 0) return;
    words.push({ start, end: start + current.length, values: current });
    current = [];
  }
  for (const character of [...text]) {
    const value = runeToValue.get(character);
    if (value !== undefined) {
      if (current.length === 0) start = runes;
      current.push(value);
      runes += 1;
    } else if (character === "-" || character === ".") {
      flush();
    }
  }
  flush();
  return { words, total: runes };
}

/** @param {number} page @returns {{line:number,start:number,end:number}[]} */
function lineRanges(page) {
  let offset = 0;
  return physicalPart(page)
    .split(/\n/u)
    .filter((line) => /[\u16A0-\u16FF]/u.test(line))
    .map((line, index) => {
      const count = [...line].filter((character) => runeToValue.has(character)).length;
      const row = { line: index + 1, start: offset, end: offset + count };
      offset += count;
      return row;
    });
}

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const primes = [];
  for (let candidate = 2; primes.length < count; candidate += 1) {
    let isPrime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor += 1) {
      if (candidate % divisor === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) primes.push(candidate);
  }
  return primes;
}

const primes = firstPrimes(200);

/** @param {number} cardinal @returns {number} */
function T(cardinal) {
  return (primes[cardinal - 1] - 1) % 29;
}

/** @param {number} a @param {number} b @returns {number[]} */
function H(a, b) {
  return [mod29(a - b), mod29(a + b)];
}

/** @param {number} d @param {number} s @returns {number[]} */
function Hinv(d, s) {
  const inv2 = 15;
  return [mod29((d + s) * inv2), mod29((s - d) * inv2)];
}

/** @param {number[]} cardinals @returns {string} */
function spellCardinals(cardinals) {
  return cardinals.map(T).map((value) => corpus.translit[value]).join("");
}

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C")
    .replace(/V/g, "U")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      values.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      values.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) => normalized.startsWith(candidate.symbol, offset));
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/** @param {string} word @returns {number} */
function gp0(word) {
  return gp(word).reduce((sum, value) => sum + value, 0);
}

const sourceStart = signed2016.indexOf("Hello.");
const sourceEnd = signed2016.indexOf("-----BEGIN PGP SIGNATURE-----");
const sourceWords = signed2016
  .slice(sourceStart, sourceEnd)
  .replace(/\b7A35090F\b/g, "")
  .match(/[A-Za-z]+/g)
  .map((word) => word.toUpperCase());
assert.equal(sourceWords.length, 43);

const family = [];
for (const pageInk of ink.pages) {
  const spans = pageInk.red_spans || [];
  if (spans.length !== 2 || spans[0].start !== 0) continue;
  const lines = lineRanges(pageInk.page);
  const secondLine = lines.find((line) => line.start === spans[1].start);
  if (!secondLine) continue;
  const parsed = parseCanonicalWords(physicalPart(pageInk.page));
  const firstEnd = spans[0].length;
  const secondStart = spans[1].start;
  const secondEnd = secondStart + spans[1].length;
  const bodyLines = [secondLine.line - 1, lines.length - secondLine.line + 1];
  const bodyWords = [
    parsed.words.filter((word) => word.start >= firstEnd && word.end <= secondStart).length,
    parsed.words.filter((word) => word.start >= secondEnd).length
  ];
  const bodyRunes = [secondStart - firstEnd, parsed.total - secondEnd];
  const rises = [
    bodyLines[1] - bodyLines[0],
    bodyWords[1] - bodyWords[0],
    bodyRunes[1] - bodyRunes[0]
  ];
  family.push({
    page: pageInk.page,
    spans: spans.map(({ start, length }) => ({ start, length })),
    bodyLines,
    bodyWords,
    bodyRunes,
    rises,
    allRisesInSourceRegister: rises.every((value) => value >= 0 && value < sourceWords.length)
  });
}

assert.deepEqual(family, [
  {
    page: 3,
    spans: [{ start: 0, length: 16 }, { start: 119, length: 3 }],
    bodyLines: [6, 5],
    bodyWords: [19, 21],
    bodyRunes: [103, 95],
    rises: [-1, 2, -8],
    allRisesInSourceRegister: false
  },
  {
    page: 15,
    spans: [{ start: 0, length: 9 }, { start: 9, length: 11 }],
    bodyLines: [1, 7],
    bodyWords: [0, 32],
    bodyRunes: [0, 139],
    rises: [6, 32, 139],
    allRisesInSourceRegister: false
  },
  {
    page: 33,
    spans: [{ start: 0, length: 10 }, { start: 91, length: 8 }],
    bodyLines: [5, 6],
    bodyWords: [21, 28],
    bodyRunes: [81, 115],
    rises: [1, 7, 34],
    allRisesInSourceRegister: true
  }
]);

const p33 = family.find((row) => row.page === 33);
assert.deepEqual(p33.rises.map((index) => sourceWords[index]), ["THE", "THE", "BE"]);

const p33Words = parseCanonicalWords(physicalPart(33)).words;
const upperTitle = p33Words
  .filter((word) => word.start >= 0 && word.end <= 10)
  .map((word) => word.values.length);
const lowerTitle = p33Words
  .filter((word) => word.start >= 91 && word.end <= 99)
  .map((word) => word.values.length);
assert.deepEqual(upperTitle, [2, 8]);
assert.deepEqual(lowerTitle, [3, 5]);
assert.equal(spellCardinals([...upperTitle, ...Hinv(...upperTitle)]), "THEIR");
assert.equal(spellCardinals([...lowerTitle, ...H(...lowerTitle)]), "RISE");

assert.equal(p33.rises[2], 34);
assert.equal(sourceWords[34], "BE");

const be = gp("BE");
assert.deepEqual(be, [17, 18]);
assert.equal(gp0("BE"), 35);
assert.equal(gp0("PATHS"), 54);
const sourceRise = mod29(gp0("PATHS") - gp0("BE"));
assert.equal(sourceRise, 19);
const key = Hinv(sourceRise, 0);
assert.deepEqual(key, [24, 5]);
const predictedCipher = be.map((value, index) => mod29(value + key[index]));
assert.deepEqual(predictedCipher, [12, 23]);

const p34StateReceivers = parseCanonicalWords(physicalPart(34)).words
  .map((word, index) => ({
    word: index + 1,
    start: word.start,
    values: word.values,
    gp0: word.values.reduce((sum, value) => sum + value, 0)
  }))
  .filter((word) => word.values.length === 2 && word.gp0 === 35);

assert.deepEqual(
  p34StateReceivers.map(({ word, start, values }) => ({ word, start, values })),
  [
    { word: 3, start: 4, values: [12, 23] },
    { word: 62, start: 249, values: [28, 7] }
  ]
);
assert.equal(
  p34StateReceivers.filter((word) =>
    word.values[0] === predictedCipher[0] && word.values[1] === predictedCipher[1]
  ).length,
  1
);

console.log(JSON.stringify({
  status: "PASS",
  hiddenInstruction: "THEIR RISE",
  family,
  p33: {
    bodyCounts: { lines: p33.bodyLines, words: p33.bodyWords, runes: p33.bodyRunes },
    rises: p33.rises,
    signedLabels: p33.rises.map((index) => sourceWords[index]),
    pageHandoff: 34
  },
  p34: {
    signedTarget: sourceWords[34],
    sourceRiseToPaths: sourceRise,
    key,
    predictedCipher,
    stateReceivers: p34StateReceivers
  },
  decision:
    "THEIR RISE has a literal two-body consumer on p33. Lower-minus-upper counts are +1 line, +7 canonical words and +34 runes. P33 is the sole two-heading red-span page whose three rises all lie in the authenticated source register; indices1 and7 label THE, while rise34 selects signed/physical p34 BE before p34 ciphertext is read."
}, null, 2));
