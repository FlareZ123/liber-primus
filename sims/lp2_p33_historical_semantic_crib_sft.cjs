#!/usr/bin/env node
"use strict";

// Agent48 / Director Issue #2494.
// Test only source-selected p33 semantic cribs suggested by the original
// cuneiform numerals and their apparent 1033/3301 links to solved LP1 pages.
// No free wordlist, sign search, phase search, or offset search is performed.

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = process.cwd();
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const readBytes = (p) => fs.readFileSync(path.join(root, p));
const assert = (v, m) => { if (!v) throw new Error(m); };
const sha256 = (b) => crypto.createHash("sha256").update(b).digest("hex");

const corpus = readJson("resources/liber-primus/lp2-corpus.json");
const gold = readJson("resources/external/relikd-solved-gp29-native-v1.json");
const ink = readJson("resources/liber-primus/lp2-ink-annotations.json");
const runeToIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const extract = (s) => Array.from(s).filter((ch) => runeToIndex.has(ch)).map((ch) => runeToIndex.get(ch));
const tokens = (xs) => xs.map((x) => corpus.translit[x]).join("");
const spaced = (xs) => xs.map((x) => corpus.translit[x]).join(" ");

const imageHashes = {
  "resources/liber-primus/50.jpg": "13ff4c8d8ab934032a001b8c1fda16433aa44a38dd7272b3ff0dd7ac8300c62d",
  "resources/liber-primus/05.jpg": "2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7",
  "resources/liber-primus/16.jpg": "984668c680c6089b91587ef6d9eb2a1df1d2b7ee8ab3837655d3933f2adcbfbe"
};
for (const [file, expected] of Object.entries(imageHashes)) {
  assert(sha256(readBytes(file)) === expected, "Original JPEG hash mismatch: " + file);
}

const p33 = corpus.pages.find((p) => p.page === 33);
const ink33 = ink.pages.find((p) => p.page === 33);
assert(p33 && p33.indices.length === 214, "p33 corpus must contain 214 original-position runes");
assert(ink33 && ink33.red_spans.length === 2, "p33 must have its two source-annotated red spans");
assert(ink33.red_spans[0].start === 0 && ink33.red_spans[0].length === 10, "Unexpected p33 upper red span");
assert(ink33.red_spans[1].start === 91 && ink33.red_spans[1].length === 8, "Unexpected p33 lower red span");
const red13 = ink33.large_punctuation.filter((x) => x[1] === 13 && x[2] === "red").map((x) => x[0]);
assert(red13.join(",") === "10,91,99", "Unexpected p33 red 13-dot offsets");

const wisdom = gold.sections.find((s) => s.name === "0_wisdom");
const instruction = gold.sections.find((s) => s.name === "jpg229");
assert(wisdom && instruction, "Missing native solved LP1 source sections");
const wisdomRunes = extract(wisdom.source_text);
const upperCrib = wisdomRunes.slice(0, 27);
assert(tokens(upperCrib) === "SOMEWISDOMTHEPRIMESARESACRED", "Unexpected native GP29 upper donor phrase");

function periodChecks(cipher, plain, period) {
  assert(cipher.length === plain.length, "Crib/cipher length mismatch");
  const differences = cipher.map((c, i) => (c - plain[i] + 29) % 29);
  const checks = [];
  for (let i = 0; i < differences.length - period; i++) {
    checks.push({ i, equal: differences[i] === differences[i + period] });
  }
  return {
    differences: differences.map((x) => corpus.translit[x]),
    checks: checks.length,
    matches: checks.filter((x) => x.equal).length,
    mismatches: checks.filter((x) => !x.equal).length,
    firstMismatch: checks.find((x) => !x.equal) || null
  };
}

const upperContinuous = periodChecks(p33.indices.slice(0, 27), upperCrib, 13);
const upperBody = periodChecks(p33.indices.slice(10, 27), wisdomRunes.slice(10, 27), 13);
assert(upperContinuous.checks === 14 && upperContinuous.matches === 0, "Upper continuous period-13 rejection changed");
assert(upperBody.checks === 4 && upperBody.matches === 0, "Upper reset-at-marker period-13 rejection changed");

const instructionRunes = extract(instruction.source_text.split("⁜")[0]);
assert(tokens(instructionRunes) === "ANINSTRUCTIAN", "Unexpected native GP29 AN INSTRUCTION spelling");
assert(instructionRunes.length === 12, "AN INSTRUCTION must be 12 native GP29 runes");
const instructionTokens = extract(instruction.source_text).map((x) => corpus.translit[x]).join("");
assert(instructionTokens.includes("CNOWTHIS"), "Expected the native 7-rune KNOW THIS subheading");
const lowerRubricLength = ink33.red_spans[1].length;
assert(lowerRubricLength === 8, "Unexpected lower rubric length");
assert("CNOWTHIS".length === 7, "KNOW THIS must be seven GP29 symbols");

const cribStart = 99;
const cribEnd = cribStart + instructionRunes.length;
const lowerCipherCrib = p33.indices.slice(cribStart, cribEnd);
const knownKeyPrefix = lowerCipherCrib.map((c, i) => (c - instructionRunes[i] + 29) % 29);
const continuation = p33.indices.slice(cribEnd);
assert(cribEnd === 111 && continuation.length === 103, "Unexpected p33 lower-body holdout geometry");
assert(p33.indices.slice(99, 111).map((x) => corpus.runes[x]).join("") === "ᛞᛒᚣᛡᚣᚢᚣᚾᚦᚱᛖᛗ",
  "p33 lower-body original-image transcription window changed");

const sourceIndex = gold.sections.indexOf(instruction);
const contextCount = 29 * 29;
const alpha = 0.1;

function trainTrigram(excludedSectionIndices) {
  const counts = Array.from({ length: contextCount }, () => new Float64Array(29));
  const totals = new Float64Array(contextCount);
  for (let section = 0; section < gold.sections.length; section++) {
    if (excludedSectionIndices.includes(section)) continue;
    const sequence = extract(gold.sections[section].source_text);
    for (let i = 2; i < sequence.length; i++) {
      const context = sequence[i - 2] * 29 + sequence[i - 1];
      counts[context][sequence[i]]++;
      totals[context]++;
    }
  }
  return counts.map((row, context) => {
    const output = new Float64Array(29);
    const denominator = totals[context] + alpha * 29;
    for (let symbol = 0; symbol < 29; symbol++) {
      output[symbol] = Math.log((row[symbol] + alpha) / denominator);
    }
    return output;
  });
}

// Fixed-key GP29 trigram Viterbi. At ciphertext F, branch between transparent
// plaintext F/no advance and an encrypted non-F/advance. At non-F ciphertext,
// a transition producing plaintext F is illegal. This is the historical
// plaintext-F rule, not the incorrect "skip every ciphertext F" shortcut.
function decodeContinuation(cipher, key, initialPhase, previousPrevious, previous, logProbability) {
  const period = key.length;
  const stateCount = period * contextCount;
  const epsilon = 1e-12;
  let scores = new Float64Array(stateCount).fill(-Infinity);
  let pathCounts = new Uint8Array(stateCount);
  const initialState = initialPhase * contextCount + previousPrevious * 29 + previous;
  scores[initialState] = 0;
  pathCounts[initialState] = 1;
  const backLayers = [];
  const symbolLayers = [];

  for (const ciphertextSymbol of cipher) {
    const nextScores = new Float64Array(stateCount).fill(-Infinity);
    const nextCounts = new Uint8Array(stateCount);
    const predecessors = new Int32Array(stateCount).fill(-1);
    const outputSymbols = new Int8Array(stateCount).fill(-1);

    for (let state = 0; state < stateCount; state++) {
      const incomingPaths = pathCounts[state];
      if (!incomingPaths) continue;
      const keyPosition = Math.floor(state / contextCount);
      const context = state % contextCount;
      const previousSymbol = context % 29;

      const update = (plaintextSymbol, nextKeyPosition) => {
        const nextState = nextKeyPosition * contextCount + previousSymbol * 29 + plaintextSymbol;
        const candidateScore = scores[state] + logProbability[context][plaintextSymbol];
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

      if (ciphertextSymbol === 0) update(0, keyPosition);
      const ordinary = (ciphertextSymbol - key[keyPosition] + 29) % 29;
      if (ordinary !== 0) update(ordinary, (keyPosition + 1) % period);
    }

    backLayers.push(predecessors);
    symbolLayers.push(outputSymbols);
    scores = nextScores;
    pathCounts = nextCounts;
  }

  let bestScore = -Infinity;
  let bestState = -1;
  let bestPathCount = 0;
  for (let state = 0; state < stateCount; state++) {
    if (!pathCounts[state]) continue;
    if (scores[state] > bestScore + epsilon) {
      bestScore = scores[state];
      bestState = state;
      bestPathCount = pathCounts[state];
    } else if (Math.abs(scores[state] - bestScore) <= epsilon) {
      bestPathCount = Math.min(2, bestPathCount + pathCounts[state]);
      bestState = -2;
    }
  }
  if (bestState < 0) return null;

  const plaintext = new Array(cipher.length);
  let state = bestState;
  let unique = bestPathCount === 1;
  for (let i = cipher.length - 1; i >= 0; i--) {
    const symbol = symbolLayers[i][state];
    const predecessor = backLayers[i][state];
    if (symbol < 0 || predecessor < 0) {
      unique = false;
      break;
    }
    plaintext[i] = symbol;
    state = predecessor;
  }
  if (!unique) return { score: bestScore, unique: false, pathCount: bestPathCount };

  let phase = initialPhase;
  const replay = [];
  for (const symbol of plaintext) {
    if (symbol === 0) replay.push(0);
    else {
      replay.push((symbol + key[phase]) % 29);
      phase = (phase + 1) % period;
    }
  }
  return {
    score: bestScore,
    scorePerRune: bestScore / cipher.length,
    plaintext,
    unique: true,
    pathCount: bestPathCount,
    exactForwardReplay: replay.every((symbol, i) => symbol === cipher[i])
  };
}

const languageModel = trainTrigram([sourceIndex]);
const completions = [];
for (let missingSymbol = 0; missingSymbol < 29; missingSymbol++) {
  const key = [...knownKeyPrefix, missingSymbol];
  const result = decodeContinuation(
    continuation,
    key,
    12, // the 12-symbol crib consumes key positions 0..11; next is position 12
    instructionRunes[10],
    instructionRunes[11],
    languageModel
  );
  if (result) {
    completions.push({
      missingSymbol,
      missingToken: corpus.translit[missingSymbol],
      keyTokens: spaced(key),
      scorePerRune: result.scorePerRune,
      unique: result.unique,
      pathCount: result.pathCount,
      exactForwardReplay: result.exactForwardReplay,
      plaintext: result.plaintext ? tokens(result.plaintext) : null
    });
  }
}
completions.sort((a, b) => b.scorePerRune - a.scorePerRune);
assert(completions.length === 23, "Expected exactly 23 legal 13th-symbol completions");
assert(completions.every((x) => x.unique && x.exactForwardReplay), "A surviving candidate path was ambiguous or failed replay");

function scoreNativeControls() {
  const output = [];
  for (let section = 0; section < gold.sections.length; section++) {
    if (section === sourceIndex) continue;
    const sequence = extract(gold.sections[section].source_text);
    if (sequence.length < 105) continue;
    const model = trainTrigram([sourceIndex, section]);
    let score = 0;
    for (let i = 2; i < 105; i++) {
      const context = sequence[i - 2] * 29 + sequence[i - 1];
      score += model[context][sequence[i]];
    }
    output.push({
      section: gold.sections[section].name,
      scorePerRune: score / 103
    });
  }
  return output;
}

const nativeControls = scoreNativeControls();
const nativeMinimum = Math.min(...nativeControls.map((x) => x.scorePerRune));
const best = completions[0];
assert(best.missingToken === "EA", "Unexpected best missing key symbol");
assert(Math.abs(best.scorePerRune - (-3.6099553040561645)) < 1e-9, "Best candidate score changed");
assert(best.scorePerRune < nativeMinimum - 0.3, "Candidate unexpectedly overlaps native language controls");
assert(best.plaintext === "JPSBEOOSYXIREAHIJFAENGUIIWLCAEUXMCAXAETGPITHXOEBBNGXOEEOXNGABXSPERHRDEAOCTNGFJIHXTEAWCRPXDYIAUUNGWOEJLOFMTHEOEEOJIACAEAENGAHUN",
  "Best candidate continuation changed");

const output = {
  decision: "REJECT THESE SOURCE-SELECTED P33 SEMANTIC CRIB TRANSFERS",
  originalImageSha256: imageHashes,
  p33: {
    runes: p33.indices.length,
    redSpans: ink33.red_spans.map((x) => ({ start: x.start, length: x.length })),
    red13Offsets: red13,
    lowerBodyFirst12CipherTokens: spaced(p33.indices.slice(99, 111))
  },
  sourceSelector: {
    interpretation: "conventional sexagesimal cuneiform reading 1033/3301; hypothesis, not first-party instruction",
    candidateDonorPages: [5, 16],
    sourcePage05: "SOMEWISDOM + THEPRIMESARESACRED",
    sourcePage16: "ANINSTRUCTIAN (native GP29 spelling of AN INSTRUCTION)"
  },
  upperP33Crib: {
    nativePlaintext: tokens(upperCrib),
    length: upperCrib.length,
    continuousPeriod13: upperContinuous,
    resetAtFirst13DotBodyOnly: upperBody
  },
  lowerP33Crib: {
    nativePlaintext: tokens(instructionRunes),
    length: instructionRunes.length,
    redRubricLength: lowerRubricLength,
    knowThisNativeLength: 7,
    knownKeySymbols: knownKeyPrefix.length,
    period: 13,
    missingKeySymbols: 1,
    legalCompletions: completions.length,
    impossibleCompletions: 29 - completions.length,
    bestCompletion: best,
    allCompletions: completions
  },
  languageCalibration: {
    model: "GP29 trigram, alpha=0.1, no cross-section trigrams",
    trainingExcludesSourceCribSection: true,
    nativeLeaveTwoOutControls: nativeControls,
    nativeControlRange: [nativeMinimum, Math.max(...nativeControls.map((x) => x.scorePerRune))],
    candidateBestScoreBelowAllNativeControls: true
  },
  positiveControlReference: "im-results/lp1-self-revealing-key-source-selection-gate.md",
  methodNote: "No sign, offset, reset, key phase, or plaintext alternatives were searched. The only 29-way search is the single key symbol not supplied by the 12-rune crib."
};

process.stdout.write(JSON.stringify(output, null, 2) + "\n");
