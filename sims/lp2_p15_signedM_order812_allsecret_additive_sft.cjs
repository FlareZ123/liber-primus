"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/** @param {number} n */
function mod29(n) { return (n % 29 + 29) % 29; }

/** @param {string} rel */
function read(rel) { return fs.readFileSync(path.join(__dirname, "..", rel), "utf8"); }

/**
 * Authenticated signed p15 square, with signs from 3301-minus-prime construction.
 * Its exact GF29 order812 is independently reproduced in the p15/p39 matrix study.
 */
const M = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [-4516, -1206, 708, 1820],
].map(row => row.map(mod29));

/** Multiply a 4x4 GF29 matrix by a four-symbol vector. @param {number[][]} matrix @param {number[]} x */
function transform(matrix, x) {
  return matrix.map(row => mod29(row.reduce((s, a, i) => s + a * x[i], 0)));
}

/** @param {number[]} a @param {number} lag */
function matches(a, lag) {
  let equal = 0;
  for (let i = 0; i + lag < a.length; i++) equal += Number(a[i] === a[i + lag]);
  return equal;
}
const data = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const p40to53 = data.pages.filter(p => p.page >= 40 && p.page <= 53);
const chapter = p40to53.flatMap(p => p.indices);
assert.equal(chapter.length, 3008);
const original = chapter.slice(8); // Source-visible eight-rune p40 red heading
assert.equal(original.length, 3000);
const lag = 812;
const actual = matches(original, lag);
assert.equal(actual, 80);
const comparisons = original.length - lag;
assert.equal(comparisons, 2188);

// Reconstruct genuine GP29 English from three independently frozen text sources.
const alphabet = data.translit.map((symbol, i) => ({ symbol, i }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {string} word @returns {number[]} */
function gpWord(word) {
  const w = word.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S").replace(/Q/g, "C");
  const result = [];
  for (let i = 0; i < w.length;) {
    const token = alphabet.find(item => w.startsWith(item.symbol, i));
    if (!token) return [];
    result.push(token.i);
    i += token.symbol.length;
  }
  return result;
}
const sources = [
  ["resources/control/shakespeare_first300k.txt", 218800, 72, 110],
  ["resources/control/gibran_prophet_58585.txt", 63114, 21, 107],
  ["resources/control/emerson_essays_2944.txt", 324630, 108, 108],
];
const controls = [];
let plantNative;
for (const [file, expectedRunes, expectedWindows, expectedMinimum] of sources) {
  const gp = (read(file).match(/[A-Za-z]+/g) || []).flatMap(gpWord);
  assert.equal(gp.length, expectedRunes);
  if (file.includes("gibran_")) plantNative = gp.slice(0, 3000);
  const counts = [];
  for (let start = 0; start + 3000 <= gp.length; start += 3000) {
    counts.push(matches(gp.slice(start, start + 3000), lag));
  }
  assert.equal(counts.length, expectedWindows);
  assert.equal(Math.min(...counts), expectedMinimum);
  controls.push({ source: file, totalGP29Runes: gp.length, disjointWindows: counts.length,
    minimumMatches: Math.min(...counts), maximumMatches: Math.max(...counts),
    medianMatches: counts.slice().sort((a, b) => a - b)[Math.floor(counts.length / 2)],
    windowsNoHigherThanOriginal: counts.filter(x => x <= actual).length });
}
assert.ok(controls.every(x => x.windowsNoHigherThanOriginal === 0));

// Source-matrix positive: an arbitrary marked-p15-coordinate state is updated
// strictly once per rune. Every fixed output of M^t s must repeat after 812
// because M^812=I. This true matrix-derived additive pad is *not* fitted to C.
let state = [0, 1, 0, 0]; // red p15 matrix coordinate (1,1), zero-based
const stream = [];
for (let i = 0; i < 3000; i++) {
  stream.push(state[1]);
  state = transform(M, state);
}
for (let i = 0; i + lag < stream.length; i++)
  assert.equal(stream[i], stream[i + lag]);
const ciphertext = plantNative.map((p, i) => mod29(p + stream[i]));
const recovered = ciphertext.map((c, i) => mod29(c - stream[i]));
assert.deepEqual(recovered, plantNative);
assert.equal(matches(ciphertext, lag), matches(plantNative, lag));
assert.ok(matches(plantNative, lag) > actual);

console.log(JSON.stringify({
  hypothesis: "Any fixed output of any p15 signed-M state as a repeating GP29 additive key, with update M^t",
  originalTarget: "physical p40:8 to p53 end, source red-heading-selected 3000 GP runes",
  matrixOrder: 812,
  originalLag812: { equal: actual, comparisons, rate: actual / comparisons },
  nativeControls: controls,
  positivePlant: { from: "Gibran", sourceNativeRunes: 3000,
    keyFromAuthenticSignedMatrix: true, exactRecovered: 3000,
    plantedLag812Matches: matches(ciphertext, lag) },
  decision: "The p15 signed-M 812-period additive-clock family, regardless of hidden matrix seed or fixed output function, cannot reproduce these source-native lag812 matches; no original plaintext or key.",
}, null, 2));
