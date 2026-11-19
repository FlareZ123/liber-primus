"use strict";

const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {string} relative @returns {any} */
function runJson(relative) {
  return JSON.parse(execFileSync(process.execPath, [path.join(root, relative)], {
    encoding: "utf8",
    windowsHide: true,
  }));
}

const squareRoute = runJson("sims/lp2_p22_square_shed_divinity_emerge_sft.cjs");
assert.equal(squareRoute.status, "PASS");
assert.equal(squareRoute.square.center, 809);
assert.deepEqual(squareRoute.centerRivalHits, [{
  name: "center",
  value: 809,
  origin: "zero",
  address: 41,
  radix: 59,
  token: "1O",
  output: 83,
  p57Words: ["EMERGE"],
}]);

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const tape = grid.pages.flatMap((page) => page.tokens);
const alpha59 = grid.alphabet.replace("f", "");
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

const smallPrimes = [];
for (let candidate = 2; smallPrimes.length < 29; candidate += 1) {
  let prime = true;
  for (let d = 2; d * d <= candidate; d += 1) {
    if (candidate % d === 0) {
      prime = false;
      break;
    }
  }
  if (prime) smallPrimes.push(candidate);
}

/** @param {string} word @returns {number[]} */
function gpIndices(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C")
    .replace(/V/g, "U")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      values.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      values.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset));
    assert.ok(token, `unmapped GP token in ${word} at ${offset}`);
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/** @param {string} word @returns {number} */
function gp0(word) {
  return gpIndices(word).reduce((sum, value) => sum + value, 0);
}

/** @param {string} word @returns {number} */
function gpPrime(word) {
  return gpIndices(word).reduce((sum, value) => sum + smallPrimes[value], 0);
}

/** @param {number} address @returns {number} */
function base59(address) {
  const token = tape[address];
  return 59 * alpha59.indexOf(token[0]) + alpha59.indexOf(token[1]);
}

assert.equal(gp0("EMERGE"), 83);
assert.equal(gp0("DIVINITY"), 105);
assert.equal(gp0("SURFACE"), 67);
assert.equal(gpPrime("EMERGE"), 300);

// Audited address-only nested bracket.
assert.equal(tape[82], "3L");
assert.equal(tape[83], "3D");
assert.equal(tape[105], "13");
assert.equal(tape[127], "3D");
assert.equal(tape[128], "3L");
assert.equal((83 + 127) / 2, 105);
assert.equal((82 + 128) / 2, 105);

// Frozen six-rune EMERGE pointer walk.
const start = gpPrime("EMERGE") % 256;
assert.equal(start, 44);
const walk = [start];
let address = start;
for (let edge = 0; edge < gpIndices("EMERGE").length; edge += 1) {
  address = base59(address);
  walk.push(address);
}
assert.deepEqual(walk, [44, 226, 72, 161, 214, 247, 189]);
assert.equal(tape[189], "3C");
assert.equal(base59(189), 189);

const visitedColumns = walk.map((value) => value % 8);
assert.deepEqual(visitedColumns, [4, 2, 0, 1, 6, 7, 5]);
const missingColumns = [...Array(8).keys()]
  .filter((column) => !visitedColumns.includes(column));
assert.deepEqual(missingColumns, [3]);

const sameToken = [];
tape.forEach((token, index) => {
  if (token === "3C") sameToken.push(index);
});
assert.deepEqual(sameToken, [67, 162, 189, 247]);

const completion = sameToken.filter((candidate) =>
  candidate % 8 === missingColumns[0]);
assert.deepEqual(completion, [67]);
assert.equal(gp0("SURFACE"), completion[0]);

// Re-run the complete p57 source family under the same fixed rule.
const p57Words = "PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE"
  .split(/\s+/);

const familyHits = [];
for (const word of p57Words) {
  let cursor = gpPrime(word) % 256;
  const columns = [cursor % 8];
  for (let edge = 0; edge < gpIndices(word).length; edge += 1) {
    cursor = base59(cursor);
    columns.push(cursor % 8);
  }
  if (base59(cursor) !== cursor) continue;

  const distinctVisited = [...new Set(columns)];
  const missing = [...Array(8).keys()].filter((column) =>
    !distinctVisited.includes(column));
  if (missing.length !== 1) continue;

  const token = tape[cursor];
  const candidates = [];
  tape.forEach((candidateToken, index) => {
    if (candidateToken === token && index % 8 === missing[0]) {
      const targetWord = p57Words.find((sourceWord) => gp0(sourceWord) === index);
      if (targetWord) candidates.push({ index, targetWord });
    }
  });
  if (candidates.length) {
    familyHits.push({ word, endpoint: cursor, token, missing: missing[0], candidates });
  }
}

assert.deepEqual(familyHits, [{
  word: "EMERGE",
  endpoint: 189,
  token: "3C",
  missing: 3,
  candidates: [{ index: 67, targetWord: "SURFACE" }],
}]);

console.log(JSON.stringify({
  status: "PASS",
  upstream: "source-linked p22 square SHED -> sole-prime center809 -> p50/base59 EMERGE83",
  nestedBracket: {
    outer: [82, 128],
    inner: [83, 127],
    center: 105,
    centerWord: "DIVINITY",
  },
  emergeWalk: {
    gpPrime: gpPrime("EMERGE"),
    start,
    runeLength: gpIndices("EMERGE").length,
    path: walk,
    endpoint: 189,
    token: tape[189],
    visitedColumns,
    missingColumn: 3,
    completion: 67,
    completionWord: "SURFACE",
  },
  p57FamilyHits: familyHits,
  boundary: "Stops at independently selected EMERGE->SURFACE. Does not assume the later conditional base60 reset or p0 plaintext.",
}, null, 2));
