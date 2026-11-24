#!/usr/bin/env node
"use strict";

// Independent blind predictor for LP1 section 1 ("0_welcome").
// It reads only the first 16 native plaintext symbols of the target section.
// The withheld target tail is never accessed by this script.

const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const readText = (p) => fs.readFileSync(path.join(root, p), "utf8");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const alphabet = readJson("resources/liber-primus/lp2-corpus.json");
const gold = readJson("resources/external/relikd-solved-gp29-native-v1.json");
const cipherText = readText("resources/transcriptions/lp1_wulfic_canonical.txt");

const runeToIndex = new Map(alphabet.runes.map((r, i) => [r, i]));
const translit = alphabet.translit;
const extractRunes = (text) => Array.from(text)
  .filter((ch) => runeToIndex.has(ch))
  .map((ch) => runeToIndex.get(ch));

// Stop immediately after the allowed 16-symbol target crib. Do not inspect
// target plaintext symbols 16–514 anywhere in this predictor.
const firstRunes = (text, n) => {
  const out = [];
  for (const ch of text) {
    if (runeToIndex.has(ch)) {
      out.push(runeToIndex.get(ch));
      if (out.length === n) break;
    }
  }
  return out;
};

const cipherSegments = cipherText.split("$");
assert(cipherSegments.length > 1, "Missing $-separated LP1 target section");
const C = extractRunes(cipherSegments[1]);
assert(C.length === 515, `Expected 515 ciphertext symbols, got ${C.length}`);

const targetSection = gold.sections[1];
assert(targetSection && targetSection.name === "0_welcome", "Unexpected target section identity");
const crib = firstRunes(targetSection.source_text, 16);
assert(crib.length === 16, "Could not extract the 16-symbol target crib");
assert(crib.map((x) => translit[x]).join("") === "WELCOMEWELCOMEPI",
  "The allowed target crib is not WELCOME WELCOME PI");

const differences = C.slice(0, 16).map((c, i) => (c - crib[i] + 29) % 29);
const periods = Array.from({ length: 13 }, (_, i) => i + 1)
  .filter((period) => differences.every((v, i) => v === differences[i % period]));
assert(periods.length === 1, `Crib period is not unique: ${periods.join(",") || "none"}`);
const period = periods[0];
const key = differences.slice(0, period);
const keyName = key.map((x) => translit[x]).join("");
assert(period === 8 && keyName === "DIUINITY",
  `Derived key is not the allowed DIVINITY→DIUINITY key: period=${period}, key=${keyName}`);

const trainingSectionIds = [0, 2, 3, 4, 6, 7, 8];
const training = trainingSectionIds.map((i) => extractRunes(gold.sections[i].source_text));
const trainingLengths = training.map((seq) => seq.length);

// GP29 trigram model; no trigrams cross section boundaries.
const contextCount = 29 * 29;
const counts = Array.from({ length: contextCount }, () => new Float64Array(29));
const totals = new Float64Array(contextCount);
for (const seq of training) {
  for (let i = 2; i < seq.length; i++) {
    const context = seq[i - 2] * 29 + seq[i - 1];
    counts[context][seq[i]]++;
    totals[context]++;
  }
}

const alpha = 0.1;
const logProb = Array.from({ length: contextCount }, (_, context) => {
  const row = new Float64Array(29);
  const denominator = totals[context] + alpha * 29;
  for (let symbol = 0; symbol < 29; symbol++) {
    row[symbol] = Math.log((counts[context][symbol] + alpha) / denominator);
  }
  return row;
});

// Viterbi state: (key position, previous two plaintext symbols).
// At ciphertext F, branch between transparent plaintext F/no advance and
// encrypted non-F/advance. At non-F ciphertext, reject a transition that
// would produce plaintext F, because plaintext F must be transparent.
const stateCount = period * contextCount;
const epsilon = 1e-12;
let scores = new Float64Array(stateCount).fill(-Infinity);
let pathCounts = new Uint8Array(stateCount);
const initialState = (16 % period) * contextCount + crib[14] * 29 + crib[15];
scores[initialState] = 0;
pathCounts[initialState] = 1;

const predecessorLayers = [];
const symbolLayers = [];

for (let t = 0; t < C.length - 16; t++) {
  const ciphertextSymbol = C[16 + t];
  const nextScores = new Float64Array(stateCount).fill(-Infinity);
  const nextCounts = new Uint8Array(stateCount);
  const predecessors = new Int32Array(stateCount).fill(-1);
  const outputSymbols = new Int8Array(stateCount).fill(-1);

  for (let state = 0; state < stateCount; state++) {
    const incomingPaths = pathCounts[state];
    if (!incomingPaths) continue;

    const keyPosition = Math.floor(state / contextCount);
    const context = state % contextCount;
    const previousPrevious = Math.floor(context / 29);
    const previous = context % 29;

    const update = (plaintextSymbol, nextKeyPosition) => {
      const nextState = nextKeyPosition * contextCount + previous * 29 + plaintextSymbol;
      const candidateScore = scores[state] + logProb[context][plaintextSymbol];

      if (candidateScore > nextScores[nextState] + epsilon) {
        nextScores[nextState] = candidateScore;
        nextCounts[nextState] = incomingPaths;
        predecessors[nextState] = state;
        outputSymbols[nextState] = plaintextSymbol;
      } else if (Math.abs(candidateScore - nextScores[nextState]) <= epsilon) {
        nextCounts[nextState] = Math.min(2, nextCounts[nextState] + incomingPaths);
        predecessors[nextState] = -2;
        outputSymbols[nextState] = -2;
      }
    };

    if (ciphertextSymbol === 0) {
      update(0, keyPosition); // transparent plaintext F; key position held
      const ordinary = (ciphertextSymbol - key[keyPosition] + 29) % 29;
      if (ordinary !== 0) update(ordinary, (keyPosition + 1) % period);
    } else {
      const ordinary = (ciphertextSymbol - key[keyPosition] + 29) % 29;
      if (ordinary !== 0) update(ordinary, (keyPosition + 1) % period);
    }
  }

  predecessorLayers.push(predecessors);
  symbolLayers.push(outputSymbols);
  scores = nextScores;
  pathCounts = nextCounts;
}

let bestScore = -Infinity;
let bestStates = [];
let bestPathCount = 0;
for (let state = 0; state < stateCount; state++) {
  if (!pathCounts[state]) continue;
  if (scores[state] > bestScore + epsilon) {
    bestScore = scores[state];
    bestStates = [state];
    bestPathCount = pathCounts[state];
  } else if (Math.abs(scores[state] - bestScore) <= epsilon) {
    bestStates.push(state);
    bestPathCount = Math.min(2, bestPathCount + pathCounts[state]);
  }
}
assert(bestStates.length === 1 && bestPathCount === 1,
  `Viterbi optimum is not unique (best states=${bestStates.length}, paths=${bestPathCount})`);

let state = bestStates[0];
const reversedPrediction = [];
for (let t = predecessorLayers.length - 1; t >= 0; t--) {
  const symbol = symbolLayers[t][state];
  assert(symbol >= 0, "Ambiguous or missing Viterbi backpointer");
  reversedPrediction.push(symbol);
  state = predecessorLayers[t][state];
}
const predicted = reversedPrediction.reverse();
assert(predicted.length === 499, `Expected 499 predicted symbols, got ${predicted.length}`);

const fullPlaintext = [...crib, ...predicted];
let keyPosition = 0;
const reencrypted = [];
const transparentFPositions = [];
for (let i = 0; i < fullPlaintext.length; i++) {
  const plaintextSymbol = fullPlaintext[i];
  if (plaintextSymbol === 0) {
    reencrypted.push(0);
    transparentFPositions.push(i);
  } else {
    reencrypted.push((plaintextSymbol + key[keyPosition]) % 29);
    keyPosition = (keyPosition + 1) % period;
  }
}
const forwardReencode = reencrypted.every((symbol, i) => symbol === C[i]);
assert(forwardReencode, "Forward re-encryption does not reproduce the 515-symbol ciphertext");

const predictionTokens = predicted.map((x) => translit[x]);
const output = {
  targetSection: targetSection.name,
  ciphertextLength: C.length,
  cribLength: crib.length,
  crib: crib.map((x) => translit[x]),
  cribDifferenceStream: differences.map((x) => translit[x]),
  uniquePeriods: periods,
  key: key.map((x) => translit[x]),
  keyDescription: "DIVINITY → DIUINITY",
  trainingSectionIds,
  trainingLengths,
  model: { type: "GP29 trigram", alpha, crossSectionTrigrams: false },
  viterbi: { unique: true, bestScore, state: "(key position, previous two plaintext symbols)" },
  predictedLength: predicted.length,
  predictionTokens,
  predictionCompact: predictionTokens.join(""),
  transparentFPositions,
  forwardReencode
};

process.stdout.write(JSON.stringify(output, null, 2) + "\n");
