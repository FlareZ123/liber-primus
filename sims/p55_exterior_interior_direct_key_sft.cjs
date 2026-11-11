"use strict";

/**
 * LP2 p55 self-key gate selected by solved p57's "shed our own circumferences".
 * Test printed word-endpoint masks and the original outside-33 rune stream as
 * simple GP29 historical Vigenere/autokey keys for the interior-43 runes.
 * Run: node sims/p55_exterior_interior_direct_key_sft.cjs
 *
 * Source: canonical LP2 physical p55, original printed-word lengths,
 * solved p57 and independently solved LP1 reference text. No key search.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} name */
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const reference = read("resources/liber-primus/lp1-plaintext-reference.txt");
const p55 = corpus.pages.find((page) => page.page === 55).indices;
const p57 = corpus.pages.find((page) => page.page === 57).indices;
const lengths = [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
assert.equal(lengths.reduce((sum, n) => sum + n, 0), 76);
assert.equal(p55.length, 76);
assert.equal(p57.length, 95);
assert.equal(corpus.translit.length, 29);

/** @param {number} n */
const mod29 = (n) => ((n % 29) + 29) % 29;
/** @param {number[]} values */
const transliterate = (values) => values.map((value) => corpus.translit[value]).join("");
const exterior = [];
const interior = [];
const endpointKeys = [];
let offset = 0;
for (const length of lengths) {
  const word = p55.slice(offset, offset + length);
  offset += length;
  if (length === 1) {
    exterior.push(word[0]);
    continue;
  }
  exterior.push(word[0], word[length - 1]);
  for (const middle of word.slice(1, -1)) {
    interior.push(middle);
    endpointKeys.push([word[0], word[length - 1]]);
  }
}
assert.deepEqual([offset, exterior.length, interior.length], [76, 33, 43]);
assert.equal(interior.reduce((sum, value) => sum + corpus.prime[value], 0), 2060);

// Source-native rune trigram model. LP1 is solved English in Cicada's
// original GP orthography; exclude editor comments/markup before encoding.
const entries = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} original */
function gpEncode(original) {
  const sequence = [];
  const spelling = {K: "C", V: "U", Z: "S"};
  const clean = original.replace(/^#.*$/gm, " ").replace(/\[[^\]]*\]/g, " ");
  const words = clean.toUpperCase().match(/[A-Z]+/g) || [];
  for (const rawWord of words) {
    const word = [...rawWord].map((ch) => spelling[ch] || ch).join("");
    for (let index = 0; index < word.length;) {
      const entry = entries.find((item) => word.startsWith(item.s, index));
      if (entry) {
        sequence.push(entry.i);
        index += entry.s.length;
      } else {
        index++;
      }
    }
  }
  return sequence;
}
const training = gpEncode(reference);
assert.ok(training.length > 3000);
const grams = new Uint32Array(29 * 29 * 29);
for (let i = 0; i + 2 < training.length; i++) {
  grams[training[i] * 841 + training[i + 1] * 29 + training[i + 2]]++;
}
/** @param {number[]} values */
function logTrigramMean(values) {
  let log = 0;
  for (let i = 0; i + 2 < values.length; i++) {
    const id = values[i] * 841 + values[i + 1] * 29 + values[i + 2];
    log += Math.log((grams[id] + 0.05) / (training.length + 0.05 * grams.length));
  }
  return log / (values.length - 2);
}
/** @param {number[]} values */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0)
    / (values.length * (values.length - 1));
}
const nativeScores = [];
for (let i = 0; i + 43 <= training.length; i++) {
  nativeScores.push(logTrigramMean(training.slice(i, i + 43)));
}
nativeScores.sort((a, b) => a - b);

/** @typedef {{type:"endpoints",a:number,b:number} | {type:"cycling"|"cipher-autokey"|"plain-autokey",sign:number}} Mode */
/**
 * @param {number[]} input
 * @param {Mode} mode
 */
function decrypt(input, mode) {
  const output = [];
  for (let i = 0; i < input.length; i++) {
    let mask;
    if (mode.type === "endpoints") {
      mask = mode.a * endpointKeys[i][0] + mode.b * endpointKeys[i][1];
    } else if (mode.type === "cycling") {
      mask = mode.sign * exterior[i % exterior.length];
    } else if (mode.type === "cipher-autokey") {
      mask = mode.sign * (i < exterior.length ? exterior[i] : input[i - exterior.length]);
    } else {
      mask = mode.sign * (i < exterior.length ? exterior[i] : output[i - exterior.length]);
    }
    output.push(mod29(input[i] + mask));
  }
  return output;
}
/**
 * Inverse rule with exactly the same exterior rune source and clock.
 * @param {number[]} plain
 * @param {Mode} mode
 */
function encrypt(plain, mode) {
  const ciphertext = [];
  for (let i = 0; i < plain.length; i++) {
    let mask;
    if (mode.type === "endpoints") {
      mask = mode.a * endpointKeys[i][0] + mode.b * endpointKeys[i][1];
    } else if (mode.type === "cycling") {
      mask = mode.sign * exterior[i % exterior.length];
    } else if (mode.type === "cipher-autokey") {
      mask = mode.sign * (i < exterior.length ? exterior[i] : ciphertext[i - exterior.length]);
    } else {
      mask = mode.sign * (i < exterior.length ? exterior[i] : plain[i - exterior.length]);
    }
    ciphertext.push(mod29(plain[i] - mask));
  }
  return ciphertext;
}
/** @type {Mode[]} */
const modes = [];
for (const a of [-1, 0, 1]) for (const b of [-1, 0, 1]) {
  if (a || b) modes.push({type: "endpoints", a, b});
}
for (const sign of [-1, 1]) for (const type of
  ["cycling", "cipher-autokey", "plain-autokey"]) {
  modes.push({type, sign});
}
assert.equal(modes.length, 14);
const solved = p57.slice(7, 50);
assert.equal(solved.length, 43);
const tests = [];
for (const mode of modes) {
  const plain = decrypt(interior, mode);
  assert.deepEqual(encrypt(plain, mode), interior);
  assert.deepEqual(decrypt(encrypt(solved, mode), mode), solved);
  tests.push({mode, score: logTrigramMean(plain),
    ioc: ioc(plain), plaintext: transliterate(plain)});
}
tests.sort((a, b) => b.score - a.score);
const output = {
  input: {physicalPage: 55, runeCount: p55.length,
    wordLengths: lengths, exteriorCount: exterior.length, interiorCount: interior.length,
    exterior: transliterate(exterior), interior: transliterate(interior)},
  scores: {solvedP57First43: logTrigramMean(solved),
    nativeLp1WindowMinimum: nativeScores[0],
    nativeLp1WindowMedian: nativeScores[Math.floor(nativeScores.length / 2)],
    rawInterior: logTrigramMean(interior)},
  tests,
  controls: "Every mode exactly forward-reconstructs source input and recovers planted solved-p57 43-rune passage",
  conclusion: "No coherent original English-like GP29 plaintext in 14 source-frozen direct endpoint/exterior-key models"
};
console.log(JSON.stringify(output, null, 2));
assert.ok(tests[0].score < nativeScores[0],
  "If an original candidate reaches the native control range, investigate it");
