"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words} = require("./lp2_word_pages.cjs");

const root = path.join(__dirname, "..", "resources", "liber-primus");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "lp2-corpus.json"), "utf8"));
const transcript = fs.readFileSync(path.join(root, "lp2-transcription.txt"), "utf8");
const words = parseLP2Words(transcript).words
  .filter((word) => word.startPage >= 3 && word.endPage <= 7)
  .map((word) => [...word.runes].map((rune) => corpus.runes.indexOf(rune)));
assert.equal(words.length, 255);
assert.equal(words.reduce((sum, word) => sum + word.length, 0), 1145);
const max = Math.max(...words.map((w) => w.length));
assert.equal(max, 12);
const grid = words.map((word) => Array(13 - word.length).fill(null).concat(word));
assert.equal(grid.length, 255);

const terminal = corpus.pages.filter((p) => p.page >= 40 && p.page <= 55)
  .flatMap((p) => p.indices);
assert.equal(terminal.length, 3316);
assert.equal(terminal[0], 0);
const cipher = terminal.slice(1);
assert.equal(cipher.length, 3315);

/** @param {number[]} s Source GP29 indices. */
function coincidence(s) {
  const counts = Array(29).fill(0);
  for (const x of s) counts[x]++;
  return counts.reduce((v, x) => v + x * (x - 1), 0) / (s.length * (s.length - 1));
}
const mod = (x) => ((x % 29) + 29) % 29;
assert.equal(coincidence(cipher).toFixed(14), "0.03445995825562");
const frozen = [
  ["row", 1145, 2170, "0.03434971142395", "0.03443452248164",
    "0.03421992854307", "0.03417564967783"],
  ["column", 1145, 2170, "0.03441231257825", "0.03469839995071",
    "0.03439093657434", "0.03434055027941"],
];
const p57 = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(p57.length, 95);
const positive = Array.from({length: 1145}, (_, i) => p57[i % 95]);

for (const [orientation, n, coverN, selectedIoC, coverIoC, negIoC, posIoC] of frozen) {
  const source = orientation === "row" ? grid.flat() :
    Array.from({length: 13}, (_, col) => grid.map((r) => r[col])).flat();
  const selection = source.flatMap((key, index) => key === null ? [] : [index]);
  assert.equal(source.length, 3315);
  assert.equal(selection.length, n);
  const selected = selection.map((i) => cipher[i]);
  const cover = cipher.filter((_, i) => source[i] === null);
  assert.equal(cover.length, coverN);
  assert.equal(coincidence(selected).toFixed(14), selectedIoC);
  assert.equal(coincidence(cover).toFixed(14), coverIoC);

  for (const [sign, expected] of [[-1, negIoC], [+1, posIoC]]) {
    const inverse = selection.map((i) => mod(cipher[i] + sign * source[i]));
    assert.equal(coincidence(inverse).toFixed(14), expected);
    const reencryption = inverse.map((v, j) =>
      mod(v - sign * source[selection[j]]));
    assert.deepEqual(reencryption, selected);
    const synthetic = selection.map((i, j) =>
      mod(positive[j] - sign * source[i]));
    assert.deepEqual(synthetic.map((v, j) =>
      mod(v + sign * source[selection[j]])), positive);
    assert.ok(coincidence(positive) > 0.06);
    console.log(orientation, sign, "n", n, "selected IoC", selectedIoC,
      "decoded IoC", expected, "p57 native planted IoC",
      coincidence(positive).toFixed(8));
  }
  console.log(orientation, "cover IoC", coverIoC);
}
console.log("PASS: source 255 × 13 = 3315 masks, two directions, four original inverses");
