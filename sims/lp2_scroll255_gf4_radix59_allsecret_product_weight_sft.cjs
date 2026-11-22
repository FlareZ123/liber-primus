'use strict';

/**
 * Exact all-secret obstruction to a stationary whole-word product over GP29:
 *   H(word) = G(product_{r in word} K[r] mod 29)
 * with arbitrary 29 secret rune weights K[r] and arbitrary secret output
 * function G: GP29 -> GP29. This includes affine as a strict subset.
 * The frozen H receiver is the original scroll255 GF4/radix59 hypothesis.
 *
 * Full original-source read-only SFT for Windows 11 Node.js22.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const gp = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const tableSource = JSON.parse(fs.readFileSync(path.join(root, 'lp2-grid-256.json'), 'utf8'));
const parts = fs.readFileSync(path.join(root, 'lp2-transcription.txt'), 'utf8').split('%');
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
const mod29 = x => ((x % 29) + 29) % 29;

const words = [];
let pending = [];
for (let page = 3; page <= 7; page++) {
  for (const c of parts[page]) {
    if (runeIndex.has(c)) pending.push(runeIndex.get(c));
    else if ((c === '-' || c === '.') && pending.length) {
      words.push(pending);
      pending = [];
    }
  }
}
if (pending.length) words.push(pending);
assert.equal(words.length, 255);
assert.equal(words.flat().length, 1145);
assert.deepEqual(words.flat(), gp.pages.slice(3, 8).flatMap(p => p.indices));

const target = gp.pages[8].indices;
assert.equal(target.length, 255);
const a59 = tableSource.alphabet.replace('f', '');
assert.equal(a59.length, 59);
const table59 = tableSource.pages.flatMap(p => p.tokens).map(t =>
  59 * a59.indexOf(t[0]) + a59.indexOf(t[1]));
assert.equal(table59.length, 256);

/** @param {number} a GF4 element @param {number} b GF4 element */
function multiply4(a, b) {
  let out = 0;
  for (let k = 0; k < 2; k++) {
    if ((b >>> k) & 1) out ^= a;
    a <<= 1;
    if (a & 4) a ^= 7;
  }
  return out;
}
let state = [2, 0, 0, 0];
const addresses = [];
for (let i = 0; i < 255; i++) {
  addresses.push(state.reduce((n, x) => n * 4 + x, 0));
  let next = 0;
  for (let k = 0; k < 4; k++)
    next ^= multiply4(state[k], [3, 2, 0, 3][k]);
  state = [state[1], state[2], state[3], next];
}
assert.equal(new Set(addresses).size, 255);
assert(!addresses.includes(0));
assert.deepEqual(state, [2, 0, 0, 0]);

const pad = addresses.map(i => table59[i]);
const H = target.map((c, i) => mod29(c + pad[i]));
assert.equal(new Set(H).size, 29);
for (const [a, b] of [[47, 240], [48, 231], [235, 236], [88, 179]]) {
  assert.equal(H[a], H[b]);
}

/**
 * @param {number[]} values Full source-word receiver
 * @returns {number[]} Number of distinct outputs among all words
 * containing each input GP rune, in ascending GP29 order
 */
function conditionalOutputSupport(values) {
  return gp.runes.map((r, index) => {
    const support = new Set();
    for (let w = 0; w < words.length; w++)
      if (words[w].includes(index)) support.add(values[w]);
    return support.size;
  });
}
const support = conditionalOutputSupport(H);
assert.equal(support.length, 29);
assert.equal(Math.min(...support), 16);
assert(support.every(x => x > 1));
const originalOutputCounts = Array.from({ length: 29 }, (_, v) =>
  H.filter(x => x === v).length);
assert(originalOutputCounts.every(x => x > 0));

/**
 * Mathematical exhaustive exclusion:
 * - if all 29 unknown K[r] are nonzero, every product lies in GP29*,
 *   which has only 28 possible values. An arbitrary map G cannot yield
 *   29 different H outputs, but the original H has all 29.
 * - otherwise choose any r with K[r]=0. Every source word containing
 *   r has product0, and so must have the same G(0), yet for every r
 *   the original source's conditional support has at least 16 outputs.
 * There is no possible 29-entry K and no possible 29-entry G.
 */
const originalAllSecretProductPossible = false;
assert.equal(originalAllSecretProductPossible, false);

/** Exact positive with 29 arbitrary nonzero secret input weights. */
const nonzeroWeights = gp.runes.map((_, r) => 1 + ((7*r + 3) % 28));
const zeroWeights = nonzeroWeights.slice();
zeroWeights[14] = 0;

/** @param {number[]} weights 29 GP29 secret input weights. */
function productValues(weights) {
  return words.map(w =>
    w.reduce((n, r) => mod29(n * weights[r]), 1));
}
const G = Array.from({ length: 29 }, (_, x) => mod29(7*x + 11));
for (const weights of [nonzeroWeights, zeroWeights]) {
  const plant = productValues(weights).map(value => G[value]);
  const plantCipher = plant.map((v, i) => mod29(v - pad[i]));
  assert.deepEqual(plantCipher.map((v, i) => mod29(v + pad[i])), plant);
  const conditional = conditionalOutputSupport(plant);
  if (weights === nonzeroWeights) assert(new Set(plant).size <= 28);
  else assert.equal(conditional[14], 1);
}
console.log(JSON.stringify({
  theorem: 'No stationary K[r]-weighted multiplicative GP29 word accumulator with arbitrary G(product) matches frozen original H',
  originalWords: words.length,
  originalRunes: words.flat().length,
  receiverRunes: target.length,
  originalDistinctH: new Set(H).size,
  originalHCounts: originalOutputCounts,
  minimumDistinctOutputsOfWordsContainingEachRune: Math.min(...support),
  perRuneConditionalDistinctOutputCounts: support,
  allSecretGF29ProductPossible: originalAllSecretProductPossible,
  positiveRoundTripLength: 255
}, null, 2));
