"use strict";

/**
 * P57's "SHED OUR OWN CIRCUMFERENCES ... FIND THE DIVINITY WITHIN"
 * proposes a source-selected direct 2014 LP1 DIVINITY Vigenere inverse
 * on strict interiors of p55's 16 newly printed complete words.
 *
 * Run: node sims/p55_divinity_within_43_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcribed = read("resources/lp2-transcription.txt").split("%");
const byRune = new Map(corpus.runes.map((r, i) => [r, i]));
const GP = new Map(corpus.translit.map((r, i) => [r, i]));
const vigenereKey = [..."DIUINITY"].map(c => GP.get(c));
assert.deepEqual(vigenereKey, [23, 10, 1, 10, 9, 10, 16, 26]);
assert.equal("DIUINITY".length, 8);
assert.ok([...transcribed[54]].length > 0);
const physicalP55 = transcribed[54];
const wholeWords = physicalP55.replace(/\/\s*/g, "").match(/[\u16A0-\u16FF]+/gu) || [];
assert.deepEqual(wholeWords.map(w => [...w].length),
  [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);
const runes = wholeWords.join("");
assert.deepEqual([...runes].map(x => byRune.get(x)), corpus.pages[55].indices);
const inner = wholeWords.flatMap(w => [...w].slice(1, -1)).map(r => byRune.get(r));
assert.equal(inner.length, 43);
assert.deepEqual(inner.map((v,i) => v === 0 ? i : null).filter(x => x !== null), [11]);

/** @param {number[]} seq */
function ioc(seq) {
  const hist = new Array(29).fill(0);
  seq.forEach(x => hist[x]++);
  return hist.reduce((sum, n) => sum + n * (n - 1), 0) /
    (seq.length * (seq.length - 1));
}

/** @param {number[]} cipher @param {boolean} literalF */
function decode(cipher, literalF) {
  let keyPosition = 0;
  const text = [], literalPositions = [];
  for (const c of cipher) {
    if (literalF && c === 0) {
      text.push(c);
      literalPositions.push(text.length - 1);
    } else {
      const k = vigenereKey[keyPosition++ % vigenereKey.length];
      text.push((c - k + 29) % 29);
    }
  }
  return {text,keyPosition,literalPositions};
}

/** @param {number[]} text @param {number[]} literalPositions */
function encodeWithFixedFlags(text, literalPositions) {
  let position = 0;
  const literal = new Set(literalPositions);
  return text.map((p,i) => {
    if (literal.has(i)) return p;
    const k = vigenereKey[position++ % vigenereKey.length];
    return (p + k) % 29;
  });
}
const knownP57 = corpus.pages[57].indices.slice(7, 50);
assert.equal(knownP57.length, 43);
const nativePlant = encodeWithFixedFlags(knownP57, []);
assert.deepEqual(decode(nativePlant, false).text, knownP57);
assert.deepEqual(encodeWithFixedFlags(knownP57, []), nativePlant);

const cases = [];
for (const literalF of [false, true]) {
  const d = decode(inner, literalF);
  assert.deepEqual(encodeWithFixedFlags(d.text, d.literalPositions), inner);
  cases.push({
    clock:"continuous strict interiors",
    literalF, consumedKeys:d.keyPosition, literalPositions:d.literalPositions,
    output:d.text.map(x => corpus.translit[x]).join(" "),
    indexOfCoincidence:ioc(d.text),
    outputJCount:d.text.filter(x => x === 11).length,
    outputAECount:d.text.filter(x => x === 25).length,
    originalReencryptedExactly:true
  });
}

// A second, original-word-selected clock restarts the same historical key
// at each source-delimited word's strict interior. No phase/key fitting.
const interiorsByWord = wholeWords
  .map(word => [...word].slice(1, -1).map(r => byRune.get(r)));
assert.equal(interiorsByWord.flat().length, 43);
for (const literalF of [false, true]) {
  const decodedWords = interiorsByWord.map(word => decode(word, literalF));
  const decoded = decodedWords.flatMap(word => word.text);
  assert.deepEqual(decodedWords.flatMap(word =>
    encodeWithFixedFlags(word.text, word.literalPositions)), inner);
  cases.push({
    clock:"key phase0 restarted at each whole word",
    literalF,
    consumedKeys:decodedWords.reduce((sum, word) => sum + word.keyPosition, 0),
    literalPositions:decodedWords.flatMap((word, index) => {
      const base = interiorsByWord.slice(0, index).reduce((sum,w) => sum + w.length,0);
      return word.literalPositions.map(x => x + base);
    }),
    output:decoded.map(x => corpus.translit[x]).join(" "),
    indexOfCoincidence:ioc(decoded),
    outputJCount:decoded.filter(x => x === 11).length,
    outputAECount:decoded.filter(x => x === 25).length,
    originalReencryptedExactly:true
  });
}
assert.equal(cases.length, 4);
assert.equal(cases[2].indexOfCoincidence, 0.03765227021040975);
assert.equal(cases[3].indexOfCoincidence, 0.046511627906976744);
assert.equal(cases[2].outputJCount, 1);
assert.equal(cases[3].outputJCount, 1);

assert.equal(cases[0].consumedKeys, 43);
assert.equal(cases[1].consumedKeys, 42);
assert.equal(cases[0].outputJCount, 7);
assert.equal(cases[1].outputJCount, 3);
assert.equal(cases[0].indexOfCoincidence, 0.05094130675526024);
assert.equal(cases[1].indexOfCoincidence, 0.03322259136212625);

console.log(JSON.stringify({
  test:"Original p55 strict word interiors with earlier source-authentic GP DIVINITY key",
  clue:"Solved p57: shed circumferences / find the divinity within",
  p55OriginalRuneCount:corpus.pages[55].indices.length,
  completeP55Words:16,
  strictInteriorRunes:inner.length,
  originalInteriorIoC:ioc(inner),
  nativeSolvedP57Body43IoC:ioc(knownP57),
  syntheticGPForwardInversePassed:true,
  directInverses:cases,
  conclusion:"Neither historical DIVINITY key-consumption convention with continuous or source-word-reset phase yields readable plaintext; other operations remain unknown."
},null,2));
