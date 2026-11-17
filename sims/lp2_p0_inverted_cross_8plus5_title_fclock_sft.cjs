"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/**
 * Original LP2 p0 full-title candidate and strict native plaintext-F inverse.
 * The art on pp0-2 shows centrally inverted, three-bar crosses. The phrase
 * INVERTED CROSS has 8+5 GP29 runes under the solved Cicada U-for-V rule.
 * Freeze just this title crib and the previously demonstrated LP1/p56
 * repeating-key, plaintext-F-transparent GP29 Vigenere operation.
 *
 * The title is a hypothesis. The historical cipher is authentic on known
 * texts, but its transfer to this page is not independently instructed.
 */
const book = JSON.parse(fs.readFileSync(path.join(
  __dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const unknownOpening = book.pages
  .filter(p => p.page >= 0 && p.page <= 2)
  .flatMap(p => p.indices);
const originalTitle = unknownOpening.slice(0, 13);
const GP = book.translit;
const candidateWords = [
  ["I", "N", "U", "E", "R", "T", "E", "D"],
  ["C", "R", "O", "S", "S"]
];
const candidate = candidateWords.flat().map(letter => GP.indexOf(letter));
assert(candidate.every(x => x >= 0));
assert.deepEqual(candidateWords.map(w => w.length), [8, 5]);
assert.equal(unknownOpening.length, 729);
assert.deepEqual(originalTitle,
  [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]);

// Ciphertext C=P+K (mod29). Every proposed title rune P is non-F,
// so its initial 13 runes consume exactly 13 key cells.
assert(candidate.every(x => x !== 0));
const key = originalTitle.map((c, i) => (c - candidate[i] + 29) % 29);
assert.deepEqual(key, [5,28,17,14,2,3,9,6,10,22,15,6,19]);
assert.deepEqual(candidate.map((p, i) => (p + key[i]) % 29),
  originalTitle);

/**
 * Complete set of valid key clocks after each ciphertext rune, assuming
 * that P=F must emit literal C=F without consuming the key. Ordinary
 * consumed-key output may produce C=F if its plaintext is non-F.
 * @param {number[]} cipher
 * @param {number[]} repeatedKey
 * @param {number} consumed Initial number of key symbols consumed
 * @param {number} start First zero-based source position to decode
 * @returns {{firstImpossible:number | null,maxStates:number,terminal:Set<number>,lastStates:number[]}}
 */
function allNativeFPaths(cipher, repeatedKey, consumed, start) {
  let states = new Set([consumed]);
  let maxStates = 1;
  for (let i = start; i < cipher.length; i++) {
    const c = cipher[i];
    const next = new Set();
    for (const q of states) {
      const plain = (c - repeatedKey[q % repeatedKey.length] + 29) % 29;
      if (plain !== 0) next.add(q + 1);
      if (c === 0) next.add(q);
    }
    if (next.size === 0) {
      return {firstImpossible: i, maxStates,
        terminal: next, lastStates: [...states].sort((a,b)=>a-b)};
    }
    states = next;
    maxStates = Math.max(maxStates, states.size);
  }
  return {firstImpossible: null, maxStates, terminal: states,
    lastStates: [...states].sort((a,b)=>a-b)};
}

/**
 * Native F-transparent GP29 encryption. Literal plaintext F is emitted
 * unchanged and does not consume key. No arbitrary guesswork is needed.
 * @param {number[]} plain
 * @param {number[]} repeatedKey
 * @returns {{cipher:number[],count:number}}
 */
function encrypt(plain, repeatedKey) {
  let q = 0;
  const cipher = plain.map(p => {
    if (p === 0) return 0;
    const c = (p + repeatedKey[q % repeatedKey.length]) % 29;
    q++;
    return c;
  });
  return {cipher, count: q};
}

const opening = allNativeFPaths(unknownOpening, key, 13, 13);
assert.equal(opening.firstImpossible, 137);
assert.equal(opening.maxStates, 3);
assert(opening.lastStates.length > 0);

const clearP57 = book.pages.find(p => p.page === 57).indices;
assert.equal(clearP57.length, 95);
const plant = encrypt(clearP57, key);
const positive = allNativeFPaths(plant.cipher, key, 0, 0);
assert.equal(positive.firstImpossible, null);
assert(positive.terminal.has(plant.count));
// A simple known-path reverse restores and reencrypts every original p57 rune.
let q = 0;
const recovered = plant.cipher.map((c, i) => {
  const p = clearP57[i];
  if (p === 0) {
    assert.equal(c, 0);
    return p;
  }
  const decoded = (c - key[q % key.length] + 29) % 29;
  assert.equal(decoded, p);
  q++;
  return decoded;
});
assert.deepEqual(recovered, clearP57);
assert.deepEqual(encrypt(recovered, key).cipher, plant.cipher);

const rawBody = unknownOpening.slice(13);
const directNoSkip = rawBody.map((c,i) => (c-key[i%key.length]+29)%29);
const count = Array.from({length:29},(_,i)=>directNoSkip.filter(x=>x===i).length);
const ioC = count.reduce((s,n)=>s+n*(n-1),0)/
  (directNoSkip.length*(directNoSkip.length-1));
assert(Math.abs(ioC - 0.034320428175176776)<1e-13);

console.log(JSON.stringify({
  source: "LP2 physical pp0-2, 2014 original JPEGs 17-19",
  visualPremise: "one three-bar cross rotated exactly 180 degrees, duplicated",
  hypotheticalTitle: "INUERTED CROSS",
  sourceTitle: originalTitle.map(x=>GP[x]).join(" "),
  plaintextTitleGP: candidate.map(x=>GP[x]).join(" "),
  titleLengthShape: [8,5],
  frozenKeyIndices: key,
  firstBlackFourCipher: unknownOpening.slice(13,17).map(x=>GP[x]),
  firstBlackFourNaivePlain: directNoSkip.slice(0,4).map(x=>GP[x]),
  firstImpossibleOriginalRune: opening.firstImpossible,
  lastReachableClocks: opening.lastStates,
  maximumSimultaneousClocks: opening.maxStates,
  noSkipBodyIoC: ioC,
  sourceNativeP57Plant: {
    originalClearRunes:95,
    recoveredRunes:95,
    forwardAndInverseExact:true
  },
  recoveredUnknownPagePlaintext: false,
  inferenceLimit:"Only hypothetical INVERTED CROSS plus repeating-title GP29 key and native-F bypass excluded; neither phrase nor model is authenticated."
},null,2));
console.log("PASS: motif-title exact initial reproduction; original gate fails at rune 137; 95/95 source-native positive");
