"use strict";

/**
 * Familywise calibration for the p27 DJU/BEI GP0 -> p50 convergence.
 *
 * The source side is frozen: prime_echo selects the unique repeated terminal
 * complete-word pair DJU/BEI and therefore p27. This script charges the
 * downstream family actually inspected: all 51 adjacent p27 pairs, literal /
 * base59 / base60 table outputs, one- or two-step traversal, and page-local
 * word-boundary classes. It then randomizes only p50 token positions under
 * two exact-preservation nulls: global token multiset and per-physical-p50-page
 * token multisets.
 *
 * Run from repository root:
 *   node sims/lp2_p27_djubei_familywise_null_sft.cjs
 * Optional:
 *   TRIALS=100000 node sims/lp2_p27_djubei_familywise_null_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");
const originalTokens = grid.pages.flatMap((page) => page.tokens);
const p50PageLengths = grid.pages.map((page) => page.tokens.length);
const outputTypes = ["literal", "base59", "base60"];
const outputTypePairs = [["literal", "base59"], ["literal", "base60"], ["base59", "base60"]];

assert.equal(originalTokens.length, 256);
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);
assert.equal(p50PageLengths.reduce((a, b) => a + b, 0), 256);

/** @returns {{index:number,start:number,length:number,indices:number[],text:string}[]} */
function parseP27Words() {
  const source = transcription.split(/\r?\n%\r?\n/)[27];
  const words = [];
  let current = [];
  let offset = 0;
  let start = 0;
  const flush = () => {
    if (!current.length) return;
    words.push({
      index: words.length,
      start,
      length: current.length,
      indices: current.slice(),
      text: current.map((value) => corpus.translit[value]).join(""),
    });
    current = [];
  };
  for (const ch of [...source]) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if (ch === "-" || ch === ".") {
      flush();
    }
  }
  flush();
  return words;
}

const p27 = parseP27Words();
const page27 = corpus.pages.find((page) => page.page === 27);
assert.ok(page27);
assert.equal(page27.indices.length, 234);
assert.equal(p27.length, 52);

/** @param {{indices:number[]}} word @returns {number} */
function gp0(word) {
  return word.indices.reduce((sum, value) => sum + value, 0);
}

/** @param {number} offset @returns {typeof p27[number] | null} */
function containing(offset) {
  return p27.find((word) => word.start <= offset && offset < word.start + word.length) || null;
}

/** @param {number} offset @param {typeof p27[number]} word @returns {string} */
function boundaryClass(offset, word) {
  const atStart = offset === word.start;
  const atEnd = offset === word.start + word.length - 1;
  if (atStart && atEnd) return "singleton";
  if (atStart) return "start";
  if (atEnd) return "end";
  return "interior";
}

/** @param {string} token @param {string} type @returns {number | null} */
function decodeToken(token, type) {
  if (type === "literal") {
    return /^[0-9]{2}$/.test(token) ? Number.parseInt(token, 10) : null;
  }
  const alphabet = type === "base59" ? alphabet59 : alphabet60;
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  return high >= 0 && low >= 0 ? high * alphabet.length + low : null;
}

/**
 * @param {typeof p27[number]} source
 * @param {string[]} tokens
 * @param {string} type
 */
function branch(source, tokens, type) {
  const sourceAddress = gp0(source);
  if (sourceAddress >= 256) return null;
  const firstToken = tokens[sourceAddress];
  const firstValue = decodeToken(firstToken, type);
  if (firstValue === null || firstValue < 0 || firstValue >= page27.indices.length) return null;
  const intermediate = containing(firstValue);
  if (!intermediate) return null;
  const intermediateAddress = gp0(intermediate);
  if (intermediateAddress >= 256) return null;
  const secondToken = tokens[intermediateAddress];
  const secondValue = decodeToken(secondToken, type);
  const target = secondValue === null || secondValue < 0 || secondValue >= page27.indices.length
    ? null
    : containing(secondValue);
  return {
    sourceAddress,
    firstToken,
    firstValue,
    intermediate,
    firstClass: boundaryClass(firstValue, intermediate),
    intermediateAddress,
    secondToken,
    secondValue,
    target,
    secondClass: target ? boundaryClass(secondValue, target) : null,
  };
}

/** @param {string} cls @returns {boolean} */
function isBoundary(cls) {
  return cls === "start" || cls === "end" || cls === "singleton";
}

/**
 * @param {number} pairIndex
 * @param {string[]} tokens
 * @param {string} type
 */
function pairFeatures(pairIndex, tokens, type) {
  const left = branch(p27[pairIndex], tokens, type);
  const right = branch(p27[pairIndex + 1], tokens, type);
  if (!left || !right) return null;
  const distinctFirst = left.firstValue !== right.firstValue;
  const sameIntermediate = left.intermediate.index === right.intermediate.index;
  const distinctIntermediate = !sameIntermediate;
  const firstBothBoundary = isBoundary(left.firstClass) && isBoundary(right.firstClass);
  const oneExact = left.firstValue === right.firstValue;
  const oneSameWord = sameIntermediate;
  const secondBothValid = left.target !== null && right.target !== null;
  const twoTokenEqual = left.secondToken === right.secondToken;
  const twoExact = secondBothValid && left.secondValue === right.secondValue;
  const twoSameWord = secondBothValid && left.target.index === right.target.index;
  const secondAnyBoundary = secondBothValid && (isBoundary(left.secondClass) || isBoundary(right.secondClass));
  return {
    pairIndex,
    type,
    left,
    right,
    distinctFirst,
    sameIntermediate,
    distinctIntermediate,
    firstBothBoundary,
    oneExact,
    oneSameWord,
    secondBothValid,
    twoTokenEqual,
    twoExact,
    twoSameWord,
    secondAnyBoundary,
    oneBoundaryConvergence: distinctFirst && oneSameWord && firstBothBoundary,
    twoBoundaryConvergence:
      distinctFirst && distinctIntermediate && firstBothBoundary && twoSameWord && secondAnyBoundary,
    twoCarrierConvergence:
      distinctFirst && distinctIntermediate && twoSameWord && left.target.index === 19,
  };
}

const djuIndex = p27.findIndex((word) => word.start === 28 && word.text === "DJU");
assert.equal(djuIndex >= 0, true);
assert.equal(p27[djuIndex + 1].start, 31);
assert.equal(p27[djuIndex + 1].text, "BEI");
const carrier = containing(79);
assert.ok(carrier);
assert.equal(carrier.start, 79);
assert.equal(carrier.length, 12);
assert.equal(carrier.index, 19);

/** @param {string[]} tokens */
function evaluate(tokens) {
  const metrics = {
    anyOneBoundary: false,
    anyTwoBoundary: false,
    anyOneOrTwoBoundary: false,
    anyTwoSameWord: false,
    anyTwoCarrier: false,
    anyCrossTypeOneBoundaryCommonTarget: false,
    anyCrossTypeTwoBoundaryCommonTarget: false,
    anyCrossTypeOneOrTwoBoundaryCommonTarget: false,
    anyCrossTypeTwoStableIntermediates: false,
    djuCrossTypeOneOrTwoBoundaryCommonTarget: false,
    djuCrossTypeTwoStableIntermediates: false,
    anyDualRadixConvergence: false,
    anyDualRadixBoundaryConvergence: false,
    anyDualRadixCommonTarget: false,
    anyDualRadixStableIntermediates: false,
    anyDualRadixShape: false,
    djuAnyTwoBoundary: false,
    djuDualRadixCommonTarget: false,
    djuDualRadixStableIntermediates: false,
    djuDualRadixShape: false,
    familyRows: 0,
    oneBoundaryRows: 0,
    twoBoundaryRows: 0,
    twoSameWordRows: 0,
  };

  const byPairType = Array.from({length: p27.length - 1}, () => ({}));
  for (let i = 0; i < p27.length - 1; i += 1) {
    for (const type of outputTypes) {
      const row = pairFeatures(i, tokens, type);
      if (!row) continue;
      metrics.familyRows += 1;
      byPairType[i][type] = row;
      if (row.oneBoundaryConvergence) {
        metrics.anyOneBoundary = true;
        metrics.oneBoundaryRows += 1;
      }
      if (row.twoBoundaryConvergence) {
        metrics.anyTwoBoundary = true;
        metrics.twoBoundaryRows += 1;
      }
      if (row.twoSameWord && row.distinctFirst && row.distinctIntermediate) {
        metrics.anyTwoSameWord = true;
        metrics.twoSameWordRows += 1;
      }
      if (row.twoCarrierConvergence) metrics.anyTwoCarrier = true;
      if (i === djuIndex && row.twoBoundaryConvergence) metrics.djuAnyTwoBoundary = true;
    }
  }
  metrics.anyOneOrTwoBoundary = metrics.anyOneBoundary || metrics.anyTwoBoundary;

  for (let i = 0; i < p27.length - 1; i += 1) {
    for (const [leftType, rightType] of outputTypePairs) {
      const a = byPairType[i][leftType];
      const b = byPairType[i][rightType];
      if (!a || !b) continue;

      const oneCommonTarget =
        a.distinctFirst && b.distinctFirst &&
        a.oneSameWord && b.oneSameWord &&
        a.firstBothBoundary && b.firstBothBoundary &&
        a.left.intermediate.index === b.left.intermediate.index;

      const twoCommonTarget =
        a.distinctFirst && b.distinctFirst &&
        a.distinctIntermediate && b.distinctIntermediate &&
        a.firstBothBoundary && b.firstBothBoundary &&
        a.twoSameWord && b.twoSameWord &&
        a.left.target.index === b.left.target.index;

      const twoStableIntermediates =
        twoCommonTarget &&
        a.left.intermediate.index === b.left.intermediate.index &&
        a.right.intermediate.index === b.right.intermediate.index;

      if (oneCommonTarget) metrics.anyCrossTypeOneBoundaryCommonTarget = true;
      if (twoCommonTarget) metrics.anyCrossTypeTwoBoundaryCommonTarget = true;
      if (oneCommonTarget || twoCommonTarget) {
        metrics.anyCrossTypeOneOrTwoBoundaryCommonTarget = true;
        if (i === djuIndex) metrics.djuCrossTypeOneOrTwoBoundaryCommonTarget = true;
      }
      if (twoStableIntermediates) {
        metrics.anyCrossTypeTwoStableIntermediates = true;
        if (i === djuIndex) metrics.djuCrossTypeTwoStableIntermediates = true;
      }
    }
  }

  for (let i = 0; i < p27.length - 1; i += 1) {
    const a = byPairType[i].base59;
    const b = byPairType[i].base60;
    if (!a || !b) continue;
    const dualConvergence =
      a.distinctFirst && b.distinctFirst &&
      a.distinctIntermediate && b.distinctIntermediate &&
      a.twoSameWord && b.twoSameWord;
    const dualBoundaryConvergence =
      dualConvergence && a.firstBothBoundary && b.firstBothBoundary;
    const dualCommonTarget =
      dualBoundaryConvergence &&
      a.left.target.index === b.left.target.index;
    const dualStableIntermediates =
      dualCommonTarget &&
      a.left.intermediate.index === b.left.intermediate.index &&
      a.right.intermediate.index === b.right.intermediate.index;
    const shape =
      dualStableIntermediates &&
      a.twoTokenEqual && b.twoTokenEqual &&
      a.left.secondClass === "start" &&
      b.left.secondClass === "interior" &&
      b.left.secondValue === a.left.secondValue + 1;
    if (dualConvergence) metrics.anyDualRadixConvergence = true;
    if (dualBoundaryConvergence) metrics.anyDualRadixBoundaryConvergence = true;
    if (dualCommonTarget) {
      metrics.anyDualRadixCommonTarget = true;
      if (i === djuIndex) metrics.djuDualRadixCommonTarget = true;
    }
    if (dualStableIntermediates) {
      metrics.anyDualRadixStableIntermediates = true;
      if (i === djuIndex) metrics.djuDualRadixStableIntermediates = true;
    }
    if (shape) {
      metrics.anyDualRadixShape = true;
      if (i === djuIndex) metrics.djuDualRadixShape = true;
    }
  }
  return metrics;
}

const observed = evaluate(originalTokens);
assert.equal(observed.djuDualRadixShape, true);
assert.equal(observed.anyDualRadixShape, true);
assert.equal(observed.djuAnyTwoBoundary, true);
assert.equal(observed.anyTwoCarrier, true);
assert.equal(observed.anyCrossTypeOneOrTwoBoundaryCommonTarget, true);
assert.equal(observed.djuCrossTypeOneOrTwoBoundaryCommonTarget, true);
assert.equal(observed.anyCrossTypeTwoStableIntermediates, true);
assert.equal(observed.djuCrossTypeTwoStableIntermediates, true);

const dju59 = pairFeatures(djuIndex, originalTokens, "base59");
const dju60 = pairFeatures(djuIndex, originalTokens, "base60");
assert.ok(dju59 && dju60);
assert.deepEqual(
  [dju59.left.firstValue, dju59.right.firstValue, dju59.left.secondValue, dju59.right.secondValue],
  [39, 105, 79, 79]
);
assert.deepEqual(
  [dju60.left.firstValue, dju60.right.firstValue, dju60.left.secondValue, dju60.right.secondValue],
  [39, 107, 80, 80]
);
assert.deepEqual([dju59.left.firstClass, dju59.right.firstClass, dju59.left.secondClass], ["end", "start", "start"]);
assert.deepEqual([dju60.left.firstClass, dju60.right.firstClass, dju60.left.secondClass], ["end", "end", "interior"]);

const holdoutIndex = djuIndex + 2;
assert.equal(holdoutIndex, 7);
const holdout59 = pairFeatures(holdoutIndex, originalTokens, "base59");
const holdout60 = pairFeatures(holdoutIndex, originalTokens, "base60");

/** @param {ReturnType<typeof pairFeatures>} a @param {ReturnType<typeof pairFeatures>} b */
function passesFrozenHoldout(a, b) {
  return Boolean(
    a && b &&
    a.distinctFirst && b.distinctFirst &&
    a.distinctIntermediate && b.distinctIntermediate &&
    a.firstBothBoundary && b.firstBothBoundary &&
    a.twoSameWord && b.twoSameWord &&
    a.left.target.index === b.left.target.index &&
    a.left.intermediate.index === b.left.intermediate.index &&
    a.right.intermediate.index === b.right.intermediate.index
  );
}

/** @param {ReturnType<typeof pairFeatures>} row */
function summarizeHoldoutRow(row) {
  if (!row) return null;
  return {
    first: [row.left.firstValue, row.right.firstValue],
    firstClasses: [row.left.firstClass, row.right.firstClass],
    intermediateWordIndices: [row.left.intermediate.index, row.right.intermediate.index],
    intermediateAddresses: [row.left.intermediateAddress, row.right.intermediateAddress],
    second: [row.left.secondValue, row.right.secondValue],
    secondClasses: [row.left.secondClass, row.right.secondClass],
    targetWordIndices: [row.left.target ? row.left.target.index : null, row.right.target ? row.right.target.index : null],
  };
}
const holdoutPass = passesFrozenHoldout(holdout59, holdout60);

let rngState = 0x7f4a7c15;
/** @returns {number} */
function randomUnit() {
  rngState ^= rngState << 13;
  rngState ^= rngState >>> 17;
  rngState ^= rngState << 5;
  return (rngState >>> 0) / 4294967296;
}

/** @param {string[]} values @param {number} start @param {number} end */
function shuffleRange(values, start, end) {
  for (let i = end - 1; i > start; i -= 1) {
    const j = start + Math.floor(randomUnit() * (i - start + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
}

/** @param {"global"|"page"} mode @param {number} trials */
function runNull(mode, trials) {
  const counts = {
    anyOneBoundary: 0,
    anyTwoBoundary: 0,
    anyOneOrTwoBoundary: 0,
    anyTwoSameWord: 0,
    anyTwoCarrier: 0,
    anyCrossTypeOneBoundaryCommonTarget: 0,
    anyCrossTypeTwoBoundaryCommonTarget: 0,
    anyCrossTypeOneOrTwoBoundaryCommonTarget: 0,
    anyCrossTypeTwoStableIntermediates: 0,
    djuCrossTypeOneOrTwoBoundaryCommonTarget: 0,
    djuCrossTypeTwoStableIntermediates: 0,
    anyDualRadixConvergence: 0,
    anyDualRadixBoundaryConvergence: 0,
    anyDualRadixCommonTarget: 0,
    anyDualRadixStableIntermediates: 0,
    anyDualRadixShape: 0,
    djuAnyTwoBoundary: 0,
    djuDualRadixCommonTarget: 0,
    djuDualRadixStableIntermediates: 0,
    djuDualRadixShape: 0,
  };
  for (let trial = 0; trial < trials; trial += 1) {
    const tokens = originalTokens.slice();
    if (mode === "global") {
      shuffleRange(tokens, 0, tokens.length);
    } else {
      let start = 0;
      for (const length of p50PageLengths) {
        shuffleRange(tokens, start, start + length);
        start += length;
      }
    }
    const row = evaluate(tokens);
    for (const key of Object.keys(counts)) {
      if (row[key]) counts[key] += 1;
    }
  }
  return {
    trials,
    counts,
    rates: Object.fromEntries(Object.entries(counts).map(([key, value]) => [key, value / trials])),
  };
}

const trials = Number.parseInt(process.env.TRIALS || "100000", 10);
assert.equal(Number.isInteger(trials) && trials > 0, true);
const globalNull = runNull("global", trials);
const pageNull = runNull("page", trials);

console.log(JSON.stringify({
  status: "PASS: familywise p27 DJU/BEI convergence calibration",
  sourceFamily: {
    eligibleRepeatedTerminalPairs: 1,
    selectedPair: ["DJU", "BEI"],
    selectedPairIndex: djuIndex,
    adjacentP27Pairs: p27.length - 1,
  },
  chargedFamily: {
    outputTypes,
    outputTypePairs,
    stepCounts: [1, 2],
    boundaryClasses: ["start", "end", "singleton", "interior"],
    targetCarrier: {wordIndex: carrier.index, start: carrier.start, length: carrier.length},
  },
  blindHoldout: {
    selector: "canonical NEXT pair immediately after DJU/BEI",
    pairIndex: holdoutIndex,
    words: [p27[holdoutIndex].text, p27[holdoutIndex + 1].text],
    starts: [p27[holdoutIndex].start, p27[holdoutIndex + 1].start],
    gp0: [gp0(p27[holdoutIndex]), gp0(p27[holdoutIndex + 1])],
    prediction: "base59/base60 two-step stable-intermediate common-target",
    passes: holdoutPass,
    base59: summarizeHoldoutRow(holdout59),
    base60: summarizeHoldoutRow(holdout60),
    commonTargetWordIndex: holdoutPass ? holdout59.left.target.index : null,
    commonTarget: holdoutPass ? {
      index: holdout59.left.target.index,
      start: holdout59.left.target.start,
      length: holdout59.left.target.length,
      text: holdout59.left.target.text,
    } : null,
  },
  observed: {
    metrics: observed,
    base59: {
      first: [dju59.left.firstValue, dju59.right.firstValue],
      firstClasses: [dju59.left.firstClass, dju59.right.firstClass],
      intermediateAddresses: [dju59.left.intermediateAddress, dju59.right.intermediateAddress],
      secondToken: dju59.left.secondToken,
      second: dju59.left.secondValue,
      secondClass: dju59.left.secondClass,
    },
    base60: {
      first: [dju60.left.firstValue, dju60.right.firstValue],
      firstClasses: [dju60.left.firstClass, dju60.right.firstClass],
      intermediateAddresses: [dju60.left.intermediateAddress, dju60.right.intermediateAddress],
      secondToken: dju60.left.secondToken,
      second: dju60.left.secondValue,
      secondClass: dju60.left.secondClass,
    },
  },
  globalTokenMultisetNull: globalNull,
  perPhysicalP50PageNull: pageNull,
}, null, 2));
