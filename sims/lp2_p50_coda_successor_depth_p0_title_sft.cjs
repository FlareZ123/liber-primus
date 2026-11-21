"use strict";

/**
 * Bounded p50 word-address -> successor/depth key test against the original
 * 13-rune p0 red heading.
 *
 * Run:
 *   node sims/lp2_p50_coda_successor_depth_p0_title_sft.cjs
 *
 * This is a deterministic negative-gate reproducer. It does not search
 * offsets, signs, word orders, or alternative address encodings.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const table = grid.byte_rows.flat();
assert.equal(table.length, 256);
assert(table.every((x) => Number.isInteger(x) && x >= 0 && x < 256));
assert.equal(table[32], 115);

// The 2016 coda is the exact 11+2 word suffix after the 29-word body.
// Exclude the standalone numeric footer and OpenPGP key ID.
const codaStart = signed.indexOf("Seek and");
const signatureStart = signed.indexOf("-----BEGIN PGP SIGNATURE-----");
assert(codaStart >= 0 && signatureStart > codaStart);
const codaText = signed.slice(codaStart, signatureStart)
  .replace(/\b3301\b/g, " ")
  .replace(/\b7A35090F\b/g, " ");
const codaWords = codaText.match(/[A-Za-z]+/g) || [];
const expectedCoda = [
  "Seek", "and", "you", "will", "be", "found",
  "Good", "luck", "Beware", "false", "paths", "Verify", "OpenPGP"
];
assert.deepEqual(codaWords, expectedCoda);

const runeTokens = corpus.translit
  .map((token, index) => ({ token: token.toLowerCase(), index }))
  .sort((a, b) => b.token.length - a.token.length);

function gpWord(word) {
  let remaining = String(word).toLowerCase()
    .replace(/v/g, "u")
    .replace(/k/g, "c")
    .replace(/z/g, "s");
  const values = [];
  while (remaining.length) {
    const match = runeTokens.find((x) => remaining.startsWith(x.token));
    assert(match, "Unmapped GP transliteration in word: " + word + " at " + remaining);
    values.push(match.index);
    remaining = remaining.slice(match.token.length);
  }
  return values;
}
const addresses = codaWords.map((word) =>
  gpWord(word).reduce((sum, value) => sum + value, 0)
);
assert.deepEqual(addresses, [56, 56, 30, 57, 35, 36, 35, 31, 88, 77, 54, 59, 75]);

function walkToFirstCycle(start) {
  const seen = new Map();
  let node = start;
  let step = 0;
  while (!seen.has(node)) {
    seen.set(node, step++);
    node = table[node];
  }
  return { depth: seen.get(node), entry: node };
}
const walks = addresses.map(walkToFirstCycle);
const depths = walks.map((x) => x.depth);
const entries = walks.map((x) => x.entry);
assert.deepEqual(depths, [3, 3, 3, 7, 5, 6, 5, 4, 9, 6, 5, 8, 9]);
assert.deepEqual(entries, [192, 192, 199, 115, 115, 115, 115, 199, 115, 115, 115, 76, 114]);
const elevenCycle = new Set([115, 247, 192, 0, 203, 68, 199, 47, 76, 114, 197]);
assert(entries.every((x) => elevenCycle.has(x)));

// Upstream route check: the source-selected 2016 four-word route still reaches p32.
let routeNode = 71;
const route = [];
for (let i = 0; i < 23; i += 1) {
  route.push(routeNode);
  routeNode = table[routeNode];
}
assert.equal(routeNode, 32);

const p0 = corpus.pages.find((page) => page.page === 0);
assert(p0);
const titleCipher = p0.indices.slice(0, 13);
// Original scan 17.jpg: these are the 13 red-heading runes, not the separate
// 4|5|4 marker-column packet R13.
assert.deepEqual(titleCipher, [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]);

function mod29(x) {
  return ((x % 29) + 29) % 29;
}
function subtractKey(cipher, key) {
  assert.equal(cipher.length, key.length);
  return cipher.map((value, index) => mod29(value - key[index]));
}
function runeText(values) {
  return values.map((value) => corpus.translit[value]).join(" ");
}

// Two fixed graph consumers, with no phase, rotation, permutation, or key fitting:
// (1) the immediate successor at each GP0 word address;
// (2) the number of forward pointer steps before first entering a cycle.
const successorValues = addresses.map((address) => table[address]);
const successorKey = successorValues.map((value) => value % 29);
const depthKey = depths;
assert.deepEqual(successorValues, [254, 254, 141, 118, 39, 54, 39, 133, 211, 144, 156, 69, 177]);
assert.deepEqual(successorKey, [22, 22, 25, 2, 10, 25, 10, 17, 8, 28, 11, 11, 3]);

// The solved p56 convention fixes C-K; no sign search is performed.
const successorPlain = subtractKey(titleCipher, successorKey);
const depthPlain = subtractKey(titleCipher, depthKey);
assert.deepEqual(successorPlain, [22, 15, 22, 1, 25, 23, 17, 12, 7, 27, 7, 10, 2]);
assert.deepEqual(depthPlain, [12, 5, 15, 25, 1, 13, 22, 25, 6, 20, 13, 13, 25]);

// Diagnostic native-language score, matching the repository's p32 tree SFT:
// GP29 trigrams trained on the first 2/3 of the Gibran control, evaluated on
// the held final 1/3. Short-string scores are descriptive, not p-values.
const tokensForText = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);
function gpText(text) {
  const out = [];
  for (const word of text.match(/[A-Za-z]+/gu) || []) {
    const normalized = word.toUpperCase()
      .replace(/QU/g, "CW")
      .replace(/V/g, "U")
      .replace(/[KQ]/g, "C")
      .replace(/Z/g, "S")
      .replace(/ING/g, "NG")
      .replace(/IO/g, "IA");
    for (let offset = 0; offset < normalized.length;) {
      const token = tokensForText.find((x) => normalized.startsWith(x.symbol, offset));
      if (!token) break;
      out.push(token.value);
      offset += token.symbol.length;
    }
  }
  return out;
}
const native = gpText(read("resources/control/gibran_prophet_58585.txt"));
assert(native.length > 20000);
const split = Math.floor(native.length * 2 / 3);
const train = native.slice(0, split);
const held = native.slice(split);
const trigramCounts = new Map();
for (let i = 2; i < train.length; i += 1) {
  const key = train[i - 2] * 841 + train[i - 1] * 29 + train[i];
  trigramCounts.set(key, (trigramCounts.get(key) || 0) + 1);
}
const denominator = train.length - 2 + 0.25 * 29 ** 3;
function trigramScore(values) {
  let total = 0;
  for (let i = 2; i < values.length; i += 1) {
    const key = values[i - 2] * 841 + values[i - 1] * 29 + values[i];
    total += Math.log(((trigramCounts.get(key) || 0) + 0.25) / denominator);
  }
  return total / (values.length - 2);
}
const held13 = [];
for (let i = 0; i + 13 <= held.length; i += 1) held13.push(trigramScore(held.slice(i, i + 13)));
held13.sort((a, b) => a - b);

const output = {
  status: "PASS",
  source: {
    p50: "resources/liber-primus/base60-grid.json",
    p0: "resources/liber-primus/lp2-corpus.json page 0; first 13 runes visually confirmed as the red heading on original scan 17.jpg",
    signed2016: "resources/historical/cicada2016-4gq25-outguess.asc",
    languageControl: "resources/control/gibran_prophet_58585.txt"
  },
  codaWords,
  gp0Addresses: addresses,
  successorValues,
  successorKey,
  cycleEntries: entries,
  depthKey,
  p0RedTitleCipher: titleCipher,
  successorPlain,
  successorPlainTransliteration: runeText(successorPlain),
  depthPlain,
  depthPlainTransliteration: runeText(depthPlain),
  scores: {
    ciphertext: trigramScore(titleCipher),
    successorKeyPlaintext: trigramScore(successorPlain),
    depthKeyPlaintext: trigramScore(depthPlain),
    held13WindowCount: held13.length,
    held13Minimum: held13[0],
    held13P01: held13[Math.floor(held13.length * 0.01)],
    held13Median: held13[Math.floor(held13.length * 0.5)],
    held13Maximum: held13[held13.length - 1]
  },
  upstreamP32Route: { start: 71, steps: 23, terminal: routeNode, path: route },
  decision: "Neither source-fixed 13-word-coda graph consumer yields plaintext for the 13-rune p0 red heading. The existing direct-GP0 pad is separately negative in lp2-p50-functional-graph-2016-wordmap.md. Retire this simple coda-to-title key family; do not expand it into rotations, alternate signs, GP-prime addresses, or nonlinear variants without new first-party evidence."
};
console.log(JSON.stringify(output, null, 2));
