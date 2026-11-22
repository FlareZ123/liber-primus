"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {number} value */
function mod29(value) { return ((value % 29) + 29) % 29; }
/** @param {number[]} values */
function H2(values) { return [mod29(values[0] - values[1]), mod29(values[0] + values[1])]; }
/** @param {number[]} values */
function H3(values) { return [mod29(values[0] - values[2]), mod29(values[0] + values[2]), values[1]]; }
/** @param {number[]} values */
function isUnitRun(values) {
  const step = values[1] - values[0];
  if (Math.abs(step) !== 1) return false;
  for (let index = 2; index < values.length; index += 1) if (values[index] - values[index - 1] !== step) return false;
  return true;
}

const parts = transcription.split(/^\s*%\s*$/m).slice(0, 55);
const pages = parts.map((text, segment) => ({page: segment >= 50 ? segment + 1 : segment, words: [], offset: 0}));
let current = [], startSegment = 0, endSegment = 0, startOffset = 0, crossingWordCount = 0;
function flushWord() {
  if (!current.length) return;
  if (startSegment === endSegment) {
    const page = pages[startSegment];
    page.words.push({page: page.page, ordinal: page.words.length + 1, start: startOffset, end: startOffset + current.length - 1, values: current.slice()});
  } else crossingWordCount += 1;
  current = [];
}
for (let segment = 0; segment < parts.length; segment += 1) {
  for (const char of [...parts[segment]]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) { startSegment = segment; startOffset = pages[segment].offset; }
      endSegment = segment;
      current.push(value);
      pages[segment].offset += 1;
    } else if (char !== "/" && !/\s/u.test(char)) flushWord();
  }
}
flushWord();

const allWords = pages.flatMap((page) => page.words);
const wordsByPage = new Map(pages.map((page) => [page.page, page.words]));
assert.equal(crossingWordCount, 32);
assert.equal(allWords.length, 2864);

const clear = signed2016.split("-----BEGIN PGP SIGNATURE-----")[0].split(/\n\n/u).slice(1).join("\n");
const source = clear.split(/[^A-Za-z0-9]+/u).filter((token) => /^[A-Za-z]+$/u.test(token)).map((word) => word.toUpperCase());
assert.equal(source.length, 43);

const diagonal = source.map((word, index) => ({sourceIndex: index, sourceWord: word, page: index, object: (wordsByPage.get(index) || [])[index] || null}));
assert.equal(diagonal.filter((row) => row.object).length, 42);
assert.deepEqual(diagonal.filter((row) => !row.object).map((row) => [row.sourceIndex, row.sourceWord]), [[32, "YOU"]]);

const p42 = wordsByPage.get(42);
assert.deepEqual(p42[41], {page:42, ordinal:42, start:203, end:205, values:[11,13,11]});
assert.deepEqual(p42[42], {page:42, ordinal:43, start:206, end:208, values:[16,0,14]});
const openpgp = diagonal[42];
assert.deepEqual(H3(openpgp.object.values), [2,1,0]);
assert.deepEqual(H3(openpgp.object.values).map((value) => source[value]), ["PATH","THE","HELLO"]);

const diagonalThree = diagonal.filter((row) => row.object && row.object.values.length === 3).map((row) => ({...row,h:H3(row.object.values)}));
assert.equal(diagonalThree.length, 8);
assert.deepEqual(diagonalThree.filter((row) => isUnitRun(row.h)).map((row) => [row.sourceIndex,row.sourceWord,row.object.ordinal,row.object.start,row.object.values,row.h]), [[42,"OPENPGP",43,206,[16,0,14],[2,1,0]]]);
assert.equal(diagonalThree.filter((row) => row.object.values[0] === row.object.values[2]).length, 0);

const allThree = allWords.filter((word) => word.values.length === 3);
assert.equal(allThree.length, 716);
assert.deepEqual(allThree.filter((word) => H3(word.values).join(",") === "2,1,0").map((word) => [word.page,word.ordinal,word.start,word.values]), [[42,43,206,[16,0,14]]]);
assert.equal(allThree.filter((word) => isUnitRun(H3(word.values))).length, 3);

const andRow = diagonal[24];
assert.deepEqual(andRow.object, {page:24, ordinal:25, start:115, end:116, values:[27,15]});
assert.deepEqual(H2(andRow.object.values), [12,13]);
assert.deepEqual(H2(andRow.object.values).map((value) => source[value]), ["THE","WAY"]);
assert.equal(andRow.object.values[0] + andRow.object.values[1], 42);
assert.equal(source[42], "OPENPGP");

const diagonalTwo = diagonal.filter((row) => row.object && row.object.values.length === 2).map((row) => ({...row,h:H2(row.object.values)}));
assert.equal(diagonalTwo.length, 10);
assert.deepEqual(diagonalTwo.filter((row) => isUnitRun(row.h)).map((row) => [row.sourceIndex,row.sourceWord,row.h]), [[11,"IS",[26,25]],[24,"AND",[12,13]]]);

const allTwo = allWords.filter((word) => word.values.length === 2);
assert.equal(allTwo.length, 448);
assert.deepEqual(allTwo.filter((word) => H2(word.values).join(",") === "12,13").map((word) => [word.page,word.ordinal,word.start,word.values]), [[24,25,115,[27,15]]]);
assert.equal(allTwo.filter((word) => isUnitRun(H2(word.values))).length, 35);

const gpTokens = corpus.translit.map((symbol, value) => ({symbol,value})).sort((a,b) => b.symbol.length - a.symbol.length);
/** @param {string} word */
function gp0(word) {
  const normalized = word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g,"");
  const values = [];
  for (let index = 0; index < normalized.length;) {
    if (normalized.startsWith("ING", index)) { values.push(21); index += 3; continue; }
    if (normalized.startsWith("IO", index)) { values.push(27); index += 2; continue; }
    const token = gpTokens.find((row) => normalized.startsWith(row.symbol, index));
    assert.ok(token);
    values.push(token.value);
    index += token.symbol.length;
  }
  return mod29(values.reduce((sum,value) => sum + value, 0));
}
assert.equal(gp0("AND"), 27);
assert.deepEqual(diagonalTwo.filter((row) => isUnitRun(row.h) && row.object.values[0] === gp0(row.sourceWord)).map((row) => [row.sourceIndex,row.sourceWord,row.object.values,row.h]), [[24,"AND",[27,15],[12,13]]]);

console.log("PASS canonical OPENPGP43 correction and p24 AND -> THE WAY checkpoint");
