"use strict";
/**
 * LP2 page-carry-selected original 32-byte table key:
 * finite AES256-CTR GP29 stream test on complete unknown ciphertext.
 * Node22 CJS SFT: node sims/lp2_pagecarry_grid32_aes256_ctr_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createCipheriv, createDecipheriv} = require("node:crypto");
const root = path.resolve(__dirname, "..");
/** @param {string} p @returns {string} */
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const runeIndex = new Map(corpus.runes.map((v, i) => [v, i]));
const tableBytes = table.pages.flatMap((p) => p.bytes);
const transcript = read("resources/liber-primus/lp2-transcription.txt");
const words = [];
let page = 0, start = 0, word = "", parts = [];
function flush() {
  if (word) words.push({start, word, parts: parts.slice()});
  word = ""; parts = [];
}
for (const ch of transcript) {
  if (runeIndex.has(ch)) {
    if (!word) { start = page; parts = [0]; }
    word += ch;
    parts[parts.length - 1]++;
  } else if (ch === "%") {
    page++;
    if (word) parts.push(0);
  } else if (ch !== "/" && !/\s/u.test(ch)) {
    flush();
  }
}
flush();
const carries = words.filter((w) => w.start < 55 &&
  w.parts.length > 1 && w.parts.at(-1) > 0);
assert.equal(carries.length, 32);
assert.ok(carries.every((w) =>
  w.parts.length === 2 && w.parts[1] >= 1 && w.parts[1] <= 7));
assert.equal(tableBytes.length, 256);
const key = Buffer.from(carries.map((w, row) =>
  tableBytes[row * 8 + (w.parts[1] - 1)]));
assert.equal(key.toString("hex"),
  "61f9cac6505456feff728edc483f49ed780ad221c0f0839c007f063b446a1671");
const IV = Buffer.alloc(16);
/** @param {number} count @returns {Buffer} */
function keystream(count) {
  const cipher = createCipheriv("aes-256-ctr", key, IV);
  return Buffer.concat([cipher.update(Buffer.alloc(count)), cipher.final()]);
}
/**
 * @param {number[]} values
 * @returns {number}
 */
function ioc(values) {
  const bins = Array(29).fill(0);
  for (const x of values) bins[x]++;
  return bins.reduce((s, n) => s + n * (n - 1), 0)
    / (values.length * (values.length - 1));
}
/**
 * @param {number[]} symbols
 * @param {Buffer} stream
 * @param {"mod" | "scale"} mapping
 * @param {number} sign
 * @returns {number[]}
 */
function shift(symbols, stream, mapping, sign) {
  return symbols.map((x, i) => {
    const k = mapping === "mod" ? stream[i] % 29 :
      Math.floor(29 * stream[i] / 256);
    return (x + sign * k + 29) % 29;
  });
}
/** @param {number[]} s @returns {string} */
function roman(s) {
  return s.map((v) => corpus.translit[v]).join("");
}
const unknownPages = corpus.pages.filter((p) =>
  p.page >= 0 && p.page <= 55 && p.indices.length > 0);
const unknown = unknownPages.flatMap((p) => p.indices);
assert.equal(unknown.length, 12956);
const fullStream = keystream(unknown.length);
const focus = corpus.pages.filter((p) => p.page === 54 || p.page === 55)
  .flatMap((p) => p.indices);
assert.equal(focus.length, 308);
const focusStream = keystream(focus.length);
const results = {unknown: {}, chapter54_55: {}};
for (const [name, input, stream] of [
  ["unknown", unknown, fullStream], ["chapter54_55", focus, focusStream]
]) {
  const status = results[name];
  status.cipherIoC = ioc(input);
  for (const map of ["mod", "scale"]) {
    for (const sign of [-1, 1]) {
      const output = shift(input, stream, map, sign);
      assert.deepEqual(shift(output, stream, map, -sign), input);
      status[map + (sign === 1 ? "Plus" : "Minus")] = {
        ioc: ioc(output), first80: roman(output.slice(0, 80))
      };
    }
  }
}
// Genuine clear-source positive: complete p57 plaintext, encrypted with exactly
// the same key and byte-to-GP29 rules, is recovered without access to its text.
const clear = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(clear.length, 95);
const clearStream = keystream(clear.length);
for (const map of ["mod", "scale"]) {
  for (const sign of [-1, 1]) {
    const encrypted = shift(clear, clearStream, map, sign);
    assert.deepEqual(shift(encrypted, clearStream, map, -sign), clear);
  }
}
const ecb = createDecipheriv("aes-256-ecb", key, null);
ecb.setAutoPadding(false);
const decryptedGrid = Buffer.concat([
  ecb.update(Buffer.from(tableBytes)), ecb.final()]);
const tableSummary = {
  sha256Key: key.toString("hex"),
  ecbFirst16: decryptedGrid.subarray(0, 16).toString("hex"),
  ecbPrintable: [...decryptedGrid].filter((b) =>
    b >= 0x20 && b <= 0x7e || [9, 10, 13].includes(b)).length,
  tablePrintable: tableBytes.filter((b) => b >= 0x20 && b <= 0x7e).length
};
console.log(JSON.stringify({
  keySelectedFromOriginalPageCarries: tableSummary,
  results,
  authenticClearP57Control: "95/95 GP runes recovered in four independent cipher plants",
  scope: "Only AES-256-CTR zero-IV continuous stream with +/- and byte modulo/scale; no inferred plaintext"
}, null, 2));
