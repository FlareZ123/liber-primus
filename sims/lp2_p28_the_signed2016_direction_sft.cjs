"use strict";

/**
 * SFT for the p28 THE -> signed-2016 word-position bridge.
 *
 * The test reconstructs the calibrated p28 DH state and the source-local
 * HERE -> THE endpoint prediction, then opens the authenticated 2016
 * clear-signed body. It charges a finite state-template family before
 * interpreting the words that follow the selected THE tokens.
 *
 * Node.js 22, CommonJS, read-only, no third-party dependencies.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const parts = transcription.split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

const mod = (value, modulus) => ((value % modulus) + modulus) % modulus;

/** @param {number} base @param {number} exponent @param {number} modulus */
function modPow(base, exponent, modulus) {
  let result = 1 % modulus;
  let x = mod(base, modulus);
  let e = exponent;
  while (e > 0) {
    if (e & 1) result = (result * x) % modulus;
    x = (x * x) % modulus;
    e = Math.floor(e / 2);
  }
  return result;
}

/** @param {number} a @param {number} b */
function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

/** @param {number} value @param {number} modulus */
function inverse(value, modulus) {
  if (gcd(value, modulus) !== 1) return null;
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if ((value * candidate) % modulus === 1) return candidate;
  }
  return null;
}

/** @param {string} text @returns {number[]} */
function values(text) {
  return [...text]
    .map((char) => runeIndex.get(char))
    .filter((value) => value !== undefined);
}

/** @param {string} line @returns {number[][]} */
function fragments(line) {
  return line
    .split(/[-.]/u)
    .map(values)
    .filter((fragment) => fragment.length > 0);
}

/** @param {number[]} fragment @returns {number[]} */
function outerH(fragment) {
  if (fragment.length < 2) return [];
  return [
    mod(fragment[0] - fragment.at(-1), 29),
    mod(fragment[0] + fragment.at(-1), 29),
  ];
}

/** @param {[number,number]} pair @returns {[number,number]} */
function hPair(pair) {
  return [mod(pair[0] - pair[1], 29), mod(pair[0] + pair[1], 29)];
}

/** @param {[number,number]} pair @returns {[number,number]} */
function hInverse(pair) {
  const inv2 = 15;
  return [
    mod((pair[0] + pair[1]) * inv2, 29),
    mod((pair[1] - pair[0]) * inv2, 29),
  ];
}

/** @param {number[]} vector */
function transliterate(vector) {
  return vector.map((value) => corpus.translit[value]).join("");
}

/** @param {number} n @param {number} k */
function choose(n, k) {
  let result = 1;
  for (let i = 1; i <= k; i += 1) {
    result = (result * (n - k + i)) / i;
  }
  return result;
}

/**
 * Return all unique permutations of a short multiset.
 * @param {number[]} input
 * @returns {number[][]}
 */
function uniquePermutations(input) {
  const out = [];
  const used = Array(input.length).fill(false);
  const sorted = [...input].sort((a, b) => a - b);

  /** @param {number[]} current */
  function visit(current) {
    if (current.length === sorted.length) {
      out.push([...current]);
      return;
    }
    for (let i = 0; i < sorted.length; i += 1) {
      if (used[i]) continue;
      if (i > 0 && sorted[i] === sorted[i - 1] && !used[i - 1]) continue;
      used[i] = true;
      current.push(sorted[i]);
      visit(current);
      current.pop();
      used[i] = false;
    }
  }

  visit([]);
  return out;
}

/*
 * Reconstruct the target p28 state from the physical literal-DH line.
 */
const p28Lines = parts[28].trim().split("/");
const dhFragments = fragments(p28Lines[5]);
assert.equal(dhFragments.length, 5);
assert.equal(transliterate(dhFragments[0]), "DH");

const hStream = dhFragments.flatMap(outerH);
assert.deepEqual(hStream, [15, 2, 14, 4, 12, 12, 23, 12, 8, 19]);

const g = dhFragments.length;
const a = 6;
const b = hStream[0];
const K = hStream[1];
const primes = new Set([2, 3, 5, 7, 11, 13, 17, 19, 23]);
const candidates = [];

for (const p of new Set(hStream)) {
  if (!primes.has(p) || g >= p || b >= p) continue;
  const A = modPow(g, a, p);
  const B = modPow(g, b, p);
  const shared = modPow(A, b, p);
  if (shared !== K || shared !== modPow(B, a, p)) continue;
  if (!hStream.includes(A) || !hStream.includes(B)) continue;
  candidates.push({ p, g, a, b, A, B, K });
}

assert.deepEqual(candidates, [{
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
}]);

const state = { ...candidates[0], e: inverse(b, 22) };
assert.equal(state.e, 3);

/*
 * Recheck the independent local THE endpoint prediction so the cross-source
 * bridge never assumes an unverified English token.
 */
const firstLine = fragments(p28Lines[0]);
assert.ok(firstLine.length >= 2);
const firstEndpoints = /** @type {[number,number]} */ ([
  firstLine[0][0],
  firstLine[0].at(-1),
]);
const secondEndpoints = /** @type {[number,number]} */ ([
  firstLine[1][0],
  firstLine[1].at(-1),
]);

const firstH = hPair(firstEndpoints);
const secondH = hPair(secondEndpoints);
assert.deepEqual(firstH, [state.A, state.p - state.g]);
assert.deepEqual(secondH, [
  mod(state.A * state.b, 29),
  state.p - state.g,
]);
assert.deepEqual(firstH, [8, 18]);
assert.deepEqual(secondH, [4, 18]);

const thirdH = [
  mod(secondH[0] * state.b, 29),
  secondH[1],
];
assert.deepEqual(thirdH, [state.K, state.p - state.g]);
assert.equal(transliterate(thirdH), "THE");

const predictedEndpoints = hInverse(/** @type {[number,number]} */ (thirdH));
assert.deepEqual(predictedEndpoints, [10, 8]);

const p28EndpointHits = [];
for (let lineIndex = 0; lineIndex < p28Lines.length; lineIndex += 1) {
  const lineFragments = fragments(p28Lines[lineIndex]);
  for (let fragmentIndex = 0; fragmentIndex < lineFragments.length; fragmentIndex += 1) {
    const fragment = lineFragments[fragmentIndex];
    if (fragment.length < 2) continue;
    if (
      fragment[0] === predictedEndpoints[0] &&
      fragment.at(-1) === predictedEndpoints[1]
    ) {
      p28EndpointHits.push({
        line: lineIndex + 1,
        fragment: fragmentIndex + 1,
        length: fragment.length,
        values: fragment,
      });
    }
  }
}

assert.deepEqual(p28EndpointHits, [{
  line: 7,
  fragment: 3,
  length: 5,
  values: [10, 18, 13, 28, 8],
}]);

/*
 * Parse only the authenticated cleartext body. The hexadecimal key ID is not
 * a natural-language token and is removed before alphabetic word tokenizing.
 */
const clearStart = signed2016.indexOf("Hash: SHA1");
const signatureStart = signed2016.indexOf("-----BEGIN PGP SIGNATURE-----");
assert.ok(clearStart >= 0 && signatureStart > clearStart);

let clearBody = signed2016.slice(clearStart + "Hash: SHA1".length, signatureStart);
clearBody = clearBody.replace(/\b7A35090F\b/g, "");
const signedWords = clearBody.match(/[A-Za-z]+/g) || [];
const lowerWords = signedWords.map((word) => word.toLowerCase());

assert.equal(signedWords.length, 43);

const thePositions = [];
for (let i = 0; i < lowerWords.length; i += 1) {
  if (lowerWords[i] === "the") thePositions.push(i + 1);
}

assert.deepEqual(thePositions, [2, 8, 13, 18, 23, 29]);

const theFollowers = thePositions.map((position) =>
  signedWords[position].toUpperCase()
);
assert.deepEqual(theFollowers, [
  "PATH",
  "DEVOTED",
  "WAY",
  "MAP",
  "ROAD",
  "DIRECTION",
]);

/*
 * Fixed state route:
 *   start at K;
 *   use a as the two boundary steps;
 *   use g exactly e times in the middle.
 *
 * The target route is symmetric: a,g,g,g,a.
 */
const targetSteps = [
  state.a,
  ...Array(state.e).fill(state.g),
  state.a,
];
assert.deepEqual(targetSteps, [6, 5, 5, 5, 6]);

const generatedPositions = [state.K];
for (const step of targetSteps) {
  generatedPositions.push(generatedPositions.at(-1) + step);
}

assert.deepEqual(generatedPositions, thePositions);
assert.equal(generatedPositions.at(-1), corpus.runes.length);
assert.equal(corpus.runes.length, 29);

/*
 * The last four THE positions also equal a compact state/modulus chain that
 * was already present in the p28 receiver checksum.
 */
assert.deepEqual(thePositions.slice(2), [
  state.b - state.K,
  state.p - state.g,
  state.p,
  corpus.runes.length,
]);
assert.deepEqual(theFollowers.slice(2), [
  "WAY",
  "MAP",
  "ROAD",
  "DIRECTION",
]);

/*
 * Charge the route family before interpreting the follower words.
 *
 * Starts:
 *   every calibrated DH field, e, and the GP29 modulus.
 *
 * Step roles:
 *   either a is the two boundary steps and g is repeated e times,
 *   or g is the boundary value and a is repeated e times.
 *
 * Order:
 *   all unique placements of the two boundary steps among five steps.
 *
 * Direction:
 *   forward and reverse signed-word order.
 *
 * Compare position SETS so the K->29 and 29->K descriptions count as the
 * same structural hit.
 */
const starts = {
  p: state.p,
  g: state.g,
  a: state.a,
  b: state.b,
  A: state.A,
  B: state.B,
  K: state.K,
  e: state.e,
  mod29: corpus.runes.length,
};

const rolePairs = [
  ["a", "g"],
  ["g", "a"],
];

const validDescriptions = [];
const templateSets = new Map();
const repeatedTokenDescriptions = [];

for (const [boundaryName, innerName] of rolePairs) {
  const boundary = state[boundaryName];
  const inner = state[innerName];
  const stepPermutations = uniquePermutations([
    boundary,
    boundary,
    ...Array(state.e).fill(inner),
  ]);
  assert.equal(stepPermutations.length, 10);

  for (const [startName, start] of Object.entries(starts)) {
    for (const direction of [1, -1]) {
      for (const steps of stepPermutations) {
        const positions = [start];
        for (const step of steps) {
          positions.push(positions.at(-1) + direction * step);
        }
        if (
          Math.min(...positions) < 1 ||
          Math.max(...positions) > signedWords.length
        ) continue;

        validDescriptions.push({
          boundaryName,
          innerName,
          startName,
          direction,
          steps,
          positions,
        });

        const setKey = [...positions].sort((x, y) => x - y).join(",");
        if (!templateSets.has(setKey)) templateSets.set(setKey, []);
        templateSets.get(setKey).push({
          boundaryName,
          innerName,
          startName,
          direction,
          steps,
          positions,
        });

        const selected = positions.map((position) => lowerWords[position - 1]);
        if (new Set(selected).size === 1) {
          repeatedTokenDescriptions.push({
            boundaryName,
            innerName,
            startName,
            direction,
            steps,
            positions,
            token: selected[0],
          });
        }
      }
    }
  }
}

assert.equal(validDescriptions.length, 140);
assert.equal(templateSets.size, 130);
assert.deepEqual(repeatedTokenDescriptions, [
  {
    boundaryName: "a",
    innerName: "g",
    startName: "K",
    direction: 1,
    steps: [6, 5, 5, 5, 6],
    positions: [2, 8, 13, 18, 23, 29],
    token: "the",
  },
  {
    boundaryName: "a",
    innerName: "g",
    startName: "mod29",
    direction: -1,
    steps: [6, 5, 5, 5, 6],
    positions: [29, 23, 18, 13, 8, 2],
    token: "the",
  },
]);

const repeatedPositionSets = new Set(
  repeatedTokenDescriptions.map(({ positions }) =>
    [...positions].sort((x, y) => x - y).join(",")
  )
);
assert.deepEqual([...repeatedPositionSets], ["2,8,13,18,23,29"]);

/*
 * Exact fixed-multiset null for the already fixed target token THE:
 * there are exactly six THE tokens among 43 words. Under a uniform random
 * permutation preserving the word multiset, their six-position set is
 * uniform over C(43,6). The charged family contains 130 distinct in-range
 * position sets.
 */
const positionSets = choose(43, 6);
assert.equal(positionSets, 6096454);
const familywiseRate = templateSets.size / positionSets;
assert.ok(Math.abs(familywiseRate - 0.000021323871220876924) < 1e-15);

console.log(JSON.stringify({
  status: "PASS",
  p28: {
    state,
    hereH: [firstH, secondH],
    predictedTheH: thirdH,
    predictedEndpoints,
    recipient: p28EndpointHits[0],
  },
  signed2016: {
    wordCount: signedWords.length,
    thePositions,
    theFollowers,
    generatedPositions,
    targetSteps,
    lastFourStatePositions: [
      state.b - state.K,
      state.p - state.g,
      state.p,
      corpus.runes.length,
    ],
  },
  chargedFamily: {
    starts,
    rolePairs,
    validDescriptions: validDescriptions.length,
    distinctPositionSets: templateSets.size,
    repeatedTokenDescriptions,
    exactPermutationNull: {
      totalSixPositionSets: positionSets,
      chargedHitSets: templateSets.size,
      upperTailRate: familywiseRate,
      reciprocal: 1 / familywiseRate,
    },
  },
  classification:
    "Strong retrospective cross-source bridge: the independently calibrated p28 state plus GP29 modulus generates exactly the six authenticated 2016 THE positions, whose followers are PATH DEVOTED WAY MAP ROAD DIRECTION. The fixed 130-set charged family has one repeated-token position set. This authenticates a source relationship more strongly than a semantic coincidence, but it does not yet specify a new unknown-page cipher or downstream consumer.",
}, null, 2));
