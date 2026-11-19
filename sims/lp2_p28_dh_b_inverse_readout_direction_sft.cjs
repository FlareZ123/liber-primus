"use strict";

/**
 * P28 source-only direction resolver for the READ OUT candidate.
 *
 * New premise from the literal-DH-line reconstruction:
 * p=23,g=5,a=6,b=15,A=8,B=19,K=2 is recovered from visible line structure
 * without p50 numeral coercion and without a distinctness selection rule.
 *
 * Standard DH inversion selects exponent3 because b=15 is the only private
 * exponent invertible modulo p-1=22, and B^3 mod23=g. This resolves the
 * previously symmetric GP29 cube directions e=3 versus e=19 without using
 * English output scoring.
 *
 * The visible-layer count convention remains charged explicitly:
 * one operation per visible layer gives (3,27); zero-indexing gives (1,9).
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const parts = transcription.split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);

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
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x;
}

/** @param {number} value @param {number} modulus @returns {number|null} */
function modularInverse(value, modulus) {
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

/**
 * @param {string} text
 * @returns {{runes:number[],words:Array<{word:number,start:number,end:number,len:number,values:number[]}>}}
 */
function parsePage(text) {
  const runes = [];
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;

  const flush = () => {
    if (!current.length) return;
    words.push({
      word: words.length + 1,
      start,
      end: offset - 1,
      len: current.length,
      values: current.slice(),
    });
    current = [];
  };

  for (const char of [...text]) {
    if (runeSet.has(char)) {
      const value = runeIndex.get(char);
      runes.push(value);
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if (char === "-" || char === ".") {
      flush();
    }
  }
  flush();
  return { runes, words };
}

/** @param {number[]} values @returns {string} */
function spell(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

// Source-derived DH tuple from the literal p28 DH line.
const dh = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2 };
assert.equal(modPow(dh.g, dh.a, dh.p), dh.A);
assert.equal(modPow(dh.g, dh.b, dh.p), dh.B);
assert.equal(modPow(dh.A, dh.b, dh.p), dh.K);
assert.equal(modPow(dh.B, dh.a, dh.p), dh.K);

// Standard exponent inversion in the DH multiplicative group.
const groupOrder = dh.p - 1;
const aInverse = modularInverse(dh.a, groupOrder);
const bInverse = modularInverse(dh.b, groupOrder);
assert.equal(groupOrder, 22);
assert.equal(aInverse, null);
assert.equal(bInverse, 3);
assert.equal(modPow(dh.B, bInverse, dh.p), dh.g);

// GP29 cube orbit and the previously unresolved direction pair.
const cubeOrbit = [1, 3, 9, 27, 25, 19];
for (let i = 1; i < cubeOrbit.length; i += 1) {
  assert.equal(cubeOrbit[i], modPow(3, i, 28));
}
assert.equal(modPow(3, 6, 28), 1);
assert.equal(modularInverse(3, 28), 19);

// The full DH-labeled chain selects the same forward direction.
assert.equal(modPow(dh.K, bInverse, 29), dh.A);
assert.equal(modPow(dh.A, bInverse, 29), dh.B);
assert.equal(modPow(dh.B, bInverse, 29), dh.b);

// Exact p28 source object.
const p28 = parsePage(physicalPart(28));
assert.equal(p28.runes.length, 269);
const center = (p28.runes.length - 1) / 2;
assert.equal(center, 134);
const pageWord = p28.words[27];
assert.deepEqual(pageWord, {
  word: 28,
  start: 135,
  end: 139,
  len: 5,
  values: [28, 24, 10, 1, 20],
});
assert.equal(pageWord.start, center + 1);
const source = [p28.runes[center], ...pageWord.values];
assert.deepEqual(source, [9, 28, 24, 10, 1, 20]);

// Existing visible-layer convention gate.
const centerLayers = 1;
const wordLayers = Math.ceil(pageWord.len / 2);
assert.equal(wordLayers, 3);
const actionCountPair = [
  modPow(bInverse, centerLayers, 28),
  modPow(bInverse, wordLayers, 28),
];
const zeroIndexedPair = [
  modPow(bInverse, centerLayers - 1, 28),
  modPow(bInverse, wordLayers - 1, 28),
];
assert.deepEqual(actionCountPair, [3, 27]);
assert.deepEqual(zeroIndexedPair, [1, 9]);

const actionCountOutput = [
  modPow(source[0], actionCountPair[0], 29),
  ...source.slice(1).map((value) => modPow(value, actionCountPair[1], 29)),
];
const zeroIndexedOutput = [
  modPow(source[0], zeroIndexedPair[0], 29),
  ...source.slice(1).map((value) => modPow(value, zeroIndexedPair[1], 29)),
];
assert.deepEqual(actionCountOutput, [4, 28, 23, 3, 1, 16]);
assert.equal(spell(actionCountOutput), "READOUT");
assert.deepEqual(zeroIndexedOutput, [9, 28, 25, 18, 1, 23]);

// The previously symmetric reverse cube direction changes only the center
// exponent when the outer word transform remains inversion exponent27.
const reverseDirectionPair = [19, 27];
const reverseDirectionOutput = [
  modPow(source[0], reverseDirectionPair[0], 29),
  ...source.slice(1).map((value) => modPow(value, reverseDirectionPair[1], 29)),
];
assert.deepEqual(reverseDirectionOutput, [5, 28, 23, 3, 1, 16]);

console.log(JSON.stringify({
  status: "PASS",
  sourceDerivedDh: dh,
  dhExponentInversion: {
    groupOrder,
    aInverse,
    bInverse,
    check: {
      expression: "B^(b^-1 mod (p-1)) mod p",
      value: modPow(dh.B, bInverse, dh.p),
      equalsG: modPow(dh.B, bInverse, dh.p) === dh.g,
    },
  },
  directionGate: {
    forwardExponent: bInverse,
    reverseGp29Exponent: modularInverse(bInverse, 28),
    forwardDhBridge: [
      modPow(dh.K, bInverse, 29),
      modPow(dh.A, bInverse, 29),
      modPow(dh.B, bInverse, 29),
    ],
    labels: ["A", "B", "b"],
  },
  p28Source: {
    center,
    pageWord,
    source,
    centerLayers,
    wordLayers,
  },
  layerConventions: {
    actionCount: {
      exponents: actionCountPair,
      output: actionCountOutput,
      text: spell(actionCountOutput),
    },
    zeroIndexed: {
      exponents: zeroIndexedPair,
      output: zeroIndexedOutput,
      text: spell(zeroIndexedOutput),
    },
  },
  reverseDirectionControl: {
    exponents: reverseDirectionPair,
    output: reverseDirectionOutput,
    text: spell(reverseDirectionOutput),
  },
  classification:
    "source-derived direction resolver: the literal-DH-line tuple makes b=15 the only invertible private exponent modulo22, so b^-1=3 independently selects the forward cube direction e=3 over e=19. The visible-layer action-count convention then yields (3,27) and READOUT; the zero-index layer rival (1,9) remains an explicit convention caveat.",
}, null, 2));
