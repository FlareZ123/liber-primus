"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"
));
const frozen = JSON.parse(fs.readFileSync(
  path.join(root, "im-results/lp2-p6-p50-hfree-qblock-slope-pretarget.json"), "utf8"
));

const tokenOrder = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C")
    .replace(/V/g, "U")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];
  for (let i = 0; i < normalized.length;) {
    if (normalized.startsWith("ING", i)) { out.push(21); i += 3; continue; }
    if (normalized.startsWith("IO", i)) { out.push(27); i += 2; continue; }
    const token = tokenOrder.find((t) => normalized.startsWith(t.symbol, i));
    assert.ok(token, "unmapped GP source word " + word);
    out.push(token.value);
    i += token.symbol.length;
  }
  return out;
}

// Authenticated signed-source corridor words. These are deliberately absent
// from the serializer and frozen-output commits.
const targetWords = {
  q1: ["YOU", "WILL", "BE", "FOUND"],
  q3: ["LUCK", "BEWARE", "FALSE", "PATHS"],
};

let coordinateMatches = 0;
let coordinateTotal = 0;
let wordMatches = 0;
const grades = [];

for (const block of frozen.blocks) {
  const words = targetWords[block.name];
  assert.equal(words.length, block.rows.length);
  for (let i = 0; i < block.rows.length; i += 1) {
    const row = block.rows[i];
    const target = gp(words[i]);
    assert.equal(target.length, row.n);
    const matches = row.plain.map((v, j) => v === target[j]);
    const nMatches = matches.filter(Boolean).length;
    coordinateMatches += nMatches;
    coordinateTotal += row.n;
    if (nMatches === row.n) wordMatches += 1;
    grades.push({
      page: row.page,
      targetWord: words[i],
      frozenPlain: row.plain,
      target,
      coordinateMatches: nMatches,
      exactWord: nMatches === row.n,
    });
  }
}

assert.equal(wordMatches, 0);
assert.equal(coordinateMatches, 2);
assert.equal(coordinateTotal, 33);

console.log(JSON.stringify({
  status: "PASS",
  frozenSerializerCommit: frozen.serializer_commit,
  frozenOutputFile: "im-results/lp2-p6-p50-hfree-qblock-slope-pretarget.json",
  wordMatches,
  coordinateMatches,
  coordinateTotal,
  grades,
  conclusion: "The H-free p50-ordered page-slope lift passes every frozen checksum but recovers 0/8 corridor words and only 2/33 target coordinates. Retire this coordinate law without wrapping, reindexing, or slope reassignment.",
}, null, 2));
