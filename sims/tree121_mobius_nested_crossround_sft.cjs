'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-ink-annotations.json'), 'utf8'));
const magicText = fs.readFileSync(path.join(ROOT, 'resources/cicada2014-openpuff-magic-squares.txt'), 'utf8');

const MOD = 29;
const mod = (x) => ((x % MOD) + MOD) % MOD;
function inverse(x) {
  x = mod(x);
  assert.notEqual(x, 0);
  for (let i = 1; i < MOD; i++) if (mod(i * x) === 1) return i;
  throw new Error('No inverse in F29');
}
function multiply(a, b) {
  return [
    mod(a[0] * b[0] + a[1] * b[2]),
    mod(a[0] * b[1] + a[1] * b[3]),
    mod(a[2] * b[0] + a[3] * b[2]),
    mod(a[2] * b[1] + a[3] * b[3])
  ];
}
function inverseMatrix(m) {
  const scale = inverse(mod(m[0] * m[3] - m[1] * m[2]));
  return [mod(scale * m[3]), mod(-scale * m[1]), mod(-scale * m[2]), mod(scale * m[0])];
}
function power(m, n) {
  let out = [1, 0, 0, 1];
  for (let i = 0; i < n; i++) out = multiply(out, m);
  return out;
}
function projectivelyEqual(a, b) {
  const i = a.findIndex((x) => x !== 0);
  if (i < 0 || b[i] === 0) return false;
  const scale = mod(b[i] * inverse(a[i]));
  return a.every((x, j) => mod(scale * x) === mod(b[j]));
}
function projectiveNormalize(m) {
  const i = m.findIndex((x) => x !== 0);
  const scale = inverse(m[i]);
  return m.map((x) => mod(x * scale));
}
function projectiveOrder(m) {
  let p = [1, 0, 0, 1];
  for (let n = 1; n <= 60; n++) {
    p = multiply(p, m);
    if (p[1] === 0 && p[2] === 0 && p[0] === p[3] && p[0] !== 0) return n;
  }
  throw new Error('Unexpected PGL2(F29) order');
}
function apply(m, x) {
  if (x === 29) return m[2] === 0 ? 29 : mod(m[0] * inverse(m[2]));
  const den = mod(m[2] * x + m[3]);
  return den === 0 ? 29 : mod((m[0] * x + m[1]) * inverse(den));
}
function fixedPoints(m) {
  const out = [];
  for (let x = 0; x < MOD; x++) {
    const den = mod(m[2] * x + m[3]);
    if (den !== 0 && mod(m[0] * x + m[1] - x * den) === 0) out.push(x);
  }
  if (m[2] === 0) out.push(29);
  return out.sort((a, b) => a - b);
}
function cycleFrom(m, start) {
  const out = [];
  const seen = new Set();
  let x = start;
  while (!seen.has(x)) {
    seen.add(x);
    out.push(x);
    x = apply(m, x);
  }
  assert.equal(x, start);
  return out;
}

/** Test primality for the small source integers used here. */
function isPrime(value) {
  if (value < 2) return false;
  for (let d = 2; d * d <= value; d++) if (value % d === 0) return false;
  return true;
}

/** Return the one-based rank of a prime. */
function primeRank(value) {
  assert.ok(Number.isInteger(value) && isPrime(value), String(value) + ' must be prime');
  let rank = 0;
  for (let candidate = 2; candidate <= value; candidate++) if (isPrime(candidate)) rank++;
  return rank;
}

/** Euler's totient for a positive integer. */
function eulerTotient(value) {
  let n = value;
  let result = value;
  for (let p = 2; p * p <= n; p++) {
    if (n % p !== 0) continue;
    while (n % p === 0) n /= p;
    result -= result / p;
  }
  if (n > 1) result -= result / n;
  return result;
}

/** Decompose the complete projective line P1(F29) into cycles. */
function projectiveCycles(m) {
  const remaining = new Set(Array.from({ length: 30 }, (_, i) => i));
  const cycles = [];
  while (remaining.size) {
    const start = Math.min(...remaining);
    const cycle = cycleFrom(m, start);
    for (const state of cycle) remaining.delete(state);
    cycles.push(cycle);
  }
  return cycles;
}

const p32Page = corpus.pages.find((p) => p.page === 32);
assert.equal(p32Page.indices.length, 121);
const p32 = p32Page.indices.map((i) => corpus.prime[i]);
const width = p32.slice(0, 11).reduce((a, b) => a + b, 0);
const height = Array.from({ length: 11 }, (_, r) => p32[11 * r]).reduce((a, b) => a + b, 0);
assert.deepEqual([width, height], [563, 569]);

const p32Ink = ink.pages.find((p) => p.page === 32);
assert.equal(p32Ink.rune_count, 121);
const red13 = p32Ink.large_punctuation.find((x) => x[1] === 13 && x[2] === 'red');
assert.ok(red13, 'Original p32 must contain its red 13-dot mark');
const dotCount = red13[1];

const ringOffsets = [];
for (let c = 3; c <= 7; c++) ringOffsets.push(3 * 11 + c);
for (let r = 4; r <= 7; r++) ringOffsets.push(r * 11 + 7);
for (let c = 6; c >= 3; c--) ringOffsets.push(7 * 11 + c);
for (let r = 6; r >= 4; r--) ringOffsets.push(r * 11 + 3);
assert.equal(ringOffsets.length, 16);
const ring = ringOffsets.map((i) => p32[i]);
assert.deepEqual(ring, [67, 47, 19, 89, 53, 89, 107, 61, 37, 109, 107, 79, 41, 107, 17, 107]);
assert.equal(ring.reduce((a, b) => a + b, 0), 1136);

const interiors = [[1, 2, 3], [5, 6, 7], [9, 10, 11], [13, 14, 15]];
const corners = [0, 4, 8, 12];
const cornerSides = [[0, 3], [0, 1], [1, 2], [2, 3]];
function sideSumsForAssignment(values, mask) {
  const sums = interiors.map((positions) => positions.reduce((s, i) => s + values[i], 0));
  for (let k = 0; k < 4; k++) sums[cornerSides[k][(mask >>> k) & 1]] += values[corners[k]];
  return sums;
}
function inclusiveSideSums(values) {
  return [
    values.slice(0, 5).reduce((a, b) => a + b, 0),
    values.slice(4, 9).reduce((a, b) => a + b, 0),
    values.slice(8, 13).reduce((a, b) => a + b, 0),
    values[0] + values.slice(12).reduce((a, b) => a + b, 0)
  ];
}

// In a row-major 5x5 perimeter, the top and bottom rows are complete
// horizontal sides; the vertical sides contain only their three interiors.
const HORIZONTAL_MASK = 4; // corner ownership [N,N,S,S]
const rowMajorSides = sideSumsForAssignment(ring, HORIZONTAL_MASK);
assert.deepEqual(rowMajorSides, [275, 257, 373, 231]);
const M7 = rowMajorSides.map(mod);
assert.deepEqual(M7, [14, 25, 25, 28]);

// Conventional inclusive sides count each corner twice.
const inclusiveSides = inclusiveSideSums(ring);
assert.deepEqual(inclusiveSides, [275, 347, 373, 339]);
const M28 = inclusiveSides.map(mod);
assert.deepEqual(M28, [14, 28, 25, 20]);

const magicBlocks = magicText.trim().split(/\n\s*\n/).map((block) =>
  block.trim().split(/\r?\n/).map((line) => line.trim().split(/\s+/).map(Number))
);
assert.equal(magicBlocks.length, 3);
assert.equal(magicBlocks[0].length, 5);
assert.equal(magicBlocks[2].length, 5);
const p16Square = magicBlocks[0];
const p05Square = magicBlocks[2];
const A = [p05Square[0][0], p05Square[0][4], p05Square[4][0], p05Square[4][4]].map(mod);
const B = [p16Square[0][0], p16Square[0][4], p16Square[4][0], p16Square[4][4]].map(mod);
assert.deepEqual(A, [11, 6, 6, 11]);
assert.deepEqual(B, [28, 9, 9, 28]);
assert.ok(projectivelyEqual(B, power(A, 6)));

const peeledLayers = (11 - 5) / 2;
const sideCount = 4;
const innerSide = 5;
const outerSide = 11;
const heightResidue = mod(height);
assert.equal(peeledLayers, 3);
assert.equal(heightResidue, 18);
assert.equal(width % MOD, 12);

// Source-derived affine coordinate changes.
const Q28 = [mod(-width), ring.length / 2, 0, 1]; // x -> 8 - 12x
const S = [outerSide, ring.length / 2, 0, 1]; // x -> 11x + 8
const Q7 = multiply(S, Q28); // x -> 13x + 9
const Q7Source = [dotCount, heightResidue / 2, 0, 1];
assert.deepEqual(Q28, [17, 8, 0, 1]);
assert.deepEqual(S, [11, 8, 0, 1]);
assert.deepEqual(Q7, [13, 9, 0, 1]);
assert.deepEqual(Q7, Q7Source);

const M28FromLP1 = multiply(multiply(Q28, power(A, peeledLayers)), inverseMatrix(Q28));
assert.ok(projectivelyEqual(M28, M28FromLP1));
const M7FromLP1 = multiply(multiply(Q7, power(A, width % MOD)), inverseMatrix(Q7));
assert.ok(projectivelyEqual(M7, M7FromLP1));
const M7FromM28 = multiply(multiply(S, power(M28, sideCount)), inverseMatrix(S));
assert.ok(projectivelyEqual(M7, M7FromM28));
assert.equal(projectiveOrder(A), 28);
assert.equal(projectiveOrder(M28), 28);
assert.equal(projectiveOrder(M7), 7);

// A second coordinate orientation gives the same M7 map:
// Q2(x)=16x+9 and A^16; it differs from Q7 by x -> -x.
const Q2 = [ring.length, heightResidue / 2, 0, 1];
assert.deepEqual(Q2, [16, 9, 0, 1]);
assert.ok(projectivelyEqual(M7, multiply(multiply(Q2, power(A, ring.length)), inverseMatrix(Q2))));
const reflection = multiply(inverseMatrix(Q2), Q7);
assert.deepEqual(reflection, [28, 0, 0, 1]);

// Cross-round fixed-point and marked-state checks.
const fixed7 = fixedPoints(M7);
const fixed28 = fixedPoints(M28);
assert.deepEqual(fixed7, [22, 25]);
assert.deepEqual(fixed28, [20, 25]);
const fixed7PrimeSum = fixed7.reduce((s, x) => s + corpus.prime[x], 0);
const likeIndices = ['L', 'I', 'C', 'E'].map((x) => corpus.translit.indexOf(x)); // K -> C in GP
const likePrimeSum = likeIndices.reduce((s, x) => s + corpus.prime[x], 0);
assert.deepEqual(likeIndices, [20, 10, 5, 18]);
assert.equal(fixed7PrimeSum, 184);
assert.equal(likePrimeSum, 184);
assert.equal(apply(M7, 13), 24);
assert.equal(3301 % MOD, 24);
const markedCycle = cycleFrom(M7, 13);
assert.deepEqual(markedCycle, [13, 24, 19, 3, 6, 20, 17]);
const infinityCycle = cycleFrom(M7, 29);
const infinityFinite = infinityCycle.filter((x) => x !== 29).sort((a, b) => a - b);
assert.deepEqual(infinityFinite, [2, 7, 8, 10, 11, 16]);
const infinityPrimeSum = infinityFinite.reduce((s, x) => s + corpus.prime[x], 0);
assert.equal(infinityPrimeSum, 174);
assert.equal(fixed28.reduce((s, x) => s + corpus.prime[x], 0), 174);

// The repeated cuneiform immediately following p32 encodes (17,13) and
// (55,1) in base 60: 1033 and 3301. These are also the two LP1 magic-square
// constants. The LP1 instruction explicitly calls both primes and the totient
// function sacred, so prime rank is a source-motivated finite selector.
const cuneiformValues = [17 * 60 + 13, 55 * 60 + 1];
const p05MagicSum = p05Square[0].reduce((a, b) => a + b, 0);
const p16MagicSum = p16Square[0].reduce((a, b) => a + b, 0);
assert.deepEqual(cuneiformValues, [1033, 3301]);
assert.deepEqual([p05MagicSum, p16MagicSum], cuneiformValues);

const cuneiformPrimeRanks = cuneiformValues.map(primeRank);
assert.deepEqual(cuneiformPrimeRanks, [174, 464]);
const rankOverAlphabet = cuneiformPrimeRanks.map((rank) => rank / MOD);
const rankOverPages = cuneiformPrimeRanks.map((rank) => rank / 58);
assert.deepEqual(rankOverAlphabet, [6, 16]);
assert.deepEqual(rankOverPages, [3, 8]);

const concentricLayerCount = (outerSide + 1) / 2;
assert.equal(rankOverAlphabet[0], concentricLayerCount);
assert.equal(rankOverAlphabet[1], ring.length);
assert.equal(rankOverPages[0], peeledLayers);
assert.equal(rankOverPages[1], ring.length / 2);

// All four quotients are already parameters of the independently derived
// nested Mobius chain: 6 in B~A^6, 3 in M28~Q28*A^3*Q28^-1,
// 16 in Q2 and A^16, and 8 in Q28/S.
assert.ok(projectivelyEqual(B, power(A, rankOverAlphabet[0])));
assert.ok(projectivelyEqual(
  M28,
  multiply(multiply(Q28, power(A, rankOverPages[0])), inverseMatrix(Q28))
));
assert.equal(Q2[0], rankOverAlphabet[1]);
assert.ok(projectivelyEqual(
  M7,
  multiply(multiply(Q2, power(A, rankOverAlphabet[1])), inverseMatrix(Q2))
));
assert.equal(Q28[1], rankOverPages[1]);
assert.equal(S[1], rankOverPages[1]);

// Rank 174 supplies a finite discriminator for the formerly ambiguous
// single-count corner convention.
const cornerRankHits = [];
for (let mask = 0; mask < 16; mask++) {
  const candidate = sideSumsForAssignment(ring, mask).map(mod);
  for (const cycle of projectiveCycles(candidate)) {
    const finitePrimeSum = cycle
      .filter((state) => state !== 29)
      .reduce((sum, state) => sum + corpus.prime[state], 0);
    if (finitePrimeSum === cuneiformPrimeRanks[0]) {
      cornerRankHits.push({ mask, cycle, finitePrimeSum });
    }
  }
}
assert.equal(cornerRankHits.length, 1);
assert.equal(cornerRankHits[0].mask, HORIZONTAL_MASK);
assert.deepEqual(cornerRankHits[0].cycle, [2, 7, 29, 11, 16, 10, 8]);

function rotateSides(values) {
  const [north, east, south, west] = values;
  return [west, north, east, south];
}
function reflectSides(values) {
  const [north, east, south, west] = values;
  return [north, west, south, east];
}
const inclusiveOrientationHits = [];
let rotatedSides = inclusiveSides.slice();
for (let rotation = 0; rotation < 4; rotation++) {
  for (const reflected of [false, true]) {
    const oriented = reflected ? reflectSides(rotatedSides) : rotatedSides;
    const candidate = oriented.map(mod);
    const determinant = mod(candidate[0] * candidate[3] - candidate[1] * candidate[2]);
    if (determinant !== 0) {
      const points = fixedPoints(candidate);
      const finitePrimeSum = points
        .filter((state) => state !== 29)
        .reduce((sum, state) => sum + corpus.prime[state], 0);
      if (finitePrimeSum === cuneiformPrimeRanks[0]) {
        inclusiveOrientationHits.push({ rotation, reflected, oriented, points, finitePrimeSum });
      }
    }
  }
  rotatedSides = rotateSides(rotatedSides);
}
assert.deepEqual(inclusiveOrientationHits, [{
  rotation: 0,
  reflected: false,
  oriented: inclusiveSides,
  points: [20, 25],
  finitePrimeSum: 174
}]);

const rankTotients = cuneiformPrimeRanks.map(eulerTotient);
assert.deepEqual(rankTotients, [56, 224]);
assert.equal(rankTotients[0], (ring.length / 2) * projectiveOrder(M7));
assert.equal(rankTotients[1], (ring.length / 2) * projectiveOrder(M28));
assert.equal(rankTotients[1], 32 * projectiveOrder(M7));

// Search only a declared, source-derived vocabulary of affine coordinates;
// this is a finite sensitivity check, not an exhaustive search over PGL2.
const slopeCandidates = [
  { label: '2016 width mod29', value: mod(width) },
  { label: '2016 height mod29', value: heightResidue },
  { label: 'red 13-dot count', value: dotCount },
  { label: '16-cell ring length', value: ring.length }
];
const translationCandidates = [
  { label: 'half 2016 height residue', value: heightResidue / 2 },
  { label: 'half ring length', value: ring.length / 2 },
  { label: 'full ring length', value: ring.length },
  { label: 'red 13-dot count', value: dotCount },
  { label: 'peeled layers', value: peeledLayers },
  { label: 'inner side length', value: innerSide },
  { label: 'half outer side length', value: (outerSide + 1) / 2 },
  { label: 'outer side length', value: outerSide }
];
function conjugacySearch(target) {
  const matches = [];
  for (const slope of slopeCandidates) {
    for (const slopeSign of [1, -1]) {
      for (const translation of translationCandidates) {
        for (const translationSign of [1, -1]) {
          const Q = [mod(slopeSign * slope.value), mod(translationSign * translation.value), 0, 1];
          for (let exponent = 1; exponent <= 28; exponent++) {
            const candidate = multiply(multiply(Q, power(A, exponent)), inverseMatrix(Q));
            if (projectivelyEqual(target, candidate)) {
              matches.push({
                slope: slope.label, slopeSign,
                translation: translation.label, translationSign,
                exponent, affine: Q
              });
            }
          }
        }
      }
    }
  }
  const unique = [...new Map(matches.map((m) => [m.affine.join(',') + ':' + m.exponent, m])).values()];
  return { labelledMatches: matches, uniqueParameterizations: unique };
}
const search7 = conjugacySearch(M7);
const search28 = conjugacySearch(M28);
assert.equal(search7.uniqueParameterizations.length, 2);
assert.equal(search28.uniqueParameterizations.length, 2);
assert.ok(search7.uniqueParameterizations.some((m) => m.affine.join(',') === Q7.join(',') && m.exponent === 12));
assert.ok(search7.uniqueParameterizations.some((m) => m.affine.join(',') === Q2.join(',') && m.exponent === 16));
assert.ok(search28.uniqueParameterizations.some((m) => m.affine.join(',') === Q28.join(',') && m.exponent === 3));
assert.ok(search28.uniqueParameterizations.some((m) => m.affine.join(',') === [12, 8, 0, 1].join(',') && m.exponent === 25));

// Conditional null: preserve the original 11x11 top row and left column,
// then permute the other 100 original GP-prime values. For each draw, test
// the fixed row-major corner rule and all 16 legal single-count assignments.
const freeOffsets = [];
for (let r = 1; r < 11; r++) for (let c = 1; c < 11; c++) freeOffsets.push(11 * r + c);
assert.equal(freeOffsets.length, 100);
const sample = freeOffsets.map((i) => p32[i]);
const permuted = p32.slice();
let rngState = 0x56356929;
function randomBelow(n) {
  rngState ^= rngState << 13;
  rngState ^= rngState >>> 17;
  rngState ^= rngState << 5;
  return (rngState >>> 0) % n;
}
const TRIALS = 200000;
let fixedHorizontalMatches = 0;
let permutationsWithAnyCornerMatch = 0;
let totalMatchingAssignments = 0;
const SInverse = inverseMatrix(S);
for (let trial = 0; trial < TRIALS; trial++) {
  for (let i = sample.length - 1; i > 0; i--) {
    const j = randomBelow(i + 1);
    [sample[i], sample[j]] = [sample[j], sample[i]];
  }
  for (let i = 0; i < sample.length; i++) permuted[freeOffsets[i]] = sample[i];
  const shuffledRing = ringOffsets.map((i) => permuted[i]);
  const shuffledM28 = inclusiveSideSums(shuffledRing).map(mod);
  const predictedM7 = multiply(multiply(S, power(shuffledM28, sideCount)), SInverse);
  const assignments = Array.from({ length: 16 }, (_, mask) =>
    sideSumsForAssignment(shuffledRing, mask).map(mod)
  );
  if (projectivelyEqual(assignments[HORIZONTAL_MASK], predictedM7)) fixedHorizontalMatches++;
  let matches = 0;
  for (const candidate of assignments) if (projectivelyEqual(candidate, predictedM7)) matches++;
  if (matches) permutationsWithAnyCornerMatch++;
  totalMatchingAssignments += matches;
}
assert.deepEqual(
  [fixedHorizontalMatches, permutationsWithAnyCornerMatch, totalMatchingAssignments],
  [29, 144, 153]
);

console.log(JSON.stringify({
  status: 'exact source algebra; no unknown LP2 plaintext or authentic cipher recovered',
  source: {
    p32Runes: p32.length, width, height, widthMod29: mod(width), heightMod29: heightResidue,
    redDotCount: dotCount, outerSide, innerSide, peeledLayers, ringLength: ring.length,
    ring, ringSum: ring.reduce((a, b) => a + b, 0)
  },
  matrices: {
    LP1p05: A, LP1p16: B,
    p32RowMajorSingleCount: { sideSums: rowMajorSides, matrix: M7, projectiveOrder: projectiveOrder(M7), fixedPoints: fixed7 },
    p32Inclusive: { sideSums: inclusiveSides, matrix: M28, projectiveOrder: projectiveOrder(M28), fixedPoints: fixed28 }
  },
  exactRelations: {
    Q28: { matrix: Q28, action: 'x -> 8 - 12x', relation: 'M28 ~ Q28 * A^3 * Q28^-1' },
    S: { matrix: S, action: 'x -> 11x + 8', relation: 'M7 ~ S * M28^4 * S^-1' },
    Q7: { matrix: Q7, action: 'x -> 13x + 9', relation: 'M7 ~ Q7 * A^12 * Q7^-1' },
    Q2: { matrix: Q2, action: 'x -> 16x + 9', relation: 'M7 ~ Q2 * A^16 * Q2^-1; coordinate-reflection equivalent to Q7' },
    composition: 'Q7 = S * Q28; 12 = 3 peeled layers * 4 sides = 563 mod29'
  },
  cuneiformPrimeRankSelector: {
    values: cuneiformValues,
    oneBasedPrimeRanks: cuneiformPrimeRanks,
    rankOverAlphabet,
    rankOverPages,
    rankTotients,
    cornerRankHits,
    inclusiveOrientationHits
  },
  crossRoundChecks: {
    p32M7Maps13To: apply(M7, 13),
    cicada3301Mod29: 3301 % MOD,
    p32M7FixedPoints: fixed7,
    fixedPointPrimeSum: fixed7PrimeSum,
    parableLikeGPIndices: likeIndices,
    parableLikePrimeSum: likePrimeSum,
    infinityCycle: infinityCycle,
    infinityCycleFiniteStates: infinityFinite,
    infinityCycleFinitePrimeSum: infinityPrimeSum
  },
  boundedAffineSearch: {
    slopeCandidates, translationCandidates, exponents: '1..28',
    M7: search7, M28: search28,
    caveat: 'Only the declared source-derived affine vocabulary was searched; the result is not exhaustive over all projective conjugacies.'
  },
  conditionalNull: {
    seed: '0x56356929', trials: TRIALS, frozenAxisCells: 21, shuffledInteriorCells: 100,
    cornerAssignmentsPerDraw: 16,
    fixedHorizontalMatches: fixedHorizontalMatches,
    permutationsWithAnyCornerMatch: permutationsWithAnyCornerMatch,
    totalMatchingAssignments: totalMatchingAssignments,
    plusOneFixedHorizontal: (fixedHorizontalMatches + 1) / (TRIALS + 1),
    plusOneAnyAssignment: (permutationsWithAnyCornerMatch + 1) / (TRIALS + 1)
  },
  interpretation: 'The row-major single-count and inclusive p32 ring matrices form a nested, source-parameterized Mobius chain and cross-link to LP1 p05 and solved p57. This is a strong structural hypothesis, not a decryption: the corner rule and next operational use remain unproved, and direct map/state inverses already tested elsewhere are negative.'
}, null, 2));
