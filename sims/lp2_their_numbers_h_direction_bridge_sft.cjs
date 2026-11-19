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

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const parts = transcription.split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {[number,number]} pair @returns {[number,number]} */
function h(pair) {
  return [mod29(pair[0] - pair[1]), mod29(pair[0] + pair[1])];
}

/** @param {[number,number]} shell @returns {[number,number]} */
function hInverse(shell) {
  return [
    mod29((shell[1] + shell[0]) * 15),
    mod29((shell[1] - shell[0]) * 15),
  ];
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
    assert.ok(token);
    out.push(token.value);
    index += token.symbol.length;
  }
  return out;
}

/** @param {number} page @returns {{page:number,ordinal0:number,start:number,values:number[]}[]} */
function pageWords(page) {
  const source = parts[page <= 49 ? page : page - 1];
  const out = [];
  let current = [];
  let start = 0;
  let offset = 0;
  const flush = () => {
    if (!current.length) return;
    out.push({page, ordinal0: out.length, start, values: current.slice()});
    current = [];
  };
  for (const ch of source) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if (ch === "-" || ch === "." || ch === "&") {
      flush();
    } else if (ch === "/" || /\s/u.test(ch)) {
      // line wrap preserves word
    } else {
      flush();
    }
  }
  flush();
  return out;
}

const clear = signed.split("-----BEGIN PGP SIGNATURE-----")[0];
const sourceWords = clear
  .slice(clear.indexOf("Hello."))
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word) => word.toUpperCase());
assert.equal(sourceWords.length, 43);

const positions = new Map();
for (let index = 0; index < sourceWords.length; index += 1) {
  const word = sourceWords[index];
  if (!positions.has(word)) positions.set(word, []);
  positions.get(word).push(index);
}

assert.deepEqual(positions.get("THEIR"), [19, 25]);
assert.deepEqual(positions.get("IS"), [11, 21]);
assert.deepEqual(
  sourceWords.slice(23, 30),
  ["ROAD", "AND", "THEIR", "NUMBERS", "ARE", "THE", "DIRECTION"]
);

const exactlyTwice = [...positions.entries()]
  .filter(([, indices]) => indices.length === 2)
  .map(([word, indices]) => ({
    word,
    indices,
    h: h(indices),
  }));
assert.deepEqual(exactlyTwice, [
  {word:"IS", indices:[11,21], h:[19,3]},
  {word:"ARE", indices:[16,27], h:[18,14]},
  {word:"THEIR", indices:[19,25], h:[23,15]},
  {word:"AND", indices:[24,31], h:[22,26]},
]);

// P39 literal THEIR-number transition.
const p39 = corpus.pages.find((page) => page.page === 39);
assert.ok(p39);
const red = p39.indices.slice(119, 122);
assert.deepEqual(red, [27,5,15]);
const redH1 = h([red[0], red[1]]);
const redH2 = h(redH1);
const redH3 = h(redH2);
assert.deepEqual(redH1, [22,3]);
assert.deepEqual(redH2, positions.get("THEIR"));
assert.deepEqual(redH3, [23,15]);
assert.deepEqual(redH3, h(positions.get("THEIR")));

// IS uniquely maps to adjacent source positions among distinct two-GP-rune
// authenticated words.
const distinctTwoRune = [];
const seen = new Set();
for (const word of sourceWords) {
  if (seen.has(word)) continue;
  seen.add(word);
  const values = gp(word);
  if (values.length === 2) {
    const shell = h(values);
    distinctTwoRune.push({
      word,
      values,
      h: shell,
      adjacent:
        shell[0] < sourceWords.length &&
        shell[1] < sourceWords.length &&
        Math.abs(shell[0] - shell[1]) === 1,
    });
  }
}
assert.deepEqual(distinctTwoRune, [
  {word:"THE", values:[2,18], h:[13,20], adjacent:false},
  {word:"IS", values:[10,15], h:[24,25], adjacent:true},
  {word:"BE", values:[17,18], h:[28,6], adjacent:false},
]);

const plaintext = gp("IS");
const plainH = h(plaintext);
assert.deepEqual(plainH, [24,25]);
assert.deepEqual(plainH.map((index) => sourceWords[index]), ["AND","THEIR"]);

const leftShell = [23,25];
const rightShell = [26,25];
assert.deepEqual(leftShell.map((index) => sourceWords[index]), ["ROAD","THEIR"]);
assert.deepEqual(rightShell.map((index) => sourceWords[index]), ["NUMBERS","THEIR"]);

const leftCipher = hInverse(leftShell);
const rightCipher = hInverse(rightShell);
assert.deepEqual(leftCipher, [24,1]);
assert.deepEqual(rightCipher, [11,14]);

// Census complete two-rune unknown words.
let twoRuneWords = 0;
const predictedOccurrences = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  for (const word of pageWords(page)) {
    if (word.values.length !== 2) continue;
    twoRuneWords += 1;
    if (word.values.every((value, slot) => value === leftCipher[slot])) {
      predictedOccurrences.push({kind:"left", ...word});
    }
    if (word.values.every((value, slot) => value === rightCipher[slot])) {
      predictedOccurrences.push({kind:"right", ...word});
    }
  }
}
assert.equal(twoRuneWords, 465);
assert.deepEqual(predictedOccurrences, [
  {kind:"right", page:11, ordinal0:11, start:49, values:[11,14]},
  {kind:"left", page:21, ordinal0:33, start:170, values:[24,1]},
]);

const p11 = pageWords(11)[11];
const p21 = pageWords(21).find((word) => word.start === 170);
assert.ok(p21);

const assignments = [
  {p11:leftCipher, p21:rightCipher},
  {p11:rightCipher, p21:leftCipher},
].map((assignment) => ({
  p11: assignment.p11,
  p21: assignment.p21,
  hits:
    (assignment.p11.every((value, slot) => value === p11.values[slot]) ? 1 : 0) +
    (assignment.p21.every((value, slot) => value === p21.values[slot]) ? 1 : 0),
}));
assert.deepEqual(assignments.map((row) => row.hits), [0,2]);

assert.deepEqual(h(p21.values), leftShell);
assert.deepEqual(h(p11.values), rightShell);

// Key shells are exactly source-boundary displacements from H(IS).
assert.deepEqual([
  mod29(leftShell[0] - plainH[0]),
  mod29(leftShell[1] - plainH[1]),
], [28,0]);
assert.deepEqual([
  mod29(rightShell[0] - plainH[0]),
  mod29(rightShell[1] - plainH[1]),
], [2,0]);

console.log(JSON.stringify({
  status:"PASS",
  source:{
    phrase:sourceWords.slice(23,30),
    theirPositions:positions.get("THEIR"),
    theirNumbersH:h(positions.get("THEIR")),
    exactlyTwice,
  },
  p39:{
    red,
    chain:[redH1,redH2,redH3],
    literalIntermediate:"THEIR source positions",
  },
  isBoundary:{
    plaintext,
    plainH,
    plainWords:plainH.map((index) => sourceWords[index]),
    left:{
      shell:leftShell,
      words:leftShell.map((index) => sourceWords[index]),
      cipher:leftCipher,
    },
    right:{
      shell:rightShell,
      words:rightShell.map((index) => sourceWords[index]),
      cipher:rightCipher,
    },
    completeTwoRuneWords:twoRuneWords,
    predictedOccurrences,
    assignmentHits:assignments.map((row) => row.hits),
  },
}, null, 2));
