#!/usr/bin/env node
"use strict";

// Post-freeze comparator for the crib-free periodic F-hold predictions.
// The two key vectors below are copied unchanged from the blind predictor's
// completed output. This script does not search or alter keys. Native target
// plaintext is accessed only after the predictions are fixed, for comparison.

const fs = require("node:fs");
const path = require("node:path");
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(process.cwd(), p), "utf8"));
const readText = (p) => fs.readFileSync(path.join(process.cwd(), p), "utf8");
const assert = (v, m) => { if (!v) throw new Error(m); };

const alphabet = readJson("resources/liber-primus/lp2-corpus.json");
const gold = readJson("resources/external/relikd-solved-gp29-native-v1.json");
const cipherText = readText("resources/transcriptions/lp1_wulfic_canonical.txt");
const runeToIndex = new Map(alphabet.runes.map((r, i) => [r, i]));
const extract = (s) => Array.from(s).filter((ch) => runeToIndex.has(ch)).map((ch) => runeToIndex.get(ch));
const nativeSections = gold.sections.map((s) => extract(s.source_text));
const cipherSections = cipherText.split("$").map(extract);

const frozen = [
  { section: 1, label: "LP1 WELCOME", key: [23, 10, 1, 10, 9, 10, 16, 26] },
  { section: 5, label: "LP1 second KOAN", key: [0, 10, 4, 0, 1, 19, 0, 18, 4, 18, 9, 0, 18] }
];

function trainLanguageModel(excludedSection, alpha = 0.1) {
  const unigramCounts = new Float64Array(29);
  const bigramCounts = Array.from({ length: 29 }, () => new Float64Array(29));
  const trigramCounts = Array.from({ length: 841 }, () => new Float64Array(29));
  const bigramTotals = new Float64Array(29);
  const trigramTotals = new Float64Array(841);
  let total = 0;

  for (let section = 0; section < nativeSections.length; section++) {
    if (section === excludedSection) continue;
    const sequence = nativeSections[section];
    for (const symbol of sequence) {
      unigramCounts[symbol]++;
      total++;
    }
    for (let i = 1; i < sequence.length; i++) {
      const context = sequence[i - 1];
      bigramCounts[context][sequence[i]]++;
      bigramTotals[context]++;
    }
    for (let i = 2; i < sequence.length; i++) {
      const context = sequence[i - 2] * 29 + sequence[i - 1];
      trigramCounts[context][sequence[i]]++;
      trigramTotals[context]++;
    }
  }

  const logUnigram = Array.from(unigramCounts, (n) => Math.log((n + alpha) / (total + 29 * alpha)));
  const logBigram = new Array(29);
  const logTrigram = new Array(841);
  for (let context = 0; context < 29; context++) {
    const denominator = bigramTotals[context] + alpha * 29;
    logBigram[context] = new Float64Array(29);
    for (let symbol = 0; symbol < 29; symbol++) {
      logBigram[context][symbol] = Math.log((bigramCounts[context][symbol] + alpha) / denominator);
    }
  }
  for (let context = 0; context < 841; context++) {
    const denominator = trigramTotals[context] + alpha * 29;
    logTrigram[context] = new Float64Array(29);
    for (let symbol = 0; symbol < 29; symbol++) {
      logTrigram[context][symbol] = Math.log((trigramCounts[context][symbol] + alpha) / denominator);
    }
  }
  return { logUnigram, logBigram, logTrigram };
}

function decodeTrigram(C, key, languageModel) {
  const period = key.length;
  const contextCount = 29 * 29;
  const stateCount = period * contextCount;
  const transition = (cipher, phase, callback) => {
    if (cipher === 0) callback(0, phase);
    const plain = (cipher - key[phase] + 29) % 29;
    if (plain !== 0) callback(plain, (phase + 1) % period);
  };

  let scores0 = new Float64Array(period * 29).fill(-Infinity);
  const paths0 = new Uint8Array(period * 29);
  transition(C[0], 0, (plain, nextPhase) => {
    const state = nextPhase * 29 + plain;
    scores0[state] = languageModel.logUnigram[plain];
    paths0[state] = 1;
  });

  let scores = new Float64Array(stateCount).fill(-Infinity);
  let paths = new Uint8Array(stateCount);
  const back1 = new Int32Array(stateCount).fill(-1);
  const symbol1 = new Int8Array(stateCount).fill(-1);

  for (let state = 0; state < scores0.length; state++) {
    if (!paths0[state]) continue;
    const phase = Math.floor(state / 29);
    const previous = state % 29;
    transition(C[1], phase, (plain, nextPhase) => {
      const nextState = nextPhase * contextCount + previous * 29 + plain;
      const candidate = scores0[state] + languageModel.logBigram[previous][plain];
      if (candidate > scores[nextState] + 1e-12) {
        scores[nextState] = candidate;
        paths[nextState] = paths0[state];
        back1[nextState] = state;
        symbol1[nextState] = plain;
      } else if (Math.abs(candidate - scores[nextState]) <= 1e-12) {
        paths[nextState] = Math.min(2, paths[nextState] + paths0[state]);
        back1[nextState] = -2;
        symbol1[nextState] = -2;
      }
    });
  }

  const backLayers = [back1];
  const symbolLayers = [symbol1];
  for (let i = 2; i < C.length; i++) {
    const nextScores = new Float64Array(stateCount).fill(-Infinity);
    const nextPaths = new Uint8Array(stateCount);
    const predecessors = new Int32Array(stateCount).fill(-1);
    const outputSymbols = new Int8Array(stateCount).fill(-1);

    for (let state = 0; state < stateCount; state++) {
      if (!paths[state]) continue;
      const phase = Math.floor(state / contextCount);
      const context = state % contextCount;
      const previousPrevious = Math.floor(context / 29);
      const previous = context % 29;
      transition(C[i], phase, (plain, nextPhase) => {
        const nextState = nextPhase * contextCount + previous * 29 + plain;
        const candidate = scores[state] + languageModel.logTrigram[previousPrevious * 29 + previous][plain];
        if (candidate > nextScores[nextState] + 1e-12) {
          nextScores[nextState] = candidate;
          nextPaths[nextState] = paths[state];
          predecessors[nextState] = state;
          outputSymbols[nextState] = plain;
        } else if (Math.abs(candidate - nextScores[nextState]) <= 1e-12) {
          nextPaths[nextState] = Math.min(2, nextPaths[nextState] + paths[state]);
          predecessors[nextState] = -2;
          outputSymbols[nextState] = -2;
        }
      });
    }
    scores = nextScores;
    paths = nextPaths;
    backLayers.push(predecessors);
    symbolLayers.push(outputSymbols);
  }

  let bestScore = -Infinity;
  let bestState = -1;
  let bestPathCount = 0;
  for (let state = 0; state < stateCount; state++) {
    if (!paths[state]) continue;
    if (scores[state] > bestScore + 1e-12) {
      bestScore = scores[state];
      bestState = state;
      bestPathCount = paths[state];
    } else if (Math.abs(scores[state] - bestScore) <= 1e-12) {
      bestPathCount = Math.min(2, bestPathCount + paths[state]);
    }
  }
  if (bestState < 0) return null;

  const plaintext = new Array(C.length);
  let state = bestState;
  for (let i = C.length - 1; i >= 1; i--) {
    const symbol = symbolLayers[i - 1][state];
    const predecessor = backLayers[i - 1][state];
    if (symbol < 0 || predecessor < 0) return { ambiguous: true, score: bestScore };
    plaintext[i] = symbol;
    state = predecessor;
  }
  plaintext[0] = state % 29;

  let keyPosition = 0;
  const reencryption = [];
  const holdPositions = [];
  for (let i = 0; i < plaintext.length; i++) {
    if (plaintext[i] === 0) {
      reencryption.push(0);
      holdPositions.push(i);
    } else {
      reencryption.push((plaintext[i] + key[keyPosition]) % 29);
      keyPosition = (keyPosition + 1) % period;
    }
  }

  return {
    plaintext,
    score: bestScore,
    unique: bestPathCount === 1,
    holdPositions,
    reencryptionExact: reencryption.every((symbol, i) => symbol === C[i])
  };
}

const results = frozen.map((item) => {
  const ciphertext = cipherSections[item.section];
  const predicted = decodeTrigram(ciphertext, item.key, trainLanguageModel(item.section));
  assert(predicted && predicted.unique, item.label + ": prediction not unique");
  assert(predicted.reencryptionExact, item.label + ": forward replay failed");
  const native = nativeSections[item.section];
  const exactMatches = predicted.plaintext.reduce((n, symbol, i) => n + (symbol === native[i] ? 1 : 0), 0);
  const mismatches = [];
  for (let i = 0; i < native.length; i++) if (predicted.plaintext[i] !== native[i]) mismatches.push(i);
  return {
    target: item.label,
    keyIndicesFrozenFromBlindRun: item.key,
    nativePlaintextUsedOnlyForPostFreezeComparison: true,
    ciphertextLength: ciphertext.length,
    nativePlaintextLength: native.length,
    exactSymbolMatches: exactMatches,
    exactPlaintext: exactMatches === native.length,
    mismatchPositions: mismatches,
    transparentPlaintextFPositions: predicted.holdPositions,
    uniqueTrigramPath: predicted.unique,
    exactForwardReplay: predicted.reencryptionExact
  };
});

assert(results.every((x) => x.exactPlaintext), "Post-freeze native comparison mismatch");
process.stdout.write(JSON.stringify({ results, exactSymbols: results.reduce((n, x) => n + x.exactSymbolMatches, 0) }) + "\n");
