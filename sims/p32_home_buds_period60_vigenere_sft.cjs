"use strict";

/**
 * P32 HOME/BUDS +60 periodic-Vigenere gate.
 *
 * Source premise:
 * - p32 is independently selected by the signed 2016 tree image.
 * - literal HOME begins at local rune 33 and literal BUDS at local rune 93.
 * - the starts differ by 60, matching the cross-round image-dimension shift
 *   and the printed numerical-table radix.
 *
 * Tests:
 * 1. key-independent lag-60 equality for book-global and page-reset exact
 *    additive GP29 pads;
 * 2. p32-only lag-difference plausibility under native GP controls;
 * 3. exact word-boundary-aware Viterbi optimum for a 60-period Vigenere on
 *    the 121-rune p32, with HOME/BUDS treated as literal plaintext, which
 *    fixes key phases 33..36 to zero;
 * 4. a conditioned source-histogram shuffle null holding the eight HOME/BUDS
 *    source glyphs fixed.
 *
 * Run:
 *   node sims/p32_home_buds_period60_vigenere_sft.cjs
 *
 * Dependencies: Node.js >=18 built-ins and checked-in repository resources.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const resource = (name) =>
  fs.readFileSync(path.join(ROOT, name), "utf8");
const corpus = JSON.parse(resource("resources/liber-primus/lp2-corpus.json"));
const transcription = resource("resources/lp2-transcription.txt");
const controls = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
];

const MOD = 29;
const PERIOD = 60;
const TOTAL = 12956;
const HOME = 33;
const BUDS = 93;
const page32 = corpus.pages.find((page) => page.page === 32);
assert.ok(page32);
const p32 = page32.indices;
assert.equal(p32.length, 121);
assert.equal(BUDS - HOME, PERIOD);

/** @param {number[]} values @returns {string} */
function translit(values) {
  return values.map((value) => corpus.translit[value]).join("");
}
assert.equal(translit(p32.slice(HOME, HOME + 4)), "HOME");
assert.equal(translit(p32.slice(BUDS, BUDS + 4)), "BUDS");

/** @param {string} input @returns {number[][]} */
function gpWords(input) {
  const map = new Map(corpus.translit.map((symbol, index) => [symbol, index]));
  const result = [];
  for (let word of (input.toUpperCase().match(/[A-Z]+/g) || [])) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S");
    const encoded = [];
    for (let offset = 0; offset < word.length;) {
      const pair = word.slice(offset, offset + 2);
      if (map.has(pair)) {
        encoded.push(map.get(pair));
        offset += 2;
      } else {
        const value = map.get(word[offset]);
        if (value !== undefined) encoded.push(value);
        offset++;
      }
    }
    if (encoded.length) result.push(encoded);
  }
  return result;
}

/** @param {string} input @returns {number[]} */
function toGp(input) {
  return gpWords(input).flat();
}

/** @param {number} seed @returns {()=>number} */
function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/**
 * @param {number[]} values
 * @param {number} actual
 */
function summary(values, actual) {
  const sorted = [...values].sort((a, b) => a - b);
  const mean = sorted.reduce((sum, value) => sum + value, 0) / sorted.length;
  const q = (p) => sorted[Math.floor(p * (sorted.length - 1))];
  return {
    draws: sorted.length,
    min: sorted[0],
    q01: q(0.01),
    q05: q(0.05),
    median: q(0.5),
    q95: q(0.95),
    q99: q(0.99),
    max: sorted.at(-1),
    mean,
    atOrBelowActual: sorted.filter((value) => value <= actual).length,
    atOrAboveActual: sorted.filter((value) => value >= actual).length
  };
}

const unsolvedPages = corpus.pages
  .filter((page) => page.status === "unsolved" && page.indices.length > 0);
const cipher = unsolvedPages.flatMap((page) => page.indices);
const pageLengths = unsolvedPages.map((page) => page.indices.length);
assert.equal(cipher.length, TOTAL);

/** @param {number[]} source @param {number} start @returns {number} */
function globalLag60Equality(source, start = 0) {
  let equalities = 0;
  for (let i = 0; i < TOTAL - PERIOD; i++) {
    if (source[start + i] === source[start + i + PERIOD]) equalities++;
  }
  return equalities;
}

/** @param {number[]} source @param {number} start */
function pageResetLag60Equality(source, start = 0) {
  let equalities = 0;
  let eligible = 0;
  let offset = start;
  for (const length of pageLengths) {
    for (let i = 0; i + PERIOD < length; i++) {
      if (source[offset + i] === source[offset + i + PERIOD]) equalities++;
      eligible++;
    }
    offset += length;
  }
  return {equalities, eligible};
}

const bookGlobal = globalLag60Equality(cipher);
const pageReset = pageResetLag60Equality(cipher);
assert.equal(bookGlobal, 470);
assert.deepEqual(pageReset, {equalities: 365, eligible: 9656});

const nativeLag60 = [];
let controlIndex = 0;
for (const [name, file] of controls) {
  const source = toGp(resource(file));
  const random = xorshift32(0x60003301 + controlIndex * 0x111);
  controlIndex++;
  const global = [];
  const reset = [];
  for (let trial = 0; trial < 2000; trial++) {
    const start = random() % (source.length - TOTAL + 1);
    global.push(globalLag60Equality(source, start));
    reset.push(pageResetLag60Equality(source, start).equalities);
  }
  const globalStats = summary(global, bookGlobal);
  const resetStats = summary(reset, pageReset.equalities);
  assert.equal(globalStats.atOrBelowActual, 0);
  assert.equal(resetStats.atOrBelowActual, 0);
  nativeLag60.push({
    name,
    gpRunes: source.length,
    global: globalStats,
    pageReset: resetStats
  });
}

// P32-only lag-60 difference profile. The exact direct-period hypothesis is
// not key-independently rejected on this single page.
const p32Difference = Array(MOD).fill(0);
for (let i = 0; i + PERIOD < p32.length; i++) {
  p32Difference[(p32[i + PERIOD] - p32[i] + MOD) % MOD]++;
}
assert.deepEqual(p32Difference, [
  5,0,3,4,2,3,1,0,0,3,1,1,1,1,3,4,3,3,3,3,4,2,2,3,2,2,1,1,0
]);

// Preserve the original p32 printed word lengths.
const p32Raw = transcription.split("%")[32].replace(/\/\s*/g, "");
const sourceWords = p32Raw.match(/[\u16A0-\u16FF]+/gu) || [];
const wordLengths = sourceWords.map((word) => [...word].length);
assert.deepEqual(wordLengths,
  [1,3,5,11,5,5,3,11,6,9,5,8,4,9,4,8,2,3,2,8,5,4]);
assert.equal(wordLengths.reduce((sum, n) => sum + n, 0), 121);

const wordStart = new Uint8Array(121);
const wordEnd = new Uint8Array(121);
const withinWord = new Uint8Array(120);
let wordOffset = 0;
for (const length of wordLengths) {
  wordStart[wordOffset] = 1;
  wordEnd[wordOffset + length - 1] = 1;
  for (let i = wordOffset; i < wordOffset + length - 1; i++) withinWord[i] = 1;
  wordOffset += length;
}

// Fixed boundary-aware GP language model.
const alpha = 0.5;
const startCount = Array(MOD).fill(alpha);
const endCount = Array(MOD).fill(alpha);
const bigramCount = Array.from({length: MOD}, () => Array(MOD).fill(alpha));
for (const [, file] of controls) {
  for (const word of gpWords(resource(file))) {
    startCount[word[0]]++;
    endCount[word.at(-1)]++;
    for (let i = 0; i + 1 < word.length; i++) {
      bigramCount[word[i]][word[i + 1]]++;
    }
  }
}

/** @param {number[]} values @returns {number[]} */
function normalizeLog(values) {
  const total = values.reduce((sum, value) => sum + value, 0);
  return values.map((value) => Math.log(value / total));
}
const logStart = normalizeLog(startCount);
const logEnd = normalizeLog(endCount);
const logBigram = bigramCount.map(normalizeLog);

/**
 * Exact cycle Viterbi score for a 60-period additive Vigenere on one 121-rune
 * page, fixing phases 33..36 to zero so HOME and BUDS are literal plaintext.
 * @param {number[]} source
 * @param {boolean} keepPath
 */
function solvePeriod60(source, keepPath = false) {
  const decoded = Array.from({length: 121}, (_, position) =>
    Int8Array.from({length: MOD},
      (_, key) => (source[position] - key + MOD) % MOD));

  const unary = Array.from({length: PERIOD}, () => new Float64Array(MOD));
  for (let phase = 0; phase < PERIOD; phase++) {
    for (let key = 0; key < MOD; key++) {
      const positions = phase === 0 ? [0, 60, 120] : [phase, phase + 60];
      let score = 0;
      for (const position of positions) {
        const plain = decoded[position][key];
        if (wordStart[position]) score += logStart[plain];
        if (wordEnd[position]) score += logEnd[plain];
      }
      unary[phase][key] = score;
    }
  }

  /** @param {number} position @param {number} leftKey @param {number} rightKey */
  function edge(position, leftKey, rightKey) {
    if (!withinWord[position]) return 0;
    return logBigram[decoded[position][leftKey]][decoded[position + 1][rightKey]];
  }

  let bestScore = -Infinity;
  let bestKey = null;
  for (let key0 = 0; key0 < MOD; key0++) {
    let dp = new Float64Array(MOD);
    for (let key = 0; key < MOD; key++) dp[key] = -Infinity;
    dp[key0] = unary[0][key0];

    /** @type {Array<number[]|null>|null} */
    let paths = null;
    if (keepPath) {
      paths = Array(MOD).fill(null);
      paths[key0] = [key0];
    }

    for (let phase = 1; phase < PERIOD; phase++) {
      const next = new Float64Array(MOD);
      for (let key = 0; key < MOD; key++) next[key] = -Infinity;
      /** @type {Array<number[]|null>|null} */
      const nextPaths = keepPath ? Array(MOD).fill(null) : null;
      const fixedZero = phase >= 33 && phase <= 36;
      const firstKey = fixedZero ? 0 : 0;
      const lastKey = fixedZero ? 0 : MOD - 1;
      for (let key = firstKey; key <= lastKey; key++) {
        let maximum = -Infinity;
        let winner = -1;
        for (let previous = 0; previous < MOD; previous++) {
          if (dp[previous] === -Infinity) continue;
          const value = dp[previous]
            + edge(phase - 1, previous, key)
            + edge(phase + 59, previous, key);
          if (value > maximum) {
            maximum = value;
            winner = previous;
          }
        }
        next[key] = maximum + unary[phase][key];
        if (keepPath) {
          assert.ok(paths);
          assert.ok(nextPaths);
          assert.ok(paths[winner]);
          nextPaths[key] = paths[winner].concat(key);
        }
      }
      dp = next;
      if (keepPath) paths = nextPaths;
    }

    for (let key59 = 0; key59 < MOD; key59++) {
      if (dp[key59] === -Infinity) continue;
      const score = dp[key59]
        + edge(59, key59, key0)
        + edge(119, key59, key0);
      if (score > bestScore) {
        bestScore = score;
        if (keepPath) {
          assert.ok(paths && paths[key59]);
          bestKey = paths[key59];
        }
      }
    }
  }

  if (!keepPath) return {score: bestScore};
  assert.ok(bestKey);
  const plain = source.map((rune, index) =>
    (rune - bestKey[index % PERIOD] + MOD) % MOD);
  let offset = 0;
  const words = wordLengths.map((length) => {
    const word = translit(plain.slice(offset, offset + length));
    offset += length;
    return word;
  });
  return {score: bestScore, key: bestKey, plain, words, text: words.join(" ")};
}

const optimized = solvePeriod60(p32, true);
assert.equal(optimized.score, -306.2484532924613);
assert.equal(translit(optimized.plain.slice(HOME, HOME + 4)), "HOME");
assert.equal(translit(optimized.plain.slice(BUDS, BUDS + 4)), "BUDS");
assert.equal(optimized.text,
  "TH HED PRELD ITWHEYOUSPE SERIS NDERS ONS HOMEREARCTYO METESE " +
  "ASTREDEATHE DELLE ALLYOUND THEST SEREACOFUN YORE HANOBUDS WO NDE " +
  "SE WHINGSELE HAREE WEND");

// Condition on the discovered HOME/BUDS source glyphs and exact p32 rune
// multiset. Shuffle all other positions, preserving word boundaries by index.
const fixedPositions = new Set([33,34,35,36,93,94,95,96]);
const movablePositions = [];
const movableValues = [];
for (let i = 0; i < p32.length; i++) {
  if (!fixedPositions.has(i)) {
    movablePositions.push(i);
    movableValues.push(p32[i]);
  }
}

const random = xorshift32(0x60b0d5);
const shuffleScores = [];
for (let trial = 0; trial < 1000; trial++) {
  const values = [...movableValues];
  for (let i = values.length - 1; i > 0; i--) {
    const j = random() % (i + 1);
    [values[i], values[j]] = [values[j], values[i]];
  }
  const candidate = [...p32];
  movablePositions.forEach((position, index) => {
    candidate[position] = values[index];
  });
  shuffleScores.push(solvePeriod60(candidate, false).score);
}
const shuffleSummary = summary(shuffleScores, optimized.score);
assert.equal(shuffleSummary.atOrAboveActual, 108);
const conditionalUpper = (shuffleSummary.atOrAboveActual + 1) /
  (shuffleSummary.draws + 1);
assert.equal(conditionalUpper, 109 / 1001);

console.log(JSON.stringify({
  classification:
    "Bounded negative for literal HOME/BUDS-selected p32 period-60 Vigenere; no plaintext or key recovered",
  source: {
    p32Runes: p32.length,
    homeStart: HOME,
    budsStart: BUDS,
    separation: BUDS - HOME,
    wordLengths
  },
  bookWidePeriod60: {
    global: {equalities: bookGlobal, eligible: TOTAL - PERIOD},
    pageReset,
    nativeControls: nativeLag60
  },
  p32: {
    lag60DifferenceHistogram: p32Difference,
    optimizedScore: optimized.score,
    optimizedText: optimized.text,
    optimizedKey: optimized.key,
    conditionedShuffleNull: shuffleSummary,
    plusOneUpperTail: conditionalUpper
  },
  decision:
    "Book-global and page-reset exact 60-period additive pads are key-independently rejected by native-GP equality controls. P32 alone remains algebraically compatible, but its best HOME/BUDS-cribbed word-boundary Vigenere fit is not exceptional: 108/1000 conditioned p32 rune shuffles score at least as well. Do not promote the English-looking optimum or fit extra phases without another source instruction."
}, null, 2));
