"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "base60-grid.json"), "utf8"));
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));

const alphabet = grid.alphabet;
const tokens = grid.rows.flat();
assert.equal(tokens.length, 256);
const bytes = tokens.map(token => {
  assert.equal(token.length, 2);
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return 60 * high + low;
});
assert.deepEqual(bytes, grid.byte_rows.flat());
assert.ok(bytes.every(value => value >= 0 && value <= 255));

function base29(value) {
  if (value === 0n) return [0];
  const digits = [];
  while (value > 0n) {
    digits.push(Number(value % 29n));
    value /= 29n;
  }
  return digits.reverse();
}

const integer = bytes.reduce((value, byte) =>
  (value << 8n) + BigInt(byte), 0n);
const digits = base29(integer);
const example = base29(3301n);
assert.deepEqual(example, [3, 26, 24]);
assert.equal(bytes.length, 256);
assert.equal(integer.toString(2).length, 2048);
assert.equal(digits.length, 422);

const counts = Array(29).fill(0);
for (const digit of digits) counts[digit]++;
const ioc = counts.reduce((sum, count) => sum + count * (count - 1), 0) /
  (digits.length * (digits.length - 1));
const runeText = digits.map(digit => corpus.translit[digit]).join("");

console.log(JSON.stringify({
  sourceRows: grid.rows.length,
  sourceColumns: grid.rows[0].length,
  byteCount: bytes.length,
  first16Bytes: bytes.slice(0, 16),
  last16Bytes: bytes.slice(-16),
  integerBitLength: integer.toString(2).length,
  base29Length: digits.length,
  signed2013Example: example,
  runeIoC: ioc,
  frequencies: counts,
  first120Runes: digits.slice(0, 120).map(digit => corpus.translit[digit]).join(" "),
  fullTransliteration: runeText
}, null, 2));
