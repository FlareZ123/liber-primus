"use strict";

/**
 * Source-exact joint singleton/doublet event and 13x13 bitmap gate.
 * Original LP2 unknown pp0-55 only, ignoring the runeless physical p50.
 * One-rune printed words are bit 0; second rune of each within-page
 * adjacent-equal runic pair is bit 1. These two choices are EXPLORATORY,
 * not an authenticated Cicada 3301 operator or claimed plaintext.
 *
 * SFT: node sims/lp2_singleton_doublet_13square_source_sft.cjs
 * Node.js >=20; CommonJS; no network, file writes or external packages.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const load = name => fs.readFileSync(path.join(root, name), "utf8");
const gp = JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const source = load("resources/liber-primus/lp2-transcription.txt");
const fragments = source.split("%").slice(0, 55);
const indexByRune = new Map(gp.runes.map((r, i) => [r, i]));

assert.equal(fragments.length, 55);
const rune = [];
const physicalPage = [];
const lineId = [];
const words = [];
let activeWord = [];

for (let fragment = 0; fragment < fragments.length; fragment++) {
  const page = fragment < 50 ? fragment : fragment + 1;
  const pageIndices = [];
  let line = 0;
  for (const char of fragments[fragment]) {
    if (indexByRune.has(char)) {
      const position = rune.length;
      rune.push(char);
      physicalPage.push(page);
      lineId.push(String(page) + ":" + line);
      pageIndices.push(indexByRune.get(char));
      activeWord.push(position);
    } else if (char === "/") {
      line++;
    } else if ("-.$&".includes(char) && activeWord.length) {
      words.push(activeWord);
      activeWord = [];
    }
  }
  // Printed line and page boundaries must not split continuous words.
  assert.deepEqual(pageIndices, gp.pages[page].indices);
}
if (activeWord.length) words.push(activeWord);

assert.equal(rune.length, 12956);
assert.equal(words.length, 2896);
const single = words.filter(w => w.length === 1).map(w => w[0]);
const doublets = [];
const eligible = [];
for (let i = 1; i < rune.length; i++) {
  if (physicalPage[i] !== physicalPage[i - 1]) continue;
  eligible.push(i);
  if (rune[i] === rune[i - 1]) doublets.push(i);
}
assert.equal(eligible.length, 12901);
assert.equal(single.length, 83);
assert.equal(doublets.length, 86);

const singleSet = new Set(single);
assert(doublets.every(i => !singleSet.has(i)));
const events = [
  ...single.map(position => ({position, bit: 0})),
  ...doublets.map(position => ({position, bit: 1}))
].sort((a, b) => a.position - b.position);
const bits = events.map(event => event.bit);
assert.equal(bits.length, 169);
const rows = Array.from({length: 13}, (_, y) =>
  bits.slice(y * 13, (y + 1) * 13).join(""));
assert.equal(rows[0], "1010010011011");
assert.equal(rows[12], "0101000101011");

function choose(n, k) {
  if (k < 0 || k > n) return 0;
  let value = 1;
  for (let i = 1; i <= k; i++) value *= (n - k + i) / i;
  return value;
}
function hypergeomTail(groups, near, actual) {
  const maxK = actual;
  let probabilities = Array(maxK + 1).fill(0);
  probabilities[0] = 1;
  let expected = 0;
  for (const indices of groups.values()) {
    const N = indices.length;
    const n = indices.filter(i => doubletSet.has(i)).length;
    if (!n) continue;
    const K = indices.filter(i => near[i]).length;
    expected += n * K / N;
    const denominator = choose(N, n);
    const p = Array(maxK + 1).fill(0).map((_, k) =>
      choose(K, k) * choose(N - K, n - k) / denominator);
    const next = Array(maxK + 1).fill(0);
    for (let total = 0; total <= maxK; total++) {
      for (let k = 0; k <= total; k++) {
        next[total] += probabilities[total - k] * p[k];
      }
    }
    probabilities = next;
  }
  return {expected, lowerTail: probabilities.reduce((a, b) => a + b, 0)};
}
const doubletSet = new Set(doublets);
const siteGroups = new Map();
for (const index of eligible) {
  const key = lineId[index];
  if (!siteGroups.has(key)) siteGroups.set(key, []);
  siteGroups.get(key).push(index);
}
const proximity = {};
for (const d of [3, 5, 7]) {
  const near = Array(rune.length).fill(false);
  for (const s of single) {
    for (let i = Math.max(0, s - d); i <= Math.min(rune.length - 1, s + d); i++) {
      near[i] = true;
    }
  }
  const actual = doublets.filter(i => near[i]).length;
  assert(actual <= 2);
  const {expected, lowerTail} = hypergeomTail(siteGroups, near, actual);
  proximity[d] = {actual, expected: +expected.toFixed(6), exploratoryLowerTail: +lowerTail.toFixed(7)};
}
assert.deepEqual([3, 5, 7].map(d => proximity[d].actual), [1, 1, 2]);

function bitmapScores(input) {
  let horizontalEqual = 0;
  let verticalEqual = 0;
  let full2x2 = 0;
  for (let y = 0; y < 13; y++) {
    for (let x = 0; x < 13; x++) {
      const i = y * 13 + x;
      if (x < 12) horizontalEqual += Number(input[i] === input[i + 1]);
      if (y < 12) verticalEqual += Number(input[i] === input[i + 13]);
      if (x < 12 && y < 12) {
        full2x2 += Number(input[i] === input[i + 1] &&
          input[i] === input[i + 13] && input[i] === input[i + 14]);
      }
    }
  }
  let chronologicalRuns = 1;
  for (let i = 1; i < input.length; i++) chronologicalRuns += Number(input[i] !== input[i - 1]);
  return [horizontalEqual, verticalEqual, full2x2, chronologicalRuns];
}
const observedScores = bitmapScores(bits);
const trials = 50000;
let state = 0x33011313;
function nextRandom() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return (state >>> 0) / 4294967296;
}
const shuffled = bits.slice();
const upper = [0, 0, 0, 0];
const totals = [0, 0, 0, 0];
for (let trial = 0; trial < trials; trial++) {
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(nextRandom() * (i + 1));
    const t = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = t;
  }
  const measured = bitmapScores(shuffled);
  for (let k = 0; k < 4; k++) {
    totals[k] += measured[k];
    upper[k] += Number(measured[k] >= observedScores[k]);
  }
}
assert.deepEqual(observedScores, [67, 81, 17, 97]);
const ascii = [];
for (let i = 0; i + 7 < bits.length; i += 8) {
  ascii.push(parseInt(bits.slice(i, i + 8).join(""), 2));
}
const byteHex = ascii.map(v => v.toString(16).padStart(2, "0")).join("");
assert.equal(byteHex, "a4da85dc290402d5533e77785a93756f0aff475515");
const result = {
  evidence: "original runic ciphertext with unchanged printed boundaries",
  interpretation: "two invented event categories; not a key, plaintext, or authenticated 13x13 image",
  originalRuneCount: rune.length,
  wholeWords: words.length,
  singleRuneWords: single.length,
  originalWithinPageDoublets: doublets.length,
  jointEventCount: events.length,
  bitmapRows: rows,
  proximityByRuneDistance: proximity,
  bitmapScores: {
    fields: ["horizontal_equal", "vertical_equal", "monochrome_2x2", "chronological_runs"],
    original: observedScores,
    fixedBalanceNullMeans: totals.map(t => +(t / trials).toFixed(5)),
    oneSidedUpperTail: upper.map(t => +((t + 1) / (trials + 1)).toFixed(7)),
    shuffleTrials: trials,
    seed: "0x33011313"
  },
  first168BitsAs21BytesHex: byteHex,
  printableASCIIBytes: ascii.filter(v => v >= 32 && v <= 126).length,
  unused169thBit: bits[168]
};
console.log(JSON.stringify(result, null, 2));
