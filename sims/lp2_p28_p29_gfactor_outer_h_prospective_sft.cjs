"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildSourceNativeTrigramModel } = require("./lp1_source_native_trigram_model.cjs");

const base = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(base, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const referenceText = read("resources/liber-primus/lp1-plaintext-reference.txt");
const model = buildSourceNativeTrigramModel({ corpus, referenceText });
const G = [15, 5, 27];
const mod29 = value => ((value % 29) + 29) % 29;

/** @param {number[]} coeffs @returns {{quotient:number[],remainder:number[]}} */
function divideHighFirst(coeffs) {
  const work = coeffs.slice();
  const quotient = [];
  for (let i = 0; i < coeffs.length - 2; i++) {
    const coefficient = mod29(work[i] * 2); // 15^-1 mod29 = 2
    quotient.push(coefficient);
    for (let j = 0; j < G.length; j++) {
      work[i + j] = mod29(work[i + j] - coefficient * G[j]);
    }
  }
  return { quotient, remainder: work.slice(-2) };
}

/** @param {number[]} quotient @returns {number[]} */
function multiplyHighFirst(quotient) {
  const ciphertext = new Array(quotient.length + 2).fill(0);
  for (let i = 0; i < quotient.length; i++) {
    for (let j = 0; j < G.length; j++) {
      ciphertext[i + j] = mod29(ciphertext[i + j] + quotient[i] * G[j]);
    }
  }
  return ciphertext;
}

/** @param {number[]} quotient @returns {number[]} */
function decodeOuterH(quotient) {
  assert.equal(quotient.length % 2, 1);
  const plain = [];
  const half = Math.floor(quotient.length / 2);
  for (let i = 0; i < half; i++) {
    const a = quotient[i], b = quotient[quotient.length - i - 1];
    plain.push(mod29(a - b), mod29(a + b));
  }
  plain.push(quotient[half]);
  return plain;
}

/** @param {number[]} plain @returns {number[]} */
function encodeOuterH(plain) {
  assert.equal(plain.length % 2, 1);
  const quotient = new Array(plain.length);
  const half = Math.floor(plain.length / 2);
  for (let i = 0; i < half; i++) {
    const d = plain[2 * i], s = plain[2 * i + 1];
    quotient[i] = mod29(15 * (d + s));
    quotient[quotient.length - 1 - i] = mod29(15 * (s - d));
  }
  quotient[half] = plain[plain.length - 1];
  return quotient;
}

/** @param {number[]} symbols @returns {number} */
function coincidenceIndex(symbols) {
  const freq = new Array(29).fill(0);
  for (const symbol of symbols) freq[symbol]++;
  return freq.reduce((n, count) => n + count * (count - 1), 0)
    / (symbols.length * (symbols.length - 1));
}

const original = corpus.pages.find(page => page.page === 29).indices;
assert.equal(original.length, 277);
const { quotient, remainder } = divideHighFirst(original);
assert.deepEqual(remainder, [0, 0]);
assert.equal(quotient.length, 275);
assert.deepEqual(multiplyHighFirst(quotient), original);

const decoded = decodeOuterH(quotient);
assert.equal(decoded.length, 275);
assert.deepEqual(encodeOuterH(decoded), quotient);
assert.deepEqual(multiplyHighFirst(encodeOuterH(decoded)), original);

// Positive control uses actual source-native LP1 runes, not a generated
// English phrase or a purpose-built plaintext model.
const plantedPlain = model.training.slice(0, 275);
const plantedCipher = multiplyHighFirst(encodeOuterH(plantedPlain));
const plantedQuotient = divideHighFirst(plantedCipher);
assert.deepEqual(plantedQuotient.remainder, [0, 0]);
assert.deepEqual(decodeOuterH(plantedQuotient.quotient), plantedPlain);

const originalScore = model.scoreStream(original).mean;
const quotientScore = model.scoreStream(quotient).mean;
const decodedScore = model.scoreStream(decoded).mean;
assert(decodedScore < -3.0);
assert(model.p57Score > -3.0);

console.log(JSON.stringify({
  status: "PASS",
  interpretation: "Frozen p28→p29 G quotient then outward Hadamard shell yields no native-GP plaintext; the exact defined two-layer construction is rejected.",
  source: { page: 29, originalRunes: original.length, factor: G, remainder, quotientRunes: quotient.length },
  original: {
    ciphertextTrigram: originalScore,
    quotientTrigram: quotientScore,
    decodedTrigram: decodedScore,
    solvedP57Trigram: model.p57Score,
    sourceLP1Trigram: model.trainingScore,
    ciphertextIoC: coincidenceIndex(original),
    quotientIoC: coincidenceIndex(quotient),
    decodedIoC: coincidenceIndex(decoded),
    solvedP57IoC: coincidenceIndex(corpus.pages.find(page => page.page === 57).indices),
    decodedStart: model.spell(decoded.slice(0, 130)),
  },
  integrity: { originalForwardReplay: original.length, solvedNativePlant: plantedPlain.length },
}, null, 2));
