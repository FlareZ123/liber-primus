#!/usr/bin/env node
"use strict";

/**
 * Bounded key-independent test of a 16-lane word-level substitution model.
 *
 * Motivation (exploratory, not an established instruction):
 * - the source-derived p15 Fibonacci-prime spiral has 16 ordered cells;
 * - the 2016 signed message says words are the map;
 * - the canonical unknown LP2 transcript has 2,896 words = 16 * 181.
 *
 * Two natural 16 x 181 layouts are tested:
 *   1. interleaved: word ordinal mod 16 selects one of 16 lanes;
 *   2. contiguous: each consecutive block of 181 words is one lane.
 *
 * If each lane uses any fixed bijection of the 29 GP symbols (and even if
 * positions are transposed within a lane), its rune IoC is invariant.
 * Thus no key search or guessed alphabet order is required.
 *
 * This does NOT test evolving/polyalphabetic lanes, per-word keys, other
 * partitions, non-GP registers, or non-English plaintext. It does not
 * establish that the p15 spiral selects a 16-lane cipher.
 *
 * Run: node sims/lp2_word16_lane_substitution_gate.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseSharedCorpus } = require("./lp2_word_pages.cjs");
const { encode } = require("./word_partition_invariant.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const LANES = 16;
const WORDS_PER_LANE = 181;

function ioc(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  let pairs = 0;
  for (const count of counts.values()) pairs += count * (count - 1);
  return values.length > 1 ? pairs / (values.length * (values.length - 1)) : 0;
}

function summarize(groups) {
  return groups.map((words, lane) => {
    const runes = words.flat();
    return {
      lane,
      words: words.length,
      runes: runes.length,
      ioc: Number(ioc(runes).toFixed(9))
    };
  });
}

function flattenWordGroups(words) {
  return words.map(word => [...word.runes].map(rune => {
    const value = runeIndex.get(rune);
    assert.notEqual(value, undefined, \`unknown GP rune \${rune}\`);
    return value;
  }));
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

function loadUnknown() {
  const parsed = parseSharedCorpus();
  const words = flattenWordGroups(parsed.words);
  assert.equal(parsed.words.length, 2896);
  assert.equal(parsed.runeCount, 12956);
  assert.equal(parsed.crossPageWords, 32);
  assert.equal(words.flat().length, 12956);
  return { parsed, words };
}

function loadLP1Control() {
  const text = read("resources/liber-primus/lp1-plaintext-reference.txt")
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/(?:^|\n)### [^\n]*\n/g, " ")
    .toUpperCase();
  const words = (text.match(/[A-Z]+/g) || []).map(encode);
  assert.equal(words.length, 850);
  assert.equal(words.flat().length, 3463);
  return words;
}

function interleavedLanes(words) {
  return Array.from({ length: LANES }, (_, lane) =>
    words.filter((_, ordinal) => ordinal % LANES === lane));
}

function contiguousLanes(words) {
  assert.equal(words.length, LANES * WORDS_PER_LANE);
  return Array.from({ length: LANES }, (_, lane) =>
    words.slice(lane * WORDS_PER_LANE, (lane + 1) * WORDS_PER_LANE));
}

/** Demonstrate the exact IoC invariance under 16 different lane bijections. */
function affinePositiveControl(lanes) {
  for (let lane = 0; lane < LANES; lane++) {
    const source = lanes[lane].flat();
    const a = ((2 * lane + 1) % 29) || 1;
    const b = (3 * lane + 7) % 29;
    const planted = source.map(value => (a * value + b) % 29);
    assert.equal(ioc(source), ioc(planted),
      \`lane \${lane}: affine GP29 bijection changed IoC\`);
  }
  return { laneSpecificAffineBijections: LANES, allIoCsExactlyPreserved: true };
}

function range(rows) {
  const values = rows.map(row => row.ioc);
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    mean: values.reduce((sum, value) => sum + value, 0) / values.length
  };
}

function run() {
  const { parsed, words } = loadUnknown();
  const lp1 = loadLP1Control();
  const interleaved = interleavedLanes(words);
  const contiguous = contiguousLanes(words);
  const lp1Interleaved = interleavedLanes(lp1);

  const interleavedRows = summarize(interleaved);
  const contiguousRows = summarize(contiguous);
  const lp1Rows = summarize(lp1Interleaved);

  const unknownMax = Math.max(
    range(interleavedRows).max,
    range(contiguousRows).max
  );
  const lp1Min = range(lp1Rows).min;
  assert.ok(unknownMax < lp1Min,
    "the source LP1 English control must separate from the proposed lanes");

  return {
    classification: "bounded negative; no LP2 plaintext or key recovered",
    hypothesis: "one fixed unknown GP29 bijection per lane in a 16-lane word partition",
    sourceMotivation: {
      p15SpiralCells: 16,
      canonicalUnknownWords: parsed.words.length,
      factorization: "2896 = 16 * 181",
      2016SignedMessage: "words are the map",
      caveat: "No original instruction authenticates a 16-lane assignment."
    },
    input: {
      runeCount: parsed.runeCount,
      words: parsed.words.length,
      crossPageWords: parsed.crossPageWords,
      corpusSha: "054f2a0f780b7d46901acbe3d9bf4f0ac1801165",
      transcriptionSha: "43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7"
    },
    interleavedWordOrdinalMod16: {
      lanes: interleavedRows,
      summary: range(interleavedRows)
    },
    contiguousBlocksOf181Words: {
      lanes: contiguousRows,
      summary: range(contiguousRows)
    },
    nativeLP1EnglishControl: {
      words: lp1.length,
      runes: lp1.flat().length,
      interleavedLanes: lp1Rows,
      summary: range(lp1Rows)
    },
    positiveControl: affinePositiveControl(lp1Interleaved),
    decision: {
      uniformBaseline: 1 / 29,
      maximumUnknownLaneIoC: unknownMax,
      minimumLP1ControlLaneIoC: lp1Min,
      result: "Both natural 16-lane partitions remain at the 1/29 near-uniform baseline. A fixed lane-specific bijection, arbitrary alphabet order, or within-lane transposition cannot restore English-like collision frequency."
    },
    limitations: [
      "Does not exclude evolving or polyalphabetic lane state.",
      "Does not exclude a non-GP intermediate register or non-English plaintext.",
      "Does not test per-word substitutions, other word partitions, or variable lane boundaries.",
      "The 16-cell/16-lane relationship remains a hypothesis, not a source-authenticated instruction."
    ]
  };
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = { ioc, summarize, interleavedLanes, contiguousLanes, affinePositiveControl, run };
