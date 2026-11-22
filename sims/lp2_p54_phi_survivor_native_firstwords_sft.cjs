"use strict";

/**
 * Original-source GP29 word-prefix control on the six surviving p54–55
 * starting-prime candidates from the exact 5,000-start native p56 gate.
 * No user-selected crib, new key search, or file mutation.
 * Run: node sims/lp2_p54_phi_survivor_native_firstwords_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"
));
const printing = fs.readFileSync(
  path.join(root, "resources", "lp2-transcription.txt"), "utf8"
);
const opening = "ᚪ-ᛗᛝᛞᛡᚦᛉᛁᛗ.";
const physicalPages = printing.split("%");
assert.equal(
  physicalPages.filter((section) => section.trimStart().startsWith(opening)).length,
  1,
  "Original p54 one-rune/eight-rune full-stop opening must be unique"
);
const original = corpus.pages.find((page) => page.page === 54).indices.slice(0, 9);
assert.deepEqual(original, [24, 19, 21, 23, 27, 2, 14, 10, 19]);
assert(original.every((value) => value !== 0), "No first-word F ambiguity");

const primes = [];
for (let n = 2; primes.length < 5000; n += 1) {
  let isPrime = true;
  for (let k = 2; k * k <= n; k += 1) {
    if (n % k === 0) {
      isPrime = false;
      break;
    }
  }
  if (isPrime) primes.push(n);
}

/**
 * Exactly reproduces the genuine p56 prime-totient consuming branch.
 * The nine original ciphertext glyphs here are all non-F, so bypass
 * branches and later skip masks cannot alter this opening.
 * @param {number[]} ciphertext Original GP29 indices.
 * @param {number} start Zero-based ordinal of first prime.
 * @returns {number[]} GP29 plaintext-index candidate.
 */
function decryptOpening(ciphertext, start) {
  return ciphertext.map((value, index) =>
    ((value - (primes[start + index] - 1)) % 29 + 29) % 29
  );
}

/** @type {Array<{start: number, first: string, second: string}>} */
const survivors = [
  { start: 167, first: "X", second: "YALOETYTS" },
  { start: 168, first: "TH", second: "OEEEEOXLGP" },
  { start: 3047, first: "J", second: "RTHIADNGBEAR" },
  { start: 4121, first: "E", second: "NNOETEOXTHU" },
  { start: 4365, first: "Y", second: "MJWTEOLSE" },
  { start: 4366, first: "A", second: "NCEOHHMNT" }
];

for (const { start, first, second } of survivors) {
  const plain = decryptOpening(original, start);
  const observedFirst = corpus.translit[plain[0]];
  const observedSecond = plain.slice(1).map((index) => corpus.translit[index]).join("");
  assert.equal(observedFirst, first);
  assert.equal(observedSecond, second);
  console.log(
    JSON.stringify({
      start, firstPrime: primes[start], word1: observedFirst,
      word2: observedSecond, fullOpening: plain
    })
  );
}
assert.equal(survivors.filter(({ first }) => first === "A" || first === "I").length, 1);
assert.equal(survivors.find(({ first }) => first === "A").second, "NCEOHHMNT");

// Independent solved-p56 beginning: AN END, s=0, no F in opening.
const p56 = corpus.pages.find((page) => page.page === 56).indices.slice(0, 5);
const solved = decryptOpening(p56, 0);
assert.deepEqual(solved, [24, 9, 18, 9, 23]);
assert.equal(solved.map((value) => corpus.translit[value]).join(""), "ANEND");
console.log("PASS: original p54 first two words and solved p56 AN END control.");
