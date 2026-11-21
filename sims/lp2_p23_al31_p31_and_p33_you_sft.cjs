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
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const table = JSON.parse(read("resources/liber-primus/base60-grid.json")).rows.flat();
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];
  for (let index = 0; index < normalized.length;) {
    if (normalized.startsWith("ING", index)) {
      out.push(21);
      index += 3;
      continue;
    }
    if (normalized.startsWith("IO", index)) {
      out.push(27);
      index += 2;
      continue;
    }
    const token = gpTokens.find((row) =>
      normalized.startsWith(row.symbol, index)
    );
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(index));
    out.push(token.value);
    index += token.symbol.length;
  }
  return out;
}

/** @param {number} value @returns {boolean} */
function isPrime(value) {
  if (value < 2) return false;
  for (let divisor = 2; divisor * divisor <= value; divisor += 1) {
    if (value % divisor === 0) return false;
  }
  return true;
}

/** @param {number} ordinal @returns {number} */
function nthPrime(ordinal) {
  let count = 0;
  for (let value = 2; ; value += 1) {
    if (!isPrime(value)) continue;
    count += 1;
    if (count === ordinal) return value;
  }
}

/** @param {number} value @returns {number} */
function p56T(value) {
  assert.ok(Number.isInteger(value) && value > 0);
  return mod29(nthPrime(value) - 1);
}

/**
 * Canonical H3 inverse: [difference, center, sum] -> [left, center, right].
 * @param {number[]} shell
 * @returns {number[]}
 */
function H3Inverse(shell) {
  assert.equal(shell.length, 3);
  const [difference, center, sum] = shell;
  const inverseTwo = 15;
  return [
    mod29((difference + sum) * inverseTwo),
    center,
    mod29((sum - difference) * inverseTwo),
  ];
}

const clear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");
const source = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word, index) => ({
    index,
    ordinal:index + 1,
    word:word.toUpperCase(),
    values:gp(word),
  }));
assert.equal(source.length, 43);

/** @param {string} word @returns {number} */
function firstIndex(word) {
  const row = source.find((candidate) => candidate.word === word);
  assert.ok(row);
  return row.index;
}

const their = source.filter((row) => row.word === "THEIR").map((row) => row.index);
const state = Object.freeze({
  p:firstIndex("ROAD"),
  g:firstIndex("EPIPHANY"),
  a:their[1] - their[0],
  b:firstIndex("WORDS"),
  A:firstIndex("DEVOTED"),
  B:their[0],
  K:firstIndex("PATH"),
  e:firstIndex("LIES"),
  q:firstIndex("EMPTY"),
});
assert.deepEqual(state, {p:23,g:5,a:6,b:15,A:8,B:19,K:2,e:3,q:4});

// Historical premise already motivated by p23 THE ORIGIN | AL.
const AL = 31;
assert.equal(AL % state.p, state.A);
assert.equal(AL % 28, state.e);
assert.equal(AL % 29, state.K);

// Agent19's independently frozen typed p50 register gives the operation sign.
assert.equal(table[AL], "2D");
assert.equal(Number.parseInt(table[AL], 16), 45);
assert.equal(String.fromCharCode(Number.parseInt(table[AL], 16)), "-");

const parts = transcription.split(/^\s*%\s*$/m);
const unknownSegments = parts.slice(0, 55);
const canonicalPages = unknownSegments.map((text, segment) => ({
  page:segment >= 50 ? segment + 1 : segment,
  words:[],
  offset:0,
}));
let currentWord = [];
let startSegment = 0;
let endSegment = 0;
let startOffset = 0;

function flushCanonicalWord() {
  if (!currentWord.length) return;
  if (startSegment === endSegment) {
    const page = canonicalPages[startSegment];
    page.words.push({
      ordinal:page.words.length + 1,
      start:startOffset,
      end:startOffset + currentWord.length - 1,
      values:currentWord.slice(),
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
        startOffset = canonicalPages[segment].offset;
      }
      endSegment = segment;
      currentWord.push(value);
      canonicalPages[segment].offset += 1;
    } else if (char === "/" || /\s/u.test(char)) {
      // Printed wraps may continue a word.
    } else {
      flushCanonicalWord();
    }
  }
}
flushCanonicalWord();

const wordsByPage = new Map(canonicalPages.map((page) => [page.page, page.words]));
/** @param {number} page @returns {{ordinal:number,start:number,end:number,values:number[]}[]} */
function pageWords(page) {
  return wordsByPage.get(page) || [];
}

// AL=31 now selects physical p31 without using the source-ordinal AND label.
const p31Text = unknownSegments[31];
const p31PrintedLines = p31Text
  .split("\n")
  .filter((line) => line.length)
  .map((line, index) => {
    const runeCount = [...line].filter((char) => runeIndex.has(char)).length;
    const chunks = line
      .split(/[-.\/\s]+/u)
      .filter((chunk) => [...chunk].some((char) => runeIndex.has(char)));
    return {index, runeCount, chunkCount:chunks.length};
  });

// Select the line pair using state/layout only: equal visible chunk count and
// lower-to-upper rune-count rise exactly K. No plaintext receiver participates.
const kRisePairs = [];
for (let upper = 0; upper < p31PrintedLines.length; upper += 1) {
  for (let lower = upper + 1; lower < p31PrintedLines.length; lower += 1) {
    const upperLine = p31PrintedLines[upper];
    const lowerLine = p31PrintedLines[lower];
    if (upperLine.chunkCount !== lowerLine.chunkCount) continue;
    if (upperLine.runeCount - lowerLine.runeCount === state.K) {
      kRisePairs.push({upper,lower,upperLine,lowerLine});
    }
  }
}
assert.equal(kRisePairs.length, 1);
const selectedPair = kRisePairs[0];
assert.deepEqual(
  [
    selectedPair.upper,
    selectedPair.lower,
    selectedPair.upperLine.chunkCount,
    selectedPair.upperLine.runeCount,
    selectedPair.lowerLine.runeCount,
  ],
  [0,6,state.g,state.p,mod29(-state.A)]
);

// Lower-to-upper packet, solved p56 serializer, then canonical H3 inverse.
const helperPacket = [
  selectedPair.lowerLine.chunkCount,
  selectedPair.lowerLine.runeCount,
  selectedPair.upperLine.runeCount,
];
assert.deepEqual(helperPacket, [state.g, mod29(-state.A), state.p]);
const helperShell = helperPacket.map(p56T);
assert.deepEqual(helperShell, [
  mod29(-state.B),
  mod29(-state.b),
  mod29(-state.g),
]);
assert.deepEqual(helperShell, [10,14,24]);
const key = H3Inverse(helperShell);
assert.deepEqual(key, [17,14,7]);

// Source vocabulary is fixed by the authenticated signed message. Retain only
// distinct three-GP-rune words. No target word is chosen in advance.
const targetMap = new Map();
for (const row of source) {
  if (row.values.length === 3) targetMap.set(row.values.join(","), row);
}
const targets = [...targetMap.values()];
assert.deepEqual(
  targets.map((row) => row.word),
  ["PATH","WAY","ITS","ARE","MAP","AND","YOU"]
);

/**
 * Scan a selected page under the layout-derived key.
 * @param {number} page
 * @returns {object[]}
 */
function lexicalHits(page) {
  const hits = [];
  for (const word of pageWords(page).filter((row) => row.values.length === 3)) {
    for (const sign of [-1,1]) {
      const output = word.values.map((value, index) =>
        mod29(value + sign * key[index])
      );
      const target = targets.find((row) =>
        row.values.every((value, index) => output[index] === value)
      );
      if (target) {
        hits.push({
          page,
          ordinal:word.ordinal,
          start:word.start,
          cipher:word.values,
          sign,
          output,
          target:target.word,
        });
      }
    }
  }
  return hits;
}

const p31Hits = lexicalHits(AL);
assert.deepEqual(p31Hits, [{
  page:31,
  ordinal:32,
  start:126,
  cipher:[12,23,1],
  sign:-1,
  output:[24,9,23],
  target:"AND",
}]);

// The same selected line pair has rise K, so use the already established RISE
// page operation once. Freeze the same key and sign on the destination.
const destination = AL + state.K;
assert.equal(destination, 33);
const p33Hits = lexicalHits(destination);
assert.deepEqual(p33Hits, [{
  page:33,
  ordinal:29,
  start:116,
  cipher:[14,17,8],
  sign:-1,
  output:[26,3,1],
  target:"YOU",
}]);

// Existing independent p33 WILL receiver lies exactly a words above YOU.
const p33Will = pageWords(33).find((word) => word.ordinal === 35);
assert.ok(p33Will);
assert.deepEqual(p33Will.values, [3,15,17,22]);
assert.equal(p33Will.ordinal - p33Hits[0].ordinal, state.a);

// Whole-corpus holdout: keep the AL-derived key/sign and seven-word vocabulary fixed.
const allThreeRuneWords = canonicalPages.flatMap((page) =>
  page.words
    .filter((word) => word.values.length === 3)
    .map((word) => ({page:page.page, ...word}))
);
assert.equal(allThreeRuneWords.length, 716);

const allCorpusHits = [];
for (const word of allThreeRuneWords) {
  const output = word.values.map((value, index) =>
    mod29(value - key[index])
  );
  const target = targetMap.get(output.join(","));
  if (target) {
    allCorpusHits.push({
      page:word.page,
      ordinal:word.ordinal,
      start:word.start,
      cipher:word.values,
      output,
      target:target.word,
    });
  }
}
assert.deepEqual(allCorpusHits, [
  {
    page:31, ordinal:32, start:126,
    cipher:[12,23,1], output:[24,9,23], target:"AND",
  },
  {
    page:33, ordinal:29, start:116,
    cipher:[14,17,8], output:[26,3,1], target:"YOU",
  },
]);

// Exhaust the complete 29^3 key family under the already fixed subtraction
// sign and the same seven source-authenticated three-rune target words.
let keysWithAtLeastTwoHits = 0;
let keysWithAtLeastThreeHits = 0;
const keysHittingBothSelectedPages = [];
const keysProducingAndYou = [];
for (let a = 0; a < 29; a += 1) {
  for (let b = 0; b < 29; b += 1) {
    for (let c = 0; c < 29; c += 1) {
      const candidateKey = [a,b,c];
      let totalHits = 0;
      const p31Targets = [];
      const p33Targets = [];
      for (const word of allThreeRuneWords) {
        const output = word.values.map((value, index) =>
          mod29(value - candidateKey[index])
        );
        const target = targetMap.get(output.join(","));
        if (!target) continue;
        totalHits += 1;
        if (word.page === 31) p31Targets.push(target.word);
        if (word.page === 33) p33Targets.push(target.word);
      }
      if (totalHits >= 2) keysWithAtLeastTwoHits += 1;
      if (totalHits >= 3) keysWithAtLeastThreeHits += 1;
      if (p31Targets.length && p33Targets.length) {
        keysHittingBothSelectedPages.push({
          key:candidateKey,
          p31:p31Targets,
          p33:p33Targets,
        });
      }
      if (p31Targets.includes("AND") && p33Targets.includes("YOU")) {
        keysProducingAndYou.push({
          key:candidateKey,
          p31:p31Targets,
          p33:p33Targets,
        });
      }
    }
  }
}
assert.equal(keysWithAtLeastTwoHits, 431);
assert.equal(keysWithAtLeastThreeHits, 35);
assert.deepEqual(keysHittingBothSelectedPages, [
  {key:[17,14,7],p31:["AND"],p33:["YOU"]},
  {key:[20,24,22],p31:["YOU"],p33:["ITS"]},
]);
assert.deepEqual(keysProducingAndYou, [
  {key:[17,14,7],p31:["AND"],p33:["YOU"]},
]);

console.log(JSON.stringify({
  status:"PASS",
  classification:"post-discovery solve-path compression and local plaintext recovery support",
  route:{
    p23StructuralClue:"THE ORIGIN | AL",
    historicalKey:{AL},
    stateResidues:{
      mod23:AL % 23,
      mod28:AL % 28,
      mod29:AL % 29,
      labels:["A","e","K"],
    },
    p50OperationSign:{
      address:AL,
      token:table[AL],
      ascii:String.fromCharCode(Number.parseInt(table[AL],16)),
    },
    selectedPage:AL,
  },
  p31Layout:{
    linePair:{
      upper:selectedPair.upper,
      lower:selectedPair.lower,
      upperChunks:selectedPair.upperLine.chunkCount,
      upperRunes:selectedPair.upperLine.runeCount,
      lowerChunks:selectedPair.lowerLine.chunkCount,
      lowerRunes:selectedPair.lowerLine.runeCount,
      rise:selectedPair.upperLine.runeCount-selectedPair.lowerLine.runeCount,
    },
    helperPacket,
    helperShell,
    key,
    threeRuneWordCount:pageWords(31).filter((row)=>row.values.length===3).length,
    targetVocabulary:targets.map((row)=>row.word),
    hits:p31Hits,
  },
  transfer:{
    pageRise:state.K,
    destination,
    p33ThreeRuneWordCount:pageWords(33).filter((row)=>row.values.length===3).length,
    hits:p33Hits,
    existingRise:{
      instruction:"THEIR RISE",
      magnitude:state.a,
      youWord:p33Hits[0].ordinal,
      willWord:p33Will.ordinal,
    },
  },
  plaintextSequence:["AND","YOU","WILL"],
  decision:"AL=31 independently selects p31. State/layout alone selects the unique K-rise line pair and derives key [17,14,7]. Under the independently available p50[31]='-' sign, scanning all p31 three-rune words against all authenticated three-rune source targets yields one hit: AND. The same line-pair rise K selects p33, where the unchanged key/sign yields one hit: YOU; existing THEIR RISE moves YOU to WILL.",
}, null, 2));
