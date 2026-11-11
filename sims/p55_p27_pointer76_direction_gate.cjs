"use strict";

/**
 * Director Issue #41: one frozen p55 pointer-direction decoder.
 *
 * Source-selected upstream state:
 *   - p27 header-fold selects physical p50
 *   - the equal P/P fold pair selects GP prime 43 as the start cell
 *   - p55 has exactly 76 original glyphs
 *
 * Frozen decoder:
 *   state_0 = 43
 *   next_i = table[state_i]
 *   direction_i = (next_i - state_i) mod 29
 *   plaintext_i = (ciphertext_i - direction_i) mod 29
 *
 * Run from repository root:
 *   node sims/p55_p27_pointer76_direction_gate.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");

const corpus = JSON.parse(
  fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8")
);
const grid = JSON.parse(
  fs.readFileSync("resources/liber-primus/lp2-grid-256.json", "utf8")
);
const solved = fs.readFileSync(
  "resources/liber-primus/lp1-plaintext-reference.txt", "utf8"
);

const SOURCE_BLOBS = {
  corpus: "054f2a0f780b7d46901acbe3d9bf4f0ac1801165",
  grid: "39c4f098566fc5eba9d6738416a2fd193f800701",
  solvedReference: "beb43aac08b8482590c4430aadd1ee91da3876a0"
};

const N = 29;
const START = 43;
const STEPS = 76;
const WORD_LENGTHS = [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
const labels = corpus.translit;
const p55 = corpus.pages.find((page) => page.page === 55).indices;

assert.equal(grid.bytes.length, 256);
assert.equal(p55.length, STEPS);
assert.equal(WORD_LENGTHS.reduce((sum, length) => sum + length, 0), STEPS);
assert.equal(corpus.prime[13], START);
assert.equal(labels[13], "P");

/** @param {number} value */
function mod29(value) {
  return ((value % N) + N) % N;
}

/**
 * @param {number} start
 * @returns {{states:number[], nextStates:number[], directions:number[], finalState:number}}
 */
function pointerTrace(start) {
  const states = [];
  const nextStates = [];
  const directions = [];
  let state = start;

  for (let i = 0; i < STEPS; i += 1) {
    const next = grid.bytes[state];
    states.push(state);
    nextStates.push(next);
    directions.push(mod29(next - state));
    state = next;
  }

  return {states, nextStates, directions, finalState: state};
}

/**
 * @param {number[]} values
 * @param {number[]} directions
 * @returns {number[]}
 */
function decode(values, directions) {
  return values.map((value, index) => mod29(value - directions[index]));
}

/**
 * @param {number[]} values
 * @param {number[]} directions
 * @returns {number[]}
 */
function encode(values, directions) {
  return values.map((value, index) => mod29(value + directions[index]));
}

/** @param {number[]} values */
function transliterate(values) {
  return values.map((value) => labels[value]).join("");
}

/**
 * @param {number[]} values
 * @returns {string[]}
 */
function splitWords(values) {
  const words = [];
  let offset = 0;
  for (const length of WORD_LENGTHS) {
    words.push(transliterate(values.slice(offset, offset + length)));
    offset += length;
  }
  assert.equal(offset, values.length);
  return words;
}

/** @returns {number[]} */
function solvedReference() {
  const labelIndex = new Map(labels.map((label, index) => [label, index]));
  const rankedLabels = labels.slice().sort((a, b) => b.length - a.length);
  const text = solved
    .split("\n")
    .filter((line) => !line.startsWith("#"))
    .join(" ")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");

  const out = [];
  for (let offset = 0; offset < text.length;) {
    const match = rankedLabels.find((label) => text.startsWith(label, offset));
    if (match) {
      out.push(labelIndex.get(match));
      offset += match.length;
    } else {
      offset += 1;
    }
  }

  assert.equal(out.length, 3473);
  return out;
}

/**
 * @param {number[]} reference
 * @returns {(values:number[]) => number}
 */
function trigramScorer(reference) {
  const counts = new Map();
  for (let i = 0; i + 2 < reference.length; i += 1) {
    const key = `${reference[i]},${reference[i + 1]},${reference[i + 2]}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const alpha = 0.1;
  const denominator = reference.length - 2 + N ** 3 * alpha;

  return (values) => {
    let sum = 0;
    for (let i = 0; i + 2 < values.length; i += 1) {
      const key = `${values[i]},${values[i + 1]},${values[i + 2]}`;
      sum += Math.log(((counts.get(key) ?? 0) + alpha) / denominator);
    }
    return sum / (values.length - 2);
  };
}

const reference = solvedReference();
const score = trigramScorer(reference);
const trace = pointerTrace(START);

assert.deepEqual(
  trace.states.slice(0, 18),
  [43, 73, 79, 82, 201, 74, 205, 76, 114, 197, 115, 247, 192, 0, 203, 68, 199, 47]
);
assert.equal(trace.states[7], 76);
assert.equal(trace.states[18], 76);
assert.equal(trace.states[29], 76);
assert.equal(trace.finalState, 115);

const plaintext = decode(p55, trace.directions);
assert.deepEqual(encode(plaintext, trace.directions), p55);

const nativeScores = [];
for (let offset = 0; offset + STEPS <= reference.length; offset += 19) {
  nativeScores.push(score(reference.slice(offset, offset + STEPS)));
}
nativeScores.sort((a, b) => a - b);

const wrongStartScores = corpus.prime
  .map((start, index) => {
    const candidateTrace = pointerTrace(start);
    const candidate = decode(p55, candidateTrace.directions);
    return {index, label: labels[index], start, score: score(candidate)};
  })
  .sort((a, b) => b.score - a.score);

const selectedStart = wrongStartScores.find((row) => row.start === START);
const selectedRank = wrongStartScores.findIndex((row) => row.start === START) + 1;
assert(selectedStart);
assert.equal(selectedRank, 7);

const plant = reference.slice(500, 500 + STEPS);
const plantCipher = encode(plant, trace.directions);
const plantRecovered = decode(plantCipher, trace.directions);
assert.deepEqual(plantRecovered, plant);
assert.deepEqual(encode(plantRecovered, trace.directions), plantCipher);

const result = {
  classification: "decisive rejection of one frozen complete p55 decoder",
  sourceBlobs: SOURCE_BLOBS,
  frozenDecoder: {
    startCell: START,
    steps: STEPS,
    operation: "next=table[current]; direction=(next-current) mod29; P=(C-direction) mod29",
    firstStates: trace.states.slice(0, 20),
    firstDirections: trace.directions.slice(0, 20),
    finalState: trace.finalState
  },
  originalP55: {
    wordLengths: WORD_LENGTHS,
    rawScore: score(p55),
    decodedScore: score(plaintext),
    decodedWords: splitWords(plaintext),
    decodedTransliteration: transliterate(plaintext),
    exactReencryption: true
  },
  native76Control: {
    windows: nativeScores.length,
    minimum: nativeScores[0],
    median: nativeScores[Math.floor(nativeScores.length / 2)],
    maximum: nativeScores[nativeScores.length - 1]
  },
  wrongSourceStarts: {
    family: "all 29 GP prime weights as start cells; decoder otherwise unchanged",
    selectedStartRankOneBased: selectedRank,
    betterWrongStarts: wrongStartScores.filter(
      (row) => row.start !== START && row.score > selectedStart.score
    ).length,
    bestEight: wrongStartScores.slice(0, 8)
  },
  positiveControl: {
    exactRecovery: true,
    exactReencryption: true,
    recoveredScore: score(plantRecovered)
  },
  decision: "Retire this exact 76-step pointer-displacement GP29 decoder. Do not broaden it by changing sign, phase, start, or arithmetic after seeing the output."
};

assert.ok(result.originalP55.decodedScore < result.native76Control.minimum);
assert.equal(result.wrongSourceStarts.betterWrongStarts, 6);

process.stdout.write(JSON.stringify(result, null, 2) + "\n");
