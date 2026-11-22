"use strict";

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

/**
 * Distinct from 13-dot-delimited fragment/row tests: the original p40–53
 * visual chapter has precisely 3008 GP runes, or 32 blocks of 94, while
 * the embedded original p49–51 number table has 32 printed rows of 8 bytes.
 * This SFT tests direct and previous-cipher-relative row-local keys.
 * The pairing itself is a hypothesis; no original source selects a cipher.
 */
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const ciphertext = corpus.pages.filter(p => p.page >= 40 && p.page <= 53)
  .flatMap(p => p.indices);
assert.equal(ciphertext.length, 3008);
assert.equal(grid.bytes.length, 256);
assert.deepEqual(grid.pages.map(p => p.tokens.length), [80, 104, 72]);
assert.equal(grid.pages.reduce((n, p) => n + p.tokens.length, 0), 256);
assert.equal(corpus.pages.find(p => p.page === 50).indices.length, 0);

const mod = n => (n % 29 + 29) % 29;
/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

/**
 * A source-shaped but unauthenticated key clock: 32 equal 94-rune blocks,
 * each receiving its corresponding 8-byte table row, repeated by position.
 * @param {number} position
 * @param {number} rowShift
 * @returns {number}
 */
function key(position, rowShift = 0) {
  const row = (Math.floor(position / 94) + rowShift) % 32;
  return mod(grid.bytes[row * 8 + position % 8]);
}

/**
 * @typedef {{kind:"direct"|"relative-carry"|"relative-reset", sign:1|-1}} Model
 * @param {number[]} cipher
 * @param {Model} model
 * @param {number} rowShift
 * @returns {number[]}
 */
function decipher(cipher, model, rowShift = 0) {
  return cipher.map((value, i) => {
    const prior = model.kind === "direct" ? 0 :
      (i === 0 || (model.kind === "relative-reset" && i % 94 === 0))
        ? 0 : cipher[i - 1];
    return mod(value - prior + model.sign * key(i, rowShift));
  });
}

/**
 * @param {number[]} plain
 * @param {Model} model
 * @param {number} rowShift
 * @returns {number[]}
 */
function encipher(plain, model, rowShift = 0) {
  const cipher = [];
  for (let i = 0; i < plain.length; i++) {
    const prior = model.kind === "direct" ? 0 :
      (i === 0 || (model.kind === "relative-reset" && i % 94 === 0))
        ? 0 : cipher[i - 1];
    cipher.push(mod(plain[i] + prior - model.sign * key(i, rowShift)));
  }
  return cipher;
}

const models = /** @type {Model[]} */ ([
  {kind:"direct",sign:1}, {kind:"direct",sign:-1},
  {kind:"relative-carry",sign:1}, {kind:"relative-carry",sign:-1},
  {kind:"relative-reset",sign:1}, {kind:"relative-reset",sign:-1}
]);
const solved = corpus.pages.find(p => p.page === 57).indices;
assert.equal(solved.length, 95);
const plant = Array.from({length:ciphertext.length}, (_, i) => solved[i % solved.length]);
assert.ok(ioc(plant) > 0.05, "source-native GP planted text is recognizably nonflat");

console.log("Original p40–53 visual chapter: " + ciphertext.length +
  " runes; table: " + grid.bytes.length + " bytes / 32 original rows × 8.");
console.log("Ciphertext IoC: " + ioc(ciphertext).toFixed(9));
for (const model of models) {
  const decoded = decipher(ciphertext, model);
  const shifted = decipher(ciphertext, model, 1);
  assert.deepEqual(encipher(decoded, model), ciphertext,
    "original round-trip must be exact");
  assert.deepEqual(decipher(encipher(plant, model), model), plant,
    "native solved-GP plant must fully recover");
  assert.deepEqual(decipher(encipher(plant, model, 1), model, 1), plant,
    "wrong-row control must also be a correct codec");
  const firstHalf = ioc(decoded.slice(0, 1504));
  const secondHalf = ioc(decoded.slice(1504));
  const score = ioc(decoded);
  assert.ok(score < 0.045 && firstHalf < 0.045 && secondHalf < 0.045,
    "unexpected nonflat source output merits manual adjudication");
  const preview = decoded.slice(0, 32).map(i => corpus.translit[i]).join("");
  console.log(model.kind + " sign " + model.sign + ": IoC " +
    score.toFixed(9) + " / halves " + firstHalf.toFixed(9) +
    "," + secondHalf.toFixed(9) + " / shifted-row control " +
    ioc(shifted).toFixed(9) + " / " + preview);
}
console.log("PASS: all 6 original decodes flat; 6/6 3008-rune native-GP plants" +
  " exact; all original inverse checks exact.");
