"use strict";

/**
 * Original LP2 source-factor degree-nine key recovery from nine marked
 * adjacent-equal runes. Conditional hypothesis only:
 *   C[i] = P[i] + K[i] (mod 29);
 *   each original adjacent-equal rune is a literal plaintext F (GP index 0);
 *   K obeys the source-derived monic p50 degree-nine GF(29) factor.
 *
 * The ninth source event fixes the final free state component. Evaluate every
 * following original doublet as an independently withheld plaintext-F check.
 * No parameter, phase or score is optimized from the withheld events.
 *
 * The original factor is recorded in Agent41's source-field gate:
 * x^9+12x^8+20x^7+10x^6+5x^5+x^4+9x^3+15x+11.
 *
 * Windows Node 22: node sims/lp2_p50_degree9_doublet_F_keyrecovery_sft.cjs
 * Read-only, no third-party dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname,
  "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const cipher = pages.flatMap(p => p.indices);
assert.equal(cipher.length, 12956);
const GF = 29;
const polynomial = [11, 15, 0, 9, 1, 5, 10, 20, 12, 1];
const degree = polynomial.length - 1;
const mod = x => ((x % GF) + GF) % GF;

/** @param {number} x @returns {number} */
function inverse(x) {
  for (let i = 1; i < GF; i++) if (mod(i * x) === 1) return i;
  throw new Error("non-invertible GF29 pivot");
}

/** @returns {{page:number,local:number,at:number,value:number}[]} */
function repeatedSites() {
  const events = [];
  let at = 0;
  for (const p of pages) {
    for (let local = 1; local < p.indices.length; local++) {
      if (p.indices[local] === p.indices[local - 1])
        events.push({page: p.page, local, at: at + local,
          value: p.indices[local]});
    }
    at += p.indices.length;
  }
  assert.equal(at, cipher.length);
  return events;
}

/**
 * Rows express K[t] as a linear combination of nine unknown initial GP
 * symbols. The characteristic polynomial is monic.
 * @param {number} length
 * @returns {number[][]}
 */
function basis(length) {
  const result = Array.from({length: degree},
    (_, i) => Array.from({length: degree}, (_, j) => +(i === j)));
  for (let t = degree; t < length; t++) {
    const row = Array.from({length: degree}, (_, k) => mod(
      -polynomial.slice(0, degree).reduce((sum, a, j) =>
        sum + a * result[t - degree + j][k], 0)));
    result.push(row);
  }
  return result;
}

/**
 * Exact GF29 RREF for indexed key-value observations.
 * @param {number[][]} rows
 * @returns {{rank:number,consistent:boolean,seed:number[]}}
 */
function recover(rows) {
  const a = rows.map(r => r.slice()), pivots = [];
  let k = 0;
  for (let col = 0; col < degree && k < a.length; col++) {
    let r = k;
    while (r < a.length && a[r][col] === 0) r++;
    if (r === a.length) continue;
    [a[k], a[r]] = [a[r], a[k]];
    const scale = inverse(a[k][col]);
    for (let j = col; j <= degree; j++) a[k][j] = mod(a[k][j] * scale);
    for (let other = 0; other < a.length; other++) {
      if (other === k) continue;
      const factor = a[other][col];
      for (let j = col; j <= degree; j++)
        a[other][j] = mod(a[other][j] - factor * a[k][j]);
    }
    pivots.push(col);
    k++;
  }
  const seed = Array(degree).fill(0);
  for (let i = 0; i < pivots.length; i++) seed[pivots[i]] = a[i][degree];
  return {rank: pivots.length,
    consistent: a.every(row => row.slice(0, degree).some(Boolean) || row[degree] === 0),
    seed};
}

/** @param {number[]} seed @param {number} length @returns {number[]} */
function stream(seed, length) {
  const result = seed.slice();
  for (let t = degree; t < length; t++)
    result.push(mod(-polynomial.slice(0, degree).reduce((sum, a, j) =>
      sum + a * result[t - degree + j], 0)));
  return result;
}

/** @param {number[]} text @returns {number} */
function ioc(text) {
  const freq = Array(GF).fill(0);
  for (const x of text) freq[x]++;
  return freq.reduce((sum, count) => sum + count * (count - 1), 0)
    / (text.length * (text.length - 1));
}

const events = repeatedSites();
assert.equal(events.length, 86);
assert.deepEqual(events.slice(0, 10).map(e => e.at),
  [122, 207, 456, 653, 782, 909, 932, 979, 1038, 1591]);
const rows = basis(cipher.length);
const constraints = events.map(e => [...rows[e.at], e.value]);
const fit = recover(constraints.slice(0, degree));
assert.equal(fit.rank, degree);
assert(fit.consistent);
assert.deepEqual(fit.seed, [22, 23, 4, 12, 14, 21, 18, 24, 0]);
const key = stream(fit.seed, cipher.length);
const decode = cipher.map((value, i) => mod(value - key[i]));
assert(decode.every((value, i) => mod(value + key[i]) === cipher[i]));
assert.equal(decode.filter(x => x === 0).length, 446);
const heldout = events.slice(degree).map(e =>
  ({page: e.page, at: e.at, observed: e.value, predicted: key[e.at],
    plaintextF: decode[e.at] === 0}));
const heldoutMatches = heldout.filter(e => e.plaintextF).length;
assert.equal(heldout.length, 77);
assert.equal(heldoutMatches, 5);
assert.equal(heldout[0].at, 1591);
assert.equal(heldout[0].plaintextF, true);
assert.equal(heldout[1].at, 1981);
assert.equal(heldout[1].plaintextF, false);
assert.equal(heldout[1].predicted, 0);
assert.equal(heldout[1].observed, 9);
assert.equal(recover(constraints).consistent, false);
assert(Math.abs(ioc(decode) - 0.03450004879502503) < 1e-12);

// Independently seeded positive plant on the actual source site locations.
// A genuine degree-nine pad generated from this state must be reconstructible.
const plantSeed = [1, 5, 11, 24, 18, 2, 8, 13, 21];
const plant = stream(plantSeed, cipher.length);
const recovered = recover(events.slice(0, degree)
  .map(e => [...rows[e.at], plant[e.at]]));
assert.equal(recovered.rank, degree);
assert(recovered.consistent);
assert.deepEqual(recovered.seed, plantSeed);
for (const e of events) assert.equal(
  rows[e.at].reduce((sum, x, j) => sum + x * recovered.seed[j], 0) % GF,
  plant[e.at]);

// Independently source-visible alternative: reset the same characteristic
// polynomial at the nine original illustrated chapter boundaries. Do not
// infer a replacement clock or phase from any of the rejected observations.
const chapterRanges = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]];
const chapterResults = chapterRanges.map(([from, to]) => {
  const chapter = pages.filter(p => p.page >= from && p.page <= to)
    .flatMap(p => p.indices);
  const mark = [];
  for (let i = 1; i < chapter.length; i++) {
    if (chapter[i] === chapter[i - 1])
      mark.push({at: i, value: chapter[i]});
  }
  const chapterBasis = basis(chapter.length);
  const equations = mark.map(e => [...chapterBasis[e.at], e.value]);
  const inferred = recover(equations.slice(0, degree));
  const withheld = mark.slice(degree).map(e => ({
    at: e.at, observed: e.value,
    predicted: mod(chapterBasis[e.at].reduce(
      (sum, factor, j) => sum + factor * inferred.seed[j], 0))
  }));
  if (mark.length >= degree) assert.equal(inferred.rank, degree);
  if (mark.length > degree) {
    assert.equal(recover(equations).consistent, false);
    assert(withheld.some(e => e.predicted !== e.observed));
  }
  return {pages: [from, to], runes: chapter.length, repeatSites: mark.length,
    fitRank: inferred.rank, withheldSites: withheld.length,
    withheldMatches: withheld.filter(e => e.predicted === e.observed).length,
    firstFailure: withheld.find(e => e.predicted !== e.observed) || null};
});
assert.equal(chapterResults.reduce((sum, chapter) => sum + chapter.runes, 0),
  cipher.length);
assert.deepEqual(chapterResults.map(c => c.repeatSites),
  [4, 6, 9, 10, 11, 13, 12, 18, 3]);
assert.equal(chapterResults.reduce((sum, c) => sum + c.withheldSites, 0), 19);
assert.equal(chapterResults.reduce((sum, c) => sum + c.withheldMatches, 0), 0);

// A stronger key-independent exclusion: allow the degree-nine scalar LFSR
// output to pass through ANY one fixed secret bijection of all 29 symbols.
// The same printed marker value at two repeat sites must then have the same
// hidden scalar; each repeated marker value contributes homogeneous equations
// on the nine free initial-state entries, independent of the bijection.
/**
 * @param {{at:number,value:number}[]} sites
 * @param {number[][]} scalarRows
 * @returns {{markerTypes:number,equalityEquations:number,homogeneousRank:number}}
 */
function allSecretOutputBijectionGate(sites, scalarRows) {
  const groups = new Map();
  for (const e of sites) {
    let group = groups.get(e.value);
    if (!group) { group=[]; groups.set(e.value, group); }
    group.push(e.at);
  }
  const equations = [];
  for (const offsets of groups.values()) {
    for (let j = 1; j < offsets.length; j++) {
      equations.push(scalarRows[offsets[j]].map((value, k) =>
        mod(value - scalarRows[offsets[0]][k])));
    }
  }
  const matrix = equations.map(x => x.slice());
  let rank = 0;
  for (let col = 0; col < degree && rank < matrix.length; col++) {
    let next = rank;
    while (next < matrix.length && matrix[next][col] === 0) next++;
    if (next === matrix.length) continue;
    [matrix[rank], matrix[next]] = [matrix[next], matrix[rank]];
    const scale = inverse(matrix[rank][col]);
    for (let j = col; j < degree; j++)
      matrix[rank][j] = mod(matrix[rank][j] * scale);
    for (let j = rank + 1; j < matrix.length; j++) {
      const factor = matrix[j][col];
      for (let k = col; k < degree; k++)
        matrix[j][k] = mod(matrix[j][k] - factor * matrix[rank][k]);
    }
    rank++;
  }
  return {markerTypes: groups.size,
    equalityEquations: equations.length, homogeneousRank: rank};
}
const secretOutputGlobal=allSecretOutputBijectionGate(events, rows);
assert.deepEqual(secretOutputGlobal,
  {markerTypes: 28, equalityEquations: 58, homogeneousRank: 9});
// There are 28 distinct observed output letters but only 29 possible
// source scalar values. For ANY stationary function from GF29 to GP29,
// at most one observed output letter may have two source preimages;
// all other 27 groups necessarily each have one source preimage. Grant
// one arbitrary "collision group" entirely unconstrained, choose it
// adversarially from all 28 values, and enforce equality for all others.
// The linear rank remains NINE even after every possible group removal.
// Hence only the all-zero hidden state survives, which cannot produce
// 28 distinct printed output glyphs under any stationary function.
const distinctMarkerValues = [...new Set(events.map(e => e.value))];
const rankExcludingAnyOneOutputClass = distinctMarkerValues.map(value =>
  allSecretOutputBijectionGate(
    events.filter(e => e.value !== value), rows).homogeneousRank);
assert.equal(rankExcludingAnyOneOutputClass.length, 28);
assert(rankExcludingAnyOneOutputClass.every(x => x === degree));

// Rank nine forces every initial state entry to zero. A fixed output
// bijection of that constant LFSR state can print only ONE marker value;
// the original source contains 28 distinct values. This rejects *all*
// bijective secret output alphabets on the same global scalar recurrence.
const secretOutputChapters=chapterRanges.map(([from, to]) => {
  const symbols=pages.filter(p => p.page >= from && p.page <= to)
    .flatMap(p => p.indices);
  const sites=[];
  for (let i=1; i<symbols.length; i++)
    if (symbols[i]===symbols[i-1])
      sites.push({at:i,value:symbols[i]});
  return {pages:[from,to],
    ...allSecretOutputBijectionGate(sites,basis(symbols.length))};
});
assert.deepEqual(secretOutputChapters.map(x=>x.homogeneousRank),
  [0,1,0,0,1,2,1,7,0]);

console.log(JSON.stringify({
  source: "Original 12956 LP2 GP29 runes and p50 degree9 factor",
  model: "one continuous degree9 GF29 pad; every adjacent repeat means plaintext F",
  independentTrainingPositions: events.slice(0, degree).map(e => e.at),
  recoveredOriginalState: fit.seed,
  withheldSites: heldout.length,
  withheldPlaintextFMatches: heldoutMatches,
  earliestWithheldFailure: heldout.find(e => !e.plaintextF),
  allSiteSystemConsistent: false,
  candidateWholeBookPlaintextIoC: ioc(decode),
  reencryptsExactly: true,
  plantedKnownStateRecovered: true,
  nineIllustratedChapterResets: chapterResults,
  arbitrarySecretBijectionGlobal: secretOutputGlobal,
  everyStationaryOutputFunctionGlobal: {
    originalOutputClasses: distinctMarkerValues.length,
    sourceInputClasses: 29,
    hypotheticalMergedOutputClassesGranted: 1,
    minimumRankAfterRemovingOneOutputClass: Math.min(...rankExcludingAnyOneOutputClass),
    sourceStationaryMapPossible: false
  },
  arbitrarySecretBijectionPerChapter: secretOutputChapters,
  unknownPlaintextRecovered: false,
  decision: "Fixed original source polynomial and global repeat=F additive mode rejected by independent heldout repeat site"
}, null, 2));
