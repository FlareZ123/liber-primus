"use strict";

/**
 * P50 literal-leading-zero association after exact event-bearing-word
 * conditioning.
 *
 * This SFT starts from the canonical 86 same-page adjacent-equality events.
 * Prior repository work already localized their published gap correlation
 * largely to the identities of the 85 printed words that contain them.
 * Here we hold those exact word/page groups and event counts fixed and ask
 * whether the phase-0 p50 literal-leading-zero mask still predicts the
 * within-word event offset.
 *
 * Exact finite convolution, no Monte Carlo, no language score.
 * Node.js 22 CommonJS:
 *   node sims/lp2_doublet_gap_nonstationarity_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const master = fs.readFileSync(path.join(
  root, "resources", "transcriptions", "liber_primus_master.txt"), "utf8")
  .replace(/\r\n/g, "\n");
const corpus = JSON.parse(fs.readFileSync(path.join(
  root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(path.join(
  root, "resources", "liber-primus", "lp2-grid-256.json"), "utf8"));

const RUNES = /[\u16A0-\u16FF]/gu;

/** @param {string} text @returns {string[][]} */
function words(text) {
  return text.split(/[-.&§]/u).map(part => part.match(RUNES)).filter(Boolean);
}

/** @param {number} n @param {number} k @returns {number} */
function choose(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  k = Math.min(k, n - k);
  let value = 1;
  for (let i = 1; i <= k; i++) value = value * (n - k + i) / i;
  return value;
}

/**
 * @typedef {{
 *   wordId:number,
 *   page:number,
 *   positions:number[],
 *   eventCount:number,
 *   maskedEventCount:number
 * }} Group
 */

const sections = master.slice(master.indexOf("\n\n") + 2).split("$");
const wordGlyphs = sections.slice(7, 16).flatMap(words);
assert.equal(wordGlyphs.length, 2896);

const runeIndex = new Map(corpus.runes.map((glyph, index) => [glyph, index]));
const flat = wordGlyphs.flat().map(glyph => {
  assert(runeIndex.has(glyph));
  return runeIndex.get(glyph);
});
const pages = corpus.pages.filter(page => page.page <= 55 && page.indices.length > 0);
assert.equal(pages.length, 55);
assert.equal(flat.length, 12956);
assert.deepEqual(flat, pages.flatMap(page => page.indices));

const wordIdAt = new Int32Array(flat.length);
let wordCursor = 0;
for (let wordId = 0; wordId < wordGlyphs.length; wordId++) {
  const next = wordCursor + wordGlyphs[wordId].length;
  wordIdAt.fill(wordId, wordCursor, next);
  wordCursor = next;
}
assert.equal(wordCursor, flat.length);

const tokens = grid.pages.flatMap(page => page.tokens);
assert.equal(tokens.length, 256);
const leadingZero = tokens.map(token => token[0] === "0");
assert.equal(leadingZero.filter(Boolean).length, 60);

/** @type {Map<string, Group>} */
const allGroups = new Map();
const eventPositions = [];
let globalOffset = 0;
for (const page of pages) {
  for (let local = 1; local < page.indices.length; local++) {
    const position = globalOffset + local;
    const wordId = wordIdAt[position];
    const key = wordId + ":" + page.page;
    if (!allGroups.has(key)) {
      allGroups.set(key, {
        wordId,
        page: page.page,
        positions: [],
        eventCount: 0,
        maskedEventCount: 0
      });
    }
    const group = allGroups.get(key);
    group.positions.push(position);
    if (page.indices[local] === page.indices[local - 1]) {
      group.eventCount++;
      eventPositions.push(position);
      if (leadingZero[(position - 1) & 255]) group.maskedEventCount++;
    }
  }
  globalOffset += page.indices.length;
}
assert.equal(globalOffset, flat.length);
assert.equal(eventPositions.length, 86);

const eventGroups = [...allGroups.values()]
  .filter(group => group.eventCount > 0)
  .sort((a, b) => a.wordId - b.wordId || a.page - b.page);
assert.equal(eventGroups.length, 85);
assert.equal(eventGroups.filter(group => group.eventCount === 1).length, 84);
assert.deepEqual(
  eventGroups.filter(group => group.eventCount === 2)
    .map(group => [group.wordId, group.page]),
  [[1476, 27]]
);

const observedMasked = eventGroups.reduce(
  (sum, group) => sum + group.maskedEventCount, 0);
assert.equal(observedMasked, 33);

/*
 * Exact null:
 * In every fixed event-bearing word/page group, keep the original event
 * count k. Relocate the k events uniformly without replacement among that
 * group's eligible predecessor positions. If n positions contain m phase-0
 * p50 leading-zero cells, the number X of masked events is Hypergeom(n,m,k).
 * Convolve all 85 independent finite distributions exactly.
 */
let distribution = [1];
let expectationFormula = 0;
for (const group of eventGroups) {
  const n = group.positions.length;
  const m = group.positions.filter(position =>
    leadingZero[(position - 1) & 255]).length;
  const k = group.eventCount;
  expectationFormula += k * m / n;

  const local = new Array(k + 1).fill(0);
  const denominator = choose(n, k);
  for (let x = 0; x <= k; x++) {
    local[x] = choose(m, x) * choose(n - m, k - x) / denominator;
  }

  const next = new Array(distribution.length + k).fill(0);
  for (let total = 0; total < distribution.length; total++) {
    for (let x = 0; x < local.length; x++) {
      next[total + x] += distribution[total] * local[x];
    }
  }
  distribution = next;
}

const probabilityMass = distribution.reduce((sum, p) => sum + p, 0);
const exactMean = distribution.reduce((sum, p, x) => sum + x * p, 0);
const exactVariance = distribution.reduce(
  (sum, p, x) => sum + (x - exactMean) ** 2 * p, 0);
const exactUpperTail = distribution.slice(observedMasked)
  .reduce((sum, p) => sum + p, 0);

assert(Math.abs(probabilityMass - 1) < 2e-15);
assert(Math.abs(exactMean - expectationFormula) < 2e-14);
assert(Math.abs(exactMean - 20.632936507936492) < 1e-12);
assert(Math.abs(Math.sqrt(exactVariance) - 3.568604882225929) < 1e-12);
assert(Math.abs(exactUpperTail - 0.0006242511989862109) < 1e-15);

/*
 * Descriptive common conditional odds ratio for a leading-zero cell.
 * For odds theta, each group's noncentral-hypergeometric mass is
 * C(m,x) C(n-m,k-x) theta^x. Solve for total expected masked count 33.
 */
function conditionalMoments(theta) {
  let expected = 0;
  let logLikelihood = 0;
  for (const group of eventGroups) {
    const n = group.positions.length;
    const m = group.positions.filter(position =>
      leadingZero[(position - 1) & 255]).length;
    const k = group.eventCount;
    const observed = group.maskedEventCount;
    let z = 0;
    let first = 0;
    for (let x = 0; x <= k; x++) {
      const weight = choose(m, x) * choose(n - m, k - x) * theta ** x;
      z += weight;
      first += x * weight;
    }
    expected += first / z;
    const observedWeight =
      choose(m, observed) * choose(n - m, k - observed) *
      theta ** observed;
    logLikelihood += Math.log(observedWeight / z);
  }
  return {expected, logLikelihood};
}

let low = 1e-6;
let high = 1e6;
for (let i = 0; i < 100; i++) {
  const middle = Math.sqrt(low * high);
  if (conditionalMoments(middle).expected < observedMasked) low = middle;
  else high = middle;
}
const conditionalOddsRatio = Math.sqrt(low * high);
const fitted = conditionalMoments(conditionalOddsRatio);
const nullModel = conditionalMoments(1);
assert(Math.abs(conditionalOddsRatio - 2.4256189442937726) < 1e-12);
assert(Math.abs(fitted.expected - observedMasked) < 1e-12);


/*
 * Stronger role-composition control without saturating every boundary event.
 * Keep the exact 85 event-bearing word/page groups and each group's k, and
 * additionally condition only on the source-wide observed role totals:
 * 23 word-initial, 19 word-final, 44 interior. Which fixed word contributes
 * each role remains free. Track (initial, final, masked) exactly.
 */
const wordStarts = new Int32Array(wordGlyphs.length);
let startCursor = 0;
for (let wordId = 0; wordId < wordGlyphs.length; wordId++) {
  wordStarts[wordId] = startCursor;
  startCursor += wordGlyphs[wordId].length;
}
/** @param {number} position @returns {0|1|2} */
function wordRole(position) {
  const wordId = wordIdAt[position];
  const offset = position - wordStarts[wordId];
  if (offset === 0) return 0;
  if (offset === wordGlyphs[wordId].length - 1) return 1;
  return 2;
}
const observedRoles = [0, 0, 0];
for (const position of eventPositions) observedRoles[wordRole(position)]++;
assert.deepEqual(observedRoles, [23, 19, 44]);

/** @param {number} n @param {number} k @returns {number[][]} */
function combinations(n, k) {
  if (k === 0) return [[]];
  if (k === 1) return Array.from({length:n}, (_, i) => [i]);
  assert.equal(k, 2);
  const out = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) out.push([i, j]);
  }
  return out;
}

let roleDp = new Map([["0,0,0", 1]]);
for (const group of eventGroups) {
  const choices = combinations(group.positions.length, group.eventCount);
  const local = new Map();
  for (const choice of choices) {
    let initial = 0;
    let final = 0;
    let masked = 0;
    for (const index of choice) {
      const position = group.positions[index];
      const role = wordRole(position);
      if (role === 0) initial++;
      else if (role === 1) final++;
      if (leadingZero[(position - 1) & 255]) masked++;
    }
    const key = initial + "," + final + "," + masked;
    local.set(key, (local.get(key) || 0) + 1 / choices.length);
  }

  const next = new Map();
  for (const [leftKey, leftProbability] of roleDp) {
    const [leftInitial, leftFinal, leftMasked] =
      leftKey.split(",").map(Number);
    for (const [rightKey, rightProbability] of local) {
      const [rightInitial, rightFinal, rightMasked] =
        rightKey.split(",").map(Number);
      const initial = leftInitial + rightInitial;
      const final = leftFinal + rightFinal;
      if (initial > observedRoles[0] || final > observedRoles[1]) continue;
      const masked = leftMasked + rightMasked;
      const key = initial + "," + final + "," + masked;
      next.set(key, (next.get(key) || 0) +
        leftProbability * rightProbability);
    }
  }
  roleDp = next;
}

let roleConditioningMass = 0;
let roleUpperMass = 0;
let roleMaskedMeanNumerator = 0;
let roleMaskedSecondNumerator = 0;
for (const [key, probability] of roleDp) {
  const [initial, final, masked] = key.split(",").map(Number);
  if (initial !== observedRoles[0] || final !== observedRoles[1]) continue;
  roleConditioningMass += probability;
  roleMaskedMeanNumerator += masked * probability;
  roleMaskedSecondNumerator += masked * masked * probability;
  if (masked >= observedMasked) roleUpperMass += probability;
}
const roleConditionalMean = roleMaskedMeanNumerator / roleConditioningMass;
const roleConditionalVariance =
  roleMaskedSecondNumerator / roleConditioningMass -
  roleConditionalMean * roleConditionalMean;
const roleConditionalUpperTail = roleUpperMass / roleConditioningMass;
assert(Math.abs(roleConditionalMean - 20.884180192118528) < 1e-12);
assert(Math.abs(Math.sqrt(roleConditionalVariance) -
  3.568536392843084) < 1e-12);
assert(Math.abs(roleConditionalUpperTail -
  0.0007855471783517414) < 1e-15);

console.log(JSON.stringify({
  status: "PASS",
  sourceRunes: flat.length,
  canonicalPrintedWords: wordGlyphs.length,
  samePageAdjacentEqualityEvents: eventPositions.length,
  eventBearingWordPageGroups: eventGroups.length,
  eventGroupCountHistogram: {oneEvent: 84, twoEvents: 1},
  p50LiteralLeadingZeroCells: leadingZero.filter(Boolean).length,
  p50Clock: "(global event position - 1) mod 256",
  observedMaskedEvents: observedMasked,
  exactWordIdentityConditionalNull: {
    expectedMaskedEvents: exactMean,
    standardDeviation: Math.sqrt(exactVariance),
    exactUpperTailAtLeastObserved: exactUpperTail
  },
  descriptiveCommonConditionalOddsRatio: conditionalOddsRatio,
  globalWordRoleConditionalNull: {
    observedRoleTotals: {
      initial: observedRoles[0],
      final: observedRoles[1],
      interior: observedRoles[2]
    },
    expectedMaskedEvents: roleConditionalMean,
    standardDeviation: Math.sqrt(roleConditionalVariance),
    exactUpperTailAtLeastObserved: roleConditionalUpperTail
  },
  conditionalLikelihoodRatio:
    2 * (fitted.logLikelihood - nullModel.logLikelihood),
  interpretation:
    "p50 leading-zero enrichment survives exact event-bearing-word identity conditioning",
  unknownPlaintextOrKeyRecovered: false
}, null, 2));
