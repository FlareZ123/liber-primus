"use strict";

/**
 * Solved p57 circumference instruction -> p28 READ OUT exponent selector.
 *
 * This test uses only solved p57 text, the original p50 table, original LP2
 * transcription, and the already source-selected p57 FIND -> p28 route.
 * It derives the DH state from the p57 tail register before inspecting the
 * p28 transformed output.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function modPow(base, exponent, modulus) {
  let out = 1;
  let x = base % modulus;
  let e = exponent;
  while (e > 0) {
    if (e & 1) out = out * x % modulus;
    x = x * x % modulus;
    e >>= 1;
  }
  return out;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");

const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {string} token @returns {number} */
function decode60(token) {
  const high = alphabet60.indexOf(token[0]);
  const low = alphabet60.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * 60 + low;
}

/** @param {number} value @returns {number[]} */
function pair29(value) {
  return [Math.floor(value / 29), value % 29];
}

/** @param {number[]} values @returns {number} */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

/** @param {number[]} values @returns {string} */
function translit(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

/** @param {string} text @returns {number[][]} */
function parseRuneWords(text) {
  const words = [];
  let current = [];

  function flush() {
    if (!current.length) return;
    words.push(current.slice());
    current = [];
  }

  for (const character of [...text]) {
    const value = runeIndex.get(character);
    if (value !== undefined) {
      current.push(value);
    } else if (current.length && "•⁘⁜⁚ \n".includes(character)) {
      flush();
    }
  }
  flush();
  return words;
}

/**
 * Parse physical-page printed words while preserving rune offsets.
 * @param {string} text
 * @returns {Array<{index:number,start:number,end:number,values:number[]}>}
 */
function parsePhysicalWords(text) {
  const words = [];
  let current = [];
  let start = 0;
  let runeOffset = 0;

  function flush() {
    if (!current.length) return;
    words.push({
      index: words.length,
      start,
      end: start + current.length - 1,
      values: current.slice(),
    });
    current = [];
  }

  for (const character of [...text]) {
    const value = runeIndex.get(character);
    if (value !== undefined) {
      if (!current.length) start = runeOffset;
      current.push(value);
      runeOffset += 1;
    } else if (character === "-" || character === ".") {
      flush();
    }
  }
  flush();
  return words;
}

/** @param {number[]} values @returns {number[][]} */
function nonemptyCircumferenceLayers(values) {
  const layers = [];
  let current = values.slice();
  while (current.length > 0) {
    layers.push(current);
    current = current.slice(1, -1);
  }
  return layers;
}

const p57 = solved.sections.find((section) => section.name === "p57_parable");
assert.ok(p57);
const p57Words = parseRuneWords(p57.source_text);
const p57Rows = p57Words.map((values) => {
  const address = sum(values);
  const token = tokens[address];
  const value60 = decode60(token);
  return {
    word: translit(values),
    values,
    address,
    token,
    value60,
    pair: pair29(value60),
  };
});

/** @param {string} word @returns {{word:string,values:number[],address:number,token:string,value60:number,pair:number[]}} */
function p57Row(word) {
  const found = p57Rows.find((row) => row.word === word);
  assert.ok(found, "missing p57 word " + word);
  return found;
}

// The solved prose contains the literal operation cue.
const p57Text = p57Rows.map((row) => row.word);
const cue = ["SHED","OUR","OWN","CIRCUMFERENCES","FIND","THE","DIUINITY","WITHIN","AND","EMERGE"];
const cueStart = p57Text.findIndex((_, index) =>
  cue.every((word, offset) => p57Text[index + offset] === word)
);
assert.ok(cueStart >= 0);

// The same fixed p57 GP0 -> p50 -> native-base60/base29 grammar reconstructs
// the state needed by the operation.
assert.deepEqual(p57Row("DIUINITY").pair, [2,5]);
assert.deepEqual(p57Row("THE").pair, [3,15]);
assert.deepEqual(p57Row("AND").pair, [8,22]);
assert.deepEqual(p57Row("EMERGE").pair, [6,19]);

const K = p57Row("DIUINITY").pair[0];
const g = p57Row("DIUINITY").pair[1];
const e = p57Row("THE").pair[0];
const b = p57Row("THE").pair[1];
const A = p57Row("AND").pair[0];
const p = p57Row("AND").pair[1] + 1;
const a = p57Row("EMERGE").pair[0];
const B = p57Row("EMERGE").pair[1];

assert.deepEqual({ p,g,a,b,A,B,K,e }, {
  p:23,g:5,a:6,b:15,A:8,B:19,K:2,e:3,
});
assert.equal(K + 1, e);

// FIND in the same solved sentence selects physical p28 directly.
const find = p57Row("FIND");
assert.equal(find.address, 42);
assert.equal(find.value60, 28);
const selectedPage = find.value60;
assert.equal(selectedPage, 28);

const pages = transcription.split(/^\s*%\s*$/m);
const p28Source = pages[selectedPage];
const p28Runes = [...p28Source]
  .map((character) => runeIndex.get(character))
  .filter((value) => value !== undefined);
const p28Words = parsePhysicalWords(p28Source);

assert.equal(p28Runes.length, 269);
const centerOffset = Math.floor(p28Runes.length / 2);
assert.equal(centerOffset, 134);

// Page number selects one-based word28. It starts exactly after the center.
const selectedWord = p28Words[selectedPage - 1];
assert.ok(selectedWord);
assert.equal(selectedWord.start, centerOffset + 1);
assert.equal(selectedWord.values.length, g);
assert.deepEqual(selectedWord.values, [28,24,10,1,20]);

const center = [p28Runes[centerOffset]];
assert.deepEqual(center, [9]);

// Literal circumference shedding of the g=5 word gives three nonempty layers:
// 5 -> 3 -> 1. The p57 DIVINITY register supplies [K,g]=[2,5], so K=2
// circumference removals reach the center, while K+1=e=3 counts all nonempty
// layers including the "divinity within".
const wordLayers = nonemptyCircumferenceLayers(selectedWord.values);
const centerLayers = nonemptyCircumferenceLayers(center);
assert.deepEqual(wordLayers.map((layer) => layer.length), [5,3,1]);
assert.deepEqual(centerLayers.map((layer) => layer.length), [1]);
assert.equal(wordLayers.length, K + 1);
assert.equal(wordLayers.length, e);
assert.equal(centerLayers.length, 1);

// Use the already source-derived base exponent e once per nonempty layer.
// Exponentiation acts in GF(29); exponent composition is modulo 28.
const exponentModulus = 28;
const centerExponent = modPow(e, centerLayers.length, exponentModulus);
const wordExponent = modPow(e, wordLayers.length, exponentModulus);
assert.deepEqual([centerExponent, wordExponent], [3,27]);

const sourceSpan = [...center, ...selectedWord.values];
const output = [
  modPow(center[0], centerExponent, 29),
  ...selectedWord.values.map((value) => modPow(value, wordExponent, 29)),
];
assert.deepEqual(sourceSpan, [9,28,24,10,1,20]);
assert.deepEqual(output, [4,28,23,3,1,16]);
assert.equal(translit(output), "READOUT");

// Exact inverse.
const centerInverseExponent = 19; // 3^-1 mod 28
const inverse = [
  modPow(output[0], centerInverseExponent, 29),
  ...output.slice(1).map((value) => modPow(value, wordExponent, 29)),
];
assert.deepEqual(inverse, sourceSpan);

// Two nearby count conventions are held out explicitly. Counting only the
// K=2 removal actions gives e^K=9 for the word. Zero-indexing the singleton
// center gives exponent1. Neither is READ OUT.
const removalOnlyExponent = modPow(e, K, exponentModulus);
const removalOnly = [
  modPow(center[0], e, 29),
  ...selectedWord.values.map((value) => modPow(value, removalOnlyExponent, 29)),
];
const zeroIndexed = [
  center[0],
  ...selectedWord.values.map((value) => modPow(value, removalOnlyExponent, 29)),
];
assert.equal(removalOnlyExponent, 9);
assert.notEqual(translit(removalOnly), "READOUT");
assert.notEqual(translit(zeroIndexed), "READOUT");

// The source-state fit is unusually tight: selected word length equals g;
// two circumference removals equal K; nonempty layer count equals e.
assert.deepEqual({
  selectedWordLength:selectedWord.values.length,
  removalsToCenter:wordLayers.length - 1,
  nonemptyLayers:wordLayers.length,
}, {
  selectedWordLength:g,
  removalsToCenter:K,
  nonemptyLayers:e,
});

console.log(JSON.stringify({
  status:"PASS",
  classification:
    "post-discovery first-party operation-selector candidate: solved p57 circumference grammar fixes p28 nonempty layer counts and reproduces READ OUT exponents",
  p57:{
    cue,
    find:{address:find.address,token:find.token,value60:find.value60},
    divinityPair:p57Row("DIUINITY").pair,
    state:{p,g,a,b,A,B,K,e},
  },
  p28:{
    selectedPage,
    centerOffset,
    selectedWordOneBased:selectedPage,
    selectedWordStart:selectedWord.start,
    selectedWordLength:selectedWord.values.length,
    wordLayers:wordLayers.map((layer) => layer.length),
    centerLayers:centerLayers.map((layer) => layer.length),
    exponents:[centerExponent,wordExponent],
    sourceSpan,
    output,
    outputText:translit(output),
    inverse,
  },
  controls:{
    removalOnlyExponent,
    removalOnlyText:translit(removalOnly),
    zeroIndexedText:translit(zeroIndexed),
  },
}, null, 2));
