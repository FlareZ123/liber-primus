"use strict";
/**
 * Director #1053: lossless GP29 ciphertext with a bounded number of repeats,
 * using the printed word-boundary combinadic rank as a natural extra channel.
 *
 * This is a HYPOTHETICAL codec. The per-page repeat caps are observed from
 * ciphertext, and no original Cicada instruction selects this codec or salt.
 * Run: node sims/lp2_no_repeat_boundary_enumerative_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const segments = fs.readFileSync(
  path.join(root, "resources/lp2-transcription.txt"), "utf8").split("%").slice(0, 55);
const RUNE = /[\u16A0-\u16FF]/u;
const CHOICE = ".-&$§";
const binomialRows = [[1n]];

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  while (binomialRows.length <= n) {
    const previous = binomialRows[binomialRows.length - 1];
    const next = [1n];
    for (let j = 1; j < previous.length; j++) {
      next.push(previous[j - 1] + previous[j]);
    }
    next.push(1n);
    binomialRows.push(next);
  }
  return binomialRows[n][k];
}

/**
 * f[t][k] counts possible t-step GP29 successors with at most k repeats.
 * @param {number} length
 * @param {number} limit
 * @returns {bigint[][]}
 */
function completions(length, limit) {
  const f = Array.from({length: length + 1},
    () => Array(limit + 1).fill(0n));
  f[0].fill(1n);
  for (let t = 1; t <= length; t++) {
    for (let k = 0; k <= limit; k++) {
      f[t][k] = 28n * f[t - 1][k] + (k ? f[t - 1][k - 1] : 0n);
    }
  }
  return f;
}

/**
 * Rank ciphertext by its first GP symbol, then repeat-first cyclic steps.
 * @param {number[]} values
 * @param {number} limit
 * @returns {{rank: bigint, capacity: bigint}}
 */
function rankCipher(values, limit) {
  const length = values.length - 1;
  const f = completions(length, limit);
  let rank = BigInt(values[0]) * f[length][limit];
  let allowed = limit;
  for (let i = 1; i < values.length; i++) {
    const delta = (values[i] - values[i - 1] + 29) % 29;
    const remaining = length - i;
    if (delta === 0) {
      assert(allowed > 0, "ciphertext exceeds repeat cap");
      allowed--;
    } else {
      rank += (allowed ? f[remaining][allowed - 1] : 0n) +
        BigInt(delta - 1) * f[remaining][allowed];
    }
  }
  return {rank, capacity: 29n * f[length][limit]};
}

/**
 * Exact inverse of rankCipher.
 * @param {bigint} rank
 * @param {number} count
 * @param {number} limit
 * @returns {number[]}
 */
function unrankCipher(rank, count, limit) {
  const length = count - 1;
  const f = completions(length, limit);
  assert(rank >= 0n && rank < 29n * f[length][limit]);
  let previous = Number(rank / f[length][limit]);
  rank %= f[length][limit];
  const result = [previous];
  let allowed = limit;
  for (let i = 1; i < count; i++) {
    const remaining = length - i;
    const repeatArea = allowed ? f[remaining][allowed - 1] : 0n;
    if (rank < repeatArea) {
      result.push(previous);
      allowed--;
    } else {
      rank -= repeatArea;
      const step = rank / f[remaining][allowed];
      assert(step < 28n);
      rank %= f[remaining][allowed];
      previous = (previous + Number(step) + 1) % 29;
      result.push(previous);
    }
  }
  assert.equal(rank, 0n);
  return result;
}

/** @param {number[]} gaps @returns {bigint} */
function rankBoundaries(gaps) {
  return gaps.reduce((rank, gap, i) => rank + choose(gap, i + 1), 0n);
}

/**
 * Combinadic unrank for B selected gaps in 0..length-1.
 * @param {bigint} rank
 * @param {number} length
 * @param {number} count
 * @returns {number[]}
 */
function unrankBoundaries(rank, length, count) {
  assert(rank >= 0n && rank < choose(length, count));
  const result = Array(count);
  let upper = length - 1;
  for (let i = count; i >= 1; i--) {
    let lo = i - 1;
    let hi = upper;
    let best = -1;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (choose(mid, i) <= rank) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    assert(best >= 0);
    result[i - 1] = best;
    rank -= choose(best, i);
    upper = best - 1;
  }
  assert.equal(rank, 0n);
  return result;
}

/** @param {number[]} values @returns {bigint} */
function asBase29(values) {
  return values.reduce((x, rune) => x * 29n + BigInt(rune), 0n);
}

/** @param {bigint} value @param {number} count @returns {number[]} */
function fromBase29(value, count) {
  const digits = Array(count);
  for (let i = count - 1; i >= 0; i--) {
    digits[i] = Number(value % 29n);
    value /= 29n;
  }
  assert.equal(value, 0n);
  return digits;
}

/** @param {number[]} indices @returns {number} */
function coincidence(indices) {
  const histogram = Array(29).fill(0);
  for (const index of indices) histogram[index]++;
  return histogram.reduce((sum, n) => sum + n * (n - 1), 0) /
    (indices.length * (indices.length - 1));
}

/**
 * @param {number} pageNumber
 * @param {string} text
 * @returns {{page:number,runes:number[],boundaries:number[],repeats:number}}
 */
function sourcePage(pageNumber, text) {
  const source = corpus.pages.find(page => page.page === pageNumber);
  assert(source);
  const chars = [...text];
  const offsets = [];
  for (let i = 0; i < chars.length; i++) {
    if (RUNE.test(chars[i])) offsets.push(i);
  }
  assert.equal(offsets.length, source.indices.length);
  const boundaries = [];
  for (let i = 1; i < offsets.length; i++) {
    if (chars.slice(offsets[i - 1] + 1, offsets[i])
      .some(character => CHOICE.includes(character))) {
      boundaries.push(i - 1);
    }
  }
  const runes = source.indices;
  const repeats = runes.slice(1).filter(
    (rune, i) => rune === runes[i]).length;
  return {page: pageNumber, runes, boundaries, repeats};
}

/**
 * Decode both the original GP ciphertext and the original printed boundaries.
 * The original boundary rank modulo Q is an explicitly defined side channel;
 * the quotient is an independently supplied salt carried by the source layout.
 *
 * @param {{runes:number[],boundaries:number[]}} page
 * @param {number} limit
 * @returns {{valid:boolean,plain:number[]|null,rank:bigint,Q:bigint,salt:bigint,capacity:bigint}}
 */
function decode(page, limit) {
  const n = page.runes.length;
  const {rank, capacity} = rankCipher(page.runes, limit);
  const total = 29n ** BigInt(n);
  const Q = (total + capacity - 1n) / capacity;
  const layoutRank = rankBoundaries(page.boundaries);
  assert(layoutRank < choose(n - 1, page.boundaries.length));
  const sideDigit = layoutRank % Q;
  const salt = layoutRank / Q;
  const plaintextInteger = sideDigit * capacity + rank;
  const valid = plaintextInteger < total;
  return {
    valid, plain: valid ? fromBase29(plaintextInteger, n) : null,
    rank, Q, salt, capacity
  };
}

/**
 * Encode any native GP29 plaintext with exact page length and boundary count.
 * The salt is required external state for reproducing a particular layout.
 *
 * @param {number[]} plain
 * @param {number} limit
 * @param {number} boundaryCount
 * @param {bigint} salt
 * @returns {{runes:number[],boundaries:number[]}}
 */
function encode(plain, limit, boundaryCount, salt) {
  const n = plain.length;
  const capacity = 29n * completions(n - 1, limit)[n - 1][limit];
  const Q = (29n ** BigInt(n) + capacity - 1n) / capacity;
  const integer = asBase29(plain);
  const side = integer / capacity;
  const rank = integer % capacity;
  assert(side < Q);
  const layoutRank = salt * Q + side;
  assert(layoutRank < choose(n - 1, boundaryCount));
  return {
    runes: unrankCipher(rank, n, limit),
    boundaries: unrankBoundaries(layoutRank, n - 1, boundaryCount)
  };
}

assert.equal(segments.length, 55);
const original = segments.map((segment, i) =>
  sourcePage(i < 50 ? i : i + 1, segment));
assert.equal(original.reduce((sum, p) => sum + p.runes.length, 0), 12956);
assert.equal(original.reduce((sum, p) => sum + p.repeats, 0), 86);
assert.equal(original.reduce((sum, p) => sum + p.boundaries.length, 0), 2873);
assert(original.every(p => p.repeats <= 5));

const clearP57 = corpus.pages.find(page => page.page === 57).indices;
assert.equal(clearP57.length, 95);
const originalCandidates = [];
const positiveNative = [];
const selected = [];
let movedBoundaries = 0;
for (const page of original) {
  const decoded = decode(page, page.repeats);
  assert(decoded.valid, "original must decode under its observed repeat cap");
  const recovered = encode(decoded.plain, page.repeats,
    page.boundaries.length, decoded.salt);
  assert.deepEqual(recovered, {
    runes: page.runes, boundaries: page.boundaries
  }, "original rune+boundary round trip");

  originalCandidates.push(...decoded.plain);
  const planted = Array.from({length: page.runes.length},
    (_, i) => clearP57[i % clearP57.length]);
  const encodedPlant = encode(planted, page.repeats,
    page.boundaries.length, decoded.salt);
  const decodedPlant = decode(encodedPlant, page.repeats);
  assert(decodedPlant.valid);
  assert.deepEqual(decodedPlant.plain, planted, "source-native plant");
  assert.equal(decodedPlant.salt, decoded.salt, "salt invariant");
  positiveNative.push(...planted);
  movedBoundaries += page.boundaries.filter(
    (gap, i) => gap !== encodedPlant.boundaries[i]).length;

  if ([0, 23, 36, 54, 55].includes(page.page)) {
    selected.push({
      page: page.page,
      runes: page.runes.length,
      repeats: page.repeats,
      boundaryGaps: page.boundaries.length,
      Q: decoded.Q.toString(),
      prefix: decoded.plain.slice(0, 40)
        .map(rune => corpus.translit[rune]).join("")
    });
  }
}
assert.equal(originalCandidates.length, 12956);
assert.equal(positiveNative.length, 12956);
assert.equal(movedBoundaries, 144);
const originalIoc = coincidence(originalCandidates);
const plantedIoc = coincidence(positiveNative);
assert(Math.abs(originalIoc - 0.03444723815987824) < 1e-12);
assert(Math.abs(plantedIoc - 0.07171027694721642) < 1e-12);

// Independent, common five-exception bound: a single bound for every physical
// page, anchored only conjecturally by the manuscript's repeated five-dot art.
// The eight impossible pages are an exact structural failure of this codec,
// before any language or key selection.
const invalidFive = [];
const validFivePlain = [];
for (const page of original) {
  const decoded = decode(page, 5);
  if (!decoded.valid) {
    invalidFive.push(page.page);
  } else {
    validFivePlain.push(...decoded.plain);
  }
}
assert.deepEqual(invalidFive, [10, 22, 30, 36, 39, 51, 53, 54]);
const fiveIoc = coincidence(validFivePlain);
assert(Math.abs(fiveIoc - 0.034461304791258446) < 1e-12);

console.log(JSON.stringify({
  source: {
    pages: original.length,
    unknownRunes: originalCandidates.length,
    repeats: 86,
    printedBoundaryGaps: 2873
  },
  perPageObservedRepeatCap: {
    completeOriginalReencryption: true,
    completeNativeP57PlantRecovery: true,
    nativePlantRuneCount: positiveNative.length,
    movedPrintedBreakPositionsInPlant: movedBoundaries,
    originalCandidateIoC: originalIoc,
    nativePlantIoC: plantedIoc,
    selectedOriginalDecodedPrefixes: selected
  },
  fixedFiveRepeatCap: {
    invalidOriginalPages: invalidFive,
    validOriginalPages: original.length - invalidFive.length,
    IoCOnValidPagesOnly: fiveIoc
  },
  conclusion: "The source-visible word boundaries have sufficient side-channel capacity; this natural enumerative cipher is reversible but its exact original decode is uniformly distributed, and the single global five-repeat variant is structurally impossible on eight original pages. Neither operation nor key has a first-party selector; no new plaintext."
}, null, 2));
