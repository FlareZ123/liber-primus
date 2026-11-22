"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} left @param {number} right @returns {[number, number]} */
function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C")
    .replace(/V/g, "U")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const output = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      output.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      output.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    output.push(token.value);
    offset += token.symbol.length;
  }
  return output;
}

/** @param {number} value @param {number} modulus @returns {number | null} */
function inverseModulo(value, modulus) {
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if ((value * candidate) % modulus === 1) return candidate;
  }
  return null;
}

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function powModulo(base, exponent, modulus) {
  let result = 1;
  let current = ((base % modulus) + modulus) % modulus;
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = (result * current) % modulus;
    current = (current * current) % modulus;
    power = Math.floor(power / 2);
  }
  return result;
}

/** @param {number} value @returns {boolean} */
function isPrime(value) {
  if (value < 2) return false;
  for (let divisor = 2; divisor * divisor <= value; divisor += 1) {
    if (value % divisor === 0) return false;
  }
  return true;
}

const clear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");

const sourceWords = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word) => word.toUpperCase());
assert.equal(sourceWords.length, 43);

const valueByWord = new Map();
for (const word of new Set(sourceWords)) valueByWord.set(word, gp(word));
const gp0ByWord = new Map(
  [...valueByWord].map(([word, values]) => [
    word,
    values.reduce((total, value) => total + value, 0),
  ])
);

/**
 * Build the two clue-native source-pair families.
 * Repeated pairs use words occurring exactly twice.
 * Distinct collisions use two distinct lexical words with equal GP0, represented
 * by their first source occurrence and serialized in chronological order.
 *
 * @param {string[]} words
 * @returns {{
 *   repeated:Array<{word:string,indices:[number,number],h:[number,number],gp0:number}>,
 *   distinct:Array<{words:[string,string],indices:[number,number],h:[number,number],gp0:number}>
 * }}
 */
function pairFamilies(words) {
  const occurrences = new Map();
  for (let index = 0; index < words.length; index += 1) {
    const word = words[index];
    if (!occurrences.has(word)) occurrences.set(word, []);
    occurrences.get(word).push(index);
  }

  const repeated = [...occurrences]
    .filter(([, indices]) => indices.length === 2)
    .map(([word, indices]) => ({
      word,
      indices: /** @type {[number, number]} */ ([indices[0], indices[1]]),
      h: H(indices[0], indices[1]),
      gp0: gp0ByWord.get(word),
    }));

  const firstOccurrences = [...occurrences].map(([word, indices]) => ({
    word,
    index: indices[0],
    gp0: gp0ByWord.get(word),
  }));
  const byGp0 = new Map();
  for (const row of firstOccurrences) {
    if (!byGp0.has(row.gp0)) byGp0.set(row.gp0, []);
    byGp0.get(row.gp0).push(row);
  }

  const distinct = [];
  for (const [address, rows] of byGp0) {
    for (let left = 0; left < rows.length; left += 1) {
      for (let right = left + 1; right < rows.length; right += 1) {
        const first = rows[left];
        const second = rows[right];
        const chronological = [first, second].sort((a, b) => a.index - b.index);
        distinct.push({
          words: /** @type {[string,string]} */ (
            [chronological[0].word, chronological[1].word]
          ),
          indices: /** @type {[number,number]} */ (
            [chronological[0].index, chronological[1].index]
          ),
          h: H(chronological[0].index, chronological[1].index),
          gp0: address,
        });
      }
    }
  }

  return { repeated, distinct };
}

/**
 * Charge every role assignment in the fixed collision grammar.
 *
 * p,b   = H(indices of one exactly-twice word)
 * B,e   = H(indices of a different exactly-twice word)
 * Ka,g  = H(indices of one distinct lexical equal-GP0 pair)
 * Kg,a-g= H(indices of a different distinct lexical equal-GP0 pair)
 *
 * The assignment must close all DH equations without imported state values.
 *
 * @param {string[]} words
 * @param {boolean} stopAtFirst
 * @returns {Array<{
 *   privatePair:any, publicPair:any, kaPair:any, kgPair:any,
 *   state:{p:number,g:number,a:number,b:number,A:number,B:number,K:number,e:number}
 * }>}
 */
function solveCollisionFamily(words, stopAtFirst = false) {
  const { repeated, distinct } = pairFamilies(words);
  const hits = [];

  for (const privatePair of repeated) {
    const [p, b] = privatePair.h;
    if (!isPrime(p) || b <= 0 || b >= p) continue;
    const inverseB = inverseModulo(b, p - 1);
    if (inverseB === null) continue;

    for (const publicPair of repeated) {
      if (publicPair.word === privatePair.word) continue;
      const [B, e] = publicPair.h;
      if (e !== inverseB || B <= 0 || B >= p) continue;

      for (const kaPair of distinct) {
        const [Ka, g] = kaPair.h;
        if (g <= 1 || g >= p) continue;

        for (const kgPair of distinct) {
          if (kgPair === kaPair) continue;
          const [Kg, aMinusG] = kgPair.h;
          const a = mod29(g + aMinusG);
          if (a <= 0 || a >= p) continue;

          const inverseA29 = inverseModulo(a, 29);
          if (inverseA29 === null) continue;
          const K = mod29(Ka * inverseA29);
          if (K <= 0 || K >= p) continue;
          if (mod29(K * g) !== Kg) continue;

          if (powModulo(g, b, p) !== B) continue;
          const A = powModulo(g, a, p);
          if (powModulo(A, b, p) !== K) continue;
          if (powModulo(B, a, p) !== K) continue;

          hits.push({
            privatePair,
            publicPair,
            kaPair,
            kgPair,
            state: { p, g, a, b, A, B, K, e },
          });
          if (stopAtFirst) return hits;
        }
      }
    }
  }
  return hits;
}

const originalFamilies = pairFamilies(sourceWords);
assert.deepEqual(
  originalFamilies.repeated.map((row) => [row.word, row.indices, row.h]),
  [
    ["IS", [11, 21], [19, 3]],
    ["ARE", [16, 27], [18, 14]],
    ["THEIR", [19, 25], [23, 15]],
    ["AND", [24, 31], [22, 26]],
  ]
);
assert.deepEqual(
  originalFamilies.distinct.map((row) => [row.words, row.indices, row.gp0, row.h]),
  [
    [["HELLO", "LIBER"], [0, 9], 69, [20, 9]],
    [["WAY", "WILL"], [13, 33], 57, [9, 17]],
    [["MAP", "AND"], [18, 24], 56, [23, 13]],
    [["MAP", "SEEK"], [18, 30], 56, [17, 19]],
    [["AND", "SEEK"], [24, 30], 56, [23, 25]],
    [["MEANING", "FALSE"], [20, 39], 77, [10, 1]],
    [["ROAD", "PATHS"], [23, 40], 54, [12, 5]],
    [["BE", "GOOD"], [34, 36], 35, [27, 12]],
  ]
);

const roleAssignments =
  originalFamilies.repeated.length *
  (originalFamilies.repeated.length - 1) *
  originalFamilies.distinct.length *
  (originalFamilies.distinct.length - 1);
assert.equal(roleAssignments, 672);

const exactHits = solveCollisionFamily(sourceWords);
assert.equal(exactHits.length, 1);
const exact = exactHits[0];
assert.equal(exact.privatePair.word, "THEIR");
assert.equal(exact.publicPair.word, "IS");
assert.deepEqual(exact.kaPair.words, ["ROAD", "PATHS"]);
assert.deepEqual(exact.kgPair.words, ["MEANING", "FALSE"]);
assert.deepEqual(exact.state, {
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
  e: 3,
});

// Explicit source-only reconstruction and internal checks.
assert.deepEqual(exact.privatePair.h, [exact.state.p, exact.state.b]);
assert.deepEqual(exact.publicPair.h, [exact.state.B, exact.state.e]);
assert.deepEqual(exact.kaPair.h, [
  mod29(exact.state.K * exact.state.a),
  exact.state.g,
]);
assert.deepEqual(exact.kgPair.h, [
  mod29(exact.state.K * exact.state.g),
  mod29(exact.state.a - exact.state.g),
]);
assert.equal(
  inverseModulo(exact.state.b, exact.state.p - 1),
  exact.state.e
);
assert.equal(
  powModulo(exact.state.g, exact.state.a, exact.state.p),
  exact.state.A
);
assert.equal(
  powModulo(exact.state.g, exact.state.b, exact.state.p),
  exact.state.B
);
assert.equal(
  powModulo(exact.state.A, exact.state.b, exact.state.p),
  exact.state.K
);
assert.equal(
  powModulo(exact.state.B, exact.state.a, exact.state.p),
  exact.state.K
);

// Independent source semantic consequence. The repository already fixes
// q=GP0(EMPTY)/p; with p reconstructed above, q is source-only here.
const emptyGp0 = gp0ByWord.get("EMPTY");
assert.equal(emptyGp0, 92);
assert.equal(emptyGp0 % exact.state.p, 0);
const q = emptyGp0 / exact.state.p;
assert.equal(q, 4);
const semanticIndices = [
  exact.state.K,
  exact.state.e,
  q,
  exact.state.g,
  exact.state.a,
  mod29(exact.state.g + exact.state.K),
  exact.state.A,
];
assert.deepEqual(semanticIndices, [2, 3, 4, 5, 6, 7, 8]);
const semanticWords = semanticIndices.map((index) => sourceWords[index]);
assert.deepEqual(
  semanticWords,
  ["PATH", "LIES", "EMPTY", "EPIPHANY", "SEEKS", "THE", "DEVOTED"]
);
assert.equal(sourceWords[exact.state.b], "WORDS");
assert.equal(sourceWords[exact.state.B], "THEIR");
assert.equal(sourceWords[exact.state.p], "ROAD");

/** @param {number} seed @returns {() => number} */
function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= (state << 13) >>> 0;
    state ^= state >>> 17;
    state ^= (state << 5) >>> 0;
    return state >>> 0;
  };
}

/** @param {string[]} values @param {() => number} next @returns {string[]} */
function shuffled(values, next) {
  const output = values.slice();
  for (let index = output.length - 1; index > 0; index -= 1) {
    const unit = next() / 0x100000000;
    const swap = Math.floor(unit * (index + 1));
    [output[index], output[swap]] = [output[swap], output[index]];
  }
  return output;
}

// Exact-token-multiset familywise calibration. Each shuffled source preserves all
// words, repetitions and GP0 identities, changing only their signed positions.
// Count any full DH closure anywhere in the same 672-role family.
const nullSeeds = [3301, 2016, 2014, 23, 29, 1033, 761, 56, 57, 42];
const trialsPerSeed = 100000;
let nullHits = 0;
const nullBySeed = [];
for (const seed of nullSeeds) {
  const next = xorshift32(seed);
  let seedHits = 0;
  for (let trial = 0; trial < trialsPerSeed; trial += 1) {
    if (solveCollisionFamily(shuffled(sourceWords, next), true).length > 0) {
      seedHits += 1;
    }
  }
  nullHits += seedHits;
  nullBySeed.push({ seed, trials: trialsPerSeed, hits: seedHits });
}
const nullTrials = nullSeeds.length * trialsPerSeed;
assert.equal(nullTrials, 1000000);
assert.equal(nullHits, 16);

console.log(JSON.stringify({
  status: "PASS",
  classification:
    "authenticated-2016 source-side DH state reconstruction under the frozen H operation. Across all 672 role assignments from exactly-twice words and distinct equal-GP0 lexical collisions, exactly one closes every DH equation: THEIR->p,b; IS->B,e; ROAD/PATHS->Ka,g; MEANING/FALSE->Kg,a-g, yielding p23 g5 a6 b15 A8 B19 K2 e3. No unknown LP2 ciphertext participates. The construction remains post-discovery with respect to H and the DH interpretation, so the exact-token-multiset positional null is reported as calibration rather than a discovery p-value.",
  source: {
    words: sourceWords.length,
    repeatedPairs: originalFamilies.repeated,
    distinctGp0CollisionPairs: originalFamilies.distinct,
    roleAssignments,
  },
  exact: {
    roles: {
      privatePair: exact.privatePair.word,
      publicPair: exact.publicPair.word,
      kaPair: exact.kaPair.words,
      kgPair: exact.kgPair.words,
    },
    state: exact.state,
    semanticIndexConsequence: {
      q,
      indices: semanticIndices,
      words: semanticWords,
      anchorIndices: {
        b: [exact.state.b, sourceWords[exact.state.b]],
        B: [exact.state.B, sourceWords[exact.state.B]],
        p: [exact.state.p, sourceWords[exact.state.p]],
      },
    },
  },
  null: {
    seeds: nullBySeed,
    totalTrials: nullTrials,
    totalHits: nullHits,
    empiricalRate: nullHits / nullTrials,
  },
}, null, 2));
