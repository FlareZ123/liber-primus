#!/usr/bin/env node
"use strict";

/**
 * Source-locked test of 2014 square-core values as addresses into the LP2
 * p50 base60 table. It tests only two source-natural address domains:
 *   1) full 256-cell table: address = squareValue mod 256;
 *   2) source-bracketed 43-byte interval: address = squareValue mod 43.
 * The selected table byte mod 29 is then tested as a one-symbol GP29
 * additive key against the 43 strict word interiors on original p55.
 *
 * This is a bounded negative, not a recovered cipher. No phases, rotations,
 * permutations, fitted offsets, or language-model parameter fitting.
 * Run from repository root: node sims/lp2_2014_square_core_p50_index_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");
const mod = (n, m) => ((n % m) + m) % m;

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const squareText = read("resources/cicada2014-openpuff-magic-squares.txt");

const page55Words = transcription.split("%")[54].replace(/\/\s*/g, "")
  .match(/[\u16A0-\u16FF]+/gu) || [];
const wordLengths = page55Words.map(word => [...word].length);
assert.deepEqual(wordLengths, [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
const cipher = page55Words.flatMap(word => [...word].slice(1, -1))
  .map(rune => corpus.runes.indexOf(rune));
assert.equal(cipher.length, 43);
assert.deepEqual(cipher, [
  19,10,12,6,23,2,27,24,17,5,28,0,14,10,19,1,5,13,8,21,20,15,
  23,27,13,8,12,18,10,6,14,6,15,12,2,2,18,28,10,19,5,11,18
]);

const squares = squareText.trim().split(/\r?\n\s*\r?\n/).map(section =>
  section.trim().split(/\r?\n/).map(line => line.trim().split(/\s+/).map(Number)));
assert.deepEqual(squares.map(square => square.length), [5,7,5]);
for (const square of squares) assert.ok(square.every(row => row.length === square.length));
const core = squares.flatMap(square =>
  square.slice(1, -1).flatMap(row => row.slice(1, -1)));
assert.equal(core.length, 43);
assert.deepEqual(core, [
  812,934,280,620,809,620,280,934,812,
  223,14,47,293,98,232,121,114,72,23,65,270,331,270,65,23,72,114,121,232,98,293,47,14,223,
  199,130,320,245,91,245,320,130,199
]);

const tableBytes = grid.byte_rows.flat();
const tableTokens = grid.rows.flat();
assert.equal(tableBytes.length, 256);
assert.equal(tableTokens.length, 256);
assert.equal(tableTokens[83], "3D");
assert.equal(tableTokens[127], "3D");
const bracket43 = tableBytes.slice(84, 127);
assert.deepEqual(bracket43, [
  173,28,111,65,211,220,198,49,236,84,56,35,222,150,72,34,83,229,32,206,122,
  63,31,218,14,184,32,115,73,143,197,247,54,171,35,184,42,237,86,54,13,20,163
]);

const addresses256 = core.map(value => mod(value, 256));
const addresses43 = core.map(value => mod(value, 43));
assert.equal(new Set(addresses256).size, 22);
assert.equal(new Set(addresses43).size, 18);
const keys = {
  full256: addresses256.map(address => tableBytes[address] % 29),
  bracket43: addresses43.map(address => bracket43[address] % 29)
};

const tokenMap = corpus.translit.map((spelling, index) => ({
  spelling: spelling.toUpperCase(), index
})).sort((a, b) => b.spelling.length - a.spelling.length);
function encodeWord(word) {
  const normalized = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S").replace(/Q/g, "C");
  const output = [];
  for (let at = 0; at < normalized.length;) {
    const token = tokenMap.find(item => normalized.startsWith(item.spelling, at));
    if (!token) return null;
    output.push(token.index);
    at += token.spelling.length;
  }
  return output;
}
const shakespeareWords = (read("resources/control/shakespeare_first300k.txt")
  .match(/[A-Za-z]+/g) || []).map(encodeWord).filter(Boolean);
const bigrams = Array.from({length:29}, () => new Uint32Array(29));
const starts = new Uint32Array(29);
for (const word of shakespeareWords) {
  for (let i = 1; i < word.length; i++) {
    bigrams[word[i - 1]][word[i]]++;
    starts[word[i - 1]]++;
  }
}
const logProbability = bigrams.map((row, i) => Array.from(row, count =>
  Math.log((count + 0.25) / (starts[i] + 29 * 0.25))));
const interiorLengths = wordLengths.map(length => Math.max(0, length - 2));
assert.equal(interiorLengths.reduce((sum, n) => sum + n, 0), 43);
function bigramScore(data) {
  let at = 0, total = 0, pairs = 0;
  for (const length of interiorLengths) {
    const word = data.slice(at, at + length);
    for (let i = 1; i < word.length; i++) {
      total += logProbability[word[i - 1]][word[i]];
      pairs++;
    }
    at += length;
  }
  assert.equal(at, 43);
  assert.equal(pairs, 32);
  return total / pairs;
}
function ioc(data) {
  const counts = new Uint32Array(29);
  for (const value of data) counts[value]++;
  return Array.from(counts).reduce((sum, n) => sum + n * (n - 1), 0)
    / (data.length * (data.length - 1));
}
const render = data => data.map(value => corpus.translit[value]).join(".");
const renderWords = data => {
  let at = 0;
  return interiorLengths.map(length => {
    const text = data.slice(at, at + length).map(value => corpus.translit[value]).join("");
    at += length;
    return text;
  });
};
assert.ok(Math.abs(bigramScore(cipher) - (-6.341504871710818)) < 1e-8);
const results = {};
for (const [name, key] of Object.entries(keys)) {
  results[name] = {};
  for (const [sign, label] of [[-1, "subtract"], [1, "add"]]) {
    const plain = cipher.map((value, i) => mod(value + sign * key[i], 29));
    const reencrypted = plain.map((value, i) => mod(value - sign * key[i], 29));
    assert.deepEqual(reencrypted, cipher);
    results[name][label] = {
      ioc: ioc(plain),
      shakespeareBigramMean: bigramScore(plain),
      runeTokens: render(plain),
      originalWordInteriors: renderWords(plain)
    };
  }
}
assert.ok(Math.abs(results.full256.subtract.ioc - 0.048726467331118496) < 1e-12);
assert.ok(Math.abs(results.full256.subtract.shakespeareBigramMean - (-6.963677087902496)) < 1e-8);
assert.ok(Math.abs(results.full256.add.shakespeareBigramMean - (-5.571526791380391)) < 1e-8);
assert.ok(Math.abs(results.bracket43.subtract.shakespeareBigramMean - (-5.300423565615112)) < 1e-8);
assert.ok(Math.abs(results.bracket43.add.shakespeareBigramMean - (-5.755599349926186)) < 1e-8);

console.log(JSON.stringify({
  sourceCounts: {
    squareCoreValues: core.length,
    p50TableBytes: tableBytes.length,
    p50BracketBytes: bracket43.length,
    p55InteriorRunes: cipher.length,
    shakespeareEncodedWords: shakespeareWords.length,
    shakespeareEncodedRunes: shakespeareWords.flat().length
  },
  fixedAddresses: {full256: addresses256, bracket43: addresses43},
  distinctAddressCounts: {full256: new Set(addresses256).size, bracket43: new Set(addresses43).size},
  keys,
  baseline: {ioc: ioc(cipher), shakespeareBigramMean: bigramScore(cipher)},
  results
}, null, 2));
