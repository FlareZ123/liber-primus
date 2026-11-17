"use strict";
/**
 * One-file, read-only source test of the two original LP2 red words
 * whose GP29 BASE29 values share the 1,433-rune chapter-length factor.
 * Run: node sims/lp2_redword1433_chapter_alignment_sft.cjs
 *
 * The shuffled-red-rune null preserves all 225 original red rune identities
 * and all 53 original red printed-word lengths. It tests nine original chapter
 * rune counts at once. These are descriptive controls, not evidence of an
 * author-supplied cipher or a corrected multiple-hypothesis p-value.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..", "resources", "liber-primus");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "lp2-corpus.json"), "utf8"));
const ink = JSON.parse(fs.readFileSync(path.join(root, "lp2-ink-annotations.json"), "utf8"));
const transcription = fs.readFileSync(path.join(root, "lp2-transcription.txt"), "utf8");
const chapterLengths = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const redOffsets = new Map(ink.pages.map((page) => {
  const offsets = new Set();
  for (const span of page.red_spans || []) {
    for (let i = 0; i < span.length; i++) offsets.add(span.start + i);
  }
  return [page.page, offsets];
}));

/** @typedef {{page:number, start:number, digits:number[], red:boolean}} RuneWord */
/** @type {RuneWord[]} */
const words = [];
const sections = transcription.split("%");
assert.equal(sections.length, 57, "Original transcription omits rune-free physical p50");
for (let section = 0; section < sections.length; section++) {
  const page = section >= 50 ? section + 1 : section;
  let runeOffset = 0;
  let start = -1;
  let digits = [];
  const flush = () => {
    if (!digits.length) return;
    const red = digits.every((_, i) => redOffsets.get(page)?.has(start + i));
    words.push({page, start, digits, red});
    digits = [];
    start = -1;
  };
  for (const rune of sections[section]) {
    const index = runeIndex.get(rune);
    if (index !== undefined) {
      if (start < 0) start = runeOffset;
      digits.push(index);
      runeOffset++;
    } else if (rune !== "/" && !/\s/.test(rune)) {
      flush();
    }
  }
  flush();
  assert.equal(runeOffset, corpus.pages[page].indices.length,
    `p${page} source transcription/rune alignment`);
}
const reds = words.filter((word) => word.red);
const totalRedRunes = reds.reduce((sum, word) => sum + word.digits.length, 0);
assert.equal(words.length, 2973, "Page-local printed tokens include 32 page-carry splits");
assert.equal(reds.length, 53);
assert.equal(totalRedRunes, 225);

function numeral(digits) {
  return digits.reduce((n, digit) => 29n * n + BigInt(digit), 0n);
}
function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}
function hits(digits, lengths) {
  const found = new Array(chapterLengths.length).fill(0);
  let offset = 0;
  for (const wordLength of lengths) {
    const residues = chapterLengths.map(() => 0);
    let positive = false;
    for (let i = 0; i < wordLength; i++) {
      const v = digits[offset++];
      if (v) positive = true;
      for (let j = 0; j < chapterLengths.length; j++) {
        residues[j] = (residues[j] * 29 + v) % chapterLengths[j];
      }
    }
    for (let j = 0; j < chapterLengths.length; j++) {
      if (positive && residues[j] === 0) found[j]++;
    }
  }
  assert.equal(offset, digits.length);
  return found;
}

const p0 = reds.find((word) => word.page === 0 && word.start === 8);
const p53 = reds.find((word) => word.page === 53 && word.start === 137);
assert.ok(p0 && p53);
assert.deepEqual(p0.digits, [15, 26, 18, 21, 5]);
assert.deepEqual(p53.digits, [9, 8, 6, 11]);
const first = numeral(p0.digits);
const second = numeral(p53.digits);
assert.equal(first, 11259081n);
assert.equal(second, 226414n);
assert.equal(gcd(first, second), 1433n);
assert.equal(first / 1433n, 7857n);
assert.equal(second / 1433n, 158n);
console.log("Original p0 red printed word at rune8:  SYENGC =", String(first));
console.log("Original p53 red printed word at rune137: NHGJ =", String(second));
console.log("Exact gcd =", String(gcd(first, second)), "runes in physical pp27-32 chapter");

const lengths = reds.map((word) => word.digits.length);
const flat = reds.flatMap((word) => word.digits);
const actual = hits(flat, lengths);
assert.deepEqual(actual, [0, 0, 0, 0, 0, 2, 0, 0, 0]);
const allHits1433 = words.filter((word) => numeral(word.digits) > 0n &&
  numeral(word.digits) % 1433n === 0n);
assert.equal(allHits1433.length, 5);
assert.equal(allHits1433.filter((word) => word.red).length, 2);
console.log("Original all-red word hits by nine chapter lengths:", actual);
console.log("All source page-local word hits at factor1433:",
  allHits1433.map((word) => `p${word.page}:${word.start}/len${word.digits.length}/red${word.red}`).join(" "));

let state = 0x33012014;
/** @returns {number} Reproducible uint32 xorshift output. */
function random32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
const shuffled = flat.slice();
const draws = 100000;
let sameFactor = 0;
let anyDuplicate = 0;
const counts = new Array(chapterLengths.length).fill(0);
for (let trial = 0; trial < draws; trial++) {
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = random32() % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const result = hits(shuffled, lengths);
  if (result[5] >= 2) sameFactor++;
  if (result.some((count) => count >= 2)) anyDuplicate++;
  for (let j = 0; j < counts.length; j++) counts[j] += result[j];
  if ((trial + 1) % 25000 === 0) {
    console.log("Shuffled red rune controls:", trial + 1, "/", draws);
  }
}
assert.equal(sameFactor, 330);
assert.equal(anyDuplicate, 3558);
console.log("Exact 100000-shuffle ≥2 hits for source factor1433:", sameFactor,
  "add-one frequency:", (sameFactor + 1) / (draws + 1));
console.log("Nine original chapter lengths scanned, any repeated factor:", anyDuplicate,
  "add-one family frequency:", (anyDuplicate + 1) / (draws + 1));
console.log("Null mean matches by chapter size:",
  chapterLengths.map((size, j) => [size, counts[j] / draws]));
/**
 * Independent exploratory selector: the *largest positive pairwise GCD* among
 * all red words. This selects a pair without first choosing a chapter length.
 * The book does not explicitly tell a solver to use this operation.
 */
function maxPositiveGcd(values) {
  let best = 1n;
  for (let i = 0; i < values.length; i++) {
    if (values[i] === 0n) continue;
    for (let j = i + 1; j < values.length; j++) {
      if (values[j] === 0n) continue;
      const common = gcd(values[i], values[j]);
      if (common > best) best = common;
    }
  }
  return best;
}
const actualMax = maxPositiveGcd(reds.map((word) => numeral(word.digits)));
assert.equal(actualMax, 1433n);
console.log("Largest positive GCD among all 1378 unordered red-word pairs:", String(actualMax));
state = 0x33012014;
const pairwise = flat.slice();
const maxTrials = 20000;
const chapterFactorSet = new Set(chapterLengths.map((x) => BigInt(x)));
let maxAtLeast1433 = 0;
let maxEqualsChapterSize = 0;
let maxExactly1433 = 0;
for (let trial = 0; trial < maxTrials; trial++) {
  for (let i = pairwise.length - 1; i > 0; i--) {
    const j = random32() % (i + 1);
    [pairwise[i], pairwise[j]] = [pairwise[j], pairwise[i]];
  }
  const values = [];
  let at = 0;
  for (const len of lengths) {
    let n = 0n;
    for (let i = 0; i < len; i++) n = 29n * n + BigInt(pairwise[at++]);
    values.push(n);
  }
  const winner = maxPositiveGcd(values);
  if (winner >= actualMax) maxAtLeast1433++;
  if (chapterFactorSet.has(winner)) maxEqualsChapterSize++;
  if (winner === 1433n) maxExactly1433++;
}
assert.equal(maxAtLeast1433, 5110);
assert.equal(maxEqualsChapterSize, 51);
assert.equal(maxExactly1433, 5);
console.log("20000 original-red-shuffle max-GCD controls: >=1433", maxAtLeast1433,
  "; max equals any nine chapter sizes", maxEqualsChapterSize,
  "; max exactly1433", maxExactly1433);
console.log("Maximal-GCD equals original chapter length, add-one frequency:",
  (maxEqualsChapterSize + 1) / (maxTrials + 1));
console.log("PASS: observed coincidence is a provisional lead; no plaintext or key is recovered");
