'use strict';

/**
 * Original-source, read-only gate for the prime-ordinal residue candidate
 * C[i] = (prime[k + i] + 2*i) mod 29.
 *
 * Execute from the repository root with Node.js 22. No dependencies or writes.
 * Source: resources/liber-primus/lp2-corpus.json and lp2-transcription.txt.
 * This is a test of a specific arithmetic generator, not an LP2 decryption.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const rawWords = fs.readFileSync(path.join(root, 'lp2-transcription.txt'), 'utf8')
  .split('%').slice(0, 55).join('').replace(/[\\/\s&$0-9]/g, '').split(/[-.]/).filter(Boolean);
const original = corpus.pages.filter((p) => p.page < 56).flatMap((p) => p.indices);
assert.equal(original.length, 12956);
assert.equal(rawWords.length, 2896);
assert.equal(rawWords.reduce((total, word) => total + [...word].length, 0), original.length);
assert.ok(original.every((n) => Number.isInteger(n) && n >= 0 && n < 29));

/** @param {number} n @returns {number} */
function mod29(n) {
  return (n % 29 + 29) % 29;
}

/** @param {number} max @returns {number[]} */
function smallPrimes(max) {
  const flags = new Uint8Array(max + 1);
  const primes = [];
  for (let n = 2; n <= max; n++) {
    if (flags[n]) continue;
    primes.push(n);
    if (n * n <= max) {
      for (let k = n * n; k <= max; k += n) flags[k] = 1;
    }
  }
  return primes;
}

const trialDivisors = smallPrimes(32000);

/** @param {number} after @returns {number} */
function nextPrime(after) {
  for (let candidate = after + 1; ; candidate++) {
    let prime = true;
    for (const factor of trialDivisors) {
      if (factor * factor > candidate) break;
      if (candidate % factor === 0) {
        prime = false;
        break;
      }
    }
    if (prime) return candidate;
  }
}

/** @param {number} firstCandidate @param {number} length @returns {number[]} */
function primeOrdinalTape(firstCandidate, length) {
  let p = nextPrime(firstCandidate - 1);
  const output = [];
  for (let i = 0; i < length; i++) {
    output.push(mod29(p + 2 * i));
    p = nextPrime(p);
  }
  return output;
}

/** @param {number[]} tape @returns {number[]} */
function transitionHistogram(tape) {
  const counts = Array(29).fill(0);
  for (let i = 1; i < tape.length; i++) {
    counts[mod29(tape[i] - tape[i - 1])]++;
  }
  return counts;
}

/**
 * Minimum number of gaps > 58 required by an arbitrary prime sequence
 * consistent with the displayed (prime[i] + 2*i) mod 29 residues.
 *
 * A true consecutive-prime gap g is positive and even. The displayed
 * difference specifies g modulo 29. Hence g = base + 58*k, k >= 0,
 * with base in {2,4,...,58}. Only mod 3 matters to exclude composite
 * prime positions, and k = 0,1,2 exhausts possible residues modulo 3.
 * Each k > 0 costs one; thus this is a LOWER BOUND, not an inferred key.
 *
 * @param {number[]} tape
 * @returns {number}
 */
function minimumLargePrimeGaps(tape) {
  let costs = [Infinity, 0, 0]; // Starting prime is 1 or 2 modulo 3.
  for (let i = 1; i < tape.length; i++) {
    const diff = mod29(tape[i] - tape[i - 1] - 2);
    const evenBase = 2 * mod29(diff * 15) || 58;
    const next = [Infinity, Infinity, Infinity];
    for (let r = 1; r <= 2; r++) {
      for (let k = 0; k < 3; k++) {
        const nextR = (r + evenBase + 58 * k) % 3;
        if (nextR !== 0) {
          next[nextR] = Math.min(next[nextR], costs[r] + Number(k > 0));
        }
      }
    }
    costs = next;
  }
  return Math.min(costs[1], costs[2]);
}

/** @param {number[]} tape @returns {{matches: number, slots: number}} */
function withinWordFiveBack(tape) {
  let offset = 0;
  let matches = 0;
  let slots = 0;
  for (const word of rawWords) {
    const length = [...word].length;
    for (let j = 5; j < length; j++) {
      slots++;
      if (tape[offset + j] === tape[offset + j - 5]) matches++;
    }
    offset += length;
  }
  assert.equal(offset, tape.length);
  return { matches, slots };
}

/** @param {number[]} left @param {number[]} right @returns {number} */
function totalVariation(left, right) {
  assert.equal(left.length, right.length);
  const total = left.reduce((sum, value) => sum + value, 0);
  return left.reduce((sum, value, i) => sum + Math.abs(value - right[i]), 0) / (2 * total);
}

const plant = primeOrdinalTape(1000000000, original.length);
const sourceSteps = transitionHistogram(original);
const plantedSteps = transitionHistogram(plant);
const distance = totalVariation(sourceSteps, plantedSteps);
const sourceLag5 = withinWordFiveBack(original);
const plantedLag5 = withinWordFiveBack(plant);
const sourceLarge = minimumLargePrimeGaps(original);
const plantedLarge = minimumLargePrimeGaps(plant);


/**
 * Every prime except 29 is nonzero modulo29. Under C[i] =
 * (prime[start+i] + slope*i + offset) mod29, the inferred prime residue is
 * zero exactly where C[i]-slope*i equals offset modulo29. There can be at
 * most ONE such occurrence in an unbroken consecutive-prime tape.
 *
 * Return the fewest forced zero residues across ALL 29 slopes and
 * ALL 29 additive offsets, independent of the prime starting index.
 * A result greater than one is an exact all-parameter impossibility.
 *
 * @param {number[]} tape
 * @returns {{minimum: number, slope: number, offset: number}}
 */
function primeDivisibilityMinimum(tape) {
  let best = { minimum: Infinity, slope: 0, offset: 0 };
  for (let slope = 0; slope < 29; slope++) {
    const counts = Array(29).fill(0);
    for (let i = 0; i < tape.length; i++) {
      counts[mod29(tape[i] - slope * i)]++;
    }
    for (let offset = 0; offset < 29; offset++) {
      if (counts[offset] < best.minimum) {
        best = { minimum: counts[offset], slope, offset };
      }
    }
  }
  return best;
}

const physicalChapters = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const fullDivisibility = primeDivisibilityMinimum(original);
const chapterDivisibility = physicalChapters.map(([first, last]) => ({
  pages: `p${first}-${last}`,
  ...primeDivisibilityMinimum(corpus.pages
    .filter((p) => p.page >= first && p.page <= last)
    .flatMap((p) => p.indices))
}));
assert.equal(fullDivisibility.minimum, 389);
assert.deepEqual(chapterDivisibility.map((x) => x.minimum),
  [13, 21, 34, 36, 18, 30, 34, 75, 2]);
assert.ok(chapterDivisibility.every((x) => x.minimum > 1));
assert.equal(primeDivisibilityMinimum(plant).minimum, 0);
assert.equal(secretPermutationPrimeMinimum(plant), 0);


/**
 * 29x29 minimum-cost phase-symbol assignment. This gives the smallest
 * possible count of mandatory prime29 sites when an unknown STATIC,
 * bijective GP29 output alphabet is also allowed. With nonzero slope b,
 * the affine map j -> b*j+a permutes all 29 phase labels; an arbitrary
 * secret alphabet then permits ANY bijective phase-to-symbol assignment.
 * This is an intentionally generous key-independent necessary condition.
 *
 * @param {number[][]} costs
 * @returns {number}
 */
function minBijectionCost(costs) {
  const n = costs.length;
  const u = Array(n + 1).fill(0);
  const v = Array(n + 1).fill(0);
  const match = Array(n + 1).fill(0);
  const previous = Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    match[0] = i;
    let column = 0;
    const remaining = Array(n + 1).fill(Infinity);
    const used = Array(n + 1).fill(false);
    do {
      used[column] = true;
      const row = match[column];
      let delta = Infinity;
      let nextColumn = 0;
      for (let j = 1; j <= n; j++) {
        if (used[j]) continue;
        const cost = costs[row - 1][j - 1] - u[row] - v[j];
        if (cost < remaining[j]) {
          remaining[j] = cost;
          previous[j] = column;
        }
        if (remaining[j] < delta) {
          delta = remaining[j];
          nextColumn = j;
        }
      }
      for (let j = 0; j <= n; j++) {
        if (used[j]) {
          u[match[j]] += delta;
          v[j] -= delta;
        } else {
          remaining[j] -= delta;
        }
      }
      column = nextColumn;
    } while (match[column] !== 0);
    do {
      const nextColumn = previous[column];
      match[column] = match[nextColumn];
      column = nextColumn;
    } while (column !== 0);
  }
  let minimum = 0;
  for (let j = 1; j <= n; j++) {
    minimum += costs[match[j] - 1][j - 1];
  }
  return minimum;
}

/** @param {number[]} tape @returns {number} */
function secretPermutationPrimeMinimum(tape) {
  const costs = Array.from({ length: 29 }, () => Array(29).fill(0));
  for (let i = 0; i < tape.length; i++) {
    costs[i % 29][tape[i]]++;
  }
  return minBijectionCost(costs);
}

const wholeSecretPermutation = secretPermutationPrimeMinimum(original);
const chapterSecretPermutation = physicalChapters.map(([first, last]) =>
  secretPermutationPrimeMinimum(corpus.pages
    .filter((p) => p.page >= first && p.page <= last)
    .flatMap((p) => p.indices)));
assert.equal(wholeSecretPermutation, 251);
assert.deepEqual(chapterSecretPermutation, [0, 0, 1, 2, 0, 0, 1, 15, 0]);

// Exact original-source and independently generated control assertions.
assert.equal(sourceSteps[0], 86);
assert.equal(plantedSteps[0], 76);
assert.equal(sourceLag5.slots, 2105);
assert.equal(sourceLag5.matches, 104);
assert.equal(plantedLag5.matches, 50);
assert.equal(sourceLarge, 2876);
assert.equal(plantedLarge, 530);
assert.ok(distance > 0.3375 && distance < 0.3376);

console.log(JSON.stringify({
  model: 'C[i] = (consecutivePrime[i] + 2*i) mod 29',
  primeStart: 1000000007,
  runes: original.length,
  repeated: { original: sourceSteps[0], plant: plantedSteps[0] },
  transitions: { original: sourceSteps, plant: plantedSteps, totalVariation: distance },
  fifthBackWithinWords: { original: sourceLag5, plant: plantedLag5 },
  minimumNecessaryPrimeGapsOver58: { original: sourceLarge, plant: plantedLarge },
  allStartAllAffineOrdinalPrimeDivisibility: {
    full: fullDivisibility, chapters: chapterDivisibility,
    fixedPrimePlant: primeDivisibilityMinimum(plant)
  },
  unknownStaticPermutation: {
    fullMinimumPrime29Sites: wholeSecretPermutation,
    chapterMinima: chapterSecretPermutation,
    realPrimePlantMinimum: secretPermutationPrimeMinimum(plant)
  }
}, null, 2));
console.log('PASS: every direct affine-ordinal prime generator is impossible on each original chapter, independent of prime start.');
