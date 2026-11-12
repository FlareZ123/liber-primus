"use strict";

/**
 * Exact LP2 pp23-26 source-five-dot Baconian keyspace enumeration.
 *
 * The original printed 16-rune red heading leaves 201 five-rune ciphertext
 * groups. Assign each GP29 rune identity one fixed unknown bit; decode every
 * five-bit group to A..Z (0..25). Six forbidden codes reduce the full
 * 2^29 search to the exact feasible source hypergraph independently of any
 * language model. Enumerate every key for printed and quintet-mirrored
 * symbols, and score each decoded passage forward/backward.
 *
 * Single runnable test: node sims/lp2_p23_26_bacon_exhaustive_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const source = [
  ["Gibran", read("resources/control/gibran_prophet_58585.txt")],
  ["Emerson", read("resources/control/emerson_essays_2944.txt")],
  ["Shakespeare", read("resources/control/shakespeare_first300k.txt")]
];
const plain = source.map(([name, s]) => ({
  name,
  letters: s.toUpperCase().replace(/[^A-Z]/g, "")
}));

/** @param {string} s @returns {number[]} */
function toIndices(s) {
  const out = new Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i) - 65;
  return out;
}

/** @returns {number[][]} Source-ordered 201x5 GP29 groups. */
function originalGroups() {
  const section = corpus.pages.slice(23, 27);
  assert.deepEqual(section.map((p) => p.page), [23, 24, 25, 26]);
  assert.deepEqual(section.map((p) => p.indices.length), [213, 270, 273, 265]);
  assert.deepEqual(section[0].indices.slice(0, 16),
    [1, 24, 7, 21, 6, 14, 23, 6, 10, 17, 10, 12, 16, 17, 10, 26]);
  const body = section.flatMap((p) => p.indices).slice(16);
  assert.equal(body.length, 1005);
  return Array.from({length: 201}, (_, i) => body.slice(i * 5, (i + 1) * 5));
}

/** @param {number[][]} groups @returns {number[][]} */
const mirrored = (groups) => groups.map((g) => [...g].reverse());

/**
 * Restrict the output to standard 26-letter Bacon codes 0..25.
 * For a 5-bit word, code>=26 iff bits 4 and 3 are both one, with either
 * bit 2 or bit 1 equal to one. This yields two hyperedges per quintet.
 *
 * @param {number[][]} groups
 * @returns {number[][]} Each of 29 rune classes' incident forbidden masks.
 */
function forbiddenEdges(groups) {
  const edges = new Set();
  for (const g of groups) {
    for (const position of [2, 3]) {
      const mask = (1 << g[0]) | (1 << g[1]) | (1 << g[position]);
      edges.add(mask);
    }
  }
  const incident = Array.from({length: 29}, () => []);
  for (const edge of edges) {
    for (let r = 0; r < 29; r++) {
      if (edge & (1 << r)) incident[r].push(edge);
    }
  }
  return {incident, distinctForbiddenEdges: edges.size};
}

/**
 * @param {string[]} documents Corpus strings with final 201-letter holdout excluded.
 * @returns {Float64Array} Smoothed canonical A..Z quadgram log frequencies.
 */
function quadgrams(documents) {
  const count = new Uint32Array(26 ** 4);
  let total = 0;
  for (const document of documents) {
    const letters = toIndices(document.slice(0, -201));
    for (let i = 0; i + 3 < letters.length; i++) {
      const key = ((letters[i] * 26 + letters[i + 1]) * 26 +
        letters[i + 2]) * 26 + letters[i + 3];
      count[key]++;
      total++;
    }
  }
  const denom = total + count.length * 0.05;
  const scores = Float64Array.from(count, (c) => Math.log((c + 0.05) / denom));
  return scores;
}

/** @param {number[]} letters @param {Float64Array} model @returns {number} */
function score(letters, model) {
  let total = 0;
  for (let i = 0; i + 3 < letters.length; i++) {
    total += model[((letters[i] * 26 + letters[i + 1]) * 26 +
      letters[i + 2]) * 26 + letters[i + 3]];
  }
  return total;
}

/** @param {number} mask @param {number[][]} groups @returns {number[]} */
function decode(mask, groups) {
  return groups.map((g) =>
    16 * ((mask >>> g[0]) & 1) + 8 * ((mask >>> g[1]) & 1) +
    4 * ((mask >>> g[2]) & 1) + 2 * ((mask >>> g[3]) & 1) +
    ((mask >>> g[4]) & 1));
}

/** @param {number[]} letters @returns {string} */
const asText = (letters) =>
  letters.map((n) => String.fromCharCode(65 + n)).join("");

/**
 * Enumerate the complete 29-bit feasible-key tree, pruning precisely when
 * an original-source forbidden hyperedge becomes all ones. Every feasible
 * mask is visited once. Each key's output is scored in both group orders.
 *
 * @param {number[][]} groups
 * @param {Float64Array} model
 */
function exhaustive(groups, model) {
  const {incident, distinctForbiddenEdges} = forbiddenEdges(groups);
  const order = Array.from({length: 29}, (_, i) => i).sort((a, b) =>
    incident[b].length - incident[a].length || a - b);
  let admissibleKeys = 0;
  let best = {score: -Infinity, mask: 0, reverse: false};
  let minOnes = 30;
  let maxOnes = -1;
  /** @param {number} depth @param {number} mask @param {number} ones */
  function dfs(depth, mask, ones) {
    if (depth === 29) {
      admissibleKeys++;
      minOnes = Math.min(minOnes, ones);
      maxOnes = Math.max(maxOnes, ones);
      const decoded = decode(mask, groups);
      for (const value of decoded) assert.ok(value >= 0 && value < 26);
      const normal = score(decoded, model);
      if (normal > best.score) best = {score: normal, mask, reverse: false};
      const reversed = score([...decoded].reverse(), model);
      if (reversed > best.score) best = {score: reversed, mask, reverse: true};
      return;
    }
    dfs(depth + 1, mask, ones);
    const symbol = order[depth];
    const bit = 1 << symbol;
    const next = mask | bit;
    for (const edge of incident[symbol]) {
      if ((next & edge) === edge) return;
    }
    dfs(depth + 1, next, ones + 1);
  }
  dfs(0, 0, 0);
  const output = decode(best.mask, groups);
  if (best.reverse) output.reverse();
  return {
    distinctForbiddenEdges,
    admissibleKeys,
    minOneBits: minOnes,
    maxOneBits: maxOnes,
    orientationsScored: admissibleKeys * 2,
    bestScore: best.score,
    bestRuneBitMask: best.mask,
    bestDecodedLetters: asText(output),
    bestIsReversed: best.reverse
  };
}

/**
 * Exact positive-control encoder with a secret static 29-symbol binary key.
 * @param {string} readable 201-letter source excerpt
 */
function positivePlant(readable) {
  const keyOnes = new Set([1, 3, 4, 9, 12, 14, 15, 16, 21, 24, 27]);
  const mask = [...keyOnes].reduce((sum, i) => sum | (1 << i), 0);
  const classes = [
    Array.from({length: 29}, (_, i) => i).filter((i) => !keyOnes.has(i)),
    Array.from(keyOnes)
  ];
  let seed = 0x3301c1ca;
  /** @returns {number} */
  function random() {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return seed >>> 0;
  }
  const groups = toIndices(readable).map((value) =>
    [16, 8, 4, 2, 1].map((place) => {
      const bucket = classes[(value & place) ? 1 : 0];
      return bucket[random() % bucket.length];
    }));
  assert.equal(groups.length, 201);
  assert.equal(asText(decode(mask, groups)), readable);
  return {groups, mask};
}

const model = quadgrams(plain.map((p) => p.letters));
const original = originalGroups();
const printed = exhaustive(original, model);
const inverted = exhaustive(mirrored(original), model);
assert.equal(printed.admissibleKeys, 90836);
assert.equal(printed.distinctForbiddenEdges, 375);
assert.equal(printed.maxOneBits, 10);
assert.equal(inverted.admissibleKeys, 73362);
assert.equal(inverted.distinctForbiddenEdges, 385);
assert.equal(inverted.maxOneBits, 10);
const heldout = plain.map(({name, letters}) => ({
  source: name,
  last201Score: score(toIndices(letters.slice(-201)), model)
}));

// Synthetic plant uses an original-length, grammatically ordinary source
// passage withheld from model fitting; an independent decoder is exact.
const synthetic = positivePlant(plain[0].letters.slice(-201));
const planted = exhaustive(synthetic.groups, model);
const plantedDecodedScore = score(toIndices(plain[0].letters.slice(-201)), model);
assert.ok(planted.admissibleKeys > 0);
assert.ok(planted.bestScore >= plantedDecodedScore - 1e-8);
assert.ok(plantedDecodedScore > Math.max(printed.bestScore, inverted.bestScore));

console.log(JSON.stringify({
  original: {printed, mirroredQuintets: inverted},
  completeOriginalKeyspace: printed.admissibleKeys + inverted.admissibleKeys,
  sourceNaturalReadoutOrders: 4,
  heldoutEnglish201: heldout,
  positiveControl: {
    original201CharactersRecoveredWithPlantedKey: true,
    originalPlaintextScore: plantedDecodedScore,
    validPlantedKeys: planted.admissibleKeys,
    exactScannedBest: planted.bestScore,
    sourceExcerpt: plain[0].letters.slice(-201)
  }
}, null, 2));
