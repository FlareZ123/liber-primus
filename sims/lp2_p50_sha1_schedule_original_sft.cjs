"use strict";
/**
 * Original LP2 32x8 table versus the unmodified SHA-1 32-bit message schedule.
 * Source-only negative, not a proposed plaintext. Node 22, CommonJS, read-only.
 *
 * The first sixteen 32-bit words are unconstrained; every later word is
 * uniquely predicted by the published SHA-1 expansion recurrence.
 * Source input: original pp49-51 table, canonical literal tokens.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const grid = JSON.parse(fs.readFileSync(path.join(
  __dirname, "..", "resources/liber-primus/base60-grid.json"), "utf8"));
const tokens = grid.rows.flat();
const b60 = grid.byte_rows.flat();
const alphabet60 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
const alphabet59 = alphabet60.replace("f", "");
assert.equal(grid.alphabet, alphabet60);
assert.equal(grid.rows.length, 32);
assert(grid.rows.every(row => row.length === 8));
assert.equal(tokens.length, 256);
assert.equal(b60.length, 256);
assert.deepEqual(tokens.map(t =>
  60 * alphabet60.indexOf(t[0]) + alphabet60.indexOf(t[1])), b60);
assert.equal(crypto.createHash("sha256").update(Buffer.from(b60)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

const b59 = tokens.map(t =>
  59 * alphabet59.indexOf(t[0]) + alphabet59.indexOf(t[1]));
assert(b59.every(x => x >= 0 && x <= 255));
const roll1 = value => ((value << 1) | (value >>> 31)) >>> 0;

/** @param {number[]} words @returns {number[]} complete SHA-1 word sequence */
function expand(words) {
  assert.equal(words.length, 64);
  const output = words.slice(0, 16);
  for (let t = 16; t < 64; t++) {
    output.push(roll1(output[t - 3] ^ output[t - 8] ^
      output[t - 14] ^ output[t - 16]));
  }
  return output;
}

/** @param {number[]} bytes @param {"be"|"le"} endian */
function toWords(bytes, endian) {
  assert.equal(bytes.length, 256);
  return Array.from({length: 64}, (_, k) => {
    const b = bytes.slice(4 * k, 4 * k + 4);
    if (endian === "le") b.reverse();
    return ((b[0] << 24) | (b[1] << 16) |
      (b[2] << 8) | b[3]) >>> 0;
  });
}

/** @param {number} value @returns {number} bit population count */
function bitcount(value) {
  let v = value >>> 0, n = 0;
  while (v !== 0) {v = (v & (v - 1)) >>> 0; n++;}
  return n;
}

const cases = [];
for (const [radix, source] of [[60, b60], [59, b59]]) {
  for (const layout of ["row", "column"]) {
    for (const reversed of [false, true]) {
      const ordered = layout === "row" ? source.slice() :
        Array.from({length: 256},
          (_, i) => source[(i % 32) * 8 + Math.floor(i / 32)]);
      if (reversed) ordered.reverse();
      for (const endian of ["be", "le"]) {
        const actual = toWords(ordered, endian);
        const predicted = expand(actual);
        let matchingWords = 0, differingBits = 0;
        for (let i = 16; i < 64; i++) {
          matchingWords += Number(actual[i] === predicted[i]);
          differingBits += bitcount(actual[i] ^ predicted[i]);
        }
        assert.equal(expand(predicted).slice(16).every((v, i) =>
          predicted[i + 16] === v), true, "SHA-1 planted schedule");

        cases.push({radix, layout, reversed, endian, matchingWords,
          differingBits, predictedFirst: predicted[16].toString(16).padStart(8,"0"),
          actualFirst: actual[16].toString(16).padStart(8,"0")});
      }
    }
  }
}
assert.equal(cases.length, 16);
const exact = cases.map(c => c.matchingWords);
const distances = cases.map(c => c.differingBits);
assert.deepEqual(exact, Array(16).fill(0));
assert.deepEqual(distances, [
  785,767,785,743,769,761,790,818,
  762,800,763,773,751,775,774,776
]);
assert.equal(cases[0].predictedFirst, "658ec427");
assert.equal(cases[0].actualFirst, "7aff19c0");

console.log(JSON.stringify({
  scope: "literal SHA-1 expanded 64-word prefix of printed pp49-51 256-byte table",
  originalBytes: 256,
  modelCount: cases.length,
  predictedWordsPerModel: 48,
  actualMatchesEveryModel: 0,
  directReading: cases[0],
  differingBitsRange: [Math.min(...distances), Math.max(...distances)],
  models: cases,
  conclusion: "No direct SHA-1 message schedule under declared source-layout/readout models; no LP2 unknown plaintext",
  sourceNote: "2016 signed tree message used RSA/SHA1, which does not authenticate a 2014 LP2 table consumer"
}, null, 2));
