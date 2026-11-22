"use strict";

/**
 * Director #1548: frozen p57 difference-equals-width census.
 *
 * For every complete GP word:
 *   I = GP-prime sum of the strict interior
 *   O = GP-prime sum of the shed endpoints
 *   L = rune length
 *
 * Count O - I = L only when I and O are literal p50 addresses 0..255,
 * and separately count the width-specific O - I = L = 8 relation.
 *
 * Run:
 *   node sims/lp2_p57_divinity_width_relation_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const solved = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "external", "relikd-solved-gp29-native-v1.json"), "utf8"));

const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));

/**
 * @param {string} text
 * @returns {number[][]}
 */
function parseRuneWords(text) {
  const words = [];
  let current = [];
  for (const ch of [...text]) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      current.push(value);
    } else if (current.length && "•⁘⁜⁚ \n\r\t".includes(ch)) {
      words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  return words;
}

/**
 * @param {number[]} values
 * @returns {number}
 */
function primeSum(values) {
  return values.reduce((sum, value) => sum + corpus.prime[value], 0);
}

/**
 * @param {number[]} word
 * @returns {string}
 */
function translit(word) {
  return word.map((value) => corpus.translit[value]).join("");
}

/**
 * @param {number[]} word
 * @returns {{word:string,L:number,I?:number,O?:number,diff?:number,valid:boolean,equalLength:boolean,equalWidth8:boolean}}
 */
function analyze(word) {
  if (word.length < 2) {
    return {
      word: translit(word),
      L: word.length,
      valid: false,
      equalLength: false,
      equalWidth8: false
    };
  }

  const I = primeSum(word.slice(1, -1));
  const O = primeSum([word[0], word[word.length - 1]]);
  const valid = I >= 0 && I <= 255 && O >= 0 && O <= 255;
  const diff = O - I;

  return {
    word: translit(word),
    L: word.length,
    I,
    O,
    diff,
    valid,
    equalLength: valid && diff === word.length,
    equalWidth8: valid && diff === word.length && word.length === 8
  };
}

const p57 = solved.sections.find((section) => section.name === "p57_parable");
assert.ok(p57, "p57_parable must exist in the pinned solved corpus");

const p57Rows = parseRuneWords(p57.source_text).map(analyze);
const p57Valid = p57Rows.filter((row) => row.valid);
const p57Equal = p57Rows.filter((row) => row.equalLength);
const p57Width8 = p57Rows.filter((row) => row.equalWidth8);

assert.equal(p57Rows.length, 20);
assert.equal(p57Valid.length, 18);
assert.deepEqual(p57Equal, [{
  word: "DIUINITY",
  L: 8,
  I: 184,
  O: 192,
  diff: 8,
  valid: true,
  equalLength: true,
  equalWidth8: true
}]);
assert.deepEqual(p57Width8, p57Equal);

const solvedRows = [];
for (const section of solved.sections) {
  parseRuneWords(section.source_text || "").forEach((word, wordIndex) => {
    solvedRows.push({
      section: section.name,
      wordIndex,
      ...analyze(word)
    });
  });
}

const solvedValid = solvedRows.filter((row) => row.valid);
const solvedEqual = solvedRows.filter((row) => row.equalLength);
const solvedWidth8 = solvedRows.filter((row) => row.equalWidth8);
const solvedLength8 = solvedRows.filter((row) => row.L === 8);
const solvedLength8Valid = solvedLength8.filter((row) => row.valid);

assert.equal(solvedRows.length, 735);
assert.equal(solvedValid.length, 639);
assert.equal(solvedEqual.length, 31);
assert.equal(solvedWidth8.length, 4);
assert.equal(solvedLength8.length, 25);
assert.equal(solvedLength8Valid.length, 15);
assert.ok(solvedWidth8.every((row) => row.word === "DIUINITY"));

const lexicalCounts = new Map();
for (const row of solvedEqual) {
  lexicalCounts.set(row.word, (lexicalCounts.get(row.word) || 0) + 1);
}
assert.deepEqual(
  [...lexicalCounts.entries()].sort((a, b) => a[0].localeCompare(b[0])),
  [["DIUINITY", 4], ["HEAD", 3], ["MAN", 4], ["STUDY", 7], ["WHO", 13]]
);

console.log(JSON.stringify({
  p57: {
    words: p57Rows.length,
    addressable: p57Valid.length,
    equalLengthCount: p57Equal.length,
    equalWidth8Count: p57Width8.length,
    match: p57Equal[0]
  },
  solvedControl: {
    words: solvedRows.length,
    addressable: solvedValid.length,
    equalLengthCount: solvedEqual.length,
    equalLengthLexicalCounts: Object.fromEntries(
      [...lexicalCounts.entries()].sort((a, b) => a[0].localeCompare(b[0]))),
    length8Words: solvedLength8.length,
    length8Addressable: solvedLength8Valid.length,
    equalWidth8Count: solvedWidth8.length,
    equalWidth8Words: solvedWidth8.map((row) => ({
      section: row.section,
      wordIndex: row.wordIndex,
      word: row.word,
      I: row.I,
      O: row.O,
      diff: row.diff
    }))
  }
}, null, 2));
console.log("PASS: p57 has one O-I=L hit, DIUINITY; solved control has four O-I=L=8 hits, all DIUINITY.");
