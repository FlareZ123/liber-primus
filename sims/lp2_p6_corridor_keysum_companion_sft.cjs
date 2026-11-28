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
function mod29(value) { return ((value % 29) + 29) % 29; }
/** @param {number[]} values @returns {number} */
function sum29(values) { return mod29(values.reduce((total, value) => total + value, 0)); }
/** @param {number[]} shell @returns {number[]} */
function h4Inverse(shell) {
  const inv2 = 15;
  return [
    mod29((shell[0] + shell[3]) * inv2),
    mod29((shell[1] + shell[2]) * inv2),
    mod29((shell[2] - shell[1]) * inv2),
    mod29((shell[3] - shell[0]) * inv2),
  ];
}
/** @param {number[]} shell @returns {number[]} */
function h2Inverse(shell) {
  const inv2 = 15;
  return [mod29((shell[0] + shell[1]) * inv2), mod29((shell[1] - shell[0]) * inv2)];
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signedText = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW").replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) { values.push(21); offset += 3; continue; }
    if (normalized.startsWith("IO", offset)) { values.push(27); offset += 2; continue; }
    const token = gpTokens.find((candidate) => normalized.startsWith(candidate.symbol, offset));
    assert.ok(token, `unmapped GP spelling: ${normalized.slice(offset)}`);
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

const clear = signedText.split("-----BEGIN PGP SIGNATURE-----")[0];
const sourceWords = clear.slice(clear.indexOf("Hello."))
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((label, index) => ({ index, label: label.toUpperCase(), gp: gp(label) }));
assert.equal(sourceWords.length, 43);
const sourceGp0 = sourceWords.map((word) => sum29(word.gp));

const p6Runes = corpus.pages[6].indices;
const W1 = p6Runes.slice(71, 75);
const W2 = p6Runes.slice(75, 76);
const W3 = p6Runes.slice(76, 80);
const W4 = p6Runes.slice(80, 82);
const title = [...W1, ...W2, ...W3, ...W4];
assert.deepEqual(W1, [24,16,14,17]);
assert.deepEqual(W2, [19]);
assert.deepEqual(W3, [6,27,15,17]);
assert.deepEqual(W4, [14,12]);

const parts = transcription.split(/^\s*%\s*$/m);
const lineCounts = parts[6].split("\n")
  .map((line) => [...line].filter((char) => runeIndex.has(char)).length)
  .filter((count) => count > 0);
assert.deepEqual(lineCounts, [20,24,24,3,18,19,20,24,22,22]);
const distinctLineCounts = [...new Set(lineCounts)];
const titleLengths = [4,1,4,2];
const titleWordGp0 = [sum29(W1), sum29(W2), sum29(W3), sum29(W4)];
assert.deepEqual(titleWordGp0, [13,19,7,26]);
const redMarker = 13;

/** @param {number} page @param {number} start @param {number} length @returns {number[]} */
function slicePage(page, start, length) {
  const values = corpus.pages[page].indices.slice(start, start + length);
  assert.equal(values.length, length);
  return values;
}

const preparedReceivers = [
  slicePage(32,30,3),
  slicePage(33,132,4),
  slicePage(34,4,2),
  slicePage(35,25,5),
  slicePage(36,169,5).filter((_, index) => index !== 2),
  slicePage(37,146,4),
  slicePage(38,57,6),
  slicePage(39,132,5),
  slicePage(40,71,4),
  slicePage(41,178,7).filter((_, index) => index !== 3),
  slicePage(42,211,8).filter((_, index) => index !== 1),
];
const preparedGp0 = preparedReceivers.map(sum29);
assert.deepEqual(preparedGp0, [5,28,6,3,16,9,1,18,25,6,6]);

const expectedSource = ["YOU","WILL","BE","FOUND","GOOD","LUCK","BEWARE","FALSE","PATHS","VERIFY","OPENPGP"];
assert.deepEqual(sourceWords.slice(32,43).map((word) => word.label), expectedSource);
const expectedSourceGp0 = sourceGp0.slice(32,43);
assert.deepEqual(expectedSourceGp0, [1,28,6,7,6,2,1,19,25,1,17]);

const requiredKeySums = preparedGp0.map((value, index) => mod29(value - expectedSourceGp0[index]));
assert.deepEqual(requiredKeySums, [4,0,0,25,10,7,0,28,0,5,18]);
const companion = requiredKeySums.map((value, index) => mod29(value - title[index]));
assert.deepEqual(companion, [9,13,15,8,20,1,2,13,12,20,6]);

assert.deepEqual(h4Inverse([1,27,28,17]), companion.slice(0,4));
assert.equal(companion[4], 20);
assert.deepEqual(h4Inverse([18,18,15,13]), companion.slice(5,9));
assert.deepEqual(h2Inverse([14,26]), companion.slice(9,11));

const block1 = new Set();
for (const length of titleLengths) {
  for (const y of title) {
    for (const z of title) block1.add(h4Inverse([length,y,mod29(-length),z]).join(","));
  }
}
assert.equal(block1.size, 243);

const singleton = new Set(distinctLineCounts.map(String));
assert.equal(singleton.size, 6);

const block3 = new Set();
for (const lineCount of distinctLineCounts) {
  for (const y of title) block3.add(h4Inverse([lineCount,lineCount,y,redMarker]).join(","));
}
assert.equal(block3.size, 54);

const terminal = new Set();
for (const x of W4) {
  for (const wordGp0 of titleWordGp0) terminal.add(h2Inverse([x,wordGp0]).join(","));
}
assert.equal(terminal.size, 8);
assert.equal(block1.size * singleton.size * block3.size * terminal.size, 629856);

/** @param {number[]} vector @returns {boolean} */
function companionInFamily(vector) {
  return block1.has(vector.slice(0,4).join(","))
    && singleton.has(String(vector[4]))
    && block3.has(vector.slice(5,9).join(","))
    && terminal.has(vector.slice(9,11).join(","));
}

const hits = [];
for (let start = 0; start <= sourceWords.length - 11; start += 1) {
  const required = preparedGp0.map((cipherGp0, index) =>
    mod29(cipherGp0 - sourceGp0[start + index] - title[index])
  );
  if (companionInFamily(required)) {
    hits.push({
      start,
      words: sourceWords.slice(start,start+11).map((word) => word.label),
      sourceGp0: sourceGp0.slice(start,start+11),
      companion: required,
    });
  }
}
assert.deepEqual(hits, [{
  start:32,
  words:expectedSource,
  sourceGp0:expectedSourceGp0,
  companion,
}]);

const companionBlockSums = [
  sum29(companion.slice(0,4)),
  companion[4],
  sum29(companion.slice(5,9)),
  sum29(companion.slice(9,11)),
];
assert.deepEqual(companionBlockSums, [16,20,28,26]);
const keySumBlockSums = [
  sum29(requiredKeySums.slice(0,4)),
  requiredKeySums[4],
  sum29(requiredKeySums.slice(5,9)),
  sum29(requiredKeySums.slice(9,11)),
];
assert.deepEqual(keySumBlockSums, [0,10,6,23]);

console.log(JSON.stringify({
  status:"PASS",
  title,
  preparedGp0,
  expectedSourceGp0,
  requiredKeySums,
  companion,
  transformedCompanion:{
    block1:[1,27,28,17],
    singleton:20,
    block3:[18,18,15,13],
    terminal:[14,26],
  },
  family:{
    block1:block1.size,
    singleton:singleton.size,
    block3:block3.size,
    terminal:terminal.size,
    cartesian:block1.size*singleton.size*block3.size*terminal.size,
  },
  sourceWindowHits:hits,
  companionBlockSums,
  keySumBlockSums,
}, null, 2));
