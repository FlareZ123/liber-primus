"use strict";

/**
 * Source-native Latin and Old English capacity gate for an independent
 * secret five-phase GP29 substitution alphabet per printed LP2 word.
 *
 * Runnable as: node sims/lp2_latin_wordlocal_fivephase_capacity_sft.cjs
 * Dependencies: Node.js 22 built-ins and the repository's word parser.
 * This test only reads committed files and never writes outputs.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseSharedCorpus, physicalLP2Page } = require("./lp2_word_pages.cjs");

const root = path.join(__dirname, "..", "resources", "control");
const native = parseSharedCorpus();
assert.equal(native.words.length, 2896);
assert.equal(native.runeCount, 12956);
assert.equal(native.crossPageWords, 32);

const latinRaw = fs.readFileSync(
  path.join(root, "latin-vulgate-gp-wholewords.txt"), "utf8");
const latin = latinRaw.split(/\r?\n/u)
  .filter((line) => /^[0-9A-S]+$/u.test(line));
assert.equal(latin.length, 39835);

const old = JSON.parse(fs.readFileSync(
  path.join(root, "beowulf_oe_gp_profile_corrected.json"), "utf8"));
assert.equal(old.schema, 2);
assert.equal(old.positiveControlAlphabet, "ABCDEFGHIJKLMNOPQRSTUVWXYZabc");
assert.equal(old.acceptedSourceWords, 10885);
assert.equal(old.sourceGpBase29.length, 48012);
const beowulf = [];
let cursor = 0;
for (const n of old.allSourceGpWordLengths) {
  beowulf.push(old.sourceGpBase29.slice(cursor, cursor + n));
  cursor += n;
}
assert.equal(cursor, old.sourceGpBase29.length);
assert.equal(beowulf.length, 10885);

/**
 * All equality and inequality relationships between positions having the
 * same phase modulo five, for words of length at most 14. All lag-five
 * bits precede all lag-ten bits, exactly as in the original English study.
 * @param {string} word One GP29-encoded word.
 * @returns {string}
 */
function signature(word) {
  let bits = "";
  for (const lag of [5, 10]) {
    for (let i = 0; i + lag < word.length; i++) {
      bits += word[i] === word[i + lag] ? "1" : "0";
    }
  }
  return bits;
}

/** @param {string} word @returns {string} */
function shape(word) {
  return word.length + ":" + signature(word);
}

/** @param {string[]} source @returns {Map<string,string[]>} */
function indexSource(source) {
  const result = new Map();
  for (const word of source) {
    const key = shape(word);
    if (!result.has(key)) result.set(key, []);
    result.get(key).push(word);
  }
  return result;
}

const inputs = native.words.map((item, i) => ({
  index: i,
  runes: item.runes,
  page: physicalLP2Page(item.startPage),
  length: item.length,
  shape: shape(item.runes)
}));

/** @param {Map<string,string[]>} index @returns {{covered:number,misses:object[]}} */
function checkOriginal(index) {
  const misses = inputs.filter((w) => !(index.get(w.shape)?.length))
    .map((w) => ({
      index: w.index, page: w.page, length: w.length, shape: w.shape
    }));
  return {covered: inputs.length - misses.length, misses};
}

const latinIndex = indexSource(latin);
const oldIndex = indexSource(beowulf);
const latinResult = checkOriginal(latinIndex);
const oldResult = checkOriginal(oldIndex);
assert.equal(latinResult.covered, 2894);
assert.deepEqual(latinResult.misses, [
  {index: 1220, page: 22, length: 12, shape: "12:001010000"},
  {index: 1967, page: 36, length: 10, shape: "10:10011"}
]);
assert.equal(oldResult.covered, 2873);
assert.equal(oldResult.misses.length, 23);
assert(oldResult.misses.some((w) => w.index === 2722 && w.page === 51));
assert(oldResult.misses.some((w) => w.index === 1967 && w.page === 36));

const alphabet = "0123456789ABCDEFGHIJKLMNOPQRS";
const roman = ["F","U","TH","O","R","C","G","W","H","N","I","J",
  "EO","P","X","S","T","B","E","M","L","NG","OE","D",
  "A","AE","Y","IA","EA"];
assert.equal(alphabet.length, 29);
assert.equal(roman.length, 29);
/** @param {string} latinGpWord @returns {string} */
const readable = (latinGpWord) => [...latinGpWord]
  .map((c) => roman[alphabet.indexOf(c)]).join("");

const targets = [
  {wordIndex:754,page:13,length:14,latinTokens:4,latinTypes:2},
  {wordIndex:1353,page:25,length:14,latinTokens:9,latinTypes:4},
  {wordIndex:1967,page:36,length:10,latinTokens:0,latinTypes:0},
  {wordIndex:2722,page:51,length:8,latinTokens:2,latinTypes:1}
];
for (const target of targets) {
  const word = inputs[target.wordIndex];
  assert.equal(word.page, target.page);
  assert.equal(word.length, target.length);
  const matches = latinIndex.get(word.shape) ?? [];
  assert.equal(matches.length, target.latinTokens);
  assert.equal(new Set(matches).size, target.latinTypes);
  const types = [...new Set(matches)].map(readable);
  console.log("LATIN", JSON.stringify({index:target.wordIndex,
    page:target.page, shape:word.shape,
    tokenCount:matches.length, types}));
}
assert.deepEqual(
  [...new Set(latinIndex.get(inputs[2722].shape))].map(readable),
  ["TURBETUR"]
);

/* A literal Vulgate passage must preserve neighboring printed word lengths.
 * Checking *every* Vulgate occurrence of the four source-registered sharp
 * word signatures gives an exact, key-independent fragment rejection.
 */
const sourceNeighborTable = [];
for (const target of targets) {
  const w = target.wordIndex;
  const hits = latin.flatMap((sourceWord, i) =>
    shape(sourceWord) === inputs[w].shape ? [i] : []);
  const leftMatches = hits.filter((i) =>
    i > 0 && latin[i-1].length === inputs[w-1].length).length;
  const rightMatches = hits.filter((i) =>
    i+1 < latin.length && latin[i+1].length === inputs[w+1].length).length;
  const tripleMatches = hits.filter((i) =>
    i > 0 && i+1 < latin.length &&
    latin[i-1].length === inputs[w-1].length &&
    latin[i+1].length === inputs[w+1].length).length;
  sourceNeighborTable.push({wordIndex:w,hits:hits.length,
    leftMatches,rightMatches,tripleMatches});
}
assert.deepEqual(sourceNeighborTable, [
  {wordIndex:754,hits:4,leftMatches:0,rightMatches:0,tripleMatches:0},
  {wordIndex:1353,hits:9,leftMatches:0,rightMatches:0,tripleMatches:0},
  {wordIndex:1967,hits:0,leftMatches:0,rightMatches:0,tripleMatches:0},
  {wordIndex:2722,hits:2,leftMatches:2,rightMatches:0,tripleMatches:0}
]);
console.log("VULGATE-THREE-WORD-FRAGMENTS",JSON.stringify(sourceNeighborTable));

/*
 * Genuine contiguous-source quote gate: the Vulgate twice prints TURBETUR
 * immediately followed by COR. The original p51 next word has one rune,
 * not three. No length-preserving wordwise secret key repairs this mismatch.
 */
const turbetur = latin.reduce((found,word,i) => {
  if (word === "G14HIG14") found.push(i);
  return found;
}, []);
assert.deepEqual(turbetur, [22014,22468]);
assert.equal(inputs[2721].length, 3);
assert.equal(inputs[2722].length, 8);
assert.equal(inputs[2723].length, 1);
for (const sourceIndex of turbetur) {
  assert.equal(latin[sourceIndex-1], "939"); // NON
  assert.equal(latin[sourceIndex+1], "534"); // COR
}
console.log("VULGATE-CONTIGUOUS-CRIB", JSON.stringify({
  sourceWordIndices:turbetur,
  originalNextWordLength:inputs[2723].length,
  sourceNextWords:turbetur.map((i) => readable(latin[i+1]))
}));

/* Independent secret permutations: synthetic genuine-Latin positive. */
let seed = 0x5f3759df;
const random = () => {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
};
const byLength = new Map();
for (const word of latin) {
  if (!byLength.has(word.length)) byLength.set(word.length, []);
  byLength.get(word.length).push(word);
}
let plantedRunes = 0;
for (let w = 0; w < inputs.length; w++) {
  const length = inputs[w].length;
  const pool = byLength.get(length);
  assert(pool?.length, "Latin source has no positive for a length");
  const source = pool[random() % pool.length];
  const permutations = Array.from({length:5}, () => {
    const row = Array.from({length:29}, (_, i) => i);
    for (let j = row.length - 1; j > 0; j--) {
      const k = random() % (j+1);
      [row[k],row[j]] = [row[j],row[k]];
    }
    return row;
  });
  const encoded = [...source].map((ch, j) =>
    alphabet[permutations[j%5][alphabet.indexOf(ch)]]).join("");
  const decoded = [...encoded].map((ch, j) =>
    alphabet[permutations[j%5].indexOf(alphabet.indexOf(ch))]).join("");
  assert.equal(decoded, source);
  assert.equal(signature(encoded), signature(source));
  plantedRunes += source.length;
}
assert.equal(plantedRunes, 12956);

console.log("ORIGINAL", JSON.stringify({
  runes:native.runeCount, words:inputs.length, crossPage:native.crossPageWords,
  latin:latinResult, oldEnglish:oldResult,
  latinPositiveRoundtripRunes:plantedRunes
}));
console.log("PASS: all 2896 source words; exact Latin/Old English lexical capacity and independent source-native reversible plant");
