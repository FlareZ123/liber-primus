"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json")).rows.flat();
const pages = transcription.split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const translit = corpus.translit;
const AL = 31;
const K = AL % 29;
function mod29(value) { return ((value % 29) + 29) % 29; }
function nthPrime(ordinal) {
  let count = 0;
  for (let candidate = 2; ; candidate += 1) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor += 1) {
      if (candidate % divisor === 0) { prime = false; break; }
    }
    if (prime && ++count === ordinal) return candidate;
  }
}
function p56T(value) { return mod29(nthPrime(value) - 1); }
function H3Inverse(shell) {
  assert.equal(shell.length, 3);
  const inverseTwo = 15;
  const [difference, center, sum] = shell;
  return [
    mod29((difference + sum) * inverseTwo),
    center,
    mod29((sum - difference) * inverseTwo),
  ];
}
function parseWords(pageText) {
  const words = [];
  let current = [];
  for (const character of [...pageText]) {
    const value = runeIndex.get(character);
    if (value !== undefined) current.push(value);
    else if (character === "/" || /\s/u.test(character)) { /* printed wrap */ }
    else { if (current.length) words.push(current); current = []; }
  }
  if (current.length) words.push(current);
  return words;
}
function isRune(character) { return runeIndex.get(character) !== undefined; }
function lineStats(pageText) {
  return pageText.split("\n").filter((line) => line.length).map((line, index) => {
    const runeCount = [...line].filter(isRune).length;
    const chunkCount = line.split(/[-.\/\s]+/u)
      .filter((chunk) => [...chunk].some(isRune)).length;
    return {index, runeCount, chunkCount};
  });
}
function indexOfText(pageText) {
  return [...pageText].filter(isRune).map((character) => runeIndex.get(character));
}
function ioc(values) {
  const frequencies = Array(29).fill(0);
  for (const value of values) frequencies[value] += 1;
  const n = values.length;
  return frequencies.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}
function decode(pageText, key, wordReset) {
  let phase = 0;
  let bypass = 0;
  const values = [];
  let output = "";
  for (const character of [...pageText]) {
    const value = runeIndex.get(character);
    if (value === undefined) {
      output += character;
      if (wordReset && (character === "-" || character === ".")) phase = 0;
      continue;
    }
    if (value === 0) {
      output += translit[0];
      values.push(0);
      bypass += 1;
      continue;
    }
    const plain = mod29(value - key[phase % key.length]);
    output += translit[plain];
    values.push(plain);
    phase += 1;
  }
  const words = output.match(/[A-Z]+/g) || [];
  const targets = new Set(["PATH", "WAY", "ITS", "ARE", "MAP", "AND", "YOU"]);
  return {
    output, values, bypass, keyAdvances: phase, ioc: ioc(values),
    targetHits: words.filter((word) => targets.has(word)),
  };
}
assert.ok(pages.length > 32);
const p31 = pages[31], p32 = pages[32], p33 = pages[33];
assert.equal(K, 2);
const stats = lineStats(p31);
const selectedPairs = [];
for (let upper = 0; upper < stats.length; upper += 1) {
  for (let lower = upper + 1; lower < stats.length; lower += 1) {
    const a = stats[upper], b = stats[lower];
    if (a.chunkCount === b.chunkCount && a.runeCount - b.runeCount === K) {
      selectedPairs.push({upper, lower, upperStats: a, lowerStats: b});
    }
  }
}
assert.equal(selectedPairs.length, 1);
const pair = selectedPairs[0];
assert.deepEqual(
  [pair.upper, pair.lower, pair.upperStats.chunkCount, pair.lowerStats.runeCount, pair.upperStats.runeCount],
  [0, 6, 5, 21, 23]
);
const helperPacket = [pair.lowerStats.chunkCount, pair.lowerStats.runeCount, pair.upperStats.runeCount];
assert.deepEqual(helperPacket, [5, 21, 23]);
const shell = helperPacket.map(p56T);
assert.deepEqual(shell, [10, 14, 24]);
const key = H3Inverse(shell);
assert.deepEqual(key, [17, 14, 7]);
assert.equal(grid[AL], "2D");
assert.equal(Number.parseInt(grid[AL], 16), 45);
assert.equal(String.fromCharCode(45), "-");
const p31Words = parseWords(p31), p33Words = parseWords(p33);
assert.deepEqual(p31Words[31], [12, 23, 1]);
assert.deepEqual(p33Words[28], [14, 17, 8]);
assert.deepEqual(p31Words[31].map((value, i) => mod29(value - key[i])), [24, 9, 23]);
assert.deepEqual(p33Words[28].map((value, i) => mod29(value - key[i])), [26, 3, 1]);
const p32Runes = indexOfText(p32);
assert.equal(p32Runes.length, 121);
assert.equal(p32Runes.filter((value) => value === 0).length, 4);
const originalIoc = ioc(p32Runes);
const continuous = decode(p32, key, false);
const wordReset = decode(p32, key, true);
assert.equal(continuous.bypass, 4);
assert.equal(wordReset.bypass, 4);
assert.equal(continuous.keyAdvances, 117);
assert.equal(wordReset.keyAdvances, 117);
assert.deepEqual(continuous.targetHits, []);
assert.deepEqual(wordReset.targetHits, []);
console.log(JSON.stringify({
  sourceInputs: {
    corpus: "resources/liber-primus/lp2-corpus.json",
    transcription: "resources/liber-primus/lp2-transcription.txt",
    p50Grid: "resources/liber-primus/base60-grid.json",
    physicalPages: [31, 32, 33],
  },
  keyDerivation: {
    AL, K, selectedP31Lines: [pair.upper, pair.lower],
    helperPacket, p56TShell: shell, H3InverseKey: key,
    p50Cell31: grid[AL], sign: "-",
  },
  controls: {
    p31Word32: p31Words[31],
    p31Plain: p31Words[31].map((value, i) => mod29(value - key[i])),
    p33Word29: p33Words[28],
    p33Plain: p33Words[28].map((value, i) => mod29(value - key[i])),
  },
  p32: {
    runeCount: p32Runes.length, transparentFCount: 4, originalIoC: originalIoc,
    continuous: {
      output: continuous.output, keyAdvances: continuous.keyAdvances,
      IoC: continuous.ioc, signed2016TargetWordHits: continuous.targetHits,
    },
    wordReset: {
      output: wordReset.output, keyAdvances: wordReset.keyAdvances,
      IoC: wordReset.ioc, signed2016TargetWordHits: wordReset.targetHits,
    },
  },
}, null, 2));
