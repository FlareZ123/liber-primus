#!/usr/bin/env node
"use strict";

// Reproduce the conditional p55 BASE29/DH register closure.
// Run: node sims/p55_base29_dh_register_closure_sft.cjs
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const annotations = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-ink-annotations.json"), "utf8"));
const p54 = corpus.pages.find(p => p.page === 54).indices;
const p55 = corpus.pages.find(p => p.page === 55).indices;
const p55Ann = annotations.pages.find(p => p.page === 55);
const p57Ann = annotations.pages.find(p => p.page === 57);
const wordLengths = [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];

assert.equal(p55.length, 76);
assert.equal(wordLengths.reduce((a,b)=>a+b,0), 76);
assert.deepEqual(p55Ann.large_punctuation, [[76,13,"red"]]);
assert.deepEqual(p57Ann.red_spans.map(x=>[x.start,x.length]), [[0,7]]);
assert.deepEqual(p57Ann.large_punctuation, [[7,13,"red"],[95,23,"red"]]);

const edge = [];
const interior = [];
let offset = 0;
for (const length of wordLengths) {
  const word = p55.slice(offset, offset + length);
  edge.push(word[0]);
  if (length > 1) edge.push(word[length - 1]);
  if (length > 2) interior.push(...word.slice(1, -1));
  offset += length;
}
assert.equal(edge.length, 33);
assert.equal(interior.length, 43);

function base29(digits) {
  return digits.reduce((n, d) => n * 29n + BigInt(d), 0n);
}
function modPow(base, exponent, modulus) {
  let b = BigInt(base), e = BigInt(exponent), m = BigInt(modulus), out = 1n;
  while (e > 0n) {
    if (e & 1n) out = out * b % m;
    b = b * b % m;
    e >>= 1n;
  }
  return out;
}
const wholeN = base29(p55);
const edgeN = base29(edge);
const innerN = base29(interior);
const whole23 = Number(wholeN % 23n);
const edge23 = Number(edgeN % 23n);
const inner22 = Number(innerN % 22n);

// Positive control for positional conversion demonstrated by signed BASE29: 3301 -> 3QO.
assert.equal(base29([3, 26, 24]), 3301n);

// Visual counts are manually transcribed from the original images:
// p57 terminal red grid = 5 columns, 9 rows, 23 red dots;
// p55/p57 red marker = 13; tree ornaments = 8 filled + 2 hollow.
const visual = { generatorColumns: 5, modulusDots: 23, exponentMarks: 13, filledCircles: 8, hollowCircles: 2 };
const g = visual.generatorColumns, p = visual.modulusDots, a = visual.exponentMarks;
const A = Number(modPow(g, a, p));
const b = inner22;
const B = Number(modPow(g, b, p));
const KfromA = Number(modPow(A, b, p));
const KfromB = Number(modPow(B, a, p));

assert.equal(edge23, A);
assert.equal(B, visual.filledCircles);
assert.equal(KfromA, whole23);
assert.equal(KfromB, whole23);
assert.equal(p - edge23, visual.hollowCircles);

// Control: include the ten preceding p54 runes of the word carried into p55.
const carriedWord = [...p54.slice(-10), p55[0]];
const completeWordEdge = [carriedWord[0], carriedWord[carriedWord.length - 1], ...edge.slice(1)];
const completeWordInterior = [...carriedWord.slice(1, -1), ...interior];
assert.equal(completeWordEdge.length, 34);
assert.equal(completeWordInterior.length, 52);
const carryControl = {
  outer34Mod23: Number(base29(completeWordEdge) % 23n),
  inner52Mod22: Number(base29(completeWordInterior) % 22n)
};
assert.deepEqual(carryControl, { outer34Mod23: 4, inner52Mod22: 9 });

console.log(JSON.stringify({
  classification: "conditional DH arithmetic closure; not plaintext or a validated LP2 key",
  visual,
  pageLocalRegisters: { whole76Mod23: whole23, outer33Mod23: edge23, inner43Mod22: inner22 },
  dh: { g, p, a, A, b, B, sharedFromA: KfromA, sharedFromB: KfromB },
  secondaryCheck: { pMinusA: p - A, hollowCircles: visual.hollowCircles },
  completeWordCarryControl: carryControl,
  warning: "The closure depends on treating the p55 page-carry rune as a page-local singleton. Complete-word segmentation breaks it; the 2013 signed protocol authenticates BASE29/DH but does not select these LP2 parameters or a key consumer."
}, null, 2));
