"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const p0Image = fs.readFileSync(path.join(ROOT, "resources/liber-primus/17.jpg"));
assert.equal(
  crypto.createHash("sha256").update(p0Image).digest("hex"),
  "197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e"
);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {number} x @param {number} y @returns {[number,number]} */
function H(x, y) {
  return [((x - y) % 29 + 29) % 29, (x + y) % 29];
}

/** @param {number[]} values @returns {number[]} */
function hSequence(values) {
  const out = [];
  for (let layer = 0; layer < Math.floor(values.length / 2); layer += 1) {
    out.push(...H(values[layer], values[values.length - 1 - layer]));
  }
  if (values.length % 2 === 1) out.push(values[(values.length - 1) / 2]);
  return out;
}

/** @param {number[]} values @returns {number[][]} */
function consecutiveRuns6(values) {
  const set = new Set(values);
  const runs = [];
  for (let start = 0; start <= 23; start += 1) {
    if ([0,1,2,3,4,5].every((delta) => set.has(start + delta))) {
      runs.push([start, start + 5]);
    }
  }
  return runs;
}

const signedBody = signed2016
  .slice(signed2016.indexOf("Hello."), signed2016.indexOf("-----BEGIN PGP SIGNATURE-----"))
  .replace(/\b7A35090F\b/g, "");
const signedWords = signedBody.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
assert.deepEqual(
  signedWords.slice(19,25).map((word) => word.toUpperCase()),
  ["THEIR","MEANING","IS","THE","ROAD","AND"]
);
assert.equal(signedWords[8].toUpperCase(), "DEVOTED");

/** @typedef {{page:number,offset:number,value:number}} Site */
/** @typedef {{page:number,start:number,values:number[],breaks:number[]}} SevenWord */
/** @type {SevenWord[]} */
const sevenRuneWords = [];
let page = 0;
const pageOffsets = Array(58).fill(0);
/** @type {Site[]} */
let current = [];
/** @type {number[]} */
let lineBreaks = [];

function finishWord() {
  if (current.length === 0) return;
  const pages = [...new Set(current.map((site) => site.page))];
  if (current.length === 7 && pages.length === 1 && pages[0] <= 55) {
    sevenRuneWords.push({
      page: pages[0],
      start: current[0].offset,
      values: current.map((site) => site.value),
      breaks: lineBreaks.slice(),
    });
  }
  current = [];
  lineBreaks = [];
}

for (const character of transcription) {
  if (character === "%") {
    page += 1;
  } else if (runeIndex.has(character)) {
    current.push({page, offset: pageOffsets[page], value: runeIndex.get(character)});
    pageOffsets[page] += 1;
  } else if (character === "/") {
    if (current.length > 0) lineBreaks.push(current.length);
  } else if (/\s/u.test(character)) {
    // Preserve words across physical line whitespace.
  } else {
    finishWord();
  }
}
finishWord();

assert.equal(sevenRuneWords.length, 214);
const target = sevenRuneWords.find((word) => word.page === 0 && word.start === 237);
assert.ok(target);
assert.deepEqual(target.values, [15,22,16,22,21,1,4]);
assert.deepEqual(target.breaks, [2]);

const wholeH = hSequence(target.values);
const prefixH = hSequence(target.values.slice(0,2));
const suffixH = hSequence(target.values.slice(2));
assert.deepEqual(wholeH, [11,19,21,23,24,8,22]);
assert.deepEqual(prefixH, [22,8]);
assert.deepEqual(suffixH, [12,20,21,23,21]);

const targetUnion = [...wholeH, ...prefixH, ...suffixH];
assert.ok([19,20,21,22,23,24].every((value) => new Set(targetUnion).has(value)));
assert.equal(targetUnion.filter((value) => value === 8).length, 2);

const internalSplit = sevenRuneWords.filter(
  (word) => word.breaks.length === 1 && word.breaks[0] > 0 && word.breaks[0] < 7
);
assert.equal(internalSplit.length, 56);
const split2 = internalSplit.filter((word) => word.breaks[0] === 2);
assert.equal(split2.length, 15);

function rowWithRuns(word) {
  const cut = word.breaks[0];
  const union = [
    ...hSequence(word.values),
    ...hSequence(word.values.slice(0,cut)),
    ...hSequence(word.values.slice(cut)),
  ];
  return {
    page: word.page,
    start: word.start,
    split: cut,
    runs: consecutiveRuns6(union),
    hasDevotedState: union.includes(8),
  };
}

const split2Hits = split2.map(rowWithRuns).filter((row) => row.runs.length > 0);
assert.deepEqual(split2Hits, [{
  page:0,start:237,split:2,runs:[[19,24]],hasDevotedState:true,
}]);

const allSplitHits = internalSplit.map(rowWithRuns).filter((row) => row.runs.length > 0);
assert.deepEqual(allSplitHits, [
  {page:0,start:237,split:2,runs:[[19,24]],hasDevotedState:true},
  {page:24,start:151,split:6,runs:[[9,14],[10,15]],hasDevotedState:false},
]);

console.log(JSON.stringify({
  status:"PASS",
  target:{
    page:0,start:237,split:[2],ciphertext:target.values,
    wholeH,prefixH,suffixH,
    sourceInterval:[19,20,21,22,23,24],
    sourceWords:signedWords.slice(19,25).map((word)=>word.toUpperCase()),
    repeatedState8:signedWords[8].toUpperCase(),
  },
  controls:{
    completeSevenRuneWords:sevenRuneWords.length,
    internalLineSplitSevenRuneWords:internalSplit.length,
    split2Family:split2.length,
    split2Hits,allSplitHits,
  },
}, null, 2));
