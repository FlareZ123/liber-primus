"use strict";

/**
 * LP2 p3-p7 255 complete printed words -> p8 255 runes:
 * exact all-secret exclusion of a GLOBAL commutative product checksum.
 *
 * Conditional context: apply the previously frozen p7 five-red-word GP29
 * products and p50 radix59/GF4 255-state key correction to original p8.
 * Hypothesis H_i = b + a*PRODUCT_{r in word_i} w[r] (mod29),
 * for arbitrary secret w[0..28] in GF29, a!=0 and arbitrary b.
 *
 * Source original p7 directly uses multiplication of GP29 ordinal values,
 * making this a small, human-visible, source-motivated family.
 * The proof rejects all 29^29 possible hidden GP29 symbol weights, all
 * 29 additive constants and all 28 nonzero scaling factors, by checking
 * an exact necessary zero-support condition. No key search is needed.
 *
 * Windows 11 / Node20+ SFT:
 * node sims/lp2_scroll255_multiplicative_wordhash_allsecret_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), "utf8");
/** @param {number} n @returns {number} */
const mod = n => (n % 29 + 29) % 29;

const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const fragments = read("resources/liber-primus/lp2-transcription.txt").split("%");
const index = new Map(gp.runes.map((r, i) => [r, i]));
const words = [];
let current = [];
for (let page = 3; page <= 7; page++) {
  for (const ch of fragments[page]) {
    if (index.has(ch)) current.push(index.get(ch));
    else if ((ch === "-" || ch === ".") && current.length) {
      words.push(current); current = [];
    }
  }
}
if (current.length) words.push(current);
assert.equal(words.length, 255);
assert.deepEqual(words.flat(), gp.pages.slice(3, 8).flatMap(p => p.indices));
assert.equal(words.flat().length, 1145);

const redFive = [[23, 3], [22, 16, 2, 25], [5, 7, 11],
  [14, 28], [6, 28, 19]];
const redProducts = redFive.map(a => a.reduce((x, y) => mod(x * y), 1));
assert.deepEqual(redProducts, [11, 26, 8, 15, 2]);
assert.deepEqual(gp.pages[7].indices.slice(194), redFive.flat());
assert.deepEqual(ink.pages.find(p => p.page === 8).red_spans
  .map(p => [p.start, p.length]), [[0, 12]]);
assert.equal(gp.pages[8].indices.length, 255);

const radix59 = grid.alphabet.replace("f", "");
const table = grid.pages.flatMap(p => p.tokens).map(t =>
  59 * radix59.indexOf(t[0]) + radix59.indexOf(t[1]));
assert.equal(table.length, 256);
assert(table.every(t => t >= 0 && t <= 251));

/** @param {number} a @param {number} b @returns {number} */
function gf4mul(a, b) {
  let v = 0;
  for (let k = 0; k < 2; k++) {
    if ((b >>> k) & 1) v ^= a;
    a <<= 1;
    if (a & 4) a ^= 7;
  }
  return v;
}
const taps = redProducts.slice(0, 4).map(t => t % 4);
let state = [redProducts[4] % 4, 0, 0, 0];
const addresses = [];
for (let i = 0; i < 255; i++) {
  addresses.push(state.reduce((v, d) => 4 * v + d, 0));
  let next = 0;
  for (let j = 0; j < 4; j++) next ^= gf4mul(state[j], taps[j]);
  state = [state[1], state[2], state[3], next];
}
assert.deepEqual(state, [2, 0, 0, 0]);
assert.equal(new Set(addresses).size, 255);
assert(!addresses.includes(0));
const sourceP8 = gp.pages[8].indices;
const key = addresses.map(addr => table[addr]);
const H = sourceP8.map((x, i) => mod(x + key[i]));
assert.deepEqual(H.map((x, i) => mod(x - key[i])), sourceP8,
  "the original p8 source cipher roundtrips under the conditional key");
const collisions = [[47, 240], [48, 231], [235, 236], [88, 179]];
for (const [i, j] of collisions) {
  assert.deepEqual([...words[i]].sort((x, y) => x - y),
    [...words[j]].sort((x, y) => x - y));
  assert.equal(H[i], H[j]);
}
assert.deepEqual(collisions.map(([i]) => H[i]), [20, 8, 2, 9]);

// Proof independent of ALL hidden symbol weights and scaling constants:
// If any secret w[r]=0, EVERY source word containing r outputs b.
// Conversely, a word can output b under a!=0 only if it contains some
// zero-weight symbol. Each of the 29 genuine GP symbols appears in words
// whose corrected outputs have at least two distinct values. Therefore
// NO w[r] can be zero for any possible b. With all w[r]!=0 and a!=0,
// H[i] can NEVER equal b, yet each of the 29 residues 0..28 appears
// somewhere in the unmodified original corrected p8 source.
const outputHistogram = Array(29).fill(0);
for (const h of H) outputHistogram[h]++;
assert(outputHistogram.every(n => n > 0));

// Stronger, source-colored same-family gate: permit completely independent
// output codebooks for RED and BLACK source words. The 242 original BLACK
// source words alone force the identical 29-vs-28 contradiction.
const redRunePositions = new Set();
let sourceOffset = 0;
for (let page = 3; page <= 7; page++) {
  const sourceInk = ink.pages.find(p => p.page === page);
  for (const span of sourceInk?.red_spans || []) {
    for (let j = 0; j < span.length; j++)
      redRunePositions.add(sourceOffset + span.start + j);
  }
  sourceOffset += gp.pages[page].indices.length;
}
const redWordIds = [], blackWordIds = [];
let cursor = 0;
words.forEach((w, i) => {
  const fullyRed = w.every((_, j) => redRunePositions.has(cursor + j));
  const fullyBlack = w.every((_, j) => !redRunePositions.has(cursor + j));
  assert(fullyRed || fullyBlack, "source red and black words unmixed");
  (fullyRed ? redWordIds : blackWordIds).push(i);
  cursor += w.length;
});
assert.deepEqual([redWordIds.length, blackWordIds.length], [13, 242]);
assert.equal(new Set(blackWordIds.map(i => H[i])).size, 29);
const distinctBlackPerRune = Array.from({ length: 29 }, (_, r) =>
  new Set(blackWordIds.filter(i => words[i].includes(r)).map(i => H[i])).size);
assert.equal(Math.min(...distinctBlackPerRune), 16);

const distinctPerRune = [];
const witnesses = [];
for (let r = 0; r < 29; r++) {
  const ids = words.flatMap((word, i) => word.includes(r) ? [i] : []);
  const observed = [...new Set(ids.map(i => H[i]))];
  assert(observed.length >= 2, "every symbol contradicts a zero multiplier");
  const second = ids.find(i => H[i] !== H[ids[0]]);
  assert(second !== undefined);
  distinctPerRune.push(observed.length);
  witnesses.push({ rune: gp.translit[r],
    wordIndices: [ids[0], second],
    correctedValues: [H[ids[0]], H[second]] });
}
assert.equal(Math.min(...distinctPerRune), 16);
assert.equal(Math.max(...distinctPerRune), 26);

const exclusions = [];
for (let b = 0; b < 29; b++) {
  const eligibleZeroWeights = [];
  for (let r = 0; r < 29; r++) {
    const allOutputsAreB = words.every((word, i) =>
      !word.includes(r) || H[i] === b);
    if (allOutputsAreB) eligibleZeroWeights.push(r);
  }
  assert.equal(eligibleZeroWeights.length, 0,
    "no GP symbol may have zero weight for any additive offset");
  const zeroOutputWitness = H.findIndex(v => v === b);
  assert(zeroOutputWitness >= 0, "each b occurs on original corrected p8");
  exclusions.push({ b, witness: zeroOutputWitness });
}

/**
 * @param {number[]} word
 * @param {number[]} weights
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function hash(word, weights, a, b) {
  return mod(b + a * word.reduce((v, r) => mod(v * weights[r]), 1));
}
const weights = Array.from({ length: 29 }, (_, i) =>
  1 + (11 * i + i * i + 7) % 28);
const a = 19, b = 13;
const planted = words.map(w => hash(w, weights, a, b));
const ciphertextPlant = planted.map((v, i) => mod(v - key[i]));
assert.deepEqual(ciphertextPlant.map((v, i) => mod(v + key[i])),
  planted, "full 255-output reversible product-cipher plant");
assert(planted.every(x => x !== b), "nonzero-weight plant excludes b");
const zeroWeights = weights.slice();
zeroWeights[12] = 0;
const plantedWithZero = words.map(w => hash(w, zeroWeights, a, b));
assert(plantedWithZero.every((x, i) =>
  words[i].includes(12) ? x === b : x !== b),
  "per-rune zero marker implications have an exact source-word plant");
assert(plantedWithZero.some(x => x === b));

console.log(JSON.stringify({
  status: "all-secret global commutative product-wordhash exclusion; no original plaintext",
  sourceRunes: 1145,
  originalScrollWords: words.length,
  originalP8Runes: H.length,
  conditionalSourceP7Products: redProducts,
  conditionalP50Radix: 59,
  numberOfOutputResidues: outputHistogram.filter(n => n > 0).length,
  allOutputResidueCounts: outputHistogram,
  distinctOutputsPerSourceRune: distinctPerRune,
  minimumDistinctOutputsForAnySourceRune: Math.min(...distinctPerRune),
  sourceRedWords: redWordIds.length,
  sourceBlackWords: blackWordIds.length,
  blackOnlyDistinctOutputs: new Set(blackWordIds.map(i => H[i])).size,
  blackOnlyMinDistinctOutputPerRune: Math.min(...distinctBlackPerRune),
  zeroWeightContradictionWitnesses: witnesses,
  exhaustiveAffineOffsetProof: exclusions,
  arbitrarySecretWeightCount: weights.length,
  positiveNonzeroWeightPlantRoundtrip: true,
  positiveZeroWeightPlant: true
}, null, 2));
