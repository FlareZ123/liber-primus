"use strict";

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { parseLP2Words } = require("./lp2_word_pages.cjs");

const RUNIC = /[\u16A0-\u16FF]/u;
const raw = fs.readFileSync(
  path.join(__dirname, "..", "resources", "lp2-transcription.txt"), "utf8");
const parsed = parseLP2Words(raw, 55);
const pageSegments = raw.split("%").slice(0, 55);
const stream = pageSegments.join("%");

const runes = [];
let page = 0;
let line = 0;
let word = 0;
let wordActive = false;

for (const character of stream) {
  if (RUNIC.test(character)) {
    runes.push({ rune: character, page, line, word });
    wordActive = true;
  } else if (character === "%") {
    // A physical-page boundary does not terminate a canonical word.
    page++;
  } else if (character === "/") {
    // Printed line wrap: retain word state, but record the line transition.
    line++;
  } else if (/\s/u.test(character)) {
    // Newline/indentation is not a word delimiter.
  } else if (wordActive) {
    // Match lp2_word_pages.cjs: punctuation and other nonrunes end a word.
    word++;
    wordActive = false;
  }
}
const wordCount = word + (wordActive ? 1 : 0);
assert.equal(runes.length, parsed.runeCount);
assert.equal(wordCount, parsed.words.length);
assert.equal(parsed.crossPageWords, 32);

const names = [
  "all", "withinWord", "wordBoundary",
  "withinLine", "lineBoundary", "withinPage", "pageBoundary"
];
const stats = Object.fromEntries(names.map(name => [name, { pairs: 0, equal: 0 }]));
function add(name, equal) {
  stats[name].pairs++;
  if (equal) stats[name].equal++;
}

for (let i = 1; i < runes.length; i++) {
  const a = runes[i - 1];
  const b = runes[i];
  const equal = a.rune === b.rune;
  add("all", equal);
  add(a.word === b.word ? "withinWord" : "wordBoundary", equal);
  add(a.line === b.line ? "withinLine" : "lineBoundary", equal);
  add(a.page === b.page ? "withinPage" : "pageBoundary", equal);
}

const expected = {
  all: [12955, 86],
  withinWord: [10060, 63],
  wordBoundary: [2895, 23],
  withinLine: [12362, 82],
  lineBoundary: [593, 4],
  withinPage: [12901, 86],
  pageBoundary: [54, 0]
};
for (const [name, [pairs, equal]] of Object.entries(expected)) {
  assert.equal(stats[name].pairs, pairs, name + " transition count");
  assert.equal(stats[name].equal, equal, name + " equal-pair count");
}
assert.equal(runes.length, 12956);
assert.equal(parsed.words.length, 2896);

const output = {
  source: "resources/lp2-transcription.txt",
  parser: "sims/lp2_word_pages.cjs",
  runeBearingPages: pageSegments.length,
  runeCount: runes.length,
  canonicalWords: parsed.words.length,
  crossPageWords: parsed.crossPageWords,
  categories: Object.fromEntries(Object.entries(stats).map(([name, value]) => [
    name,
    {
      pairs: value.pairs,
      equal: value.equal,
      rate: value.equal / value.pairs,
      expectedUnderUniform29: value.pairs / 29
    }
  ]))
};
console.log(JSON.stringify(output, null, 2));
