"use strict";

/**
 * Director #1694: familywise audit of the title-inclusive p56/p57 word20
 * nested-duplicate bracket anchor.
 *
 * Frozen model family:
 *   - p56 title included/excluded (AN END = 2 words)
 *   - p57 title included/excluded (PARABLE = 1 word)
 *   - start-aligned / end-aligned section pairing
 *   - GP0 / GP1 / GP-prime word numbers
 *   - zero-based / one-based p50 addressing
 *
 * The bracket predicate is value-blind:
 *   addressed cells are consecutive [s,s+1], both token classes occur exactly
 *   twice in the 256-cell table, and their duplicate occurrence pairs have
 *   the same midpoint. No radix is used.
 *
 * Two deterministic controls are then run:
 *   1. exact-token-multiset table permutations with solved words fixed;
 *   2. solved-body word-order permutations with titles fixed and table fixed.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"),
  "utf8"
));
const solved = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "external", "relikd-solved-gp29-native-v1.json"),
  "utf8"
));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-grid-256.json"),
  "utf8"
));

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const tokens = grid.pages.flatMap((page) => page.tokens);

/** @param {string} text @returns {number[][]} */
function parseRuneWords(text) {
  const words = [];
  let current = [];
  for (const ch of [...text]) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      current.push(value);
    } else if (current.length) {
      words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  return words;
}

/** @param {number[]} word @returns {string} */
function spell(word) {
  return word.map((value) => corpus.translit[value]).join("");
}

/** @param {string} sectionName @returns {{word:string,gp0:number,gp1:number,prime:number}[]} */
function sectionRows(sectionName) {
  const section = solved.sections.find((candidate) => candidate.name === sectionName);
  assert.ok(section);
  return parseRuneWords(section.source_text).map((word) => ({
    word: spell(word),
    gp0: word.reduce((sum, value) => sum + value, 0),
    gp1: word.reduce((sum, value) => sum + value + 1, 0),
    prime: word.reduce((sum, value) => sum + corpus.prime[value], 0)
  }));
}

/** @param {string[]} table @returns {Map<string, number[]>} */
function occurrences(table) {
  const result = new Map();
  table.forEach((token, index) => {
    if (!result.has(token)) result.set(token, []);
    result.get(token).push(index);
  });
  return result;
}

/**
 * @param {string[]} table
 * @returns {{start:number,center:number,first:string,second:string}[]}
 */
function nestedPairs(table) {
  const positions = occurrences(table);
  const result = [];
  for (let start = 0; start + 1 < table.length; start += 1) {
    const first = positions.get(table[start]);
    const second = positions.get(table[start + 1]);
    if (
      first.length === 2 &&
      second.length === 2 &&
      first[0] + first[1] === second[0] + second[1]
    ) {
      result.push({
        start,
        center: (first[0] + first[1]) / 2,
        first: table[start],
        second: table[start + 1]
      });
    }
  }
  return result;
}

/**
 * @param {object[]} rows
 * @param {boolean} includeTitle
 * @param {number} titleLength
 * @returns {object[]}
 */
function segment(rows, includeTitle, titleLength) {
  return includeTitle ? rows : rows.slice(titleLength);
}

/**
 * @param {object[]} left
 * @param {object[]} right
 * @param {"start"|"end"} mode
 * @returns {{position:number,left:object,right:object}[]}
 */
function align(left, right, mode) {
  const count = Math.min(left.length, right.length);
  const result = [];
  for (let index = 0; index < count; index += 1) {
    result.push({
      position: index + 1,
      left: mode === "start" ? left[index] : left[left.length - count + index],
      right: mode === "start" ? right[index] : right[right.length - count + index]
    });
  }
  return result;
}

/**
 * @param {object[]} p56
 * @param {object[]} p57
 * @param {Set<number>} validStarts
 * @returns {object[]}
 */
function evaluateFamily(p56, p57, validStarts) {
  const models = [];
  for (const p56Title of [true, false]) {
    for (const p57Title of [true, false]) {
      for (const alignment of ["start", "end"]) {
        for (const metric of ["gp0", "gp1", "prime"]) {
          for (const origin of [0, 1]) {
            const pairs = align(
              segment(p56, p56Title, 2),
              segment(p57, p57Title, 1),
              alignment
            );
            const hits = [];
            for (const pair of pairs) {
              const leftAddress = pair.left[metric] - origin;
              const rightAddress = pair.right[metric] - origin;
              if (
                rightAddress === leftAddress + 1 &&
                validStarts.has(leftAddress)
              ) {
                hits.push({
                  position: pair.position,
                  leftWord: pair.left.word,
                  rightWord: pair.right.word,
                  addresses: [leftAddress, rightAddress]
                });
              }
            }
            models.push({
              p56Title,
              p57Title,
              alignment,
              metric,
              origin,
              alignedCount: pairs.length,
              hits
            });
          }
        }
      }
    }
  }
  return models;
}

/**
 * @param {object[]} p56
 * @param {object[]} p57
 * @returns {Set<number>}
 */
function candidateStarts(p56, p57) {
  const starts = new Set();
  const empty = new Set();
  const models = evaluateFamily(p56, p57, empty);
  for (const model of models) {
    const pairs = align(
      segment(p56, model.p56Title, 2),
      segment(p57, model.p57Title, 1),
      model.alignment
    );
    for (const pair of pairs) {
      const leftAddress = pair.left[model.metric] - model.origin;
      const rightAddress = pair.right[model.metric] - model.origin;
      if (
        leftAddress >= 0 &&
        leftAddress < 255 &&
        rightAddress === leftAddress + 1
      ) {
        starts.add(leftAddress);
      }
    }
  }
  return starts;
}

/** @returns {() => number} */
function makeRng() {
  let state = 0x1694a3f1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
}

/** @param {unknown[]} input @param {() => number} rng @returns {unknown[]} */
function shuffled(input, rng) {
  const result = input.slice();
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(rng() * (index + 1));
    const value = result[index];
    result[index] = result[swap];
    result[swap] = value;
  }
  return result;
}

/**
 * Faster nested-pair membership for a small candidate-start set.
 * @param {string[]} table
 * @param {Set<number>} starts
 * @returns {{start:number,center:number}[]}
 */
function nestedAtStarts(table, starts) {
  const positions = occurrences(table);
  const hits = [];
  for (const start of starts) {
    const first = positions.get(table[start]);
    const second = positions.get(table[start + 1]);
    if (
      first.length === 2 &&
      second.length === 2 &&
      first[0] + first[1] === second[0] + second[1]
    ) {
      hits.push({ start, center: (first[0] + first[1]) / 2 });
    }
  }
  return hits;
}

const p56 = sectionRows("p56_an_end");
const p57 = sectionRows("p57_parable");
assert.equal(p56.length, 25);
assert.equal(p57.length, 20);

const originalPairs = nestedPairs(tokens);
assert.deepEqual(
  originalPairs.map((pair) => [pair.start, pair.center, pair.first, pair.second]),
  [[82, 105, "3L", "3D"], [127, 105, "3D", "3L"]]
);

const originalStarts = new Set(originalPairs.map((pair) => pair.start));
const models = evaluateFamily(p56, p57, originalStarts);
assert.equal(models.length, 48);
const hitModels = models.filter((model) => model.hits.length > 0);

assert.deepEqual(hitModels, [{
  p56Title: true,
  p57Title: true,
  alignment: "start",
  metric: "gp0",
  origin: 0,
  alignedCount: 20,
  hits: [{
    position: 20,
    leftWord: "PILGRIM",
    rightWord: "EMERGE",
    addresses: [82, 83]
  }]
}]);

const starts = candidateStarts(p56, p57);
assert.deepEqual([...starts].sort((a, b) => a - b), [18, 19, 20, 21, 23, 24, 81, 82]);

// Held-out solved-page prediction: DIUINITY was not used in the bracket
// predicate or the p56/p57 alignment. The winning bracket has center105.
const winningPair = originalPairs.find((pair) => pair.start === 82);
assert.equal(winningPair.center, 105);
const centerWords = p57.filter((row) => row.gp0 === winningPair.center);
assert.deepEqual(centerWords.map((row) => row.word), ["DIUINITY"]);
assert.equal(tokens[winningPair.center], "13");
assert.equal(tokens.filter((token) => token === "13").length, 1);

// Deterministic matched controls.
const trials = 100000;
const rng = makeRng();
let tableAnyFamilyHit = 0;
let tableWinningCenter105 = 0;
let wordAnyFamilyHit = 0;

for (let trial = 0; trial < trials; trial += 1) {
  const table = shuffled(tokens, rng);
  const tableHits = nestedAtStarts(table, starts);
  if (tableHits.length > 0) tableAnyFamilyHit += 1;
  if (tableHits.some((hit) => hit.start === 82 && hit.center === 105)) {
    tableWinningCenter105 += 1;
  }

  const shuffledP56 = p56.slice(0, 2).concat(shuffled(p56.slice(2), rng));
  const shuffledP57 = p57.slice(0, 1).concat(shuffled(p57.slice(1), rng));
  const wordModels = evaluateFamily(shuffledP56, shuffledP57, originalStarts);
  if (wordModels.some((model) => model.hits.length > 0)) wordAnyFamilyHit += 1;
}

assert.ok(tableAnyFamilyHit > 0);
assert.ok(wordAnyFamilyHit > 0);

// The exact source result must remain materially rarer than the matched
// controls' broad any-family event; these bounds guard accidental fixture drift.
assert.ok(tableAnyFamilyHit / trials < 0.05);
assert.ok(wordAnyFamilyHit / trials < 0.25);
assert.ok(tableWinningCenter105 / trials < 0.001);

console.log(JSON.stringify({
  status: "PASS: #1694 familywise bracket anchor audit",
  family: {
    modelCount: models.length,
    candidateStarts: [...starts].sort((a, b) => a - b),
    hitModelCount: hitModels.length,
    hitModels
  },
  bracket: originalPairs,
  heldOutSolvedFeature: {
    center: winningPair.center,
    p57Gp0CenterWords: centerWords.map((row) => row.word),
    centerToken: tokens[winningPair.center],
    centerTokenMultiplicity: tokens.filter((token) => token === "13").length
  },
  controls: {
    trials,
    seed: "0x1694a3f1",
    exactTokenMultisetTablePermutation: {
      anyFamilyHit: tableAnyFamilyHit,
      fraction: tableAnyFamilyHit / trials,
      winningStart82AndCenter105: tableWinningCenter105,
      winningCenterFraction: tableWinningCenter105 / trials
    },
    titleFixedSolvedBodyPermutation: {
      anyFamilyHit: wordAnyFamilyHit,
      fraction: wordAnyFamilyHit / trials
    }
  },
  decision: "Title-inclusive, start-aligned, GP0, zero-origin is the unique hit in the 48-model frozen family and predicts DIUINITY at the independently derived center105; retain as a solved-control anchor, still without a value-changing unknown-page receiver."
}, null, 2));
