"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/** @param {string} name @returns {string} */
const read = (name) => fs.readFileSync(path.resolve(__dirname, "..", name), "utf8")
  .replace(/\r/g, "");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
assert.ok(signed.includes("their numbers are the direction"));
const page54 = corpus.pages[54].indices;
const page55 = corpus.pages[55].indices;
assert.equal(page54.length, 232);
assert.equal(page55.length, 76);
const rubric = ink.pages.find((p) => p.page === 54).red_spans[0];
assert.equal(rubric.start, 0);
assert.equal(rubric.length, 9);
assert.equal(page54[0], 24); // Original giant A, one whole printed word.
const ciphertext = page54.slice(1).concat(page55);
assert.equal(ciphertext.length, 307);
// One historically documented but *unconfirmed* 2014 red-title crib:
// The second p54 red complete word (8 runes) might read DIRECTION.
// Ior/IA/IO occupies one GP rune. No plaintext is asserted as fact.
const direction = [23, 10, 4, 18, 5, 16, 27, 9];
assert.deepEqual(ciphertext.slice(0, 8), [19, 21, 23, 27, 2, 14, 10, 19]);
/** @param {number} x @returns {number} */
const mod = (x) => (x % 29 + 29) % 29;
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const frequencies = Array(29).fill(0);
  for (const letter of a) frequencies[letter]++;
  return frequencies.reduce((sum, n) => sum + n * (n - 1), 0)
    / (a.length * (a.length - 1));
}
/** @param {string} model @param {number[]} ciphertext @returns {number[]} */
function inverse(model, ciphertext) {
  const plain = direction.slice();
  const titleKey = direction.map((p, i) => mod(ciphertext[i] - p));
  for (let i = 8; i < ciphertext.length; i++) {
    let known;
    if (model === "repeating8") known = titleKey[i % 8];
    else if (model === "plaintext-autokey8") known = plain[i - 8];
    else if (model === "ciphertext-autokey8") known = ciphertext[i - 8];
    else throw Error("invalid frozen model");
    plain.push(mod(ciphertext[i] - known));
  }
  return plain;
}
/** @param {string} model @param {number[]} plain @returns {number[]} */
function forward(model, plain) {
  const cipher = ciphertext.slice(0, 8);
  const titleKey = direction.map((p, i) => mod(cipher[i] - p));
  for (let i = 8; i < plain.length; i++) {
    let known;
    if (model === "repeating8") known = titleKey[i % 8];
    else if (model === "plaintext-autokey8") known = plain[i - 8];
    else if (model === "ciphertext-autokey8") known = cipher[i - 8];
    else throw Error("bad frozen model");
    cipher.push(mod(plain[i] + known));
  }
  return cipher;
}
const models = ["repeating8", "plaintext-autokey8", "ciphertext-autokey8"];
const results = [];
for (const model of models) {
  const plain = inverse(model, ciphertext);
  assert.deepEqual(plain.slice(0, 8), direction);
  assert.deepEqual(forward(model, plain), ciphertext);
  const remaining = plain.slice(8);
  const testPlain = Array.from({ length: 307 }, (_, i) =>
    i < 8 ? direction[i] : corpus.pages[57].indices[(i - 8) % 95]);
  // Encode with a key frozen by the same eight-rune title and test the
  // authentic native-source positive completely beyond the primer.
  const testCipher = forward(model, testPlain);
  const testRecovered = inverse(model, testCipher);
  assert.deepEqual(testRecovered, testPlain);
  const output = {
    model,
    originalEntire307IoC: ioc(plain),
    originalHeldOut299IoC: ioc(remaining),
    originalPage55IoC: ioc(plain.slice(231)),
    recoveredOriginalPage54BodyPrefix: plain.slice(8, 43)
      .map((index) => corpus.translit[index]).join("-"),
    nativeSolvedP57PlantRecovered: testRecovered.length,
  };
  assert.ok(output.originalHeldOut299IoC < 0.04,
    "Native English concentration unexpectedly high; inspect original!");
  results.push(output);
}
console.log(JSON.stringify({
  status: "PASS",
  statusOfCrib: "CONDITIONAL 2014 DIRECTION guess, not authenticated plaintext",
  sourceChosenReceiver: "p54 eight-rune red word then all p54/p55, p54 first big A is separate",
  originalSourceCipherLength: ciphertext.length,
  originalHeldoutLength: ciphertext.length - 8,
  sourceRubric: ciphertext.slice(0, 8),
  allegedPlainRubric: direction,
  titleDerivedRepeatKey: ciphertext.slice(0, 8)
    .map((c, i) => mod(c - direction[i])),
  matchedOriginalSolverOutputs: results,
  decision: "Three complete native-GP cipher classes produce no held-out original prose",
}, null, 2));
