"use strict";

/**
 * Independent audit of the p28 literal-DH reconstruction.
 *
 * Rebuilds the manuscript-wide outer-H/count DH family and asks whether the
 * recovered DH inverse exponent also produces the labeled chain K->A->B->b
 * in GP29. The test deliberately weakens the original seven-distinct-fields
 * control so the result does not depend on a distinctness requirement.
 *
 * Node.js 22, CommonJS, read-only, no third-party dependencies.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const parts = transcription.split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const primeValues = new Set([2, 3, 5, 7, 11, 13, 17, 19, 23]);

/** @param {number} value @param {number} modulus @returns {number} */
function mod(value, modulus) {
  return ((value % modulus) + modulus) % modulus;
}

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function modPow(base, exponent, modulus) {
  let result = 1 % modulus;
  let x = mod(base, modulus);
  let e = exponent;
  while (e > 0) {
    if (e & 1) result = (result * x) % modulus;
    x = (x * x) % modulus;
    e = Math.floor(e / 2);
  }
  return result;
}

/** @param {number} a @param {number} b @returns {number} */
function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

/** @param {number} value @param {number} modulus @returns {number|null} */
function inverse(value, modulus) {
  if (gcd(value, modulus) !== 1) return null;
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if ((value * candidate) % modulus === 1) return candidate;
  }
  return null;
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {string} text @returns {number[]} */
function values(text) {
  return [...text]
    .map((char) => runeIndex.get(char))
    .filter((value) => value !== undefined);
}

/** @param {string} line @returns {number[][]} */
function fragments(line) {
  return line
    .split(/[-.]/u)
    .map(values)
    .filter((fragment) => fragment.length > 0);
}

/** @param {number[]} fragment @returns {number[]} */
function outerH(fragment) {
  if (fragment.length < 2) return [];
  return [
    mod(fragment[0] - fragment.at(-1), 29),
    mod(fragment[0] + fragment.at(-1), 29),
  ];
}

const variants = [];
let runeLines = 0;
let rawSlashSegments = 0;
const literalDhLines = [];

for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const lines = physicalPart(page).trim().split("/");
  rawSlashSegments += lines.length;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const lineFragments = fragments(lines[lineIndex]);
    if (!lineFragments.length) continue;
    runeLines += 1;

    const outputs = lineFragments.flatMap(outerH);
    const outputSet = new Set(outputs);
    const startsDh =
      lineFragments[0].length >= 2 &&
      lineFragments[0][0] === 23 &&
      lineFragments[0][1] === 8;

    if (startsDh) {
      literalDhLines.push({
        page,
        line: lineIndex + 1,
        fragmentCount: lineFragments.length,
        outputs,
      });
    }

    for (const origin of ["one", "zero"]) {
      const lineValue = origin === "one" ? lineIndex + 1 : lineIndex;
      if (lineValue <= 0) continue;

      for (const assignment of ["g=fragments,a=line", "g=line,a=fragments"]) {
        const g =
          assignment === "g=fragments,a=line"
            ? lineFragments.length
            : lineValue;
        const a =
          assignment === "g=fragments,a=line"
            ? lineValue
            : lineFragments.length;

        for (const p of outputSet) {
          if (!primeValues.has(p) || g <= 0 || g >= p) continue;

          for (const b of outputSet) {
            if (b <= 0 || b >= p) continue;

            const A = modPow(g, a, p);
            const B = modPow(g, b, p);
            const K = modPow(A, b, p);
            if (K !== modPow(B, a, p)) continue;
            if (!outputSet.has(A) || !outputSet.has(B) || !outputSet.has(K)) {
              continue;
            }

            const e = inverse(b, p - 1);
            const crossMod29Chain =
              e !== null &&
              modPow(K, e, 29) === A &&
              modPow(A, e, 29) === B &&
              modPow(B, e, 29) === b;

            variants.push({
              page,
              line: lineIndex + 1,
              origin,
              assignment,
              p,
              g,
              a,
              b,
              A,
              B,
              K,
              e,
              crossMod29Chain,
            });
          }
        }
      }
    }
  }
}

assert.equal(rawSlashSegments, 649);
assert.equal(runeLines, 594);
assert.equal(rawSlashSegments - runeLines, 55);
assert.deepEqual(literalDhLines, [{
  page: 28,
  line: 6,
  fragmentCount: 5,
  outputs: [15, 2, 14, 4, 12, 12, 23, 12, 8, 19],
}]);

const target = {
  page: 28,
  line: 6,
  origin: "one",
  assignment: "g=fragments,a=line",
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
  e: 3,
  crossMod29Chain: true,
};

const nontrivial = variants.filter((row) =>
  [row.g, row.b, row.A, row.B, row.K].every((value) => value > 1)
);
const invertibleNontrivial = nontrivial.filter((row) => row.e !== null);
const distinct = variants.filter((row) =>
  new Set([row.p, row.g, row.a, row.b, row.A, row.B, row.K]).size === 7
);

assert.equal(variants.length, 1628);
assert.equal(new Set(variants.map((row) => `${row.page}:${row.line}`)).size, 274);
assert.equal(nontrivial.length, 711);
assert.equal(new Set(nontrivial.map((row) => `${row.page}:${row.line}`)).size, 212);
assert.equal(invertibleNontrivial.length, 289);
assert.equal(
  new Set(invertibleNontrivial.map((row) => `${row.page}:${row.line}`)).size,
  133
);
assert.equal(distinct.length, 60);
assert.equal(new Set(distinct.map((row) => `${row.page}:${row.line}`)).size, 31);

for (const family of [nontrivial, invertibleNontrivial, distinct]) {
  assert.deepEqual(family.filter((row) => row.crossMod29Chain), [target]);
}

assert.equal(modPow(target.K, target.e, 29), target.A);
assert.equal(modPow(target.A, target.e, 29), target.B);
assert.equal(modPow(target.B, target.e, 29), target.b);

console.log(JSON.stringify({
  status: "PASS",
  sourceCensus: {
    rawSlashSegments,
    runeLines,
    nonRuneSlashSegments: rawSlashSegments - runeLines,
    literalDhLines,
  },
  family: {
    algebraValid: {
      variants: variants.length,
      lines: new Set(variants.map((row) => `${row.page}:${row.line}`)).size,
    },
    nontrivial: {
      definition: "g,b,A,B,K > 1",
      variants: nontrivial.length,
      lines: new Set(nontrivial.map((row) => `${row.page}:${row.line}`)).size,
      crossMod29ChainHits: nontrivial.filter((row) => row.crossMod29Chain),
    },
    invertibleNontrivial: {
      variants: invertibleNontrivial.length,
      lines: new Set(invertibleNontrivial.map((row) => `${row.page}:${row.line}`)).size,
      crossMod29ChainHits:
        invertibleNontrivial.filter((row) => row.crossMod29Chain),
    },
    allSevenDistinct: {
      variants: distinct.length,
      lines: new Set(distinct.map((row) => `${row.page}:${row.line}`)).size,
      crossMod29ChainHits: distinct.filter((row) => row.crossMod29Chain),
    },
  },
  target,
  chain: {
    expression: "K^e -> A, A^e -> B, B^e -> b (mod29), e=b^-1 mod(p-1)",
    values: [target.K, target.A, target.B, target.b],
  },
  classification:
    "Independent source-family discriminator. The p28 literal-DH tuple is the sole nontrivial manuscript-wide outer-H/count DH variant whose standard DH inverse exponent also closes the labeled K->A->B->b chain in GP29. This strengthens the source-derived exponent-3 route without depending on a seven-field distinctness condition.",
}, null, 2));
