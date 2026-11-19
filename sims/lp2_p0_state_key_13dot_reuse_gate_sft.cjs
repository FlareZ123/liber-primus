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
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);
const key = [26,24,8,19,27,24,18,3,0,8,0,16,19];

/** @param {string} word @returns {number[]|null} */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C")
    .replace(/V/g, "U")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      out.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      out.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset));
    if (!token) return null;
    out.push(token.value);
    offset += token.symbol.length;
  }
  return out;
}

/** @param {string} source @returns {number[][]} */
function runeWords(source) {
  const words = [];
  let current = [];
  for (const character of [...source]) {
    const value = runeIndex.get(character);
    if (value !== undefined) {
      current.push(value);
    } else if (current.length) {
      words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  return words;
}

const vocabulary = [];
const seen = new Set();
/** @param {string} label @param {number[]} values @param {string} source */
function addWord(label, values, source) {
  const keyValue = values.join(",");
  if (seen.has(keyValue)) return;
  seen.add(keyValue);
  vocabulary.push({ label, values, source });
}
for (const section of solved.sections) {
  for (const values of runeWords(section.source_text)) {
    addWord(values.map((value) => corpus.translit[value]).join(""), values, "LP1");
  }
}
const clearStart = signed.indexOf("Hash: SHA1");
const signatureStart = signed.indexOf("-----BEGIN PGP SIGNATURE-----");
const signedWords = (signed
  .slice(clearStart + "Hash: SHA1".length, signatureStart)
  .replace(/\b7A35090F\b/g, "")
  .match(/[A-Za-z]+/g) || [])
  .map((word) => word.toUpperCase());
for (const word of signedWords) {
  const values = gp(word);
  if (values) addWord(word, values, "2016");
}

/** @param {number[]} values @returns {Array<Array<{label:string,values:number[],source:string}>>} */
function segment(values) {
  const memo = new Map();

  /** @param {number} offset */
  function walk(offset) {
    if (offset === values.length) return [[]];
    if (memo.has(offset)) return memo.get(offset);
    const out = [];
    for (const word of vocabulary) {
      if (word.values.length > values.length - offset) continue;
      if (!word.values.every((value, index) => value === values[offset + index])) continue;
      for (const rest of walk(offset + word.values.length)) {
        if (rest.length < 4) out.push([word, ...rest]);
      }
    }
    memo.set(offset, out);
    return out;
  }

  return walk(0);
}

const rows = [];
for (const annotation of ink.pages) {
  const page = corpus.pages.find((candidate) => candidate.page === annotation.page);
  if (!page) continue;
  for (const [offset, dots, color] of annotation.large_punctuation || []) {
    if (dots !== 13 || offset < 13 || offset > page.indices.length) continue;
    const cipher = page.indices.slice(offset - 13, offset);
    const plain = cipher.map((value, index) => mod29(value - key[index]));
    const segmentations = segment(plain).map((words) =>
      words.map((word) => word.label).join(" "));
    rows.push({
      page: annotation.page,
      offset,
      color,
      cipher,
      plain,
      segmentations,
    });
  }
}

assert.equal(rows.length, 25);
const lexical = rows.filter((row) => row.segmentations.length > 0);
assert.deepEqual(lexical.map((row) => ({
  page: row.page,
  offset: row.offset,
  color: row.color,
  segmentations: row.segmentations,
})), [{
  page: 0,
  offset: 13,
  color: "red",
  segmentations: ["EPIPHANY SEEKS"],
}]);

const p0 = lexical[0];
assert.deepEqual(p0.cipher,
  [15,8,18,3,6,19,27,0,15,26,18,21,5]);
assert.deepEqual(p0.plain,
  [18,13,10,13,8,24,9,26,15,18,18,5,15]);

console.log(JSON.stringify({
  status: "PASS",
  key,
  testedOriginal13DotMarkersWithPreceding13Runes: rows.length,
  lexicalHits: lexical.map((row) => ({
    page: row.page,
    offset: row.offset,
    color: row.color,
    segmentations: row.segmentations,
  })),
  decision:
    "The fixed p0 13-rune key does not transfer as a universal immediately-preceding-13-runes chapter-mark key. Within the pinned solved-LP1 plus authenticated-2016 vocabulary, p0 EPIPHANY SEEKS is the sole complete segmentation among 25 original 13-dot receivers.",
}, null, 2));
