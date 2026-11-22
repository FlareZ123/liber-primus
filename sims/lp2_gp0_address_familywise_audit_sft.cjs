"use strict";

/**
 * Familywise audit of word-number -> p50 ADDRESS only.
 *
 * No base59/base60 decoding is used in the primary event. The table is treated
 * only as an ordered 256-token artifact with repeated-token geometry.
 *
 * Charged family:
 *   - GP0, GP1, GP-prime modulo 256 word numbers;
 *   - zero-origin vs one-origin table address;
 *   - titles included vs titles excluded;
 *   - every aligned p56/p57 word position under each segmentation.
 *
 * Success is frozen from the existing nested-bracket hypothesis:
 *   p56/p57 addressed cells are forward-adjacent distinct token classes,
 *   each class occurs exactly twice, the mate pair is reverse-adjacent,
 *   both duplicate pairs share an integer midpoint, and p57 DIUINITY under
 *   the same word-number/origin convention addresses that midpoint.
 *
 * This is an address/layout test. It does not inspect token numeric values.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const solved = JSON.parse(fs.readFileSync(
  path.join(root, "resources/external/relikd-solved-gp29-native-v1.json"), "utf8"));

const tokens = grid.pages.flatMap((page) => page.tokens);
assert.equal(tokens.length, 256);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runePrime = corpus.prime;

const p56Section = solved.sections.find((section) => section.name === "p56_an_end");
const p57Section = solved.sections.find((section) => section.name === "p57_parable");
assert.ok(p56Section && p57Section);

/**
 * @param {string} source
 * @returns {Array<object>}
 */
function parseWords(source) {
  return source
    .split(/[•⁘⁜⁚\s]+/u)
    .filter(Boolean)
    .filter((piece) => [...piece].some((rune) => runeIndex.has(rune)))
    .map((piece, index) => {
      const gp = [...piece].filter((rune) => runeIndex.has(rune))
        .map((rune) => runeIndex.get(rune));
      return {
        index,
        runes: piece,
        gp0: gp.reduce((a, b) => a + b, 0),
        gp1: gp.reduce((a, b) => a + b + 1, 0),
        gpPrime: gp.reduce((a, b) => a + runePrime[b], 0),
        length: gp.length,
        translit: gp.map((value) => corpus.translit[value]).join(""),
      };
    });
}

const p56All = parseWords(p56Section.source_text);
const p57All = parseWords(p57Section.source_text);
assert.equal(p56All.length, 25);
assert.equal(p57All.length, 20);
assert.equal(p56All[0].translit, "AN");
assert.equal(p56All[1].translit, "END");
assert.equal(p57All[0].translit, "PARABLE");

const segmentations = {
  titlesIncluded: {p56: p56All, p57: p57All},
  titlesExcluded: {p56: p56All.slice(2), p57: p57All.slice(1)},
};
assert.equal(segmentations.titlesExcluded.p56.length, 23);
assert.equal(segmentations.titlesExcluded.p57.length, 19);

const schemes = {
  gp0: (word) => word.gp0,
  gp1: (word) => word.gp1,
  gpPrime: (word) => word.gpPrime,
};

/** @param {number} value @param {"zero"|"one"} origin @returns {number} */
function address(value, origin) {
  if (origin === "zero") return ((value % 256) + 256) % 256;
  return (((value - 1) % 256) + 256) % 256;
}

/**
 * @param {string[]} trialTokens
 * @returns {Map<string, number[]>}
 */
function positionsByToken(trialTokens) {
  const out = new Map();
  for (let i = 0; i < trialTokens.length; i += 1) {
    const token = trialTokens[i];
    if (!out.has(token)) out.set(token, []);
    out.get(token).push(i);
  }
  return out;
}

/**
 * @param {string[]} trialTokens
 * @param {Map<string, number[]>} positions
 * @param {{a:number,b:number,center:number}} config
 * @returns {boolean}
 */
function isNestedHit(trialTokens, positions, config) {
  const {a, b, center} = config;
  if (b !== a + 1) return false;
  const tokenA = trialTokens[a];
  const tokenB = trialTokens[b];
  if (tokenA === tokenB) return false;
  const posA = positions.get(tokenA);
  const posB = positions.get(tokenB);
  if (!posA || !posB || posA.length !== 2 || posB.length !== 2) return false;
  const mateA = posA[0] === a ? posA[1] : posA[0];
  const mateB = posB[0] === b ? posB[1] : posB[0];
  if (mateA !== mateB + 1) return false;
  if (a + mateA !== 2 * center) return false;
  if (b + mateB !== 2 * center) return false;
  return true;
}

const configs = [];
for (const [segmentation, pages] of Object.entries(segmentations)) {
  const divinity = pages.p57.find((word) => word.translit === "DIUINITY");
  assert.ok(divinity);
  const aligned = Math.min(pages.p56.length, pages.p57.length);
  for (const [scheme, valueOf] of Object.entries(schemes)) {
    for (const origin of ["zero", "one"]) {
      const center = address(valueOf(divinity), origin);
      for (let position = 0; position < aligned; position += 1) {
        configs.push({
          segmentation,
          scheme,
          origin,
          oneBasedPosition: position + 1,
          p56Word: pages.p56[position].translit,
          p57Word: pages.p57[position].translit,
          a: address(valueOf(pages.p56[position]), origin),
          b: address(valueOf(pages.p57[position]), origin),
          center,
        });
      }
    }
  }
}
assert.equal(configs.length, 234);

const originalPositions = positionsByToken(tokens);
const originalHits = configs.filter((config) =>
  isNestedHit(tokens, originalPositions, config));

assert.deepEqual(originalHits, [{
  segmentation: "titlesIncluded",
  scheme: "gp0",
  origin: "zero",
  oneBasedPosition: 20,
  p56Word: "PILGRIM",
  p57Word: "EMERGE",
  a: 82,
  b: 83,
  center: 105,
}]);

assert.equal(tokens[82], "3L");
assert.equal(tokens[83], "3D");
assert.equal(tokens[105], "13");
assert.equal(tokens[127], "3D");
assert.equal(tokens[128], "3L");

// Address-only holdout chronology: the p57 source relation alone fixes
// EMERGE=83 and DIUINITY=105; applying the same frozen convention to the
// later-inspected p56 word PILGRIM predicts the immediately outer address82.
const p57Emerge = p57All.find((word) => word.translit === "EMERGE");
const p57Divinity = p57All.find((word) => word.translit === "DIUINITY");
const p56Pilgrim = p56All.find((word) => word.translit === "PILGRIM");
assert.equal(p57Emerge.gp0, 83);
assert.equal(p57Divinity.gp0, 105);
assert.equal(p56Pilgrim.gp0, 82);

// Exact-token-multiset matched null, charging the whole 234-configuration
// family. The seeded shuffle changes table placement only.
let state = 0x1685c0de;
function next32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
/** @param {string[]} array */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = next32() % (i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
}

const trials = 200000;
let familyAny = 0;
let observedConfig = 0;
const observed = originalHits[0];
for (let trial = 0; trial < trials; trial += 1) {
  const permuted = tokens.slice();
  shuffle(permuted);
  const positions = positionsByToken(permuted);
  if (configs.some((config) => isNestedHit(permuted, positions, config))) {
    familyAny += 1;
  }
  if (isNestedHit(permuted, positions, observed)) observedConfig += 1;
}

assert.equal(observedConfig, 0);
assert.equal(familyAny, 3);

console.log(JSON.stringify({
  status: "PASS: address-only family frozen and audited",
  configCount: configs.length,
  originalHits,
  null: {
    seed: "0x1685c0de",
    trials,
    observedConfig,
    observedConfigRate: observedConfig / trials,
    familyAny,
    familyAnyRate: familyAny / trials,
  },
  addressOnlyHoldout: {
    training: ["p57 EMERGE gp0=83", "p57 DIUINITY gp0=105"],
    laterCrossPagePrediction: "p56 PILGRIM gp0=82",
    tableGeometry: ["82:3L", "83:3D", "105:13", "127:3D", "128:3L"],
  },
}, null, 2));
