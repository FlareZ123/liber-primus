"use strict";

/**
 * Four specific original LP2 Fibonacci pages 13/21/34/55 have 882 runes:
 * 2 * (21*21), the module count of two version-1 QR symbols.
 * Test whether either source-direct 21x21 array contains mandatory QR
 * 7x7 corner finders under ANY secret stationary GP29->binary assignment.
 * Input original, positive finder plant, no key brute force.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const file = fs.readFileSync(path.join(__dirname, "..", "resources",
  "liber-primus", "lp2-corpus.json"), "utf8");
const corpus = JSON.parse(file);
const pageIds = [13, 21, 34, 55];
const sourcePages = pageIds.map(n => {
  const p = corpus.pages.find(x => x.page === n);
  assert(p && p.status === "unsolved");
  return p.indices;
});
assert.deepEqual(sourcePages.map(p => p.length), [272, 273, 261, 76]);
const tape = sourcePages.flat();
assert.equal(tape.length, 882);
assert.equal(tape.length, 2 * 21 * 21);

function finderSites(omittedCorner) {
  const corners = [[0, 0], [0, 14], [14, 0], [14, 14]];
  const sites = [];
  for (let i = 0; i < corners.length; i++) {
    if (i === omittedCorner) continue;
    const [r0, c0] = corners[i];
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const ring = Math.min(r, c, 6-r, 6-c);
        const black = +(ring === 0 || ring >= 2);
        sites.push([21*(r+r0)+c+c0, black]);
      }
    }
  }
  assert.equal(sites.length, 147);
  return sites;
}

/** Exact min Hamming distance across ALL 2^29 stationary binary maps. */
function allSecretFinderBound(panel, omit) {
  assert.equal(panel.length, 441);
  const counts = Array.from({length: 29}, () => [0, 0]);
  for (const [pos, color] of finderSites(omit)) {
    assert(Number.isInteger(panel[pos]) && panel[pos] >= 0 && panel[pos] < 29);
    counts[panel[pos]][color]++;
  }
  return {
    forcedWrong: counts.reduce((n, x) => n + Math.min(x[0], x[1]), 0),
    conflictingRunes: counts.filter(x => x[0] && x[1]).length
  };
}


/**
 * A second natural two-runes-per-module interpretation:
 * pixel = independentSecretLeftBit(glyphEven) XOR
 *         independentSecretRightBit(glyphOdd).
 * Every finder equation is an edge between the two 29-vertex codebooks.
 * A failed parity-union on an already connected pair is a constructive
 * inconsistent XOR cycle, independent of all 2^58 possible secret maps.
 */
function xorTwoRuneCodebookContradictions(tape, omit) {
  assert.equal(tape.length, 882);
  const parent = Array.from({length: 58}, (_, i) => i);
  const parity = Array(58).fill(0);
  const rank = Array(58).fill(0);
  function find(id) {
    if (parent[id] === id) return [id, 0];
    const [root, upstream] = find(parent[id]);
    const newParity = parity[id] ^ upstream;
    parent[id] = root;
    parity[id] = newParity;
    return [root, newParity];
  }
  let contradictoryClosures = 0;
  for (const [pos, requiredBit] of finderSites(omit)) {
    const left = tape[pos * 2];
    const right = 29 + tape[pos * 2 + 1];
    let [a, pA] = find(left);
    let [b, pB] = find(right);
    if (a === b) {
      if ((pA ^ pB) !== requiredBit) contradictoryClosures++;
      continue;
    }
    if (rank[a] < rank[b]) {
      [a, b] = [b, a];
      [pA, pB] = [pB, pA];
    }
    parent[b] = a;
    parity[b] = pA ^ pB ^ requiredBit;
    if (rank[a] === rank[b]) rank[a]++;
  }
  return contradictoryClosures;
}


/**
 * Exact global lower bound allowing a completely arbitrary binary lookup
 * for EVERY distinct ordered rune pair (29*29 = 841 independent bit entries).
 * This includes all stationary binary codebooks of paired GP runes, even
 * nonseparable, nonlinear codebooks. No enumeration of 2^841 keys needed.
 */
function allSecretPairCodebookBound(tape, omit) {
  assert.equal(tape.length, 882);
  const counts = Array.from({length: 841}, () => [0, 0]);
  for (const [site, requiredBit] of finderSites(omit)) {
    const pair = 29 * tape[2 * site] + tape[2 * site + 1];
    counts[pair][requiredBit]++;
  }
  return {
    forcedWrong:counts.reduce((n, [white, black]) =>
      n + Math.min(white, black), 0),
    conflictingPairs:counts.filter(([white, black]) =>
      white > 0 && black > 0).length
  };
}

const partitions = [
  ["contiguous", [tape.slice(0, 441), tape.slice(441)]],
  ["paired-lanes", [
    tape.filter((_, i) => i % 2 === 0),
    tape.filter((_, i) => i % 2 === 1)
  ]]
];

function run() {
  const result = partitions.map(([partition, panels]) => ({
    partition,
    panels:panels.map(panel => [0, 1, 2, 3].map(omit =>
      allSecretFinderBound(panel, omit)))
  }));
  assert.deepEqual(result.map(r => r.panels.map(row =>
    row.map(x => x.forcedWrong))), [
    [[42, 42, 40, 43], [42, 42, 42, 45]],
    [[45, 43, 46, 45], [40, 45, 42, 43]]
  ]);

  // Valid source-sized planted black/white finder using only two GP labels.
  const plant = Array(441).fill(0);
  for (const [site, bit] of finderSites(3)) plant[site] = bit;
  assert.equal(allSecretFinderBound(plant, 3).forcedWrong, 0);

  // Strengthen by requiring one common codebook for both panels, freely
  // sharing the same missing corner. The individual strict positives above
  // already rule out any such shared mapping.
  const pairEqualityPixels = Array.from({length:441}, (_, i) =>
    +(tape[2 * i] === tape[2 * i + 1]));
  const pairedMatches = pairEqualityPixels.reduce((n, bit) => n + bit, 0);
  assert.equal(pairedMatches, 3);
  const equalityFinderErrors = [0, 1, 2, 3].map(omit => {
    const sites = finderSites(omit);
    return [
      sites.filter(([pos, expected]) =>
        pairEqualityPixels[pos] !== expected).length,
      sites.filter(([pos, expected]) =>
        1 - pairEqualityPixels[pos] !== expected).length
    ];
  });
  assert.deepEqual(equalityFinderErrors, [[99, 48], [99, 48],
    [99, 48], [99, 48]]);

  const twoCodebookXorContradictions = [0, 1, 2, 3]
    .map(omit => xorTwoRuneCodebookContradictions(tape, omit));
  assert.deepEqual(twoCodebookXorContradictions, [45, 40, 40, 39]);
  const allSecretPairMap = [0, 1, 2, 3]
    .map(omit => allSecretPairCodebookBound(tape, omit));
  assert.deepEqual(allSecretPairMap.map(x => x.forcedWrong), [5, 5, 6, 2]);
  assert.deepEqual(allSecretPairMap.map(x => x.conflictingPairs),
    [5, 5, 6, 2]);

  // A valid codebook plant using distinct right-rune symbols 0/1 and
  // constant left-rune symbol 2. The XOR codebook can reproduce it exactly.
  const xorPlant = Array(882).fill(2);
  for (let pos = 0; pos < 441; pos++) xorPlant[2 * pos + 1] = plant[pos];
  assert.equal(xorTwoRuneCodebookContradictions(xorPlant, 3), 0);
  assert.equal(allSecretPairCodebookBound(xorPlant, 3).forcedWrong, 0);

  const lengths = Array.from({length:56}, (_, page) => {
    const p = corpus.pages.find(x => x.page === page);
    assert(p && Array.isArray(p.indices));
    return p.indices.length;
  });
  // Descriptive exact base rate across every original four-page subset.
  // This is NOT an authorial QR probability or a familywise discovery p.
  let quartets = 0;
  let twiceSquares = 0;
  let exactly882 = 0;
  let with55 = 0;
  let with55TwiceSquares = 0;
  for (let a = 0; a < 53; a++) {
    for (let b = a+1; b < 54; b++) {
      for (let d = b+1; d < 55; d++) {
        for (let e = d+1; e < 56; e++) {
          quartets++;
          const total = lengths[a]+lengths[b]+lengths[d]+lengths[e];
          const square = Number.isInteger(Math.sqrt(total/2));
          twiceSquares += +square;
          exactly882 += +(total === 882);
          if (e === 55) {
            with55++;
            with55TwiceSquares += +square;
          }
        }
      }
    }
  }
  assert.deepEqual([quartets,twiceSquares,exactly882,
    with55,with55TwiceSquares],[367290,4014,1091,26235,463]);

  const minSingle = Math.min(...result.flatMap(r =>
    r.panels.flat().map(x => x.forcedWrong)));
  assert.equal(minSingle, 40);
  return {
    originalCorpusSha256:crypto.createHash("sha256").update(file).digest("hex"),
    pageIds, pageLengths:sourcePages.map(p => p.length),
    runes:tape.length, qrV1ModuleCount:441,
    allFourPageSizeBaseRate:{quartets,twiceSquares,exactly882,
      with55,with55TwiceSquares},
    independentlyMappedPanelFinderBounds:result,
    minimumForcedWrongFinderModules:minSingle,
    pairedEqualRunes:pairedMatches,
    directPairedEqualityFinderErrorsByMissingCorner:equalityFinderErrors,
    twoUnknownCodebookXorCycleConflicts:twoCodebookXorContradictions,
    everySecretOrderedPairCodebookFinderBound:allSecretPairMap,
    positiveTwoCodebookXorCycleConflicts:
      xorTwoRuneCodebookContradictions(xorPlant, 3),
    sourceSizedPositiveFinderMismatches:allSecretFinderBound(plant, 3).forcedWrong,
    interpretation:"No exact QR-v1 direct GP-rune bitmap, source link remains speculative"
  };
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {run, allSecretFinderBound, finderSites,
  xorTwoRuneCodebookContradictions, allSecretPairCodebookBound};
