"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const raw = fs.readFileSync(
  path.join(ROOT, "resources/lp2-transcription.txt"), "utf8");
const runeIds = new Map(corpus.runes.map((rune, i) => [rune, i]));

/**
 * Keep actual printed word boundaries while joining physical lines/pages.
 * @param {string} input
 * @returns {number[][]}
 */
function parseWords(input) {
  const words = [];
  let current = [];
  function finish() {
    if (current.length) words.push(current);
    current = [];
  }
  for (const character of input) {
    const id = runeIds.get(character);
    if (id !== undefined) current.push(id);
    else if (character === "/" || character === "%" || /\s/u.test(character)) {
      // Physical layout and pages do not end a word.
    } else finish();
  }
  finish();
  return words;
}

/** @param {number[]} word @returns {number} */
function sum(word) {
  return word.reduce((acc, id) => acc + corpus.prime[id], 0);
}

/** @param {number[]} word @returns {number} */
function checksum(word) {
  return sum(word) % 29;
}

const ciphertext = parseWords(raw.split("%").slice(0, 55).join("%"));
assert.equal(ciphertext.length, 2896);
assert.equal(ciphertext.reduce((n, w) => n + w.length, 0), 12956);
assert.deepEqual(ciphertext.flat(), corpus.pages
  .filter(page => page.page < 56)
  .flatMap(page => page.indices));

const ones = ciphertext.filter(word => word.length === 1);
assert.equal(ones.length, 83);

// Native GP words "A" and "I"; admit the archaic vocative "O" as well.
// This is a generously enlarged ordinary-English singleton inventory.
const allowed = ["A", "I", "O"].map(text => {
  const value = corpus.translit.indexOf(text);
  assert(value >= 0);
  return {word: text, index: value, prime: corpus.prime[value]};
});
assert.deepEqual(allowed.map(row => row.prime), [97, 31, 7]);

const exact = new Set(allowed.map(row => row.prime));
const residue = new Set(allowed.map(row => row.prime % 29));
const exactCompatible = ones.filter(word => exact.has(sum(word)));
const modCompatible = ones.filter(word => residue.has(checksum(word)));
assert.equal(exactCompatible.length, 10);
assert.equal(modCompatible.length, 14);
assert.equal(ones.length - exactCompatible.length, 73);
assert.equal(ones.length - modCompatible.length, 69);

// Four independently printed one-rune ciphertext prime values suffice to
// exclude checksum conservation modulo EVERY integer m >= 2.
// For m >= 11, distinct residues of 2,3,5,7 exceed the three allowed
// A/I/O plaintext residues. Even m<11 fail at ciphertext 2 because every
// A/I/O prime is odd. The remaining odd m=3,5,7,9 fail by direct witnesses.
const witness = [2, 3, 5, 7];
for (const value of witness) {
  assert(ones.some(word => sum(word) === value),
    `original singleton prime ${value} must exist`);
}
const oddSmallWitness = new Map([[3, 2], [5, 3], [7, 2], [9, 2]]);
for (const [modulus, value] of oddSmallWitness) {
  assert(!allowed.some(row => row.prime % modulus === value % modulus),
    `modulus ${modulus} is excluded by original singleton ${value}`);
}
for (let modulus = 2; modulus <= 10; modulus++) {
  if (modulus % 2 === 0) {
    assert(!allowed.some(row => row.prime % modulus === 2 % modulus));
  } else assert(oddSmallWitness.has(modulus));
}
for (let modulus = 11; modulus <= 256; modulus++) {
  assert.equal(new Set(witness.map(value => value % modulus)).size, 4);
  assert.equal(new Set(allowed.map(row => row.prime % modulus)).size <= 3, true);
  assert(witness.some(value =>
    !allowed.some(row => row.prime % modulus === value % modulus)));
}

// Strong independent positive plant: reversing each word can be a secret
// wordwise permutation, but always preserves its prime-weight sum.
// Use both synthetic A/I/O singletons and authentic solved p57 runes.
const knownWords = parseWords(raw.split("%")[56]);
assert.equal(knownWords.reduce((n, w) => n + w.length, 0), 95);
const plant = [
  ...Array.from({length: 83}, (_, i) => [allowed[i % 3].index]),
  ...knownWords
];
const rearranged = plant.map(word => word.slice().reverse());
assert.deepEqual(rearranged.map(sum), plant.map(sum));
assert.deepEqual(rearranged.map(checksum), plant.map(checksum));
assert.equal(plant.slice(0, 83).filter(word => residue.has(checksum(word))).length, 83);

const alphabet = [...new Set(ones.map(word => corpus.translit[word[0]]))]
  .sort();
console.log(JSON.stringify({
  premise: "Original printed word boundaries survive, plaintext is native ordinary English, and the encryption preserves each word's GP-prime sum",
  source: {ciphertextRunes: 12956, printedWords: 2896, singleRuneWords: 83,
    distinctSingletonGlyphs: alphabet.length},
  permissibleNativeSingletons: allowed,
  exactSum: {compatible: exactCompatible.length,
    impossible: 73},
  modulo29Sum: {compatible: modCompatible.length,
    impossible: 69},
  allIntegerModuliAtLeast2Excluded: true,
  universalWitness: {originalSingletonPrimes: witness,
    proof: "Every even modulus is contradicted by prime2; odd moduli 3,5,7,9 have explicit witnesses; moduli >=11 distinguish the four original singleton primes 2,3,5,7, but native plaintext A/I/O supplies at most three residues."},
  positivePlant: {singletons: 83, solvedP57RuneCount: 95,
    sumPreservedExactly: true, residuePreservedExactly: true},
  interpretation: "Reject exact and all nontrivial integer-modulus word-prime checksum conservation for ordinary native-English plaintext. Ciphertext word-prime sums may still be deliberate navigation data; no unknown plaintext, key, or cipher is recovered."
}, null, 2));
