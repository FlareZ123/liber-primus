"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(
  fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8")
);
const transcription = fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-transcription.txt"),
  "utf8"
).replace(/\r/g, "");
const ink = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, "resources/liber-primus/lp2-p0-physical-ink-override.json"),
    "utf8"
  )
);

const runeToValue = new Map(corpus.runes.map((rune, value) => [rune, value]));
const gpPrime = corpus.prime;
const gpName = corpus.translit;

function powMod(base, exponent, modulus) {
  let result = 1;
  let x = base % modulus;
  let e = exponent;
  while (e > 0) {
    if (e & 1) result = (result * x) % modulus;
    x = (x * x) % modulus;
    e >>= 1;
  }
  return result;
}

function discreteLog(base, target, modulus) {
  let value = 1;
  for (let exponent = 0; exponent < modulus - 1; exponent += 1) {
    if (value === target) return exponent;
    value = (value * base) % modulus;
  }
  return null;
}

function segmentValues(segment) {
  const out = [];
  for (const character of [...transcription.split(/^\s*%\s*$/m)[segment]]) {
    const value = runeToValue.get(character);
    if (value !== undefined) out.push(value);
  }
  return out;
}

function parseCanonicalUnsolvedWords() {
  const text = transcription.split("%").slice(0, 55).join("%");
  const words = [];
  let position = 0;
  let start = 0;
  let token = [];

  function flush(separator = "") {
    if (!token.length) return;
    words.push({
      start,
      end: position - 1,
      indices: token.slice(),
      separator,
    });
    token = [];
  }

  for (const character of text) {
    if (runeToValue.has(character)) {
      if (!token.length) start = position;
      token.push(runeToValue.get(character));
      position += 1;
    } else if (
      character !== "%" &&
      character !== "/" &&
      !/\s/u.test(character)
    ) {
      flush(character);
    }
  }
  flush();

  assert.equal(position, 12956);
  assert.equal(words.length, 2896);
  return words;
}

const state = Object.freeze({
  K: 2,
  e: 3,
  q: 4,
  g: 5,
  a: 6,
  A: 8,
  b: 15,
  B: 19,
  p: 23,
});

const p32 = segmentValues(32);
assert.equal(p32.length, 121);
assert.deepEqual([p32[32], p32[33]], [state.K, state.A]);

const coordinateOffset = state.K * 11 + state.A;
assert.equal(coordinateOffset, 30);
assert.equal(p32[coordinateOffset], 0);

const oneBasedOffset = (state.K - 1) * 11 + (state.A - 1);
assert.equal(oneBasedOffset, 18);
assert.equal(p32[oneBasedOffset], 10);

const home = [8, 3, 19, 18];
assert.deepEqual(p32.slice(33, 37), home);
assert.equal(
  home.map((value) => gpName[value]).join(""),
  "HOME"
);

const parts = transcription.split(/^\s*%\s*$/m);
const homeHits = [];
for (let segment = 0; segment < 55; segment += 1) {
  const page = segment >= 50 ? segment + 1 : segment;
  const values = [];
  for (const character of [...parts[segment]]) {
    const value = runeToValue.get(character);
    if (value !== undefined) values.push(value);
  }
  for (let offset = 0; offset <= values.length - home.length; offset += 1) {
    if (home.every((value, index) => value === values[offset + index])) {
      homeHits.push({page, offset});
    }
  }
}
assert.deepEqual(homeHits, [{page: 32, offset: 33}]);

const physical = ink.physical_zero_based;
assert.deepEqual(
  physical.red_words.map((word) => [word.start, word.length]),
  [[0, 8], [8, 5]]
);

const words = parseCanonicalUnsolvedWords();
const wordA = words[0];
const wordB = words[1];
assert.deepEqual(wordA.indices, physical.red_words[0].gp_indices);
assert.deepEqual(wordB.indices, physical.red_words[1].gp_indices);

const primeSumA = wordA.indices.reduce(
  (sum, rune) => sum + gpPrime[rune],
  0
);
const primeSumB = wordB.indices.reduce(
  (sum, rune) => sum + gpPrime[rune],
  0
);
assert.deepEqual([primeSumA, primeSumB], [347, 315]);

const p = state.p;
const g = state.g;
const publicA = primeSumA % p;
const publicB = primeSumB % p;
assert.deepEqual([publicA, publicB], [2, 16]);

const exponentA = discreteLog(g, publicA, p);
const exponentB = discreteLog(g, publicB, p);
assert.deepEqual([exponentA, exponentB], [state.K, state.A]);
assert.deepEqual([exponentA, exponentB], [2, 8]);

const sharedAB = powMod(publicB, exponentA, p);
const sharedBA = powMod(publicA, exponentB, p);
assert.equal(sharedAB, state.e);
assert.equal(sharedBA, state.e);
assert.equal(sharedAB, 3);
assert.equal(wordA.indices.length - wordB.indices.length, sharedAB);

let pair8x5Count = 0;
const pair8x5Matches = [];
let allPairResidueMatches = 0;
for (let index = 0; index < words.length - 1; index += 1) {
  const left = words[index];
  const right = words[index + 1];
  const leftResidue = left.indices.reduce(
    (sum, rune) => sum + gpPrime[rune],
    0
  ) % p;
  const rightResidue = right.indices.reduce(
    (sum, rune) => sum + gpPrime[rune],
    0
  ) % p;

  if (leftResidue === publicA && rightResidue === publicB) {
    allPairResidueMatches += 1;
  }

  if (left.indices.length === 8 && right.indices.length === 5) {
    pair8x5Count += 1;
    if (leftResidue === publicA && rightResidue === publicB) {
      pair8x5Matches.push(index);
    }
  }
}

assert.equal(pair8x5Count, 19);
assert.deepEqual(pair8x5Matches, [0]);
assert.equal(allPairResidueMatches, 8);

console.log(JSON.stringify({
  status: "PASS",
  p32: {
    runeCount: p32.length,
    boundary: 33,
    boundaryPair: [p32[32], p32[33]],
    stateTyping: ["K", "A"],
    zeroBasedCoordinate: [state.K, state.A],
    coordinateOffset,
    coordinateValue: p32[coordinateOffset],
    coordinateRune: gpName[p32[coordinateOffset]],
    oneBasedIdentityRival: {
      offset: oneBasedOffset,
      value: p32[oneBasedOffset],
    },
    rowStart: {
      offset: 33,
      values: home,
      transliteration: "HOME",
      manuscriptHits: homeHits,
    },
  },
  p0: {
    redWordLengths: physical.red_words.map((word) => word.length),
    primeSums: [primeSumA, primeSumB],
    publicResidues: [publicA, publicB],
    discreteLogs: [exponentA, exponentB],
    sharedSecret: sharedAB,
    lengthDifference: wordA.indices.length - wordB.indices.length,
  },
  controls: {
    canonicalUnsolvedWords: words.length,
    adjacent8x5Pairs: pair8x5Count,
    matching8x5Pairs: pair8x5Matches,
    allAdjacentPairsWithResidues2_16: allPairResidueMatches,
  },
  decision:
    "P32 YOU33 boundary predicts [2,8], zero-based row-major addressing returns F=0 beside the unique HOME row start, and p0's red title independently has DH logs [2,8]. Preserve the p32->p0 state handoff; the p0 shared-secret-to-GP29 consumer remains unresolved.",
}, null, 2));
