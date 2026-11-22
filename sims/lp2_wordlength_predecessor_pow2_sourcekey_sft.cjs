"use strict";

/**
 * SFT: source-visible word lengths plus a GF29 predecessor-dependent
 * multiplicative alphabet, with an exhaustive 29^3 small-key decision.
 *
 * Run under Node.js 22 in the repository root. All source reads are
 * local and no external dependencies or writes are required.
 *
 * Hypothesis, with arithmetic in GF(29):
 *     C[i] = C[i-1] + (2 ^ C[i-1]) * (P[i] + B*n[i] + D*j[i] + E)
 * where n[i] and j[i] are the original joined printed word length and
 * within-word offset. Predecessor at the start of the corpus is index0.
 * Inversion is exact for every previous ciphertext rune.
 *
 * This is a bounded, unauthenticated candidate operation. Its modest
 * keyspace search is calibrated on a native-GP plant and wrong-family
 * nonzero-transition streams. No unknown plaintext is claimed.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseSharedCorpus } = require("./lp2_word_pages.cjs");
const { encodeSourceNativeGP } = require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeToIndex = new Map(gp.runes.map((rune, index) => [rune, index]));
const parsed = parseSharedCorpus();
const words = parsed.words.map(w => Array.from(w.runes, rune => {
  assert(runeToIndex.has(rune));
  return runeToIndex.get(rune);
}));
assert.equal(words.length, 2896);
assert.equal(parsed.runeCount, 12956);
assert.equal(parsed.crossPageWords, 32);

const N = 12956;
const ciphertext = new Uint8Array(N);
const wordLength = new Uint8Array(N);
const wordOffset = new Uint8Array(N);
let offset = 0;
for (const word of words) {
  for (let j = 0; j < word.length; j++) {
    ciphertext[offset] = word[j];
    wordLength[offset] = word.length;
    wordOffset[offset] = j;
    offset++;
  }
}
assert.equal(offset, N);
const canonical = gp.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(canonical.length, N);
assert.deepEqual(Array.from(ciphertext), canonical);

const source = read("resources/liber-primus/lp1-plaintext-reference.txt");
const training = encodeSourceNativeGP(source.replace(/^#.*$/gm, ""));
assert.equal(training.length, 3510);
const two = new Uint32Array(29 * 29);
const three = new Uint32Array(29 * 29 * 29);
for (let i = 2; i < training.length; i++) {
  const bigram = 29 * training[i - 2] + training[i - 1];
  two[bigram]++;
  three[29 * bigram + training[i]]++;
}
const trigramLog = new Float64Array(29 * 29 * 29);
for (let i = 0; i < trigramLog.length; i++) {
  trigramLog[i] = Math.log((three[i] + 1) / (two[Math.floor(i / 29)] + 29));
}

const mod29 = n => ((n % 29) + 29) % 29;
const pow2 = new Uint8Array(29);
const invPow2 = new Uint8Array(29);
for (let previous = 0; previous < 29; previous++) {
  let v = 1;
  for (let j = 0; j < previous; j++) v = v * 2 % 29;
  pow2[previous] = v;
  for (let test = 1; test < 29; test++) {
    if (test * v % 29 === 1) {
      invPow2[previous] = test;
      break;
    }
  }
  assert.notEqual(invPow2[previous], 0);
}

/** @param {Uint8Array} current */
function unkeyedSteps(current) {
  const base = new Uint8Array(current.length);
  let previous = 0;
  for (let i = 0; i < current.length; i++) {
    base[i] = invPow2[previous] * mod29(current[i] - previous) % 29;
    previous = current[i];
  }
  return base;
}

/**
 * Encode a GP29 plaintext at the existing original word layout.
 * @param {Uint8Array|number[]} plain
 * @param {{B:number,D:number,E:number}} key
 */
function encrypt(plain, key) {
  const result = new Uint8Array(plain.length);
  let previous = 0;
  for (let i = 0; i < plain.length; i++) {
    const shift = mod29(plain[i] + key.B * wordLength[i] +
      key.D * wordOffset[i] + key.E);
    result[i] = (previous + pow2[previous] * shift) % 29;
    previous = result[i];
  }
  return result;
}

/**
 * @param {Uint8Array} current
 * @param {{B:number,D:number,E:number}} key
 */
function decrypt(current, key) {
  const base = unkeyedSteps(current);
  return Uint8Array.from(base, (v, i) => mod29(v -
    key.B * wordLength[i] - key.D * wordOffset[i] - key.E));
}

/**
 * Compute original-source LP1-trained GP29 character trigram likelihood
 * over exactly one predeclared contiguous rune interval.
 */
function scoreInterval(base, key, from, to) {
  let prevTwo = 0, prevOne = 0, sum = 0;
  for (let i = from; i < to; i++) {
    const v = mod29(base[i] - key.B * wordLength[i] -
      key.D * wordOffset[i] - key.E);
    if (i >= from + 2) {
      sum += trigramLog[841 * prevTwo + 29 * prevOne + v];
    }
    prevTwo = prevOne;
    prevOne = v;
  }
  return sum / (to - from - 2);
}

/**
 * Exactly enumerate 29^3 model keys on the first, untouched 729-rune
 * source-illustrated chapter and retain the ten strongest.
 *
 * @param {Uint8Array} current
 */
function search(current) {
  const base = unkeyedSteps(current);
  const ranked = [];
  for (let B = 0; B < 29; B++) {
    for (let D = 0; D < 29; D++) {
      for (let E = 0; E < 29; E++) {
        const key = { B, D, E };
        const score = scoreInterval(base, key, 0, 729);
        if (ranked.length < 10 || score > ranked[ranked.length - 1].score) {
          ranked.push({ ...key, score });
          ranked.sort((a, b) => b.score - a.score);
          if (ranked.length > 10) ranked.pop();
        }
      }
    }
  }
  return ranked;
}

const originalBestTen = search(ciphertext.subarray(0, 729));
const chosen = originalBestTen[0];
assert.deepEqual([chosen.B, chosen.D, chosen.E], [10, 2, 0]);
assert(Math.abs(chosen.score - (-3.3787237938959422)) < 1e-10);

const originalFullInverse = decrypt(ciphertext, chosen);
assert.deepEqual(Array.from(encrypt(originalFullInverse, chosen)),
  Array.from(ciphertext), "original full-corpus reversible replay");
const originalBase = unkeyedSteps(ciphertext);
const heldouts = originalBestTen.map(k => ({
  ...k,
  p40to53: scoreInterval(originalBase, k, 9640, 12648),
  p54to55: scoreInterval(originalBase, k, 12648, 12956)
}));
assert(Math.abs(heldouts[0].p40to53 - (-3.4127722178057005)) < 1e-10);
assert(Math.abs(heldouts[0].p54to55 - (-3.4263346762721865)) < 1e-10);

// Source-native positive plant with EXACT first-chapter word lengths.
// The fixed external Gibran reference is not used to tune the cipher.
const referenceWords = read("resources/control/gibran_prophet_58585.txt")
  .match(/[A-Za-z]+/g) || [];
const pools = Array.from({ length: 15 }, () => []);
for (const word of referenceWords) {
  const encoded = encodeSourceNativeGP(word);
  if (encoded.length < pools.length) pools[encoded.length].push(encoded);
}
assert(pools.slice(1).every(list => list.length > 0));

let seed = 0x43300129;
function next32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const plant = new Uint8Array(729);
let pos = 0;
for (const word of words) {
  const selection = pools[word.length][next32() % pools[word.length].length];
  for (const rune of selection) {
    if (pos >= plant.length) break;
    plant[pos++] = rune;
  }
  if (pos === plant.length) break;
}
assert.equal(pos, 729);
const plantKey = { B: 7, D: 11, E: 5 };
const plantedCipher = encrypt(plant, plantKey);
assert.deepEqual(Array.from(decrypt(plantedCipher, plantKey)),
  Array.from(plant));
const plantedSearch = search(plantedCipher);
assert.deepEqual([plantedSearch[0].B, plantedSearch[0].D,
  plantedSearch[0].E], [7, 11, 5]);
assert(Math.abs(plantedSearch[0].score - (-2.988676166598936)) < 1e-10);
assert(plantedSearch[0].score - plantedSearch[1].score > 0.30);

// Wrong-family control: near-zero-repeat 28-way random-step transport,
// with the same exact 729 original word lengths but no hidden English.
const wrongFamily = [];
for (let attempt = 0; attempt < 5; attempt++) {
  const nullCipher = new Uint8Array(729);
  let previous = 0;
  for (let i = 0; i < nullCipher.length; i++) {
    const step = next32() % 150 === 0 ? 0 : 1 + (next32() % 28);
    nullCipher[i] = (previous + step) % 29;
    previous = nullCipher[i];
  }
  wrongFamily.push(search(nullCipher)[0]);
}
assert(wrongFamily.every(k => k.score < -3.35));
assert(wrongFamily.every(k => k.score > -3.40));

const firstWordIndices = words[0].map((_, i) => originalFullInverse[i]);
const spell = indices => indices.map(i =>
  i === 21 ? "ING" : i === 27 ? "IO" : gp.translit[i]).join("");

const result = {
  status: "bounded negative, no original unknown plaintext or key recovered",
  originalRunes: N,
  originalPrintedWords: words.length,
  crossPageWords: parsed.crossPageWords,
  searchedKeys: 29 ** 3,
  originalBestTen: heldouts,
  originalBestFirstWord: spell(firstWordIndices),
  originalExactReencryption: N,
  nativeEnglishPlant: {
    key: plantKey,
    recoveredRunes: plant.length,
    rankOfTrueKey: 1,
    bestScore: plantedSearch[0].score,
    secondBestScore: plantedSearch[1].score
  },
  wrongFamilyFiveBestScores: wrongFamily.map(k => k.score),
  solvedLP1NativeTrainingRunes: training.length
};
if (require.main === module) console.log(JSON.stringify(result, null, 2));
module.exports = { encrypt, decrypt, search };
