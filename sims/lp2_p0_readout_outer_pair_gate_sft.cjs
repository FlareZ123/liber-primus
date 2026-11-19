"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const precommit = read("workplace/agent34-p0-readout-scope-precommit.md");
const runeSet = new Set(corpus.runes);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} x @param {number} y @returns {[number,number]} */
function H(x, y) {
  return [mod29(x - y), mod29(x + y)];
}

/** @param {number} u @param {number} v @returns {[number,number]} */
function Hinv(u, v) {
  return [mod29(15 * (u + v)), mod29(15 * (v - u))];
}

/**
 * @param {string} source
 * @returns {{runes:number[],words:number[],nonemptyLineRuneCounts:number[]}}
 */
function structuralParse(source) {
  const runes = [];
  const words = [];
  let currentWordLength = 0;
  for (const char of [...source]) {
    if (runeSet.has(char)) {
      const value = runeIndex.get(char);
      assert.notEqual(value, undefined);
      runes.push(value);
      currentWordLength += 1;
    } else if (char === "-" || char === ".") {
      if (currentWordLength > 0) {
        words.push(currentWordLength);
        currentWordLength = 0;
      }
    }
  }
  if (currentWordLength > 0) words.push(currentWordLength);
  const nonemptyLineRuneCounts = source
    .trim()
    .split("/")
    .map((line) => [...line].filter((char) => runeSet.has(char)).length)
    .filter((count) => count > 0);
  return {runes, words, nonemptyLineRuneCounts};
}

assert.match(precommit, /Whole-page outer rune pair/);
assert.match(precommit, /output = H\(L,R\)/);
assert.match(precommit, /\[b,K\] = \[15,2\]/);
assert.match(precommit, /\[A,B\] = \[8,19\]/);

const parts = transcription.split(/^\s*%\s*$/m);
const parsed = structuralParse(parts[0]);
assert.equal(parsed.runes.length, 262);
assert.equal(parsed.words.length, 59);
assert.equal(parsed.nonemptyLineRuneCounts.length, 12);

const left = parsed.runes[0];
const right = parsed.runes.at(-1);
assert.equal(left, 15);
assert.equal(right, 7);

const output = H(left, right);
assert.deepEqual(output, [8,22]);
assert.deepEqual(Hinv(...output), [left,right]);

const acceptedTargets = [
  {label:"[b,K]", values:[15,2]},
  {label:"[A,B]", values:[8,19]},
];
const hits = acceptedTargets.filter(({values}) =>
  values[0] === output[0] && values[1] === output[1]
);
assert.deepEqual(hits, []);

console.log(JSON.stringify({
  status:"PASS",
  chargedFamily:{scopes:5,orientations:2,reversibleDirections:2,configurations:20,openedConfigurations:1},
  p0:{runeCount:parsed.runes.length,wordCount:parsed.words.length,nonemptyPhysicalLines:parsed.nonemptyLineRuneCounts.length,first:{value:left,translit:corpus.translit[left]},last:{value:right,translit:corpus.translit[right]}},
  frozenTransform:{operation:"H(left,right)",output,transliteration:output.map((value)=>corpus.translit[value]).join(""),inverseReplay:Hinv(...output)},
  acceptedTargets,
  hits,
  decision:"NEGATIVE: frozen whole-page outer-pair READ OUT consumer misses both accepted upstream DH pairs; do not open the other 19 charged family members."
}, null, 2));
