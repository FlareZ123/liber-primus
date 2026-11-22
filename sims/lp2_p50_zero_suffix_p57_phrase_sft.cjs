"use strict";
/**
 * Original-source p50 double-zero suffix decision.
 * Node.js 22, CommonJS. Read-only. Run from repository root or any directory.
 * GP indices follow the exact 29-rune canonical resource, with no resegmentation.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-grid-256.json"), "utf8"));
const alphabet59 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeghijklmnopqrstuvwx";
const tokens = grid.pages.flatMap((page) => page.tokens);
const bytes60 = grid.pages.flatMap((page) => page.bytes);
const bytes59 = tokens.map((token) => 59 * alphabet59.indexOf(token[0]) + alphabet59.indexOf(token[1]));
const gp = corpus.translit;
const mod29 = (x) => ((x % 29) + 29) % 29;
const sha512 = (bytes) => createHash("sha512").update(Buffer.from(bytes)).digest("hex");
const phraseSum = (indices) => indices.reduce((sum, index) => sum + index, 0);
const render = (indices) => indices.map((index) => gp[index]).join(" ");
const ioc = (indices) => {
  const counts = Array(29).fill(0);
  for (const index of indices) counts[index] += 1;
  return counts.reduce((sum, value) => sum + value * (value - 1), 0) /
    (indices.length * (indices.length - 1));
};
const p51 = corpus.pages.find((page) => page.page === 51).indices;
const zeroCells = tokens.flatMap((token, i) => token === "00" ? [i] : []);
assert.equal(tokens.length, 256);
assert.equal(bytes60.length, 256);
assert.deepEqual(zeroCells, [192, 229]);
assert.equal(bytes60[192], 0);
assert.equal(bytes60[229], 0);
assert.deepEqual(p51.slice(0, 3), [7, 7, 13]);
assert.equal(phraseSum(p51.slice(0, 3)), 27);

const p57 = corpus.pages.find((page) => page.page === 57).indices;
const hasSequence = (haystack, needle) => haystack.some((_, start) =>
  needle.every((item, offset) => haystack[start + offset] === item));
const shed = [15, 8, 18, 23];
const ourOwn = [3, 1, 4, 3, 7, 9];
assert(hasSequence(p57, shed));
assert(hasSequence(p57, ourOwn));
assert.equal(phraseSum(shed), 64);
assert.equal(phraseSum(ourOwn), 27);
assert.equal(256 - zeroCells[0], 64);
assert.equal(256 - zeroCells[1], 27);

const sourceDigest = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
assert.equal(sourceDigest.length, 128);
const hashTests = [];
const transformations = [];
for (const [radix, values] of [["base60", bytes60], ["base59-drop-f", bytes59]]) {
  for (const [scope, input] of [
    ["first192", values.slice(0, 192)],
    ["first229", values.slice(0, 229)],
    ["full256", values],
    ["last64", values.slice(192)]
  ]) {
    const digest = sha512(input);
    assert.notEqual(digest, sourceDigest, "Unexpected original p56 target SHA512 match");
    hashTests.push({ radix, scope, length: input.length, digest, matchesP56: false });
  }
  for (const sign of [-1, 1]) {
    const decoded = p51.slice(0, 27).map((cipher, i) =>
      mod29(cipher + sign * values[229 + i]));
    assert(decoded.every((plain, i) =>
      mod29(plain - sign * values[229 + i]) === p51[i]));
    transformations.push({
      radix, sign, receiver: "p51 rune offsets 0..26",
      decodedIndices: decoded,
      gpSequence: render(decoded), ioc: ioc(decoded)
    });
  }
}
const between = bytes60.slice(193, 229);
const after = bytes60.slice(230, 256);
const report = {
  source: "original physical p49-p51 numeric table; p51 opening; solved p57",
  zeroCells,
  zeroCellRows: zeroCells.map((i) => [Math.floor(i / 8), i % 8]),
  suffixLengths: zeroCells.map((i) => 256 - i),
  solvedGpSums: { SHED: phraseSum(shed), OUR_OWN: phraseSum(ourOwn) },
  p51FirstWord: { GP: render(p51.slice(0, 3)), indices: p51.slice(0, 3), sum: 27 },
  strictInterior: {
    betweenZeros: { length: between.length, distinctBytes: new Set(between).size,
      distinctMod36: new Set(between.map((value) => value % 36)).size },
    afterLastZero: { length: after.length, distinctBytes: new Set(after).size,
      distinctMod26: new Set(after.map((value) => value % 26)).size }
  },
  directPadTests: transformations,
  p56Sha512Tests: hashTests,
  decision: "Source-aligned suffix match survives as a navigation clue; four direct 27-rune pads do not yield native prose, and eight fixed byte-hash candidates miss p56."
};
console.log(JSON.stringify(report, null, 2));
