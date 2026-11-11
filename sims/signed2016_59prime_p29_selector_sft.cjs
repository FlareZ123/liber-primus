"use strict";

/**
 * Independent source-only 2016 signed-message 59 -> 59th prime -> LP2 p29
 * selector and a key-independent TEA/BASE29 fixed-block transport gate.
 *
 * Run from the repository root:
 *   node sims/signed2016_59prime_p29_selector_sft.cjs
 *
 * Intermediate structural evidence, not a recovered cipher or plaintext.
 * Only built-in Node.js libraries are used. No network or mutable source files.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

/** @param {string} file @returns {string} */
function source(file) {
  return fs.readFileSync(path.join(__dirname, "..", file), "utf8");
}

const corpus = JSON.parse(source("resources/liber-primus/lp2-corpus.json"));
const signed2016 = source("resources/historical/cicada2016-4gq25-outguess.asc");
const signed2017 = source("resources/historical/cicada2017-yEiTHhvF.asc");

/** @param {string} signed @returns {string[]} */
function signedParagraphs(signed) {
  const clear = signed.split("-----BEGIN PGP SIGNATURE-----")[0];
  return clear.split(/\r?\n\s*\r?\n/).slice(1)
    .map((p) => p.trim().replace(/\s+/g, " ")).filter(Boolean);
}

/** @param {string} text @param {{ing:boolean,io:boolean}} spelling
 * @returns {{count:number,sum:number}} */
function gp(text, spelling) {
  const alphabet = new Map(corpus.translit.map((r, i) => [r, corpus.prime[i]]));
  alphabet.set("K", alphabet.get("C"));
  alphabet.set("V", alphabet.get("U"));
  if (spelling.ing) alphabet.set("ING", alphabet.get("NG"));
  if (spelling.io) alphabet.set("IO", alphabet.get("IA"));
  const tokens = [...alphabet.keys()].sort((a, b) => b.length - a.length);
  const letters = text.toUpperCase().replace(/[^A-Z]/g, "");
  let count = 0;
  let sum = 0;
  for (let i = 0; i < letters.length;) {
    const token = tokens.find((t) => letters.startsWith(t, i));
    assert.ok(token, "Unmapped 2016 signed-message token at " + letters.slice(i));
    count++;
    sum += alphabet.get(token);
    i += token.length;
  }
  return {count, sum};
}

/** @param {number} n @returns {number} */
function nthPrime(n) {
  let count = 0;
  for (let candidate = 2;; candidate++) {
    let prime = true;
    for (let d = 2; d * d <= candidate; d++) {
      if (candidate % d === 0) {
        prime = false;
        break;
      }
    }
    if (prime && ++count === n) return candidate;
  }
}

/**
 * Genuine signed source preserves seven paragraph units. The proposed
 * three-section grouping is a hypothesis: join greeting and first two
 * introductory units, split the central paragraph at its sole sentence
 * boundary, then group the closing text. No ciphertext-based tuning.
 */
const paragraphs = signedParagraphs(signed2016);
assert.equal(paragraphs.length, 7);
const middleSentences = paragraphs[2].split(/(?<=\.)\s+/);
assert.equal(middleSentences.length, 2);
const sections = [
  paragraphs[0] + " " + paragraphs[1] + " " + middleSentences[0],
  middleSentences[1],
  paragraphs.slice(3).join(" "),
];
// Canonical English-to-GP spelling keeps the ING and IO letter groups.
const canonical = {ing: false, io: false};
const canonicalGroups = sections.map((s) => gp(s, canonical));
assert.deepEqual(canonicalGroups, [
  {count: 59, sum: 2999},
  {count: 61, sum: 2781},
  {count: 59, sum: 2581},
]);
// Collapsing both groups is an additional, unselected historical hypothesis.
const conditionalSpelling = {ing: true, io: true};
const summary = sections.map((s) => gp(s, conditionalSpelling));
assert.deepEqual(summary, [
  {count: 59, sum: 2999},
  {count: 59, sum: 2819},
  {count: 59, sum: 2581},
]);
const variants = [
  {name: "ING+IO", spelling: {ing: true, io: true}},
  {name: "ING only", spelling: {ing: true, io: false}},
  {name: "IO only", spelling: {ing: false, io: true}},
  {name: "neither", spelling: {ing: false, io: false}},
].map((v) => ({name: v.name, groups: sections.map((s) => gp(s, v.spelling))}));
assert.deepEqual(variants.map((v) => v.groups.map((s) => s.count)), [
  [59, 59, 59], [59, 60, 59], [59, 60, 59], [59, 61, 59],
]);

const unknown = corpus.pages.filter((p) => p.page < 56);
assert.equal(unknown.length, 56);
const target = nthPrime(59);
assert.equal(target, 277);
const matches = unknown.filter((p) => p.indices.length === target)
  .map((p) => p.page);
assert.deepEqual(matches, [29]);
assert.equal(Math.max(...unknown.map((p) => p.indices.length)), 277);

/** The 2016 instructional clause has independently nested 43/27 runes. */
const nested = [
  sections[1],
  "their meaning is the road, and their numbers are the direction.",
  "and their numbers are the direction.",
].map((s) => gp(s, conditionalSpelling));
assert.deepEqual(nested.map((s) => s.count), [59, 43, 27]);
const nestedControls = nested.map((x) => ({
  count: x.count,
  nthPrime: nthPrime(x.count),
  pageMatches: unknown.filter((p) => p.indices.length === nthPrime(x.count))
    .map((p) => p.page),
}));
assert.deepEqual(nestedControls.map((x) => x.pageMatches), [[29], [], []]);

const warning2017 = gp(signedParagraphs(signed2017).join(" "), canonical);
assert.deepEqual(warning2017, {count: 45, sum: 2131});
assert.deepEqual(unknown.filter((p) => p.indices.length === nthPrime(45))
  .map((p) => p.page), []);

/** Key-independent test of a proposed lossless, fixed 14-digit GP29
 * representation of full 64-bit TEA blocks. It does not evaluate a key. */
const u64 = 1n << 64n;

/** @param {number[]} runes @param {boolean} little
 * @returns {{packets:number,fit:number,overflow:number}} */
function base29Packets(runes, little) {
  let fit = 0;
  let overflow = 0;
  for (let i = 0; i + 14 <= runes.length; i += 14) {
    const group = runes.slice(i, i + 14);
    if (little) group.reverse();
    let value = 0n;
    for (const digit of group) value = value * 29n + BigInt(digit);
    if (value < u64) fit++;
    else overflow++;
  }
  return {packets: fit + overflow, fit, overflow};
}
const original = unknown.flatMap((p) => p.indices);
assert.equal(original.length, 12956);
const bookBig = base29Packets(original, false);
const bookLittle = base29Packets(original, true);
const reset = unknown.map((p) => base29Packets(p.indices, false))
  .reduce((a, b) => ({
    packets: a.packets + b.packets,
    fit: a.fit + b.fit,
    overflow: a.overflow + b.overflow,
  }), {packets: 0, fit: 0, overflow: 0});
assert.deepEqual(bookBig, {packets: 925, fit: 58, overflow: 867});
assert.ok(bookLittle.overflow > 800);
assert.deepEqual(reset, {packets: 900, fit: 58, overflow: 842});

/** Positive control: every canonical 64-bit value fits 14 base29
 * digits when an actual 64-bit word, rather than random GP29 runes,
 * generated the digits. */
const sampleWords = [0n, 1n, 3301n, (1n << 63n), u64 - 1n];
const generated = sampleWords.flatMap((word) => {
  let value = word;
  const digits = Array(14).fill(0);
  for (let i = 13; i >= 0; i--) {
    digits[i] = Number(value % 29n);
    value /= 29n;
  }
  assert.equal(value, 0n);
  return digits;
});
assert.deepEqual(base29Packets(generated, false), {
  packets: sampleWords.length, fit: sampleWords.length, overflow: 0,
});

const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");
console.log(JSON.stringify({
  source2016Sha256: sha(signed2016),
  source2017Sha256: sha(signed2017),
  canonicalSectionGroups: canonicalGroups,
  conditionalSectionGroups: summary,
  spellingControls: variants,
  p29Selector: {sectionSymbols: 59, nthPrime: target, uniquePage: matches[0],
    exactLength: 277, uniqueMaximum: true},
  nestedControls,
  warning2017,
  tea64bitDirectBase29BlockGate: {bookBig, bookLittle, pageResetBig: reset,
    syntheticPositiveBlocks: sampleWords.length},
  interpretation: "retired p29 prime selector: canonical middle section length is 61; direct fixed-width GP29/TEA transport excluded",
}, null, 2));
