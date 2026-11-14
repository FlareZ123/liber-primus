"use strict";
/**
 * Source-selected 179-byte LP1-p05 payload versus moth-linked original
 * LP2-p53 179-rune exact-length pad candidates.
 *
 * Run: node sims/lp1_p05_hidden179_lp2_p53_rawpad_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"
));
const page53 = corpus.pages.find(page => page.page === 53).indices;
assert.equal(page53.length, 179);
const original = fs.readFileSync(path.join(root,
  "resources/liber-primus/05.jpg"));
const shell = original.subarray(0, 336353);
const middle = original.subarray(336353, 336713);
const suffix = original.subarray(336713);
assert.equal(original.length, 673066);
assert.deepEqual(suffix, Buffer.from(shell).reverse());
assert.equal(middle.length, 360);
assert.equal(middle.subarray(0, 2).toString("ascii"), "\n\n");
const hex = middle.subarray(2).toString("ascii");
assert.match(hex, /^[0-9a-f]{358}$/i);
const raw = Buffer.from(hex, "hex");
assert.equal(raw.length, 179);
assert.equal(crypto.createHash("sha256").update(raw).digest("hex"),
  "82c135148b6cf85e9b550afdbc6204be075ff67717356a8ae18b76f9cc3af5fa");

/** @param {number} byte Raw byte. @returns {number} */
function swapNibbles(byte) {
  return ((byte & 15) << 4) | (byte >> 4);
}
/** @param {number} rune 0-based GP29 ordinal. @returns {number} */
function residue(rune) {
  return ((rune % 29) + 29) % 29;
}
/**
 * @param {number[]} input Cipher/plain rune indices.
 * @param {number[]} key Exact 179 GP29 key indices.
 * @param {number} direction Add or subtract key.
 * @returns {number[]} Reversible mapping.
 */
function apply(input, key, direction) {
  assert.equal(input.length, key.length);
  return input.map((value, i) => residue(value + direction * key[i]));
}
/** @param {number[]} values GP29 runes. @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  const sum = counts.reduce((a, c) => a + c * (c - 1), 0);
  return sum / (values.length * (values.length - 1));
}
const modes = [
  ["raw%29", Array.from(raw, byte => byte % 29)],
  ["swapped%29", Array.from(raw, byte => swapNibbles(byte) % 29)],
  ["rawScaled", Array.from(raw, byte => Math.floor(29 * byte / 256))],
  ["swappedScaled", Array.from(raw,
    byte => Math.floor(29 * swapNibbles(byte) / 256))]
];
const outputs = [];
for (const [name, key] of modes) {
  for (const sign of [-1, 1]) {
    const plain = apply(page53, key, sign);
    const roundtrip = apply(plain, key, -sign);
    assert.deepEqual(roundtrip, page53);
    outputs.push({
      key: name, sign, ioc: Number(ioc(plain).toFixed(9)),
      first_40_runes: plain.slice(0, 40)
        .map(rune => corpus.translit[rune]).join(" ")
    });
  }
  const plant = Array.from({length: 179}, (_, i) => i % 29);
  assert.deepEqual(apply(apply(plant, key, 1), key, -1), plant);
}
assert.equal(outputs.length, 8);
const expected = [
  0.032891846, 0.035904840, 0.034712196, 0.035716528,
  0.035339903, 0.033394012, 0.032264139, 0.033142929
];
for (let i = 0; i < 8; i++) {
  assert.ok(Math.abs(outputs[i].ioc - expected[i]) < 1e-8);
}
console.log(JSON.stringify({
  source: "original LP1 05.jpg hidden binary",
  p53_original_runic_length: page53.length,
  hidden_binary_bytes: raw.length,
  result: "no coherent 179-rune GP29 plaintext recovered",
  outputs
}, null, 2));
