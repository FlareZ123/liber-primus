"use strict";

// Source-to-operand gate for the p0 red-title / 2013 DH candidate.
// This verifies the arithmetic and one natural p56-family consumer; it does
// not claim the 2013 source selects the p0 word-sum interpretation.

const fs = require("node:fs");
const assert = require("node:assert/strict");

const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8"));
const transcription = fs.readFileSync("resources/lp2-transcription.txt", "utf8");
const source = fs.readFileSync("resources/external/2013-tcp-server-signed-source.md", "utf8");
const pages = new Map(corpus.pages.map(p => [p.page, p]));
const p0 = pages.get(0);
assert(p0);
assert.equal(corpus.runes.length, 29);
assert.equal(corpus.prime.length, 29);
assert.equal(corpus.translit.length, 29);

const firstLine = transcription.split(/\r?\n/)[0];
const redTitle = firstLine.split(".")[0];
const [wordA, wordB] = redTitle.split("-");
assert(wordA && wordB, "p0 red title must have two source word fields");
const runeIndices = word => [...word].map(r => {
  const i = corpus.runes.indexOf(r);
  assert(i >= 0, \`unknown GP rune \${r}\`);
  return i;
});
const aIndices = runeIndices(wordA);
const bIndices = runeIndices(wordB);
assert.equal(aIndices.length, 8);
assert.equal(bIndices.length, 5);
assert.deepEqual([...aIndices, ...bIndices], p0.indices.slice(0, 13));

const primeSum = indices => indices.reduce((sum, i) => sum + corpus.prime[i], 0);
const sumA = primeSum(aIndices);
const sumB = primeSum(bIndices);
assert.equal(sumA, 347);
assert.equal(sumB, 315);

const p = 23;
const g = 5;
const mod = (n, m) => ((n % m) + m) % m;
function powMod(base, exponent, modulus) {
  let result = 1;
  while (exponent > 0) {
    if (exponent & 1) result = result * base % modulus;
    base = base * base % modulus;
    exponent = Math.floor(exponent / 2);
  }
  return result;
}
function discreteLog(base, target, modulus) {
  for (let exponent = 0; exponent < modulus - 1; exponent++) {
    if (powMod(base, exponent, modulus) === target) return exponent;
  }
  return null;
}
const publicA = mod(sumA, p);
const publicB = mod(sumB, p);
const exponentA = discreteLog(g, publicA, p);
const exponentB = discreteLog(g, publicB, p);
assert.equal(publicA, 2);
assert.equal(publicB, 16);
assert.equal(exponentA, 2);
assert.equal(exponentB, 8);
const sharedA = powMod(publicB, exponentA, p);
const sharedB = powMod(publicA, exponentB, p);
assert.equal(sharedA, 3);
assert.equal(sharedB, 3);

const fIndex = corpus.runes.indexOf("ᚠ");
const firstBlackCipher = p0.indices[13];
const firstBlackTranslit = corpus.translit[firstBlackCipher];
assert.equal(fIndex, 0);
assert.equal(firstBlackCipher, 2);
assert.equal(firstBlackTranslit, "TH");

// Candidate consumer: use the DH scalar 3 as the starting prime in the authentic
// prime-totient cipher. phi(3)=2; decrypting C=TH/index2 gives P=F/index0.
function phi(n) {
  let count = 0;
  for (let k = 1; k <= n; k++) {
    let a = k, b = n;
    while (b) [a, b] = [b, a % b];
    if (a === 1) count++;
  }
  return count;
}
const firstKey = phi(sharedA);
const candidatePlain = mod(firstBlackCipher - firstKey, 29);
assert.equal(firstKey, 2);
assert.equal(candidatePlain, fIndex);
const transparentFConflict = candidatePlain === fIndex && firstBlackCipher !== fIndex;

// The global plaintext-F skip is established by blind recovery on three
// independently solved Cicada controls, but applying the p56 family to p0
// remains a hypothesis. The contradiction is conditional on that transfer.
const directBlackWord = firstLine.split(".")[1].split("-")[0];
const blackWordIndices = runeIndices(directBlackWord);
const toText = indices => indices.map(i => corpus.translit[i]).join("");
const shiftMinus3 = blackWordIndices.map(i => mod(i - 3, 29));
const shiftPlus3 = blackWordIndices.map(i => mod(i + 3, 29));
const atbashMinus3 = blackWordIndices.map(i => mod(28 - i - 3, 29));

assert(source.includes("BASE29"));
assert(source.includes("DH"));
assert(source.includes("NEXT"));

console.log(JSON.stringify({
  p0RedTitle: {
    words: [toText(aIndices), toText(bIndices)],
    runeLengths: [aIndices.length, bIndices.length],
    primeSums: [sumA, sumB],
    residuesMod23: [publicA, publicB],
    secondWordFinalRuneIndex: bIndices.at(-1),
    lengthDifference: aIndices.length - bIndices.length
  },
  sourceWorkedDHGroup: { modulus: p, generator: g },
  derivedDH: {
    discreteLogs: [exponentA, exponentB],
    sharedFromA: sharedA,
    sharedFromB: sharedB
  },
  firstBlackRune: {
    gpIndex: firstBlackCipher,
    transliteration: firstBlackTranslit,
    candidatePrimeTotientStart: sharedA,
    firstKey: firstKey,
    inversePlaintextIndex: candidatePlain,
    inversePlaintextRune: corpus.runes[candidatePlain],
    transparentFConflict,
    scope: "conditional on transferring the authentic p56 prime-totient/F-skip cipher to p0"
  },
  directShiftControls: {
    firstBlackWord: toText(blackWordIndices),
    minus3: toText(shiftMinus3),
    plus3: toText(shiftPlus3),
    atbashMinus3: toText(atbashMinus3)
  },
  sourceObstruction: [
    "The signed 2013 source's worked p=23,g=5 DH exchange does not select p0 red-word prime sums as public shares.",
    "Its server/client role split uses participant-chosen DH values; no organizer-selected LP2 mapping is supplied.",
    "No KDF or GP29 keystream serialization maps shared scalar 3 to an LP2 key."
  ],
  decision: "The p0 DH arithmetic is a reproducible clue-motivated candidate, not an authenticated LP2 key. Its direct p56 prime-totient consumer is rejected by the first-symbol F-skip constraint if transferred to p0. No unknown plaintext is recovered."
}, null, 2));
