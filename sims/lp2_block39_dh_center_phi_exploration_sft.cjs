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

const hits = [];
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
}
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
}, null, 2));
