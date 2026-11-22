"use strict";

/**
 * Exhaustive phase search for a page-15 prime-ordinal matrix LFSR.
 *
 * The 4x4 prime-ordinal matrix is source-derived from the LP2 page-15
 * Fibonacci-prime square. Its order is tested against 29^4-1. Since it is
 * primitive, scanning all 29^4-1 phases covers every nonzero initial state
 * for the scalar-output and block-output linear recurrence families below.
 *
 * Execute: node sims/fibonacci_square_lfsr_phase_search.cjs
 * Node.js 22; no external dependencies. This is a deliberately substantial
 * run (several exhaustive 707,280-phase scans).
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash} = require("node:crypto");

const ROOT = path.resolve(__dirname, "..");
const CORPUS_TEXT = fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8");
const CONTROL_TEXT = fs.readFileSync(
  path.join(ROOT, "resources", "control", "shakespeare_first300k.txt"), "utf8");
const DATA = JSON.parse(CORPUS_TEXT);
const MODULUS = 29;
const PERIOD = MODULUS ** 4 - 1;
const PERIOD_FACTORS = [2, 3, 5, 7, 421];
const SEED = [0, 1, 20, 19]; // first red p15 heading word: FULM

const PAGES = DATA.pages.filter(p => p.status === "unsolved" && p.indices.length);
const TRAIN = PAGES.filter(p => p.page >= 16 && p.page <= 18)
  .flatMap(p => p.indices);
const HOLDOUT = PAGES.filter(p => p.page >= 19 && p.page <= 22)
  .flatMap(p => p.indices);
const AFTER_SQUARE = PAGES.filter(p => p.page >= 16).flatMap(p => p.indices);

const FIBONACCI = [
  [13, 21, 34, 55],
  [8, 0, 1, 89],
  [5, 3, 2, 144],
  [987, 610, 377, 233]
];
const PRIME_ORDINAL = FIBONACCI.map(row => row.map(x => x + 1))
  .map(row => row.map(x => x % MODULUS));
const MATRIX = [
  [14, 22, 6, 27],
  [9, 1, 2, 3],
  [6, 4, 3, 0],
  [2, 2, 1, 2]
];

const ALPHABET = [
  "F", "U", "TH", "O", "R", "C", "G", "W", "H", "N", "I", "J",
  "EO", "P", "X", "S", "T", "B", "E", "M", "L", "NG", "OE",
  "D", "A", "AE", "Y", "IA", "EA"
];
const TRANSLIT = new Map(ALPHABET.map((glyph, index) => [glyph, index]));

function mod(x) {
  return ((x % MODULUS) + MODULUS) % MODULUS;
}

function scalarInverse(a) {
  for (let x = 1; x < MODULUS; x++) {
    if (mod(a * x) === 1) return x;
  }
  throw new Error("Noninvertible F29 scalar");
}

function transpose(m) {
  return m[0].map((_, column) => m.map(row => row[column]));
}

function matrixMultiply(a, b) {
  return a.map(row => b[0].map((_, column) =>
    mod(row.reduce((sum, x, k) => sum + x * b[k][column], 0))));
}

function matrixVector(m, v) {
  return m.map(row => mod(row.reduce((sum, x, j) => sum + x * v[j], 0)));
}

function matrixInverse(m) {
  const n = m.length;
  const a = m.map((row, i) =>
    row.map(mod).concat(Array.from({length: n}, (_, j) => i === j ? 1 : 0)));
  for (let column = 0; column < n; column++) {
    let pivot = column;
    while (pivot < n && a[pivot][column] === 0) pivot++;
    if (pivot === n) return null;
    [a[pivot], a[column]] = [a[column], a[pivot]];
    const scale = scalarInverse(a[column][column]);
    a[column] = a[column].map(x => mod(x * scale));
    for (let row = 0; row < n; row++) {
      if (row === column) continue;
      const factor = a[row][column];
      a[row] = a[row].map((x, j) =>
        mod(x - factor * a[column][j]));
    }
  }
  return a.map(row => row.slice(n));
}

function matrixPower(m, exponent) {
  let result = [
    [1, 0, 0, 0], [0, 1, 0, 0],
    [0, 0, 1, 0], [0, 0, 0, 1]
  ];
  let base = m.map(row => row.map(mod));
  let n = exponent;
  while (n > 0) {
    if (n % 2 === 1) result = matrixMultiply(result, base);
    base = matrixMultiply(base, base);
    n = Math.floor(n / 2);
  }
  return result;
}

function sameMatrix(a, b) {
  return a.every((row, i) => row.every((x, j) => x === b[i][j]));
}

function sameVector(a, b) {
  return a.every((x, i) => x === b[i]);
}

function verifyPrimitivePeriod(m) {
  const identity = [
    [1, 0, 0, 0], [0, 1, 0, 0],
    [0, 0, 1, 0], [0, 0, 0, 1]
  ];
  assert.ok(sameMatrix(matrixPower(m, PERIOD), identity));
  const witnesses = PERIOD_FACTORS.map(q => ({
    prime: q,
    smallerExponentIsIdentity: sameMatrix(matrixPower(m, PERIOD / q), identity)
  }));
  assert.ok(witnesses.every(x => !x.smallerExponentIsIdentity));
  const terminalSeed = (() => {
    let v = SEED.slice();
    for (let i = 0; i < PERIOD; i++) v = matrixVector(m, v);
    return v;
  })();
  assert.ok(sameVector(terminalSeed, SEED));
  const seedWitnesses = PERIOD_FACTORS.map(q => ({
    prime: q,
    seedReturnsAtPeriodOverPrime: sameVector(
      matrixVector(matrixPower(m, PERIOD / q), SEED), SEED)
  }));
  assert.ok(seedWitnesses.every(x => !x.seedReturnsAtPeriodOverPrime));
  return {period: PERIOD, factors: PERIOD_FACTORS, witnesses, seedWitnesses};
}

function buildStreams(m) {
  const scalar = new Int8Array(PERIOD);
  const blocks = new Int8Array(PERIOD * 4);
  let state = SEED.slice();
  for (let t = 0; t < PERIOD; t++) {
    for (let j = 0; j < 4; j++) blocks[t * 4 + j] = state[j];
    scalar[t] = state[0];
    state = matrixVector(m, state);
  }
  assert.ok(sameVector(state, SEED));
  return {scalar, blocks};
}

function encodeEnglishWord(word) {
  const source = word.toUpperCase()
    .replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S");
  const output = [];
  for (let i = 0; i < source.length;) {
    const digraph = source.slice(i, i + 2);
    if (TRANSLIT.has(digraph)) {
      output.push(TRANSLIT.get(digraph));
      i += 2;
    } else {
      const value = TRANSLIT.get(source[i]);
      if (value === undefined) throw new Error("Unknown GP control grapheme");
      output.push(value);
      i++;
    }
  }
  return output;
}

function encodeControl(text) {
  return (text.match(/[A-Za-z]+/g) || []).flatMap(encodeEnglishWord);
}

function buildBigramModel(text) {
  const source = encodeControl(text);
  const counts = new Float64Array(MODULUS * MODULUS);
  const rowCounts = new Float64Array(MODULUS);
  for (let i = 1; i < source.length; i++) {
    const a = source[i - 1], b = source[i];
    counts[a * MODULUS + b]++;
    rowCounts[a]++;
  }
  const alpha = 0.1;
  const logp = new Float32Array(MODULUS * MODULUS);
  for (let a = 0; a < MODULUS; a++) {
    for (let b = 0; b < MODULUS; b++) {
      logp[a * MODULUS + b] =
        Math.log((counts[a * MODULUS + b] + alpha) /
          (rowCounts[a] + alpha * MODULUS));
    }
  }
  return {source, logp};
}

function makeLookupTables() {
  const minus = new Int8Array(MODULUS * MODULUS);
  const plus = new Int8Array(MODULUS * MODULUS);
  for (let c = 0; c < MODULUS; c++) {
    for (let k = 0; k < MODULUS; k++) {
      minus[c * MODULUS + k] = mod(c - k);
      plus[c * MODULUS + k] = mod(c + k);
    }
  }
  return {minus, plus};
}

const LANGUAGE = buildBigramModel(CONTROL_TEXT);
const LOOKUP = makeLookupTables();

function stats(input) {
  const histogram = Array(MODULUS).fill(0);
  for (const value of input) histogram[value]++;
  const sorted = histogram.slice().sort((a, b) => b - a);
  return {
    ioc: histogram.reduce((sum, count) => sum + count * (count - 1), 0) /
      (input.length * (input.length - 1)),
    top12: sorted.slice(0, 12).reduce((sum, count) => sum + count, 0)
  };
}

function bigramScore(input, previous = null) {
  const {logp} = LANGUAGE;
  let total = 0;
  if (previous !== null) total += logp[previous * MODULUS + input[0]];
  for (let i = 1; i < input.length; i++) {
    total += logp[input[i - 1] * MODULUS + input[i]];
  }
  return total / (input.length - 1 + (previous !== null ? 1 : 0));
}

function keepTop(top, candidate, limit = 10) {
  if (top.length === limit && candidate.score <= top[top.length - 1].score) return;
  top.push(candidate);
  top.sort((a, b) => b.score - a.score);
  if (top.length > limit) top.pop();
}

/** Exhaust all 707,280 scalar-output phases and both additive signs. */
function searchScalar(ciphertext, key) {
  const {minus, plus} = LOOKUP;
  const minusScores = new Float32Array(PERIOD);
  const plusScores = new Float32Array(PERIOD);
  const topMinus = [], topPlus = [];
  for (let phase = 0; phase < PERIOD; phase++) {
    let pointer = phase;
    let prevMinus = minus[ciphertext[0] * MODULUS + key[pointer]];
    let prevPlus = plus[ciphertext[0] * MODULUS + key[pointer]];
    let scoreMinus = 0, scorePlus = 0;
    for (let i = 1; i < ciphertext.length; i++) {
      pointer++;
      if (pointer === PERIOD) pointer = 0;
      const value = key[pointer];
      const currentMinus = minus[ciphertext[i] * MODULUS + value];
      const currentPlus = plus[ciphertext[i] * MODULUS + value];
      scoreMinus += LANGUAGE.logp[prevMinus * MODULUS + currentMinus];
      scorePlus += LANGUAGE.logp[prevPlus * MODULUS + currentPlus];
      prevMinus = currentMinus;
      prevPlus = currentPlus;
    }
    scoreMinus /= ciphertext.length - 1;
    scorePlus /= ciphertext.length - 1;
    minusScores[phase] = scoreMinus;
    plusScores[phase] = scorePlus;
    keepTop(topMinus, {phase, score: scoreMinus});
    keepTop(topPlus, {phase, score: scorePlus});
  }
  const sorted = Array.from(minusScores).sort((a, b) => a - b);
  return {
    topMinus, topPlus,
    phaseScoreDistribution: {
      mean: minusScores.reduce((sum, x) => sum + x, 0) / PERIOD,
      percentile99: sorted[Math.floor(0.99 * PERIOD)]
    }
  };
}

/** Exhaust all 707,280 four-symbol block-state phases and both signs. */
function searchBlocks(ciphertext, blockKey) {
  const {minus, plus} = LOOKUP;
  const minusScores = new Float32Array(PERIOD);
  const plusScores = new Float32Array(PERIOD);
  const topMinus = [], topPlus = [];
  for (let phase = 0; phase < PERIOD; phase++) {
    let previousMinus = minus[ciphertext[0] * MODULUS + blockKey[phase * 4]];
    let previousPlus = plus[ciphertext[0] * MODULUS + blockKey[phase * 4]];
    let scoreMinus = 0, scorePlus = 0;
    for (let i = 1; i < ciphertext.length; i++) {
      const block = (phase + Math.floor(i / 4)) % PERIOD;
      const value = blockKey[block * 4 + (i % 4)];
      const currentMinus = minus[ciphertext[i] * MODULUS + value];
      const currentPlus = plus[ciphertext[i] * MODULUS + value];
      scoreMinus += LANGUAGE.logp[previousMinus * MODULUS + currentMinus];
      scorePlus += LANGUAGE.logp[previousPlus * MODULUS + currentPlus];
      previousMinus = currentMinus;
      previousPlus = currentPlus;
    }
    scoreMinus /= ciphertext.length - 1;
    scorePlus /= ciphertext.length - 1;
    minusScores[phase] = scoreMinus;
    plusScores[phase] = scorePlus;
    keepTop(topMinus, {phase, score: scoreMinus});
    keepTop(topPlus, {phase, score: scorePlus});
  }
  const sorted = Array.from(minusScores).sort((a, b) => a - b);
  return {
    topMinus, topPlus,
    phaseScoreDistribution: {
      mean: minusScores.reduce((sum, x) => sum + x, 0) / PERIOD,
      percentile99: sorted[Math.floor(0.99 * PERIOD)]
    }
  };
}

function decodeScalar(ciphertext, key, phase, sign) {
  return ciphertext.map((value, i) =>
    mod(value + sign * key[(phase + i) % PERIOD]));
}

function decodeBlocks(ciphertext, key, phase, sign) {
  return ciphertext.map((value, i) => {
    const block = (phase + Math.floor(i / 4)) % PERIOD;
    return mod(value + sign * key[block * 4 + (i % 4)]);
  });
}

function analyzeScalar(ciphertext, holdout, after, key, candidate) {
  const sign = -1;
  const trainingPlain = decodeScalar(ciphertext, key, candidate.phase, sign);
  const holdoutPlain = decodeScalar(holdout, key,
    (candidate.phase + ciphertext.length) % PERIOD, sign);
  const afterPlain = decodeScalar(after, key, candidate.phase, sign);
  return {
    phase: candidate.phase,
    trainingBigramLogMean: bigramScore(trainingPlain),
    holdoutBigramLogMean: bigramScore(holdoutPlain, trainingPlain.at(-1)),
    fullAfterSquareBigramLogMean: bigramScore(afterPlain),
    fullAfterSquareStats: stats(afterPlain)
  };
}

function analyzeBlocks(ciphertext, holdout, after, key, candidate) {
  const sign = -1;
  const trainingPlain = decodeBlocks(ciphertext, key, candidate.phase, sign);
  const holdoutPlain = decodeBlocks(holdout, key,
    (candidate.phase + ciphertext.length / 4) % PERIOD, sign);
  const afterPlain = decodeBlocks(after, key, candidate.phase, sign);
  return {
    phase: candidate.phase,
    trainingBigramLogMean: bigramScore(trainingPlain),
    holdoutBigramLogMean: bigramScore(holdoutPlain, trainingPlain.at(-1)),
    fullAfterSquareBigramLogMean: bigramScore(afterPlain),
    fullAfterSquareStats: stats(afterPlain)
  };
}

function run() {
  assert.equal(PAGES.length, 55);
  assert.equal(TRAIN.length, 800);
  assert.equal(HOLDOUT.length, 944);
  assert.equal(AFTER_SQUARE.length, 9194);
  const p15 = DATA.pages.find(p => p.page === 15);
  assert.deepEqual(p15.indices.slice(0, 4), SEED);
  assert.deepEqual(PRIME_ORDINAL, MATRIX);

  const inverse = matrixInverse(MATRIX);
  assert.ok(inverse);
  const transitions = [
    ["forward", MATRIX],
    ["inverse", inverse],
    ["transpose", transpose(MATRIX)],
    ["inverse-transpose", transpose(inverse)]
  ];
  const periodProof = transitions.map(([name, matrix]) => ({
    name, ...verifyPrimitivePeriod(matrix)
  }));

  const forward = buildStreams(MATRIX);
  const inverseStreams = buildStreams(inverse);
  const transposeStreams = buildStreams(transpose(MATRIX));
  const inverseTransposeStreams = buildStreams(transpose(inverse));

  const models = [];
  const scalarForward = searchScalar(TRAIN, forward.scalar);
  models.push({
    family: "scalar-output", transition: "forward",
    best: analyzeScalar(TRAIN, HOLDOUT, AFTER_SQUARE, forward.scalar,
      scalarForward.topMinus[0]),
    topMinus: scalarForward.topMinus.slice(0, 5),
    topPlus: scalarForward.topPlus.slice(0, 3),
    phaseScoreDistribution: scalarForward.phaseScoreDistribution
  });
  const scalarInverse = searchScalar(TRAIN, inverseStreams.scalar);
  models.push({
    family: "scalar-output", transition: "inverse",
    best: analyzeScalar(TRAIN, HOLDOUT, AFTER_SQUARE, inverseStreams.scalar,
      scalarInverse.topMinus[0]),
    topMinus: scalarInverse.topMinus.slice(0, 5),
    topPlus: scalarInverse.topPlus.slice(0, 3),
    phaseScoreDistribution: scalarInverse.phaseScoreDistribution
  });

  for (const [transition, streams] of [
    ["forward", forward],
    ["inverse", inverseStreams],
    ["transpose", transposeStreams],
    ["inverse-transpose", inverseTransposeStreams]
  ]) {
    const result = searchBlocks(TRAIN, streams.blocks);
    models.push({
      family: "four-symbol-block-output", transition,
      best: analyzeBlocks(TRAIN, HOLDOUT, AFTER_SQUARE, streams.blocks,
        result.topMinus[0]),
      topMinus: result.topMinus.slice(0, 5),
      topPlus: result.topPlus.slice(0, 3),
      phaseScoreDistribution: result.phaseScoreDistribution
    });
  }

  // Blind positive controls: the same exhaustive search must recover the
  // exact hidden phase in both scalar and four-symbol block constructions.
  const control = LANGUAGE.source.slice(0, 256);
  assert.equal(control.length, 256);
  const scalarPhase = 123456;
  const scalarPlant = control.map((x, i) =>
    mod(x + forward.scalar[(scalarPhase + i) % PERIOD]));
  const scalarPositive = searchScalar(scalarPlant, forward.scalar);
  assert.equal(scalarPositive.topMinus[0].phase, scalarPhase);

  const blockPhase = 234567;
  const blockPlant = control.map((x, i) => mod(x +
    forward.blocks[((blockPhase + Math.floor(i / 4)) % PERIOD) * 4 + (i % 4)]));
  const blockPositive = searchBlocks(blockPlant, forward.blocks);
  assert.equal(blockPositive.topMinus[0].phase, blockPhase);

  const controlTrain = LANGUAGE.source.slice(0, TRAIN.length);
  const controlHoldout = LANGUAGE.source.slice(
    TRAIN.length, TRAIN.length + HOLDOUT.length);
  const controlAfter = LANGUAGE.source.slice(0, AFTER_SQUARE.length);

  return {
    input: {
      corpusSha256: createHash("sha256").update(CORPUS_TEXT).digest("hex"),
      controlSha256: createHash("sha256").update(CONTROL_TEXT).digest("hex"),
      physicalRunePages: PAGES.length,
      fullUnsolvedRunes: PAGES.reduce((sum, page) => sum + page.indices.length, 0),
      trainingPages: [16, 17, 18],
      trainingRunes: TRAIN.length,
      holdoutPages: [19, 20, 21, 22],
      holdoutRunes: HOLDOUT.length,
      afterSquareRunes: AFTER_SQUARE.length
    },
    sourceDerived: {
      seed: SEED,
      primeOrdinalMatrix: MATRIX,
      inverseMatrix: inverse,
      periodProof,
      period: PERIOD,
      periodFactorization: "2^4 * 3 * 5 * 7 * 421",
      scalarSeedCoverage:
        "A primitive 4x4 F29 transition cycles every nonzero state; scanning all phases covers every nonzero seed for a fixed scalar output. The transpose also has full order, so every nonzero linear output functional is phase-equivalent."
    },
    languageModel: {
      source: "resources/control/shakespeare_first300k.txt",
      approximateGPTransliteration: true,
      trainingBigramLogMean: bigramScore(controlTrain),
      holdoutBigramLogMean: bigramScore(controlHoldout, controlTrain.at(-1)),
      fullAfterSquareBigramLogMean: bigramScore(controlAfter),
      trainingStats: stats(controlTrain),
      holdoutStats: stats(controlHoldout)
    },
    exhaustivePhaseSearch: {
      phasesPerModel: PERIOD,
      bothAdditiveSigns: true,
      models
    },
    positiveControls: {
      scalarOutput: {
        length: scalarPlant.length,
        hiddenPhase: scalarPhase,
        recoveredPhase: scalarPositive.topMinus[0].phase,
        exactTopRank: 1
      },
      fourSymbolBlockOutput: {
        length: blockPlant.length,
        hiddenPhase: blockPhase,
        recoveredPhase: blockPositive.topMinus[0].phase,
        exactTopRank: 1
      }
    },
    conclusion: "The source-derived prime-ordinal matrix has maximal period, but the exhaustive continuous GP29 additive scalar- and block-output LFSR families tested here do not recover English-like LP2 plaintext."
  };
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {
  mod, matrixInverse, matrixPower, verifyPrimitivePeriod,
  buildStreams, encodeEnglishWord, buildBigramModel,
  searchScalar, searchBlocks, run
};
