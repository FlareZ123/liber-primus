#!/usr/bin/env node
"use strict";

/**
 * SFT: archived 2012 MIDI participant word list under the *hypothetical*
 * 2016 GP-prime-sum/base-58 LP2 address rule. This is a null/control test,
 * not an attested cross-round decoder.
 *
 * Run from repository root: node sims/2012_midi_49word_p50_address_sft.cjs
 * Self-contained, deterministic, no dependencies beyond Node.js.
 */
const fs = require("node:fs");
const assert = require("node:assert/strict");

const read = (path) => fs.readFileSync(path, "utf8");
const words = read("resources/historical/cicada2012-midi-49-words.txt").trim().split(/\s+/u);
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcript = read("resources/lp2-transcription.txt").split("%");
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const weights = corpus.prime;
const tokens = corpus.translit
  .map((token, index) => ({token: token.toLowerCase(), index}))
  .sort((a, b) => b.token.length - a.token.length);

/** @param {string} word @param {"cw"|"c"} qAs */
function gp(word, qAs = "cw") {
  const normalized = word.toLowerCase()
    .replaceAll("q", qAs).replaceAll("v", "u")
    .replaceAll("k", "c").replaceAll("z", "s");
  const result = [];
  for (let offset = 0; offset < normalized.length;) {
    const found = tokens.find((x) => normalized.startsWith(x.token, offset));
    if (!found) return null;
    result.push(found.index);
    offset += found.token.length;
  }
  return result;
}

/** @param {number[]} ids @param {number[]} primes */
function gpSum(ids, primes = weights) {
  return ids.reduce((sum, index) => sum + primes[index], 0);
}

/** @param {string} text */
function printedWords(text) {
  return text.replaceAll("/", "").replaceAll("\n", "").replaceAll("\r", "")
    .split(/[-.&$§,:!?]/u)
    .map((piece) => (piece.match(/[ᚠ-᛿]+/gu) || []).join(""))
    .filter(Boolean);
}

const pages = Array.from({length: 58}, (_, index) =>
  index === 50 ? [] : printedWords(transcript[index > 50 ? index - 1 : index]));
assert.equal(pages.reduce((sum, page) => sum + page.length, 0), 2973);
assert.equal(pages[50].length, 0);
assert.equal(words.length, 49);
assert.equal(new Set(words).size, 47);

const wordIds = words.map((word) => {
  const ids = gp(word);
  assert.ok(ids, "Unmapped GP token in " + word);
  return ids;
});
const rows = words.map((word, index) => {
  const sum = gpSum(wordIds[index]);
  const page = sum % 58;
  const cell = Math.floor(sum / 58);
  const cipher = pages[page][cell] || null;
  const target = cipher ? [...cipher].map((r) => corpus.translit[corpus.runes.indexOf(r)]).join("") : null;
  return {index: index + 1, word, sum, page, cell, target};
});
const missing = rows.filter((r) => !r.target);
assert.equal(missing.length, 5);
assert(missing.every((r) => r.page === 50));
assert.deepEqual(missing.map((r) => [r.word, r.sum, r.cell]), [
  ["hammer", 340, 5], ["hook", 50, 0], ["knot", 108, 1],
  ["boat", 224, 3], ["umbrella", 456, 7]
]);
const alternateQ = words.map((word) => gpSum(gp(word, "c")));
assert.deepEqual(alternateQ.map((sum) => sum % 58 === 50),
  rows.map((row) => row.page === 50));

const page50 = grid.pages.find((p) => p.page === 50);
assert.ok(page50);
assert.deepEqual([0, 1, 3, 5, 7].map((i) => page50.tokens[i]),
  ["2M", "0w", "3D", "0S", "15"]);
assert.deepEqual([0, 1, 3, 5, 7].map((i) => page50.bytes[i]),
  [142, 58, 193, 28, 65]);

const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const message = signed.slice(signed.indexOf("Hello."),
  signed.indexOf("-----BEGIN PGP SIGNATURE-----"));
const signedWords = message.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
assert.equal(signedWords.length, 43);
const signedIds = signedWords.map((word) => {
  const ids = gp(word);
  assert.ok(ids, word);
  return ids;
});
assert.equal(gpSum(gp("lies")), 224);
assert.equal(gpSum(gp("boat")), 224);
const signedP50 = signedWords.filter((word, i) => gpSum(signedIds[i]) % 58 === 50);
assert.deepEqual(signedP50, ["lies"]);

const chorus = read("resources/control/cicada2012_blake_chorus.txt")
  .split("BEGIN SOURCE TEXT")[1].split("END SOURCE TEXT")[0];
const chorusWords = chorus.match(/[A-Za-z]+/g) || [];
assert.equal(chorusWords.length, 56);
assert.equal(chorusWords.filter((word) => gpSum(gp(word)) % 58 === 50).length, 0);

console.log("2012 archived MIDI: 49 tokens, 47 unique, 44 rune-word addresses");
console.log("Page 50: " + missing.map((r) => r.word + "=" + r.sum + "→" + r.cell).join("; "));
console.log("Cross-round collision: boat=lies=224; signed 2016 has only one p50 address.");
console.log("Index\tMIDI word\tGP sum\tLP2 page\tword/cell\tcipher target");
for (const row of rows) {
  console.log([row.index, row.word, row.sum, row.page, row.cell, row.target || "(table)"].join("\t"));
}

/** Return seeded, reproducible 32-bit xorshift random integer. */
function makeRandom(seed) {
  let state = seed >>> 0;
  return function next() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

const randomWeights = makeRandom(0x20124350);
const weightTrials = 100000;
const weightSummary = {
  hit50AtLeast5: 0, hit50Distinct5: 0, anyPageAtLeast5: 0,
  crossSumAtLeast8: 0, boatLiesEqual: 0
};
for (let trial = 0; trial < weightTrials; trial++) {
  const shuffled = weights.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomWeights() % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const sums = wordIds.map((ids) => gpSum(ids, shuffled));
  const count = Array(58).fill(0);
  const cells = [];
  for (const value of sums) {
    const page = value % 58;
    count[page]++;
    if (page === 50) cells.push(Math.floor(value / 58));
  }
  if (cells.length >= 5) weightSummary.hit50AtLeast5++;
  if (new Set(cells).size >= 5) weightSummary.hit50Distinct5++;
  if (Math.max(...count) >= 5) weightSummary.anyPageAtLeast5++;
  const signedValues = signedIds.map((ids) => gpSum(ids, shuffled));
  const signedSet = new Set(signedValues);
  if (sums.filter((value) => signedSet.has(value)).length >= 8) weightSummary.crossSumAtLeast8++;
  const liesIndex = signedWords.findIndex((word) => word.toLowerCase() === "lies");
  if (sums[15] === signedValues[liesIndex]) weightSummary.boatLiesEqual++;
}
assert.deepEqual(weightSummary, {
  hit50AtLeast5: 325, hit50Distinct5: 18, anyPageAtLeast5: 13848,
  crossSumAtLeast8: 6904, boatLiesEqual: 584
});
console.log("100000 source-word-preserving GP-prime label shuffles: " + JSON.stringify(weightSummary));

// A separate lexical-control family holds the 2012 word lengths or GP rune
// lengths and duplicate positions fixed, but samples other recorded English
// word types. It makes no claim to model the puzzle author's word-selection.
const lexicon = read("resources/control/english_wordfreq_textblob.txt").split("\n")
  .filter((line) => /^[a-z]+ [0-9]+$/u.test(line))
  .map((line) => {
    const word = line.split(" ")[0];
    const ids = gp(word);
    return ids ? {word, letters: word.length, runes: ids.length, sum: gpSum(ids)} : null;
  }).filter(Boolean);
assert.equal(lexicon.length, 29157);
const unique = [...new Set(words)];
const uniqueIndex = words.map((word) => unique.indexOf(word));
const uniqueProfiles = unique.map((word) => ({
  letters: word.length, runes: gp(word).length
}));
const lexicalRandom = makeRandom(0x20124351);
for (const mode of ["letters", "runes"]) {
  const bins = new Map();
  for (const entry of lexicon) {
    if (!bins.has(entry[mode])) bins.set(entry[mode], []);
    bins.get(entry[mode]).push(entry);
  }
  const lexTrials = 75000;
  const summary = {hit50AtLeast5: 0, hit50Distinct5: 0, anyPageAtLeast5: 0};
  for (let trial = 0; trial < lexTrials; trial++) {
    const sampled = uniqueProfiles.map((profile) => {
      const group = bins.get(profile[mode]);
      assert.ok(group && group.length);
      return group[lexicalRandom() % group.length].sum;
    });
    const count = Array(58).fill(0);
    const cells = [];
    for (const position of uniqueIndex) {
      const value = sampled[position];
      count[value % 58]++;
      if (value % 58 === 50) cells.push(Math.floor(value / 58));
    }
    if (cells.length >= 5) summary.hit50AtLeast5++;
    if (new Set(cells).size >= 5) summary.hit50Distinct5++;
    if (Math.max(...count) >= 5) summary.anyPageAtLeast5++;
  }
  console.log("75000 lexicon controls by " + mode + ": " + JSON.stringify(summary));
  assert.deepEqual(summary, mode === "letters"
    ? {hit50AtLeast5: 457, hit50Distinct5: 34, anyPageAtLeast5: 10877}
    : {hit50AtLeast5: 388, hit50Distinct5: 28, anyPageAtLeast5: 10383});
}
console.log("SFT PASS: source-fixed arithmetic and deterministic conditional nulls.");
