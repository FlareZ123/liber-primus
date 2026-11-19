"use strict";

/**
 * SFT: prospectively selected EA109 receiver -> THE MAP candidate.
 *
 * Enumerates the complete authenticated 2016 [2,3] phrase family against all
 * p0 [2,3] complete-word receivers, verifies the unique EA-selector key echo,
 * reconstructs the original ciphertext, and checks the pre-existing
 * MAP -> GP0 56 -> p50/base60 254 -> p0 word57 -> NEXT consumer.
 *
 * CommonJS, Node.js 22, no third-party dependencies.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const tokenRows = corpus.translit
  .map((token,index) => [token,index])
  .sort((left,right) => right[0].length - left[0].length);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {string} original @returns {number[]} */
function encodeWord(original) {
  const normalized = original.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S");
  const out = [];
  for (let position = 0; position < normalized.length;) {
    const row = tokenRows.find(([token]) =>
      normalized.startsWith(token, position));
    assert.ok(row, "unmapped word " + original);
    out.push(row[1]);
    position += row[0].length;
  }
  return out;
}

/** @param {number[]} values @returns {number} */
function gp0(values) {
  return values.reduce((sum,value) => sum + value, 0);
}

const signedBody = signed2016
  .slice(signed2016.indexOf("Hello."),
    signed2016.indexOf("-----BEGIN PGP SIGNATURE-----"))
  .replace(/\b[0-9A-F]{8}\b/g, "")
  .replace(/\b\d+\b/g, "");

const signedWords = (signedBody.match(/[A-Za-z]+/g) || [])
  .map((word,index) => ({
    ordinal:index + 1,
    word:word.toUpperCase(),
    values:encodeWord(word),
  }));

const source23 = [];
for (let index = 0; index + 1 < signedWords.length; index += 1) {
  const left = signedWords[index];
  const right = signedWords[index + 1];
  if (left.values.length === 2 && right.values.length === 3) {
    source23.push({
      ordinals:[left.ordinal,right.ordinal],
      words:[left.word,right.word],
      values:[left.values,right.values],
    });
  }
}
assert.deepEqual(source23.map((row) => [row.ordinals,row.words]), [
  [[2,3],["THE","PATH"]],
  [[13,14],["THE","WAY"]],
  [[18,19],["THE","MAP"]],
]);

const runeIndex = new Map(
  corpus.runes.map((rune,index) => [rune,index]));
const runeSet = new Set(corpus.runes);
const p0Text = transcription.split(/^\s*%\s*$/m)[0];
const p0Words = [];
let current = [];
let start = 0;
let offset = 0;
const flush = () => {
  if (!current.length) return;
  p0Words.push({
    word:p0Words.length + 1,
    start,
    end:offset - 1,
    values:current.slice(),
  });
  current = [];
};
for (const char of [...p0Text]) {
  if (runeSet.has(char)) {
    if (!current.length) start = offset;
    current.push(runeIndex.get(char));
    offset += 1;
  } else if (char === "-" || char === ".") {
    flush();
  }
}
flush();

const p0Pairs23 = [];
for (let index = 0; index + 1 < p0Words.length; index += 1) {
  const left = p0Words[index];
  const right = p0Words[index + 1];
  if (left.values.length === 2 && right.values.length === 3) {
    p0Pairs23.push({
      words:[left.word,right.word],
      start:left.start,
      end:right.end,
      cipher:[left.values,right.values],
    });
  }
}
assert.deepEqual(
  p0Pairs23.map((row) => [row.words,row.start,row.end]),
  [
    [[16,17],75,79],
    [[24,25],109,113],
    [[28,29],122,126],
  ]
);

const ea = corpus.translit.indexOf("EA");
assert.equal(ea, 28);
assert.equal(corpus.prime[ea], 109);
const targetReceiver = p0Pairs23.find((row) => row.start === 109);
assert.ok(targetReceiver);
assert.deepEqual(targetReceiver.cipher, [[14,26],[18,1,21]]);

const dh = {p:23,g:5,a:6,A:8,B:19,b:15,K:2};
const dhValues = new Set(Object.values(dh));
const rows = [];

for (const source of source23) {
  for (const receiver of p0Pairs23) {
    const keys = receiver.cipher.map((word,wordIndex) =>
      word.map((cipher,index) =>
        mod29(cipher - source.values[wordIndex][index])));
    const second = keys[1];
    rows.push({
      source:source.words.join(" "),
      ordinals:source.ordinals,
      receiver:[receiver.start,receiver.end],
      p0Words:receiver.words,
      keys,
      secondAllAugmentedState:
        second.every((value) => value === ea || dhValues.has(value)),
      selectorEcho:
        second[0] === ea &&
        second.slice(1).every((value) => dhValues.has(value)),
    });
  }
}

assert.equal(rows.length, 9);
assert.deepEqual(
  rows.filter((row) => row.receiver[0] === 109)
    .map((row) => [row.source,row.keys,row.secondAllAugmentedState,row.selectorEcho]),
  [
    ["THE PATH",[[12,8],[5,6,19]],true,false],
    ["THE WAY", [[12,8],[11,6,24]],false,false],
    ["THE MAP", [[12,8],[28,6,8]],true,true],
  ]
);
assert.deepEqual(rows.filter((row) => row.selectorEcho), [{
  source:"THE MAP",
  ordinals:[18,19],
  receiver:[109,113],
  p0Words:[24,25],
  keys:[[12,8],[28,6,8]],
  secondAllAugmentedState:true,
  selectorEcho:true,
}]);

const theMap = source23.find((row) => row.words.join(" ") === "THE MAP");
assert.ok(theMap);
assert.deepEqual(theMap.values, [[2,18],[19,24,13]]);

const key = [[12,8],[ea,dh.a,dh.A]];
const reconstructed = theMap.values.map((word,wordIndex) =>
  word.map((value,index) => mod29(value + key[wordIndex][index])));
assert.deepEqual(reconstructed, targetReceiver.cipher);
assert.deepEqual(key, [[12,8],[28,6,8]]);

assert.equal(563 % 29, 12);
assert.equal((dh.a * dh.K) % 29, 12);
assert.equal(dh.A, 8);

const map = theMap.values[1];
assert.equal(gp0(map), 56);
assert.equal(grid.bytes[56], 254);
const word57 = p0Words[56];
assert.equal(word57.word, 57);
assert.equal(word57.start, 254);
assert.equal(gp0(encodeWord("NEXT")), 57);

const sourceMapIndex = signedWords.findIndex((row,index) =>
  row.word === "MAP" && index > 0 && signedWords[index - 1].word === "THE");
assert.equal(signedWords[sourceMapIndex + 1].word, "THEIR");
assert.notEqual(
  signedWords[sourceMapIndex + 1].values.length,
  p0Words[25].values.length
);

console.log(JSON.stringify({
  status:"PASS",
  receiver:{
    selector:"EA",
    selectorPrime:109,
    p0Words:[24,25],
    offsets:[109,113],
    cipher:targetReceiver.cipher,
  },
  family:{
    sourcePhrases:source23.map((row) => row.words.join(" ")),
    p0Receivers:p0Pairs23.map((row) => [row.start,row.end]),
    combinations:rows.length,
    selectorEchoHits:rows.filter((row) => row.selectorEcho),
  },
  candidate:{
    plaintext:"THE MAP",
    values:theMap.values,
    key,
    forwardReconstruction:reconstructed,
  },
  downstream:{
    mapGp0:56,
    p50Base60:grid.bytes[56],
    p0Word57Start:word57.start,
    nextGp0:gp0(encodeWord("NEXT")),
  },
  decision:
    "At the independently selected EA109 receiver, THE MAP is the unique authenticated [2,3] phrase whose second-word additive key echoes the selector EA and then two DH23 fields [a,A]. It exactly reconstructs the original ciphertext and its MAP word feeds the previously committed MAP->NEXT consumer.",
}, null, 2));
