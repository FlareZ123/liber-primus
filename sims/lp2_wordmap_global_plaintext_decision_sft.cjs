"use strict";

/**
 * Original LP2 58-page GP-prime word-pointer map: whole-book plaintext decision.
 *
 * Tests the prior, explicitly provisional address rule:
 *   n = GP-prime sum of a printed page-local rune segment;
 *   page = n mod 58, word = floor(n / 58), zero based.
 * Follow the same rule recursively; only independently solved p56/p57
 * destinations are permitted to supply an English label.
 *
 * This is a global necessary plausibility check, not a decipherment claim.
 * Node.js 20+ CommonJS; run from any working directory; no writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} file @returns {string} */
function read(file) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const chunks = read("resources/liber-primus/lp2-transcription.txt").split("%");
const known = read("resources/liber-primus/lp1-plaintext-reference.txt");
assert.equal(chunks.length, 57);
assert.equal(corpus.pages.length, 58);
const primes = new Map(corpus.runes.map((rune, i) => [rune, corpus.prime[i]]));

/** @param {string} pageText @returns {string[]} */
function printedSegments(pageText) {
  const result = [];
  let word = "";
  for (const ch of pageText) {
    if (primes.has(ch)) {
      word += ch;
    } else if (ch === "/" || /\\s/u.test(ch)) {
      // A visual line wrap does not end a printed word.
    } else if (word) {
      result.push(word);
      word = "";
    }
  }
  if (word) result.push(word);
  return result;
}

const pages = Array.from({ length: 58 }, (_, page) => page === 50
  ? grid.pages.find((entry) => entry.page === 50).tokens
  : printedSegments(chunks[page >= 51 ? page - 1 : page]));
assert.equal(pages[50].length, 104);
assert.equal(pages[55].length, 17);
assert.equal(pages.slice(0, 56).reduce((n, entries, page) =>
  n + (page === 50 ? 0 : entries.length), 0), 2928);

/** @param {string} word @returns {number} */
function primeSum(word) {
  return [...word].reduce((n, ch) => n + primes.get(ch), 0);
}

const solved56 = known.split("### 56")[1].split("### 57")[0]
  .split(/\\r?\\n\\r?\\n/u).slice(0, 2).join(" ").match(/[A-Z]+/gu);
const solved57 = known.split("### 57")[1].match(/[A-Z]+/gu);
assert.equal(solved56[1], "END");
assert.equal(solved56[4], "DEEP");
assert.equal(solved57[6], "THE");

/**
 * @param {number} initialSum
 * @returns {{kind:"solved"|"table"|"cycle"|"invalid", label?:string, target?:string, depth:number}}
 */
function walk(initialSum) {
  let n = initialSum;
  const visited = new Set();
  for (let depth = 0; depth < 150; depth++) {
    const page = n % 58;
    const wordIndex = Math.floor(n / 58);
    const word = pages[page][wordIndex];
    if (word === undefined) return { kind: "invalid", depth };
    if (page === 50) return { kind: "table", depth };
    if (page >= 56) {
      return {
        kind: "solved", depth,
        label: (page === 56 ? solved56 : solved57)[wordIndex],
        target: "p" + page + ":w" + wordIndex,
      };
    }
    if (visited.has(n)) return { kind: "cycle", depth };
    visited.add(n);
    n = primeSum(word);
  }
  assert.fail("Unexpected path longer than 150 steps");
}

const totals = { solved: 0, table: 0, cycle: 0, invalid: 0 };
const freq = new Map();
const perPage = new Map();
const examples = [];
let adjacentSolved = 0;
let identicalAdjacent = 0;
for (let page = 0; page < 56; page++) {
  if (page === 50) continue;
  const routes = pages[page].map((word) => walk(primeSum(word)));
  perPage.set(page, routes);
  for (let j = 0; j < routes.length; j++) {
    const route = routes[j];
    totals[route.kind]++;
    if (route.kind !== "solved") continue;
    freq.set(route.label, (freq.get(route.label) || 0) + 1);
    if (j > 0 && routes[j - 1].kind === "solved") {
      adjacentSolved++;
      if (routes[j - 1].label === route.label) identicalAdjacent++;
      examples.push("p" + page + ":w" + (j - 1) + "-" + j +
        " = " + routes[j - 1].label + " " + route.label);
    }
  }
}

assert.deepEqual(totals, {
  solved: 311, table: 658, cycle: 1959, invalid: 0,
});
assert.equal([...freq.values()].reduce((a, b) => a + b, 0), 311);
assert.equal(freq.get("END"), 154);
assert.equal(freq.get("THE"), 67);
assert.equal(freq.get("DEEP"), 29);
assert.equal(adjacentSolved, 27);
assert.equal(identicalAdjacent, 14);
const p55 = perPage.get(55).map((route, index) =>
  route.kind === "solved" ? [index, route.label] : null).filter(Boolean);
assert.deepEqual(p55, [[2, "END"], [8, "DEEP"], [13, "THE"]]);
const p55Reversed = p55.map((entry) => entry[1]).reverse().join(" ");
assert.equal(p55Reversed, "THE DEEP END");

// Genuine solved-page reference itself does not contain adjacent identical
// printed English words (a positive grammar sanity check, not a null model).
const native = [solved56, solved57];
const nativeDoubles = native.reduce((n, words) =>
  n + words.slice(1).filter((word, i) => word === words[i]).length, 0);
assert.equal(nativeDoubles, 0);
console.log("Original 55 rune-bearing unknown pages:", 2928,
  "page-local printed segments (includes cross-page carries)");
console.log("Pointer terminal categories:", JSON.stringify(totals));
console.log("Solved labels:", JSON.stringify([...freq.entries()]
  .sort((a, b) => b[1] - a[1])));
console.log("Adjacent solved-labelled pairs:", adjacentSolved,
  "of which identical:", identicalAdjacent);
console.log("Examples:", examples.slice(0, 15).join("; "));
console.log("Source p55 solved endpoints in reverse:", p55Reversed);
console.log("Authentic p56/p57 adjacent identical words:", nativeDoubles);
console.log("Decision: the 2016 58-page word-pointer map is not an",
  "ordinary global word-for-word plaintext decoder on this source.",
  "It may still be a selective navigation mechanism. No unknown plaintext",
  "or cipher key recovered.");
