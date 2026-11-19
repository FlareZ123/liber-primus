"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const out = [];
  for (let candidate = 2; out.length < count; candidate += 1) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor += 1) {
      if (candidate % divisor === 0) {
        prime = false;
        break;
      }
    }
    if (prime) out.push(candidate);
  }
  return out;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const primes = firstPrimes(300);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} cardinal @returns {number} */
function serializeCardinal(cardinal) {
  assert.ok(Number.isInteger(cardinal) && cardinal >= 1);
  return mod29(primes[cardinal - 1] - 1);
}

/** @param {number[]} values @returns {string} */
function spell(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

/** @param {string} line @returns {number[]} */
function wordLengths(line) {
  return (line.match(/[\u16A0-\u16FF]+/gu) || []).map((word) => [...word].length);
}

const parts = transcription.split(/^\s*%\s*$/m);
const p23Lines = parts[23]
  .split(/\n/u)
  .filter((line) => /[\u16A0-\u16FF]/u.test(line));
const p23Lengths = wordLengths(p23Lines[0]);
assert.deepEqual(p23Lengths, [2, 6, 3, 5, 4]);
assert.equal(spell(p23Lengths.map(serializeCardinal)), "THEORIG");
const p23Extended = [...p23Lengths, 5, 25];
assert.equal(spell(p23Extended.map(serializeCardinal)), "THEORIGIN");

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

const theZeroBased = words
  .map((word, index) => word === "THE" ? index : null)
  .filter((index) => index !== null);
assert.deepEqual(theZeroBased, [1, 7, 12, 17, 22, 28]);
assert.equal(words[7], "THE");

const tokens = grid.pages.flatMap((page) => page.tokens);
assert.equal(tokens.length, 256);
assert.equal(grid.alphabet.length, 60);
const alphabet60 = grid.alphabet;
const alphabet59 = grid.alphabet.slice(0, 59);

/**
 * @param {string} token
 * @param {59|60} radix
 * @param {boolean} reverse
 * @returns {number|null}
 */
function tokenValue(token, radix, reverse) {
  const source = reverse ? token[1] + token[0] : token;
  const alphabet = radix === 60 ? alphabet60 : alphabet59;
  const high = alphabet.indexOf(source[0]);
  const low = alphabet.indexOf(source[1]);
  if (high < 0 || low < 0) return null;
  return radix * high + low;
}

/** @param {number} value @returns {[number, number]} */
function divmod29(value) {
  return [Math.floor(value / 29), value % 29];
}

const originToken = tokens[0];
assert.equal(originToken, "3N");
const originValue = tokenValue(originToken, 60, false);
assert.equal(originValue, 203);
const originPair = divmod29(originValue);
assert.deepEqual(originPair, [7, 0]);
assert.equal(words[originPair[0]], "THE");

const canonicalTapeHits = [];
for (let address = 0; address < tokens.length; address += 1) {
  const value = tokenValue(tokens[address], 60, false);
  assert.notEqual(value, null);
  const [quotient, remainder] = divmod29(value);
  if (remainder === 0 && theZeroBased.includes(quotient)) {
    canonicalTapeHits.push({
      address,
      token: tokens[address],
      value,
      pair: [quotient, remainder],
      sourceWord: words[quotient]
    });
  }
}
assert.deepEqual(canonicalTapeHits, [{
  address: 0,
  token: "3N",
  value: 203,
  pair: [7, 0],
  sourceWord: "THE"
}]);

/**
 * Conservative sensitivity family around the already-frozen canonical register:
 * radix {60,59} x token order {forward,reverse} x pair order {q,r}/{r,q}
 * x signed-word position origin {0,1}.
 *
 * @param {string} token
 * @returns {{radix:number,reverse:boolean,swap:boolean,wordOrigin:number,pair:number[],value:number}[]}
 */
function phraseHits(token) {
  const hits = [];
  for (const radix of [60, 59]) {
    for (const reverse of [false, true]) {
      const value = tokenValue(token, radix, reverse);
      if (value === null) continue;
      const direct = divmod29(value);
      for (const swap of [false, true]) {
        const pair = swap ? [direct[1], direct[0]] : direct;
        for (const wordOrigin of [0, 1]) {
          const thePositions = theZeroBased.map((index) => index + wordOrigin);
          if (thePositions.includes(pair[0]) && pair[1] === 0) {
            hits.push({ radix, reverse, swap, wordOrigin, pair, value });
          }
        }
      }
    }
  }
  return hits;
}

const originFamilyHits = phraseHits(originToken);
assert.deepEqual(originFamilyHits, [{
  radix: 60,
  reverse: false,
  swap: false,
  wordOrigin: 0,
  pair: [7, 0],
  value: 203
}]);

const shiftedFamilyHits = [];
for (let shift = 0; shift < tokens.length; shift += 1) {
  const hits = phraseHits(tokens[shift]);
  if (hits.length > 0) shiftedFamilyHits.push({ shift, token: tokens[shift], hits });
}
assert.equal(shiftedFamilyHits.length, 14);

console.log(JSON.stringify({
  status: "PASS",
  p23: {
    selectedLineWordLengths: p23Lengths,
    sourceSelectedPrefix: spell(p23Lengths.map(serializeCardinal)),
    candidateInstruction: spell(p23Extended.map(serializeCardinal)),
    completionCardinals: [5, 25]
  },
  signed2016: {
    wordCount: words.length,
    theZeroBased,
    selectedThe: [7, words[7]]
  },
  p50Origin: {
    address: 0,
    token: originToken,
    nativeBase60Value: originValue,
    divmod29: originPair,
    interpretation: "[zero-based signed word 7 = THE, literal origin 0]"
  },
  canonicalTapeControl: {
    qualifyingCells: canonicalTapeHits,
    exactCyclicShiftTail: canonicalTapeHits.length / tokens.length
  },
  conservativeSensitivityFamily: {
    configurationsPerOriginToken: 16,
    actualOriginHits: originFamilyHits,
    shiftsWithAnyFamilyHit: shiftedFamilyHits.length,
    familywiseCyclicShiftTail: shiftedFamilyHits.length / tokens.length
  },
  classification:
    "Cross-object support for the p23 THE ORIGIN candidate. The canonical p50 register was selected independently on solved/source controls. This relation does not decrypt unknown ciphertext and is not a blind discovery probability because cell0 was already public before this cross-check was formulated."
}, null, 2));
