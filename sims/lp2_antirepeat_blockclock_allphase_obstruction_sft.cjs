"use strict";

/**
 * Original-cipher necessary-condition gate for every fixed-size L-block
 * emitter that forbids C[i] === C[i-1] strictly inside a block, while
 * allowing equal neighbors at the join between consecutive blocks.
 *
 * Secret output maps, block-local plaintext, and keys can be arbitrary.
 * For each reset scope, every observed adjacent-equality *end* must be
 * a block-boundary slot. If the boundary is a residue class mod L,
 * all end positions in that reset scope must be congruent mod L.
 *
 * Node.js 22, CommonJS, source read-only. Run:
 * node sims/lp2_antirepeat_blockclock_allphase_obstruction_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = require(path.join(root, "resources/liber-primus/lp2-corpus.json"));
const source = fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8"
);
const alphabet = new Set(corpus.runes);
const UNSOLVED_RUNES = 12956;

/** @param {number} a @param {number} b @returns {number} */
function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

/**
 * gcd of every pairwise position difference, with individual groups
 * permitted independent block origins.
 * @param {number[][]} groups
 * @returns {number}
 */
function commonBoundaryDivisor(groups) {
  let g = 0;
  for (const positions of groups) {
    for (let i = 1; i < positions.length; i++) {
      g = gcd(g, positions[i] - positions[0]);
    }
  }
  return g;
}

/** @param {number[]} sequence @returns {number[]} */
function repeats(sequence) {
  const positions = [];
  for (let i = 1; i < sequence.length; i++) {
    if (sequence[i] === sequence[i - 1]) positions.push(i);
  }
  return positions;
}

/** @param {number} g @returns {number[]} */
function allowedLengths(g) {
  assert.ok(g > 0, "Source must contain constraining repeated pairs");
  const output = [];
  for (let length = 2; length <= g; length++) {
    if (g % length === 0) output.push(length);
  }
  return output;
}

const pages = corpus.pages.filter((p) => p.page < 56);
const globalPositions = [];
const pagePositions = [];
let totalRunes = 0;
for (const p of pages) {
  const local = repeats(p.indices);
  pagePositions.push({ page: p.page, positions: local });
  for (const i of local) globalPositions.push(i + totalRunes);
  totalRunes += p.indices.length;
}
assert.equal(totalRunes, UNSOLVED_RUNES);
assert.equal(globalPositions.length, 86);

const words = [];
let runes = [], start = 0, count = 0;
for (const ch of source) {
  if (alphabet.has(ch)) {
    if (runes.length === 0) start = count;
    runes.push(ch);
    count++;
    if (count === UNSOLVED_RUNES) {
      words.push({ start, runes });
      break;
    }
  } else if (ch === "-" || ch === "." || ch === "&") {
    if (runes.length > 0) words.push({ start, runes });
    runes = [];
  }
}
assert.equal(count, UNSOLVED_RUNES);
assert.equal(words.length, 2896);
const wordPositions = words.map((w) => repeats(w.runes));
assert.equal(wordPositions.flat().length, 63);
assert.equal(wordPositions.filter((w) => w.length > 0).length, 62);

const oneGlobalClock = commonBoundaryDivisor([globalPositions]);
const onePageResetPhase = commonBoundaryDivisor([pagePositions.flatMap((p) => p.positions)]);
const freePhaseByPage = commonBoundaryDivisor(pagePositions.map((p) => p.positions));
const oneWordResetPhase = commonBoundaryDivisor([wordPositions.flat()]);
const freePhaseByWord = commonBoundaryDivisor(wordPositions);

assert.deepEqual({
  oneGlobalClock, onePageResetPhase, freePhaseByPage,
  oneWordResetPhase, freePhaseByWord
}, {
  oneGlobalClock: 1,
  onePageResetPhase: 1,
  freePhaseByPage: 1,
  oneWordResetPhase: 1,
  freePhaseByWord: 6
});

// One unchanged original page alone precludes EVERY L>1 even when the
// block origin may differ independently from one physical page to another.
const page3 = pagePositions.find((p) => p.page === 3);
assert.deepEqual(page3.positions, [53, 180, 203]);
assert.equal(commonBoundaryDivisor([page3.positions]), 1);

// The only word with two disjoint equal pairs supplies the full
// word-arbitrary-phase restriction: L must divide (11 - 5) = 6.
const doubledWords = wordPositions
  .map((positions, word) => ({ word, positions }))
  .filter((w) => w.positions.length > 1);
assert.equal(doubledWords.length, 1);
const witness = doubledWords[0];
assert.equal(witness.word, 1476);
assert.equal(words[witness.word].start, 6606);
assert.deepEqual(witness.positions, [5, 11]);
assert.deepEqual(words[witness.word].runes.map((r) => corpus.runes.indexOf(r)),
  [12, 4, 9, 15, 3, 3, 5, 24, 18, 26, 18, 18]);
assert.deepEqual(allowedLengths(freePhaseByWord), [2, 3, 6]);

// Positive controls test the mathematical acceptor itself, without
// pretending to encode unrestricted GP29 plaintext losslessly.
const planted = Array.from({ length: 12 }, (_, i) => i);
planted[5] = planted[4];
planted[11] = planted[10];
assert.deepEqual(repeats(planted), [5, 11]);
assert.deepEqual(allowedLengths(commonBoundaryDivisor([repeats(planted)])), [2, 3, 6]);
assert.equal(repeats(planted).every((i) => i % 6 === 5), true);
assert.equal(repeats(planted).every((i) => i % 5 === 0), false);

console.log(JSON.stringify({
  claim: "A strict fixed-size no-adjacent-repeat emitter with boundary-only repeats has no possible block length L>1 under a continuous, page-reset, or uniformly word-reset clock; even arbitrary per-word phase allows only L=2,3,6.",
  source: { originalUnknownRunes: totalRunes, printedWords: words.length,
    samePageDoublets: globalPositions.length, withinWordDoublets: wordPositions.flat().length },
  gcd: { global: oneGlobalClock, samePhasePageReset: onePageResetPhase,
    arbitraryPagePhase: freePhaseByPage, samePhaseWordReset: oneWordResetPhase,
    arbitraryWordPhase: freePhaseByWord },
  compatibleBlockLengths: {
    global: [], samePhasePageReset: [], arbitraryPagePhase: [],
    samePhaseWordReset: [], arbitraryWordPhase: allowedLengths(freePhaseByWord)
  },
  originalWitnesses: { page3AdjacentEqualityEnds: page3.positions,
    physicalPage27Word0: witness.word, runeStart0: words[witness.word].start,
    wordDoubletEndIndices0: witness.positions },
  plantedPositive: { length6BoundaryConditionPasses: true,
    length5BoundaryConditionFails: true },
  recoveredUnknownPlaintext: false
}, null, 2));
