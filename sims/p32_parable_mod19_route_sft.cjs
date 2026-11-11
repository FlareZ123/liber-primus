#!/usr/bin/env node
'use strict';

// Reproduce the exploratory p32 / p57 PARABLE mod-19 word-index route.
// Run from the repository root: node sims/p32_parable_mod19_route_sft.cjs
// This is a candidate semantic alignment, not a cipher/decryption claim.

const fs = require('node:fs');
const assert = require('node:assert/strict');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const transcription = fs.readFileSync('resources/lp2-transcription.txt', 'utf8');
const pages = transcription.split('%');
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const prime = (r) => corpus.prime[runeIndex.get(r)];

function parseWords(page) {
  const words = [];
  let current = '';
  for (const ch of page) {
    if (runeIndex.has(ch)) current += ch;
    else if (ch === '/' || /\s/u.test(ch)) continue; // printed line-wrap, not a word boundary
    else if (current) { words.push(current); current = ''; }
  }
  if (current) words.push(current);
  return words;
}
const sumWord = (word) => [...word].reduce((sum, rune) => sum + prime(rune), 0);

const parableTokens = parseWords(pages[56]);
const parableTitle = parableTokens[0];
const parableBody = parableTokens.slice(1);
const labels = [
  'LIKE', 'THE', 'INSTAR', 'TUNNELING', 'TO', 'THE', 'SURFACE',
  'WE', 'MUST', 'SHED', 'OUR', 'OWN', 'CIRCUMFERENCES', 'FIND',
  'THE', 'DIVINITY', 'WITHIN', 'AND', 'EMERGE'
];
assert.equal(parableBody.length, 19);
assert.equal(labels.length, 19);

const parableSums = parableBody.map(sumWord);
const next = parableSums.map((sum) => sum % 19);
// One-based alternative: residue 0 selects body word 19; residue r>0 selects word r.
const oneBasedNext = parableSums.map((sum) => { const r = sum % 19; return r === 0 ? 18 : r - 1; });

function findCycles(mapping) {
  const done = new Set();
  const cycles = [];
  const cycleKeys = new Set();
  for (let start = 0; start < mapping.length; start++) {
    const path = [];
    const seen = new Map();
    let x = start;
    while (!done.has(x) && !seen.has(x)) {
      seen.set(x, path.length);
      path.push(x);
      x = mapping[x];
    }
    if (seen.has(x)) {
      const cycle = path.slice(seen.get(x));
      const key = [...cycle].sort((a, b) => a - b).join(',');
      if (!cycleKeys.has(key)) { cycles.push(cycle); cycleKeys.add(key); }
    }
    path.forEach((v) => done.add(v));
  }
  return cycles;
}
function walk(mapping, start) {
  const path = [];
  const seen = new Set();
  let x = start;
  while (!seen.has(x)) { path.push(x); seen.add(x); x = mapping[x]; }
  return path;
}

const p32Words = parseWords(pages[32]);
assert.equal(p32Words.length, 22);
const selectedWord = p32Words[7];
assert.equal([...selectedWord].length, 11);

const p32Indices = corpus.pages[32].indices;
assert.equal(p32Indices.length, 121);
const matrix = Array.from({ length: 11 }, (_, r) =>
  p32Indices.slice(r * 11, (r + 1) * 11).map((i) => corpus.prime[i])
);
const row3 = matrix[3];
// Original printed word and matrix coordinates are independent source witnesses:
// preserve the actual word segmentation and look for exactly 11-rune full rows.
const wordRanges = [];
let cursor = 0;
for (let wi = 0; wi < p32Words.length; wi++) {
  const len = [...p32Words[wi]].length;
  wordRanges.push({ wordNumber: wi + 1, first: cursor,
    lastExclusive: cursor + len, length: len });
  cursor += len;
}
assert.equal(cursor, 121);
const wholeGridRows = wordRanges.filter(({ first, length }) =>
  first % 11 === 0 && length === 11);
assert.deepEqual(wholeGridRows,
  [{ wordNumber: 8, first: 33, lastExclusive: 44, length: 11 }]);
const genuineGridCentre = matrix[5][5];
assert.equal(genuineGridCentre, 19);
const rowCentresMatchingGridCentre = matrix.flatMap((row, r) =>
  row[5] === genuineGridCentre ? [r] : []);
assert.deepEqual(rowCentresMatchingGridCentre, [3, 5]);
const selectedWholeRow = corpus.pages[32].indices.slice(33, 44)
  .map((i) => corpus.translit[i]).join('');
assert.equal(selectedWholeRow, 'HOMEXWDSLFD');
assert.equal(matrix[3][4], 47); // X immediately after the literal HOME.
assert.equal(matrix[3][9], 2);  // F immediately after the 4-word readout.
const sourceMarkerSpan = row3SourceMarker();
function row3SourceMarker() {
  const p = matrix[3];
  return {
    sourceWholeWord: selectedWholeRow,
    firstRuneOffset: 33,
    firstWordIndexOneBased: 8,
    mapCentrePrime: genuineGridCentre,
    fullWordRowCentrePrime: p[5],
    centreMatchRows: rowCentresMatchingGridCentre,
    homeX: p.slice(0, 5).map((v) =>
      corpus.translit[corpus.prime.indexOf(v)]).join(''),
    afterXPrimeValues: p.slice(5, 9),
    afterXResidues: p.slice(5, 9).map((v) => v % genuineGridCentre),
    nextGlyph: corpus.translit[corpus.prime.indexOf(p[9])]
  };
}
assert.equal(sourceMarkerSpan.homeX, 'HOMEX');
assert.deepEqual(sourceMarkerSpan.afterXPrimeValues, [19, 89, 53, 73]);
assert.deepEqual(sourceMarkerSpan.afterXResidues, [0, 13, 15, 16]);
assert.equal(sourceMarkerSpan.nextGlyph, 'F');
assert.deepEqual([...selectedWord].map((r) => runeIndex.get(r)), p32Indices.slice(33, 44));
const row3Residues = row3.map((v) => v % 19);
const row3Labels = row3Residues.map((i) => labels[i]);
const eastFromCentre = row3Residues.slice(5).map((i) => labels[i]);
const westFromCentre = row3Residues.slice(0, 6).reverse().map((i) => labels[i]);

const row3Sum = row3.reduce((a, b) => a + b, 0);
const row3Prefix9 = row3.slice(0, 9).reduce((a, b) => a + b, 0);
const row6Sum = matrix[6].reduce((a, b) => a + b, 0);
const row6Prefix9 = matrix[6].slice(0, 9).reduce((a, b) => a + b, 0);
const titleSum = sumWord(parableTitle);

const residueMatrix = matrix.map((row) => row.map((v) => v % 19));
const target = [0, 13, 15, 16];
const directions = [
  [-1, -1, 'NW'], [-1, 0, 'N'], [-1, 1, 'NE'], [0, -1, 'W'],
  [0, 1, 'E'], [1, -1, 'SW'], [1, 0, 'S'], [1, 1, 'SE']
];
const hits = [];
let directedWindows = 0;
const sourceConsecutivePaths = [];
const directedPathIndices = [];
for (let r = 0; r < 11; r++) for (let c = 0; c < 11; c++) {
  for (const [dr, dc, direction] of directions) {
    const coords = target.map((_, k) => [r + dr * k, c + dc * k]);
    if (coords.some(([rr, cc]) => rr < 0 || rr >= 11 || cc < 0 || cc >= 11)) continue;
    directedWindows++;
    // The source p57 body order, not the semantic interpretation, fixes this test.
    // Test every four consecutive body-word indices, not just one selected phrase.
    const ix = coords.map(([rr, cc]) => rr * 11 + cc);
    const residues = coords.map(([rr, cc]) => residueMatrix[rr][cc]);
    const nextStepLeavesSquare = r + 4 * dr < 0 || r + 4 * dr >= 11 ||
      c + 4 * dc < 0 || c + 4 * dc >= 11;
    directedPathIndices.push({ ix, nextStepLeavesSquare });
    if (residues[0] <= 15 &&
        residues.every((value, k) => k === 0 || value === residues[k - 1] + 1)) {
      sourceConsecutivePaths.push({
        start: [r, c], direction, sourceWordIndices: residues,
        nextStepLeavesSquare
      });
    }

    if (coords.every(([rr, cc], k) => residueMatrix[rr][cc] === target[k])) {
      hits.push({ start: [r, c], direction, coords });
    }
  }
}
assert.equal(directedWindows, 608);

const counts = Array(19).fill(0);
residueMatrix.flat().forEach((v) => counts[v]++);
const permutationNullExpected = directedWindows *
  (counts[0] / 121) * (counts[13] / 120) *
  (counts[15] / 119) * (counts[16] / 118);


/**
 * Detect repeated consecutive p57 word-index runs in all 608 source-shaped
 * straight four-cell windows. A suffix at the edge "reaches the surface"
 * only when its fifth movement would exit the matrix.
 * @param {number[]} cells
 * @returns {{ repeated: boolean, repeatedAndExiting: boolean, targetRepeated: boolean }}
 */
function evaluateSourceRuns(cells) {
  const counts = Array(16).fill(0);
  const exits = Array(16).fill(0);
  for (const { ix, nextStepLeavesSquare } of directedPathIndices) {
    const [i, j, k, l] = ix;
    const x = cells[i];
    if (x <= 15 && cells[j] === x + 1 && cells[k] === x + 2 &&
        cells[l] === x + 3) {
      counts[x]++;
      if (nextStepLeavesSquare) exits[x]++;
    }
  }
  return {
    repeated: counts.some((n) => n >= 2),
    repeatedAndExiting: counts.some((n, index) => n >= 2 && exits[index] > 0),
    targetRepeated: counts[2] >= 2
  };
}
const observedSourceRuns = evaluateSourceRuns(residueMatrix.flat());
assert.deepEqual(observedSourceRuns,
  { repeated: true, repeatedAndExiting: true, targetRepeated: true });
assert.deepEqual(sourceConsecutivePaths, [
  { start: [5, 0], direction: 'N', sourceWordIndices: [2, 3, 4, 5],
    nextStepLeavesSquare: false },
  { start: [10, 7], direction: 'NE', sourceWordIndices: [2, 3, 4, 5],
    nextStepLeavesSquare: true }
]);
assert.equal(matrix[0].reduce((s, v) => s + v, 0), 563);
assert.equal(matrix.reduce((s, row) => s + row[0], 0), 569);
assert.equal(matrix[5][5], 19); // The actual 11x11 center, not row3's center.
assert.ok(!corpus.prime.some((p) => p % 19 === 1));

/**
 * Uniformly permute the nominated cell indices in place.
 * @param {number[]} values
 * @param {number[]} cells
 * @param {() => number} rng
 */
function permuteCells(values, cells, rng) {
  for (let i = cells.length - 1; i > 0; i--) {
    const j = rng() % (i + 1);
    const x = cells[i], y = cells[j];
    [values[x], values[y]] = [values[y], values[x]];
  }
}
const wholeCells = Array.from({ length: 121 }, (_, i) => i);
const innerCells = wholeCells.filter((i) => i >= 11 && i % 11 !== 0);
const eachRowCells = Array.from({ length: 11 }, (_, row) =>
  Array.from({ length: 11 }, (_, column) => 11 * row + column));
let shuffleState = 0x8baca28c;
/** @returns {number} */
function randomUInt32() {
  shuffleState ^= shuffleState << 13;
  shuffleState ^= shuffleState >>> 17;
  shuffleState ^= shuffleState << 5;
  return shuffleState >>> 0;
}
const originalResidues = residueMatrix.flat();
const nPermutationTrials = 120000;
const permutationModes = [
  { name: 'fixed complete symbol inventory',
    shuffle: (v) => permuteCells(v, wholeCells, randomUInt32) },
  { name: 'fixed original top row and left column',
    shuffle: (v) => permuteCells(v, innerCells, randomUInt32) },
  { name: 'fixed all eleven row-value inventories',
    shuffle: (v) => {
      for (const row of eachRowCells) permuteCells(v, row, randomUInt32);
    } }
];
const sourcePathNulls = permutationModes.map(({ name, shuffle }) => {
  const cells = originalResidues.slice();
  let repeated = 0, repeatedAndExiting = 0, targetRepeated = 0;
  for (let trial = 0; trial < nPermutationTrials; trial++) {
    shuffle(cells);
    const probe = evaluateSourceRuns(cells);
    if (probe.repeated) repeated++;
    if (probe.repeatedAndExiting) repeatedAndExiting++;
    if (probe.targetRepeated) targetRepeated++;
  }
  return {
    name, trials: nPermutationTrials, repeated, repeatedAndExiting,
    targetRepeated,
    pRepeated: (repeated + 1) / (nPermutationTrials + 1),
    pRepeatedAndExiting: (repeatedAndExiting + 1) / (nPermutationTrials + 1)
  };
});
assert.deepEqual(sourcePathNulls.map((v) => [
  v.repeated, v.repeatedAndExiting, v.targetRepeated
]), [[257, 73, 240], [5637, 1449, 5630], [209, 24, 198]]);

const allUnknown = corpus.pages.filter((p) => p.page < 56)
  .flatMap((p) => p.indices || []);
assert.equal(allUnknown.length, 12956);
let matchedOriginalWindows = 0;
let matchedOriginalWindowRepeats = 0;
for (let start = 0; start + 121 <= allUnknown.length; start += 121) {
  matchedOriginalWindows++;
  const probe = evaluateSourceRuns(allUnknown.slice(start, start + 121)
    .map((r) => corpus.prime[r] % 19));
  if (probe.repeated) matchedOriginalWindowRepeats++;
}
assert.equal(matchedOriginalWindows, 107);
assert.equal(matchedOriginalWindowRepeats, 0);


/**
 * A second source-native discriminator: all p32 11x11 axes already use sums
 * of original GP prime weights, so compare exact four-prime sums for each
 * repeated PARABLE-index path rather than only their mod-19 residues.
 * @param {number[]} primeWeights
 * @returns {{ identicalSumPair: boolean, identicalSumPairAndExiting: boolean,
 *   targetSameSum: boolean }}
 */
function evaluateEqualPrimeSumPaths(primeWeights) {
  const bySourceStart = Array.from({ length: 16 }, () => new Map());
  for (const { ix, nextStepLeavesSquare } of directedPathIndices) {
    const [i, j, k, l] = ix;
    const a = primeWeights[i], b = primeWeights[j],
      c = primeWeights[k], d = primeWeights[l];
    const start = a % 19;
    if (start > 15 || b % 19 !== start + 1 || c % 19 !== start + 2 ||
        d % 19 !== start + 3) continue;
    const sum = a + b + c + d;
    const value = bySourceStart[start].get(sum) || { count: 0, exiting: false };
    value.count++;
    value.exiting ||= nextStepLeavesSquare;
    bySourceStart[start].set(sum, value);
  }
  let identicalSumPair = false, identicalSumPairAndExiting = false;
  let targetSameSum = false;
  for (let start = 0; start < 16; start++) {
    for (const item of bySourceStart[start].values()) {
      if (item.count < 2) continue;
      identicalSumPair = true;
      if (item.exiting) identicalSumPairAndExiting = true;
      if (start === 2) targetSameSum = true;
    }
  }
  return { identicalSumPair, identicalSumPairAndExiting, targetSameSum };
}
const observedRawPrimePaths = [
  [59, 79, 23, 5], [97, 3, 61, 5]
];
assert.ok(observedRawPrimePaths.every((v) => v.reduce((a, b) => a + b, 0) === 166));
const observedPrimeSumPaths = evaluateEqualPrimeSumPaths(matrix.flat());
assert.deepEqual(observedPrimeSumPaths,
  { identicalSumPair: true, identicalSumPairAndExiting: true,
    targetSameSum: true });
let primeNullState = 0x9371022d;
/** @returns {number} */
function primeNullRandomUInt32() {
  primeNullState ^= primeNullState << 13;
  primeNullState ^= primeNullState >>> 17;
  primeNullState ^= primeNullState << 5;
  return primeNullState >>> 0;
}
const primeNullModels = [
  { name: 'full fixed multiset of 121 original GP prime weights', cells: wholeCells },
  { name: 'fixed top row and left column, shuffle other 100 primes',
    cells: innerCells }
];
const sourcePrimeSumNulls = primeNullModels.map(({ name, cells }) => {
  const primeWeights = matrix.flat();
  const trials = 150000;
  let identicalSumPair = 0, identicalSumPairAndExiting = 0,
    targetSameSum = 0;
  for (let j = 0; j < trials; j++) {
    permuteCells(primeWeights, cells, primeNullRandomUInt32);
    const m = evaluateEqualPrimeSumPaths(primeWeights);
    if (m.identicalSumPair) identicalSumPair++;
    if (m.identicalSumPairAndExiting) identicalSumPairAndExiting++;
    if (m.targetSameSum) targetSameSum++;
  }
  return {
    name, trials, identicalSumPair, identicalSumPairAndExiting, targetSameSum,
    pEqualSumAndExiting: (identicalSumPairAndExiting + 1) / (trials + 1)
  };
});
assert.deepEqual(sourcePrimeSumNulls.map((v) =>
  [v.identicalSumPair, v.identicalSumPairAndExiting, v.targetSameSum]),
[[52, 11, 46], [1611, 390, 1609]]);

const pgpText = fs.readFileSync('resources/historical/cicada2016-4gq25-outguess.asc', 'utf8');
const begin = pgpText.indexOf('-----BEGIN PGP SIGNATURE-----');
const end = pgpText.indexOf('-----END PGP SIGNATURE-----');
assert(begin >= 0 && end > begin);
const armor = pgpText.slice(begin, end).split(/\r?\n\r?\n/).slice(1).join('\n');
const base64 = armor.split(/\r?\n/).filter((line) => line && !line.startsWith('=')).join('');
const packet = Buffer.from(base64, 'base64');
assert.equal(packet[0], 0x89);
const signatureBodyBytes = packet.readUInt16BE(1);
assert.equal(packet.length, signatureBodyBytes + 3);

const graphCycles = findCycles(next);
const oneBasedCycles = findCycles(oneBasedNext);
const oneBasedEast = row3Residues.slice(5).map((r) => labels[r === 0 ? 18 : r - 1]);
const output = {
  classification: 'exploratory semantic route; not a decoder',
  parable: {
    bodyWordCount: parableBody.length,
    titlePrimeSum: titleSum,
    words: labels.map((word, i) => ({
      index: i, word, gpPrimeSum: parableSums[i],
      nextIndex: next[i], nextWord: labels[next[i]]
    })),
    cycles: graphCycles.map((cycle) => cycle.map((i) => labels[i])),
    walkFromLike: walk(next, 0).map((i) => labels[i])
  },
  oneBasedControl: {
    eastFromCentre: oneBasedEast,
    cycles: oneBasedCycles.map((cycle) => cycle.map((i) => labels[i]))
  },
  p32: {
    wordIndex: 7,
    sourceMarkerSpan,
    wordTransliteration: [...selectedWord].map((r) => corpus.translit[runeIndex.get(r)]).join(''),
    runePrimeValues: row3,
    residuesModulo19: row3Residues,
    mappedWords: row3Labels,
    fromCentreEast: eastFromCentre,
    fromCentreWest: westFromCentre,
    row3Sum,
    row3Prefix9Sum: row3Prefix9,
    row6Sum,
    row6Prefix9Sum: row6Prefix9,
    uniqueFourCellHits: hits,
    sourceConsecutivePaths,
    trueCenterPrime: matrix[5][5]
  },
  2016: {
    asciiArmoredFileBytes: Buffer.byteLength(pgpText, 'utf8'),
    signaturePacketBytes: packet.length,
    signaturePacketBodyBytes: signatureBodyBytes
  },
  permutationControl: {
    directedLength4Windows: directedWindows,
    residueCounts: counts,
    expectedOccurrencesUnderRandomPermutationOfFixedResidueMultiset: permutationNullExpected,
    sourcePathNulls,
    observedRawPrimePaths,
    sourcePrimeSumNulls,
    matchedOriginalWindows,
    matchedOriginalWindowRepeats
  }
};

assert.equal(titleSum, 449);
assert.equal(row3Sum, signatureBodyBytes);
assert.equal(row3Prefix9, titleSum);
assert.equal(row6Prefix9, titleSum);
assert.equal(row6Sum, 577);
assert.deepEqual(row3Residues.slice(5, 9), target);
assert.deepEqual(oneBasedEast.slice(0, 4), ['EMERGE', 'CIRCUMFERENCES', 'THE', 'DIVINITY']);
assert.deepEqual(oneBasedCycles.map((cycle) => cycle.map((i) => labels[i])), [['THE']]);
assert.equal(hits.length, 1);
assert.deepEqual(hits[0], {
  start: [3, 5], direction: 'E',
  coords: [[3, 5], [3, 6], [3, 7], [3, 8]]
});
console.log(JSON.stringify(output, null, 2));
