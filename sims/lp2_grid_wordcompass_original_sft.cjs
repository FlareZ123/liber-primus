#!/usr/bin/env node
"use strict";
/**
 * Original-input SFT: word-number-directed compass walks over the printed
 * 32x8 p50 numerical table. Hypothesis is exploratory, not an authored key.
 * Windows Node.js 22, CommonJS; read-only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..", "resources", "liber-primus");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("lp2-corpus.json"));
const grid = JSON.parse(read("lp2-grid-256.json"));
const transcription = read("lp2-transcription.txt");
const R = 29;
const GP = new Map(corpus.runes.map((r, i) => [r, i]));
const words = [];
let current = [];
let visited = 0;
for (const symbol of Array.from(transcription)) {
  if (GP.has(symbol)) {
    if (visited < 12956) current.push(GP.get(symbol));
    visited++;
    if (visited === 12956) break;
  } else if ("-.&".includes(symbol) && current.length) {
    words.push(current);
    current = [];
  }
}
if (current.length) words.push(current);
const source = words.flat();
const expected = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices || []);
assert.deepEqual(source, expected, "exact original unknown LP2 ciphertext");
assert.equal(source.length, 12956);
assert.equal(words.length, 2896);
assert.equal(grid.bytes.length, 256);
assert.match(grid.shape, /^32 rows by 8 columns/);
assert.deepEqual(grid.bytes.flatMap((v, i) => v === 0 ? [i] : []), [192, 229]);
const lengths = words.map(w => w.length);
const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
const mod = (v, n) => (v % n + n) % n;
const ioc29 = values => {
  const hist = Array(R).fill(0);
  for (const v of values) hist[v]++;
  return R * hist.reduce((s, n) => s + n * (n - 1), 0) /
    (values.length * (values.length - 1));
};
/**
 * @param {number[]} input - Concatenated source ciphertext, or plaintext.
 * @param {{start:number,reverse:boolean,sign:number}} choice
 * @param {boolean} decoding - True decodes; false encrypts.
 * @returns {number[]} Rune index stream.
 */
function transform(input, choice, decoding) {
  assert.equal(input.length, source.length);
  let y = Math.floor(choice.start / 8), x = choice.start % 8;
  let previousCipherWord = null, offset = 0;
  const out = [];
  for (const length of lengths) {
    const heading = previousCipherWord === null ? 1 :
      previousCipherWord.reduce((s, v) => s + corpus.prime[v], 0) % 4;
    const direction = directions[choice.reverse ? (4 - heading) % 4 : heading];
    const cipherWord = [];
    for (let j = 0; j < length; j++) {
      const key = grid.bytes[y * 8 + x] % R;
      const value = mod(input[offset + j] + (decoding ? 1 : -1) *
        choice.sign * key, R);
      out.push(value);
      cipherWord.push(decoding ? input[offset + j] : value);
      y = mod(y + direction[0], 32);
      x = mod(x + direction[1], 8);
    }
    previousCipherWord = cipherWord;
    offset += length;
  }
  assert.equal(offset, input.length);
  return out;
}
const scores = [];
for (const start of [0, 192, 229]) {
  for (const reverse of [false, true]) {
    for (const sign of [-1, 1]) {
      const choice = { start, reverse, sign };
      const plain = transform(source, choice, true);
      assert.deepEqual(transform(plain, choice, false), source,
        "exact original ciphertext re-encryption");
      scores.push({ ...choice, ioc29: ioc29(plain),
        opening: plain.slice(0, 30).map(i => corpus.translit[i]).join("") });
    }
  }
}
const planted = corpus.pages.find(p => p.page === 57).indices;
assert.equal(planted.length, 95);
const wholeBookPlant = Array.from({ length: source.length },
  (_, i) => planted[i % planted.length]);
const control = { start: 192, reverse: false, sign: -1 };
const encoded = transform(wholeBookPlant, control, false);
assert.deepEqual(transform(encoded, control, true), wholeBookPlant,
  "source-native solved p57 full-length encryption/decryption control");
assert.ok(ioc29(wholeBookPlant) > 1.6);
assert.ok(scores.every(s => s.ioc29 < 1.05));
console.log(JSON.stringify({
  classification: "exploratory original-input negative; no authored compass operator",
  runes: source.length, words: words.length, originalIoc29: ioc29(source),
  tableShape: grid.shape, zeroCells: [192, 229],
  fullLengthPlantedPositive: wholeBookPlant.length,
  scores
}, null, 2));