"use strict";

/**
 * SFT: EA prime109 selects a p0 PATHS reset and a base60 branch that sheds to THE ROAD.
 *
 * This script uses only committed source artifacts. It checks the untouched
 * post-ROAD p0 words selected by the existing EA prime receiver, charges the
 * signed-word numbering and p50 radix choices, and enumerates whole-manuscript
 * controls. Node.js 22, CommonJS, no third-party dependencies.
 */

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

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signedText = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const parts = transcription.split(/^\s*%\s*$/m);
const tokens = grid.pages.flatMap((page) => page.tokens);
const table60 = grid.pages.flatMap((page) => page.bytes);
const alphabet59 = grid.alphabet.replace("f", "");

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/**
 * @param {string} text
 * @returns {Array<{start:number,end:number,values:number[]}>}
 */
function parseWords(text) {
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;

  function flush() {
    if (!current.length) return;
    words.push({start, end: offset - 1, values: current.slice()});
    current = [];
  }

  for (const character of [...text]) {
    if (runeSet.has(character)) {
      if (!current.length) start = offset;
      current.push(runeIndex.get(character));
      offset += 1;
    } else if (character === "-" || character === ".") {
      flush();
    }
  }
  flush();
  return words;
}

/** @param {number[]} values @returns {number} */
function gp0(values) {
  return values.reduce((sum, value) => sum + value, 0);
}

/** @param {string} token @returns {number|null} */
function base59(token) {
  const high = alphabet59.indexOf(token[0]);
  const low = alphabet59.indexOf(token[1]);
  if (high < 0 || low < 0) return null;
  return high * 59 + low;
}

const table59 = tokens.map(base59);
const clearSigned = signedText
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/, "")
  .replace(/\b3301\b/g, "")
  .replace(/\b[0-9A-F]{8,}\b/g, "");
const signedWords = (clearSigned.match(/[A-Za-z]+/g) || [])
  .map((word) => word.toUpperCase());
assert.equal(signedWords.length, 43);
assert.equal(signedWords[23], "ROAD");
assert.equal(signedWords[37], "LUCK");
assert.equal(signedWords[40], "PATHS");

/** @param {number} address @returns {{hi:number,lo:number}} */
function cell(address) {
  const byte = table60[address];
  return {hi: Math.floor(byte / 29), lo: byte % 29};
}

/** @param {number} start @returns {[number,number]} */
function tripletPair(start) {
  const left = cell(start);
  const middle = cell(start + 1);
  const right = cell(start + 2);
  return [mod29(left.lo - right.hi), mod29(middle.lo - right.hi)];
}

const tripletStarts = [11,14,17,20,23,26,29,32,35,38];
const pairBySignedIndex = new Map();
for (const start of tripletStarts) {
  const pair = tripletPair(start);
  for (let offset = 0; offset < 3; offset += 1) {
    pairBySignedIndex.set(start + offset, {
      start,
      pair,
      clause: signedWords.slice(start, start + 3),
    });
  }
}

assert.deepEqual(signedWords.slice(38, 41), ["BEWARE", "FALSE", "PATHS"]);
assert.deepEqual(tripletPair(38), [15,3]);

const p0 = parseWords(physicalPart(0));
const ea = corpus.translit.indexOf("EA");
assert.equal(ea, 28);
assert.equal(corpus.prime[ea], 109);

const reset = p0.find((word) => word.start === corpus.prime[ea]);
assert.ok(reset);
assert.deepEqual(reset, {start:109,end:110,values:[14,26]});
assert.equal(gp0(reset.values), 40);
assert.equal(signedWords[gp0(reset.values)], "PATHS");
assert.equal(tokens[40], "1K");
assert.equal(table60[40], 80);
assert.equal(table59[40], 79);

const warningPair = tripletPair(38);
assert.deepEqual(
  reset.values,
  warningPair.map((value) => mod29(-value))
);
assert.deepEqual(
  reset.values.map((value, index) => mod29(value + warningPair[index])),
  [0,0]
);

// Charge all two-rune words against the ten source triplet pairs.
const primeStarts = new Set(corpus.prime);
const variants = [
  {sign:1, reverse:false, name:"plus-forward"},
  {sign:1, reverse:true, name:"plus-reverse"},
  {sign:-1, reverse:false, name:"minus-forward"},
  {sign:-1, reverse:true, name:"minus-reverse"},
].map((variant) => ({...variant, broad:[], primeSelected:[]}));

let totalWords = 0;
let twoRuneWords = 0;
let primeStartTwoRuneWords = 0;
let primeStartMappedTwoRuneWords = 0;

for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const words = parseWords(physicalPart(page));
  totalWords += words.length;

  for (let wordIndex = 0; wordIndex < words.length; wordIndex += 1) {
    const word = words[wordIndex];
    if (word.values.length !== 2) continue;
    twoRuneWords += 1;

    const sum = gp0(word.values);
    const source = pairBySignedIndex.get(sum);
    const primeSelected = primeStarts.has(word.start);
    if (primeSelected) primeStartTwoRuneWords += 1;
    if (primeSelected && source) primeStartMappedTwoRuneWords += 1;
    if (!source) continue;

    for (const variant of variants) {
      let pair = variant.reverse
        ? [source.pair[1], source.pair[0]]
        : source.pair.slice();
      pair = pair.map((value) => mod29(variant.sign * value));
      if (word.values[0] !== pair[0] || word.values[1] !== pair[1]) continue;

      const row = {
        page,
        word: wordIndex + 1,
        start: word.start,
        values: word.values,
        gp0: sum,
        signedWord: signedWords[sum],
        clause: source.clause,
        sourcePair: source.pair,
      };
      variant.broad.push(row);
      if (primeSelected) variant.primeSelected.push(row);
    }
  }
}

assert.equal(totalWords, 2928);
assert.equal(twoRuneWords, 465);
assert.equal(primeStartTwoRuneWords, 46);
assert.equal(primeStartMappedTwoRuneWords, 40);
assert.deepEqual(
  variants.map((variant) => [variant.name, variant.broad.length]),
  [
    ["plus-forward",0],
    ["plus-reverse",0],
    ["minus-forward",2],
    ["minus-reverse",0],
  ]
);
assert.deepEqual(
  variants.map((variant) => [variant.name, variant.primeSelected.length]),
  [
    ["plus-forward",0],
    ["plus-reverse",0],
    ["minus-forward",1],
    ["minus-reverse",0],
  ]
);
assert.deepEqual(variants[2].primeSelected[0], {
  page:0,
  word:24,
  start:109,
  values:[14,26],
  gp0:40,
  signedWord:"PATHS",
  clause:["BEWARE","FALSE","PATHS"],
  sourcePair:[15,3],
});

/**
 * @param {number[]} table
 * @returns {{triples:Array<any[]>,exact:Array<any[]>}}
 */
function return80Census(table) {
  const triples = [];
  const exact = [];

  for (let page = 0; page <= 55; page += 1) {
    if (page === 50) continue;
    const selected = parseWords(physicalPart(page))
      .map((word, wordIndex) => {
        const sum = gp0(word.values);
        const interior = word.values.slice(1, -1);
        const interiorSum = gp0(interior);
        return {
          page,
          word: wordIndex + 1,
          start: word.start,
          end: word.end,
          values: word.values,
          gp0: sum,
          label: sum < signedWords.length ? signedWords[sum] : null,
          interior,
          interiorGp0: interiorSum,
          interiorLabel:
            interiorSum < signedWords.length ? signedWords[interiorSum] : null,
          pointer: sum < table.length ? table[sum] : null,
        };
      })
      .filter((row) => row.pointer === 80);

    for (let index = 0; index + 2 < selected.length; index += 1) {
      const triple = selected.slice(index, index + 3);
      triples.push(triple);
      if (
        triple.map((row) => row.label).join("|") === "PATHS|PATHS|LUCK" &&
        triple[1].interiorLabel === "THE" &&
        triple[2].interiorLabel === "ROAD"
      ) {
        exact.push(triple);
      }
    }
  }

  return {triples, exact};
}

const base60Census = return80Census(table60);
const base59Census = return80Census(table59);
assert.equal(base60Census.triples.length, 32);
assert.equal(base60Census.exact.length, 1);
assert.equal(base59Census.triples.length, 0);
assert.equal(base59Census.exact.length, 0);

const route = base60Census.exact[0];
assert.deepEqual(
  route.map((row) => [row.page,row.word,row.start,row.end,row.gp0,row.label]),
  [
    [0,24,109,110,40,"PATHS"],
    [0,25,111,113,40,"PATHS"],
    [0,27,117,121,37,"LUCK"],
  ]
);
assert.deepEqual(route[1].interior, [1]);
assert.deepEqual(route[2].interior, [2,11,10]);
assert.deepEqual(
  [route[1].interiorGp0,route[2].interiorGp0],
  [1,23]
);
assert.deepEqual(
  [route[1].interiorLabel,route[2].interiorLabel],
  ["THE","ROAD"]
);

// Charge the signed-word numbering convention.
assert.deepEqual(
  [signedWords[40],signedWords[40],signedWords[37],signedWords[1],signedWords[23]],
  ["PATHS","PATHS","LUCK","THE","ROAD"]
);
assert.deepEqual(
  [signedWords[39],signedWords[39],signedWords[36],signedWords[0],signedWords[22]],
  ["FALSE","FALSE","GOOD","HELLO","THE"]
);

// The original READ/OUT p50 cells also discriminate the two radices.
assert.equal(tokens[55], "1K");
assert.equal(tokens[20], "1g");
assert.equal(table60[55], 80);
assert.equal(table60[20], 102);
assert.equal(table59[55], 79);
assert.equal(table59[20], 100);

console.log(JSON.stringify({
  status:"PASS",
  frozenSelector:{
    eaValue:ea,
    eaPrime:corpus.prime[ea],
    selectedWord:reset,
  },
  sourceReset:{
    signedIndex:40,
    signedWord:signedWords[40],
    sourceClause:signedWords.slice(38,41),
    sourcePair:warningPair,
    ciphertextAsNegativePair:reset.values,
    additiveClosure:[0,0],
  },
  manuscriptCharge:{
    totalWords,
    twoRuneWords,
    primeStartTwoRuneWords,
    primeStartMappedTwoRuneWords,
    variants:variants.map((variant) => ({
      name:variant.name,
      broadHits:variant.broad,
      primeSelectedHits:variant.primeSelected,
    })),
  },
  base60Route:{
    returnTripleCount:base60Census.triples.length,
    exactRoute:route,
    emitted:[route[1].interiorLabel,route[2].interiorLabel],
  },
  controls:{
    base59ReturnTripleCount:base59Census.triples.length,
    base59ExactRouteCount:base59Census.exact.length,
    zeroBased:["PATHS","PATHS","LUCK","THE","ROAD"],
    oneBased:["FALSE","FALSE","GOOD","HELLO","THE"],
    readOutEndpoints:{
      base60:[table60[55],table60[20]],
      base59:[table59[55],table59[20]],
    },
  },
  classification:
    "Conditional source-derived navigation holdout. The EA-selected untouched p0 branch uniquely favors conventional base60 and zero-based signed-word numbering, and SHED emits THE ROAD from later ciphertext; no plaintext is assigned to offsets109..121.",
}, null, 2));
