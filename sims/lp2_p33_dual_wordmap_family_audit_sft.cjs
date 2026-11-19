"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const raw = read("resources/liber-primus/lp2-transcription.txt");
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const tape = grid.pages.flatMap((page) => page.tokens);
const alpha60 = grid.alphabet;
const alpha59 = alpha60.replace("f", "");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol: symbol.toUpperCase(), value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

const state = Object.freeze({
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
  e: 3,
  q: 4,
});
const stateNames = Object.keys(state);
const stateValues = stateNames.map((name) => state[name]);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} left @param {number} right @returns {[number, number]} */
function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

/** @param {string} word0 @returns {number} */
function gp0(word0) {
  const word = word0
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  let total = 0;
  for (let offset = 0; offset < word.length;) {
    if (word.startsWith("ING", offset)) {
      total += 21;
      offset += 3;
      continue;
    }
    if (word.startsWith("IO", offset)) {
      total += 27;
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) => word.startsWith(candidate.symbol, offset));
    assert.ok(token, "unmapped GP word: " + word.slice(offset));
    total += token.value;
    offset += token.symbol.length;
  }
  return total;
}

/**
 * @param {string} source
 * @returns {{start:number,values:number[]}[]}
 */
function parseWords(source) {
  const words = [];
  let current = [];
  let start = 0;
  let runeOffset = 0;
  const flush = () => {
    if (!current.length) return;
    words.push({ start, values: current.slice() });
    current = [];
  };
  for (const character of source) {
    const value = runeIndex.get(character);
    if (value !== undefined) {
      if (!current.length) start = runeOffset;
      current.push(value);
      runeOffset += 1;
    } else if (character === "-" || character === "." || character === "&") {
      flush();
    } else if (character === "/" || /\s/u.test(character)) {
      // Printed wraps stay inside a word.
    } else {
      flush();
    }
  }
  flush();
  return words;
}

/** @param {number} address @returns {{low60:number,base59:number,base60:number}} */
function tableOutputs(address) {
  assert.ok(Number.isInteger(address) && address >= 0 && address < tape.length);
  const token = tape[address];
  const high60 = alpha60.indexOf(token[0]);
  const low60 = alpha60.indexOf(token[1]);
  const high59 = alpha59.indexOf(token[0]);
  const low59 = alpha59.indexOf(token[1]);
  return {
    low60,
    base59: high59 >= 0 && low59 >= 0 ? 59 * high59 + low59 : -1,
    base60: 60 * high60 + low60,
  };
}

/** @param {number} value @returns {{kind:string,value:number}[]} */
function outputPalette(value) {
  const outputs = [{ kind: "identity", value }];
  if (value >= 0 && value < tape.length) {
    const table = tableOutputs(value);
    outputs.push({ kind: "low60", value: table.low60 });
    if (table.base59 >= 0) outputs.push({ kind: "base59", value: table.base59 });
    outputs.push({ kind: "base60", value: table.base60 });
  }
  return outputs;
}

const p33 = raw.split(/^\s*%\s*$/m)[33];
const units = p33.split("&");
assert.equal(units.length, 2);
const upper = parseWords(units[0].split(".").slice(1).join("."));
const lower = parseWords(units[1].split(".").slice(1).join("."));
const sums = (words) => words.map((word) => word.values.reduce((sum, value) => sum + value, 0));
const upperGp0 = sums(upper);
const lowerGp0 = sums(lower);
assert.equal(upper.length, 21);
assert.equal(lower.length, 28);

const targetWords = Object.freeze([
  ["TUNNELNG", gp0("TUNNELNG")],
  ["TO", gp0("TO")],
  ["THE", gp0("THE")],
  ["SURFACE", gp0("SURFACE")],
  ["WE", gp0("WE")],
  ["MUST", gp0("MUST")],
  ["SHED", gp0("SHED")],
  ["OUR", gp0("OUR")],
  ["OWN", gp0("OWN")],
  ["CIRCUMFERENCES", gp0("CIRCUMFERENCES")],
  ["FIND", gp0("FIND")],
  ["DIUINITY", gp0("DIUINITY")],
  ["WITHIN", gp0("WITHIN")],
  ["AND", gp0("AND")],
  ["EMERGE", gp0("EMERGE")],
]);
const targetValueSet = new Set(targetWords.map((entry) => entry[1]));
const targetNamesByValue = new Map();
for (const [name, value] of targetWords) {
  if (!targetNamesByValue.has(value)) targetNamesByValue.set(value, []);
  targetNamesByValue.get(value).push(name);
}

assert.deepEqual(Object.fromEntries(targetWords), {
  TUNNELNG: 94,
  TO: 19,
  THE: 20,
  SURFACE: 67,
  WE: 25,
  MUST: 51,
  SHED: 64,
  OUR: 8,
  OWN: 19,
  CIRCUMFERENCES: 131,
  FIND: 42,
  DIUINITY: 105,
  WITHIN: 38,
  AND: 56,
  EMERGE: 83,
});

/**
 * Minimal closed expression family containing every operation type used by the
 * published p33 word-map positions, excluding the separate post-discovery SHED
 * power claim. Direct atoms, modular negation, raw + / - / *, and both H
 * coordinates are charged. Broader arithmetic families can only increase
 * selector multiplicity.
 * @param {{[key:string]:number}} assignment
 * @returns {{syntax:string,kind:string,value:number}[]}
 */
function buildExpressions(assignment) {
  const entries = stateNames.map((name) => [name, assignment[name]]);
  const expressions = [];
  for (const [name, value] of entries) {
    expressions.push({ syntax: name, kind: "atom", value });
    expressions.push({ syntax: `-${name} mod29`, kind: "neg", value: mod29(-value) });
  }
  for (let i = 0; i < entries.length; i += 1) {
    for (let j = i; j < entries.length; j += 1) {
      const [leftName, left] = entries[i];
      const [rightName, right] = entries[j];
      expressions.push({ syntax: `${leftName}+${rightName}`, kind: "add", value: left + right });
      expressions.push({ syntax: `${leftName}*${rightName}`, kind: "mul", value: left * right });
      expressions.push({ syntax: `H1(${leftName},${rightName})`, kind: "hsum", value: mod29(left + right) });
    }
  }
  for (let i = 0; i < entries.length; i += 1) {
    for (let j = 0; j < entries.length; j += 1) {
      if (i === j) continue;
      const [leftName, left] = entries[i];
      const [rightName, right] = entries[j];
      expressions.push({ syntax: `${leftName}-${rightName}`, kind: "sub", value: left - right });
      expressions.push({ syntax: `H0(${leftName},${rightName})`, kind: "hdiff", value: mod29(left - right) });
    }
  }
  return expressions;
}

/**
 * @param {{[key:string]:number}} assignment
 * @param {number} length
 * @returns {{syntax:string,kind:string,value:number,origin:string,orientation:string,position:number}[]}
 */
function buildSelectors(assignment, length) {
  const selectors = [];
  for (const expression of buildExpressions(assignment)) {
    for (const origin of ["one", "zero"]) {
      const forward = origin === "one" ? expression.value : expression.value + 1;
      if (!Number.isInteger(forward) || forward < 1 || forward > length) continue;
      selectors.push({ ...expression, origin, orientation: "forward", position: forward });
      selectors.push({
        ...expression,
        origin,
        orientation: "reverse",
        position: length + 1 - forward,
      });
    }
  }
  return selectors;
}

const upperSelectors = buildSelectors(state, upper.length);
const lowerSelectors = buildSelectors(state, lower.length);
const upperCoveredPositions = [...new Set(upperSelectors.map((selector) => selector.position))].sort((a, b) => a - b);
const lowerCoveredPositions = [...new Set(lowerSelectors.map((selector) => selector.position))].sort((a, b) => a - b);

/** @param {Array<{position:number}>} selectors @param {number} position @returns {number} */
function selectorCount(selectors, position) {
  return selectors.filter((selector) => selector.position === position).length;
}

const reportedPositions = {
  upper: {
    e: state.e,
    bPlusK: state.b + state.K,
    hEqSecond: H(state.e, state.q)[1],
    eSquared: state.e * state.e,
    APlusK: state.A + state.K,
    a: state.a,
  },
  lower: {
    g: state.g,
    pMinusE: state.p - state.e,
    pPlusK: state.p + state.K,
  },
};

const reportedPositionAmbiguity = {
  upper: Object.fromEntries(Object.entries(reportedPositions.upper).map(([name, position]) => [
    name,
    { position, selectors: selectorCount(upperSelectors, position) },
  ])),
  lower: Object.fromEntries(Object.entries(reportedPositions.lower).map(([name, position]) => [
    name,
    { position, selectors: selectorCount(lowerSelectors, position) },
  ])),
};

/**
 * @param {number[]} mapValues
 * @param {Array<{position:number,syntax:string,origin:string,orientation:string}>} selectors
 * @param {number} target
 * @returns {{count:number,examples:string[]}}
 */
function targetPathCount(mapValues, selectors, target) {
  let count = 0;
  const examples = [];
  for (const selector of selectors) {
    const raw = mapValues[selector.position - 1];
    for (const output of outputPalette(raw)) {
      if (output.value !== target) continue;
      count += 1;
      if (examples.length < 8) {
        examples.push(`${selector.syntax}/${selector.origin}/${selector.orientation}@${selector.position}:${output.kind}`);
      }
    }
  }
  return { count, examples };
}

const targetPathCounts = {};
for (const [name, value] of targetWords) {
  const upperCount = targetPathCount(upperGp0, upperSelectors, value);
  const lowerCount = targetPathCount(lowerGp0, lowerSelectors, value);
  targetPathCounts[name] = {
    gp0: value,
    upper: upperCount,
    lower: lowerCount,
    total: upperCount.count + lowerCount.count,
  };
}

/**
 * @param {number[]} values
 * @param {number[]} selectedPositions
 * @returns {Set<number>}
 */
function reachableTargetValues(values, selectedPositions) {
  const hit = new Set();
  for (const position of selectedPositions) {
    const raw = values[position - 1];
    for (const output of outputPalette(raw)) {
      if (targetValueSet.has(output.value)) hit.add(output.value);
    }
  }
  return hit;
}

const parts = raw.split(/^\s*%\s*$/m);
const windowsByLength = { 21: [], 28: [] };
for (let physicalPage = 0; physicalPage <= 55; physicalPage += 1) {
  if (physicalPage === 50) continue;
  const source = parts[physicalPage <= 49 ? physicalPage : physicalPage - 1];
  const words = parseWords(source);
  const values = sums(words);
  for (const length of [21, 28]) {
    for (let start = 0; start + length <= words.length; start += 1) {
      const selectedPositions = length === 21 ? upperCoveredPositions : lowerCoveredPositions;
      const hits = reachableTargetValues(values.slice(start, start + length), selectedPositions);
      windowsByLength[length].push({
        physicalPage,
        startWord: start + 1,
        startOffset: words[start].start,
        score: hits.size,
        hits: [...hits].sort((a, b) => a - b),
      });
    }
  }
}
assert.equal(windowsByLength[21].length, 1833);
assert.equal(windowsByLength[28].length, 1474);

/** @param {{score:number}[]} windows @returns {{[key:string]:number}} */
function histogram(windows) {
  const h = {};
  for (const window of windows) h[window.score] = (h[window.score] || 0) + 1;
  return h;
}

const p33UpperWindow = windowsByLength[21].find((window) =>
  window.physicalPage === 33 && window.startWord === 3 && window.startOffset === 10
);
const p33LowerWindow = windowsByLength[28].find((window) =>
  window.physicalPage === 33 && window.startWord === 26 && window.startOffset === 99
);
assert.ok(p33UpperWindow);
assert.ok(p33LowerWindow);

/**
 * @param {number} length
 * @param {{value:number,target:number}[]} pattern
 * @returns {{origin:string,orientation:string,hits:number,locations:string[]}[]}
 */
function exactPatternConventionScan(length, pattern) {
  const out = [];
  for (const origin of ["one", "zero"]) {
    for (const orientation of ["forward", "reverse"]) {
      const positions = pattern.map(({ value, target }) => {
        const p0 = origin === "one" ? value : value + 1;
        const position = orientation === "forward" ? p0 : length + 1 - p0;
        return { position, target };
      });
      if (positions.some(({ position }) => position < 1 || position > length)) {
        out.push({ origin, orientation, hits: 0, locations: [] });
        continue;
      }
      const hits = [];
      for (const window of windowsByLength[length]) {
        const physicalSource = parts[window.physicalPage <= 49 ? window.physicalPage : window.physicalPage - 1];
        const pageWords = parseWords(physicalSource);
        const pageValues = sums(pageWords);
        const start = window.startWord - 1;
        const ok = positions.every(({ position, target }) => pageValues[start + position - 1] === target);
        if (ok) hits.push(`p${window.physicalPage}:w${window.startWord}:r${window.startOffset}`);
      }
      out.push({ origin, orientation, hits: hits.length, locations: hits });
    }
  }
  return out;
}

const upperExactPattern = [
  { value: state.e, target: gp0("TUNNELNG") },
  { value: state.b + state.K, target: gp0("TO") },
  { value: H(state.e, state.q)[1], target: gp0("THE") },
  { value: state.e * state.e, target: gp0("DIUINITY") },
  { value: state.A + state.K, target: gp0("WITHIN") },
  { value: state.a, target: gp0("ORIGINAL") },
];
const lowerExactPattern = [
  { value: state.g, target: gp0("SURFACE") },
  { value: state.p - state.e, target: gp0("FIND") },
  { value: state.p + state.K, target: gp0("EMERGE") },
];
const exactConventionControls = {
  upper: exactPatternConventionScan(21, upperExactPattern),
  lower: exactPatternConventionScan(28, lowerExactPattern),
};

/** @param {number} value @param {number} length @param {string} origin @param {string} orientation @returns {number|null} */
function conventionPosition(value, length, origin, orientation) {
  const p0 = origin === "one" ? value : value + 1;
  if (!Number.isInteger(p0) || p0 < 1 || p0 > length) return null;
  return orientation === "forward" ? p0 : length + 1 - p0;
}

/** @param {number[]} mapValues @param {number|null} position @returns {number|null} */
function valueAt(mapValues, position) {
  return position === null ? null : mapValues[position - 1];
}

let trainingConfigs = 0;
let heldoutConfigs = 0;
let publishedConventionTrainingPermutations = 0;
let publishedConventionHeldoutPermutations = 0;
const heldoutExamples = [];

/** @param {number[]} values @param {number} start */
function permute(values, start) {
  if (start === values.length) {
    const assignment = {};
    for (let i = 0; i < stateNames.length; i += 1) assignment[stateNames[i]] = values[i];

    for (const upperOrigin of ["one", "zero"]) {
      for (const upperOrientation of ["forward", "reverse"]) {
        for (const lowerOrigin of ["one", "zero"]) {
          for (const lowerOrientation of ["forward", "reverse"]) {
            for (const hMode of ["diff-eq", "diff-qe", "sum-eq", "sum-qe"]) {
              const hValue = hMode === "diff-eq" ? mod29(assignment.e - assignment.q)
                : hMode === "diff-qe" ? mod29(assignment.q - assignment.e)
                  : mod29(assignment.e + assignment.q);

              const pTunnel = conventionPosition(assignment.e, 21, upperOrigin, upperOrientation);
              const pTo = conventionPosition(assignment.b + assignment.K, 21, upperOrigin, upperOrientation);
              const pThe = conventionPosition(hValue, 21, upperOrigin, upperOrientation);
              const pSurface = conventionPosition(assignment.g, 28, lowerOrigin, lowerOrientation);
              const training = valueAt(upperGp0, pTunnel) === gp0("TUNNELNG")
                && valueAt(upperGp0, pTo) === gp0("TO")
                && valueAt(upperGp0, pThe) === gp0("THE")
                && valueAt(lowerGp0, pSurface) === gp0("SURFACE");
              if (!training) continue;
              trainingConfigs += 1;

              const publishedConvention = upperOrigin === "one"
                && upperOrientation === "forward"
                && lowerOrigin === "one"
                && lowerOrientation === "forward"
                && hMode === "sum-eq";
              if (publishedConvention) publishedConventionTrainingPermutations += 1;

              const pDivinity = conventionPosition(assignment.e * assignment.e, 21, upperOrigin, upperOrientation);
              const pWithin = conventionPosition(assignment.A + assignment.K, 21, upperOrigin, upperOrientation);
              const pFind = conventionPosition(assignment.p - assignment.e, 28, lowerOrigin, lowerOrientation);
              const pEmerge = conventionPosition(assignment.p + assignment.K, 28, lowerOrigin, lowerOrientation);
              const tunnelValue = valueAt(upperGp0, pTunnel);
              const theValue = valueAt(upperGp0, pThe);
              const findFromThe = theValue !== null && theValue >= 0 && theValue < tape.length
                && tableOutputs(theValue).low60 === gp0("FIND");
              const andFromTunnel = tunnelValue !== null && tunnelValue >= 0 && tunnelValue < tape.length
                && tableOutputs(tunnelValue).base60 === gp0("AND");

              const heldout = findFromThe
                && valueAt(lowerGp0, pFind) === gp0("FIND")
                && valueAt(upperGp0, pThe) === gp0("THE")
                && valueAt(upperGp0, pDivinity) === gp0("DIUINITY")
                && valueAt(upperGp0, pWithin) === gp0("WITHIN")
                && andFromTunnel
                && valueAt(lowerGp0, pEmerge) === gp0("EMERGE");
              if (!heldout) continue;
              heldoutConfigs += 1;
              if (publishedConvention) publishedConventionHeldoutPermutations += 1;
              if (heldoutExamples.length < 8) {
                heldoutExamples.push({ assignment: { ...assignment }, upperOrigin, upperOrientation, lowerOrigin, lowerOrientation, hMode });
              }
            }
          }
        }
      }
    }
    return;
  }
  for (let i = start; i < values.length; i += 1) {
    [values[start], values[i]] = [values[i], values[start]];
    permute(values, start + 1);
    [values[start], values[i]] = [values[i], values[start]];
  }
}
permute(stateValues.slice(), 0);

const p33UpperAtLeast = windowsByLength[21].filter((window) => window.score >= p33UpperWindow.score).length;
const p33LowerAtLeast = windowsByLength[28].filter((window) => window.score >= p33LowerWindow.score).length;
const maxUpperScore = Math.max(...windowsByLength[21].map((window) => window.score));
const maxLowerScore = Math.max(...windowsByLength[28].map((window) => window.score));

const uniqueP57Gp0Values = [...targetValueSet].sort((a, b) => a - b);
const p57Gp0Collisions = [...targetNamesByValue.entries()]
  .filter(([, names]) => names.length > 1)
  .map(([value, names]) => ({ value, names }));

assert.deepEqual(p57Gp0Collisions, [{ value: 19, names: ["TO", "OWN"] }]);
assert.equal(upperCoveredPositions.length, 21);
assert.equal(lowerCoveredPositions.length, 28);
assert.ok(trainingConfigs > 0);
assert.ok(heldoutConfigs > 0);

console.log(JSON.stringify({
  status: "PASS",
  scope: {
    expressionFamily: "direct atom, modular negation, raw + / - / *, H0/H1; SHED power excluded",
    mapConventions: ["one-forward", "one-reverse", "zero-forward", "zero-reverse"],
    outputPalette: ["identity", "p50 low60", "p50 base59", "p50 base60"],
    stateRolePermutations: 362880,
  },
  familySize: {
    expressions: buildExpressions(state).length,
    upperSelectors: upperSelectors.length,
    lowerSelectors: lowerSelectors.length,
    upperCoveredPositions,
    lowerCoveredPositions,
  },
  reportedPositionAmbiguity,
  p57Gp0: {
    lexicalSlots: targetWords.length,
    uniqueValues: uniqueP57Gp0Values.length,
    collisions: p57Gp0Collisions,
  },
  targetPathCounts,
  fixedTupleConventionControls: exactConventionControls,
  matchedWindowControls: {
    upper: {
      windows: windowsByLength[21].length,
      p33: p33UpperWindow,
      maxScore: maxUpperScore,
      atLeastP33: p33UpperAtLeast,
      histogram: histogram(windowsByLength[21]),
    },
    lower: {
      windows: windowsByLength[28].length,
      p33: p33LowerWindow,
      maxScore: maxLowerScore,
      atLeastP33: p33LowerAtLeast,
      histogram: histogram(windowsByLength[28]),
    },
    scoreMeaning: "distinct solved-p57 GP0 values reachable from any charged selector and the frozen four-output p50 palette",
  },
  withheldThirdClause: {
    trainingClause: "TUNNELNG TO THE SURFACE",
    heldoutClause: "FIND THE DIUINITY WITHIN AND EMERGE",
    trainingConfigs,
    heldoutConfigs,
    publishedConventionTrainingPermutations,
    publishedConventionHeldoutPermutations,
    heldoutExamples,
    strictProspectiveResult: "FAIL: the training clause does not define which new expressions (p-e, e*e, A+K, p+K) must be evaluated or in what lexical order. The nonzero heldout count is conditional on granting those exact heldout formulas after the fact; it is therefore an ambiguity census, not a prediction.",
  },
  decision: "The exact one-based-forward p33 tuples remain source-selective matched-window observations, but the minimal operation family that contains the published selectors reaches every cell of both maps and supplies many alternative selector/output paths. A first-clause training gate does not generate the held-out third-clause selectors or their order. The dual word-map reconstruction therefore fails the issue's prospective grammar criterion and must remain post-selected corroboration rather than an instruction engine. SHED is separately excluded from this audit because its power construction was recognized after the known lexical slot.",
}, null, 2));
