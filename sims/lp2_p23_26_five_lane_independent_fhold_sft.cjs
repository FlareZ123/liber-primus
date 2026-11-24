"use strict";

/*
 * Source-locked test of one missing p23–26 receiver:
 *   - original p23 red16 removed; exactly 1005 runes remain;
 *   - fixed row-major 201x5 demultiplex (lane = original_index mod 5);
 *   - one unknown GP29 additive key of period 13, phase zero in each lane;
 *   - each lane independently holds its key clock only for plaintext F;
 *   - 150 complete rows train the shared key; final 51 rows are held out.
 *
 * Period 13 is fixed by the authentic solved KOAN key length and the
 * p23–26 period-13 hidden-pause relaxation survivor. No period/layout/phase
 * sweep is performed. This is a conditional model test, not an LP2 solution.
 */

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

const readJson = (p) => JSON.parse(fs.readFileSync(path.join(process.cwd(), p), "utf8"));
const readText = (p) => fs.readFileSync(path.join(process.cwd(), p), "utf8");
const mod29 = (n) => ((n % 29) + 29) % 29;

const corpus = readJson("resources/liber-primus/lp2-corpus.json");
const ink = readJson("resources/liber-primus/lp2-ink-annotations.json");
const gold = readJson("resources/external/relikd-solved-gp29-native-v1.json");
const runeToIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const translit = corpus.translit;
const extract = (s) => Array.from(s).filter((ch) => runeToIndex.has(ch)).map((ch) => runeToIndex.get(ch));
const tokenString = (xs) => xs.map((x) => translit[x]).join("");

const imageHash = crypto.createHash("sha256")
  .update(fs.readFileSync(path.join(process.cwd(), "resources/liber-primus/40.jpg")))
  .digest("hex");
assert.equal(imageHash, "d31a23cb3a2e50b505e1c468ffbb0106f5353f469bb5958b87ab929fc88decee");

const printedPages = [23, 24, 25, 26].map((page) => corpus.pages.find((p) => p.page === page));
assert.deepEqual(printedPages.map((p) => p.indices.length), [213, 270, 273, 265]);
const redHeading = ink.pages.find((p) => p.page === 23).red_spans[0];
assert.deepEqual([redHeading.start, redHeading.length], [0, 16]);
const body = [
  ...printedPages[0].indices.slice(16),
  ...printedPages.slice(1).flatMap((p) => p.indices)
];
assert.equal(body.length, 1005);
assert.equal(body.length / 5, 201);

const PERIOD = 13;
const TRAIN_ROWS = 150;
const TRAIN_LENGTH = TRAIN_ROWS * 5;
const HOLDOUT_LENGTH = body.length - TRAIN_LENGTH;
assert.equal(HOLDOUT_LENGTH, 255);

function splitLanes(values) {
  assert.equal(values.length % 5, 0);
  return Array.from({ length: 5 }, (_, lane) => values.filter((_, i) => i % 5 === lane));
}
function encryptFiveLane(plaintext, key) {
  assert.equal(plaintext.length % 5, 0);
  assert.equal(key.length, PERIOD);
  const ciphertext = new Array(plaintext.length);
  for (let lane = 0; lane < 5; lane++) {
    let phase = 0;
    for (let i = lane; i < plaintext.length; i += 5) {
      const p = plaintext[i];
      if (p === 0) ciphertext[i] = 0;
      else {
        ciphertext[i] = mod29(p + key[phase]);
        phase = (phase + 1) % PERIOD;
      }
    }
  }
  return ciphertext;
}
function xorshift32(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}
function randomKey(seed) {
  const next = xorshift32(seed);
  return Array.from({ length: PERIOD }, () => next() % 29);
}

/*
 * Construct feasible initial keys instead of wasting random starts. Choose
 * one legal transparent-F/consume history per lane, intersect the resulting
 * per-phase forbidden-value sets, then sample one shared key from the
 * nonempty domains. This guarantees at least one legal path in every lane.
 */
function randomFeasibleKey(lanes, random) {
  const all = (1 << 29) - 1;
  for (let attempt = 0; attempt < 50; attempt++) {
    const domains = Array(PERIOD).fill(all);
    for (const lane of lanes) {
      let phase = 0;
      for (const c of lane) {
        const skip = c === 0 && (random() & 1) === 0;
        if (!skip) {
          domains[phase] &= ~(1 << c);
          phase = (phase + 1) % PERIOD;
        }
      }
    }
    if (domains.some((mask) => mask === 0)) continue;
    return domains.map((mask) => {
      const values = [];
      for (let value = 0; value < 29; value++) {
        if (mask & (1 << value)) values.push(value);
      }
      return values[random() % values.length];
    });
  }
  return null;
}
function trainLanguageModel(excludedSections = [], alpha = 0.1) {
  const excluded = new Set(excludedSections);
  const unigramCounts = new Float64Array(29);
  const bigramCounts = Array.from({ length: 29 }, () => new Float64Array(29));
  const trigramCounts = Array.from({ length: 841 }, () => new Float64Array(29));
  const bigramTotals = new Float64Array(29);
  const trigramTotals = new Float64Array(841);
  let total = 0;

  for (let section = 0; section < gold.sections.length; section++) {
    if (excluded.has(section)) continue;
    const sequence = extract(gold.sections[section].source_text);
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

  const logUnigram = Array.from(unigramCounts,
    (n) => Math.log((n + alpha) / (total + 29 * alpha)));
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

// Fixed-key Viterbi for one lane. Ciphertext F can be either transparent
// plaintext F (no advance) or an ordinary encrypted non-F (advance).
function decodeLaneUnigram(C, key, logProbability) {
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
      const plain = mod29(c - key[phase]);
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

function decodeFiveUnigram(lanes, key, logProbability) {
  const decoded = lanes.map((lane) => decodeLaneUnigram(lane, key, logProbability));
  if (decoded.some((x) => x === null)) return null;
  return { decoded, score: decoded.reduce((sum, x) => sum + x.score, 0) };
}

// Coordinate-EM with five independent lane clocks and one pooled key.
// The M-step pools all ordinary symbols assigned to the same shared key slot.
function refineFiveKey(lanes, logProbability, initialKey, maxSweeps = 25) {
  const key = initialKey.slice();
  let decoded = null;

  for (let sweep = 0; sweep < maxSweeps; sweep++) {
    decoded = decodeFiveUnigram(lanes, key, logProbability);
    if (!decoded) return null;
    const histograms = Array.from({ length: PERIOD }, () => new Float64Array(29));

    for (let lane = 0; lane < 5; lane++) {
      const C = lanes[lane];
      const path = decoded.decoded[lane];
      for (let i = 0; i < C.length; i++) {
        if (!path.holds[i]) histograms[path.phases[i]][C[i]]++;
      }
    }

    let changed = false;
    for (let phase = 0; phase < PERIOD; phase++) {
      const histogram = histograms[phase];
      if (histogram.reduce((a, b) => a + b, 0) === 0) continue;
      let bestKey = key[phase];
      let bestScore = -Infinity;
      for (let candidate = 0; candidate < 29; candidate++) {
        let score = 0;
        let legal = true;
        for (let c = 0; c < 29; c++) {
          const count = histogram[c];
          if (!count) continue;
          const plain = mod29(c - candidate);
          if (plain === 0) {
            legal = false;
            break;
          }
          score += count * logProbability[plain];
        }
        if (legal && score > bestScore) {
          bestScore = score;
          bestKey = candidate;
        }
      }
      if (bestKey !== key[phase]) {
        key[phase] = bestKey;
        changed = true;
      }
    }
    if (!changed) break;
  }

  decoded = decodeFiveUnigram(lanes, key, logProbability);
  return decoded ? { key, decoded } : null;
}

function recoverFiveKey(lanes, logProbability, seed, restarts) {
  const random = xorshift32(seed);
  const candidates = new Map();
  let validStarts = 0;
  for (let trial = 0; trial < restarts; trial++) {
    const initialKey = randomFeasibleKey(lanes, random);
    if (!initialKey) continue;
    const result = refineFiveKey(lanes, logProbability, initialKey);
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

// Joint reinterleaved GP29 trigram beam. The state carries five independent
// key phases plus the last two plaintext runes of the reconstructed full tape.
function decodeFiveJointBeam(C, key, lm, beamWidth = 20000) {
  const powers = [1, PERIOD, PERIOD ** 2, PERIOD ** 3, PERIOD ** 4];
  let beam = [{ code: 0, context: 0, score: 0, ways: 1 }];
  const history = [];

  for (let i = 0; i < C.length; i++) {
    const lane = i % 5;
    const power = powers[lane];
    const nextMap = new Map();

    for (let s = 0; s < beam.length; s++) {
      const state = beam[s];
      const phase = Math.floor(state.code / power) % PERIOD;
      const c = C[i];
      const choices = [];

      if (c === 0) choices.push({ plain: 0, code: state.code });
      const consumed = mod29(c - key[phase]);
      if (consumed !== 0) {
        const nextPhase = (phase + 1) % PERIOD;
        choices.push({
          plain: consumed,
          code: state.code + (nextPhase - phase) * power
        });
      }

      for (const choice of choices) {
        let increment;
        let context;
        if (i === 0) {
          increment = lm.logUnigram[choice.plain];
          context = choice.plain;
        } else if (i === 1) {
          const previous = state.context % 29;
          increment = lm.logBigram[previous][choice.plain];
          context = previous * 29 + choice.plain;
        } else {
          increment = lm.logTrigram[state.context][choice.plain];
          context = (state.context % 29) * 29 + choice.plain;
        }

        const score = state.score + increment;
        const id = choice.code * 841 + context;
        const old = nextMap.get(id);
        if (!old || score > old.score + 1e-12) {
          nextMap.set(id, {
            code: choice.code,
            context,
            score,
            ways: state.ways,
            previous: s,
            plain: choice.plain
          });
        } else if (Math.abs(score - old.score) <= 1e-12) {
          old.ways = Math.min(2, old.ways + state.ways);
        }
      }
    }

    if (nextMap.size === 0) return null;
    let candidates = Array.from(nextMap.values());
    if (candidates.length > beamWidth) {
      candidates.sort((a, b) => b.score - a.score);
      candidates = candidates.slice(0, beamWidth);
    }

    const previous = new Int32Array(candidates.length);
    const plain = new Uint8Array(candidates.length);
    const nextBeam = new Array(candidates.length);
    for (let j = 0; j < candidates.length; j++) {
      previous[j] = candidates[j].previous;
      plain[j] = candidates[j].plain;
      nextBeam[j] = {
        code: candidates[j].code,
        context: candidates[j].context,
        score: candidates[j].score,
        ways: candidates[j].ways
      };
    }
    history.push({ previous, plain });
    beam = nextBeam;
  }

  let bestIndex = -1;
  let bestScore = -Infinity;
  let bestWays = 0;
  for (let i = 0; i < beam.length; i++) {
    if (beam[i].score > bestScore + 1e-12) {
      bestIndex = i;
      bestScore = beam[i].score;
      bestWays = beam[i].ways;
    } else if (Math.abs(beam[i].score - bestScore) <= 1e-12) {
      bestWays = Math.min(2, bestWays + beam[i].ways);
    }
  }
  if (bestIndex < 0) return null;

  const plaintext = new Array(C.length);
  let index = bestIndex;
  for (let i = C.length - 1; i >= 0; i--) {
    plaintext[i] = history[i].plain[index];
    index = history[i].previous[index];
  }

  const replay = encryptFiveLane(plaintext, key);
  const exactReplay = replay.every((value, i) => value === C[i]);
  const holdPositions = plaintext.flatMap((value, i) => value === 0 ? [i] : []);
  return {
    plaintext,
    score: bestScore,
    scorePerSymbol: bestScore / C.length,
    uniqueBestPath: bestWays === 1,
    bestPathCountCappedAtTwo: bestWays,
    holdPositions,
    exactReplay
  };
}

function scoreSequence(sequence, lm, start = TRAIN_LENGTH) {
  let score = 0;
  for (let i = start; i < sequence.length; i++) {
    if (i === 0) score += lm.logUnigram[sequence[i]];
    else if (i === 1) score += lm.logBigram[sequence[i - 1]][sequence[i]];
    else score += lm.logTrigram[sequence[i - 2] * 29 + sequence[i - 1]][sequence[i]];
  }
  return { length: sequence.length - start, score, scorePerSymbol: score / (sequence.length - start) };
}

const runeByName = new Map(translit.map((name, i) => [name, i]));
const multi = ["ING", "TH", "NG", "EO", "OE", "AE", "IO", "IA", "EA"];
function nativeGP(text) {
  const normalized = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (const word of normalized.split(/[^A-Z]+/)) {
    for (let i = 0; i < word.length;) {
      const match = multi.find((pair) => word.startsWith(pair, i));
      const spelling = match === "ING" ? "NG" : match === "IO" ? "IA" : (match || word[i]);
      const rune = runeByName.get(spelling);
      assert.notEqual(rune, undefined, "Unsupported native GP spelling: " + spelling);
      out.push(rune);
      i += match ? match.length : 1;
    }
  }
  return out;
}

function runPlant(name, plaintext, seed, lm, restarts = 1000, keyOverride = null) {
  assert.ok(plaintext.length >= 1005, name + " plant too short");
  const P = plaintext.slice(0, 1005);
  const key = keyOverride || randomKey(seed);
  const C = encryptFiveLane(P, key);
  const lanes = splitLanes(C);
  const prefixLanes = lanes.map((lane) => lane.slice(0, TRAIN_ROWS));
  const recovered = recoverFiveKey(prefixLanes, lm.logUnigram, seed ^ 0x9E3779B9, restarts);
  const best = recovered.ranked[0] || null;
  if (!best) return { name, plantedKey: key, noCandidate: true, validStarts: recovered.validStarts };

  const decoded = decodeFiveJointBeam(C, best.key, lm, 20000);
  const exactMatches = decoded
    ? decoded.plaintext.reduce((sum, value, i) => sum + Number(value === P[i]), 0)
    : 0;
  const holdoutMatches = decoded
    ? decoded.plaintext.slice(TRAIN_LENGTH).reduce((sum, value, i) =>
        sum + Number(value === P[TRAIN_LENGTH + i]), 0)
    : 0;
  return {
    name,
    plantedKey: key,
    recoveredKey: best.key,
    exactKeyRecovery: best.key.every((value, i) => value === key[i]),
    topKeyTokens: tokenString(best.key),
    keyCandidateCount: recovered.distinctCandidates,
    keyScoreGap: recovered.scoreGap,
    keyBasin: best.basin,
    validStarts: recovered.validStarts,
    jointBeamExactRunes: exactMatches,
    jointBeamHoldoutExact: holdoutMatches,
    jointBeamUnique: decoded?.uniqueBestPath ?? false,
    jointBeamReplay: decoded?.exactReplay ?? false,
    predictedHoldoutScore: decoded ? scoreSequence(decoded.plaintext, lm).scorePerSymbol : null
  };
}

// Positive controls: three independent, continuous native-English sources,
// none of which is used to train the Cicada-native language model.
const lm = trainLanguageModel();
const authenticKoanKey = [0, 10, 4, 0, 1, 19, 0, 18, 4, 18, 9, 0, 18];
const controlFiles = [
  ["Gibran with authentic KOAN key", "resources/control/gibran_prophet_58585.txt", 0xA11CE000, authenticKoanKey],
  ["Gibran with random key", "resources/control/gibran_prophet_58585.txt", 0xA11CE001, null],
  ["Shakespeare with random key", "resources/control/shakespeare_first300k.txt", 0xA11CE002, null],
  ["Emerson with random key", "resources/control/emerson_essays_2944.txt", 0xA11CE003, null]
];
const plants = controlFiles.map(([name, file, seed, key]) =>
  runPlant(name, nativeGP(readText(file)), seed, lm, 1000, key));

const targetLanes = splitLanes(body);
const trainingLanes = targetLanes.map((lane) => lane.slice(0, TRAIN_ROWS));
const recovered = recoverFiveKey(trainingLanes, lm.logUnigram, 0x3301F013, 1500);
assert.ok(recovered.ranked.length > 0, "Original prefix produced no feasible period-13 key");
const selected = recovered.ranked[0];
const originalDecoded = decodeFiveJointBeam(body, selected.key, lm, 20000);
assert.ok(originalDecoded, "No legal joint F-hold path under selected key");
assert.ok(originalDecoded.exactReplay, "Original candidate did not forward-reencrypt exactly");

const random = xorshift32(0x3301BAD5);
const randomKeyScores = [];
for (let i = 0; i < 250; i++) {
  const key = Array.from({ length: PERIOD }, () => random() % 29);
  const decoded = decodeFiveUnigram(trainingLanes, key, lm.logUnigram);
  if (decoded) randomKeyScores.push(decoded.score);
}
randomKeyScores.sort((a, b) => a - b);
const targetHoldout = scoreSequence(originalDecoded.plaintext, lm);

const output = {
  model: {
    alphabet: "GP29, F=0",
    period: PERIOD,
    periodSource: "authentic solved LP1 KOAN key length 13; no period sweep",
    operation: "C=P+K[q_lane] mod29 for P!=F; P=F is transparent and does not advance that lane",
    key: "one unknown shared 13-rune additive key",
    lanes: "fixed row-major demultiplex, lane = original body index mod 5",
    initialPhases: [0, 0, 0, 0, 0],
    training: TRAIN_ROWS + " complete rows (" + TRAIN_LENGTH + " runes)",
    holdout: (body.length / 5 - TRAIN_ROWS) + " complete rows (" + HOLDOUT_LENGTH + " runes)",
    plaintextUsedForOriginalKeyFit: false,
    beamWidth: 20000
  },
  source: {
    originalImage40Sha256: imageHash,
    pageRuneCounts: printedPages.map((p) => p.indices.length),
    redHeadingLength: redHeading.length,
    bodyRunes: body.length,
    laneLengths: targetLanes.map((lane) => lane.length),
    originalBodyIoC: (() => {
      const counts = new Int32Array(29);
      for (const value of body) counts[value]++;
      return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (body.length * (body.length - 1));
    })()
  },
  positivePlants: plants,
  positivePlantExactKeyRecoveries: plants.filter((x) => x.exactKeyRecovery).length,
  positivePlantExactFullDecodes: plants.filter((x) => x.jointBeamExactRunes === 1005).length,
  originalTrainingKeyRecovery: {
    validStarts: recovered.validStarts,
    distinctCandidates: recovered.distinctCandidates,
    topVsRunnerUpUnigramGap: recovered.scoreGap,
    topCandidates: recovered.ranked.slice(0, 10).map((x) => ({
      key: x.key,
      keyTokens: tokenString(x.key),
      score: x.score,
      basin: x.basin
    })),
    bestVsRandomKeyMedian: recovered.ranked[0].score - randomKeyScores[Math.floor(randomKeyScores.length / 2)],
    bestVsRandomKeyMax: recovered.ranked[0].score - randomKeyScores[randomKeyScores.length - 1],
    randomKeySamples: randomKeyScores.length
  },
  originalFrozenKeyDecode: {
    key: selected.key,
    keyTokens: tokenString(selected.key),
    plaintext: tokenString(originalDecoded.plaintext),
    plaintextFirst200: tokenString(originalDecoded.plaintext.slice(0, 200)),
    plaintextLast200: tokenString(originalDecoded.plaintext.slice(-200)),
    holdoutTrigramScorePerSymbol: targetHoldout.scorePerSymbol,
    holdoutRunes: targetHoldout.length,
    uniqueBestPath: originalDecoded.uniqueBestPath,
    bestPathCountCappedAtTwo: originalDecoded.bestPathCountCappedAtTwo,
    holdCount: originalDecoded.holdPositions.length,
    holdPositions: originalDecoded.holdPositions,
    exactForwardReplay: originalDecoded.exactReplay
  }
};
process.stdout.write(JSON.stringify(output, null, 2) + "\n");
