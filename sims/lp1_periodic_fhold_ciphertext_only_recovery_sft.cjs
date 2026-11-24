#!/usr/bin/env node
"use strict";

// Crib-free recovery of periodic GP29 additive keys under the authentic
// plaintext-F-transparent/key-hold transducer.
//
// The two ciphertext targets are LP1 WELCOME (period 8) and second KOAN
// (period 13). Target plaintext is never read by this predictor. The only
// plaintext input is the independently solved native corpus with the target
// section excluded from every language model. The random-key plants are
// synthetic positive controls built from other held-out native sections.

const fs = require("node:fs");
const path = require("node:path");

const readJson = (p) => JSON.parse(fs.readFileSync(path.join(process.cwd(), p), "utf8"));
const readText = (p) => fs.readFileSync(path.join(process.cwd(), p), "utf8");
const assert = (v, m) => { if (!v) throw new Error(m); };

const alphabet = readJson("resources/liber-primus/lp2-corpus.json");
const gold = readJson("resources/external/relikd-solved-gp29-native-v1.json");
const cipherText = readText("resources/transcriptions/lp1_wulfic_canonical.txt");
const runeToIndex = new Map(alphabet.runes.map((r, i) => [r, i]));
const translit = alphabet.translit;
const extract = (s) => Array.from(s).filter((ch) => runeToIndex.has(ch)).map((ch) => runeToIndex.get(ch));
const goldSections = gold.sections;
const cipherSections = cipherText.split("$").map(extract);

const tokenString = (xs) => xs.map((x) => translit[x]).join("");
const xorshift32 = (seed) => {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
};

function trainUnigram(excludedSection, alpha = 0.25) {
  const counts = new Float64Array(29);
  let total = 0;
  for (let s = 0; s < goldSections.length; s++) {
    if (s === excludedSection) continue;
    for (const symbol of extract(goldSections[s].source_text)) {
      counts[symbol]++;
      total++;
    }
  }
  return Array.from(counts, (n) => Math.log((n + alpha) / (total + 29 * alpha)));
}

// Given a key, infer both plaintext and hidden transparent-F holds. At C=F,
// either P=F with no key advance, or P=C-K[j] != F with an ordinary advance.
// At C!=F only the ordinary branch is legal. In particular, ciphertext F is
// not automatically a transparent plaintext F.
function decodeUnigram(C, key, logProbability) {
  const period = key.length;
  let scores = new Float64Array(period).fill(-Infinity);
  scores[0] = 0;
  const back = Array.from({ length: C.length }, () => new Array(period).fill(null));

  for (let t = 0; t < C.length; t++) {
    const nextScores = new Float64Array(period).fill(-Infinity);
    const nextBack = new Array(period).fill(null);
    const c = C[t];

    for (let phase = 0; phase < period; phase++) {
      if (!Number.isFinite(scores[phase])) continue;
      const update = (plain, nextPhase, hold) => {
        const candidate = scores[phase] + logProbability[plain];
        if (candidate > nextScores[nextPhase]) {
          nextScores[nextPhase] = candidate;
          nextBack[nextPhase] = { phase, plain, hold };
        }
      };

      if (c === 0) update(0, phase, true);
      const plain = (c - key[phase] + 29) % 29;
      if (plain !== 0) update(plain, (phase + 1) % period, false);
    }

    scores = nextScores;
    back[t] = nextBack;
    if (!Array.from(scores).some(Number.isFinite)) return null;
  }

  let phase = 0;
  let bestScore = -Infinity;
  for (let j = 0; j < period; j++) {
    if (scores[j] > bestScore) {
      bestScore = scores[j];
      phase = j;
    }
  }
  const plaintext = new Array(C.length);
  const phases = new Array(C.length);
  const holds = new Array(C.length);

  for (let t = C.length - 1; t >= 0; t--) {
    const step = back[t][phase];
    if (!step) return null;
    plaintext[t] = step.plain;
    phases[t] = step.phase;
    holds[t] = step.hold;
    phase = step.phase;
  }

  return { plaintext, phases, holds, score: bestScore };
}

// Coordinate-EM: Viterbi infers the latent F-pause path for a fixed key;
// each key position is then re-estimated by maximum unigram likelihood over
// ordinary symbols assigned to that phase. No target crib or key dictionary.
function refineKey(C, period, logProbability, initialKey, maxSweeps = 25) {
  const key = initialKey.slice();
  let decoded = null;

  for (let sweep = 0; sweep < maxSweeps; sweep++) {
    decoded = decodeUnigram(C, key, logProbability);
    if (!decoded) return null;
    let changed = false;

    for (let phase = 0; phase < period; phase++) {
      const ciphertextSymbols = [];
      for (let i = 0; i < C.length; i++) {
        if (!decoded.holds[i] && decoded.phases[i] === phase) ciphertextSymbols.push(C[i]);
      }
      if (ciphertextSymbols.length === 0) continue;

      let bestKeySymbol = key[phase];
      let bestScore = -Infinity;
      for (let candidate = 0; candidate < 29; candidate++) {
        let score = 0;
        let legal = true;
        for (const c of ciphertextSymbols) {
          const p = (c - candidate + 29) % 29;
          if (p === 0) { legal = false; break; }
          score += logProbability[p];
        }
        if (legal && score > bestScore) {
          bestScore = score;
          bestKeySymbol = candidate;
        }
      }

      if (bestKeySymbol !== key[phase]) {
        key[phase] = bestKeySymbol;
        changed = true;
      }
    }
    if (!changed) break;
  }

  decoded = decodeUnigram(C, key, logProbability);
  return decoded ? { key, decoded } : null;
}

function recoverKey(C, period, excludedSection, seed, restarts) {
  const logProbability = trainUnigram(excludedSection);
  const random = xorshift32(seed);
  const candidates = new Map();
  let validStarts = 0;

  for (let trial = 0; trial < restarts; trial++) {
    const initialKey = Array.from({ length: period }, () => Math.floor(random() * 29));
    const result = refineKey(C, period, logProbability, initialKey);
    if (!result) continue;
    validStarts++;
    const id = result.key.join(",");
    if (!candidates.has(id)) {
      candidates.set(id, { key: result.key, score: result.decoded.score, basin: 0 });
    }
    candidates.get(id).basin++;
  }

  const ranked = Array.from(candidates.values()).sort((a, b) => b.score - a.score);
  return {
    validStarts,
    distinctCandidates: ranked.length,
    ranked,
    scoreGap: ranked.length > 1 ? ranked[0].score - ranked[1].score : null
  };
}

function trainLanguageModel(excludedSection, alpha = 0.1) {
  const unigramCounts = new Float64Array(29);
  const bigramCounts = Array.from({ length: 29 }, () => new Float64Array(29));
  const trigramCounts = Array.from({ length: 841 }, () => new Float64Array(29));
  const bigramTotals = new Float64Array(29);
  const trigramTotals = new Float64Array(841);
  let total = 0;

  for (let section = 0; section < goldSections.length; section++) {
    if (section === excludedSection) continue;
    const sequence = extract(goldSections[section].source_text);
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

// Full native-GP trigram Viterbi after the key is frozen. The only hidden
// decisions are legal plaintext-F holds at ciphertext F. This decoder is
// separate from key search and never updates the key.
function decodeTrigram(C, key, languageModel) {
  const period = key.length;
  const contextCount = 29 * 29;
  const stateCount = period * contextCount;

  const transition = (cipher, phase, callback) => {
    if (cipher === 0) callback(0, phase, true);
    const plain = (cipher - key[phase] + 29) % 29;
    if (plain !== 0) callback(plain, (phase + 1) % period, false);
  };

  let scores0 = new Float64Array(period * 29).fill(-Infinity);
  const paths0 = new Uint8Array(period * 29);
  for (let phase = 0; phase < 1; phase++) {
    transition(C[0], phase, (plain, nextPhase) => {
      const state = nextPhase * 29 + plain;
      scores0[state] = languageModel.logUnigram[plain];
      paths0[state] = 1;
    });
  }

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
    const layer = i - 1;
    const symbol = symbolLayers[layer][state];
    const predecessor = backLayers[layer][state];
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

function encrypt(plaintext, key) {
  let keyPosition = 0;
  return plaintext.map((symbol) => {
    if (symbol === 0) return 0;
    const ciphertext = (symbol + key[keyPosition]) % 29;
    keyPosition = (keyPosition + 1) % key.length;
    return ciphertext;
  });
}

function randomPlantSuite() {
  // Plant plaintext sections are disjoint from the two actual targets.
  // Each plant's source section is excluded from its own unigram training.
  const tests = [
    { source: 0, period: 8, seed: 0xCCDD0000, restarts: 1000 },
    { source: 0, period: 13, seed: 0xCCDD0001, restarts: 1000 },
    { source: 3, period: 8, seed: 0xA5A50004, restarts: 1500 },
    { source: 3, period: 13, seed: 0xA5A50005, restarts: 1500 },
    { source: 4, period: 8, seed: 0xA5A50000, restarts: 1500 },
    { source: 4, period: 13, seed: 0xA5A50001, restarts: 1500 }
  ];

  return tests.map((test) => {
    const random = xorshift32(test.seed);
    const plantedKey = Array.from({ length: test.period }, () => Math.floor(random() * 29));
    const plantPlaintext = extract(goldSections[test.source].source_text);
    const plantCiphertext = encrypt(plantPlaintext, plantedKey);
    const result = recoverKey(
      plantCiphertext,
      test.period,
      test.source,
      test.seed ^ 0x9E3779B9,
      test.restarts
    );
    const best = result.ranked[0] || null;
    return {
      sourceSection: goldSections[test.source].name,
      period: test.period,
      plaintextLength: plantPlaintext.length,
      plantedKeyIndices: plantedKey,
      recoveredKeyIndices: best ? best.key : null,
      exactKeyRecovery: !!best && best.key.every((x, i) => x === plantedKey[i]),
      validStarts: result.validStarts,
      distinctCandidates: result.distinctCandidates,
      topScoreGap: result.scoreGap
    };
  });
}

function randomWrongKeyBaseline(C, period, excludedSection, seed, samples = 1000) {
  const logProbability = trainUnigram(excludedSection);
  const random = xorshift32(seed);
  const scores = [];
  for (let i = 0; i < samples; i++) {
    const key = Array.from({ length: period }, () => Math.floor(random() * 29));
    const decoded = decodeUnigram(C, key, logProbability);
    if (decoded) scores.push(decoded.score);
  }
  scores.sort((a, b) => a - b);
  return {
    samples,
    feasibleRandomKeys: scores.length,
    medianFeasibleScore: scores.length ? scores[Math.floor(scores.length / 2)] : null,
    bestFeasibleScore: scores.length ? scores[scores.length - 1] : null
  };
}

const targets = [
  { section: 1, period: 8, seed: 0x12345679, restarts: 1500, label: "LP1 WELCOME" },
  { section: 5, period: 13, seed: 0x1234567D, restarts: 1500, label: "LP1 second KOAN" }
];

const controlResults = targets.map((target) => {
  const ciphertext = cipherSections[target.section];
  assert(ciphertext.length > 0, target.label + ": missing ciphertext section");
  const recovered = recoverKey(ciphertext, target.period, target.section, target.seed, target.restarts);
  assert(recovered.ranked.length > 0, target.label + ": no feasible key candidate");
  const best = recovered.ranked[0];
  const languageModel = trainLanguageModel(target.section);
  const decoded = decodeTrigram(ciphertext, best.key, languageModel);
  assert(decoded && decoded.unique, target.label + ": trigram prediction is not unique");
  assert(decoded.reencryptionExact, target.label + ": forward replay failed");

  return {
    target: target.label,
    goldSectionExcludedFromFit: true,
    ciphertextLength: ciphertext.length,
    period: target.period,
    restartBudget: target.restarts,
    coordinateSweepsMaximum: 25,
    validStarts: recovered.validStarts,
    distinctConvergedKeys: recovered.distinctCandidates,
    topCandidates: recovered.ranked.slice(0, 5).map((candidate) => ({
      keyIndices: candidate.key,
      keyTokens: tokenString(candidate.key),
      unigramScore: candidate.score,
      basinCount: candidate.basin
    })),
    topVsRunnerUpUnigramGap: recovered.scoreGap,
    selectedKeyIndices: best.key,
    selectedKeyTokens: tokenString(best.key),
    trigramScore: decoded.score,
    uniqueTrigramPath: decoded.unique,
    plaintextFHoldPositions: decoded.holdPositions,
    exactForwardReplay: decoded.reencryptionExact,
    rawRandomWrongKeyBaseline: randomWrongKeyBaseline(ciphertext, target.period, target.section, target.seed ^ 0xBAD5EED, 1000),
    predictedPlaintext: tokenString(decoded.plaintext)
  };
});

const plants = randomPlantSuite();
const output = {
  method: {
    cipher: "C=P+K[phase] mod 29 for P!=F; P=F is transparent and does not advance key",
    keyRecovery: "deterministic multi-start coordinate-EM; Viterbi latent F holds; unigram M-step",
    plaintextDecoder: "fixed-key GP29 trigram Viterbi; alpha=0.1; no cross-section trigrams",
    keySearchUnigramAlpha: 0.25,
    noCrib: true,
    noTargetPlaintextUsedForFit: true,
    randomPlantCount: plants.length
  },
  controls: controlResults,
  randomKeyPlants: plants,
  randomPlantSuccesses: plants.filter((x) => x.exactKeyRecovery).length
};
process.stdout.write(JSON.stringify(output) + "\n");
