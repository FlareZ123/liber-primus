"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/transcriptions/lp2-image-corrected.txt");
const signedText = read("resources/historical/cicada2016-4gq25-outguess.asc");
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
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
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/**
 * Parse canonical complete printed words while preserving words across page
 * boundaries; only words wholly contained on one page survive in localWords.
 * @returns {{page:number,endPage:number,start:number,values:number[]}[]}
 */
function parseCanonicalWords() {
  const parts = transcription.split(/^\s*%\s*$/m).slice(0, 55);
  const words = [];
  let current = [];
  let startPage = -1;
  let endPage = -1;
  let startOffset = -1;

  function flush() {
    if (!current.length) return;
    words.push({
      page: startPage,
      endPage,
      start: startOffset,
      values: current.slice(),
    });
    current = [];
  }

  for (let block = 0; block < parts.length; block += 1) {
    const page = block >= 50 ? block + 1 : block;
    let offset = 0;
    for (const char of [...parts[block]]) {
      const value = runeIndex.get(char);
      if (value !== undefined) {
        if (!current.length) {
          startPage = page;
          startOffset = offset;
        }
        endPage = page;
        current.push(value);
        offset += 1;
      } else if (!/[\s/]/u.test(char)) {
        flush();
      }
    }
  }
  flush();
  return words.filter((word) => word.page === word.endPage);
}

/** @param {number[]} left @param {number[]} right @returns {boolean} */
function same(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

/** @param {number[]} cipher @param {number[]} key @param {"subtract"|"add"} sign @returns {number[]} */
function apply(cipher, key, sign) {
  assert.equal(cipher.length, key.length);
  const polarity = sign === "subtract" ? -1 : 1;
  return cipher.map((value, index) => mod29(value + polarity * key[index]));
}

/** @param {number[]} values @returns {number[][]} */
function permutations(values) {
  const found = new Map();
  function visit(prefix, rest) {
    if (!rest.length) {
      found.set(prefix.join(","), prefix.slice());
      return;
    }
    for (let index = 0; index < rest.length; index += 1) {
      visit(prefix.concat(rest[index]), rest.slice(0, index).concat(rest.slice(index + 1)));
    }
  }
  visit([], values);
  return [...found.values()];
}

const clear = signedText.split("-----BEGIN PGP SIGNATURE-----")[0];
const sourceWords = clear
  .slice(clear.indexOf("Hello."))
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word) => word.toUpperCase());
assert.equal(sourceWords.length, 43);
assert.deepEqual(sourceWords.slice(32), [
  "YOU", "WILL", "BE", "FOUND", "GOOD", "LUCK",
  "BEWARE", "FALSE", "PATHS", "VERIFY", "OPENPGP",
]);

const p6Ink = ink.pages.find((page) => page.page === 6);
assert.ok(p6Ink);
assert.deepEqual(p6Ink.red_spans, [{
  start: 71,
  length: 11,
  runes: "ᚪᛏᛉᛒᛗᚷᛡᛋᛒᛉᛇ",
}]);
const titleRunes = [...p6Ink.red_spans[0].runes].map((rune) => runeIndex.get(rune));
assert.deepEqual(titleRunes, [24, 16, 14, 17, 19, 6, 27, 15, 17, 14, 12]);

// Existing source-only p6 interval selector partitions the eleven selected
// source words by the printed red-title word lengths [4,1,4,2]. Therefore W3
// aligns in printed order with LUCK / BEWARE / FALSE / PATHS.
const titleLengths = [4, 1, 4, 2];
assert.equal(titleLengths.reduce((sum, value) => sum + value, 0), 11);
assert.deepEqual(sourceWords.slice(37, 41), ["LUCK", "BEWARE", "FALSE", "PATHS"]);
const w3 = titleRunes.slice(5, 9);
assert.deepEqual(w3, [6, 27, 15, 17]);
assert.equal(w3[3], 17);
assert.equal(sourceWords[40], "PATHS");

const canonical = parseCanonicalWords();
/** @param {number} page @returns {{page:number,endPage:number,start:number,values:number[]}[]} */
function localWords(page) {
  return canonical.filter((word) => word.page === page);
}

// Natural direct interpretation: the p40-aligned W3 rune17 is a one-based
// local word ordinal. It selects word17, whose start is independently 71.
const p40Words = localWords(40);
const p40Word17 = p40Words[16];
assert.ok(p40Word17);
assert.equal(p40Word17.start, 71);
assert.deepEqual(p40Word17.values, [4, 15, 14, 21]);

// Existing p6 visual/signed-tail key. This SFT tests the new receiver selector,
// not a new derivation of the already published key.
const state = Object.freeze({ q: 4, g: 5, a: 6, K: 2 });
const key = [
  mod29(state.q * state.g),
  mod29(state.q * state.g),
  mod29(state.a * state.K),
  state.a,
];
assert.deepEqual(key, [20, 20, 12, 6]);
assert.deepEqual(apply(p40Word17.values, key, "subtract"), gp("PATHS"));

const authenticatedFour = [];
const seenFour = new Set();
for (const word of sourceWords) {
  const values = gp(word);
  if (values.length !== 4) continue;
  const id = values.join(",");
  if (seenFour.has(id)) continue;
  seenFour.add(id);
  authenticatedFour.push({ word, values });
}
assert.equal(authenticatedFour.length, 9);

// Control 1: charge the natural printed alignment plus reverse orientation,
// and both plausible local-word origins. Only the natural forward/one-based
// branch produces an authenticated hit, p40 PATHS.
const alignmentHits = [];
let alignmentTests = 0;
for (const orientation of ["forward", "reverse"]) {
  const sequence = orientation === "forward" ? titleRunes : titleRunes.slice().reverse();
  for (const origin of ["oneBased", "zeroBased"]) {
    for (let offset = 0; offset < 11; offset += 1) {
      const page = 32 + offset;
      const ordinalValue = sequence[offset];
      const index = origin === "oneBased" ? ordinalValue - 1 : ordinalValue;
      const receiver = index >= 0 ? localWords(page)[index] : null;
      if (!receiver || receiver.values.length !== 4) continue;
      for (const sign of ["subtract", "add"]) {
        const output = apply(receiver.values, key, sign);
        for (const target of authenticatedFour) {
          alignmentTests += 1;
          if (same(output, target.values)) {
            alignmentHits.push({
              orientation,
              origin,
              page,
              ordinalValue,
              ordinal: index + 1,
              start: receiver.start,
              sign,
              target: target.word,
            });
          }
        }
      }
    }
  }
}
assert.deepEqual(alignmentHits, [{
  orientation: "forward",
  origin: "oneBased",
  page: 40,
  ordinalValue: 17,
  ordinal: 17,
  start: 71,
  sign: "subtract",
  target: "PATHS",
}]);

// Control 2: remove the page-to-title-rune alignment entirely. Any distinct p6
// red-rune value may address any page p32..p42, under either numbering origin.
// The fixed key still has only one distinct authenticated output event. Two
// labels hit the same p40 word17: rune17 one-based, and rune16 zero-based.
const titleValues = [...new Set(titleRunes)];
assert.deepEqual(titleValues, [24, 16, 14, 17, 19, 6, 27, 15, 12]);
const broadReceivers = new Map();
for (let page = 32; page <= 42; page += 1) {
  const words = localWords(page);
  for (const ordinalValue of titleValues) {
    for (const origin of ["oneBased", "zeroBased"]) {
      const index = origin === "oneBased" ? ordinalValue - 1 : ordinalValue;
      const receiver = index >= 0 ? words[index] : null;
      if (!receiver || receiver.values.length !== 4) continue;
      const id = `${page}:${receiver.start}`;
      if (!broadReceivers.has(id)) {
        broadReceivers.set(id, {
          page,
          start: receiver.start,
          values: receiver.values,
          labels: [],
        });
      }
      broadReceivers.get(id).labels.push({ ordinalValue, origin, ordinal: index + 1 });
    }
  }
}
assert.equal([...broadReceivers.values()].reduce((sum, row) => sum + row.labels.length, 0), 30);
assert.equal(broadReceivers.size, 26);

const broadHits = [];
let broadTests = 0;
for (const receiver of broadReceivers.values()) {
  for (const sign of ["subtract", "add"]) {
    const output = apply(receiver.values, key, sign);
    for (const target of authenticatedFour) {
      broadTests += 1;
      if (same(output, target.values)) {
        broadHits.push({
          page: receiver.page,
          start: receiver.start,
          labels: receiver.labels,
          sign,
          target: target.word,
        });
      }
    }
  }
}
assert.equal(broadTests, 26 * 2 * 9);
assert.deepEqual(broadHits, [{
  page: 40,
  start: 71,
  labels: [
    { ordinalValue: 16, origin: "zeroBased", ordinal: 17 },
    { ordinalValue: 17, origin: "oneBased", ordinal: 17 },
  ],
  sign: "subtract",
  target: "PATHS",
}]);

// Boundary: widening the exact key to the already published 1,389-key visual
// family creates three additional authenticated events on this enlarged
// receiver family. The new result therefore strengthens receiver provenance;
// it does not make the broad key family uniquely predictive.
const visualKeys = new Map();
for (const repeated of [20, 22, 24]) {
  for (const left of titleValues) {
    for (const right of titleValues) {
      for (const candidate of permutations([repeated, repeated, left, right])) {
        visualKeys.set(candidate.join(","), candidate);
      }
    }
  }
}
assert.equal(visualKeys.size, 1389);

const visualHits = new Map();
let valualTests = 0;
for (const receiver of broadReceivers.values()) {
  for (const candidateKey of visualKeys.values()) {
    for (const sign of ["subtract", "add"]) {
      const output = apply(receiver.values, candidateKey, sign);
      for (const target of authenticatedFour) {
        visualTests += 1;
        if (!same(output, target.values)) continue;
        const id = [receiver.page, receiver.start, sign, target.word].join(":");
        visualHits.set(id, {
          page: receiver.page,
          start: receiver.start,
          sign,
          target: target.word,
        });
      }
    }
  }
}
assert.equal(visualTests, 26 * 1389 * 2 * 9);
assert.deepEqual([...visualHits.values()], [
  { page: 34, start: 107, sign: "subtract", target: "GOOD" },
  { page: 39, start: 22, sign: "add", target: "SEEK" },
  { page: 40, start: 71, sign: "subtract", target: "PATHS" },
  { page: 42, start: 87, sign: "subtract", target: "MEANING" },
]);

console.log("PASS lp2_p6_title_rune_p40_word17_selector_sft");
console.log("p6 red title:", titleRunes.join(","));
console.log("W3 -> LUCK BEWARE FALSE PATHS:", w3.join(","));
console.log("PATHS-aligned rune17 -> p40 word17 -> start", p40Word17.start);
console.log("natural alignment tests:", alignmentTests, "hits:", alignmentHits);
console.log("broad fixed-key tests:", broadTests, "distinct receivers:", broadReceivers.size, "hits:", broadHits);
console.log("broad visual-key tests:", visualTests, "distinct numeric events:", [...visualHits.values()]);
