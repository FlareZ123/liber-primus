"use strict";

// Source-first alternative to entering the p0 23-cycle after three transients:
// execute 23 original word-pointer hops from EACH red heading's own seed.
// Run from the repository root: node sims/lp2_wordmap23_twoheading_rawseed_source_sft.cjs
// Exact original p0, p32 and p50 inputs; fixed frozen speculative compass.
// A 100,000-table-shuffle null measures post-selected matched-X opportunities.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseLP2Words } = require("./lp2_word_pages.cjs");

const root = path.resolve(__dirname, "..");
/** @param {string} p @returns {string} */
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const p50 = JSON.parse(read("resources/liber-primus/lp2-grid-256.json")).bytes;
const original = parseLP2Words(read("resources/lp2-transcription.txt"), 3);
const p32 = corpus.pages.find((p) => p.page === 32).indices;
const dict = new Map(corpus.runes.map((value, index) => [value, index]));
const directions = [
  [-1, 0], [-1, 1], [0, 1], [1, 1],
  [1, 0], [1, -1], [0, -1], [-1, -1],
];

/** @param {string} runes @returns {number} */
function primeSum(runes) {
  return [...runes].reduce((sum, rune) => sum + corpus.prime[dict.get(rune)], 0);
}

assert.equal(original.words.length, 158);
assert.equal(original.runeCount, 729);
assert.equal(p32.length, 121);
assert.equal(p50.length, 256);

const body = original.words.slice(2);
const sums = body.map((word) => primeSum(word.runes));
const pointers = sums.map((value) => value % body.length);
const heading = original.words.slice(0, 2).map((word) => primeSum(word.runes));
const starts = heading.map((value) => value % body.length);
assert.deepEqual(heading, [347, 315]);
assert.deepEqual(starts, [35, 3]);

/**
 * @param {number} seed A zero-based body-word cell
 * @param {number[]} bytes The unchanged or permuted p50 256-byte table
 * @returns {{ cells: number[], sums: number[], positions: number[], runes: string[], xsteps: number[] }}
 */
function walk(seed, bytes) {
  let at = seed;
  let row = 3;
  let col = 0;
  const cells = [], pathSums = [], positions = [], runes = [], xsteps = [];
  for (let k = 0; k < 23; k++) {
    const sum = sums[at];
    const byte = bytes[sum % 256];
    const [dr, dc] = directions[byte & 7];
    const dist = byte >> 3;
    row = ((row + dr * dist) % 11 + 11) % 11;
    col = ((col + dc * dist) % 11 + 11) % 11;
    const pos = row * 11 + col;
    const rune = corpus.translit[p32[pos]];
    cells.push(at + 1);
    pathSums.push(sum);
    positions.push(pos);
    runes.push(rune);
    if (rune === "X") xsteps.push(k + 1);
    at = pointers[at];
  }
  return { cells, sums: pathSums, positions, runes, xsteps };
}

const first = walk(starts[0], p50);
const second = walk(starts[1], p50);
assert.deepEqual(first.sums.slice(0, 3), [367, 268, 317]);
assert.deepEqual(first.xsteps, [22]);
assert.deepEqual(second.xsteps, [15, 22]);
assert.deepEqual([first.positions[21], second.positions[21]], [61, 68]);
assert.deepEqual([first.positions[22], second.positions[22]], [60, 69]);
assert.deepEqual([first.runes[22], second.runes[22]], ["W", "IA"]);

// Positive direction/coordinate control: byte 34 means E4 from the source H,
// and p32 zero-based index 37 is an authentic X.
const positive = Array(256).fill(34);
assert.equal(walk(starts[0], positive).positions[0], 37);
assert.equal(walk(starts[1], positive).positions[0], 37);
assert.ok(walk(starts[0], positive).xsteps.includes(1));
assert.ok(walk(starts[1], positive).xsteps.includes(1));

let state = 0x2113301;
/** @returns {number} */
function rng() {
  state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
  return state / 4294967296;
}
const shuffled = p50.slice();
const trials = 100000;
let bothHaveX = 0, sharedAnyStep = 0, sharedStep22 = 0;
for (let trial = 0; trial < trials; trial++) {
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const a = walk(starts[0], shuffled);
  const b = walk(starts[1], shuffled);
  if (a.xsteps.length && b.xsteps.length) bothHaveX++;
  if (a.xsteps.some((step) => b.xsteps.includes(step))) sharedAnyStep++;
  if (a.xsteps.includes(22) && b.xsteps.includes(22)) sharedStep22++;
}
assert.deepEqual([bothHaveX, sharedAnyStep, sharedStep22], [37148, 4017, 178]);

console.log(JSON.stringify({
  status: "PASS: original source 23-hop seeded compass and table-permutation null",
  inputs: "canonical original p0–2 word stream; original p32 121 rune tree; original p50 256 printed byte table",
  core: { originalWords: original.words.length, runeCount: original.runeCount, heading, starts },
  frozenConvention: "23 source-body-word hops from each exact red seed; sum%256 addresses, 5/3-bit p50 value compass, N-first clockwise, 11x11 torus, H index33 start",
  first: { cells: first.cells, sums: first.sums, positions: first.positions, nativeGP: first.runes.join(" "), xsteps: first.xsteps },
  second: { cells: second.cells, sums: second.sums, positions: second.positions, nativeGP: second.runes.join(" "), xsteps: second.xsteps },
  independentArithmeticControl: "uniform byte34 maps H index33 to original X index37 on first step for both seeds",
  exactMultisetTablePermutation: {
    trials, seed: "0x2113301", bothHaveX, sharedAnyStep, sharedStep22,
    postselectedAnyStepRate: (sharedAnyStep + 1) / (trials + 1),
    postselectedPenultimateRate: (sharedStep22 + 1) / (trials + 1),
  },
  interpretation: "A shared X at discovered step22 is exploratory; 4% of original-value-permuted p50 tables give some shared X step. No author-selected bit split, wrap, stop, original plaintext, or cipher key.",
}, null, 2));
