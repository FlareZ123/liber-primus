"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const external = require("./lp2_external27x27_nextstep_gate.cjs");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const grid = corpus.pages.filter((page) => page.page <= 2)
  .flatMap((page) => page.indices);

/** @param {number} n */
function phi(n) {
  let result = n;
  let rest = n;
  for (let d = 2; d * d <= rest; d += 1) {
    if (rest % d !== 0) continue;
    while (rest % d === 0) rest /= d;
    result -= result / d;
  }
  if (rest > 1) result -= result / rest;
  return result;
}

/** @param {number} n */
function mu(n) {
  let rest = n;
  let sign = 1;
  for (let d = 2; d * d <= rest; d += 1) {
    if (rest % d !== 0) continue;
    rest /= d;
    sign = -sign;
    if (rest % d === 0) return 0;
    while (rest % d === 0) rest /= d;
  }
  return rest > 1 ? -sign : sign;
}

/** @param {number} value */
function mod29(value) {
  return (value % 29 + 29) % 29;
}

/** @param {number} a @param {number} b */
function gcd(a, b) {
  let x = a;
  let y = b;
  while (y) [x, y] = [y, x % y];
  return x;
}

/** @param {[number,number]} coordinate */
function n0(coordinate) {
  return 27 * (coordinate[0] - 1) + coordinate[1];
}

/** @param {[number,number]} coordinate */
function n1(coordinate) {
  return 27 * (coordinate[1] - 1) + 28 - coordinate[0];
}

/** @param {[number,number]} coordinate */
function n2(coordinate) {
  return 730 - n0(coordinate);
}

/** @param {[number,number]} coordinate */
function n3(coordinate) {
  return 730 - n1(coordinate);
}

/** @param {object} span */
function passesGcd(span) {
  const center = [12, 10];
  return [
    gcd(n0(center), n0(span.B)),
    gcd(n0(center), n0(span.B)),
    gcd(n1(center), n3(span.E)),
    gcd(n0(center), n2(span.E)),
  ].every((value) => mu(value) !== 0);
}

const state = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3, q: 4 };
const raw = [state.p - state.e, state.p - 1, state.A];
assert.deepEqual(raw, [20, 22, 8]);
const transformed = [raw[0], phi(raw[1]), raw[2]];
assert.deepEqual(transformed, [20, 10, 8]);

const rule = external.forecast();
const paths = external.ciphertextCandidates(rule);
assert.equal(paths.length, 132);
const dictionary = external.englishDictionary();

const solved = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "external", "relikd-solved-gp29-native-v1.json"),
  "utf8"));

/** @param {string} text */
function normalizeLetters(text) {
  return text.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C")
    .replace(/V/g, "U")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
}

const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word */
function wordToGp(word) {
  const normalized = normalizeLetters(word);
  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      values.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      values.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset));
    if (!token) return null;
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

const vocab = [];
const seenVocab = new Set();
for (const [key, entry] of dictionary.entries()) {
  const values = key.split(",").map(Number);
  if (!seenVocab.has(key)) {
    seenVocab.add(key);
    vocab.push({ word: entry.word, values, source: "SHAKESPEARE" });
  }
}
for (const section of solved.sections) {
  for (const word of section.plaintext.match(/[A-Za-z]+/g) || []) {
    const values = wordToGp(word);
    if (!values || values.length < 2 || values.length > 8) continue;
    const key = values.join(",");
    if (seenVocab.has(key)) continue;
    seenVocab.add(key);
    vocab.push({ word: word.toUpperCase(), values, source: "LP1" });
  }
}

/** @param {number[]} target */
function segmentTarget(target) {
  const memo = new Map();
  function walk(offset) {
    if (offset === target.length) return [[]];
    if (memo.has(offset)) return memo.get(offset);
    const out = [];
    for (const item of vocab) {
      if (item.values.length > target.length - offset) continue;
      let match = true;
      for (let i = 0; i < item.values.length; i += 1) {
        if (item.values[i] !== target[offset + i]) {
          match = false;
          break;
        }
      }
      if (!match) continue;
      for (const rest of walk(offset + item.values.length)) {
        if (rest.length < 3) out.push([item, ...rest]);
      }
    }
    memo.set(offset, out);
    return out;
  }
  return walk(0).filter((items) => items.length <= 3);
}

const hits = [];
const segmentedHits = [];
for (const span of paths) {
  if (!passesGcd(span)) continue;
  const plain = span.values.map((cipher, index) =>
    mod29(cipher - transformed[index % transformed.length]));
  const match = dictionary.get(plain.join(","));
  if (match) {
    hits.push({
      word: match.word,
      B: span.B,
      E: span.E,
      length: plain.length,
      plain,
    });
  }
  for (const segmentation of segmentTarget(plain)) {
    segmentedHits.push({
      text: segmentation.map((item) => item.word).join(" "),
      sources: segmentation.map((item) => item.source),
      B: span.B,
      E: span.E,
      length: plain.length,
      plain,
    });
  }
}
assert.deepEqual(hits, [{
  word: "GET",
  B: [15, 10],
  E: [17, 12],
  length: 3,
  plain: [6, 18, 16],
}]);
console.log(JSON.stringify({
  state,
  predictedSourceCenter: [12, 10],
  predictedRadius: state.a,
  raw,
  rawTranslit: raw.map((value) => corpus.translit[value]),
  transformed,
  transformedTranslit: transformed.map((value) => corpus.translit[value]),
  paths: paths.length,
  hits,
  segmentedHitCount: segmentedHits.length,
  segmentedHits: segmentedHits.slice(0, 50),
}, null, 2));
