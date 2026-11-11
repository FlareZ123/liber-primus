#!/usr/bin/env node
"use strict";

/**
 * Exact IoC upper bounds for static surjective homophonic maps GP29 -> k.
 *
 * A fixed map from 29 ciphertext symbols onto k plaintext symbols partitions
 * the 29 observed symbol counts into k nonempty groups. For fixed k, the
 * maximum sum of squared output counts is attained by merging the largest
 * (29-k+1) input counts into one output class and leaving the rest singleton.
 * This gives an exact key-independent upper bound on plaintext IoC.
 *
 * Controls are raw alphabetic English letters (26 symbols), not GP29
 * transliterations. The solved LP1 control uses only LP1 pages 1-16, excluding
 * the solved LP2 pages and their hexadecimal hash.
 *
 * Run: node sims/homophonic_downward_surjection_ioc_bound.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const GP_SIZE = 29;
const TOTAL = 12956;
const BODY_LENGTHS = [729, 1145, 1738, 1894, 1021, 1433, 91, 1589, 3316];

function ioc(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  let pairs = 0;
  for (const count of counts.values()) pairs += count * (count - 1);
  return values.length > 1 ? pairs / (values.length * (values.length - 1)) : 0;
}

function symbolCounts(values) {
  const counts = Array(GP_SIZE).fill(0);
  for (const value of values) {
    assert.ok(Number.isInteger(value) && value >= 0 && value < GP_SIZE);
    counts[value]++;
  }
  return counts;
}

/**
 * Exact maximum over all surjections 29 -> k:
 * group the largest 29-k+1 source counts together; leave the rest alone.
 */
function maxSurjectionIoC(values, k) {
  assert.ok(Number.isInteger(k) && k >= 1 && k <= GP_SIZE);
  const sorted = symbolCounts(values).sort((a, b) => b - a);
  const mergedCount = GP_SIZE - k + 1;
  const outputCounts = [
    sorted.slice(0, mergedCount).reduce((sum, value) => sum + value, 0),
    ...sorted.slice(mergedCount)
  ];
  let pairs = 0;
  for (const count of outputCounts) pairs += count * (count - 1);
  return pairs / (values.length * (values.length - 1));
}

/** Maximum for a fixed multiset of homophone class sizes. */
function maxShapeIoC(values, classSizes) {
  const sorted = symbolCounts(values).sort((a, b) => b - a);
  const sizes = [...classSizes].sort((a, b) => b - a);
  assert.equal(sizes.reduce((sum, size) => sum + size, 0), GP_SIZE);
  let offset = 0;
  const outputCounts = sizes.map(size => {
    const count = sorted.slice(offset, offset + size)
      .reduce((sum, value) => sum + value, 0);
    offset += size;
    return count;
  });
  let pairs = 0;
  for (const count of outputCounts) pairs += count * (count - 1);
  return pairs / (values.length * (values.length - 1));
}

/** Construct a surjection attaining the maximum and verify the formula. */
function maximizingSurjection(values, k) {
  const counts = symbolCounts(values);
  const order = Array.from({ length: GP_SIZE }, (_, symbol) => symbol)
    .sort((a, b) => counts[b] - counts[a] || a - b);
  const mergedCount = GP_SIZE - k + 1;
  const map = Array(GP_SIZE).fill(-1);
  for (const symbol of order.slice(0, mergedCount)) map[symbol] = 0;
  order.slice(mergedCount).forEach((symbol, index) => { map[symbol] = index + 1; });
  const decoded = values.map(symbol => map[symbol]);
  assert.equal(new Set(map).size, k);
  assert.equal(ioc(decoded), maxSurjectionIoC(values, k));
  return {
    decodedIoC: ioc(decoded),
    classSizes: [mergedCount, ...Array(k - 1).fill(1)]
  };
}

function splitBodies(values) {
  assert.equal(BODY_LENGTHS.reduce((sum, n) => sum + n, 0), TOTAL);
  let offset = 0;
  return BODY_LENGTHS.map((n, index) => {
    const body = values.slice(offset, offset + n);
    assert.equal(body.length, n, "body " + (index + 1));
    offset += n;
    return body;
  });
}

function loadControls() {
  const shakespeareText = read("resources/control/shakespeare_first300k.txt")
    .toUpperCase();
  const shakespeare = (shakespeareText.match(/[A-Z]/g) || [])
    .slice(0, TOTAL)
    .map(letter => letter.charCodeAt(0) - 65);
  assert.equal(shakespeare.length, TOTAL);
  assert.ok(shakespeare.every(letter => letter >= 0 && letter < 26));

  const lp1Text = read("resources/liber-primus/lp1-plaintext-reference.txt")
    .split("### 56")[0]
    .replace(/^#.*$/gm, " ")
    .replace(/\[[^\]]*\]/g, " ")
    .toUpperCase();
  const lp1 = (lp1Text.match(/[A-Z]/g) || [])
    .map(letter => letter.charCodeAt(0) - 65);
  assert.equal(lp1.length, 3229);
  assert.ok(lp1.every(letter => letter >= 0 && letter < 26));

  return [
    { name: "English / Shakespeare raw A-Z", values: shakespeare },
    { name: "Solved LP1 plaintext raw A-Z (pages 1-16)", values: lp1 }
  ];
}

function run() {
  const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
  const unknown = corpus.pages
    .filter(page => page.status === "unsolved" && page.indices.length)
    .flatMap(page => page.indices);
  assert.equal(unknown.length, TOTAL);
  assert.ok(unknown.every(symbol => symbol >= 0 && symbol < GP_SIZE));

  const sectionSynthesis = read("workplace/lp2-section-clock-ambiguity.md");
  assert.ok(sectionSynthesis.includes(
    "729, 1145, 1738, 1894, 1021, 1433, 91, 1589, 3316"),
    "source nine-body lengths no longer match the current synthesis");

  const controls = loadControls();
  const globalControls = controls.map(control => ({
    name: control.name,
    letters: control.values.length,
    ioc: Number(ioc(control.values).toFixed(9))
  }));

  const maxByK = {};
  for (let k = 29; k >= 20; k--) {
    maxByK[k] = Number(maxSurjectionIoC(unknown, k).toFixed(9));
  }

  const shapes26 = {
    oneFourWayClass: [4, ...Array(25).fill(1)],
    oneTripleOnePair: [3, 2, ...Array(24).fill(1)],
    threePairs: [2, 2, 2, ...Array(23).fill(1)]
  };
  const shapes25 = {
    oneFiveWayClass: [5, ...Array(24).fill(1)],
    fourPlusPair: [4, 2, ...Array(23).fill(1)],
    twoTriples: [3, 3, ...Array(23).fill(1)],
    tripleAndTwoPairs: [3, 2, 2, ...Array(22).fill(1)],
    fourPairs: [2, 2, 2, 2, ...Array(21).fill(1)]
  };
  const shapeBounds = object => Object.fromEntries(
    Object.entries(object).map(([name, sizes]) => [
      name, Number(maxShapeIoC(unknown, sizes).toFixed(9))
    ])
  );

  const unknownBodies = splitBodies(unknown);
  const englishBodies = splitBodies(controls[0].values);
  const perBody = unknownBodies.map((body, index) => {
    const englishIoC = ioc(englishBodies[index]);
    const max26 = maxSurjectionIoC(body, 26);
    return {
      body: index + 1,
      runes: body.length,
      originalIoC: Number(ioc(body).toFixed(9)),
      maximum29to26IoC: Number(max26.toFixed(9)),
      rawEnglishIoC: Number(englishIoC.toFixed(9)),
      englishAboveBound: englishIoC > max26
    };
  });
  const substantialBodies = perBody.filter(body => body.runes >= 700);
  assert.ok(substantialBodies.every(body => body.englishAboveBound));

  const globalMax26 = maxSurjectionIoC(unknown, 26);
  const globalMax25 = maxSurjectionIoC(unknown, 25);
  assert.ok(controls.every(control => ioc(control.values) > globalMax26));
  assert.ok(controls.every(control => ioc(control.values) > globalMax25));
  assert.ok(maxSurjectionIoC(unknown, 24) > ioc(controls[0].values));

  return {
    classification: "key-independent upper bound; no plaintext or key recovered",
    model: "static surjective many-to-one map from the 29 GP ciphertext symbols onto k plaintext letters",
    input: {
      runeCount: unknown.length,
      alphabetSize: GP_SIZE,
      globalIoC: Number(ioc(unknown).toFixed(9)),
      uniformBaseline: 1 / GP_SIZE,
      corpusBlobSha: "054f2a0f780b7d46901acbe3d9bf4f0ac1801165"
    },
    exactMaximumByPlaintextAlphabetSize: maxByK,
    rawAlphabeticControls: globalControls,
    aliasClassShapeBounds: {
      k26: shapeBounds(shapes26),
      k25: shapeBounds(shapes25)
    },
    maximizingSurjectionPositiveControls: {
      k26: maximizingSurjection(unknown, 26),
      k25: maximizingSurjection(unknown, 25)
    },
    nineSourceBodyPerBodyK26Bounds: {
      bodyLengths: BODY_LENGTHS,
      rows: perBody,
      substantialBodies: substantialBodies.length,
      allSubstantialBodiesBelowRawEnglishControl:
        substantialBodies.every(body => body.englishAboveBound)
    },
    decision: {
      k26GlobalMaximum: Number(globalMax26.toFixed(9)),
      k25GlobalMaximum: Number(globalMax25.toFixed(9)),
      minimumRawEnglishControlIoC: Math.min(...controls.map(control => ioc(control.values))),
      k25: "excluded for a fixed global 29->25 map against both raw English controls, even under the one-five-way-class maximum",
      k26: "excluded for a fixed global 29->26 map; per-body 29->26 also fails in each of the eight bodies >=700 runes",
      remaining: "k<=24, per-body k<=25, evolving mappings, variable-length outputs, and non-English registers are not solved or excluded"
    },
    sourceHashes: {
      shakespeare: "94c677ad9dd50771c6670e0c4e4dad9052b46d85",
      lp1Plaintext: "beb43aac08b8482590c4430aadd1ee91da3876a0"
    }
  };
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {
  ioc, symbolCounts, maxSurjectionIoC, maxShapeIoC,
  maximizingSurjection, splitBodies, run
};
