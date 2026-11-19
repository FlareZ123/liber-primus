"use strict";

/**
 * Agent8 SFT: physical line-wrap H source-register reconstruction.
 * Node.js 22 / CommonJS. Reads canonical repository resources only.
 */

const assert = require("node:assert/strict");
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
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {number} segment @returns {number} */
function physicalPage(segment) {
  return segment >= 50 ? segment + 1 : segment;
}

/** @param {number} x @param {number} y @returns {[number, number]} */
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

/** @param {number[]} values @param {number} split @returns {number[]} */
function lineWrapUnion(values, split) {
  return [
    ...hSequence(values),
    ...hSequence(values.slice(0, split)),
    ...hSequence(values.slice(split)),
  ];
}

/** @param {number[]} values @returns {{best:number,runs:number[][]}} */
function longestConsecutiveRuns(values) {
  const set = new Set(values);
  let best = 0;
  let runs = [];
  for (let start = 0; start < 29; start += 1) {
    let end = start;
    while (end < 29 && set.has(end)) end += 1;
    const length = end - start;
    if (length > best) {
      best = length;
      runs = length ? [[start, end - 1]] : [];
    } else if (length === best && length > 0) {
      runs.push([start, end - 1]);
    }
  }
  return { best, runs };
}

/** @typedef {{segment:number,offset:number,value:number}} Site */
/** @typedef {{page:number,ordinal:number,start:number,values:number[],breaks:number[]}} Word */

/** @type {Map<number, Word[]>} */
const wordsByPage = new Map();
/** @type {Site[]} */
let current = [];
/** @type {number[]} */
let breaks = [];
const offsets = Array(58).fill(0);
let segment = 0;

function finishWord() {
  if (current.length === 0) return;
  const segments = [...new Set(current.map((site) => site.segment))];
  if (segments.length === 1) {
    const page = physicalPage(segments[0]);
    if (page <= 55) {
      if (!wordsByPage.has(page)) wordsByPage.set(page, []);
      const pageWords = wordsByPage.get(page);
      pageWords.push({
        page,
        ordinal: pageWords.length + 1,
        start: current[0].offset,
        values: current.map((site) => site.value),
        breaks: breaks.slice(),
      });
    }
  }
  current = [];
  breaks = [];
}

for (const character of transcription) {
  if (character === "%") {
    segment += 1;
  } else if (runeIndex.has(character)) {
    current.push({segment, offset: offsets[segment], value: runeIndex.get(character)});
    offsets[segment] += 1;
  } else if (character === "/") {
    if (current.length > 0) breaks.push(current.length);
  } else if (/\s/u.test(character)) {
    // Physical whitespace does not terminate a printed word.
  } else {
    finishWord();
  }
}
finishWord();

const signedBody = signed2016
  .slice(signed2016.indexOf("Hello."), signed2016.indexOf("-----BEGIN PGP SIGNATURE-----"))
  .replace(/\b7A35090F\b/g, "");
const signedWords = signedBody.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
assert.equal(signedWords.length, 43);

const p55Words = wordsByPage.get(55);
assert.ok(p55Words);
assert.equal(p55Words.length, 16);
assert.deepEqual(p55Words.map((word) => word.values.length), [4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);

const p55Target = p55Words[6];
assert.equal(p55Target.ordinal, 7);
assert.equal(p55Target.start, 23);
assert.deepEqual(p55Target.values, [17,28,0,14,10,19,1,5,13,8,21,20,12]);
assert.deepEqual(p55Target.breaks, [1]);
assert.equal(Math.max(...p55Words.map((word) => word.values.length)), 13);
assert.equal(p55Words.filter((word) => word.values.length === 13).length, 1);

const inner7 = p55Target.values.slice(3, -3);
assert.deepEqual(inner7, [14,10,19,1,5,13,8]);
const inner7SumBranch = [
  H(inner7[0], inner7[6])[1],
  H(inner7[1], inner7[5])[1],
  H(inner7[2], inner7[4])[1],
];
assert.deepEqual(inner7SumBranch, [22,23,24]);
assert.deepEqual(signedWords.slice(22,25).map((word) => word.toUpperCase()), ["THE","ROAD","AND"]);

const p55WholeH = hSequence(p55Target.values);
const p55PrefixH = hSequence(p55Target.values.slice(0, 1));
const p55SuffixH = hSequence(p55Target.values.slice(1));
assert.deepEqual(p55WholeH, [5,0,8,19,8,21,6,22,26,23,14,24,1]);
assert.deepEqual(p55PrefixH, [17]);
assert.deepEqual(p55SuffixH, [16,11,9,20,22,6,2,18,6,3,25,6]);
const p55Union = [...p55WholeH, ...p55PrefixH, ...p55SuffixH];
assert.deepEqual(longestConsecutiveRuns(p55Union), {best:11,runs:[[16,26]]});
assert.deepEqual(signedWords.slice(16,27).map((word) => word.toUpperCase()), ["ARE","THE","MAP","THEIR","MEANING","IS","THE","ROAD","AND","THEIR","NUMBERS"]);

const lineWrapped = [];
for (const [page, pageWords] of wordsByPage) {
  for (const word of pageWords) {
    if (word.breaks.length !== 1) continue;
    const split = word.breaks[0];
    if (split <= 0 || split >= word.values.length) continue;
    const score = longestConsecutiveRuns(lineWrapUnion(word.values, split));
    lineWrapped.push({page,ordinal:word.ordinal,start:word.start,length:word.values.length,split,...score});
  }
}
assert.equal(lineWrapped.length, 388);
const histogram = {};
for (const row of lineWrapped) histogram[row.best] = (histogram[row.best] || 0) + 1;
assert.deepEqual(histogram, {1:69,2:112,3:107,4:55,5:25,6:13,7:5,8:1,11:1});
const ge9 = lineWrapped.filter((row) => row.best >= 9);
assert.deepEqual(ge9, [{page:55,ordinal:7,start:23,length:13,split:1,best:11,runs:[[16,26]]}]);
const length13 = lineWrapped.filter((row) => row.length === 13).sort((a,b) => b.best - a.best);
assert.equal(length13.length, 3);
assert.deepEqual(length13.map((row) => [row.page,row.best]), [[55,11],[11,6],[52,3]]);

const p55Cores = p55Words.filter((word) => word.values.length % 2 === 1).map((word) => word.values[(word.values.length - 1) / 2]);
assert.deepEqual(p55Cores, [1,6,2,11,18]);
const hOuter = H(p55Cores[0], p55Cores[4]);
const hInner = H(p55Cores[1], p55Cores[3]);
assert.deepEqual([hOuter[0] + hInner[0], hOuter[1] + hInner[1]], [36,36]);
const finalGp0 = p55Cores.reduce((sum, value) => sum + value, 0);
const prefinalGp0 = finalGp0 - p55Cores[0];
assert.equal(prefinalGp0, 37);
assert.equal(finalGp0, 38);
assert.deepEqual(signedWords.slice(36,39).map((word) => word.toUpperCase()), ["GOOD","LUCK","BEWARE"]);

const p55Directions = [22,23,24,36,37,38];
const coordinateRows = [];
for (const pageIndex of p55Directions) {
  const pageWords = wordsByPage.get(pageIndex) || [];
  for (const wordIndex of p55Directions) {
    const word = pageWords[wordIndex];
    if (!word) continue;
    let score = null;
    if (word.breaks.length === 1 && word.breaks[0] > 0 && word.breaks[0] < word.values.length) {
      score = {split:word.breaks[0], ...longestConsecutiveRuns(lineWrapUnion(word.values, word.breaks[0]))};
    }
    coordinateRows.push({pageIndex,wordIndex,ordinal:wordIndex+1,start:word.start,length:word.values.length,score});
  }
}
assert.equal(coordinateRows.length, 33);
const splitCoordinates = coordinateRows.filter((row) => row.score !== null).sort((a,b) => b.score.best - a.score.best);
assert.equal(splitCoordinates.length, 6);
assert.deepEqual(splitCoordinates.map((row) => [row.pageIndex,row.wordIndex,row.score.best]), [[24,36,7],[24,23,4],[22,22,3],[23,23,3],[36,23,3],[37,38,3]]);

const p24Target = wordsByPage.get(24)[36];
assert.ok(p24Target);
assert.equal(p24Target.ordinal, 37);
assert.equal(p24Target.start, 151);
assert.deepEqual(p24Target.values, [0,26,11,10,16,14,20]);
assert.deepEqual(p24Target.breaks, [6]);
const p24Union = lineWrapUnion(p24Target.values, 6);
assert.deepEqual(longestConsecutiveRuns(p24Union), {best:7,runs:[[9,15]]});
assert.deepEqual(signedWords.slice(9,16).map((word) => word.toUpperCase()), ["LIBER","PRIMUS","IS","THE","WAY","ITS","WORDS"]);

const lineWrapped7 = lineWrapped.filter((row) => row.length === 7).sort((a,b) => b.best-a.best || a.page-b.page || a.start-b.start);
assert.equal(lineWrapped7.length, 55);
assert.deepEqual(lineWrapped7[0], {page:24,ordinal:37,start:151,length:7,split:6,best:7,runs:[[9,15]]});
assert.deepEqual(lineWrapped7.filter((row) => row.best === 6).map((row) => [row.page,row.start,row.runs]), [[0,237,[[19,24]]]]);

assert.deepEqual(signedWords.slice(9,27).map((word) => word.toUpperCase()), ["LIBER","PRIMUS","IS","THE","WAY","ITS","WORDS","ARE","THE","MAP","THEIR","MEANING","IS","THE","ROAD","AND","THEIR","NUMBERS"]);

const p11 = wordsByPage.get(11)[10];
assert.ok(p11);
assert.deepEqual(p11.values, [11,14]);
const p11Packet = [(p11.values[0]+p11.values[1])%29, ((p11.values[0]-p11.values[1])%29+29)%29];
assert.deepEqual(p11Packet, [25,26]);
assert.deepEqual(signedWords.slice(25,30).map((word) => word.toUpperCase()), ["THEIR","NUMBERS","ARE","THE","DIRECTION"]);

const p0Target = wordsByPage.get(0).find((word) => word.start === 237);
assert.ok(p0Target);
assert.deepEqual(p0Target.values, [15,22,16,22,21,1,4]);
assert.deepEqual(p0Target.breaks, [2]);
assert.deepEqual(longestConsecutiveRuns(lineWrapUnion(p0Target.values, 2)), {best:6,runs:[[19,24]]});

console.log(JSON.stringify({
  status:"PASS",
  p55:{target:{page:55,word:7,start:23,length:13,split:1},sourceRun:[16,26],sourceWords:signedWords.slice(16,27).map((word)=>word.toUpperCase()),manuscriptLineWrapFamily:lineWrapped.length,uniqueRunAtLeast9:ge9},
  p24:{selector:{pageIndex:24,wordIndex:36,oneBasedWord:37},sourceRun:[9,15],sourceWords:signedWords.slice(9,16).map((word)=>word.toUpperCase()),p55DirectionCoordinates:coordinateRows.length,lineWrappedDirectionCoordinates:splitCoordinates.length},
  joined:{sourceRun:[9,26],sourceWords:signedWords.slice(9,27).map((word)=>word.toUpperCase()),p11Overlap:p11Packet,completedInstruction:signedWords.slice(9,30).map((word)=>word.toUpperCase()).join(" ")},
  p0Holdout:{sourceRun:[19,24]},
}, null, 2));
