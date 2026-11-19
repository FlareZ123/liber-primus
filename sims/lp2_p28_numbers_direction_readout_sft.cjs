"use strict";

/**
 * SFT: the four complete p28 words immediately after the held-out THE
 * structurally read the authenticated 2016 phrase THEIR NUMBERS ARE THE.
 * The source then supplies the unique continuation DIRECTION.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
const readJson = (relative) => JSON.parse(read(relative));

const corpus = readJson("resources/liber-primus/lp2-corpus.json");
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m);

function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/**
 * Outside-in H serialization. Differences are emitted first, then an odd
 * center, then sums from the innermost pair back to the outermost pair.
 *
 * @param {number[]} values
 * @returns {number[]}
 */
function shell(values) {
  const differences = [];
  const sums = [];
  let left = 0;
  let right = values.length - 1;

  while (left < right) {
    differences.push(mod29(values[left] - values[right]));
    sums.push(mod29(values[left] + values[right]));
    left += 1;
    right -= 1;
  }

  const center = left === right ? [values[left]] : [];
  return differences.concat(center, sums.reverse());
}

/** @param {number[]} values @returns {number[]} */
function hDifferenceHalf(values) {
  assert.equal(values.length, 4);
  return [mod29(values[0] - values[3]), mod29(values[1] - values[2])];
}

/** @param {number[]} values @returns {number[]} */
function hSumHalf(values) {
  assert.equal(values.length, 4);
  return [mod29(values[1] + values[2]), mod29(values[0] + values[3])];
}

/**
 * @param {string} text
 * @returns {Array<{index:number,start:number,end:number,length:number,values:number[],gp0:number}>}
 */
function parsePageLocal(text) {
  const words = [];
  let values = [];
  let start = 0;
  let offset = 0;

  function flush() {
    if (!values.length) return;
    words.push({
      index: words.length,
      start,
      end: offset - 1,
      length: values.length,
      values: values.slice(),
      gp0: values.reduce((sum, value) => sum + value, 0) % 29,
    });
    values = [];
  }

  for (const char of [...text]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!values.length) start = offset;
      values.push(value);
      offset += 1;
    } else if ((char === "-" || char === ".") && values.length) {
      flush();
    }
  }
  flush();
  return words;
}

/**
 * @returns {{pages:Array<{page:number,words:Array}>,words:Array}}
 */
function parseCanonicalUnknown() {
  const unknownSegments = parts.slice(0, 55);
  const pages = unknownSegments.map((text, segment) => ({
    page: segment >= 50 ? segment + 1 : segment,
    words: [],
    offset: 0,
  }));

  let currentWord = [];
  let startSegment = 0;
  let endSegment = 0;
  let startOffset = 0;

  function flush() {
    if (!currentWord.length) return;
    if (startSegment === endSegment) {
      const page = pages[startSegment];
      const values = currentWord.slice();
      page.words.push({
        index: page.words.length,
        start: startOffset,
        end: startOffset + values.length - 1,
        length: values.length,
        values,
        gp0: values.reduce((sum, value) => sum + value, 0) % 29,
      });
    }
    currentWord = [];
  }

  for (let segment = 0; segment < unknownSegments.length; segment += 1) {
    for (const char of [...unknownSegments[segment]]) {
      const value = runeIndex.get(char);
      if (value !== undefined) {
        if (!currentWord.length) {
          startSegment = segment;
          startOffset = pages[segment].offset;
        }
        endSegment = segment;
        currentWord.push(value);
        pages[segment].offset += 1;
      } else if (char === "/" || /\s/u.test(char)) {
      } else {
        flush();
      }
    }
  }
  flush();

  return {
    pages,
    words: pages.flatMap((page) =>
      page.words.map((word) => ({page: page.page, ...word}))
    ),
  };
}

const clear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");

const source = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word, index) => ({index, word: word.toUpperCase()}));

assert.equal(source.length, 43);

function indexOf(word) {
  const row = source.find((candidate) => candidate.word === word);
  assert.ok(row, "missing source word " + word);
  return row.index;
}

const their = source.filter((row) => row.word === "THEIR").map((row) => row.index);
assert.deepEqual(their, [19, 25]);

const state = Object.freeze({
  p: indexOf("ROAD"),
  g: indexOf("EPIPHANY"),
  a: their[1] - their[0],
  b: indexOf("WORDS"),
  A: indexOf("DEVOTED"),
  B: their[0],
  K: indexOf("PATH"),
  e: indexOf("LIES"),
  q: indexOf("EMPTY"),
});
assert.deepEqual(state, {p:23,g:5,a:6,b:15,A:8,B:19,K:2,e:3,q:4});

const p28Local = parsePageLocal(parts[28]);
const heldoutThe = p28Local[28];
assert.deepEqual([heldoutThe.start, heldoutThe.end, heldoutThe.values], [140,141,[24,25]]);

const p28Window = p28Local.slice(29, 33);
assert.deepEqual(
  p28Window.map((word) => [word.start, word.end, word.values]),
  [
    [142,145,[11,14,27,0]],
    [146,150,[10,18,13,28,8]],
    [151,154,[0,12,3,7]],
    [155,160,[28,11,12,10,28,25]],
  ]
);

const gp0Vector = p28Window.map((word) => word.gp0);
const lengthVector = p28Window.map((word) => word.length);
assert.deepEqual(gp0Vector, [23,19,22,27]);
assert.deepEqual(lengthVector, [4,5,4,6]);
assert.deepEqual(gp0Vector, [state.p,state.B,state.p-1,mod29(-state.K)]);
assert.deepEqual(lengthVector, [state.q,state.g,state.q,state.a]);

const expectedShells = [
  [state.p-state.a*state.K,mod29(state.K-state.b),state.a*state.K,state.p-state.a*state.K],
  [state.K,state.B,state.b-state.K,state.K+state.b,state.p-state.g],
  [state.p-1,state.b-state.a,state.b,state.g+state.K],
  [state.e,state.a*state.K,state.K,state.p-1,state.K*state.g,mod29(-state.g)],
];
assert.deepEqual(expectedShells, [
  [11,16,12,11],
  [2,19,13,17,18],
  [22,9,15,7],
  [3,12,2,22,10,24],
]);
assert.deepEqual(p28Window.map((word) => shell(word.values)), expectedShells);

const readoutIndices = hDifferenceHalf(gp0Vector).concat(hDifferenceHalf(lengthVector));
assert.deepEqual(readoutIndices, [25,26,27,1]);
const readoutWords = readoutIndices.map((index) => source[index].word);
assert.deepEqual(readoutWords, ["THEIR","NUMBERS","ARE","THE"]);

const phraseStarts = [];
for (let index = 0; index + 3 < source.length; index += 1) {
  if (source.slice(index,index+4).map((row)=>row.word).join(" ") === readoutWords.join(" ")) {
    phraseStarts.push(index);
  }
}
assert.deepEqual(phraseStarts, [25]);
assert.equal(source[29].word, "DIRECTION");

const canonical = parseCanonicalUnknown();
const shellHits = expectedShells.map(() => []);
for (const word of canonical.words) {
  const actual = shell(word.values);
  expectedShells.forEach((expected, packetIndex) => {
    if (actual.length === expected.length && actual.every((value,index)=>value===expected[index])) {
      shellHits[packetIndex].push({page:word.page,start:word.start,end:word.end});
    }
  });
}
assert.deepEqual(shellHits, [
  [{page:28,start:142,end:145}],
  [{page:28,start:146,end:150}],
  [{page:28,start:151,end:154}],
  [{page:28,start:155,end:160}],
]);

const sourceFourPhrases = new Map();
for (let index = 0; index + 3 < source.length; index += 1) {
  const phrase = source.slice(index,index+4).map((row)=>row.word).join(" ");
  if (!sourceFourPhrases.has(phrase)) sourceFourPhrases.set(phrase, []);
  sourceFourPhrases.get(phrase).push(index);
}

/**
 * @param {number[]} values
 * @param {"diff"|"sum"} half
 * @returns {number[]}
 */
function chooseHalf(values, half) {
  return half === "diff" ? hDifferenceHalf(values) : hSumHalf(values);
}

const modes = [];
for (const gpHalf of ["diff","sum"]) {
  for (const lengthHalf of ["diff","sum"]) {
    for (const order of ["gp-len","len-gp"]) {
      modes.push({gpHalf,lengthHalf,order,hits:[]});
    }
  }
}

let windowCount = 0;
for (const page of canonical.pages) {
  for (let index = 0; index + 3 < page.words.length; index += 1) {
    windowCount += 1;
    const window = page.words.slice(index,index+4);
    const gp = window.map((word)=>word.gp0);
    const lengths = window.map((word)=>word.length);
    for (const mode of modes) {
      const gpHalf = chooseHalf(gp, mode.gpHalf);
      const lengthHalf = chooseHalf(lengths, mode.lengthHalf);
      const indices = mode.order === "gp-len" ? gpHalf.concat(lengthHalf) : lengthHalf.concat(gpHalf);
      const lexical = indices.map((value)=>source[value].word).join(" ");
      const starts = sourceFourPhrases.get(lexical);
      if (!starts) continue;
      mode.hits.push({
        page:page.page,
        localIndex:index,
        start:window[0].start,
        indices,
        lexical,
        sourceStarts:starts.slice(),
      });
    }
  }
}

assert.equal(windowCount, 2699);
const fixedMode = modes.find((mode)=>
  mode.gpHalf === "diff" && mode.lengthHalf === "diff" && mode.order === "gp-len"
);
assert.ok(fixedMode);
assert.deepEqual(fixedMode.hits, [{
  page:28,
  localIndex:28,
  start:142,
  indices:[25,26,27,1],
  lexical:"THEIR NUMBERS ARE THE",
  sourceStarts:[25],
}]);

const familyCounts = modes.map((mode)=>mode.hits.length);
assert.deepEqual(familyCounts, [1,0,3,3,0,1,1,2]);

console.log("PASS p28 numbers-direction structural readout");
console.log(JSON.stringify({
  state,
  heldoutThe:{start:heldoutThe.start,end:heldoutThe.end,values:heldoutThe.values},
  p28Window:p28Window.map((word)=>({
    start:word.start,end:word.end,length:word.length,gp0:word.gp0,
    values:word.values,shell:shell(word.values),
  })),
  channels:{
    gp0Vector,lengthVector,
    gp0Differences:hDifferenceHalf(gp0Vector),
    lengthDifferences:hDifferenceHalf(lengthVector),
    readoutIndices,readoutWords,
    sourcePhraseStart:phraseStarts[0],
    continuation:source[29].word,
  },
  controls:{
    canonicalFourWordWindows:windowCount,
    fixedModeHits:fixedMode.hits,
    naturalEightModeHitCounts:familyCounts,
    exactShellHits:shellHits,
  },
}, null, 2));
