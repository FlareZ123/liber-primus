"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-grid-256.json"), "utf8"));
const transcript = fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-transcription.txt"), "utf8");
const tokens = grid.pages.flatMap((page) => page.tokens);
const low60 = Uint8Array.from(tokens, (token) => Number(token[0] === "0"));
const runeSet = new Set(corpus.runes);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const printedPages = transcript.split("%");

/** @typedef {{pool:number[], count:number}} Stratum */
/** @typedef {{site:number,page:number,context:string,boundary:string,precedingRune:number,insideLow60:boolean}} Opportunity */

/** @type {Opportunity[]} */
const eligible = [];
/** @type {Opportunity[]} */
const events = [];
let globalOffset = 0;

for (let pageNumber = 0; pageNumber < 56; pageNumber++) {
  const page = corpus.pages.find((item) => item.page === pageNumber);
  assert.ok(page);
  const printed = pageNumber === 50 ? "" : printedPages[pageNumber < 50 ? pageNumber : pageNumber - 1];
  const discovered = [];
  let previousRune = null;
  let previousIndex = null;
  let separator = "";
  let local = -1;

  for (const symbol of printed) {
    if (!runeSet.has(symbol)) {
      separator += symbol;
      continue;
    }

    local++;
    discovered.push(symbol);
    const currentIndex = runeIndex.get(symbol);
    assert.notEqual(currentIndex, undefined);

    if (previousRune !== null) {
      const site = globalOffset + local - 1;
      let context = "inside";
      if (separator.includes(".")) context = "sentence";
      else if (separator.includes("&") || separator.includes("$")) context = "paragraph";
      else if (separator.includes("-")) context = "word";

      const opportunity = {
        site,
        page: pageNumber,
        context,
        boundary: separator.length === 0 ? "inside" : "cross",
        precedingRune: previousIndex,
        insideLow60: low60[site & 255] === 1,
      };
      eligible.push(opportunity);
      if (previousRune === symbol) events.push(opportunity);
    }

    previousRune = symbol;
    previousIndex = currentIndex;
    separator = "";
  }

  assert.deepEqual(discovered, page.indices.map((index) => corpus.runes[index]));
  globalOffset += page.indices.length;
}

assert.equal(globalOffset, 12956);
assert.equal(eligible.length, 12901);
assert.equal(events.length, 86);
const inClass = events.filter((event) => event.insideLow60);
const outside = events.filter((event) => !event.insideLow60);
assert.equal(inClass.length, 33);
assert.equal(outside.length, 53);
assert.equal(eligible.filter((event) => event.insideLow60).length, 3025);
assert.equal(eligible.filter((event) => !event.insideLow60).length, 9876);

/**
 * @param {readonly number[]} positions
 * @returns {number}
 */
function gapAutocorrelation(positions) {
  const gaps = positions.slice(1).map((position, index) => position - positions[index]);
  const n = gaps.length - 1;
  let leftMean = 0;
  let rightMean = 0;
  for (let i = 0; i < n; i++) {
    leftMean += gaps[i];
    rightMean += gaps[i + 1];
  }
  leftMean /= n;
  rightMean /= n;
  let covariance = 0;
  let leftSS = 0;
  let rightSS = 0;
  for (let i = 0; i < n; i++) {
    const left = gaps[i] - leftMean;
    const right = gaps[i + 1] - rightMean;
    covariance += left * right;
    leftSS += left * left;
    rightSS += right * right;
  }
  return covariance / Math.sqrt(leftSS * rightSS);
}

const eventSites = events.map((event) => event.site);
const outsideSites = outside.map((event) => event.site);
const inClassSites = inClass.map((event) => event.site);
const observed = {
  all86: gapAutocorrelation(eventSites),
  outside53: gapAutocorrelation(outsideSites),
  inClass33: gapAutocorrelation(inClassSites),
};
assert.ok(Math.abs(observed.all86 - 0.38001968924100965) < 1e-12);
assert.ok(Math.abs(observed.outside53 - 0.05085402960384603) < 1e-12);
assert.ok(Math.abs(observed.inClass33 + 0.01779422316719754) < 1e-12);

const outsideEligible = eligible.filter((item) => !item.insideLow60);
const outsideEventSet = new Set(outsideSites);

/**
 * @param {(item:Opportunity)=>string} keyOf
 * @returns {Stratum[]}
 */
function outsideStrata(keyOf) {
  /** @type {Map<string, Stratum>} */
  const groups = new Map();
  for (const item of outsideEligible) {
    const key = keyOf(item);
    if (!groups.has(key)) groups.set(key, {pool: [], count: 0});
    const group = groups.get(key);
    group.pool.push(item.site);
    if (outsideEventSet.has(item.site)) group.count++;
  }
  return [...groups.values()];
}

const strata = {
  global: [{pool: outsideEligible.map((item) => item.site), count: outside.length}],
  page: outsideStrata((item) => String(item.page)),
  pageContext: outsideStrata((item) => item.page + ":" + item.context),
  pageBoundaryPrecedingRune: outsideStrata((item) => item.page + ":" + item.boundary + ":" + item.precedingRune),
};

let state = 0x15173301;
/** @returns {number} */
function randomUnit() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return (state >>> 0) / 4294967296;
}

/**
 * @param {Stratum[]} groups
 * @param {number} draws
 * @returns {{draws:number,mean:number,sd:number,q025:number,q975:number,exceed:number,upperTail:number,z:number}}
 */
function simulate(groups, draws) {
  const values = new Float64Array(draws);
  let sum = 0;
  let sumSquares = 0;
  let exceed = 0;

  for (let draw = 0; draw < draws; draw++) {
    const positions = [];
    for (const group of groups) {
      if (group.count === 0) continue;
      const pool = group.pool.slice();
      for (let i = 0; i < group.count; i++) {
        const other = i + Math.floor(randomUnit() * (pool.length - i));
        [pool[i], pool[other]] = [pool[other], pool[i]];
        positions.push(pool[i]);
      }
    }
    positions.sort((a, b) => a - b);
    assert.equal(positions.length, 53);
    const value = gapAutocorrelation(positions);
    values[draw] = value;
    sum += value;
    sumSquares += value * value;
    if (value >= observed.outside53) exceed++;
  }

  const sorted = Array.from(values).sort((a, b) => a - b);
  const mean = sum / draws;
  const sd = Math.sqrt(sumSquares / draws - mean * mean);
  return {
    draws,
    mean,
    sd,
    q025: sorted[Math.floor(0.025 * (draws - 1))],
    q975: sorted[Math.floor(0.975 * (draws - 1))],
    exceed,
    upperTail: (exceed + 1) / (draws + 1),
    z: (observed.outside53 - mean) / sd,
  };
}

const draws = 100000;
const controls = {
  outsideClassOnly: simulate(strata.global, draws),
  exactPageCounts: simulate(strata.page, draws),
  exactPageAndBoundaryContextCounts: simulate(strata.pageContext, draws),
  exactPageInsideCrossAndPrecedingRuneCounts: simulate(strata.pageBoundaryPrecedingRune, draws),
};

assert.deepEqual(Object.values(controls).map((result) => result.exceed), [28315, 68751, 66522, 65195]);
assert.ok(controls.outsideClassOnly.upperTail > 0.25);
assert.ok(controls.exactPageCounts.upperTail > 0.60);
assert.ok(controls.exactPageAndBoundaryContextCounts.upperTail > 0.60);
assert.ok(controls.exactPageInsideCrossAndPrecedingRuneCounts.upperTail > 0.60);

const activeFine = strata.pageBoundaryPrecedingRune.filter((group) => group.count > 0);
const fineMobility = {
  activeStrata: activeFine.length,
  fixedEvents: activeFine.filter((group) => group.pool.length === group.count).reduce((sum, group) => sum + group.count, 0),
  candidateSlots: activeFine.reduce((sum, group) => sum + group.pool.length, 0),
};
assert.deepEqual(fineMobility, {activeStrata: 53, fixedEvents: 3, candidateSlots: 285});

const positivePlant = [0];
for (let i = 0; i < 52; i++) positivePlant.push(positivePlant.at(-1) + (i < 26 ? 30 : 200));
assert.ok(gapAutocorrelation(positivePlant) > 0.9);

console.log(JSON.stringify({
  source: {
    runes: 12956,
    eligibleWithinPagePairs: 12901,
    allAdjacentEqualEvents: 86,
    low60Opportunities: 3025,
    low60Events: 33,
    outsideOpportunities: 9876,
    outsideEvents: 53,
  },
  statistic: "Pearson lag-1 autocorrelation of consecutive event gaps",
  observed,
  controls,
  fineMobility,
  positivePlant: gapAutocorrelation(positivePlant),
  decision: "Residual 53-event ordered-gap structure collapses under the frozen p50 split; do not require a second surface process from T7.",
}, null, 2));
