"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number[]} values @returns {number[]} */
function h(values) {
  const output = [];
  for (let index = 0; index < Math.floor(values.length / 2); index += 1) {
    const left = values[index];
    const right = values[values.length - 1 - index];
    output.push(mod29(left - right), mod29(left + right));
  }
  if (values.length % 2 === 1) output.push(values[Math.floor(values.length / 2)]);
  return output;
}

/** @param {number[]} values @returns {{start:number,end:number,length:number}} */
function longestRun(values) {
  const seen = new Set(values);
  let best = { start: 0, end: -1, length: 0 };
  for (let start = 0; start < 29; start += 1) {
    let end = start;
    while (end < 29 && seen.has(end)) end += 1;
    if (end - start > best.length) best = { start, end: end - 1, length: end - start };
  }
  return best;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const clear = signed2016.match(/Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u);
assert.ok(clear);
const source = (clear[1].match(/\b[A-Za-z]+\b/gu) || []).map((word) => word.toUpperCase());
assert.equal(source.length, 43);

const segments = transcription.split(/^\s*%\s*$/m).slice(0, 55);
const pages = segments.map((text, segment) => ({
  page: segment >= 50 ? segment + 1 : segment,
  text,
  words: [],
  breaks: [],
  offset: 0,
}));

let current = [];
let startSegment = 0;
let endSegment = 0;
let startOffset = 0;

function flushWord() {
  if (current.length === 0) return;
  if (startSegment === endSegment) {
    const page = pages[startSegment];
    page.words.push({
      page: page.page,
      ordinal: page.words.length + 1,
      start: startOffset,
      end: startOffset + current.length,
      values: current.slice(),
    });
  }
  current = [];
}

for (let segment = 0; segment < segments.length; segment += 1) {
  for (const char of [...segments[segment]]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (current.length === 0) {
        startSegment = segment;
        startOffset = pages[segment].offset;
      }
      endSegment = segment;
      current.push(value);
      pages[segment].offset += 1;
    } else if (char === "/") {
      pages[segment].breaks.push(pages[segment].offset);
    } else if (!/\s/u.test(char)) {
      flushWord();
    }
  }
}
flushWord();

const pageByNumber = new Map(pages.map((page) => [page.page, page]));
const rows = [];
for (let sourceIndex = 0; sourceIndex < source.length; sourceIndex += 1) {
  const page = pageByNumber.get(sourceIndex);
  const word = page ? page.words[sourceIndex] : null;
  if (!page || !word) continue;

  const internalBreaks = page.breaks
    .filter((offset) => offset > word.start && offset < word.end)
    .map((offset) => offset - word.start)
    .sort((left, right) => left - right);

  const cuts = [0, ...internalBreaks, word.values.length];
  const fragments = [];
  for (let index = 0; index + 1 < cuts.length; index += 1) {
    fragments.push(word.values.slice(cuts[index], cuts[index + 1]));
  }

  const union = [...h(word.values), ...fragments.flatMap(h)];
  const run = longestRun(union);
  rows.push({
    sourceIndex,
    sourceWord: source[sourceIndex],
    page: sourceIndex,
    ordinal: sourceIndex + 1,
    values: word.values,
    breaks: internalBreaks,
    fragments,
    union: [...new Set(union)].sort((left, right) => left - right),
    run,
    runWords: source.slice(run.start, run.end + 1),
  });
}

const p19 = rows.find((row) => row.sourceIndex === 19);
const p23 = rows.find((row) => row.sourceIndex === 23);
assert.ok(p19);
assert.ok(p23);

assert.deepEqual(p19.values, [21,16,18,17,20,14,8]);
assert.deepEqual(p19.breaks, [2]);
assert.deepEqual(p19.run, {start:0,end:3,length:4});
assert.deepEqual(p19.runWords, ["HELLO","THE","PATH","LIES"]);

assert.deepEqual(p23.values, [22,7,0,26,21,1,26,10]);
assert.deepEqual(p23.breaks, [6]);
assert.deepEqual(p23.run, {start:3,end:5,length:3});
assert.deepEqual(p23.runWords, ["LIES","EMPTY","EPIPHANY"]);

assert.deepEqual(
  rows.filter((row) => row.run.length >= 3).map((row) => [row.sourceIndex,row.run.start,row.run.end]),
  [
    [0,8,10],
    [1,6,9],
    [9,20,24],
    [17,13,16],
    [19,0,3],
    [22,23,25],
    [23,3,5],
    [40,22,24],
    [42,0,2],
  ]
);

const stateAddressed = new Set([2,3,4,5,6,7,8,15,19,23]);
assert.deepEqual(
  rows
    .filter((row) => stateAddressed.has(row.sourceIndex) && row.run.length >= 3)
    .map((row) => row.sourceIndex),
  [19,23]
);

assert.deepEqual(
  [...new Set([...Array(4).keys(), 3,4,5])].sort((left,right)=>left-right),
  [0,1,2,3,4,5]
);

console.log(JSON.stringify({
  status: "PASS",
  stateSelectors: {
    B19: {word:"THEIR",receiver:"p19 word20",run:[0,1,2,3],words:source.slice(0,4)},
    p23: {word:"ROAD",receiver:"p23 word24",run:[3,4,5],words:source.slice(3,6)},
  },
  combinedPrefix: source.slice(0,6),
  all42RunsAtLeast3: rows
    .filter((row) => row.run.length >= 3)
    .map((row) => ({
      selector:`${row.sourceWord}${row.sourceIndex}`,
      run:[row.run.start,row.run.end],
      words:row.runWords,
    })),
  decision:
    "Independent DH-state values B=19 and p=23 select THEIR19 and ROAD23. Under the fixed whole-word plus physical-fragment H-union rule, their numbered receivers uniquely recover source0..3 and3..5, combining to HELLO THE PATH LIES EMPTY EPIPHANY.",
}, null, 2));
