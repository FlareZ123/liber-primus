#!/usr/bin/env node
"use strict";

// Frozen test of one source-shaped p32 -> p50 navigation/key hypothesis.
// The p32 13-rune window supplies GP-prime step sizes; start at table cell 0,
// walk the 32x8 (256-cell) p50 field, read visited bytes modulo 29, and
// subtract the resulting repeating key from p14/p55. No fitted phase/key.

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const readJson = p => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const corpus = readJson("resources/liber-primus/lp2-corpus.json");
const grid = readJson("resources/liber-primus/lp2-grid-256.json");
const quadText = fs.readFileSync(path.join(root, "resources/control/duko_round27_english_quadgrams.txt"), "utf8");
const quadgrams = new Map(quadText.trim().split(/\r?\n/).map(line => {
  const [gram, count] = line.trim().split(/\s+/);
  return [gram, Number(count)];
}));
const mod = (x, m) => ((x % m) + m) % m;
const page = n => corpus.pages.find(p => p.page === n);
const runeText = indices => indices.map(i => corpus.translit[i]).join("");
const letterText = indices => runeText(indices).replace(/[^A-Z]/g, "");

const p32 = page(32);
const p32Window = p32.indices.slice(25, 38);
const p32Steps = p32Window.map(i => corpus.prime[i]);
const tableBytes = grid.pages.flatMap(p => p.bytes);
assert.equal(corpus.runes.length, 29);
assert.equal(p32Window.length, 13);
assert.deepEqual(p32Window.map(i => corpus.translit[i]),
  ["IA", "R", "T", "TH", "F", "F", "O", "TH", "H", "O", "M", "E", "X"]);
assert.equal(p32Steps.reduce((a, b) => a + b, 0), 413);
assert.equal(tableBytes.length, 256);

function walk(start) {
  let position = start;
  const positions = [];
  const values = [];
  const key = [];
  for (const step of p32Steps) {
    position = mod(position + step, 256);
    positions.push(position);
    values.push(tableBytes[position]);
    key.push(mod(tableBytes[position], 29));
  }
  return {positions, values, key, end: position};
}
function decrypt(indices, key) {
  return indices.map((value, i) => mod(value - key[i % key.length], 29));
}
function ioc(indices) {
  const counts = Array(29).fill(0);
  for (const value of indices) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (indices.length * (indices.length - 1));
}
function quadgramScore(indices) {
  const text = letterText(indices);
  let score = 0;
  for (let i = 0; i <= text.length - 4; i++) {
    score += Math.log(quadgrams.get(text.slice(i, i + 4)) || 1);
  }
  return score / (text.length - 3);
}
function rankForPage(pageNumber) {
  const ciphertext = page(pageNumber).indices;
  const candidates = Array.from({length: 256}, (_, start) => {
    const route = walk(start);
    const plaintext = decrypt(ciphertext, route.key);
    return {
      start,
      score: quadgramScore(plaintext),
      ioc: ioc(plaintext),
      plaintext: letterText(plaintext)
    };
  }).sort((a, b) => b.score - a.score);
  const source = candidates.find(row => row.start === 0);
  return {source, rank: candidates.findIndex(row => row.start === 0) + 1, top: candidates.slice(0, 5)};
}

const route = walk(0);
assert.deepEqual(route.positions, [107, 118, 177, 182, 184, 186, 193, 198, 221, 228, 43, 110, 157]);
assert.deepEqual(route.values, [218, 35, 131, 167, 128, 19, 155, 105, 52, 144, 73, 32, 251]);
assert.deepEqual(route.key, [15, 6, 15, 22, 12, 19, 10, 18, 23, 28, 15, 3, 19]);

const p14 = rankForPage(14);
const p55 = rankForPage(55);
const p55CipherScore = quadgramScore(page(55).indices);
const p57ClearScore = quadgramScore(page(57).indices);

assert.equal(p14.rank, 190);
assert.equal(p55.rank, 39);
assert(Math.abs(p55.source.ioc - 0.04666666666666667) < 1e-12);
assert(Math.abs(p55.source.score - 1.6122953249761574) < 1e-10);
assert(Math.abs(p14.source.score - 1.1331666403889271) < 1e-10);
assert(Math.abs(p55CipherScore - 1.5098714209424364) < 1e-10);
assert(Math.abs(p57ClearScore - 5.809845216985552) < 1e-10);

console.log(JSON.stringify({
  hypothesis: "p32 prime steps -> p50 table walk from cell 0 -> table bytes mod 29 -> subtract repeating key",
  p32Window: runeText(p32Window),
  p32Steps,
  route,
  p14: {sourceStartRank: p14.rank, sourceScore: p14.source.score, sourceIoC: p14.source.ioc},
  p55: {sourceStartRank: p55.rank, sourceScore: p55.source.score, sourceIoC: p55.source.ioc, plaintext: p55.source.plaintext},
  controls: {p55CipherScore, p57ClearScore},
  p55TopStarts: p55.top.map(({start, score}) => ({start, score}))
}, null, 2));
