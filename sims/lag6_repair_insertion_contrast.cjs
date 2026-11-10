"use strict";

/**
 * A joint forward-generator challenge for the externally observed within-word
 * six-rune affine echo. The proposed collision repair is explicitly a
 * *lossy forward hypothesis*, not an identified reversible Cicada cipher.
 *
 * Compare:
 *   M0: iid uniform GP output with 81% immediate-collision rejection and
 *       uniform nonrepeating replacement;
 *   M1: the same process except that a collision inside a word after position
 *       five is repaired by T(c[i-6]) = 24-2*c[i-6] mod29 (with fallback
 *       to uniform nonrepeat only if T would itself repeat the last glyph).
 *
 * Both models use the original word-length and physical-page layout and keep
 * state across word boundaries. The statistic suite exposes which independent
 * manuscript constraints are explained and which remain unexplained.
 *
 * Inversion discriminant: a one-rune NULL inserted specifically to split AA
 * into A-NULL-A must create a length-three palindrome. T sites with a
 * following rune inside the same word are checked for this exact necessity.
 *
 * @module lag6_repair_insertion_contrast
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash} = require("node:crypto");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const {words: wordsFromMaster} = require("./cross_word_repeat_invariant.cjs");
const {random32} = require("./lag6_conditioned_echo.cjs");

const ROOT = path.resolve(__dirname, "..");
const RAW = fs.readFileSync(path.join(ROOT,
  "resources/lp2-transcription.txt"), "utf8");
const MASTER = fs.readFileSync(path.join(ROOT,
  "resources/transcriptions/liber_primus_master.txt"), "utf8");
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const WORDS = parseSharedCorpus().words;
const RUNE_IDS = new Map(DATA.runes.map((rune, index) => [rune, index]));
const PAGE_RECORDS = DATA.pages.filter(page =>
  page.status === "unsolved" && page.indices.length);
const SECTION_GROUPS = MASTER.slice(MASTER.indexOf("\n\n") + 2)
  .split("$").slice(7, 16).map(wordsFromMaster);
const SECTION_STARTS = new Set();
{
  let offset = 0;
  for (const group of SECTION_GROUPS) {
    SECTION_STARTS.add(offset);
    offset += group.length;
  }
  assert.equal(SECTION_GROUPS.length, 9);
  assert.equal(offset, 2896);
}
const WORD_VALUES = WORDS.map(word => [...word.runes].map(rune => {
  const index = RUNE_IDS.get(rune);
  assert.notEqual(index, undefined);
  return index;
}));
assert.equal(WORDS.length, 2896);
assert.equal(WORDS.reduce((s, w) => s + w.length, 0), 12956);
assert.equal(PAGE_RECORDS.length, 55);
assert.equal(PAGE_RECORDS.reduce((s, p) => s + p.indices.length, 0), 12956);
assert.deepEqual(WORD_VALUES.flat(), PAGE_RECORDS.flatMap(p => p.indices));
assert.equal(SECTION_GROUPS.flat().map(w => w.join("")).join(""),
  WORDS.map(w => w.runes).join(""));

const LENGTHS = WORD_VALUES.map(word => word.length);
const SEED = 0x6a17f8b1;
const DEFAULT_REPLICATES = 1800;
const REPAIR_PROBABILITY = 0.81;

/** @param {number} x GP index. @returns {number} */
function T(x) { return (24 - 2 * x + 58) % 29; }

/** @param {() => number} random @param {number} previous */
function randomDistinct(random, previous) {
  const draw = random() % 28;
  return draw >= previous ? draw + 1 : draw;
}

/**
 * Produce a single fully structured synthetic ciphertext, keeping state
 * through word and section boundaries. A no-repeat repair does not alter
 * the original number of symbols. All runes are iid uniform before repair.
 * @param {"uniform-repair"|"lag6-affine-repair"} mode
 * @param {() => number} random Unsigned xorshift32 RNG.
 * @returns {number[][]} Whole generated ciphertext words.
 */
function generate(mode, random) {
  assert.ok(["uniform-repair", "lag6-affine-repair"].includes(mode));
  const out = [];
  let previous = -1;
  for (const length of LENGTHS) {
    const word = [];
    for (let i = 0; i < length; i++) {
      let proposed = random() % 29;
      if (proposed === previous &&
          random() / 4294967296 < REPAIR_PROBABILITY) {
        if (mode === "lag6-affine-repair" && i >= 6) {
          proposed = T(word[i - 6]);
          if (proposed === previous) proposed = randomDistinct(random, previous);
        } else {
          proposed = randomDistinct(random, previous);
        }
      }
      word.push(proposed);
      previous = proposed;
    }
    out.push(word);
  }
  return out;
}

/**
 * Joint manuscript observables measured from exact canonical word layout.
 * @param {number[][]} words A corpus preserving all 2,896 word lengths.
 */
function measure(words) {
  assert.equal(words.length, LENGTHS.length);
  const flat = [];
  const counts = {
    withinWordRepeat: 0, withinSectionBoundaryRepeat: 0,
    wordNonadjEqual4to9: 0, lag5Equal: 0, lag5SameS: 0,
    lag6Affine: 0, lag6AffineWithNextInWord: 0,
    lag6OneNullPalindrome: 0, adjacentPageCoincidence: 0,
    adjacentPageCoincidenceEligible: 0, withinPhysicalPageRepeat: 0,
    withinPhysicalPagePairs: 0
  };
  const affineHistogram = Array(29).fill(0);
  let previousWord = null;
  for (let w = 0; w < words.length; w++) {
    const word = words[w];
    assert.equal(word.length, LENGTHS[w]);
    if (previousWord && !SECTION_STARTS.has(w)) {
      counts.withinSectionBoundaryRepeat += +(previousWord.at(-1) === word[0]);
    }
    for (let i = 0; i < word.length; i++) {
      const symbol = word[i];
      flat.push(symbol);
      if (i > 0) counts.withinWordRepeat += +(symbol === word[i - 1]);
      if (i >= 5) {
        counts.lag5Equal += +(symbol === word[i - 5]);
        counts.lag5SameS += +(symbol === 15 && word[i - 5] === 15);
      }
      if (i >= 6) {
        const residue = (symbol + 2 * word[i - 6]) % 29;
        affineHistogram[residue]++;
        if (residue === 24) {
          counts.lag6Affine++;
          if (i + 1 < word.length) {
            counts.lag6AffineWithNextInWord++;
            counts.lag6OneNullPalindrome +=
              +(word[i - 1] === word[i + 1]);
          }
        }
      }
      if (word.length >= 4 && word.length <= 9) {
        for (let j = 0; j < i - 1; j++) {
          counts.wordNonadjEqual4to9 += +(word[j] === symbol);
        }
      }
    }
    previousWord = word;
  }

  const pages = [];
  let cursor = 0;
  for (const page of PAGE_RECORDS) {
    const symbols = flat.slice(cursor, cursor + page.indices.length);
    pages.push({page: page.page, symbols});
    for (let i = 1; i < symbols.length; i++) {
      counts.withinPhysicalPagePairs++;
      counts.withinPhysicalPageRepeat += +(symbols[i] === symbols[i - 1]);
    }
    cursor += symbols.length;
  }
  assert.equal(cursor, 12956);
  for (let i = 1; i < pages.length; i++) {
    const previous = pages[i - 1];
    const current = pages[i];
    if (current.page !== previous.page + 1) continue;
    for (let j = 0; j < Math.min(previous.symbols.length,
      current.symbols.length); j++) {
      counts.adjacentPageCoincidenceEligible++;
      counts.adjacentPageCoincidence +=
        +(previous.symbols[j] === current.symbols[j]);
    }
  }

  const otherBinsMean = (1290 - affineHistogram[24]) / 28;
  const offPeakPearson = affineHistogram.reduce((sum, value, index) =>
    sum + (index === 24 ? 0 :
      (value - otherBinsMean) ** 2 / otherBinsMean), 0);
  return {counts, affineHistogram, offPeakPearson};
}

/**
 * Monte Carlo mean/SD and empirical tails for pre-specified diagnostics.
 * @param {number[]} values Real-number replicate values.
 * @param {number} observed Original manuscript value.
 */
function summary(values, observed) {
  const n = values.length;
  const mean = values.reduce((sum, x) => sum + x, 0) / n;
  const sd = Math.sqrt(values.reduce((sum, x) => sum + (x - mean) ** 2,
    0) / n);
  return {observed, mean, sd, z: sd ? (observed - mean) / sd : null,
    lowTail: (values.filter(x => x <= observed).length + 1) / (n + 1),
    upperTail: (values.filter(x => x >= observed).length + 1) / (n + 1),
    range: [Math.min(...values), Math.max(...values)]};
}

/**
 * @param {number} [replicates=1800]
 */
function run(replicates = DEFAULT_REPLICATES) {
  assert.ok(Number.isInteger(replicates) && replicates > 0);
  const original = measure(WORD_VALUES);
  const expected = {
    withinWordRepeat: 63,
    withinSectionBoundaryRepeat: 23,
    wordNonadjEqual4to9: 526,
    lag5Equal: 104,
    lag5SameS: 11,
    lag6Affine: 80,
    lag6AffineWithNextInWord: 48,
    lag6OneNullPalindrome: 1,
    withinPhysicalPageRepeat: 86,
    withinPhysicalPagePairs: 12901,
    adjacentPageCoincidence: 432,
    adjacentPageCoincidenceEligible: 11667
  };
  assert.deepEqual(original.counts, expected,
    "Source corpus or physical page/section alignment changed");

  const diagnostics = [
    "withinWordRepeat", "withinSectionBoundaryRepeat",
    "withinPhysicalPageRepeat", "wordNonadjEqual4to9",
    "lag5Equal", "lag5SameS", "lag6Affine",
    "adjacentPageCoincidence", "lag6OneNullPalindrome"
  ];
  const results = {};
  for (const [model, seed] of [
    ["uniform-repair", SEED],
    ["lag6-affine-repair", SEED ^ 0x538eb1cc]
  ]) {
    const random = random32(seed);
    const samples = Object.fromEntries(diagnostics.map(key => [key, []]));
    const offPeak = [];
    for (let i = 0; i < replicates; i++) {
      const measurement = measure(generate(model, random));
      for (const key of diagnostics) samples[key].push(measurement.counts[key]);
      offPeak.push(measurement.offPeakPearson);
    }
    results[model] = {
      seed: "0x" + (seed >>> 0).toString(16),
      replicates, repairProbability: REPAIR_PROBABILITY,
      diagnostics: Object.fromEntries(diagnostics.map(key =>
        [key, summary(samples[key], original.counts[key])])),
      lag6OffPeakPearson: summary(offPeak, original.offPeakPearson)
    };
  }
  return {
    original: {
      sha256: createHash("sha256").update(RAW).digest("hex"),
      words: WORDS.length, sections: SECTION_GROUPS.length,
      runes: 12956, runePages: 55,
      ...original,
      excessLag6AffineAboveUniform: 80 - 1290 / 29,
      fractionOfTMatchesPalindromicWithNextInsideWord: 1 / 48
    },
    models: results,
    insertionNecessity: "If a T(c[i-6]) null is inserted immediately between two identical would-be adjacent symbols A,A, the visible A,T,A triple is necessary. Just 1/48 eligible original T sites satisfies it.",
    warning: "Both forward models use the observed collision rate to select 81% and the already post-selected T formula; the chosen overwrite is lossy. No original ciphertext inverse, underlying plaintext or key has been recovered."
  };
}

if (require.main === module) {
  console.log(JSON.stringify(run(), null, 2));
}
module.exports = {T, randomDistinct, generate, measure, summary, run};
