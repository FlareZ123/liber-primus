"use strict";

/**
 * Source-selected 180-cell known-tail lookup obstruction.
 * Original printed grid: 32 x 8, with a 76-cell circumference
 * and a 30 x 6 = 180-cell interior. The published LP2 terminal pages
 * are p55 (76, unknown), p56 (85, solved), p57 (95, solved).
 *
 * Test whether any stationary secret mapping from source byte (or
 * byte % 29) to one GP rune can produce the independently known
 * p56+p57 plaintext, under eight source-natural rectangular
 * orientations and both page orders. Repeat with published ciphertext.
 *
 * A zero-error secret lookup is a necessary condition for such a
 * shared terminal channel. The gate makes no claim about nonlinear,
 * evolving-state, position-dependent or keyed transforms.
 *
 * Run: node sims/terminal_grid_known_tail_lookup_gate.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(path.join(
  ROOT, "resources", "liber-primus", "lp2-grid-256.json"), "utf8"));
const corpus = JSON.parse(fs.readFileSync(path.join(
  ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));

/** @param {string} message @returns {number[]} */
function encodeGP(message) {
  const tokens = corpus.translit.map((t, i) => ({t, i}))
    .sort((a, b) => b.t.length - a.t.length);
  const out = [];
  for (const word of message.replaceAll("V", "U")
    .replaceAll("K", "C").split(" ")) {
    for (let i = 0; i < word.length;) {
      const token = tokens.find(t => word.startsWith(t.t, i));
      assert.ok(token, "unknown GP spelling in " + word.slice(i));
      out.push(token.i);
      i += token.t.length;
    }
  }
  return out;
}

const page56 = corpus.pages.find(p => p.page === 56);
const page57 = corpus.pages.find(p => p.page === 57);
assert.equal(grid.bytes.length, 256);
assert.equal(page56.indices.length, 85);
assert.equal(page57.indices.length, 95);

// Original p56 known solution, excluding the printed 64-byte hex digest.
// V is GP U and K is GP C; the p57 runes are independently direct text.
const known56 = encodeGP("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE " +
  "THAT HASHES TO IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE");
assert.equal(known56.length, 85);
const known57 = page57.indices;
const published56 = page56.indices;
const published57 = page57.indices;
const targets = [
  {name: "plaintext p56,p57", data: known56.concat(known57)},
  {name: "plaintext p57,p56", data: known57.concat(known56)},
  {name: "published p56,p57", data: published56.concat(published57)},
  {name: "published p57,p56", data: published57.concat(published56)}
];

/**
 * Eight scan directions for a 32-row by eight-column rectangle:
 * row-first/column-first, independent flips of both axes.
 * The border is excluded by ORIGINAL physical cell coordinates.
 * @param {number} orientation 0..7
 * @returns {number[]}
 */
function interior(orientation) {
  const out = [];
  const columnFirst = orientation & 1;
  const flipY = (orientation >> 1) & 1;
  const flipX = (orientation >> 2) & 1;
  const at = (x, y) => grid.bytes[(flipY ? 31-y : y) * 8 +
    (flipX ? 7-x : x)];
  if (columnFirst) {
    for (let x=1; x<7; x++) for (let y=1; y<31; y++)
      out.push(at(x, y));
  } else {
    for (let y=1; y<31; y++) for (let x=1; x<7; x++)
      out.push(at(x, y));
  }
  assert.equal(out.length, 180);
  return out;
}

/**
 * Exact optimizer over ALL stationary secret codebooks. For every source
 * value class, assign its most common desired output rune. Any other
 * assignment makes at least as many changes.
 * @param {number[]} source
 * @param {number[]} target
 * @param {29|256} modulus
 * @returns {{changes:number, classes:number}}
 */
function minimumChanges(source, target, modulus) {
  assert.equal(source.length, target.length);
  const groups = new Map();
  for (let i=0; i<source.length; i++) {
    const key = source[i] % modulus;
    let counts = groups.get(key);
    if (!counts) {
      counts = new Map();
      groups.set(key, counts);
    }
    counts.set(target[i], (counts.get(target[i]) || 0) + 1);
  }
  let matches = 0;
  for (const counts of groups.values()) {
    matches += Math.max(...counts.values());
  }
  return {changes: target.length-matches, classes: groups.size};
}

const interiors = Array.from({length:8}, (_, i) => interior(i));
const models = [];
for (const modulus of [256, 29]) {
  for (let orientation=0; orientation<8; orientation++) {
    for (const target of targets) {
      const result = minimumChanges(
        interiors[orientation], target.data, modulus);
      models.push({modulus, orientation, target:target.name, ...result});
    }
  }
}
models.sort((a,b) => a.changes-b.changes);
const bestByte = models.find(x => x.modulus === 256);
const bestResidue = models.find(x => x.modulus === 29);
assert.equal(bestByte.changes, 46);
assert.equal(bestResidue.changes, 126);
assert.equal(bestByte.classes, 127);

// Source-native positive control with an unknown, deterministic 256-way
// lookup. The optimizer must infer a zero-error map from the 180 pairs.
for (const modulus of [29, 256]) {
  const original = interiors[0];
  const planted = original.map(x => ((x % modulus)*17+5)%29);
  assert.equal(minimumChanges(original, planted, modulus).changes, 0);
  const counts = new Map();
  original.forEach((x, i) => {
    const key = x % modulus;
    const indexes = counts.get(key) || [];
    indexes.push(i);
    counts.set(key, indexes);
  });
  const pair = Array.from(counts.values()).find(indexes =>
    indexes.length === 2);
  assert.ok(pair, "requires one repeated table input");
  planted[pair[1]] = (planted[pair[1]]+1)%29;
  assert.equal(minimumChanges(original, planted, modulus).changes, 1);
}

// Finite family-wise null: preserve each 180-rune target multiset, shuffle
// target positions, and REPEAT the full 8 x 4 orientation/target selection.
let seed = 0x33101331;
/** @returns {number} */
function uniform() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 0x100000000;
}
/** @param {number[]} a @returns {number[]} */
function shuffled(a) {
  const out = a.slice();
  for (let k=out.length-1; k>0; k--) {
    const j = Math.floor(uniform()*(k+1));
    [out[k],out[j]] = [out[j],out[k]];
  }
  return out;
}
/** @param {number[][]} trials @returns {number} */
function bestChanges(trials) {
  let best = Infinity;
  for (const source of interiors) for (const target of trials) {
    best = Math.min(best, minimumChanges(source,target,256).changes);
  }
  return best;
}
const draws = 2000;
let atLeastAsGood = 0;
for (let i=0; i<draws; i++) {
  const randomized = targets.map(t => shuffled(t.data));
  if (bestChanges(randomized) <= bestByte.changes) atLeastAsGood++;
}
assert.equal(atLeastAsGood, 1895);
const p = (atLeastAsGood+1)/(draws+1);

console.log(JSON.stringify({
  source: "original grid interior 30x6; solved terminal p56+p57",
  models: models.length,
  bestByte,
  bestResidue,
  positiveControls: "0 changes under true secret lookup; 1 under one edit",
  shuffledFamilywise: {draws, atLeastAsGood, addOneTail:p}
}, null, 2));
