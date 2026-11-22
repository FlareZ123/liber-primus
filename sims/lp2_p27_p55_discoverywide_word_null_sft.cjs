'use strict';

/**
 * Source-exact p27/p55 discovery-wide null, standalone CommonJS SFT.
 * Reads original repo resources only; changes no files and fits no keys.
 * Model R shuffles runes within each physical page, fixing page-specific
 * counts, word boundary positions and chapter membership.
 * Model W shuffles whole original printed word fragments among equal-length
 * positions within each page, additionally fixing the page word inventory.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(root, 'resources/lp2-transcription.txt'), 'utf8');
const parts = transcription.split('%');
const rune = new Map(corpus.runes.map((glyph, i) => [glyph, i]));
const printed = corpus.pages.filter((page) => page.runic_count > 0);
assert.equal(parts.length, printed.length);

const pages = [];
for (let pi = 0; pi < printed.length; pi++) {
  const original = printed[pi];
  const symbols = [];
  const words = [];
  let start = 0;
  for (const glyph of parts[pi]) {
    if (rune.has(glyph)) symbols.push(rune.get(glyph));
    else if ('-.$&§'.includes(glyph) && start < symbols.length) {
      words.push({ at: start, len: symbols.length - start, token: symbols.slice(start).map((x) => corpus.runes[x]).join('') });
      start = symbols.length;
    }
  }
  if (start < symbols.length) words.push({ at: start, len: symbols.length - start, token: symbols.slice(start).map((x) => corpus.runes[x]).join('') });
  assert.deepEqual(symbols, original.indices);
  if (original.page > 55) continue;
  const hist = Array(29).fill(0);
  for (const s of symbols) hist[s]++;
  const byLength = new Map();
  for (const w of words) {
    if (!byLength.has(w.len)) byLength.set(w.len, []);
    byLength.get(w.len).push(w);
  }
  const sites = [];
  for (let j = 0; j + 1 < words.length; j++) {
    const left = words[j], right = words[j + 1], m = left.len + right.len;
    if (left.at + left.len === right.at && m >= 6 && m <= 14) {
      sites.push({ m, at: left.at, leftLen: left.len, token: left.token + right.token });
    }
  }
  pages.push({ page: original.page, n: symbols.length, symbols, hist, words, byLength, sites });
}
assert.equal(pages.length, 55);
assert.equal(pages.reduce((n, p) => n + p.n, 0), 12956);
assert.equal(pages.reduce((n, p) => n + p.words.length, 0), 2928);

function falling(n, k) { let v = 1; for (let i = 0; i < k; i++) v *= n - i; return v; }
function factorial(n) { let v = 1; for (let i = 2; i <= n; i++) v *= i; return v; }

/**
 * Exact probability that two length-m source-order fragments match when
 * independently uniformly permuting original page rune multisets:
 * m! / [(nA)_m(nB)_m] times coefficient z^m of
 * product_g sum_k [(a_g)_k(b_g)_k/k!] z^k.
 * @param {object} a
 * @param {object} b
 * @param {number} m
 */
function runeMatchP(a, b, m) {
  let poly = Array(m + 1).fill(0);
  poly[0] = 1;
  for (let g = 0; g < 29; g++) {
    const coeff = [1];
    let num = 1, denom = 1;
    for (let k = 1; k <= Math.min(m, a.hist[g], b.hist[g]); k++) {
      num *= (a.hist[g] - k + 1) * (b.hist[g] - k + 1);
      denom *= k;
      coeff.push(num / denom);
    }
    const next = Array(m + 1).fill(0);
    for (let i = 0; i <= m; i++) {
      for (let k = 0; k < coeff.length && k + i <= m; k++) next[i + k] += poly[i] * coeff[k];
    }
    poly = next;
  }
  return factorial(m) * poly[m] / falling(a.n, m) / falling(b.n, m);
}
const allA = { n: 6, hist: [6, ...Array(28).fill(0)] };
const allB = { n: 7, hist: [7, ...Array(28).fill(0)] };
assert.equal(runeMatchP(allA, allB, 6), 1);
allB.hist[0] = 0;
allB.hist[1] = 7;
assert.equal(runeMatchP(allA, allB, 6), 0);

const geometry = [];
const matched = [];
const sitePairs = [];
let Eword = 0, Eterminal = 0, Eallcuts = 0, EsourceAny = 0;
for (let m = 6; m <= 14; m++) {
  for (const a of pages) for (const b of pages) {
    if (a.page === b.page || (a.n - m) % b.n !== 0) continue;
    const k = (a.n - m) / b.n;
    if (k < 2) continue;
    geometry.push({ m, a: a.page, b: b.page, k });
    const aSites = a.sites.filter((s) => s.m === m);
    const bSites = b.sites.filter((s) => s.m === m);
    const p = runeMatchP(a, b, m);
    Eword += aSites.length * bSites.length * p;
    Eterminal += aSites.length * bSites.filter((s) => s.at + m === b.n).length * p;
    Eallcuts += (a.n - m + 1) * (b.n - m + 1) * p;
    EsourceAny += aSites.length * (b.n - m + 1) * p;
    for (const left of aSites) for (const right of bSites) {
      const match = { m, a: a.page, b: b.page, atA: left.at, atB: right.at };
      sitePairs.push({ ...match, aPage: a, bPage: b, left, right });
      if (left.token === right.token) matched.push(match);
    }
  }
}
assert.equal(geometry.length, 44);
assert.equal(sitePairs.length, 565);
assert.deepEqual(matched, [{ m: 6, a: 27, b: 55, atA: 28, atB: 70 }]);

// Every possible whole-word assignment under Model W is enumerated as
// a pair of token choices from each page's fixed length-specific multiset.
const potentialCache = new Map();
function potential(page, l, r) {
  const key = page.page + ':' + l + ':' + r;
  if (potentialCache.has(key)) return potentialCache.get(key);
  const v = new Set();
  for (const x of (page.byLength.get(l) || [])) {
    for (const y of (page.byLength.get(r) || [])) if (x.at !== y.at) v.add(x.token + y.token);
  }
  potentialCache.set(key, v);
  return v;
}
const feasible = [];
for (const item of sitePairs) {
  const { aPage, bPage, left, right, m } = item;
  const source = potential(aPage, left.leftLen, m - left.leftLen);
  const target = potential(bPage, right.leftLen, m - right.leftLen);
  if ([...source].some((s) => target.has(s))) feasible.push([m, aPage.page, bPage.page, left.at, right.at]);
}
assert.deepEqual(feasible, [[6, 27, 55, 28, 70], [6, 27, 55, 95, 70], [6, 27, 55, 105, 70], [6, 27, 55, 144, 70]]);

const a27 = pages.find((p) => p.page === 27);
const b55 = pages.find((p) => p.page === 55);
const source3 = a27.byLength.get(3);
const target3 = b55.byLength.get(3);
assert.equal(source3.length, 14);
assert.deepEqual(target3.map((w) => w.at), [70, 73]);
const slots = [28, 95, 105, 144].map((at) => [
  source3.findIndex((w) => w.at === at),
  source3.findIndex((w) => w.at === at + 3)
]);
assert.ok(slots.every(([i, j]) => i >= 0 && j >= 0 && i !== j));
assert.equal(source3.filter((w) => w.token === target3[0].token).length, 1);
assert.equal(source3.filter((w) => w.token === target3[1].token).length, 1);

// Conditional on original word inventories, all possible discovery-wide
// matches involve exactly the two distinct three-rune tokens shared by
// p27/p55. Only four ordered adjacent pairs of the fourteen p27
// three-rune slots are favorable, for either p55 terminal order.
const exactWordP = 4 / (14 * 13);
assert.equal(exactWordP, 2 / 91);
const originalSource = source3.map((w) => w.token);
const originalTarget = target3.map((w) => w.token);
function matchOffsets(src, tgt) {
  const tail = tgt[0] + tgt[1];
  return slots.filter(([i, j]) => src[i] + src[j] === tail).map(([i]) => source3[i].at);
}
assert.deepEqual(matchOffsets(originalSource, originalTarget), [28]);

// Original-inventory positive plant: move DJU BEI to a different
// printed 3+3 site, with no new rune or word and no changed page length.
const plant = originalSource.slice();
function swapByStart(a, b) {
  const i = source3.findIndex((w) => w.at === a);
  const j = source3.findIndex((w) => w.at === b);
  assert.ok(i >= 0 && j >= 0);
  [plant[i], plant[j]] = [plant[j], plant[i]];
}
swapByStart(28, 95);
swapByStart(31, 98);
assert.deepEqual(matchOffsets(plant, originalTarget), [95]);
assert.deepEqual(plant.slice().sort(), originalSource.slice().sort());

// A negative source control moves only the target terminal words,
// keeping every original page's whole-word inventory intact.
assert.deepEqual(matchOffsets(originalSource, originalTarget.slice().reverse()), []);
assert.ok(!feasible.some((row) => (row[1] === 9 && row[2] === 22) || (row[1] === 24 && row[2] === 49)));

// Fixed-seed Monte Carlo independently checks the exact 2/91 combinatorial
// result; exhaustive feasibility shows all other page tokens are irrelevant.
let state = 0x33012755;
function nextRandom() { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return state >>> 0; }
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = nextRandom() % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
}
let hits = 0;
const trials = 100000;
for (let i = 0; i < trials; i++) {
  const src = originalSource.slice(), tgt = originalTarget.slice();
  shuffle(src);
  shuffle(tgt);
  if (matchOffsets(src, tgt).length) hits++;
}
const empirical = hits / trials;
assert.ok(Math.abs(empirical - exactWordP) < 0.002);

function near(x, y) { assert.ok(Math.abs(x - y) < 1e-12, x + ' versus ' + y); }
near(Eword, 2.1032069695550182e-7);
near(Eterminal, 2.0936511388519296e-8);
near(Eallcuts, 0.00017287530568108379);
near(EsourceAny, 0.0000049420519191150765);


// Broader sensitivity model: keep the same equal-length whole-word shuffle,
// but scan every rune cut (including cuts inside words) for all 44 page-length
// geometries. This is an MC estimate, whereas the word-site 2/91 is exact.
const pageByNumber = new Map(pages.map((p) => [p.page, p]));
const relevantNumbers = new Set(geometry.flatMap((g) => [g.a, g.b]));
const affectedPages = pages.filter((p) => relevantNumbers.has(p.page));
const lengthPositions = new Map();
for (const page of affectedPages) {
  const positions = new Map();
  for (let i = 0; i < page.words.length; i++) {
    const len = page.words[i].len;
    if (!positions.has(len)) positions.set(len, []);
    positions.get(len).push(i);
  }
  lengthPositions.set(page.page, positions);
}
function scrambledSource(page) {
  const tokens = page.words.map((w) => w.token);
  for (const positions of lengthPositions.get(page.page).values()) {
    const mixed = positions.map((i) => tokens[i]);
    shuffle(mixed);
    for (let i = 0; i < positions.length; i++) tokens[positions[i]] = mixed[i];
  }
  return tokens.join('');
}
let allCutHits = 0;
let terminalCutHits = 0;
const allCutTrials = 5000;
for (let trial = 0; trial < allCutTrials; trial++) {
  const scrambled = new Map(affectedPages.map((p) => [p.page, scrambledSource(p)]));
  let any = false, terminalFound = false;
  for (const g of geometry) {
    const source = scrambled.get(g.a), target = scrambled.get(g.b);
    const substrings = new Set();
    for (let i = 0; i <= source.length - g.m; i++) substrings.add(source.slice(i, i + g.m));
    for (let j = 0; j <= target.length - g.m; j++) {
      if (substrings.has(target.slice(j, j + g.m))) {
        any = true;
        if (j + g.m === target.length) terminalFound = true;
      }
    }
    if (any && terminalFound) break;
  }
  if (any) allCutHits++;
  if (terminalFound) terminalCutHits++;
}
assert.ok(allCutHits > 40 && allCutHits < 300);
assert.ok(terminalCutHits <= allCutHits);

console.log(JSON.stringify({
  original: '55 pages / 12956 runes; only p27 offset28 to p55 offset70: DJU BEI',
  geometryPairs: geometry.length,
  originalWordAlignedSitePairs: sitePairs.length,
  originalExactMatches: matched.length,
  runePermutationNull: {
    expectedWordAlignedMatchesAndUnionUpperBound: Eword,
    expectedTerminalAlignedMatchesAndUnionUpperBound: Eterminal,
    expectedAllSourceAndTargetCutsAndUnionUpperBound: Eallcuts,
    expectedOriginalSourceWordCutToAnyTargetCut: EsourceAny
  },
  conditionalWholeWordInventoryNull: {
    possibleSitePairs: feasible,
    exactFamilyProbability: exactWordP,
    expression: '4/(14*13) = 2/91',
    mcTrials: trials,
    mcHits: hits,
    mcProbability: empirical,
    positivePlantedStart: 95,
    negativeReversedTerminalMatchCount: 0,
    broaderAllCutMcTrials: allCutTrials,
    broaderAllCutMcHits: allCutHits,
    broaderTerminalCutMcHits: terminalCutHits,
    broaderAllCutMcRate: allCutHits / allCutTrials
  }
}, null, 2));
