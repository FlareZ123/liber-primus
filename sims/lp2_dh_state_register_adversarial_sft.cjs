"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

function clearSignedBody(relativePath) {
  const normalized = read(relativePath).replace(/\r\n/gu, "\n");
  const bodyStart = normalized.indexOf("\n\n");
  const signatureStart = normalized.indexOf("-----BEGIN PGP SIGNATURE-----");
  assert(bodyStart >= 0 && signatureStart > bodyStart, "Expected an OpenPGP clear-signed source: " + relativePath);
  return normalized.slice(bodyStart + 2, signatureStart);
}

function alphabeticWords(body) {
  const cleaned = body
    .replace(/\b7A35090F\b/giu, " ")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/giu, " ")
    .replace(/https?:\/\/\S+/giu, " ");
  return (cleaned.match(/[A-Za-z]+/gu) || []).map((word) => word.toUpperCase());
}

function base29Digits(value) {
  const digits = [];
  let n = value;
  while (n > 0) {
    digits.unshift(n % 29);
    n = Math.floor(n / 29);
  }
  return digits.length ? digits : [0];
}

function mod(value, modulus) {
  return ((value % modulus) + modulus) % modulus;
}

function gcd(a, b) {
  let x = a;
  let y = b;
  while (y !== 0) {
    const next = x % y;
    x = y;
    y = next;
  }
  return x;
}

function inverse(value, modulus) {
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if ((value * candidate) % modulus === 1) return candidate;
  }
  return null;
}

function isPrime(value) {
  if (!Number.isInteger(value) || value < 2) return false;
  for (let divisor = 2; divisor * divisor <= value; divisor += 1) {
    if (value % divisor === 0) return false;
  }
  return true;
}

function modPow(base, exponent, modulus) {
  let result = 1;
  let factor = base % modulus;
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = (result * factor) % modulus;
    factor = (factor * factor) % modulus;
    power = Math.floor(power / 2);
  }
  return result;
}

function primeFactors(value) {
  let n = value;
  const factors = [];
  for (let divisor = 2; divisor * divisor <= n; divisor += 1) {
    if (n % divisor !== 0) continue;
    factors.push(divisor);
    while (n % divisor === 0) n /= divisor;
  }
  if (n > 1) factors.push(n);
  return factors;
}

function uniquePermutations(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  const keys = [...counts.keys()].sort((a, b) => a - b);
  const result = [];
  const current = [];

  function visit() {
    if (current.length === values.length) {
      result.push([...current]);
      return;
    }
    for (const key of keys) {
      const remaining = counts.get(key);
      if (remaining === 0) continue;
      counts.set(key, remaining - 1);
      current.push(key);
      visit();
      current.pop();
      counts.set(key, remaining);
    }
  }

  visit();
  return result;
}

function factorial(n) {
  let result = 1;
  for (let i = 2; i <= n; i += 1) result *= i;
  return result;
}

// Reconstruct state from the original three-square metadata, not a hard-coded tuple.
const squareText = read("resources/cicada2014-openpuff-magic-squares.txt").replace(/\r\n/gu, "\n");
const squares = squareText.trim().split(/\n\s*\n/gu).map((group) =>
  group.trim().split("\n").map((line) => line.trim().split(/\s+/u).map(Number))
);
assert.equal(squares.length, 3);
const squareInfo = squares.map((square) => {
  assert(square.every((row) => row.length === square.length), "Each source square must be square");
  const rowSums = square.map((row) => row.reduce((sum, value) => sum + value, 0));
  assert.equal(new Set(rowSums).size, 1, "Each source square must have a constant row sum");
  return {
    order: square.length,
    magicSum: rowSums[0],
    center: square[Math.floor(square.length / 2)][Math.floor(square.length / 2)],
  };
});
assert.deepEqual(squareInfo, [
  {order: 5, magicSum: 3301, center: 809},
  {order: 7, magicSum: 1033, center: 331},
  {order: 5, magicSum: 1033, center: 91},
]);

const smallerOrder = squareInfo[2].order;
const largerOrder = squareInfo[1].order;
const center91Digits = base29Digits(squareInfo[2].center);
const center331Digits = base29Digits(squareInfo[1].center);
const sum1033Digits = base29Digits(squareInfo[1].magicSum);
assert.deepEqual(center91Digits, [3, 4]);
assert.deepEqual(center331Digits, [11, 12]);
assert.deepEqual(sum1033Digits, [1, 6, 18]);

const state = {
  g: smallerOrder,
  K: largerOrder - smallerOrder,
  e: center91Digits[0],
  q: center91Digits[1],
  A: center331Digits[0] - center91Digits[0],
  a: sum1033Digits[1],
  B: 0,
  p: 0,
  b: 0,
};
assert.equal(center331Digits[1] - center91Digits[1], state.A);
state.B = mod(state.A - sum1033Digits[2], 29);

const modulusCandidates = primeFactors(state.g ** state.a - state.A)
  .filter((candidate) => isPrime(candidate) && candidate > state.B && gcd(state.e, candidate - 1) === 1);
assert.deepEqual(modulusCandidates, [23]);
state.p = modulusCandidates[0];
state.b = inverse(state.e, state.p - 1);
assert.equal(state.b, 15);
assert.equal(state.q, state.e + 1);
assert.equal(modPow(state.g, state.a, state.p), state.A);
assert.equal(modPow(state.g, state.b, state.p), state.B);
assert.equal(modPow(state.A, state.b, state.p), state.K);
assert.equal(modPow(state.B, state.a, state.p), state.K);
assert.equal((state.b * state.e) % (state.p - 1), 1);
assert.deepEqual(state, {p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3, q: 4});

const u = state.q - state.e;
const t = state.g + state.K;
const axis = [u, state.K, state.e, state.q, state.g, state.a, t, state.A];
assert.deepEqual(axis, [1, 2, 3, 4, 5, 6, 7, 8]);

// The exact proposed grammar, retained as an arithmetic reproduction rather than accepted as an authored selector.
const firstSix = axis.slice(0, 6);
const fourOffsets = [0, u, state.K, state.e];
const nineOffsets = [0, ...axis];
const blocks = [
  [0],
  axis,
  firstSix.map((offset) => state.A + offset),
  [state.b, 2 * state.A, 2 * state.A + u, 2 * state.A + state.K],
  fourOffsets.map((offset) => state.B + offset),
  nineOffsets.map((offset) => state.p + offset),
  firstSix.map((offset) => state.p + state.A + offset),
  fourOffsets.map((offset) => 2 * state.B + offset),
  [state.B + state.p],
];
const blockLengths = blocks.map((block) => block.length);
const blockBounds = [0];
for (const length of blockLengths) blockBounds.push(blockBounds[blockBounds.length - 1] + length);
const indices = blocks.flat();
assert.equal(indices.length, 43);
assert.deepEqual(indices, Array.from({length: 43}, (_, index) => index));
assert.deepEqual(blockLengths, [1, 8, 6, 4, 4, 9, 6, 4, 1]);
assert.deepEqual(blockBounds, [0, 1, 9, 15, 19, 23, 32, 38, 42, 43]);

const targetBody = clearSignedBody("resources/historical/cicada2016-4gq25-outguess.asc")
  .replace(/\b7A35090F\b/giu, " ");
const targetWords = alphabeticWords(targetBody);
assert.equal(targetWords.length, 43);

const anchors = [
  {expression: "g", position: state.g, word: "EPIPHANY"},
  {expression: "a", position: state.a, word: "SEEKS"},
  {expression: "A+g", position: state.A + state.g, word: "WAY"},
  {expression: "b", position: state.b, word: "WORDS"},
  {expression: "B", position: state.B, word: "THEIR"},
  {expression: "p", position: state.p, word: "ROAD"},
  {expression: "p+a", position: state.p + state.a, word: "DIRECTION"},
  {expression: "B+p", position: state.B + state.p, word: "OPENPGP"},
];
const directAnchorResults = anchors.map((anchor) => ({
  ...anchor,
  actual: targetWords[anchor.position],
  hit: targetWords[anchor.position] === anchor.word,
}));
assert(directAnchorResults.every((result) => result.hit));
assert.equal(directAnchorResults.length, 8);

const phraseBlocks = [
  {start: 1, words: "THE PATH LIES EMPTY EPIPHANY SEEKS THE DEVOTED".split(" ")},
  {start: 19, words: "THEIR MEANING IS THE ROAD".split(" ")},
  {start: 23, words: "ROAD AND THEIR NUMBERS ARE THE DIRECTION".split(" ")},
  {start: 38, words: "BEWARE FALSE PATHS VERIFY OPENPGP".split(" ")},
];

const punctuationTokens = [...targetBody.matchAll(/[A-Za-z]+[.,;:!?]?/gu)].map((match) => match[0]);
assert.equal(punctuationTokens.length, 43);
const punctuationBoundaries = new Set([0, punctuationTokens.length]);
punctuationTokens.forEach((token, index) => {
  if (/[.,;:!?]$/u.test(token)) punctuationBoundaries.add(index + 1);
});
const sortedPunctuationBoundaries = [...punctuationBoundaries].sort((a, b) => a - b);
assert.deepEqual(sortedPunctuationBoundaries, [0, 1, 5, 9, 14, 19, 24, 30, 36, 38, 41, 43]);

const allBlockLengthOrders = uniquePermutations(blockLengths);
assert.equal(allBlockLengthOrders.length, 15120);
const partitionHistogram = {};
for (const permutation of allBlockLengthOrders) {
  let cursor = 0;
  const boundaries = new Set([0]);
  for (const length of permutation) {
    cursor += length;
    boundaries.add(cursor);
  }
  const matches = [...boundaries].filter((boundary) => punctuationBoundaries.has(boundary)).length;
  partitionHistogram[matches] = (partitionHistogram[matches] || 0) + 1;
}
const proposedPunctuationMatches = [...new Set(blockBounds)]
  .filter((boundary) => punctuationBoundaries.has(boundary)).length;
const maximumPunctuationMatches = Math.max(...Object.keys(partitionHistogram).map(Number));
assert.equal(proposedPunctuationMatches, 6);
assert.equal(maximumPunctuationMatches, 8);
assert.equal(partitionHistogram[8], 8);
assert.equal(partitionHistogram[7], 150);
assert.equal(partitionHistogram[6], 913);

function directAnchorCount(candidateState) {
  const positions = [
    [candidateState.g, "EPIPHANY"],
    [candidateState.a, "SEEKS"],
    [candidateState.A + candidateState.g, "WAY"],
    [candidateState.b, "WORDS"],
    [candidateState.B, "THEIR"],
    [candidateState.p, "ROAD"],
    [candidateState.p + candidateState.a, "DIRECTION"],
    [candidateState.B + candidateState.p, "OPENPGP"],
  ];
  return positions.filter(([position, word]) =>
    Number.isInteger(position) && position >= 0 && position < targetWords.length && targetWords[position] === word
  ).length;
}

function isValidDHState(candidateState) {
  const p = candidateState.p;
  if (!isPrime(p) || p <= Math.max(
    candidateState.g, candidateState.a, candidateState.b,
    candidateState.A, candidateState.B, candidateState.K
  )) return false;
  if (candidateState.e <= 0 || candidateState.e >= p - 1) return false;
  return modPow(candidateState.g, candidateState.a, p) === candidateState.A
    && modPow(candidateState.g, candidateState.b, p) === candidateState.B
    && modPow(candidateState.A, candidateState.b, p) === candidateState.K
    && modPow(candidateState.B, candidateState.a, p) === candidateState.K
    && (candidateState.b * candidateState.e) % (p - 1) === 1
    && candidateState.q === candidateState.e + 1;
}

const roleNames = ["p", "g", "a", "b", "A", "B", "K", "e", "q"];
const roleValues = roleNames.map((role) => state[role]);
const roleAnchorHistogram = {};
let positive43Assignments = 0;
let dhValidAssignments = 0;
let sevenOfEightWrongTuple = null;

function visitRolePermutations(current, used) {
  if (current.length === roleNames.length) {
    const candidateState = Object.fromEntries(roleNames.map((role, index) => [role, current[index]]));
    const candidateU = candidateState.q - candidateState.e;
    const impliedLength = 3 * candidateU + 2 * candidateState.A + 2 * candidateState.a + 3 * candidateState.q;
    if (candidateU > 0 && candidateState.A > 0 && candidateState.a > 0
        && candidateState.q > 0 && impliedLength === 43) {
      positive43Assignments += 1;
      const hits = directAnchorCount(candidateState);
      roleAnchorHistogram[hits] = (roleAnchorHistogram[hits] || 0) + 1;
      if (hits === 7) sevenOfEightWrongTuple = candidateState;
    }
    if (isValidDHState(candidateState)) dhValidAssignments += 1;
    return;
  }
  for (let index = 0; index < roleValues.length; index += 1) {
    if (used[index]) continue;
    used[index] = true;
    current.push(roleValues[index]);
    visitRolePermutations(current, used);
    current.pop();
    used[index] = false;
  }
}
visitRolePermutations([], Array(roleValues.length).fill(false));
assert.equal(factorial(9), 362880);
assert.equal(positive43Assignments, 720);
assert.equal(dhValidAssignments, 1);
assert.equal(roleAnchorHistogram[8], 1);
assert.equal(roleAnchorHistogram[7], 1);
assert.equal(roleAnchorHistogram[6], 2);

const controlPaths = [
  "resources/historical/cicada2013-welcome-and-congratulations.asc",
  "resources/external/2013-do-not-share-this-information-2.asc",
];
const controlResults = controlPaths.map((relativePath) => {
  const words = alphabeticWords(clearSignedBody(relativePath));
  let maxAnchorHits = 0;
  let exactBlockWindowHits = 0;
  const anchorHistogram = {};
  const windowCount = Math.max(0, words.length - 42);
  for (let start = 0; start + 43 <= words.length; start += 1) {
    const hits = anchors.filter((anchor) => words[start + anchor.position] === anchor.word).length;
    anchorHistogram[hits] = (anchorHistogram[hits] || 0) + 1;
    maxAnchorHits = Math.max(maxAnchorHits, hits);
    if (phraseBlocks.some((block) =>
      block.words.every((word, offset) => words[start + block.start + offset] === word)
    )) exactBlockWindowHits += 1;
  }
  return {source: relativePath, wordCount: words.length, windowCount, maxAnchorHits, anchorHistogram, exactBlockWindowHits};
});
assert.deepEqual(controlResults.map((result) => [result.wordCount, result.windowCount, result.maxAnchorHits, result.exactBlockWindowHits]), [
  [233, 191, 1, 0],
  [403, 361, 1, 0],
]);

const zeroBasedValid = indices.every((index) => index >= 0 && index < targetWords.length);
const oneBasedDirectValidCount = indices.filter((ordinal) => ordinal >= 1 && ordinal <= targetWords.length).length;
assert.equal(zeroBasedValid, true);
assert.equal(oneBasedDirectValidCount, 42);

const result = {
  status: "PASS",
  classification: "state and direct anchors survive; full block partition is retrospective and not source-selected",
  squareMetadata: squareInfo,
  base29: {center91: center91Digits, center331: center331Digits, sum1033: sum1033Digits},
  reconstructedState: state,
  stateAxis: axis,
  targetWordCount: targetWords.length,
  directAnchors: directAnchorResults,
  fullBlockGrammar: {lengths: blockLengths, boundaries: blockBounds, exactCoverage: true},
  punctuationPartitionAudit: {
    sourceBoundaries: sortedPunctuationBoundaries,
    proposedBoundaryMatches: proposedPunctuationMatches,
    permutationsOfSameLengthMultiset: allBlockLengthOrders.length,
    partitionHistogram,
    maximumPunctuationMatches,
  },
  rolePermutationAudit: {
    assignments: factorial(9),
    positiveAssignmentsWith43Length: positive43Assignments,
    DHValidAssignments: dhValidAssignments,
    directAnchorHitHistogram: roleAnchorHistogram,
    sevenOfEightWrongTuple,
  },
  axisOrderAudit: {possibleFieldOrders: factorial(8), ascendingOrders: 1},
  otherAuthenticated2013Windows: controlResults,
  totalControlWindows: controlResults.reduce((sum, resultItem) => sum + resultItem.windowCount, 0),
  wordOrigin: {zeroBasedFullCover: zeroBasedValid, oneBasedDirectValidPositions: oneBasedDirectValidCount},
  holdout: {
    status: "NOT_BLIND",
    reason: "The complete 2016 signed text and proposed 0..42 table were already present in the repository before this audit; the existing full-message SFT is retrospective, not a genuine held-out prediction.",
  },
};

assert.equal(result.totalControlWindows, 552);
console.log(JSON.stringify(result, null, 2));
