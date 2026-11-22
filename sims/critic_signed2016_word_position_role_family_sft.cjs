"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} value @returns {boolean} */
function isPrime(value) {
  if (value < 2) return false;
  for (let divisor = 2; divisor * divisor <= value; divisor += 1) {
    if (value % divisor === 0) return false;
  }
  return true;
}

/**
 * @param {number} base
 * @param {number} exponent
 * @param {number} modulus
 * @returns {number}
 */
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

/**
 * Ordered k-permutations.
 * @template T
 * @param {T[]} values
 * @param {number} k
 * @returns {T[][]}
 */
function permutations(values, k = values.length) {
  if (k === 0) return [[]];
  const output = [];
  for (let index = 0; index < values.length; index += 1) {
    const rest = values.slice(0, index).concat(values.slice(index + 1));
    for (const suffix of permutations(rest, k - 1)) {
      output.push([values[index], ...suffix]);
    }
  }
  return output;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number} */
function gp0(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C")
    .replace(/V/g, "U")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  let total = 0;
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      total += 21;
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      total += 27;
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    total += token.value;
    offset += token.symbol.length;
  }
  return total;
}

const clear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");

const words = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word) => word.toUpperCase());

assert.equal(words.length, 43);

const occurrences = new Map();
for (let index = 0; index < words.length; index += 1) {
  const word = words[index];
  if (!occurrences.has(word)) occurrences.set(word, []);
  occurrences.get(word).push(index);
}

/**
 * @param {string} word
 * @param {number} occurrence
 * @returns {number}
 */
function rawIndex(word, occurrence = 0) {
  const indices = occurrences.get(word);
  assert.ok(indices && indices.length > occurrence, "missing source word " + word);
  return indices[occurrence];
}

const clauseWords = ["PATH", "LIES", "EMPTY", "EPIPHANY", "SEEKS", "DEVOTED"];
const sixRoles = permutations(["K", "e", "q", "g", "a", "A"]);
const fiveClauseSelections = permutations(clauseWords, 5);
const laterRoles = permutations(["b", "B", "p"]);

let configurations = 0;
const survivors = [];

for (const origin of [0, 1]) {
  const position = (index) => index + origin;

  for (const theirOccurrence of [0, 1]) {
    for (const roadWord of ["ROAD", "PATHS"]) {
      const laterWords = ["WORDS", "THEIR", roadWord];
      const laterValues = [
        position(rawIndex("WORDS")),
        position(rawIndex("THEIR", theirOccurrence)),
        position(rawIndex(roadWord)),
      ];

      const firstCases = [];

      for (const roles of sixRoles) {
        const state = {};
        for (let index = 0; index < clauseWords.length; index += 1) {
          state[roles[index]] = position(rawIndex(clauseWords[index]));
        }
        firstCases.push({
          state,
          qWord: clauseWords[roles.indexOf("q")],
          kSource: clauseWords[roles.indexOf("K")],
          assignment: Object.fromEntries(
            clauseWords.map((word, index) => [word, roles[index]])
          ),
        });
      }

      // Preserve the original report's literal PATHS shared-secret alternative.
      // K=PATHS, while e/q/g/a/A may occupy any five distinct first-clause words.
      for (const selectedWords of fiveClauseSelections) {
        const roleOrder = ["e", "q", "g", "a", "A"];
        const state = { K: position(rawIndex("PATHS")) };
        for (let index = 0; index < roleOrder.length; index += 1) {
          state[roleOrder[index]] = position(rawIndex(selectedWords[index]));
        }
        firstCases.push({
          state,
          qWord: selectedWords[1],
          kSource: "PATHS",
          assignment: {
            PATHS: "K",
            ...Object.fromEntries(
              selectedWords.map((word, index) => [word, roleOrder[index]])
            ),
          },
        });
      }

      for (const firstCase of firstCases) {
        for (const roleOrder of laterRoles) {
          configurations += 1;
          const state = { ...firstCase.state };
          for (let index = 0; index < roleOrder.length; index += 1) {
            state[roleOrder[index]] = laterValues[index];
          }

          const { p, g, a, b, A, B, K, e, q } = state;

          let valid = isPrime(p);
          valid = valid && [g, a, b, A, B, K, e, q]
            .every((value) => value > 0 && value < p);
          valid = valid && powModulo(g, a, p) === A;
          valid = valid && powModulo(g, b, p) === B;
          valid = valid && powModulo(A, b, p) === K;
          valid = valid && powModulo(B, a, p) === K;
          valid = valid && (b * e) % (p - 1) === 1;
          valid = valid && gp0(firstCase.qWord) === p * q;
          valid = valid && g + K === position(7);

          if (valid) {
            survivors.push({
              origin,
              theirOccurrence,
              roadWord,
              kSource: firstCase.kSource,
              firstAssignment: firstCase.assignment,
              laterAssignment: Object.fromEntries(
                laterWords.map((word, index) => [word, roleOrder[index]])
              ),
              state: { p, g, a, b, A, B, K, e, q },
              qWord: firstCase.qWord,
            });
          }
        }
      }
    }
  }
}

assert.equal(configurations, 69120);
assert.deepEqual(survivors, [{
  origin: 0,
  theirOccurrence: 0,
  roadWord: "ROAD",
  kSource: "PATH",
  firstAssignment: {
    PATH: "K",
    LIES: "e",
    EMPTY: "q",
    EPIPHANY: "g",
    SEEKS: "a",
    DEVOTED: "A",
  },
  laterAssignment: {
    WORDS: "b",
    THEIR: "B",
    ROAD: "p",
  },
  state: {
    p: 23,
    g: 5,
    a: 6,
    b: 15,
    A: 8,
    B: 19,
    K: 2,
    e: 3,
    q: 4,
  },
  qWord: "EMPTY",
}]);

console.log(JSON.stringify({
  status: "PASS",
  classification:
    "Critic audit of the signed-2016 word-position DH claim. Expanding the reported literal alternatives to 69,120 natural sentence-structured role assignments still leaves exactly one complete DH closure. This removes role-label undercharge inside this source family, while discovery chronology remains retrospective.",
  configurations,
  survivors,
}, null, 2));
